import { useState, useEffect, useMemo } from 'react';
import { gregorianToHijri } from '../utils/devotionLogic';

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah'
];

const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الثَّانِي',
  'جُمَادَى الأُولَى', 'جُمَادَى الثَّانِيَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة'
];

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const NOTABLE_DATES = [
  { month: 1, day: 1, label: 'Islamic New Year', labelAr: 'رأس السنة الهجرية' },
  { month: 1, day: 10, label: 'Day of Ashura', labelAr: 'يوم عاشوراء' },
  { month: 3, day: 12, label: 'Mawlid an-Nabi ﷺ', labelAr: 'المولد النبوي' },
  { month: 7, day: 27, label: "Isra wal Mi'raj", labelAr: 'الإسراء والمعراج' },
  { month: 8, day: 15, label: "Laylat al-Bara'ah", labelAr: 'ليلة البراءة' },
  { month: 9, day: 1, label: 'Start of Ramadan', labelAr: 'بداية رمضان' },
  { month: 10, day: 1, label: 'Eid al-Fitr', labelAr: 'عيد الفطر' },
  { month: 12, day: 8, label: 'Start of Hajj', labelAr: 'بداية الحج' },
  { month: 12, day: 10, label: 'Eid al-Adha', labelAr: 'عيد الأضحى' },
];

export function useHijriDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const msUntilMidnight = () => {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      return tomorrow.getTime() - Date.now();
    };

    const timer = setTimeout(() => {
      setNow(new Date());
    }, msUntilMidnight());

    return () => clearTimeout(timer);
  }, [now]);

  return useMemo(() => {
    const hijri = gregorianToHijri(now);
    const monthName = HIJRI_MONTHS[hijri.month - 1] || '';
    const monthNameAr = HIJRI_MONTHS_AR[hijri.month - 1] || '';
    const weekdayAr = WEEKDAYS_AR[now.getDay()] || '';

    const notable = NOTABLE_DATES.find(nd => nd.month === hijri.month && nd.day === hijri.day) || null;
    const isRamadan = hijri.month === 9;
    const isLastTenNights = isRamadan && hijri.day >= 21;
    const isQadrCandidate = isLastTenNights && hijri.day % 2 === 1;

    return {
      day: hijri.day,
      month: hijri.month,
      year: hijri.year,
      monthName,
      monthNameAr,
      weekdayAr,
      formatted: `${hijri.day} ${monthName} ${hijri.year} AH`,
      formattedAr: `${hijri.day} ${monthNameAr} ${hijri.year} هـ`,
      notable,
      isRamadan,
      isLastTenNights,
      isQadrCandidate,
      isFriday: now.getDay() === 5,
    };
  }, [now]);
}
