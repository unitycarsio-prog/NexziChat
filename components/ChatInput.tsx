import React, { useState, useRef } from 'react';
import { SendIcon, EmojiIcon, PaperclipIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendFile }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="bg-gray-100 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <EmojiIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
        <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />
        <button type="button" onClick={handleAttachClick}>
            <PaperclipIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-grow rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
        />
        <button
          type="submit"
          className="bg-sky-500 text-white rounded-lg p-3 hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-sky-300"
          disabled={!text.trim()}
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};