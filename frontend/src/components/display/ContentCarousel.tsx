import { useState, useEffect, useRef } from "react";
import type { Content } from "../../types";

interface ContentCarouselProps {
  contents: Content[];
  duration: number;
  mosqueName?: string;
  templateColors?: {
    accent: string;
    headerBg: string;
    headerText: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export default function ContentCarousel({
  contents,
  duration,
  mosqueName,
  templateColors,
}: ContentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Default colors if not provided
  const colors = templateColors || {
    accent: "#22c55e",
    headerBg: "#166534",
    headerText: "#ffffff",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
  };

  useEffect(() => {
    if (contents.length === 0) return;
    const currentContent = contents[currentIndex];
    const slideDuration = currentContent?.duration || duration;
    const timer = setTimeout(
      () => setCurrentIndex((prev) => (prev + 1) % contents.length),
      slideDuration * 1000,
    );
    return () => clearTimeout(timer);
  }, [currentIndex, contents, duration]);

  if (contents.length === 0) {
    return (
      <div className="carousel-placeholder">
        {/* SVG Mosque Icon */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: "1.5rem" }}
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="48" fill={colors.accent} opacity="0.15" />
          <circle cx="50" cy="50" r="40" fill={colors.accent} opacity="0.3" />
          {/* Dome */}
          <path
            d="M50 22C38 22 30 32 30 40H70C70 32 62 22 50 22Z"
            fill={colors.accent}
          />
          {/* Crescent on top */}
          <circle cx="50" cy="20" r="3" fill={colors.accent} />
          {/* Main building */}
          <rect x="28" y="40" width="44" height="32" fill={colors.accent} />
          {/* Door */}
          <path
            d="M42 72V56C42 52 46 48 50 48C54 48 58 52 58 56V72H42Z"
            fill="white"
          />
          {/* Windows */}
          <circle cx="36" cy="52" r="4" fill="white" opacity="0.9" />
          <circle cx="64" cy="52" r="4" fill="white" opacity="0.9" />
          {/* Left minaret */}
          <rect x="18" y="38" width="8" height="34" fill={colors.accent} />
          <path d="M18 38L22 30L26 38H18Z" fill={colors.accent} />
          {/* Right minaret */}
          <rect x="74" y="38" width="8" height="34" fill={colors.accent} />
          <path d="M74 38L78 30L82 38H74Z" fill={colors.accent} />
          {/* Base */}
          <rect
            x="15"
            y="72"
            width="70"
            height="6"
            rx="2"
            fill={colors.accent}
          />
        </svg>
        <h2 style={{ color: "#1e293b" }}>
          {mosqueName || "Digital Signage Masjid"}
        </h2>
        <p style={{ color: "#475569" }}>Sistem Informasi Digital Masjid</p>
        <div
          className="welcome"
          style={{
            background: colors.accent,
            color: "white",
          }}
        >
          ✨ Selamat Datang di Rumah Allah ✨
        </div>
      </div>
    );
  }


  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0f172a",
      }}
    >
      {contents.map((content, index) => (
        <div
          key={content.id}
          style={{
            position: "absolute",
            inset: 0,
            transition: "opacity 0.7s ease-in-out",
            opacity: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? "auto" : "none",
          }}
        >
          {content.type === "youtube" ? (
            // YouTube Embed
            <iframe
              ref={index === currentIndex ? iframeRef : undefined}
              src={
                index === currentIndex && content.youtube_embed_url
                  ? content.youtube_embed_url
                  : undefined
              }
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Image - full fit
            <img
              src={content.file_url || `/storage/${content.file_path}`}
              alt={content.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      ))}

      {/* Progress Dots */}
      {contents.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.5rem",
            zIndex: 10,
          }}
        >
          {contents.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentIndex ? "2rem" : "0.5rem",
                height: "0.5rem",
                borderRadius: "100px",
                background:
                  idx === currentIndex
                    ? colors.accent
                    : "rgba(255,255,255,0.5)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}
