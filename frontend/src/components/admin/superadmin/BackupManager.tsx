import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  HardDrive,
  Calendar,
  FileArchive,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface BackupItem {
  filename: string;
  size: number;
  size_formatted: string;
  created_at: string;
  type: "database" | "full";
}

interface BackupsResponse {
  backups: BackupItem[];
  total_size: number;
  total_size_formatted: string;
  count: number;
}

export default function BackupManager() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch backups
  const {
    data: backupsData,
    isLoading,
    refetch,
  } = useQuery<BackupsResponse>({
    queryKey: ["backups"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/backups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/backups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to create backup");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast.success(data.message || "Backup berhasil dibuat");
      setIsCreating(false);
    },
    onError: () => {
      toast.error("Gagal membuat backup");
      setIsCreating(false);
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async (filename: string) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/backups/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      toast.success("Backup berhasil dihapus");
      setDeleteConfirm(null);
    },
    onError: () => {
      toast.error("Gagal menghapus backup");
    },
  });

  const handleCreateBackup = () => {
    setIsCreating(true);
    createBackupMutation.mutate();
  };

  const handleDownload = async (filename: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/backups/${filename}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Download dimulai");
    } catch {
      toast.error("Gagal download file");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const lastBackup = backupsData?.backups?.[0];

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
            <Database size={28} style={{ color: "var(--primary-500)" }} />
            Backup Data
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
            Kelola backup database untuk keamanan data sistem
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => refetch()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              background: "#f1f5f9",
              color: "#64748b",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              background: isCreating ? "#94a3b8" : "var(--primary-500)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: isCreating ? "not-allowed" : "pointer",
            }}
          >
            {isCreating ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Membuat Backup...
              </>
            ) : (
              <>
                <Plus size={18} />
                Buat Backup Baru
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Total Backups */}
        <div
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
                Total Backup
              </div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginTop: "0.25rem",
                }}
              >
                {backupsData?.count || 0}
              </div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22c55e",
              }}
            >
              <FileArchive size={24} />
            </div>
          </div>
        </div>

        {/* Storage Used */}
        <div
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
                Penyimpanan Terpakai
              </div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginTop: "0.25rem",
                }}
              >
                {backupsData?.total_size_formatted || "0 B"}
              </div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3b82f6",
              }}
            >
              <HardDrive size={24} />
            </div>
          </div>
        </div>

        {/* Last Backup */}
        <div
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
                Backup Terakhir
              </div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginTop: "0.25rem",
                }}
              >
                {lastBackup ? getTimeAgo(lastBackup.created_at) : "Belum ada"}
              </div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: lastBackup ? "#f0fdf4" : "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: lastBackup ? "#22c55e" : "#ef4444",
              }}
            >
              {lastBackup ? (
                <CheckCircle size={24} />
              ) : (
                <AlertTriangle size={24} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <AlertTriangle
          size={20}
          style={{ color: "#f59e0b", marginTop: "2px" }}
        />
        <div>
          <div style={{ fontWeight: 600, color: "#92400e" }}>Tips Backup</div>
          <div
            style={{
              color: "#92400e",
              fontSize: "0.875rem",
              marginTop: "0.25rem",
            }}
          >
            Lakukan backup secara berkala untuk menjaga keamanan data.
            Disarankan minimal 1x seminggu atau sebelum melakukan perubahan
            besar pada sistem.
          </div>
        </div>
      </div>

      {/* Backups Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
            Daftar Backup
          </h2>
        </div>

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
                Nama File
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
                Tipe
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
                Ukuran
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
                Tanggal Dibuat
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Aksi
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
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 0.5rem",
                    }}
                  />
                  <div>Memuat data...</div>
                </td>
              </tr>
            ) : backupsData?.backups.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: "3rem", textAlign: "center" }}
                >
                  <Database
                    size={48}
                    style={{ color: "#94a3b8", margin: "0 auto 1rem" }}
                  />
                  <div style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                    Belum ada backup tersedia
                  </div>
                  <button
                    onClick={handleCreateBackup}
                    disabled={isCreating}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "var(--primary-500)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Buat Backup Pertama
                  </button>
                </td>
              </tr>
            ) : (
              backupsData?.backups.map((backup) => (
                <tr
                  key={backup.filename}
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          background: "#f0fdf4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#22c55e",
                        }}
                      >
                        <FileArchive size={20} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#1e293b",
                            fontSize: "0.875rem",
                          }}
                        >
                          {backup.filename}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background:
                          backup.type === "full" ? "#eff6ff" : "#f0fdf4",
                        color: backup.type === "full" ? "#3b82f6" : "#22c55e",
                      }}
                    >
                      {backup.type === "full" ? "Full Backup" : "Database"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "#64748b" }}>
                    {backup.size_formatted}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Calendar size={16} style={{ color: "#94a3b8" }} />
                      <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        {formatDate(backup.created_at)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => handleDownload(backup.filename)}
                        style={{
                          padding: "0.5rem",
                          background: "#eff6ff",
                          color: "#3b82f6",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      {deleteConfirm === backup.filename ? (
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            onClick={() =>
                              deleteBackupMutation.mutate(backup.filename)
                            }
                            style={{
                              padding: "0.5rem 0.75rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: "0.5rem 0.75rem",
                              background: "#f1f5f9",
                              color: "#64748b",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(backup.filename)}
                          style={{
                            padding: "0.5rem",
                            background: "#fef2f2",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
