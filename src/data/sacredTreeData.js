/**
 * Sacred Tree Knowledge Base (`شجرة العلم`):
 * - 6 Articles of Faith (Arkan al-Iman) -> The Deep Roots (Unseen Foundation)
 * - 5 Pillars of Islam (Arkan al-Islam) -> The Living Branches (Outward Practice & Fiqh)
 *
 * Symbolism grounded in Surah Ibrahim (14:24):
 * "A good word is like a good tree, whose root is firmly fixed and its branches reach into the sky."
 */

export const SACRED_TREE_VERSE = {
  arabic:
    'أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ',
  translation:
    'Have you not seen how Allah sets forth a parable of a good word as a good tree: its root is firmly fixed, and its branches reach into the sky.',
  english:
    'Have you not seen how Allah sets forth a parable of a good word as a good tree: its root is firmly fixed, and its branches reach into the sky.',
  source: 'Surah Ibrahim · 14:24',
  reference: 'Surah Ibrahim · 14:24',
};

export const SACRED_KNOWLEDGE_WISDOM = {
  duaArabic: 'رَبِّ زِدْنِي عِلْمًا',
  duaTranslation: 'My Lord, increase me in knowledge.',
  duaSource: 'Surah Ta-Ha · 20:114',
  hadith:
    'Whoever treads a path in search of knowledge, Allah will make easy for them a path to Paradise.',
  hadithSource: 'Sahih Muslim · 2699',
};

/**
 * THE 6 ARTICLES OF FAITH (ARKAN AL-IMAN) — THE DEEP ROOTS
 * Coordinates are in the 420x520 SVG Tree coordinate space (Earth horizon at y = 268).
 */
