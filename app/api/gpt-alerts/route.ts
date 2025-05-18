import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function GET() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an agricultural expert AI that provides timely alerts for farmers in India. Your alerts should be actionable, specific, and based on current agricultural trends, weather patterns, disease outbreaks, and policy changes."
        },
        {
          role: "user",
          content: `Generate 5 agricultural alerts for Indian farmers. The alerts should cover different categories: disease outbreaks, price fluctuations, weather events, and policy changes.

Each alert should include:
1. A specific message with actionable advice
2. A severity level (high, medium, or low)
3. Affected regions in India
4. Affected crops (or "All" if applicable)
5. Alert type (disease, price, weather, policy)

Format your response as a valid JSON with this exact structure:
{
  "alerts": [
    {
      "id": "unique-id-1",
      "type": "disease|price|weather|policy",
      "severity": "high|medium|low",
      "message": "Detailed message with actionable advice",
      "regions": ["Region1", "Region2"],
      "crops": ["Crop1", "Crop2"]
    },
    ...more alerts
  ]
}

Make the alerts realistic, specific, and varied in terms of severity, regions, and crops.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    
    console.log('OpenAI response:', content);
    
    const parsedResponse = JSON.parse(content);
    
    let alerts = [];
    if (parsedResponse.alerts && Array.isArray(parsedResponse.alerts)) {
      alerts = parsedResponse.alerts;
    } else if (Array.isArray(parsedResponse)) {
      alerts = parsedResponse;
    } else {
      console.error('Unexpected response structure from OpenAI:', parsedResponse);
      throw new Error("Invalid response format from OpenAI");
    }
    
    if (alerts.length === 0) {
      console.error('No alerts found in OpenAI response');
      throw new Error("No alerts in OpenAI response");
    }
    
    alerts = alerts.map((alert: any, index: number) => {
      const daysAgo = index % 3;
      const created = new Date(Date.now() - (daysAgo * 86400000)).toISOString();
      
      return {
        ...alert,
        created
      };
    });
    
    const sortedAlerts = alerts.sort((a: any, b: any) => {
      const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
    
    return NextResponse.json(sortedAlerts);
  } catch (error) {
    console.error('Error generating alerts with OpenAI:', error);
    
    const fallbackAlerts = [
      {
        id: 'alert-fallback-1',
        type: 'disease',
        severity: 'high',
        message: 'Potential crop disease outbreak in several regions. Monitor your crops closely and consider preventative measures.',
        regions: ['All India'],
        crops: ['All'],
        created: new Date().toISOString()
      },
      {
        id: 'alert-fallback-2',
        type: 'weather',
        severity: 'medium',
        message: 'Unseasonable weather patterns expected. Prepare appropriate crop protection measures.',
        regions: ['All India'],
        crops: ['All'],
        created: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    return NextResponse.json(fallbackAlerts);
  }
} 