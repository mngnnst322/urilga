import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getAll, storageMissing } from "../lib/store";
import { isAdmin } from "../lib/auth";
import { deleteRsvp, login, logout } from "./actions";

export const metadata: Metadata = { title: "Admin 🔐", robots: { index: false } };

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <main className="screen admin">
      <Suspense fallback={<div className="card">Ачаалж байна…</div>}>
        <Admin searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Admin({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  await connection(); // env-ийг build үед биш, хүсэлт бүрт уншина
  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="card">
        <h2 className="p-title">🔐 Admin</h2>
        <p className="muted">
          <code>ADMIN_PASSWORD</code> тохируулаагүй байна. Local дээр <code>.env.local</code>, Vercel дээр Environment
          Variables хэсэгт нэмээрэй.
        </p>
      </div>
    );
  }

  if (!(await isAdmin())) {
    const { e } = await searchParams;
    return (
      <form className="card" action={login}>
        <h2 className="p-title">🔐 Admin</h2>
        <input className="name-input" type="password" name="password" placeholder="Нууц үг" autoFocus />
        {e && <p className="now-only">Нууц үг буруу байна</p>}
        <button className="btn-pill" type="submit">Нэвтрэх</button>
      </form>
    );
  }

  const list = storageMissing() ? [] : await getAll();
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar", dateStyle: "short", timeStyle: "short" });

  return (
    <div className="card">
      <div className="admin-head">
        <h2 className="p-title">💌 Хариунууд ({list.length})</h2>
        <form action={logout}>
          <button className="btn-no" type="submit">Гарах</button>
        </form>
      </div>

      {storageMissing() && (
        <p className="now-only">
          ⚠️ Хадгалах сан холбогдоогүй тул хариу хадгалагдахгүй байна. Vercel → Storage → Upstash Redis нэмээд Redeploy
          хийгээрэй.
        </p>
      )}
      {list.length === 0 && <p className="muted">Одоогоор хэн ч урилга нээгээгүй байна.</p>}

      {list.map((r) => (
        <div key={r.id} className="box rsvp">
          <div className="rsvp-top">
            <b className="rsvp-name">{r.name || "Нэргүй"}</b>
            {r.accepted ? <span className="tag">💐 Зөвшөөрсөн</span> : r.step && <span className="tag gray">{r.step}</span>}
          </div>
          {r.reply && (
            <div className="rsvp-reply">
              <small>💌 Хариу захиа</small>
              <p>{r.reply}</p>
            </div>
          )}
          {r.talkWhen && (
            <div className="rsvp-reply talk-admin">
              <small>☕ Ярилцах</small>
              <p>{r.talkWhen}</p>
              {r.talkNote && <p>{r.talkNote}</p>}
            </div>
          )}
          {r.future && (
            <div className="rsvp-reply">
              <small>🌠 Аз жаргалтай ирээдүй</small>
              <p>{r.future}</p>
            </div>
          )}
          <div className="rsvp-grid">
            <small>Огноо / цаг</small>
            <span>{r.date ? `${r.date} · ${r.time}` : "—"}</span>
            <small>Тээвэр</small>
            <span>{r.ride ?? "—"}</span>
            <small>Замдаа</small>
            <span>{r.acts?.join(", ") || "—"}</span>
            <small>&quot;Дараа бодъё&quot;</small>
            <span>{r.noTries ? `${r.noTries} удаа оролдсон 😼` : "—"}</span>
            <small>Тэврэлт 🫂</small>
            <span>{r.hugBack ? "буцааж илгээсэн" : "—"}</span>
            <small>Тест ❓</small>
            <span>{r.quiz ?? "—"}</span>
            <small>Жигнэрэг 🥠</small>
            <span>{r.fortunes?.length ? r.fortunes.join(" · ") : "—"}</span>
            <small>Сонгосон купон 🎟️</small>
            <span>{r.coupons?.length ? r.coupons.join(", ") : "—"}</span>
            <small>Зүрх 💗</small>
            <span>{r.heartSent ? "илгээсэн" : "—"}</span>
            <small>Сүүлд</small>
            <span>{fmt(r.updatedAt)}</span>
          </div>
          <form action={deleteRsvp}>
            <input type="hidden" name="id" value={r.id} />
            <button className="rsvp-del" type="submit">устгах</button>
          </form>
        </div>
      ))}
    </div>
  );
}
