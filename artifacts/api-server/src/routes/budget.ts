import { Router } from "express";
import { sql, sum } from "drizzle-orm";
import { db, budgetTransactionsTable } from "@workspace/db";
import { RecordSpendBody } from "@workspace/api-zod";

const router = Router();

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function buildStatus(month: string) {
  const monthlyLimit = parseFloat(process.env.MONTHLY_LIMIT ?? "0");

  const [row] = await db
    .select({ total: sum(budgetTransactionsTable.amount) })
    .from(budgetTransactionsTable)
    .where(sql`${budgetTransactionsTable.month} = ${month}`);

  const spent = Math.round(parseFloat(row?.total ?? "0") * 100) / 100;
  const remaining = Math.round((monthlyLimit - spent) * 100) / 100;

  return { monthlyLimit, spent, remaining };
}

router.get("/budget/status", async (req, res) => {
  try {
    const status = await buildStatus(getCurrentMonth());
    return res.json(status);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch budget status");
    return res.status(500).json({ error: "Failed to fetch budget" });
  }
});

router.post("/budget/spend", async (req, res) => {
  const parsed = RecordSpendBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const month = getCurrentMonth();

  try {
    await db.insert(budgetTransactionsTable).values({
      amount: String(parsed.data.amount),
      description: parsed.data.description ?? null,
      month,
    });

    const status = await buildStatus(month);
    return res.status(201).json(status);
  } catch (err) {
    req.log.error({ err }, "Failed to record spend");
    return res.status(500).json({ error: "Failed to record spend" });
  }
});

export default router;
