import ContentCarousel from "../ContentCarousel";
import RunningText from "../RunningText";
import type { DisplayTemplate } from "../../../styles/displayTemplates";
import type {
  Settings,
  Content,
  RunningText as RunningTextType,
} from "../../../types";

interface LayoutDashboardProps {
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

export default function LayoutDashboard({
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
}: LayoutDashboardProps) {
  // Filter hanya 5 waktu shalat utama untuk tampilan besar
  const mainPrayers = prayerDisplay.filter((p) =>
    ["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(p.key),
  );

  return (
    <div
      className="display-container layout-dashboard"
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
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {mosqueAddress}
            </p>
          </div>
        </div>

        {/* Date */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{ fontSize: "0.9rem", color: template.colors.headerText }}
          >
            {gregorianDate}
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              color: template.colors.accent,
              marginTop: 2,
            }}
          >
            {hijriDate}
          </div>
        </div>
      </header>

      {/* Main Content - 50/50 Split */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 0,
        }}
      >
        {/* Left - Content Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Carousel */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
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

          {/* Running Text */}
          <div
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
          </div>
        </div>

        {/* Right - Prayer Dashboard */}
        <div
          style={{
            background: template.colors.prayerBarBg,
            display: "flex",
            flexDirection: "column",
            borderLeft: `1px solid ${template.colors.cardBorder}`,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Clock */}
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              borderBottom: `1px solid ${template.colors.cardBorder}`,
              background: template.colors.cardBg,
            }}
          >
            <div
              style={{
                fontSize: "4rem",
                fontWeight: 700,
                color: template.colors.textPrimary,
                lineHeight: 1,
              }}
            >
              {hours}
              <span style={{ color: template.colors.accent }}>:</span>
              {minutes}
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                color: template.colors.textSecondary,
              }}
            >
              :{seconds}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: template.colors.textSecondary,
                marginTop: "0.5rem",
              }}
            >
              {timezone || "Waktu Indonesia Barat"}
            </div>
          </div>

          {/* Large Prayer Times Grid */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateRows: `repeat(${mainPrayers.length}, 1fr)`,
              gap: "2px",
              padding: "2px",
            }}
          >
            {mainPrayers.map((p) => {
              const isNext = nextPrayer?.key === p.key;
              return (
                <div
                  key={p.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 2rem",
                    background: isNext
                      ? template.colors.accent
                      : template.colors.cardBg,
                    color: isNext
                      ? template.colors.accentText
                      : template.colors.prayerBarText,
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {isNext && <span style={{ fontSize: "1.5rem" }}>🕐</span>}
                    <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                      {p.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "2.5rem", fontWeight: 700 }}>
                    {getPrayerTime(p.key)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Countdown */}
          {nextPrayer && (
            <div
              style={{
                padding: "1rem 2rem",
                background: template.colors.cardBg,
                borderTop: `1px solid ${template.colors.cardBorder}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: template.colors.textSecondary,
                  }}
                >
                  Menuju Waktu Shalat {nextPrayer.name}
                </div>
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
        </div>
      </main>
      </div>
    </div>
  );
}
