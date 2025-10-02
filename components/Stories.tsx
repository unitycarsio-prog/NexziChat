import React, { useRef, useMemo } from 'react';
import { Story, User } from '../types';
import { Avatar } from './Avatar';
import { PlusIcon } from './Icons';

interface StoriesProps {
    currentUser: User;
    stories: Story[];
    onAddStory: (imageUrl: string) => void;
    onViewStories: (userId: string) => void;
}

const StoryItem: React.FC<{ userStories: Story[], onViewStories: (userId: string) => void }> = ({ userStories, onViewStories }) => {
    if (userStories.length === 0) return null;
    
    const latestStory = userStories[0]; // Assuming stories are pre-sorted descending by time
    const { userId, userName, userAvatarUrl } = latestStory;
    
    return (
        <div className="flex items-center p-3 cursor-pointer hover:bg-gray-50" onClick={() => onViewStories(userId)}>
            <div className={'p-1 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500'}>
                <div className="p-0.5 bg-white rounded-full">
                    <Avatar src={userAvatarUrl} name={userName} />
                </div>
            </div>
            <div className="ml-3">
                <h3 className="font-semibold text-gray-800">{userName}</h3>
                <p className="text-sm text-gray-500">{new Date(latestStory.timestamp).toLocaleTimeString()}</p>
            </div>
        </div>
    );
};


export const Stories: React.FC<StoriesProps> = ({ currentUser, stories, onAddStory, onViewStories }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMyStatusClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onAddStory(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const storiesByUser = useMemo(() => {
        const grouped: { [key: string]: Story[] } = {};
        stories.forEach(story => {
            if (story.userId !== currentUser.uid) {
                if (!grouped[story.userId]) {
                    grouped[story.userId] = [];
                }
                grouped[story.userId].push(story);
            }
        });
        return Object.values(grouped).map(userStories => userStories.sort((a, b) => b.timestamp - a.timestamp));
    }, [stories, currentUser.uid]);

    const myStories = useMemo(() => stories.filter(s => s.userId === currentUser.uid), [stories, currentUser.uid]);

    return (
        <div className="h-full bg-white">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />
            <div className="p-4 border-b">
                <div className="flex items-center cursor-pointer" onClick={handleMyStatusClick}>
                    <div className="relative">
                       <Avatar src={currentUser.avatarUrl} name={currentUser.name} />
                       <div className="absolute bottom-0 right-0 bg-sky-500 rounded-full p-0.5 border-2 border-white">
                           <PlusIcon className="w-4 h-4 text-white" />
                       </div>
                    </div>
                    <div className="ml-3">
                        <h3 className="font-semibold text-gray-800">My Status</h3>
                        <p className="text-sm text-gray-500">
                            {myStories.length > 0 ? `${myStories.length} updates` : "Tap to add status update"}
                        </p>
                    </div>
                </div>
            </div>

            <h4 className="p-3 text-sm font-semibold text-sky-700 bg-gray-50">Recent updates</h4>
            <div>
                {storiesByUser.length > 0 ? (
                    storiesByUser.map(userStories => (
                        <StoryItem 
                            key={userStories[0].userId} 
                            userStories={userStories} 
                            onViewStories={onViewStories}
                        />
                    ))
                ) : (
                    <p className="p-4 text-sm text-gray-500">No recent updates from your contacts.</p>
                )}
            </div>
        </div>
    )
}