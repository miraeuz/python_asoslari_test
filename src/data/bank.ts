import raw from "./questions.json";
import { normalizeBank, type Bank, type RawBank } from "./schema";

/** The normalized bank, built once at startup. */
export const bank: Bank = normalizeBank(raw as unknown as RawBank);

export const questionById = new Map(bank.questions.map((q) => [q.id, q]));
export const problemById = new Map(bank.problems.map((p) => [p.id, p]));
