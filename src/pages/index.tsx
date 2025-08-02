import SendSMSForm from '@/components/Messeges/SendSMSForm';
import SettingsForm from '@/components/Settings/SettingsForm';

export default function HomePage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Sinch SMS Integration</h1>
      <SettingsForm />
      <SendSMSForm />
    </main>
  );
}
