import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TarotCardDef {
  id: number;
  name: string;
  category: string;
  keywords: string;
  keywordsRev: string;
  meaningUpright: string;
  meaningReversed: string;
  practicalAdvice: string;
  orientalVibe: string;
}

const cards: TarotCardDef[] = [
  // ==========================================
  // Major Arcana (0 ~ 21)
  // ==========================================
  {
    id: 0,
    name: "The Fool (0. 바보)",
    category: "Major",
    keywords: "새로운 시작, 순수, 모험, 무한한 잠재력",
    keywordsRev: "무모함, 충동적, 현실 도피, 무책임",
    meaningUpright: "아무런 선입견 없이 새로운 여정에 발을 내딛는 때요. 가진 것은 보따리 하나뿐이나 영혼은 가볍고 가능성은 열려 있도다.",
    meaningReversed: "발밑이 깎아지른 낭떠러지인 줄도 모르고 헛된 낙관에 취해 있소. 대책 없는 낙천은 용기가 아니라 무책임한 회피일 뿐이라.",
    practicalAdvice: "당장 충동적인 결정을 멈추고, 오늘 발을 디딜 현실의 디딤돌부터 두드려보고 건너시오.",
    orientalVibe: "수(水)의 정처 없는 유랑. 물길이 어디로 흐를지 모르니 둑을 먼저 살펴야 할 징조."
  },
  {
    id: 1,
    name: "The Magician (1. 마법사)",
    category: "Major",
    keywords: "창조력, 숙련, 기회 포착, 잠재력 발휘",
    keywordsRev: "속임수, 미숙함, 허세, 재능 낭비",
    meaningUpright: "지팡이, 컵, 칼, 동전 등 삶의 네 가지 무기를 모두 손에 쥐었소. 머릿속의 구상을 현실에 구현할 만반의 준비가 끝났도다.",
    meaningReversed: "손재주는 화려하나 알맹이가 없소. 그럴듯한 말로 자신과 남을 속이고 있으니 사기(詐氣)가 동할 위험이 크도다.",
    practicalAdvice: "말만 앞세우지 말고, 지금 손에 쥔 도구 하나를 골라 오늘 1시간이라도 결과물을 만들어내시오.",
    orientalVibe: "목(木)의 싹틈. 잠재된 기운이 대지를 뚫고 솟구치니 방향 설정이 가장 중요한 때."
  },
  {
    id: 2,
    name: "The High Priestess (2. 여사제)",
    category: "Major",
    keywords: "직관, 심연의 지혜, 비밀, 무의식 통찰",
    keywordsRev: "냉담함, 비밀주의, 현실 차단, 고립",
    meaningUpright: "장막 뒤에 서서 세상의 이면을 꿰뚫어 보는 때요. 말수를 줄이고 내면의 조용한 음성에 귀를 기울여야 할 징조라.",
    meaningReversed: "속마음을 꽁꽁 닫아걸고 타인을 멸시하고 있소. 알량한 통찰로 사람을 시험하려 들다간 홀로 고립될 것이라.",
    practicalAdvice: "마음의 빗장을 너무 걸어 잠그지 마시오. 타인의 허점을 찌르기 전에 자신의 결핍부터 정직하게 인정하시오.",
    orientalVibe: "수(水)의 깊고 차가운 못. 물밑에 가라앉은 비밀을 직면하되 얼어붙지 않도록 조심할 것."
  },
  {
    id: 3,
    name: "The Empress (3. 왕비)",
    category: "Major",
    keywords: "풍요, 모성, 결실, 감각적 충족",
    keywordsRev: "사치, 과잉 보호, 나태, 게으름",
    meaningUpright: "대지가 곡식을 잉태하듯 온갖 풍요와 감정의 충만이 깃드는 시기요. 그동안 뿌린 정성이 비로소 싹을 틔우고 있도다.",
    meaningReversed: "풍요에 취해 나태해졌거나, 타인에게 집착하며 숨통을 조이고 있소. 과도한 안주는 게으름의 다른 이름이라.",
    practicalAdvice: "누리는 것에만 길들여지지 마시오. 오늘 당장 주변에 흩어진 낭비 요소를 정리하고 절제의 틀을 세우시오.",
    orientalVibe: "토(土)의 비옥한 옥토. 만물을 기르는 자애로움이나 지나치면 잡초가 무성해질 조짐."
  },
  {
    id: 4,
    name: "The Emperor (4. 왕)",
    category: "Major",
    keywords: "규율, 질서, 통제력, 현실적 기반",
    keywordsRev: "독재, 완고함, 지배욕, 통제 불능",
    meaningUpright: "돌좌에 앉아 흔들림 없이 국경을 수호하듯, 엄격한 규율과 책임감으로 삶의 기반을 굳건히 다져야 할 때요.",
    meaningReversed: "자신의 불안을 감추기 위해 주변을 억압하고 있소. 부러질지언정 굽히지 않으려는 완고함이 화를 부를 것이라.",
    practicalAdvice: "타인을 꺾으려 들지 말고, 가장 먼저 그대 자신의 불규칙한 생활 습관부터 통제하시오.",
    orientalVibe: "금(金)의 단단한 바위. 굳건한 뼈대이나 유연성을 잃으면 산산조각 날 수 있음을 경계하라."
  },
  {
    id: 5,
    name: "The Hierophant (5. 교황)",
    category: "Major",
    keywords: "가르침, 도덕, 멘토링, 공동체의 지혜",
    keywordsRev: "교조주의, 편협함, 낡은 관습, 꼰대질",
    meaningUpright: "혼자 끙끙 앓지 말고 검증된 스승이나 원칙에서 길을 찾아야 하오. 옛 성현의 지혜가 해법을 쥐고 있도다.",
    meaningReversed: "낡은 명분에 얽매여 실리를 잃고 있소. 겉치레와 남의 이목에 신경 쓰느라 썩어가는 속을 외면하고 있도다.",
    practicalAdvice: "형식적인 체면치레를 집어치우시오. 지금 당면한 문제를 해결할 실질적인 지혜를 가진 자에게 허리를 숙이시오.",
    orientalVibe: "토(土)의 사당. 엄숙한 예법의 자리이나 생명력을 잃으면 박제가 될 뿐."
  },
  {
    id: 6,
    name: "The Lovers (6. 연인)",
    category: "Major",
    keywords: "선택의 기로, 영혼의 교감, 가치관의 일치",
    keywordsRev: "우유부단, 불협화음, 유혹, 무책임한 갈등",
    meaningUpright: "단순한 남녀의 정을 넘어, 삶의 중대한 갈림길에서 진정한 가치를 택해야 할 시험대요. 온 마음이 하나로 모여야 할 때라.",
    meaningReversed: "양다리를 걸치듯 두 길 사이에서 간만 보고 있소. 유혹에 눈이 멀어 본질을 버리면 둘 다 잃게 될 것이라.",
    practicalAdvice: "결정을 더 이상 미루지 마시오. 가슴 깊은 곳에서 가장 부끄럽지 않은 쪽 하나를 오늘 선택하고 뒤돌아보지 마시오.",
    orientalVibe: "화(火)와 수(水)의 교감. 음양의 조화가 맞아야지, 한쪽으로 치우치면 물이 끓어 넘치거나 불이 꺼지리라."
  },
  {
    id: 7,
    name: "The Chariot (7. 전차)",
    category: "Major",
    keywords: "돌파력, 승리, 강한 의지, 목표 집중",
    keywordsRev: "폭주, 통제 상실, 조급함, 좌절",
    meaningUpright: "흑백의 두 스핑크스를 한 고삐로 다스리듯, 상반된 내면의 갈등을 통제하며 목표를 향해 무섭게 돌진해야 할 때요.",
    meaningReversed: "마음만 급해 브레이크 없는 수레에 몸을 실었소. 이대로 질주하다간 길가의 돌부리에 걸려 수레가 뒤집힐 것이라.",
    practicalAdvice: "속도를 늦추고 고삐를 다시 죄시오. 목표가 올바른지 확인하기 전까지는 함부로 채찍질하지 마시오.",
    orientalVibe: "화(火)의 맹렬한 질주. 화기를 다스리지 못하면 스스로를 태워버리는 격."
  },
  {
    id: 8,
    name: "Strength (8. 힘)",
    category: "Major",
    keywords: "부드러운 내면의 힘, 인내, 용기, 길들임",
    keywordsRev: "무기력, 분노 폭발, 굴복, 자기 불신",
    meaningUpright: "사자의 입을 맨손으로 어루만지듯, 거친 본능과 분노를 부드러운 온유함과 인내로 제압하는 숭고한 용기라.",
    meaningReversed: "내면의 야수에 굴복하여 감정을 통제하지 못하고 있소. 분노를 엉뚱한 곳에 터뜨리거나 제 풀에 지쳐 주저앉을 조짐이라.",
    practicalAdvice: "악을 쓰지 마시오. 지금 필요한 것은 소리를 지르는 것이 아니라, 거친 감정이 가라앉을 때까지 묵묵히 버텨내는 뚝심이오.",
    orientalVibe: "토(土)가 품은 내공. 부드러움이 강함을 이기는 유능제강(柔能制剛)의 도리."
  },
  {
    id: 9,
    name: "The Hermit (9. 은둔자)",
    category: "Major",
    keywords: "자아 성찰, 고독의 지혜, 탐구, 내면의 빛",
    keywordsRev: "외톨이, 고립, 현실 도피, 편협한 집착",
    meaningUpright: "세속의 소음을 차단하고 오직 한 자루 등불에 의지해 깊은 산길을 걷는 선비의 형국이오. 답은 밖이 아니라 그대 안에 있도다.",
    meaningReversed: "세상이 무서워 방구석에 틀어박혀 있소. 성찰을 빙자한 도피는 지혜가 아니라 영혼의 부패를 낳을 뿐이라.",
    practicalAdvice: "어설픈 조언을 구하러 다니지 말고, 오늘 하루 스마트폰과 소음을 끄고 온전히 자신의 일기장과 마주하시오.",
    orientalVibe: "수(水)의 고요한 관조. 얼어붙은 겨울 강물처럼 겉은 고요하나 속에서 지혜를 벼리는 때."
  },
  {
    id: 10,
    name: "Wheel of Fortune (10. 운명의 수레바퀴)",
    category: "Major",
    keywords: "숙명적 전환점, 기회의 순환, 인과의 흐름",
    keywordsRev: "불운, 통제 불가의 저항, 반복되는 악순환",
    meaningUpright: "하늘의 계절이 바뀌듯 운명의 수레바퀴가 큰 궤도를 틀고 있소. 거스를 수 없는 변화의 바람을 타고 기회를 잡을 채비를 하시오.",
    meaningReversed: "과거의 실수를 답습하며 쳇바퀴를 돌고 있소. 굴러떨어지는 운명을 탓하기 전에 그대가 바퀴 살에 박아둔 고집을 뽑으시오.",
    practicalAdvice: "변화를 거부하지 마시오. 이미 끝난 판에 미련 두지 말고, 새롭게 돌아가는 판 위로 과감히 발을 옮기시오.",
    orientalVibe: "오행(五行)의 상생상극 대순환. 영원한 길몽도 영원한 흉몽도 없으니 때를 알아차릴 것."
  },
  {
    id: 11,
    name: "Justice (11. 정의)",
    category: "Major",
    keywords: "냉철한 판결, 인과응보, 균형, 명확한 책임",
    keywordsRev: "불공정, 편견, 가혹한 자책, 책임 회피",
    meaningUpright: "한 손에는 저울, 다른 손에는 칼을 쥐었소. 감정에 휘둘리지 말고 뿌린 대로 거둔다는 냉정한 인과율 앞에 서야 할 때라.",
    meaningReversed: "유리한 것만 챙기고 불리한 진실은 저울 뒤로 숨기고 있소. 스스로를 속이는 판결은 반드시 뒤탈을 낳으리라.",
    practicalAdvice: "감정적인 억울함은 접어두고 냉정하게 숫자를 계산하시오. 시시비비를 가릴 계약과 정산을 오늘 똑바로 매듭지으시오.",
    orientalVibe: "금(金)의 추상같은 서릿발. 사사로운 정을 베어내고 공의를 세우는 추상지열(秋霜之烈)."
  },
  {
    id: 12,
    name: "The Hanged Man (12. 매달린 사람)",
    category: "Major",
    keywords: "자발적 희생, 관점의 전복, 멈춤을 통한 각성",
    keywordsRev: "헛된 고생, 무의미한 희생, 미련한 집착",
    meaningUpright: "나무에 거꾸로 매달려 세상을 뒤집어 보는 순교자의 지혜요. 지금의 멈춤은 패배가 아니라 새로운 눈을 뜨기 위한 웅크림이라.",
    meaningReversed: "아무도 알아주지 않는 헛된 고난에 빠져 피해자 코스프레를 하고 있소. 밧줄을 묶은 것은 남이 아니라 바로 그대 자신이오.",
    practicalAdvice: "발버둥 치지 마시오. 억지로 밀어붙여도 풀리지 않으니, 집착하던 방식을 정반대로 뒤집어 생각해보시오.",
    orientalVibe: "수(水)의 침잠. 깊은 물속에 잠겨 숨을 고르며 봄을 기다리는 씨앗의 형국."
  },
  {
    id: 13,
    name: "Death (13. 죽음)",
    category: "Major",
    keywords: "필연적 종말, 낡은 것의 청산, 거대한 부활",
    keywordsRev: "미련, 정체, 썩어가는 부패, 변화 거부",
    meaningUpright: "해가 지고 밤이 오듯 한 시대의 막이 내렸소. 썩은 살을 도려내지 않고는 결코 새살이 돋을 수 없음을 명심하시오.",
    meaningReversed: "이미 숨이 끊어진 관계나 일에 매달려 인공호흡기를 붙잡고 있소. 놓아주지 못하는 미련이 영혼을 갉아먹고 있도다.",
    practicalAdvice: "오늘 당장 버려야 할 것들의 목록을 적고 영구히 작별을 고하시오. 끝내야만 비로소 시작될 수 있소.",
    orientalVibe: "금(金)의 숙살지기(肅殺之氣)와 수(水)의 잉태. 낙엽이 져야 이듬해 꽃이 피는 자연의 섭리."
  },
  {
    id: 14,
    name: "Temperance (14. 절제)",
    category: "Major",
    keywords: "중용의 조화, 감정의 연금술, 인내와 치유",
    keywordsRev: "불균형, 과도함, 성급한 혼합, 갈등",
    meaningUpright: "물과 불이라는 상극의 두 잔을 조심스레 오가며 황금빛 균형을 빚어내는 때요. 격정을 가라앉히고 중용을 지키시오.",
    meaningReversed: "극단으로 치닫고 있소. 술을 물에 타듯 본질을 흐리거나, 성급하게 뒤섞어 죽도 밥도 안 되게 망치고 있도다.",
    practicalAdvice: "급발진을 멈추시오. 오늘 하루만큼은 극단적인 언행을 삼가고, 상대와 나의 온도를 천천히 맞추어가시오.",
    orientalVibe: "음양(陰陽)의 화합. 수화기제(水火旣濟)의 평화로운 조율."
  },
  {
    id: 15,
    name: "The Devil (15. 악마)",
    category: "Major",
    keywords: "물질적 결박, 유혹, 맹목적 집착, 그림자 자아",
    keywordsRev: "사슬의 자각, 해방의 시작, 중독 극복",
    meaningUpright: "스스로 걸어둔 욕망의 쇠사슬에 묶여 옴짝달싹 못하고 있소. 돈, 정욕, 인정 욕구라는 달콤한 독에 취해 있음을 자각하시오.",
    meaningReversed: "쇠사슬이 느슨해졌음을 비로소 깨닫기 시작했소. 어둠의 실체를 보았으니 이제 떨치고 일어날 용기만 내면 될 것이라.",
    practicalAdvice: "그대를 조종하고 있는 은밀한 나쁜 습관이나 유독한 관계를 직시하시오. 오늘 당장 그 사슬을 끊는 첫 조치를 취하시오.",
    orientalVibe: "토(土)의 탁한 늪. 탐욕과 집착에 발이 빠지면 발버둥 칠수록 더 깊이 가라앉는 법."
  },
  {
    id: 16,
    name: "The Tower (16. 탑)",
    category: "Major",
    keywords: "벼락같은 충격, 거짓 기반의 붕괴, 급격한 변화",
    keywordsRev: "지연되는 재난, 위기 모면, 위태로운 연명",
    meaningUpright: "모래 위에 쌓아 올린 바벨탑에 하늘의 벼락이 내리꽂혔소. 오만과 착각으로 지은 성벽은 완전히 무너져야 마땅하오.",
    meaningReversed: "벽에 금이 가고 기둥이 삐걱거리는데도 괜찮다며 땜질만 하고 있소. 어설픈 봉합은 더 처참한 붕괴를 부를 뿐이라.",
    practicalAdvice: "감정적으로 매달리지 말고 지금 바로 깨끗이 손절하시오. 완전히 허물어진 잿더미 위에서만 정직한 집을 지을 수 있소.",
    orientalVibe: "화(火)의 천둥벼락. 낡은 질서를 강제로 소멸시키는 천벌이자 축복의 정화."
  },
  {
    id: 17,
    name: "The Star (17. 별)",
    category: "Major",
    keywords: "어둠 속의 희망, 영적 정화, 비전, 치유",
    keywordsRev: "뜬구름 잡는 망상, 비관주의, 실망, 영적 메마름",
    meaningUpright: "칠흑 같은 밤하늘에 맑고 차가운 북극성이 떠올랐소. 오랜 상처가 아물고 영혼의 갈증을 축여줄 새로운 비전이 열릴 것이라.",
    meaningReversed: "하늘의 별만 멍하니 바라보며 걷다 진흙탕에 빠졌소. 실천 없는 이상주의는 현실의 궁핍만을 가중시킬 뿐이라.",
    practicalAdvice: "희망을 품되 발은 땅에 딛으시오. 머릿속의 아름다운 청사진을 오늘 실행 가능한 구체적 계획서로 적어 내리시오.",
    orientalVibe: "수(水)의 맑은 옹달샘. 메마른 심신을 씻어내는 정화의 감로수."
  },
  {
    id: 18,
    name: "The Moon (18. 달)",
    category: "Major",
    keywords: "무의식의 안개, 불안과 공포, 환각, 숨겨진 진실",
    keywordsRev: "안개의 걷힘, 불안의 실체 파악, 속임수 폭로",
    meaningUpright: "물가에서 늑대와 개가 달을 보며 울부짖듯, 억눌린 불안과 의심이 안개처럼 피어오르는 형국이오. 아무것도 확신할 수 없도다.",
    meaningReversed: "두려움의 정체가 실은 마음이 지어낸 허깨비였음이 드러나고 있소. 속임수와 착각에서 벗어나 밝은 길로 나설 때라.",
    practicalAdvice: "어두울 때는 함부로 칼을 휘두르지 마시오. 중요한 계약이나 판단은 안개가 걷히고 날이 밝을 때까지 보류하시오.",
    orientalVibe: "수(水)의 음산한 밤안개. 실체가 없는 두려움에 사로잡히지 말라는 도사의 경고."
  },
  {
    id: 19,
    name: "The Sun (19. 태양)",
    category: "Major",
    keywords: "명료한 광명, 환희, 성공, 순수한 생명력",
    keywordsRev: "자만심, 경솔함, 거짓 낙관, 에너지 고갈",
    meaningUpright: "백마를 탄 어린아이 머리 위로 찬란한 태양이 쏟아지듯, 모든 어둠과 오해가 걷히고 영광스러운 성공과 기쁨이 도래할 조짐이오.",
    meaningReversed: "빛이 너무 강해 눈이 멀었거나 오만에 취해 있소. 어린아이 같은 유치함으로 세상을 대하다간 뒤통수를 맞으리라.",
    practicalAdvice: "기쁨을 누리되 자만하지 마시오. 밝은 대낮일수록 그림자 또한 짙어지는 법이니 겸손함을 잃지 마시오.",
    orientalVibe: "화(火)의 정오의 태양. 만물을 비추는 양기(陽氣)의 극치."
  },
  {
    id: 20,
    name: "The Judgement (20. 심판)",
    category: "Major",
    keywords: "영혼의 각성, 결산의 나팔, 과거 청산, 해방",
    keywordsRev: "자책감, 부름 외면, 미결의 후회, 결단 지연",
    meaningUpright: "하늘에서 나팔 소리가 울려 퍼지니 무덤 속에 누워 있던 영혼들이 일어나는 때요. 오랜 인과의 결산이 끝나고 새로운 삶으로 부름받았도다.",
    meaningReversed: "스스로에게 가혹한 형벌을 내리며 자책의 감옥에 갇혀 있소. 기회가 왔는데도 과거의 허물에 얽매여 나팔 소리를 외면하고 있도다.",
    practicalAdvice: "과거의 망령을 이제 그만 땅에 묻으시오. 새사람이 될 기회이니, 미뤄두었던 고백이나 결단을 오늘 완수하시오.",
    orientalVibe: "금(金)의 청아한 종소리. 묵은 업장을 털어내고 환골탈태하는 찰나."
  },
  {
    id: 21,
    name: "The World (21. 세계)",
    category: "Major",
    keywords: "완벽한 통합, 대단원의 완성, 성취, 새로운 차원",
    keywordsRev: "미완의 결말, 마지막 문턱의 정체, 안주",
    meaningUpright: "수레바퀴를 둘러싼 월계관 안에서 춤을 추듯, 한 생애의 거대한 여정이 완전한 승리와 통합으로 매듭지어지는 순간이오.",
    meaningReversed: "거의 다 왔는데 마지막 9부 능선에서 발을 멈췄소. 매듭을 짓지 않은 채 안주하면 처음부터 다시 시작해야 할 것이라.",
    practicalAdvice: "벌여놓은 일의 마지막 마침표를 찍으시오. 완벽을 핑계로 끝맺음을 미루지 말고 오늘 당장 마감하시오.",
    orientalVibe: "오행의 완전한 무극(無極). 모든 것이 하나로 어우러져 더 높은 차원으로 도약하는 문."
  },

  // ==========================================
  // Minor Arcana: Wands (완드 / 지팡이 - 火: 행동, 열정, 의지) 22 ~ 35
  // ==========================================
  {
    id: 22,
    name: "Ace of Wands (완드 1)",
    category: "Wands",
    keywords: "영감의 불씨, 새로운 열정, 결단력, 창조적 충동",
    keywordsRev: "불씨 꺼짐, 섣부른 조급함, 동기 상실",
    meaningUpright: "하늘에서 내려온 지팡이에 푸른 잎이 돋듯, 새로운 불씨가 심장에 당겨졌소. 머뭇거리지 말고 불길을 지필 때요.",
    meaningReversed: "불씨만 쳐다보다가 재로 날려버렸소. 의욕만 앞서 준비 없이 덤비다 첫걸음부터 좌절을 맛볼 조짐이라.",
    practicalAdvice: "생각만 굴리지 말고 오늘 30분이라도 몸을 움직여 행동을 개시하시오.",
    orientalVibe: "화(火)의 첫 점화. 작은 불씨가 요원의 불길이 될 조짐."
  },
  {
    id: 23,
    name: "Two of Wands (완드 2)",
    category: "Wands",
    keywords: "계획, 원대한 야망, 경계 너머를 응시, 선택",
    keywordsRev: "우물 안 개구리, 두려움으로 인한 정체, 계획 실패",
    meaningUpright: "성벽 위에 서서 손에 지구본을 쥐고 먼바다를 바라보듯, 현재의 안락을 넘어 더 큰 판을 짜야 할 때요.",
    meaningReversed: "안락한 성벽 안주에 취해 문밖을 나설 용기를 잃었소. 꿈만 거창하고 발걸음은 묶여 있도다.",
    practicalAdvice: "시야를 넓히시오. 좁은 우물에서 아귀다툼하지 말고 더 넓은 시장과 무대를 조사하시오.",
    orientalVibe: "목생화(木生火)의 예비 단계. 힘을 비축하여 먼 길을 도모하는 형국."
  },
  {
    id: 24,
    name: "Three of Wands (완드 3)",
    category: "Wands",
    keywords: "선단의 출항, 확장의 결실, 협업, 미래의 안목",
    keywordsRev: "귀항의 지연, 실망스러운 소식, 협력 난항",
    meaningUpright: "세 개의 지팡이를 꽂아두고 바다로 띄워 보낸 배를 묵묵히 기다리듯, 뿌려둔 씨앗이 결실로 돌아올 시기요.",
    meaningReversed: "배가 풍랑을 만났거나 연락이 끊겼소. 믿었던 사람이나 기대했던 일에서 차질이 빚어질 조짐이라.",
    practicalAdvice: "조급하게 보채지 마시오. 씨앗은 이미 뿌렸으니 이제 기다릴 줄 아는 배포를 기르시오.",
    orientalVibe: "화(火)의 안정적 확산. 불길이 고르게 번져나가는 모양새."
  },
  {
    id: 25,
    name: "Four of Wands (완드 4)",
    category: "Wands",
    keywords: "축제, 안식처의 안도감, 조화, 축하",
    keywordsRev: "가정의 불화, 일시적 정체, 파티 뒤의 허무",
    meaningUpright: "꽃과 과일로 장식된 네 기둥 아래서 축제를 벌이듯, 고된 노고 끝에 평화로운 안식과 결실을 맛보는 때요.",
    meaningReversed: "집안에 남모를 불협화음이 돌고 있소. 겉은 화려한 잔칫집이나 속은 찬바람이 부는 형국이라.",
    practicalAdvice: "주변 사람들과의 따뜻한 식사 자리를 마련하시오. 성공의 기쁨을 나누어야 복이 오래 머무는 법이오.",
    orientalVibe: "토(土)와 화(火)의 조화. 따뜻한 온기가 집안에 가득 차는 길상."
  },
  {
    id: 26,
    name: "Five of Wands (완드 5)",
    category: "Wands",
    keywords: "혼란스러운 경쟁, 갈등, 옥신각신, 잡음",
    keywordsRev: "소모전의 종식, 회피, 내분 해결",
    meaningUpright: "젊은이들이 각자 지팡이를 들고 서로 맞부딪치듯, 실속 없는 자존심 싸움과 소음이 들끓는 형국이오.",
    meaningReversed: "의미 없는 소모전에 지쳐 나가떨어졌소. 싸움을 피하려다 오히려 더 큰 손해를 볼 수 있도다.",
    practicalAdvice: "영양가 없는 논쟁에서 빠져나오시오. 누가 맞고 틀린 지를 따지기 전에 본인의 밥그릇부터 챙기시오.",
    orientalVibe: "화(火)의 산란함. 불티가 사방으로 튀어 화재의 위험이 있는 난국."
  },
  {
    id: 27,
    name: "Six of Wands (완드 6)",
    category: "Wands",
    keywords: "개선장군의 승리, 인정, 공적 치하, 자긍심",
    keywordsRev: "자만심, 헛된 명성, 추락의 전조, 배신",
    meaningUpright: "월계관을 쓰고 백마에 올라 군중의 환호를 받듯, 그대의 실력과 노력이 만천하에 인정받을 길조요.",
    meaningReversed: "아직 이룬 것도 없는데 샴페인부터 터뜨렸소. 거들먹거리다간 환호가 곧 조롱으로 바뀔 것이라.",
    practicalAdvice: "승리의 순간일수록 고개를 숙이시오. 공을 아랫사람에게 돌려야 질투의 화살을 피할 수 있소.",
    orientalVibe: "화(火)의 영광. 불꽃이 하늘 높이 솟구쳐 어둠을 밝히는 상."
  },
  {
    id: 28,
    name: "Seven of Wands (완드 7)",
    category: "Wands",
    keywords: "고지 사수, 용감한 방어, 불리함을 극복, 신념",
    keywordsRev: "압도당함, 포기, 방어선 붕괴, 피로 누적",
    meaningUpright: "언덕 위에 홀로 서서 아래에서 찌르는 수많은 창칼을 막아내듯, 신념을 지키기 위한 외로운 수성전이오.",
    meaningReversed: "밀려오는 적들에게 포위당해 기진맥진했소. 헛된 고집으로 버티다간 명분도 실리도 다 잃으리라.",
    practicalAdvice: "물러서지 마시오. 그대가 유리한 고지를 점하고 있으니, 당당하게 자기주장을 관철하시오.",
    orientalVibe: "산화(山火)의 형국. 험준한 산세에 의지해 불길을 막아내는 불굴의 기개."
  },
  {
    id: 29,
    name: "Eight of Wands (완드 8)",
    category: "Wands",
    keywords: "급속한 전개, 신속한 소식, 화살 같은 추진력",
    keywordsRev: "지연, 헛소문, 빗나간 화살, 조급한 실수",
    meaningUpright: "허공을 가르며 날아가는 여덟 개의 화살처럼, 모든 일이 눈 깜짝할 사이에 급물살을 타고 전개될 징조요.",
    meaningReversed: "방향을 잘못 잡은 화살이 엉뚱한 곳에 꽂혔소. 서두르다 일을 그르칠 위험이 크도다.",
    practicalAdvice: "타이밍이 생명이오. 망설이지 말고 오늘 당장 회신하고 움직이되, 디테일을 빠뜨리지 마시오.",
    orientalVibe: "풍화(風火)의 기세. 바람을 만난 불길처럼 거침없이 내달리는 형국."
  },
  {
    id: 30,
    name: "Nine of Wands (완드 9)",
    category: "Wands",
    keywords: "마지막 방어, 경계심, 상처 입은 전사, 인내",
    keywordsRev: "피로 과다, 무너지는 방어, 의심병",
    meaningUpright: "이마에 붕대를 감고 마지막 지팡이에 기대어 경계 태세를 풀지 않듯, 마지막 고비를 버텨내야 할 때요.",
    meaningReversed: "지나친 경계심으로 주변 사람을 다 적으로 만들었소. 지칠 대로 지쳐 지팡이를 놓쳐버릴 조짐이라.",
    practicalAdvice: "조금만 더 버티시오. 거의 다 왔소. 하지만 쓸데없는 의심으로 에너지를 소모하지는 마시오.",
    orientalVibe: "화(火)의 마지막 잔불. 꺼질 듯 꺼지지 않는 끈질긴 생명력."
  },
  {
    id: 31,
    name: "Ten of Wands (완드 10)",
    category: "Wands",
    keywords: "과도한 짐, 번아웃, 과욕, 짊어진 책임",
    keywordsRev: "짐 내려놓기, 한계 돌파 실패, 붕괴",
    meaningUpright: "열 개의 지팡이를 혼자 끌어안고 허덕이며 언덕을 오르듯, 과욕과 책임감에 짓눌려 숨이 턱까지 찬 상태요.",
    meaningReversed: "감당하지도 못할 짐을 안고 끙끙대다 결국 허리가 꺾일 조짐이라. 미련한 완벽주의의 말로요.",
    practicalAdvice: "당장 짐을 내려놓으시오! 남에게 위임할 수 있는 일은 오늘 넘기고, 불필요한 일은 과감히 버리시오.",
    orientalVibe: "화다목분(火多木焚). 지팡이가 너무 많아 불이 스스로를 태워 잿더미가 될 위기."
  },
  {
    id: 32,
    name: "Page of Wands (완드 시종)",
    category: "Wands",
    keywords: "호기심 많은 전령, 열정의 탐색, 새로운 소식",
    keywordsRev: "변덕, 뒷심 부족, 뜬소문 전파",
    meaningUpright: "사막에 지팡이를 꽂고 호기심 어린 눈으로 바라보는 소년처럼, 가슴 뛰는 새로운 소식과 배움의 기회가 올 조짐이오.",
    meaningReversed: "흥미는 많으나 끈기가 없어 삼일천하로 끝날 것이라. 말만 그럴듯하고 실행이 따르지 않도다.",
    practicalAdvice: "새로운 기술이나 지식을 탐색하되, 시작했으면 최소한 한 달은 진득하게 파고드시오.",
    orientalVibe: "목(木)의 어린 가지. 바람에 흔들리기 쉬우나 푸른 생명력을 품은 상태."
  },
  {
    id: 33,
    name: "Knight of Wands (완드 기사)",
    category: "Wands",
    keywords: "맹렬한 돌격, 모험심, 거침없는 행동파",
    keywordsRev: "무모한 폭주, 성급한 싸움꾼, 이기주의",
    meaningUpright: "화염이 수놓인 옷을 입고 말을 박차고 내달리듯, 두려움 없이 과감하게 목표를 향해 돌진하는 기세라.",
    meaningReversed: "성격이 불같아 주변을 다 태워버리고 있소. 시작만 요란하고 뒷감당을 못 해 도망칠 조짐이라.",
    practicalAdvice: "열정은 좋으나 주변을 살피시오. 한 템포 호흡을 가다듬고 동료들의 속도를 맞추어 주시오.",
    orientalVibe: "화(火)의 맹렬한 준마. 채찍만 휘두르지 말고 방향키를 잡아야 할 때."
  },
  {
    id: 34,
    name: "Queen of Wands (완드 여왕)",
    category: "Wands",
    keywords: "매력, 당당한 자신감, 온화한 리더십, 활력",
    keywordsRev: "질투, 변덕, 히스테리, 지배욕",
    meaningUpright: "해바라기를 손에 쥐고 검은 고양이를 곁에 둔 채 당당히 미소 짓듯, 거침없는 매력과 온기로 주변을 장악하는 형국이오.",
    meaningReversed: "자신감이 지나쳐 안하무인이 되었소. 남의 인기를 시기하고 편을 갈라 패거리 정치를 일삼을 조짐이라.",
    practicalAdvice: "자신감을 가지시오. 그대의 당당함이 곧 무기이니, 주저하지 말고 무대의 중심에 서시오.",
    orientalVibe: "화(火)의 따스한 태양빛. 만물을 감싸 안는 온화한 카리스마."
  },
  {
    id: 35,
    name: "King of Wands (완드 왕)",
    category: "Wands",
    keywords: "카리스마 리더, 비전의 실행, 대장부, 통솔력",
    keywordsRev: "독단, 성급한 횡포, 무자비함",
    meaningUpright: "사자와 불도마뱀이 새겨진 왕좌에 앉아 지팡이를 쥐듯, 원대한 비전을 현실로 이끄는 당당한 우두머리의 위엄이오.",
    meaningReversed: "내 뜻대로 되지 않으면 판을 엎어버리는 폭군이 되었소. 부하들의 원성이 담장을 넘고 있도다.",
    practicalAdvice: "큰 그림을 그리시오. 사소한 잡일에 매몰되지 말고, 사람들에게 명확한 비전을 제시하고 이끄시오.",
    orientalVibe: "화(火)의 웅장한 화산. 통제된 화력은 천하를 비추나, 폭발하면 모두가 파멸하리라."
  },

  // ==========================================
  // Minor Arcana: Cups (컵 / 성배 - 水: 감정, 관계, 무의식) 36 ~ 49
  // ==========================================
  {
    id: 36,
    name: "Ace of Cups (컵 1)",
    category: "Cups",
    keywords: "사랑의 샘솟음, 영적 충만, 감정의 시작, 치유",
    keywordsRev: "감정의 메마름, 헛된 환상, 실망",
    meaningUpright: "하늘의 손에서 넘쳐흐르는 성배처럼, 가슴속에 순수한 사랑과 평화, 영감이 샘솟는 축복의 시작이오.",
    meaningReversed: "잔이 엎질러져 감정이 메말랐소. 사랑을 구걸하거나 공허함을 다른 쾌락으로 채우려 발버둥 치는 형국이라.",
    practicalAdvice: "마음의 문을 여시오. 그대를 찾아온 새로운 인연이나 감정을 의심하지 말고 순수하게 받아들이시오.",
    orientalVibe: "수(水)의 감로수. 메마른 땅을 적시는 단비와 같은 은혜."
  },
  {
    id: 37,
    name: "Two of Cups (컵 2)",
    category: "Cups",
    keywords: "영혼의 단짝, 화합, 계약, 상호 존중",
    keywordsRev: "불화, 결별, 어긋난 파트너십, 배신",
    meaningUpright: "남녀가 서로 잔을 교환하며 맹세하듯, 깊은 신뢰와 사랑을 나누는 동반자를 만나거나 중요한 계약이 맺어질 길조요.",
    meaningReversed: "서로 꿍꿍이를 숨긴 채 마주 앉았소. 불신과 오해가 쌓여 곧 잔이 깨어질 위기라.",
    practicalAdvice: "솔직한 대화를 나누시오. 속마음을 숨기지 말고 동등한 입장에서 진솔하게 타협점을 찾으시오.",
    orientalVibe: "수화기제(水火旣濟). 음양이 서로를 존중하며 하나로 융합되는 형국."
  },
  {
    id: 38,
    name: "Three of Cups (컵 3)",
    category: "Cups",
    keywords: "축배, 우정, 공동체의 축하, 연대감",
    keywordsRev: "음주가무의 낭비, 뒷담화, 소외감",
    meaningUpright: "세 여인이 잔을 높이 들고 수확의 기쁨을 춤추듯, 친구나 동료들과 함께 성취를 축하하는 즐거운 연대의 자리요.",
    meaningReversed: "어울림을 빙자한 소모적 술자리요 뒷담화라. 겉으론 웃으나 속으론 질투가 독버섯처럼 자라고 있도다.",
    practicalAdvice: "좋은 사람들과 축배를 들되, 선을 넘지 마시오. 가벼운 말실수가 우정에 금을 낼 수 있소.",
    orientalVibe: "수(水)의 경쾌한 시냇물. 졸졸 흐르는 물길이 모여 웃음꽃을 피우는 상."
  },
  {
    id: 39,
    name: "Four of Cups (컵 4)",
    category: "Cups",
    keywords: "무기력, 권태, 눈앞의 기회 외면, 불만족",
    keywordsRev: "권태 탈출, 새로운 기회 포착, 의욕 회복",
    meaningUpright: "나무 밑에 팔짱을 끼고 앉아 눈앞에 내미는 새로운 잔조차 쳐다보지 않듯, 매너리즘과 무기력에 빠진 상태요.",
    meaningReversed: "지루한 동굴에서 고개를 들기 시작했소. 눈앞에 찾아온 새로운 제안이나 인연을 다시 돌아볼 때라.",
    practicalAdvice: "투덜거림을 멈추시오. 세상이 지루한 것이 아니라 그대의 마음이 닫힌 것이니, 손을 뻗어 잔을 받으시오.",
    orientalVibe: "수(水)의 괸 물. 흐르지 않는 물은 썩는 법이니 물길을 새로 트시오."
  },
  {
    id: 40,
    name: "Five of Cups (컵 5)",
    category: "Cups",
    keywords: "상실의 비탄, 후회, 넘어진 잔, 남겨진 희망",
    keywordsRev: "비탄의 극복, 새로운 출발, 상처 수용",
    meaningUpright: "검은 망토를 두르고 엎질러진 세 잔만 내려다보며 흐느끼고 있소. 등 뒤에 온전한 두 잔이 남아있음을 보지 못하도다.",
    meaningReversed: "눈물을 닦고 뒤돌아설 때가 되었소. 잃어버린 것에 대한 애도는 충분하니 남은 것을 챙겨 떠나시오.",
    practicalAdvice: "과거의 실패를 곱씹는 자해를 멈추시오. 엎질러진 물은 주워 담을 수 없으니, 등 뒤에 남은 것을 들고 발을 떼시오.",
    orientalVibe: "수(水)의 슬픈 눈물. 상실의 고통이나 비 온 뒤에 땅이 굳는 법."
  },
  {
    id: 41,
    name: "Six of Cups (컵 6)",
    category: "Cups",
    keywords: "어린 시절의 추억, 순수함, 옛 인연의 재회",
    keywordsRev: "과거에 갇힘, 유치함, 현실 부적응",
    meaningUpright: "아이들이 꽃이 담긴 잔을 건네듯, 때 묻지 않은 순수했던 시절의 따스한 추억이나 옛 인연이 찾아올 길조요.",
    meaningReversed: "옛날 좋았던 시절 타령만 하며 현재를 회피하고 있소. 과거의 온기에 취해 어른으로서의 책임을 외면하도다.",
    practicalAdvice: "초심을 회복하되, 사는 곳은 현재여야 하오. 순수했던 그 시절의 열정을 오늘 하루에 투영하시오.",
    orientalVibe: "수(水)의 맑은 이슬. 메마른 동심을 적셔주는 따스한 온정."
  },
  {
    id: 42,
    name: "Seven of Cups (컵 7)",
    category: "Cups",
    keywords: "무지개 환상, 뜬구름 잡는 욕망, 선택 장애, 망상",
    keywordsRev: "환상 탈출, 현실 직시, 명확한 우선순위",
    meaningUpright: "구름 위에 뜬 일곱 잔 속에 온갖 보석과 뱀이 섞여 있듯, 현실성 없는 공상과 욕망에 눈이 멀어 허우적거리는 형국이오.",
    meaningReversed: "신기루가 걷히고 참모습이 드러나고 있소. 뜬구름을 걷어내고 진짜 알맹이 하나를 고를 때라.",
    practicalAdvice: "망상을 멈추시오! 상상만으로는 아무것도 이룰 수 없으니, 단 하나의 현실적인 선택지만 남기고 다 지우시오.",
    orientalVibe: "수(水)의 아지랑이. 허상에 취해 길을 잃지 말라는 경고."
  },
  {
    id: 43,
    name: "Eight of Cups (컵 8)",
    category: "Cups",
    keywords: "자발적 떠남, 미련의 청산, 더 높은 영적 여정",
    keywordsRev: "떠나지 못하는 미련, 회피, 미적지근한 정체",
    meaningUpright: "정성껏 쌓아둔 여덟 개의 잔을 뒤로하고 지팡이를 짚은 채 어두운 산길로 떠나듯, 익숙한 안락을 버리고 진정한 가치를 찾아 나설 때요.",
    meaningReversed: "마음은 떠났으나 몸이 발목을 잡고 있소. 썩어가는 관계나 직장에 미련을 두며 시간만 낭비하도다.",
    practicalAdvice: "과감하게 등을 돌리시오. 이곳에서 그대가 얻을 수 있는 것은 다 끝났으니, 더 높은 세계로 걸어가시오.",
    orientalVibe: "수(水)의 흐름. 바다를 찾아 산을 넘는 강물의 숙명적인 떠남."
  },
  {
    id: 44,
    name: "Nine of Cups (컵 9)",
    category: "Cups",
    keywords: "소원 성취, 물질적·정서적 만족, 자족감",
    keywordsRev: "자만심, 탐닉, 겉치레, 만족 뒤의 공허",
    meaningUpright: "아홉 개의 잔을 뒤에 진열하고 팔짱을 낀 채 흡족하게 웃듯, 바라던 바를 이루고 삶의 풍요를 만끽하는 길상이오.",
    meaningReversed: "배가 불러 오만에 빠졌거나 과식과 쾌락에 탐닉하고 있소. 겉으론 다 가진 척하나 속은 헛헛하도다.",
    practicalAdvice: "성취를 감사히 누리되, 남들에게 과시하지 마시오. 복을 혼자 독식하면 화근이 따르니 나누시오.",
    orientalVibe: "수(水)의 넉넉한 호수. 물이 가득 차 넘치기 직전의 풍요."
  },
  {
    id: 45,
    name: "Ten of Cups (컵 10)",
    category: "Cups",
    keywords: "가족의 화목, 궁극의 평화, 정서적 완성",
    keywordsRev: "가정 불화, 깨어진 평화, 외로움, 위선",
    meaningUpright: "무지개 아래 온 가족이 춤을 추듯, 오랜 방황 끝에 진정한 안식처와 영혼의 평화를 맛보는 축복의 완성이라.",
    meaningReversed: "남들에게 보여주기식 행복에 매달리고 있소. 대문 안으로 들어가면 차가운 냉기만 감도는 형국이라.",
    practicalAdvice: "가까운 가족이나 연인에게 따뜻한 말 한마디를 건네시오. 진정한 성공은 가정의 평화에서 비롯되오.",
    orientalVibe: "수(水)의 바다. 모든 강물이 모여 평화롭게 일렁이는 대화합."
  },
  {
    id: 46,
    name: "Page of Cups (컵 시종)",
    category: "Cups",
    keywords: "순수한 영감, 낭만적 소식, 직관의 싹틈",
    keywordsRev: "감정 기복, 칭얼거림, 비현실적 유약함",
    meaningUpright: "잔 속에서 튀어나온 물고기를 신기하게 바라보는 소년처럼, 가슴 뛰는 예술적 영감이나 다정한 소식이 전해질 조짐이오.",
    meaningReversed: "사소한 일에 삐치고 감정적으로 굴고 있소. 현실 감각이 없어 어린애처럼 어리광만 부리는 형국이라.",
    practicalAdvice: "직관을 믿되 감정의 노예가 되지 마시오. 마음속 솟아난 아이디어를 부끄러워 말고 표현해보시오.",
    orientalVibe: "수(水)의 맑은 샘물. 맑고 투명하나 쉽게 흙탕물이 될 수 있으니 단도리할 것."
  },
  {
    id: 47,
    name: "Knight of Cups (컵 기사)",
    category: "Cups",
    keywords: "백마 탄 기사, 낭만적 제안, 매혹, 이상주의",
    keywordsRev: "달콤한 사기꾼, 변덕, 비현실적 환상가",
    meaningUpright: "잔을 들고 유유히 말을 몰아오는 음유시인처럼, 매력적인 제안이나 마음을 설레게 할 귀인이 찾아올 조짐이오.",
    meaningReversed: "말만 번지르르한 제비족이요 속 빈 강정이라. 감언이설에 속아 낭패를 볼 위험이 크도다.",
    practicalAdvice: "달콤한 제안의 이면을 살펴보시오. 겉모습에 홀리지 말고 상대의 구체적 실행력을 검증하시오.",
    orientalVibe: "수(水)의 잔잔한 물결. 낭만적이나 깊이를 알 수 없는 강물."
  },
  {
    id: 48,
    name: "Queen of Cups (컵 여왕)",
    category: "Cups",
    keywords: "깊은 공감, 치유의 자애로움, 직관적 영매",
    keywordsRev: "감정 과잉, 의존증, 피해망상, 감정 조작",
    meaningUpright: "바닷가 보좌에 앉아 성배를 응시하는 자애로운 어머니처럼, 타인의 아픔을 품어주는 깊은 치유와 사랑의 힘이오.",
    meaningReversed: "감정의 롤러코스터에 타서 주변 사람을 피 말리게 하고 있소. 서운함에 사로잡혀 남을 조종하려 들도다.",
    practicalAdvice: "남을 돌보기에 앞서 그대 자신의 감정 쓰레기통부터 비우시오. 남의 감정에 지나치게 감정이입하지 마시오.",
    orientalVibe: "수(水)의 깊은 바다. 만물을 품는 모성이지만 폭풍이 치면 헤어 나오지 못하리라."
  },
  {
    id: 49,
    name: "King of Cups (컵 왕)",
    category: "Cups",
    keywords: "감정의 절제, 관용, 성숙한 멘토, 평정심",
    keywordsRev: "감정 억압, 속임수, 음흉함, 무책임한 방관",
    meaningUpright: "파도치는 바다 한가운데 보좌에 앉아 흔들림 없이 잔을 들듯, 거센 감정의 폭풍 속에서도 평정심을 유지하는 어른의 품격이오.",
    meaningReversed: "속으로는 온갖 음모와 원망을 품고 겉으로만 인자한 척하도다. 무책임하게 회피하며 술에 취할 조짐이라.",
    practicalAdvice: "파도에 휩쓸리지 마시오. 감정적으로 대응하지 말고, 너그러운 포용력으로 상황을 침착하게 조율하시오.",
    orientalVibe: "수(水)의 바다를 다스리는 용왕(龍王). 감정의 주인이 되어 물길을 다스리는 도리."
  },

  // ==========================================
  // Minor Arcana: Swords (소드 / 검 - 金: 이성, 결단, 상처, 갈등) 50 ~ 63
  // ==========================================
  {
    id: 50,
    name: "Ace of Swords (검 1)",
    category: "Swords",
    keywords: "명료한 통찰, 결단의 칼날, 진실의 승리",
    keywordsRev: "가혹한 파괴, 오판, 칼에 베임, 잔인함",
    meaningUpright: "구름에서 뻗어 나온 손이 왕관을 꿰뚫은 칼을 쥐었소. 거짓과 혼란을 단칼에 베어버릴 명쾌한 결단의 순간이오.",
    meaningReversed: "칼자루를 거꾸로 쥐고 휘두르다 제 손가락을 베었소. 독설과 잘못된 판단으로 돌이킬 수 없는 화를 부를 조짐이라.",
    practicalAdvice: "미련을 끊어내시오. 어설픈 동정은 화를 키우니, 객관적 진실에 입각해 오늘 칼을 뽑으시오.",
    orientalVibe: "금(金)의 예리한 보검. 혼탁한 어둠을 가르는 추상같은 결기."
  },
  {
    id: 51,
    name: "Two of Swords (검 2)",
    category: "Swords",
    keywords: "눈가림, 팽팽한 교착 상태, 회피, 힘겨운 균형",
    keywordsRev: "눈가리개 벗김, 정보 공개, 피할 수 없는 선택",
    meaningUpright: "두 눈을 가린 채 가슴 앞에 두 자루 칼을 엇갈려 들고 있소. 어느 쪽도 택하지 못한 채 아슬아슬하게 현실을 외면하는 형국이라.",
    meaningReversed: "더 이상 못 본 척할 수 없소. 눈가리개가 벗겨졌으니 원하든 원치 않든 마주하고 결정을 내려야 하오.",
    practicalAdvice: "회피하지 마시오! 눈을 감는다고 칼날이 사라지지 않으니, 눈을 뜨고 현실의 두 선택지를 직시하시오.",
    orientalVibe: "금(金)의 차가운 대치. 팽팽한 살얼음판을 걷는 위태로움."
  },
  {
    id: 52,
    name: "Three of Swords (검 3)",
    category: "Swords",
    keywords: "비통한 상처, 심장의 상처, 이별, 현실적 손실",
    keywordsRev: "상처의 회복, 고통의 치유, 미련 털어내기",
    meaningUpright: "먹구름과 폭우 속에 심장을 관통한 세 자루 칼처럼, 뼈를 깎는 배신이나 이별의 아픔이 가슴을 후벼 파는 형국이오.",
    meaningReversed: "피 흘리던 상처가 아물기 시작했소. 고통의 터널을 지나 비로소 현실을 담담히 수용하는 시기라.",
    practicalAdvice: "울고 싶으면 통곡하되, 숫자는 속이지 마시오. 감정의 상처에 매몰되지 말고 현실의 실질적 손실부터 계산하시오.",
    orientalVibe: "금극목(金剋木)의 잔인함. 도끼가 나무를 찍어 넘기듯 피할 수 없는 아픔."
  },
  {
    id: 53,
    name: "Four of Swords (검 4)",
    category: "Swords",
    keywords: "휴식, 일시적 정전, 병상에서의 회복, 피신",
    keywordsRev: "회복 후 복귀, 강제된 활동 재개, 번아웃",
    meaningUpright: "성당 묘비 위에 손을 모으고 누운 기사처럼, 치열한 전쟁터에서 물러나 몸과 마음을 쉬게 해야 할 절대적 안식의 때요.",
    meaningReversed: "쉴 틈도 없이 다시 전쟁터로 내몰리고 있소. 몸이 완전히 회복되지 않았는데 무리하면 더 큰 병이 되리라.",
    practicalAdvice: "칼을 내려놓고 쉬시오! 오늘 밤만큼은 일 생각을 끊고 오직 수면과 휴식에만 몰두하시오.",
    orientalVibe: "금(金)의 칼집 들어감. 칼날을 식히지 않으면 쇠가 무뎌지는 법."
  },
  {
    id: 54,
    name: "Five of Swords (검 5)",
    category: "Swords",
    keywords: "비열한 승리, 상처뿐인 영광, 자존심 싸움",
    keywordsRev: "화해의 조짐, 패배 인정, 비겁함의 반성",
    meaningUpright: "남의 칼을 빼앗고 짓궂게 웃고 있으나 뒤돌아선 패자들의 원한이 서렸소. 싸움에선 이겼으나 사람을 잃은 피로스의 승리요.",
    meaningReversed: "비열한 싸움에 환멸을 느끼고 물러나고 있소. 억울하더라도 똥은 무서워서가 아니라 더러워서 피하는 법이라.",
    practicalAdvice: "이겨도 손해인 싸움에 매달리지 마시오. 알량한 자존심을 챙기려다 진짜 소중한 평판을 날릴 수 있소.",
    orientalVibe: "금(金)의 상쟁. 쇠와 쇠가 부딪쳐 불꽃만 튀고 칼날만 상하는 형국."
  },
  {
    id: 55,
    name: "Six of Swords (검 6)",
    category: "Swords",
    keywords: "고난의 바다를 건넘, 상처를 안고 이동, 회복기로의 전환",
    keywordsRev: "도망칠 곳 없음, 지연, 미련 때문에 멈춤",
    meaningUpright: "여섯 자루 칼을 꽂은 조각배를 타고 잔잔한 물가를 향해 노를 젓듯, 고통의 땅을 떠나 회복의 강을 건너는 여정이오.",
    meaningReversed: "배에 물이 새거나 과거로 되돌아가려 하고 있소. 떠나기로 했으면 미련을 두지 말고 앞만 보시오.",
    practicalAdvice: "아직 마음의 상처는 아물지 않았으나 방향은 옳소. 뒤돌아보지 말고 묵묵히 노를 저어 나아가시오.",
    orientalVibe: "수(水)를 건너는 금(金). 험난한 고비를 넘겨 평온한 기슭으로 향하는 배."
  },
  {
    id: 56,
    name: "Seven of Swords (검 7)",
    category: "Swords",
    keywords: "교활한 꾀, 몰래 빼돌림, 부분적 성과, 속임수",
    keywordsRev: "들통남, 양심의 가책, 정면돌파 결심",
    meaningUpright: "적진에서 다섯 자루 칼을 품에 안고 발끝을 세워 도망치듯, 정면돌파를 피해 편법이나 꾀를 써서 실속을 챙기려는 형국이오.",
    meaningReversed: "꼬리가 길어 밟힐 조짐이오. 잔머리를 굴리다 만천하에 들통나 망신을 당할 수 있도다.",
    practicalAdvice: "꼼수를 부리지 마시오. 당장은 요령으로 넘어갈지 몰라도 언젠가 반드시 대가를 치르게 될 것이라.",
    orientalVibe: "금(金)의 도둑질. 어둠 속에서 칼을 빼돌리나 하늘의 그물은 성글어도 놓치지 않으리라."
  },
  {
    id: 57,
    name: "Eight of Swords (검 8)",
    category: "Swords",
    keywords: "자가당착의 감옥, 피해의식, 무기력, 묶인 시야",
    keywordsRev: "사슬 풀림, 두려움 극복, 새로운 활로",
    meaningUpright: "온몸이 묶이고 눈이 가려진 채 여덟 자루 칼에 둘러싸였소. 허나 발은 묶이지 않았으니, 감옥을 만든 것은 오직 그대의 두려움이라.",
    meaningReversed: "눈가리개가 풀리고 사슬을 스스로 풀기 시작했소. 두려움을 걷어내면 탈출구가 훤히 보일 것이라.",
    practicalAdvice: "신세한탄을 멈추시오! 아무도 그대를 가두지 않았소. 스스로 씌운 한계의 안대를 벗고 오늘 첫걸음을 내딛으시오.",
    orientalVibe: "금(金)의 결박. 마음이 지어낸 옥살이에서 걸어 나오는 용기."
  },
  {
    id: 58,
    name: "Nine of Swords (검 9)",
    category: "Swords",
    keywords: "악몽, 밤의 불면증, 극심한 불안, 자책",
    keywordsRev: "악몽에서 깨어남, 희망의 서광, 고통 완화",
    meaningUpright: "침상에서 머리를 감싸 쥐고 오열하듯, 밤마다 죄책감과 공포에 시달리며 잠 못 이루는 극심한 정신적 고통의 징조요.",
    meaningReversed: "길고 어두운 밤이 끝나고 동이 터 오고 있소. 상상했던 최악의 파국은 일어나지 않을 것이라.",
    practicalAdvice: "밤에 혼자 고민하지 마시오! 불을 켜고 자리를 털고 일어나시오. 불안의 90%는 머릿속 망상이 빚어낸 헛것이오.",
    orientalVibe: "금(金)의 악몽. 서늘한 칼날이 꿈자리를 어지럽히는 흉조이나 깨어나면 그만이오."
  },
  {
    id: 59,
    name: "Ten of Swords (검 10)",
    category: "Swords",
    keywords: "바닥을 친 파국, 완전한 패배, 등 뒤의 배신, 새로운 서광",
    keywordsRev: "재기, 바닥에서의 반등, 죽음 뒤의 부활",
    meaningUpright: "열 자루 칼이 등에 꽂힌 채 쓰러져 있소. 더 이상 나빠질 수 없는 밑바닥에 도달했으나, 저 멀리 수평선에서 해가 뜨고 있도다.",
    meaningReversed: "죽을 고비를 넘기고 피투성이가 된 채 일어서고 있소. 겪을 시련은 다 겪었으니 이제 올라갈 일만 남았도다.",
    practicalAdvice: "깨끗하게 패배를 인정하시오! 바닥을 쳐야 비로소 땅을 박차고 솟구칠 수 있는 법이오.",
    orientalVibe: "금(金)의 극한. 모든 칼이 꽂혔으니 더 이상 두려워할 칼도 남아있지 않도다."
  },
  {
    id: 60,
    name: "Page of Swords (검 시종)",
    category: "Swords",
    keywords: "경계심, 날카로운 관찰, 첩보, 호기심 어린 반항",
    keywordsRev: "말실수, 뒷조사, 험담, 가벼운 입",
    meaningUpright: "거친 바람 속에 칼을 번쩍 들고 주변을 두리번거리듯, 정보를 수집하며 경계심을 곤두세우는 영리한 첩자의 눈빛이오.",
    meaningReversed: "남의 SNS나 뒤를 캐며 쓸데없는 의심병에 걸렸소. 가벼운 입방정으로 비밀을 누설해 화를 자초하리라.",
    practicalAdvice: "팩트를 확인하시오. 섣부른 추측으로 사람을 떠보지 말고, 명확한 근거와 데이터를 수집하시오.",
    orientalVibe: "금(金)의 서슬 퍼런 바람. 어린 칼날이라 날카로우나 부러지기 쉬운 형상."
  },
  {
    id: 61,
    name: "Knight of Swords (검 기사)",
    category: "Swords",
    keywords: "전광석화, 직진 돌파, 저돌적인 용기, 냉철한 비판",
    keywordsRev: "독단적 폭언, 무모한 돌진, 적을 만드는 거만함",
    meaningUpright: "폭풍우를 뚫고 검을 겨눈 채 번개처럼 질주하듯, 누구의 눈치도 보지 않고 목표를 향해 칼을 휘두르는 저돌성이라.",
    meaningReversed: "말이 칼이 되어 주변 사람의 가슴을 난도질하고 있소. 제 성질을 못 이겨 자멸할 조짐이라.",
    practicalAdvice: "언행에 브레이크를 거시오! 정답을 말하더라도 예의를 잃으면 적만 늘어날 뿐이오.",
    orientalVibe: "금(金)의 서릿발 같은 돌격. 너무 빠르면 자신의 칼날에 스스로가 베이리라."
  },
  {
    id: 62,
    name: "Queen of Swords (검 여왕)",
    category: "Swords",
    keywords: "지성, 냉철한 판별력, 슬픔을 딛고 선 독립심",
    keywordsRev: "냉혹함, 독설가, 편협한 복수심, 고독",
    meaningUpright: "한 손으로 칼을 똑바로 세우고 다른 손으로 진실을 부르듯, 숱한 상처를 겪고도 흔들리지 않는 냉철한 지성의 여걸이오.",
    meaningReversed: "마음이 얼음장처럼 차가워 남에게 상처만 퍼붓고 있소. 꼬여버린 피해의식이 사람을 내쫓고 있도다.",
    practicalAdvice: "사사로운 감정에 휘둘리지 마시오. 눈물은 닦고 이성적인 원칙과 기준에 따라 공정하게 처리하시오.",
    orientalVibe: "금(金)의 단호한 결기. 슬픔을 벼려 보검으로 삼은 기품."
  },
  {
    id: 63,
    name: "King of Swords (검 왕)",
    category: "Swords",
    keywords: "절대적 지성, 공정한 판결, 권위 있는 리더십",
    keywordsRev: "냉혈한, 잔인한 폭군, 말로 찍어 누름",
    meaningUpright: "정면을 응시하며 똑바로 칼을 쥔 재판관처럼, 흔들림 없는 법도와 지혜로 시시비비를 가리는 군주의 위엄이라.",
    meaningReversed: "자신의 지성을 악용해 남을 법과 말장난으로 옥죄고 있소. 피도 눈물도 없는 오만함이 원한을 사고 있도다.",
    practicalAdvice: "감정이나 뇌물에 흔들리지 마시오. 원칙과 규정에 따라 냉엄하고 명확한 판결을 내리시오.",
    orientalVibe: "금(金)의 최고 수장. 천하의 시비를 가리는 포청천의 작두칼."
  },

  // ==========================================
  // Minor Arcana: Pentacles (펜타클 / 동전 - 土: 물질, 현실, 결실, 육체) 64 ~ 77
  // ==========================================
  {
    id: 64,
    name: "Ace of Pentacles (펜타클 1)",
    category: "Pentacles",
    keywords: "물질적 기회, 번영의 씨앗, 현실적 결실, 안정",
    keywordsRev: "기회 상실, 헛된 투자, 자금난, 욕심",
    meaningUpright: "꽃밭 위 구름에서 내민 손이 황금 동전을 쥐어주듯, 현실의 재물운과 실질적인 기회의 문이 열리는 축복의 시작이오.",
    meaningReversed: "굴러들어온 복을 발로 찼거나 사기에 걸려들 조짐이라. 공짜 점심은 없으니 일확천금을 경계하시오.",
    practicalAdvice: "현실의 땅에 씨앗을 심으시오. 재정 상태를 점검하고, 미래를 위한 실질적인 저축과 투자를 시작하시오.",
    orientalVibe: "토생금(土生金). 기름진 대지가 황금을 품어 세상에 내놓는 길상."
  },
  {
    id: 65,
    name: "Two of Pentacles (펜타클 2)",
    category: "Pentacles",
    keywords: "곡예 같은 균형, 유연한 대처, 자금 융통, 멀티태스킹",
    keywordsRev: "균형 상실, 자금줄 막힘, 감당 못할 과부하",
    meaningUpright: "무한대(∞) 끈 속에서 두 개의 동전을 저글링 하듯, 바쁜 일상 속에서 자금과 일정을 기막히게 조율해 나가는 때요.",
    meaningReversed: "동전을 떨어뜨릴 위기요. 빚으로 빚을 막듯 돌려막기를 하다가 파산의 늪에 빠질 조짐이라.",
    practicalAdvice: "지출을 줄이고 우선순위를 정하시오. 양손에 든 짐 중 덜 중요한 하나를 과감히 내려놓으시오.",
    orientalVibe: "수(水)와 토(土)의 조율. 거친 파도 위에서 배를 뒤집히지 않게 조타하는 기민함."
  },
  {
    id: 66,
    name: "Three of Pentacles (펜타클 3)",
    category: "Pentacles",
    keywords: "장인의 협업, 전문성 인정, 팀워크, 기초 공사",
    keywordsRev: "불협화음, 미숙함, 장인정신 상실, 날림 공사",
    meaningUpright: "석공이 설계도를 들고 수도사와 상의하며 성당을 짓듯, 전문가들과 힘을 합쳐 견고한 기반을 닦는 협업의 때요.",
    meaningReversed: "팀원들끼리 손발이 맞지 않아 날림 공사를 하고 있소. 기본기도 없으면서 자존심만 부리다 건물이 무너질 것이라.",
    practicalAdvice: "전문가의 조언을 경청하시오. 혼자 다 하려 들지 말고 실력 있는 파트너와 역할을 분담하시오.",
    orientalVibe: "토(土)의 견고한 축성. 벽돌 한 장을 정성껏 쌓아 만년의 터를 닦는 도리."
  },
  {
    id: 67,
    name: "Four of Pentacles (펜타클 4)",
    category: "Pentacles",
    keywords: "수전노의 집착, 안전제일, 소유욕, 폐쇄성",
    keywordsRev: "강제 지출, 집착의 해제, 파산의 두려움",
    meaningUpright: "머리 위, 품 안, 발밑에 동전을 꼭 쥐고 자물쇠를 채웠소. 안정을 지키려 하나 흘려보내지 않으니 숨이 막히는 형국이라.",
    meaningReversed: "움켜쥐었던 손에서 모래알처럼 돈이 빠져나가고 있소. 인색하게 굴다 정작 중요한 인연을 잃어버릴 조짐이라.",
    practicalAdvice: "곳간 문을 조금 여시오. 나눌 줄 모르는 부(富)는 썩은 물과 같으니, 필요한 곳에는 베풀 줄 알아야 하오.",
    orientalVibe: "토(土)의 굳어버린 바위. 흐르지 않고 막혀버린 구두쇠의 궁색한 형국."
  },
  {
    id: 68,
    name: "Five of Pentacles (펜타클 5)",
    category: "Pentacles",
    keywords: "물질적 궁핍, 추위 속의 방황, 소외감, 도움의 외면",
    keywordsRev: "가난의 탈출, 온기 회복, 새로운 후원자",
    meaningUpright: "눈보라 치는 밤 목발을 짚고 누더기를 걸친 채 성당 앞을 지나치듯, 경제적 곤궁과 영혼의 추위에 떠는 곤궁기요.",
    meaningReversed: "어둠의 터널 끝이 보이기 시작했소. 따뜻한 구원의 손길이 닿아 재기할 희망이 솟구치리라.",
    practicalAdvice: "혼자 춥게 앓지 마시오. 고개를 들면 성당 창문의 따스한 불빛이 보이니, 자존심을 버리고 도움을 청하시오.",
    orientalVibe: "토(土)의 혹한기(酷寒期). 꽁꽁 얼어붙은 겨울땅이니 봄을 기다리며 체온을 보존해야 할 때."
  },
  {
    id: 69,
    name: "Six of Pentacles (펜타클 6)",
    category: "Pentacles",
    keywords: "자비와 나눔, 공정한 보상, 베풂과 수혜, 균형",
    keywordsRev: "갑질, 빚의 굴레, 불평등한 조건부 후원",
    meaningUpright: "상인이 한 손에 저울을 들고 다른 손으로 가난한 이들에게 공정하게 동전을 나누어주듯, 베풀고 보답받는 상생의 순환이오.",
    meaningReversed: "은혜를 베푸는 척하며 사람을 노예로 부리려 하도다. 갑질과 빚의 굴레로 상대를 조종하려는 음모라.",
    practicalAdvice: "받았으면 갚고, 가졌으면 나누시오. 정직한 대가를 치르고 빚진 마음을 털어내시오.",
    orientalVibe: "토(土)의 곡창 개방. 흉년에 곳간을 열어 백성을 구휼하는 어진 목민관의 도리."
  },
  {
    id: 70,
    name: "Seven of Pentacles (펜타클 7)",
    category: "Pentacles",
    keywords: "수확 전의 평가, 중간 점검, 인내의 기다림, 고민",
    keywordsRev: "노력의 낭비, 성급한 수확, 투자 실패",
    meaningUpright: "열매 맺힌 덤불에 기대어 턱을 괴고 서서 수확을 저울질하듯, 여태껏 뿌린 노력의 성과를 점검하며 다음을 도모하는 때요.",
    meaningReversed: "열매가 익지도 않았는데 덜컥 따버려 떫은맛만 보았소. 애쓴 보람도 없이 헛수고로 끝날 위기라.",
    practicalAdvice: "성급하게 결과를 재촉하지 마시오. 수확의 계절이 오기까지 조금 더 묵묵히 지켜보는 인내가 필요하오.",
    orientalVibe: "토(土)의 가을 들판. 결실을 앞두고 벼 이삭을 살피는 농부의 신중함."
  },
  {
    id: 71,
    name: "Eight of Pentacles (펜타클 8)",
    category: "Pentacles",
    keywords: "장인정신, 묵묵한 연마, 기술 습득, 디테일 집중",
    keywordsRev: "날림 작업, 게으름, 단순 노동의 염증",
    meaningUpright: "작업대 앞에 앉아 정성스레 동전 하나하나를 망치질해 새기듯, 묵묵히 땀 흘려 자신의 기술과 전문성을 벼리는 시간이라.",
    meaningReversed: "지름길만 찾다 불량품을 양산하고 있소. 기본기도 안 된 자가 벼락부자만 꿈꾸다 망신살이 뻗치리라.",
    practicalAdvice: "잔머리 굴리지 마시오! 오늘 하루 묵묵히 자신의 본업에 집중하여 완성도를 한 단계 끌어올리시오.",
    orientalVibe: "토(土)와 금(金)의 연마. 쇠를 천 번 두드려 명검을 빚어내는 장인의 끈기."
  },
  {
    id: 72,
    name: "Nine of Pentacles (펜타클 9)",
    category: "Pentacles",
    keywords: "우아한 자립, 결실의 정원, 물질적 독립, 품격",
    keywordsRev: "속 빈 강정, 외로운 사치, 물질적 의존",
    meaningUpright: "포도밭 정원에서 매를 손에 얹고 우아하게 산책하듯, 스스로의 노력으로 일군 풍요와 고귀한 자유를 누리는 때요.",
    meaningReversed: "남의 돈으로 겉치레만 번지르르하게 꾸미고 있소. 속은 텅 빈 채 홀로 외로움에 떨고 있는 신세라.",
    practicalAdvice: "자립심을 기르시오. 누구에게도 손 벌리지 않고 당당히 설 수 있는 그대만의 경제적 터전을 확립하시오.",
    orientalVibe: "토(土)의 향기로운 정원. 스스로 일군 숲에서 바람을 쐬는 군자의 유유자적."
  },
  {
    id: 73,
    name: "Ten of Pentacles (펜타클 10)",
    category: "Pentacles",
    keywords: "가문의 번영, 영속적 유산, 부의 계승, 든든한 가문",
    keywordsRev: "유산 분쟁, 가문의 몰락, 도박과 낭비",
    meaningUpright: "성문 안에서 3대가 개들과 함께 평화로이 모여 있듯, 오랜 세월 축적된 부와 지혜가 대대손손 이어지는 궁극의 번영이라.",
    meaningReversed: "돈 때문에 집안에 칼부림이 날 조짐이오. 조상이 물려준 복을 탕진하고 집안싸움으로 파멸할 위기라.",
    practicalAdvice: "장기적인 안목을 가지시오. 오늘만 살 것처럼 굴지 말고, 대를 이어 지킬 수 있는 든든한 시스템을 구축하시오.",
    orientalVibe: "토(土)의 천년 고택(古宅). 뿌리 깊은 나무처럼 가문의 터전이 굳건히 자리 잡은 복락."
  },
  {
    id: 74,
    name: "Page of Pentacles (펜타클 시종)",
    category: "Pentacles",
    keywords: "배움의 열의, 실용적 목표, 근면 성실, 새로운 기회",
    keywordsRev: "게으름, 낭비, 비현실적 계획, 학습 부진",
    meaningUpright: "푸른 들판에서 두 손으로 동전을 소중히 받쳐 들고 응시하는 소년처럼, 새로운 학문이나 사업의 기초를 배우는 성실한 시작이오.",
    meaningReversed: "말만 번지르르하고 공부나 일은 팽개쳤소. 눈앞의 유혹에 빠져 준비 없이 시간만 낭비하는 꼴이라.",
    practicalAdvice: "기본으로 돌아가시오. 자만하지 말고 초심자의 겸손한 마음으로 기초 지식과 실무부터 차근차근 배우시오.",
    orientalVibe: "토(土)의 어린 새싹. 비옥한 흙에 뿌리를 내리기 시작한 유망한 묘목."
  },
  {
    id: 75,
    name: "Knight of Pentacles (펜타클 기사)",
    category: "Pentacles",
    keywords: "우직한 전진, 신뢰와 책임감, 철저한 근면, 끈기",
    keywordsRev: "답답한 고집, 지나친 보수성, 게으름, 정체",
    meaningUpright: "흑마를 타고 쟁기질 된 밭 위에 서서 동전을 묵묵히 응시하듯, 화려하진 않으나 한 걸음씩 확실하게 땅을 다지며 나아가는 우직함이라.",
    meaningReversed: "너무 굼떠서 버스가 떠난 뒤에 손을 들고 있소. 융통성 없는 고집으로 주변을 질식시키는 답답한 형국이라.",
    practicalAdvice: "우직하게 자리를 지키시오. 한눈팔지 말고 맡은 바 책임을 성실히 완수할 때 복이 저절로 굴러들어오오.",
    orientalVibe: "토(土)의 우직한 황소. 비바람이 쳐도 묵묵히 밭을 가는 성실함의 극치."
  },
  {
    id: 76,
    name: "Queen of Pentacles (펜타클 여왕)",
    category: "Pentacles",
    keywords: "실용적 풍요, 자상한 보살핌, 현실적 안락, 자원 관리",
    keywordsRev: "인색함, 물질만능주의, 불안과 걱정",
    meaningUpright: "풍요로운 꽃밭 보좌에서 동전을 무릎에 얹고 토끼를 바라보듯, 따뜻한 온기와 현실적인 알뜰함으로 집안을 일으키는 살림꾼의 덕이라.",
    meaningReversed: "돈에 눈이 멀어 사람을 돈으로 환산하고 있소. 잃을까 두려워 안달복달하며 주변 사람을 피 말리게 하도다.",
    practicalAdvice: "현실의 살림살이를 돌보시오. 재정을 꼼꼼히 관리하되, 사랑하는 이들에게는 따뜻한 온기를 아끼지 마시오.",
    orientalVibe: "토(土)의 자애로운 어머니. 곳간을 채우고 온 가족의 끼니를 알뜰히 챙기는 복부인."
  },
  {
    id: 77,
    name: "King of Pentacles (펜타클 왕)",
    category: "Pentacles",
    keywords: "거상의 지혜, 현실적 성공, 확고한 부와 안정, 신뢰",
    keywordsRev: "탐욕, 졸부의 횡포, 돈밖에 모르는 완고함",
    meaningUpright: "황소 머리가 조각된 성채 보좌에 앉아 황금 홀을 쥐었소. 오랜 인내와 현실 감각으로 거대한 부와 제국을 일군 거상의 위엄이오.",
    meaningReversed: "돈만 아는 파렴치한 졸부요 수전노라. 황금 방석에 앉았으나 마음은 지옥 불 속에 타오르는 형국이라.",
    practicalAdvice: "장기적인 안정성에 베팅하시오. 잔돈푼에 연연하지 말고 신뢰와 실질적인 자산을 지키는 대장부의 결단을 내리시오.",
    orientalVibe: "토(土)의 웅장한 태산(泰山). 만물을 품고 흔들림 없이 천하의 재물을 주무르는 거목의 위상."
  }
];

async function main() {
  const dataPath = path.join(__dirname, '../data/tarot-metadata.json');
  const cards: TarotCardDef[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`Seeding ${cards.length} enriched tarot cards from tarot-metadata.json to database...`);

  const prisma = new PrismaClient();
  for (const card of cards) {
    await prisma.tarotCard.upsert({
      where: { id: card.id },
      update: card,
      create: card,
    });
  }
  const count = await prisma.tarotCard.count();
  console.log(`Successfully seeded ${count} tarot cards in database!`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
