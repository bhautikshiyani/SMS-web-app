export async function sendSMS(to: string, message: string, apiKey: string) {
  const SERVICE_PLAN_ID = process.env.NEXT_PUBLIC_SINCH_SERVICE_PLAN_ID;
  const url = `https://sms.api.sinch.com/xms/v1/${SERVICE_PLAN_ID}/batches`;

  const payload = {
    from: 'MyApp',
    to: [to],
    body: message,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return data;
}
