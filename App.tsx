import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { AuthScreen } from './components/AuthScreen';
import { Conversation, Message, User, Story, Contact, MessageType } from './types';
import { Avatar } from './components/Avatar';

// --- Story Viewer Component ---
interface StoryViewerProps {
  stories: Story[];
  onClose: () => void;
}

const ProgressBarSegment: React.FC<{ active: boolean; duration: number }> = ({ active, duration }) => (
  <div className="flex-1 h-1 bg-white bg-opacity-40 rounded-full mx-0.5">
    <div
      className={`h-full bg-white rounded-full ${active ? 'transition-all ease-linear' : ''}`}
      style={{ width: active ? '100%' : '0%', transitionDuration: active ? `${duration}ms` : '0ms' }}
    />
  </div>
);

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const STORY_DURATION = 5000; // 5 seconds

  useEffect(() => {
    if (stories.length === 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }, STORY_DURATION);

    return () => clearTimeout(timer);
  }, [currentIndex, stories, onClose]);

  if (stories.length === 0) return null;

  const currentStory = stories[currentIndex];
  const { userName, userAvatarUrl, timestamp, imageUrl, userId } = currentStory;

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 left-4 right-4 flex">
            {stories.map((_, index) => (
                <ProgressBarSegment key={index} active={index === currentIndex} duration={STORY_DURATION} />
            ))}
        </div>

        <div className="absolute top-8 left-4 flex items-center z-10">
            <Avatar src={userAvatarUrl} name={userName} />
            <div className="ml-3 text-white">
                <p className="font-semibold">{userName}</p>
                <p className="text-xs text-gray-300">{new Date(timestamp).toLocaleTimeString()}</p>
            </div>
        </div>

        <button onClick={onClose} className="absolute top-8 right-4 text-white text-3xl font-bold z-10">&times;</button>
        
        <img src={imageUrl} alt="Story content" className="max-h-[80vh] max-w-full object-contain rounded-lg" />

        <div className="absolute left-0 top-0 h-full w-1/2" onClick={handlePrev}></div>
        <div className="absolute right-0 top-0 h-full w-1/2" onClick={handleNext}></div>
    </div>
  );
};


