import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    console.log(`Connecting to Gemini API with key: ${process.env.GEMINI_API_KEY.slice(0, 10)}... and model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const systemPrompt = `You are the official AI Assistant for "My Store", an e-commerce boutique in Pakistan.

Current Store Inventory:
- T-Shirt: Rs. 1,200 | Stock: 10 units | Premium combed cotton regular fit classic black t-shirt.
- Shoes: Rs. 2,000 | Stock: 5 units | Lightweight urban breathable sneakers with cushioned rubber sole.
- Handbag: Rs. 2,500 | Stock: 8 units | Elegant tan brown structured leather handbag.
- Watch: Rs. 3,200 | Stock: 6 units | Minimalist luxury quartz analog wristwatch.

Store Policies:
- Delivery: 3-5 working days all across Pakistan via Leopard Courier and TCS.
- Delivery Fee: Flat Rs. 200 all over Pakistan.
- Payment: 100% Cash on Delivery (COD) nationwide. Zero advance payment.
- Returns: 7-day easy return and exchange policy.

Customer question: "is shirt ki price kya hai?"
Answer concisely in friendly Roman Urdu based strictly on the above inventory:`;

    const result = await model.generateContent(systemPrompt);
    console.log('\n--- GEMINI AI SUCCESS RESPONSE ---');
    console.log(result.response.text());
    console.log('----------------------------------\n');
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

run();
