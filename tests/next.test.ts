import { describe, expect, test } from "bun:test";
import { priorityOf, shape, type Task } from "../scripts/next";

const task = (id: string, priority: string, status = "open"): Task => ({
  id,
  title: `task ${id}`,
  status,
  priority,
});

describe("next — the queue shape (BRF-FIRST-CONTACT)", () => {
  test("claimed work is separated from startable work", () => {
    const q = shape([task("td-aaaaaa", "P2", "in_progress"), task("td-bbbbbb", "P2")], 2);
    expect(q.inProgress.map((t) => t.id)).toEqual(["td-aaaaaa"]);
    expect(q.ready.map((t) => t.id)).toEqual(["td-bbbbbb"]);
  });

  test("the depth reading: rows the default view did not show are counted, not dropped", () => {
    // the deferred mechanism holds a row back; the view says how many it hides
    const q = shape([task("td-aaaaaa", "P1")], 2);
    expect(q.hidden).toBe(1);
    // and an unasked question is null, never a zero dressed as a measurement
    expect(shape([task("td-aaaaaa", "P1")], null).hidden).toBeNull();
  });

  test("priority is numeric for sorting and for the counts, whatever td prints", () => {
    expect(priorityOf(task("td-aaaaaa", "P3"))).toBe(3);
    expect(priorityOf({ id: "x", title: "x", status: "open", priority: 1 })).toBe(1);
    // an unreadable field must not silently outrank a P1
    expect(priorityOf(task("td-aaaaaa", "urgent"))).toBe(99);
    const q = shape([task("td-aaaaaa", "P3"), task("td-bbbbbb", "P1"), task("td-cccccc", "P2")], 3);
    expect(q.ready.map((t) => t.id)).toEqual(["td-bbbbbb", "td-cccccc", "td-aaaaaa"]);
    expect(q.counts).toEqual({ 1: 1, 2: 1, 3: 1 });
  });

  test("closed rows are not the queue", () => {
    const q = shape([task("td-aaaaaa", "P2", "closed"), task("td-bbbbbb", "P2")], 1);
    expect(q.ready.map((t) => t.id)).toEqual(["td-bbbbbb"]);
  });

  test("ties break on id, so the reading is stable between runs", () => {
    const a = shape([task("td-cccccc", "P2"), task("td-aaaaaa", "P2")], 2);
    const b = shape([task("td-aaaaaa", "P2"), task("td-cccccc", "P2")], 2);
    expect(a.ready.map((t) => t.id)).toEqual(b.ready.map((t) => t.id));
  });
});
