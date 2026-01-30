import { useState, useEffect } from "react";
import ContentCarousel from "../ContentCarousel";
import RunningText from "../RunningText";
import DonationWidget from "../DonationWidget";
import HadithWidget from "../HadithWidget";
import type { DisplayTemplate } from "../../../styles/displayTemplates";
import type {
  Settings,
  Content,
  Event,
  RunningText as RunningTextType,
} from "../../../types";

interface LayoutCinematicProps {
  settings: Settings | undefined;
  template: DisplayTemplate;
  mosqueName: string;
  mosqueAddress: string;
  hours: string;
  minutes: string;
  seconds: string;
  gregorianDate: string;
  hijriDate: string;
  nextPrayer: {
    key: string;
    name: string;
    time: string;
    minutesLeft: number;
  } | null;
  formatCountdown: (minutes: number) => string;
  contents: Content[];
  events: Event[];
  runningTexts: RunningTextType[];
  prayerDisplay: Array<{ key: string; name: string; showIqamah?: boolean }>;
  getPrayerTime: (key: string) => string;
  timezone?: string;
}

export default function LayoutCinematic({
  settings,
  template,
  mosqueName,
  mosqueAddress,
  hours,
  minutes,
  seconds,
  gregorianDate,
  hijriDate,
  nextPrayer,
  formatCountdown,
  contents,
  events,
  runningTexts,
  prayerDisplay,
  getPrayerTime,
  timezone,
}: LayoutCinematicProps) {
  // Event rotation state
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isEventVisible, setIsEventVisible] = useState(true);

  // Rotate events every 15 seconds
  useEffect(() => {
    if (!events || events.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      setIsEventVisible(false);

      setTimeout(() => {
        // Change to next event
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
        // Fade in
        setIsEventVisible(true);
      }, 500);
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [events]);

  // Get current event
  const currentEvent =
    events && events.length > 0 ? events[currentEventIndex] : null;

  return (
    <div
      className="display-container layout-cinematic"
      style={{
        background: template.colors.bodyBg,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* Full Screen Carousel Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <ContentCarousel
          contents={contents || []}
          duration={settings?.carousel_duration || 10}
          mosqueName={mosqueName}
          templateColors={{
            accent: template.colors.accent,
            headerBg: template.colors.headerBg,
            headerText: template.colors.headerText,
            textPrimary: template.colors.textPrimary,
            textSecondary: template.colors.textSecondary,
          }}
        />
      </div>

      {/* Overlay Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%), linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Main Layout */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          padding: "1.5rem",
          gap: "1.5rem",
        }}
      >
        {/* Left Side - Logo, Clock, Countdown, Hadith, Donation */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Top Row - Logo & Hadith */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
            }}
          >
            {/* Logo & Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(20px)",
                padding: "1rem 1.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {settings?.mosque_logo ? (
                <img
                  src={settings.mosque_logo}
                  alt="Logo"
                  style={{ height: "70px", width: "auto" }}
                />
              ) : (
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: template.colors.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                  }}
                >
                  🕌
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {mosqueName}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.7)",
                    maxWidth: "180px",
                    lineHeight: 1.3,
                  }}
                >
                  {mosqueAddress}
                </div>
              </div>
            </div>

            {/* Hadith Widget - aligned to right */}
            <div
              style={{
                width: "420px",
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(20px)",
                padding: "0.75rem 1rem",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <HadithWidget />
            </div>
          </div>

          {/* Middle - Clock & Countdown */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Clock */}
              <div
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(20px)",
                  padding: "1.5rem 2rem",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  {hours}
                  <span style={{ color: template.colors.accent }}>:</span>
                  {minutes}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    color: template.colors.textSecondary,
                  }}
                >
                  :{seconds}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "0.5rem",
                  }}
                >
                  {timezone || "WIB"}
                </div>
              </div>

              {/* Countdown */}
              {nextPrayer && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(20px)",
                    padding: "1rem 1.5rem",
                    borderRadius: "16px",
                    border: `1px solid ${template.colors.accent}40`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: template.colors.textSecondary,
                      marginBottom: "0.25rem",
                    }}
                  >
                    Menuju {nextPrayer.name}
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: template.colors.accent,
                    }}
                  >
                    {formatCountdown(nextPrayer.minutesLeft)}
                  </div>
                </div>
              )}

              {/* Donation Widget */}
              <div
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  overflow: "hidden",
                  maxWidth: "220px",
                }}
              >
                <DonationWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Date, Prayer Times & Events */}
        <div
          style={{
            width: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Date & Prayer Times Card */}
          <div
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Date Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}
              >
                {gregorianDate}
              </div>
              <div
                style={{
                  color: template.colors.accent,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  marginTop: 4,
                }}
              >
                {hijriDate}
              </div>
            </div>

            {/* Prayer Times */}
            <div style={{ padding: "0.75rem" }}>
              {prayerDisplay.map((p) => (
                <div
                  key={p.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    marginBottom: "0.25rem",
                    borderRadius: "8px",
                    background:
                      nextPrayer?.key === p.key
                        ? `${template.colors.accent}30`
                        : "transparent",
                    color:
                      nextPrayer?.key === p.key
                        ? template.colors.accent
                        : "white",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    {getPrayerTime(p.key)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Events Card - Custom inline display for Cinematic */}
          <div
            style={{
              flex: 1,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
              padding: "1rem",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  padding: "0.35rem",
                  background: "rgba(16, 185, 129, 0.2)",
                  borderRadius: "6px",
                  color: "#10b981",
                }}
              >
                📅
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  Agenda Kegiatan
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {mosqueName}
                </div>
              </div>
            </div>

            {/* Event Content - Show 1 event with full details, rotating */}
            {currentEvent ? (
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  transition: "opacity 0.5s ease-in-out",
                  opacity: isEventVisible ? 1 : 0,
                }}
              >
                {/* Date Badge */}
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    borderRadius: "10px",
                    padding: "0.5rem 0.75rem",
                    textAlign: "center",
                    minWidth: "50px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#10b981",
                    }}
                  >
                    {new Date(currentEvent.event_date).getDate()}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "#10b981",
                      textTransform: "uppercase",
                    }}
                  >
                    {new Date(currentEvent.event_date).toLocaleDateString(
                      "id-ID",
                      { month: "short" },
                    )}
                  </div>
                </div>

                {/* Event Details */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "white",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {currentEvent.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {currentEvent.event_time && (
                      <span>
                        🕐 {currentEvent.event_time.substring(0, 5)} WIB
                      </span>
                    )}
                    {currentEvent.location && (
                      <span>📍 {currentEvent.location}</span>
                    )}
                  </div>
                  {currentEvent.description && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.4,
                      }}
                    >
                      {currentEvent.description.length > 80
                        ? currentEvent.description.substring(0, 80) + "..."
                        : currentEvent.description}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem",
                }}
              >
                Belum ada agenda kegiatan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Running Text */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: template.colors.headerBg,
          padding: "0.75rem 0",
        }}
      >
        <RunningText
          texts={runningTexts || []}
          speed={settings?.running_text_speed || 80}
          mosqueName={mosqueName}
          accentColor={template.colors.accent}
        />
      </div>
    </div>
  );
}
