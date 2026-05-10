import { useState, useEffect, useMemo } from 'react';

/**
 * FEAT-05: Hijri Calendar Hook
 * 
 * Pure JavaScript Hijri date calculation using the Umm al-Qura algorithm approximation.
 * No external dependencies — uses the astronomical tabular Islamic calendar.
 */

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhul Qi\'dah', 'Dhul Hijjah'
];

const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الثَّانِي',
  'جُمَادَى الأُولَى', 'جُمَادَى الثَّانِيَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة'
];

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// Notable dates in the Islamic calendar { month (1-indexed), day, label, labelAr }
const NOTABLE_DATES = [
  { month: 1, day: 1, label: 'Islamic New Year', labelAr: 'رأس السنة الهجرية' },
  { month: 1, day: 10, label: 'Day of Ashura', labelAr: 'يوم عاشوراء' },
  { month: 3, day: 12, label: 'Mawlid an-Nabi ﷺ', labelAr: 'المولد النبوي' },
  { month: 7, day: 27, label: 'Isra wal Mi\'raj', labelAr: 'الإسراء والمعراج' },
  { month: 8, day: 15, label: 'Laylat al-Bara\'ah', labelAr: 'ليلة البراءة' },
  { month: 9, day: 1, label: 'Start of Ramadan', labelAr: 'بداية رمضان' },
  { month: 10, day: 1, label: 'Eid al-Fitr', labelAr: 'عيد الفطر' },
  { month: 12, day: 8, label: 'Start of Hajj', labelAr: 'بداية الحج' },
  { month: 12, day: 10, label: 'Eid al-Adha', labelAr: 'عيد الأضحى' },
];

/**
 * Converts a Gregorian date to Hijri using the tabular Islamic calendar.
 * Accuracy: ±1 day (sufficient for ambient display, not fatwa-grade).
 */
function gregorianToHijri(gDate) {
  const y = gDate.getFullYear();
  const m = gDate.getMonth() + 1;
  const d = gDate.getDate();

  // Julian Day Number
  let jd;
  if (m <= 2) {
    jd = Math.floor(365.25 * (y - 1 + 4716)) + Math.floor(30.6001 * (m + 12 + 1)) + d - 1524.5;
  } else {
    jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d - 1524.5;
  }

  // Gregorian correction
  const a = Math.floor((y - (m <= 2 ? 1 : 0)) / 100);
  jd = jd + 2 - a + Math.floor(a / 4);

  // Convert JD to Hijri
  const l = Math.floor(jd) - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

  const hijriMonth = Math.floor((24 * l3) / 709);
  const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return { year: hijriYear, month: hijriMonth, day: hijriDay };
}

export function useHijriDate() {
  const [now, setNow] = useState(new Date());

  // Refresh at midnight
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

    // Check if today is a notable date
    const notable = NOTABLE_DATES.find(nd => nd.month === hijri.month && nd.day === hijri.day) || null;

    // Check if Ramadan
    const isRamadan = hijri.month === 9;
    // Check the last 10 nights
    const daysInMonth = (hijri.month % 2 === 1) ? 30 : 29; // approximate
    const isLastTenNights = isRamadan && hijri.day >= 21;
    // Laylat al-Qadr candidates (odd nights in last 10)
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
