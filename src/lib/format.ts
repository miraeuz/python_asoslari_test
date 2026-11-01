export const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${pad2(m)}:${pad2(sec)}`;
}

export function formatDuration(ms: number) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h && m) return `${h} soat ${m} daqiqa`;
  if (h) return `${h} soat`;
  return `${m} daqiqa`;
}

export const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

/** "31-oktabr, 2026" — browsers' uz-UZ locale data is inconsistent, so format by hand. */
export const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};

export const difficultyLabel = { easy: "Oson", medium: "Oʻrta", hard: "Qiyin" } as const;

export const typeLabel = {
  single_choice: "Bitta javob",
  multiple_choice: "Bir nechta javob",
  true_false: "Toʻgʻri / Notoʻgʻri",
  fill_blank: "Boʻsh joyni toʻldiring",
  output: "Natijani yozing",
} as const;

export function gradeLabel(pct: number) {
  if (pct >= 86) return { label: "Aʼlo", tone: "success" as const };
  if (pct >= 71) return { label: "Yaxshi", tone: "primary" as const };
  if (pct >= 60) return { label: "Qoniqarli", tone: "accent" as const };
  return { label: "Qayta tayyorlanish kerak", tone: "destructive" as const };
}
