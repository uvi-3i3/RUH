/**
 * Comprehensive Offline Scholarly Q&A Compendium for Miracles of the Qur'an (I'jaz al-Qur'an).
 * Covers all 22 curated signs across Cosmology, Science, Biology, History, Numerology,
 * and Linguistic Precision with 6 anticipated questions & answers per sign (132 Q&As total),
 * written in both Classical and Simple voices with semantic keywords and follow-up links.
 */

export const miraclesQaData = {
  'm-expanding-universe': [
    {
      id: 'm-exp-q1',
      category: 'objection',
      question: 'Isn’t translating "la-musi‘un" as "continuously expanding" just modern retrofitting after Hubble?',
      simpleQuestion: 'Are Muslims just stretching the Arabic word after Hubble’s discovery?',
      answer:
        'Not at all. The Arabic word "musi‘un" is the active participle (ism fa‘il) of the Form IV verb "awsa‘a"—meaning to widen, make spacious, or expand. In classical Arabic grammar, pairing an emphatic nominal sentence ("wa inna la-musi‘un") with an active participle denotes ongoing, continuous action. Centuries before Hubble, classical lexicographers and commentators like Ibn Kathir already noted "expanding the heavens" alongside Divine vastness.',
      simpleAnswer:
        'No—the Arabic word "musi‘un" literally comes from the root for widening or expanding, and its grammar form specifically describes an ongoing action ("We are expanding it"). Early Arabic dictionaries and commentators centuries before Hubble already noted the meaning of widening the heavens.',
      keywords: ['retrofit', 'stretch', 'reinterpretation', 'arabic', 'musiun', 'grammar', 'translate', 'hubble'],
      followUpIds: ['m-exp-q2', 'm-exp-q3'],
    },
    {
      id: 'm-exp-q2',
      category: 'objection',
      question: 'Didn’t the Bible also say God "stretched out the heavens" long before the Qur’an?',
      simpleQuestion: 'Doesn’t the Bible already say God stretched out the sky?',
      answer:
        'Biblical poetic verses (like Isaiah 40:22) use past-tense tent metaphors ("He stretched them out like a canopy/tent to dwell in") describing creation as a completed past act. Surah 51:47 makes a subtle, striking grammatical shift inside the same verse: past tense for building ("banaynaha" — We constructed it), immediately switched to a continuous active participle ("wa inna la-musi‘un" — and We are steadily expanding it).',
      simpleAnswer:
        'Earlier scriptures use past-tense tent imagery ("He stretched out the sky like a tent"). This verse uniquely switches tenses right in the middle: past tense ("We built the sky") to an active ongoing form ("and We are continuously expanding it").',
      keywords: ['bible', 'isaiah', 'stretched', 'tent', 'canopy', 'earlier', 'borrowed', 'past tense'],
      followUpIds: ['m-exp-q3', 'm-exp-q4'],
    },
    {
      id: 'm-exp-q3',
      category: 'evidence',
      question: 'How did Edwin Hubble and later astronomers actually prove space is expanding?',
      simpleQuestion: 'How do scientists know for sure that the universe is expanding?',
      answer:
        'In 1929, Edwin Hubble measured light from distant galaxies at Mount Wilson Observatory and noticed their light waves were systematically stretched toward the red end of the spectrum (cosmological redshift)—and the farther the galaxy, the faster it recedes. Later discoveries—the Cosmic Microwave Background (1964) and Type Ia supernova measurements (1998)—confirmed space itself has been expanding for 13.8 billion years and is even accelerating.',
      simpleAnswer:
        'In 1929, Edwin Hubble noticed light from distant galaxies is stretched toward red—showing space itself is stretching out in every direction. Later space telescopes confirmed this expansion has been happening since the beginning and is still speeding up.',
      keywords: ['hubble', 'redshift', 'prove', 'science', 'supernova', 'evidence', 'accelerating', 'galaxies'],
      followUpIds: ['m-exp-q4', 'm-exp-q5'],
    },
    {
      id: 'm-exp-q4',
      category: 'deep',
      question: 'How did early classical scholars understand 51:47 before modern telescopes existed?',
      simpleQuestion: 'What did early Muslim scholars think this verse meant 1,000 years ago?',
      answer:
        'Classical commentators like Al-Tabari, Al-Qurtubi, and Ibn Kathir recognized two harmonious meanings of the Arabic root w-s-‘: (1) Allah’s boundless power and vast provision, and (2) literally expanding the boundaries of the heavens without pillars. Modern astronomy did not overturn classical tafsir—it illuminated how literally astonishing the physical dimension is.',
      simpleAnswer:
        'Early scholars saw both meanings: God’s boundless power and His literal widening of the heavens. Modern astronomy simply showed how breathtakingly accurate that physical meaning is.',
      keywords: ['classical', 'tafsir', 'ibn kathir', 'tabari', 'early scholars', 'before science'],
      followUpIds: ['m-exp-q1', 'm-exp-q5'],
    },
    {
      id: 'm-exp-q5',
      category: 'objection',
      question: 'What if cosmology changes its model in the future—would that hurt the Qur’an?',
      simpleQuestion: 'What if scientists later change their theory about cosmic expansion?',
      answer:
        'First, cosmic expansion is among the most heavily corroborated observational facts in physics (confirmed independently via galaxy redshifts, CMB radiation, and gravitational lensing). Second, the Qur’an is a book of timeless signs (Ayat), not a fragile physics textbook—its core Arabic phrasing stays true both spiritually (Allah’s boundless capacity) and observationally.',
      simpleAnswer:
        'Cosmic expansion is backed by multiple independent lines of hard observation, not a passing guess. And even more importantly, the Qur’an’s words remain deeply true spiritually and linguistically regardless of how human science refines its equations.',
      keywords: ['change', 'future', 'theory', 'falsify', 'science changes', 'risk'],
      followUpIds: ['m-exp-q3', 'm-exp-q6'],
    },
    {
      id: 'm-exp-q6',
      category: 'practice',
      question: 'What is the spiritual message of Surah Adh-Dhariyat 51:47?',
      simpleQuestion: 'What does this verse teach my heart, not just my mind?',
      answer:
        'In the surrounding verses, Allah invites humanity to witness His effortless power in the heavens and earth so we realize nothing in our lives—no grief, debt, or seemingly impossible prayer—can ever cramp the generosity of Al-Wasi‘ (The All-Encompassing).',
      simpleAnswer:
        'If Allah expands the entire universe effortlessly, no problem or worry in your life is ever too big for Him to open a way through.',
      keywords: ['spiritual', 'heart', 'worry', 'wasi', 'takeaway', 'meaning'],
      followUpIds: ['m-exp-q1', 'm-exp-q4'],
    },
  ],

  'm-iron-sent-down': [
    {
      id: 'm-iron-q1',
      category: 'objection',
      question: 'Doesn’t "anzalna" (sent down) just mean "gifted as a blessing," since the Qur’an also uses it for clothing and cattle?',
      simpleQuestion: 'Doesn’t the Qur’an also say God "sent down" clothes and cattle—so is iron really literal?',
      answer:
        'That is a very fair linguistic observation! Yes, in Arabic idiom "anzalna" can convey bestowing a blessing from Allah’s bounty (as in 7:26 for garments and 39:6 for livestock). Yet classical and modern scholars both notice a striking convergence for iron specifically: whereas clothing and cattle are made from earthly materials, astrophysical iron (Fe-26) literally could not be forged on Earth or even inside our Sun—it genuinely arrived from ancient supernovae in space.',
      simpleAnswer:
        'Good catch—in Arabic, "sent down" can mean "gifted as a blessing" (just like for clothes in 7:26). What makes iron extraordinary is that unlike clothes or cattle, iron ALSO literally came from outer space, forged inside exploding giant stars before Earth formed.',
      keywords: ['anzalna', 'clothing', 'cattle', 'garments', 'metaphor', 'idiom', 'literal', '7:26', '39:6'],
      followUpIds: ['m-iron-q2', 'm-iron-q3'],
    },
    {
      id: 'm-iron-q2',
      category: 'objection',
      question: 'Couldn’t ancient people have noticed iron meteorites falling from the sky?',
      simpleQuestion: 'Didn’t ancient Egyptians already know some iron came from meteorites?',
      answer:
        'Ancient Egyptians did value rare meteoritic iron ("metal of heaven") for royal daggers—yet virtually all everyday iron in 7th-century Arabia was mined from terrestrial iron ore hills and smelted in furnaces, and nobody imagined that ALL iron on planet Earth (including Earth’s entire planetary core and mountain ores) originated beyond the solar system. Astrophysics only proved Earth cannot synthesize iron in 1957.',
      simpleAnswer:
        'Ancient people only knew rare meteorites had metal—they had no idea that EVERY gram of iron mined deep inside Earth’s mountains, Earth’s core, and even our blood could only be created inside exploding giant stars.',
      keywords: ['meteorites', 'egyptians', 'ancient', 'already knew', 'daggers', 'mined', 'ore'],
      followUpIds: ['m-iron-q3', 'm-iron-q4'],
    },
    {
      id: 'm-iron-q3',
      category: 'evidence',
      question: 'Why can’t Earth or even our Sun manufacture iron?',
      simpleQuestion: 'Why does iron need giant exploding stars to be created?',
      answer:
        'Fusing lighter elements up to Iron-56 requires core temperatures above 2.5 billion Kelvin—hundreds of times hotter than our Sun’s core (~15 million Kelvin). Only massive stars many times heavier than the Sun reach silicon-burning temperatures before collapsing into core-collapse supernovae (or Type Ia white-dwarf explosions), scattering iron across space to seed planets like Earth.',
      simpleAnswer:
        'Our Sun is nowhere near hot enough to forge iron. Creating iron takes temperatures over 2.5 billion degrees inside massive dying stars that explode as supernovae, scattering iron across space to form planets like Earth.',
      keywords: ['sun', 'supernova', 'stars', 'temperature', 'fusion', 'b2fh', 'astrophysics', 'how'],
      followUpIds: ['m-iron-q4', 'm-iron-q5'],
    },
    {
      id: 'm-iron-q4',
      category: 'evidence',
      question: 'What are the hidden biological and planetary "benefits for humanity" (manafi‘) of iron?',
      simpleQuestion: 'How does iron protect Earth and keep our bodies alive right now?',
      answer:
        'Beyond architecture and tools, iron makes life on Earth possible in two unseen ways: (1) Earth’s churning molten iron core generates our global magnetosphere, deflecting deadly solar radiation that would strip away our atmosphere; and (2) four iron atoms sit at the center of every hemoglobin molecule in your blood, binding oxygen from your lungs and delivering it to every cell.',
      simpleAnswer:
        'Two invisible miracles: Earth’s spinning liquid iron core creates the magnetic shield that protects our air from deadly space radiation, and tiny iron atoms inside your blood carry oxygen with every single breath.',
      keywords: ['blood', 'hemoglobin', 'magnetic', 'core', 'benefits', 'manafi', 'biology'],
      followUpIds: ['m-iron-q5', 'm-iron-q6'],
    },
    {
      id: 'm-iron-q5',
      category: 'deep',
      question: 'How does 57:25 connect iron ("great strength") with scripture and justice?',
      simpleQuestion: 'Why does the verse mention iron right next to Prophets and the Scale of Justice?',
      answer:
        'Surah Al-Hadid 57:25 places Revelation ("the Book"), Justice ("the Balance"), and Iron ("great strength and benefits") in one single sentence: truth without justice grows abstract, and justice without the strength to protect the vulnerable cannot stand—while strength without revelation turns into tyranny.',
      simpleAnswer:
        'The verse pairs Scripture, Fairness, and Iron together to teach a timeless lesson: justice needs real strength to protect the weak, and strength needs God’s guidance so it never becomes cruelty.',
      keywords: ['justice', 'balance', 'strength', 'book', 'context', '57:25'],
      followUpIds: ['m-iron-q4', 'm-iron-q6'],
    },
    {
      id: 'm-iron-q6',
      category: 'practice',
      question: 'What reflection does the cosmic origin of iron leave with the reader?',
      simpleQuestion: 'What is the personal takeaway from knowing iron came from stars?',
      answer:
        'Long before humanity walked the earth, Allah orchestrated ancient stars to forge the exact element needed to shield our planet and carry oxygen in your veins. Nothing about human life is an afterthought.',
      simpleAnswer:
        'Long before you were born, God prepared the iron in Earth’s core and in your own bloodstream inside ancient stars—a quiet reminder of how deeply life was planned.',
      keywords: ['reflection', 'takeaway', 'meaning', 'personal', 'gratitude'],
      followUpIds: ['m-iron-q1', 'm-iron-q3'],
    },
  ],

  'm-king-vs-pharaoh': [
    {
      id: 'm-kvp-q1',
      category: 'objection',
      question: 'Couldn’t the difference between "King" and "Pharaoh" just be a lucky coincidence?',
      simpleQuestion: 'Could the Qur’an calling one "King" and the other "Pharaoh" just be luck?',
      answer:
        'Consider the odds: "Fir‘awn" (Pharaoh) appears 74 times across the Qur’an in Moses’s narrative—never once called "King" (Al-Malik). Meanwhile, throughout Surah Yusuf’s 111 verses, Egypt’s ruler is titled "Al-Malik" (the King) every single time and NEVER once called "Pharaoh." Had the author merely mixed titles casually or borrowed from the Bible (which calls both "Pharaoh"), that razor-clean chronological boundary would never have occurred.',
      simpleAnswer:
        'Think about it: "Pharaoh" appears 74 times in Moses’s story (never "King"), while in Joseph’s entire chapter the ruler is only ever called "King" (never "Pharaoh"). And the Bible calls BOTH of them Pharaoh—so getting that exact historical shift 100% consistent is far beyond casual luck.',
      keywords: ['coincidence', 'luck', 'chance', '74 times', 'consistent', 'accident'],
      followUpIds: ['m-kvp-q2', 'm-kvp-q3'],
    },
    {
      id: 'm-kvp-q2',
      category: 'objection',
      question: 'Couldn’t some 7th-century Arab, Jewish, or Christian scholar have known ancient Egyptian royal titles?',
      simpleQuestion: 'Could someone in 7th-century Arabia have known ancient Egyptian history?',
      answer:
        'No living person anywhere on Earth in the 7th century could read Egyptian hieroglyphs—the script went extinct by the late 4th century CE (~394 CE), over 200 years before Islam. Both Jewish and Christian scriptures (Genesis and Exodus) and classical Greek historians did not observe this title boundary; humanity could not verify it until Jean-François Champollion cracked the Rosetta Stone in 1822.',
      simpleAnswer:
        'Nobody alive anywhere in the 600s could read ancient Egyptian hieroglyphs—that knowledge died out over 200 years earlier and stayed completely lost until the Rosetta Stone was decoded in 1822. Even Jewish and Christian scriptures called both rulers Pharaoh.',
      keywords: ['hieroglyphs', '7th century', 'rosetta stone', 'champollion', 'jews', 'christians', 'knew'],
      followUpIds: ['m-kvp-q3', 'm-kvp-q4'],
    },
    {
      id: 'm-kvp-q3',
      category: 'evidence',
      question: 'What did Egyptologists actually discover about when the word "Pharaoh" began?',
      simpleQuestion: 'When did Egyptian rulers actually start being called "Pharaoh"?',
      answer:
        'Egyptologists deciphered "Per-Aa" ("Great House") and found that during the Old and Middle Kingdoms (and Hyksos period, when Joseph is dated), "Per-Aa" referred strictly to the royal palace building—never the person of the monarch, who was called "King" (nesut / heqa). Only during the New Kingdom (18th Dynasty onward, ~1550–1450 BCE, Moses’s era) did "Pharaoh" become a personal title for the ruler.',
      simpleAnswer:
        'Egyptologists discovered "Per-Aa" (Pharaoh) originally meant only the royal palace building, not the person! During Joseph’s earlier era, rulers were simply titled "King." Centuries later, in Moses’s New Kingdom era, "Pharaoh" became the king’s personal title.',
      keywords: ['per-aa', 'new kingdom', 'middle kingdom', 'hyksos', 'egyptology', 'great house', 'when'],
      followUpIds: ['m-kvp-q4', 'm-kvp-q5'],
    },
    {
      id: 'm-kvp-q4',
      category: 'objection',
      question: 'Does the Qur’an treat "Fir‘awn" as a title or a personal name?',
      simpleQuestion: 'Does the Qur’an use "Pharaoh" like a name instead of a royal title?',
      answer:
        'In classical Arabic, historical royal titles often appear without the definite article "al-" just like proper epithets—just as the Qur’an refers to the Roman emperor as "Qaysar" or Ethiopian ruler as "Al-Najashi" in Arabic literature. Even more importantly, whether used as a royal epithet or personal designation, the Qur’an restricts it exclusively to Moses’s New Kingdom era and withholds it completely from Joseph’s earlier era.',
      simpleAnswer:
        'In Arabic, famous royal titles (like Caesar / Qaysar) are often used directly without "the." Either way, the key miracle remains untouched: the Qur’an uses "Pharaoh" exclusively in Moses’s era and never once in Joseph’s earlier era.',
      keywords: ['proper name', 'title', 'al-firawn', 'arabic', 'grammar', 'epithet'],
      followUpIds: ['m-kvp-q1', 'm-kvp-q5'],
    },
    {
      id: 'm-kvp-q5',
      category: 'evidence',
      question: 'Are there other Egyptological details the Qur’an gets remarkably right?',
      simpleQuestion: 'Did the Qur’an get any other ancient Egyptian details right?',
      answer:
        'Yes! Scholars also note: (1) the Qur’an depicts Haman as Pharaoh’s chief builder working with baked clay/mud bricks (28:38)—whereas the Bible places a different Haman in Persia centuries later—and New Kingdom inscriptions mention "Ha-Amen" / overseers of stone/brick works; (2) the Qur’an mentions mourning rituals where "neither heaven nor earth wept for them" (44:29), echoing actual ancient Egyptian Pyramid Texts that boasted heaven and earth wept for deceased Pharaohs!',
      simpleAnswer:
        'Yes! For example, Surah 44:29 says "neither heaven nor earth wept" for Pharaoh’s army—directly replying to ancient Egyptian tomb inscriptions (only decoded in the 1800s!) that claimed the sky and earth wept when a Pharaoh died.',
      keywords: ['haman', 'pyramid texts', '44:29', 'wept', 'other details', 'egypt', 'baked bricks'],
      followUpIds: ['m-kvp-q3', 'm-kvp-q6'],
    },
    {
      id: 'm-kvp-q6',
      category: 'deep',
      question: 'Why does this historical detail matter so much against the "copying the Bible" claim?',
      simpleQuestion: 'Why is this one of the strongest answers to people who say Islam copied the Bible?',
      answer:
        'Because plagiarism copies errors along with stories. When a 7th-century text quietly corrects an anachronism embedded in earlier texts—an anachronism impossible for any human alive to detect until 1,200 years later—it points directly to an Author who witnessed every era firsthand.',
      simpleAnswer:
        'Anyone copying a story copies its mistakes too. Quietly fixing a 3,000-year-old historical title error 1,200 years before humanity decoded hieroglyphs shows the Qur’an’s source was never human borrowing.',
      keywords: ['bible', 'plagiarism', 'copy', 'borrowing', 'why matter', 'author'],
      followUpIds: ['m-kvp-q2', 'm-kvp-q5'],
    },
  ],

  'm-embryo-stages': [
    {
      id: 'm-emb-q1',
      category: 'objection',
      question: 'Didn’t ancient Greek doctors like Galen or Aristotle already describe embryology before the Qur’an?',
      simpleQuestion: 'Couldn’t the Qur’an have borrowed embryology from ancient Greek doctors like Galen?',
      answer:
        'Actually, the differences are decisive! Aristotle believed embryos formed from menstrual blood coagulated by male semen (like cheese curdling), and Galen believed blood vessels and liver formed first before bones, and neither ever described the millimeter-scale external somite morphology ("chewed-like lump" / mudghah) or the leech-like attachment (‘alaqah) visible only at ~2–4 mm. Moreover, no Arabic translation of Galen existed in 7th-century Mecca—translation into Arabic began over a century later in Baghdad.',
      simpleAnswer:
        'No—ancient Greek theories contained major errors (like thinking menstrual blood curdled like cheese into a baby) that the Qur’an completely avoided. Plus, Galen’s books weren’t even translated into Arabic until more than a century after the Prophet ﷺ lived.',
      keywords: ['galen', 'aristotle', 'greeks', 'hippocrates', 'borrowed', 'ancient medicine', 'menstrual'],
      followUpIds: ['m-emb-q2', 'm-emb-q3'],
    },
    {
      id: 'm-emb-q2',
      category: 'objection',
      question: 'Wait—doesn’t verse 23:14 say bones form BEFORE flesh, whereas modern biology says cartilage and muscle precursors develop together?',
      simpleQuestion: 'Do bones really form before muscles, or is that a scientific mistake?',
      answer:
        'Modern embryology actually harmonizes closely with the Arabic sequence! First, dense mesenchymal condensations form the cartilaginous skeletal scaffold (‘izam) in the limb buds and spine (weeks 5–6), and only afterward do migrating myoblasts differentiate and wrap around those bone models to clothe them with recognizable skeletal muscle (lahm, weeks 7–8). Also, the Arabic conjunction "fa" conveys both quick succession and layered ordering without claiming zero microscopic overlap.',
      simpleAnswer:
        'In modern embryology, the early cartilage skeleton template forms first (weeks 5–6) as the framework, and then muscle cells migrate around those bone models to wrap ("clothe") them in weeks 7–8—matching the verse’s vivid picture remarkably closely.',
      keywords: ['bones', 'flesh', 'muscle', 'cartilage', 'order', 'mistake', 'izam', 'lahm'],
      followUpIds: ['m-emb-q3', 'm-emb-q4'],
    },
    {
      id: 'm-emb-q3',
      category: 'evidence',
      question: 'Why is the single Arabic word ‘Alaqah so astonishingly accurate for weeks 2–3?',
      simpleQuestion: 'What makes the word "Alaqah" match a 3-week human embryo so closely?',
      answer:
        'In classical Arabic lexicons (like Lisan al-‘Arab), ‘alaqah simultaneously carries three distinct meanings: (1) something that clings/suspends, (2) a miniature leech, and (3) a blood-filled clot/vascular body. Remarkably, a 21-day human embryo (only ~2–3 mm long) clings firmly into the uterine wall, has a curved silhouette matching a tiny leech, and feeds directly from maternal blood networks via early closed vessels.',
      simpleAnswer:
        'One Arabic word carries three meanings at once: a clinging thing, a tiny leech, and a blood-filled form. Under a microscope, a 3-week embryo (smaller than a sesame seed!) literally clings to the womb wall, looks like a tiny leech, and draws nourishment from maternal blood.',
      keywords: ['alaqah', 'leech', 'clot', 'clinging', 'arabic', 'microscope', 'three meanings'],
      followUpIds: ['m-emb-q4', 'm-emb-q5'],
    },
    {
      id: 'm-emb-q4',
      category: 'evidence',
      question: 'What are "somites," and why do they look like a "chewed-like lump" (Mudghah)?',
      simpleQuestion: 'Why does the Qur’an call the next stage a "chewed-like lump" (Mudghah)?',
      answer:
        'Around days 24–28, when the embryo is roughly 3–5 millimeters long (smaller than a grain of rice), paired bead-like blocks of tissue called somites develop along its back—giving it unmistakable repeating indentations that resemble tiny teeth marks pressed into soft clay or gum. Emeritus embryologist Dr. Keith Moore famously noted that molding clay to match a 28-day embryo looked strikingly like a chewed morsel.',
      simpleAnswer:
        'At week 4—when the embryo is smaller than a grain of rice—neat rows of tiny ridges called somites appear down its back, looking just like tiny bite marks pressed into soft clay. That matches "mudghah" (chewed-like lump) down to the visual detail.',
      keywords: ['mudghah', 'somites', 'chewed', 'keith moore', 'bite marks', 'week 4', 'ridges'],
      followUpIds: ['m-emb-q2', 'm-emb-q5'],
    },
    {
      id: 'm-emb-q5',
      category: 'deep',
      question: 'Could anyone in the 7th century have seen these stages through miscarriages?',
      simpleQuestion: 'Couldn’t people have seen early embryos during miscarriages without microscopes?',
      answer:
        'At the ‘alaqah and early mudghah stages (days 15–28), the embryo measures only 1.5 to 4 millimeters—completely hidden inside the chorionic sac and blood clots, invisible in structural detail to the naked human eye without modern magnification and lighting. Even Renaissance anatomists with early lenses still believed in the preformed "homunculus" theory a thousand years later!',
      simpleAnswer:
        'At 2 to 4 millimeters—tinier than a peppercorn and hidden inside membranes—those leech-like and somite shapes cannot be seen clearly with bare eyes. Even European scientists 1,000 years later still mistakenly thought babies started as miniature fully formed people.',
      keywords: ['miscarriage', 'naked eye', 'size', 'millimeter', 'homunculus', 'microscope'],
      followUpIds: ['m-emb-q1', 'm-emb-q6'],
    },
    {
      id: 'm-emb-q6',
      category: 'practice',
      question: 'Why does the Qur’an mention embryology—is it teaching biology or something deeper?',
      simpleQuestion: 'What spiritual lesson is God teaching by describing how we began?',
      answer:
        'Notice how Surah 23:14 concludes: "So blessed is Allah, the Best of Creators!" The Qur’an traces our humble, invisible beginnings to dissolve human arrogance and remind us that the One who shaped us delicately in three veils of darkness (39:6) is fully capable of reviving us after death and caring for us today.',
      simpleAnswer:
        'It cures human ego and awakens gratitude: every one of us began tinier than a seed in total darkness, yet Allah crafted every cell with care. Surely He can also care for our future and raise us again.',
      keywords: ['spiritual', 'purpose', 'humility', 'resurrection', 'meaning', 'why mention'],
      followUpIds: ['m-emb-q3', 'm-emb-q4'],
    },
  ],

  'm-hadid-numerology': [
    {
      id: 'm-had-q1',
      category: 'objection',
      question: 'Isn’t Qur’anic numerology just cherry-picking coincidences (confirmation bias)?',
      simpleQuestion: 'Aren’t number patterns in books usually just coincidences if you look hard enough?',
      answer:
        'Healthy skepticism is wise! Many internet "number miracles" do rely on arbitrary counting rules, which serious Islamic scholars rightly caution against. What makes Surah Al-Hadid stand out from forced calculations is its simplicity: (1) it literally sits at chapter 57 of 114 (exact midpoint), (2) its classical Abjad value—a system older than Islam—is 26 for Hadid and 57 for Al-Hadid, matching Iron’s atomic number (26) and stable isotope (Fe-57). Still, scholars always place numerology as a secondary wonder, never the primary proof of faith.',
      simpleAnswer:
        'You’re right to be careful—some internet number claims stretch things too far. Surah Al-Hadid is notable because the numbers are straightforward (exact midpoint chapter 57 of 114, Abjad 26 and 57 matching Fe-26 and Fe-57). Even so, Islamic scholars treat number patterns as a neat bonus, never the main foundation of faith.',
      keywords: ['cherry-picking', 'coincidence', 'confirmation bias', 'numerology', 'skeptic', 'forced', 'fake'],
      followUpIds: ['m-had-q2', 'm-had-q3'],
    },
    {
      id: 'm-had-q2',
      category: 'objection',
      question: 'Wait—isn’t the most common isotope of iron Fe-56, not Fe-57?',
      simpleQuestion: 'Isn’t regular iron mostly Iron-56 instead of Iron-57?',
      answer:
        'Yes—Iron has four naturally occurring stable isotopes: Fe-54 (5.8%), Fe-56 (91.7%), Fe-57 (2.1%), and Fe-58 (0.3%). Fe-56 is the most abundant, while Fe-57 is uniquely prized in nuclear physics (Mössbauer spectroscopy) because it is the ONLY stable iron isotope with nuclear spin. Acknowledging that honestly keeps our study accurate and trustworthy.',
      simpleAnswer:
        'Yes, Fe-56 is the most abundant natural isotope, while Fe-57 is one of Iron’s four stable natural isotopes (and the special one with nuclear spin used in physics). Staying accurate about those details keeps reflection honest and grounded.',
      keywords: ['fe-56', 'isotope', '56', '57', 'abundant', 'chemistry', 'mossbauer'],
      followUpIds: ['m-had-q3', 'm-had-q4'],
    },
    {
      id: 'm-had-q3',
      category: 'deep',
      question: 'What is the Abjad (Hisab al-Jummal) system—was it invented later to fit the Qur’an?',
      simpleQuestion: 'Where do Arabic letter numbers (Abjad) come from—were they made up recently?',
      answer:
        'No—Abjad letter-numeral values (Alif=1, Ba=2... Ha=8, Dal=4, Ya=10, Lam=30) date back to ancient Semitic alphabets (Phoenician/Aramaic/Hebrew/Arabic) centuries before Islam, long before Indian-Arabic digits (0–9) were adopted. Using those fixed historical values: ح(8) + د(4) + ي(10) + د(4) = 26, and adding ال (1+30) gives 57.',
      simpleAnswer:
        'No—Abjad letter values are thousands of years old, shared across ancient Semitic alphabets long before Islam. Using those fixed values, "Hadid" equals 26 and "Al-Hadid" equals 57.',
      keywords: ['abjad', 'jummal', 'letter values', 'math', 'calculation', 'how calculated'],
      followUpIds: ['m-had-q1', 'm-had-q4'],
    },
    {
      id: 'm-had-q4',
      category: 'objection',
      question: 'Weren’t surah numbers and verse numbers added later after the Prophet ﷺ?',
      simpleQuestion: 'Didn’t scholars assign chapter and verse numbers later?',
      answer:
        'While printed marginal numerals were added later as reading aids, the ordering of the 114 surahs and the verse endings (fawasil) were taught and recited orally by the Prophet ﷺ himself during his lifetime—confirmed by Companions like Ibn Mas‘ud and Zayd ibn Thabit. Placing Surah Al-Hadid as the 57th chapter dates back to the prophetic arrangement.',
      simpleAnswer:
        'Printed page numbers came later, but the order of all 114 chapters and where verses end was established during the Prophet’s ﷺ own lifetime—so Al-Hadid has always been chapter 57 of 114.',
      keywords: ['surah numbers', 'added later', 'order', 'arrangement', 'verse count', 'basmalah'],
      followUpIds: ['m-had-q5', 'm-had-q6'],
    },
    {
      id: 'm-had-q5',
      category: 'deep',
      question: 'How should a Muslim view numerical patterns compared to the Qur’an’s main miracles?',
      simpleQuestion: 'Should my faith rely on Qur’an numerology?',
      answer:
        'Never rely on numerology as the main pillar of faith. Classical and contemporary scholars alike emphasize that certainty stands on unshakable foundations: Tawhid, the Qur’an’s linguistic inimitability, preservation by Tawatur, prophetic character, and transformative guidance. Numerical harmonies are simply gentle sparkles along the margins.',
      simpleAnswer:
        'No—build your faith on solid pillars like logical proof of God, the Qur’an’s clear wisdom, preservation, and the Prophet’s ﷺ character. Treat numerical harmonies like an interesting side wonder.',
      keywords: ['faith', 'foundation', 'scholars', 'balance', 'main proof', 'reliable'],
      followUpIds: ['m-had-q1', 'm-had-q6'],
    },
    {
      id: 'm-had-q6',
      category: 'practice',
      question: 'What is the core spiritual theme of Surah Al-Hadid as a whole?',
      simpleQuestion: 'What is Chapter 57 (Surah Al-Hadid) actually teaching us about life?',
      answer:
        'Surah Al-Hadid is one of the most tender chapters on softening a hardened heart: "Has the time not come for those who have believed that their hearts should become humbly submissive at the remembrance of Allah?" (57:16). Just as iron is strong yet can be shaped by warmth, even a tired heart softens through dhikr and generosity.',
      simpleAnswer:
        'Surah Al-Hadid speaks beautifully about softening a hard or tired heart through remembrance of Allah and charity (57:16)—reminding us that even iron bends when warmed by mercy.',
      keywords: ['theme', '57:16', 'soften heart', 'spiritual', 'chapter 57', 'message'],
      followUpIds: ['m-had-q5', 'm-had-q1'],
    },
  ],

  'm-two-seas-barrier': [
    {
      id: 'm-seas-q1',
      category: 'objection',
      question: 'Wait—don’t oceans actually mix eventually? Doesn’t the verse say they NEVER mix?',
      simpleQuestion: 'Scientists say oceans DO mix slowly—doesn’t that contradict the Qur’an?',
      answer:
        'Look closely at the exact Arabic! The verse does NOT say "they never exchange a drop." In fact, the opening verb "maraja" means to release so they flow together and mingle at the interface, while "la yabghiyan" literally means "neither transgresses or overwhelms the other." Modern oceanography confirms this exact balance: across a pycnocline/halocline boundary (like Gibraltar), waters exchange gradually at the front while keeping distinct salinity, temperature, and ecosystems for hundreds of kilometers.',
      simpleAnswer:
        'The Qur’an actually does NOT say they never touch—the first word ("maraja") means they meet and flow side by side, and "la yabghiyan" means neither overwhelms or erases the other. Modern oceanography confirms two seas meet along an invisible density front while keeping their own temperature, saltiness, and sea life for hundreds of miles.',
      keywords: ['mix', 'dont mix', 'contradict', 'oceanography', 'yabghiyan', 'maraja', 'gibraltar'],
      followUpIds: ['m-seas-q2', 'm-seas-q3'],
    },
    {
      id: 'm-seas-q2',
      category: 'objection',
      question: 'Could ancient sailors have simply seen different-colored river water meeting the sea?',
      simpleQuestion: 'Couldn’t ancient fishermen have seen muddy river water meeting blue ocean water?',
      answer:
        'River mouths sometimes show visible silt plumes—which explains why surface color lines were known to coastal sailors. Yet two things stand out in 55:19–20 and 25:53: (1) Muhammad ﷺ lived inland in arid Mecca and never sailed an ocean ship, and (2) Surah 25:53 adds a remarkably specific second term, "hijran mahjura" (a forbidding biological partition), matching how estuary pycnoclines act as physiological barriers separating freshwater and open-ocean marine species.',
      simpleAnswer:
        'Sailors could sometimes see muddy river water meeting ocean water, though the Prophet ﷺ lived inland in the desert and never sailed. Even more striking, Surah 25:53 calls the river-ocean zone a "forbidding barrier" (hijran mahjura)—matching the invisible salt-density wall that separates freshwater and ocean fish species.',
      keywords: ['sailors', 'fishermen', 'color', 'silt', 'muddy', 'river', 'alaska', '25:53'],
      followUpIds: ['m-seas-q3', 'm-seas-q4'],
    },
    {
      id: 'm-seas-q3',
      category: 'evidence',
      question: 'What is a halocline or pycnocline in oceanography?',
      simpleQuestion: 'What actually creates the invisible wall between two seas?',
      answer:
        'Water density depends sharply on salinity (salt content) and temperature. A halocline is a sharp salinity gradient; a pycnocline is a sharp density front. At the Strait of Gibraltar, warmer, saltier, denser Mediterranean water flows out beneath cooler, less salty Atlantic surface water, maintaining distinct physical and chemical signatures for hundreds of kilometers into the Atlantic.',
      simpleAnswer:
        'Different salt levels and temperatures give two seas different densities. Where they meet—like the saltier Mediterranean meeting the Atlantic at Gibraltar—those density differences form an invisible boundary layer (halocline/pycnocline) that keeps each water body distinct for hundreds of miles.',
      keywords: ['halocline', 'pycnocline', 'density', 'salinity', 'temperature', 'gibraltar', 'how'],
      followUpIds: ['m-seas-q4', 'm-seas-q5'],
    },
    {
      id: 'm-seas-q4',
      category: 'evidence',
      question: 'Wait—is the famous viral photo of "two oceans not mixing" in the Gulf of Alaska actually accurate?',
      simpleQuestion: 'Is that viral internet photo of the blue and green seas meeting real?',
      answer:
        'That viral photo (showing glacial sediment-rich runoff meeting darker Gulf of Alaska ocean water) is a real photograph of a sediment/freshwater plume front—NOT two whole oceans refusing to touch forever, as some captions exaggerate. Grounding the verse in real physical oceanography (Gibraltar Mediterranean outflow and estuarine haloclines) is far more accurate and intellectually honest than viral captions.',
      simpleAnswer:
        'That viral photo actually shows glacial river runoff meeting ocean water in Alaska, and internet captions sometimes exaggerate it. The real ocean science—like the salty Mediterranean meeting the Atlantic at Gibraltar and river estuary density fronts—is far more accurate and impressive.',
      keywords: ['viral photo', 'alaska', 'fake', 'caption', 'internet', 'blue green', 'cousteau'],
      followUpIds: ['m-seas-q1', 'm-seas-q3'],
    },
    {
      id: 'm-seas-q5',
      category: 'deep',
      question: 'What does the word "Barzakh" mean elsewhere in the Qur’an?',
      simpleQuestion: 'Why does the Qur’an use the word "Barzakh" here?',
      answer:
        'In Arabic, Barzakh denotes an unseen transitional partition standing between two realms so neither collapses into the other—used both for the unseen realm between worldly life and Resurrection (23:100) and for the subtle physical front separating two distinct water masses (55:20, 25:53).',
      simpleAnswer:
        'Barzakh means an unseen boundary zone standing between two realms so each keeps its distinct nature—whether between two seas or between this life and the Next.',
      keywords: ['barzakh', 'meaning', 'arabic', 'afterlife', '23:100', 'partition'],
      followUpIds: ['m-seas-q1', 'm-seas-q6'],
    },
    {
      id: 'm-seas-q6',
      category: 'practice',
      question: 'What spiritual wisdom does Surah Ar-Rahman teach through this sign?',
      simpleQuestion: 'What life lesson is hidden in the barrier between two seas?',
      answer:
        'Healthy boundaries are a mercy from Al-Latif, not a harsh wall. Just as unseen limits protect sweet freshwater from being ruined by saltwater, wise emotional, moral, and spiritual boundaries protect the sweetness of your heart amid a noisy world.',
      simpleAnswer:
        'Healthy boundaries protect life. Just as an invisible boundary keeps sweet river water from being swallowed by saltwater, wise habits and boundaries protect the peace of your heart.',
      keywords: ['spiritual', 'boundaries', 'ar-rahman', 'heart', 'lesson', 'takeaway'],
      followUpIds: ['m-seas-q3', 'm-seas-q5'],
    },
  ],

  'm-deep-ocean-darkness': [
    {
      id: 'm-deep-q1',
      category: 'objection',
      question: 'Couldn’t ancient people simply guess that deep water gets dark at night or under storm clouds?',
      simpleQuestion: 'Wasn’t it obvious to ancient people that deep oceans are dark?',
      answer:
        'Knowing that a stormy night at sea is dark is obvious—but Surah An-Nur 24:40 states two highly specific non-obvious details together: (1) plural "darknesses stacked one above another" (zulumat ba‘duha fawqa ba‘d) inside a deep sea, mirroring spectral absorption where red, orange, yellow, green, and blue light vanish layer by layer with depth; and (2) "a wave, topped from above by another wave" (mawjun min fawqihi mawj)—precisely matching deep underwater internal waves rolling beneath surface waves, discovered only in the 20th century.',
      simpleAnswer:
        'Everyone knew night storms are dark, but this verse describes two shocking deep-sea realities nobody in the 600s could observe: stacked layers of darkness underwater (as colors of sunlight disappear depth by depth) and hidden underwater waves rolling underneath the surface waves.',
      keywords: ['obvious', 'guess', 'storm', 'clouds', 'ancient', 'already knew', 'dark'],
      followUpIds: ['m-deep-q2', 'm-deep-q3'],
    },
    {
      id: 'm-deep-q2',
      category: 'evidence',
      question: 'What are underwater "internal waves," and how big can they get?',
      simpleQuestion: 'Are there really giant waves moving deep underwater beneath normal ocean waves?',
      answer:
        'Yes! Internal waves form along invisible boundaries between layers of ocean water with different densities (temperature/salinity). They cannot be seen easily by a sailor on the surface, yet oceanographers using submarines, sonar, and satellite radar discovered internal waves—such as in the Luzon Strait and Strait of Gibraltar—towering over 100 to 200 meters tall deep below the ordinary surface waves!',
      simpleAnswer:
        'Yes! Deep below the surface, giant hidden "internal waves" roll silently between warm and cold dense water layers—some towering over 500 feet tall right underneath the normal waves ships sail over.',
      keywords: ['internal waves', 'underwater waves', 'how big', 'sonar', 'submarines', 'density', 'mawj'],
      followUpIds: ['m-deep-q3', 'm-deep-q4'],
    },
    {
      id: 'm-deep-q3',
      category: 'evidence',
      question: 'How does sunlight disappear in "stacked layers" as you descend into the deep ocean?',
      simpleQuestion: 'Why does the verse say "darknesses, some above others" in plural?',
      answer:
        'Water absorbs different wavelengths of light at different depths: red light disappears in the first ~10–15 meters (so red blood looks green/black to divers), orange around 30–50m, yellow by ~100m, and green/blue fade out past 200m (the twilight zone). Below 1,000 meters lies the aphotic midnight zone of absolute pitch darkness—literally layers of darkness stacked atop each other.',
      simpleAnswer:
        'As you sink underwater, sunlight vanishes color by color—red first, then orange, yellow, green, and blue—creating real stacked bands of fading light until below 1,000 meters it is pitch black.',
      keywords: ['wavelength', 'colors', 'red', 'aphotic', '200m', '1000m', 'layers', 'spectrum'],
      followUpIds: ['m-deep-q4', 'm-deep-q5'],
    },
    {
      id: 'm-deep-q4',
      category: 'objection',
      question: 'Wait—isn’t 24:40 a parable about disbelief rather than a literal oceanography lecture?',
      simpleQuestion: 'Isn’t this verse just a metaphor about losing guidance?',
      answer:
        'Yes, its primary purpose is a breathtaking spiritual parable illustrating a soul cut off from Divine light—immediately contrasted with the preceding Light Verse (Ayat al-Nur, 24:35). Yet that makes its physical accuracy even more remarkable: even when painting an everyday metaphor, the Qur’an’s imagery mirrors deep-ocean realities no unaided human diver in history had witnessed.',
      simpleAnswer:
        'Yes—it’s a spiritual parable contrasting darkness with God’s Light (24:35). What amazes readers is that even inside a poetic metaphor, the Qur’an describes deep-ocean phenomena humans could only confirm with submarines 1,300 years later.',
      keywords: ['parable', 'metaphor', '24:35', 'light verse', 'spiritual', 'lecture'],
      followUpIds: ['m-deep-q2', 'm-deep-q5'],
    },
    {
      id: 'm-deep-q5',
      category: 'deep',
      question: 'How deep could 7th-century pearl divers actually dive?',
      simpleQuestion: 'Couldn’t pearl divers in the Arabian Gulf have reached the pitch-black zone?',
      answer:
        'No—even elite breath-hold pearl divers rarely descended beyond 20–30 meters, where sunlight still brightly illuminates the seabed and hands are clearly visible. Reaching the aphotic pitch-black zone (200m–1,000m+) crushes unaided human lungs under 20–100 atmospheres of pressure and required 20th-century steel bathyspheres and submersibles.',
      simpleAnswer:
        'No—breath-hold pearl divers stayed within ~20–30 meters in sunlit water. Reaching the pitch-black deep sea (hundreds of meters down) crushes human lungs and was impossible until modern submarines.',
      keywords: ['pearl divers', 'diving', 'pressure', 'depth', 'submersible', '30 meters'],
      followUpIds: ['m-deep-q1', 'm-deep-q6'],
    },
    {
      id: 'm-deep-q6',
      category: 'practice',
      question: 'What hope does the ending of 24:40 ("Whomever Allah does not grant light has no light") offer?',
      simpleQuestion: 'What does this verse mean for someone feeling overwhelmed by dark days?',
      answer:
        'It reminds us that human self-reliance alone cannot brighten a darkened heart—yet turning to Al-Nur (The Light) brings instant clarity no matter how many layers of confusion or grief feel stacked overhead.',
      simpleAnswer:
        'Even when layers of worry or confusion feel pitch-black, asking Al-Nur (The Light) for guidance pierces straight through the darkness.',
      keywords: ['hope', 'light', 'nur', 'dark days', 'takeaway', 'practice'],
      followUpIds: ['m-deep-q4', 'm-deep-q3'],
    },
  ],

  'm-celestial-orbits': [
    {
      id: 'm-orb-q1',
      category: 'objection',
      question: 'Doesn’t saying "the sun and moon each float in an orbit" just describe geocentrism (the sun going around Earth)?',
      simpleQuestion: 'Does the Qur’an think the sun orbits around the Earth?',
      answer:
        'Remarkably, NO! Notice what the verse does NOT say: it never says the sun orbits Earth, nor that Earth sits motionless. Instead, it states "kullun fi falakin yasbahun" — "each (of them) glides/swims in its own rounded orbit." In fact, for centuries after Copernicus, many astronomers thought the Sun sat completely stationary at the center of the universe—until modern astrophysics discovered our Sun actually orbits the Milky Way center at ~230 km/s!',
      simpleAnswer:
        'No! Notice the verse NEVER says the sun orbits Earth—it says "each glides in its own rounded path." Even after Copernicus, scientists long thought the sun sat completely still—until modern astronomy discovered the sun really DOES orbit the Milky Way galaxy at ~828,000 km/h!',
      keywords: ['geocentrism', 'geocentric', 'earth center', 'copernicus', 'sun orbits earth', 'stationary'],
      followUpIds: ['m-orb-q2', 'm-orb-q3'],
    },
    {
      id: 'm-orb-q2',
      category: 'evidence',
      question: 'How fast does our Sun actually orbit, and what is the "solar apex"?',
      simpleQuestion: 'How does the Sun move through space?',
      answer:
        'Our Sun carries the entire solar system in a grand galactic orbit around the Milky Way’s center at roughly 230 km/s (~828,000 km/h), taking about 225–250 million years (a "cosmic year") per revolution, while bobbing gracefully above and below the galactic plane—echoing both 21:33 ("each swims in an orbit") and 36:38 ("And the sun runs toward its appointed destination").',
      simpleAnswer:
        'The Sun pulls Earth and all the planets around the Milky Way galaxy at about 230 kilometers every second—taking roughly 230 million years to complete one giant galactic lap.',
      keywords: ['sun', 'milky way', 'speed', '230', '36:38', 'solar apex', 'galactic'],
      followUpIds: ['m-orb-q3', 'm-orb-q4'],
    },
    {
      id: 'm-orb-q3',
      category: 'deep',
      question: 'Why does the Arabic verb "yasbahun" (to swim/glide) fit celestial mechanics so well?',
      simpleQuestion: 'Why is the word "swimming" (yasbahun) so special for describing planets and stars?',
      answer:
        'In classical Arabic, "sabaha" means moving smoothly through a medium using one’s own internal rotational/gliding motion—NOT being dragged passively like a stone nailed to a crystal sphere (the Ptolemaic model common in antiquity). Remarkably, celestial bodies both rotate on their own axes AND glide effortlessly through space along curved gravitational orbits.',
      simpleAnswer:
        'Ancient Greeks imagined stars stuck like nails onto solid glass shells. "Yasbahun" (gliding/swimming) instead pictures stars and planets spinning and moving freely along smooth curved paths—just like real orbits in space.',
      keywords: ['yasbahun', 'swim', 'ptolemy', 'crystal spheres', 'arabic', 'rotate', 'falak'],
      followUpIds: ['m-orb-q4', 'm-orb-q5'],
    },
    {
      id: 'm-orb-q4',
      category: 'objection',
      question: 'Wait—what about Surah 18:86 where Dhul-Qarnayn saw the sun setting in a "muddy spring"?',
      simpleQuestion: 'Doesn’t Surah Al-Kahf say the sun sets in a muddy spring?',
      answer:
        'Look closely at the exact Arabic wording in 18:86: "wajadaha taghrubu" — "he FOUND it (i.e. it appeared to his sight) setting in a dark/muddy spring/sea." Classical scholars centuries before modern astronomy (like Al-Razi, Ibn Kathir, and Al-Qurtubi) explicitly explained this is visual perspective—just as we say "the sun sank into the ocean" at sunset—not a claim that the physical star drops into a pond.',
      simpleAnswer:
        'Verse 18:86 literally says "it appeared to him (wajadaha) setting in a dark spring/water"—describing the view from the shoreline, just like we say "I watched the sun sink into the sea." Classical Muslim scholars 800 years ago already explained it as everyday visual perspective.',
      keywords: ['muddy spring', '18:86', 'dhul-qarnayn', 'sunset', 'contradiction', 'kahf'],
      followUpIds: ['m-orb-q1', 'm-orb-q5'],
    },
    {
      id: 'm-orb-q5',
      category: 'evidence',
      question: 'Why does Surah Ya-Sin 36:40 say "neither is it for the sun to overtake the moon"?',
      simpleQuestion: 'What does "the sun cannot catch up to the moon" mean?',
      answer:
        'It highlights the astonishing orbital stability of the Earth-Moon-Sun system: each body stays locked in its calibrated orbital lane without spiraling into collision or throwing day and night into chaos.',
      simpleAnswer:
        'It celebrates the incredible stability of orbits—Earth, Moon, and Sun stay cleanly in their lanes without colliding or breaking the steady rhythm of day and night.',
      keywords: ['36:40', 'overtake', 'yasin', 'collision', 'stability', 'moon'],
      followUpIds: ['m-orb-q2', 'm-orb-q6'],
    },
    {
      id: 'm-orb-q6',
      category: 'practice',
      question: 'What personal rhythm does "each glides in its orbit" invite us into?',
      simpleQuestion: 'What lesson does cosmic order give us for our daily routine?',
      answer:
        'Just as stars and planets find harmony by moving faithfully within their assigned orbit, human hearts find peace when our days orbit around prayer, honesty, and purposeful service rather than chaotic drift.',
      simpleAnswer:
        'Stars stay in harmony by staying in their orbit. Our days feel calmer too when we anchor them around steady prayers and purposeful habits.',
      keywords: ['rhythm', 'orbit', 'peace', 'routine', 'practice', 'harmony'],
      followUpIds: ['m-orb-q1', 'm-orb-q3'],
    },
  ],

  'm-byzantine-prophecy': [
    {
      id: 'm-byz-q1',
      category: 'objection',
      question: 'Couldn’t predicting Rome would beat Persia again just be a lucky 50/50 political guess?',
      simpleQuestion: 'Wasn’t predicting the Romans would bounce back just a lucky guess?',
      answer:
        'Not remotely 50/50—historians call the Byzantine Empire’s state in 614–615 CE near-total collapse! Persia had just sacked Jerusalem and Damascus, conquered Egypt (Rome’s grain lifeline), bankrupted Constantinople, and stood across the Bosphorus while Avars besieged Rome from the north. Emperor Heraclius was literally preparing to abandon Constantinople for Carthage. Worse, the Qur’an risked its entire credibility by attaching a strict countdown: "fi bid‘i sinin" (within 3–9 years)—and Heraclius stunned the world by defeating Persia right inside that exact window (622–627 CE).',
      simpleAnswer:
        'In 615 CE, nobody gave Rome a 50/50 chance—Persia had conquered Jerusalem and Egypt, the Roman treasury was empty, and the emperor was preparing to flee Constantinople. Betting the credibility of Islam on a total Roman comeback within a strict 3–9 year countdown—and having it come true right on schedule—was astonishing.',
      keywords: ['lucky guess', '50/50', 'chance', 'political', 'heraclius', 'persia', 'countdown', 'bid'],
      followUpIds: ['m-byz-q2', 'm-byz-q3'],
    },
    {
      id: 'm-byz-q2',
      category: 'objection',
      question: 'Wait—couldn’t the vowel marks in "ghulibat / sayaghlibun" have been flipped AFTER the war ended?',
      simpleQuestion: 'Since early Arabic had no vowel marks, couldn’t people have changed "defeated" to "will win" after the fact?',
      answer:
        'No, for three airtight reasons: (1) The Qur’an was memorized and recited aloud publicly in Mecca years before the victory; (2) early historical reports preserve the famous public wager Abu Bakr made with Quraysh skeptic Ubayy ibn Khalaf specifically betting on Rome’s victory within 3–9 years—a bet that would make zero sense if the verse hadn’t predicted Rome’s comeback; and (3) the very next verse states "And on that day the believers will rejoice"—which Muslims did because Christian Rome was People of the Book while Sassanian Persia was not.',
      simpleAnswer:
        'No! The verse was recited aloud publicly years before the victory, Abu Bakr famously made a documented public wager with a Meccan skeptic over Rome winning within 9 years, and the very next verse says "the believers will rejoice on that day"—which only makes sense if Rome won.',
      keywords: ['vowels', 'ghulibat', 'sayaghlibun', 'flipped', 'changed', 'abu bakr', 'wager', 'bet'],
      followUpIds: ['m-byz-q3', 'm-byz-q4'],
    },
    {
      id: 'm-byz-q3',
      category: 'evidence',
      question: 'Does "adnal-ard" mean "nearest land" or "lowest land"—and why is the Dead Sea Basin so remarkable?',
      simpleQuestion: 'What does "adnal-ard" mean—nearest land or lowest land on Earth?',
      answer:
        'In classical Arabic, the superlative "adna" from the root d-n-w carries BOTH meanings naturally: "nearest" (to Arabia) AND "lowest" (in elevation). Remarkably, the decisive 614 CE Persian-Byzantine campaigns took place right in the Levant / Jerusalem / Dead Sea rift basin—which modern satellite geodesy confirmed is literally the lowest exposed dry land on planet Earth at roughly −430 meters below sea level!',
      simpleAnswer:
        'In Arabic, "adna" naturally means both "nearest" and "lowest." Amazingly, the region around Jerusalem and the Dead Sea where the clash happened is BOTH the nearest Roman territory to Arabia AND the single lowest dry land on planet Earth (−430 meters below sea level)!',
      keywords: ['adna', 'lowest', 'nearest', 'dead sea', 'elevation', '430', 'arabic', 'geodesy'],
      followUpIds: ['m-byz-q4', 'm-byz-q5'],
    },
    {
      id: 'm-byz-q4',
      category: 'evidence',
      question: 'What does "bid‘i sinin" mean, and did the victory truly happen inside that timeframe?',
      simpleQuestion: 'What exact number of years does "bid‘i sinin" mean, and did it match?',
      answer:
        'In classical Arabic, "bid‘" strictly denotes a number between 3 and 9. Jerusalem fell to Persia in 614 CE (verse revealed ~615–616 CE); Heraclius launched his stunning counter-offensive in 622 CE and decisively crushed Persian forces at Nineveh in 627 CE (and reclaimed the True Cross by 628 CE)—falling squarely within the predicted window.',
      simpleAnswer:
        'In Arabic, "bid‘" specifically means 3 to 9 years. After Rome’s crushing defeat around 614–615 CE, Heraclius launched his comeback in 622 CE and decisively won by 627 CE—landing right inside the window.',
      keywords: ['bid', '3 to 9', 'years', 'timeline', '622', '627', 'nineveh', 'exact'],
      followUpIds: ['m-byz-q1', 'm-byz-q5'],
    },
    {
      id: 'm-byz-q5',
      category: 'deep',
      question: 'Why did the early Muslims rejoice at Christian Rome’s victory?',
      simpleQuestion: 'Why did the verse say Muslims would celebrate when Christian Rome won?',
      answer:
        'Meccan polytheists mocked the Muslims when Zoroastrian Persia crushed Christian Byzantium, taunting that idolaters were beating People of the Book. Allah reassured the persecuted Muslims that Rome would rebound—and remarkably, Rome’s comeback coincided with the Muslims’ own turning point at Badr (624 CE), giving the believers a double joy.',
      simpleAnswer:
        'Meccan pagans teased Muslims when Persia defeated Christian Rome. The verse promised Rome—People of the Book—would bounce back, and their comeback happened right alongside the Muslims’ own victory at Badr.',
      keywords: ['rejoice', 'christians', 'badr', 'meccans', 'why celebrate', 'believers'],
      followUpIds: ['m-byz-q2', 'm-byz-q6'],
    },
    {
      id: 'm-byz-q6',
      category: 'practice',
      question: 'What does Surah Ar-Rum 30:4 ("To Allah belongs the command before and after") teach during hopeless moments?',
      simpleQuestion: 'What does this history teach us when a situation looks totally hopeless?',
      answer:
        'When empires appear invincible and justice looks defeated, history can pivot in a single season by Allah’s command. Never measure the future solely by today’s bleak headlines.',
      simpleAnswer:
        'Even when a situation looks completely impossible, Allah can turn everything around faster than anyone expects. Never lose hope.',
      keywords: ['hopeless', 'comfort', 'command', '30:4', 'takeaway', 'practice'],
      followUpIds: ['m-byz-q1', 'm-byz-q3'],
    },
  ],

  'm-mountains-pegs': [
    {
      id: 'm-mtn-q1',
      category: 'objection',
      question: 'Don’t mountains exist where earthquakes happen most? So how can the Qur’an say mountains "stabilize" the earth?',
      simpleQuestion: 'If earthquakes happen near mountains, how do mountains help stabilize the Earth?',
      answer:
        'Look carefully at the geological mechanism and the exact Arabic verb ("an tamida bikum" — lest it sway/tilt wildly with you). Earth’s crust floats atop the denser semi-fluid asthenosphere via isostasy. Mountain ranges possess massive deep crustal roots (35–70 km deep, like an iceberg or tent peg) that balance regional crustal mass and dampen large-scale lithospheric flexing/tilting—while earthquakes occur locally along tectonic plate faults during mountain-building collisions.',
      simpleAnswer:
        'Earthquakes happen along cracks where giant tectonic plates push together to form mountains. Meanwhile, the deep underground roots of mountain ranges (reaching 35–70 km down!) act like heavy keels balancing Earth’s crust so it stays isostatically balanced instead of wobbling unevenly.',
      keywords: ['earthquakes', 'shake', 'stabilize', 'tamida', 'contradiction', 'tectonic', 'isostasy'],
      followUpIds: ['m-mtn-q2', 'm-mtn-q3'],
    },
    {
      id: 'm-mtn-q2',
      category: 'evidence',
      question: 'How deep do mountain "roots" actually go underground, and when was this discovered?',
      simpleQuestion: 'Do mountains really have giant roots buried underground like tent pegs?',
      answer:
        'Yes! In 1855, British Astronomer Royal George Biddell Airy proposed—and 20th-century seismic imaging confirmed—the theory of crustal isostasy: just like an iceberg has most of its bulk underwater, high mountains like the Himalayas or Andes extend deep crustal roots 35 to 70 kilometers downward into the mantle—far deeper than the peak rising above the surface. That matches a tent peg (watad), where the bulk lies hidden underground.',
      simpleAnswer:
        'Yes! Starting with George Airy in 1855 and later seismic scans, geologists discovered mountains are like icebergs in stone: beneath peaks like the Himalayas sit massive roots plunging 35 to 70 kilometers underground—just like a tent peg driven deep into the earth.',
      keywords: ['roots', 'how deep', 'airy', '1855', 'iceberg', 'watad', 'tent peg', 'himalayas'],
      followUpIds: ['m-mtn-q3', 'm-mtn-q4'],
    },
    {
      id: 'm-mtn-q3',
      category: 'objection',
      question: 'Isn’t calling mountains "pegs" just an obvious visual metaphor for nomadic Arabs living in tents?',
      simpleQuestion: 'Didn’t desert Arabs just call mountains pegs because they looked like big tent stakes?',
      answer:
        'On the surface, a mountain looks like a wide pyramid resting ON TOP of flat ground—NOT a peg whose hidden majority is driven deep UNDERGROUND! A tent peg’s defining feature is that most of its length disappears beneath the soil to anchor the fabric. Saying mountains are pegs (awtad) and "anchored firmly" (rawasi) captures a subterranean architecture no human could measure before 19th-century gravimetry.',
      simpleAnswer:
        'To bare eyes, a mountain looks like a giant pile sitting ON TOP of the earth—not a peg driven deep underground. What defines a tent peg is that most of it is buried below the surface—something geologists only discovered 1,200 years later.',
      keywords: ['tents', 'nomads', 'metaphor', 'obvious', 'visual', 'awtad', 'pyramid'],
      followUpIds: ['m-mtn-q2', 'm-mtn-q4'],
    },
    {
      id: 'm-mtn-q4',
      category: 'evidence',
      question: 'What did famous geologist Frank Press write about mountains as pegs?',
      simpleQuestion: 'Do modern geology textbooks actually compare mountains to pegs?',
      answer:
        'Yes—in his classic textbook "Earth" (co-authored with Raymond Siever), former U.S. National Academy of Sciences President Frank Press illustrated continental mountain ranges as deep wedge-shaped pegs extending downward into the denser mantle to achieve gravitational equilibrium.',
      simpleAnswer:
        'Yes—famous geologist Frank Press (former president of the U.S. National Academy of Sciences) actually illustrated mountain roots as deep pegs anchoring into Earth’s mantle in his widely used textbook "Earth."',
      keywords: ['frank press', 'textbook', 'earth', 'geologist', 'science', 'mantle'],
      followUpIds: ['m-mtn-q1', 'm-mtn-q5'],
    },
    {
      id: 'm-mtn-q5',
      category: 'deep',
      question: 'Does the Qur’an also mention that mountains move (like plate tectonics)?',
      simpleQuestion: 'Does the Qur’an say mountains are moving?',
      answer:
        'Surah An-Naml 27:88 says: "And you see the mountains, thinking them rigidly fixed, while they pass by as the passing of clouds." Classical scholars understood this primarily for the Day of Judgment, while many modern readers also appreciate how vividly the imagery echoes continuous continental drift and Earth’s rotation—while respecting the classical eschatological context.',
      simpleAnswer:
        'Surah 27:88 says you see mountains thinking them frozen solid while they move like clouds—primarily describing the Day of Judgment in classical commentary, while also evoking awe when we think of Earth spinning and continents drifting.',
      keywords: ['move', '27:88', 'clouds', 'plate tectonics', 'drift', 'naml'],
      followUpIds: ['m-mtn-q2', 'm-mtn-q6'],
    },
    {
      id: 'm-mtn-q6',
      category: 'practice',
      question: 'What personal reminder do "hidden mountain roots" offer for faith?',
      simpleQuestion: 'What life lesson can we learn from a mountain’s unseen roots?',
      answer:
        'What keeps a mountain standing tall is the unseen depth buried beneath the surface. Likewise, public composure and strength come from hidden roots—private prayers, quiet dhikr, and sincerity nobody else sees.',
      simpleAnswer:
        'Just like a mountain stands tall because of its deep hidden roots, real inner strength comes from the quiet prayers and good habits nobody else sees.',
      keywords: ['roots', 'strength', 'hidden', 'practice', 'takeaway', 'heart'],
      followUpIds: ['m-mtn-q2', 'm-mtn-q1'],
    },
  ],

  'm-water-origin-life': [
    {
      id: 'm-wat-q1',
      category: 'objection',
      question: 'Didn’t ancient Greek philosopher Thales already say "everything is water" long before Islam?',
      simpleQuestion: 'Didn’t ancient Greeks already guess that everything comes from water?',
      answer:
        'Thales (~600 BCE) claimed that ALL matter in the entire universe—rocks, fire, air, and stars—was literally transformed water (a mistaken cosmological monism). By contrast, Surah Al-Anbiya 21:30 makes a razor-specific biological claim: "We made from water EVERY LIVING THING (kulla shay’in hayy)"—explicitly restricting it to living organisms, not rocks or stars, which matches modern cell biology and astrobiology with 100% precision.',
      simpleAnswer:
        'Thales mistakenly thought rocks, stars, and everything in the universe were made of water. The Qur’an makes a sharp, specific biological statement: "every LIVING thing" is made from water—matching modern cell biology exactly.',
      keywords: ['thales', 'greeks', 'ancient', 'everything is water', 'rocks', 'borrowed', 'philosophy'],
      followUpIds: ['m-wat-q2', 'm-wat-q3'],
    },
    {
      id: 'm-wat-q2',
      category: 'objection',
      question: 'Isn’t it obvious even in the desert that plants and animals need to drink water to survive?',
      simpleQuestion: 'Didn’t desert people already know living things die without water?',
      answer:
        'Knowing animals get thirsty is very different from stating that EVERY living organism is literally MADE FROM water ("ja‘alna minal-ma’i kulla shay’in hayy")—including microscopic bacteria, desert beetles, and dry-looking trees. In an arid desert where rock, sand, and dust dominate the landscape, claiming water is the universal material matrix of all life—and pairing it in the very same verse with the primordial cosmic separation (Big Bang)—is deeply striking.',
      simpleAnswer:
        'Knowing camels need to drink is one thing; declaring that EVERY living organism—from desert insects to tall trees to invisible cells—is literally made OF water, right in the same verse as the origin of the cosmos, is far more specific.',
      keywords: ['obvious', 'desert', 'drink', 'thirsty', 'made from', 'matrix'],
      followUpIds: ['m-wat-q3', 'm-wat-q4'],
    },
    {
      id: 'm-wat-q3',
      category: 'evidence',
      question: 'What does modern cell biology and NASA astrobiology say about water and life?',
      simpleQuestion: 'Why is water essential to every single living cell we know?',
      answer:
        'Every known living cell on Earth—from archaea in boiling volcanic vents to human neurons—contains 70–90% water as its cytoplasm solvent, enabling protein folding, DNA replication, and metabolic chemistry. That is why NASA’s primary rule when searching Mars, Europa, or distant exoplanets for life is literally "Follow the Water."',
      simpleAnswer:
        'Every living cell on Earth is 70–90% water; without liquid water, DNA and proteins cannot work. That is why NASA’s number-one rule when hunting for life on other planets is literally "Follow the Water."',
      keywords: ['nasa', 'astrobiology', 'cell', 'cytoplasm', '70%', 'mars', 'biology', 'science'],
      followUpIds: ['m-wat-q4', 'm-wat-q5'],
    },
    {
      id: 'm-wat-q4',
      category: 'objection',
      question: 'What if angels or jinn are alive—aren’t they created from light and fire, not water?',
      simpleQuestion: 'Wait—what about angels and jinn? Doesn’t that break "every living thing from water"?',
      answer:
        'Surah 21:30 explicitly addresses earthly biological life right after describing the heavens and earth ("Do they not see..."), and in Arabic "kull" (every) routinely scopes to the domain under discussion—earthly organic life. Even more, classical commentators noted that 24:45 ("Allah created every moving creature from water") specifically covers all biological creatures inhabiting Earth.',
      simpleAnswer:
        'In context (21:30 and 24:45), the verse specifically speaks about earthly biological creatures we can observe ("Will they not believe?"). Unseen beings like angels belong to another realm beyond physical biology.',
      keywords: ['angels', 'jinn', 'fire', 'light', 'exception', '24:45', 'contradiction'],
      followUpIds: ['m-wat-q3', 'm-wat-q5'],
    },
    {
      id: 'm-wat-q5',
      category: 'deep',
      question: 'Why are the properties of water itself considered a fine-tuning miracle?',
      simpleQuestion: 'What makes the water molecule (H2O) itself so unusual in chemistry?',
      answer:
        'Water breaks normal chemical rules in ways vital for life: unlike almost every other liquid, frozen water (ice) is LESS dense than liquid water so ice floats—preventing oceans and lakes from freezing solid from the bottom up and killing all aquatic life. Water also has an extraordinarily high heat capacity, stabilizing Earth’s climate and our body temperature.',
      simpleAnswer:
        'Water is chemically extraordinary: ice floats instead of sinking (if it sank, oceans would freeze solid and kill sea life), and water holds heat remarkably well to keep Earth’s climate and our bodies stable.',
      keywords: ['ice floats', 'h2o', 'fine-tuning', 'density', 'chemistry', 'heat capacity'],
      followUpIds: ['m-wat-q3', 'm-wat-q6'],
    },
    {
      id: 'm-wat-q6',
      category: 'practice',
      question: 'How does Islam turn ordinary water into daily spiritual remembrance?',
      simpleQuestion: 'Why does water play such a central role in Islamic worship?',
      answer:
        'Five times a day, Wudu (ablution) touches cool water to your hands, face, and feet—physically refreshing your body while reminding your heart of Allah’s life-giving mercy, and even teaching environmental care (the Prophet ﷺ forbade wasting water even beside a flowing river).',
      simpleAnswer:
        'Every time you drink water or make Wudu, you touch the very substance of life—a daily chance to say Bismillah, Alhamdulillah, and never waste a drop.',
      keywords: ['wudu', 'waste', 'river', 'gratitude', 'practice', 'spiritual'],
      followUpIds: ['m-wat-q3', 'm-wat-q5'],
    },
  ],

  'm-worker-bee': [
    {
      id: 'm-bee-q1',
      category: 'objection',
      question: 'Isn’t the word "nahl" (bee) just grammatically feminine in Arabic—like ships or tables in French—so feminine verbs don’t prove biology?',
      simpleQuestion: 'Couldn’t the feminine grammar for bees just be a quirk of Arabic language?',
      answer:
        'Actually, classical Arabic dictionaries (like Lisan al-‘Arab and Al-Qamus) explicitly note that "nahl" (bees) is a collective noun that can take EITHER masculine OR feminine verbs—and in fact, for centuries across both Europe (Shakespeare’s Henry V calls it "the king bee") and the Near East, people commonly assumed bees were ruled by a male "king" and staffed by male workers! Yet Surah An-Nahl 16:68–69 consistently chooses three feminine singular imperatives ("ittakhidhi, kuli, usluki") specifically for the bees that build hives, forage nectar, and produce honey—matching modern entomology’s discovery that 100% of worker/forager bees are female.',
      simpleAnswer:
        'In classical Arabic, "nahl" (bees) can actually be treated as masculine OR feminine—and for centuries people everywhere (even Shakespeare!) thought bees had a male "king" and male workers. Yet the Qur’an deliberately uses three feminine commands specifically for the bees that build hives, gather nectar, and make honey—and biology later proved 100% of worker bees are female.',
      keywords: ['grammar', 'feminine', 'arabic', 'collective noun', 'shakespeare', 'king bee', 'quirk'],
      followUpIds: ['m-bee-q2', 'm-bee-q3'],
    },
    {
      id: 'm-bee-q2',
      category: 'evidence',
      question: 'What do male bees (drones) actually do—do they ever gather nectar or make honey?',
      simpleQuestion: 'Do male bees help build the hive or collect nectar at all?',
      answer:
        'Never! Male bees (drones) lack pollen baskets, wax glands, and honey-processing enzymes; their sole biological role is mating with a queen. Every single architectural task—building hexagonal wax combs, foraging flowers, navigating complex routes, and enzymatically turning nectar into honey inside their dedicated "honey stomach" (crop)—is performed exclusively by female worker bees.',
      simpleAnswer:
        'Never! Male bees (drones) do not build combs, collect pollen, or make honey. Every builder, navigator, and honey-maker in the hive is female.',
      keywords: ['drones', 'male bees', 'female', 'worker', 'nectar', 'honey', 'biology'],
      followUpIds: ['m-bee-q3', 'm-bee-q4'],
    },
    {
      id: 'm-bee-q3',
      category: 'evidence',
      question: 'Why does the verse say honey emerges from their "bellies" (butuniha, plural) and has "healing for people"?',
      simpleQuestion: 'What does modern science say about bees’ stomachs and honey’s healing power?',
      answer:
        'Worker bees literally have a second specialized stomach (the honey crop) separate from their digestive stomach where enzymes invert floral nectar into honey. And modern medical research confirmed honey’s remarkable healing properties: medical-grade honey (like Manuka) is FDA-cleared for wound and burn dressings thanks to its natural hydrogen peroxide, low pH, osmotic antibacterial action, and antioxidant flavonoids.',
      simpleAnswer:
        'Worker bees have a separate "honey stomach" just for transforming nectar into honey. Modern medicine also uses medical-grade honey for wound healing, burns, and soothing coughs because of its natural antibacterial chemistry.',
      keywords: ['bellies', 'stomach', 'crop', 'healing', 'medicine', 'manuka', 'antibacterial', 'wounds'],
      followUpIds: ['m-bee-q4', 'm-bee-q5'],
    },
    {
      id: 'm-bee-q4',
      category: 'evidence',
      question: 'What does "follow the paths of your Lord made easy" (subula rabbiki dhulula) suggest?',
      simpleQuestion: 'How do bees navigate miles away and find their exact way back home?',
      answer:
        'Nobel Prize winner Karl von Frisch discovered that forager bees navigate miles from their hive using the sun’s polarized light compass and magnetic sensing—and communicate exact distance and angle to sister workers back at the hive through the intricate "waggle dance."',
      simpleAnswer:
        'Scientists discovered bees navigate miles away using sunlight patterns and then perform a "waggle dance" back home to tell their sisters the exact direction and distance to the flowers.',
      keywords: ['paths', 'navigate', 'waggle dance', 'frisch', 'subula', 'direction'],
      followUpIds: ['m-bee-q2', 'm-bee-q5'],
    },
    {
      id: 'm-bee-q5',
      category: 'deep',
      question: 'Why does the Qur’an use the word "awha" (inspired/revealed) for the bee?',
      simpleQuestion: 'Does God really "inspire" insects like bees?',
      answer:
        'In Arabic, "wahy" has a spectrum of meanings: for Prophets it means verbal revelation, while for bees (16:68) it means divinely programmed instinct (ilham). A tiny insect with a brain the size of a sesame seed builds mathematically optimal 120-degree hexagonal combs and runs a spotless pharmacy without a single engineering lesson.',
      simpleAnswer:
        'Here, "inspired" means God-given instinct. With a brain tinier than a sesame seed, a bee builds mathematically ideal hexagons and crafts natural medicine without ever taking a class.',
      keywords: ['awha', 'wahy', 'inspired', 'instinct', 'hexagon', '16:68'],
      followUpIds: ['m-bee-q1', 'm-bee-q6'],
    },
    {
      id: 'm-bee-q6',
      category: 'practice',
      question: 'Why did the Prophet ﷺ compare the believer to a honeybee?',
      simpleQuestion: 'What character lesson does the bee teach a believer?',
      answer:
        'In an authentic narration, the Prophet ﷺ said a believer is like a bee: it eats only what is pure, produces only what is pure and beneficial, and lands on a delicate branch without breaking or harming it.',
      simpleAnswer:
        'The Prophet ﷺ compared a believer to a bee: it takes in only what is clean, leaves behind something sweet and helpful, and never breaks the branch it rests on.',
      keywords: ['believer', 'hadith', 'character', 'pure', 'practice', 'lesson'],
      followUpIds: ['m-bee-q3', 'm-bee-q5'],
    },
  ],

  'm-unique-fingertips': [
    {
      id: 'm-fin-q1',
      category: 'objection',
      question: 'Doesn’t "bananahu" (his fingertips) just mean Allah can restore even the smallest delicate bones—not necessarily fingerprints?',
      simpleQuestion: 'Was the verse talking about tiny finger bones or actual fingerprints?',
      answer:
        'Both layers harmonize seamlessly! Classical scholars (like Ibn Kathir and Al-Qurtubi) understood "banan" as the delicate terminal tips of the fingers—showing Allah’s power reaches down to the smallest extremities, not merely large bones. Centuries later, Francis Galton (1892) and modern forensics revealed an astonishing second layer: those exact fingertips also carry each human’s unrepeatable biometric ridge signature—making "even his fingertips" both classically clear and scientifically breathtaking.',
      simpleAnswer:
        'Both are true at once! Early scholars understood it to mean Allah can rebuild even our tiniest, most delicate finger tips—not just big bones. Then in 1892, modern science discovered those exact fingertips ALSO carry every person’s one-of-a-kind fingerprint.',
      keywords: ['banan', 'bones', 'fingerprints', 'classical', 'galton', 'meaning', 'stretch'],
      followUpIds: ['m-fin-q2', 'm-fin-q3'],
    },
    {
      id: 'm-fin-q2',
      category: 'evidence',
      question: 'Do identical twins have the exact same fingerprints since they share 100% identical DNA?',
      simpleQuestion: 'Do identical twins share the same fingerprints?',
      answer:
        'No! Even monozygotic (identical) twins with identical DNA have completely distinct fingerprints. Friction ridges form during weeks 10–17 in the womb through microscopic fluid pressures, blood flow, and fetal touch against the amniotic sac—making every individual’s fingertips genuinely unique in all human history.',
      simpleAnswer:
        'No! Even identical twins with the exact same DNA end up with different fingerprints, shaped by tiny micro-movements in the womb before birth.',
      keywords: ['twins', 'identical', 'dna', 'unique', 'womb', 'biometric'],
      followUpIds: ['m-fin-q3', 'm-fin-q4'],
    },
    {
      id: 'm-fin-q3',
      category: 'objection',
      question: 'Didn’t ancient Chinese or Babylonians press thumbprints into clay seals before Islam?',
      simpleQuestion: 'Didn’t ancient people already use thumbprints on clay tablets?',
      answer:
        'Some ancient clay documents bear incidental thumb impressions as personal marks, yet no ancient civilization established scientifically that every human’s friction-ridge pattern is universally unique and permanent from womb to grave—that was only systematically proven in the late 19th century by Henry Faulds, William Herschel, and Francis Galton (1892). And in 7th-century Arabia, fingertips were never used for identity verification.',
      simpleAnswer:
        'While some ancient clay seals had thumb impressions, nobody proved scientifically that every human’s fingertip ridges are permanently unique until the late 1800s—and it was completely unknown in 7th-century Arabia.',
      keywords: ['chinese', 'babylon', 'clay', 'ancient', 'already knew', 'seals', '1892'],
      followUpIds: ['m-fin-q1', 'm-fin-q4'],
    },
    {
      id: 'm-fin-q4',
      category: 'deep',
      question: 'What is the context of Surah Al-Qiyamah 75:3–4?',
      simpleQuestion: 'Why did Allah bring up fingertips in Surah Al-Qiyamah?',
      answer:
        'Meccan skeptics mocked physical resurrection: "Does man think We will not assemble his scattered bones?" Allah answers not merely "Yes, We will gather your big bones," but "Yes—We are able to restore even the exact precision of his fingertips!"—affirming that resurrection preserves your exact personal identity down to the finest millimeter.',
      simpleAnswer:
        'Skeptics doubted God could rebuild scattered bones after death. Allah replied that He won’t just gather big bones—He can restore you down to the exact detail of your fingertips, preserving who you truly are.',
      keywords: ['context', 'resurrection', 'bones', 'qiyamah', '75:3', 'identity'],
      followUpIds: ['m-fin-q2', 'm-fin-q5'],
    },
    {
      id: 'm-fin-q5',
      category: 'evidence',
      question: 'Do fingerprints ever change as we grow older or heal from small cuts?',
      simpleQuestion: 'Can your fingerprints change over your lifetime?',
      answer:
        'No—unless deep scarring destroys the underlying dermal papillae layer, friction ridges regenerate in the exact same loop, whorl, and arch pattern from infancy until death.',
      simpleAnswer:
        'No—even after normal cuts heal, your skin grows back in the exact same ridge pattern from birth to old age.',
      keywords: ['change', 'permanent', 'grow back', 'scars', 'lifelong'],
      followUpIds: ['m-fin-q2', 'm-fin-q6'],
    },
    {
      id: 'm-fin-q6',
      category: 'practice',
      question: 'What does having a one-of-a-kind fingertip remind us about our worth before Allah?',
      simpleQuestion: 'What personal takeaway does this verse give me?',
      answer:
        'Out of over a hundred billion humans who have ever walked the earth, Allah fashioned your very fingertips uniquely. You are never lost in a crowd before Him—He knows your name, your tears, and your quiet prayers individually.',
      simpleAnswer:
        'Out of billions of people, no one else shares your fingertips. You are never just a number to Allah—He crafted and knows you individually.',
      keywords: ['worth', 'individual', 'unique', 'crowd', 'takeaway', 'practice'],
      followUpIds: ['m-fin-q1', 'm-fin-q4'],
    },
  ],

  'm-pharaoh-preserved-body': [
    {
      id: 'm-pha-q1',
      category: 'objection',
      question: 'Wait—didn’t everyone know ancient Egyptians mummified Pharaohs? Why is preserving Pharaoh’s body a miracle?',
      simpleQuestion: 'Everyone knows Egyptians made mummies—so why is Surah 10:92 impressive?',
      answer:
        'Crucial distinction! If a tyrant drowns at sea in a miraculous parting and collapse of the waters, the natural expectation—and what the Bible’s Exodus narrative leaves implied—is that his body vanished beneath the waves forever ("sank like lead in the mighty waters," Ex. 15:10). Surah Yunus 10:92 uniquely states something found in NO prior scripture: Allah specifically saved Pharaoh’s BODY ("bi-badanika") from the sea so it would remain preserved as a physical sign for later generations—centuries before royal New Kingdom mummies were rediscovered in 1881 and 1898!',
      simpleAnswer:
        'Because someone who drowns in the middle of the sea is expected to disappear forever—and earlier scriptures never say his body was recovered! Surah 10:92 uniquely declares that God saved Pharaoh’s physical body from the waters to stay preserved as a sign for future generations.',
      keywords: ['mummies', 'egyptians', 'obvious', 'drowned', 'exodus', 'bible', 'why miracle'],
      followUpIds: ['m-pha-q2', 'm-pha-q3'],
    },
    {
      id: 'm-pha-q2',
      category: 'objection',
      question: 'Which exact Pharaoh was the Pharaoh of the Exodus—Ramesses II or Merneptah? Do scientists agree?',
      simpleQuestion: 'Do historians agree which exact mummy in Cairo is the Pharaoh of Moses?',
      answer:
        'Honesty matters here! Archaeologists and historians still debate the exact identity of the Exodus Pharaoh (with Ramesses II, his son Merneptah, and earlier 18th-Dynasty rulers like Thutmose III all proposed), and no mummy carries an inscription saying "I chased Moses." What IS undeniable is that the royal New Kingdom Pharaoh mummies were hidden in sealed caches (Deir el-Bahari 1881, KV35 1898) completely unknown in the 7th century, and today lie preserved on public display in Cairo exactly as Surah 10:92 foretold.',
      simpleAnswer:
        'Scholars still debate which specific mummy was Moses’s Pharaoh (Ramesses II and Merneptah are the most discussed), and being honest about that matters. What stands out is that New Kingdom royal mummies were completely lost underground in the 600s and were only rediscovered in 1881 and 1898—standing preserved today just as 10:92 promised.',
      keywords: ['ramesses', 'merneptah', 'which pharaoh', 'bucaille', 'cairo', 'mummy', 'agree'],
      followUpIds: ['m-pha-q3', 'm-pha-q4'],
    },
    {
      id: 'm-pha-q3',
      category: 'evidence',
      question: 'What did French surgeon Maurice Bucaille find when examining the mummy of Merneptah in Paris?',
      simpleQuestion: 'What happened when Dr. Maurice Bucaille examined the royal mummy in the 1970s?',
      answer:
        'In 1975–1976, Dr. Maurice Bucaille examined royal mummies in Cairo and Paris (including Ramesses II and Merneptah) and noted remarkable preservation alongside bone trauma and salt residues consistent with rapid post-mortem embalming. While forensic scholars caution that natron embalming salts alone can leave salt crystals, the rediscovery of intact New Kingdom Pharaohs in the modern era deeply resonated with Surah 10:92.',
      simpleAnswer:
        'Dr. Maurice Bucaille studied the royal mummies in the 1970s and was struck by how intact they remained—drawing worldwide attention to Surah 10:92. Even setting aside debates over salt crystals (since embalming uses natron salt), the sheer preservation of New Kingdom Pharaohs for modern eyes is extraordinary.',
      keywords: ['bucaille', 'paris', 'salt', 'natron', 'forensic', 'drowning', 'examined'],
      followUpIds: ['m-pha-q2', 'm-pha-q4'],
    },
    {
      id: 'm-pha-q4',
      category: 'deep',
      question: 'How did classical scholars understand "We will save you in your body" (10:92) before mummies were unearthed?',
      simpleQuestion: 'What did early Muslim scholars think 10:92 meant before 1881?',
      answer:
        'Ibn Abbas and classical exegetes reported that the Israelites could scarcely believe the terrifying tyrant Pharaoh had truly died, so Allah cast his lifeless body onto an elevated bank in full armor so they could see with their own eyes that he was merely a mortal man—and "for those who come after you" spoke to all later generations learning of his humbling end, fulfilled even more vividly when Egypt’s royal mummies re-emerged in modern times.',
      simpleAnswer:
        'Early scholars explained that God washed Pharaoh’s body ashore so the freed Israelites could see with their own eyes that the tyrant was mortal and gone—and the rediscovery of royal mummies centuries later gave "a sign for those after you" an astonishing visual layer.',
      keywords: ['classical', 'ibn abbas', 'tafsir', 'washed ashore', 'early scholars', '10:92'],
      followUpIds: ['m-pha-q1', 'm-pha-q5'],
    },
    {
      id: 'm-pha-q5',
      category: 'deep',
      question: 'Why did Pharaoh’s last-second declaration of faith (10:90) not get accepted?',
      simpleQuestion: 'Why didn’t God accept Pharaoh’s repentance right as he was drowning?',
      answer:
        'In Islam, Allah accepts repentance throughout life up until the soul reaches the throat at death’s certainty (4:18), when the unseen becomes visible and the test ends. Pharaoh only cried out when the waves were already closing over him after decades of cruelty, arrogance, and murdering innocent children—not out of sincere transformation.',
      simpleAnswer:
        'God’s door of mercy stays open all through life—right up until death visibly arrives and the test is over. Pharaoh rejected every sign and only shouted out in panic as the water literally closed over his head.',
      keywords: ['repentance', '10:90', 'drowning', 'faith', 'why rejected', 'mercy'],
      followUpIds: ['m-pha-q4', 'm-pha-q6'],
    },
    {
      id: 'm-pha-q6',
      category: 'practice',
      question: 'What timeless warning does Pharaoh’s preserved body carry for humanity?',
      simpleQuestion: 'What lesson does Pharaoh’s end teach us today?',
      answer:
        'The man who boasted "I am your highest lord!" (79:24) ended as a silent, frail shell behind glass—a sobering mirror reminding every generation that arrogance, wealth, and power fade overnight, while humility and justice endure.',
      simpleAnswer:
        'The ruler who called himself a god ended as a silent reminder that arrogance and power always fade—only humility, truth, and mercy last.',
      keywords: ['arrogance', 'warning', 'humility', 'power', 'takeaway', 'practice'],
      followUpIds: ['m-pha-q1', 'm-pha-q5'],
    },
  ],

  'm-makkah-victory-prophecy': [
    {
      id: 'm-mak-q1',
      category: 'objection',
      question: 'Couldn’t predicting entry into Makkah just be a self-fulfilling prophecy—since Muslims themselves marched there?',
      simpleQuestion: 'Isn’t predicting you will enter Makkah just a self-fulfilling plan?',
      answer:
        'Look closely at the exact details predicted in 48:27 when Muslims had just been humiliatingly turned back at Hudaybiyyah (628 CE) and outnumbered by hostile Quraysh: the verse did NOT merely predict "we will fight our way in"—it specifically promised they would enter the Sacred Mosque **in complete safety (aminin)**, **without fear (la takhafun)**, shaving and trimming their hair in peaceful pilgrimage! Nobody could force an entire hostile city to surrender almost bloodlessly two years later—yet both the peaceful Umrah of 629 CE and the bloodless Opening of Makkah in 630 CE fulfilled every syllable.',
      simpleAnswer:
        'No—anyone can try to invade a city, but you cannot guarantee entering your enemies’ stronghold **in total safety, without fear**, peacefully completing pilgrimage rites—especially right after being blocked and turned away! Yet within 1–2 years, Muslims walked into Makkah peacefully and safely, exactly as 48:27 promised.',
      keywords: ['self-fulfilling', 'plan', 'marched', 'hudaybiyyah', 'safety', 'peaceful', 'aminin'],
      followUpIds: ['m-mak-q2', 'm-mak-q3'],
    },
    {
      id: 'm-mak-q2',
      category: 'evidence',
      question: 'Why did the Companions feel devastated at the Treaty of Hudaybiyyah before Surah Al-Fath was revealed?',
      simpleQuestion: 'Why were the Companions upset at Hudaybiyyah when the verse called it a "clear victory"?',
      answer:
        'In 628 CE, 1,400 unarmed pilgrims traveled to Makkah after the Prophet’s ﷺ dream of performing Umrah—only to be blocked by Quraysh and forced to sign a seemingly lopsided truce turning them home empty-handed. Even Umar ibn al-Khattab asked in anguish, "Aren’t we upon the truth?" On the journey home, Surah Al-Fath ("The Victory") descended—calling that apparent setback a "manifest victory" and assuring them they would soon enter Makkah safely.',
      simpleAnswer:
        'The Muslims traveled peacefully for pilgrimage only to be turned back and sign what looked like a painful compromise. Even Umar felt heartbroken—until Surah Al-Fath arrived on the ride home calling it a "clear victory" and promising safe entry soon.',
      keywords: ['hudaybiyyah', 'umar', 'treaty', 'devastated', 'setback', 'clear victory', '628'],
      followUpIds: ['m-mak-q3', 'm-mak-q4'],
    },
    {
      id: 'm-mak-q3',
      category: 'evidence',
      question: 'How did the Treaty of Hudaybiyyah turn into Islam’s greatest turning point?',
      simpleQuestion: 'Why did that truce turn out to be a victory after all?',
      answer:
        'The ten-year peace treaty ended armed fear and let Arabs travel freely, converse with Muslims, and hear the Qur’an openly for the first time. In the two peaceful years following Hudaybiyyah, more people freely embraced Islam than in all nineteen previous years combined—making the near-bloodless entry into Makkah in 630 CE unstoppable.',
      simpleAnswer:
        'Peace let people finally meet Muslims and hear the Qur’an without war getting in the way. In just two years of peace, more people freely embraced Islam than in the previous 19 years combined!',
      keywords: ['peace', 'turning point', 'growth', 'two years', '630', 'bloodless', 'opening'],
      followUpIds: ['m-mak-q4', 'm-mak-q5'],
    },
    {
      id: 'm-mak-q4',
      category: 'deep',
      question: 'Why does 48:27 mention both "heads shaved" (muhalliqin) and "hair shortened" (muqassirin)?',
      simpleQuestion: 'Why did the verse include tiny pilgrimage details like shaving and trimming hair?',
      answer:
        'Shaving or trimming the hair is the closing ritual of Umrah/Hajj—only possible when pilgrims complete Tawaf and Sa‘i in complete peace and security. Mentioning both groups ("some with heads shaved and some shortened") paints an eyewitness snapshot of an actual tranquil pilgrimage occurring one year later (Umrat al-Qada, 629 CE).',
      simpleAnswer:
        'Shaving or trimming hair is how you peacefully finish pilgrimage—something you can only do safely if nobody is attacking you. It painted a vivid, calm snapshot that came true the very next year.',
      keywords: ['shaved', 'hair', 'shortened', 'umrah', 'pilgrimage', '629', 'ritual'],
      followUpIds: ['m-mak-q1', 'm-mak-q5'],
    },
    {
      id: 'm-mak-q5',
      category: 'deep',
      question: 'How did the Prophet ﷺ treat his former persecutors when he finally entered Makkah?',
      simpleQuestion: 'What did the Prophet ﷺ do to the people of Makkah who had persecuted him for 20 years?',
      answer:
        'Instead of vengeance, he entered Makkah with his head bowed so low in humility that his beard nearly touched his saddle, and declared general amnesty to the city that had tortured his companions and driven him out: "Go, for you are free!"—echoing Prophet Joseph’s forgiveness of his brothers (12:92).',
      simpleAnswer:
        'He bowed his head low in humility and forgave almost everyone who had persecuted him for 20 years, saying: "Go, for you are free!" It remains one of the most merciful entries into a city in human history.',
      keywords: ['forgiveness', 'amnesty', 'mercy', 'entry', 'conquest', 'persecutors', 'humility'],
      followUpIds: ['m-mak-q2', 'm-mak-q6'],
    },
    {
      id: 'm-mak-q6',
      category: 'practice',
      question: 'What does Hudaybiyyah teach me when a door closes in my own life?',
      simpleQuestion: 'What personal lesson does Hudaybiyyah offer when my plans fall apart?',
      answer:
        'What feels like a humiliating detour today may be the exact quiet doorway Allah is using to bring a far greater, cleaner victory tomorrow. Hold steady with patience and integrity even when you cannot yet see the map.',
      simpleAnswer:
        'Sometimes a painful "not yet" is actually God setting up a much bigger, calmer breakthrough right around the corner.',
      keywords: ['closed door', 'detour', 'plans', 'patience', 'takeaway', 'practice'],
      followUpIds: ['m-mak-q2', 'm-mak-q5'],
    },
  ],

  'm-ayat-al-kursi-ring': [
    {
      id: 'm-kur-q1',
      category: 'objection',
      question: 'Couldn’t a smart human poet have planned a ring structure (chiasmus) on paper?',
      simpleQuestion: 'Couldn’t a talented writer have designed a mirror structure on purpose?',
      answer:
        'Writing a short symmetric poem on paper with drafts and erasers is possible—what makes the Qur’an’s ring structures (studied by scholars like Raymond Farrin and Michel Cuypers) extraordinary is scale and delivery: the Qur’an was delivered **orally, spontaneously, without a single draft or revision** across 23 years—yet not only does Ayat al-Kursi form a flawless 9-sentence mirror (A–B–C–D–E–D′–C′–B′–A′), the ENTIRE 286-verse Surah Al-Baqarah forms a macro-ring whose exact thematic centerpiece is none other than Ayat al-Kursi and the Middle Nation!',
      simpleAnswer:
        'Drafting a small mirror poem on paper with edits is one thing. Delivering a 286-verse chapter out loud over years with ZERO drafts or edits—where both individual verses like Ayat al-Kursi AND the entire massive chapter form interlocking mirror rings—is astonishing.',
      keywords: ['human poet', 'on paper', 'chiasmus', 'draft', 'oral', 'baqarah', 'farrin', 'cuypers'],
      followUpIds: ['m-kur-q2', 'm-kur-q3'],
    },
    {
      id: 'm-kur-q2',
      category: 'evidence',
      question: 'How do the 9 parts of Ayat al-Kursi actually mirror each other?',
      simpleQuestion: 'Can you walk me through the mirror pairs inside Ayat al-Kursi?',
      answer:
        'Look at the breathtaking symmetry from outside in: (A) Allah’s incomparable Names Al-Hayy Al-Qayyum ↔ (A′) Al-Aliyy Al-Azim; (B) Neither drowsiness nor sleep overtakes Him ↔ (B′) Guarding them never tires Him; (C) To Him belongs all in heavens and earth ↔ (C′) His Kursi extends over heavens and earth; (D) Who can intercede except by His leave? ↔ (D′) They encompass nothing of His knowledge except what He wills; anchoring the exact Center (E): "He knows what is before them and what is behind them."',
      simpleAnswer:
        'From outer edges to the center: (1) Great Names at start & end, (2) Never sleeps ↔ Never tires, (3) Owns heavens & earth ↔ His Throne spans heavens & earth, (4) Only by His leave ↔ Only what He wills—all pointing to the exact center: "He knows what is before them and behind them."',
      keywords: ['9 parts', 'pairs', 'mirror', 'walk through', 'center', 'structure', 'abcde'],
      followUpIds: ['m-kur-q3', 'm-kur-q4'],
    },
    {
      id: 'm-kur-q3',
      category: 'objection',
      question: 'Isn’t finding ring structures just subjective pattern-hunting?',
      simpleQuestion: 'Are scholars just imagining these mirror patterns?',
      answer:
        'In Ayat al-Kursi, the parallels are not vague impressions—they use explicit lexical pairs and syntactic mirrors ("heavens and earth" in sentences 3 and 7; negation of fatigue/sleep in sentences 2 and 8; exception clauses "except by His permission / except what He wills" in sentences 4 and 6; paired Divine Names in sentences 1 and 9). Even non-Muslim literary scholars recognize Semitic ring composition in the Qur’an as an objective textual architecture.',
      simpleAnswer:
        'No—look at the exact matching words: "heavens and earth" appears in lines 3 and 7; "never sleeps / never tires" in lines 2 and 8; "except by His leave / except what He wills" in lines 4 and 6; and paired Divine Names at lines 1 and 9. The symmetry is objectively right in the text.',
      keywords: ['subjective', 'imagining', 'pattern hunting', 'objective', 'lexical', 'non-muslim'],
      followUpIds: ['m-kur-q1', 'm-kur-q4'],
    },
    {
      id: 'm-kur-q4',
      category: 'deep',
      question: 'Why is "He knows what is before them and behind them" placed at the exact center?',
      simpleQuestion: 'Why is God’s total knowledge placed right in the bullseye of Ayat al-Kursi?',
      answer:
        'In classical Semitic ring composition, the author places the single most crucial pivot in the dead center—not the end. Placing "He knows what is before them (their future) and what is behind them (their past)" at the exact heart of the greatest verse in the Qur’an grounds human serenity: nothing in your past regret or future anxiety is outside Allah’s loving awareness.',
      simpleAnswer:
        'In mirror composition, the center is the bullseye message. Putting "He knows what is before them and behind them" right at the heart reminds you that both your past and your future rest safely inside Allah’s complete knowledge.',
      keywords: ['center', 'bullseye', 'before them', 'behind them', 'past', 'future', 'pivot'],
      followUpIds: ['m-kur-q2', 'm-kur-q5'],
    },
    {
      id: 'm-kur-q5',
      category: 'deep',
      question: 'What does "Al-Kursi" (His Footstool/Seat of Dominion) mean—is it a physical chair?',
      simpleQuestion: 'What does "Kursi" mean in Ayat al-Kursi?',
      answer:
        'Classical scholars clarify that nothing in Allah’s attributes resembles created furniture ("There is nothing like unto Him," 42:11). Ibn Abbas explained Al-Kursi as the locus of His majesty and sovereignty (with another classical report describing it as His encompassing knowledge/dominion), vastly greater than the entire created cosmos—pointing to His incomparable greatness.',
      simpleAnswer:
        'It is not a human chair—nothing created resembles Allah. Kursi expresses His vast, effortless sovereignty and majesty spanning the entire universe.',
      keywords: ['kursi', 'throne', 'chair', 'meaning', 'ibn abbas', 'dominion'],
      followUpIds: ['m-kur-q4', 'm-kur-q6'],
    },
    {
      id: 'm-kur-q6',
      category: 'practice',
      question: 'Why is Ayat al-Kursi recommended after every prayer and before sleep?',
      simpleQuestion: 'Why do Muslims recite Ayat al-Kursi before bed and after every prayer?',
      answer:
        'Because it concentrates pure Tawhid and Divine guardianship into one breathtaking breath: knowing the Living Sustainer never sleeps or grows weary watching over you turns nighttime fear and daytime stress into quiet security.',
      simpleAnswer:
        'Reciting it reminds your heart that the Living Creator never sleeps and never gets tired watching over you—bringing deep peace before sleep and after every prayer.',
      keywords: ['sleep', 'prayer', 'protection', 'sunnah', 'practice', 'recite'],
      followUpIds: ['m-kur-q2', 'm-kur-q4'],
    },
  ],

  'm-cosmic-smoke-separation': [
    {
      id: 'm-cos-q1',
      category: 'objection',
      question: 'Didn’t ancient Sumerian and Egyptian myths also talk about separating sky and earth?',
      simpleQuestion: 'Didn’t ancient myths also say heaven and earth were separated at the start?',
      answer:
        'Ancient Near Eastern myths told violent pagan tales—like the god Marduk slicing a slain sea-monster’s corpse in half to make sky and earth, or Egyptian gods physically pushing Shu between Geb and Nut. The Qur’an contains ZERO mythological monsters, gods fighting, or cosmic eggs—instead it combines three remarkably sober physical realities: (1) an initial stitched unity ("ratq") cleanly split open ("fatq") by the One Creator (21:30), (2) a hot, opaque primordial "smoke" ("dukhan", 41:11), and (3) ongoing spatial expansion (51:47).',
      simpleAnswer:
        'Ancient myths told wild stories about gods slaying giant monsters and splitting their bodies into sky and ground. The Qur’an strips away all myth and pairs three calm, striking descriptions: a unified origin split open (21:30), a hot primordial smoke (41:11), and an expanding cosmos (51:47).',
      keywords: ['sumerian', 'myth', 'marduk', 'egyptian', 'borrowed', 'pagan', 'ratq', 'fatq'],
      followUpIds: ['m-cos-q2', 'm-cos-q3'],
    },
    {
      id: 'm-cos-q2',
      category: 'evidence',
      question: 'Why do astrophysicists consider "smoke" (dukhan) much more accurate than "cold gas" for the early universe?',
      simpleQuestion: 'Why is "smoke" (dukhan) a better description of the early universe than ordinary gas?',
      answer:
        'In the first ~380,000 years after the Big Bang, the universe was NOT cold transparent gas—it was a scorching, opaque, glowing soup of hot plasma (protons, electrons, and photons scattering constantly), and later dense hot dust-and-gas nebulae where stars condensed. In everyday vocabulary, "smoke" (dukhan)—hot, suspended, opaque particulate vapor—captures that dense primordial state far more accurately than thin invisible air.',
      simpleAnswer:
        'The early universe wasn’t thin, clear air—it was a scorching, thick, opaque cloud of hot plasma and dense star-forming dust. "Smoke" (hot and opaque) fits that real early cosmic state far better than cold gas.',
      keywords: ['dukhan', 'smoke', 'plasma', 'gas', 'big bang', '380000', 'nebula', 'hot'],
      followUpIds: ['m-cos-q3', 'm-cos-q4'],
    },
    {
      id: 'm-cos-q3',
      category: 'objection',
      question: 'Wait—doesn’t Surah Fussilat 41:9–12 say Earth was created BEFORE the heavens, contradicting the Big Bang?',
      simpleQuestion: 'Does Surah Fussilat say Earth existed before the stars and sky?',
      answer:
        'Look closely at the Arabic connector "thumma" in 41:11 ("thumma istawa ilas-sama’i wa hiya dukhan" — "Moreover/Then He turned to the heaven WHILE IT WAS SMOKE"). Notice the verse itself says the sky ALREADY existed as smoke ("wa hiya dukhan")! Classical Arabic grammarians and commentators (like Al-Tabari and Ibn Kathir) noted that "thumma" frequently introduces a shift in narrative topic ("furthermore / moreover") rather than strict chronological delay, and 79:27–30 explicitly places the spreading out of Earth’s crust/waters AFTER the raising of the heavens.',
      simpleAnswer:
        'Look at the exact words of 41:11: "He turned to the sky WHILE IT WAS ALREADY SMOKE"—showing the cosmic smoke was already there! In Arabic, "thumma" often means "moreover/furthermore" to shift focus, and Surah 79:27–30 explicitly puts shaping Earth’s surface AFTER raising the heavens.',
      keywords: ['41:9', '41:11', 'order', 'earth before stars', 'thumma', 'contradiction', 'fussilat', '79:30'],
      followUpIds: ['m-cos-q2', 'm-cos-q4'],
    },
    {
      id: 'm-cos-q4',
      category: 'deep',
      question: 'What do the exact Arabic words "ratq" and "fatq" mean in 21:30?',
      simpleQuestion: 'What do "ratq" and "fatq" literally mean in Arabic?',
      answer:
        '"Ratq" means sewn together, fused into one seamless, closed mass; "fatq" means unstitching, splitting apart, and opening out. In Surah 21:30 ("The heavens and the earth were one joined entity [ratqan], and We split them apart [fataqnahuma]"), the imagery harmonizes both classical understandings (rain breaking from sealed sky and vegetation from sealed earth) and the modern Big Bang cosmic origin.',
      simpleAnswer:
        '"Ratq" means fused tightly together as one seamless mass, and "fatq" means splitting and opening it apart—matching the unified beginning of the cosmos before expansion separated matter into galaxies, stars, and planets.',
      keywords: ['ratq', 'fatq', 'arabic', 'meaning', '21:30', 'joined', 'split'],
      followUpIds: ['m-cos-q1', 'm-cos-q5'],
    },
    {
      id: 'm-cos-q5',
      category: 'deep',
      question: 'Why does 41:11 say the heavens and earth replied "We have come willingly"?',
      simpleQuestion: 'Why does the Qur’an say the sky and earth obeyed God "willingly"?',
      answer:
        'It portrays the entire physical cosmos obeying Allah’s laws of physics effortlessly without resistance—contrasting cosmic submission with human free will, inviting us to choose willingly what every star and atom already embodies.',
      simpleAnswer:
        'Every star, gravity wave, and atom obeys God’s laws smoothly without fighting. The verse gently invites humans—who have free choice—to align with their Creator willingly too.',
      keywords: ['willingly', 'obey', '41:11', 'submission', 'islam', 'laws'],
      followUpIds: ['m-cos-q3', 'm-cos-q6'],
    },
    {
      id: 'm-cos-q6',
      category: 'practice',
      question: 'How does knowing the universe began from one unified origin deepen faith?',
      simpleQuestion: 'What does the shared origin of everything teach my heart?',
      answer:
        'Every atom in your body and every distant star came from the same opening command of One Creator. Creation is not a random battlefield of competing gods—it is one unified home fashioned by Al-Khaliq.',
      simpleAnswer:
        'Stars, oceans, and your own body all trace back to one single creative command from One Creator—reminding us we belong in this universe, never stranded by accident.',
      keywords: ['unity', 'belong', 'origin', 'takeaway', 'practice', 'heart'],
      followUpIds: ['m-cos-q2', 'm-cos-q4'],
    },
  ],

  'm-lexical-symmetry': [
    {
      id: 'm-lex-q1',
      category: 'objection',
      question: 'Are word-count pairs like Dunya (115) and Akhirah (115) really exact, or do they depend on how you count?',
      simpleQuestion: 'Are those equal word counts in the Qur’an actually true, or are they cherry-picked?',
      answer:
        'Transparency is essential here! Some popular internet lists DO fail strict verification (for instance, "month=12" works only for singular shahr, and "day=365" requires specific grammatical exclusions). However, several core thematic pairs—most famously **Al-Dunya (this world) and Al-Akhirah (the Hereafter) at 115 each**, and **Mala’ikah (angels) and Shayatin (devils) at 88 each**—hold up cleanly under standard morphological counting of the Arabic root forms!',
      simpleAnswer:
        'Great question—and honesty matters! Some viral internet word-count claims don’t hold up strictly, so we shouldn’t blindly repeat every list. Yet well-verified pairs like **Dunya (this life) and Akhirah (the Next Life) at 115 times each**, and **Angels and Devils at 88 times each**, really do match cleanly in Arabic.',
      keywords: ['true', 'exact', 'cherry-picked', '365', 'days', '115', '88', 'verify', 'fake'],
      followUpIds: ['m-lex-q2', 'm-lex-q3'],
    },
    {
      id: 'm-lex-q2',
      category: 'evidence',
      question: 'How hard would it be for an unlettered oral speaker to keep Dunya and Akhirah balanced at 115 each?',
      simpleQuestion: 'Could a human speaking out loud over 23 years keep track of exact word counts?',
      answer:
        'Remember how the Qur’an was revealed: piecemeal over 23 years in response to unpredictable real-life events, recited aloud without spreadsheets, word-processors, or editing earlier surahs. Tracking exact tallies of opposite theological terms scattered across 114 chapters while composing unmatched Arabic rhetoric spontaneously would be humanly unthinkable.',
      simpleAnswer:
        'Without a computer or even revising earlier chapters, keeping exact balanced counts of paired concepts spoken out loud across 23 years of real-life events would be virtually impossible for a human speaker.',
      keywords: ['23 years', 'oral', 'humanly impossible', 'track', 'spreadsheet', 'unlettered'],
      followUpIds: ['m-lex-q3', 'm-lex-q4'],
    },
    {
      id: 'm-lex-q3',
      category: 'deep',
      question: 'Beyond word counts, what is the deeper "thematic symmetry" (Mathani) of the Qur’an?',
      simpleQuestion: 'What does the Qur’an mean by calling itself "Mathani" (paired)?',
      answer:
        'Surah Az-Zumar 39:23 calls the Qur’an "Kitaban mutashabihan mathani" — a harmonious book of paired realities. Wherever the Qur’an speaks of awe-inspiring justice, it pairs it with overflowing mercy; whenever it describes Paradise, it contrasts warning; whenever it mentions worldly struggle, it balances it with eternal hope. That living emotional and moral equilibrium is the deepest symmetry of all.',
      simpleAnswer:
        'The Qur’an calls itself "paired" (Mathani): it always balances hope with responsibility, mercy with justice, and this life with the Next—keeping the human heart steady instead of extreme.',
      keywords: ['mathani', '39:23', 'paired', 'balance', 'mercy', 'justice', 'theme'],
      followUpIds: ['m-lex-q4', 'm-lex-q5'],
    },
    {
      id: 'm-lex-q4',
      category: 'objection',
      question: 'Should we reject Islam if one popular word-count claim turns out to be inaccurate?',
      simpleQuestion: 'What if someone shows a viral Qur’an word-count meme was miscounted?',
      answer:
        'Never! A viral graphic made by an over-enthusiastic blogger is a human mistake, not a mistake in the Qur’an—the Qur’an never claimed "count the word day 365 times." Always test viral claims with rigor and anchor certainty in the Qur’an’s verified text, preservation, logic, and guidance.',
      simpleAnswer:
        'Not at all—a blogger miscounting a word is a human error, not an error in the Qur’an. Always verify claims carefully and rest your faith on the Qur’an’s clear message and proven foundations.',
      keywords: ['meme', 'miscounted', 'blogger', 'error', 'viral', 'verify'],
      followUpIds: ['m-lex-q1', 'm-lex-q3'],
    },
    {
      id: 'm-lex-q5',
      category: 'evidence',
      question: 'What other well-known structural pairings appear across the Qur’an?',
      simpleQuestion: 'What other balanced pairs show up across the Qur’an?',
      answer:
        'Scholars also note paired surah twins (like Al-Falaq & An-Nas, Ad-Duha & Ash-Sharh, Al-Baqarah & Aal ‘Imran) whose themes mirror and complete each other, as well as repeated lexical pairings such as Al-Hayah (life) and Al-Mawt (death) balancing one another across revelation.',
      simpleAnswer:
        'Entire chapters come in matching twins—like Ad-Duha and Ash-Sharh, or Al-Falaq and An-Nas—and life and death, hope and awe, balance each other across the whole book.',
      keywords: ['twins', 'surah pairs', 'life', 'death', 'duha', 'sharh', 'examples'],
      followUpIds: ['m-lex-q3', 'm-lex-q6'],
    },
    {
      id: 'm-lex-q6',
      category: 'practice',
      question: 'What practical lesson does Dunya (115) = Akhirah (115) teach us?',
      simpleQuestion: 'What life lesson comes from "this world" and "the Next Life" being balanced equally?',
      answer:
        'Islam neither tells you to abandon this world in despair nor to drown in it forgetting eternity. Just as Dunya and Akhirah sit in perfect equilibrium, a healthy believer builds a good, generous life here while aiming the heart’s compass toward eternity.',
      simpleAnswer:
        'It reminds us of balance: don’t neglect your responsibilities in this world, and don’t lose your soul chasing it either. Care for both in harmony.',
      keywords: ['dunya', 'akhirah', 'balance', 'life', 'practice', 'takeaway'],
      followUpIds: ['m-lex-q1', 'm-lex-q3'],
    },
  ],

  'm-altitude-breathing': [
    {
      id: 'm-alt-q1',
      category: 'objection',
      question: 'Couldn’t people in Arabia simply climb high mountains and feel out of breath?',
      simpleQuestion: 'Didn’t ancient people already know climbing mountains makes you breathe hard?',
      answer:
        'Two key nuances make Surah Al-An‘am 6:125 extraordinary: (1) climbing a steep mountain makes you pant from physical muscular exertion—just like sprinting uphill—whereas the verse does NOT say "as if climbing a mountain"; it says "as though he were **ascending into the sky** (yassa‘‘adu fis-sama’)"—where atmospheric oxygen pressure drops steadily the higher you rise even if sitting effortlessly inside a hot-air balloon or unpressurized aircraft! (2) Mecca and Medina sit near low elevations (~277m–620m), nowhere near hypoxic alpine peaks above 3,000–5,000 meters.',
      simpleAnswer:
        'Running uphill anywhere makes you pant from tired legs. Notice this verse doesn’t say "climbing a mountain"—it specifically says "ascending into the sky," where thinning air tightens your chest (hypoxia) even if you aren’t exercising at all, something people in low-lying Mecca and Medina never experienced.',
      keywords: ['mountains', 'climbing', 'out of breath', 'obvious', 'mecca', 'exertion', 'balloon'],
      followUpIds: ['m-alt-q2', 'm-alt-q3'],
    },
    {
      id: 'm-alt-q2',
      category: 'evidence',
      question: 'What actually happens inside the human chest as you ascend high into the sky?',
      simpleQuestion: 'What does aviation medicine say happens to breathing high in the sky?',
      answer:
        'As altitude increases, barometric air pressure drops exponentially, reducing the partial pressure of oxygen entering the lungs (hypobaric hypoxia). Above ~3,000–4,500 meters, the chest feels noticeably tight and constricted ("dayyiqan harajan"), breathing becomes labored, and aircraft cabins must be artificially pressurized above ~10,000 feet—a physiological reality only discovered after the first high-altitude balloon ascents in the late 18th and 19th centuries.',
      simpleAnswer:
        'As you rise into the sky, air pressure drops and every breath carries far less oxygen (hypoxia). Your chest feels tight and squeezed—which is why modern airplanes must pressurize their cabins, something humans only learned centuries later with hot-air balloons and flight.',
      keywords: ['hypoxia', 'air pressure', 'oxygen', 'aviation', 'altitude', 'chest', 'tight', 'pressurized'],
      followUpIds: ['m-alt-q3', 'm-alt-q4'],
    },
    {
      id: 'm-alt-q3',
      category: 'deep',
      question: 'What is the acoustic/phonetic miracle inside the single Arabic word "yassa‘‘adu" (يَصَّعَّدُ)?',
      simpleQuestion: 'Why does the Arabic word "yassa‘‘adu" actually SOUND like gasping for air?',
      answer:
        'Notice the rare Form V assimilated verb "yassa‘‘adu" (originally yatasaa‘‘adu): it stacks a heavy doubled emphatic "sad" (صّ) directly against a deep pharyngeal doubled "‘ayn" (عّ) in the throat! Simply pronouncing "yassa‘‘adu" aloud physically tightens the vocal tract and forces breath upward—mimicking the exact strained chest constriction the verse is describing (known in rhetoric as phonetic onomatopoeia / taswir sawti).',
      simpleAnswer:
        'Try saying "yas-sa‘-‘a-du" aloud: those two doubled deep throat letters physically squeeze your throat and breath right as you say the word! The sound of the word literally lets you feel the tight chest it describes.',
      keywords: ['yassaadu', 'phonetic', 'sound', 'pronounce', 'arabic', 'throat', 'rhetoric'],
      followUpIds: ['m-alt-q2', 'm-alt-q4'],
    },
    {
      id: 'm-alt-q4',
      category: 'deep',
      question: 'How did classical commentators explain 6:125 before airplanes or balloons existed?',
      simpleQuestion: 'What did early scholars think "ascending into the sky" meant before flight?',
      answer:
        'Before humans could fly, classical scholars understood ascending into the sky as a metaphor for attempting something humanly impossible and overwhelmingly strained—so tight is a stubborn heart resisting guidance. Modern aviation physiology revealed that the metaphor is ALSO literally true physically!',
      simpleAnswer:
        'Before airplanes existed, early scholars read it as a vivid image of trying to do something impossibly straining. Then modern flight revealed that rising into the sky literally tightens the human chest just as described.',
      keywords: ['classical', 'tafsir', 'before flight', 'impossible', 'metaphor', 'early scholars'],
      followUpIds: ['m-alt-q1', 'm-alt-q5'],
    },
    {
      id: 'm-alt-q5',
      category: 'deep',
      question: 'What is the beautiful contrast in the first half of Surah Al-An‘am 6:125?',
      simpleQuestion: 'What does the first half of the verse say about a guided heart?',
      answer:
        'The verse opens with breathtaking warmth: "Whomever Allah wills to guide, He expands his chest (yashrah sadrahu) for Islam"—contrasting the spacious, effortless breathing of a heart surrendered to truth with the suffocating tightness of stubborn pride.',
      simpleAnswer:
        'The first half says God "expands the chest" of the guided heart—contrasting the spacious relief of sincere faith with the tight heaviness of stubbornness.',
      keywords: ['yashrah', 'expand', 'chest', 'guidance', 'contrast', '6:125'],
      followUpIds: ['m-alt-q3', 'm-alt-q6'],
    },
    {
      id: 'm-alt-q6',
      category: 'practice',
      question: 'What Qur’anic dua asks Allah to expand a tight chest?',
      simpleQuestion: 'Is there a prayer in the Qur’an when my chest feels tight or anxious?',
      answer:
        'Yes—Prophet Musa’s عليه السلام beloved supplication in Surah Ta-Ha 20:25–26: "Rabbish-rah li sadri, wa yassir li amri" ("My Lord, expand for me my chest, and ease for me my task"). Reciting it slowly with a deep breath aligns heart and body immediately.',
      simpleAnswer:
        'Yes! Prophet Moses’s prayer (20:25): "Rabbish-rah li sadri, wa yassir li amri" — "My Lord, open and expand my chest, and make my affair easy for me."',
      keywords: ['dua', 'anxious', 'musa', '20:25', 'expand chest', 'practice', 'tight'],
      followUpIds: ['m-alt-q5', 'm-alt-q3'],
    },
  ],

  'm-surah-alkawthar': [
    {
      id: 'm-kaw-q1',
      category: 'objection',
      question: 'It’s only three short verses (10 words)—why is Surah Al-Kawthar considered a miracle?',
      simpleQuestion: 'How can a tiny 10-word chapter be a miracle?',
      answer:
        'That brevity IS the heart of the miracle! In classical rhetoric, packing dozens of interlocking acoustic, structural, semantic, and historical layers into just 10 Arabic words without a single wasted syllable is exponentially harder than writing a long essay. Rhetoricians have documented over 25 distinct literary devices inside these three lines alone—plus a bold historical prophecy that came true spectacularly.',
      simpleAnswer:
        'Packing enormous beauty, layered meaning, and a bold historical prophecy into just 10 words—with zero wasted syllables—is far harder than writing a long book. Arabic linguists have counted over 25 literary masterpieces woven into those three tiny lines.',
      keywords: ['short', '10 words', 'three verses', 'why miracle', 'brevity', 'tiny'],
      followUpIds: ['m-kaw-q2', 'm-kaw-q3'],
    },
    {
      id: 'm-kaw-q2',
      category: 'evidence',
      question: 'What was the bold historical prophecy hidden inside the last verse ("Your enemy is the one cut off")?',
      simpleQuestion: 'What historical prediction came true in Surah Al-Kawthar?',
      answer:
        'When the Prophet’s ﷺ young sons passed away, wealthy Quraysh chief Al-‘As ibn Wa’il mocked him publicly as "abtar" (cut off, with no male heir to carry his legacy). At that lowest human moment—when the Prophet ﷺ was isolated and his mockers had huge clans and fortunes—Surah Al-Kawthar boldly reversed the verdict: YOU have been given Al-Kawthar (overflowing abundance), while YOUR MOCKER is the one who will be cut off! Fourteen centuries later, billions invoke blessings on Muhammad ﷺ every second around the globe, while almost nobody remembers his mocker’s name except as a footnote to this very verse.',
      simpleAnswer:
        'When the Prophet’s ﷺ baby sons died, a rich enemy mocked him as "cut off" with no legacy. At his loneliest moment, this verse flipped the script: YOU have endless abundance, and your enemy will be forgotten. Today billions bless Muhammad’s ﷺ name every second, while his mocker is forgotten.',
      keywords: ['abtar', 'cut off', 'prophecy', 'enemy', 'as ibn wail', 'legacy', 'history', 'sons'],
      followUpIds: ['m-kaw-q3', 'm-kaw-q4'],
    },
    {
      id: 'm-kaw-q3',
      category: 'deep',
      question: 'What makes the Arabic word choice ("a‘taynaka", "al-kawthar", "wanhar") rhetorically unmatched?',
      simpleQuestion: 'What are some of the hidden Arabic word gems inside Surah Al-Kawthar?',
      answer:
        'Notice just three gems: (1) It uses the royal plural "Inna" (Indeed, WE) and "a‘taynaka" (gifted permanently with full ownership, stronger than "ataynaka"); (2) "Al-Kawthar" is a hyper-intensive Arabic pattern (faw‘al) meaning overflowing, inexhaustible abundance—encompassing the river in Paradise, prophethood, the Qur’an, and a vast global Ummah; (3) every single verse ends in the crisp, decisive "-ar" consonant cadence (kawthar / wanhar / abtar), sealing the mocker’s taunt with sonic finality.',
      simpleAnswer:
        'Three gems: "a‘taynaka" means a permanent gift you can never lose; "Al-Kawthar" is an intensive Arabic form for overflowing, endless abundance; and all three lines end on a crisp "-ar" beat (kawthar / wanhar / abtar) that turns the enemy’s insult right back on him.',
      keywords: ['arabic', 'word choice', 'ataynaka', 'kawthar', 'wanhar', 'rhetoric', 'cadence', 'devices'],
      followUpIds: ['m-kaw-q4', 'm-kaw-q5'],
    },
    {
      id: 'm-kaw-q4',
      category: 'objection',
      question: 'Couldn’t a modern Arabic writer compose 10 rhyming words with nice meaning?',
      simpleQuestion: 'Couldn’t someone today easily write three short rhyming lines in Arabic?',
      answer:
        'Anyone can rhyme three short lines—and challengers from Musaylimah onward tried! Yet producing ten words that simultaneously invent an unprecedented acoustic rhythm, pack 25+ structural symmetries (even exact letter-frequency patterns noted by Arabic scholars), issue a verifiable historical reversal at an underdog’s darkest hour, and remain memorized and wept over by billions for 1,400 years has never been replicated once.',
      simpleAnswer:
        'Anyone can make three lines rhyme—many people tried and fell flat. Matching the Qur’an’s acoustic majesty, 25+ layered linguistic features, fulfilled historical reversal, and 1,400 years of living power in ten words has never been done once.',
      keywords: ['write three lines', 'rhyme', 'imitate', 'challenge', 'today', 'easy'],
      followUpIds: ['m-kaw-q1', 'm-kaw-q2'],
    },
    {
      id: 'm-kaw-q5',
      category: 'deep',
      question: 'Why does the middle verse pair Prayer ("fa-salli") with Sacrifice/Generosity ("wanhar")?',
      simpleQuestion: 'Why does the verse say "pray to your Lord and sacrifice"?',
      answer:
        'It unites the two wings of true gratitude: vertical devotion to Allah (Salah) and horizontal generosity feeding the poor (Nahr / sacrifice)—standing in direct contrast to Surah Al-Ma‘un right before it (107), which rebuked those who neglect prayer and refuse to feed the needy! Even adjacent chapters mirror each other.',
      simpleAnswer:
        'Gratitude has two wings: loving God in prayer, and sharing generously with people in need—directly answering the previous chapter (Surah Al-Ma‘un), which warned against hollow prayer and stinginess.',
      keywords: ['salli', 'wanhar', 'prayer', 'sacrifice', 'maun', '107', 'gratitude'],
      followUpIds: ['m-kaw-q3', 'm-kaw-q6'],
    },
    {
      id: 'm-kaw-q6',
      category: 'practice',
      question: 'How does Surah Al-Kawthar comfort someone who feels mocked, overlooked, or childless/alone?',
      simpleQuestion: 'What comfort does Surah Al-Kawthar bring when people look down on me?',
      answer:
        'Allah revealed Al-Kawthar to comfort a grieving father whose enemies called him a failure. Whenever people measure your worth by worldly status or mock your quiet faithfulness, remember Allah’s abundance is infinitely wider than human applause.',
      simpleAnswer:
        'God revealed this chapter to comfort a grieving heart being mocked by proud people. Never let other people’s insults define your future—Allah’s generosity always has the final word.',
      keywords: ['comfort', 'mocked', 'grief', 'alone', 'worth', 'practice', 'takeaway'],
      followUpIds: ['m-kaw-q2', 'm-kaw-q5'],
    },
  ],

  'm-sun-moon-light': [
    {
      id: 'm-sun-q1',
      category: 'objection',
      question: 'Doesn’t "Diya’" and "Nur" just mean bright light and softer light—why claim it means reflected moonlight?',
      simpleQuestion: 'Aren’t Diya and Nur just Arabic words for strong light and gentle light?',
      answer:
        'Look at ALL three verses together—10:5, 25:61, and 71:16! Even if someone wondered about 10:5 alone ("diya’" for radiant heat-producing light vs. "nur" for cool borrowed illumination), Surah Al-Furqan 25:61 and Surah Nuh 71:16 remove all ambiguity by calling the Sun **"siraj" / "sirajan wahhaja"** (a blazing fuel-burning lamp) while NEVER ONCE calling the Moon a lamp—instead calling the Moon **"munir"** (that which shines with reflected/received light). Classical Arabic lexicons (Al-Raghib al-Isfahani, 11th century) explicitly defined diya’ as intrinsic self-generated light and nur as softer or derived light!',
      simpleAnswer:
        'When you put verses 10:5, 25:61, and 71:16 side by side, the pattern is crystal clear: the Sun is always called a blazing, fuel-burning **lamp** (siraj) and radiant **diya’**, while the Moon is NEVER once called a lamp—only **nur** and **munir** (cool, illuminated light).',
      keywords: ['diya', 'nur', 'siraj', 'munir', 'arabic', 'soft light', 'bright', '25:61', '71:16'],
      followUpIds: ['m-sun-q2', 'm-sun-q3'],
    },
    {
      id: 'm-sun-q2',
      category: 'objection',
      question: 'Didn’t ancient Greek astronomers like Anaxagoras already know the Moon reflects sunlight?',
      simpleQuestion: 'Didn’t ancient Greeks already know moonlight comes from the Sun?',
      answer:
        'A few Greek thinkers (like Anaxagoras) proposed it, while many others—including mainstream popular folklore and Genesis 1:16 ("two great lights")—treated both sun and moon as two independent light sources, and Greek astronomical treatises were not translated into Arabic in 7th-century Mecca. What is remarkable is that the Qur’an NEVER once slips across 114 chapters: it consistently reserves "burning lamp" exclusively for the Sun and "illuminated light" exclusively for the Moon.',
      simpleAnswer:
        'A couple of Greek thinkers guessed it, but most ancient traditions (and everyday speech) just called them "two lights," and Greek astronomy wasn’t even available in Arabic in 7th-century Mecca. Yet the Qur’an stays 100% consistent across all 114 chapters without slipping once.',
      keywords: ['anaxagoras', 'greeks', 'ancient', 'genesis', 'two lights', 'already knew'],
      followUpIds: ['m-sun-q3', 'm-sun-q4'],
    },
    {
      id: 'm-sun-q3',
      category: 'evidence',
      question: 'Why is calling the Sun a "blazing fuel-burning lamp" (sirajan wahhaja, 78:13) so accurate astrophysically?',
      simpleQuestion: 'Why does "blazing lamp" match how the Sun actually works?',
      answer:
        'A lamp (siraj) generates both light AND intense heat by consuming internal fuel—unlike a cold mirror. Astrophysics confirmed our Sun is a nuclear fusion furnace consuming roughly 600 million tons of hydrogen every second to radiate intense light and heat, whereas the Moon is a cold, rocky sphere reflecting only ~7–12% of the sunlight striking its dust.',
      simpleAnswer:
        'A blazing lamp produces its own heat and light by burning fuel—just like the Sun’s nuclear furnace fusing hydrogen every second. Meanwhile, the Moon is cold rock simply reflecting sunlight back to Earth.',
      keywords: ['sirajan wahhaja', '78:13', 'fusion', 'fuel', 'hydrogen', 'lamp', 'albedo', 'science'],
      followUpIds: ['m-sun-q4', 'm-sun-q5'],
    },
    {
      id: 'm-sun-q4',
      category: 'objection',
      question: 'Wait—doesn’t the Qur’an call the Prophet ﷺ "sirajan munira" (33:46) and Allah "Nur" (24:35)? Doesn’t that break the distinction?',
      simpleQuestion: 'If "Nur" means reflected light, why is Allah called "Nur of the heavens and earth"?',
      answer:
        'Context governs every Arabic root! In Surah 24:35, "Nur" is Allah’s sublime spiritual Name (The Illuminator who brings all things into light and guidance), and in 33:46 the Prophet ﷺ is "a lamp giving illuminating guidance" (sirajan munira). The astronomical precision lies in how the Qur’an CONSISTENTLY pairs and contrasts the physical Sun vs. the physical Moon whenever mentioning them side by side (10:5, 25:61, 71:16)—never swapping their physical titles.',
      simpleAnswer:
        'In Arabic, words have both physical and spiritual meanings: spiritually, Allah is Al-Nur (The Illuminator of all existence). The scientific marvel is that whenever the Qur’an contrasts the physical Sun and Moon side by side (10:5, 25:61, 71:16), it ALWAYS calls the Sun the burning lamp and never once calls the Moon a lamp.',
      keywords: ['24:35', 'allah nur', '33:46', 'sirajan munira', 'contradiction', 'spiritual'],
      followUpIds: ['m-sun-q1', 'm-sun-q5'],
    },
    {
      id: 'm-sun-q5',
      category: 'deep',
      question: 'Why does 10:5 connect the Moon’s phases ("qaddarahu manazil") with timekeeping?',
      simpleQuestion: 'Why does the verse mention the Moon’s stations right after its light?',
      answer:
        'Because the Moon’s reflected sunlight changes cleanly across 29–30 nightly phases ("manazil"), giving every human community—without needing clocks or observatories—a natural, universal sky calendar for months, seasons, and worship.',
      simpleAnswer:
        'Because sunlight reflects off the Moon at changing angles each night, giving humanity a built-in sky calendar anyone on Earth can read just by looking up.',
      keywords: ['phases', 'manazil', 'calendar', 'hijri', 'timekeeping', '10:5'],
      followUpIds: ['m-sun-q3', 'm-sun-q6'],
    },
    {
      id: 'm-sun-q6',
      category: 'practice',
      question: 'What gentle metaphor does reflected moonlight offer for the human heart?',
      simpleQuestion: 'What personal takeaway does the Moon’s reflected light give us?',
      answer:
        'Like the Moon, we do not have to manufacture endless brilliance out of our own fragile energy—when our heart turns cleanly toward the Source of Light (Allah), we naturally reflect warmth, calm, and mercy into dark places.',
      simpleAnswer:
        'Just like the Moon shines simply by facing the Sun, our hearts bring calm and warmth to others when we stay turned toward Allah.',
      keywords: ['metaphor', 'reflect', 'heart', 'takeaway', 'practice', 'light'],
      followUpIds: ['m-sun-q1', 'm-sun-q4'],
    },
  ],

  'm-unmatched-rhythm': [
    {
      id: 'm-rhy-q1',
      category: 'objection',
      question: 'Isn’t the Qur’an just Arabic rhymed prose (Saj‘), which Arabian soothsayers already used?',
      simpleQuestion: 'Doesn’t the Qur’an just sound like ancient Arabian rhymed prose (Saj‘)?',
      answer:
        'No—and 7th-century Arabian masters themselves immediately knew the difference! Pre-Islamic soothsayer saj‘ relied on rigid, short, sing-song rhyming couplets that sacrificed meaning for sound. The Qur’an breaks free of both rigid poetic meters (all 16 classical Al-Khalil meters) AND predictable saj‘: its verse lengths breathe organically with meaning, shifting cadence seamlessly from thunderous Makkan warnings to serene Madinan legal counsel—creating a completely independent linguistic category Arabists still classify simply as "Qur’an."',
      simpleAnswer:
        'No—ancient rhymed prose (saj‘) sounded choppy and forced, twisting meaning just to force a rhyme. The Qur’an fits neither the 16 classical Arabic poetic meters nor old rhymed prose; its rhythm flows effortlessly with the meaning, which is why even hostile Arab poets admitted it belonged to no known human category.',
      keywords: ['saj', 'rhymed prose', 'soothsayers', 'kahin', 'meters', 'poetry', '16 meters'],
      followUpIds: ['m-rhy-q2', 'm-rhy-q3'],
    },
    {
      id: 'm-rhy-q2',
      category: 'evidence',
      question: 'What did hostile 7th-century Arab poets—like Al-Walid ibn al-Mughirah—say when they heard the Qur’an?',
      simpleQuestion: 'How did Mecca’s top enemy poets react when they first heard the Qur’an?',
      answer:
        'Al-Walid ibn al-Mughirah, Mecca’s foremost literary judge and a bitter opponent of Islam, listened carefully and confessed publicly: "By God, none among you knows poetry better than I—neither its rajaz, nor its qasidah, nor the songs of jinn—and by God, what he recites resembles none of them! It has a sweetness and a grace; its upper part is fruitful and its roots are rich; it towers above all speech and nothing towers above it."',
      simpleAnswer:
        'Mecca’s most famous enemy critic, Al-Walid ibn al-Mughirah, admitted out loud: "Nobody knows poetry better than I do, and this sounds like none of it—it has a sweetness and majesty that towers above all human speech."',
      keywords: ['walid', 'poets', 'mecca', 'hostile', 'reaction', 'sweetness', 'testimony'],
      followUpIds: ['m-rhy-q3', 'm-rhy-q4'],
    },
    {
      id: 'm-rhy-q3',
      category: 'evidence',
      question: 'Why is the Qur’an uniquely easy for millions of people—including non-Arab children—to memorize word for word?',
      simpleQuestion: 'Why can children who don’t even speak Arabic memorize the entire 600-page Qur’an?',
      answer:
        'That is a living miracle promised directly in Surah Al-Qamar 54:17 ("And We have certainly made the Qur’an easy for remembrance"). Its unique acoustic cadence, balanced clause endings (fawasil), internal sound echoes, and resonant rhythm align with human auditory memory in a way no other 600-page book on Earth matches—enabling millions of non-Arabs across every continent to memorize all 6,236 verses verbatim.',
      simpleAnswer:
        'Try finding even a handful of people who memorized a 600-page book in a foreign language! Yet millions—including young children who don’t speak Arabic—memorize all 6,236 verses of the Qur’an thanks to its astonishing built-in acoustic flow (54:17).',
      keywords: ['memorize', 'hifz', 'children', 'non-arab', '54:17', '6236', 'memory'],
      followUpIds: ['m-rhy-q4', 'm-rhy-q5'],
    },
    {
      id: 'm-rhy-q4',
      category: 'deep',
      question: 'Why does the Qur’an sound so different from the Prophet’s ﷺ own recorded sayings (Hadith)?',
      simpleQuestion: 'How do we know the Prophet ﷺ didn’t just compose the Qur’an’s style himself?',
      answer:
        'We possess thousands of the Prophet’s ﷺ own eloquent sayings (Hadith) recorded side by side with the Qur’an from the exact same years. Any Arabic listener—and even modern computational stylometry—can tell a Hadith from a Qur’anic verse within seconds: their syntax, rhythm, cadence, and voice are completely distinct. No human speaker effortlessly maintains two totally separate, unmatched literary voices simultaneously for 23 years without ever bleeding one into the other.',
      simpleAnswer:
        'We have thousands of the Prophet’s ﷺ everyday sayings (Hadith) from the exact same years, and they sound completely different in rhythm, grammar, and voice from the Qur’an. Even computer text analysis separates them immediately—showing the Qur’an did not come from his personal human voice.',
      keywords: ['hadith', 'stylometry', 'different voice', 'author', 'compose', 'distinction'],
      followUpIds: ['m-rhy-q1', 'm-rhy-q5'],
    },
    {
      id: 'm-rhy-q5',
      category: 'deep',
      question: 'Does listening to Qur’anic recitation calm the human mind even when you don’t know Arabic?',
      simpleQuestion: 'Why does listening to Qur’an recitation feel so calming even to non-Arabic speakers?',
      answer:
        'Yes—the Qur’an’s balanced phonetic transitions, measured breath pauses (waqf), elongated vowel resonance (madd), and lack of jarring consonant clusters create a deeply soothing acoustic cadence. Many listeners report immediate stillness and tears even before reading the translation.',
      simpleAnswer:
        'Its smooth sound patterns, gentle breath pauses, and natural flow soothe the nervous system—which is why people across the world feel deep calm listening to it even before learning Arabic.',
      keywords: ['calm', 'non-arabic', 'recitation', 'sound', 'tears', 'soothing', 'tajwid'],
      followUpIds: ['m-rhy-q3', 'm-rhy-q6'],
    },
    {
      id: 'm-rhy-q6',
      category: 'practice',
      question: 'How can I tune my ear to appreciate the Qur’an’s acoustic beauty today?',
      simpleQuestion: 'Which chapters are best to listen to first to hear this unmatched rhythm?',
      answer:
        'Listen with headphones in a quiet room to Surah Ar-Rahman (55), Surah Ad-Duha (93), or Surah Maryam (19) recited slowly with Tajwid. Notice how the sound shifts effortlessly from intimate tenderness to cosmic majesty without ever becoming rigid poetry.',
      simpleAnswer:
        'Put on a calm recitation of Surah Ar-Rahman, Surah Maryam, or Surah Ad-Duha in a quiet space and follow along with the meaning—you’ll hear its one-of-a-kind flow right away.',
      keywords: ['listen', 'ar-rahman', 'maryam', 'duha', 'tajwid', 'practice', 'start'],
      followUpIds: ['m-rhy-q2', 'm-rhy-q5'],
    },
  ],
};
