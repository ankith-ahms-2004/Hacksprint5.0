'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      const response = await fetch('/api/docs');
      const data = await response.json();
      setSpec(data);
    };

    fetchSpec();
  }, []);

  if (!spec) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold">Loading API Documentation...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Farmer SaaS API Documentation</h1>
      <div className="bg-white rounded-lg shadow">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
} 