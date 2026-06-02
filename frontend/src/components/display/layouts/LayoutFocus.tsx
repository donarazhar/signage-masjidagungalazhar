import ContentCarousel from "../ContentCarousel";
import RunningText from "../RunningText";
import HadithWidget from "../HadithWidget";
import type { DisplayTemplate } from "../../../styles/displayTemplates";
import type {
  Settings,
  Content,
  RunningText as RunningTextType,
} from "../../../types";

interface LayoutFocusProps {
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
  runningTexts: RunningTextType[];
  prayerDisplay: Array<{ key: string; name: string; showIqamah?: boolean }>;
  getPrayerTime: (key: string) => string;
  timezone?: string;
}

export default function LayoutFocus({
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
}: LayoutFocusProps) {
  return (
    <div
      className="display-container layout-focus"
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
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
      {/* Header */}
      <header
        style={{
          background: template.colors.headerBg,
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo & Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {settings?.mosque_logo ? (
            <img
              src={settings.mosque_logo}
              alt="Logo"
              style={{ height: "60px" }}
            />
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: template.colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}
            >
              🕌
            </div>
          )}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: template.colors.headerText,
              }}
            >
              {mosqueName}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: template.colors.headerText,
                opacity: 0.8,
              }}
            >
              {mosqueAddress}
            </p>
          </div>
        </div>

        {/* Hadith */}
        <div style={{ flex: 1, maxWidth: "500px", margin: "0 2rem" }}>
          <HadithWidget textColor={template.colors.headerText} />
        </div>

        {/* Clock & Date */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: template.colors.headerText,
              }}
            >
              {hours}:{minutes}
              <span style={{ fontSize: "1rem", opacity: 0.7 }}>:{seconds}</span>
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: template.colors.headerText,
                opacity: 0.6,
              }}
            >
              {timezone || "WIB"}
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              padding: "0.5rem 1rem",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{ fontSize: "0.8rem", color: template.colors.headerText }}
            >
              {gregorianDate}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: template.colors.accent,
                marginTop: 2,
              }}
            >
              {hijriDate}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 70/30 Split */}
      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Content Area - 70% */}
        <div style={{ flex: 7, position: "relative" }}>
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

        {/* Sidebar - 30% */}
        <aside
          style={{
            flex: 3,
            background: template.colors.prayerBarBg,
            display: "flex",
            flexDirection: "column",
            borderLeft: `1px solid ${template.colors.cardBorder}`,
          }}
        >
          {/* Prayer Times */}
          <div style={{ flex: 1, padding: "1rem" }}>
            <h3
              style={{
                margin: "0 0 1rem",
                fontSize: "0.9rem",
                color: template.colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Jadwal Shalat
            </h3>
            {prayerDisplay.map((p) => (
              <div
                key={p.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "0.35rem",
                  borderRadius: "8px",
                  background:
                    nextPrayer?.key === p.key
                      ? template.colors.accent
                      : template.colors.cardBg,
                  color:
                    nextPrayer?.key === p.key
                      ? template.colors.accentText
                      : template.colors.prayerBarText,
                  border: `1px solid ${nextPrayer?.key === p.key ? template.colors.accent : template.colors.cardBorder}`,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  {p.name}
                </span>
                <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                  {getPrayerTime(p.key)}
                </span>
              </div>
            ))}
          </div>

          {/* Countdown */}
          {nextPrayer && (
            <div
              style={{
                padding: "1rem",
                background: template.colors.cardBg,
                borderTop: `1px solid ${template.colors.cardBorder}`,
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
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: template.colors.accent,
                }}
              >
                {formatCountdown(nextPrayer.minutesLeft)}
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Footer - Running Text */}
      <footer
        style={{
          background: template.colors.headerBg,
          padding: "0.5rem 0",
        }}
      >
        <RunningText
          texts={runningTexts || []}
          speed={settings?.running_text_speed || 80}
          mosqueName={mosqueName}
          textColor={template.colors.headerText}
          accentColor={template.colors.accent}
        />
      </footer>
      </div>
    </div>
  );
}
