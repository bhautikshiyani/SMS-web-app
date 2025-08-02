'use client';
import { useState } from 'react';

export default function SettingsForm() {
  const [apiKey, setApiKey] = useState('');

  const handleSave = async () => {
    await fetch('/api/settings/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    alert('API Key saved (temporarily)');
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">API Key Settings</h2>
      <input
        type="text"
        placeholder="Enter your Sinch API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save API Key
      </button>
    </div>
  );
}
