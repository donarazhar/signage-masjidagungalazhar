import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { displayService } from "../../services/displayService";
import { adminService } from "../../services/adminService";
import { Save, Music, Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE = "https://mp3quran.net/api/v3";

interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
  moshaf_type: number;
}

interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Moshaf[];
}

interface Surah {
  id: number;
  name: string;
}

export default function MurottalSettings() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedReciterId, setSelectedReciterId] = useState<number | null>(null);
  const [selectedMoshafId, setSelectedMoshafId] = useState<number | null>(null);
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [murottalEnabled, setMurottalEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => displayService.getSettings(),
  });

  // Fetch reciters from mp3quran API
  const { data: reciters = [], isLoading: loadingReciters } = useQuery<Reciter[]>({
    queryKey: ["murottal-reciters"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/reciters?language=id`);
      const data = await res.json();
      return data.reciters || [];
    },
    staleTime: 1000 * 60 * 60, // 1 jam
  });

  // Fetch suwar list
  const { data: suwarList = [] } = useQuery<Surah[]>({
    queryKey: ["murottal-suwar"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/suwar?language=id`);
      const data = await res.json();
      return data.suwar || [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  // Load saved settings
  useEffect(() => {
    if (settings) {
      const rid = (settings as any).murottal_reciter_id;
      const mid = (settings as any).murottal_moshaf_id;
      const sid = (settings as any).murottal_surah_id;
      const enabled = (settings as any).murottal_enabled;

      if (rid) setSelectedReciterId(Number(rid));
      if (mid) setSelectedMoshafId(Number(mid));
      if (sid) setSelectedSurahId(Number(sid));
      if (enabled !== undefined) setMurottalEnabled(enabled !== false && enabled !== 'false');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (s: Array<{ key: string; value: unknown; type: string }>) =>
      adminService.bulkUpdateSettings(s),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Pengaturan murottal berhasil disimpan!", {
        duration: 3000,
        position: "top-center",
        style: { background: "#10b981", color: "#fff", fontWeight: 600, padding: "16px 24px", borderRadius: "12px" },
        icon: "✅",
      });
    },
    onError: () => {
      toast.error("Gagal menyimpan!", {
        style: { background: "#ef4444", color: "#fff", fontWeight: 600, padding: "16px 24px", borderRadius: "12px" },
      });
    },
  });

  const selectedReciter = reciters.find((r) => r.id === selectedReciterId);
  const selectedMoshaf = selectedReciter?.moshaf.find((m) => m.id === selectedMoshafId);

  // Available surahs for the selected moshaf
  const availableSurahIds = selectedMoshaf
    ? selectedMoshaf.surah_list.split(",").map(Number)
    : [];
  const availableSurahs = suwarList.filter((s) => availableSurahIds.includes(s.id));

  // Build audio URL
  const getAudioUrl = (surahId: number) => {
    if (!selectedMoshaf) return null;
    return `${selectedMoshaf.server}${String(surahId).padStart(3, "0")}.mp3`;
  };

  const handlePlay = () => {
    if (!selectedSurahId || !selectedMoshaf) {
      toast.error("Pilih qori, moshaf, dan surah terlebih dahulu");
      return;
    }
    const url = getAudioUrl(selectedSurahId);
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleSkip = () => {
    if (!selectedSurahId || availableSurahIds.length === 0) return;
    const currentIdx = availableSurahIds.indexOf(selectedSurahId);
    const nextIdx = (currentIdx + 1) % availableSurahIds.length;
    const nextSurahId = availableSurahIds[nextIdx];
    setSelectedSurahId(nextSurahId);

    const url = getAudioUrl(nextSurahId);
    if (url && audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = async () => {
    if (!selectedReciterId || !selectedMoshafId || !selectedSurahId) {
      toast.error("Pilih qori, moshaf, dan surah terlebih dahulu");
      return;
    }
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync([
        { key: "murottal_enabled", value: murottalEnabled, type: "boolean" },
        { key: "murottal_reciter_id", value: selectedReciterId, type: "number" },
        { key: "murottal_moshaf_id", value: selectedMoshafId, type: "number" },
        { key: "murottal_surah_id", value: selectedSurahId, type: "number" },
        { key: "murottal_server", value: selectedMoshaf?.server || "", type: "string" },
        { key: "murottal_reciter_name", value: selectedReciter?.name || "", type: "string" },
        { key: "murottal_moshaf_name", value: selectedMoshaf?.name || "", type: "string" },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSurah = suwarList.find((s) => s.id === selectedSurahId);
  const audioUrl = selectedSurahId ? getAudioUrl(selectedSurahId) : null;

  return (
    <div>
      <audio
        ref={audioRef}
        onEnded={handleSkip}
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Pengaturan Murottal
        </h1>
        <p className="text-[var(--text-secondary)]">
          Pilih qori dan surah yang diputar otomatis saat tampilan normal
        </p>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Status Murottal
          </h2>
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={murottalEnabled}
                onChange={(e) => setMurottalEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-600)]"></div>
            </label>
            <span className="text-[var(--text-primary)] font-medium">
              {murottalEnabled ? "🔊 Murottal Aktif" : "🔇 Murottal Dinonaktifkan"}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Murottal akan otomatis berhenti saat adzan, iqamah, atau shalat berlangsung
          </p>
        </div>

        {/* Reciter Selection */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Pilih Qori (Reciter)
          </h2>
          {loadingReciters ? (
            <div className="text-[var(--text-muted)] text-sm">Memuat daftar qori...</div>
          ) : (
            <div>
              <label className="form-label">Qori</label>
              <select
                className="form-input"
                value={selectedReciterId ?? ""}
                onChange={(e) => {
                  const rid = Number(e.target.value);
                  setSelectedReciterId(rid);
                  setSelectedMoshafId(null);
                  setSelectedSurahId(null);
                  handlePause();
                }}
              >
                <option value="">-- Pilih Qori --</option>
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Moshaf (riwayat) selection */}
          {selectedReciter && (
            <div className="mt-4">
              <label className="form-label">Riwayat / Moshaf</label>
              <select
                className="form-input"
                value={selectedMoshafId ?? ""}
                onChange={(e) => {
                  const mid = Number(e.target.value);
                  setSelectedMoshafId(mid);
                  setSelectedSurahId(null);
                  handlePause();
                }}
              >
                <option value="">-- Pilih Riwayat --</option>
                {selectedReciter.moshaf.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.surah_total} surah)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Surah Selection */}
        {selectedMoshaf && (
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Pilih Surah Awal
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Surah ini akan diputar pertama kali, kemudian dilanjutkan secara berurutan.
            </p>
            <label className="form-label">Surah</label>
            <select
              className="form-input"
              value={selectedSurahId ?? ""}
              onChange={(e) => {
                setSelectedSurahId(Number(e.target.value));
                handlePause();
              }}
            >
              <option value="">-- Pilih Surah --</option>
              {availableSurahs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Preview Player */}
        {audioUrl && (
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Preview Audio
            </h2>
            <div
              className="rounded-xl p-4"
              style={{
                background: "linear-gradient(135deg, var(--primary-50), var(--primary-100))",
                border: "1px solid var(--primary-200)",
              }}
            >
              <div className="mb-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedReciter?.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {selectedMoshaf?.name}
                </p>
                <p className="text-base font-bold text-[var(--primary-700)] mt-1">
                  {selectedSurah?.id}. {selectedSurah?.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white text-sm"
                  style={{ background: "var(--primary-600)" }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--slate-200)", color: "var(--text-primary)" }}
                >
                  <SkipForward className="w-4 h-4" />
                  Surah Berikutnya
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg"
                  style={{ background: "var(--slate-200)", color: "var(--text-primary)" }}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-3">
                🔗 {audioUrl}
              </p>
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
            disabled={isSaving || !selectedReciterId || !selectedMoshafId || !selectedSurahId}
          >
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
      </div>
    </div>
  );
}
