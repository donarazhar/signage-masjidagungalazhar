// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: "superadmin" | "admin_masjid";
  mosque_id: number | null;
  mosque?: {
    id: number;
    name: string;
    slug: string | null;
    logo: string | null;
    logo_url: string | null;
  };
  created_at: string;
  updated_at: string;
}

// Settings types
export interface Settings {
  mosque_name: string;
  mosque_address: string;
  latitude: number;
  longitude: number;
  city: string;
  city_id?: string;
  calculation_method: number;
  iqamah_duration: IqamahDuration;
  prayer_time_offset?: PrayerTimeOffset;
  prayer_duration: number;
  countdown_before: number;
  carousel_duration: number;
  running_text_speed: number;
  show_hijri_date: boolean;
  theme: "dark" | "light" | "auto";
  mosque_logo?: string | null;
  display_template?: string;
  display_layout?: string;
}

export interface IqamahDuration {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface PrayerTimeOffset {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

// Prayer times types
export interface PrayerTimes {
  timings: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  date: {
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
    };
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string };
      year: string;
    };
  };
  lokasi?: string;
  daerah?: string;
  timezone?: {
    code: string;
    name: string;
    offset: string;
  };
  iqamah_duration: IqamahDuration;
  prayer_duration: number;
  countdown_before: number;
}

export type PrayerName =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

// Content types
export interface Content {
  id: number;
  title: string;
  type: "image" | "video" | "youtube";
  file_path: string | null;
  file_url: string | null;
  youtube_url: string | null;
  youtube_id: string | null;
  youtube_embed_url: string | null;
  youtube_thumbnail: string | null;
  duration: number;
  priority: number;
  is_enabled: boolean;
  start_date: string | null;
  end_date: string | null;
  show_on_days: number[] | null;
  uploaded_by: number;
  uploader?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

// Running text types
export interface RunningText {
  id: number;
  content: string;
  type: "normal" | "urgent" | "berita_duka";
  priority: number;
  is_enabled: boolean;
  start_date: string | null;
  end_date: string | null;
  show_on_days: number[] | null;
  created_by: number;
  creator?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

// Financial types
export interface Financial {
  id: number;
  record_date: string;
  amount: number;
  description: string | null;
  type: "infaq" | "zakat" | "sedekah" | "lainnya";
  recorded_by: number;
  recorder?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  saldo_kas: number;
  weekly_data: WeeklyFinancial[];
  last_updated: string | null;
}

export interface WeeklyFinancial {
  date: string;
  day_name: string;
  total: number;
  details: {
    type: string;
    amount: number;
    description: string | null;
  }[];
}

// Event types
export interface Event {
  id: number;
  title: string;
  event_date: string;
  event_time: string | null;
  description: string | null;
  location: string | null;
  is_enabled: boolean;
  formatted_date?: string;
  formatted_time?: string;
  created_by: number;
  creator?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

// Display mode types
export type DisplayMode =
  | "normal"
  | "countdown"
  | "adzan"
  | "iqamah"
  | "prayer";

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Hadith {
  id: number;
  content: string;
  source: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Donation types
export interface Donation {
  id: number;
  type: "rekening" | "qris";
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  logo_path: string | null;
  qris_image: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
