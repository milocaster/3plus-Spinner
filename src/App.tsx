import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './App.css';
import SpinnerWheel from './components/SpinnerWheel';
import PrizeModal from './components/PrizeModal';
import RatesModal from './components/RatesModal';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import AudioControls from './components/AudioControls';
import { getRandomPrize, defaultPrizes, type Prize } from './utils/probabilities';
import { initAudio, playWinSound } from './utils/audio';
import { addSpinToHistory, getPrizes, savePrizes } from './utils/storage';

function App() {
  const [prizes, setPrizes] = useState<Prize[]>(() => getPrizes(defaultPrizes));
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [targetPrize, setTargetPrize] = useState<Prize | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Initialize audio on any user interaction with the document if not already done
  useEffect(() => {
    const handleInteraction = () => initAudio();
    document.addEventListener('click', handleInteraction, { once: true });
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const handleSpinClick = useCallback(() => {
    if (isSpinning) return;
    
    // Initialize audio context on first user interaction
    initAudio();
    
    // Determine the prize beforehand based on weighted probability
    const prize = getRandomPrize(prizes);
    if (!prize) {
      alert("All prizes are out of stock!");
      return;
    }
    setTargetPrize(prize);
    
    // Deduct inventory
    if (prize.quantity > 0) {
      const updatedPrizes = prizes.map(p => 
        p.id === prize.id ? { ...p, quantity: p.quantity - 1 } : p
      );
      setPrizes(updatedPrizes);
      savePrizes(updatedPrizes);
    }
    
    // Trigger spin
    setIsSpinning(true);
    setSpinTrigger(prev => prev + 1);
  }, [isSpinning]);

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    setIsModalOpen(true);
    
    if (targetPrize) {
      addSpinToHistory(targetPrize); // Save to localStorage
      playWinSound(targetPrize.tier);
    }
    
    // Trigger confetti if it's a high tier prize
    if (targetPrize && ['SR', 'SSR', 'UR'].includes(targetPrize.tier)) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [targetPrize.color, '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [targetPrize.color, '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [targetPrize]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTargetPrize(null);
  };

  return (
    <div className="app-container">
      <AudioControls />
      <header className="header">
        <div className="title-led-wrapper">
          <h1 className="title">3plus Spinner</h1>
        </div>
        <p className="subtitle">• Premium Rewards •</p>
      </header>

      <main className="spinner-section">
        <SpinnerWheel 
          activePrizes={prizes.filter(p => p.quantity !== 0)}
          spinTrigger={spinTrigger} 
          targetPrize={targetPrize}
          isSpinning={isSpinning}
          onSpinComplete={handleSpinComplete} 
        />
        
        <button 
          className="spin-btn" 
          onClick={handleSpinClick}
          disabled={isSpinning}
        >
          {isSpinning ? 'Spinning...' : 'SPIN NOW'}
        </button>

        <div className="action-buttons">
          <button className="secondary-btn" onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Settings
          </button>
          <button className="secondary-btn" onClick={() => setIsRatesOpen(true)}>
            Drop Rates
          </button>
          <button className="secondary-btn" onClick={() => setIsHistoryOpen(true)}>
            Spin History
          </button>
        </div>
      </main>

      <PrizeModal 
        isOpen={isModalOpen} 
        prize={targetPrize} 
        onClose={handleCloseModal} 
      />
      <RatesModal 
        isOpen={isRatesOpen} 
        prizes={prizes}
        onClose={() => setIsRatesOpen(false)} 
      />
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        currentPrizes={prizes}
        onSave={(newPrizes) => {
          setPrizes(newPrizes);
          savePrizes(newPrizes);
          setIsSettingsOpen(false);
        }}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
