'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Settings = () => {
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
    <div>
      <div className="mb-6 space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      <Card className="w-full lg:w-96 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-semibold">API Key Settings</h2>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          <div className="divide-y">
            <Input
              type="text"
              placeholder="Enter your Sinch API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSave} className="w-auto">
            Save API Key
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
