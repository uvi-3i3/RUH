const fs = require('fs');

const dataRaw = fs.readFileSync('./public/data/content.json', 'utf8');
const data = JSON.parse(dataRaw);

const simpleMap = {
  // Sabr
  "s1v1": {
    "simpleT": "God does not give a person\\nmore than they can handle.",
    "simpleC": "A promise of human strength. It means if you are facing a problem right now, God knows you already have the ability to survive it."
  },
  "s1v2": {
    "simpleT": "With every hardship\\ncomes ease.",
    "simpleC": "For every one difficulty you face, multiple ways of relief are already being created for you."
  },
  "s1v3": {
    "simpleT": "The strong person is not the fighter, but the one who controls themselves when angry.",
    "simpleC": "True strength is not physical power, but how well you control your emotions during very hard moments."
  },
  "s1v4": {
    "simpleT": "Indeed, actions are judged\\nby their intentions.",
    "simpleC": "The real value of any action is judged entirely by the hidden reason behind why you did it."
  },
  "s1h1": {
    "simpleT": "To get what you love, you must first be patient with what you hate.",
    "simpleC": "A deep truth about success. Growing spiritually and emotionally means you must walk through hard discipline first."
  },
  
  // Shukr
  "s2v1": {
    "simpleT": "Is there any reward for good\\nexcept good?",
    "simpleC": "A universal rule. Every bit of kindness you put into the world will return back to you in ways you might not expect."
  },
  "s2v2": {
    "simpleT": "Read the Quran, because it will come on the Day of Judgment to defend its readers.",
    "simpleC": "The text is not just for reading; deeply interacting with it turns the book into your protector in the afterlife."
  },
  "s2v3": {
    "simpleT": "Make things easy for people, give good news, and do not push them away.",
    "simpleC": "Faith should be welcoming and accessible. We should not make religion feel like a heavy burden to others."
  },
  "s2v4": {
    "simpleT": "If you believe in God, either speak good words or stay silent.",
    "simpleC": "A basic rule of self-control. Silence is much better than words that cause harm. Always think before you speak."
  },
  "s2h1": {
    "simpleT": "If you don't show thanks for a blessing, you might lose it. But if you give thanks, you tie it down so it stays.",
    "simpleC": "Gratitude is not just being polite—it is the direct way to protect the good things you have and get even more."
  },
  
  // Tawakkul
  "s3v1": {
    "simpleT": "We are closer to him\\nthan his neck vein.",
    "simpleC": "A reminder that God is always near. God's presence is closer to us than our own blood, offering comfort when we feel alone."
  },
  "s3v2": {
    "simpleT": "And whoever trusts God,\\nHe is enough for them.",
    "simpleC": "When you stop trying to control everything and give your worries to God, He provides a safety net that no human effort can match."
  },
  "s3v3": {
    "simpleT": "A true believer is someone who does not hurt others with their words or hands.",
    "simpleC": "Faith is not only what is in your heart. The biggest proof of your faith is that you are completely safe and harmless to others."
  },
  "s3v4": {
    "simpleT": "Religion is sincerity\\nand giving good advice.",
    "simpleC": "The core of faith is having a pure, caring, and honest attitude toward God and all other people."
  },
  "s3h1": {
    "simpleT": "True sincerity is when you don't care if people praise you or insult you.",
    "simpleC": "The ultimate test of your ego. When human approval and human hate both make you feel the same, you have finally found freedom."
  },

  // Tawbah
  "s4v1": {
    "simpleT": "Say: O My servants who have hurt themselves by sinning, do not give up hope in God's mercy.",
    "simpleC": "A comforting promise. God calls sinners 'My servants' to show that no matter how much you sinned, He still claims you as His own."
  },
  "s4v2": {
    "simpleT": "Fear God wherever you are. Follow a bad deed with a good one to erase it, and treat people nicely.",
    "simpleC": "A complete guide on how to act. Fix your mistakes immediately with good actions, and always hold high morals with everyone."
  },
  "s4v3": {
    "simpleT": "He is the One who accepts regret\\nfrom His servants and excuses sins.",
    "simpleC": "God does not just wait for you to say sorry—He actively wants to accept it and completely erase the mistake."
  },
  "s4v4": {
    "simpleT": "God is happier when you return to Him than a man who loses his camel in a deadly desert and suddenly finds it.",
    "simpleC": "A beautiful view of God's love. He is not a mean judge waiting to punish; He feels incredible joy the moment you turn back to Him."
  },
  "s4h1": {
    "simpleT": "Nothing helps you more than complete desperation. Brokenness is the fastest way to get God's gifts.",
    "simpleC": "Oddly, your moments of extreme hurt and brokenness are your most powerful moments. Coming to God empty-handed brings His grace fastest."
  }
};

data.stations.forEach(station => {
  station.verses.forEach(verse => {
    if (simpleMap[verse.id]) {
      verse.simpleT = simpleMap[verse.id].simpleT;
      verse.simpleC = simpleMap[verse.id].simpleC;
    }
  });
});

fs.writeFileSync('./public/data/content.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully injected Simple English fields.');
