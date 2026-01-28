import { assertEquals, assertThrows } from "jsr:@std/assert";
import { freeze } from "./freeze.ts";
import {
    assertFrozen,
    assertMutable,
    assertShallowFrozen,
    countFrozenObjects,
    findUnfrozenPath,
    FrozenAssertionError,
    isDeeplyFrozen,
    isFrozen,
    isShallowFrozen,
} from "./validation.ts";

// =============================================================================
// isShallowFrozen
// =============================================================================

Deno.test("isShallowFrozen - returns true for null", () => {
  assertEquals(isShallowFrozen(null), true);
});

Deno.test("isShallowFrozen - returns true for undefined", () => {
  assertEquals(isShallowFrozen(undefined), true);
});

Deno.test("isShallowFrozen - returns true for primitives", () => {
  assertEquals(isShallowFrozen(42), true);
  assertEquals(isShallowFrozen("str"), true);
  assertEquals(isShallowFrozen(true), true);
});

Deno.test("isShallowFrozen - returns true for frozen object", () => {
  assertEquals(isShallowFrozen(Object.freeze({ a: 1 })), true);
});

Deno.test("isShallowFrozen - returns false for unfrozen object", () => {
  assertEquals(isShallowFrozen({ a: 1 }), false);
});

Deno.test("isShallowFrozen - returns true even when nested is unfrozen", () => {
  const obj = Object.freeze({ nested: { mutable: true } });
  assertEquals(isShallowFrozen(obj), true);
});

// =============================================================================
// isFrozen (deep)
// =============================================================================

Deno.test("isFrozen - returns true for primitives", () => {
  assertEquals(isFrozen(null), true);
  assertEquals(isFrozen(undefined), true);
  assertEquals(isFrozen(42), true);
  assertEquals(isFrozen("str"), true);
});

Deno.test("isFrozen - returns true for deeply frozen object", () => {
  const obj = freeze({ nested: { deep: { value: 1 } } });
  assertEquals(isFrozen(obj), true);
});

Deno.test("isFrozen - returns false for unfrozen object", () => {
  assertEquals(isFrozen({ a: 1 }), false);
});

Deno.test("isFrozen - returns false for shallowly frozen with unfrozen nested", () => {
  const obj = Object.freeze({ nested: { mutable: true } });
  assertEquals(isFrozen(obj), false);
});

Deno.test("isFrozen - returns true for frozen arrays", () => {
  const arr = freeze([{ a: 1 }, { b: 2 }]);
  assertEquals(isFrozen(arr), true);
});

Deno.test("isFrozen - returns false for array with unfrozen element", () => {
  const arr = Object.freeze([{ mutable: true }]);
  assertEquals(isFrozen(arr), false);
});

Deno.test("isFrozen - handles circular references", () => {
  const obj: any = { a: 1 };
  obj.self = obj;
  freeze(obj);
  assertEquals(isFrozen(obj), true);
});

Deno.test("isFrozen - handles frozen Maps", () => {
  const map = new Map([["key", { value: 1 }]]);
  freeze(map);
  assertEquals(isFrozen(map), true);
});

Deno.test("isFrozen - returns false for Map with unfrozen values", () => {
  const map = new Map([["key", { value: 1 }]]);
  Object.freeze(map);
  assertEquals(isFrozen(map), false);
});

Deno.test("isFrozen - handles frozen Sets", () => {
  const item = { value: 1 };
  const set = new Set([item]);
  freeze(set);
  assertEquals(isFrozen(set), true);
});

// =============================================================================
// isDeeplyFrozen
// =============================================================================

Deno.test("isDeeplyFrozen - is same function as isFrozen impl", () => {
  const obj = freeze({ a: 1 });
  assertEquals(isDeeplyFrozen(obj), true);
  assertEquals(isDeeplyFrozen({ a: 1 }), false);
});

// =============================================================================
// assertFrozen
// =============================================================================

Deno.test("assertFrozen - does not throw for frozen object", () => {
  const obj = freeze({ a: 1 });
  assertFrozen(obj); // should not throw
});

Deno.test("assertFrozen - throws FrozenAssertionError for unfrozen object", () => {
  assertThrows(
    () => assertFrozen({ a: 1 }),
    FrozenAssertionError,
  );
});

Deno.test("assertFrozen - includes name in error message", () => {
  try {
    assertFrozen({ a: 1 }, "config");
  } catch (e) {
    assertEquals(e instanceof FrozenAssertionError, true);
    assertEquals((e as Error).message.includes("config"), true);
  }
});

Deno.test("assertFrozen - throws for shallowly frozen with unfrozen nested", () => {
  const obj = Object.freeze({ nested: { mutable: true } });
  assertThrows(
    () => assertFrozen(obj),
    FrozenAssertionError,
  );
});

// =============================================================================
// assertShallowFrozen
// =============================================================================

