"use client";

import React from "react";
import Link from "next/link";

export default function WhatsAppBotPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">WhatsApp Plant Disease Bot Setup</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-700">How It Works</h2>
        <p className="mb-4">
          Our WhatsApp bot uses artificial intelligence to analyze plant images and detect diseases. 
          Send a photo of your plant through WhatsApp, and our bot will provide:
        </p>
        <ul className="list-disc pl-8 mb-6 space-y-2">
          <li>Disease identification</li>
          <li>Cure recommendations</li>
          <li>Prevention tips</li>
          <li>Additional agricultural advice</li>
        </ul>
        
        <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
          <h3 className="font-medium text-green-800 mb-2">Don't have any images?</h3>
          <p className="text-green-700">
            You can also send a text message with "help" to get general information on how to use the bot.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-700">Setting Up Twilio WhatsApp Integration</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">1. Create a Twilio Account</h3>
            <p className="mb-2">
              If you don't already have one, create a Twilio account at 
              <a href="https://www.twilio.com/try-twilio" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                twilio.com
              </a>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">2. Set Up WhatsApp Sandbox</h3>
            <p className="mb-2">
              In the Twilio console, navigate to Messaging &gt; Try it Out &gt; Send a WhatsApp Message
            </p>
            <p className="mb-2">
              Follow the instructions to connect your WhatsApp to the Twilio Sandbox
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">3. Configure Your Webhook</h3>
            <p className="mb-2">
              In the Twilio console, set the webhook URL for incoming WhatsApp messages to:
            </p>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm mb-2 overflow-x-auto">
              https://your-domain.com/api/whatsapp
            </div>
            <p>
              Make sure to replace "your-domain.com" with your actual domain where this application is hosted.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">4. Set Environment Variables</h3>
            <p className="mb-2">
              Ensure the following environment variables are set:
            </p>
            <ul className="list-disc pl-8 space-y-1">
              <li>TWILIO_ACCOUNT_SID</li>
              <li>TWILIO_AUTH_TOKEN</li>
              <li>OPENAI_API_KEY</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">5. Test Your Bot</h3>
            <p>
              Send a message to your WhatsApp Sandbox number with "help" to get started,
              or send a photo of a plant to test the disease detection feature.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-green-600 hover:text-green-800 font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 