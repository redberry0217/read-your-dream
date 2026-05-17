import fs from 'fs';

const categories = ["Major", "Wands", "Cups", "Swords", "Pentacles"];
const cards = [];

// Major Arcana (0-21)
const majorNames = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

majorNames.forEach((name, i) => {
  cards.push({
    id: i,
    name: `${name} (${i})`,
    category: "Major",
    keywords: "Upright Keywords",
    keywordsRev: "Reversed Keywords",
    meaningUpright: "Standard upright meaning.",
    meaningReversed: "Standard reversed meaning.",
    practicalAdvice: "Practical advice for this card.",
    orientalVibe: "Oriental vibe description."
  });
});

// Minor Arcana (22-77)
const suites = ["Wands", "Cups", "Swords", "Pentacles"];
const ranks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

let id = 22;
suites.forEach(suite => {
  ranks.forEach(rank => {
    cards.push({
      id: id++,
      name: `${rank} of ${suite}`,
      category: suite,
      keywords: "Upright Keywords",
      keywordsRev: "Reversed Keywords",
      meaningUpright: "Standard upright meaning.",
      meaningReversed: "Standard reversed meaning.",
      practicalAdvice: "Practical advice for this card.",
      orientalVibe: "Oriental vibe description."
    });
  });
});

// Special cases from user
const special = [
  {
    "id": 16,
    "name": "The Tower (탑)",
    "category": "Major",
    "keywords": "갑작스러운 변화, 붕괴, 충격",
    "keywordsRev": "지연되는 재난, 위기 모면, 정체",
    "meaningUpright": "쌓아온 것이 무너지는 시기입니다. 외부의 압력으로 현재 상황이 강제 종료될 수 있습니다.",
    "meaningReversed": "위기가 완전히 끝나지 않고 질질 끌리는 상태입니다. 고통스럽더라도 스스로 정리해야 합니다.",
    "practicalAdvice": "감정적으로 매달리지 말고 지금 바로 '손절'하세요. 새로 짓기 위해서는 완전히 허물어야 합니다."
  },
  {
    "id": 40,
    "name": "3 of Swords (상심의 검)",
    "category": "Swords",
    "keywords": "이별, 상처, 비통함",
    "keywordsRev": "회복의 시작, 억눌린 슬픔, 과거의 잔재",
    "meaningUpright": "현실적인 판단이 마음을 아프게 합니다. 관계나 프로젝트에서 뼈아픈 실책이 드러납니다.",
    "meaningReversed": "상처를 외면하고 있습니다. 치유되지 않은 문제가 나중에 더 큰 화근이 됩니다.",
    "practicalAdvice": "울고 싶으면 울되, 숫자는 속이지 마세요. 현실적인 손실을 먼저 계산하고 다음을 도모하십시오."
  }
];

special.forEach(s => {
  const index = cards.findIndex(c => c.id === s.id);
  if (index !== -1) cards[index] = { ...cards[index], ...s };
});

fs.writeFileSync('./data/tarot-metadata.json', JSON.stringify(cards, null, 2));
console.log("Generated 78 cards.");
