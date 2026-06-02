import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { displayService } from "../../services/displayService";
import { Quote } from "lucide-react";

const ROTATION_INTERVAL = 15000; // 15 seconds

interface HadithWidgetProps {
  textColor?: string;
  accentColor?: string;
}

export default function HadithWidget({ textColor = "white", accentColor = "#fbbf24" }: HadithWidgetProps = {}) {
  const { mosqueSlug } = useParams<{ mosqueSlug?: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Check if in preview mode
  const isPreviewMode =
    new URLSearchParams(window.location.search).get("preview") === "true";

  const { data: hadiths } = useQuery({
    queryKey: ["activeHadiths", mosqueSlug],
    queryFn: () => displayService.getActiveHadiths(mosqueSlug),
    refetchInterval: 1000 * 60 * 5, // Refresh from API every 5 minutes
    enabled: !isPreviewMode,
  });

  // Rotation effect
  useEffect(() => {
    if (!hadiths || hadiths.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      setTimeout(() => {
        // Change index
        setCurrentIndex((prev) => (prev + 1) % hadiths.length);
        // Fade in
        setIsVisible(true);
      }, 500); // Wait for fade out animation
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [hadiths]);

  // Default Quote if none active
  const currentHadith = hadiths?.[currentIndex];
  const content =
    currentHadith?.content ||
    "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.";
  const source = currentHadith?.source || "HR. Ahmad, Thabrani, Daruqutni";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        maxWidth: "800px",
        border: "1px solid rgba(255,255,255,0.15)",
        transition: "opacity 0.5s ease-in-out",
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.15)",
          borderRadius: "12px",
          padding: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Quote size={24} style={{ color: accentColor }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: textColor,
            lineHeight: "1.3",
            marginBottom: "0.25rem",
            fontWeight: 500,
          }}
        >
          "{content}"
        </p>
        <p
          style={{
            color: accentColor,
            fontWeight: 700,
            fontSize: "0.8rem",
          }}
        >
          — {source}
        </p>
      </div>
    </div>
  );
}
