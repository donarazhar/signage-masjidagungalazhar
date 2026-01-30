import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { displayService } from "../../services/displayService";
import { adminService } from "../../services/adminService";
import { Save, MapPin, Upload, Image, Trash2, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import type { Settings } from "../../types";
import SearchableSelect from "../ui/SearchableSelect";

interface City {
  id: string;
  lokasi: string;
}

export default function PrayerSettings() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => displayService.getSettings(),
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      const response = await api.get("/prayer-times/cities");
      return response.data;
    },
  });

  const [formData, setFormData] = useState<Partial<Settings>>({});

  // Initialize logo preview when settings load
  useEffect(() => {
    if (settings?.mosque_logo) {
      setLogoPreview(settings.mosque_logo);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (
      settings: Array<{ key: string; value: unknown; type: string }>,
    ) => adminService.bulkUpdateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Pengaturan berhasil disimpan!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#10b981",
          color: "#fff",
          fontWeight: 600,
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)",
        },
        icon: "✅",
      });
    },
    onError: () => {
      toast.error("Gagal menyimpan pengaturan!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "#fff",
          fontWeight: 600,
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(239, 68, 68, 0.3)",
        },
        icon: "❌",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updates = [
      {
        key: "mosque_name",
        value: formData.mosque_name ?? settings?.mosque_name ?? "",
        type: "string",
      },
      {
        key: "mosque_address",
        value: formData.mosque_address ?? settings?.mosque_address ?? "",
        type: "string",
      },
      {
        key: "city_id",
        value: formData.city_id ?? settings?.city_id ?? "1301",
        type: "string",
      },
      {
        key: "city",
        value: formData.city ?? settings?.city ?? "",
        type: "string",
      },
      {
        key: "prayer_duration",
        value: formData.prayer_duration ?? settings?.prayer_duration ?? 15,
        type: "number",
      },
      {
        key: "countdown_before",
        value: formData.countdown_before ?? settings?.countdown_before ?? 10,
        type: "number",
      },
      {
        key: "iqamah_duration",
        value: formData.iqamah_duration ??
          settings?.iqamah_duration ?? {
            fajr: 10,
            dhuhr: 10,
            asr: 10,
            maghrib: 5,
            isha: 10,
          },
        type: "json",
      },
      {
        key: "prayer_time_offset",
        value: formData.prayer_time_offset ??
          settings?.prayer_time_offset ?? {
            fajr: 0,
            sunrise: 0,
            dhuhr: 0,
            asr: 0,
            maghrib: 0,
            isha: 0,
          },
        type: "json",
      },
      {
        key: "carousel_duration",
        value: formData.carousel_duration ?? settings?.carousel_duration ?? 10,
        type: "number",
      },
      {
        key: "running_text_speed",
        value:
          formData.running_text_speed ?? settings?.running_text_speed ?? 80,
        type: "number",
      },
      {
        key: "display_template",
        value:
          formData.display_template ?? settings?.display_template ?? "classic",
        type: "string",
      },
    ];

    try {
      await updateMutation.mutateAsync(updates);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof Settings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleIqamahChange = (prayer: string, value: number) => {
    const currentIqamah = formData.iqamah_duration ||
      settings?.iqamah_duration || {
        fajr: 10,
        dhuhr: 10,
        asr: 10,
        maghrib: 5,
        isha: 10,
      };
    setFormData((prev) => ({
      ...prev,
      iqamah_duration: {
        ...currentIqamah,
        [prayer]: value,
      },
    }));
  };

  const handleOffsetChange = (prayer: string, value: number) => {
    const currentOffset = formData.prayer_time_offset ||
      settings?.prayer_time_offset || {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      };
    setFormData((prev) => ({
      ...prev,
      prayer_time_offset: {
        ...currentOffset,
        [prayer]: value,
      },
    }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimum 2MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post("/settings/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Logo berhasil diupload");
      setLogoPreview(response.data.logo_url);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Gagal mengupload logo");
      // Revert preview
      setLogoPreview(settings?.mosque_logo || null);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus logo?")) return;

    setIsUploadingLogo(true);
    try {
      await api.delete("/settings/logo");
      toast.success("Logo berhasil dihapus");
      setLogoPreview(null);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast.error("Gagal menghapus logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-secondary)]">Memuat pengaturan...</div>
      </div>
    );
  }

  const iqamahDuration = formData.iqamah_duration ||
    settings?.iqamah_duration || {
      fajr: 10,
      dhuhr: 10,
      asr: 10,
      maghrib: 5,
      isha: 10,
    };

  const prayerTimeOffset = formData.prayer_time_offset ||
    settings?.prayer_time_offset || {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Lokasi & Jadwal Shalat
        </h1>
        <p className="text-[var(--text-secondary)]">
          Atur koordinat lokasi masjid dan pengaturan jadwal shalat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Logo Masjid
          </h2>
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}
          >
            {/* Logo Preview */}
            <div
              onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "16px",
                border: "2px dashed var(--slate-300)",
                background: "var(--slate-50)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: isUploadingLogo ? "wait" : "pointer",
                overflow: "hidden",
                transition: "all 0.2s",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {isUploadingLogo && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      border: "3px solid var(--primary-100)",
                      borderTopColor: "var(--primary-500)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                </div>
              )}
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Masjid"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <>
                  <Upload
                    size={28}
                    style={{ color: "var(--slate-400)", marginBottom: "8px" }}
                  />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--slate-400)",
                      textAlign: "center",
                    }}
                  >
                    Klik untuk upload
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleLogoChange}
              style={{ display: "none" }}
              disabled={isUploadingLogo}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Upload logo masjid Anda
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Logo akan ditampilkan pada layar display.
                <br />
                Format yang didukung: JPG, PNG, WebP, GIF
                <br />
                Ukuran maksimum: 2MB
                <br />
                Rekomendasi: 200x200 px (persegi)
              </p>
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  disabled={isUploadingLogo}
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.8125rem",
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    opacity: isUploadingLogo ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={14} />
                  Hapus Logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mosque Info */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Informasi Masjid
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nama Masjid</label>
              <input
                type="text"
                className="form-input"
                value={formData.mosque_name ?? settings?.mosque_name ?? ""}
                onChange={(e) => handleChange("mosque_name", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Kota</label>
              <input
                type="text"
                className="form-input"
                value={formData.city ?? settings?.city ?? ""}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Alamat</label>
              <input
                type="text"
                className="form-input"
                value={
                  formData.mosque_address ?? settings?.mosque_address ?? ""
                }
                onChange={(e) => handleChange("mosque_address", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* City Selection for Prayer Times */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Lokasi Jadwal Shalat
          </h2>
          <div>
            <label className="form-label">Pilih Kota/Kabupaten</label>
            <SearchableSelect
              options={cities.map((c) => ({ id: c.id, label: c.lokasi }))}
              value={formData.city_id ?? settings?.city_id ?? "1301"}
              onChange={(val) => handleChange("city_id", val)}
              placeholder="Cari kota atau kabupaten..."
            />
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Data jadwal shalat diambil dari Kementerian Agama RI (Kemenag)
            </p>
          </div>
        </div>

        {/* Prayer Time Offset */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Koreksi Waktu Shalat (menit)
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Tambahkan atau kurangi menit dari waktu shalat API. Nilai positif
            (+) menambah waktu, nilai negatif (-) mengurangi waktu.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { key: "fajr", label: "Subuh" },
              { key: "sunrise", label: "Syuruq" },
              { key: "dhuhr", label: "Dzuhur" },
              { key: "asr", label: "Ashar" },
              { key: "maghrib", label: "Maghrib" },
              { key: "isha", label: "Isya" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  min="-30"
                  max="30"
                  className="form-input"
                  value={
                    prayerTimeOffset[key as keyof typeof prayerTimeOffset] || 0
                  }
                  onChange={(e) =>
                    handleOffsetChange(key, parseInt(e.target.value) || 0)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Iqamah Duration */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Durasi Iqamah (menit)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: "fajr", label: "Subuh" },
              { key: "dhuhr", label: "Dzuhur" },
              { key: "asr", label: "Ashar" },
              { key: "maghrib", label: "Maghrib" },
              { key: "isha", label: "Isya" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="form-input"
                  value={
                    iqamahDuration[key as keyof typeof iqamahDuration] ?? 10
                  }
                  onChange={(e) =>
                    handleIqamahChange(key, parseInt(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Other Settings */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Pengaturan Lainnya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Durasi Shalat (menit)</label>
              <input
                type="number"
                min="5"
                max="30"
                className="form-input"
                value={
                  formData.prayer_duration ?? settings?.prayer_duration ?? 15
                }
                onChange={(e) =>
                  handleChange("prayer_duration", parseInt(e.target.value))
                }
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Durasi layar gelap saat shalat berlangsung
              </p>
            </div>
            <div>
              <label className="form-label">
                Countdown Sebelum Adzan (menit)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                className="form-input"
                value={
                  formData.countdown_before ?? settings?.countdown_before ?? 15
                }
                onChange={(e) =>
                  handleChange("countdown_before", parseInt(e.target.value))
                }
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Tampilkan countdown beberapa menit sebelum waktu shalat
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
