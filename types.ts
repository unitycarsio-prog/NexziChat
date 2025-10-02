export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export interface Message {
  id: string;
  senderUid: string;
  timestamp: string;
  type: MessageType;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface Contact {
  uid: string;
  name: string;
  avatarUrl: string;
}

export interface Conversation {
  id: string; // This will be the UID of the other person
  lastMessage: string;
  lastMessageTimestamp: string;
  messages: Message[];
}

export interface User {
    uid: string;
    name: string;
    avatarUrl?: string;
    contacts: Contact[];
}

export interface Story {
    id: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    imageUrl: string;
    timestamp: number;
}