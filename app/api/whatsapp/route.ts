import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { OpenAI } from 'openai';
// import * as formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Helper function to download media from Twilio
async function downloadTwilioMedia(mediaUrl: string, authToken: string, accountSid: string): Promise<Buffer> {
  const base64Auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  
  const response = await fetch(mediaUrl, {
    headers: {
      'Authorization': `Basic ${base64Auth}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Process plant image with GPT-4 Vision
async function analyzePlantImage(imageBuffer: Buffer): Promise<any> {
  const imageBase64 = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${imageBase64}`;

  // Call GPT-4 Vision API
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'This is an image of a plant that may have a disease. Please analyze it and provide detailed information about: 1) Disease identification, 2) Cure recommendations, 3) Prevention measures, 4) Additional agricultural advice. If you cannot identify a disease, explain why and provide general plant health tips.',
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
              detail: 'high'
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract WhatsApp message data
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0');
    
    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'tmp');
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
    
    // Create TwiML response
    let responseMessage = '';
    
    // Check if we received media
    if (numMedia > 0) {
      // Get the media URL from the message
      const mediaUrl = formData.get('MediaUrl0') as string;
      const contentType = formData.get('MediaContentType0') as string;
      
      // Ensure the media is an image
      if (contentType.startsWith('image/')) {
        try {
          // Download the image
          const imageBuffer = await downloadTwilioMedia(
            mediaUrl,
            process.env.TWILIO_AUTH_TOKEN!,
            process.env.TWILIO_ACCOUNT_SID!
          );
          
          // Save image temporarily
          const imagePath = path.join(tempDir, `whatsapp-${Date.now()}.jpg`);
          await fs.promises.writeFile(imagePath, imageBuffer);
          
          // Analyze the plant image
          const analysisResult = await analyzePlantImage(imageBuffer);
          
          // Clean up temporary file
          try {
            await fs.promises.unlink(imagePath);
          } catch (error) {
            console.error('Error deleting temporary file:', error);
          }
          
          // Set response message with analysis results
          responseMessage = `🌱 Plant Analysis Results:\n\n${analysisResult}`;
        } catch (error) {
          console.error('Error processing image:', error);
          responseMessage = "Sorry, we couldn't process your image. Please try sending it again or contact support.";
        }
      } else {
        responseMessage = "Please send an image file (JPEG or PNG) of your plant for analysis.";
      }
    } else {
      // Handle text messages
      if (body.toLowerCase().includes('help')) {
        responseMessage = "Welcome to PlantDoctor Bot! 🌿\n\nTo analyze a plant, simply send a clear image of the plant showing any signs of disease or issues.\n\nYou'll receive detailed information about:\n- Disease identification\n- Treatment recommendations\n- Prevention tips\n\nSend 'help' anytime to see this message again.";
      } else {
        responseMessage = "Please send a photo of your plant for analysis. If you need help, simply reply with 'help'.";
      }
    }
    
    // Format TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>${responseMessage}</Message>
    </Response>`;
    
    return new NextResponse(twimlResponse, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    
    // Return error response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>Sorry, something went wrong with our service. Please try again later.</Message>
    </Response>`;
    
    return new NextResponse(twimlResponse, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

// Config to handle larger payloads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
}; 