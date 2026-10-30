import { save, type Rsvp } from "../../lib/store";

const FIELDS = ["name", "step", "noTries", "date", "time", "ride", "acts", "heartSent", "accepted", "reply", "future", "hugBack", "quiz", "fortunes", "coupons", "talkWhen", "talkNote"] as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== "string" || !/^[\w-]{8,64}$/.test(id)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const patch: Partial<Rsvp> = { userAgent: req.headers.get("user-agent")?.slice(0, 200) };
  for (const k of FIELDS) if (k in body) Object.assign(patch, { [k]: body[k] });
  if (typeof patch.reply === "string") patch.reply = patch.reply.slice(0, 2000);
  if (typeof patch.talkNote === "string") patch.talkNote = patch.talkNote.slice(0, 1000);
  if (typeof patch.future === "string") patch.future = patch.future.slice(0, 2000);
  await save(id, patch);
  return Response.json({ ok: true });
}
