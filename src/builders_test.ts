import { assertEquals } from "jsr:@std/assert";
import {
    emptyFrozenArray,
    emptyFrozenMap,
    emptyFrozenObject,
    emptyFrozenSet,
    frozen,
    frozenArray,
    frozenArrayFilled,
    frozenArrayFrom,
    frozenArrayOf,
    frozenMap,
    frozenMapFromObject,
    frozenObject,
    frozenPair,
    frozenRecordFilled,
    frozenRecordFrom,
    frozenSet,
    frozenSetOf,
    frozenTuple,
} from "./builders.ts";
import { isFrozen } from "./validation.ts";

// =============================================================================
// Object builders
// =============================================================================

Deno.test("frozenObject - creates frozen object from entries", () => {
  const obj = frozenObject([["a", 1], ["b", 2]] as const);
  assertEquals(isFrozen(obj), true);
  assertEquals((obj as any).a, 1);
  assertEquals((obj as any).b, 2);
});

Deno.test("frozen - creates frozen object from literal", () => {
  const obj = frozen({ x: 1, y: { z: 2 } });
  assertEquals(isFrozen(obj), true);
  assertEquals((obj as any).x, 1);
  assertEquals((obj as any).y.z, 2);
});

Deno.test("emptyFrozenObject - creates empty frozen object", () => {
  const obj = emptyFrozenObject();
  assertEquals(isFrozen(obj), true);
  assertEquals(Object.keys(obj as any).length, 0);
});

// =============================================================================
// Array builders
// =============================================================================

Deno.test("frozenArray - creates frozen array from iterable", () => {
  const arr = frozenArray([1, 2, 3]);
  assertEquals(isFrozen(arr), true);
  assertEquals((arr as any).length, 3);
});

Deno.test("frozenArrayOf - creates frozen array from varargs", () => {
  const arr = frozenArrayOf("a", "b", "c");
  assertEquals(isFrozen(arr), true);
  assertEquals((arr as any)[0], "a");
});

Deno.test("emptyFrozenArray - creates empty frozen array", () => {
  const arr = emptyFrozenArray();
  assertEquals(isFrozen(arr), true);
  assertEquals((arr as any).length, 0);
});

Deno.test("frozenArrayFilled - creates filled frozen array", () => {
  const arr = frozenArrayFilled(3, 0);
  assertEquals(isFrozen(arr), true);
  assertEquals((arr as any).length, 3);
  assertEquals((arr as any)[0], 0);
  assertEquals((arr as any)[2], 0);
});

Deno.test("frozenArrayFrom - creates mapped frozen array", () => {
  const arr = frozenArrayFrom(4, (i) => i * i);
  assertEquals(isFrozen(arr), true);
  assertEquals((arr as any)[0], 0);
  assertEquals((arr as any)[1], 1);
  assertEquals((arr as any)[2], 4);
  assertEquals((arr as any)[3], 9);
});

// =============================================================================
// Map builders
// =============================================================================

Deno.test("frozenMap - creates frozen map from entries", () => {
  const map = frozenMap([["a", 1], ["b", 2]]);
  assertEquals(isFrozen(map), true);
  assertEquals((map as any).get("a"), 1);
});

Deno.test("frozenMapFromObject - creates frozen map from object", () => {
  const map = frozenMapFromObject({ x: 10, y: 20 });
  assertEquals(isFrozen(map), true);
  assertEquals((map as any).get("x"), 10);
  assertEquals((map as any).get("y"), 20);
});

Deno.test("emptyFrozenMap - creates empty frozen map", () => {
  const map = emptyFrozenMap();
  assertEquals(isFrozen(map), true);
  assertEquals((map as any).size, 0);
});

// =============================================================================
// Set builders
// =============================================================================

Deno.test("frozenSet - creates frozen set from iterable", () => {
  const set = frozenSet([1, 2, 3]);
  assertEquals(isFrozen(set), true);
  assertEquals((set as any).size, 3);
});

Deno.test("frozenSetOf - creates frozen set from varargs", () => {
  const set = frozenSetOf("a", "b");
  assertEquals(isFrozen(set), true);
  assertEquals((set as any).has("a"), true);
});

Deno.test("emptyFrozenSet - creates empty frozen set", () => {
  const set = emptyFrozenSet();
  assertEquals(isFrozen(set), true);
  assertEquals((set as any).size, 0);
});

// =============================================================================
// Tuple builders
// =============================================================================

Deno.test("frozenTuple - creates frozen tuple", () => {
  const tuple = frozenTuple(1, "two", true);
  assertEquals(isFrozen(tuple), true);
  assertEquals((tuple as any)[0], 1);
  assertEquals((tuple as any)[1], "two");
  assertEquals((tuple as any)[2], true);
});

Deno.test("frozenPair - creates frozen pair", () => {
  const pair = frozenPair("key", 42);
  assertEquals(isFrozen(pair), true);
  assertEquals((pair as any)[0], "key");
  assertEquals((pair as any)[1], 42);
});

// =============================================================================
// Record builders
// =============================================================================

Deno.test("frozenRecordFrom - creates frozen record with mapper", () => {
  const record = frozenRecordFrom(["a", "bb", "ccc"], (key) => key.length);
  assertEquals(isFrozen(record), true);
  assertEquals((record as any).a, 1);
  assertEquals((record as any).bb, 2);
  assertEquals((record as any).ccc, 3);
});

Deno.test("frozenRecordFilled - creates frozen record with same value", () => {
  const record = frozenRecordFilled(["x", "y", "z"], false);
  assertEquals(isFrozen(record), true);
  assertEquals((record as any).x, false);
  assertEquals((record as any).y, false);
  assertEquals((record as any).z, false);
});
