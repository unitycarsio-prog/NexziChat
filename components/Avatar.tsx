import React from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name }) => {
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xl">
      <span>{getInitials(name)}</span>
    </div>
  );
};