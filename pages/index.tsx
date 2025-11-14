import React from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading text-ink-900 mb-4">
            Welcome to Pathfinder Party Manager
          </h1>
          <p className="text-xl text-ink-700 font-body">
            Manage your Pathfinder campaigns, characters, and adventures in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h2 className="text-2xl font-heading text-ink-900 mb-3">For Game Masters</h2>
            <p className="text-ink-700 font-body mb-4">
              Create campaigns, invite players, and manage all character sheets with full oversight and real-time updates.
            </p>
            <Link href="/campaigns/create">
              <Button variant="primary">Create Campaign</Button>
            </Link>
          </div>

          <div className="card">
            <h2 className="text-2xl font-heading text-ink-900 mb-3">For Players</h2>
            <p className="text-ink-700 font-body mb-4">
              Join campaigns via invitation link, create your character, and track your progress through epic adventures.
            </p>
            <Link href="/characters/create">
              <Button variant="secondary">Create Character</Button>
            </Link>
          </div>
        </div>

        <div className="card bg-gold-50 border-gold-300">
          <h3 className="text-xl font-heading text-ink-900 mb-3">✨ Features</h3>
          <ul className="space-y-2 text-ink-700 font-body">
            <li>• Real-time character sheet synchronization</li>
            <li>• Automatic ability modifier calculations</li>
            <li>• GM oversight with full party management</li>
            <li>• Privacy controls (players can't see each other's sheets)</li>
            <li>• Beautiful D&D-inspired design</li>
            <li>• Mobile, tablet, and desktop compatible</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-ink-600 font-body">
            Foundation Phase Complete • Ready for User Story Implementation
          </p>
        </div>
      </div>
    </Layout>
  );
}