Deno.test("assertShallowFrozen - does not throw for frozen object", () => {
  assertShallowFrozen(Object.freeze({ a: 1 }));
});

Deno.test("assertShallowFrozen - throws for unfrozen object", () => {
  assertThrows(
    () => assertShallowFrozen({ a: 1 }),
    FrozenAssertionError,
  );
});

Deno.test("assertShallowFrozen - does not throw even with unfrozen nested", () => {
  const obj = Object.freeze({ nested: { mutable: true } });
  assertShallowFrozen(obj); // should not throw
});

// =============================================================================
// assertMutable
// =============================================================================

Deno.test("assertMutable - does not throw for unfrozen object", () => {
  assertMutable({ a: 1 });
});

Deno.test("assertMutable - throws for frozen object", () => {
  assertThrows(
    () => assertMutable(Object.freeze({ a: 1 })),
    FrozenAssertionError,
  );
});

Deno.test("assertMutable - does not throw for primitives", () => {
  assertMutable(42);
  assertMutable("str");
  assertMutable(null);
});

// =============================================================================
// FrozenAssertionError
// =============================================================================

Deno.test("FrozenAssertionError - has correct name", () => {
  const err = new FrozenAssertionError("test", { a: 1 });
  assertEquals(err.name, "FrozenAssertionError");
});

Deno.test("FrozenAssertionError - stores value", () => {
  const val = { a: 1 };
  const err = new FrozenAssertionError("test", val);
  assertEquals(err.value, val);
});

Deno.test("FrozenAssertionError - stores path", () => {
  const err = new FrozenAssertionError("test", {}, "nested.field");
  assertEquals(err.path, "nested.field");
});

// =============================================================================
// findUnfrozenPath
// =============================================================================

Deno.test("findUnfrozenPath - returns null for fully frozen", () => {
  const obj = freeze({ a: { b: { c: 1 } } });
  assertEquals(findUnfrozenPath(obj), null);
});

Deno.test("findUnfrozenPath - returns null for primitives", () => {
  assertEquals(findUnfrozenPath(42), null);
  assertEquals(findUnfrozenPath(null), null);
  assertEquals(findUnfrozenPath("str"), null);
});

Deno.test("findUnfrozenPath - returns (root) for unfrozen root", () => {
  assertEquals(findUnfrozenPath({ a: 1 }), "(root)");
});

Deno.test("findUnfrozenPath - returns path to unfrozen nested object", () => {
  const obj = Object.freeze({
    a: Object.freeze({ x: 1 }),
    b: { y: 2 }, // not frozen
  });
  assertEquals(findUnfrozenPath(obj), "b");
});

Deno.test("findUnfrozenPath - returns path with array index", () => {
  const obj = Object.freeze({
    arr: Object.freeze([
      Object.freeze({ ok: true }),
      { notFrozen: true },
    ]),
  });
  assertEquals(findUnfrozenPath(obj), "arr[1]");
});

Deno.test("findUnfrozenPath - returns path for deep nesting", () => {
  const deep = { value: 1 }; // unfrozen
  const obj = Object.freeze({
    a: Object.freeze({
      b: Object.freeze({
        c: deep,
      }),
    }),
  });
  assertEquals(findUnfrozenPath(obj), "a.b.c");
});

Deno.test("findUnfrozenPath - handles circular references", () => {
  const obj: any = Object.freeze({ a: 1 });
  // Fully frozen circular - should return null
  const circular: any = { self: null as any };
  circular.self = circular;
  freeze(circular);
  assertEquals(findUnfrozenPath(circular), null);
});

// =============================================================================
// countFrozenObjects
// =============================================================================

Deno.test("countFrozenObjects - counts all frozen", () => {
  const obj = freeze({ a: { b: 1 }, c: [1, 2] });
  const result = countFrozenObjects(obj);
  assertEquals(result.unfrozen, 0);
  assertEquals(result.frozen > 0, true);
  assertEquals(result.total, result.frozen);
});

Deno.test("countFrozenObjects - counts mixed", () => {
  const obj = Object.freeze({
    frozen: Object.freeze({ a: 1 }),
    unfrozen: { b: 2 },
  });
  const result = countFrozenObjects(obj);
  assertEquals(result.frozen >= 2, true); // root + frozen child
  assertEquals(result.unfrozen >= 1, true); // unfrozen child
  assertEquals(result.total, result.frozen + result.unfrozen);
});

Deno.test("countFrozenObjects - returns zeros for primitives", () => {
  const result = countFrozenObjects(42);
  assertEquals(result, { frozen: 0, unfrozen: 0, total: 0 });
});

Deno.test("countFrozenObjects - handles empty object", () => {
  const result = countFrozenObjects(freeze({}));
  assertEquals(result.frozen, 1);
  assertEquals(result.unfrozen, 0);
});
