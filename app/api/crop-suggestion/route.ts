import { NextResponse } from 'next/server';
import { cropData, getCurrentSeason, getHarvestSeason, regionClimateData } from '@/utils/cropData';
import prisma from '@/lib/prisma';
import { getTokenFromHeader, verifyToken } from '@/utils/auth';
import { TokenPayload } from '@/utils/auth';
import { generateJSON, generateText } from '@/utils/ollama';

export async function POST(request: Request) {
  try {
    

    const { timeRange, state, plantingSeason, soilType, language = 'english' } = await request.json();
    
   
    const climateData = getStateClimateData(state);
    
    const currentSeason = getCurrentSeason();
    const harvestSeason = getHarvestSeason(timeRange);
    
    const suggestions = await generateCropSuggestions(
      timeRange,
      state,
      plantingSeason,
      soilType,
      currentSeason,
      harvestSeason,
      climateData,
      language
    );
    
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error in crop-suggestion API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getStateClimateData(state: string) {
  const stateLower = state.toLowerCase();
  
  for (const region in regionClimateData) {
    if (stateLower.includes(region) || region.includes(stateLower)) {
      return regionClimateData[region];
    }
  }
  
  const stateToRegionMap: Record<string, string> = {
    "andhra pradesh": "maharashtra",
    "telangana": "maharashtra",
    "tamil nadu": "kerala",
    "madhya pradesh": "maharashtra",
    "rajasthan": "gujarat",
    "haryana": "punjab",
    "uttar pradesh": "punjab",
    "bihar": "west bengal",
    "jharkhand": "west bengal",
    "odisha": "west bengal",
    "chhattisgarh": "maharashtra",
    "assam": "west bengal",
    "himachal pradesh": "punjab",
    "uttarakhand": "punjab"
  };
  
  if (stateToRegionMap[stateLower]) {
    return regionClimateData[stateToRegionMap[stateLower]];
  }
  
  return regionClimateData["default"];
}

async function generateCropSuggestions(
  timeRange: number,
  state: string,
  plantingSeason: string,
  soilType: string,
  currentSeason: string,
  harvestSeason: string,
  climateData: any,
  language: string = 'english'
) {
  try {
    const currentDate = new Date();
    const harvestDate = new Date();
    harvestDate.setMonth(harvestDate.getMonth() + timeRange);
    
    const selectedSeason = plantingSeason.split(" ")[0];
    
    const prompt = `
I need crop recommendations for these farming conditions:
- State: ${state}
- Soil: ${soilType}
- Season: ${selectedSeason}
- Growing period: ${timeRange} months
- Climate: ${climateData.description || `${state} climate`}
- Rainfall: ${climateData.rainfall || "Variable"}

Please recommend 3-4 suitable crops. For each crop, include:
1. The crop name
2. Why it's good for this climate, soil, and growing period

Keep each explanation brief but informative.

RESPOND IN EXACTLY THIS JSON FORMAT (very important):
{
  "message": "Brief overview of farming situation",
  "suggestedCrops": [
    {
      "name": "Crop Name",
      "rationale": "Explanation why suitable"
    },
    ...
  ]
}

Provide your response in ${language} language.
`;

    const systemPrompt = `You are an agricultural expert specialized in Indian farming. You provide accurate crop recommendations based on local conditions. You ALWAYS respond in valid JSON format exactly as requested. Respond in ${language}.`;


    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 12000); // 12 seconds timeout
      });
      
      const resultPromise = generateJSON<{
        message: string;
        suggestedCrops: { name: string; rationale: string }[];
      }>('llama3.2', prompt, systemPrompt);
      
      const result = await Promise.race([resultPromise, timeoutPromise]) as {
        message: string;
        suggestedCrops: { name: string; rationale: string }[];
      };
      
      if (!result.message || !Array.isArray(result.suggestedCrops)) {
        throw new Error('Invalid response format');
      }
      
      return result;
    } catch (error) {
      console.error('Error with JSON generation, falling back to text extraction:', error);
      
      try {
        const rawText = await generateText('llama3.2', prompt, systemPrompt);
        console.log('Raw response:', rawText);
        
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[0]);
            
            if (extractedJson && extractedJson.message && Array.isArray(extractedJson.suggestedCrops)) {
              return extractedJson;
            }
          } catch (err) {
            console.error('Failed to parse extracted JSON:', err);
          }
        }
        
        return {
          message: "Based on your criteria, here are some crop suggestions:",
          suggestedCrops: [
            {
              name: "General Recommendation",
              rationale: rawText.substring(0, 500)
            }
          ]
        };
      } catch (textError) {
        console.error('Text generation fallback also failed:', textError);
        return createFallbackResponse(language);
      }
    }
  } catch (error) {
    console.error('Error generating crop suggestions:', error);
    return createFallbackResponse(language);
  }
}

function createFallbackResponse(language: string) {
  const messages = {
    english: {
      message: "We encountered a technical issue while analyzing your data.",
      error: "Please try again with different parameters or contact support if the problem persists."
    },
    hindi: {
      message: "आपके डेटा का विश्लेषण करते समय हमें एक तकनीकी समस्या का सामना करना पड़ा।",
      error: "कृपया अलग पैरामीटर के साथ फिर से प्रयास करें या यदि समस्या बनी रहती है तो सहायता से संपर्क करें।"
    }
  };
  
  const lang = language.toLowerCase();
  const msg = messages[lang as keyof typeof messages] || messages.english;
  
  return {
    message: msg.message,
    suggestedCrops: [
      {
        name: "Temporary Issue",
        rationale: msg.error
      }
    ]
  };
}