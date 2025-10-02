import React, { useState } from 'react';
import { User, Conversation, Contact } from '../types';

interface AuthScreenProps {
  setCurrentUser: (user: User) => void;
  setConversations: (conversations: Conversation[]) => void;
}

const generateUid = (): string => {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomNumber = randomBuffer[0] / (0xFFFFFFFF + 1);
    return (Math.floor(randomNumber * 90000000) + 10000000).toString();
}


export const AuthScreen: React.FC<AuthScreenProps> = ({ setCurrentUser, setConversations }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[uid] && users[uid] === password) {
      const usersData = JSON.parse(localStorage.getItem('users_data') || '{}');
      const userData = usersData[uid];

      if (!userData) {
          setError('Could not find user data. Please try signing up again.');
          return;
      }
      
      const user: User = { 
        uid, 
        name: userData.name, 
        avatarUrl: userData.avatarUrl,
        contacts: userData.contacts || []
      };
      const userConversations = localStorage.getItem(`conversations_${uid}`);
      
      setCurrentUser(user);
      setConversations(userConversations ? JSON.parse(userConversations) : []);
      localStorage.setItem('currentUser', JSON.stringify(user));

    } else {
      setError('Invalid UID or password.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (!trimmedName) {
        setError('Please enter your name.');
        return;
    }
    setError('');
    
    // Check for unique username
    const usersData = JSON.parse(localStorage.getItem('users_data') || '{}');
    const isNameTaken = Object.values(usersData).some(
      (user: any) => user.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isNameTaken) {
        setError('This name is already taken. Please choose another one.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    let newUid: string;
    do {
      newUid = generateUid();
    } while (users[newUid]);

    users[newUid] = password;
    localStorage.setItem('users', JSON.stringify(users));
    
    usersData[newUid] = { name: trimmedName, avatarUrl: '', contacts: [] };
    localStorage.setItem('users_data', JSON.stringify(usersData));

    alert(`Your new UID is: ${newUid}. Please save it!`);
    
    const user: User = { uid: newUid, name: trimmedName, contacts: [] };
    setCurrentUser(user);
    setConversations([]);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-sky-600 mb-2">NexziChat</h1>
        <p className="text-center text-gray-500 mb-8">{isLoginView ? 'Welcome back!' : 'Create your account'}</p>

        <form onSubmit={isLoginView ? handleLogin : handleSignUp}>
          {isLoginView ? (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="uid">
                8-Digit UID
              </label>
              <input
                id="uid"
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Enter your UID"
                className="w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-sky-500 text-white rounded-lg py-3 font-semibold hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {isLoginView ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
            className="text-sky-500 hover:underline font-semibold ml-1"
          >
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};