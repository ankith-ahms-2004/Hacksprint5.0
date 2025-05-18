import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { mkdir } from 'fs/promises';
import { generateJSON } from '@/utils/ollama';

const execAsync = promisify(exec);

/**
 * @swagger
 * /api/model_prediction:
 *   post:
 *     tags:
 *       - Machine Learning
 *     summary: Get predictions from CNN model
 *     description: Upload an image to get predictions from a CNN model
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
 *                 description: The image to analyze
 *     responses:
 *       200:
 *         description: Successful prediction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 disease:
 *                   type: string
 *                   description: The name of the detected disease
 *                 confidence:
 *                   type: number
 *                   description: Confidence score of the prediction
 *                 class_index:
 *                   type: integer
 *                   description: Index of the predicted class
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
    
    const pythonScript = path.join(process.cwd(), 'scripts', 'predict.py');
    
    const { stdout, stderr } = await execAsync(`python ${pythonScript} "${imageBase64}"`);
    
    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      console.error('Error deleting temporary file:', error);
    }
    
    if (stderr) {
      console.error('Error from Python script:', stderr);
      return NextResponse.json(
        { error: 'Error running prediction script', details: stderr },
        { status: 500 }
      );
    }
    
    const result = JSON.parse(stdout.trim());
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    console.log('Getting treatment information from LLM for:', result.disease);
    
    try {
      const prompt = `I need detailed information about a plant disease called "${result.disease}". 
      Please provide:  
      1. How to treat or cure this disease  
      2. What precautions to take to prevent this disease in the future  
      
      Return the information in JSON format with fields "cure" and "prevention".`;
      
      const systemPrompt = 'You are a plant disease expert. Provide accurate and detailed information about plant diseases and their treatment. Always respond in the requested JSON format with fields for cure and prevention.';
      
      const treatmentInfo = await generateJSON<{ cure: string; prevention: string }>('llama3.2', prompt, systemPrompt);
      
      const finalResult = {
        ...result,
        cure: treatmentInfo.cure,
        prevention: treatmentInfo.prevention
      };
      
      return NextResponse.json(finalResult);
    } catch (llmError) {
      console.error('Error getting treatment information from LLM:', llmError);
      
      return NextResponse.json({
        ...result,
        cure: 'Failed to get treatment information',
        prevention: 'Failed to get prevention information',
        llmError: String(llmError)
      });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process the image', details: String(error) },
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
