import { assertEquals, assertThrows } from "jsr:@std/assert";
import { frozenCopy, frozenCopyAll, frozenCopyRecord, snapshot, snapshotHistory } from "./copy.ts";
import { isFrozen } from "./validation.ts";

// =============================================================================
// frozenCopy
// =============================================================================

Deno.test("frozenCopy - creates frozen copy", () => {
  const original = { a: 1, b: { c: 2 } };
  const copy = frozenCopy(original);
  assertEquals(isFrozen(copy), true);
});

Deno.test("frozenCopy - does not modify original", () => {
  const original = { a: 1, b: { c: 2 } };
  frozenCopy(original);
  assertEquals(Object.isFrozen(original), false);
  original.a = 99;
  assertEquals(original.a, 99);
});

Deno.test("frozenCopy - copy has same values", () => {
  const original = { a: 1, b: { c: 2 } };
  const copy = frozenCopy(original);
  assertEquals((copy as any).a, 1);
  assertEquals((copy as any).b.c, 2);
});

Deno.test("frozenCopy - copy is independent of original", () => {
  const original = { a: 1, nested: { value: 10 } };
  const copy = frozenCopy(original);
  original.nested.value = 99;
  assertEquals((copy as any).nested.value, 10);
});

Deno.test("frozenCopy - handles arrays", () => {
  const original = [1, 2, { a: 3 }];
  const copy = frozenCopy(original);
  assertEquals(isFrozen(copy), true);
  assertEquals((copy as any)[2].a, 3);
});

Deno.test("frozenCopy - handles Date", () => {
  const date = new Date("2025-01-01");
  const copy = frozenCopy(date);
  assertEquals(isFrozen(copy), true);
  assertEquals((copy as any).getTime(), date.getTime());
});

Deno.test("frozenCopy - handles RegExp", () => {
  const regex = /test/gi;
  const copy = frozenCopy(regex);
  assertEquals(isFrozen(copy), true);
  assertEquals((copy as any).source, "test");
  assertEquals((copy as any).flags, "gi");
});

Deno.test("frozenCopy - handles Map", () => {
  const map = new Map([["a", { v: 1 }]]);
  const copy = frozenCopy(map);
  assertEquals(isFrozen(copy), true);
});

Deno.test("frozenCopy - handles Set", () => {
  const set = new Set([{ v: 1 }]);
  const copy = frozenCopy(set);
  assertEquals(isFrozen(copy), true);
});

Deno.test("frozenCopy - handles circular references", () => {
  const obj: any = { a: 1 };
  obj.self = obj;
  const copy = frozenCopy(obj);
  assertEquals(isFrozen(copy), true);
  assertEquals((copy as any).a, 1);
  assertEquals((copy as any).self === copy, true);
});

Deno.test("frozenCopy - handles primitives", () => {
  assertEquals(frozenCopy(42) as any, 42);
  assertEquals(frozenCopy("str") as any, "str");
  assertEquals(frozenCopy(null) as any, null);
  assertEquals(frozenCopy(undefined) as any, undefined);
});

Deno.test("frozenCopy - mutation of copy throws", () => {
  const copy = frozenCopy({ value: 1 });
  assertThrows(() => {
    (copy as any).value = 2;
  }, TypeError);
});

// =============================================================================
// frozenCopyAll
// =============================================================================

Deno.test("frozenCopyAll - copies and freezes multiple objects", () => {
  const a = { x: 1 };
  const b = { y: 2 };
  const [ca, cb] = frozenCopyAll(a, b);
  assertEquals(isFrozen(ca), true);
  assertEquals(isFrozen(cb), true);
  assertEquals(Object.isFrozen(a), false);
  assertEquals(Object.isFrozen(b), false);
});

// =============================================================================
// frozenCopyRecord
// =============================================================================

Deno.test("frozenCopyRecord - copies and freezes record values", () => {
  const record = { dev: { debug: true }, prod: { debug: false } };
  const result = frozenCopyRecord(record);
  assertEquals(isFrozen(result.dev), true);
  assertEquals(isFrozen(result.prod), true);
  assertEquals(Object.isFrozen(record.dev), false);
});

// =============================================================================
// snapshot
// =============================================================================

Deno.test("snapshot - is alias for frozenCopy", () => {
  assertEquals(snapshot, frozenCopy);
});

// =============================================================================
// snapshotHistory
// =============================================================================

Deno.test("snapshotHistory - creates frozen snapshots of all states", () => {
  const states = [
    { version: 1, data: "a" },
    { version: 2, data: "b" },
    { version: 3, data: "c" },
  ];
  const history = snapshotHistory(states);
  assertEquals(history.length, 3);
  for (const snap of history) {
    assertEquals(isFrozen(snap), true);
  }
  assertEquals((history[0] as any).version, 1);
  assertEquals((history[2] as any).version, 3);
});

Deno.test("snapshotHistory - snapshots are independent of originals", () => {
  const states = [{ count: 0 }];
  const history = snapshotHistory(states);
  states[0]!.count = 99;
  assertEquals((history[0] as any).count, 0);
});
