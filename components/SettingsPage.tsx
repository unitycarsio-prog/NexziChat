import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Avatar } from './Avatar';
import { ArrowLeftIcon, EditIcon } from './Icons';

interface SettingsPageProps {
  currentUser: User;
  onUpdateAvatar: (avatarUrl: string) => void;
  onUpdateName: (newName: string) => { success: boolean, error?: string };
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateAvatar, onUpdateName, onBack }) => {
  const [name, setName] = useState(currentUser.name);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
        setSuccess("Profile picture updated!");
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = onUpdateName(name);
    if (!result.success) {
      setError(result.error || 'Failed to update name.');
    } else {
      setSuccess('Name updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <header className="bg-sky-600 p-3 flex items-center text-white flex-shrink-0">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-sky-700 mr-4">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="font-semibold text-lg">Settings</h2>
      </header>

      <div className="flex-grow overflow-y-auto p-6 space-y-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar src={currentUser.avatarUrl} name={currentUser.name} />
            <button
              onClick={handleAvatarClick}
              className="absolute -bottom-1 -right-1 bg-sky-500 rounded-full p-2 border-2 border-white hover:bg-sky-600"
              title="Change profile picture"
            >
              <EditIcon className="w-5 h-5 text-white" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* User Info Section */}
        <div className="space-y-4">
           <form onSubmit={handleNameChange} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <button 
                type="submit"
                className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
                Save Name
            </button>
          </form>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Your UID
            </label>
            <div className="w-full bg-gray-100 border rounded-lg py-2 px-3 text-gray-600">
              {currentUser.uid}
            </div>
            <p className="text-xs text-gray-500 mt-1">This is your unique ID for others to add you.</p>
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}

      </div>
    </div>
  );
};
