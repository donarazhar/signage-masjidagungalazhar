import type { Settings, PrayerTimes, Content, Event } from '../../../types';
import type { DisplayTemplate } from '../../../styles/displayTemplates';

export interface LayoutProps {
  settings: Settings | undefined;
  template: DisplayTemplate;
  mosqueName: string;
  currentTime: Date;
  hijriDate: string;
  prayerTimes: PrayerTimes;
  nextPrayer: {
    name: string;
    time: string;
    minutesLeft: number;
  } | null;
  contents: Content[];
  events: Event[];
  runningTexts: { text: string }[];
}
