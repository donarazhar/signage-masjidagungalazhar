import ContentCarousel from "../ContentCarousel";
import RunningText from "../RunningText";
import type { DisplayTemplate } from "../../../styles/displayTemplates";
import type {
  Settings,
  Content,
  Event,
  RunningText as RunningTextType,
} from "../../../types";

interface LayoutTVProps {
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



export default function LayoutTV({
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
}: LayoutTVProps) {
  // Get nearest upcoming event for countdown
  const upcomingEvent = events?.length > 0 ? events[0] : null;
  const eventDaysLeft = upcomingEvent
    ? Math.ceil(
        (new Date(upcomingEvent.event_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div
      style={{
        background: template.colors.bodyBg,
        height: "100vh",
        width: "100vw",
        padding: "30px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,0,0,0.5)",
        }}
      >
      {/* ========== TOP HEADER BAR ========== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 1.5rem",
          background: template.colors.headerBg,
          borderBottom: `2px solid ${template.colors.accent}40`,
          flexShrink: 0,
          zIndex: 10,
          minHeight: "70px",
        }}
      >
        {/* Far Left: Logo (standalone) */}
        <div style={{ flexShrink: 0 }}>
          {settings?.mosque_logo ? (
            <img
              src={settings.mosque_logo}
              alt="Logo"
              style={{
                height: "52px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
          ) : (
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: `${template.colors.accent}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}
            >
              🕌
            </div>
          )}
        </div>

        {/* Center: Mosque Name + Address */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: template.colors.accent,
              lineHeight: 1.2,
              textShadow: `0 0 20px ${template.colors.accent}40`,
              textAlign: "center",
            }}
          >
            {mosqueName}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
              marginTop: "0.15rem",
              textAlign: "center",
            }}
          >
            {mosqueAddress}
          </div>
        </div>

        {/* Far Right: Clock */}
        <div
          style={{
            flexShrink: 0,
            background: "rgba(255,255,255,0.05)",
            padding: "0.5rem 1.25rem",
            borderRadius: "12px",
            border: `1px solid ${template.colors.accent}30`,
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', monospace",
              fontSize: "2.8rem",
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {hours}
            <span style={{ color: template.colors.accent }}>:</span>
            {minutes}
            <span style={{ color: template.colors.accent }}>:</span>
            <span style={{ fontSize: "2rem", color: "rgba(255,255,255,0.7)" }}>
              {seconds}
            </span>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT AREA ========== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* LEFT: Carousel + Overlays */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Carousel Background */}
          <div style={{ position: "absolute", inset: 0 }}>
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

          {/* Dark gradient overlay for readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.5) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Date bar - horizontal strip spanning image width */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 1.25rem",
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {gregorianDate}
            </div>
            <div
              style={{
                color: template.colors.accent,
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {hijriDate}
            </div>
          </div>

          {/* Event countdown badge - bottom left */}
          {upcomingEvent && eventDaysLeft !== null && eventDaysLeft > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: "0.75rem",
                left: "1rem",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  background: template.colors.accent,
                  color: template.colors.accentText || "white",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "100px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  boxShadow: `0 4px 20px ${template.colors.accent}60`,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>🕌</span>
                <span>
                  {upcomingEvent.title} {eventDaysLeft} hari lagi
                </span>
              </div>
            </div>
          )}

          {/* Next prayer countdown - bottom right */}
          {nextPrayer && (
            <div
              style={{
                position: "absolute",
                bottom: "0.75rem",
                right: "1rem",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                  border: `1px solid ${template.colors.accent}40`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Menuju {nextPrayer.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Outfit', monospace",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: template.colors.accent,
                    lineHeight: 1.2,
                  }}
                >
                  {formatCountdown(nextPrayer.minutesLeft)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Prayer Schedule List */}
        <div
          style={{
            width: "300px",
            display: "flex",
            flexDirection: "column",
            background: template.colors.prayerBarBg,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {prayerDisplay.map((p) => {
            const isNext = nextPrayer?.key === p.key;
            const rowColor = template.colors.accent;
            return (
              <div
                key={p.key}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 1rem",
                  background: isNext
                    ? `linear-gradient(90deg, ${rowColor}dd 0%, ${rowColor}bb 100%)`
                    : `linear-gradient(90deg, ${rowColor}22 0%, ${rowColor}44 100%)`,
                  borderBottom: "1px solid rgba(0,0,0,0.3)",
                  borderLeft: isNext
                    ? `4px solid ${rowColor}`
                    : `4px solid ${rowColor}80`,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Glow effect for active prayer */}
                {isNext && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(90deg, ${rowColor}30 0%, transparent 60%)`,
                      animation: "pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                )}
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: isNext ? "1.1rem" : "0.95rem",
                    color: isNext ? "white" : "rgba(255,255,255,0.85)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {p.name} -
                </span>
                <span
                  style={{
                    fontFamily: "'Outfit', monospace",
                    fontWeight: 800,
                    fontSize: isNext ? "1.6rem" : "1.3rem",
                    color: isNext ? "white" : `${rowColor}`,
                    position: "relative",
                    zIndex: 1,
                    textShadow: isNext
                      ? "0 2px 10px rgba(0,0,0,0.3)"
                      : "none",
                  }}
                >
                  {getPrayerTime(p.key)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== RUNNING TEXT BAR ========== */}
      <div
        style={{
          flexShrink: 0,
          background: template.colors.headerBg,
          padding: "0.5rem 0",
          borderTop: `1px solid ${template.colors.accent}30`,
          position: "relative",
          zIndex: 10,
        }}
      >
        <RunningText
          texts={runningTexts || []}
          speed={settings?.running_text_speed || 80}
          mosqueName={mosqueName}
          accentColor={template.colors.accent}
        />
      </div>

      {/* Pulse glow animation */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
      </div>
    </div>
  );
}
