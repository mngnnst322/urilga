"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CONFIG, type DateType } from "./config";

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

export default function Invitation() {
  const [screen, setScreen] = useState(0);
  const [envOpen, setEnvOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameWarn, setNameWarn] = useState(false);
  const [read, setRead] = useState(false);
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
    setTimeout(() => go(CONFIG.mode === "letter" ? 10 : 1), 700);
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

  const accept = (x: number, y: number) => {
    track({ step: "Урилгыг зөвшөөрсөн 💐", accepted: true });
    burst(x, y);
    setPetals(
      Array.from({ length: 16 }, (_, i) => ({
        id: ++uid,
        e: PETALS[i % PETALS.length],
        left: Math.random() * 100,
        dur: 6 + Math.random() * 5,
        delay: Math.random() * 6,
        size: 16 + Math.random() * 14,
      })),
    );
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
        <section className="screen">
          <div className="env-wrap">
            <div className={"envelope" + (envOpen ? " open" : "")} onClick={openEnv}>
              <div className="env-body" />
              <div className="flap" />
              <div className="seal">💗</div>
            </div>
            <div className="eyebrow">{isLetter ? "Нууц захиа ирлээ" : "Нууц урилга ирлээ"}</div>
            <h1>{isLetter ? "Танд захиа иржээ" : "Танд урилга иржээ"}</h1>
            <p className="muted">{isLetter ? "Дугтуйг нээгээд уншаарай." : "Дугтуйг нээгээд хариугаа өгөөрэй."}</p>
            <input
              className={"name-input" + (nameWarn ? " warn" : "")}
              placeholder="Чиний нэр хэн бэ? ✍️"
              value={name}
              maxLength={40}
              onChange={(e) => { setName(e.target.value); setNameWarn(false); }}
              onKeyDown={(e) => e.key === "Enter" && openEnv()}
            />
            {nameWarn && <p className="now-only">Эхлээд нэрээ бичээрэй 🥺</p>}
            <button className="btn-pill" onClick={openEnv}>💌 Нээх</button>
          </div>
        </section>
      )}

      {/* 10. Захиа */}
      {screen === 10 && (
        <section className="screen">
          <div className="letter">
            <div className="letter-stamp">💌</div>
            <p className="letter-to">{CONFIG.letter.to}</p>
            {CONFIG.letter.paragraphs.map((t, i) => (
              <p key={i} className="letter-p" style={{ animationDelay: 0.4 + i * 0.5 + "s" }}>
                {t}
              </p>
            ))}
            <p className="letter-sign" style={{ animationDelay: 0.4 + CONFIG.letter.paragraphs.length * 0.5 + "s" }}>
              {CONFIG.letter.sign}
            </p>
          </div>
          {read ? (
            <p className="letter-thanks">💗 Уншсанд баярлалаа</p>
          ) : (
            <button
              className="btn-pill letter-btn"
              onClick={(e) => {
                burst(e.clientX, e.clientY);
                setRead(true);
                track({ step: "Захиа уншсан 💗", heartSent: true });
              }}
            >
              💗 Уншлаа
            </button>
          )}
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
          {petals.map((p) => (
            <div
              key={p.id}
              className="petal"
              style={{ left: p.left + "vw", fontSize: p.size, animationDuration: p.dur + "s", animationDelay: p.delay + "s" }}
            >
              {p.e}
            </div>
          ))}
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
