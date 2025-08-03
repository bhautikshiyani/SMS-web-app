    'use client';

    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Badge } from '@/components/ui/badge';
    import { useState } from 'react';
    import { Send, X, Plus } from 'lucide-react';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';

    import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
    } from '@/components/ui/dialog';
    import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneInput } from '../ui/phone-input';
import toast from 'react-hot-toast';

    interface Chat {
        id: number;
        name: string;
        lastMessage: string;
        avatar: string | null;
        time: string;
        unreadCount: number;
        isOnline: boolean;
        messageStatus: string;
        initials?: string;
    }


   
  
    const NewMessageDialog = ({ onMessageSent }: { onMessageSent?: (messageData: any) => void }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [recipients, setRecipients] = useState<string[]>([]);
        const [currentRecipient, setCurrentRecipient] = useState('');
        const [message, setMessage] = useState('');
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');
        const [country, setCountry] = useState('');

        const FROM_NUMBER = '+19876543210';

        const addRecipient = () => {
            if (currentRecipient && !recipients.includes(currentRecipient)) {
                const phoneRegex = /^\+[1-9]\d{1,14}$/;
                if (phoneRegex.test(currentRecipient)) {
                    setRecipients([...recipients, currentRecipient]);
                    setCurrentRecipient('');
                    setError('');
                } else {
                    setError('Please enter a valid phone number with country code (e.g., +1234567890)');
                }
            }
        };

        const removeRecipient = (recipient: string) => {
            setRecipients(recipients.filter(r => r !== recipient));
        };

        const handleKeyPress = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && currentRecipient) {
                e.preventDefault();
                addRecipient();
            }
        };

        const sendMessage = async () => {
            if (!message.trim()) {
                setError('Please enter a message');
                return;
            }

            if (recipients.length === 0) {
                setError('Please add at least one recipient');
                return;
            }

            setIsLoading(true);
            setError('');
            setSuccess('');




            try {
                const response = await fetch('/api/sms/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from: country,
                        to: recipients,
                        body: message.trim(),
                    }),
                });

                if (!response.ok) {
                   toast.error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                setSuccess('Message sent successfully!');
                toast.success('Message sent successfully!')
                // Call the callback function if provided
                if (onMessageSent) {
                    onMessageSent({
                        id: data.id,
                        from: country,
                        to: recipients,
                        body: message.trim(),
                        timestamp: new Date().toISOString(),
                    });
                }

                // Reset form after successful send
                setTimeout(() => {
                    setRecipients([]);
                    setMessage('');
                    setSuccess('');
                    setIsOpen(false);
                }, 2000);

            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message. Please check your configuration and try again.');
            } finally {
                setIsLoading(false);
            }
        };

        const resetForm = () => {
            setRecipients([]);
            setCurrentRecipient('');
            setMessage('');
            setError('');
            setSuccess('');
        };

        return (
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) resetForm();
            }}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                        <DialogDescription>
                            Send an SMS message to one or more recipients using Sinch API.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Recipients Section */}
                        <div className="space-y-2">
                            <Label htmlFor="message">From</Label>

                            
                            <PhoneInput onChange={(e)=>setCountry(e)} value={country} placeholder="Enter a phone number"  />

                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recipients">Recipients</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="recipients"
                                    placeholder="Enter phone number (e.g., +1234567890)"
                                    value={currentRecipient}
                                    onChange={(e) => setCurrentRecipient(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={addRecipient}
                                    size="sm"
                                    disabled={!currentRecipient}
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Recipients Display */}
                            {recipients.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {recipients.map((recipient, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            {recipient}
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                onClick={() => removeRecipient(recipient)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Section */}
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                maxLength={1600} // SMS character limit
                            />
                            <div className="text-xs text-muted-foreground text-right">
                                {message.length}/1600 characters
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">{success}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={sendMessage}
                            disabled={isLoading || !message.trim() || recipients.length === 0}
                            className="flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default NewMessageDialog;