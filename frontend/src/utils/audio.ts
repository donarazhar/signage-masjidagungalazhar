export function playAlarmSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    
    const playDigitalBeep = (timeOffset: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // 'square' wave gives that harsh electronic digital clock sound
      oscillator.type = 'square';
      oscillator.frequency.value = 880; // A5 pitch, common for alarms

      // Attack and release to prevent clicking, but keep it sharp
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + timeOffset);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + timeOffset + 0.01);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + timeOffset + 0.1 - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + timeOffset + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime + timeOffset);
      oscillator.stop(audioCtx.currentTime + timeOffset + 0.1);
    };

    // Helper to play a cluster of 4 rapid beeps (takes ~0.55 seconds)
    const playBeepCluster = (startOffset: number) => {
      playDigitalBeep(startOffset);
      playDigitalBeep(startOffset + 0.15);
      playDigitalBeep(startOffset + 0.30);
      playDigitalBeep(startOffset + 0.45);
    };

    // Helper to play 1 cycle (e.g. 4 clusters over 4 seconds)
    const playCycle = (startOffset: number) => {
      playBeepCluster(startOffset);
      playBeepCluster(startOffset + 1.0);
      playBeepCluster(startOffset + 2.0);
      playBeepCluster(startOffset + 3.0);
    };

    // Play 3 panjang siklus, dengan jeda 2 detik tiap siklusnya
    // Siklus 1: 0 - 4 detik
    playCycle(0);
    // Siklus 2: 6 - 10 detik
    playCycle(6.0);
    // Siklus 3: 12 - 16 detik
    playCycle(12.0);
    
  } catch (e) {
    console.error("Audio API error", e);
  }
}
