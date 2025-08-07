'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import axios from 'axios';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchApiKey() {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get('/api/tenant-settings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },

        });
        if (res.status === 200 && res.data?.apiKey) {
          setApiKey(res.data.apiKey);
        }
      } catch (error) {
        console.error('Failed to fetch API key', error);
        toast.error('Failed to load API key');
      }
    }
    fetchApiKey();
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await axios.put(
        '/api/tenant-settings',
        { apiKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        toast.success('API Key saved successfully!');
      } else {
        toast.error('Failed to save API Key.');
      }
    } catch (error) {
      console.error('Failed to save API key', error);
      toast.error('Failed to save API Key.');
    } finally {
      setLoading(false);
    }
  }

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
          <Button onClick={handleSave} disabled={loading} className="w-auto">
            {loading ? 'Saving...' : 'Save API Key'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