// --- Add Contact Modal Component ---
interface AddContactModalProps {
  onClose: () => void;
  onAddContact: (uid: string, name: string) => void;
  error?: string;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAddContact, error }) => {
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContact(uid, name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Contact</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact-uid">
              Contact's 8-Digit UID
            </label>
            <input
              id="contact-uid"
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="12345678"
              className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
              pattern="\d{8}"
              title="UID must be 8 digits."
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact-name">
              Contact's Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Add & Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingStoriesOfUserId, setViewingStoriesOfUserId] = useState<string | null>(null);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [addContactError, setAddContactError] = useState('');


  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      const userConversations = localStorage.getItem(`conversations_${user.uid}`);
      setConversations(userConversations ? JSON.parse(userConversations) : []);
    }

    const storedStories = localStorage.getItem('stories');
    if (storedStories) {
        const allStories: Story[] = JSON.parse(storedStories);
        const fourteenHoursAgo = Date.now() - 14 * 60 * 60 * 1000;
        const activeStories = allStories.filter(s => s.timestamp > fourteenHoursAgo);
        setStories(activeStories);
    }
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`conversations_${currentUser.uid}`, JSON.stringify(conversations));
    }
  }, [conversations, currentUser]);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      // This effect should only sync the currentUser state to localStorage.
      // The logic for updating the central users_data store should be in specific handlers.
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('stories', JSON.stringify(stories));
  }, [stories]);


  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const addMessageToConversation = (message: Message, recipientUid: string) => {
    if (!currentUser) return;

    const lastMessageText = {
        [MessageType.TEXT]: message.text,
        [MessageType.IMAGE]: '📷 Image',
        [MessageType.VIDEO]: '📹 Video',
        [MessageType.AUDIO]: '🎵 Audio',
        [MessageType.DOCUMENT]: '📄 Document'
    }[message.type] || '...';

    // 1. Update sender's state (current user)
    setConversations(prevConversations => {
        return prevConversations.map(convo => {
            if (convo.id === recipientUid) {
                return {
                    ...convo,
                    messages: [...convo.messages, message],
                    lastMessage: lastMessageText!,
                    lastMessageTimestamp: message.timestamp,
                };
            }
            return convo;
        });
    });
    
    // 2. Update receiver's localStorage directly to simulate message delivery
    const receiverConvoKey = `conversations_${recipientUid}`;
    const receiverConversationsJSON = localStorage.getItem(receiverConvoKey);
    let receiverConversations: Conversation[] = receiverConversationsJSON ? JSON.parse(receiverConversationsJSON) : [];

    const convoWithSender = receiverConversations.find(c => c.id === currentUser.uid);

    if (convoWithSender) {
        receiverConversations = receiverConversations.map(c => {
            if (c.id === currentUser.uid) {
                return {
                    ...c,
                    messages: [...c.messages, message],
                    lastMessage: lastMessageText!,
                    lastMessageTimestamp: message.timestamp,
                };
            }
            return c;
        });
    } else {
        const newReceiverConvo: Conversation = {
            id: currentUser.uid,
            lastMessage: lastMessageText!,
            lastMessageTimestamp: message.timestamp,
            messages: [message],
        };
        receiverConversations.push(newReceiverConvo);
    }
    
    localStorage.setItem(receiverConvoKey, JSON.stringify(receiverConversations));
  }


  const handleSendMessage = useCallback((text: string) => {
    if (!selectedConversationId || !currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderUid: currentUser.uid,
      type: MessageType.TEXT,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addMessageToConversation(newMessage, selectedConversationId);
  }, [selectedConversationId, currentUser]);

  const handleSendFile = useCallback((file: File) => {
      if (!selectedConversationId || !currentUser) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const fileUrl = e.target?.result as string;
          let type: MessageType;
          if (file.type.startsWith('image/')) type = MessageType.IMAGE;
          else if (file.type.startsWith('video/')) type = MessageType.VIDEO;
          else if (file.type.startsWith('audio/')) type = MessageType.AUDIO;
          else type = MessageType.DOCUMENT;

          const newMessage: Message = {
              id: Date.now().toString(),
              senderUid: currentUser.uid,
              type,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fileUrl,
              fileName: file.name,
              fileSize: `${(file.size / 1024).toFixed(2)} KB`
          };
          addMessageToConversation(newMessage, selectedConversationId);
      };
      reader.readAsDataURL(file);

  }, [selectedConversationId, currentUser]);


  const handleNewChat = () => {
    setAddContactError('');
    setIsAddContactModalOpen(true);
  };

  const handleCloseAddContactModal = () => {
    setIsAddContactModalOpen(false);
  };
  
  const handleAddNewContact = (uid: string, name: string) => {
    if (!currentUser) return;
    setAddContactError('');

    // --- Validation ---
    if (!uid.match(/^\d{8}$/)) {
        setAddContactError("Invalid UID. Must be 8 digits.");
        return;
    }
    if (uid === currentUser.uid) {
        setAddContactError("You cannot add yourself.");
        return;
    }
    const usersData = JSON.parse(localStorage.getItem('users_data') || '{}');
    if (!usersData[uid]) {
        setAddContactError("User with this UID does not exist.");
        return;
    }

    const contactExists = currentUser.contacts.find(c => c.uid === uid);

    if (!contactExists && !name.trim()) {
        setAddContactError("Contact name cannot be empty for a new contact.");
        return;
    }

    // --- Logic ---
    const otherUserData = usersData[uid];

    // Update current user (the one adding the contact)
    if (!contactExists) {
        const newContact: Contact = {
            uid,
            name: name.trim(),
            avatarUrl: otherUserData.avatarUrl || '',
        };
        const updatedUser = { ...currentUser, contacts: [...currentUser.contacts, newContact] };
        setCurrentUser(updatedUser);
        usersData[currentUser.uid].contacts = updatedUser.contacts;
    }
    
    // Ensure conversation exists for current user
    const conversationExists = conversations.find(c => c.id === uid);
    if (!conversationExists) {
        const newConversation: Conversation = {
            id: uid,
            lastMessage: 'Say hi to start the conversation!',
            lastMessageTimestamp: '',
            messages: [],
        };
        setConversations(prev => [...prev, newConversation]);
    }
    
    // Symmetrically update the other user's contact list
    if (otherUserData) {
        const otherUserContacts: Contact[] = otherUserData.contacts || [];
        const selfInOtherContacts = otherUserContacts.find(c => c.uid === currentUser.uid);
        if (!selfInOtherContacts) {
            otherUserContacts.push({
                uid: currentUser.uid,
                name: currentUser.name, // The other user sees the current user's real name
                avatarUrl: currentUser.avatarUrl || '',
            });
            usersData[uid].contacts = otherUserContacts;
        }
    }
    
    localStorage.setItem('users_data', JSON.stringify(usersData));
    setSelectedConversationId(uid);
    setIsAddContactModalOpen(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setConversations([]);
    setSelectedConversationId(null);
  };

  const handleUpdateAvatar = (avatarUrl: string) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, avatarUrl };
    setCurrentUser(updatedUser);

    setStories(prevStories => prevStories.map(story => {
        if (story.userId === currentUser.uid) {
            return { ...story, userAvatarUrl: avatarUrl };
        }
        return story;
    }));

    const usersData = JSON.parse(localStorage.getItem('users_data') || '{}');
    if (usersData[currentUser.uid]) {
      usersData[currentUser.uid].avatarUrl = avatarUrl;
    }

    Object.keys(usersData).forEach(uid => {
        if (uid !== currentUser.uid && usersData[uid].contacts) {
            usersData[uid].contacts = usersData[uid].contacts.map((contact: Contact) => {
                if (contact.uid === currentUser.uid) {
                    return { ...contact, avatarUrl: avatarUrl };
                }
                return contact;
            });
        }
    });

    localStorage.setItem('users_data', JSON.stringify(usersData));
  };

  const handleUpdateName = (newName: string): { success: boolean, error?: string } => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
        return { success: false, error: "Name cannot be empty." };
    }
    if (!currentUser) {
        return { success: false, error: "No user logged in." };
    }

    const usersData = JSON.parse(localStorage.getItem('users_data') || '{}');
    
    const isNameTaken = Object.entries(usersData).some(
      ([uid, user]: [string, any]) => 
        uid !== currentUser.uid && user.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isNameTaken) {
        return { success: false, error: "This name is already taken." };
    }

    const updatedUser = { ...currentUser, name: trimmedName };
    setCurrentUser(updatedUser);

    usersData[currentUser.uid].name = trimmedName;

    Object.keys(usersData).forEach(uid => {
        if (uid !== currentUser.uid && usersData[uid].contacts) {
            usersData[uid].contacts = usersData[uid].contacts.map((contact: Contact) => {
                if (contact.uid === currentUser.uid) {
                    return { ...contact, name: trimmedName };
                }
                return contact;
            });
        }
    });

    localStorage.setItem('users_data', JSON.stringify(usersData));
    
    return { success: true };
};

  const handleAddStory = (imageUrl: string) => {
    if (!currentUser) return;
    
    const currentUserStories = stories.filter(s => s.userId === currentUser.uid);
    if (currentUserStories.length >= 15) {
        alert("You can only have up to 15 active stories.");
        return;
    }

    const newStory: Story = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        userName: currentUser.name,
        userAvatarUrl: currentUser.avatarUrl,
        imageUrl,
        timestamp: Date.now()
    };
    setStories(prev => [...prev, newStory]);
  };

  const handleViewStories = (userId: string) => {
      setViewingStoriesOfUserId(userId);
  };

  const handleCloseStoryViewer = () => {
      setViewingStoriesOfUserId(null);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const activeContact = currentUser?.contacts.find(contact => contact.uid === selectedConversationId);

  if (!currentUser) {
    return <AuthScreen setCurrentUser={setCurrentUser} setConversations={setConversations} />;
  }

  return (
    <>
      {isAddContactModalOpen && (
          <AddContactModal 
              onClose={handleCloseAddContactModal} 
              onAddContact={handleAddNewContact}
              error={addContactError}
          />
      )}
      {viewingStoriesOfUserId && (
          <StoryViewer
              stories={stories.filter(s => s.userId === viewingStoriesOfUserId).sort((a,b) => a.timestamp - b.timestamp)}
              onClose={handleCloseStoryViewer}
          />
      )}
      <div className="h-screen w-screen bg-gray-200 flex items-center justify-center p-0 md:p-4 font-sans">
        <div className="h-full w-full max-w-6xl mx-auto flex rounded-none md:rounded-lg shadow-none md:shadow-2xl overflow-hidden bg-white">
          <div className={`${selectedConversationId && 'hidden md:flex'} w-full md:w-1/3 md:flex-col`}>
              <Sidebar
                  conversations={conversations}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                  onLogout={handleLogout}
                  currentUser={currentUser}
                  onUpdateAvatar={handleUpdateAvatar}
                  onUpdateName={handleUpdateName}
                  stories={stories}
                  onAddStory={handleAddStory}
                  onViewStories={handleViewStories}
              />
          </div>
          <div className={`${!selectedConversationId && 'hidden md:flex'} w-full md:w-2/3 md:flex-col`}>
              <ChatWindow
                  conversation={selectedConversation}
                  contact={activeContact}
                  onSendMessage={handleSendMessage}
                  onSendFile={handleSendFile}
                  currentUser={currentUser}
                  onBack={() => setSelectedConversationId(null)}
              />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;