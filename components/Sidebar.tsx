import React, { useState, useRef } from 'react';
import { Conversation, User, Story, Contact } from '../types';
import { Avatar } from './Avatar';
import { Stories } from './Stories';
import { SearchIcon, MoreVertIcon, PlusIcon } from './Icons';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  currentUser: User;
  onUpdateAvatar: (avatarUrl: string) => void;
  stories: Story[];
  onAddStory: (imageUrl: string) => void;
  onViewStories: (userId: string) => void;
}

const SidebarHeader: React.FC<{
  onNewChat: () => void;
  onLogout: () => void;
  currentUser: User;
  onUpdateAvatar: (avatarUrl: string) => void;
}> = ({ onNewChat, onLogout, currentUser, onUpdateAvatar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="bg-sky-600 p-3 flex justify-between items-center text-white relative">
      <div className="flex items-center">
        <button onClick={handleAvatarClick} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-600 focus:ring-white" title="Change profile picture">
          <Avatar src={currentUser.avatarUrl} name={currentUser.name} />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <div className="ml-3">
          <span className="font-semibold text-sm block">{currentUser.name}</span>
          <span className="font-light text-xs block">UID: {currentUser.uid}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onNewChat} title="New Chat" className="p-1 rounded-full hover:bg-sky-700">
          <PlusIcon className="w-6 h-6" />
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-full hover:bg-sky-700">
            <MoreVertIcon className="w-6 h-6" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 text-gray-800">
              <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setMenuOpen(false); }} className="block px-4 py-2 text-sm hover:bg-gray-100">
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const SearchBar: React.FC = () => (
  <div className="bg-white p-2 border-b border-gray-200">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type="text"
        placeholder="Search or start new chat"
        className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
      />
    </div>
  </div>
);

const ConversationPreview: React.FC<{
  conversation: Conversation;
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}> = ({ conversation, contact, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center p-3 cursor-pointer border-b border-gray-100 transition-colors duration-200 ${
      isSelected ? 'bg-sky-100' : 'hover:bg-gray-50'
    }`}
  >
    <Avatar src={contact.avatarUrl} name={contact.name} />
    <div className="flex-grow ml-3 overflow-hidden">
      <h3 className="font-semibold text-gray-800">{contact.name}</h3>
      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
    </div>
    <div className="text-xs text-gray-400 self-start ml-2 flex-shrink-0">{conversation.lastMessageTimestamp}</div>
  </div>
);

type ActiveTab = 'CHATS' | 'STORIES';

export const Sidebar: React.FC<SidebarProps> = ({ conversations, selectedConversationId, onSelectConversation, onNewChat, onLogout, currentUser, onUpdateAvatar, stories, onAddStory, onViewStories }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('CHATS');
  
  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-gray-200">
      <SidebarHeader onNewChat={onNewChat} onLogout={onLogout} currentUser={currentUser} onUpdateAvatar={onUpdateAvatar} />
       <div className="flex bg-white border-b">
        <button 
          onClick={() => setActiveTab('CHATS')}
          className={`w-1/2 p-3 text-sm font-semibold transition-colors duration-300 ${activeTab === 'CHATS' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500'}`}
        >
          CHATS
        </button>
        <button 
          onClick={() => setActiveTab('STORIES')}
          className={`w-1/2 p-3 text-sm font-semibold transition-colors duration-300 ${activeTab === 'STORIES' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500'}`}
        >
          RAPID STORIES
        </button>
      </div>
      <SearchBar />
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'CHATS' ? (
          conversations.map(convo => {
            const contact = currentUser.contacts.find(c => c.uid === convo.id);
            if (!contact) return null; // Should not happen with the new logic
            return (
              <ConversationPreview
                key={convo.id}
                conversation={convo}
                contact={contact}
                isSelected={convo.id === selectedConversationId}
                onClick={() => onSelectConversation(convo.id)}
              />
            );
          })
        ) : (
          <Stories 
            currentUser={currentUser}
            stories={stories}
            onAddStory={onAddStory}
            onViewStories={onViewStories}
          />
        )}
      </div>
    </div>
  );
};