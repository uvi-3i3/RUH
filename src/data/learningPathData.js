/**
 * Lesson I: Foundations of Islam & Faith (Arkan al-Islam & Arkan al-Iman)
 *
 * Practical, calm classical curriculum grounded in the Hadith of Jibril ﷺ (Sahih Muslim 8)
 * and pure Ahl al-Sunnah wa'l-Jama'ah scholarship:
 *  - Intro: Welcoming orientation to the Study Window
 *  - Part I: The Five Pillars of Islam (Arkan al-Islam — What we practice)
 *  - Part II: The Six Pillars of Faith (Arkan al-Iman — What we believe)
 *  - Gentle Checks & Next Curriculum Preview: Lesson II — The Gates of Taharah
 */

export const LESSON_ONE_STORAGE_KEY = 'ruh_learning_path_lesson1_v1';

export const LESSON_ONE_INTRO = {
  lessonLabel: 'Lesson I · Foundations',
  arabicTitle: 'طَلَبُ العِلْم',
  title: 'Foundations of Islam & Faith',
  subtitle:
    'A calm, step-by-step guide to the five pillars of worship and the six pillars of belief.',
  sourceNote: 'Based on the Hadith of Jibril ﷺ · Sahih Muslim 8',
  estimatedMinutes: 5,
  totalTopics: 11,
  checkCount: 2,
};

export const PILLAR_GROUPS = [
  {
    id: 'islam',
    numberLabel: 'Part I · 5 Pillars',
    title: 'Five Pillars of Islam',
    transliteration: 'Arkan al-Islam',
    arabic: 'أَرْكَانُ الإِسْلَام',
    subtitle: 'What we practice',
    summary: 'Five core acts of worship that shape a Muslim’s life.',
    estimatedMinutes: 2,
    buildingName: 'Al-Masjid Al-Jami‘',
    buildingSubtitle: 'Sanctuary of Practice',
    buildingFocus: '22% 22%',
    buildingScale: 215,
    buildingX: 376,
    buildingY: 576,
    artifactCaption: 'Sanctuary Mihrab, Brass Lamp, Sundial & Qibla Compass',
    count: 5,
    bounds: { x: 56, y: 244, width: 640, height: 588, centerX: 376, centerY: 538 },
  },
  {
    id: 'iman',
    numberLabel: 'Part II · 6 Pillars',
    title: 'Six Pillars of Faith',
    transliteration: 'Arkan al-Iman',
    arabic: 'أَرْكَانُ الإِيمَان',
    subtitle: 'What we believe',
    summary: 'Six core beliefs held in the heart.',
    estimatedMinutes: 3,
    buildingName: 'Bayt al-Hikmah',
    buildingSubtitle: 'Sanctuary of Creed',
    buildingFocus: '78% 22%',
    buildingScale: 215,
    buildingX: 1124,
    buildingY: 576,
    artifactCaption: 'Illuminated Codex on Rahl, Qalam, Astrolabe & Scales',
    count: 6,
    bounds: { x: 804, y: 244, width: 640, height: 588, centerX: 1124, centerY: 538 },
  },
];

export const LOCKED_FUTURE_LESSONS = [
  {
    id: 'lesson-2-taharah',
    lessonNumber: 'Lesson II',
    title: 'The Gates of Taharah',
    subtitle: 'Purification & Wudu',
    arabic: 'أَبْوَابُ الطَّهَارَة',
    artifactName: 'Stone Citadel Archway & Marble Ablution Fountain',
    artifactSheet: 'buildings',
    artifactFocus: '22% 78%',
    artifactScale: 215,
    mysteryWhisper:
      'Learn the essential and Sunnah steps of Wudu before standing in prayer.',
    unlockRequirementText: 'Complete all 11 topics in Lesson I to unlock Lesson II',
    x: 750,
    y: 148,
    dayX: 750,
    dayY: 148,
    isPrimaryGate: true,
    previewSteps: [
      {
        order: 1,
        arabic: 'غَسْلُ الوَجْهِ',
        title: 'Washing the Face',
        transliteration: 'Ghasl al-Wajh (with Intention)',
        detail: 'Wash from hairline to chin and ear to ear with a clear intention for prayer.',
      },
      {
        order: 2,
        arabic: 'غَسْلُ اليَدَيْنِ إِلَى المِرْفَقَيْنِ',
        title: 'Washing Both Arms',
        transliteration: 'Ghasl al-Yadayn ila al-Mirfaqayn',
        detail: 'Wash the right arm, then the left, from fingertips up to and including the elbows.',
      },
      {
        order: 3,
        arabic: 'مَسْحُ الرَّأْسِ',
        title: 'Wiping the Head',
        transliteration: 'Mash al-Ra’s',
        detail: 'Pass wet hands gently over the head (Surah al-Ma’idah 5:6).',
      },
      {
        order: 4,
        arabic: 'غَسْلُ الرِّجْلَيْنِ إِلَى الكَعْبَيْنِ',
        title: 'Washing Both Feet',
        transliteration: 'Ghasl al-Rijlayn ila al-Ka‘bayn',
        detail: 'Wash the right foot, then the left, up to and including the ankles.',
      },
    ],
  },
  {
    id: 'lesson-3-fiqh-salah',
    lessonNumber: 'Lesson III',
    title: 'The Light of Salah',
    subtitle: 'Pillars & Presence in Prayer',
    arabic: 'أَسْرَارُ الصَّلَاة',
    artifactName: 'Carved Limestone Mihrab Sanctuary',
    artifactSheet: 'sanctuary',
    artifactFocus: '62% 45%',
    artifactScale: 200,
    mysteryWhisper: 'Learn the conditions, pillars, and quiet focus of the five daily prayers.',
    unlockRequirementText: 'Awaits Lesson II completion',
    x: 350,
    y: 148,
    dayX: 350,
    dayY: 148,
    isPrimaryGate: false,
  },
  {
    id: 'lesson-4-tazkiyah',
    lessonNumber: 'Lesson IV',
    title: 'Tazkiyah & Ihsan',
    subtitle: 'Purifying the Heart',
    arabic: 'تَزْكِيَةُ النَّفْس',
    artifactName: 'Hanging Sanctuary Mishkat Lamp',
    artifactSheet: 'sanctuary',
    artifactFocus: '22% 55%',
    artifactScale: 210,
    mysteryWhisper: 'Worship Allah with presence and soften the heart from pride and heedlessness.',
    unlockRequirementText: 'Awaits Lesson III completion',
    x: 1150,
    y: 148,
    dayX: 1150,
    dayY: 148,
    isPrimaryGate: false,
  },
];

