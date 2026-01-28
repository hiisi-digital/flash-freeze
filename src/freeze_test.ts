import { assertEquals, assertThrows } from "jsr:@std/assert";
import { deepFreeze, ensureFrozen, freeze, freezeAll, freezeRecord } from "./freeze.ts";
import type { Freezable, Frozen } from "./types.ts";

// =============================================================================
// freeze() - primitives
// =============================================================================

Deno.test("freeze - returns null as-is", () => {
  assertEquals(freeze(null), null);
});

Deno.test("freeze - returns undefined as-is", () => {
  assertEquals(freeze(undefined), undefined);
});

Deno.test("freeze - returns string as-is", () => {
  assertEquals(freeze("hello"), "hello");
});

Deno.test("freeze - returns number as-is", () => {
  assertEquals(freeze(42), 42);
});

Deno.test("freeze - returns boolean as-is", () => {
  assertEquals(freeze(true), true);
});

Deno.test("freeze - returns bigint as-is", () => {
  assertEquals(freeze(10n), 10n);
});

Deno.test("freeze - returns symbol as-is", () => {
  const sym = Symbol("test");
  assertEquals(freeze(sym), sym);
});

// =============================================================================
// freeze() - plain objects
// =============================================================================

Deno.test("freeze - freezes plain object at top level", () => {
  const obj = { a: 1, b: "two" };
  const frozen = freeze(obj);
  assertEquals(Object.isFrozen(frozen), true);
});

Deno.test("freeze - freezes nested objects", () => {
  const obj = { nested: { deep: { value: 1 } } };
  const frozen = freeze(obj);
  assertEquals(Object.isFrozen(frozen), true);
  assertEquals(Object.isFrozen((frozen as any).nested), true);
  assertEquals(Object.isFrozen((frozen as any).nested.deep), true);
});

Deno.test("freeze - mutation throws in strict mode", () => {
  const obj = freeze({ value: 1 });
  assertThrows(() => {
    (obj as any).value = 2;
  }, TypeError);
});

Deno.test("freeze - nested mutation throws", () => {
  const obj = freeze({ nested: { value: 1 } });
  assertThrows(() => {
    (obj as any).nested.value = 2;
  }, TypeError);
});

Deno.test("freeze - adding new property throws", () => {
  const obj = freeze({ a: 1 });
  assertThrows(() => {
    (obj as any).b = 2;
  }, TypeError);
});

Deno.test("freeze - deleting property throws", () => {
  const obj = freeze({ a: 1 });
  assertThrows(() => {
    delete (obj as any).a;
  }, TypeError);
});

// =============================================================================
// freeze() - arrays
// =============================================================================

Deno.test("freeze - freezes array", () => {
  const arr = [1, 2, 3];
  const frozen = freeze(arr);
  assertEquals(Object.isFrozen(frozen), true);
});

Deno.test("freeze - freezes nested arrays", () => {
  const arr = [[1, 2], [3, [4, 5]]];
  const frozen = freeze(arr);
  assertEquals(Object.isFrozen(frozen), true);
  assertEquals(Object.isFrozen((frozen as any)[0]), true);
  assertEquals(Object.isFrozen((frozen as any)[1]), true);
  assertEquals(Object.isFrozen((frozen as any)[1][1]), true);
});

Deno.test("freeze - array push throws", () => {
  const arr = freeze([1, 2, 3]);
  assertThrows(() => {
    (arr as any).push(4);
  }, TypeError);
});

Deno.test("freeze - array element mutation throws", () => {
  const arr = freeze([{ value: 1 }]);
  assertThrows(() => {
    (arr as any)[0].value = 2;
  }, TypeError);
});

Deno.test("freeze - array index assignment throws", () => {
  const arr = freeze([1, 2, 3]);
  assertThrows(() => {
    (arr as any)[0] = 99;
  }, TypeError);
});

// =============================================================================
// freeze() - Maps
// =============================================================================

Deno.test("freeze - freezes Map", () => {
  const map = new Map([["a", { value: 1 }]]);
  const frozen = freeze(map);
  assertEquals(Object.isFrozen(frozen), true);
});

Deno.test("freeze - freezes Map values deeply", () => {
  const inner = { nested: { deep: true } };
  const map = new Map([["key", inner]]);
  freeze(map);
  assertEquals(Object.isFrozen(inner), true);
  assertEquals(Object.isFrozen(inner.nested), true);
});

