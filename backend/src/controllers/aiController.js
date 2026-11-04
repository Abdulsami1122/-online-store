import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// ── Language detection ───────────────────────────────────────────────────────
// Priority: Urdu script > word-count scoring (Roman Urdu vs English)

/** Common Urdu-only words that never appear in ordinary English */
const ROMAN_URDU_WORDS = new Set([
  'aap', 'apka', 'apki', 'apke', 'batao', 'bataein', 'bataiye',
  'chahiye', 'dikhao', 'dikhayein', 'hoga', 'hogi', 'honge',
  'sakta', 'sakte', 'sakti', 'karna', 'karein', 'karun',
  'mera', 'meri', 'mere', 'mujhe', 'humein',
  'hai', 'hain', 'hoon', 'hun',
  'yeh', 'ye', 'woh', 'wo',
  'nahi', 'nhi', 'bohat', 'bhot',
  'shukriya', 'shukria',
  'paise', 'pesay', 'kapray', 'jootay', 'ghari',
  'darwazay', 'shehron', 'wapsi',
  'kya', 'kyun', 'kyu', 'kaise', 'kaisay',
  'kahan', 'kab', 'kitna', 'kitne', 'kitni',
]);

/**
 * Detect whether the message is Urdu script, Roman Urdu, or English.
 * Returns 'urdu' | 'roman-urdu' | 'english'
 */
const getReplyLanguage = (message) => {
  // 1. Urdu / Arabic script characters
  if (/[\u0600-\u06ff]/u.test(message)) return 'urdu';

  // 2. Word-frequency scoring: count Roman Urdu words vs total words
  const words = message
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'english';

  const urduCount = words.filter((w) => ROMAN_URDU_WORDS.has(w)).length;
  const urduRatio = urduCount / words.length;

  // If ≥1 Urdu word AND it makes up ≥20% of words → Roman Urdu
  if (urduCount >= 1 && urduRatio >= 0.2) return 'roman-urdu';

  return 'english';
};

/** Check whether the AI reply actually came back in the expected language */
const isReplyInLanguage = (reply, language) => {
  const hasUrduScript = /[\u0600-\u06ff]/u.test(reply);
  const words = reply.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  const urduCount = words.filter((w) => ROMAN_URDU_WORDS.has(w)).length;
  const urduRatio = urduCount / Math.max(words.length, 1);
  const isRomanUrdu = !hasUrduScript && urduCount >= 1 && urduRatio >= 0.15;

  if (language === 'urdu') return hasUrduScript;
  if (language === 'roman-urdu') return isRomanUrdu;
  // English: no Urdu script and not predominantly Roman Urdu
  return !hasUrduScript && !isRomanUrdu;
};

/** Return the right localised string based on detected language */
const localizedReply = (language, english, romanUrdu, urdu) => {
  if (language === 'urdu') return urdu;
  if (language === 'roman-urdu') return romanUrdu;
  return english;
};

// ── Controller ───────────────────────────────────────────────────────────────

