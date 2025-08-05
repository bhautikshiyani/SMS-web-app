'use client';

import React from 'react';

import { MoreHorizontal, ArrowLeft, Send, Smile, Paperclip, Mic, CirclePlus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatMessageList } from '../ui/chat/chat-message-list';
interface Message {
    id: number;
    type?: string;
    text?: string;
    fileName?: string;
    fileSize?: string;
    thumbnail?: string;
    duration?: string;
    images?: string[];
    additionalCount?: number;
    isSent?: boolean;
    time?: string;
    status?: string;
}


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


interface ChatViewProps {
    selectedChat: Chat | null;
    messages: Message[];
    renderMessage: (message: Message) => React.ReactNode;
    handleBackToList: () => void;
    messageText: string;
    setMessageText: (value: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ selectedChat, messages, handleBackToList, messageText, setMessageText, renderMessage }) => {
    if (!selectedChat) {
        return <figure className="h-full items-center justify-center text-center lg:flex"><img alt="shadcn/ui" loading="lazy" width="200" height="200" decoding="async" data-nimg="1" className="block max-w-sm dark:hidden" style={{ color: "transparent" }} src="/not-selected-chat.svg" /><img alt="shadcn/ui" loading="lazy" width="200" height="200" decoding="async" data-nimg="1" className="hidden max-w-sm dark:block" style={{ color: "transparent" }} src="/not-selected-chat-light.svg" /></figure>;
    }
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/', 'audio/', 'video/'];
        const isValid = allowedTypes.some(type => file.type.startsWith(type));

        if (!isValid) {
            alert('Only image, audio, or video files are allowed.');
            return;
        }

        console.log('Selected file:', file);

        event.target.value = '';
    };
    return (
        <>
            <div className="flex-1 bg-background flex h-full flex-col lg:relative lg:z-10 lg:bg-transparent">
                {/* Chat Header */}
                <div className="flex relative items-center justify-between gap-4 p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={handleBackToList}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>

                        <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedChat.avatar || undefined} />
                            <AvatarFallback>{selectedChat.initials || selectedChat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            {selectedChat.isOnline && (
                                <div className="absolute bottom-0.5 right-0.5 h-2 w-2 bg-green-400 rounded-full" />
                            )}
                        </Avatar>

                        <div>
                            <div className="font-semibold text-sm">{selectedChat.name}</div>
                            <div className="text-xs text-green-500">Online</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex gap-2">


                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Voice Call</TooltipContent>
                            </Tooltip>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                                <DropdownMenuItem>Block User</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Messages Area */}
                <ChatMessageList>
                    {messages.map(renderMessage)}
                </ChatMessageList>

                {/* Message Input */}
                <div className="px-4">
                    <div className="relative flex items-center bg-muted rounded-md border">
                        <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Enter message..."
                            className="h-14 border-transparent bg-white text-base shadow-transparent ring-transparent pe-32 lg:pe-56"
                        />

                        <div className="absolute right-4 flex items-center gap-1">
                            <div className="block lg:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-11 w-11 rounded-full p-0">
                                            <CirclePlus className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>📷 Camera</DropdownMenuItem>
                                        <DropdownMenuItem>📁 File</DropdownMenuItem>
                                        <DropdownMenuItem>🎤 Voice</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="hidden lg:flex gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0">
                                            <Smile className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Emoji</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <input
                                                id="file-input"
                                                type="file"
                                                accept="image/*,audio/*,video/*"
                                                onChange={handleFileUpload}
                                                hidden
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 rounded-full p-0"
                                                onClick={() => document.getElementById('file-input')?.click()}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Attach File</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0">
                                            <Mic className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Voice Message</TooltipContent>
                                </Tooltip>
                            </div>

                            <Button variant="outline" size="sm" className="ml-3 cursor-pointer">
                                <span className="hidden lg:inline">Send</span>
                                <Send className="h-4 w-4 lg:hidden" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatView;
