// Display Template Configuration
export interface DisplayTemplate {
  id: string;
  name: string;
  description: string;
  colors: {
    headerBg: string;
    headerText: string;
    bodyBg: string;
    cardBg: string;
    cardBorder: string;
    accent: string;
    accentText: string;
    textPrimary: string;
    textSecondary: string;
    prayerBarBg: string;
    prayerBarText: string;
    prayerBarActive: string;
  };
}

// Display Layout Configuration
export interface DisplayLayout {
  id: string;
  name: string;
  description: string;
}

export const displayLayouts: Record<string, DisplayLayout> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: '3 kolom dengan sidebar kiri-kanan',
  },
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Full-screen dengan floating widgets',
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    description: '70% konten, 30% sidebar kanan',
  },
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: '50/50 split dengan prayer times besar',
  },
  fullscreen: {
    id: 'fullscreen',
    name: 'Fullscreen',
    description: 'Konten fullscreen, header overlay transparan',
  },
  tv: {
    id: 'tv',
    name: 'TV',
    description: 'Carousel kiri, jadwal sholat kanan, gaya info TV',
  },
};

export const getLayout = (layoutId: string): DisplayLayout => {
  return displayLayouts[layoutId] || displayLayouts.classic;
};

export const displayTemplates: Record<string, DisplayTemplate> = {
  classic: {
    id: 'classic',
    name: 'Classic Green',
    description: 'Nuansa hijau Islami yang klasik',
    colors: {
      headerBg: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
      headerText: '#ffffff',
      bodyBg: '#0f172a',
      cardBg: 'rgba(30, 41, 59, 0.8)',
      cardBorder: 'rgba(71, 85, 105, 0.3)',
      accent: '#22c55e',
      accentText: '#ffffff',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      prayerBarBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      prayerBarText: '#e2e8f0',
      prayerBarActive: '#22c55e',
    },
  },
  modern: {
    id: 'modern',
    name: 'Modern Blue',
    description: 'Tampilan modern dengan warna biru profesional',
    colors: {
      headerBg: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      headerText: '#ffffff',
      bodyBg: '#0c1222',
      cardBg: 'rgba(30, 58, 138, 0.2)',
      cardBorder: 'rgba(59, 130, 246, 0.3)',
      accent: '#3b82f6',
      accentText: '#ffffff',
      textPrimary: '#f8fafc',
      textSecondary: '#93c5fd',
      prayerBarBg: 'linear-gradient(180deg, #1e3a8a 0%, #0c1222 100%)',
      prayerBarText: '#bfdbfe',
      prayerBarActive: '#60a5fa',
    },
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant Gold',
    description: 'Tampilan premium dengan aksen emas',
    colors: {
      headerBg: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
      headerText: '#fef3c7',
      bodyBg: '#1c1917',
      cardBg: 'rgba(120, 53, 15, 0.2)',
      cardBorder: 'rgba(217, 119, 6, 0.3)',
      accent: '#f59e0b',
      accentText: '#1c1917',
      textPrimary: '#fef3c7',
      textSecondary: '#fcd34d',
      prayerBarBg: 'linear-gradient(180deg, #451a03 0%, #1c1917 100%)',
      prayerBarText: '#fef3c7',
      prayerBarActive: '#f59e0b',
    },
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Tampilan simpel dan bersih',
    colors: {
      headerBg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      headerText: '#ffffff',
      bodyBg: '#111827',
      cardBg: 'rgba(55, 65, 81, 0.5)',
      cardBorder: 'rgba(107, 114, 128, 0.3)',
      accent: '#9ca3af',
      accentText: '#111827',
      textPrimary: '#f9fafb',
      textSecondary: '#9ca3af',
      prayerBarBg: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
      prayerBarText: '#d1d5db',
      prayerBarActive: '#f9fafb',
    },
  },
};

export const getTemplate = (templateId: string): DisplayTemplate => {
  return displayTemplates[templateId] || displayTemplates.classic;
};