Deno.test("freeze - freezes Map keys that are objects", () => {
  const key = { id: 1 };
  const map = new Map([[key, "value"]]);
  freeze(map);
  assertEquals(Object.isFrozen(key), true);
});

// =============================================================================
// freeze() - Sets
// =============================================================================

Deno.test("freeze - freezes Set", () => {
  const set = new Set([{ value: 1 }, { value: 2 }]);
  const frozen = freeze(set);
  assertEquals(Object.isFrozen(frozen), true);
});

Deno.test("freeze - freezes Set values deeply", () => {
  const item = { nested: { deep: true } };
  const set = new Set([item]);
  freeze(set);
  assertEquals(Object.isFrozen(item), true);
  assertEquals(Object.isFrozen(item.nested), true);
});

// =============================================================================
// freeze() - Date and RegExp
// =============================================================================

Deno.test("freeze - freezes Date", () => {
  const date = new Date();
  const frozen = freeze(date);
  assertEquals(Object.isFrozen(frozen), true);
});

Deno.test("freeze - freezes RegExp", () => {
  const regex = /test/gi;
  const frozen = freeze(regex);
  assertEquals(Object.isFrozen(frozen), true);
});

// =============================================================================
// freeze() - circular references
// =============================================================================

Deno.test("freeze - handles circular references in objects", () => {
  const obj: any = { a: 1 };
  obj.self = obj;
  const frozen = freeze(obj);
  assertEquals(Object.isFrozen(frozen), true);
  assertEquals((frozen as any).self, frozen);
});

Deno.test("freeze - handles circular references in arrays", () => {
  const arr: any[] = [1, 2];
  arr.push(arr);
  const frozen = freeze(arr);
  assertEquals(Object.isFrozen(frozen), true);
});

Deno.test("freeze - handles mutual circular references", () => {
  const a: any = { name: "a" };
  const b: any = { name: "b" };
  a.ref = b;
  b.ref = a;
  freeze(a);
  assertEquals(Object.isFrozen(a), true);
  assertEquals(Object.isFrozen(b), true);
});

// =============================================================================
// freeze() - already frozen
// =============================================================================

Deno.test("freeze - returns already-frozen object immediately", () => {
  const obj = Object.freeze({ a: 1 });
  const result = freeze(obj);
  assertEquals(result, obj as any);
});

Deno.test("freeze - skips already-frozen nested objects", () => {
  const inner = Object.freeze({ value: 1 });
  const outer = { inner };
  const frozen = freeze(outer);
  assertEquals(Object.isFrozen(frozen), true);
  assertEquals(Object.isFrozen((frozen as any).inner), true);
});

// =============================================================================
// freeze() - Freezable interface
// =============================================================================

Deno.test("freeze - calls Freezable.freeze() on objects implementing interface", () => {
  let called = false;
  const obj: Freezable<{ value: number }> = {
    value: 42,
    freeze() {
      called = true;
      return Object.freeze({ ...this }) as Frozen<{ value: number }>;
    },
  } as any;
  freeze(obj);
  assertEquals(called, true);
});

// =============================================================================
// freeze() - objects with custom prototypes
// =============================================================================

Deno.test("freeze - freezes objects with custom prototypes", () => {
  class Foo {
    constructor(public value: number) {}
  }
  const foo = new Foo(42);
  const frozen = freeze(foo);
  assertEquals(Object.isFrozen(frozen), true);
  assertThrows(() => {
    (frozen as any).value = 99;
  }, TypeError);
});

Deno.test("freeze - freezes non-enumerable properties on custom prototype objects", () => {
  class Foo {}
  const obj = new Foo() as any;
  Object.defineProperty(obj, "hidden", { value: { deep: true }, enumerable: false, writable: true, configurable: true });
  freeze(obj);
  assertEquals(Object.isFrozen(obj), true);
  // Custom prototype path uses getOwnPropertyNames, so non-enumerable props are traversed
  assertEquals(Object.isFrozen(obj.hidden), true);
});

// =============================================================================
// freeze() - deeply nested stress
// =============================================================================

Deno.test("freeze - handles deeply nested objects without stack overflow", () => {
  let obj: any = { value: 0 };
  const root = obj;
  for (let i = 1; i < 1000; i++) {
    obj.child = { value: i };
    obj = obj.child;
  }
  // Should not throw - stack-based, not recursive
  const frozen = freeze(root);
  assertEquals(Object.isFrozen(frozen), true);
});

// =============================================================================
// freeze() - mixed nested structures
// =============================================================================