export const FAITH_ROOTS = [
  {
    id: 'iman_allah',
    order: 1,
    kind: 'faith',
    shortLabel: 'Allah',
    title: 'Belief in Allah',
    transliteration: 'Al-Iman billah',
    arabic: 'الإِيمَانُ بِاللَّهِ',
    arabicShort: 'اللَّه',
    keyArabicTerm: 'لَيْسَ كَمِثْلِهِ شَيْءٌ · Tanzih',
    keyArabicMeaning: 'Affirming Allah as the Eternal, Necessary Creator, free of likeness, place, or imperfection.',
    symbolRole: 'Primary Taproot · The Source of All Life',
    feedsPillarId: 'islam_shahadah',
    feedsPillarLabel: 'Nourishes the Shahadah & Sincerity of all worship',
    coords: { x: 210, y: 332 },
    branchPath: 'M 210 268 C 210 290, 210 310, 210 332',
    summary:
      'Affirming that Allah is the One, Eternal, Self-Subsisting Creator and Lord of all worlds—without partner, peer, form, or resemblance to anything in creation.',
    essence:
      'Just as the taproot anchors the entire tree and draws water from the unseen depths, knowing Allah is the living core of faith. In the creed of Ahl al-Sunnah wal-Jama‘ah, He is known through His perfection and absolute transcendence above all created limits.',
    pillarsOfUnderstanding: [
      'Wajib al-Wujud (The Necessary Being) — Allah is Eternal without beginning or end, the sole Originator and Sustainer of every realm.',
      'Tanzih (Transcendence) — Nothing resembles Him in Essence, Attributes, or Deeds (42:11); He is free of body, direction, change, or need.',
      'Al-Asma’ al-Husna (The Beautiful Names) — Knowing Him through His ninety-nine Most Beautiful Names and turning to Him in love, awe, and reliance.',
    ],
    evidence: {
      arabic: 'لَيْسَ كَمِثْلِهِ شَيْءٌ ۖ وَهُوَ السَّمِيعُ الْبَصِيرُ',
      translation: 'There is nothing like unto Him, and He is the All-Hearing, the All-Seeing.',
      source: 'Surah Ash-Shura · 42:11',
    },
    reflectionQuestion: 'Which Name of Allah brings your heart the greatest stillness today?',
    reflectionCheck: {
      prompt: 'In classical Sunni Aqeedah, what does the Quranic principle of Tanzih ("There is nothing like unto Him") establish?',
      choices: [
        'That Allah resembles created things in location or form',
        'That Allah transcends all likeness to creation while possessing perfection in His Beautiful Names and Attributes',
        'That creation shares eternity with the Creator',
      ],
      correctIndex: 1,
      insight:
        'Imam al-Tahawi summarizes Ahl al-Sunnah creed: "Allah is exalted beyond all boundaries, limits, limbs, or instruments; nothing is like unto Him."',
    },
  },
  {
    id: 'iman_angels',
    order: 2,
    kind: 'faith',
    shortLabel: 'Angels',
    title: 'Belief in the Angels',
    transliteration: 'Al-Iman bil-Mala’ikah',
    arabic: 'الإِيمَانُ بِالمَلَائِكَةِ',
    arabicShort: 'المَلَائِكَة',
    keyArabicTerm: 'النُّور · Created from Light',
    keyArabicMeaning: 'Honored unseen servants who tirelessly praise and execute Allah’s command.',
    symbolRole: 'Left Upper Root · Unseen Messengers of Light',
    feedsPillarId: 'islam_salah',
    feedsPillarLabel: 'Witnesses every Salah, gathering of Dhikr & quiet charity',
    coords: { x: 82, y: 358 },
    branchPath: 'M 210 280 C 202 328, 134 320, 82 358',
    summary:
      'Believing in the honored beings created from light who never disobey Allah and carry out His commands across creation.',
    essence:
      'Knowing that unseen angels surround us—recording our deeds, carrying revelation, and praying for those who seek knowledge—transforms solitude into sacred companionship.',
    pillarsOfUnderstanding: [
      'Jibril (Gabriel) — Entrusted with bringing Divine Revelation to the Prophets.',
      'Mika’il & Israfil — Entrusted with provisions of rain and the Trumpet of the Last Day.',
      'Kiraman Katibin & Hafazah — Noble guardians and scribes who record every word and intention.',
    ],
    evidence: {
      arabic: 'لَّا يَعْصُونَ اللَّهَ مَا أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ',
      translation: 'They do not disobey Allah in what He commands them, and they do what they are commanded.',
      source: 'Surah At-Tahrim · 66:6',
    },
    reflectionQuestion:
      'How does knowing noble angels witness your quiet moments change how you walk through the day?',
    reflectionCheck: {
      prompt: 'Why did Allah create angels with the task of recording human deeds despite knowing everything already?',
      choices: [
        'Because Allah needs reminders on the Last Day',
        'To honor accountability and bear clear witness to human choices',
        'So angels can choose what rewards to grant',
      ],
      correctIndex: 1,
      insight:
        'Allah’s knowledge is infinite; the angelic record establishes complete justice and dignifies every hidden act of sincerity.',
    },
  },
  {
    id: 'iman_books',
    order: 3,
    kind: 'faith',
    shortLabel: 'Books',
    title: 'Belief in the Revealed Books',
    transliteration: 'Al-Iman bil-Kutub',
    arabic: 'الإِيمَانُ بِالكُتُبِ',
    arabicShort: 'الكُتُب',
    keyArabicTerm: 'الوَحْي · Al-Wahy',
    keyArabicMeaning: 'Divine guidance sent down as mercy, healing, and criterion (Al-Furqan).',
    symbolRole: 'Right Upper Root · Streams of Divine Guidance',
    feedsPillarId: 'islam_sawm',
    feedsPillarLabel: 'Anchors Ramadan—the sacred month in which the Quran descended',
    coords: { x: 338, y: 358 },
    branchPath: 'M 210 280 C 218 328, 286 320, 338 358',
    summary:
      'Believing that Allah sent sacred scriptures to guide humanity out of darkness into light, culminating in the preserved Quran.',
    essence:
      'Like underground springs that nourish a tree’s roots, Divine Revelation nourishes the human intellect and soul with truth it could never discover on its own.',
    pillarsOfUnderstanding: [
      'Previous Scriptures — Affirming the original Suhuf of Ibrahim, Tawrah of Musa, Zabur of Dawud, and Injil of ‘Isa.',
      'The Noble Quran — The final, verbatim word of Allah revealed to Prophet Muhammad ﷺ, preserved letter for letter.',
      'Living the Book — Approaching the Quran not merely as text, but as a living conversation and healing (Shifa) for the heart.',
    ],
    evidence: {
      arabic: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ',
      translation: 'Indeed, it is We who sent down the Reminder, and indeed, We will be its Guardian.',
      source: 'Surah Al-Hijr · 15:9',
    },
    reflectionQuestion:
      'When you read a verse, do you pause to hear it as a message addressed directly to your soul?',
    reflectionCheck: {
      prompt: 'How do Muslims view the original scriptures revealed before the Quran (Tawrah, Zabur, Injil)?',
      choices: [
        'We affirm their divine origin while following the final preserved Quran',
        'We reject that earlier prophets received books',
        'We consider all books identical in legal rulings',
      ],
      correctIndex: 0,
      insight:
        'Faith requires honoring all authentic divine revelation sent throughout history while adhering to the final, preserved criterion of the Quran.',
    },
  },
  {
    id: 'iman_messengers',
    order: 4,
    kind: 'faith',
    shortLabel: 'Messengers',
    title: 'Belief in the Messengers',
    transliteration: 'Al-Iman bir-Rusul',
    arabic: 'الإِيمَانُ بِالرُّسُلِ',
    arabicShort: 'الرُّسُل',
    keyArabicTerm: 'الأُسْوَة الحَسَنَة · Uswah Hasanah',
    keyArabicMeaning: 'Living prophetic embodiment of truth, mercy, and character.',
    symbolRole: 'Left Deep Root · Human Exemplars of Light',
    feedsPillarId: 'islam_hajj',
    feedsPillarLabel: 'Walks in the literal footsteps of Ibrahim, Hajar & Muhammad ﷺ',
    coords: { x: 108, y: 446 },
    branchPath: 'M 210 314 C 198 384, 146 392, 108 446',
    summary:
      'Honoring all Prophets and Messengers sent by Allah—from Adam to Noah, Abraham, Moses, Jesus, and the final Messenger Muhammad ﷺ.',
    essence:
      'Allah did not leave humanity with abstract rules alone; He sent the purest human beings to embody mercy, patience, justice, and devotion in real life.',
    pillarsOfUnderstanding: [
      '‘Ismat al-Anbiya (Prophetic Protection) — Every Prophet was divinely guarded from sin in conveying truth and honored with luminous character.',
      'Ulul-‘Azm (Messengers of Firm Resolve) — Nuh, Ibrahim, Musa, ‘Isa, and Muhammad (peace and blessings upon them all).',
      'Mahabbah & Salawat — Loving the Seal of the Prophets ﷺ more than wealth or self, and sending abundant blessings upon him.',
    ],
    evidence: {
      arabic: 'لَّقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ',
      translation: 'There has certainly been for you in the Messenger of Allah an excellent pattern.',
      source: 'Surah Al-Ahzab · 33:21',
    },
    reflectionQuestion:
      'Which prophetic quality—patience, gentleness, or courage—do you most wish to embody today?',
    reflectionCheck: {
      prompt: 'Who are the five Messengers known as Ulul-‘Azm (Those of Firm Resolve)?',
      choices: [
        'Adam, Idris, Hud, Salih, and Shu‘ayb',
        'Nuh, Ibrahim, Musa, ‘Isa, and Muhammad ﷺ',
        'Yusuf, Dawud, Sulayman, Yunus, and Zakariyya',
      ],
      correctIndex: 1,
      insight:
        'Surah Al-Ahzab (33:7) and Ash-Shura (42:13) unite Nuh, Ibrahim, Musa, ‘Isa, and Muhammad ﷺ as the five great exemplars of unwavering resolve.',
    },
  },
  {
    id: 'iman_last_day',
    order: 5,
    kind: 'faith',
    shortLabel: 'Last Day',
    title: 'Belief in the Last Day',
    transliteration: 'Al-Iman bil-Yawm al-Akhir',
    arabic: 'الإِيمَانُ بِاليَوْمِ الآخِرِ',
    arabicShort: 'اليَوْم الآخِر',
    keyArabicTerm: 'المِيزَان · Al-Mizan',
    keyArabicMeaning: 'The Scale of ultimate justice where even an atom of sincere good counts.',
    symbolRole: 'Right Deep Root · Eternal Horizon & Justice',
    feedsPillarId: 'islam_zakah',
    feedsPillarLabel: 'Inspires Zakah & hidden charity stored safely for eternity',
    coords: { x: 312, y: 446 },
    branchPath: 'M 210 314 C 222 384, 274 392, 312 446',
    summary:
      'Believing in the Resurrection, the Reckoning, and eternal life in the Hereafter where every atom of good is rewarded.',
    essence:
      'Belief in the Last Day frees the heart from despair. No unseen sacrifice is forgotten, no injustice goes unaddressed, and this brief world becomes a seedbed for eternity.',
    pillarsOfUnderstanding: [
      'Al-Ba‘th & Al-Hisab — Resurrection and standing before the Most Just, the Most Merciful.',
      'Al-Mizan — The weighing of deeds, where even a smile or a whispered dhikr carries weight.',
      'Jannah & Eternal Return — Striving for the pleasure of Allah and the everlasting peace of His Garden.',
    ],
    evidence: {
      arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
      translation: 'So whoever does an atom’s weight of good will see it.',
      source: 'Surah Az-Zalzalah · 99:7',
    },
    reflectionQuestion:
      'What small, hidden good deed can you plant today knowing it will bloom in eternity?',
    reflectionCheck: {
      prompt: 'How does certainty in the Last Day transform how a believer experiences worldly injustice or unseen effort?',
      choices: [
        'It makes daily effort meaningless',
        'It anchors hope and integrity because every atom of good is preserved with Al-‘Adl (The Just)',
        'It only concerns major scholars and leaders',
      ],
      correctIndex: 1,
      insight:
        'Surah Az-Zalzalah assures the heart that nothing sincere is ever lost—transforming quiet patience and hidden kindness into eternal treasure.',
    },
  },
  {
    id: 'iman_qadar',
    order: 6,
    kind: 'faith',
    shortLabel: 'Qadar',
    title: 'Belief in Divine Decree',
    transliteration: 'Al-Iman bil-Qadar',
    arabic: 'الإِيمَانُ بِالقَدَرِ',
    arabicShort: 'القَدَر',
    keyArabicTerm: 'التَّوَكُّل · Tawakkul',
    keyArabicMeaning: 'Acting with excellence while resting the outcome in Allah’s infinite wisdom.',
    symbolRole: 'Deepest Anchor Root · Serenity in Allah’s Wisdom',
    feedsPillarId: 'islam_shahadah',
    feedsPillarLabel: 'Steadies every Pillar through Sabr in trials and Shukr in ease',
    coords: { x: 210, y: 468 },
    branchPath: 'M 210 332 C 210 378, 210 424, 210 468',
    summary:
      'Trusting that everything unfolds by Allah’s infinite knowledge, wisdom, and decree—while striving with our free choice.',
    essence:
      'Qadar is the deepest anchor of the tree. When storms of hardship blow, the believer does not break—knowing that what missed them was never meant to hit them, and what hit them was never meant to miss.',
    pillarsOfUnderstanding: [
      'Pre-eternal Knowledge & Wisdom — Allah’s all-encompassing knowledge precedes all events and records everything with wisdom.',
      'Moral Choice & Responsibility (Kasb) — Allah creates all things while human beings genuinely choose, strive, and bear responsibility.',
      'Tawakkul & Rida — Meeting blessings with gratitude, striving with excellence, and trusting the All-Merciful in every outcome.',
    ],
    evidence: {
      arabic: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ',
      translation: 'Indeed, all things We created with predestined measure.',
      source: 'Surah Al-Qamar · 54:49',
    },
    reflectionQuestion:
      'Where in your life can you release anxiety today and trust the wisdom of the All-Wise?',
    reflectionCheck: {
      prompt: 'What is the balanced Prophetic response to Al-Qadar (Divine Decree)?',
      choices: [
        'Avoid taking practical means and sit idle',
        'Take wise action, then surrender the result to Allah with Tawakkul and Sabr',
        'Worry endlessly over what already passed',
      ],
      correctIndex: 1,
      insight:
        'As the Prophet ﷺ taught: "Tie your camel first, then place your trust in Allah." Qadar empowers courage without arrogance or despair.',
    },
  },
];

