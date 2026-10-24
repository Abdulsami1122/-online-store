import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

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
        (pTitle.includes('shirt') && (queryLower.includes('shirt') || queryLower.includes('tshirt') || queryLower.includes('t-shirt') || queryLower.includes('kurta') || queryLower.includes('kapray'))) ||
        (pTitle.includes('shoe') && (queryLower.includes('shoe') || queryLower.includes('sneaker') || queryLower.includes('jootay') || queryLower.includes('jogger'))) ||
        (pTitle.includes('handbag') && (queryLower.includes('handbag') || queryLower.includes('bag') || queryLower.includes('purse') || queryLower.includes('wallet'))) ||
        (pTitle.includes('watch') && (queryLower.includes('watch') || queryLower.includes('ghari') || queryLower.includes('gharee') || queryLower.includes('analog') || queryLower.includes('quartz'))) ||
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

    // 4. Call Gemini AI with strict store grounding using GEMINI_API_KEY & GEMINI_MODEL from .env
    let aiReply = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
        
        const catalogContext = products
          .map((p) => `- ${p.title} (${p.category}): Exact Price: Rs. ${p.price.toLocaleString()} | Stock: ${p.stock} units | Description: ${p.description}`)
          .join('\n');

        let orderContext = 'No specific order searched.';
        if (matchedOrder) {
          orderContext = `Customer's Searched Order: Order #${matchedOrder.orderNumber} | Status: "${matchedOrder.status}" | Customer Name: ${matchedOrder.customerName} | Total Amount: Rs. ${matchedOrder.totalPrice.toLocaleString()} (Cash on Delivery) | Shipping Address: ${matchedOrder.shippingAddress}`;
        }

        const systemPrompt = `You are the official, intelligent AI Order Assistant for "My Store", an e-commerce boutique in Pakistan.

LIVE STORE INVENTORY:
${catalogContext}

${orderContext}

STORE POLICIES (STRICT FACTS):
- Delivery Time: 3 to 5 working days all across Pakistan (Karachi, Lahore, Islamabad, Rawalpindi, and all cities) via Leopard Courier & TCS.
- Delivery Charges: Standard flat Rs. 200 nationwide.
- Payment Method: 100% Cash on Delivery (COD) available everywhere. Zero advance payment required. Customers pay only when the parcel arrives at their doorstep.
- Returns & Exchanges: 7-day hassle-free return and size exchange guarantee.
- How to Order: Customers can click "Add to Bag" or "Buy Now" on the website landing page, or contact our WhatsApp (+92 300 1234567).

STRICT ANTI-HALLUCINATION RULES:
1. ONLY provide 100% factual information based strictly on the Store Inventory and Policies above.
2. NEVER guess or invent wrong prices, wrong discounts, or imaginary products.
3. If customer asks about an item in the catalog (e.g. T-Shirt, Shoes, Handbag, Watch), state its exact price in Rs. and mention that its photo card is attached below.
4. Reply in natural, friendly Roman Urdu (or English if the customer asked in English). Keep it concise (1 to 3 sentences).

Customer Question: "${query}"`;

        const model = genAI.getGenerativeModel({ model: primaryModel });
        
        // Race with a 7.5s timeout so high API spikes don't stall the user
        const result = await Promise.race([
          model.generateContent(systemPrompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API timeout')), 7500)),
        ]);
        
        aiReply = result?.response?.text();
      } catch (geminiErr) {
        console.warn('Gemini API note (falling back to database grounding):', geminiErr.message);
      }
    }

    // 5. High-precision built-in Conversational NLP Engine (if Gemini is not configured or offline)
    if (!aiReply) {
      if (matchedOrder) {
        aiReply = `Aapka Order #${matchedOrder.orderNumber} is waqt "${matchedOrder.status}" status par hai. Total amount Rs. ${matchedOrder.totalPrice.toLocaleString()} (Cash on Delivery) hai. Customer: ${matchedOrder.customerName}.`;
      } else if (
        queryLower.includes('track') ||
        queryLower.includes('kahan hai') ||
        queryLower.includes('mera order') ||
        queryLower.includes('order status')
      ) {
        aiReply =
          'Aap apna 5-digit Order Number (jaise #10024) yahan likhein ya hamari landing page ke "Track Order" section mein enter karke live tracking check kar sakte hain!';
      } else if (
        queryLower.includes('delivery kitne din') ||
        (queryLower.includes('delivery') && (queryLower.includes('din') || queryLower.includes('time') || queryLower.includes('days') || queryLower.includes('kab') || queryLower.includes('waqt')))
      ) {
        aiReply =
          'Delivery usually 3-5 working days mein hoti hai all over Pakistan (Karachi, Lahore, Islamabad aur tamam shehron mein). Leopard Courier / TCS ke zariye deliver hota hai.';
      } else if (
        queryLower.includes('delivery charge') ||
        queryLower.includes('shipping') ||
        queryLower.includes('shipping fee') ||
        (queryLower.includes('delivery') && (queryLower.includes('charges') || queryLower.includes('free') || queryLower.includes('cost') || queryLower.includes('kitne')))
      ) {
        aiReply =
          'Standard delivery charges sirf Rs. 200 hain pure Pakistan mein. Cash on Delivery par koi extra hidden charges nahi hain!';
      } else if (
        queryLower.includes('cod') ||
        queryLower.includes('cash on delivery') ||
        queryLower.includes('advance') ||
        queryLower.includes('payment') ||
        queryLower.includes('paise kaise')
      ) {
        aiReply =
          'Ji bilkul! Hamara store 100% Cash on Delivery (COD) support karta hai. Aapko koi advance paise nahi dene, jab parcel aapke darwazay par pohnch jaye tabhi cash payment karni hai.';
      } else if (
        queryLower.includes('return') ||
        queryLower.includes('exchange') ||
        queryLower.includes('wapsi') ||
        queryLower.includes('kharab') ||
        queryLower.includes('change')
      ) {
        aiReply =
          'Hamari 7-day easy return aur exchange policy hai. Agar product pasand na aye ya size issue ho toh 7 din ke andar asani se exchange ya return ho jata hai.';
      } else if (
        queryLower.includes('order kaise') ||
        queryLower.includes('kaise buy') ||
        queryLower.includes('how to order') ||
        queryLower.includes('order karna')
      ) {
        aiReply =
          'Order karna bohat asan hai! Kisi bhi product par "Add to Bag" ya "Buy Now" dabayein, apna Naam, WhatsApp number aur Address likhein, aur "Place Order" par click karein. 1 minute mein order ho jata hai!';
      } else if (matchedProduct) {
        aiReply = `Yeh ${matchedProduct.title} ki price Rs. ${matchedProduct.price.toLocaleString()} hai. Stock mein ${matchedProduct.stock} units available hain. Neeche card se aap direct Bag mein add kar sakte hain!`;
      } else if (
        queryLower.includes('salam') ||
        queryLower.includes('slaam') ||
        queryLower.includes('assalam') ||
        queryLower.includes('hello') ||
        queryLower.includes('hi') ||
        queryLower.includes('hey')
      ) {
        aiReply =
          'Walaikum Assalam! Main aapka AI Order Assistant hoon. Aap mujhse products ki price, photos, delivery time, Cash on Delivery ya order tracking ke baray mein kuch bhi pooch sakte hain.';
      } else if (queryLower.includes('discount') || queryLower.includes('offer') || queryLower.includes('sale')) {
        aiReply =
          'Hamare pas already discounted wholesale prices hain! T-Shirt Rs. 1,200, Sneakers Rs. 2,000, Leather Handbag Rs. 2,500 aur Quartz Watch Rs. 3,200 mein available hai.';
      } else {
        aiReply =
          'Main aapki madad ke liye hazir hoon! Aap mujhse T-Shirt, Shoes, Handbag, Watch ki price, photos, delivery time (3-5 days), ya Cash on Delivery ke baray mein pooch sakte hain.';
      }
    }

    return res.json({
      reply: aiReply.trim(),
      product: matchedProduct, // Sends photo and details to customer in chat!
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ reply: 'Sorry, I encountered an error processing your query.' });
  }
};
