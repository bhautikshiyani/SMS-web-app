'use client';
import { useState } from 'react';

export default function SendSMSForm() {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
    const data = await res.json();
    alert(data?.messageId ? 'SMS sent successfully!' : 'Failed to send SMS');
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Send SMS</h2>
      <input
        type="text"
        placeholder="Recipient Phone Number"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        placeholder="Your Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleSend} className="bg-green-600 text-white px-4 py-2 rounded">
        Send SMS
      </button>
    </div>
  );
}
