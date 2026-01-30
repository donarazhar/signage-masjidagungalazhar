import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { displayService } from "../../services/displayService";
import { Landmark, QrCode } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";
const ROTATION_INTERVAL = 15000; // 15 seconds

export default function DonationWidget() {
  const { mosqueSlug } = useParams<{ mosqueSlug?: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Check if in preview mode
  const isPreviewMode =
    new URLSearchParams(window.location.search).get("preview") === "true";

  const { data: donations } = useQuery({
    queryKey: ["activeDonations", mosqueSlug],
    queryFn: () => displayService.getActiveDonations(mosqueSlug),
    refetchInterval: 1000 * 60 * 5, // 5 mins
    enabled: !isPreviewMode,
  });

  // Separate rekening and QRIS, create pages with alternating pattern
  const pages = useMemo(() => {
    if (!donations || donations.length === 0) return [];

    const rekenings = donations.filter((d) => d.type === "rekening");
    const qrisList = donations.filter((d) => d.type === "qris" && d.qris_image);

    const result: { type: "rekening" | "qris"; items: typeof donations }[] = [];

    // Create rekening pages (3 per page)
    const rekeningPages: { type: "rekening"; items: typeof donations }[] = [];
    for (let i = 0; i < rekenings.length; i += 3) {
      rekeningPages.push({
        type: "rekening",
        items: rekenings.slice(i, i + 3),
      });
    }

    // Create QRIS pages (1 per page)
    const qrisPages: { type: "qris"; items: typeof donations }[] = [];
    for (const qris of qrisList) {
      qrisPages.push({
        type: "qris",
        items: [qris],
      });
    }

    // Interleave rekening and QRIS pages alternately
    const maxLength = Math.max(rekeningPages.length, qrisPages.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < rekeningPages.length) {
        result.push(rekeningPages[i]);
      }
      if (i < qrisPages.length) {
        result.push(qrisPages[i]);
      }
    }

    return result;
  }, [donations]);

  const totalPages = pages.length;

  // Rotation effect
  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      setTimeout(() => {
        // Change page
        setCurrentPage((prev) => (prev + 1) % totalPages);
        // Fade in
        setIsVisible(true);
      }, 500); // Wait for fade out animation
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [totalPages, pages]);

  if (!donations || donations.length === 0 || pages.length === 0) return null;

  const currentPageData = pages[currentPage];

  return (
    <div
      className="info-card"
      style={{
        background: "linear-gradient(145deg, #ffffff, #f0fdf4)",
        border: "1px solid var(--primary-100)",
        position: "relative",
        overflow: "hidden",
        transition: "opacity 0.5s ease-in-out",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {currentPageData.type === "qris" ? (
        <>
          {/* QRIS Display */}
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              opacity: 0.1,
              color: "var(--primary-600)",
            }}
          >
            <QrCode size={64} />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                color: "var(--primary-600)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              <QrCode size={18} />
              Scan QRIS
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 0,
              }}
            >
              <img
                src={`${API_URL}/storage/${currentPageData.items[0].qris_image}`}
                alt="QRIS"
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "180px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  background: "white",
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Rekening Display (1 or 2) */}
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              opacity: 0.1,
              color: "var(--primary-600)",
            }}
          >
            <Landmark size={64} />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "0.5rem",
                color: "var(--primary-600)",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              <Landmark size={16} />
              Rekening Donasi
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                flex: 1,
              }}
            >
              {currentPageData.items.map((donation) => (
                <div
                  key={donation.id}
                  style={{
                    background: "var(--primary-50)",
                    borderRadius: "8px",
                    padding: "0.4rem 0.6rem",
                    border: "1px solid var(--primary-100)",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.55rem",
                      color: "var(--slate-500)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "0.1rem",
                    }}
                  >
                    {donation.bank_name}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--primary-700)",
                      lineHeight: 1.2,
                    }}
                  >
                    {donation.account_number}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--slate-600)",
                      fontWeight: 500,
                    }}
                  >
                    a.n. {donation.account_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Indicator dots if multiple pages */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.35rem",
            marginTop: "0.75rem",
          }}
        >
          {pages.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background:
                  idx === currentPage
                    ? "var(--primary-500)"
                    : "var(--primary-200)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
