import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const names = [];

for await (const modelInfo of await ai.models.list()) {
  const name = modelInfo.name.replace('models/', '');
  if (/flash/.test(name) && !/image|tts|live|audio|embed/.test(name)) {
    names.push(name);
  }
}

for (const model of names) {
  const start = Date.now();
  try {
    await ai.models.generateContent({ model, contents: 'Say hi' });
    console.log('OK  ', model, `${Date.now() - start}ms`);
  } catch (error) {
    console.log('FAIL', model, error.status);
  }
}
