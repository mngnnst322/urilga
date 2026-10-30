"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CONFIG, type DateType } from "./config";
import { Coupons, Fortune, HeartGame, Quiz, Talk } from "./games";

const DOW = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
const DOW_FULL = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
const PERIODS: Record<string, string[]> = {
  "🌅 өглөө": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  "☀️ өдөр": ["12:00", "12:30", "13:00", "13:30", "14:00", "15:00", "16:00", "16:30"],
  "🌇 орой": ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
  "🌙 шөнө": ["21:00", "21:30", "22:00", "22:30"],
};
const FLO = ["💗", "🌸", "✨", "💕", "🤍"];
const BURST = ["💖", "💜", "✨", "🌸"];
// Баглааны цэцгүүд: эргэлт (градус), ишний урт (px), хоцролт (s)
const BOUQUET = [
  { e: "🌷", r: -38, h: 120, d: 0.5 },
  { e: "🌸", r: -24, h: 150, d: 0.7 },
  { e: "🌹", r: -10, h: 175, d: 0.9 },
  { e: "🌺", r: 2, h: 190, d: 1.1 },
  { e: "🌹", r: 14, h: 170, d: 1.0 },
  { e: "🌸", r: 27, h: 145, d: 0.8 },
  { e: "🌷", r: 40, h: 118, d: 0.6 },
  { e: "🌼", r: -18, h: 105, d: 1.3 },
  { e: "💮", r: 20, h: 100, d: 1.4 },
];
const PETALS = ["🌸", "🌷", "💮", "🌹"];

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const dateText = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;

type Floater = { id: number; e: string; left: number; dur: number };
type Particle = { id: number; e: string; x: number; y: number; dx: number; dy: number };
type Petal = { id: number; e: string; left: number; dur: number; delay: number; size: number };
type Booking = { start: Date; acts: DateType[]; time: string; ride: string; seat: string; ticket: number };

let uid = 0;

const isLetter = CONFIG.mode === "letter";

// Баглааны бөмбөгөр хэсэгт (300×340 хайрцаг) багтах n сарнайн байрлал, төвөөсөө гадагш дэлгэрнэ
function bouquetPoints(n: number) {
  let pts: [number, number][] = [];
  for (let step = 40; step > 8; step -= 0.25) {
    pts = [];
    let row = 0;
    for (let y = 8; y <= 200; y += step * 0.87, row++)
      for (let x = 35 + (row % 2 ? step / 2 : 0); x <= 265; x += step)
        if (Math.hypot(x - 150, y - 120) <= 115) pts.push([x, y]);
    if (pts.length >= n) break;
  }
  return pts
    .slice(0, n)
    .sort((a, b) => Math.hypot(a[0] - 150, a[1] - 110) - Math.hypot(b[0] - 150, b[1] - 110))
    .map(([x, y]) => ({ left: (x / 300) * 100, top: (y / 340) * 100 }));
}
const ROSE_PTS = bouquetPoints(CONFIG.letter.roses);
const GARLAND = ["#ffb3c7", "#ffd59e", "#c9b6ff", "#a8e6cf", "#ffb3c7", "#ffd59e", "#c9b6ff", "#a8e6cf", "#ffb3c7", "#ffd59e", "#c9b6ff"];
const HOME_SPARKS: [number, number, string][] = [[8, 12, "✨"], [88, 8, "💗"], [2, 62, "🌸"], [94, 58, "✨"], [50, -6, "💫"]];
const FUTURE_STARS = [[8, 18], [22, 50], [35, 12], [52, 34], [68, 10], [80, 44], [92, 20], [14, 78], [88, 74]];
const SPARKLES = [[6, 20], [92, 16], [3, 55], [96, 50], [20, 2], [80, 4]];

// Захиа үг үгээрээ бичигдэнэ: үг бүрт дараалсан хоцролт (s)
const WORD_STEP = 0.09;
const PARA_PAUSE = 0.6; // догол мөр хооронд жаахан амсхийнэ
const LETTER_WORDS = (() => {
  let t = 0.6;
  return [CONFIG.letter.to, ...CONFIG.letter.paragraphs].map((para, pi) => {
    if (pi > 0) t += PARA_PAUSE;
    const words = para.split(" ").filter(Boolean);
    const heart = pi > 0 ? CONFIG.letter.hearts[pi - 1] : undefined;
    if (heart) words.push(heart);
    return words.map((w) => ({ w, d: (t += WORD_STEP) }));
  });
})();
const LETTER_END = (LETTER_WORDS.at(-1)?.at(-1)?.d ?? 0) + 0.4;

