let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSound = (type: 'success' | 'uncheck' | 'pop' | 'magic' | 'epic_magic' | 'tick' | 'nav') => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  const t = ctx.currentTime;
  
  if (type === 'success') {
    // Duolingo style "ding ding" (high pitched and cheerful)
    osc.type = 'sine';
    
    // First note
    osc.frequency.setValueAtTime(523.25, t); // C5
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    
    // Second higher note
    osc.frequency.setValueAtTime(659.25, t + 0.15); // E5
    gainNode.gain.setValueAtTime(0, t + 0.15);
    gainNode.gain.linearRampToValueAtTime(0.3, t + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    osc.start(t);
    osc.stop(t + 0.5);
  } else if (type === 'uncheck') {
    // Low pop for unchecking
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === 'pop') {
    // Quick subtle pop for generic actions
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
    
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === 'magic') {
    // Sparkly chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.2);
    
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    
    osc.start(t);
    osc.stop(t + 0.4);
  } else if (type === 'epic_magic') {
    // Epic orchestral hit (chord with arpeggio)
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25]; // C Major chord spanning octaves
    
    freqs.forEach((freq, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = i === freqs.length - 1 ? 'sine' : 'triangle';
      o.frequency.setValueAtTime(freq, t);
      
      const noteTime = t + (i * 0.04);
      g.gain.setValueAtTime(0, t);
      g.gain.setValueAtTime(0, noteTime);
      g.gain.linearRampToValueAtTime(0.2, noteTime + 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, noteTime + 1.2);
      
      o.connect(g);
      g.connect(ctx!.destination);
      o.start(noteTime);
      o.stop(noteTime + 1.2);
    });
    
    // Low bass impact
    const bass = ctx!.createOscillator();
    const bassGain = ctx!.createGain();
    bass.type = 'square';
    bass.frequency.setValueAtTime(65.41, t); // C2
    bass.frequency.exponentialRampToValueAtTime(32.70, t + 0.6); // Drop to C1
    
    bassGain.gain.setValueAtTime(0, t);
    bassGain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);
    
    bass.connect(bassGain);
    bassGain.connect(ctx!.destination);
    bass.start(t);
    bass.stop(t + 1.2);
    
    gainNode.gain.setValueAtTime(0, t);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === 'tick') {
    // Very subtle, short tick for loading states
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, t); // very quiet
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.start(t);
    osc.stop(t + 0.05);
  } else if (type === 'nav') {
    // Soft click for navigation
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
    
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    osc.start(t);
    osc.stop(t + 0.05);
  }
};

let loadingInterval: any = null;

export const startLoadingSound = () => {
  if (typeof window === 'undefined') return;
  if (loadingInterval) return;
  
  playSound('tick');
  loadingInterval = setInterval(() => {
    playSound('tick');
  }, 400);
};

export const stopLoadingSound = () => {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
};
