
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-black text-purple-600">Task Sparkle ✨</h1>
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-700">Olá, {user?.nome}!</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-transform duration-200 hover:scale-105"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