export default function Invitation() {
  const [screen, setScreen] = useState(0);
  const [envOpen, setEnvOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameWarn, setNameWarn] = useState(false);
  const [read, setRead] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [skipWrite, setSkipWrite] = useState(false);
  const [future, setFuture] = useState("");
  const [futureSending, setFutureSending] = useState(false);
  const [futureSent, setFutureSent] = useState(false);
  const [hugBack, setHugBack] = useState(false);
  const seenFortunes = useRef<string[]>([]);
  const usedCoupons = useRef<string[]>([]);
  const [bloomed, setBloomed] = useState(0);
  const [toastText, setToastText] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [floats, setFloats] = useState<Floater[]>([]);
  const [bursts, setBursts] = useState<Particle[]>([]);

  // screen 1
  const [tries, setTries] = useState(0);
  const [noPos, setNoPos] = useState<{ left: number; top: number } | null>(null);
  const noRef = useRef<HTMLButtonElement>(null);

  // screen 2
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<Date | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [kind, setKind] = useState(false);
  const [period] = useState("🌇 орой");
  const [onlyWarn, setOnlyWarn] = useState(0); // >0 бол "зөвхөн 8:30" анхааруулга
  const [ride, setRide] = useState<string | null>(null);

  // screen 3
  const [acts, setActs] = useState<DateType[]>([]);

  // screen 4
  const [booking, setBooking] = useState<Booking | null>(null);
  const [left, setLeft] = useState(0);

  // screen 5
  const [petals, setPetals] = useState<Petal[]>([]);

  const go = (n: number) => {
    setScreen(n);
    scrollTo(0, 0);
  };

  const toast = (t: string) => {
    setToastText(t);
    setToastOn(true);
    setTimeout(() => setToastOn(false), 2200);
  };

  /* 5 минут юу ч хийгээгүй бол эхний дугтуй руу буцна */
  useEffect(() => {
    if (screen === 0) return;
    let t = setTimeout(() => location.reload(), CONFIG.idleMinutes * 60000);
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(() => location.reload(), CONFIG.idleMinutes * 60000);
    };
    const evs = ["pointerdown", "keydown", "scroll", "touchstart"];
    evs.forEach((e) => addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(t);
      evs.forEach((e) => removeEventListener(e, reset));
    };
  }, [screen]);

  /* Баглааны сарнай тоолуур (сарнай дэлбээлэх хурдтай ижил) */
  useEffect(() => {
    if (screen !== 11) return;
    let n = 0;
    let iv: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        setBloomed(++n);
        if (n >= CONFIG.letter.roses) clearInterval(iv);
      }, 30);
    }, 300);
    return () => {
      clearTimeout(start);
      clearInterval(iv);
    };
  }, [screen]);

  /* floating hearts */
  useEffect(() => {
    const iv = setInterval(() => {
      const f = { id: ++uid, e: FLO[(Math.random() * FLO.length) | 0], left: Math.random() * 100, dur: 7 + Math.random() * 6 };
      setFloats((xs) => [...xs, f]);
      setTimeout(() => setFloats((xs) => xs.filter((x) => x.id !== f.id)), 13000);
    }, 900);
    return () => clearInterval(iv);
  }, []);

  const burst = (x: number, y: number) => {
    const ps = Array.from({ length: 18 }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const d = 80 + Math.random() * 120;
      return { id: ++uid, e: BURST[i % 4], x, y, dx: Math.cos(a) * d, dy: Math.sin(a) * d };
    });
    setBursts((xs) => [...xs, ...ps]);
    const ids = new Set(ps.map((p) => p.id));
    setTimeout(() => setBursts((xs) => xs.filter((p) => !ids.has(p.id))), 1000);
  };

  /* Хариуг admin руу хадгалах */
  const rsvpId = useRef("");
  const track = (patch: Record<string, unknown>) => {
    if (!rsvpId.current) rsvpId.current = crypto.randomUUID();
    fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rsvpId.current, ...patch }),
      keepalive: true,
    }).catch(() => {});
  };

  /* 0 -> 1 */
  const openEnv = () => {
    const n = name.trim();
    if (!n) {
      setNameWarn(true);
      return;
    }
    track({ name: n, step: isLetter ? "Захиа нээсэн" : "Дугтуй нээсэн" });
    setEnvOpen(true);
    setTimeout(() => {
      if (!isLetter) return go(1);
      go(14);
    }, 700);
  };

  /* 1: Тийм / Үгүй */
  const yes = (x: number, y: number) => {
    track({ step: "Тийм гэсэн", noTries: tries });
    burst(x, y);
    setNoPos(null);
    setTimeout(() => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      setToday(t);
      setView(new Date(t.getFullYear(), t.getMonth(), 1));
      go(2);
    }, 600);
  };

  const gaveUp = tries >= 6;

  // Native listeners: touchstart must be non-passive to block the tap.
  useEffect(() => {
    const b = noRef.current;
    if (!b || gaveUp || screen !== 1) return;
    const runAway = (e: Event) => {
      e.preventDefault();
      const w = innerWidth - b.offsetWidth - 20;
      const h = innerHeight - b.offsetHeight - 20;
      setNoPos({ left: 10 + Math.random() * w, top: 10 + Math.random() * h });
      setTries((n) => n + 1);
    };
    b.addEventListener("pointerenter", runAway);
    b.addEventListener("touchstart", runAway, { passive: false });
    return () => {
      b.removeEventListener("pointerenter", runAway);
      b.removeEventListener("touchstart", runAway);
    };
  }, [gaveUp, screen]);

  /* 2: Календарь */
  const ready = !!(date && time && kind && ride);

  const pickTime = (t: string) => {
    if (t === CONFIG.onlyTime) {
      setTime(t);
      setOnlyWarn(0);
    } else {
      setOnlyWarn((n) => n + 1);
    }
  };

  /* 3: Замдаа */
  const toggleAct = (t: DateType) =>
    setActs((xs) => (xs.includes(t) ? xs.filter((x) => x !== t) : [...xs, t]));

  const toConfirm = () => {
    if (!date || !time || !ride || acts.length === 0) return;
    const [H, M] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(H, M, 0, 0);
    setBooking({
      start,
      acts,
      time,
      ride,
      seat: "ABCDEF"[(Math.random() * 6) | 0] + (1 + ((Math.random() * 12) | 0)),
      ticket: (100 + Math.random() * 900) | 0,
    });
    track({ step: "Баталгаажсан", date: dateText(start), time, ride, acts: acts.map((t) => t.e + " " + t.l) });
    go(4);
  };

  /* 4: Баталгаа — countdown */
  useEffect(() => {
    if (!booking) return;
    const tick = () => setLeft(Math.max(0, ((booking.start.getTime() - Date.now()) / 1000) | 0));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [booking]);

  const endOf = (b: Booking) => new Date(b.start.getTime() + CONFIG.durationHours * 3600e3);
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.maps);
  const gcalUrl = (b: Booking) =>
    "https://calendar.google.com/calendar/render?" +
    new URLSearchParams({
      action: "TEMPLATE",
      text: CONFIG.dateTitle + " 💕",
      dates: fmt(b.start) + "/" + fmt(endOf(b)),
      details: CONFIG.withText,
      location: CONFIG.place,
    });

  const downloadIcs = (b: Booking) => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//bolzoo//MN", "BEGIN:VEVENT",
      "UID:" + Date.now() + "@bolzoo", "DTSTAMP:" + fmt(new Date()), "DTSTART:" + fmt(b.start), "DTEND:" + fmt(endOf(b)),
      "SUMMARY:" + CONFIG.dateTitle + " 💕", "LOCATION:" + CONFIG.place, "DESCRIPTION:" + CONFIG.withText,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "bolzoo.ics";
    a.click();
  };

  const rain = (emojis: string[]) =>
    setPetals(
      Array.from({ length: 16 }, (_, i) => ({
        id: ++uid,
        e: emojis[i % emojis.length],
        left: Math.random() * 100,
        dur: 6 + Math.random() * 5,
        delay: Math.random() * 6,
        size: 16 + Math.random() * 14,
      })),
    );

  const accept = (x: number, y: number) => {
    track({ step: "Урилгыг зөвшөөрсөн 💐", accepted: true });
    burst(x, y);
    rain(PETALS);
    setTimeout(() => go(5), 600);
  };

  const actsText = (b: Booking) => b.acts.map((t) => t.e + " " + t.l).join(", ");

  const answerText = (b: Booking) =>
    `💗 Тийм! 🥰 ${dateText(b.start)} (${DOW_FULL[b.start.getDay()]}) ${b.time}-д ${CONFIG.dateTitle.toLowerCase()} (${b.ride}). Замдаа: ${actsText(b)}. Хүлээж байна 💕`;

  const share = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast("Хуулагдлаа — " + CONFIG.fromName + "-д явуулаарай 💌");
    } catch {
      prompt("Хуулаад явуулаарай:", text);
    }
  };

  return (
    <>
      {floats.map((f) => (
        <div key={f.id} className="float" style={{ left: f.left + "vw", animationDuration: f.dur + "s" }}>
          {f.e}
        </div>
      ))}
      {bursts.map((p) => (
        <div
          key={p.id}
          className="burst"
          style={{ left: p.x, top: p.y, "--x": p.dx + "px", "--y": p.dy + "px" } as CSSProperties}
        >
          {p.e}
        </div>
      ))}

      {/* 0. Дугтуй */}
      {screen === 0 && (
        <div className="garland" aria-hidden>
          {GARLAND.map((c, i) => (
            <span key={i} style={{ "--c": c, "--i": i } as CSSProperties} />
          ))}
        </div>
      )}
      {screen === 0 && (
        <section className="screen home">

          <div className="home-card">
            <div className="home-glow" aria-hidden />
            <div className="env-stage">
              <span className="peek peek-l" aria-hidden>🧸</span>
              <span className="peek peek-r" aria-hidden>🐰</span>
              {HOME_SPARKS.map((p, i) => (
                <span
                  key={i}
                  className="home-spark"
                  aria-hidden
                  style={{ left: p[0] + "%", top: p[1] + "%", animationDelay: i * 0.5 + "s" }}
                >
                  {p[2]}
                </span>
              ))}
              <div className={"envelope cute" + (envOpen ? " open" : "")} onClick={openEnv}>
                <div className="env-body" />
                <div className="env-paper">{isLetter ? "💌" : "💗"}</div>
                <div className="flap" />
                <div className="seal">💗</div>
                <div className="env-to">{name.trim() ? "To: " + name.trim() : "To: чамдаа"}</div>
              </div>
            </div>

            <p className="home-hand">{isLetter ? "Зөвхөн чамд зориулав…" : "Чамд нэг санал байна…"}</p>
            <h1 className="home-title">{isLetter ? "Танд захиа иржээ" : "Танд урилга иржээ"}</h1>
            <p className="home-sub">{isLetter ? "Тайван суугаад, дугтуйгаа нээгээрэй 🤍" : "Дугтуйг нээгээд хариугаа өгөөрэй 💗"}</p>

            <label className={"to-line" + (nameWarn ? " warn" : "")}>
              <span>To:</span>
              <input
                placeholder="нэрээ бичээрэй ✍️"
                value={name}
                maxLength={40}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameWarn(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && openEnv()}
              />
            </label>
            {nameWarn && <p className="now-only">Эхлээд нэрээ бичээрэй 🥺</p>}
            <button className="btn-pill home-btn" onClick={openEnv}>
              💌 Нээх
            </button>
            <p className="home-foot">♡ хайраар боож илгээв ♡</p>
          </div>
        </section>
      )}

      {/* 11. 99 сарнай */}
      {screen === 11 && (
        <section className="screen">
          <Petals petals={petals} />
          <div className="card">
            <span className="buddy" aria-hidden>🧸</span>
            <span className="ok-badge">🌹 ЧАМД ЗОРИУЛАВ</span>
            <div className={"rose-bouquet" + (bloomed >= CONFIG.letter.roses ? " done" : "")}>
              {SPARKLES.map((p, i) => (
                <span key={i} className="rb-spark" style={{ left: p[0] + "%", top: p[1] + "%", animationDelay: i * 0.35 + "s" }}>
                  ✨
                </span>
              ))}
              <div className="rb-leaf rb-l1">🌿</div>
              <div className="rb-leaf rb-l2">🌿</div>
              <div className="rb-leaf rb-l3">🍃</div>
              <div className="rb-leaf rb-l4">🍃</div>
              {ROSE_PTS.map((p, i) => (
                <span key={i} className="rb-rose" style={{ left: p.left + "%", top: p.top + "%", animationDelay: 0.3 + i * 0.03 + "s" }}>
                  🌹
                </span>
              ))}
              <div className="rb-wrap" />
              <div className="rb-bow">🎀</div>
              <div className="rb-tag">{name.trim()}-д 💗</div>
            </div>
            <h1 className="f-title rb-count">
              <b>{bloomed}</b> сарнай
            </h1>
            <p className="f-sub">Нэг бүр нь чамайг бодсон нэг мөч 💗</p>
            <button
              className={"btn-pill rb-next" + (bloomed >= CONFIG.letter.roses ? " show" : "")}
              onClick={() => {
                track({ step: CONFIG.letter.roses + " сарнай авсан 🌹" });
                go(10);
                setTimeout(() => track({ step: "Захиа уншиж байна 📖" }), 4000);
              }}
            >
              💌 Одоо захиагаа уншаарай
            </button>
          </div>
        </section>
      )}

      {/* 10. Захиа */}
      {screen === 10 && (
        <section className="screen">
          <div
            className={"letter" + (skipWrite ? " instant" : "")}
            onClick={() => setSkipWrite(true)}
            title="Дарвал бүтнээрээ харагдана"
          >
            <span className="tape tape-l" aria-hidden />
            <span className="tape tape-r" aria-hidden />
            <span className="pressed" aria-hidden>🌸</span>
            <div className="letter-stamp">💌</div>
            {LETTER_WORDS.map((words, i) => (
              <p key={i} className={i === 0 ? "letter-to" : "letter-p2"}>
                {words.map((x, j) => (
                  <span key={j} className="w" style={{ animationDelay: x.d + "s" }}>
                    {x.w}{" "}
                  </span>
                ))}
              </p>
            ))}
            {CONFIG.letter.sign && (
              <p className="letter-sign" style={{ animationDelay: LETTER_END + "s" }}>
                {CONFIG.letter.sign}
              </p>
            )}
            <div className="letter-seal" style={{ animationDelay: (skipWrite ? 0.3 : LETTER_END + 0.6) + "s" }}>
              💗
            </div>
          </div>

          <div className={"reply-zone" + (skipWrite ? " instant" : "")} style={{ animationDelay: LETTER_END + 1 + "s" }}>
            {read ? (
              <div className="reply-sent">
                <div className="reply-sent-ico">💌</div>
                <p className="letter-thanks">Хариу чинь очлоо. Баярлалаа 💗</p>
                <div className="reply-note">{reply}</div>
              </div>
            ) : (
              <div className={"reply" + (sending ? " sending" : "")}>
                <div className="label">✍️ Хариу захиа бичих</div>
                <textarea
                  className="reply-box"
                  aria-label="Хариу захиа"
                  placeholder="Энд хариугаа бичээрэй…"
                  value={reply}
                  maxLength={2000}
                  rows={5}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="reply-count">{reply.length} / 2000</div>
                <button
                  className="btn-pill letter-btn"
                  disabled={!reply.trim() || sending}
                  onClick={(e) => {
                    burst(e.clientX, e.clientY);
                    setSending(true);
                    track({ step: "Хариу бичсэн 💌", reply: reply.trim(), heartSent: true });
                    setTimeout(() => {
                      setRead(true);
                      setSending(false);
                      go(12);
                    }, 1100);
                  }}
                >
                  💌 Хариугаа илгээх
                </button>
              </div>
            )}
          </div>
          {read && <Petals petals={petals} />}
        </section>
      )}

      {/* 12. Ирээдүй */}
      {screen === 12 && (
        <section className="screen">
          {futureSent && <Petals petals={petals} />}
          <div className="card future-card">
            <div className="future-sky">
              {FUTURE_STARS.map((p, i) => (
                <span key={i} style={{ left: p[0] + "%", top: p[1] + "%", animationDelay: i * 0.4 + "s" }}>✦</span>
              ))}
              <div className="future-moon">🌙</div>
              <div className="future-house">🏡</div>
            </div>
            <span className="ok-badge">💌 ХАРИУ ЧИНЬ ОЧЛОО</span>
            {futureSent ? (
              <div className="reply-sent">
                <h1 className="f-title">Энэ ирээдүйг хамтдаа бүтээе 💗</h1>
                <p className="f-sub">Бичсэн мөр бүрийг чинь хадгалж үлдээнэ</p>
                <div className="reply-note">{future}</div>
              </div>
            ) : (
              <div className={"reply" + (futureSending ? " sending" : "")}>
                <h1 className="f-title future-title">Хамгийн аз жаргалтай ирээдүйн тухай бичээрэй ✨</h1>
                <p className="f-sub">Бид хаана, юу хийж, ямар байгаа бол? Мөрөөдлөө чөлөөтэй бичээрэй.</p>
                <textarea
                  className="reply-box"
                  aria-label="Аз жаргалтай ирээдүй"
                  placeholder="10 жилийн дараа бид…"
                  value={future}
                  maxLength={2000}
                  rows={6}
                  onChange={(e) => setFuture(e.target.value)}
                />
                <div className="reply-count">{future.length} / 2000</div>
                <button
                  className="btn-pill letter-btn"
                  disabled={!future.trim() || futureSending}
                  onClick={(e) => {
                    burst(e.clientX, e.clientY);
                    setFutureSending(true);
                    track({ step: "Ирээдүйн тухай бичсэн 🌠", future: future.trim() });
                    setTimeout(() => {
                      setFutureSent(true);
                      setFutureSending(false);
                      rain(["💗", "🤍", "💕", "✨"]);
                      go(13);
                    }, 1100);
                  }}
                >
                  🌠 Илгээх
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 13. Тэврэлт */}
      {screen === 13 && (
        <section className="screen">
          <Petals petals={petals} />
          <div className="card hug-card">
            <span className="ok-badge">🫂 ЧАМД ТЭВРЭЛТ ИРЛЭЭ</span>
            <div className={"hug" + (hugBack ? " back" : "")}>
              <span className="hug-l">🧸</span>
              <span className="hug-r">🧸</span>
              <span className="hug-heart">💗</span>
            </div>
            <h1 className="f-title">Чамайг чанга тэвэрч байна</h1>
            <p className="f-sub">Мөрөөдөл бүрийг чинь хамтдаа биелүүлье 💗</p>
            {hugBack ? (
              <>
                <p className="letter-thanks">🫂 Тэврэлт чинь очлоо. Удахгүй уулзъя 💕</p>
                <button className="btn-pill" onClick={() => go(15)}>
                  🎁 Бас нэг гэнэтийн бэлэг →
                </button>
              </>
            ) : (
              <button
                className="btn-pill"
                onClick={(e) => {
                  burst(e.clientX, e.clientY);
                  setHugBack(true);
                  track({ step: "Тэврэлт буцааж илгээсэн 🫂", hugBack: true });
                }}
              >
                🫂 Би ч бас тэвэрье
              </button>
            )}
          </div>
        </section>
      )}

      {/* 14. Зүрх барих */}
      {screen === 14 && (
        <section className="screen">
          <HeartGame
            onTrap={toast}
            onWin={() => {
              track({ step: "💗 Зүрх барьж захиа нээсэн" });
              rain(["🌹", "🌹", "🌸", "💗"]);
              go(11);
            }}
          />
        </section>
      )}

      {/* 15. Тест */}
      {screen === 15 && (
        <section className="screen">
          <Quiz
            onDone={(score, total) => {
              track({ step: "❓ Тест бөглөсөн", quiz: `${score} / ${total}` });
              go(16);
            }}
          />
        </section>
      )}

      {/* 16. Азын жигнэрэг */}
      {screen === 16 && (
        <section className="screen">
          <Fortune
            onSeen={(t) => {
              seenFortunes.current = [...seenFortunes.current, t];
              track({ step: "🥠 Азын жигнэрэг хагалсан", fortunes: seenFortunes.current });
            }}
            onNext={() => {
              rain(["🎟️", "💗", "✨", "🎀"]);
              go(17);
            }}
          />
        </section>
      )}

      {/* 17. Купон */}
      {screen === 17 && (
        <section className="screen">
          <Petals petals={petals} />
          <Coupons
            onUse={(t) => {
              usedCoupons.current = [...usedCoupons.current, t];
              const n = usedCoupons.current.length;
              toast(n >= CONFIG.games.couponPicks ? `🎉 ${CONFIG.games.couponPicks} купоноо сонголоо! Tiamo-д очлоо 💌` : `🎟️ Сонголоо! Дахиад ${CONFIG.games.couponPicks - n} үлдлээ`);
              track({ step: "🎟️ Купон сонгосон", coupons: usedCoupons.current });
            }}
            onNext={() => go(18)}
          />
        </section>
      )}

      {/* 18. Ярилцах */}
      {screen === 18 && (
        <section className="screen">
          <Talk onAnswer={(talkWhen) => track({ step: "☕ " + talkWhen, talkWhen })} />
        </section>
      )}

      {/* 1. Асуулт */}
      {screen === 1 && (
        <section className="screen">
          <div className="card">
            <div className="avatar">🐱</div>
            <div className="badge">💌 ТУСГАЙ УРИЛГА</div>
            <h1 className="q-title">Чамдаа зориулж 💌</h1>
            <p className="q-sub">Надад нэг хөөрхөн санал байна</p>
            <h2 className="q-main">Надтай болзоонд явах уу?</h2>
            <button className="btn-main" onClick={(e) => yes(e.clientX, e.clientY)}>
              Тийм, хамт явъя 💜
            </button>
            <p className="hint">дотор нь жижиг гэнэтийн бэлэг байгаа ✨</p>
            <button
              ref={noRef}
              className={"btn-no" + (noPos ? " run" : "")}
              style={noPos ?? undefined}
              onClick={gaveUp ? (e) => yes(e.clientX, e.clientY) : undefined}
            >
              {gaveUp ? "за за, тийм 🥺" : "дараа бодъё"}
            </button>
            {tries >= 2 && (
              <div className="sad">
                <div className="big">😿</div>
                <p>Нээрээ надтай явахгүй гэж үү?</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Сонголт */}
      {screen === 2 && today && view && (
        <section className="screen">
          <div className="card">
            <div className="avatar" style={{ width: 84, height: 84, fontSize: 44 }}>😻</div>
            <h2 className="p-title">
              Тэгвэл... чи хэзээ
              <br />
              чөлөөтэй вэ?
            </h2>

            <div className="label">📍 Хаана уулзах вэ?</div>
            <div className="chips two-chips">
              {CONFIG.rides.map((r) => (
                <button key={r} className={"chip" + (ride === r ? " on" : "")} onClick={() => setRide(r)}>
                  {r}
                </button>
              ))}
            </div>

            <div className="label">📅 Өдрөө сонгоорой</div>
            <Calendar today={today} view={view} setView={setView} selected={date} onPick={setDate} />

            <div className="label">🕒 Цагаа сонгоорой</div>
            <div className="big-time">{time ? "🕗 " + time : "--:--"}</div>
            <div className="chips tabs">
              {Object.keys(PERIODS).map((p) => (
                <button key={p} className={"chip" + (p === period ? " on" : "")} onClick={() => setOnlyWarn((n) => n + 1)}>
                  {p}
                </button>
              ))}
            </div>
            <div className="chips slots">
              {PERIODS[period].map((t) => (
                <button key={t} className={"chip" + (t === time ? " on" : "")} onClick={() => pickTime(t)}>
                  {t}
                </button>
              ))}
            </div>
            {onlyWarn > 0 && (
              <p key={onlyWarn} className="now-only">🕗 Зөвхөн 8:30 сонгоно 😼</p>
            )}

            <div className="label">💝 Ямар болзоо вэ?</div>
            <button className={"chip kind" + (kind ? " on" : "")} onClick={() => setKind(!kind)}>
              <small>🏢</small>
              {CONFIG.dateTitle}
            </button>

            <button className="btn-main" id="toConfirm" disabled={!ready} onClick={() => go(3)}>
              Дараа →
            </button>
          </div>
        </section>
      )}

      {/* 3. Замдаа */}
      {screen === 3 && (
        <section className="screen">
          <div className="card">
            <div className="avatar" style={{ width: 84, height: 84, fontSize: 44 }}>🚗</div>
            <h2 className="p-title">
              Замдаа юу
              <br />
              хийх вэ?
            </h2>
            <p className="muted">Хүссэнээ олныг нь сонгож болно</p>

            <div className="label">🛣️ {CONFIG.place} хүртэл</div>
            <div className="chips five">
              {CONFIG.types.map((t) => (
                <button key={t.k} className={"chip" + (acts.includes(t) ? " on" : "")} onClick={() => toggleAct(t)}>
                  <small>{t.e}</small>
                  {t.l}
                </button>
              ))}
            </div>

            <button className="btn-main" id="toConfirm" disabled={acts.length === 0} onClick={toConfirm}>
              Дараа →
            </button>
            <button className="btn-no" style={{ marginTop: 14 }} onClick={() => go(2)}>
              ‹ буцах
            </button>
          </div>
        </section>
      )}

      {/* 4. Баталгаа */}
      {screen === 4 && booking && (
        <section className="screen">
          <div className="card">
            <span className="ok-badge">🎉 БОЛЗОО БАТАЛГААЖЛАА</span>
            <h1 className="c-title">{CONFIG.dateTitle}</h1>
            <p className="muted">{CONFIG.withText}</p>

            <div className="box">
              <div className="row">
                <div className="ico">📅</div>
                <div><small>Огноо</small><b>{dateText(booking.start)}</b></div>
                <span className="tag">{DOW_FULL[booking.start.getDay()]}</span>
              </div>
              <div className="row">
                <div className="ico">🕒</div>
                <div><small>Цаг</small><b>{booking.time}</b></div>
              </div>
              <div className="row">
                <div className="ico">📍</div>
                <div><small>Хаяг</small><b>{CONFIG.place}</b></div>
                <span className="tag">{booking.ride}</span>
              </div>
              <div className="row">
                <div className="ico">🛣️</div>
                <div><small>Замдаа</small><b>{actsText(booking)}</b></div>
              </div>
              <a className="maps" href={mapsUrl} target="_blank" rel="noopener">
                🗺️ Google Maps дээр нээх <span>›</span>
              </a>
            </div>

            {booking.acts.some((t) => t.k === "movie") && (
              <div className="two">
                <div className="box"><div className="row"><div className="ico">💺</div><div><small>Суудал</small><b>{booking.seat}</b></div></div></div>
                <div className="box"><div className="row"><div className="ico">🎟️</div><div><small>Ticket No.</small><b>{booking.ticket}</b></div></div></div>
              </div>
            )}

            <div className="box note" style={{ padding: "12px 14px" }}>
              💗
              <div>
                Зөвшөөрч байвал урилга явуулсан хүн рүү зүрх илгээгээрэй
                <span>Доорх товчийг дарахад огноо, цаг, хаягтай хамт 💗 очно.</span>
              </div>
            </div>

            <div className="count">
              <p>Болзоонд үлдсэн хугацаа</p>
              <div className="nums">
                <div><b>{pad((left / 86400) | 0)}</b><span>өдөр</span></div>
                <div><b>{pad(((left % 86400) / 3600) | 0)}</b><span>цаг</span></div>
                <div><b>{pad(((left % 3600) / 60) | 0)}</b><span>мин</span></div>
              </div>
            </div>

            <button className="btn-main btn-grad" style={{ marginTop: 14 }} onClick={() => { track({ heartSent: true }); share(answerText(booking)); }}>
              💗 Зүрх илгээх
            </button>

            <button className="btn-main btn-accept" onClick={(e) => accept(e.clientX, e.clientY)}>
              💐 Урилгыг зөвшөөрсөн
            </button>

            <div className="acts">
              <a className="act" href={mapsUrl} target="_blank" rel="noopener"><i>📍</i>Maps</a>
              <a className="act" href={gcalUrl(booking)} target="_blank" rel="noopener"><i>📆</i>Google Cal</a>
              <button className="act" onClick={() => downloadIcs(booking)}><i>🍎</i>Apple/.ics</button>
              <button className="act" onClick={() => share(answerText(booking) + "\n" + location.href)}><i>🔗</i>Хуваалцах</button>
            </div>
            <p className="foot">Дараагийн уулзалтыг хэдийнээ төлөвлөөд эхэлжээ! 💕</p>
          </div>
        </section>
      )}

      {/* 5. Цэцэг */}
      {screen === 5 && booking && (
        <section className="screen">
          <Petals petals={petals} />
          <div className="card flower-card">
            <span className="ok-badge">💐 ЧАМД ЗОРИУЛСАН ЦЭЦЭГ</span>
            <div className="bouquet">
              {BOUQUET.map((f, i) => (
                <div
                  key={i}
                  className="stem"
                  style={{ "--r": f.r + "deg", "--h": f.h + "px", "--d": f.d + "s" } as CSSProperties}
                >
                  <span>{f.e}</span>
                </div>
              ))}
              <div className="leaf l1">🌿</div>
              <div className="leaf l2">🍃</div>
              <div className="cone" />
              <div className="bow">🎀</div>
            </div>
            <h1 className="f-title">Баярлалаа 🥹</h1>
            <p className="f-sub">Урилгыг минь зөвшөөрсөнд чамдаа энэ цэцгийг өгье</p>
            <div className="f-date">
              {dateText(booking.start)} · {booking.time} · {CONFIG.place} · {booking.ride}
            </div>
            <p className="foot">Удахгүй уулзъя 💕</p>
            <button className="btn-no" style={{ marginTop: 14 }} onClick={() => go(4)}>
              ‹ буцах
            </button>
          </div>
        </section>
      )}

      <div className={"toast" + (toastOn ? " show" : "")}>{toastText}</div>
    </>
  );
}

function Petals({ petals }: { petals: Petal[] }) {
  return petals.map((p) => (
    <div
      key={p.id}
      className="petal"
      style={{ left: p.left + "vw", fontSize: p.size, animationDuration: p.dur + "s", animationDelay: p.delay + "s" }}
    >
      {p.e}
    </div>
  ));
}

function Calendar({
  today,
  view,
  setView,
  selected,
  onPick,
}: {
  today: Date;
  view: Date;
  setView: (d: Date) => void;
  selected: Date | null;
  onPick: (d: Date) => void;
}) {
  const y = view.getFullYear();
  const m = view.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const atStart = y === today.getFullYear() && m === today.getMonth();

  return (
    <div className="cal">
      <div className="cal-head">
        <button className="nav" disabled={atStart} onClick={() => setView(new Date(y, m - 1, 1))}>‹</button>
        <span>{`${y} оны ${m + 1}-р сар`}</span>
        <button className="nav" onClick={() => setView(new Date(y, m + 1, 1))}>›</button>
      </div>
      <div className="grid">
        {DOW.map((d) => (
          <div key={d} className="dow">{d}</div>
        ))}
        {Array.from({ length: first }, (_, i) => (
          <div key={"e" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const dt = new Date(y, m, i + 1);
          const cls =
            "day" +
            (+dt === +today ? " today" : "") +
            (selected && +dt === +selected ? " sel" : "");
          return (
            <button key={i} className={cls} disabled={dt < today} onClick={() => onPick(dt)}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
