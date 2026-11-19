"use client";

import { useEffect, useRef, useState } from "react";
import { CONFIG } from "./config";

const G = CONFIG.games;
const HEARTS = ["💗", "💖", "💕", "❤️", "💘"];

type Drop = { id: number; e: string; left: number; dur: number; trap?: string; caught?: boolean };
let did = 0;

/* 💗 Унаж буй зүрхнүүдийг барих. Хуурамч зүйлс барьвал оноо хасагдана. */
export function HeartGame({ onWin, onTrap }: { onWin: () => void; onTrap: (say: string) => void }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const won = score >= G.heartsToCatch;

  useEffect(() => {
    if (won) return;
    const iv = setInterval(() => {
      const isTrap = Math.random() < 0.22;
      const trap = G.traps[(Math.random() * G.traps.length) | 0];
      setDrops((ds) => [
        ...ds,
        {
          id: ++did,
          e: isTrap ? trap.e : HEARTS[(Math.random() * HEARTS.length) | 0],
          trap: isTrap ? trap.say : undefined,
          left: 6 + Math.random() * 82,
          dur: 2.6 + Math.random() * 1.6,
        },
      ]);
    }, 520);
    return () => clearInterval(iv);
  }, [won]);

  // Хангалттай зүрх бармагц шууд дараагийн хуудас руу
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  });
  useEffect(() => {
    if (!won) return;
    const t = setTimeout(() => onWinRef.current(), 600);
    return () => clearTimeout(t);
  }, [won]);

  const catchDrop = (d: Drop) => {
    if (d.caught || won) return;
    setDrops((ds) => ds.map((x) => (x.id === d.id ? { ...x, caught: true } : x)));
    setTimeout(() => setDrops((ds) => ds.filter((x) => x.id !== d.id)), 350);
    if (d.trap) {
      onTrap(d.trap);
      setScore((n) => Math.max(0, n - 1));
    } else {
      setScore((n) => n + 1);
    }
  };

  return (
    <div className="card game-card">
      <span className="buddy" aria-hidden>🐱</span>
      <span className="ok-badge">💗 ЗАХИА ТҮГЖЭЭТЭЙ БАЙНА</span>
      <h1 className="f-title game-title">{G.heartsToCatch} зүрх бариад захиагаа нээгээрэй</h1>
      <p className="f-sub">Зүрхэн дээр дараарай. Бусад юмнаас болгоомжлоорой 😼</p>
      <div className="game-bar">
        <div style={{ width: Math.min(100, (score / G.heartsToCatch) * 100) + "%" }} />
        <span>
          {Math.min(score, G.heartsToCatch)} / {G.heartsToCatch}
        </span>
      </div>
      <div className={"game-field" + (won ? " won" : "")}>
        {drops.map((d) => (
          <button
            key={d.id}
            className={"drop" + (d.caught ? (d.trap ? " bad" : " got") : "")}
            style={{ left: d.left + "%", animationDuration: d.dur + "s" }}
            onPointerDown={() => catchDrop(d)}
            onAnimationEnd={(e) => e.animationName === "fallDrop" && setDrops((ds) => ds.filter((x) => x.id !== d.id))}
            aria-label={d.trap ? "хуурамч" : "зүрх"}
          >
            {d.e}
          </button>
        ))}
      </div>
    </div>
  );
}

/* 🥠 Азын жигнэрэг: дарахад хагарч, санамсаргүй зурвас гарна. */
export function Fortune({ onSeen, onNext }: { onSeen: (t: string) => void; onNext: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [n, setN] = useState(0);

  const crack = () => {
    const pool = G.fortunes.filter((f) => f !== msg);
    const t = pool[(Math.random() * pool.length) | 0];
    setMsg(t);
    setN((x) => x + 1);
    onSeen(t);
  };

  return (
    <div className="card fortune-card">
      <span className="buddy" aria-hidden>🐼</span>
      <span className="ok-badge">🥠 АЗЫН ЖИГНЭРЭГ</span>
      {msg ? (
        <div key={n} className="fortune-open">
          <div className="fortune-halves">
            <span>🥠</span>
            <span>🥠</span>
          </div>
          <div className="fortune-paper">{msg}</div>
          <div className="fortune-acts">
            <button className="btn-no" onClick={crack}>
              🥠 Дахиад нэгийг
            </button>
            <button className="btn-pill" onClick={onNext}>
              Цааш нь →
            </button>
          </div>
        </div>
      ) : (
        <>
          <button className="fortune-cookie" onClick={crack} aria-label="Жигнэрэг хагалах">
            🥠
          </button>
          <p className="f-sub">Дээр нь дарж хагалаарай</p>
        </>
      )}
    </div>
  );
}

/* 🎟️ Хайрын купонууд: дарахад бүрхүүл нь урагдаж, "ашиглах" товч гарна. */
export function Coupons({ onUse, onNext }: { onUse: (t: string) => void; onNext: () => void }) {
  const [open, setOpen] = useState<number[]>([]);
  const [used, setUsed] = useState<number[]>([]);
  const full = used.length >= G.couponPicks;

  return (
    <div className="card coupon-card">
      <span className="buddy" aria-hidden>🐰</span>
      <span className="ok-badge">🎟️ ХАЙРЫН КУПОН</span>
      <h1 className="f-title">Чамд зориулсан купонууд</h1>
      <p className="f-sub">Урж нээгээд хамгийн дуртай {G.couponPicks}-ыг нь сонгоорой. Хугацаа дуусахгүй 😉</p>
      <div className={"coupon-left" + (full ? " full" : "")}>
        {full ? "🎉 Сонголт дууслаа!" : `${used.length} / ${G.couponPicks} сонгосон`}
      </div>
      <div className="coupons">
        {G.coupons.map((c, n) => (
          <div
            key={n}
            className={
              "coupon" + (open.includes(n) ? " open" : "") + (used.includes(n) ? " used" : full ? " off" : "")
            }
          >
            <div className="coupon-body">
              <span className="coupon-e">{c.e}</span>
              <span className="coupon-t">{c.t}</span>
              {open.includes(n) &&
                (used.includes(n) ? (
                  <span className="coupon-stamp">СОНГОСОН ✓</span>
                ) : full ? null : (
                  <button
                    className="coupon-use"
                    onClick={() => {
                      setUsed((u) => [...u, n]);
                      onUse(c.e + " " + c.t);
                    }}
                  >
                    Сонгох
                  </button>
                ))}
            </div>
            <button className="coupon-cover" onClick={() => setOpen((o) => [...o, n])} aria-label="Купон урах">
              <span>🎟️</span>
              <small>урж нээх</small>
            </button>
          </div>
        ))}
      </div>
      {full ? (
        <button className="btn-pill" onClick={onNext}>
          Сүүлийн нэг зүйл… →
        </button>
      ) : (
        <p className="foot">Сонгосон купон чинь Мянгаад очно 💌</p>
      )}
    </div>
  );
}
