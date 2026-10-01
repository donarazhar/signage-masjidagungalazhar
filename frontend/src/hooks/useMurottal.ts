import { useEffect, useRef, useCallback } from "react";

interface MurottalConfig {
  enabled: boolean;
  server: string;
  startSurahId: number;
  surahList: number[]; // ordered list of surah IDs available
}

/**
 * Hook untuk memutar murottal saat mode normal.
 * Otomatis berhenti saat mode bukan 'normal', resume saat kembali ke normal.
 */
export function useMurottal(config: MurottalConfig | null, isNormalMode: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSurahRef = useRef<number>(config?.startSurahId ?? 0);
  const isPlayingRef = useRef(false);

  const getAudioUrl = useCallback((server: string, surahId: number) => {
    return `${server}${String(surahId).padStart(3, "0")}.mp3`;
  }, []);

  const playNext = useCallback(() => {
    if (!config || !audioRef.current) return;
    const { server, surahList } = config;
    if (surahList.length === 0) return;

    const currentIdx = surahList.indexOf(currentSurahRef.current);
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % surahList.length;
    currentSurahRef.current = surahList[nextIdx];

    audioRef.current.src = getAudioUrl(server, currentSurahRef.current);
    audioRef.current.play().catch(() => {
      // Autoplay blocked — will retry on next user interaction
    });
  }, [config, getAudioUrl]);

  // Setup audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.8;
      audioRef.current.onended = () => playNext();
    }
    return () => {
      audioRef.current?.pause();
    };
  }, []); // eslint-disable-line

  // Update onended when playNext changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => playNext();
    }
  }, [playNext]);

  // Play/stop based on mode and config
  useEffect(() => {
    if (!audioRef.current || !config) return;

    if (isNormalMode && config.enabled) {
      if (!isPlayingRef.current) {
        const { server, startSurahId, surahList } = config;
        // Resume from current surah or start fresh
        if (!audioRef.current.src || audioRef.current.src === window.location.href) {
          currentSurahRef.current = startSurahId;
          audioRef.current.src = getAudioUrl(server, startSurahId);
        }
        // Make sure surahList is set for proper looping
        if (!surahList.includes(currentSurahRef.current)) {
          currentSurahRef.current = surahList[0] ?? startSurahId;
          audioRef.current.src = getAudioUrl(server, currentSurahRef.current);
        }
        audioRef.current.play().catch(() => {});
        isPlayingRef.current = true;
      }
    } else {
      // Stop murottal when not in normal mode (adzan / iqamah / prayer)
      if (isPlayingRef.current || !audioRef.current.paused) {
        audioRef.current.pause();
        isPlayingRef.current = false;
      }
    }
  }, [isNormalMode, config, getAudioUrl]);
}
