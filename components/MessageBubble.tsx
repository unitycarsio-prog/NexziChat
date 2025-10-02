import React from 'react';
import { Message, MessageType } from '../types';
import { DoubleCheckIcon, DocumentIcon } from './Icons';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

const MessageContent: React.FC<{ message: Message }> = ({ message }) => {
    switch (message.type) {
        case MessageType.IMAGE:
            return <img src={message.fileUrl} alt={message.fileName || 'Image'} className="rounded-lg max-w-xs max-h-80" />;
        case MessageType.VIDEO:
            return <video src={message.fileUrl} controls className="rounded-lg max-w-xs" />;
        case MessageType.AUDIO:
            return <audio src={message.fileUrl} controls className="w-full" />;
        case MessageType.DOCUMENT:
            return (
                <a href={message.fileUrl} download={message.fileName} className="flex items-center bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition-colors">
                    <DocumentIcon className="w-8 h-8 text-gray-600 mr-3" />
                    <div>
                        <p className="font-semibold text-gray-800 truncate">{message.fileName}</p>
                        <p className="text-xs text-gray-500">{message.fileSize}</p>
                    </div>
                </a>
            );
        case MessageType.TEXT:
        default:
            return <p className="text-sm">{message.text}</p>;
    }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
  const isUser = message.senderUid === currentUserId;

  const hasTextContent = message.type === MessageType.TEXT || message.type === MessageType.DOCUMENT;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg p-2 max-w-lg shadow flex flex-col ${
          isUser
            ? 'bg-sky-200 text-gray-800 rounded-br-none'
            : 'bg-white text-gray-700 rounded-bl-none'
        } ${hasTextContent ? 'p-3' : 'p-2'}`}
      >
        <MessageContent message={message} />
        <div className="flex justify-end items-center mt-1 self-end">
          <span className={`text-xs ${isUser ? 'text-sky-700' : 'text-gray-400'}`}>
            {message.timestamp}
          </span>
          {isUser && <DoubleCheckIcon className="w-4 h-4 ml-1 text-sky-700" />}
        </div>
      </div>
    </div>
  );
};