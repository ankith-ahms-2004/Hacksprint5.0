# Farmer's Assistant App

A Next.js application that helps farmers with various tasks, including plant disease detection using GPT-4 Vision API, weather forecasting, and AI-powered farming advice.

## Features

### Plant Disease Detection

Upload an image of a diseased plant and get:
- Disease name
- Cure recommendations
- Prevention tips

The app uses OpenAI's GPT-4 Vision API to analyze plant images and provide detailed information.

### WhatsApp Bot Integration

Send plant images via WhatsApp and receive:
- Disease identification
- Cure recommendations
- Prevention measures
- Additional agricultural advice

The WhatsApp bot uses Twilio's API and OpenAI's GPT-4 Vision to analyze plant images and provide detailed responses.

### Weather Forecasting & Farming Advice

Get personalized farming advice based on:
- Current weather and 7-day forecast for your location
- Crop type selection
- AI-powered recommendations for:
  - Watering schedules
  - Pest risk alerts based on humidity and temperature
  - Crop protection and preventative measures

### Ollama Integration

The application now offers local AI capabilities through Ollama integration:
- Crop suggestions powered by local LLMs
- Chatbot functionality running completely on your machine
- Privacy-preserving AI assistance without sending data to external APIs

Features include:
- GPS/location-based weather data
- Manual city selection
- Hourly weather updates
- Personalized farming advice using GPT-4

## Getting Started

### Prerequisites

1. Node.js 18.x or higher
2. OpenAI API key for plant disease detection
3. OpenWeatherMap API key 
4. Twilio account (for WhatsApp integration)
5. [Ollama](https://ollama.com/) installed and running for local AI features

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

4. Install and set up Ollama (optional but recommended for chatbot and crop suggestions):
   - Download and install Ollama from [https://ollama.com/](https://ollama.com/)
   - Start the Ollama service
   - Pull a model (recommended: llama3): `ollama pull llama3`

5. Run the development server:

```bash
npm run dev
```

6. (Optional) Start the weather update service for hourly updates:

```bash
npm run weather:update
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

8. Navigate to [Dashboard](http://localhost:3000/dashboard) to view weather forecast and farming advice.
9. Navigate to [Plant Disease Detection](http://localhost:3000/plant-disease) to use the plant disease analysis feature.
10. Navigate to [WhatsApp Bot Setup](http://localhost:3000/whatsapp-bot) to set up the WhatsApp integration.

## AI Model Configuration

The application uses a hybrid approach to AI services:

- **Ollama (Local)**:
  - Crop suggestions feature
  - Chatbot functionality
  - Edit the model name in `utils/ollama.ts` to use different local models

- **OpenAI (API)**:
  - Plant disease detection (using Vision APIs)
  - Any feature requiring image analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## How to Use Plant Disease Detection

1. Click on the "Plant Disease Detection" card on the homepage
2. Upload an image of a plant showing disease symptoms
3. Click the "Analyze Plant Disease" button
4. View the results that include disease name, cure recommendations, and prevention tips

## How to Use Weather & Farming Advice

1. Go to the Dashboard
2. Either:
   - Select your city from the dropdown menu, or
   - Click the location pin button to use your current GPS location
3. Optionally select a crop type to get crop-specific advice
4. View the current weather, 7-day forecast, and AI-generated farming advice
5. Weather data automatically updates every hour

## How to Set Up WhatsApp Bot

1. Create a Twilio account at [twilio.com](https://www.twilio.com/try-twilio)
2. Set up WhatsApp Sandbox in the Twilio console
3. Configure your webhook URL to point to your application's `/api/whatsapp` endpoint
4. Set the required environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
5. Send messages to your WhatsApp Sandbox number to test the bot
   - Send "help" to get information about the bot
   - Send an image of a plant to get disease analysis

## API Documentation

This application includes comprehensive API documentation using Swagger/OpenAPI specification.

### Accessing the API Documentation

1. Start the development server with `npm run dev`
2. Navigate to [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in your browser
3. Explore the interactive API documentation interface

The API documentation provides detailed information about:
- Available endpoints
- Required parameters
- Request and response formats
- Authentication methods
- Data models and schemas

### Using the API Documentation

The API documentation is interactive and allows you to:
1. Browse all available API endpoints
2. Test API endpoints directly from the browser
3. View request and response examples
4. Understand the data models used throughout the application

For developers who want to integrate with the Farmer's Assistant App, the API documentation serves as a comprehensive reference.

## Technologies Used

- Next.js 15
- React 19
- OpenAI GPT-4 Vision API and GPT-4o
- OpenWeatherMap API
- Twilio API for WhatsApp
- TailwindCSS

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/guides/vision)
- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## License

MIT
"# Kisan_Sahayak" 
"# Kisan_Sahayak" 
"# Kisan_Sahayak" 
"# Hacksprint5.0" 
