import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-leather-700 text-parchment-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-heading font-bold text-gold-400">
            Pathfinder Party Manager
          </Link>

          <nav className="flex gap-6">
            <Link href="/campaigns" className="hover:text-gold-400 transition-colors">
              Campaigns
            </Link>
            <Link href="/characters" className="hover:text-gold-400 transition-colors">
              Characters
            </Link>
            <Link href="/profile" className="hover:text-gold-400 transition-colors">
              Profile
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
