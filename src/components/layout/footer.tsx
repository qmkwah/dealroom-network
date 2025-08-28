import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} DealRoom Network. All rights reserved.
      </div>
    </footer>
  );
}