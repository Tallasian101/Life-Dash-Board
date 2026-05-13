import { Router } from "express";
import { sql, sum } from "drizzle-orm";
import { db, focusSessionsTable } from "@workspace/db";
import { SaveFocusSessionBody } from "@workspace/api-zod";

const router = Router();

router.post("/focus/sessions", async (req, res) => {
  const parsed = SaveFocusSessionBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const [session] = await db
      .insert(focusSessionsTable)
      .values({
        date: parsed.data.date,
        durationSeconds: parsed.data.durationSeconds,
      })
      .returning();

    return res.status(201).json({
      id: session.id,
      date: session.date,
      durationSeconds: session.durationSeconds,
      createdAt: session.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save focus session");
    return res.status(500).json({ error: "Failed to save focus session" });
  }
});

router.get("/focus/week", async (req, res) => {
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  try {
    const rows = await db
      .select({
        date: focusSessionsTable.date,
        totalSeconds: sum(focusSessionsTable.durationSeconds),
      })
      .from(focusSessionsTable)
      .where(
        sql`${focusSessionsTable.date} >= ${weekDays[0]} AND ${focusSessionsTable.date} <= ${weekDays[6]}`
      )
      .groupBy(focusSessionsTable.date);

    const totalsMap = new Map(rows.map((r) => [r.date, Number(r.totalSeconds ?? 0)]));

    const result = weekDays.map((date, i) => ({
      date,
      label: DAY_LABELS[i],
      totalMinutes: Math.round((totalsMap.get(date) ?? 0) / 60),
    }));

    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch focus week");
    return res.status(500).json({ error: "Failed to fetch focus data" });
  }
});

export default router;
