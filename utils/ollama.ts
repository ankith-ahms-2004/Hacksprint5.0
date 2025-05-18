/**
 * Utility functions for interacting with the Ollama API
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

/**
 * Generate text using the Ollama API
 * @param model The model to use (e.g., 'llama3.2')
 * @param prompt The prompt to send to the model
 * @param systemPrompt The optional system prompt to guide the model's behavior
 * @returns The generated text
 */
export async function generateText(
  model: string = 'llama3.2',
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const requestBody: any = {
      model: model,
      prompt: prompt,
      stream: false,
    };

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    
    let finalResponse = data.response;
    
    
    const thinkingPatterns = [
      /^(?:Thinking|Let me think|I'm thinking):[\s\S]*?(?=\n\n|$)/i,
      /^<thinking>[\s\S]*?<\/thinking>/i,
      /^.*?thinking.*?:\s*[\s\S]*?(?=\n\n|$)/i
    ];
    
    for (const pattern of thinkingPatterns) {
      if (pattern.test(finalResponse)) {
        const matches = finalResponse.split(pattern);
        if (matches.length > 1) {
          finalResponse = matches[1].trim();
        }
      }
    }
    
    return finalResponse;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error;
  }
}

/**
 * Generate text and parse it as JSON
 * @param model The model to use (e.g., 'llama3.2')
 * @param prompt The prompt to send to the model
 * @param systemPrompt The optional system prompt to guide the model's behavior
 * @returns The parsed JSON object
 */
export async function generateJSON<T>(
  model: string = 'llama3.2',
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  try {
    const content = await generateText(model, prompt, systemPrompt);
    
    let cleanedContent = content;
    
    const codeBlockRegex = /```(?:json)?([\s\S]*?)```/;
    const codeBlockMatch = codeBlockRegex.exec(cleanedContent);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleanedContent = codeBlockMatch[1].trim();
    }
    
    try {
      return JSON.parse(cleanedContent) as T;
    } catch (firstParseError) {
      console.error('Error parsing cleaned Ollama response as JSON:', firstParseError);
      
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as T;
        } catch (e) {
          console.error('Error parsing extracted JSON:', e);
        }
      }
      
      try {
        const fixedContent = cleanedContent.replace(/'/g, '"');
        return JSON.parse(fixedContent) as T;
      } catch (lastError) {
        console.error('All JSON parsing attempts failed');
      }
      
      throw new Error('Failed to parse response as JSON');
    }
  } catch (error) {
    console.error('Error generating JSON with Ollama:', error);
    throw error;
  }
}

/**
 * Get a list of available models from the Ollama API
 * @returns Array of model names
 */
export async function listModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  } catch (error) {
    console.error('Error listing Ollama models:', error);
    throw error;
  }
} 