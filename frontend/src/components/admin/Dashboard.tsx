import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { displayService } from "../../services/displayService";
import { adminService } from "../../services/adminService";
import {
  FileImage,
  Calendar,
  CreditCard,
  MessageSquare,
  Palette,
  Monitor,
  ExternalLink,
  Users,
  Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  displayTemplates,
  displayLayouts,
} from "../../styles/displayTemplates";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);

  const isSuperAdmin = user?.role === "superadmin";

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => displayService.getSettings(),
  });

  const { data: contents } = useQuery({
    queryKey: ["activeContents"],
    queryFn: () => displayService.getActiveContents(),
    enabled: isSuperAdmin,
  });

  const { data: runningTexts } = useQuery({
    queryKey: ["activeRunningTexts"],
    queryFn: () => displayService.getActiveRunningTexts(),
    enabled: isSuperAdmin,
  });

  const { data: events } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: () => displayService.getUpcomingEvents(),
    enabled: isSuperAdmin,
  });

  const { data: donations } = useQuery({
    queryKey: ["activeDonations"],
    queryFn: () => displayService.getActiveDonations(),
    enabled: isSuperAdmin,
  });

  // Template mutation
  const templateMutation = useMutation({
    mutationFn: (templateId: string) =>
      adminService.bulkUpdateSettings([
        { key: "display_template", value: templateId, type: "string" },
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Template berhasil diubah!", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#10b981",
          color: "#fff",
          fontWeight: 600,
          padding: "12px 20px",
          borderRadius: "10px",
        },
      });
    },
  });

  // Layout mutation
  const layoutMutation = useMutation({
    mutationFn: (layoutId: string) =>
      adminService.bulkUpdateSettings([
        { key: "display_layout", value: layoutId, type: "string" },
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Layout berhasil diubah!", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#10b981",
          color: "#fff",
          fontWeight: 600,
          padding: "12px 20px",
          borderRadius: "10px",
        },
      });
    },
  });

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    templateMutation.mutate(templateId);
  };

  const handleLayoutChange = (layoutId: string) => {
    setSelectedLayout(layoutId);
    layoutMutation.mutate(layoutId);
  };

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Selamat Pagi"
      : today.getHours() < 15
        ? "Selamat Siang"
        : today.getHours() < 18
          ? "Selamat Sore"
          : "Selamat Malam";

  const currentTemplate =
    selectedTemplate || settings?.display_template || "classic";
  const currentLayout = selectedLayout || settings?.display_layout || "classic";

  // Super Admin Stats
  const stats = [
    {
      icon: FileImage,
      value: contents?.length || 0,
      label: "Konten Aktif",
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      icon: MessageSquare,
      value: runningTexts?.length || 0,
      label: "Running Text",
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      icon: Calendar,
      value: events?.length || 0,
      label: "Agenda",
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
    },
    {
      icon: CreditCard,
      value: donations?.length || 0,
      label: "Donasi",
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
  ];

  // ======================
  // MOSQUE ADMIN DASHBOARD
  // ======================
  if (!isSuperAdmin) {
    return (
      <div
        className="animate-fade-in"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>
            {greeting} 👋
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
            Kelola tampilan display masjid Anda
          </p>
        </div>

        {/* Main Grid - 2 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Display Preview Card */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "1.25rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <Monitor size={20} style={{ color: "#64748b" }} />
              <h2
                style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}
              >
                Preview Display
              </h2>
            </div>
            {/* Preview */}
            <div
              style={{
                background:
                  displayTemplates[currentTemplate]?.colors.bodyBg || "#0f172a",
                borderRadius: "12px",
                overflow: "hidden",
                aspectRatio: "16/9",
                position: "relative",
              }}
            >
              {/* Mini header */}
              <div
                style={{
                  height: "18%",
                  background:
                    displayTemplates[currentTemplate]?.colors.headerBg,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color:
                        displayTemplates[currentTemplate]?.colors.headerText,
                      fontWeight: 600,
                    }}
                  >
                    {settings?.mosque_name || "Masjid Preview"}
                  </div>
                </div>
              </div>
              {/* Mini content */}
              <div
                style={{
                  display: "flex",
                  padding: "8px",
                  gap: "6px",
                  height: "64%",
                }}
              >
                <div
                  style={{
                    width: "25%",
                    background:
                      displayTemplates[currentTemplate]?.colors.cardBg,
                    borderRadius: "6px",
                    border: `1px solid ${displayTemplates[currentTemplate]?.colors.cardBorder}`,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "6px",
                  }}
                />
                <div
                  style={{
                    width: "20%",
                    background:
                      displayTemplates[currentTemplate]?.colors.prayerBarBg,
                    borderRadius: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    padding: "4px",
                  }}
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        background:
                          i === 2
                            ? displayTemplates[currentTemplate]?.colors.accent
                            : "rgba(255,255,255,0.1)",
                        borderRadius: "3px",
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Mini ticker */}
              <div
                style={{
                  height: "18%",
                  background:
                    displayTemplates[currentTemplate]?.colors.headerBg,
                }}
              />
            </div>
            {/* Open Display Button */}
            <a
              href={`/display`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                background: "var(--primary-600)",
                color: "white",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              <ExternalLink size={16} />
              Buka Display
            </a>
          </div>

          {/* Template Selection */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "1.25rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <Palette size={20} style={{ color: "#64748b" }} />
              <h2
                style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}
              >
                Template Tampilan
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.75rem",
              }}
            >
              {Object.values(displayTemplates).map((template) => {
                const isSelected = currentTemplate === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "10px",
                      border: isSelected
                        ? "3px solid #22c55e"
                        : "2px solid #e2e8f0",
                      overflow: "hidden",
                      transition: "all 0.2s",
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                      boxShadow: isSelected
                        ? "0 4px 16px rgba(34, 197, 94, 0.25)"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        height: "50px",
                        background: template.colors.headerBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: template.colors.accent,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        background: "#f8fafc",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: "#1e293b",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        {isSelected && (
                          <span style={{ color: "#22c55e" }}>✓</span>
                        )}
                        {template.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Layout Selector - Full Width Row */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
            marginTop: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <Monitor size={20} style={{ color: "#64748b" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
              Layout Tampilan
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "0.75rem",
            }}
          >
            {Object.values(displayLayouts).map((layout) => {
              const isSelected = currentLayout === layout.id;
              // Get current template colors for preview
              const templateColors =
                displayTemplates[currentTemplate]?.colors ||
                displayTemplates.classic.colors;
              const headerBg = templateColors.headerBg.includes("gradient")
                ? templateColors.accent
                : templateColors.headerBg;
              const bodyBg = templateColors.bodyBg;
              const cardBg = templateColors.cardBg;
              const accent = templateColors.accent;

              // Layout preview icons with template colors
              const layoutIcons: Record<string, React.ReactNode> = {
                classic: (
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      height: 48,
                      background: bodyBg,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    {/* Left sidebar */}
                    <div
                      style={{
                        width: 12,
                        background: headerBg,
                        display: "flex",
                        flexDirection: "column",
                        padding: 2,
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          height: 4,
                          width: "100%",
                          background: accent,
                          borderRadius: 1,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: 1,
                        }}
                      />
                    </div>
                    {/* Content */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        padding: 2,
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          height: 4,
                          background: headerBg,
                          borderRadius: 1,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          background: cardBg,
                          borderRadius: 2,
                          border: `1px solid ${accent}40`,
                        }}
                      />
                      <div
                        style={{
                          height: 3,
                          background: accent,
                          borderRadius: 1,
                        }}
                      />
                    </div>
                    {/* Right sidebar */}
                    <div
                      style={{
                        width: 14,
                        background: cardBg,
                        display: "flex",
                        flexDirection: "column",
                        padding: 2,
                        gap: 1,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            height: 5,
                            background:
                              i === 2 ? accent : "rgba(255,255,255,0.1)",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ),
                cinematic: (
                  <div
                    style={{
                      position: "relative",
                      height: 48,
                      background: `linear-gradient(45deg, ${bodyBg}, #333)`,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    {/* Full screen content */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 50%)",
                      }}
                    />
                    {/* Top left - Logo */}
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: 3,
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: accent,
                        }}
                      />
                      <div
                        style={{
                          width: 16,
                          height: 3,
                          background: "rgba(255,255,255,0.6)",
                          borderRadius: 1,
                        }}
                      />
                    </div>
                    {/* Top center - Hadith */}
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 24,
                        height: 8,
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: 2,
                      }}
                    />
                    {/* Right sidebar - Date & Prayer */}
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        bottom: 12,
                        width: 14,
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        padding: 2,
                        gap: 1,
                      }}
                    >
                      <div
                        style={{
                          height: 4,
                          background: accent,
                          borderRadius: 1,
                        }}
                      />
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{
                            height: 3,
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </div>
                    {/* Bottom - Running text */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: headerBg,
                      }}
                    />
                  </div>
                ),
                focus: (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: 48,
                      background: bodyBg,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        height: 6,
                        background: headerBg,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 3px",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: accent,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: 1,
                        }}
                      />
                    </div>
                    {/* Content 70/30 */}
                    <div
                      style={{ flex: 1, display: "flex", gap: 1, padding: 2 }}
                    >
                      <div
                        style={{
                          flex: 7,
                          background: cardBg,
                          borderRadius: 2,
                          border: `1px solid ${accent}20`,
                        }}
                      />
                      <div
                        style={{
                          flex: 3,
                          background: cardBg,
                          borderRadius: 2,
                          display: "flex",
                          flexDirection: "column",
                          padding: 2,
                          gap: 1,
                        }}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              height: 4,
                              background:
                                i === 2 ? accent : "rgba(255,255,255,0.15)",
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Footer */}
                    <div style={{ height: 4, background: headerBg }} />
                  </div>
                ),
                dashboard: (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: 48,
                      background: bodyBg,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        height: 5,
                        background: headerBg,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 3px",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: "50%",
                          background: accent,
                        }}
                      />
                      <div style={{ flex: 1 }} />
                      <div
                        style={{
                          width: 12,
                          height: 2,
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: 1,
                        }}
                      />
                    </div>
                    {/* Content 50/50 */}
                    <div style={{ flex: 1, display: "flex" }}>
                      {/* Left - Content */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            margin: 2,
                            background: cardBg,
                            borderRadius: 2,
                            border: `1px solid ${accent}20`,
                          }}
                        />
                        <div style={{ height: 4, background: headerBg }} />
                      </div>
                      {/* Right - Prayer Dashboard */}
                      <div
                        style={{
                          flex: 1,
                          background: cardBg,
                          display: "flex",
                          flexDirection: "column",
                          padding: 2,
                          gap: 1,
                        }}
                      >
                        {/* Clock */}
                        <div
                          style={{
                            textAlign: "center",
                            fontSize: 8,
                            fontWeight: 700,
                            color: accent,
                            lineHeight: 1,
                          }}
                        >
                          09:58
                        </div>
                        {/* Prayer times */}
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            style={{
                              height: 4,
                              background:
                                i === 2 ? accent : "rgba(255,255,255,0.1)",
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ),
                fullscreen: (
                  <div
                    style={{
                      position: "relative",
                      height: 48,
                      background: `linear-gradient(45deg, ${bodyBg}, #333)`,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    {/* Full screen background */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%)",
                      }}
                    />
                    {/* Top bar: clock | name | date */}
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        right: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 5,
                          background: "rgba(0,0,0,0.5)",
                          borderRadius: 1,
                        }}
                      />
                      <div
                        style={{
                          width: 20,
                          height: 5,
                          background: "rgba(0,0,0,0.5)",
                          borderRadius: 1,
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 5,
                          background: "rgba(0,0,0,0.5)",
                          borderRadius: 1,
                        }}
                      />
                    </div>
                    {/* Bottom prayer bar */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 6,
                        left: 0,
                        right: 0,
                        height: 8,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        gap: 1,
                        padding: "0 2px",
                        alignItems: "center",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 4,
                            background:
                              i === 3 ? accent : "rgba(255,255,255,0.2)",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </div>
                    {/* Running text */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 5,
                        background: headerBg,
                      }}
                    />
                  </div>
                ),
              };
              return (
                <div
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout.id)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "10px",
                    border: isSelected
                      ? "3px solid #22c55e"
                      : "2px solid #e2e8f0",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    boxShadow: isSelected
                      ? "0 4px 16px rgba(34, 197, 94, 0.25)"
                      : "none",
                    padding: "0.75rem",
                    background: "#f8fafc",
                  }}
                >
                  {layoutIcons[layout.id] || layoutIcons.classic}
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      color: "#1e293b",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {isSelected && <span style={{ color: "#22c55e" }}>✓</span>}
                    {layout.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#64748b",
                      marginTop: 2,
                    }}
                  >
                    {layout.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // ======================
  // SUPER ADMIN DASHBOARD
  // ======================
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>
          {greeting} 👋
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
          Panel Administrasi Super Admin
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: stat.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <stat.icon size={22} style={{ color: stat.color }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid - Preview, Template, Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Preview Display - Static (No Live Data) */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Monitor size={20} style={{ color: "#64748b" }} />
              <h2
                style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}
              >
                Preview Tampilan
              </h2>
            </div>
            <a
              href={`/display?preview=true&template=${currentTemplate}&layout=${currentLayout}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "var(--primary-600)",
                fontSize: "0.7rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Buka <ExternalLink size={10} />
            </a>
          </div>
          {/* Static Preview based on layout */}
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              aspectRatio: "16/9",
              background:
                displayTemplates[currentTemplate]?.colors.bodyBg || "#0f172a",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                height: "14%",
                background: displayTemplates[currentTemplate]?.colors.headerBg,
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: displayTemplates[currentTemplate]?.colors.accent,
                }}
              />
              <div
                style={{
                  width: 40,
                  height: 6,
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: 2,
                }}
              />
            </div>
            {/* Body based on layout */}
            <div style={{ flex: 1, display: "flex", padding: 4, gap: 3 }}>
              {currentLayout === "classic" && (
                <>
                  <div
                    style={{
                      width: "20%",
                      background:
                        displayTemplates[currentTemplate]?.colors.cardBg,
                      borderRadius: 4,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 4,
                    }}
                  />
                  <div
                    style={{
                      width: "18%",
                      background:
                        displayTemplates[currentTemplate]?.colors.prayerBarBg,
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: 3,
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background:
                            i === 2
                              ? displayTemplates[currentTemplate]?.colors.accent
                              : "rgba(255,255,255,0.1)",
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              {currentLayout === "cinematic" && (
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: "25%",
                      height: "60%",
                      background: "rgba(0,0,0,0.4)",
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: 3,
                    }}
                  >
                    <div
                      style={{
                        height: 8,
                        background:
                          displayTemplates[currentTemplate]?.colors.accent,
                        borderRadius: 2,
                      }}
                    />
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.15)",
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {currentLayout === "focus" && (
                <>
                  <div
                    style={{
                      flex: 7,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 4,
                    }}
                  />
                  <div
                    style={{
                      flex: 3,
                      background:
                        displayTemplates[currentTemplate]?.colors.cardBg,
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: 3,
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background:
                            i === 2
                              ? displayTemplates[currentTemplate]?.colors.accent
                              : "rgba(255,255,255,0.1)",
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              {currentLayout === "dashboard" && (
                <>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 4,
                        margin: 2,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background:
                        displayTemplates[currentTemplate]?.colors.cardBg,
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      padding: 4,
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 8,
                        fontWeight: 700,
                        color: displayTemplates[currentTemplate]?.colors.accent,
                      }}
                    >
                      09:58
                    </div>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background:
                            i === 2
                              ? displayTemplates[currentTemplate]?.colors.accent
                              : "rgba(255,255,255,0.1)",
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              {currentLayout === "fullscreen" && (
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 4,
                  }}
                >
                  {/* Top overlay bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: 4,
                      right: 4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 8,
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: 2,
                      }}
                    />
                    <div
                      style={{
                        width: 40,
                        height: 8,
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: 2,
                      }}
                    />
                    <div
                      style={{
                        width: 20,
                        height: 8,
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  {/* Bottom prayer bar */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 14,
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      gap: 2,
                      padding: "2px 3px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 6,
                          background:
                            i === 2
                              ? displayTemplates[currentTemplate]?.colors.accent
                              : "rgba(255,255,255,0.15)",
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {currentLayout === "tv" && (
                <>
                  <div
                    style={{
                      flex: 7,
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 4,
                      position: "relative",
                    }}
                  >
                    {/* Date bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 8,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 4px",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 4,
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: 1,
                        }}
                      />
                      <div
                        style={{
                          width: 16,
                          height: 4,
                          background:
                            displayTemplates[currentTemplate]?.colors.accent,
                          borderRadius: 1,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: 3,
                      background:
                        displayTemplates[currentTemplate]?.colors.cardBg,
                      borderRadius: 4,
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background:
                            i === 2
                              ? displayTemplates[currentTemplate]?.colors.accent
                              : `${displayTemplates[currentTemplate]?.colors.accent}25`,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0 3px",
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 3,
                            background: "rgba(255,255,255,0.3)",
                            borderRadius: 1,
                          }}
                        />
                        <div
                          style={{
                            width: 10,
                            height: 3,
                            background:
                              i === 2
                                ? "rgba(255,255,255,0.5)"
                                : displayTemplates[currentTemplate]?.colors
                                    .accent,
                            borderRadius: 1,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {currentLayout === "qris" && (
                <>
                  <div
                    style={{
                      flex: 7,
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 4,
                      position: "relative",
                    }}
                  >
                    {/* Date bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 8,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 4px",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 4,
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: 1,
                        }}
                      />
                      <div
                        style={{
                          width: 16,
                          height: 4,
                          background:
                            displayTemplates[currentTemplate]?.colors.accent,
                          borderRadius: 1,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      padding: 4,
                      background:
                        displayTemplates[currentTemplate]?.colors.cardBg,
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Countdown */}
                    <div
                      style={{
                        width: "100%",
                        textAlign: "center",
                        padding: "2px 0",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 3,
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: 1,
                          margin: "0 auto 2px",
                        }}
                      />
                      <div
                        style={{
                          width: 20,
                          height: 5,
                          background:
                            displayTemplates[currentTemplate]?.colors.accent,
                          borderRadius: 1,
                          margin: "0 auto",
                        }}
                      />
                    </div>
                    {/* QR placeholder */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        background: "white",
                        borderRadius: 3,
                      }}
                    />
                    <div
                      style={{
                        width: 16,
                        height: 3,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: 1,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            {/* Footer */}
            <div
              style={{
                height: "10%",
                background: displayTemplates[currentTemplate]?.colors.headerBg,
              }}
            />
          </div>
          <p
            style={{
              fontSize: "0.65rem",
              color: "#94a3b8",
              marginTop: "0.5rem",
              textAlign: "center",
            }}
          >
            {displayLayouts[currentLayout]?.name} •{" "}
            {displayTemplates[currentTemplate]?.name}
          </p>
        </div>
      </div>

      {/* Bottom Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Super Admin Management */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: "1rem",
            }}
          >
            ⚙️ Manajemen
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <a
              href="/admin/mosques"
              className="btn btn-secondary"
              style={{
                textDecoration: "none",
                justifyContent: "flex-start",
                padding: "0.75rem",
              }}
            >
              <Building2 size={16} /> Kelola Masjid
            </a>
            <a
              href="/admin/users"
              className="btn btn-secondary"
              style={{
                textDecoration: "none",
                justifyContent: "flex-start",
                padding: "0.75rem",
              }}
            >
              <Users size={16} /> Kelola User
            </a>
          </div>
        </div>

        {/* System Status */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: "1rem",
            }}
          >
            ⚡ Status
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Display
              </span>
              <span
                style={{
                  color: "#22c55e",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                ● Online
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Server
              </span>
              <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                {new Date().toLocaleTimeString("id-ID")}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Versi
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                v1.2.0
              </span>
            </div>
          </div>
        </div>
        {/* Template Tampilan */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <Palette size={20} style={{ color: "#64748b" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
              Template Tampilan
            </h2>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}
          >
            {Object.values(displayTemplates).map((tmpl) => {
              const isSelected = currentTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleTemplateChange(tmpl.id)}
                  style={{
                    cursor: "pointer",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: isSelected
                      ? "2px solid #22c55e"
                      : "1px solid #e2e8f0",
                    background: isSelected ? "#f0fdf4" : "#fafafb",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      background: tmpl.colors.headerBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: tmpl.colors.accent,
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#1e293b",
                      }}
                    >
                      {isSelected && (
                        <span style={{ color: "#22c55e", marginRight: 4 }}>
                          ✓
                        </span>
                      )}
                      {tmpl.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      {tmpl.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layout Tampilan */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <Monitor size={20} style={{ color: "#64748b" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
              Layout Tampilan
            </h2>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}
          >
            {Object.values(displayLayouts).map((layout) => {
              const isSelected = currentLayout === layout.id;
              const templateColors =
                displayTemplates[currentTemplate]?.colors ||
                displayTemplates.classic.colors;
              return (
                <div
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout.id)}
                  style={{
                    cursor: "pointer",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: isSelected
                      ? "2px solid #22c55e"
                      : "1px solid #e2e8f0",
                    background: isSelected ? "#f0fdf4" : "#fafafb",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    {/* Mini layout preview */}
                    <div
                      style={{
                        width: 48,
                        height: 32,
                        borderRadius: 4,
                        background: templateColors.bodyBg,
                        border: `1px solid ${templateColors.accent}40`,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          height: 4,
                          background: templateColors.headerBg,
                        }}
                      />
                      <div
                        style={{ flex: 1, display: "flex", gap: 1, padding: 1 }}
                      >
                        {layout.id === "classic" && (
                          <>
                            <div
                              style={{
                                width: 6,
                                background: templateColors.cardBg,
                              }}
                            />
                            <div
                              style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.05)",
                              }}
                            />
                            <div
                              style={{
                                width: 8,
                                background: templateColors.cardBg,
                              }}
                            />
                          </>
                        )}
                        {layout.id === "cinematic" && (
                          <div
                            style={{
                              flex: 1,
                              background: "rgba(255,255,255,0.05)",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                bottom: 1,
                                right: 1,
                                width: 10,
                                height: 12,
                                background: "rgba(0,0,0,0.3)",
                                borderRadius: 1,
                              }}
                            />
                          </div>
                        )}
                        {layout.id === "focus" && (
                          <>
                            <div
                              style={{
                                flex: 7,
                                background: "rgba(255,255,255,0.05)",
                              }}
                            />
                            <div
                              style={{
                                flex: 3,
                                background: templateColors.cardBg,
                              }}
                            />
                          </>
                        )}
                        {layout.id === "dashboard" && (
                          <>
                            <div
                              style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.05)",
                              }}
                            />
                            <div
                              style={{
                                flex: 1,
                                background: templateColors.cardBg,
                              }}
                            />
                          </>
                        )}
                        {layout.id === "fullscreen" && (
                          <div
                            style={{
                              flex: 1,
                              background: "rgba(255,255,255,0.05)",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 1,
                                left: 1,
                                right: 1,
                                height: 3,
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <div style={{ width: 5, background: "rgba(0,0,0,0.4)", borderRadius: 1 }} />
                              <div style={{ width: 10, background: "rgba(0,0,0,0.4)", borderRadius: 1 }} />
                              <div style={{ width: 5, background: "rgba(0,0,0,0.4)", borderRadius: 1 }} />
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: "rgba(0,0,0,0.4)",
                              }}
                            />
                          </div>
                        )}
                        {layout.id === "tv" && (
                          <>
                            <div
                              style={{
                                flex: 7,
                                background: "rgba(255,255,255,0.05)",
                              }}
                            />
                            <div
                              style={{
                                flex: 3,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                padding: 1,
                              }}
                            >
                              {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  style={{
                                    flex: 1,
                                    background:
                                      i === 2
                                        ? templateColors.accent
                                        : `${templateColors.accent}30`,
                                    borderRadius: 1,
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                        {layout.id === "qris" && (
                          <>
                            <div
                              style={{
                                flex: 7,
                                background: "rgba(255,255,255,0.05)",
                              }}
                            />
                            <div
                              style={{
                                flex: 3,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2,
                                padding: 2,
                                background: "rgba(0,0,0,0.3)",
                              }}
                            >
                              <div
                                style={{
                                  width: 14,
                                  height: 14,
                                  background: "white",
                                  borderRadius: 2,
                                }}
                              />
                              <div
                                style={{
                                  width: 10,
                                  height: 2,
                                  background: templateColors.accent,
                                  borderRadius: 1,
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div
                        style={{
                          height: 3,
                          background: templateColors.headerBg,
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "#1e293b",
                        }}
                      >
                        {isSelected && (
                          <span style={{ color: "#22c55e", marginRight: 4 }}>
                            ✓
                          </span>
                        )}
                        {layout.name}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                        {layout.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
