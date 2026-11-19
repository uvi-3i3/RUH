/**
 * Lesson I: Foundations of Faith & Practice (Arkan al-Islam & Arkan al-Iman)
 *
 * Practical, structured classical curriculum grounded in the Hadith of Jibril ﷺ (Sahih Muslim 8)
 * and pure Ahl al-Sunnah wa'l-Jama'ah scholarship:
 *  - Part I: The Five Pillars of Islam (Arkan al-Islam — Outward Foundations of Worship)
 *  - Part II: The Six Pillars of Faith (Arkan al-Iman — Inward Foundations of Creed)
 *  - Mastery Quiz & Next Curriculum Unlock: Lesson II — The Gates of Taharah (Sacred Purification & Wudu)
 */

export const LESSON_ONE_STORAGE_KEY = 'ruh_learning_path_lesson1_v1';

export const PILLAR_GROUPS = [
  {
    id: 'islam',
    numberLabel: 'Part I · 5 Pillars',
    title: 'The Five Pillars of Islam',
    transliteration: 'Arkan al-Islam',
    arabic: 'أَرْكَانُ الإِسْلَام',
    subtitle: 'Outward Foundations of Sacred Practice',
    summary:
      'The five obligatory acts of worship established by the limbs and tongue, upon which a Muslim’s outward practice stands.',
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
    title: 'The Six Pillars of Faith',
    transliteration: 'Arkan al-Iman',
    arabic: 'أَرْكَانُ الإِيمَان',
    subtitle: 'Inward Foundations of Sacred Creed',
    summary:
      'The six essential articles of inward conviction affirmed by the heart, forming the creed (‘Aqidah) of Ahl al-Sunnah wa’l-Jama‘ah.',
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
    subtitle: 'Sacred Purification & Wudu',
    arabic: 'أَبْوَابُ الطَّهَارَة',
    artifactName: 'Stone Citadel Archway & Marble Ablution Fountain',
    artifactSheet: 'buildings',
    artifactFocus: '22% 78%',
    artifactScale: 215,
    mysteryWhisper:
      'Before standing in prayer before the Divine, the seeker enters the Courtyard of Purification — mastering the obligatory (Fard) and Sunnah steps of Wudu.',
    unlockRequirementText: 'Complete all 11 Pillars of Islam & Faith in Lesson I to unlock Lesson II',
    x: 750,
    y: 148,
    dayX: 750,
    dayY: 148,
    isPrimaryGate: true,
    previewSteps: [
      {
        order: 1,
        arabic: 'غَسْلُ الوَجْهِ',
        title: 'Washing the Entire Face',
        transliteration: 'Ghasl al-Wajh (with Intention / Niyyah)',
        detail:
          'From the hairline to the chin and ear to ear, accompanied by the inward intention (Niyyah) of purification for worship (Qur’an 5:6).',
      },
      {
        order: 2,
        arabic: 'غَسْلُ اليَدَيْنِ إِلَى المِرْفَقَيْنِ',
        title: 'Washing Both Arms Including Elbows',
        transliteration: 'Ghasl al-Yadayn ila al-Mirfaqayn',
        detail:
          'Washing the right arm and then the left arm thoroughly from the fingertips up to and including the elbows.',
      },
      {
        order: 3,
        arabic: 'مَسْحُ الرَّأْسِ',
        title: 'Wiping Over the Head',
        transliteration: 'Mash al-Ra’s',
        detail:
          'Passing wet hands gently over the head, fulfilling the Qur’anic command: “and wipe over your heads” (Surah al-Ma’idah 5:6).',
      },
      {
        order: 4,
        arabic: 'غَسْلُ الرِّجْلَيْنِ إِلَى الكَعْبَيْنِ',
        title: 'Washing Both Feet Including Ankles',
        transliteration: 'Ghasl al-Rijlayn ila al-Ka‘bayn',
        detail:
          'Washing the right foot and then the left foot up to and including the ankle bones, ensuring water reaches between the toes.',
      },
    ],
  },
  {
    id: 'lesson-3-fiqh-salah',
    lessonNumber: 'Lesson III',
    title: 'The Inner & Outer Light of Salah',
    subtitle: 'Conditions, Pillars & Khushu of Prayer',
    arabic: 'أَسْرَارُ الصَّلَاة',
    artifactName: 'Carved Limestone Mihrab Sanctuary',
    artifactSheet: 'sanctuary',
    artifactFocus: '62% 45%',
    artifactScale: 200,
    mysteryWhisper:
      'Mastering the prerequisites (Shurut), integral pillars (Arkan), recitations, and serene presence (Khushu) of the five daily prayers.',
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
    subtitle: 'Purifying the Heart & Beautifying Character',
    arabic: 'تَزْكِيَةُ النَّفْس',
    artifactName: 'Hanging Sanctuary Mishkat Lamp',
    artifactSheet: 'sanctuary',
    artifactFocus: '22% 55%',
    artifactScale: 210,
    mysteryWhisper:
      'The third dimension of the Hadith of Jibril ﷺ: worshipping Allah as though you see Him, and purifying the heart from pride, envy, and heedlessness.',
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
  // PART I: THE FIVE PILLARS OF ISLAM (ARKAN AL-ISLAM — OUTWARD PRACTICE)
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
    recognitionCue: 'Uniting heartfelt conviction in Allah’s Oneness (Tawhid) with following the prophetic guidance of Muhammad ﷺ.',
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
      'I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is the Messenger of Allah.',
    keyTerms: [
      {
        arabic: 'أَشْهَدُ',
        term: 'Ash-hadu',
        meaning: 'I bear witness with firm knowledge, heartfelt certainty (Yaqin), and verbal declaration.',
      },
      {
        arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
        term: 'La ilaha illa Allah',
        meaning: 'Affirming Divine Oneness (Tawhid): none possesses divinity or deserves worship save Allah alone.',
      },
      {
        arabic: 'مُحَمَّدًا رَسُولُ اللَّهِ',
        term: 'Muhammadan Rasulu Allah',
        meaning: 'Affirming that Prophet Muhammad ﷺ is the final Messenger sent to all creation, whose Sunnah guides our worship.',
      },
    ],
    classicalProof: {
      text: '“Islam is to testify that there is no deity but Allah and that Muhammad is the Messenger of Allah...”',
      source: 'Hadith of Jibril ﷺ · Sahih Muslim 8',
    },
    dailyPractice: [
      'Recite the Shahadah with presence of heart upon waking, after Wudu, and during the Tashahhud of every prayer.',
      'Unite the two testimonies: worship Allah alone and follow His Messenger ﷺ in character, mercy, and obedience.',
      'Renew your conviction daily through remembrance (Dhikr) of La ilaha illa Allah.',
    ],
    checkQuestion: {
      prompt: 'Why does the Shahadah consist of two inseparable testimonies joined together?',
      options: [
        'Because knowing who to worship (Allah alone) requires knowing how to worship Him (through His Messenger Muhammad ﷺ).',
        'Because one testimony is only recited during Ramadan and the other during Hajj.',
        'Because the second testimony is optional for daily prayers.',
      ],
      correctIndex: 0,
      explanation:
        'In classical Sunni theology, the first testimony establishes Who we worship (Allah alone), and the second establishes the authentic path of worship revealed through Prophet Muhammad ﷺ.',
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
    recognitionCue: 'Establishing the five obligatory daily prayers at their appointed solar times with purification, focus, and humility.',
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
      '“Indeed, prayer has been decreed upon the believers at appointed times.” (Surah an-Nisa’ 4:103)',
    keyTerms: [
      {
        arabic: 'الفَجْر (٢) · الظُّهْر (٤)',
        term: 'Fajr (2) & Dhuhr (4)',
        meaning: 'Dawn prayer (2 obligatory rak‘ahs before sunrise) and Midday prayer (4 obligatory rak‘ahs after the sun passes its zenith).',
      },
      {
        arabic: 'العَصْر (٤) · المَغْرِب (٣)',
        term: '‘Asr (4) & Maghrib (3)',
        meaning: 'Late afternoon prayer (4 obligatory rak‘ahs) and Sunset prayer (3 obligatory rak‘ahs immediately after sunset).',
      },
      {
        arabic: 'العِشَاء (٤) · الإِقَامَة',
        term: '‘Isha’ (4) & Iqamah',
        meaning: 'Night prayer (4 obligatory rak‘ahs), completing 17 obligatory rak‘ahs each day performed facing the Qiblah in a state of Wudu.',
      },
    ],
    classicalProof: {
      text: '“...to establish the prayer (tuqima as-salah)...” — Establishing it means fulfilling its outward rulings and inward humility (Khushu‘).',
      source: 'Hadith of Jibril ﷺ · Sahih Muslim 8 & Surah an-Nisa’ 4:103',
    },
    dailyPractice: [
      'Guard all 5 daily obligatory prayers (17 Fard rak‘ahs total: 2 Fajr, 4 Dhuhr, 4 ‘Asr, 3 Maghrib, 4 ‘Isha’) within their appointed time windows.',
      'Prepare before standing in prayer through proper Wudu (Taharah), clean attire, and facing the Qiblah.',
      'Cultivate Khushu‘ (serene presence of heart) by reflecting on the verses of Surah al-Fatihah in every unit.',
    ],
    checkQuestion: {
      prompt: 'How many obligatory (Fard) rak‘ahs are prayed across the five daily prayers in total each day?',
      options: [
        '17 obligatory rak‘ahs (2 Fajr + 4 Dhuhr + 4 ‘Asr + 3 Maghrib + 4 ‘Isha’).',
        '10 obligatory rak‘ahs (2 for each of the five prayers).',
        '20 obligatory rak‘ahs (4 for each of the five prayers).',
      ],
      correctIndex: 0,
      explanation:
        'Every adult Muslim prays 17 obligatory (Fard) rak‘ahs daily across the five appointed times: Fajr (2), Dhuhr (4), ‘Asr (4), Maghrib (3), and ‘Isha’ (4).',
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
    recognitionCue: 'Giving the obligatory purifying share of one’s qualifying wealth annually to eligible recipients such as the poor and needy.',
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
      '“And establish the prayer and give the purifying alms (Zakah).” (Surah al-Baqarah 2:43)',
    keyTerms: [
      {
        arabic: 'النِّصَاب',
        term: 'An-Nisab (Minimum Threshold)',
        meaning: 'The minimum threshold of surplus wealth (equivalent to 85g of gold or 595g of silver) above one’s basic needs and debts.',
      },
      {
        arabic: 'الحَوْل (٢.٥٪)',
        term: 'Al-Hawl & 2.5% Rate',
        meaning: 'When qualifying savings remain at or above the Nisab for one full lunar year (Hawl), 2.5% (one-fortieth) is due.',
      },
      {
        arabic: 'التَّزْكِيَة',
        term: 'Purification & Growth',
        meaning: 'Literally “purification and blessing”: Zakah cleanses the heart from greed and purifies remaining wealth.',
      },
    ],
    classicalProof: {
      text: '“Take from their wealth a charity by which you purify them and cause them to grow in blessing.”',
      source: 'Surah at-Tawbah 9:103 & Hadith of Jibril ﷺ',
    },
    dailyPractice: [
      'Track your lunar Zakah anniversary date (Hawl) if your savings, gold, silver, or business assets exceed the Nisab threshold.',
      'Calculate and distribute 2.5% of qualifying lunar-year savings directly to eligible categories defined in Surah at-Tawbah 9:60.',
      'Complement annual obligatory Zakah with voluntary daily charity (Sadaqah), kindness, and generosity.',
    ],
    checkQuestion: {
      prompt: 'When does obligatory Zakah on cash, gold, or savings become due?',
      options: [
        'When surplus wealth reaches the Nisab threshold and is held for one full lunar year (at 2.5%).',
        'Every Friday regardless of how much wealth or debt a person has.',
        'Only once in a lifetime at the same time as Hajj.',
      ],
      correctIndex: 0,
      explanation:
        'Zakah on savings, gold, silver, and trade goods is due annually at 2.5% once wealth reaches the Nisab threshold and completes one lunar year (Hawl).',
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
    recognitionCue: 'Abstaining from food, drink, and marital relations from true dawn (Fajr) until sunset (Maghrib) throughout the blessed month of Ramadan.',
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
      '“Fasting has been prescribed for you as it was prescribed for those before you, so that you may attain Taqwa (God-consciousness).” (Surah al-Baqarah 2:183)',
    keyTerms: [
      {
        arabic: 'النِّيَّة',
        term: 'Inward Intention (Niyyah)',
        meaning: 'Forming the intention in the heart to fast for the sake of Allah alone.',
      },
      {
        arabic: 'مِنَ الفَجْرِ إِلَى المَغْرِب',
        term: 'True Dawn to Sunset',
        meaning: 'Abstaining from all nullifiers of the fast from the break of true dawn (Fajr Sadiq) until the sun sets cleanly (Maghrib).',
      },
      {
        arabic: 'حِفْظُ اللِّسَان',
        term: 'Fasting of the Tongue & Heart',
        meaning: 'Guarding the tongue, eyes, and limbs from backbiting, anger, and falsehood so the fast bears the fruit of Taqwa.',
      },
    ],
    classicalProof: {
      text: '“...and to fast the month of Ramadan (wa tasuma Ramadan)...”',
      source: 'Hadith of Jibril ﷺ · Sahih Muslim 8 & Surah al-Baqarah 2:183–185',
    },
    dailyPractice: [
      'Observe the obligatory fast of the 9th lunar month (Ramadan) with pre-dawn meal (Suhur) and prompt breaking of the fast at sunset (Iftar).',
      'Guard the spiritual integrity of the fast by refraining from argument, gossip, and harsh speech.',
      'Keep the rhythm of fasting alive year-round through voluntary Sunnah fasts (such as Mondays, Thursdays, or the three White Days).',
    ],
    checkQuestion: {
      prompt: 'What is the daily time span of the Islamic fast (Sawm), and what is its primary spiritual purpose in Qur’an 2:183?',
      options: [
        'From true dawn (Fajr) until sunset (Maghrib), in order to cultivate Taqwa (mindful God-consciousness).',
        'From sunrise until midnight, in order to test physical endurance alone.',
        'From midday (Dhuhr) until the next morning’s Fajr prayer.',
      ],
      correctIndex: 0,
      explanation:
        'The Islamic fast begins at true dawn (Fajr) and ends at sunset (Maghrib), with the Qur’anic purpose of cultivating Taqwa — inward mindfulness, gratitude, and self-restraint.',
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
    recognitionCue: 'Undertaking the sacred pilgrimage to the House of Allah (the Ka‘bah) in Makkah once in a lifetime for those physically and financially able.',
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
      '“And due to Allah from the people is a pilgrimage to the House — for whoever is able to find thereto a way.” (Surah Ali ‘Imran 3:97)',
    keyTerms: [
      {
        arabic: 'الإِحْرَام وَالتَّلْبِيَة',
        term: 'Ihram & Talbiyah',
        meaning: 'Entering the sacred state of consecration and answering Allah’s call: “Labbayk Allahumma Labbayk” (Here I am, O Allah, here I am).',
      },
      {
        arabic: 'الوُقُوفُ بِعَرَفَة',
        term: 'Standing at ‘Arafah (9th Dhul-Hijjah)',
        meaning: 'The pinnacle pillar of Hajj on the 9th of Dhul-Hijjah — standing in humble supplication and repentance on the plain of ‘Arafah.',
      },
      {
        arabic: 'الطَّوَاف وَالسَّعْي',
        term: 'Tawaf & Sa‘i',
        meaning: 'Circumambulating the Sacred Ka‘bah seven times (Tawaf) and walking seven times between the hills of Safa and Marwah (Sa‘i).',
      },
    ],
    classicalProof: {
      text: '“...and to perform pilgrimage to the House if you are able to find a way to it.”',
      source: 'Hadith of Jibril ﷺ · Sahih Muslim 8 & Surah Ali ‘Imran 3:97',
    },
    dailyPractice: [
      'Form a sincere lifelong intention and financial plan to fulfill Hajj once in your lifetime as soon as you possess health and lawful provision.',
      'Turn your heart toward the Ka‘bah five times daily in prayer, remembering the unity of believers around one Qiblah.',
      'Observe the sacred first ten days of Dhul-Hijjah with extra remembrance (Takbir), charity, and fasting on the Day of ‘Arafah (for non-pilgrims).',
    ],
    checkQuestion: {
      prompt: 'Upon whom is the pilgrimage of Hajj obligatory, and how often is it required in a lifetime?',
      options: [
        'Once in a lifetime upon every adult Muslim who is physically and financially able to make the journey safely.',
        'Every three years upon every Muslim regardless of health or financial means.',
        'Only upon scholars and residents of the Arabian Peninsula.',
      ],
      correctIndex: 0,
      explanation:
        'Hajj is obligatory once in a lifetime upon every sane adult Muslim who possesses the physical health, safe passage, and lawful financial means (Istita‘ah).',
    },
  },

  // ============================================================================
  // PART II: THE SIX PILLARS OF FAITH (ARKAN AL-IMAN — INWARD CREED)
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
    recognitionCue: 'Unwavering conviction in the existence, absolute Oneness (Tawhid), eternal perfection, and incomparable Majesty of Allah Most High.',
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
      '“There is nothing whatsoever like unto Him, and He is the All-Hearing, the All-Seeing.” (Surah ash-Shura 42:11)',
    keyTerms: [
      {
        arabic: 'التَّوْحِيد',
        term: 'Absolute Oneness (Tawhid)',
        meaning: 'Allah is One in His Essence, One in His eternal Attributes, and One in His actions — without partner, equal, parent, or offspring.',
      },
      {
        arabic: 'التَّنْزِيه',
        term: 'Transcendence (Tanzih)',
        meaning: 'As affirmed by Ahl al-Sunnah wa’l-Jama‘ah (Qur’an 42:11), Allah is exalted above all resemblance to creation, physical body, form, limit, or direction.',
      },
      {
        arabic: 'الأَسْمَاءُ الحُسْنَى',
        term: 'Beautiful Names & Attributes',
        meaning: 'Knowing and calling upon Allah through His Most Beautiful Names — such as Ar-Rahman (All-Merciful), Al-‘Alim (All-Knowing), Al-Qadir (All-Powerful), and Al-Hakim (All-Wise).',
      },
    ],
    classicalProof: {
      text: '“Say: He is Allah, the One; Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.”',
      source: 'Surah al-Ikhlas 112:1–4 & Surah ash-Shura 42:11',
    },
    dailyPractice: [
      'Reflect daily upon Allah’s signs in the heavens, the earth, and your own soul with awe and gratitude.',
      'Hold fast to pure Sunni transcendence (Tanzih): affirm Allah’s perfection without comparing Him to created things (“Laysa kamithlihi shay’”).',
      'Call upon Allah through His Beautiful Names in times of ease and hardship alike.',
    ],
    checkQuestion: {
      prompt: 'What foundational principle of belief about Allah does Surah ash-Shura 42:11 (“There is nothing whatsoever like unto Him”) establish?',
      options: [
        'That Allah is completely transcendent above any resemblance to created things, while possessing perfect Hearing, Sight, Knowledge, and Power.',
        'That Allah resembles human beings or occupies a physical body in space.',
        'That Allah created the universe and then ceased knowing what occurs within it.',
      ],
      correctIndex: 0,
      explanation:
        'Surah ash-Shura 42:11 is the cornerstone of Sunni creed: uniting pure transcendence (“There is nothing like unto Him”) with affirmation of His eternal perfection (“and He is the All-Hearing, the All-Seeing”).',
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
    recognitionCue: 'Believing in the honored, sinless beings created by Allah from light who never disobey Him and carry out His commands throughout the cosmos.',
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
      '“They do not disobey Allah in what He commands them, and they do whatever they are commanded.” (Surah at-Tahrim 66:6)',
    keyTerms: [
      {
        arabic: 'جِبْرِيل عَلَيْهِ السَّلَام',
        term: 'Jibril (Archangel of Revelation)',
        meaning: 'The trustworthy Spirit (Ar-Ruh al-Amin) entrusted with bringing Divine Revelation to all the Prophets.',
      },
      {
        arabic: 'مِيكَائِيل وَإِسْرَافِيل',
        term: 'Mika’il & Israfil',
        meaning: 'Mika’il is entrusted with rain, vegetation, and provision; Israfil is entrusted with sounding the Trumpet on the Day of Resurrection.',
      },
      {
        arabic: 'الكِرَامُ الكَاتِبُون',
        term: 'Kiramun Katibun (Noble Recorders)',
        meaning: 'The guardian and recording angels who accompany every human being, recording every word and deed with complete justice.',
      },
    ],
    classicalProof: {
      text: '“The Messenger has believed in what was revealed to him from his Lord, and so have the believers: all of them have believed in Allah, His Angels, His Books, and His Messengers.”',
      source: 'Surah al-Baqarah 2:285 & Hadith of Jibril ﷺ',
    },
    dailyPractice: [
      'Remember that noble recording angels (Kiramun Katibun) are present with you, inspiring modesty, truthfulness, and good speech.',
      'Attend gatherings of remembrance (Dhikr), prayer, and sacred knowledge, which the angels surround with their wings.',
      'Keep your home and heart pure, welcoming the companionship of the angels of mercy.',
    ],
    checkQuestion: {
      prompt: 'Which Archangel was entrusted by Allah to bring the Noble Qur’an and Divine Revelation to the Prophets?',
      options: [
        'Jibril (Gabriel) عليه السلام — known in the Qur’an as Ar-Ruh al-Amin (The Trustworthy Spirit).',
        'Israfil عليه السلام — who is entrusted with the Trumpet of Resurrection.',
        'Malik عليه السلام — who is the keeper of Hellfire.',
      ],
      correctIndex: 0,
      explanation:
        'Sayyiduna Jibril عليه السلام is the Archangel of Revelation who conveyed the Qur’an to Prophet Muhammad ﷺ and taught the companions in the famous Hadith of Jibril.',
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
    recognitionCue: 'Believing in all divinely revealed scriptures sent by Allah to guide humanity, culminating in the final, preserved Noble Qur’an.',
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
      '“Indeed, it is We who sent down the Reminder (the Qur’an), and indeed, We will be its Guardian.” (Surah al-Hijr 15:9)',
    keyTerms: [
      {
        arabic: 'الصُّحُف وَالتَّوْرَاة',
        term: 'Suhuf (Ibrahim) & Tawrah (Musa)',
        meaning: 'The Scrolls revealed to Prophet Ibrahim and the original Torah revealed to Prophet Musa عليهما السلام.',
      },
      {
        arabic: 'الزَّبُور وَالإِنْجِيل',
        term: 'Zabur (Dawud) & Injil (‘Isa)',
        meaning: 'The Psalms revealed to Prophet Dawud and the original Gospel revealed to Prophet ‘Isa عليهما السلام.',
      },
      {
        arabic: 'القُرْآنُ الكَرِيم',
        term: 'Al-Qur’an al-Karim (Final Criterion)',
        meaning: 'Revealed to Prophet Muhammad ﷺ as the final, universal, and divinely preserved Scripture (Muhaymin) confirming and superseding earlier laws.',
      },
    ],
    classicalProof: {
      text: '“And We have revealed to you the Book in truth, confirming that which preceded it of the Scripture and as a criterion (Muhaymin) over it.”',
      source: 'Surah al-Ma’idah 5:48',
    },
    dailyPractice: [
      'Maintain a daily portion (Wird) of reciting, listening to, and contemplating (Tafakkur) the Noble Qur’an.',
      'Honor all original revelations sent to earlier Prophets while living by the final, preserved guidance of the Qur’an.',
      'Approach the Qur’an with outward cleanliness (Wudu), reverence, and a heart ready to act upon its verses.',
    ],
    checkQuestion: {
      prompt: 'Which four major revealed Books (aside from the Scrolls of Ibrahim) are explicitly named in the Qur’an?',
      options: [
        'At-Tawrah (to Musa), Az-Zabur (to Dawud), Al-Injil (to ‘Isa), and Al-Qur’an (to Muhammad ﷺ).',
        'Only the Qur’an is named; no earlier scriptures are mentioned in Islamic creed.',
        'At-Tawrah, Al-Muwatta, Sahih al-Bukhari, and Al-Injil.',
      ],
      correctIndex: 0,
      explanation:
        'A Muslim believes in all original scriptures revealed by Allah, specifically the Scrolls (Suhuf) of Ibrahim, the Tawrah of Musa, the Zabur of Dawud, the Injil of ‘Isa, and the final preserved Qur’an revealed to Muhammad ﷺ.',
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
    recognitionCue: 'Revering and believing in all Prophets and Messengers chosen by Allah — from Adam, the first Prophet, to Muhammad ﷺ, the Seal of the Prophets.',
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
      '“Muhammad is not the father of any of your men, but he is the Messenger of Allah and the Seal of the Prophets.” (Surah al-Ahzab 33:40)',
    keyTerms: [
      {
        arabic: 'أُولُو العَزْمِ مِنَ الرُّسُل',
        term: 'The 5 Ulul-‘Azm (Messengers of Resolve)',
        meaning: 'The five greatest Messengers of steadfast resolve: Nuh, Ibrahim, Musa, ‘Isa, and Muhammad — peace and blessings be upon them all.',
      },
      {
        arabic: 'الصِّدْق وَالأَمَانَة وَالتَّبْلِيغ وَالفَطَانَة',
        term: '4 Essential Prophetic Attributes',
        meaning: 'Every Prophet necessarily possesses Sidq (Truthfulness), Amanah (Infallible Trustworthiness), Tabligh (Complete Delivery of the Message), and Fatanah (Supreme Wisdom).',
      },
      {
        arabic: 'خَاتَمُ النَّبِيِّين',
        term: 'Seal of the Prophets (Khatam an-Nabiyyin)',
        meaning: 'Prophet Muhammad ﷺ is the final Prophet and Messenger; no prophet comes after him, and his message endures until the Last Day.',
      },
    ],
    classicalProof: {
      text: '“We make no distinction between any of His Messengers — and they say: We hear and we obey.”',
      source: 'Surah al-Baqarah 2:285 & Surah al-Ahzab 33:40',
    },
    dailyPractice: [
      'Send abundant Salawat (blessings and peace) upon Prophet Muhammad ﷺ and honor all Prophets of Allah with reverence.',
      'Study the Prophetic Seerah and embody his mercy, truthfulness (Sidq), and trustworthiness (Amanah) in your dealings.',
      'Know the 25 Prophets mentioned by name in the Noble Qur’an while believing in all Prophets sent by Allah.',
    ],
    checkQuestion: {
      prompt: 'What are the four necessary attributes that every Prophet and Messenger of Allah possesses in classical Sunni creed?',
      options: [
        'Sidq (Truthfulness), Amanah (Trustworthiness), Tabligh (Conveying the Message), and Fatanah (Wisdom/Intelligence).',
        'Wealth, worldly kingship, military conquest, and poetry.',
        'Knowledge of the unseen independent of revelation.',
      ],
      correctIndex: 0,
      explanation:
        'In classical Sunni ‘Aqidah, every Prophet is protected from betrayal or error in their mission and necessarily possesses Sidq, Amanah, Tabligh, and Fatanah.',
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
    recognitionCue: 'Certainty in bodily resurrection, the Scales of Justice, the Reckoning, Prophetic Intercession, Paradise (al-Jannah), and Hellfire (an-Nar).',
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
      '“So whoever does an atom’s weight of good will see it, and whoever does an atom’s weight of evil will see it.” (Surah az-Zalzalah 99:7–8)',
    keyTerms: [
      {
        arabic: 'البَعْث وَالحِسَاب',
        term: 'Resurrection (Ba‘th) & Reckoning (Hisab)',
        meaning: 'Allah will resurrect all creation in body and soul to stand before Him in absolute justice and mercy.',
      },
      {
        arabic: 'المِيزَان وَالصِّرَاط',
        term: 'The Scales (Mizan) & The Bridge (Sirat)',
        meaning: 'Deeds are weighed on the Scales of Justice (al-Mizan), and humanity crosses the Bridge (as-Sirat) according to their faith and deeds.',
      },
      {
        arabic: 'الشَّفَاعَة وَالحَوْض',
        term: 'Prophetic Intercession & Al-Kawthar',
        meaning: 'Affirming the blessed Fountain (Hawd) and the Intercession (Shafa‘ah) granted by Allah to Prophet Muhammad ﷺ for the believers.',
      },
    ],
    classicalProof: {
      text: '“And We place the scales of justice for the Day of Resurrection, so no soul will be treated unjustly at all.”',
      source: 'Surah al-Anbiya’ 21:47',
    },
    dailyPractice: [
      'Practice daily self-accounting (Muhasabah) before sleeping: ask whom you can forgive, what debt or right you must fulfill, and what good deed you can prepare.',
      'Never belittle even an atom’s weight of kindness — a gentle word, a smile, or removing harm from the road weighs heavily on the Mizan.',
      'Pair healthy awe of accountability with deep hope (Raja’) in Allah’s vast Mercy and the Prophet’s ﷺ intercession.',
    ],
    checkQuestion: {
      prompt: 'How does certainty in the Last Day transform a believer’s daily choices here and now?',
      options: [
        'It gives meaning and eternal weight to every sincere intention and atom of justice, because nothing is lost before Allah.',
        'It makes worldly ethics unimportant so long as a person memorizes dates.',
        'It causes a believer to abandon working or helping society.',
      ],
      correctIndex: 0,
      explanation:
        'Belief in the Last Day anchors moral integrity: knowing that every hidden kindness and every right owed to others will be weighed fairly on the Mizan.',
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
    recognitionCue: 'Trusting Allah’s eternal knowledge, wisdom, will, and creation of all things — embracing both ease and trial with effort and inner peace.',
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
      '“Indeed, We have created all things according to a precise measure (Qadar).” (Surah al-Qamar 54:49)',
    keyTerms: [
      {
        arabic: 'العِلْم وَالكِتَابَة',
        term: 'Eternal Knowledge (‘Ilm) & Preserved Tablet',
        meaning: 'Allah eternally knows all things before they occur and inscribed all decrees in the Preserved Tablet (al-Lawh al-Mahfuz).',
      },
      {
        arabic: 'المَشِيئَة وَالخَلْق',
        term: 'Divine Will (Mashi’ah) & Creation (Khalq)',
        meaning: 'Whatever Allah wills comes to be, and whatever He does not will cannot occur; He is the Creator of all things and their capacities.',
      },
      {
        arabic: 'الكَسْب وَالتَّوَكُّل',
        term: 'Human Choice (Ikhtiyar/Kasb) & Tawakkul',
        meaning: 'Human beings have real moral choice and responsibility for their actions: we take wise practical means (“tie your camel”) while placing our heart’s trust in Allah.',
      },
    ],
    classicalProof: {
      text: '“...and to believe in Divine Decree (al-Qadr), both its good and its trial (khayrihi wa sharrihi).”',
      source: 'Hadith of Jibril ﷺ · Sahih Muslim 8 & Surah al-Qamar 54:49',
    },
    dailyPractice: [
      'Balance diligent effort with serene trust (Tawakkul): plan and work with excellence, then entrust the outcome to Allah’s wisdom.',
      'Meet blessings with gratitude (Shukr) and unforeseen trials with patience (Sabr), freeing the heart from paralyzing regret over the past.',
      'Use supplication (Du‘a) and charity actively, for Du‘a itself is part of Allah’s wise decree.',
    ],
    checkQuestion: {
      prompt: 'In classical Sunni understanding, how do belief in Divine Decree (al-Qadr) and personal effort relate to one another?',
      options: [
        'We take full practical action and moral responsibility (“tie your camel”) while trusting the heart to Allah’s wisdom (Tawakkul).',
        'Belief in Qadr means abandoning all effort, medicine, and planning.',
        'Belief in Qadr means events happen by random chance outside Allah’s knowledge.',
      ],
      correctIndex: 0,
      explanation:
        'The Prophet ﷺ taught us to combine responsible action with heartfelt reliance on Allah — neither neglecting practical means nor worrying as though the universe were unguided.',
    },
  },
];

export const LESSON_ONE_VALID_IDS = LESSON_ONE_LANDMARKS.map((item) => item.id);

export const LESSON_ONE_GROUP_QUIZZES = {
  islam: [
    {
      id: 'islam-q1',
      prompt: 'How do the two parts of the Shahadah work together in classical Sunni teaching?',
      options: [
        'Affirming Who we worship (Allah alone) and the authentic way to worship Him (via Prophet Muhammad ﷺ).',
        'One testimony is recited in Ramadan and the other only during Hajj.',
        'The second testimony is optional when establishing daily prayer.',
      ],
      correctIndex: 0,
      explanation:
        'Uniting both testimonies anchors pure devotion to Allah alone along the preserved guidance and Sunnah of His Messenger ﷺ.',
    },
    {
      id: 'islam-q2',
      prompt: 'Which combination accurately describes obligatory Salah and annual Zakah?',
      options: [
        '17 daily Fard rak‘ahs across five solar times, and 2.5% on qualifying surplus wealth held for one lunar year.',
        '10 daily Fard rak‘ahs, and charity given only once in a lifetime.',
        'Praying only on Fridays, and giving 25% of gross income each month.',
      ],
      correctIndex: 0,
      explanation:
        'Muslims establish 5 daily prayers (2 Fajr, 4 Dhuhr, 4 ‘Asr, 3 Maghrib, 4 ‘Isha’) and give 2.5% Zakah when surplus wealth stays at or above the Nisab for one lunar year (Hawl).',
    },
  ],
  iman: [
    {
      id: 'iman-q1',
      prompt: 'What foundational truth does Surah ash-Shura 42:11 (“There is nothing whatsoever like unto Him”) establish about Allah?',
      options: [
        'Allah is completely transcendent above physical body, form, or resemblance to creation, while possessing eternal perfection.',
        'Allah can be pictured as occupying a physical form or limited direction.',
        'Allah created the universe and left it without knowledge or care.',
      ],
      correctIndex: 0,
      explanation:
        'Classical Sunni creed (Tanzih) unites complete transcendence above all created likeness with firm affirmation of His perfect Attributes.',
    },
    {
      id: 'iman-q2',
      prompt: 'In the Hadith of Jibril ﷺ, how do the 5 Pillars of Islam and the 6 Pillars of Faith relate to one another?',
      options: [
        'Islam anchors the outward acts of worship, while Iman anchors the inward convictions of the heart — including Divine Decree paired with responsible effort.',
        'Islam is only for beginners while Iman replaces the need for daily worship.',
        'Believing in Divine Decree (Al-Qadr) means abandoning practical effort and planning.',
      ],
      correctIndex: 0,
      explanation:
        'Outward worship (Islam) and inward conviction (Iman) are inseparable wings of a believer’s life, combining wise effort (“tie your camel”) with serene trust in Allah (Tawakkul).',
    },
  ],
};


