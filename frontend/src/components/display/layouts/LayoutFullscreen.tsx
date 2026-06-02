import ContentCarousel from "../ContentCarousel";
import RunningText from "../RunningText";
import type { DisplayTemplate } from "../../../styles/displayTemplates";
import type {
  Settings,
  Content,
  Event,
  RunningText as RunningTextType,
} from "../../../types";

interface LayoutFullscreenProps {
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

export default function LayoutFullscreen({
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
  runningTexts,
  prayerDisplay,
  getPrayerTime,
  timezone,
}: LayoutFullscreenProps) {
  return (
    <div
      className="display-container layout-fullscreen"
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
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
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

      {/* Overlay Gradient - top and bottom darkening for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.7) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ========== TOP BAR: Clock | Mosque Info | Date ========== */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          flexShrink: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* LEFT: Clock */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', monospace",
              fontSize: "2.8rem",
              fontWeight: 700,
              color: "white",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {hours}
            <span style={{ color: template.colors.accent }}>:</span>
            {minutes}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.15rem",
            }}
          >
            <span
              style={{
                fontFamily: "'Outfit', monospace",
                fontSize: "1rem",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              :{seconds}
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 500,
              }}
            >
              {timezone || "WIB"}
            </span>
          </div>
        </div>

        {/* Subtle divider */}
        <div
          style={{
            width: "1px",
            height: "2.5rem",
            background: "rgba(255,255,255,0.15)",
          }}
        />

        {/* CENTER: Mosque Name + Address */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            flex: 1,
            maxWidth: "60%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {settings?.mosque_logo && (
              <img
                src={settings.mosque_logo}
                alt="Logo"
                style={{
                  height: "44px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            )}
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "white",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {mosqueName}
            </div>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {mosqueAddress}
          </div>
        </div>

        {/* Subtle divider */}
        <div
          style={{
            width: "1px",
            height: "2.5rem",
            background: "rgba(255,255,255,0.15)",
          }}
        />

        {/* RIGHT: Date */}
        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              color: "white",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {gregorianDate}
          </div>
          <div
            style={{
              color: template.colors.accent,
              fontWeight: 600,
              fontSize: "0.85rem",
              marginTop: "0.2rem",
            }}
          >
            {hijriDate}
          </div>
        </div>
      </div>

      {/* ========== MIDDLE: Countdown (floating, bottom-left) ========== */}
      {nextPrayer && (
        <div
          style={{
            position: "absolute",
            bottom: "8rem",
            left: "1.5rem",
            zIndex: 2,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(16px)",
            padding: "0.75rem 1.25rem",
            borderRadius: "14px",
            border: `1px solid ${template.colors.accent}40`,
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
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
              fontSize: "1.6rem",
              fontWeight: 700,
              color: template.colors.accent,
              lineHeight: 1.2,
            }}
          >
            {formatCountdown(nextPrayer.minutesLeft)}
          </div>
        </div>
      )}

      {/* Spacer to push bottom elements down */}
      <div style={{ flex: 1, position: "relative", zIndex: 1 }} />

      {/* ========== PRAYER BAR ========== */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          padding: "0.5rem 1rem",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "stretch",
          gap: "0.25rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {prayerDisplay.map((p) => (
          <div
            key={p.key}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.4rem 0.5rem",
              borderRadius: "8px",
              transition: "all 0.3s",
              background:
                nextPrayer?.key === p.key
                  ? `${template.colors.accent}30`
                  : "transparent",
              border:
                nextPrayer?.key === p.key
                  ? `2px solid ${template.colors.accent}`
                  : "2px solid transparent",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color:
                  nextPrayer?.key === p.key
                    ? template.colors.accent
                    : "rgba(255,255,255,0.8)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 0,
              }}
            >
              {p.name}
            </span>
            <span
              style={{
                fontFamily: "'Outfit', monospace",
                fontSize: "2rem",
                fontWeight: 800,
                color:
                  nextPrayer?.key === p.key
                    ? template.colors.accent
                    : "white",
                lineHeight: 1,
              }}
            >
              {getPrayerTime(p.key)}
            </span>
            {/* Countdown under active prayer */}
            {nextPrayer?.key === p.key && (
              <span
                style={{
                  fontSize: "0.6rem",
                  color: template.colors.accent,
                  fontWeight: 600,
                  marginTop: "0.15rem",
                  fontFamily: "'Outfit', monospace",
                }}
              >
                -{formatCountdown(nextPrayer.minutesLeft)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ========== RUNNING TEXT ========== */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: template.colors.headerBg,
          padding: "0.6rem 0",
        }}
      >
        <RunningText
          texts={runningTexts || []}
          speed={settings?.running_text_speed || 80}
          mosqueName={mosqueName}
          textColor={template.colors.headerText}
          accentColor={template.colors.accent}
        />
      </div>
      </div>
    </div>
  );
}
