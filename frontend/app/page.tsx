'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const FirstGate = dynamic(() => import('@/components/FirstGate'), { ssr: false });
const IdentityChamber = dynamic(() => import('@/components/IdentityChamber'), { ssr: false });
const LocationChamber = dynamic(() => import('@/components/LocationChamber'), { ssr: false });
const CounterRoom = dynamic(() => import('@/components/CounterRoom'), { ssr: false });

type Chamber = 'gate' | 'identity' | 'location' | 'counter';

export default function Home() {
  const [currentChamber, setCurrentChamber] = useState<Chamber>('gate');
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');

  const handleGateEnter = () => {
    setCurrentChamber('identity');
  };

  const handleIdentityComplete = (name: string) => {
    setUserName(name);
    setCurrentChamber('location');
  };

  const handleLocationComplete = (location: string) => {
    setUserLocation(location);
    setCurrentChamber('counter');
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {currentChamber === 'gate' && (
          <FirstGate key="gate" onEnter={handleGateEnter} />
        )}

        {currentChamber === 'identity' && (
          <IdentityChamber key="identity" onComplete={handleIdentityComplete} />
        )}

        {currentChamber === 'location' && (
          <LocationChamber
            key="location"
            userName={userName}
            onComplete={handleLocationComplete}
          />
        )}

        {currentChamber === 'counter' && (
          <CounterRoom
            key="counter"
            userName={userName}
            userLocation={userLocation}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
