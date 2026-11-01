import type { PartConfig } from "@/config/exam.config";
import { examConfig } from "@/config/exam.config";
import type { Bank } from "@/data/schema";
import { createRng, shuffle } from "./random";

/** Questions eligible for a part. */
export function poolFor(part: PartConfig, bank: Bank): number[] {
  if (part.kind === "problems") return bank.problems.map((p) => p.id);
  if (part.pool === "all") return bank.questions.map((q) => q.id);
  const { topicNumbers, topics } = part.pool;
  return bank.questions
    .filter(
      (q) =>
        (topicNumbers && q.topicNumber && topicNumbers.includes(q.topicNumber)) ||
        (topics && topics.includes(q.topic)),
    )
    .map((q) => q.id);
}

/**
 * Draw `count` items. With stratification, every topic gets a share
 * proportional to its size in the pool (largest-remainder rounding), so a
 * random exam never skips a topic by accident.
 */
export function drawPart(part: PartConfig, bank: Bank, seed: number): number[] {
  const rng = createRng(seed);
  const pool = poolFor(part, bank);
  const count = Math.min(part.count, pool.length);
  let picked: number[];

  if (part.kind === "questions" && examConfig.stratifyByTopic) {
    const byTopic = new Map<string, number[]>();
    for (const id of pool) {
      const q = bank.questions.find((x) => x.id === id)!;
      byTopic.set(q.topic, [...(byTopic.get(q.topic) ?? []), id]);
    }
    const groups = [...byTopic.values()];
    const quotas = groups.map((g) => (g.length / pool.length) * count);
    const base = quotas.map(Math.floor);
    let left = count - base.reduce((s, n) => s + n, 0);
    quotas
      .map((q, i) => ({ i, r: q - Math.floor(q) + rng() * 1e-6 }))
      .sort((a, b) => b.r - a.r)
      .forEach(({ i }) => {
        if (left > 0 && base[i] < groups[i].length) {
          base[i]++;
          left--;
        }
      });
    picked = groups.flatMap((g, i) => shuffle(g, rng).slice(0, base[i]));
  } else {
    picked = shuffle(pool, rng).slice(0, count);
  }

  if (examConfig.shuffleQuestions) return shuffle(picked, rng);
  const order = new Map(pool.map((id, i) => [id, i]));
  return picked.sort((a, b) => order.get(a)! - order.get(b)!);
}

export function optionOrder(keys: string[], seed: number): string[] {
  return examConfig.shuffleOptions ? shuffle(keys, createRng(seed)) : keys;
}
