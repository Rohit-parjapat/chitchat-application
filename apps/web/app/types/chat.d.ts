export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    profile?: string;
  };
  content: string;
  createdAt: string;
  conversationId: string;
  senderId: string;
  status: 'sent' | 'delivered' | 'read';
  updatedAt: string;
}
export type Participant = {
  conversationId: string;
  id: string;
  role: string;
  user: {
    name: string;
    id: string;
    email: string;
    profile?: string; 
  };
  userId: string;
};

export type Chat = {
  id: string;
  name?: string;
  messages: Message[];
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  isGroup: boolean;
};

export type User = {
  id: string;
  email: string;
  name?: string;
};