// @desc    Process customer question with Gemini AI Assistant using store catalog
// @route   POST /api/ai/chat
// @access  Public
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, sellerId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: 'Please send a valid message.' });
    }

    const query = message.trim();
    const queryLower = query.toLowerCase();
    const replyLanguage = getReplyLanguage(query);

    // 1. Fetch active products from MongoDB
    const filter = sellerId ? { seller: sellerId } : {};
    const products = await Product.find(filter).limit(30);

    // 2. Identify if query matches any specific product to send its photo and card
    let matchedProduct = null;
    for (const prod of products) {
      const pTitle = prod.title.toLowerCase();
      const pCategory = (prod.category || '').toLowerCase();

      if (
        queryLower.includes(pTitle) ||
        (pTitle.includes('shirt') && (
          queryLower.includes('shirt') || queryLower.includes('tshirt') ||
          queryLower.includes('t-shirt') || queryLower.includes('kurta') ||
          queryLower.includes('kapray') || query.includes('شرٹ') || query.includes('قمیض')
        )) ||
        (pTitle.includes('shoe') && (
          queryLower.includes('shoe') || queryLower.includes('sneaker') ||
          queryLower.includes('jootay') || queryLower.includes('jogger') ||
          query.includes('جوتے') || query.includes('جوتا')
        )) ||
        (pTitle.includes('handbag') && (
          queryLower.includes('handbag') || queryLower.includes('bag') ||
          queryLower.includes('purse') || queryLower.includes('wallet') ||
          query.includes('بیگ')
        )) ||
        (pTitle.includes('watch') && (
          queryLower.includes('watch') || queryLower.includes('ghari') ||
          queryLower.includes('gharee') || queryLower.includes('analog') ||
          queryLower.includes('quartz') || query.includes('گھڑی')
        )) ||
        (pCategory && queryLower.includes(pCategory))
      ) {
        matchedProduct = {
          _id: prod._id,
          title: prod.title,
          price: prod.price,
          stock: prod.stock,
          image: prod.image,
          category: prod.category,
          description: prod.description,
        };
        break;
      }
    }

    // 3. Check for order tracking in chat (e.g. customer says "track 10024" or "#10024")
    const orderMatch = query.match(/(?:#|\b)(\d{5})\b/);
    let matchedOrder = null;
    if (orderMatch) {
      try {
        matchedOrder = await Order.findOne({ orderNumber: orderMatch[1] });
      } catch (e) {
        // ignore
      }
    }

    // 4. Call Gemini AI with strict store grounding and language enforcement
    let aiReply = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

        const catalogContext = products
          .map(
            (p) =>
              `- ${p.title} (${p.category}): Exact Price: Rs. ${p.price.toLocaleString()} | Stock: ${p.stock} units | Description: ${p.description}`
          )
          .join('\n');

        let orderContext = 'No specific order searched.';
        if (matchedOrder) {
          orderContext = `Customer's Searched Order: Order #${matchedOrder.orderNumber} | Status: "${matchedOrder.status}" | Customer Name: ${matchedOrder.customerName} | Total Amount: Rs. ${matchedOrder.totalPrice.toLocaleString()} (Cash on Delivery) | Shipping Address: ${matchedOrder.shippingAddress}`;
        }

        // Map detected language to a clear instruction string
        const langInstruction =
          replyLanguage === 'urdu'
            ? 'You MUST reply in Urdu (Nastaliq script). Do NOT use English or Roman Urdu.'
            : replyLanguage === 'roman-urdu'
            ? 'You MUST reply in Roman Urdu (Urdu words written with English/Latin letters). Do NOT use Urdu script or pure English.'
            : 'You MUST reply in English. Do NOT use Urdu script or Roman Urdu words. The customer wrote in English — reply in English only.';

        const systemPrompt = `You are a professional AI Shopping Assistant for "My Store", an e-commerce boutique in Pakistan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE RULE — HIGHEST PRIORITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Detected language of the customer's latest message: **${replyLanguage.toUpperCase()}**

${langInstruction}

This rule overrides everything else. Even if previous messages were in another language, you MUST reply in the detected language above.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE STORE INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${catalogContext}

${orderContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORE POLICIES (STRICT FACTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Delivery Time: 3–5 working days across Pakistan via Leopard Courier & TCS.
- Delivery Charges: Flat Rs. 200 nationwide.
- Payment: 100% Cash on Delivery (COD). Zero advance payment.
- Returns & Exchanges: 7-day hassle-free return and size exchange.
- How to Order: Click "Add to Bag" or "Buy Now" on the website, or WhatsApp +92 300 1234567.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ASSISTANT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Be friendly, professional, and concise (1–3 sentences).
- State exact price and stock from inventory — never invent facts.
- If a product card is attached below, mention it.
- Never switch languages mid-reply.`;

        const model = genAI.getGenerativeModel({
          model: primaryModel,
          systemInstruction: systemPrompt,
        });

        // Race with 7.5s timeout
        const result = await Promise.race([
          model.generateContent(query),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 7500)
          ),
        ]);

        const generatedReply = result?.response?.text()?.trim();
        if (generatedReply && isReplyInLanguage(generatedReply, replyLanguage)) {
          aiReply = generatedReply;
        } else if (generatedReply) {
          // Language mismatch — still use the reply, it's better than the fallback
          console.warn(`Gemini language mismatch (expected ${replyLanguage}). Using reply anyway.`);
          aiReply = generatedReply;
        }
      } catch (geminiErr) {
        console.warn('Gemini API error (falling back to built-in NLP):', geminiErr.message);
      }
    }

    // 5. Built-in NLP fallback (when Gemini is offline or not configured)
    if (!aiReply) {
      if (matchedOrder) {
        aiReply = localizedReply(
          replyLanguage,
          `Your order #${matchedOrder.orderNumber} is currently "${matchedOrder.status}". Total: Rs. ${matchedOrder.totalPrice.toLocaleString()} (Cash on Delivery). Customer: ${matchedOrder.customerName}.`,
          `Aapka Order #${matchedOrder.orderNumber} is waqt "${matchedOrder.status}" status par hai. Total Rs. ${matchedOrder.totalPrice.toLocaleString()} (Cash on Delivery). Customer: ${matchedOrder.customerName}.`,
          `آپ کا آرڈر نمبر ${matchedOrder.orderNumber} اس وقت "${matchedOrder.status}" کی حالت میں ہے۔ کل رقم Rs. ${matchedOrder.totalPrice.toLocaleString()} (کیش آن ڈیلیوری)۔ صارف: ${matchedOrder.customerName}۔`
        );
      } else if (
        queryLower.includes('track') ||
        queryLower.includes('kahan hai') ||
        queryLower.includes('mera order') ||
        queryLower.includes('order status') ||
        query.includes('کہاں ہے') ||
        query.includes('میرا آرڈر') ||
        query.includes('آرڈر کی حالت')
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'Enter your 5-digit order number (e.g. #10024) here or in the "Track Order" section on our home page.',
          'Apna 5-digit Order Number (jaise #10024) yahan ya landing page ke "Track Order" section mein likhein.',
          'اپنے آرڈر کی صورتحال دیکھنے کے لیے 5 ہندسوں کا آرڈر نمبر (مثلاً #10024) یہاں یا ہوم پیج کے "Track Order" سیکشن میں درج کریں۔'
        );
      } else if (
        (queryLower.includes('delivery') &&
          (queryLower.includes('days') || queryLower.includes('time') ||
           queryLower.includes('long') || queryLower.includes('when'))) ||
        queryLower.includes('delivery kitne din') ||
        (queryLower.includes('delivery') &&
          (queryLower.includes('din') || queryLower.includes('kab'))) ||
        (query.includes('ڈیلیوری') &&
          (query.includes('دن') || query.includes('کب') || query.includes('وقت')))
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'Delivery takes 3–5 working days across Pakistan via Leopard Courier or TCS.',
          'Delivery usually 3–5 working days mein hoti hai all over Pakistan. Leopard Courier / TCS ke zariye.',
          'پاکستان بھر میں ڈیلیوری عموماً 3 سے 5 کاروباری دنوں میں Leopard Courier یا TCS کے ذریعے ہوتی ہے۔'
        );
      } else if (
        queryLower.includes('delivery charge') ||
        queryLower.includes('shipping') ||
        (queryLower.includes('delivery') &&
          (queryLower.includes('charges') || queryLower.includes('cost') ||
           queryLower.includes('fee') || queryLower.includes('kitne'))) ||
        (query.includes('ڈیلیوری') &&
          (query.includes('چارجز') || query.includes('فیس') || query.includes('کتنے')))
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'Standard delivery costs Rs. 200 nationwide. No hidden charges for Cash on Delivery.',
          'Standard delivery charges sirf Rs. 200 hain pure Pakistan mein. Cash on Delivery par koi hidden charges nahi.',
          'پاکستان بھر میں ڈیلیوری کے معیاری چارجز Rs. 200 ہیں۔ کیش آن ڈیلیوری پر کوئی اضافی پوشیدہ چارجز نہیں۔'
        );
      } else if (
        queryLower.includes('cod') ||
        queryLower.includes('cash on delivery') ||
        queryLower.includes('advance') ||
        queryLower.includes('payment') ||
        queryLower.includes('paise kaise') ||
        query.includes('کیش آن ڈیلیوری') ||
        query.includes('ادائیگی')
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'Yes! We offer 100% Cash on Delivery (COD). No advance payment — pay when your parcel arrives.',
          'Ji bilkul! 100% Cash on Delivery available hai. Koi advance nahi dena — parcel milne par payment.',
          'جی ہاں! ہم 100% کیش آن ڈیلیوری دیتے ہیں۔ پیشگی ادائیگی کی ضرورت نہیں — پارسل ملنے پر ادا کریں۔'
        );
      } else if (
        queryLower.includes('return') ||
        queryLower.includes('exchange') ||
        queryLower.includes('wapsi') ||
        queryLower.includes('refund') ||
        query.includes('واپسی') ||
        query.includes('تبدیلی')
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'We offer easy 7-day returns and size exchanges. Contact us on WhatsApp to arrange.',
          'Hamari 7-day easy return aur exchange policy hai. WhatsApp par contact karein.',
          'ہم 7 دن کے اندر آسان واپسی اور سائز تبدیلی کی سہولت دیتے ہیں۔ واٹس ایپ پر رابطہ کریں۔'
        );
      } else if (
        queryLower.includes('how to order') ||
        queryLower.includes('how do i order') ||
        queryLower.includes('order kaise') ||
        queryLower.includes('kaise buy') ||
        queryLower.includes('order karna') ||
        query.includes('آرڈر کیسے')
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'Easy! Click "Add to Bag" or "Buy Now", fill in your name, WhatsApp number and address, then click "Place Order".',
          'Bohat asan! "Add to Bag" ya "Buy Now" dabayein, apna naam, WhatsApp number aur address likhein, aur "Place Order" click karein.',
          'آسان ہے! "Add to Bag" یا "Buy Now" دبائیں، نام، واٹس ایپ نمبر اور پتہ درج کریں، پھر "Place Order" پر کلک کریں۔'
        );
      } else if (matchedProduct) {
        aiReply = localizedReply(
          replyLanguage,
          `The ${matchedProduct.title} costs Rs. ${matchedProduct.price.toLocaleString()}. ${matchedProduct.stock} units in stock. Add it to your bag using the card below.`,
          `${matchedProduct.title} ki price Rs. ${matchedProduct.price.toLocaleString()} hai. Stock mein ${matchedProduct.stock} units hain. Neeche card se bag mein add karein!`,
          `${matchedProduct.title} کی قیمت Rs. ${matchedProduct.price.toLocaleString()} ہے۔ اسٹاک میں ${matchedProduct.stock} عدد دستیاب ہیں۔ نیچے کارڈ سے بیگ میں شامل کریں۔`
        );
      } else if (
        queryLower.includes('hello') || queryLower.includes('hi') ||
        queryLower.includes('hey') || queryLower.includes('salam') ||
        queryLower.includes('assalam') || query.includes('سلام')
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'Hello! I am your AI Store Assistant. Ask me about product prices, delivery, Cash on Delivery, or order tracking.',
          'Walaikum Assalam! Main aapka AI Order Assistant hoon. Products ki price, delivery, COD ya order tracking ke baray mein poochein.',
          'وعلیکم السلام! میں آپ کا AI اسٹور اسسٹنٹ ہوں۔ پروڈکٹس کی قیمت، ڈیلیوری، COD یا آرڈر ٹریکنگ کے بارے میں پوچھیں۔'
        );
      } else if (
        queryLower.includes('discount') || queryLower.includes('offer') ||
        queryLower.includes('sale')
      ) {
        aiReply = localizedReply(
          replyLanguage,
          'Current prices: T-Shirt Rs. 1,200 | Sneakers Rs. 2,000 | Leather Handbag Rs. 2,500 | Quartz Watch Rs. 3,200. Check product cards for details.',
          'Current prices: T-Shirt Rs. 1,200 | Sneakers Rs. 2,000 | Leather Handbag Rs. 2,500 | Quartz Watch Rs. 3,200.',
          'موجودہ قیمتیں: ٹی شرٹ Rs. 1,200 | اسنیکرز Rs. 2,000 | لیدر ہینڈ بیگ Rs. 2,500 | کوارٹز گھڑی Rs. 3,200۔'
        );
      } else {
        aiReply = localizedReply(
          replyLanguage,
          'Happy to help! Ask me about product prices, delivery times (3–5 days), Cash on Delivery, or order tracking.',
          'Main hazir hoon! T-Shirt, Shoes, Handbag, Watch ki price, delivery time, ya COD ke baray mein poochein.',
          'میں آپ کی مدد کے لیے حاضر ہوں! پروڈکٹس کی قیمت، ڈیلیوری (3–5 دن)، کیش آن ڈیلیوری یا آرڈر ٹریکنگ کے بارے میں پوچھیں۔'
        );
      }
    }

    return res.json({
      reply: aiReply.trim(),
      product: matchedProduct,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ reply: 'Sorry, I encountered an error processing your query.' });
  }
};
