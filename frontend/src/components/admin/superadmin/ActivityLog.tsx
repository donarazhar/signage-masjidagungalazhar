import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Search,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  User,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Database,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface ActivityLogItem {
  id: number;
  user_id: number | null;
  mosque_id: number | null;
  action: string;
  model_type: string | null;
  model_id: number | null;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user: { id: number; name: string; email: string } | null;
  mosque: { id: number; name: string } | null;
}

interface PaginatedResponse {
  data: ActivityLogItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ActivityStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  by_action: Record<string, number>;
}

const actionConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string; label: string }
> = {
  login: {
    icon: <LogIn size={14} />,
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    label: "Login",
  },
  logout: {
    icon: <LogOut size={14} />,
    color: "#6b7280",
    bgColor: "#f3f4f6",
    label: "Logout",
  },
  create: {
    icon: <Plus size={14} />,
    color: "#22c55e",
    bgColor: "#f0fdf4",
    label: "Tambah",
  },
  update: {
    icon: <Edit size={14} />,
    color: "#3b82f6",
    bgColor: "#eff6ff",
    label: "Ubah",
  },
  delete: {
    icon: <Trash2 size={14} />,
    color: "#ef4444",
    bgColor: "#fef2f2",
    label: "Hapus",
  },
  backup: {
    icon: <Database size={14} />,
    color: "#f59e0b",
    bgColor: "#fffbeb",
    label: "Backup",
  },
  restore: {
    icon: <RefreshCw size={14} />,
    color: "#06b6d4",
    bgColor: "#ecfeff",
    label: "Restore",
  },
};

export default function ActivityLog() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Build query params
  const buildParams = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (search) params.append("search", search);
    if (actionFilter) params.append("action", actionFilter);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    return params.toString();
  };

  // Fetch activity logs
  const { data: logsData, isLoading } = useQuery<PaginatedResponse>({
    queryKey: [
      "activity-logs",
      page,
      perPage,
      search,
      actionFilter,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/activity-logs?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Fetch stats
  const { data: stats } = useQuery<ActivityStats>({
    queryKey: ["activity-logs-stats"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/activity-logs/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Fetch action types
  const { data: actionTypes } = useQuery<string[]>({
    queryKey: ["activity-logs-action-types"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/activity-logs/action-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Export handler
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams();
      if (actionFilter) params.append("action", actionFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await fetch(
        `${API_URL}/activity-logs/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_log_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Export berhasil!");
    } catch {
      toast.error("Gagal export data");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadge = (action: string) => {
    const config = actionConfig[action] || {
      icon: <Activity size={14} />,
      color: "#6b7280",
      bgColor: "#f3f4f6",
      label: action,
    };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: config.color,
          background: config.bgColor,
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Activity size={28} style={{ color: "var(--primary-500)" }} />
            Activity Log
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
            Pantau semua aktivitas yang terjadi di sistem
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1rem",
            background: "var(--primary-500)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            label: "Total Aktivitas",
            value: stats?.total || 0,
            icon: <Activity size={20} />,
          },
          {
            label: "Hari Ini",
            value: stats?.today || 0,
            icon: <Clock size={20} />,
          },
          {
            label: "Minggu Ini",
            value: stats?.this_week || 0,
            icon: <Calendar size={20} />,
          },
          {
            label: "Bulan Ini",
            value: stats?.this_month || 0,
            icon: <FileText size={20} />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "1.25rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    marginTop: "0.25rem",
                  }}
                >
                  {stat.value.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "var(--primary-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-500)",
                }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1rem",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem 0.625rem 2.5rem",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.875rem",
            }}
          />
        </div>

        {/* Action Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={18} style={{ color: "#64748b" }} />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.625rem 0.75rem",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.875rem",
              minWidth: "140px",
            }}
          >
            <option value="">Semua Aksi</option>
            {actionTypes?.map((action) => (
              <option key={action} value={action}>
                {actionConfig[action]?.label || action}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={18} style={{ color: "#64748b" }} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.625rem 0.75rem",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.875rem",
            }}
          />
          <span style={{ color: "#64748b" }}>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.625rem 0.75rem",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.875rem",
            }}
          />
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setSearch("");
            setActionFilter("");
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
          style={{
            padding: "0.625rem 0.75rem",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "#64748b",
            fontSize: "0.875rem",
          }}
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Waktu
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                User
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Aksi
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Deskripsi
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                IP Address
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Memuat data...
                </td>
              </tr>
            ) : logsData?.data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Tidak ada data aktivitas
                </td>
              </tr>
            ) : (
              logsData?.data.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontSize: "0.875rem", color: "#1e293b" }}>
                      {formatDate(log.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "var(--primary-100)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary-600)",
                        }}
                      >
                        <User size={16} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#1e293b",
                            fontSize: "0.875rem",
                          }}
                        >
                          {log.user?.name || "System"}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                          {log.mosque?.name || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {getActionBadge(log.action)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        color: "#1e293b",
                        fontSize: "0.875rem",
                        maxWidth: "300px",
                      }}
                    >
                      {log.description}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: "#64748b",
                        fontSize: "0.875rem",
                      }}
                    >
                      <Globe size={14} />
                      {log.ip_address || "-"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {logsData && logsData.last_page > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Menampilkan {(page - 1) * perPage + 1} -{" "}
              {Math.min(page * perPage, logsData.total)} dari {logsData.total}{" "}
              data
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  background: page === 1 ? "#f1f5f9" : "white",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <span
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                }}
              >
                {page} / {logsData.last_page}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(logsData.last_page, p + 1))
                }
                disabled={page === logsData.last_page}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  background: page === logsData.last_page ? "#f1f5f9" : "white",
                  cursor:
                    page === logsData.last_page ? "not-allowed" : "pointer",
                  opacity: page === logsData.last_page ? 0.5 : 1,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
