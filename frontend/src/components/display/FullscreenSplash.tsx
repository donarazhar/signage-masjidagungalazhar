import { useState, useEffect, useCallback } from "react";

interface FullscreenSplashProps {
  mosqueName?: string;
  onEnterFullscreen?: () => void;
}

export default function FullscreenSplash({
  mosqueName = "Signage Masjid",
  onEnterFullscreen,
}: FullscreenSplashProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showButton, setShowButton] = useState(true);

  // Check fullscreen status
  const checkFullscreen = useCallback(() => {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }, []);

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    const elem = document.documentElement;

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        // Safari/older Chrome
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        // Firefox
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        // IE/Edge
        await (elem as any).msRequestFullscreen();
      }

      setIsVisible(false);
      onEnterFullscreen?.();
    } catch (err) {
      console.log("Fullscreen request failed, continuing anyway:", err);
      // Even if fullscreen fails, hide splash and continue
      setIsVisible(false);
      onEnterFullscreen?.();
    }
  }, [onEnterFullscreen]);

  // Skip fullscreen (for browsers that don't support it)
  const skipFullscreen = useCallback(() => {
    setIsVisible(false);
    onEnterFullscreen?.();
  }, [onEnterFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = checkFullscreen();
      if (isFS) {
        setIsVisible(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Initial check
    if (checkFullscreen()) {
      setIsVisible(false);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, [checkFullscreen]);

  // Auto-hide button text after a few seconds on Smart TVs
  // (some may need OK button on remote to click)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true); // Keep showing
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Mosque Icon */}
        <div style={styles.iconWrapper}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Dome */}
            <path
              d="M50 10C35 10 25 25 25 35H75C75 25 65 10 50 10Z"
              fill="#10b981"
            />
            {/* Crescent */}
            <circle cx="50" cy="8" r="4" fill="#fbbf24" />
            {/* Main building */}
            <rect x="20" y="35" width="60" height="45" fill="#10b981" />
            {/* Door */}
            <path
              d="M40 80V55C40 50 45 45 50 45C55 45 60 50 60 55V80H40Z"
              fill="#0f172a"
            />
            {/* Windows */}
            <circle cx="32" cy="55" r="5" fill="#fbbf24" opacity="0.8" />
            <circle cx="68" cy="55" r="5" fill="#fbbf24" opacity="0.8" />
            {/* Minarets */}
            <rect x="10" y="30" width="10" height="50" fill="#10b981" />
            <path d="M10 30L15 20L20 30H10Z" fill="#10b981" />
            <rect x="80" y="30" width="10" height="50" fill="#10b981" />
            <path d="M80 30L85 20L90 30H80Z" fill="#10b981" />
            {/* Base */}
            <rect x="5" y="80" width="90" height="10" rx="2" fill="#10b981" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={styles.title}>{mosqueName}</h1>
        <p style={styles.subtitle}>Sistem Informasi Digital Masjid</p>

        {/* Main Fullscreen Button - Large for Remote Control */}
        {showButton && (
          <button
            onClick={requestFullscreen}
            style={styles.mainButton}
            autoFocus
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "12px" }}
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            MASUK FULLSCREEN
          </button>
        )}

        {/* Skip Button - For TVs that don't support fullscreen */}
        <button onClick={skipFullscreen} style={styles.skipButton}>
          Lewati (Tanpa Fullscreen) →
        </button>

        {/* Instructions */}
        <div style={styles.instructions}>
          <p style={styles.instructionText}>
            📺 Tekan <strong>OK</strong> pada remote untuk memilih tombol
          </p>
          <p style={styles.instructionSubtext}>
            Gunakan tombol arah untuk navigasi
          </p>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div style={styles.bgPattern}></div>
    </div>
  );
}

// Styles object for the component
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    overflow: "hidden",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
    position: "relative",
    zIndex: 2,
  },
  iconWrapper: {
    marginBottom: "2rem",
    animation: "pulse 2s ease-in-out infinite",
  },
  title: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
    textShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  subtitle: {
    fontSize: "1.25rem",
    color: "#94a3b8",
    margin: "0 0 3rem 0",
  },
  mainButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem 3rem",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#ffffff",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "4px solid #34d399",
    borderRadius: "16px",
    cursor: "pointer",
    boxShadow:
      "0 8px 32px rgba(16, 185, 129, 0.4), 0 0 0 0 rgba(16, 185, 129, 0.5)",
    transition: "all 0.3s ease",
    marginBottom: "1.5rem",
    minWidth: "400px",
    outline: "none",
  },
  skipButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    color: "#94a3b8",
    background: "transparent",
    border: "2px solid #475569",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "3rem",
  },
  instructions: {
    padding: "1.5rem 2rem",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  instructionText: {
    fontSize: "1.1rem",
    color: "#e2e8f0",
    margin: "0 0 0.5rem 0",
  },
  instructionSubtext: {
    fontSize: "0.9rem",
    color: "#64748b",
    margin: 0,
  },
  bgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(251, 191, 36, 0.08) 0%, transparent 40%)
    `,
    zIndex: 1,
  },
};

// Add CSS keyframes for pulse animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }
  
  button:focus {
    outline: 4px solid #fbbf24 !important;
    outline-offset: 4px;
    transform: scale(1.02);
  }
  
  button:hover {
    transform: scale(1.02);
  }
`;
document.head.appendChild(styleSheet);
