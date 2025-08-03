'use client';

import React from 'react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MessageStatus from './MessageStatus';
import NewMessageDialog from './NewMessageDialog';

interface Chat {
    id: number;
    name: string;
    lastMessage: string;
    avatar: string | null;  // <-- allow null here
    time: string;
    unreadCount: number;
    isOnline: boolean;
    messageStatus: string;
    initials?: string;      // add initials optional, since you use it
}

interface ChatListProps {
    onSelectChat: (chat: Chat) => void;
    onNewMessage: any;

    selectedChat: Chat
}

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


const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChat,onNewMessage }: ChatListProps) => {
    const handleNewMessage = (messageData: any) => {
        console.log('New message sent:', messageData);
        if (onNewMessage) {
            onNewMessage(messageData);
        }
        // You could also add the new message to the chat list or refresh data here
    };
    return (
        <>
            <Card className="w-full lg:w-96 flex pb-0 flex-col">
                <CardHeader className="">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl lg:text-2xl font-semibold">Chats</h2>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                                <NewMessageDialog onMessageSent={handleNewMessage} />
                            </DropdownMenuTrigger>
                            {/* <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>New Chat</DropdownMenuItem>
                                <DropdownMenuItem>New Group</DropdownMenuItem>
                            </DropdownMenuContent> */}
                        </DropdownMenu>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Chats search..." className="pl-10" />
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-auto p-0">
                    <div className="divide-y">
                        {chatList.map((chat) => (
                            <div
                                key={chat.id}
                                className={`group relative flex items-center gap-4 p-6 cursor-pointer hover:bg-muted ${selectedChat.id === chat.id ? 'bg-muted' : ''
                                    }`}
                                onClick={() => onSelectChat(chat)}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={chat.avatar || undefined} />
                                    <AvatarFallback>{chat.initials || chat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    {chat.isOnline && (
                                        <div className="absolute bottom-0.5 right-0.5 h-2 w-2 bg-green-400 rounded-full" />
                                    )}
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm truncate">{chat.name}</span>
                                        <span className="text-muted-foreground text-xs flex-shrink-0">{chat.time}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <MessageStatus status={chat.messageStatus} />
                                        <span className="text-muted-foreground text-sm truncate flex-1">{chat.lastMessage}</span>
                                        {chat.unreadCount > 0 && (
                                            <Badge className="bg-green-500 text-white text-sm h-6 w-6 rounded-full flex items-center justify-center">
                                                {chat.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 h-9 w-9 p-0 absolute right-4"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Archive</DropdownMenuItem>
                                        <DropdownMenuItem>Mute</DropdownMenuItem>
                                        <DropdownMenuItem>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default ChatList;
