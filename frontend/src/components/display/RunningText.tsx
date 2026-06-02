import { useEffect, useRef, useState } from "react";
import type { RunningText as RunningTextType } from "../../types";

interface RunningTextProps {
  texts: RunningTextType[];
  speed: number;
  mosqueName?: string;
  accentColor?: string;
  textColor?: string;
}

export default function RunningText({
  texts,
  speed,
  mosqueName,
  textColor,
}: RunningTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(30);

  useEffect(() => {
    if (contentRef.current && containerRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      const totalDistance = contentWidth + containerWidth;
      const duration = totalDistance / speed;
      setAnimationDuration(Math.max(duration, 20));
    }
  }, [texts, speed]);

  const defaultMessages = [
    `🕌 MATIKAN ATAU DISETTING MODE SILENT`,
    `📵 Harap non-aktifkan ponsel selama shalat`,
    `🤲 Dukung Program ${mosqueName || "Masjid Agung Al Azhar"}`,
  ];

  const displayTexts =
    texts.length > 0
      ? texts
      : defaultMessages.map((content, id) => ({
          id,
          content,
          type: "normal" as const,
          priority: 0,
          is_enabled: true,
          start_date: null,
          end_date: null,
          show_on_days: null,
          created_by: 0,
          created_at: "",
          updated_at: "",
        }));

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div
        ref={contentRef}
        className="ticker-content running-text"
        style={{ animationDuration: `${animationDuration}s`, color: textColor }}
      >
        {displayTexts.map((text, idx) => (
          <span key={`${text.id}-${idx}`} className="ticker-item">
            <span className="text-yellow-300">★</span>
            {text.content}
          </span>
        ))}
        {displayTexts.map((text, idx) => (
          <span key={`dup-${text.id}-${idx}`} className="ticker-item">
            <span className="text-yellow-300">★</span>
            {text.content}
          </span>
        ))}
      </div>
    </div>
  );
}
