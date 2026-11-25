import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

// Free-tier friendly model; override with GEMINI_MODEL if Google renames it.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

export const ParsedExpense = z.object({
  amount: z.number().positive(),
  type: z.enum(["expense", "income"]),
  category: z.string(),
  account: z.string().nullable(),
  note: z.string(),
});
export type ParsedExpense = z.infer<typeof ParsedExpense>;

/**
 * Turn free text like "20 bus to uni monzo" into a structured transaction.
 * The caller passes the user's own category and account names so the model
 * picks from them instead of inventing new ones.
 */
export async function parseExpense(
  text: string,
  categories: string[],
  accounts: string[],
): Promise<ParsedExpense> {
  const res = await client().models.generateContent({
    model: MODEL,
    contents: `Parse this personal finance entry (currency GBP unless stated): "${text}"
Categories (pick the closest one exactly): ${categories.join(", ")}
Accounts (pick one exactly, or null if not mentioned): ${accounts.join(", ")}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          type: { type: Type.STRING, enum: ["expense", "income"] },
          category: { type: Type.STRING },
          account: { type: Type.STRING, nullable: true },
          note: { type: Type.STRING },
        },
        required: ["amount", "type", "category", "account", "note"],
      },
    },
  });
  return ParsedExpense.parse(JSON.parse(res.text ?? "{}"));
}
