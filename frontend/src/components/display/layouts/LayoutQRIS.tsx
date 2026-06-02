import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { displayService } from "../../../services/displayService";
import ContentCarousel from "../ContentCarousel";
import RunningText from "../RunningText";
import type { DisplayTemplate } from "../../../styles/displayTemplates";
import type {
  Settings,
  Content,
  Event,
  RunningText as RunningTextType,
} from "../../../types";

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

interface LayoutQRISProps {
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
  isPreviewMode?: boolean;
}

export default function LayoutQRIS({
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
  isPreviewMode,
}: LayoutQRISProps) {
  const { mosqueSlug } = useParams<{ mosqueSlug?: string }>();
  const [currentQrisIndex, setCurrentQrisIndex] = useState(0);
  const [qrisVisible, setQrisVisible] = useState(true);

  // Fetch donations for QRIS
  const { data: donations } = useQuery({
    queryKey: ["activeDonations", mosqueSlug],
    queryFn: () => displayService.getActiveDonations(mosqueSlug),
    refetchInterval: 1000 * 60 * 5,
    enabled: !isPreviewMode,
  });

  // Get QRIS items
  const qrisItems = useMemo(() => {
    if (!donations || donations.length === 0) return [];
    return donations.filter((d) => d.type === "qris" && d.qris_image);
  }, [donations]);

  // Rotate QRIS every 20 seconds
  useEffect(() => {
    if (qrisItems.length <= 1) return;
    const interval = setInterval(() => {
      setQrisVisible(false);
      setTimeout(() => {
        setCurrentQrisIndex((prev) => (prev + 1) % qrisItems.length);
        setQrisVisible(true);
      }, 400);
    }, 20000);
    return () => clearInterval(interval);
  }, [qrisItems.length]);

  // Get upcoming event
  const upcomingEvent = events?.length > 0 ? events[0] : null;
  const eventDaysLeft = upcomingEvent
    ? Math.ceil(
        (new Date(upcomingEvent.event_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const currentQris = qrisItems[currentQrisIndex] || null;

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
            minHeight: "70px",
          }}
        >
          {/* Far Left: Logo */}
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
                color: template.colors.headerText, opacity: 0.7,
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
                color: template.colors.headerText,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {hours}
              <span style={{ color: template.colors.accent }}>:</span>
              {minutes}
              <span style={{ color: template.colors.accent }}>:</span>
              <span
                style={{ fontSize: "2rem", color: template.colors.headerText, opacity: 0.7 }}
              >
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
            {/* Carousel */}
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

            {/* Overlay gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.5) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Date bar */}
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

            {/* Event countdown badge */}
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
          </div>

          {/* RIGHT SIDEBAR: Countdown + QRIS */}
          <div
            style={{
              width: "320px",
              display: "flex",
              flexDirection: "column",
              background: template.colors.prayerBarBg,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {/* Next Prayer Countdown */}
            <div
              style={{
                padding: "1rem 1.25rem",
                background: `linear-gradient(135deg, ${template.colors.accent}15 0%, rgba(0,0,0,0.3) 100%)`,
                borderBottom: `1px solid ${template.colors.accent}30`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: template.colors.prayerBarText, opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.25rem",
                }}
              >
                Menuju Waktu Shalat
              </div>
              {nextPrayer && (
                <>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: template.colors.prayerBarText,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {nextPrayer.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Outfit', monospace",
                      fontSize: "2.2rem",
                      fontWeight: 800,
                      color: template.colors.accent,
                      lineHeight: 1.2,
                      textShadow: `0 0 20px ${template.colors.accent}40`,
                    }}
                  >
                    {formatCountdown(nextPrayer.minutesLeft)}
                  </div>
                </>
              )}
            </div>

            {/* QRIS / Donation Area */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {currentQris ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.4s ease",
                    opacity: qrisVisible ? 1 : 0,
                  }}
                >
                  {/* QRIS Image */}
                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "8px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      maxWidth: "100%",
                      maxHeight: "calc(100% - 30px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={`${API_URL}/storage/${currentQris.qris_image}`}
                      alt="QRIS Donasi"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  {/* Label */}
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Scan untuk Donasi
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "0.8rem",
                    padding: "2rem",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                    💝
                  </div>
                  <div>QR Code Donasi</div>
                  <div style={{ fontSize: "0.65rem", marginTop: "0.25rem" }}>
                    Belum ada QRIS aktif
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== PRAYER TIMES BAR (HORIZONTAL) ========== */}
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            background: template.colors.prayerBarBg,
            borderTop: `1px solid ${template.colors.accent}20`,
          }}
        >
          {prayerDisplay.map((p) => {
            const isNext = nextPrayer?.key === p.key;
            return (
              <div
                key={p.key}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.6rem 0.25rem",
                  background: isNext
                    ? template.colors.accent
                    : "transparent",
                  color: isNext
                    ? template.colors.accentText
                    : template.colors.prayerBarText,
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.3s ease",
                  borderRadius: isNext ? "8px" : "0",
                  margin: isNext ? "4px 2px" : "0",
                  boxShadow: isNext
                    ? `0 0 15px ${template.colors.accent}50`
                    : "none",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.15rem",
                    opacity: isNext ? 1 : 0.7,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Outfit', monospace",
                    fontSize: isNext ? "1.6rem" : "1.4rem",
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {getPrayerTime(p.key)}
                </div>
              </div>
            );
          })}
        </div>

        {/* ========== RUNNING TEXT ========== */}
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
            textColor={template.colors.headerText}
          />
        </div>
      </div>
    </div>
  );
}
