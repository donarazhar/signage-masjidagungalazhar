import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { displayService } from "../../services/displayService";
import ContentCarousel from "./ContentCarousel";
import RunningText from "./RunningText";
import IqamahMode from "./IqamahMode";
import PrayerInProgressMode from "./PrayerInProgressMode";
import EventsPanel from "./EventsPanel";
import DonationWidget from "./DonationWidget";
import HadithWidget from "./HadithWidget";
import { getTemplate } from "../../styles/displayTemplates";
import { LayoutCinematic, LayoutFocus, LayoutDashboard } from "./layouts";
import type { DisplayMode, PrayerName, PrayerTimes } from "../../types";

const PRAYER_DISPLAY: Array<{
  key: string;
  name: string;
  showIqamah?: boolean;
}> = [
  { key: "imsak", name: "IMSAK" },
  { key: "fajr", name: "SHUBUH", showIqamah: true },
  { key: "sunrise", name: "SYURUQ" },
  { key: "dhuha", name: "DHUHA" },
  { key: "dhuhr", name: "DZUHUR", showIqamah: true },
  { key: "asr", name: "ASHAR", showIqamah: true },
  { key: "maghrib", name: "MAGHRIB", showIqamah: true },
  { key: "isha", name: "ISYA", showIqamah: true },
];

const PRAYER_NAMES_ID: Record<string, string> = {
  fajr: "Shubuh",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
};

const ISLAMIC_DAYS: Record<string, string> = {
  Minggu: "Ahad",
  Senin: "Senin",
  Selasa: "Selasa",
  Rabu: "Rabu",
  Kamis: "Kamis",
  Jumat: "Jum'at",
  Sabtu: "Sabtu",
};

function formatTime(timeStr: string): string {
  return timeStr?.replace(/\s*\(.*\)/, "") || "--:--";
}

function getNextPrayer(
  prayerTimes: PrayerTimes,
  currentMinutes: number,
): { key: string; name: string; time: string; minutesLeft: number } | null {
  const prayers: Array<{ key: PrayerName; name: string }> = [
    { key: "fajr", name: "Shubuh" },
    { key: "dhuhr", name: "Dzuhur" },
    { key: "asr", name: "Ashar" },
    { key: "maghrib", name: "Maghrib" },
    { key: "isha", name: "Isya" },
  ];
  for (const prayer of prayers) {
    const [h, m] = prayerTimes.timings[prayer.key].split(":").map(Number);
    const mins = h * 60 + m;
    if (mins > currentMinutes) {
      return {
        key: prayer.key,
        name: prayer.name,
        time: formatTime(prayerTimes.timings[prayer.key]),
        minutesLeft: mins - currentMinutes,
      };
    }
  }
  const [h, m] = prayerTimes.timings.fajr.split(":").map(Number);
  return {
    key: "fajr",
    name: "Shubuh",
    time: formatTime(prayerTimes.timings.fajr),
    minutesLeft: 24 * 60 - currentMinutes + (h * 60 + m),
  };
}

