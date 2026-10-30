/* ====== ЭНД ӨӨРИЙНХӨӨРӨӨ ӨӨРЧИЛ ====== */
export type DateType = {
  k: string;
  e: string;
  l: string;
  title: string;
};

export const CONFIG = {
  // "letter" = зөвхөн захиа харагдана, "invite" = болзооны урилга (түр унтраасан)
  mode: "letter" as "letter" | "invite",

  // ====== ЗАХИА ======
  letter: {
    // Захиа — үг үсэг нэмэлгүй, хасалгүй яг бичсэнээр нь
    to: "Sainuu hairt mine",
    roses: 99, // захианаас өмнө өгөх сарнайн тоо
    paragraphs: [
      "Ene zahidalig unshj baih muchid bid hoyr hmtdaa zeregtsd suuj bh bolno. Chi mine mash uzesgelntei hragdj bna . Chamaig harah tudiid l setgel mine taivshirch bn tsag hugatsaag yg ene uyedl bi zgsoomor bn a",
      "Ene zahidal bidnii ireeedui ehlelch baij magadgu esvel tugsgul ch baij magadgui .Ymarch songolt hiisn bi huleen zuvshuurnu .bi zuvhun chmaiga az jargltai baigasa gj husej bn",
      "Chi bol mni amidrliin hangiin une tsntei humuusiin neg .Chamtai uchirsnda bi uuriigu mash az hun gj bddg dtro bituuhende ih bayrlj yvdg . Bidnii hamtdaa unguruulsn horom much bur minii huvid hamgiin une tsenetei dursamjuud .Hunii amidrald jargal zovlon eeljilj irdeg .Ter buhniig hamt tuulah hun chi mine.",
      "Ghdee bi chamaig mash ih gomdoosn bid hoyriin hoornd oilgoltsohgui zuil garahad bi chmtai yriltshiin ornd dtroo bodood ,chamaig nmg hairlaha bolij bga met mdrmjuud turd yriltsahiin ornd chimeegui bolj huleej etsest ni holdohiig sonsgsn thde ene buruu songolt gdgiig bi mash sn oilgj bn mnii buruu nmaig uuchlarai hairt mine",
      "Bolisnoos hoish chmaiga martah gj mash ih hicheesen ghdee ygd ch chdhgu ym bn le udr bur oroi bur chmaig boddg shunuu zuudelj serd deere nortol uilj hvtdg . Ene hugtsnd bi olon zuiliig uhaarsn .Bodsn zuile nuuh bish shuud helj yriltsah ni her chuhal bolohiig gnts buruu oilgolt buh zuuliig suitgj chaddgiig oilgosn . Odoo bi iluu tuluvshun iluu uhaalag hun bolohiig hicheej baina .Ter uyed mine chi minii derged baigaasai gj husj bn",
      "Bi anhnasa chmtai hmt amidrch az jargaltai ger bul bolno gj muruuddg baisn ene muruudul mine odooch hvrei baigaa shuu hair mine",
      "Bi chmaas gants zuiliig guiy eniig unshj duussanii draa nadtai chine setgeleese yiltsaach. Bi ch bas chmaig sonsmoor baina ter uyed chinyu medrch yu bdoj baisniig oilgohiig husej baina ungursun zuile huleen zuvshuurch tsaashd hamt baih bolomj baigaa esehiig hmtda shiideye herev chi zuvshuurvul hiy biynde itgj umnuhusu iluu tegeer chmga oilgj snsj yriltsj hairlj hmgaalh bolno chi ymrch shiidver grgsn bi huleen zuvshuurnu",
    ],
    // Догол мөр бүрийн төгсгөлд бичигдэх зүрх (захианы үгэнд хүрэхгүй)
    hearts: ["💗", "🤍", "💖", "🥺❤️‍🩹", "💞", "🏡💕", "❤️"],
    sign: "Hundetgesn\nchinii hairt Tiamo", // хоосон бол гарын үсэг гарахгүй
  },

  // ====== ТОГЛООМУУД ======
  games: {
    // 💗 Зүрх барих: захиа нээгдэхийн өмнө хэдэн зүрх барих вэ
    heartsToCatch: 15,
    // Зүрхний дундуур унах "хуурамч" зүйлс ба дарахад гарах инээдтэй тайлбар
    traps: [
      { e: "🥦", say: "Брокколи биш ээ, зүрх бариарай 😤" },
      { e: "💩", say: "Ёооё! Энийг яагаад барьсан юм 🤣" },
      { e: "🧦", say: "Tiamo-гийн угаагаагүй оймс 🧦 Зугт!" },
      { e: "📚", say: "Хичээлээ дараа хийнэ ээ 😂" },
    ],

    // ❓ Бидний тухай тест — асуултуудаа өөрөө солиорой
    quiz: [
      {
        q: "Tiamo яг одоо чамд юу хэлмээр байгаа бол?",
        options: ["Өлсөж байна 🍜", "Уучлаарай, чамайгаа их санаж байна 🥺", "Роналдо өчигдөр гоё тоглосон ⚽"],
        answer: 1,
        wrong: ["Өлссөн нь үнэн ч гэсэн... энэ биш ээ 😂", "Роналдо энд огт хамаагүй 😂"],
      },
      {
        q: "Tiamo чамайг хэр их санадаг вэ?",
        options: ["Бага зэрэг", "Өдөр бүр, орой бүр", "Огт үгүй"],
        answer: 1,
        wrong: ["Бага зэрэг гэнэ ээ? 😤 Дахиад бодоорой", "Худлаа! 🙅 Захиагаа дахиад уншаарай"],
      },
      {
        q: "Хэрэлдвэл хэн түрүүлж уучлалт гуйх вэ?",
        options: ["Чи", "Tiamo", "Манай муур"],
        answer: 1,
        wrong: ["Үгүй ээ, энэ удаад би 🥺", "Муур маань уучлалт гуйж мэдэхгүй 🐱"],
      },
      {
        q: "Хамгийн гоё болзоо аль нь вэ?",
        options: ["Түгжрэл дундах ярилцлага 🚗", "Гэртээ кино 🎬", "Хамтдаа байвал бүгд 💗"],
        answer: 2,
        wrong: ["Түгжрэл ч гэсэн гоё л доо 😂", "Кино гоё ч гэсэн... 🍿"],
      },
    ],

    // 🥠 Азын жигнэрэг — дарах бүрт санамсаргүй нэгийг нь гаргана
    fortunes: [
      "Ойрын 7 хоногт чамайг хоолоор дайлах хүн гарч ирнэ 😏",
      "Өнөөдөр чи хамгийн хөөрхөн нь байна. Энэ бол шинжлэх ухааны баримт 🔬",
      "Удахгүй чамд гэнэтийн тэврэлт ирнэ 🫂",
      "Чиний инээд хэн нэгний бүтэн өдрийг гэрэлтүүлдэг 🌞",
      "Нэг хүн яг одоо чамайг бодож суугаа 💭",
      "Азтай өнгө: ягаан. Азтай хүн: Tiamo 😎",
      "Дараагийн уулзалт дээр чи хамгийн их инээнэ 🤭",
    ],

    // 🎟️ Хайрын купон — урахад ил гарна, сонговол admin дээр харагдана
    couponPicks: 3, // хэдийг нь сонгож болох вэ
    coupons: [
      { e: "🍕", t: "Нэг удаа хүссэн хоолыг чинь авч өгөх эрх" },
      { e: "🫂", t: "Хязгааргүй тэврэлт" },
      { e: "🚗", t: "Хүссэн газар чинь машинаар хүргэж өгөх" },
      { e: "🎬", t: "Кино сонголтыг бүрэн чи шийднэ" },
      { e: "🙏", t: "Нэг удаа маргаанд шууд ялах эрх" },
      { e: "💐", t: "Гэнэтийн цэцэг" },
    ],
  },

  // ====== ЯРИЛЦАХ (хамгийн сүүлийн хуудас) — хажуу хажууд сууж байх үед ======
  talk: {
    title: "Одоо ярилцъя уу? 🤍",
    text: "Би яг хажууд чинь сууж байна. Юу ч яаралгүй. Чи бэлэн болсон үедээ утсаа тавиад над руу хараарай. Би зөвхөн чамайг сонсож, ойлгохыг хүсэж байна.",
    ready: "🤍 Бэлэн, ярилцъя",
    wait: "🫖 Жаахан амсхийгээд",
    readyDone: "Утсаа тавиад, хажуу тийшээ хараарай 🤍",
    waitDone: "Зүгээр ээ. Хэдий хэрэгтэй ч хүлээнэ. Бэлэн болохоороо над руу хараарай 🤍",
  },

  withText: "Tiamo-тай хамт", // баталгааны хуудсан дээр гарах
  fromName: "Tiamo", // хариу илгээх мессеж дээр
  // "Замдаа юу хийх вэ?" хуудсан дээрх сонголтууд
  types: [
    { k: "coffee", e: "☕", l: "кофе", title: "Кофе болзоо" },
    { k: "movie", e: "🎬", l: "кино", title: "Кино болзоо" },
    { k: "food", e: "🍝", l: "хоол", title: "Оройн зоог" },
    { k: "walk", e: "🌷", l: "алхалт", title: "Алхалт" },
    { k: "traffic", e: "🚗", l: "ярилцлага", title: "Түгжрэл дундах ярилцлага" },
    { k: "surprise", e: "🎁", l: "сюрприз", title: "Сюрприз болзоо" },
  ] as DateType[],
  // "Ямар болзоо вэ?" хэсэгт гарах болзоо
  dateTitle: "Арцат апартмент руу явах 3 цагийн болзоо",
  // Уулзах газар
  place: "Арцат апартмент",
  maps: "Artsat apartment Ulaanbaatar",
  // Хаягийн доор сонгох хувилбарууд
  rides: ["🚗 Намайг ирж аваарай", "🚶 Өөрөө очно"],
  onlyTime: "20:30", // зөвхөн энэ цагийг сонгож болно
  durationHours: 3,
  idleMinutes: 5, // ийм удаан юу ч хийгээгүй бол эхний дугтуй руу буцна
};
/* ===================================== */
