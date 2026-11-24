/**
 * Comprehensive Offline Scholarly Q&A Compendium for Burhan (House of Reason & Fitrah).
 * Covers all 18 treatises (b1–b18) with 6 deeply anticipated questions & answers per topic
 * (108 curated Q&As total), each written in both Classical and Simple voices with
 * semantic keywords and conversational follow-up links.
 */

export const burhanQaData = {
  b1: [
    {
      id: 'b1-q1',
      category: 'objection',
      question: 'If everything needs a cause, then who caused God?',
      simpleQuestion: 'If everything needs a cause, who created God?',
      answer:
        'The cosmological argument never claims "everything needs a cause." Its premise is far more precise: everything that begins to exist—or depends on external conditions—requires a cause. God is not a finite event inside time; He is the timeless, uncaused Foundation who never began. Asking who caused the Uncaused First Cause is a category error, like asking what sits north of the North Pole.',
      simpleAnswer:
        'The proof does not say "everything needs a creator"—it says everything with a beginning needs a creator. God never began; He exists outside time. Asking who created the Uncreated Creator contradicts the very meaning of a starting point.',
      keywords: ['who caused god', 'who created god', 'infinite regress', 'uncaused', 'special pleading', 'creator of god'],
      followUpIds: ['b1-q2', 'b1-q3'],
    },
    {
      id: 'b1-q2',
      category: 'objection',
      question: 'Couldn’t quantum fluctuations bring the universe out of "nothing"?',
      simpleQuestion: 'Can quantum physics create a universe from nothing?',
      answer:
        'In physics, a "quantum vacuum" is not philosophical nothingness—it is a highly structured sea of quantum fields, energy potentials, and precise mathematical laws. True nothingness has no fields, no laws, no space, and no probabilities. Even if a universe emerged from a quantum state, that structured state itself still demands an explanation for why it exists and follows intelligible laws.',
      simpleAnswer:
        'What physicists call a "quantum vacuum" is not real nothingness—it is already full of energy fields and strict laws of physics. True nothingness has no laws and cannot do anything. So quantum physics still needs an explanation for where those laws and fields came from.',
      keywords: ['quantum', 'fluctuation', 'vacuum', 'krauss', 'nothing', 'physics', 'big bang', 'virtual particles'],
      followUpIds: ['b1-q3', 'b1-q4'],
    },
    {
      id: 'b1-q3',
      category: 'proof',
      question: 'Why couldn’t the chain of past causes simply stretch back forever?',
      simpleQuestion: 'Why can’t the chain of causes just go back forever with no start?',
      answer:
        'Al-Ghazali showed that traversing an actual infinite number of prior events to reach today is impossible: if an endless line of people had to hand a message forward before it reached you, the message would never arrive. Likewise, even a timelessly long chain of borrowers has zero original capital unless an independent Owner injects existence into the chain.',
      simpleAnswer:
        'Think of a line of dominoes stretching back forever: if there is no first hand to push domino number one, the domino in front of you would never fall. Because today is actually happening, the chain of causes cannot go back endlessly without a real First Cause.',
      keywords: ['infinite', 'forever', 'eternal universe', 'regress', 'domino', 'past eternal', 'beginning'],
      followUpIds: ['b1-q4', 'b1-q5'],
    },
    {
      id: 'b1-q4',
      category: 'deep',
      question: 'How do we get from a "First Cause" to a personal, willing Creator?',
      simpleQuestion: 'Why must the First Cause be a living, willing God instead of a blind force?',
      answer:
        'Al-Ghazali noted a crucial distinction: if the First Cause were an eternal, automatic physical mechanism, its effect (the universe) would also have to be eternal—just as eternal fire would produce eternal heat. For a timeless cause to produce a finite, temporal universe at a chosen beginning, the cause must possess free agency—a Will (Iradah) that chooses to act rather than a blind reflex.',
      simpleAnswer:
        'A blind, automatic force—like fire always making heat—would have been acting forever with no pause. For a timeless First Cause to choose to begin a universe at a specific point, it cannot be a blind machine; it must have a living Will and Knowledge.',
      keywords: ['personal', 'will', 'blind force', 'impersonal', 'deism', 'why god', 'agency', 'iradah'],
      followUpIds: ['b1-q5', 'b1-q6'],
    },
    {
      id: 'b1-q5',
      category: 'objection',
      question: 'What if the universe cycles eternally in big bangs and big crunches?',
      simpleQuestion: 'What if the universe bounces forever in endless cycles?',
      answer:
        'Modern thermodynamics and singularity theorems (such as the Borde-Guth-Vilenkin theorem) indicate that any cosmos expanding on average cannot be past-eternal; entropy increases across cycles, making infinite past bounces unsustainable. Even setting physics aside, an entire series of dependent cycles remains a contingent system needing an external, independent Anchor.',
      simpleAnswer:
        'Physics shows that usable energy runs down over time (entropy), so a universe cannot bounce forever into the past without winding down. Even more deeply, a whole series of fragile cycles still depends on something outside itself to exist at all.',
      keywords: ['cyclic', 'bounce', 'big crunch', 'entropy', 'thermodynamics', 'bgv', 'oscillating'],
      followUpIds: ['b1-q4', 'b1-q6'],
    },
    {
      id: 'b1-q6',
      category: 'practice',
      question: 'How does knowing Allah as Al-Awwal (The First) change my everyday life?',
      simpleQuestion: 'How does knowing God is the First Cause help me day to day?',
      answer:
        'When you realize every earthly support—income, health, approval, or plans—is merely a borrowed link in a fragile chain, anxiety loosens its grip. You still act responsibly within causes, yet your heart leans directly on Al-Awwal, the only One who never weakens, runs out, or depends on anything else.',
      simpleAnswer:
        'Once you see that money, plans, and people are only temporary links in a chain, you stop panicking when things shake. You still work hard, but your heart rests on the One who holds the entire chain together.',
      keywords: ['daily life', 'practice', 'heart', 'anxiety', 'awwal', 'benefit', 'meaning', 'trust'],
      followUpIds: ['b1-q1', 'b1-q4'],
    },
  ],

  b2: [
    {
      id: 'b2-q1',
      category: 'objection',
      question: 'Isn’t belief in God just childhood conditioning or cultural habit?',
      simpleQuestion: 'Isn’t believing in God just what our parents taught us?',
      answer:
        'Culture shapes the vocabulary and rituals around faith, not the root instinct itself. Cross-cultural developmental psychology—including research led at Oxford by Justin Barrett—shows young children across secular and religious homes naturally infer purposeful design behind nature before formal religious teaching. Conditioning can veil or channel the Fitrah, but it did not invent it.',
      simpleAnswer:
        'Parents teach us words and practices, not the built-in longing for a Creator. Studies across the world show young children naturally sense that nature was made with purpose—even when raised without religious instruction.',
      keywords: ['conditioning', 'parents', 'culture', 'childhood', 'upbringing', 'brainwash', 'indoctrination'],
      followUpIds: ['b2-q2', 'b2-q3'],
    },
    {
      id: 'b2-q2',
      category: 'objection',
      question: 'Couldn’t the Fitrah just be an evolutionary survival glitch (agency detection)?',
      simpleQuestion: 'Could sensing God just be an evolutionary trick of the brain?',
      answer:
        'Explaining how a biological faculty functions never disproves what it perceives—describing how the retina detects photons does not make the sun imaginary. Furthermore, human intuition about a Creator does not behave like a startled animal hearing rustling grass; it endures across calm philosophical reflection, moral conscience, and awe before beauty.',
      simpleAnswer:
        'Explaining how our eyes work does not mean sunlight is fake. In the same way, pointing to how the brain recognizes purpose does not mean purpose is an illusion—especially when that awareness deepens during quiet reflection and moral moments, not just panic.',
      keywords: ['evolution', 'agency detection', 'hadd', 'psychology', 'brain', 'glitch', 'survival', 'illusion'],
      followUpIds: ['b2-q3', 'b2-q4'],
    },
    {
      id: 'b2-q3',
      category: 'objection',
      question: 'If everyone has Fitrah, why are there sincere atheists?',
      simpleQuestion: 'If belief in God is built into us, why do many people not believe?',
      answer:
        'Ibn Taymiyyah emphasized that Fitrah is a natural disposition, not an irresistible compulsion—just as humans possess an innate moral sense and appetite for healthy food, yet trauma, intellectual doubts, bad experiences with religion, or deliberate distraction can muffle it. Notably, even ardent skeptics still rely on Fitrah-rooted intuitions like objective justice, meaning, and truth.',
      simpleAnswer:
        'Fitrah is an inner compass, not forced programming. Painful experiences, unanswered doubts, or modern distraction can cover it over—just like a dusty window hides sunlight. Yet even people who doubt God still deeply crave real justice, love, and ultimate meaning.',
      keywords: ['atheist', 'atheists', 'disbelief', 'why dont everyone believe', 'doubt', 'skeptic'],
      followUpIds: ['b2-q4', 'b2-q5'],
    },
    {
      id: 'b2-q4',
      category: 'proof',
      question: 'Does Fitrah mean we shouldn’t use logic or philosophical arguments?',
      simpleQuestion: 'If God is known by the heart, why do we still need logical proofs?',
      answer:
        'Not at all. In Islamic epistemology, reason (‘aql) and Fitrah work as partners. Logical arguments act like lenses or medicine: they clear away intellectual confusion and verify that our deepest intuition aligns seamlessly with rigorous thought. Fitrah gives the spark; Burhan defends and illuminates it.',
      simpleAnswer:
        'Heart and mind work together. Logical proofs do not replace the heart—they clear away doubts and show that our deepest inner intuition actually makes complete rational sense.',
      keywords: ['logic', 'reason', 'aql', 'arguments', 'blind faith', 'rational', 'epistemology'],
      followUpIds: ['b2-q5', 'b2-q6'],
    },
    {
      id: 'b2-q5',
      category: 'deep',
      question: 'If Fitrah is universal, why do religions disagree so much?',
      simpleQuestion: 'If everyone shares the same inner compass, why are there so many religions?',
      answer:
        'The Fitrah points cleanly to core universal truths: there is a transcendent Maker, life carries moral weight, and gratitude belongs to Him. Historical divergence occurs when human myths, politics, or altered texts layer inventions onto that pure foundation. That is why the Qur’an presents itself as a reminder (dhikr) restoring the original, uncluttered Fitrah.',
      simpleAnswer:
        'The inner compass points everyone to the basics: there is a Creator, right and wrong are real, and life matters. Differences arise when human traditions add extra layers over time. Islam comes as a reminder to clear those layers back to pure Oneness.',
      keywords: ['religions', 'disagree', 'diversity', 'many faiths', 'which religion', 'polytheism'],
      followUpIds: ['b2-q4', 'b2-q6'],
    },
    {
      id: 'b2-q6',
      category: 'practice',
      question: 'How do I reconnect with my Fitrah when I feel numb or distracted?',
      simpleQuestion: 'How can I feel that natural closeness to God again when I feel numb?',
      answer:
        'Reduce noise before demanding emotion. Step outside under open sky, sit quietly for two minutes without a screen, speak honestly to Allah in plain words, and perform one hidden act of mercy. Fitrah awakens most reliably in sincerity, stillness, and gratitude—not by forcing artificial feelings.',
      simpleAnswer:
        'Start small: put the phone down for two quiet minutes, look at the sky, talk to God honestly in simple words, and do one quiet kindness no one sees. Stillness and honesty clear the dust off the heart.',
      keywords: ['numb', 'reconnect', 'awake', 'feel', 'distracted', 'quiet', 'practice'],
      followUpIds: ['b2-q1', 'b2-q3'],
    },
  ],

  b3: [
    {
      id: 'b3-q1',
      category: 'objection',
      question: 'Doesn’t Darwinian evolution explain biological design without a Designer?',
      simpleQuestion: 'Doesn’t evolution explain how living things got complex without God?',
      answer:
        'Natural selection can only operate after self-replicating, information-rich cellular life, stable carbon chemistry, and finely calibrated physical laws already exist. Selection edits living populations; it cannot explain the origin of the first coded genetic system (abiogenesis) nor why the laws of physics allow complex chemistry at all. Even if biological mechanisms unfold over time, lawful mechanisms point to a Lawgiver rather than replacing Him.',
      simpleAnswer:
        'Natural selection only starts working after living, self-copying cells and steady laws of physics already exist. It cannot explain where the first living code came from or why nature follows orderly laws capable of supporting life.',
      keywords: ['evolution', 'darwin', 'natural selection', 'abiogenesis', 'mutation', 'biology', 'blind watchmaker'],
      followUpIds: ['b3-q2', 'b3-q3'],
    },
    {
      id: 'b3-q2',
      category: 'objection',
      question: 'What about apparent flaws in nature, like disease or the eye’s blind spot?',
      simpleQuestion: 'If God designed nature, why are there diseases or things that seem flawed?',
      answer:
        'Many features once dismissed as "poor design"—such as the inverted vertebrate retina or "junk DNA"—later proved to have vital engineering advantages (like protecting photoreceptors from light damage and regulating gene expression). More fundamentally, Islamic theology never claims this temporary world is Paradise; it is a dynamic realm of growth, interdependence, and moral test where fragility reminds us of our Creator.',
      simpleAnswer:
        'Many biological features once called "mistakes"—like parts of the eye or non-coding DNA—turned out to have smart protective jobs. Also, this temporary life is designed for growth and testing, not perfection; perfection belongs to the Next Life.',
      keywords: ['flaws', 'bad design', 'blind spot', 'disease', 'suffering', 'imperfect', 'junk dna'],
      followUpIds: ['b3-q3', 'b3-q4'],
    },
    {
      id: 'b3-q3',
      category: 'proof',
      question: 'Why is DNA compared to a written code or language?',
      simpleQuestion: 'Why do people say DNA points to an intelligent mind?',
      answer:
        'DNA does not merely exhibit repetitive order (like salt crystals); it stores specified, digital, non-repeating information arranged in symbolic codons that cellular ribosomes decode to fold functional proteins. In all uniform human experience, symbolic instruction sets paired with decoding machinery trace back exclusively to intelligent agency, never to unguided chemical noise.',
      simpleAnswer:
        'A crystal just repeats the same simple shape, but DNA carries billions of specific instructions read by tiny machines inside every cell to build life. Everywhere in our experience, meaningful code and software come from an intelligent mind.',
      keywords: ['dna', 'code', 'information', 'cell', 'protein', 'specified complexity', 'language'],
      followUpIds: ['b3-q4', 'b3-q5'],
    },
    {
      id: 'b3-q4',
      category: 'objection',
      question: 'Isn’t inferring a Designer from nature a "God of the gaps" fallacy?',
      simpleQuestion: 'Isn’t saying "God designed it" just filling in what science doesn’t know yet?',
      answer:
        'A "God of the gaps" argument says "we don’t know, therefore God." Al-Razi’s teleological argument does the opposite—it argues from what we DO know: the deeper science probes into cellular motors, genetic error-correction, and mathematical laws, the more layers of breathtaking coordination we uncover. Knowledge widens the awe rather than shrinking it.',
      simpleAnswer:
        'No—this proof is based on what science HAS discovered, not what it hasn’t. The closer microscopes and telescopes look, the more astonishing order and precision we find, which strengthens the sign of a Wise Maker.',
      keywords: ['god of the gaps', 'fallacy', 'science', 'unknown', 'gaps', 'ignorance'],
      followUpIds: ['b3-q5', 'b3-q6'],
    },
    {
      id: 'b3-q5',
      category: 'deep',
      question: 'Why does the Qur’an call natural phenomena "Ayat" (signs)?',
      simpleQuestion: 'Why does the Qur’an use the same word "Ayah" for verses and nature?',
      answer:
        'In Arabic, an Ayah is a signpost pointing beyond itself. Calling both Qur’anic verses and cosmic realities Ayat teaches that revelation and the natural world are two books written by the same Author. Studying stars, rain, or human anatomy with humility becomes an act of reading Allah’s signatures.',
      simpleAnswer:
        'Because both scripture and nature are written by the same Author. A verse on a page and a heartbeat in your chest are both "signs" pointing your heart back to Allah.',
      keywords: ['ayat', 'signs', 'quran', 'two books', 'nature', 'arabic'],
      followUpIds: ['b3-q3', 'b3-q6'],
    },
    {
      id: 'b3-q6',
      category: 'practice',
      question: 'How can I turn noticing nature into real spiritual gratitude?',
      simpleQuestion: 'How do I practice seeing God’s craftsmanship in a busy day?',
      answer:
        'Pick one involuntary miracle each day—your lungs drawing air, your eye shifting focus instantly from phone to horizon, or sunlight feeding a single leaf. Pause for five seconds and say Alhamdulillah for the sustaining precision working for you without your effort.',
      simpleAnswer:
        'Once a day, pause for five seconds to notice something working silently for you—your heartbeat, your eyes focusing, or clean air entering your lungs—and whisper Alhamdulillah.',
      keywords: ['gratitude', 'practice', 'alhamdulillah', 'daily', 'body', 'mindfulness'],
      followUpIds: ['b3-q1', 'b3-q5'],
    },
  ],

  b4: [
    {
      id: 'b4-q1',
      category: 'objection',
      question: 'What if the universe itself is simply a "brute fact" needing no explanation?',
      simpleQuestion: 'Couldn’t the universe just exist for no reason at all?',
      answer:
        'Treating the entire cosmos as an unexplained "brute fact" shuts down rational inquiry at the very threshold of the ultimate question—the exact opposite of scientific reason. Worse, the universe has contingent properties: specific particle masses, finite age, changeable parts, and spatial limits that could have been otherwise. What could have been otherwise cannot be self-explanatory.',
      simpleAnswer:
        'Saying "it just exists for no reason" stops asking why right when the biggest question shows up. Everything in the universe is made of shifting, fragile parts that could have been different—so it cannot explain itself.',
      keywords: ['brute fact', 'no reason', 'russell', 'explanation', 'psr', 'why anything'],
      followUpIds: ['b4-q2', 'b4-q3'],
    },
    {
      id: 'b4-q2',
      category: 'objection',
      question: 'Why can’t the universe itself be the Necessary Existent?',
      simpleQuestion: 'Why couldn’t matter or the universe itself be the Necessary Being?',
      answer:
        'Ibn Sina proved that a Necessary Existent must be utterly simple, non-composite, unchanging, and independent of parts. The physical universe is the exact opposite: it is composed of countless separable particles, fields, and changing states that rely on their parts and prior configurations. A composite, changing system is by definition contingent.',
      simpleAnswer:
        'A truly Necessary Being cannot be made of breakable, shifting pieces that depend on each other. The universe is made of billions of changing parts—stars born and dying, atoms combining and splitting—so it is dependent, not self-sufficient.',
      keywords: ['universe necessary', 'pantheism', 'matter eternal', 'composite', 'parts', 'ibn sina'],
      followUpIds: ['b4-q3', 'b4-q4'],
    },
    {
      id: 'b4-q3',
      category: 'proof',
      question: 'How is Ibn Sina’s contingency proof different from the Big Bang / beginning proof?',
      simpleQuestion: 'How is this proof different from the "universe had a beginning" proof?',
      answer:
        'That is Ibn Sina’s brilliance: the contingency proof works even if the universe had no temporal beginning at all! It does not rely on going backward in time; it asks vertically why dependent reality exists right now at this very second—just as a chandelier needs a ceiling hook at every instant, no matter how long the chain is.',
      simpleAnswer:
        'This proof does not even depend on whether the universe had a start date. It asks why fragile, dependent things exist right now at this very moment—just like a hanging lamp needs a ceiling holding it up every single second.',
      keywords: ['difference', 'kalam', 'beginning', 'vertical', 'horizontal', 'timeless', 'sustaining'],
      followUpIds: ['b4-q4', 'b4-q5'],
    },
    {
      id: 'b4-q4',
      category: 'objection',
      question: 'Isn’t saying "the whole universe is contingent because its parts are" a fallacy of composition?',
      simpleQuestion: 'Just because every part depends on something, does the whole universe have to?',
      answer:
        'Not all part-to-whole inferences are fallacious—some properties genuinely transfer (if every brick in a wall is red, the wall is red; if every link in a chain is fragile and dependent, the chain cannot suspend itself). Because the universe is the aggregate of dependent parts and could have existed with different parts or none at all, the whole remains contingent.',
      simpleAnswer:
        'If every single link in a chain cannot float in midair on its own, putting a million links together still will not make the chain float. In the same way, gathering billions of dependent things together still gives you a dependent whole.',
      keywords: ['composition', 'fallacy', 'parts', 'whole', 'aggregate', 'chain'],
      followUpIds: ['b4-q2', 'b4-q5'],
    },
    {
      id: 'b4-q5',
      category: 'deep',
      question: 'What does Wajib al-Wujud (Necessary Existent) mean in plain terms?',
      simpleQuestion: 'What does "Necessary Being" actually mean?',
      answer:
        'A contingent being might exist or might not—its existence is borrowed. A Necessary Being (Wajib al-Wujud) is one whose very essence IS existence: it is logically impossible for Him not to exist, He cannot be composed, altered, or terminated, and every other being borrows its existence from Him moment by moment.',
      simpleAnswer:
        'Everything else exists on borrowed time—it could have never existed. A Necessary Being exists purely by His own nature: He cannot fail to exist, depends on nothing, and keeps everything else existing right now.',
      keywords: ['wajib', 'meaning', 'definition', 'necessary', 'qayyum', 'essence'],
      followUpIds: ['b4-q3', 'b4-q6'],
    },
    {
      id: 'b4-q6',
      category: 'practice',
      question: 'How does knowing Allah as Al-Qayyum bring peace to the heart?',
      simpleQuestion: 'How does knowing God sustains every second help with worry?',
      answer:
        'If Allah sustains every galaxy and every atom of oxygen in your lungs without ever growing tired (2:255), you are never carrying your life alone. Letting go of the illusion of total self-sufficiency replaces burnout with calm reliance (tawakkul).',
      simpleAnswer:
        'You are not holding your life together all by yourself. The One who effortlessly keeps every star and every breath going right now is already carrying you.',
      keywords: ['peace', 'worry', 'tawakkul', 'qayyum', 'burnout', 'practice', 'comfort'],
      followUpIds: ['b4-q3', 'b4-q5'],
    },
  ],

  b9: [
    {
      id: 'b9-q1',
      category: 'objection',
      question: 'What if multiple divine persons share one essence and always agree in harmony?',
      simpleQuestion: 'Couldn’t multiple divine persons share one essence and never disagree?',
      answer:
        'If distinct persons possess genuinely distinct attributes—such as one being begotten and another unbegotten, or one taking mortal flesh, sleeping, and dying while another remains invisible and immortal—then each holds properties the others lack. That introduces internal differentiation, dependency, and finitude into the Divine essence. Pure Tawhid remains completely free of contradiction: One undivided, incomparable Creator.',
      simpleAnswer:
        'If one divine person can be born, get hungry, or suffer while another cannot, they do not have identical perfection. Pure monotheism avoids every contradiction: One undivided Creator, completely unlike anything created.',
      keywords: ['trinity', 'three', 'persons', 'essence', 'christianity', 'harmony', 'agree', 'incarnation'],
      followUpIds: ['b9-q2', 'b9-q3'],
    },
    {
      id: 'b9-q2',
      category: 'objection',
      question: 'Can’t an All-Powerful God choose to become human if He wants to?',
      simpleQuestion: 'If God can do anything, why couldn’t He become a human being?',
      answer:
        'Omnipotence means power over all logically possible realities—not logical contradictions like creating a "married bachelor" or a "square circle." Being God means being eternal, uncreated, all-knowing, and independent; being human means being finite, created, dependent, and limited in space. An "unlimited limited being" is a contradiction in terms, not a feat of power.',
      simpleAnswer:
        'God’s power does not include logical contradictions—like making a square circle. By definition, God is infinite and uncreated, while a human is finite and created. Saying God became a limited human contradicts His very perfection, rather than showing power.',
      keywords: ['become human', 'incarnation', 'omnipotence', 'all powerful', 'jesus', 'flesh', 'paradox'],
      followUpIds: ['b9-q3', 'b9-q4'],
    },
    {
      id: 'b9-q3',
      category: 'proof',
      question: 'How does the Qur’an’s proof of mutual prevention (21:22) work?',
      simpleQuestion: 'How does the "two gods disagreeing" proof actually work?',
      answer:
        'Surah Al-Anbiya 21:22 asks us to imagine two sovereign deities: if they ever differed over a single atom—one willing it to move, one willing it still—both cannot prevail (contradiction), neither prevailing makes both powerless, and one overruling the other proves only the winner is Almighty. Even if they were forced to always agree, each would be constrained by the other’s will, stripping both of absolute sovereignty.',
      simpleAnswer:
        'Picture two all-powerful gods disagreeing over one tiny pebble: one wants it moved, the other wants it still. They cannot both win. If neither wins, both are weak; if one wins, only the winner is truly God. And if they were forced to always agree, neither would be completely free.',
      keywords: ['tamanu', 'two gods', '21:22', 'disagree', 'polytheism', 'sovereignty', 'mutual prevention'],
      followUpIds: ['b9-q4', 'b9-q5'],
    },
    {
      id: 'b9-q4',
      category: 'deep',
      question: 'Does the unity of physical laws in the universe support Tawhid?',
      simpleQuestion: 'Does modern science show signs of One Creator rather than many?',
      answer:
        'Yes. From the farthest quasars billions of light-years away to the atoms in your hand, the universe obeys one seamless set of mathematical constants and physical laws. There are no competing "territories" of gravity or conflicting chemistry—the cosmos speaks with the unified signature of a single Sovereign Architect.',
      simpleAnswer:
        'Yes—the exact same laws of gravity, light, and chemistry run seamlessly from distant galaxies down to the cells in your body. There are no rival kingdoms in nature; everything points to One Designer.',
      keywords: ['science', 'laws', 'cosmos', 'unity', 'physics', 'universe', 'one creator'],
      followUpIds: ['b9-q5', 'b9-q6'],
    },
    {
      id: 'b9-q5',
      category: 'deep',
      question: 'If Allah has 99 Names, doesn’t that divide Him into parts?',
      simpleQuestion: 'Do Allah’s many Names mean God is split into different pieces?',
      answer:
        'Not at all. The 99 Beautiful Names (Al-Asma al-Husna) describe the one unified Perfection of Allah from different facets—Mercy, Wisdom, Justice, Power—just as one person can simultaneously be a teacher, a parent, and a friend without splitting into three beings. Every attribute belongs seamlessly to the One indivisible Essence.',
      simpleAnswer:
        'No—the 99 Names are all beautiful descriptions of the exact same One God, showing His mercy, wisdom, and justice—just like one person can be generous, wise, and brave at the same time without being split into parts.',
      keywords: ['99 names', 'attributes', 'asma', 'parts', 'divisible', 'qualities'],
      followUpIds: ['b9-q1', 'b9-q6'],
    },
    {
      id: 'b9-q6',
      category: 'practice',
      question: 'How does pure Tawhid liberate a person emotionally and spiritually?',
      simpleQuestion: 'Why does worshiping One God free the human heart?',
      answer:
        'When your ultimate devotion belongs solely to the One Creator, you are freed from bowing to status, wealth, people’s approval, or fear of creation. Tawhid unifies a scattered heart: instead of trying to please a hundred competing masters, you answer to One Merciful Lord.',
      simpleAnswer:
        'Trying to please money, trends, ego, and everyone’s opinions tears the heart apart. Answering to One Merciful Creator frees you from every lesser master.',
      keywords: ['liberate', 'freedom', 'heart', 'worship', 'shirk', 'practice', 'approval'],
      followUpIds: ['b9-q3', 'b9-q4'],
    },
  ],

  b10: [
    {
      id: 'b10-q1',
      category: 'objection',
      question: 'Couldn’t Muhammad ﷺ have been sincerely mistaken rather than lying?',
      simpleQuestion: 'What if he truly believed he was a prophet, even if he was honestly mistaken?',
      answer:
        'Sincere self-deception stays trapped inside a person’s own imagination—it cannot access verifiable external realities unknown to anyone in 7th-century Arabia. Yet the Qur’an preserved Egyptological title distinctions lost for centuries (King vs. Pharaoh), risked the entire mission on a bold timed geopolitical forecast (Rome’s reversal in 3–9 years), and established a literary benchmark no Arab poet matched for 1,400 years. Unblemished sincerity combined with objective verification rules out delusion.',
      simpleAnswer:
        'Honest mistakes only produce what is already inside someone’s head. They cannot produce accurate ancient history nobody alive could read, bold timed predictions that came true, or a book Arabia’s finest poets could not match for 1,400 years.',
      keywords: ['sincere', 'mistaken', 'deluded', 'hallucination', 'epilepsy', 'confused', 'self-deception'],
      followUpIds: ['b10-q2', 'b10-q3'],
    },
    {
      id: 'b10-q2',
      category: 'objection',
      question: 'Could he have made up Islam to gain political power, wealth, or fame?',
      simpleQuestion: 'Could he have invented Islam for power or money?',
      answer:
        'The documented history refutes this completely. Early in his mission, Quraysh chiefs explicitly offered him kingship, immense wealth, and prestige simply to stop preaching Tawhid—and he refused outright. Even later, when he governed Arabia, he slept on a coarse palm-fiber mat, mended his own sandals, gave away treasury wealth before sunset, and died with his armor pawned for barley.',
      simpleAnswer:
        'No—Mecca’s leaders actually offered him kingship and wealth right at the start if he would just stop preaching, and he turned it down immediately. Even as leader of Arabia, he lived simply, slept on a rough mat, and died with almost no personal possessions.',
      keywords: ['power', 'wealth', 'money', 'fame', 'liar', 'impostor', 'kingship', 'quraysh'],
      followUpIds: ['b10-q3', 'b10-q4'],
    },
    {
      id: 'b10-q3',
      category: 'evidence',
      question: 'Why is the solar eclipse on the day his son Ibrahim died such strong evidence?',
      simpleQuestion: 'Why do scholars highlight the solar eclipse when his baby son passed away?',
      answer:
        'On the exact day his infant son Ibrahim died in Medina, a solar eclipse darkened the sky. People immediately whispered that the sun eclipsed in mourning for the Prophet’s son. A fraud seeking awe—or a megalomaniac believing the cosmos revolved around him—would have embraced that golden coincidence. Instead, grieving deeply, he stepped out and firmly corrected them: "The sun and moon do not eclipse for the death or life of anyone."',
      simpleAnswer:
        'When his baby son passed away, a solar eclipse darkened the sky and people cried that nature was mourning for him. A fake or ego-driven leader would have taken credit right away. Instead, he stopped them and told the plain truth: eclipses never happen for any person’s death.',
      keywords: ['eclipse', 'ibrahim', 'son', 'sun', 'coincidence', 'honesty', 'al-amin'],
      followUpIds: ['b10-q4', 'b10-q5'],
    },
    {
      id: 'b10-q4',
      category: 'objection',
      question: 'What if the stories about his honesty were exaggerated later by followers?',
      simpleQuestion: 'Couldn’t his followers have exaggerated how honest he was?',
      answer:
        'Even his fiercest opponents in early sources never accused him of personal dishonesty prior to prophethood—in fact, Abu Sufyan’s famous testimony before Emperor Heraclius (recorded while Abu Sufyan was still his enemy) confirmed that Muhammad ﷺ had never been caught lying, never betrayed a treaty, and attracted followers whose devotion only grew. Moreover, the Qur’an itself publicly records moments where Allah gently corrected the Prophet ﷺ (such as Surah ‘Abasa 80:1–10)—something a fabricated legend would never include.',
      simpleAnswer:
        'Even his sworn enemies admitted he was never known to lie before prophethood. Plus, the Qur’an itself includes verses that gently correct the Prophet ﷺ in public—details no myth-maker trying to flatter a leader would ever invent.',
      keywords: ['exaggerated', 'legend', 'followers', 'biased', 'heraclius', 'abu sufyan', 'abasa', 'sources'],
      followUpIds: ['b10-q5', 'b10-q6'],
    },
    {
      id: 'b10-q5',
      category: 'proof',
      question: 'Isn’t there a fourth option—that he was simply a brilliant poet or social reformer?',
      simpleQuestion: 'Could he just have been a wise human reformer without real revelation?',
      answer:
        'A wise reformer who knowingly claims "God spoke these exact words to me" when He did not is back in category one (a deceiver)—and a reformer who mistakenly imagines God spoke to him is back in category two (deluded). Furthermore, the Qur’an’s own language is structurally distinct from both his recorded Hadith speech and all 16 classical Arabic poetic meters.',
      simpleAnswer:
        'If a reformer says "God literally revealed these exact words" when it isn’t true, he is either lying or mistaken—so it still comes back to the three options. On top of that, his everyday sayings (Hadith) sound completely different in style from the Qur’an.',
      keywords: ['fourth option', 'reformer', 'poet', 'genius', 'hadith', 'style', 'legend'],
      followUpIds: ['b10-q1', 'b10-q6'],
    },
    {
      id: 'b10-q6',
      category: 'practice',
      question: 'How does the Prophet’s ﷺ character strengthen certainty today?',
      simpleQuestion: 'What does his personal character teach us today?',
      answer:
        'True faith is never detached from integrity. Knowing that the Messenger ﷺ embodied mercy, truthfulness, humility, and steadfastness under persecution reassures the heart that the message of Islam came through the purest human vessel.',
      simpleAnswer:
        'His lifelong honesty, humility, and mercy show that Islam’s message was carried by someone whose life matched every word he preached.',
      keywords: ['character', 'sunnah', 'mercy', 'certainty', 'practice', 'example'],
      followUpIds: ['b10-q2', 'b10-q3'],
    },
  ],

  b11: [
    {
      id: 'b11-q1',
      category: 'objection',
      question: 'Isn’t "produce a chapter like it" just a subjective matter of taste, like saying no one can write like Shakespeare?',
      simpleQuestion: 'Isn’t the Qur’an’s literary challenge just a matter of personal opinion?',
      answer:
        'Unlike Shakespeare—whose iambic pentameter and dramatic genres have been successfully imitated and parodied—the Qur’an created a wholly independent acoustic and structural genre outside all 16 classical Arabic poetic meters and outside ordinary prose (saj‘). Moreover, the challenge was issued directly to the greatest masters of classical Arabic at the peak of their oral civilization—men who staked their pride and tribal survival on eloquence—and not one produced a credible three-line equivalent.',
      simpleAnswer:
        'People can imitate Shakespeare’s poetic meter and style, even if less brilliantly. The Qur’an is different: it stands outside every known category of Arabic poetry and prose, and it challenged the greatest Arabic masters alive—who had every reason to defeat it—yet none could match even its shortest three-verse chapter.',
      keywords: ['subjective', 'shakespeare', 'opinion', 'taste', 'poetry', 'literary', 'imitate'],
      followUpIds: ['b11-q2', 'b11-q3'],
    },
    {
      id: 'b11-q2',
      category: 'objection',
      question: 'Did anyone actually try to meet the challenge in history? What happened?',
      simpleQuestion: 'Did anyone ever try to write a surah like the Qur’an?',
      answer:
        'Yes—several bold challengers tried, including Musaylimah during the Prophet’s ﷺ own lifetime and later literary figures like Ibn al-Muqaffa‘ and Al-Mutanabbi. Musaylimah’s attempt ("The frog, daughter of two frogs, croak as much as you croak...") became an immediate laughingstock even among non-Muslims, while Al-Walid ibn al-Mughirah—a hostile Quraysh master poet—famously confessed the Qur’an had a sweetness and towering structure no human speech matched.',
      simpleAnswer:
        'Yes, several people tried—including Musaylimah in the Prophet’s time—and their attempts sounded so clunky that even critics laughed at them. Meanwhile, Mecca’s top enemy poets admitted privately that the Qur’an sounded like nothing any human had ever composed.',
      keywords: ['tried', 'musaylimah', 'attempts', 'walid', 'poets', 'mutanabbi', 'failed'],
      followUpIds: ['b11-q3', 'b11-q4'],
    },
    {
      id: 'b11-q3',
      category: 'proof',
      question: 'Why didn’t Quraysh just hire their best poets instead of fighting costly wars?',
      simpleQuestion: 'Why did Mecca’s leaders go to war instead of just writing three verses to disprove him?',
      answer:
        'That is one of the sharpest historical proofs of I‘jaz. Defeating Islam required zero swords—only producing one short chapter rivaling Surah Al-Kawthar’s ten words. Yet Quraysh spent lives, caravans, and reputations in years of war and boycott rather than meeting the linguistic test. Their actions spoke louder than any compliment: they knew they could not match it.',
      simpleAnswer:
        'Think about it: Mecca’s leaders could have ended Islam overnight without a single battle just by writing three verses that matched the Qur’an. The fact that they chose years of costly war instead shows they knew they could not beat it with words.',
      keywords: ['war', 'quraysh', 'poets', 'sword', 'battle', 'three verses', 'why war'],
      followUpIds: ['b11-q4', 'b11-q5'],
    },
    {
      id: 'b11-q4',
      category: 'deep',
      question: 'How can a non-Arabic speaker appreciate the Qur’an’s inimitability (I‘jaz)?',
      simpleQuestion: 'If I don’t speak Arabic, how can I verify this miracle for myself?',
      answer:
        'Even before learning Arabic, you can verify it through three objective avenues: (1) the historical response of hostile 7th-century Arabic masters who failed to answer it, (2) structural features visible in translation—such as concentric ring compositions, psychological insight, and zero contradictions across 23 years of spontaneous oral delivery, and (3) the testimony of secular Arabists and linguists who confirm its unmatched stylistic singularity.',
      simpleAnswer:
        'You don’t need to be an Arab poet to see the evidence: you can check how hostile 7th-century Arabic masters failed to answer it, see its mirror-like chapter structures even in translation, and read independent modern linguists who confirm it stands in a class of its own.',
      keywords: ['non-arabic', 'english', 'translation', 'dont speak arabic', 'verify', 'foreign'],
      followUpIds: ['b11-q5', 'b11-q6'],
    },
    {
      id: 'b11-q5',
      category: 'objection',
      question: 'Could an advanced AI or modern poet finally beat the Qur’an’s challenge?',
      simpleQuestion: 'Could modern AI or a brilliant modern writer meet the challenge today?',
      answer:
        'AI models remix patterns already learned from existing human corpora—including the Qur’an itself—so they cannot originate a new linguistic paradigm. More deeply, the Qur’an’s I‘jaz is not merely pretty rhyme; it fuses spontaneous oral delivery over 23 turbulent years, unprecedented rhythmic architecture, legal and spiritual coherence, historical accuracy, and transformative power over billions of hearts simultaneously.',
      simpleAnswer:
        'AI only remixes text humans already wrote—it cannot invent an entirely new genre of language. And the Qur’an’s challenge isn’t just about sounding poetic; it combines unmatched Arabic structure, live unedited delivery over 23 years, deep truth, and lasting power over hearts.',
      keywords: ['ai', 'chatgpt', 'modern', 'technology', 'computer', 'algorithm', 'today'],
      followUpIds: ['b11-q1', 'b11-q6'],
    },
    {
      id: 'b11-q6',
      category: 'practice',
      question: 'What is the best way to experience the Qur’an’s beauty personally?',
      simpleQuestion: 'How can I feel the power of the Qur’an when I read or listen?',
      answer:
        'Listen slowly to a short Makkan surah—like Ad-Duha, Ash-Sharh, or Al-Mulk—with a quiet room and a clear translation beside you. Notice how sound, pause, imagery, and direct address to the heart weave together as one living voice.',
      simpleAnswer:
        'Sit somewhere quiet, play a calm recitation of a short chapter like Surah Ad-Duha while reading the English meaning slowly, and let both the sound and message sink in.',
      keywords: ['experience', 'listen', 'recitation', 'beauty', 'practice', 'read'],
      followUpIds: ['b11-q4', 'b11-q1'],
    },
  ],

  b12: [
    {
      id: 'b12-q1',
      category: 'objection',
      question: 'Didn’t Caliph Uthman burn other copies of the Qur’an—doesn’t that mean texts were changed?',
      simpleQuestion: 'Didn’t Uthman burn different versions of the Qur’an?',
      answer:
        'Uthman’s standardization (~650 CE) preserved unity rather than altering the revelation. As Islam spread to non-Arab regions, disputes arose over personal companion notebooks containing marginal notes and regional dialect spellings. With the unanimous agreement of hundreds of living Companions who had memorized the entire Qur’an directly from the Prophet ﷺ, Uthman distributed verified master copies drawn from Abu Bakr’s earlier compilation and retired unverified personal drafts—preserving the exact memorized text.',
      simpleAnswer:
        'No text was erased or rewritten. Some Companions had personal study notebooks with side notes or local spelling differences. With the agreement of hundreds of people who had memorized the whole Qur’an straight from the Prophet ﷺ, Uthman sent out official master copies and retired messy personal notes so no confusion could creep in.',
      keywords: ['uthman', 'burn', 'burned', 'changed', 'altered', 'standardization', 'manuscripts'],
      followUpIds: ['b12-q2', 'b12-q3'],
    },
    {
      id: 'b12-q2',
      category: 'objection',
      question: 'What about the different Qira’at (recitation modes) or the seven Ahruf?',
      simpleQuestion: 'Why are there different ways of reciting the Qur’an (Qira’at)?',
      answer:
        'The canonical Qira’at are not competing "edited versions" created by scribes—they are authenticated oral recitation modes taught by the Prophet ﷺ himself to accommodate Arabian dialects and enrich layers of meaning (for instance, reading Maliki "Owner" and Maaliki "King" of the Day of Judgment in Al-Fatihah, which reinforce rather than contradict each other). Every canonical mode traces back through unbroken mass-transmitted chains (tawatur).',
      simpleAnswer:
        'The Qira’at are not different books or human edits—they are approved recitation styles taught by the Prophet ﷺ himself for different Arab dialects. They never contradict each other; in fact, tiny shifts like "King" and "Owner" in Al-Fatihah actually deepen the meaning.',
      keywords: ['qiraat', 'ahruf', 'hafz', 'warsh', 'variants', 'dialects', 'different qurans'],
      followUpIds: ['b12-q3', 'b12-q4'],
    },
    {
      id: 'b12-q3',
      category: 'evidence',
      question: 'What do ancient manuscripts like the Birmingham and Sana’a parchments show?',
      simpleQuestion: 'What did scientists find when they radiocarbon-dated the oldest Qur’an pages?',
      answer:
        'In 2015, Oxford radiocarbon dating placed the Birmingham Qur’an manuscript parchment between 568 and 645 CE—within the Prophet’s ﷺ lifetime or just years after his passing—and its verses (Surahs 18–20) match today’s standard Qur’an remarkably closely. Together with the Topkapi, Samarkand, and Codex Parisino-petropolitanus manuscripts, physical archaeology confirms the early stability already guaranteed by living memorization.',
      simpleAnswer:
        'Radiocarbon dating at Oxford dated the Birmingham Qur’an manuscript to between 568 and 645 CE—right around the Prophet’s lifetime—and its text matches the Qur’an Muslims read today. Archaeology backs up what millions of memorizers preserved.',
      keywords: ['birmingham', 'sanaa', 'manuscript', 'carbon dating', 'archaeology', 'topkapi', 'oldest'],
      followUpIds: ['b12-q4', 'b12-q5'],
    },
    {
      id: 'b12-q4',
      category: 'proof',
      question: 'What makes Tawatur (mass independent transmission) so historically reliable?',
      simpleQuestion: 'Why is mass memorization (Tawatur) stronger than just keeping one written book?',
      answer:
        'A single written manuscript can be lost, edited in secret, or corrupted by a scribe. By contrast, when thousands of unrelated men, women, and children across Medina, Kufa, Basra, Damascus, and Egypt memorize the exact same text and recite it aloud daily in public congregational prayers, no ruler or scribe could secretly alter a single verse without instant global exposure.',
      simpleAnswer:
        'One paper book can be altered quietly in a back room. You cannot secretly change a book that thousands of people across different countries have memorized word for word and recite out loud five times every single day.',
      keywords: ['tawatur', 'memorization', 'huffaz', 'reliable', 'corrupt', 'secretly change', 'oral'],
      followUpIds: ['b12-q5', 'b12-q6'],
    },
    {
      id: 'b12-q5',
      category: 'deep',
      question: 'Why did early Qur’ans lack dots and vowel marks—could that have caused errors?',
      simpleQuestion: 'Since early Arabic writing had no dots or vowels, couldn’t people have misread it?',
      answer:
        'The written mushaf was never meant to be decoded cold by someone who didn’t know the Qur’an; it served as a visual anchor alongside the living oral tradition passed teacher-to-student (talaqqi). Dots and vowel marks were later added specifically to help new non-Arab Muslims pronounce the already-memorized oral text accurately—not to guess what the text said.',
      simpleAnswer:
        'Early Muslims didn’t learn the Qur’an by guessing from bare paper—they learned it out loud from teachers who memorized it from the Prophet ﷺ. Dots and vowels were added later simply to help non-Arabs read the already-known recitation accurately.',
      keywords: ['dots', 'vowels', 'diacritics', 'arabic script', 'misread', 'rasm'],
      followUpIds: ['b12-q2', 'b12-q3'],
    },
    {
      id: 'b12-q6',
      category: 'practice',
      question: 'How does knowing the Qur’an is preserved affect how I read it today?',
      simpleQuestion: 'Why does the Qur’an’s preservation matter personally to me?',
      answer:
        'When you open the Qur’an tonight, you are not sifting through guesswork wondering which lines were added centuries later. You are hearing the exact cadence, words, and mercy recited by the Prophet ﷺ fourteen centuries ago.',
      simpleAnswer:
        'When you open the Qur’an, you can trust that you are reading the exact same words recited by the Prophet ﷺ 1,400 years ago—nothing lost, nothing quietly rewritten.',
      keywords: ['personal', 'trust', 'reading', 'preserved', 'practice', 'confidence'],
      followUpIds: ['b12-q3', 'b12-q4'],
    },
  ],

  b13: [
    {
      id: 'b13-q1',
      category: 'objection',
      question: 'Isn’t religion supposed to be about blind faith rather than logic?',
      simpleQuestion: 'Doesn’t faith mean believing without proof?',
      answer:
        'Not in Islam. The Qur’an explicitly censures blind imitation of ancestors ("Even though their fathers understood nothing and were not guided?" 2:170) and repeats questions like "Will you not reason?" (afala ta‘qilun) dozens of times. In Islam, Iman (faith) is trust built upon recognized truth—not shutting off your mind.',
      simpleAnswer:
        'No! The Qur’an actually criticizes blind following and asks "Will you not use your reason?" over and over. Islamic faith means trusting God after recognizing clear truth, never turning off your brain.',
      keywords: ['blind faith', 'reason', 'logic', 'quran', 'intellect', 'aql', 'imitation'],
      followUpIds: ['b13-q2', 'b13-q3'],
    },
    {
      id: 'b13-q2',
      category: 'objection',
      question: 'What if something in Islam—like the Unseen (Ghayb) or Paradise—goes beyond what science can measure?',
      simpleQuestion: 'Is believing in unseen things like angels or Paradise illogical?',
      answer:
        'Classical Islamic thinkers draw a vital distinction between what is logically impossible (like a square circle or three being one) and what is simply beyond our physical senses (supra-rational). Reason never rejects what exceeds human instruments—we accept consciousness, love, and historical events without putting them in a beaker. Once revelation is rationally established as coming from the All-Knowing Creator, trusting His report about the Unseen is entirely rational.',
      simpleAnswer:
        'There is a huge difference between something impossible (like a square circle) and something invisible to our eyes. Once solid evidence shows a message comes from the All-Knowing Creator, trusting what He tells us about the Unseen makes complete logical sense.',
      keywords: ['unseen', 'ghayb', 'angels', 'paradise', 'science', 'measure', 'empirical', 'supra-rational'],
      followUpIds: ['b13-q3', 'b13-q4'],
    },
    {
      id: 'b13-q3',
      category: 'proof',
      question: 'What are the core first principles a true worldview must pass?',
      simpleQuestion: 'How do you actually test which worldview makes the most sense?',
      answer:
        'A sound worldview must satisfy four tests simultaneously: (1) Internal consistency—free of logical contradictions about God; (2) Explanatory power—accounting for the universe’s existence, order, consciousness, and objective morality; (3) Historical preservation—retaining its original message intact; and (4) Fitrah resonance—honoring human dignity, mercy, and accountability. Islam uniquely passes all four without forcing a single paradox.',
      simpleAnswer:
        'Test any worldview with four simple checks: Does its idea of God make logical sense? Does it explain why the universe and right-and-wrong exist? Is its scripture preserved? And does it ring true to the human conscience? Islam passes all four cleanly.',
      keywords: ['first principles', 'test', 'criteria', 'worldview', 'compare', 'truth', 'coherence'],
      followUpIds: ['b13-q4', 'b13-q5'],
    },
    {
      id: 'b13-q4',
      category: 'objection',
      question: 'Doesn’t "no compulsion in religion" (2:256) conflict with strong truth claims?',
      simpleQuestion: 'If Islam says there is no compulsion in religion, does that mean all religions are equally true?',
      answer:
        'No—2:256 affirms the exact opposite: "Truth has become clearly distinct from error." Because truth stands on clear evidence rather than force, faith must be embraced freely with heart and intellect. Respecting human freedom of conscience never requires pretending contradictory truth claims are all equally accurate.',
      simpleAnswer:
        'Not at all. The verse actually explains why force is forbidden: "Truth has become clear from error." Real conviction can only come from an open heart and clear mind, never from pressure.',
      keywords: ['no compulsion', '2:256', 'force', 'freedom', 'all religions', 'relativism', 'tolerance'],
      followUpIds: ['b13-q5', 'b13-q6'],
    },
    {
      id: 'b13-q5',
      category: 'deep',
      question: 'How does Islam resolve the tension between Divine Mercy and Divine Justice?',
      simpleQuestion: 'How can God be both completely Merciful and completely Just?',
      answer:
        'Unlike systems that either erase accountability or require an innocent third party to suffer punishment on behalf of the guilty, Islam holds both in luminous balance: every soul bears responsibility for its own choices (6:164), yet Allah’s mercy outstrips His wrath—He forgives any sin upon sincere repentance directly, without intermediaries, while ensuring no oppressed person’s cry is ever forgotten.',
      simpleAnswer:
        'In Islam, no innocent person has to be punished for someone else’s sin. God is completely Just so no wrong goes unseen, and completely Merciful so anyone who turns back sincerely is forgiven directly by Him.',
      keywords: ['mercy', 'justice', 'forgiveness', 'atonement', 'accountability', 'balance'],
      followUpIds: ['b13-q3', 'b13-q6'],
    },
    {
      id: 'b13-q6',
      category: 'practice',
      question: 'What should I do when I encounter a genuine intellectual doubt?',
      simpleQuestion: 'Is it okay to have honest questions or doubts about faith?',
      answer:
        'Honest questions are welcomed in Islam—even Prophet Ibrahim عليه السلام asked Allah to show him how He revives the dead so his heart might find deeper serenity (2:260). Bring your questions patiently to grounded scholarship, study both sides fairly, and keep praying for clarity.',
      simpleAnswer:
        'Yes—even Prophet Abraham asked God questions so his heart could feel even deeper peace. Don’t hide honest questions; research them patiently with trustworthy teachers and ask Allah for clarity.',
      keywords: ['doubt', 'doubts', 'questions', 'ibrahim', 'confused', 'okay to ask'],
      followUpIds: ['b13-q1', 'b13-q2'],
    },
    {
      id: 'b13-q7',
      category: 'objection',
      question: 'Don’t followers of every religion feel their own path is coherent from the inside?',
      simpleQuestion: 'Doesn’t everyone just think their own religion makes sense because they grew up with it?',
      answer:
        'Inner feeling alone cannot settle truth—that is precisely why the Criterion of Coherence uses public, external standards that anyone can check regardless of background: logical non-contradiction in the concept of God, open universality, verifiable textual preservation, and historical grounding. A worldview should not ask you to trust feelings over facts; it should welcome inspection under daylight.',
      simpleAnswer:
        'That is why we should never rely on feelings or upbringing alone. The four tests—One logical God, open to everyone, a preserved original book, and harmony with reason—are objective checkpoints anyone from any background can check openly.',
      keywords: ['coherence', 'upbringing', 'bias', 'every religion', 'objective', 'standards'],
      followUpIds: ['b13-q3', 'b13-q4'],
    },
  ],

  b14: [
    {
      id: 'b14-q1',
      category: 'objection',
      question: 'Since the Qur’an honors earlier prophets, couldn’t it simply have borrowed stories from Jewish and Christian neighbors?',
      simpleQuestion: 'Couldn’t the Qur’an just have copied its stories from the Bible?',
      answer:
        'A copier reproduces the errors and assumptions of its source. The Qur’an does the exact opposite: it corrects subtle historical anachronisms no 7th-century neighbor could have checked (like titling Joseph’s Egyptian ruler "King" rather than "Pharaoh"), removes moral blemishes attributed to prophets in earlier texts, and presents unified theology from an unlettered man in Mecca where no Arabic Bible translation even existed yet.',
      simpleAnswer:
        'Someone copying an older book copies its mistakes too. Yet the Qur’an quietly corrected ancient historical details—like calling Egypt’s ruler "King" in Joseph’s time and "Pharaoh" only in Moses’s time—hundreds of years before anyone could read hieroglyphs. Plus, no Arabic Bible even existed in Mecca then.',
      keywords: ['borrow', 'copied', 'bible', 'jewish', 'christian', 'plagiarize', 'neighbors', 'waraqah'],
      followUpIds: ['b14-q2', 'b14-q3'],
    },
    {
      id: 'b14-q2',
      category: 'objection',
      question: 'If God sent the Torah and Gospel, why did He need to send a final scripture?',
      simpleQuestion: 'Why did God send the Qur’an if the Torah and Gospel already existed?',
      answer:
        'Earlier revelations were entrusted to specific nations for specific eras and suffered loss, translation drift, and human editing over centuries. Allah sent the Qur’an as the final, universal testament for all humanity—confirming the core truth of earlier prophets while serving as a guarded criterion (Muhaymin, 5:48) that restores pure monotheism and stays permanently preserved.',
      simpleAnswer:
        'Earlier scriptures were sent to specific communities for their own times and changed over centuries. God sent the Qur’an as the final, preserved message for all humanity—confirming the truth of every earlier prophet and restoring pure worship of One God.',
      keywords: ['why quran', 'torah', 'gospel', 'injil', 'earlier scriptures', 'muhaymin', 'corrupted'],
      followUpIds: ['b14-q3', 'b14-q4'],
    },
    {
      id: 'b14-q3',
      category: 'objection',
      question: 'Doesn’t the Qur’an confirm the Bible as unchanged?',
      simpleQuestion: 'Wait—doesn’t the Qur’an tell Christians and Jews that their current books are completely intact?',
      answer:
        'The Qur’an honors the original revelations given to Moses and Jesus (Tawrah and Injil) and recognizes remnants of truth still inside earlier scriptures, while simultaneously stating plainly that some scribes altered words out of place, concealed passages, and wrote texts with their own hands (2:79, 5:13). That is why it calls itself Al-Muhaymin—the trustworthy guardian and standard over what came before.',
      simpleAnswer:
        'The Qur’an respects the original messages revealed to Moses and Jesus and acknowledges truth still found in earlier books, while also saying clearly that later scribes altered or hid parts (2:79). So the Qur’an acts as the preserved standard that separates original truth from later additions.',
      keywords: ['confirm bible', 'islamic dilemma', 'unchanged', 'altered', 'tahrif', '2:79', '5:48'],
      followUpIds: ['b14-q4', 'b14-q5'],
    },
    {
      id: 'b14-q4',
      category: 'deep',
      question: 'How does the Qur’an view Prophet Jesus (Isa عليه السلام) and Mary (Maryam)?',
      simpleQuestion: 'What does Islam actually teach about Jesus and Mary?',
      answer:
        'With immense love and honor. Maryam is the only woman named directly in the Qur’an and has an entire chapter named after her; Jesus is honored as the Messiah, born miraculously of a virgin, performing miracles by Allah’s leave, and one of the five mightiest messengers—yet firmly affirming his own words that he was a devoted servant and messenger of the One God, never God Himself.',
      simpleAnswer:
        'Islam deeply loves and honors both Jesus and Mary—Mary even has a whole chapter of the Qur’an named after her. Muslims believe Jesus was the Messiah born miraculously, who taught people to worship the One God alone.',
      keywords: ['jesus', 'isa', 'mary', 'maryam', 'messiah', 'christian', 'virgin birth'],
      followUpIds: ['b14-q5', 'b14-q6'],
    },
    {
      id: 'b14-q5',
      category: 'proof',
      question: 'Why does prophetic continuity make Islam more credible than a brand-new religion?',
      simpleQuestion: 'Why is continuing earlier prophets stronger than claiming a totally new religion?',
      answer:
        'If a loving Creator cares for humanity, we would expect Him to guide mankind from the very beginning—not leave humans in the dark until the 7th century. Islam’s claim that Adam, Noah, Abraham, Moses, David, Jesus, and Muhammad ﷺ all belonged to one unbroken family calling to One God fits both history and Divine Mercy seamlessly.',
      simpleAnswer:
        'A Merciful Creator would never ignore humanity for thousands of years and suddenly show up late. Islam teaches that every true prophet—from Adam and Abraham to Moses, Jesus, and Muhammad ﷺ—brought the exact same core message: worship One God.',
      keywords: ['continuity', 'new religion', 'abraham', 'moses', 'adam', 'unbroken', 'family'],
      followUpIds: ['b14-q1', 'b14-q6'],
    },
    {
      id: 'b14-q6',
      category: 'practice',
      question: 'How should this shared prophetic heritage shape how Muslims treat others?',
      simpleQuestion: 'How should this guide how we speak with people of other faiths?',
      answer:
        'With dignity, fairness, and shared common ground—just as the Qur’an instructs: "Speak to them in the finest manner" (29:46) and invite to "a common word between us and you: that we worship none but Allah" (3:64).',
      simpleAnswer:
        'With respect, warmth, and honesty—focusing on shared values like worshiping One God, justice, and compassion, while speaking kindly and clearly.',
      keywords: ['interfaith', 'respect', 'dialogue', 'christians', 'jews', 'practice', 'kindness'],
      followUpIds: ['b14-q4', 'b14-q5'],
    },
  ],

  b15: [
    {
      id: 'b15-q1',
      category: 'objection',
      question: 'What if there are trillions of unobservable universes (a Multiverse), so one was bound to get lucky?',
      simpleQuestion: 'Could a Multiverse of trillions of universes explain fine-tuning by luck?',
      answer:
        'First, no physical evidence directly observes other universes—so invoking an infinite unseen multiverse is a metaphysical leap, not empirical science. Second, even multiverse generators (like inflationary string landscapes) require finely tuned underlying laws and fields to produce varied universes in the first place—pushing the fine-tuning question up one level rather than solving it.',
      simpleAnswer:
        'Nobody has ever observed another universe, so the multiverse is an unproven guess. Worse, even a "universe-making machine" would still need finely tuned laws of physics just to run—so it doesn’t actually get rid of the Designer.',
      keywords: ['multiverse', 'many worlds', 'lucky', 'trillions', 'parallel universes', 'string theory', 'inflation'],
      followUpIds: ['b15-q2', 'b15-q3'],
    },
    {
      id: 'b15-q2',
      category: 'objection',
      question: 'Isn’t fine-tuning just the Anthropic Principle—we wouldn’t be here to notice if the constants were different?',
      simpleQuestion: 'Wouldn’t we only ever see a life-friendly universe because otherwise we wouldn’t exist?',
      answer:
        'Philosopher John Leslie answered this with the "firing squad" analogy: imagine fifty elite sharpshooters firing at you from close range and every single bullet misses. Saying "well, if they hadn’t missed, I wouldn’t be alive to notice!" explains why you are observing your survival—it does NOT explain WHY fifty sharpshooters all missed. You still rightly infer it was intentional.',
      simpleAnswer:
        'Imagine 50 expert marksmen shooting at you and all 50 miss. Saying "well, if they hit me I wouldn’t be here to think about it!" doesn’t explain WHY they all missed. You’d still know it wasn’t an accident—and the same applies to cosmic fine-tuning.',
      keywords: ['anthropic', 'firing squad', 'puddle', 'douglas adams', 'observer', 'selection effect', 'notice'],
      followUpIds: ['b15-q3', 'b15-q4'],
    },
    {
      id: 'b15-q3',
      category: 'evidence',
      question: 'Which physical constants are actually fine-tuned, and how narrow are the margins?',
      simpleQuestion: 'What are real examples of cosmic fine-tuning in physics?',
      answer:
        'Notable examples recognized by mainstream cosmologists include: (1) the cosmological constant (dark energy density), calibrated to roughly 1 part in 10^120—a tiny shift would either rip galaxies apart or collapse space instantly; (2) the ratio of gravitational to electromagnetic force (~1 in 10^40) needed for long-lived stars; and (3) the strong nuclear force (~0.5% margin) required to forge carbon and oxygen inside stars.',
      simpleAnswer:
        'Three famous examples: the expansion energy of space (calibrated to 1 in 10^120—otherwise stars could never form), the balance between gravity and electromagnetism, and the nuclear force holding atoms together (off by even 1%, carbon and life couldn’t exist).',
      keywords: ['constants', 'examples', 'gravity', 'cosmological constant', 'carbon', 'strong force', 'numbers'],
      followUpIds: ['b15-q4', 'b15-q5'],
    },
    {
      id: 'b15-q4',
      category: 'objection',
      question: 'Couldn’t a future "Theory of Everything" prove those constants had to be those exact numbers?',
      simpleQuestion: 'What if physics later discovers the constants simply couldn’t have been any other way?',
      answer:
        'Even if a deeper unified equation linked the constants together, it would only sharpen the wonder: why would the one mathematically inevitable universe ALSO happen to land squarely inside the razor-thin bullseye permitting carbon chemistry, stable stars, and conscious minds? Necessity without intention cannot explain why abstract mathematics cares about life.',
      simpleAnswer:
        'Even if one master equation fixed all the numbers together, you’d still have to ask: why did that single equation happen to produce the exact razor-thin recipe needed for stars, water, and living minds?',
      keywords: ['theory of everything', 'necessity', 'equation', 'unified', 'physics', 'had to be'],
      followUpIds: ['b15-q1', 'b15-q5'],
    },
    {
      id: 'b15-q5',
      category: 'objection',
      question: 'What if other forms of life could exist under completely different laws of physics?',
      simpleQuestion: 'Could alien life exist even if the universe’s constants were different?',
      answer:
        'Fine-tuning is not merely about Earth-like carbon humans—it is about whether ANY complex structure can exist at all. Shift gravity, dark energy, or the strong force slightly, and you don’t get exotic silicon aliens; you get either an instant black-hole crunch or a cold, empty mist of lonely hydrogen atoms with zero stars, zero chemistry, and zero complexity.',
      simpleAnswer:
        'Fine-tuning isn’t just about human life. Change those core forces slightly and you don’t get weird aliens—you get no stars, no atoms beyond hydrogen, and no chemistry at all. Just an empty cloud or an instant collapse.',
      keywords: ['alien', 'other life', 'silicon', 'different life', 'chemistry', 'atoms'],
      followUpIds: ['b15-q3', 'b15-q6'],
    },
    {
      id: 'b15-q6',
      category: 'practice',
      question: 'What does "We created everything in exact measure" (54:49) mean for my life?',
      simpleQuestion: 'How does cosmic precision connect to my personal life?',
      answer:
        'The same Al-Hakim who calibrated gravity to 40 decimal places so stars could warm your planet did not place your life together carelessly. Your timing, challenges, and gifts are held inside a wisdom far wider than our immediate view.',
      simpleAnswer:
        'The God who tuned the entire universe with astonishing care did not assemble your life by accident. You are held inside the same intentional wisdom.',
      keywords: ['qadar', 'measure', '54:49', 'personal', 'meaning', 'practice', 'life'],
      followUpIds: ['b15-q2', 'b15-q3'],
    },
  ],

  b16: [
    {
      id: 'b16-q1',
      category: 'objection',
      question: 'If brain injuries or anesthesia change personality and memory, doesn’t that prove the mind is just the brain?',
      simpleQuestion: 'If damaging the brain changes our thoughts, isn’t the mind just the brain?',
      answer:
        'Correlation never proves identity. If you damage a radio’s receiver or unplug its antenna, the music distorts or falls silent—yet that does not mean the radio station lives inside the plastic box. In Al-Ghazali’s classic view, the brain is the finely tuned instrument through which the conscious soul (Al-Ruh) interacts with the physical world; impairing the instrument naturally affects output without proving the player does not exist.',
      simpleAnswer:
        'If a radio breaks, the music cuts out—but that doesn’t mean the musician was living inside the radio. Similarly, the brain is the delicate instrument the soul uses in this physical world; damaging the instrument affects how we act without proving the soul is just neurons.',
      keywords: ['brain', 'injury', 'neuroscience', 'anesthesia', 'correlation', 'radio', 'damage', 'memory'],
      followUpIds: ['b16-q2', 'b16-q3'],
    },
    {
      id: 'b16-q2',
      category: 'proof',
      question: 'What is the "Hard Problem of Consciousness" that materialism cannot solve?',
      simpleQuestion: 'Why can’t brain chemistry alone explain what it feels like to be aware?',
      answer:
        'Neuroscience brilliantly maps the "easy problems"—which neurons fire when light hits your eye. Yet philosopher David Chalmers highlighted the "Hard Problem": why does any amount of silent electrical voltage across carbon and sodium atoms produce a first-person inner experience—the felt warmth of sunlight, the taste of honey, or the unity of "I"? Objective third-person measurements never bridge into subjective first-person awareness.',
      simpleAnswer:
        'Brain scans can show which electrical signals fire when you eat honey—but electricity has no taste! Science can measure brain activity from the outside, yet it cannot explain why physical atoms create an inner "you" who actually feels joy, color, and love.',
      keywords: ['hard problem', 'qualia', 'subjective', 'chalmers', 'materialism', 'neurons', 'experience', 'awareness'],
      followUpIds: ['b16-q3', 'b16-q4'],
    },
    {
      id: 'b16-q3',
      category: 'objection',
      question: 'Couldn’t consciousness simply "emerge" automatically once a brain or AI gets complex enough?',
      simpleQuestion: 'Couldn’t consciousness just appear naturally from complex networks—like in AI?',
      answer:
        'Adding more silicon transistors or more billions of dominoes only produces faster calculation, not inner subjective feeling—just as a weather simulation doesn’t actually get wet. Calling consciousness "emergent" merely labels the mystery without explaining how purely unconscious, non-experiential matter suddenly generates a unified conscious self.',
      simpleAnswer:
        'A weather simulation on a supercomputer never gets wet, no matter how fast it runs. Making circuits or matter more complicated only creates faster processing—it never explains how lifeless particles suddenly wake up and feel alive.',
      keywords: ['emergence', 'emergent', 'ai', 'computers', 'complex', 'simulation', 'conscious ai'],
      followUpIds: ['b16-q4', 'b16-q5'],
    },
    {
      id: 'b16-q4',
      category: 'proof',
      question: 'What does free will have to do with the reality of the soul?',
      simpleQuestion: 'How does free will point beyond pure brain chemistry?',
      answer:
        'If you were nothing more than deterministic chemical reactions following blind physics, your beliefs—including the belief in materialism itself—would simply be molecules colliding, not genuinely reasoned choices. Yet we weigh evidence, resist impulses, and hold moral responsibility, testifying to a rational self transcending mere chemistry.',
      simpleAnswer:
        'If thoughts were only blind chemical dominoes falling in your skull, you wouldn’t truly choose truth or goodness—even materialism would just be a chemical reflex. Our ability to pause, weigh truth, and choose what is right points to a real conscious self.',
      keywords: ['free will', 'determinism', 'choice', 'morality', 'rationality', 'chemistry'],
      followUpIds: ['b16-q5', 'b16-q6'],
    },
    {
      id: 'b16-q5',
      category: 'deep',
      question: 'What does the Qur’an mean when it says "The soul is from the command of my Lord" (17:85)?',
      simpleQuestion: 'Why does the Qur’an say we are only given a little knowledge about the soul?',
      answer:
        'Surah Al-Isra 17:85 marks the boundary of empirical reductionism: the Ruh (soul) belongs to Allah’s direct creative command (‘alam al-amr), not merely the world of measurable matter (‘alam al-khalq). Remarkably, fourteen centuries later, even leading secular philosophers of mind admit consciousness remains the deepest unsolved mystery of science.',
      simpleAnswer:
        'The verse tells us the soul belongs to a higher reality directly from God’s command, beyond what physical instruments can dissect. It’s striking that 1,400 years later, modern science still calls consciousness its greatest unsolved mystery.',
      keywords: ['17:85', 'ruh', 'soul', 'command', 'amr', 'quran', 'mystery'],
      followUpIds: ['b16-q2', 'b16-q6'],
    },
    {
      id: 'b16-q6',
      category: 'practice',
      question: 'How does remembering I have an eternal soul change how I treat myself and others?',
      simpleQuestion: 'How does knowing I am a soul change everyday life?',
      answer:
        'You stop reducing your worth—or anyone else’s—to appearance, productivity, or passing status. Caring for your soul through prayer, dhikr, honesty, and mercy becomes just as real and vital as feeding your body.',
      simpleAnswer:
        'You stop measuring yourself or others only by looks, likes, or productivity. You remember to nourish your inner soul with prayer, stillness, and kindness—not just feed your body.',
      keywords: ['worth', 'dignity', 'soul', 'practice', 'care', 'eternal'],
      followUpIds: ['b16-q1', 'b16-q5'],
    },
  ],

  b17: [
    {
      id: 'b17-q1',
      category: 'objection',
      question: 'Haven’t other historical leaders also united tribes or built empires quickly?',
      simpleQuestion: 'Didn’t other conquerors like Genghis Khan or Alexander also unite people quickly?',
      answer:
        'Conquerors like Alexander or Genghis Khan forged military empires through armies—and their realms fractured immediately after their deaths, leaving no unified moral scripture or enduring spiritual law. Muhammad ﷺ began alone with zero army, zero wealth, and zero imperial backing, and transformed warring tribes from the inside out: abolishing female infanticide, outlawing usury, honoring orphans, curbing blood feuds, and building a multi-ethnic moral civilization enduring for 1,400+ years.',
      simpleAnswer:
        'Conquerors used armies to win land, and their empires broke apart right after they died. The Prophet ﷺ started with zero army or wealth and transformed people’s hearts and ethics—ending infanticide, uniting bitter enemies as brothers, and leaving a living moral civilization over 1,400 years later.',
      keywords: ['empires', 'genghis khan', 'alexander', 'conquerors', 'military', 'leaders', 'history'],
      followUpIds: ['b17-q2', 'b17-q3'],
    },
    {
      id: 'b17-q2',
      category: 'evidence',
      question: 'What were the most dramatic moral changes in 7th-century Arabia?',
      simpleQuestion: 'What actually changed in Arabian society because of Islam?',
      answer:
        'Within a single generation, Islam eradicated buried-alive female infanticide, established legal property and inheritance rights for women centuries before Europe, abolished racial supremacy ("an Arab has no superiority over a non-Arab"), systematically incentivized freeing enslaved people as atonement and charity, outlawed alcohol and predatory interest (riba), and united generations-old feuding clans (like the Aws and Khazraj) into genuine brotherhood.',
      simpleAnswer:
        'In one generation, Islam ended burying baby girls alive, gave women legal inheritance and property rights, declared total racial equality, encouraged freeing enslaved people, banned predatory debt and alcohol, and turned bitter tribal enemies into loving neighbors.',
      keywords: ['changes', 'women', 'infanticide', 'racism', 'slavery', 'alcohol', 'brotherhood', 'ethics'],
      followUpIds: ['b17-q3', 'b17-q4'],
    },
    {
      id: 'b17-q3',
      category: 'objection',
      question: 'Wasn’t Islam spread mainly by the sword rather than conviction?',
      simpleQuestion: 'Did Islam only spread because of war and force?',
      answer:
        'Historians widely refute the "spread by the sword" myth. For the first 13 years in Mecca, Muslims endured torture and exile without lifting a weapon, yet Islam grew steadily. Later, the largest Muslim populations in the world—Indonesia, Malaysia, Bengal, and much of East and West Africa—never saw a Muslim conquering army; Islam spread there through honest merchants, scholars, and spiritual character. Even in lands governed by Muslims, large Christian and Jewish communities flourished for centuries.',
      simpleAnswer:
        'No—historians reject that myth. For 13 years in Mecca, Muslims were persecuted without fighting back, yet people kept accepting Islam. And the world’s largest Muslim regions—like Indonesia, Malaysia, and parts of Africa—embraced Islam through peaceful traders and teachers, never through armies.',
      keywords: ['sword', 'force', 'war', 'spread', 'indonesia', 'conquest', 'violence'],
      followUpIds: ['b17-q4', 'b17-q5'],
    },
    {
      id: 'b17-q4',
      category: 'evidence',
      question: 'How did Islam abolish deeply ingrained habits like alcohol so cleanly?',
      simpleQuestion: 'How did people give up addictions like alcohol overnight?',
      answer:
        'Through gradual, heart-first wisdom. The Qur’an first built deep love and awe of Allah over more than a decade, then introduced phased guidance on intoxicants until the final prohibition arrived. When Surah Al-Ma’idah 5:90 was recited in Medina, people literally poured out jars of wine into the streets immediately—something modern governments with massive police forces failed to achieve during Prohibition.',
      simpleAnswer:
        'First, the Qur’an healed people’s hearts and built love for God over years. Then, when the final ban on alcohol was revealed, people voluntarily poured their wine into the streets that very day—achieving through conscience what modern governments could not achieve with police.',
      keywords: ['alcohol', 'prohibition', 'addiction', 'gradual', 'medina', 'streets', 'wine'],
      followUpIds: ['b17-q5', 'b17-q6'],
    },
    {
      id: 'b17-q5',
      category: 'deep',
      question: 'What does Surah Al-Anfal 8:63 mean about uniting hearts?',
      simpleQuestion: 'Why does the Qur’an say no amount of money could have united their hearts?',
      answer:
        'Arabian tribes were locked in multi-generational vendettas like the 120-year War of Bu‘ath between the Aws and Khazraj of Medina. Allah reminds the Prophet ﷺ: "Had you spent all that is on earth, you could not have united their hearts, but Allah united them" (8:63). True reconciliation at that scale testified to Divine aid rather than mere political bargaining.',
      simpleAnswer:
        'The tribes of Medina had fought bitter blood feuds for generations. The verse reminds us that all the gold on earth could not buy real forgiveness between enemies like that—only God transforming their hearts could.',
      keywords: ['8:63', 'hearts', 'aws', 'khazraj', 'tribes', 'unity', 'reconciliation'],
      followUpIds: ['b17-q2', 'b17-q6'],
    },
    {
      id: 'b17-q6',
      category: 'practice',
      question: 'What does this moral revolution inspire in my own personal growth?',
      simpleQuestion: 'What does this history teach me about changing my own bad habits?',
      answer:
        'No heart or habit is too stubborn to change when anchored in sincere connection with Allah. Just as the Companions transformed step by step through daily prayer, companionship, and scripture, steady small steps with sincerity reshape a life.',
      simpleAnswer:
        'If warring tribes could become models of mercy and discipline, none of our habits are too hard to heal. Start with prayer, good company, and steady small steps.',
      keywords: ['personal', 'change', 'habits', 'growth', 'companions', 'practice'],
      followUpIds: ['b17-q2', 'b17-q4'],
    },
  ],

  b18: [
    {
      id: 'b18-q1',
      category: 'objection',
      question: 'Doesn’t abrogation (Naskh) mean the Qur’an changed its mind or contradicted itself?',
      simpleQuestion: 'Doesn’t updating a ruling over time (Naskh) count as a contradiction?',
      answer:
        'A contradiction occurs when two incompatible statements claim truth about the same reality simultaneously (like saying "God is one" and "God is three"). Naskh never touches theology, history, or core ethics—it applies strictly to phased legal training across 23 years, just as a wise physician adjusts a recovering patient’s dosage from week one to week four. Progressive legislation is pedagogical wisdom, not inconsistency.',
      simpleAnswer:
        'No—updating a step-by-step rule is not a contradiction. Just like a doctor adjusts your medicine as you heal, God phased in practical rules (like moving away from alcohol) gradually while keeping every core belief about God, truth, and justice 100% consistent from day one.',
      keywords: ['naskh', 'abrogation', 'changed mind', 'contradiction', 'rules', 'gradual', 'law'],
      followUpIds: ['b18-q2', 'b18-q3'],
    },
    {
      id: 'b18-q2',
      category: 'objection',
      question: 'What about verses critics claim contradict each other—like how many days creation took or what humans were created from?',
      simpleQuestion: 'What about verses that say humans were made from water, clay, or dust—isn’t that a contradiction?',
      answer:
        'Those are complementary stages and facets, not contradictions—just as describing a baked loaf as made from flour, water, dough, and oven heat describes one continuous process from different angles. Humans are biologically water-based (21:30), composed of earthen minerals (clay/dust), and reproduced via a mingled drop. Likewise, "six periods" (ayyam) of cosmic creation breaks smoothly into 2 + 4 = 6 stages in Surah Fussilat 41:9–12 when read accurately in Arabic grammar.',
      simpleAnswer:
        'Saying bread is made of flour, water, and dough isn’t a contradiction—they are stages of the same recipe. In the same way, water, clay, and dust describe the connected ingredients and stages of human creation, not conflicting stories.',
      keywords: ['clay', 'dust', 'water', 'six days', 'eight days', 'apparent contradictions', 'fussilat', 'critics'],
      followUpIds: ['b18-q3', 'b18-q4'],
    },
    {
      id: 'b18-q3',
      category: 'proof',
      question: 'Why is 23 years of unedited oral revelation so hard for a human author to keep consistent?',
      simpleQuestion: 'Why is it so impressive that the Qur’an stayed consistent over 23 years?',
      answer:
        'Think of any prolific human author writing over 23 turbulent years—from lonely persecution in Mecca to governing a state in Medina, through bereavement, treaties, and battles—without ever going back to revise an earlier chapter. Human authors contradict earlier drafts, shift their core voice, and let personal grief dominate their writing. Yet the Qur’an never revised a prior surah, stayed thematically unified across 114 non-chronological chapters, and did not even devote a single verse to eulogizing the Prophet’s ﷺ beloved wife Khadijah or his sons.',
      simpleAnswer:
        'Try speaking a 600-page book out loud piece by piece over 23 stressful years—from being hunted to leading a city—without ever editing an earlier page. Any human would slip up, change tone, or write mainly about personal grief. Yet the Qur’an never once contradicts itself or loses its transcendent voice.',
      keywords: ['23 years', 'unedited', 'oral', 'author', 'mecca', 'medina', 'khadijah', 'voice'],
      followUpIds: ['b18-q4', 'b18-q5'],
    },
    {
      id: 'b18-q4',
      category: 'deep',
      question: 'Why aren’t the chapters of the Qur’an arranged in chronological order?',
      simpleQuestion: 'Why are the Qur’an’s chapters not arranged in time order?',
      answer:
        'Because the Qur’an is a timeless guidance symphony, not a diary. Under Divine instruction, the Prophet ﷺ wove Makkan verses (focused on Tawhid, the soul, and the Hereafter) alongside Madinan verses (focused on community, law, and mercy) so every reading balances creed with practice. Modern structural scholars have uncovered intricate ring compositions (nazm) uniting entire surahs and adjacent pairs.',
      simpleAnswer:
        'Because the Qur’an isn’t a chronological diary—it’s a living guidebook. Placing chapters in their divinely guided order balances heart, belief, and practical life together, and even reveals beautiful mirror structures across whole chapters.',
      keywords: ['chronological', 'order', 'arrangement', 'nazm', 'ring', 'structure', 'surahs'],
      followUpIds: ['b18-q5', 'b18-q6'],
    },
    {
      id: 'b18-q5',
      category: 'proof',
      question: 'What is the falsification test in Surah An-Nisa 4:82?',
      simpleQuestion: 'What challenge is God issuing in Surah An-Nisa 4:82?',
      answer:
        'Surah An-Nisa 4:82 boldly invites open scrutiny: "Do they not then reflect deeply upon the Qur’an? Had it been from other than Allah, they would surely have found within it much contradiction." Rather than hiding from critical reading, the Qur’an turns deep study (tadabbur) into the very proof of its Divine origin.',
      simpleAnswer:
        'The verse openly invites skeptics to examine the Qur’an closely: if a human wrote it over 23 years, it would be full of contradictions. Instead of fearing questions, the Qur’an invites deep reflection as proof of its truth.',
      keywords: ['4:82', 'an-nisa', 'falsification', 'test', 'tadabbur', 'scrutiny'],
      followUpIds: ['b18-q1', 'b18-q2'],
    },
    {
      id: 'b18-q6',
      category: 'practice',
      question: 'How can I notice the Qur’an’s internal coherence when I read?',
      simpleQuestion: 'How can I start noticing these connections when reading the Qur’an?',
      answer:
        'Try reading a complete medium surah in one sitting—such as Surah Yusuf, Surah Al-Kahf, or Surah Al-Mulk—and compare its opening verses with its closing verses. You will quickly notice themes, keywords, and questions introduced at the start returning in exquisite symmetry at the end.',
      simpleAnswer:
        'Read one whole medium chapter (like Surah Al-Mulk or Surah Yusuf) in one sitting and look at how the very beginning echoes the very end—you’ll start spotting its harmony right away.',
      keywords: ['read', 'notice', 'practice', 'surah', 'yusuf', 'mulk', 'symmetry'],
      followUpIds: ['b18-q3', 'b18-q4'],
    },
  ],

  b5: [
    {
      id: 'b5-q1',
      category: 'objection',
      question: 'Doesn’t trusting Divine provision (Rizq) make people passive or lazy about working hard?',
      simpleQuestion: 'If God already wrote my provision, why should I bother working hard?',
      answer:
        'Never. Islamic tradition separates outward effort (taking the means, asbab) from inward attachment (tawakkul). The Prophet ﷺ told the traveler: "Tie your camel first, and then trust in Allah," and compared reliance to birds that leave their nests empty every morning actively foraging and return full at dusk. You work with excellence while freeing your heart from frantic greed.',
      simpleAnswer:
        'Not at all! The Prophet ﷺ said: "Tie your camel first, then trust Allah." Birds don’t sit in their nests waiting for food—they fly out and work every morning. Trusting God removes panic, never effort.',
      keywords: ['lazy', 'passive', 'work', 'effort', 'camel', 'rizq', 'tawakkul', 'birds'],
      followUpIds: ['b5-q2', 'b5-q3'],
    },
    {
      id: 'b5-q2',
      category: 'objection',
      question: 'If Allah is Al-Razzaq (The Provider), why do some good people still experience poverty?',
      simpleQuestion: 'If God provides for everyone, why do honest people still struggle financially?',
      answer:
        'Rizq is far broader than a bank balance—it includes health, wisdom, loving relationships, integrity, resilience, and barakah (quiet sufficiency). Moreover, wealth in this temporary world is never a measure of Allah’s love—Prophets themselves lived modestly while tyrants held palaces. Poverty often tests both the patience of the tested and the generosity of the wealthy who are commanded to share.',
      simpleAnswer:
        'Provision (Rizq) isn’t just cash—it includes health, peace, love, faith, and blessing in what you have. Also, money is never a scoreboard of God’s love: even the greatest Prophets lived simply. Hardship tests patience and calls on the rest of us to share generously.',
      keywords: ['poverty', 'poor', 'money', 'struggle', 'unfair', 'rich', 'wealth', 'razzaq'],
      followUpIds: ['b5-q3', 'b5-q4'],
    },
    {
      id: 'b5-q3',
      category: 'proof',
      question: 'What does Ibn Ata Allah mean by "The Veil of Wanting"?',
      simpleQuestion: 'Why does wanting more and more keep us from feeling peaceful?',
      answer:
        'Craving creates an optical illusion: it convinces the heart that peace lives permanently in the next milestone—the next salary, title, or approval. Because the ego’s appetite has no natural ceiling, chasing creation endlessly veils you from seeing the abundant gifts already placed in your hands today.',
      simpleAnswer:
        'Constant craving tricks your mind into thinking peace is always one step away—the next raise, the next purchase, the next compliment. That endless chase blinds you to the blessings already right in front of you.',
      keywords: ['veil', 'wanting', 'craving', 'ibn ata allah', 'hikam', 'desire', 'greed', 'hedonic'],
      followUpIds: ['b5-q4', 'b5-q5'],
    },
    {
      id: 'b5-q4',
      category: 'deep',
      question: 'Is it wrong in Islam to have ambition, goals, or desire wealth?',
      simpleQuestion: 'Is it sinful to want success or earn good money?',
      answer:
        'Not at all. Great Companions like Abd al-Rahman ibn Awf and Khadijah رضي الله عنهما were remarkably successful merchants who used their wealth to uplift the community. Islam asks only one crucial placement: keep the world in your hand, never on the throne of your heart.',
      simpleAnswer:
        'Not at all—many great Companions were successful businesspeople who funded charity and helped others. Islam just asks that you keep money in your hand as a tool, never in your heart as your master.',
      keywords: ['ambition', 'goals', 'success', 'wealth', 'sin', 'business', 'halal'],
      followUpIds: ['b5-q1', 'b5-q5'],
    },
    {
      id: 'b5-q5',
      category: 'deep',
      question: 'What is Barakah, and why does less sometimes feel like more?',
      simpleQuestion: 'What does Barakah (blessing) actually feel like in real life?',
      answer:
        'Barakah is unseen Divine expansion inside time, income, or peace—where a modest hour accomplishes calm clarity or a humble meal satisfies deeply, whereas restless excess leaves an empty ache. Barakah grows through honesty, gratitude (shukr), charity, and remembering Allah.',
      simpleAnswer:
        'Barakah is when a little stretches further than expected—a modest income covers your needs with peace, or one focused hour brings real joy. It grows through gratitude, honesty, and giving to others.',
      keywords: ['barakah', 'blessing', 'enough', 'contentment', 'qanaah', 'sufficiency'],
      followUpIds: ['b5-q3', 'b5-q6'],
    },
    {
      id: 'b5-q6',
      category: 'practice',
      question: 'How can I quiet financial or career anxiety right now?',
      simpleQuestion: 'What practical step helps when I feel anxious about money or the future?',
      answer:
        'Write down the two concrete actions within your control today, execute them calmly, and consciously hand the outcome over to Al-Razzaq with "Hasbunallahu wa ni‘mal-wakil" (Allah is sufficient for us, and He is the best Disposer of affairs). Separate your effort from your anxiety.',
      simpleAnswer:
        'Write down the one or two practical steps you can take today, do them honestly, and hand the final outcome to God. Remind yourself: my job is sincere effort; the result belongs to Allah.',
      keywords: ['anxiety', 'career', 'worry', 'stress', 'practical', 'dua', 'control'],
      followUpIds: ['b5-q1', 'b5-q5'],
    },
  ],

  b6: [
    {
      id: 'b6-q1',
      category: 'objection',
      question: 'Isn’t saying "everything happens for a reason" just a cliché that glosses over real pain?',
      simpleQuestion: 'Doesn’t "trust God’s timing" minimize how much real pain hurts?',
      answer:
        'True Islamic wisdom never asks you to pretend pain doesn’t hurt. Prophet Ya‘qub عليه السلام wept until his eyes turned white with grief, and the Prophet ﷺ wept openly at the loss of his son while saying, "The eyes shed tears and the heart grieves, yet we say only what pleases our Lord." Trusting Divine wisdom honors your tears while anchoring you to the certainty that your pain is neither meaningless nor wasted.',
      simpleAnswer:
        'Never. Islam never tells you to fake a smile. Even the Prophet ﷺ cried openly when his son passed away. Trusting God’s wisdom doesn’t erase the ache—it simply promises that your hurt is seen, meaningful, and never wasted.',
      keywords: ['pain', 'cliche', 'toxic positivity', 'grief', 'suffering', 'gloss over', 'hurts'],
      followUpIds: ['b6-q2', 'b6-q3'],
    },
    {
      id: 'b6-q2',
      category: 'objection',
      question: 'Why would a Loving God delay something good I have been praying for earnestly?',
      simpleQuestion: 'If I’m praying for something good, why does God make me wait?',
      answer:
        'Our vision sees only a single frame; Allah sees the entire horizon of your life and eternity. A delay can be protection from an unseen harm, a season building the maturity needed to carry the gift without breaking, a redirect toward something far better, or an invitation keeping your heart in intimate conversation with Him longer.',
      simpleAnswer:
        'We only see today’s snapshot; God sees your whole future. Sometimes a delay protects you from hidden harm, builds the strength you need to handle the blessing, or leads you to something much better than what you asked for.',
      keywords: ['delay', 'waiting', 'dua', 'unanswered prayer', 'why wait', 'loving god'],
      followUpIds: ['b6-q3', 'b6-q4'],
    },
    {
      id: 'b6-q3',
      category: 'deep',
      question: 'Are sincere prayers ever truly "unanswered" in Islam?',
      simpleQuestion: 'Does God really answer every sincere dua?',
      answer:
        'The Prophet ﷺ taught that no sincere dua is ever lost. Allah answers it in one of three merciful ways: He grants the exact request in His timing, He wards off an equivalent unseen harm from your path, or He stores it as an immense reward awaiting you on the Day of Judgment—when people will wish even more of their prayers had been saved for eternity.',
      simpleAnswer:
        'Yes—the Prophet ﷺ taught that every sincere prayer is answered in one of three ways: you receive what you asked for, God quietly blocks a hidden harm heading your way, or He saves an even greater reward for you in the Next Life.',
      keywords: ['unanswered', 'dua', 'prayer', 'three ways', 'hadith', 'response'],
      followUpIds: ['b6-q4', 'b6-q5'],
    },
    {
      id: 'b6-q4',
      category: 'proof',
      question: 'How does Imam Al-Shafi‘i’s view of Qadar reconcile human choice with Divine decree?',
      simpleQuestion: 'If God already knows the outcome, do my choices still matter?',
      answer:
        'Allah’s knowledge encompasses your free choices without forcing them—just as a weather satellite knowing tomorrow’s storm does not cause the wind to blow. You choose freely, strive sincerely, and pray boldly; and once an outcome unfolds beyond your control, you rest peacefully in Qadar knowing nothing slipped past Al-Hakim.',
      simpleAnswer:
        'God knowing what you will choose doesn’t force your hand—just like knowing the sun will rise doesn’t push the sun up. Your choices, prayers, and effort genuinely matter; and once something is out of your hands, Qadar brings peace.',
      keywords: ['qadar', 'free will', 'destiny', 'predestination', 'choices', 'shafii', 'decree'],
      followUpIds: ['b6-q5', 'b6-q6'],
    },
    {
      id: 'b6-q5',
      category: 'deep',
      question: 'What does Surah Al-Baqarah 2:216 teach about human judgment?',
      simpleQuestion: 'Why does the Qur’an say we might hate something that is good for us?',
      answer:
        'Surah Al-Baqarah 2:216 ("Perhaps you dislike a thing and it is good for you; and perhaps you love a thing and it is bad for you. And Allah knows, while you know not") reminds us how frequently hindsight vindicates closed doors. Almost every adult can look back at least once and thank God for a prayer that did NOT happen the way they begged for.',
      simpleAnswer:
        'Almost everyone can look back on a heartbreak or closed door from years ago and say, "Thank God that didn’t work out—it led me somewhere better." Verse 2:216 reminds us of that truth before hindsight even arrives.',
      keywords: ['2:216', 'closed door', 'hindsight', 'hate', 'love', 'good for you', 'judgment'],
      followUpIds: ['b6-q2', 'b6-q6'],
    },
    {
      id: 'b6-q6',
      category: 'practice',
      question: 'How do I stay patient during a long season of waiting without growing bitter?',
      simpleQuestion: 'How do I keep hope alive when I have been waiting a very long time?',
      answer:
        'Bring the bitterness itself honestly to Allah in sujood instead of hiding it. Pair Istikhara (asking Allah to choose what is best) with small daily acts of service to others—helping someone else’s burden breaks the tunnel vision of waiting and keeps the heart soft.',
      simpleAnswer:
        'Tell God honestly in prayer that waiting feels heavy—don’t bottle it up. Pray Istikhara, stay open to new doors, and do one kind thing for someone else today to keep your heart soft and hopeful.',
      keywords: ['patient', 'sabr', 'waiting', 'bitter', 'hope', 'istikhara', 'practice'],
      followUpIds: ['b6-q1', 'b6-q3'],
    },
  ],

  b7: [
    {
      id: 'b7-q1',
      category: 'objection',
      question: 'If I feel happy when people thank or praise me, does that mean my intention is ruined?',
      simpleQuestion: 'If I feel good when someone compliments my good deed, did I lose my reward?',
      answer:
        'Not at all. The Prophet ﷺ was asked directly about a person who does a good deed sincerely and people happen to praise them; he replied: "That is the early glad tidings for the believer" (Sahih Muslim). Riya’ (showing off) is performing the deed FOR applause—not feeling natural human warmth when kindness is appreciated.',
      simpleAnswer:
        'No! Someone asked the Prophet ﷺ that exact question, and he said being praised for a sincere deed is simply early good news from God. Showing off means doing something ONLY to impress people—not feeling warm when someone says thank you.',
      keywords: ['praise', 'thank', 'riya', 'showing off', 'intention', 'ruined', 'compliment', 'ikhlas'],
      followUpIds: ['b7-q2', 'b7-q3'],
    },
    {
      id: 'b7-q2',
      category: 'objection',
      question: 'Should I stop doing good deeds in public so I never risk showing off?',
      simpleQuestion: 'Should I avoid doing good in front of people just in case I show off?',
      answer:
        'Classical scholar Al-Fudayl ibn ‘Iyad warned that abandoning a good deed because of people is itself a trap of the ego! The cure is not hiding from public good—especially when visible charity or prayer inspires others—but keeping secret good deeds alongside public ones and renewing your intention silently before, during, and after.',
      simpleAnswer:
        'No—stopping good deeds because you worry about what people think is another trick of the ego. Do good openly when it helps or inspires others, keep private good deeds no one knows about, and quietly remind your heart who you are doing it for.',
      keywords: ['public', 'stop', 'avoid', 'secret', 'charity', 'fudayl', 'ego'],
      followUpIds: ['b7-q3', 'b7-q4'],
    },
    {
      id: 'b7-q3',
      category: 'proof',
      question: 'How does Al-Muhasibi’s daily self-audit (Muhasabah) differ from harsh self-criticism or guilt?',
      simpleQuestion: 'Isn’t checking my intentions all the time stressful or overly harsh?',
      answer:
        'Al-Muhasibi framed Muhasabah like a caring merchant checking the day’s ledger—not an enemy hunting for flaws to despair over. True self-audit is calm, honest, and hopeful: you name one slip, ask Allah’s mercy immediately, thank Him for what went right, and adjust tomorrow gently. Despair comes from the ego, not from accountability.',
      simpleAnswer:
        'Checking your heart shouldn’t feel like beating yourself up. Think of it like checking a compass on a hike: you calmly notice if you drifted a few degrees, smile, ask God’s help, and gently steer back on course.',
      keywords: ['guilt', 'harsh', 'stressful', 'muhasabah', 'self-audit', 'compassion', 'shame'],
      followUpIds: ['b7-q4', 'b7-q5'],
    },
    {
      id: 'b7-q4',
      category: 'deep',
      question: 'How do I tell the difference between genuine sincerity and subtle ego?',
      simpleQuestion: 'How can I tell if my intention is actually sincere?',
      answer:
        'Use the "unseen mirror" test: ask yourself quietly, "Would I still value this action if no human ever found out, or if someone else received the credit?" If the answer feels slightly uncomfortable, don’t panic—that honest flicker of awareness is already the beginning of purification.',
      simpleAnswer:
        'Ask one simple question: "Would I still feel glad I did this if nobody ever found out?" Even noticing a tiny tug of ego is actually a healthy sign—it means your heart is awake and honest.',
      keywords: ['test', 'sincere', 'ikhlas', 'ego', 'credit', 'difference', 'how to tell'],
      followUpIds: ['b7-q5', 'b7-q6'],
    },
    {
      id: 'b7-q5',
      category: 'deep',
      question: 'What does Surah Ghafir 40:19 ("He knows the stealthy glance and what chests conceal") mean?',
      simpleQuestion: 'Isn’t it scary that God sees every hidden motive inside my chest?',
      answer:
        'It brings awe to hypocrisy, yet immense comfort to honesty. Because Allah sees straight into the chest, you never have to perform a polished mask for Him—He sees every quiet battle you fought against temptation, every tear you swallowed, and every imperfect attempt you made purely to draw closer to Him.',
      simpleAnswer:
        'It’s actually deeply comforting for sincere hearts: you never have to put on an act for God. He sees every invisible effort you made, every bad impulse you resisted, and every quiet prayer nobody else ever noticed.',
      keywords: ['40:19', 'ghafir', 'conceal', 'scary', 'hidden', 'motive', 'seen'],
      followUpIds: ['b7-q3', 'b7-q6'],
    },
    {
      id: 'b7-q6',
      category: 'practice',
      question: 'What is a simple two-minute evening self-audit I can actually stick to?',
      simpleQuestion: 'How do I do a quick nightly check-in with my heart?',
      answer:
        'Before sleep, ask three quiet questions: (1) What is one moment today I am grateful to Allah for? (2) Where did I act out of haste, pride, or neglect—and let me say Astaghfirullah right now? (3) What is one quiet intention I will carry into tomorrow morning?',
      simpleAnswer:
        'Before bed, take two quiet minutes and ask: What am I grateful for today? What one slip can I ask forgiveness for right now? And what one good intention do I want for tomorrow?',
      keywords: ['evening', 'night', 'routine', 'two minute', 'practice', 'sleep', 'habit'],
      followUpIds: ['b7-q1', 'b7-q3'],
    },
  ],

  b8: [
    {
      id: 'b8-q1',
      category: 'objection',
      question: 'If Allah is always near (57:4), why do I sometimes feel spiritually dry or distant in prayer?',
      simpleQuestion: 'If God is always close to me, why do I sometimes feel nothing during prayer?',
      answer:
        'Allah’s nearness is a steady objective truth, not a fragile emotional mood. Fatigue, stress, grief, or distraction can dull our emotional feelings without moving Allah a single millimeter away—just as the sun still shines above thick clouds. Showing up to pray even when your heart feels dry is actually among the most sincere forms of devotion, because you are coming for Allah Himself, not for a spiritual "high."',
      simpleAnswer:
        'Feeling dry doesn’t mean God left—just like clouds don’t make the sun disappear. Stress, tiredness, or busyness can quiet our emotions, yet showing up to pray anyway is deeply sincere because you are coming for Allah, not just chasing a feeling.',
      keywords: ['dry', 'distant', 'feel nothing', 'numb', 'prayer', 'emotions', 'clouds', 'absence'],
      followUpIds: ['b8-q2', 'b8-q3'],
    },
    {
      id: 'b8-q2',
      category: 'deep',
      question: 'What does Ma‘iyyah (Allah’s "with-ness" in 57:4) mean—is God physically inside objects?',
      simpleQuestion: 'When the Qur’an says Allah is with us everywhere, does that mean God is inside physical objects?',
      answer:
        'Classical Sunni theology clarifies this beautifully: Allah is transcendent above His creation (not mixed into physical matter or pantheism), while His Ma‘iyyah—His complete Knowledge, Hearing, Seeing, Sustaining, and special Loving Support for believers—encompasses every point in existence simultaneously. Nothing is hidden from Him, yet He remains utterly exalted above creation.',
      simpleAnswer:
        'No—God is not mixed inside trees or walls. Allah is exalted above His creation, yet He is completely with us through His perfect Knowledge, Hearing, Care, and Loving Support—closer to us than we are to ourselves.',
      keywords: ['maiyyah', 'pantheism', 'where is god', 'transcendent', 'inside', '57:4', 'aqidah'],
      followUpIds: ['b8-q3', 'b8-q4'],
    },
    {
      id: 'b8-q3',
      category: 'objection',
      question: 'If I have sinned badly, is Allah still near to me or has He turned away?',
      simpleQuestion: 'Does God push me away when I mess up or fall into sin?',
      answer:
        'The Qur’an answers with overwhelming tenderness: "Say, O My servants who have transgressed against themselves, do not despair of the mercy of Allah" (39:53). Sin clouds OUR awareness of Him, yet the very ache of regret inside your chest is already His merciful invitation pulling you home. The door of return stays wide open until your final breath.',
      simpleAnswer:
        'Never. Sin makes US feel ashamed and hide, but Allah calls out warmly: "Do not despair of Allah’s mercy" (39:53). Even the quiet ache you feel after a mistake is His mercy calling you straight back home.',
      keywords: ['sin', 'sinned', 'mess up', 'forgive', 'ashamed', 'turned away', 'mercy', '39:53'],
      followUpIds: ['b8-q4', 'b8-q5'],
    },
    {
      id: 'b8-q4',
      category: 'proof',
      question: 'What is the difference between praying out of routine and praying with Ihsan (Presence)?',
      simpleQuestion: 'How do I move from rushing through prayers to actually feeling present?',
      answer:
        'The Prophet ﷺ defined Ihsan as worshiping Allah "as though you see Him, and though you do not see Him, know that He sees you." Routine rushes to finish a checklist; Ihsan slows down the first Takbir and Al-Fatihah for ten unhurried seconds, remembering that the Lord of the Worlds is personally listening to every word you whisper.',
      simpleAnswer:
        'Routine treats prayer like checking off a box. Presence (Ihsan) starts by slowing down for just ten seconds at "Allahu Akbar," taking one calm breath, and remembering that Allah is personally listening to every word of Al-Fatihah.',
      keywords: ['ihsan', 'khushu', 'presence', 'focus', 'rushing', 'routine', 'salah'],
      followUpIds: ['b8-q5', 'b8-q6'],
    },
    {
      id: 'b8-q5',
      category: 'deep',
      question: 'What did Al-Junayd al-Baghdadi mean by cultivating presence in ordinary moments?',
      simpleQuestion: 'Can I feel God’s presence outside the prayer mat, like at work or commuting?',
      answer:
        'Yes—the highest remembrance is not fleeing the world into a cave, but carrying a quiet sanctuary inside your chest while engaging the world honestly. Whether washing dishes, answering an email, or walking down a crowded street, a single whispered "Bismillah" or "SubhanAllah" turns ordinary motion into sacred presence.',
      simpleAnswer:
        'Absolutely. You don’t need a quiet mountain to be near God—whispering "Bismillah" before a task or "Alhamdulillah" during a commute turns ordinary everyday moments into quiet worship.',
      keywords: ['junayd', 'ordinary', 'work', 'commute', 'dhikr', 'daily', 'outside prayer'],
      followUpIds: ['b8-q4', 'b8-q6'],
    },
    {
      id: 'b8-q6',
      category: 'practice',
      question: 'What is one simple anchor to remember Allah’s nearness when loneliness hits?',
      simpleQuestion: 'What can I do right away when I feel deeply alone?',
      answer:
        'Place your hand over your chest, recall Surah Qaf 50:16 ("We are closer to him than his jugular vein") and Al-Baqarah 2:186 ("Indeed, I am near"), and speak to Allah out loud in plain, unscripted words as you would to the most compassionate listener who already understands what you cannot even phrase.',
      simpleAnswer:
        'Take a slow breath, remember "Indeed, I am near" (2:186), and talk to Allah in plain, honest words—just telling Him exactly what feels heavy right now. You are never unseen.',
      keywords: ['lonely', 'loneliness', 'alone', 'comfort', '2:186', 'jugular', 'practice'],
      followUpIds: ['b8-q1', 'b8-q3'],
    },
  ],
};
