export interface SMSRequest {
  to: string;
  message: string;
}


export interface ChatItem {
  id: number;
  name: string;
  avatar: string | null;
  initials?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  messageStatus: 'sent' | 'delivered' | 'read';
}

export interface ChatMessage {
  id: number;
  text?: string;
  type?: 'file' | 'video' | 'audio' | 'images';
  fileName?: string;
  fileSize?: string;
  thumbnail?: string;
  duration?: string;
  images?: string[];
  additionalCount?: number;
  time: string;
  isSent: boolean;
  status: 'sent' | 'delivered' | 'read';
}
