import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { Event } from "../../types";

interface EventsPanelProps {
  events: Event[];
}

const ITEMS_PER_PAGE = 3;
const ROTATION_INTERVAL = 15000; // 15 seconds

export default function EventsPanel({ events }: EventsPanelProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Limit to 6 events max
  const displayEvents = events.slice(0, 6);
  const totalPages = Math.ceil(displayEvents.length / ITEMS_PER_PAGE);

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
  }, [totalPages]);

  // Get current page events
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentEvents = displayEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (events.length === 0) {
    return (
      <div
        className="events-panel"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          color: "var(--slate-500)",
        }}
      >
        <Calendar size={48} opacity={0.5} />
        <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
          Belum ada agenda kegiatan mendatang
        </p>
      </div>
    );
  }

  return (
    <div
      className="events-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          paddingBottom: "0.75rem",
          borderBottom: "2px solid rgba(16, 185, 129, 0.2)",
        }}
      >
        <div
          style={{
            padding: "0.5rem",
            background: "var(--primary-100)",
            borderRadius: "8px",
            color: "var(--primary-600)",
          }}
        >
          <Calendar size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--slate-800)",
              lineHeight: 1.2,
            }}
          >
            Agenda Kegiatan
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
            Masjid Agung Al Azhar
          </p>
        </div>
        {/* Page indicator */}
        {totalPages > 1 && (
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--primary-600)",
              background: "var(--primary-50)",
              padding: "0.25rem 0.5rem",
              borderRadius: "6px",
              fontWeight: 600,
            }}
          >
            {currentPage + 1}/{totalPages}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          overflowY: "hidden",
          transition: "opacity 0.5s ease-in-out",
          opacity: isVisible ? 1 : 0,
          flex: 1,
        }}
      >
        {currentEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-date-badge">
              <span className="day">
                {new Date(event.event_date).getDate()}
              </span>
              <span className="month">
                {new Date(event.event_date)
                  .toLocaleDateString("id-ID", { month: "short" })
                  .toUpperCase()}
              </span>
            </div>

            <div className="event-details">
              <h4 className="event-title">{event.title}</h4>

              <div className="event-meta">
                {event.event_time && (
                  <div className="meta-item">
                    <Clock size={12} />
                    <span>{event.event_time.substring(0, 5)} WIB</span>
                  </div>
                )}
                {event.location && (
                  <div className="meta-item">
                    <MapPin size={12} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p
                  className="event-desc"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {(() => {
                    const words = event.description.split(" ");
                    if (words.length > 15) {
                      return words.slice(0, 15).join(" ") + "...";
                    }
                    return event.description;
                  })()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Indicator dots */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.35rem",
            paddingTop: "0.5rem",
          }}
        >
          {Array.from({ length: totalPages }).map((_, idx) => (
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
