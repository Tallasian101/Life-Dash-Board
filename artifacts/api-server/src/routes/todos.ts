import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, todosTable } from "@workspace/db";
import { CreateTodoBody, UpdateTodoParams, UpdateTodoBody, DeleteTodoParams } from "@workspace/api-zod";

const router = Router();

router.get("/todos", async (req, res) => {
  try {
    const todos = await db.select().from(todosTable).orderBy(todosTable.createdAt);
    res.json(
      todos.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch todos");
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

router.post("/todos", async (req, res) => {
  const parsed = CreateTodoBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const [todo] = await db.insert(todosTable).values({ text: parsed.data.text }).returning();
    return res.status(201).json({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create todo");
    return res.status(500).json({ error: "Failed to create todo" });
  }
});

router.patch("/todos/:id", async (req, res) => {
  const paramsParsed = UpdateTodoParams.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const bodyParsed = UpdateTodoBody.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const updates: Partial<{ text: string; completed: boolean }> = {};
    if (bodyParsed.data.text !== undefined) updates.text = bodyParsed.data.text;
    if (bodyParsed.data.completed !== undefined) updates.completed = bodyParsed.data.completed;

    const [todo] = await db
      .update(todosTable)
      .set(updates)
      .where(eq(todosTable.id, paramsParsed.data.id))
      .returning();

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.json({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update todo");
    return res.status(500).json({ error: "Failed to update todo" });
  }
});

router.delete("/todos/:id", async (req, res) => {
  const parsed = DeleteTodoParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const [deleted] = await db
      .delete(todosTable)
      .where(eq(todosTable.id, parsed.data.id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete todo");
    return res.status(500).json({ error: "Failed to delete todo" });
  }
});

export default router;
