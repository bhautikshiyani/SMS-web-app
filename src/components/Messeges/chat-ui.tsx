'use client';

import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {  TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import FileMessage from './FileMessage';
import VideoMessage from './VideoMessage';
import AudioMessage from './AudioMessage';
import ImageGallery from './ImageGallery';
import ChatView from './ChatView';
import ChatList from './ChatList';
import MessageStatus from './MessageStatus';

// Mock data for chat list
const chatList = [
    {
        id: 1,
        name: "Jacquenetta Slowgrave",
        avatar: "https://bundui-images.netlify.app/avatars/01.png",
        lastMessage: "Great! Looking forward to it. See you later!",
        time: "10 minutes",
        unreadCount: 8,
        isOnline: true,
        messageStatus: "sent"
    },
    {
        id: 2,
        name: "Nickola Peever",
        avatar: "https://bundui-images.netlify.app/avatars/02.png",
        lastMessage: "Sounds perfect! I've been wanting to try that place. See you there!",
        time: "40 minutes",
        unreadCount: 2,
        isOnline: true,
        messageStatus: "delivered"
    },
    {
        id: 3,
        name: "Farand Hume",
        avatar: null,
        initials: "FH",
        lastMessage: "How about 7 PM at the new Italian place downtown?",
        time: "Yesterday",
        unreadCount: 0,
        isOnline: true,
        messageStatus: "delivered"
    },
    {
        id: 4,
        name: "Ossie Peasey",
        avatar: "https://bundui-images.netlify.app/avatars/04.png",
        lastMessage: "Hey Bonnie, yes, definitely! What time should we meet?",
        time: "13 days",
        unreadCount: 0,
        isOnline: true,
        messageStatus: "sent"
    },
    {
        id: 5,
        name: "Hall Negri",
        avatar: "https://bundui-images.netlify.app/avatars/05.png",
        lastMessage: "No worries at all! I'll grab a table and wait for you. Drive safe!",
        time: "2 days",
        unreadCount: 0,
        isOnline: true,
        messageStatus: "read"
    }
];

// Mock data for messages
const messages = [
    {
        id: 1,
        text: "Sorry :( send you as soon as possible.",
        time: "05:23 PM",
        isSent: true,
        status: "delivered"
    },
    {
        id: 2,
        text: "I know how important this file is to you. You can trust me ;) I know how important this file is to you. You can trust me ;) know how important this file is to you. You can trust me ;)",
        time: "05:23 PM",
        isSent: false,
        status: "read"
    },
    {
        id: 3,
        type: "file",
        fileName: "resume.pdf",
        fileSize: "10KB",
        time: "05:23 PM",
        isSent: false,
        status: "read"
    },
    {
        id: 4,
        text: "I know how important this file is to you. You can trust me ;)  me ;)",
        time: "05:23 PM",
        isSent: true,
        status: "delivered"
    },
    {
        id: 5,
        type: "video",
        thumbnail: "https://bundui-images.netlify.app/extra/image4.jpg",
        duration: "2:42",
        time: "05:23 PM",
        isSent: false,
        status: "read"
    },
    {
        id: 6,
        type: "file",
        fileName: "important_documents.pdf",
        fileSize: "50KB",
        time: "05:23 PM",
        isSent: true,
        status: "delivered"
    },
    {
        id: 7,
        type: "audio",
        duration: "2:34",
        time: "05:23 PM",
        isSent: true,
        status: "delivered"
    },
    {
        id: 8,
        type: "images",
        images: [
            "https://bundui-images.netlify.app/extra/image5.jpg",
            "https://bundui-images.netlify.app/extra/image4.jpg",
            "https://bundui-images.netlify.app/extra/image3.jpg",
            "https://bundui-images.netlify.app/extra/image2.jpg"
        ],
        additionalCount: 2,
        time: "05:23 PM",
        isSent: true,
        status: "delivered"
    }
];
const renderMessage = (message: any) => {
    const baseClasses = `max-w-sm space-y-1 ${message.isSent ? 'self-end' : ''}`;

    return (
        <div key={message.id} className={baseClasses}>
            <div className="flex items-center gap-2">
                {message.type === 'file' ? (
                    <FileMessage fileName={message.fileName} fileSize={message.fileSize} isSent={message.isSent} />
                ) : message.type === 'video' ? (
                    <VideoMessage thumbnail={message.thumbnail} duration={message.duration} />
                ) : message.type === 'audio' ? (
                    <AudioMessage duration={message.duration} />
                ) : message.type === 'images' ? (
                    <ImageGallery images={message.images} additionalCount={message.additionalCount} />
                ) : (
                    <div className={`inline-flex rounded-md border p-4 bg-muted ${message.isSent ? 'order-1' : ''}`}>
                        {message.text}
                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Reply</DropdownMenuItem>
                        <DropdownMenuItem>Forward</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className={`flex items-center gap-2 ${message.isSent ? 'justify-end' : ''}`}>
                <time className="text-muted-foreground text-xs">{message.time}</time>
                {message.isSent && <MessageStatus status={message.status} />}
            </div>
        </div>
    );
};
const ChatUI = () => {
    const [selectedChat, setSelectedChat] = useState(chatList[0]);
    const [messageText, setMessageText] = useState('');
    const [showChatView, setShowChatView] = useState(false);
    const isLaptop = useIsMobile(1024)

    const handleChatSelect = (chat: any) => {
        setSelectedChat(chat);
        setShowChatView(true);
    };

    const handleBackToList = () => {
        setShowChatView(false);
    };

    const handleNewMessage = (messageData: any) => {
        console.log('New message sent:', messageData);
        // Handle new message logic here
    };
  

    return (
        <TooltipProvider>
            <div className="flex h-[calc(100vh-var(--header-height)-3rem)] w-full">
                {
                    isLaptop ?
                        <>
                            {showChatView ? <ChatView selectedChat={selectedChat} messages={messages} handleBackToList={handleBackToList} messageText={messageText} setMessageText={setMessageText} renderMessage={renderMessage} /> : <ChatList onNewMessage={handleNewMessage} onSelectChat={handleChatSelect} selectedChat={selectedChat} />}

                        </>
                        :
                        <>

                            <ChatList onNewMessage={handleNewMessage} onSelectChat={handleChatSelect} selectedChat={selectedChat} />
                            <ChatView selectedChat={selectedChat} messages={messages} handleBackToList={handleBackToList} messageText={messageText} setMessageText={setMessageText} renderMessage={renderMessage} />
                        </>
                }

            </div>
        </TooltipProvider>
    );
};

export default ChatUI;