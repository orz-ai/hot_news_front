'use client';

import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import SettingsModal from './SettingsModal';
import { useSettings } from '../hooks/useSettings';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, saveSettings } = useSettings();

  return (
    <>
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {children}
      </main>
      <Footer />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={saveSettings}
      />
    </>
  );
}