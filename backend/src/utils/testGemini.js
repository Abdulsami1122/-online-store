import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const result = await model.generateContent('A customer asks: is shirt ki price kya hai? Answer concisely in Roman Urdu.');
    console.log('SUCCESS:\n', result.response.text());
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

run();