export default function MainDisplay() {
  const { mosqueSlug } = useParams<{ mosqueSlug?: string }>();
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normal");
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Check if in preview mode (no data, just layout preview)
  const searchParams = new URLSearchParams(window.location.search);
  const isPreviewMode = searchParams.get("preview") === "true";

  // Get mosque identifier from URL path or query params for cache keys
  const mosqueKey =
    mosqueSlug ||
    searchParams.get("mosque_id") ||
    searchParams.get("m") ||
    "default";

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["settings", mosqueKey],
    queryFn: () => displayService.getSettings(mosqueSlug),
    enabled: !isPreviewMode,
  });
  const { data: prayerTimes } = useQuery({
    queryKey: ["prayerTimes", mosqueKey],
    queryFn: () => displayService.getPrayerTimes(mosqueSlug),
    refetchInterval: 1000 * 60 * 30,
    enabled: !isPreviewMode,
  });
  const { data: contents } = useQuery({
    queryKey: ["activeContents", mosqueKey],
    queryFn: () => displayService.getActiveContents(mosqueSlug),
    refetchInterval: 1000 * 30,
    enabled: !isPreviewMode,
  }); // Check every 30s
  const { data: runningTexts } = useQuery({
    queryKey: ["activeRunningTexts", mosqueKey],
    queryFn: () => displayService.getActiveRunningTexts(mosqueSlug),
    refetchInterval: 1000 * 30,
    enabled: !isPreviewMode,
  }); // Check every 30s
  const { data: events } = useQuery({
    queryKey: ["upcomingEvents", mosqueKey],
    queryFn: () => displayService.getUpcomingEvents(mosqueSlug),
    refetchInterval: 1000 * 60,
    enabled: !isPreviewMode,
  }); // Check every 1m

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;
    const check = () => {
      const now = new Date();
      const curr = now.getHours() * 60 + now.getMinutes();
      const prayers: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      for (const p of prayers) {
        const [h, m] = prayerTimes.timings[p].split(":").map(Number);
        const pm = h * 60 + m;
        const iq =
          prayerTimes.iqamah_duration[
            p as keyof typeof prayerTimes.iqamah_duration
          ] ?? 10;
        const pd = prayerTimes.prayer_duration || 15;

        // If iqamah duration is 0, skip iqamah mode entirely
        if (iq === 0) {
          // Go directly from adhan time to prayer mode
          if (curr >= pm && curr < pm + pd) {
            setDisplayMode("prayer");
            setCurrentPrayer(p);
            return;
          }
        } else {
          // Normal flow: adhan -> iqamah -> prayer
          if (curr >= pm && curr < pm + iq) {
            setDisplayMode("iqamah");
            setCurrentPrayer(p);
            return;
          }
          if (curr >= pm + iq && curr < pm + iq + pd) {
            setDisplayMode("prayer");
            setCurrentPrayer(p);
            return;
          }
        }
      }
      setDisplayMode("normal");
      setCurrentPrayer(null);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Show loading state while settings are being fetched to prevent "Masjid Agung Al Azhar" flash
  if (isSettingsLoading) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <div className="animate-pulse text-xl font-semibold">
          Memuat Display Masjid...
        </div>
      </div>
    );
  }

  if (displayMode === "iqamah" && currentPrayer && prayerTimes) {
    const dur =
      prayerTimes.iqamah_duration[
        currentPrayer as keyof typeof prayerTimes.iqamah_duration
      ] || 10;
    return (
      <IqamahMode
        prayerName={PRAYER_NAMES_ID[currentPrayer]}
        duration={dur}
        onComplete={() => setDisplayMode("prayer")}
      />
    );
  }
  if (displayMode === "prayer" && prayerTimes) {
    return (
      <PrayerInProgressMode
        duration={prayerTimes.prayer_duration || 15}
        onComplete={() => setDisplayMode("normal")}
      />
    );
  }

  const mosqueName = settings?.mosque_name || "Masjid Agung Al Azhar";
  const mosqueAddress =
    settings?.mosque_address ||
    "Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan";

  // In preview mode, read template and layout from URL params
  const previewTemplate = searchParams.get("template") || "classic";
  const previewLayout = searchParams.get("layout") || "classic";
  const template = getTemplate(
    isPreviewMode ? previewTemplate : settings?.display_template || "classic",
  );

  const rawDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const gregorianDate = Object.entries(ISLAMIC_DAYS).reduce(
    (d, [o, i]) => d.replace(o, i),
    rawDate,
  );
  const hijriDate = prayerTimes?.date?.hijri
    ? `${prayerTimes.date.hijri.day} ${prayerTimes.date.hijri.month.ar} ${prayerTimes.date.hijri.year} H`
    : "";

  // Calculate time based on timezone
  const getTimeInTimezone = () => {
    const now = new Date();
    // Get UTC time
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

    // Determine offset in hours based on timezone
    let offsetHours = 7; // Default WIB
    if (prayerTimes?.timezone?.offset) {
      // Parse offset like "+08:00" or "+09:00"
      const offsetMatch = prayerTimes.timezone.offset.match(
        /([+-])(\d{2}):(\d{2})/,
      );
      if (offsetMatch) {
        const sign = offsetMatch[1] === "+" ? 1 : -1;
        const hours = parseInt(offsetMatch[2], 10);
        const mins = parseInt(offsetMatch[3], 10);
        offsetHours = sign * (hours + mins / 60);
      }
    }

    // Create new date with the target timezone offset
    return new Date(utcTime + offsetHours * 3600000);
  };

  const timeInZone = getTimeInTimezone();
  const currentMinutesInZone =
    timeInZone.getHours() * 60 + timeInZone.getMinutes();
  const hours = timeInZone.getHours().toString().padStart(2, "0");
  const minutes = timeInZone.getMinutes().toString().padStart(2, "0");
  const seconds = timeInZone.getSeconds().toString().padStart(2, "0");

  const nextPrayer = prayerTimes
    ? getNextPrayer(prayerTimes, currentMinutesInZone)
    : null;

  const formatCountdown = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const s = 60 - timeInZone.getSeconds();
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const getPrayerTime = (key: string) => {
    if (key === "imsak" && prayerTimes) {
      const [h, m] = prayerTimes.timings.fajr.split(":").map(Number);
      const im = (h * 60 + m - 10 + 1440) % 1440;
      return `${Math.floor(im / 60)
        .toString()
        .padStart(2, "0")}:${(im % 60).toString().padStart(2, "0")}`;
    }
    return prayerTimes
      ? formatTime(prayerTimes.timings[key as keyof typeof prayerTimes.timings])
      : "--:--";
  };

  // Layout props that are shared across all layouts
  // When in preview mode, use empty/placeholder data
  const layoutProps = {
    settings,
    template,
    mosqueName: isPreviewMode ? "Preview Mode" : mosqueName,
    mosqueAddress: isPreviewMode ? "Alamat Masjid" : mosqueAddress,
    hours: isPreviewMode ? "00" : hours,
    minutes: isPreviewMode ? "00" : minutes,
    seconds: isPreviewMode ? "00" : seconds,
    gregorianDate: isPreviewMode ? "1 Januari 2025" : gregorianDate,
    hijriDate: isPreviewMode ? "1 Muharram 1446 H" : hijriDate,
    nextPrayer: isPreviewMode
      ? { key: "dhuhr", name: "Dzuhur", time: "12:00", minutesLeft: 60 }
      : nextPrayer,
    formatCountdown,
    contents: isPreviewMode ? [] : contents || [],
    events: isPreviewMode ? [] : events || [],
    runningTexts: isPreviewMode ? [] : runningTexts || [],
    prayerDisplay: PRAYER_DISPLAY,
    getPrayerTime: isPreviewMode ? () => "--:--" : getPrayerTime,
    timezone: prayerTimes?.timezone?.name,
    isPreviewMode,
  };

  // Render layout based on settings (or URL params in preview mode)
  const currentLayout = isPreviewMode
    ? previewLayout
    : settings?.display_layout || "classic";

  if (currentLayout === "cinematic") {
    return <LayoutCinematic {...layoutProps} />;
  }

  if (currentLayout === "focus") {
    return <LayoutFocus {...layoutProps} />;
  }

  if (currentLayout === "dashboard") {
    return <LayoutDashboard {...layoutProps} />;
  }

  // Default: Classic Layout
  return (
    <div
      className="display-container"
      style={
        {
          "--template-header-bg": template.colors.headerBg,
          "--template-header-text": template.colors.headerText,
          "--template-body-bg": template.colors.bodyBg,
          "--template-card-bg": template.colors.cardBg,
          "--template-card-border": template.colors.cardBorder,
          "--template-accent": template.colors.accent,
          "--template-accent-text": template.colors.accentText,
          "--template-text-primary": template.colors.textPrimary,
          "--template-text-secondary": template.colors.textSecondary,
          "--template-prayer-bar-bg": template.colors.prayerBarBg,
          "--template-prayer-bar-text": template.colors.prayerBarText,
          "--template-prayer-bar-active": template.colors.prayerBarActive,
          background: template.colors.bodyBg,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <header
        className="header-bar"
        style={{ background: template.colors.headerBg }}
      >
        <div
          className="logo-section"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          {settings?.mosque_logo ? (
            <img
              src={settings.mosque_logo}
              alt="Logo Masjid"
              style={{ height: "80px", width: "auto", objectFit: "contain" }}
            />
          ) : (
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              {/* Dome */}
              <path
                d="M50 10C35 10 25 25 25 35H75C75 25 65 10 50 10Z"
                fill={template.colors.accent}
              />
              {/* Crescent */}
              <circle cx="50" cy="8" r="4" fill={template.colors.headerText} />
              {/* Main building */}
              <rect
                x="20"
                y="35"
                width="60"
                height="45"
                fill={template.colors.accent}
              />
              {/* Door */}
              <path
                d="M40 80V55C40 50 45 45 50 45C55 45 60 50 60 55V80H40Z"
                fill={template.colors.headerBg}
              />
              {/* Windows */}
              <circle
                cx="32"
                cy="55"
                r="5"
                fill={template.colors.headerText}
                opacity="0.8"
              />
              <circle
                cx="68"
                cy="55"
                r="5"
                fill={template.colors.headerText}
                opacity="0.8"
              />
              {/* Left minaret */}
              <rect
                x="10"
                y="30"
                width="10"
                height="50"
                fill={template.colors.accent}
              />
              <path d="M10 30L15 20L20 30H10Z" fill={template.colors.accent} />
              {/* Right minaret */}
              <rect
                x="80"
                y="30"
                width="10"
                height="50"
                fill={template.colors.accent}
              />
              <path d="M80 30L85 20L90 30H80Z" fill={template.colors.accent} />
              {/* Base */}
              <rect
                x="5"
                y="80"
                width="90"
                height="10"
                rx="2"
                fill={template.colors.accent}
              />
            </svg>
          )}
          <div className="mosque-info" style={{ maxWidth: "280px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "1.8rem",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {mosqueName}
            </h1>
            <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9 }}>
              {mosqueAddress}
            </p>
          </div>
        </div>

        {/* Hadith Widget */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HadithWidget />
        </div>

        <div
          className="date-card"
          style={{
            background: "rgba(255,255,255,0.15)",
            borderLeft: "none",
            color: "white",
            marginLeft: "1rem",
          }}
        >
          <div style={{ color: "white", fontWeight: 600 }}>{gregorianDate}</div>
          <div
            style={{
              color: "rgba(251,191,36,1)",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {hijriDate}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <aside className="left-sidebar">
          {/* Clock */}
          <div
            className="clock-card"
            style={{
              background: template.colors.cardBg,
              border: `1px solid ${template.colors.cardBorder}`,
            }}
          >
            <div
              className="clock-time"
              style={{
                color: template.colors.textPrimary,
                fontSize: "4.5rem", // Increased from default (likely 3rem or similar based on CSS class)
                lineHeight: "1",
                fontWeight: "700",
              }}
            >
              {hours}
              <span style={{ color: template.colors.accent }}>:</span>
              {minutes}
              <span
                className="clock-seconds"
                style={{ color: template.colors.textSecondary }}
              >
                :{seconds}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: template.colors.textSecondary,
                marginTop: "0.5rem",
                fontWeight: 500,
              }}
            >
              {prayerTimes?.timezone?.name || "Waktu Indonesia Barat"}
            </div>
          </div>

          {/* Countdown */}
          {nextPrayer && (
            <div
              className="countdown-card"
              style={{
                background: template.colors.cardBg,
                border: `1px solid ${template.colors.cardBorder}`,
              }}
            >
              <div
                className="label"
                style={{ color: template.colors.textSecondary }}
              >
                Menuju Waktu Shalat
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  className="prayer-name"
                  style={{ color: template.colors.textPrimary }}
                >
                  {nextPrayer.name}
                </span>
                <span
                  className="time"
                  style={{ color: template.colors.accent }}
                >
                  {formatCountdown(nextPrayer.minutesLeft)}
                </span>
              </div>
            </div>
          )}

          {/* Donation Widget */}
          <DonationWidget />
        </aside>

        {/* Carousel */}
        <div className="carousel-area">
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

        {/* Events Sidebar */}
        <aside className="right-sidebar">
          <EventsPanel events={events || []} mosqueName={mosqueName} />
        </aside>
      </main>

      {/* Prayer Bar */}
      <div
        className="prayer-bar"
        style={{ background: template.colors.prayerBarBg }}
      >
        {PRAYER_DISPLAY.map((p) => (
          <div
            key={p.key}
            className={`prayer-item ${currentPrayer === p.key ? "active" : ""} ${nextPrayer?.key === p.key ? "next" : ""}`}
            style={{
              color:
                nextPrayer?.key === p.key
                  ? template.colors.prayerBarActive
                  : template.colors.prayerBarText,
              borderColor:
                nextPrayer?.key === p.key
                  ? template.colors.accent
                  : "transparent",
            }}
          >
            <span className="prayer-name">{p.name}</span>
            <span className="prayer-time">{getPrayerTime(p.key)}</span>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <footer
        className="ticker-bar"
        style={{
          background: template.colors.headerBg,
          color: template.colors.headerText,
        }}
      >
        <RunningText
          texts={runningTexts || []}
          speed={settings?.running_text_speed || 80}
          mosqueName={mosqueName}
          accentColor={template.colors.accent}
        />
      </footer>
    </div>
  );
}
