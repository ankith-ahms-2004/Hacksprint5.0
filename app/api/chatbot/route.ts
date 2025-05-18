import { NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/utils/auth';
import { TokenPayload } from '@/utils/auth';
import { generateText } from '@/utils/ollama';

export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    const { message } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }
    
    let processedMessage = message;
    const originalLength = message.length;
    
    console.log('Original message:', message);
    
    const thinkPattern = /<think>[\s\S]*?<\/think>/g;
    processedMessage = processedMessage.replace(thinkPattern, '');
    
    console.log('Processed message:', processedMessage);
    console.log('Characters removed:', originalLength - processedMessage.length);
    
    processedMessage = processedMessage.trim();
    
    if (!processedMessage) {
      return NextResponse.json(
        { error: "No valid content found in message after filtering" },
        { status: 400 }
      );
    }

    const systemPrompt = "You are an AI assistant specialized in agriculture, farming, and related topics. You provide helpful, accurate, and practical advice to farmers. Your responses should be informative, respectful, and tailored to the agricultural context. If you're unsure about something, be honest about limitations rather than making up information.";

    const responseText = await generateText('llama3.2', processedMessage, systemPrompt);
    
    if (!responseText) {
      return NextResponse.json(
        { error: "Failed to generate a response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
} 