import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Header() {
  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">DealRoom Network</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* Add navigation links here later */}
        </div>
      </div>
    </header>
  );
}