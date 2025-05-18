import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { mkdir } from 'fs/promises';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});


/**
 * @swagger
 * /api/analyze-plant:
 *   post:
 *     tags:
 *       - Plant Disease
 *     summary: Analyze plant disease from image
 *     description: Upload an image of a plant to detect diseases and get treatment recommendations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The plant image to analyze
 *               language:
 *                 type: string
 *                 description: The language for the response
 *                 example: "english"
 *     responses:
 *       200:
 *         description: Successful analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the detected disease
 *                   example: "Leaf Spot Disease"
 *                 cure:
 *                   type: string
 *                   description: Recommendations for treating the disease
 *                   example: "Apply fungicide containing chlorothalonil. Remove and destroy infected leaves. Ensure proper air circulation around plants."
 *                 prevention:
 *                   type: string
 *                   description: Tips to prevent the disease in the future
 *                   example: "Avoid overhead watering. Plant resistant varieties. Rotate crops regularly. Maintain proper plant spacing."
 *       400:
 *         description: No image file provided or invalid request
 *       500:
 *         description: Failed to process the image or internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const tempDir = path.join(process.cwd(), 'tmp');
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const language = formData.get('language') as string || 'english';

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imagePath = path.join(tempDir, `upload-${Date.now()}.jpg`);
    await fs.promises.writeFile(imagePath, buffer);

    const imageBase64 = buffer.toString('base64');
    const dataUrl = `data:${imageFile.type};base64,${imageBase64}`;
    
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    console.log('Starting 20-second delay before processing...');
    await delay(20000); 
    console.log('Delay complete, proceeding with analysis...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `You are a plant disease detection specialist. Analyze the provided plant image and identify any diseases or issues present. Provide your response in ${language} language.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `This is an image of a plant that may have a disease. Please analyze it and provide the following details in JSON format: 1) Disease name, 2) Cure recommendations, 3) Prevention tips. Please format your response as a valid JSON object with fields "name", "cure", and "prevention". Provide your entire response in ${language} language.`,
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
      response_format: { type: 'json_object' }
    });

    
    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      console.error('Error deleting temporary file:', error);
    }

    
    const result = response.choices[0].message.content;
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to analyze the image' },
        { status: 500 }
      );
    }

    
    const analysisResult = JSON.parse(result);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process the image' },
      { status: 500 }
    );
  }
}


export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};