export const LESSON_ONE_LANDMARKS = [
  // ============================================================================
  // PART I: THE FIVE PILLARS OF ISLAM (ARKAN AL-ISLAM — WHAT WE PRACTICE)
  // ============================================================================
  {
    id: 'shahadah',
    region: 'islam',
    order: 1,
    regionOrder: 1,
    roman: 'I',
    pillarLabel: '1st Pillar of Islam',
    title: 'Ash-Shahadah',
    englishMeaning: 'Testimony of Faith',
    arabic: 'الشَّهَادَتَان',
    shortSummary:
      'Bearing witness with heart and tongue that there is no deity worthy of worship except Allah, and that Muhammad ﷺ is His Messenger.',
    recognitionCue:
      'Worshipping Allah alone while following the authentic path of Prophet Muhammad ﷺ.',
    placeCaption: 'First Foundation of Islam',
    artifactName: 'Brass Mosque Lamp',
    artifactShort: 'Mosque Lamp',
    artifactSheet: 'sanctuary',
    artifactFocus: '22% 54%',
    artifactScale: 215,
    x: 376,
    y: 396,
    dayX: 376,
    dayY: 396,
    arabicFormula: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
    transliteration: 'Ash-hadu an la ilaha illa Allah, wa ash-hadu anna Muhammadan Rasulu Allah',
    formulaTranslation:
      'I bear witness that there is no deity worthy of worship except Allah, and Muhammad is the Messenger of Allah.',
    keyTerms: [
      {
        arabic: 'أَشْهَدُ',
        term: 'Ash-hadu',
        meaning: 'Bearing witness with knowledge and heartfelt certainty.',
      },
      {
        arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
        term: 'La ilaha illa Allah',
        meaning: 'None deserves worship save Allah alone (Tawhid).',
      },
      {
        arabic: 'مُحَمَّدًا رَسُولُ اللَّهِ',
        term: 'Muhammadan Rasulu Allah',
        meaning: 'Following Prophet Muhammad ﷺ as the final Messenger.',
      },
    ],
    classicalProof: {
      text: '“Islam is to testify that there is no deity but Allah and that Muhammad is the Messenger of Allah...”',
      source: 'Hadith of Jibril ﷺ · Sahih Muslim 8',
    },
    shortPractice: [
      'Say the Shahadah with presence after Wudu and in every prayer.',
      'Renew your heart daily with quiet remembrance of La ilaha illa Allah.',
    ],
    dailyPractice: [
      'Recite the Shahadah with presence after Wudu and during the Tashahhud of every prayer.',
      'Unite both parts: worship Allah alone and follow His Messenger ﷺ in mercy and honesty.',
      'Renew your conviction daily through quiet remembrance of La ilaha illa Allah.',
    ],
    checkQuestion: {
      prompt: 'Why are both parts of the Shahadah joined together?',
      options: [
        'They teach both Who we worship (Allah alone) and how to worship Him (via Prophet Muhammad ﷺ).',
        'One part is only for Ramadan and the other is only for Hajj.',
        'The second part is optional in daily prayers.',
      ],
      correctIndex: 0,
      explanation:
        'The first part establishes devotion to Allah alone, and the second anchors our worship in the Sunnah of Prophet Muhammad ﷺ.',
    },
  },
  {
    id: 'salah',
    region: 'islam',
    order: 2,
    regionOrder: 2,
    roman: 'II',
    pillarLabel: '2nd Pillar of Islam',
    title: 'As-Salah',
    englishMeaning: 'Five Daily Prayers',
    arabic: 'إِقَامُ الصَّلَاة',
    shortSummary:
      'Standing before Allah five times a day — at dawn, midday, afternoon, sunset, and night — with clean preparation and a calm heart.',
    recognitionCue:
      'Five appointed daily prayers totaling 17 obligatory rak‘ahs.',
    placeCaption: 'Second Foundation of Islam',
    artifactName: 'Carved Mihrab Arch',
    artifactShort: 'Mihrab Arch',
    artifactSheet: 'sanctuary',
    artifactFocus: '64% 44%',
    artifactScale: 205,
    x: 176,
    y: 576,
    dayX: 176,
    dayY: 576,
    arabicFormula: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا',
    transliteration: 'Inna as-salata kanat ‘ala al-mu’minina kitaban mawquta',
    formulaTranslation:
      '“Indeed, prayer has been decreed upon the believers at appointed times.”',
    keyTerms: [
      {
        arabic: 'الفَجْر (٢) · الظُّهْر (٤)',
        term: 'Fajr (2) & Dhuhr (4)',
        meaning: 'Dawn prayer before sunrise and midday prayer past zenith.',
      },
      {
        arabic: 'العَصْر (٤) · المَغْرِب (٣)',
        term: '‘Asr (4) & Maghrib (3)',
        meaning: 'Afternoon prayer and sunset prayer right after dusk.',
      },
      {
        arabic: 'العِشَاء (٤)',
        term: '‘Isha’ (4)',
        meaning: 'Night prayer, completing 17 obligatory rak‘ahs each day.',
      },
    ],
    classicalProof: {
      text: '“...to establish the prayer...” — fulfilling both its outward steps and quiet humility (Khushu‘).',
      source: 'Surah an-Nisa’ 4:103 · Sahih Muslim 8',
    },
    shortPractice: [
      'Guard all 5 prayers (17 Fard rak‘ahs) inside their appointed windows.',
      'Pause briefly before Takbir to calm your breathing and focus on Al-Fatihah.',
    ],
    dailyPractice: [
      'Guard all 5 daily prayers (2 Fajr, 4 Dhuhr, 4 ‘Asr, 3 Maghrib, 4 ‘Isha’) within their times.',
      'Prepare with Wudu, clean attire, and facing the Qiblah.',
      'Slow down on Surah al-Fatihah to cultivate quiet presence (Khushu‘).',
    ],
    checkQuestion: {
      prompt: 'How many obligatory (Fard) rak‘ahs are prayed across the five daily prayers?',
      options: [
        '17 rak‘ahs total (2 Fajr, 4 Dhuhr, 4 ‘Asr, 3 Maghrib, 4 ‘Isha’).',
        '10 rak‘ahs total (2 for each prayer).',
        '20 rak‘ahs total (4 for each prayer).',
      ],
      correctIndex: 0,
      explanation:
        'The five daily prayers total 17 obligatory rak‘ahs: Fajr (2), Dhuhr (4), ‘Asr (4), Maghrib (3), and ‘Isha’ (4).',
    },
  },
  {
    id: 'zakah',
    region: 'islam',
    order: 3,
    regionOrder: 3,
    roman: 'III',
    pillarLabel: '3rd Pillar of Islam',
    title: 'Az-Zakah',
    englishMeaning: 'Purifying Alms',
    arabic: 'إِيتَاءُ الزَّكَاة',
    shortSummary:
      'Giving 2.5% of qualifying surplus wealth each lunar year to support those in need and purify the heart from greed.',
    recognitionCue:
      '2.5% given annually once surplus savings reach Nisab for a full lunar year.',
    placeCaption: 'Third Foundation of Islam',
    artifactName: 'Alms Bowl & Dinars',
    artifactShort: 'Alms Dinars',
    artifactSheet: 'devotion',
    artifactFocus: '18% 68%',
    artifactScale: 225,
    x: 576,
    y: 576,
    dayX: 576,
    dayY: 576,
    arabicFormula: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
    transliteration: 'Wa aqimu as-salata wa atu az-zakah',
    formulaTranslation:
      '“And establish the prayer and give the purifying alms.”',
    keyTerms: [
      {
        arabic: 'النِّصَاب',
        term: 'Nisab (Threshold)',
        meaning: 'Minimum surplus wealth (85g gold or 595g silver value).',
      },
      {
        arabic: 'الحَوْل (٢.٥٪)',
        term: 'Hawl & 2.5%',
        meaning: 'Held for one full lunar year, then 2.5% is given.',
      },
      {
        arabic: 'التَّزْكِيَة',
        term: 'Purification',
        meaning: 'Cleanses the heart from attachment and blesses remaining wealth.',
      },
    ],
    classicalProof: {
      text: '“Take from their wealth a charity by which you purify them and cause them to grow in blessing.”',
      source: 'Surah al-Baqarah 2:43 · Surah at-Tawbah 9:103',
    },
    shortPractice: [
      'Mark your annual lunar Zakah date if your savings stay above Nisab.',
      'Pair annual Zakah with small, regular acts of voluntary charity (Sadaqah).',
    ],
    dailyPractice: [
      'Track your lunar Zakah anniversary (Hawl) if savings exceed the Nisab threshold.',
      'Give 2.5% of qualifying lunar-year savings to eligible recipients (Surah at-Tawbah 9:60).',
      'Keep generosity alive year-round through voluntary Sadaqah.',
    ],
    checkQuestion: {
      prompt: 'When does obligatory Zakah on savings or gold become due?',
      options: [
        'When surplus wealth reaches Nisab and is held for one lunar year (2.5%).',
        'Every Friday regardless of savings or debt.',
        'Only once in a lifetime during Hajj.',
      ],
      correctIndex: 0,
      explanation:
        'Zakah is due annually at 2.5% once qualifying surplus wealth stays at or above the Nisab for one full lunar year.',
    },
  },
  {
    id: 'sawm',
    region: 'islam',
    order: 4,
    regionOrder: 4,
    roman: 'IV',
    pillarLabel: '4th Pillar of Islam',
    title: 'As-Sawm',
    englishMeaning: 'Fasting Ramadan',
    arabic: 'صَوْمُ رَمَضَان',
    shortSummary:
      'Fasting from food and drink from true dawn until sunset during Ramadan to grow in self-restraint, gratitude, and mindfulness of Allah.',
    recognitionCue:
      'Dawn-to-sunset fasting in Ramadan to cultivate God-consciousness (Taqwa).',
    placeCaption: 'Fourth Foundation of Islam',
    artifactName: 'Crescent Sundial',
    artifactShort: 'Crescent Sundial',
    artifactSheet: 'devotion',
    artifactFocus: '48% 30%',
    artifactScale: 205,
    x: 204,
    y: 756,
    dayX: 204,
    dayY: 756,
    arabicFormula: 'كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    transliteration: 'Kutiba ‘alaykumu as-siyamu kama kutiba ‘ala alladhina min qablikum la‘allakum tattaqun',
    formulaTranslation:
      '“Fasting has been prescribed for you... so that you may attain Taqwa.”',
    keyTerms: [
      {
        arabic: 'النِّيَّة',
        term: 'Niyyah (Intention)',
        meaning: 'Intending in the heart to fast for the sake of Allah.',
      },
      {
        arabic: 'الفَجْر إِلَى المَغْرِب',
        term: 'Dawn to Sunset',
        meaning: 'Abstaining from food and drink from Fajr until Maghrib.',
      },
      {
        arabic: 'التَّقْوَى',
        term: 'Taqwa',
        meaning: 'Guarding the tongue, temper, and heart in mindfulness of Allah.',
      },
    ],
    classicalProof: {
      text: '“...and to fast the month of Ramadan...”',
      source: 'Surah al-Baqarah 2:183 · Sahih Muslim 8',
    },
    shortPractice: [
      'Eat a light Suhur before dawn and break the fast promptly at sunset.',
      'Let the tongue fast too — step back from harsh speech and arguments.',
    ],
    dailyPractice: [
      'Observe Ramadan fasting with Suhur before dawn and prompt Iftar at sunset.',
      'Guard your speech from gossip, anger, and arguments.',
      'Try occasional Sunnah fasts such as Mondays, Thursdays, or the White Days.',
    ],
    checkQuestion: {
      prompt: 'When is the daily fast observed, and what is its Qur’anic goal?',
      options: [
        'From true dawn (Fajr) to sunset (Maghrib), to cultivate Taqwa.',
        'From sunrise until midnight, to test physical stamina alone.',
        'From midday until the following dawn.',
      ],
      correctIndex: 0,
      explanation:
        'Fasting runs from Fajr to Maghrib so the believer grows in Taqwa — mindfulness, restraint, and gratitude.',
    },
  },
  {
    id: 'hajj',
    region: 'islam',
    order: 5,
    regionOrder: 5,
    roman: 'V',
    pillarLabel: '5th Pillar of Islam',
    title: 'Al-Hajj',
    englishMeaning: 'Sacred Pilgrimage',
    arabic: 'حَجُّ البَيْت',
    shortSummary:
      'Journeying to the Sacred House in Makkah once in a lifetime for those who have the health and financial means to travel safely.',
    recognitionCue:
      'A once-in-a-lifetime pilgrimage to Makkah for those physically and financially able.',
    placeCaption: 'Fifth Foundation of Islam',
    artifactName: 'Brass Qibla Compass',
    artifactShort: 'Qibla Compass',
    artifactSheet: 'devotion',
    artifactFocus: '80% 74%',
    artifactScale: 225,
    x: 548,
    y: 756,
    dayX: 548,
    dayY: 756,
    arabicFormula: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا',
    transliteration: 'Wa lillahi ‘ala an-nasi hijju al-bayti mani istata‘a ilayhi sabila',
    formulaTranslation:
      '“Pilgrimage to the House is a duty owed to Allah by whoever is able to make the way.”',
    keyTerms: [
      {
        arabic: 'الإِحْرَام',
        term: 'Ihram & Talbiyah',
        meaning: 'Entering sacred consecration answering Allah’s call.',
      },
      {
        arabic: 'عَرَفَة',
        term: 'Standing at ‘Arafah',
        meaning: 'The heart of Hajj on the 9th of Dhul-Hijjah in humble du‘a.',
      },
      {
        arabic: 'الطَّوَاف وَالسَّعْي',
        term: 'Tawaf & Sa‘i',
        meaning: 'Seven circuits around the Ka‘bah and walking between Safa and Marwah.',
      },
    ],
    classicalProof: {
      text: '“...and to perform pilgrimage to the House if you are able to find a way to it.”',
      source: 'Surah Ali ‘Imran 3:97 · Sahih Muslim 8',
    },
    shortPractice: [
      'Hold a sincere intention and save gently toward Hajj when able.',
      'Honor the first ten days of Dhul-Hijjah with remembrance and fasting ‘Arafah.',
    ],
    dailyPractice: [
      'Form a sincere intention and gradual savings plan to perform Hajj when able.',
      'Remember the unity of the Ummah each time you face the Qiblah in prayer.',
      'Honor the first ten days of Dhul-Hijjah with Dhikr, charity, and fasting ‘Arafah.',
    ],
    checkQuestion: {
      prompt: 'Who is required to perform Hajj, and how often?',
      options: [
        'Once in a lifetime for every adult Muslim who is physically and financially able.',
        'Every three years regardless of health or finances.',
        'Only for scholars living near Makkah.',
      ],
      correctIndex: 0,
      explanation:
        'Hajj is required once in a lifetime for any sane adult Muslim with the health, safety, and means to go.',
    },
  },

  // ============================================================================
  // PART II: THE SIX PILLARS OF FAITH (ARKAN AL-IMAN — WHAT WE BELIEVE)
  // ============================================================================
  {
    id: 'iman-allah',
    region: 'iman',
    order: 6,
    regionOrder: 1,
    roman: 'I',
    pillarLabel: '1st Pillar of Faith',
    title: 'Belief in Allah',
    englishMeaning: 'Divine Oneness',
    arabic: 'الإِيمَانُ بِاللَّه',
    shortSummary:
      'Knowing with certainty that Allah is One, eternal, and completely unlike anything in creation — All-Merciful, All-Knowing, and All-Wise.',
    recognitionCue:
      'Affirming Allah’s absolute Oneness and complete transcendence above creation.',
    placeCaption: 'First Article of Faith',
    artifactName: 'Mishkat Lamp Flame',
    artifactShort: 'Mishkat Lamp',
    artifactSheet: 'sanctuary',
    artifactFocus: '24% 64%',
    artifactScale: 250,
    x: 948,
    y: 396,
    dayX: 948,
    dayY: 396,
    arabicFormula: 'لَيْسَ كَمِثْلِهِ شَيْءٌ ۖ وَهُوَ السَّمِيعُ الْبَصِيرُ',
    transliteration: 'Laysa kamithlihi shay’un wa Huwa as-Sami‘u al-Basir',
    formulaTranslation:
      '“There is nothing whatsoever like unto Him, and He is the All-Hearing, the All-Seeing.”',
    keyTerms: [
      {
        arabic: 'التَّوْحِيد',
        term: 'Tawhid (Oneness)',
        meaning: 'Allah is One in Essence, Attributes, and Actions — with no partner.',
      },
      {
        arabic: 'التَّنْزِيه',
        term: 'Tanzih (Transcendence)',
        meaning: 'Allah is free from any body, form, limit, or likeness to creation.',
      },
      {
        arabic: 'الأَسْمَاءُ الحُسْنَى',
        term: 'Beautiful Names',
        meaning: 'Calling upon Allah by Names like Ar-Rahman, Al-‘Alim, and Al-Hakim.',
      },
    ],
    classicalProof: {
      text: '“Say: He is Allah, the One; Allah, the Eternal Refuge.”',
      source: 'Surah ash-Shura 42:11 · Surah al-Ikhlas 112:1–4',
    },
    shortPractice: [
      'Call upon Allah through His Beautiful Names in moments of ease and need.',
      'Pause each day to notice a sign of His care in the sky, earth, or your own breath.',
    ],
    dailyPractice: [
      'Reflect daily on Allah’s signs in creation with gratitude.',
      'Hold to pure Sunni transcendence: never compare Allah to created things.',
      'Call upon Allah by His Beautiful Names in ease and hardship.',
    ],
    checkQuestion: {
      prompt: 'What does “There is nothing whatsoever like unto Him” (42:11) teach?',
      options: [
        'Allah is completely above any physical form or likeness to creation, while possessing eternal perfection.',
        'Allah can be imagined as having a physical body in space.',
        'Allah created the universe and stepped away from knowing it.',
      ],
      correctIndex: 0,
      explanation:
        'Surah ash-Shura 42:11 unites pure transcendence above created likeness with affirming Allah’s perfect Attributes.',
    },
  },
  {
    id: 'iman-angels',
    region: 'iman',
    order: 7,
    regionOrder: 2,
    roman: 'II',
    pillarLabel: '2nd Pillar of Faith',
    title: 'Belief in His Angels',
    englishMeaning: 'Beings of Light',
    arabic: 'الإِيمَانُ بِالمَلَائِكَة',
    shortSummary:
      'Believing in Allah’s honored angels, created from light, who never disobey Him and carry out His commands throughout the universe.',
    recognitionCue:
      'Honored beings of light who carry revelation, mercy, and the record of deeds.',
    placeCaption: 'Second Article of Faith',
    artifactName: 'Celestial Astrolabe',
    artifactShort: 'Brass Astrolabe',
    artifactSheet: 'cosmos',
    artifactFocus: '22% 52%',
    artifactScale: 215,
    x: 1300,
    y: 396,
    dayX: 1300,
    dayY: 396,
    arabicFormula: 'لَّا يَعْصُونَ اللَّهَ مَا أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ',
    transliteration: 'La ya‘suna Allaha ma amarahum wa yaf‘aluna ma yu’marun',
    formulaTranslation:
      '“They do not disobey Allah in what He commands them, and do whatever they are commanded.”',
    keyTerms: [
      {
        arabic: 'جِبْرِيل',
        term: 'Jibril عليه السلام',
        meaning: 'Archangel entrusted with bringing Divine Revelation to the Prophets.',
      },
      {
        arabic: 'مِيكَائِيل وَإِسْرَافِيل',
        term: 'Mika’il & Israfil',
        meaning: 'Entrusted with rain/provision and the Trumpet of Resurrection.',
      },
      {
        arabic: 'الكِرَامُ الكَاتِبُون',
        term: 'Noble Recorders',
        meaning: 'Angels who accompany every person and record words and deeds.',
      },
    ],
    classicalProof: {
      text: '“...all of them have believed in Allah, His Angels, His Books, and His Messengers.”',
      source: 'Surah at-Tahrim 66:6 · Surah al-Baqarah 2:285',
    },
    shortPractice: [
      'Speak gently and truthfully, mindful of the noble recording angels with you.',
      'Fill your space with Qur’an and remembrance, which angels love to gather around.',
    ],
    dailyPractice: [
      'Remember the noble recording angels, inspiring honesty and gentle speech.',
      'Seek gatherings of remembrance, prayer, and learning.',
      'Keep your home and heart clean and peaceful.',
    ],
    checkQuestion: {
      prompt: 'Which Archangel brought the Noble Qur’an to Prophet Muhammad ﷺ?',
      options: [
        'Jibril (Gabriel) عليه السلام — The Trustworthy Spirit.',
        'Israfil عليه السلام — keeper of the Trumpet.',
        'Malik عليه السلام — keeper of Hellfire.',
      ],
      correctIndex: 0,
      explanation:
        'Sayyiduna Jibril عليه السلام is the Archangel of Revelation who conveyed the Qur’an to Prophet Muhammad ﷺ.',
    },
  },
  {
    id: 'iman-books',
    region: 'iman',
    order: 8,
    regionOrder: 3,
    roman: 'III',
    pillarLabel: '3rd Pillar of Faith',
    title: 'Belief in His Books',
    englishMeaning: 'Revealed Scriptures',
    arabic: 'الإِيمَانُ بِالكُتُب',
    shortSummary:
      'Believing in all original scriptures revealed by Allah to guide humanity, culminating in the final, divinely preserved Noble Qur’an.',
    recognitionCue:
      'Honoring all earlier revelations while living by the preserved Noble Qur’an.',
    placeCaption: 'Third Article of Faith',
    artifactName: 'Illuminated Codex',
    artifactShort: 'Illuminated Codex',
    artifactSheet: 'scripture',
    artifactFocus: '46% 42%',
    artifactScale: 155,
    x: 924,
    y: 576,
    dayX: 924,
    dayY: 576,
    arabicFormula: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ',
    transliteration: 'Inna Nahnu nazzalna adh-Dhikra wa inna lahu lahafidhun',
    formulaTranslation:
      '“Indeed, it is We who sent down the Reminder, and indeed, We will guard it.”',
    keyTerms: [
      {
        arabic: 'الصُّحُف وَالتَّوْرَاة',
        term: 'Suhuf & Tawrah',
        meaning: 'Scrolls of Ibrahim and original Torah revealed to Musa.',
      },
      {
        arabic: 'الزَّبُور وَالإِنْجِيل',
        term: 'Zabur & Injil',
        meaning: 'Psalms of Dawud and original Gospel revealed to ‘Isa.',
      },
      {
        arabic: 'القُرْآنُ الكَرِيم',
        term: 'Al-Qur’an al-Karim',
        meaning: 'The final, universal, and preserved Book revealed to Muhammad ﷺ.',
      },
    ],
    classicalProof: {
      text: '“We have revealed to you the Book in truth, confirming what came before it and as a criterion over it.”',
      source: 'Surah al-Hijr 15:9 · Surah al-Ma’idah 5:48',
    },
    shortPractice: [
      'Read or listen to even a few verses of the Qur’an daily with reflection.',
      'Approach the Qur’an with Wudu and a readiness to live by one verse at a time.',
    ],
    dailyPractice: [
      'Keep a quiet daily portion of reciting and reflecting on the Qur’an.',
      'Honor earlier original revelations while following the preserved Qur’an.',
      'Read with Wudu, stillness, and sincere intention to act upon it.',
    ],
    checkQuestion: {
      prompt: 'Which four major revealed Books are explicitly named in the Qur’an?',
      options: [
        'Tawrah (Musa), Zabur (Dawud), Injil (‘Isa), and Qur’an (Muhammad ﷺ).',
        'Only the Qur’an is named in Islamic belief.',
        'Tawrah, Sahih al-Bukhari, Al-Muwatta, and Injil.',
      ],
      correctIndex: 0,
      explanation:
        'Muslims believe in all original revelations, specifically the Scrolls of Ibrahim, Tawrah, Zabur, Injil, and the final preserved Qur’an.',
    },
  },
  {
    id: 'iman-messengers',
    region: 'iman',
    order: 9,
    regionOrder: 4,
    roman: 'IV',
    pillarLabel: '4th Pillar of Faith',
    title: 'Belief in His Messengers',
    englishMeaning: 'Prophetic Envoys',
    arabic: 'الإِيمَانُ بِالرُّسُل',
    shortSummary:
      'Loving and believing in all Prophets chosen by Allah to guide humanity — from Adam, the first Prophet, to Muhammad ﷺ, the Seal of the Prophets.',
    recognitionCue:
      'Honoring all Prophets equally, culminating in Prophet Muhammad ﷺ.',
    placeCaption: 'Fourth Article of Faith',
    artifactName: 'Reed Pen & Inkwell',
    artifactShort: 'Reed Pen & Ink',
    artifactSheet: 'scripture',
    artifactFocus: '82% 84%',
    artifactScale: 235,
    x: 1324,
    y: 576,
    dayX: 1324,
    dayY: 576,
    arabicFormula: 'مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ',
    transliteration: 'Ma kana Muhammadun aba ahadin min rijalikum wa lakin Rasula Allahi wa Khatama an-Nabiyyin',
    formulaTranslation:
      '“Muhammad is the Messenger of Allah and the Seal of the Prophets.”',
    keyTerms: [
      {
        arabic: 'أُولُو العَزْم',
        term: 'The 5 Messengers of Resolve',
        meaning: 'Nuh, Ibrahim, Musa, ‘Isa, and Muhammad — peace be upon them all.',
      },
      {
        arabic: 'صِفَات الرُّسُل',
        term: '4 Prophetic Qualities',
        meaning: 'Truthfulness, Trustworthiness, Conveying the Message, and Wisdom.',
      },
      {
        arabic: 'خَاتَمُ النَّبِيِّين',
        term: 'Seal of the Prophets',
        meaning: 'No prophet comes after Prophet Muhammad ﷺ.',
      },
    ],
    classicalProof: {
      text: '“We make no distinction between any of His Messengers — and they say: We hear and we obey.”',
      source: 'Surah al-Ahzab 33:40 · Surah al-Baqarah 2:285',
    },
    shortPractice: [
      'Send Salawat upon Prophet Muhammad ﷺ throughout your day.',
      'Mirror prophetic honesty, patience, and kindness in ordinary conversations.',
    ],
    dailyPractice: [
      'Send abundant Salawat upon Prophet Muhammad ﷺ and honor all Prophets.',
      'Study the Seerah and embody prophetic honesty and mercy.',
      'Learn the stories of the 25 Prophets named in the Qur’an.',
    ],
    checkQuestion: {
      prompt: 'Which four essential qualities does every Prophet of Allah possess?',
      options: [
        'Truthfulness, Trustworthiness, Conveying the Message, and Wisdom.',
        'Worldly kingship, wealth, conquest, and poetry.',
        'Independent knowledge of the unseen without revelation.',
      ],
      correctIndex: 0,
      explanation:
        'Every Prophet necessarily possesses Sidq (Truthfulness), Amanah (Trustworthiness), Tabligh (Conveying the Message), and Fatanah (Wisdom).',
    },
  },
  {
    id: 'iman-last-day',
    region: 'iman',
    order: 10,
    regionOrder: 5,
    roman: 'V',
    pillarLabel: '5th Pillar of Faith',
    title: 'Belief in the Last Day',
    englishMeaning: 'Day of Judgment',
    arabic: 'الإِيمَانُ بِاليَوْمِ الآخِر',
    shortSummary:
      'Certainty that we will return to Allah in complete justice and mercy — where not even an atom’s weight of kindness is ever lost.',
    recognitionCue:
      'Resurrection, the Scales of Justice, Prophetic Intercession, and eternal home.',
    placeCaption: 'Fifth Article of Faith',
    artifactName: 'Scales of Justice',
    artifactShort: 'Scales of Justice',
    artifactSheet: 'cosmos',
    artifactFocus: '82% 52%',
    artifactScale: 215,
    x: 948,
    y: 756,
    dayX: 948,
    dayY: 756,
    arabicFormula: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ۝ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ',
    transliteration: 'Faman ya‘mal mithqala dharratin khayran yarah, wa man ya‘mal mithqala dharratin sharran yarah',
    formulaTranslation:
      '“Whoever does an atom’s weight of good will see it, and whoever does an atom’s weight of evil will see it.”',
    keyTerms: [
      {
        arabic: 'البَعْث وَالحِسَاب',
        term: 'Resurrection & Reckoning',
        meaning: 'Standing before Allah in complete justice and mercy.',
      },
      {
        arabic: 'المِيزَان',
        term: 'The Scales (Mizan)',
        meaning: 'Every sincere intention and deed is weighed fairly.',
      },
      {
        arabic: 'الشَّفَاعَة',
        term: 'Intercession & Mercy',
        meaning: 'Hoping in Allah’s mercy and the Prophet’s ﷺ intercession.',
      },
    ],
    classicalProof: {
      text: '“We place the scales of justice for the Day of Resurrection, so no soul is treated unjustly at all.”',
      source: 'Surah az-Zalzalah 99:7–8 · Surah al-Anbiya’ 21:47',
    },
    shortPractice: [
      'Take one quiet minute before sleep to review your day and forgive.',
      'Never dismiss a small kindness — a gentle word weighs heavily on the Scales.',
    ],
    dailyPractice: [
      'Practice brief nightly self-reflection (Muhasabah) before sleep.',
      'Value even the smallest unseen kindness.',
      'Balance mindful accountability with deep hope in Allah’s Mercy.',
    ],
    checkQuestion: {
      prompt: 'How does belief in the Last Day shape our choices today?',
      options: [
        'It gives lasting worth to every sincere act of kindness and fairness.',
        'It makes everyday honesty unimportant.',
        'It asks believers to stop helping their community.',
      ],
      correctIndex: 0,
      explanation:
        'Certainty in the Last Day brings peace and integrity: no quiet good deed is ever forgotten before Allah.',
    },
  },
  {
    id: 'iman-qadr',
    region: 'iman',
    order: 11,
    regionOrder: 6,
    roman: 'VI',
    pillarLabel: '6th Pillar of Faith',
    title: 'Belief in Divine Decree',
    englishMeaning: 'Eternal Measure',
    arabic: 'الإِيمَانُ بِالقَدَر',
    shortSummary:
      'Trusting Allah’s timeless knowledge and wisdom in all that unfolds — doing our honest best while resting the heart in peace.',
    recognitionCue:
      'Combining wise personal effort (“tie your camel”) with serene trust in Allah.',
    placeCaption: 'Sixth Article of Faith',
    artifactName: 'Golden Hourglass',
    artifactShort: 'Golden Hourglass',
    artifactSheet: 'cosmos',
    artifactFocus: '54% 62%',
    artifactScale: 230,
    x: 1300,
    y: 756,
    dayX: 1300,
    dayY: 756,
    arabicFormula: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ',
    transliteration: 'Inna kulla shay’in khalaqnahu bi-qadar',
    formulaTranslation:
      '“Indeed, We have created all things according to a precise measure.”',
    keyTerms: [
      {
        arabic: 'العِلْم وَالكِتَابَة',
        term: 'Knowledge & Preserved Tablet',
        meaning: 'Allah eternally knows all things and inscribed all measures.',
      },
      {
        arabic: 'المَشِيئَة وَالخَلْق',
        term: 'Divine Will & Creation',
        meaning: 'Nothing occurs outside Allah’s wisdom and will.',
      },
      {
        arabic: 'التَّوَكُّل',
        term: 'Choice & Trust (Tawakkul)',
        meaning: 'We take wise, responsible action and entrust the outcome to Allah.',
      },
    ],
    classicalProof: {
      text: '“...and to believe in Divine Decree, both its ease and its trial.”',
      source: 'Surah al-Qamar 54:49 · Sahih Muslim 8',
    },
    shortPractice: [
      'Do your sincere best, then release anxiety about what you cannot control.',
      'Meet blessings with gratitude (Shukr) and delays with patience (Sabr).',
    ],
    dailyPractice: [
      'Pair diligent effort with calm reliance on Allah (Tawakkul).',
      'Meet ease with gratitude and trials with patience.',
      'Turn to Du‘a actively, for supplication is part of Allah’s mercy.',
    ],
    checkQuestion: {
      prompt: 'How do Divine Decree (Al-Qadr) and human effort work together?',
      options: [
        'We take responsible action (“tie your camel”) while trusting the outcome to Allah.',
        'We stop making plans or seeking helpful means.',
        'Events happen randomly outside Allah’s knowledge.',
      ],
      correctIndex: 0,
      explanation:
        'The Prophet ﷺ taught us to pair sincere effort with calm trust in Allah — acting wisely without anxious despair.',
    },
  },
];