Deno.test("freeze - handles mixed nested structures", () => {
  const obj = {
    arr: [1, { nested: true }],
    map: new Map([["key", { value: 1 }]]),
    set: new Set([{ item: 1 }]),
    date: new Date(),
    regex: /pattern/,
    nested: {
      deep: {
        array: [new Map([["a", new Set([{ x: 1 }])]])],
      },
    },
  };
  const frozen = freeze(obj);
  assertEquals(Object.isFrozen(frozen), true);
  assertEquals(Object.isFrozen((frozen as any).arr), true);
  assertEquals(Object.isFrozen((frozen as any).arr[1]), true);
  assertEquals(Object.isFrozen((frozen as any).map), true);
  assertEquals(Object.isFrozen((frozen as any).set), true);
  assertEquals(Object.isFrozen((frozen as any).date), true);
  assertEquals(Object.isFrozen((frozen as any).regex), true);
  assertEquals(Object.isFrozen((frozen as any).nested), true);
  assertEquals(Object.isFrozen((frozen as any).nested.deep), true);
  assertEquals(Object.isFrozen((frozen as any).nested.deep.array), true);
});

// =============================================================================
// deepFreeze alias
// =============================================================================

Deno.test("deepFreeze - is alias for freeze", () => {
  assertEquals(deepFreeze, freeze);
});

// =============================================================================
// ensureFrozen
// =============================================================================

Deno.test("ensureFrozen - freezes unfrozen object", () => {
  const obj = { a: 1 };
  const result = ensureFrozen(obj);
  assertEquals(Object.isFrozen(result), true);
});

Deno.test("ensureFrozen - returns already-frozen object unchanged", () => {
  const obj = Object.freeze({ a: 1 });
  const result = ensureFrozen(obj);
  assertEquals(result, obj as any);
});

Deno.test("ensureFrozen - handles primitives", () => {
  assertEquals(ensureFrozen(42), 42 as any);
  assertEquals(ensureFrozen("str"), "str" as any);
  assertEquals(ensureFrozen(null), null as any);
});

// =============================================================================
// freezeAll
// =============================================================================

Deno.test("freezeAll - freezes multiple objects", () => {
  const a = { x: 1 };
  const b = { y: 2 };
  const c = { z: 3 };
  const [fa, fb, fc] = freezeAll(a, b, c);
  assertEquals(Object.isFrozen(fa), true);
  assertEquals(Object.isFrozen(fb), true);
  assertEquals(Object.isFrozen(fc), true);
});

Deno.test("freezeAll - returns correct values", () => {
  const [a, b] = freezeAll({ v: 1 }, { v: 2 });
  assertEquals((a as any).v, 1);
  assertEquals((b as any).v, 2);
});

// =============================================================================
// freezeRecord
// =============================================================================

Deno.test("freezeRecord - freezes all record values", () => {
  const record = {
    dev: { debug: true },
    prod: { debug: false },
  };
  const result = freezeRecord(record);
  assertEquals(Object.isFrozen(result.dev), true);
  assertEquals(Object.isFrozen(result.prod), true);
});

Deno.test("freezeRecord - preserves keys", () => {
  const record = { a: { v: 1 }, b: { v: 2 } };
  const result = freezeRecord(record);
  assertEquals((result.a as any).v, 1);
  assertEquals((result.b as any).v, 2);
});

// =============================================================================
// freeze() - functions
// =============================================================================

Deno.test("freeze - passes through functions", () => {
  const fn = () => 42;
  const result = freeze(fn);
  assertEquals(result, fn as any);
});

// =============================================================================
// freeze() - objects with symbol properties
// =============================================================================

Deno.test("freeze - freezes objects with symbol keys deeply", () => {
  const sym = Symbol("test");
  const obj: any = {};
  obj[sym] = { value: 1 };
  const frozen = freeze(obj);
  assertEquals(Object.isFrozen(frozen), true);
  assertEquals(Object.isFrozen(obj[sym]), true);
});

// =============================================================================
// freeze() - empty structures
// =============================================================================

Deno.test("freeze - freezes empty object", () => {
  const obj = freeze({});
  assertEquals(Object.isFrozen(obj), true);
});

Deno.test("freeze - freezes empty array", () => {
  const arr = freeze([]);
  assertEquals(Object.isFrozen(arr), true);
});

Deno.test("freeze - freezes empty Map", () => {
  const map = freeze(new Map());
  assertEquals(Object.isFrozen(map), true);
});

Deno.test("freeze - freezes empty Set", () => {
  const set = freeze(new Set());
  assertEquals(Object.isFrozen(set), true);
});
