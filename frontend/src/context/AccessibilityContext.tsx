import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontScale: number; // 0.9, 1, 1.15, 1.3
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  isSpeaking: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  readAloudEnabled: boolean;
  setReadAloudEnabled: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('acesso_high_contrast') === 'true';
  });

  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem('acesso_font_scale');
    return saved ? parseFloat(saved) : 1;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readAloudEnabled, setReadAloudEnabled] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('acesso_high_contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${fontScale * 16}px`);
    localStorage.setItem('acesso_font_scale', fontScale.toString());
  }, [fontScale]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  const increaseFont = () => {
    setFontScale((prev) => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10));
  };

  const decreaseFont = () => {
    setFontScale((prev) => Math.max(0.9, Math.round((prev - 0.1) * 10) / 10));
  };

  const resetFont = () => setFontScale(1);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta síntese de voz nativa.');
      return;
    }
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontScale,
        increaseFont,
        decreaseFont,
        resetFont,
        isSpeaking,
        speakText,
        stopSpeaking,
        readAloudEnabled,
        setReadAloudEnabled,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider');
  }
  return context;
};