export const LESSON_ONE_VALID_IDS = LESSON_ONE_LANDMARKS.map((item) => item.id);

export const LESSON_ONE_GROUP_QUIZZES = {
  islam: [
    {
      id: 'islam-q1',
      prompt: 'How do the two parts of the Shahadah work together?',
      options: [
        'They teach Who we worship (Allah alone) and how to worship Him (through Prophet Muhammad ﷺ).',
        'One part is for Ramadan and the other is only for Hajj.',
        'The second part is optional in daily prayer.',
      ],
      correctIndex: 0,
      explanation:
        'Both testimonies belong together: pure devotion to Allah alone, guided by the Sunnah of His Messenger ﷺ.',
    },
    {
      id: 'islam-q2',
      prompt: 'Which accurately describes daily Salah and annual Zakah?',
      options: [
        '17 daily Fard rak‘ahs across five prayers, and 2.5% on qualifying lunar-year savings.',
        '10 daily Fard rak‘ahs, and charity given only once in a lifetime.',
        'Praying only on Fridays, and giving 25% of monthly income.',
      ],
      correctIndex: 0,
      explanation:
        'Five daily prayers total 17 obligatory rak‘ahs, and Zakah is 2.5% on surplus savings held above Nisab for one lunar year.',
    },
  ],
  iman: [
    {
      id: 'iman-q1',
      prompt: 'What does “There is nothing whatsoever like unto Him” (42:11) establish?',
      options: [
        'Allah is completely above any body, form, or likeness to creation, while possessing eternal perfection.',
        'Allah can be pictured as having a physical form or direction.',
        'Allah created the universe and stepped away from caring for it.',
      ],
      correctIndex: 0,
      explanation:
        'Sunni creed unites pure transcendence above created likeness with affirming Allah’s perfect Attributes.',
    },
    {
      id: 'iman-q2',
      prompt: 'How do Islam and Iman work together in a believer’s life?',
      options: [
        'Islam guides outward worship, while Iman anchors inward belief — pairing effort with trust in Allah.',
        'Islam is only for beginners while Iman replaces daily prayer.',
        'Belief in Divine Decree means abandoning effort and planning.',
      ],
      correctIndex: 0,
      explanation:
        'Outward worship (Islam) and inward conviction (Iman) are inseparable — pairing sincere effort with calm trust in Allah.',
    },
  ],
};
