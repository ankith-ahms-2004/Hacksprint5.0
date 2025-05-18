"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface DiseaseData {
  name: string;
  cure: string;
  prevention: string;
}

export default function PlantDiseasePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diseaseData, setDiseaseData] = useState<DiseaseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("english");

  const languages = [
    "english",
    "hindi",
    "tamil",
    "telugu",
    "kannada",
    "malayalam",
    "marathi",
    "punjabi",
    "gujarati",
    "bengali",
    "oriya",
    "assamese"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setDiseaseData(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("language", language);
      
      const response = await fetch("/api/analyze-plant", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setDiseaseData(data);
    } catch (err) {
      setError(`Failed to analyze image: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          <span className="border-b-4 border-green-500 pb-2 text-slate-700">Plant Disease Detection</span>
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-green-700">How It Works</h2>
          <p className="mb-4 text-gray-800 font-medium">
            Our plant disease detection tool uses advanced image recognition to identify diseases in your crops and provide treatment recommendations.
          </p>
          <ul className="pl-8 mb-6 space-y-3">
            {[
              "Upload a clear image of the affected plant part",
              "Our system analyzes the visual symptoms",
              "Receive accurate disease identification",
              "Get detailed cure and prevention methods",
              "Implement treatments to save your crops"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2 text-xl">•</span>
                <span className="text-gray-800 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imageInput"
              />
              <label 
                htmlFor="imageInput"
                className="cursor-pointer block"
              >
                {imagePreview ? (
                  <div className="relative w-full h-64 mx-auto">
                    <Image 
                      src={imagePreview} 
                      alt="Selected plant" 
                      fill 
                      style={{ objectFit: "contain" }}
                      className="rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-gray-300 border-dashed rounded-lg p-12 hover:border-green-500 transition-colors duration-200">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-4 text-base text-gray-600 font-medium">Click to upload an image of a diseased plant</p>
                      <p className="mt-2 text-sm text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800 font-medium"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition duration-200 text-lg"
              disabled={loading || !selectedImage}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : "Analyze Plant Disease"}
            </button>
            
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg font-medium">{error}</div>
            )}
          </form>
        </div>
        
        {diseaseData && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-green-700">Diagnosis Results</h2>
            
            <div className="space-y-6">
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-200 hover:shadow-md transition-all duration-200">
                <h3 className="font-bold text-xl mb-3 text-green-800 border-b pb-2 border-gray-200">
                  Disease Identified
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">{diseaseData.name}</p>
                </div>
              </div>
              
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-200 hover:shadow-md transition-all duration-200">
                <h3 className="font-bold text-xl mb-3 text-green-800 border-b pb-2 border-gray-200">
                  Recommended Treatment
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="whitespace-pre-line text-gray-800 font-medium">{diseaseData.cure}</p>
                </div>
              </div>
              
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-200 hover:shadow-md transition-all duration-200">
                <h3 className="font-bold text-xl mb-3 text-green-800 border-b pb-2 border-gray-200">
                  Prevention Measures
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="whitespace-pre-line text-gray-800 font-medium">{diseaseData.prevention}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t-2 border-gray-200">
              <p className="text-sm text-gray-700 font-medium bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <span className="font-bold">Note:</span> The diagnosis is based on visual analysis and may require confirmation from an agricultural expert. 
                Always follow professional advice when applying treatments to your crops.
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-green-500 rounded-lg text-green-700 font-bold hover:bg-green-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 