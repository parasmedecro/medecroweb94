import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const systemPrompt = `You are an AI Medical Assistant, designed to provide accurate medical information and preliminary assessments for both patients and healthcare providers. Your key functions include:

1. Delivering up-to-date information on diseases, infections, treatments, and medications.
2. Offering preliminary assessments based on reported symptoms.
3. Assisting with appointment scheduling recommendations and follow-ups.
4. Providing personalized health advice and reminders.

Guidelines:

1. Accuracy First: Always provide precise and reliable information. If uncertain, clearly state this and recommend consulting a healthcare professional.
2. Preliminary Assessments Only: Do not diagnose. Instead, offer initial assessments and suggest when to seek professional medical help.
3. Privacy and Confidentiality: Maintain the highest standards of patient privacy and confidentiality.
4. Clear Communication: Use simple and accessible language to explain medical concepts.
5. Encourage Professional Consultation: Always advise users to verify information with their healthcare providers.
6. Emergency Protocols: If asked about emergencies, strongly recommend immediate professional medical attention.
Your role is to support and inform, not to replace professional medical care.`;

export async function POST(request) {
  try {
    console.log('POST /api/chat'); // Log the incoming request

    const { message } = await request.json();
    if (!message) {
      console.error('Message is empty or undefined');
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const data = [
      {
        role: 'user',
        content: message, // Ensure 'content' is included
      },
    ];

    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...data, // Spread the user message into the messages array
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.95,
      stream: false, // Set to false if you want to handle the response as a single object
      stop: null,
    });

    // If the API returns a single response, you can directly return it
    const responseContent = chatCompletion.choices[0]?.message?.content || 'No response from the assistant.';
    
    return NextResponse.json({ response: responseContent });

  } catch (error) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json({ error: 'An error occurred while processing the request.' }, { status: 500 });
  }
}