/**
 * THE 5 PILLARS OF ISLAM (ARKAN AL-ISLAM) — THE LIVING BRANCHES & CANOPY
 * Each pillar includes rich Fiqh sub-branches with actionable rulings for progressive study.
 */
export const ISLAM_PILLARS = [
  {
    id: 'islam_shahadah',
    order: 1,
    kind: 'islam',
    shortLabel: 'Shahadah',
    title: 'The Testimony of Faith',
    transliteration: 'Ash-Shahadatan',
    arabic: 'الشَّهَادَتَان',
    arabicShort: 'الشَّهَادَة',
    keyArabicTerm: 'الإِيمَانُ وَالإِحْسَان · Iman & Ihsan',
    keyArabicMeaning: 'True conviction in the heart crowned by worshipping Allah as though you see Him.',
    symbolRole: 'Heart of the Canopy · The Living Trunk',
    coords: { x: 210, y: 148 },
    branchPath: 'M 210 268 C 210 230, 210 190, 210 148',
    summary:
      'Bearing witness with tongue and heart that there is none worthy of worship save Allah, and that Muhammad ﷺ is His beloved Messenger.',
    essence:
      'The Shahadah is the living bridge where unseen Iman rises into outward Islam and blossoms into Ihsan—anchoring humility, love for the Prophet ﷺ, and devotion to the Most Merciful.',
    pillarsOfUnderstanding: [
      'La ilaha illa Allah — Turning the heart completely toward the One True Lord as our Refuge, Purpose, and Beloved.',
      'Muhammadun Rasul Allah ﷺ — Honoring the Beloved Messenger as mercy to the worlds and our living example in prayer and character.',
      'Ihsan (Spiritual Excellence) — Worshipping Allah as though you see Him, for though you see Him not, He surely sees you.',
    ],
    evidence: {
      arabic: 'فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ',
      translation: 'So know that there is no deity worthy of worship except Allah.',
      source: 'Surah Muhammad · 47:19',
    },
    reflectionCheck: {
      prompt: 'In the foundational Hadith of Jibril, how did the Prophet ﷺ define Ihsan crowning Islam and Iman?',
      choices: [
        'Memorizing legal rulings without inward presence',
        'Worshipping Allah as though you see Him, knowing that even if you do not see Him, He truly sees you',
        'Debating fellow believers over secondary differences',
      ],
      correctIndex: 1,
      insight:
        'Imam an-Nawawi called the Hadith of Jibril the foundation of the religion: outward Islam stands on Iman and comes alive through Ihsan.',
    },
    fiqhBranches: [
      {
        id: 'fiqh_shahadah_meaning',
        title: 'Iman, Sincerity & Unity of the Ummah',
        arabicTitle: 'الإِخْلَاصُ وَالإِيمَان',
        summary: 'Heart-centered conviction (Tasdiq), sincerity (Ikhlas), and classical forbearance toward all believers.',
        rulings: [
          'True Shahadah joins inward affirmation of the heart (Tasdiq) with respectful testimony of the tongue.',
          'Guarding devotion from ostentation (Riya’) purifies deeds so they are offered solely for Allah’s countenance.',
          'Classical Sunni creed teaches profound restraint: we never expel any believer among Ahl al-Qiblah from Islam over sins or valid Madhhab differences.',
        ],
        scholarlyNote:
          'Imam al-Tahawi wrote in his classic creed: "We do not declare any of the people of our Qiblah disbelievers because of a sin, so long as they do not deem it lawful."',
      },
      {
        id: 'fiqh_shahadah_sunnah',
        title: 'Love of the Prophet ﷺ & Sacred Sunnah',
        arabicTitle: 'مَحَبَّةُ الرَّسُولِ وَالسُّنَّة',
        summary: 'Living the prophetic way through beauty, Salawat, and balanced consensus across the four Sunni schools.',
        rulings: [
          'Reverent love for the Prophet ﷺ and abundant Salawat upon him nourish every prayer and remembrance.',
          'Authentic prophetic guidance is preserved and practiced through the living consensus and scholarship of the four classical Madhabs (Hanafi, Maliki, Shafi‘i, Hanbali).',
          'Devotion blends outward reverence for sacred law (Shari‘ah) with inward humility, compassion, and good character (Tasawwuf & Ihsan).',
        ],
        scholarlyNote:
          'Imam al-Ghazali taught that knowledge of worship is only fulfilled when light enters the heart and manifests as mercy toward creation.',
      },
    ],
  },
  {
    id: 'islam_salah',
    order: 2,
    kind: 'islam',
    shortLabel: 'Salah',
    title: 'The Five Daily Prayers',
    transliteration: 'Iqam as-Salah',
    arabic: 'إِقَامُ الصَّلَاة',
    arabicShort: 'الصَّلَاة',
    keyArabicTerm: 'الخُشُوع · Khushu‘',
    keyArabicMeaning: 'Humble, attentive stillness of heart and limb before Allah.',
    symbolRole: 'First Ascending Bough · Daily Sacred Connection',
    coords: { x: 80, y: 184 },
    branchPath: 'M 210 248 C 202 200, 142 212, 80 184',
    summary:
      'Establishing the five daily prayers from dawn to nightfall as a direct, living audience between the servant and their Lord.',
    essence:
      'Salah comes from "Silah" (connection). Five times a day, it washes the heart of distraction and re-aligns body, breath, and soul toward the Sacred House.',
    pillarsOfUnderstanding: [
      'Five Sacred Windows — Fajr (Dawn), Dhuhr (Midday), Asr (Afternoon), Maghrib (Sunset), and Isha (Night).',
      'Inward & Outward — Combining outward precision of postures with inward presence (Khushu‘).',
      'The Pillar of the Religion — The first act of worship a believer is asked about on the Day of Return.',
    ],
    evidence: {
      arabic: 'وَأَقِمِ الصَّلَاةَ لِذِكْرِي',
      translation: 'And establish prayer for My remembrance.',
      source: 'Surah Ta-Ha · 20:14',
    },
    reflectionCheck: {
      prompt: 'If someone forgets and stands up in prayer without having performed Wudu, what is the Fiqh status of that prayer?',
      choices: [
        'Valid if they had good intention',
        'Invalid, because ritual purity (Taharah) is a foundational Condition (Shart) before prayer',
        'Requires one extra Rakah at the end',
      ],
      correctIndex: 1,
      insight:
        'A Condition (Shart) must be fulfilled before entering Salah. The Prophet ﷺ taught: "Allah does not accept prayer without purification."',
    },
    fiqhBranches: [
      {
        id: 'fiqh_salah_taharah',
        title: 'Fiqh of Taharah & Wudu',
        arabicTitle: 'فِقْهُ الطَّهَارَةِ وَالوُضُوء',
        summary: 'Obligatory steps (Fard), Sunnahs, nullifiers of Wudu, Ghusl, and Tayammum.',
        rulings: [
          'Four Quranic Fard acts of Wudu (5:6): washing the face, washing arms to the elbows, wiping the head, and washing feet to the ankles.',
          'Order (Tartib) and continuity without long drying gaps protect the completeness of Wudu.',
          'Major impurity requires Ghusl (full wash); when water is absent or harmful, Tayammum with clean earth replaces both.',
        ],
        scholarlyNote:
          'Wudu washes away not only dust from the limbs, but tension from the day—preparing the servant to stand in serenity.',
      },
      {
        id: 'fiqh_salah_shurut',
        title: 'Conditions (Shurut) of Prayer',
        arabicTitle: 'شُرُوطُ الصَّلَاة',
        summary: 'Preconditions required before saying Takbirat al-Ihram.',
        rulings: [
          'Entry of the prescribed prayer time (Fajr through Isha).',
          'Purity of body, garments, and the place of prayer from major/minor impurity and Najasa.',
          'Properly covering the ‘Awrah and facing the Qibla toward Makkah.',
          'Resolving sincere Niyyah (intention) in the heart for the specific prayer.',
        ],
        scholarlyNote:
          'Unlike Arkan (which happen inside the prayer), Shurut precede and remain unbroken throughout every moment of Salah.',
      },
      {
        id: 'fiqh_salah_arkan',
        title: 'Pillars (Arkan) & Tranquility',
        arabicTitle: 'أَرْكَانُ الصَّلَاة',
        summary: 'Core integral acts inside prayer without which Salah is incomplete.',
        rulings: [
          'Standing (Qiyam) when able, opening Takbir (Takbirat al-Ihram), and reciting Surah Al-Fatihah.',
          'Ruku‘ (bowing), rising straight (I‘tidal), two Sujoods (prostrations) per Rakah, and sitting between them.',
          'Tuma’ninah — pausing calmly with settled limbs in every posture rather than rushing.',
          'Final Tashahhud sitting and concluding with Taslim.',
        ],
        scholarlyNote:
          'Missing a Rukn cannot be patched by Sujood as-Sahw alone—the missed pillar itself must be performed.',
      },
      {
        id: 'fiqh_salah_sahw',
        title: 'Sujood as-Sahw & Qada',
        arabicTitle: 'سُجُودُ السَّهْوِ وَالقَضَاء',
        summary: 'Mending forgetfulness in prayer and making up missed prayers faithfully.',
        rulings: [
          'Sujood as-Sahw consists of two extra prostrations at the end of prayer for inadvertent additions, omissions of Wajibat, or uncertainty in Rakah count.',
          'When unsure of Rakah count (e.g., 3 or 4), build upon certainty (the lower number: 3), complete the rest, then perform Sujood as-Sahw.',
          'Missed prayers (Fawa’it) are made up promptly in sequence as Qada as soon as remembered or able.',
        ],
        scholarlyNote:
          'Mercy runs through all Fiqh: human forgetfulness is anticipated and gently repaired without guilt.',
      },
    ],
  },
  {
    id: 'islam_zakah',
    order: 3,
    kind: 'islam',
    shortLabel: 'Zakah',
    title: 'Purifying Alms',
    transliteration: 'Ita’ az-Zakah',
    arabic: 'إِيتَاءُ الزَّكَاة',
    arabicShort: 'الزَّكَاة',
    keyArabicTerm: 'النِّصَاب · Nisab',
    keyArabicMeaning: 'Minimum threshold of surplus wealth held for one full lunar year (Hawl).',
    symbolRole: 'Left Upper Bough · Purification & Growth',
    coords: { x: 118, y: 78 },
    branchPath: 'M 210 216 C 200 142, 148 134, 118 78',
    summary:
      'Giving a sacred portion (typically 2.5%) of qualifying surplus wealth held for a lunar year to purify the soul and uplift those in need.',
    essence:
      'Linguistically, Zakah means both "purification" and "growth." Just as pruning a tree makes its branches bear sweeter fruit, giving Zakah cleanses the heart of greed and blesses remaining wealth.',
    pillarsOfUnderstanding: [
      'A Right, Not a Favor — Zakah is the divinely ordained right of the poor and vulnerable in the wealth of the able.',
      'Nisab & Hawl — Applies only when savings reach the minimum threshold (Nisab) and remain for one lunar year (Hawl).',
      'Eight Eligible Categories — Defined directly by Allah in Surah At-Tawbah (9:60).',
    ],
    evidence: {
      arabic: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا',
      translation: 'Take from their wealth a charity by which you purify them and cause them to grow.',
      source: 'Surah At-Tawbah · 9:103',
    },
    reflectionCheck: {
      prompt: 'When is Zakah owed on personal cash savings and gold?',
      choices: [
        'Immediately on every paycheck regardless of savings or debt',
        'When net qualifying wealth meets or exceeds Nisab for a full lunar year (Hawl)',
        'Only during the month of Hajj',
      ],
      correctIndex: 1,
      insight:
        'Zakah protects those who are barely getting by—it only rests on surplus wealth above basic needs that meets Nisab over a complete lunar year.',
    },
    fiqhBranches: [
      {
        id: 'fiqh_zakah_nisab',
        title: 'Fiqh of Nisab & Hawl Calculation',
        arabicTitle: 'النِّصَابُ وَالحَوْل',
        summary: 'Gold/silver thresholds, cash, investments, business inventory, and net debts.',
        rulings: [
          'Nisab equals the value of 85g of gold (or 595g of silver, which lowers the threshold to benefit the poor).',
          'Once net zakatable assets remain at or above Nisab for 1 Hijri year (354 days), 2.5% (1/40th) becomes due.',
          'Immediate short-term debts and primary living essentials (home, daily transport, tools) are exempt.',
        ],
        scholarlyNote:
          'Computing Zakah on a fixed lunar date (like 1st Ramadan or Muharram) keeps calculation clean and punctual.',
      },
      {
        id: 'fiqh_zakah_recipients',
        title: 'The Eight Recipients (Asnaf) & Fitr',
        arabicTitle: 'مَصَارِفُ الزَّكَاة',
        summary: 'Valid Quranic distribution channels and the Ramadan food-charity obligation.',
        rulings: [
          'Surah At-Tawbah (9:60) specifies 8 categories: Al-Fuqara’ (the poor), Al-Masakin (the needy), collectors, new/reconciling hearts, freeing captives, burdened debtors, striving in Allah’s path, and stranded travelers.',
          'Zakah is transferred as full ownership (Tamlik) directly to eligible recipients rather than used for general mosque construction.',
          'Zakat al-Fitr is obligatory on every able Muslim before the Eid al-Fitr prayer so no household goes hungry on Eid.',
        ],
        scholarlyNote:
          'Giving Zakah locally first heals visible hardship in one’s own neighborhood while building resilient community solidarity.',
      },
    ],
  },
  {
    id: 'islam_sawm',
    order: 4,
    kind: 'islam',
    shortLabel: 'Sawm',
    title: 'Fasting in Ramadan',
    transliteration: 'Sawm Ramadan',
    arabic: 'صَوْمُ رَمَضَان',
    arabicShort: 'الصَّوْم',
    keyArabicTerm: 'التَّقْوَى · Taqwa',
    keyArabicMeaning: 'Awakened consciousness of Allah that guards appetite, speech, and heart.',
    symbolRole: 'Right Upper Bough · Shield of Taqwa',
    coords: { x: 302, y: 78 },
    branchPath: 'M 210 216 C 220 142, 272 134, 302 78',
    summary:
      'Abstaining from food, drink, and marital intimacy from true dawn (Fajr) until sunset (Maghrib) throughout the month of Ramadan with sincere intention.',
    essence:
      'Fasting is a secret between the servant and Allah. By voluntarily pausing lawful desires for His sake, the soul discovers mastery over impulse and deep empathy for the hungry.',
    pillarsOfUnderstanding: [
      'Cultivating Taqwa — The ultimate purpose of fasting is God-consciousness and guarding the tongue and heart.',
      'Dawn to Sunset — Begins with Suhoor before Fajr and concludes promptly at Maghrib with Iftar.',
      'The Month of the Quran — Ramadan is the sacred season in which the Quran was revealed.',
    ],
    evidence: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
      translation: 'O you who believe, fasting has been prescribed for you as it was prescribed for those before you, that you may attain Taqwa.',
      source: 'Surah Al-Baqarah · 2:183',
    },
    reflectionCheck: {
      prompt: 'If a fasting person accidentally eats or drinks out of genuine forgetfulness, what is their fast’s ruling?',
      choices: [
        'They must break the day and make it up later',
        'Their fast remains completely valid—they simply stop once they remember and continue',
        'They owe a 60-day expiation',
      ],
      correctIndex: 1,
      insight:
        'The Prophet ﷺ warmly reassured us: "Let them complete their fast, for it was Allah who fed them and gave them drink."',
    },
    fiqhBranches: [
      {
        id: 'fiqh_sawm_niyyah',
        title: 'Fiqh of Niyyah, Suhoor & Iftar',
        arabicTitle: 'النِّيَّةُ وَالسَّحُور',
        summary: 'Nightly intention for obligatory fasts and Prophetic etiquette of breaking the fast.',
        rulings: [
          'For obligatory Ramadan fasts, intention (Niyyah) is formed in the heart before true dawn (Fajr); rising for Suhoor itself manifests Niyyah.',
          'Delaying Suhoor slightly before Fajr and hastening Iftar right at Maghrib sunset carry blessed Prophetic Sunnah.',
          'Sunnah Iftar opens with fresh/dry dates and water accompanied by heartfelt Dua.',
        ],
        scholarlyNote:
          'Every breath of Suhoor is described in Hadith as a meal filled with Barakah—even a single sip of water.',
      },
      {
        id: 'fiqh_sawm_nullifiers',
        title: 'Nullifiers & Exemptions (Rukhsah)',
        arabicTitle: 'المُفْطِرَاتُ وَالرُّخَص',
        summary: 'What breaks or does not break the fast, plus rulings for illness, travel, Qada, and Fidyah.',
        rulings: [
          'Intentional eating, drinking, or marital intimacy between Fajr and Maghrib nullifies the fast.',
          'Accidental eating/drinking out of pure forgetfulness, swallowing saliva, or rinsing the mouth carefully without swallowing does NOT break the fast.',
          'Travelers, the sick, pregnant/nursing women fearing harm, and menstruating/postnatal women have merciful concessions to break fast and make up days (Qada); the chronically unable give Fidyah.',
        ],
        scholarlyNote:
          '"Allah desires ease for you and does not desire hardship for you." (Surah Al-Baqarah 2:185)',
      },
    ],
  },
  {
    id: 'islam_hajj',
    order: 5,
    kind: 'islam',
    shortLabel: 'Hajj',
    title: 'Pilgrimage to the House',
    transliteration: 'Hajj al-Bayt',
    arabic: 'حَجُّ البَيْت',
    arabicShort: 'الحَجّ',
    keyArabicTerm: 'لَبَّيْك · Labbaik',
    keyArabicMeaning: '"Here I am at Your service, O Allah"—answering the eternal call.',
    symbolRole: 'Right Ascending Bough · The Universal Gathering',
    coords: { x: 340, y: 184 },
    branchPath: 'M 210 248 C 218 200, 278 212, 340 184',
    summary:
      'Journeying to Makkah during the sacred months to perform the rites of pilgrimage once in a lifetime for whoever is physically and financially able.',
    essence:
      'In the two simple white garments of Ihram, kings and paupers stand shoulder to shoulder around the Kaaba—rehearsing the Day of Return and answering the ancient call of Prophet Ibrahim.',
    pillarsOfUnderstanding: [
      'Once in a Lifetime — Obligatory only upon those with health, safety of passage, and surplus provision (Istita‘ah).',
      'Footsteps of Ibrahim, Hajar & Muhammad ﷺ — Tawaf around the Kaaba, Sa‘i between Safa and Marwah, and standing at ‘Arafah.',
      'Rebirth of the Soul — An accepted Hajj (Hajj Mabrur) returns a person as pure of sin as the day their mother bore them.',
    ],
    evidence: {
      arabic: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا',
      translation: 'And due to Allah from the people is a pilgrimage to the House—for whoever is able to find thereto a way.',
      source: 'Surah Ali ‘Imran · 3:97',
    },
    reflectionCheck: {
      prompt: 'Which moment did the Prophet ﷺ declare to be the very essence ("Hajj is...") of the pilgrimage?',
      choices: [
        'Purchasing souvenirs in Makkah',
        'Standing in humble supplication on the plain of ‘Arafah (Wuquf)',
        'Visiting historical museums',
      ],
      correctIndex: 1,
      insight:
        '"Al-Hajju ‘Arafah"—missing standing at ‘Arafah on 9th Dhul-Hijjah invalidates Hajj, reminding us its heart is standing stripped of status before the Most Merciful.',
    },
    fiqhBranches: [
      {
        id: 'fiqh_hajj_ihram',
        title: 'Fiqh of Miqat & Ihram',
        arabicTitle: 'المِيقَاتُ وَالإِحْرَام',
        summary: 'Entering the sacred state, reciting Talbiyah, and prohibitions of Ihram.',
        rulings: [
          'Do not cross the designated Miqat boundary with the intention of pilgrimage without entering Ihram.',
          'Men wear two unstitched white cloths (Izar and Rida’); women wear modest ordinary stitched garments leaving face and hands uncovered.',
          'While in Ihram, refrain from cutting hair/nails, perfume, hunting, marriage contracts, and marital intimacy.',
        ],
        scholarlyNote:
          'Every outward barrier of wealth or status dissolves in Ihram—reminding humanity of its unity before Allah.',
      },
      {
        id: 'fiqh_hajj_arkan',
        title: 'The Four Pillars of Hajj & ‘Umrah',
        arabicTitle: 'أَرْكَانُ الحَجّ',
        summary: 'Ihram, Wuquf at ‘Arafah, Tawaf al-Ifadah, and Sa‘i between Safa and Marwah.',
        rulings: [
          '1. Ihram (entering the sacred state by intention), 2. Wuquf at ‘Arafah on 9th Dhul-Hijjah.',
          '3. Tawaf al-Ifadah (7 counter-clockwise circuits around the Kaaba starting at the Black Stone).',
          '4. Sa‘i (7 brisk walks between Safa and Marwah honoring Hajar’s trust in Allah).',
        ],
        scholarlyNote:
          'These four are Arkan (non-negotiable pillars of Hajj), distinct from Wajibat (such as Muzdalifah overnight stay and Jamarat stoning).',
      },
    ],
  },
];

export const ALL_SACRED_TREE_NODES = [...FAITH_ROOTS, ...ISLAM_PILLARS];

export const ALL_FIQH_BRANCHES = ISLAM_PILLARS.flatMap((pillar) =>
  (pillar.fiqhBranches || []).map((fb) => ({ ...fb, parentPillarId: pillar.id }))
);
