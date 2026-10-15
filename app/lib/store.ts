import { promises as fs } from "fs";
import path from "path";

/** Нэг хүний хариу. Хуудас бүр дээр шинэ мэдээлэл нэмэгдэж шинэчлэгдэнэ. */
export type Rsvp = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string; // эхний хуудсанд оруулсан нэр
  step?: string; // хамгийн сүүлд хүрсэн алхам
  noTries?: number; // "дараа бодъё"-г дарах гэж оролдсон тоо
  date?: string;
  time?: string;
  ride?: string;
  acts?: string[];
  heartSent?: boolean;
  accepted?: boolean;
  userAgent?: string;
};

const KEY = "rsvp";

// Vercel дээр: Upstash Redis (Vercel Marketplace) холбоход эдгээр env автоматаар орно.
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmd: (string | number)[]) {
  const res = await fetch(url!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Redis: " + res.status);
  return (await res.json()).result;
}

// Local дээр: .data/rsvp.json файлд хадгална.
const file = path.join(process.cwd(), ".data", "rsvp.json");

async function readFile(): Promise<Record<string, Rsvp>> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return {};
  }
}

export async function getAll(): Promise<Rsvp[]> {
  let all: Rsvp[];
  if (url && token) {
    const flat: string[] = (await redis(["HGETALL", KEY])) ?? [];
    all = [];
    for (let i = 1; i < flat.length; i += 2) all.push(JSON.parse(flat[i]));
  } else {
    all = Object.values(await readFile());
  }
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function save(id: string, patch: Partial<Rsvp>) {
  const now = new Date().toISOString();
  if (url && token) {
    const prev = await redis(["HGET", KEY, id]);
    const cur: Rsvp = prev ? JSON.parse(prev) : { id, createdAt: now, updatedAt: now };
    await redis(["HSET", KEY, id, JSON.stringify({ ...cur, ...patch, id, updatedAt: now })]);
  } else {
    const all = await readFile();
    const cur = all[id] ?? { id, createdAt: now, updatedAt: now };
    all[id] = { ...cur, ...patch, id, updatedAt: now };
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(all, null, 2));
  }
}

export async function remove(id: string) {
  if (url && token) {
    await redis(["HDEL", KEY, id]);
  } else {
    const all = await readFile();
    delete all[id];
    await fs.writeFile(file, JSON.stringify(all, null, 2));
  }
}
