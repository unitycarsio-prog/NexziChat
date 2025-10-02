import React, { useRef, useEffect } from 'react';
import { Conversation, Contact, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Avatar } from './Avatar';
import { MoreVertIcon, SearchIcon, ArrowLeftIcon } from './Icons';

interface ChatWindowProps {
  conversation: Conversation | undefined;
  contact: Contact | undefined;
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  currentUser: User;
  onBack: () => void;
}

const ChatWindowHeader: React.FC<{ contact: Contact, onBack: () => void }> = ({ contact, onBack }) => (
  <header className="bg-sky-600 p-3 flex justify-between items-center text-white flex-shrink-0">
    <div className="flex items-center">
      <button onClick={onBack} className="md:hidden mr-2 p-1 rounded-full hover:bg-sky-700">
          <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <Avatar src={contact.avatarUrl} name={contact.name} />
      <div className="ml-3">
        <h2 className="font-semibold">{contact.name}</h2>
        <p className="text-sm text-sky-100">online</p>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <SearchIcon className="w-6 h-6 cursor-pointer" />
      <MoreVertIcon className="w-6 h-6 cursor-pointer" />
    </div>
  </header>
);

const EmptyChat: React.FC = () => (
    <div className="flex-grow flex flex-col items-center justify-center bg-gray-100 text-gray-500 border-l border-gray-200">
        <div className="text-center p-4">
            <h2 className="text-2xl font-light">NexziChat</h2>
            <p className="mt-2 max-w-sm">Select a conversation or start a new chat to begin messaging.</p>
        </div>
    </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, contact, onSendMessage, onSendFile, currentUser, onBack }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation || !contact) {
    return <EmptyChat />;
  }

  return (
    <div 
        className="w-full h-full flex flex-col bg-[#E5DDD5]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
    >
      <ChatWindowHeader contact={contact} onBack={onBack}/>
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {conversation.messages.map(message => (
            <MessageBubble key={message.id} message={message} currentUserId={currentUser.uid} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput onSendMessage={onSendMessage} onSendFile={onSendFile} />
    </div>
  );
};