/**
 * Flash-Freeze Builders
 *
 * Factory functions that create already-frozen data structures.
 * More efficient than creating a mutable structure and then freezing it,
 * because we freeze as we build.
 *
 * @module
 */

import { freeze } from "./freeze.ts";
import type { Frozen } from "./types.ts";

// Cached empty sentinels (frozen and empty, safe to share)
const _EMPTY_OBJ = freeze({});
const _EMPTY_ARR = freeze([]);
const _EMPTY_MAP = freeze(new Map());
const _EMPTY_SET = freeze(new Set());

// =============================================================================
// Object Builders
// =============================================================================

/**
 * Create a frozen object from key-value pairs.
 *
 * @param entries - Key-value pairs as an iterable
 * @returns Frozen object
 *
 * @example
 * ```ts
 * const config = frozenObject([
 *   ["host", "localhost"],
 *   ["port", 8080]
 * ]);
 * // config is Frozen<{ host: string; port: number }>
 * ```
 */
export function frozenObject<K extends string | number | symbol, V>(
  entries: Iterable<readonly [K, V]>
): Frozen<Record<K, V>> {
  const obj = {} as Record<K, V>;
  for (const [key, value] of entries) {
    obj[key] = value;
  }
  return freeze(obj);
}

/**
 * Create a frozen object from a plain object literal.
 * Convenience wrapper that provides better type inference.
 *
 * @param obj - Object literal
 * @returns Frozen object
 *
 * @example
 * ```ts
 * const config = frozen({
 *   host: "localhost",
 *   port: 8080,
 *   options: { debug: true }
 * });
 * ```
 */
export function frozen<T extends object>(obj: T): Frozen<T> {
  return freeze(obj);
}

/**
 * Create an empty frozen object.
 * Useful as a default/sentinel value.
 *
 * @returns Empty frozen object
 */
export function emptyFrozenObject<T extends object = Record<string, never>>(): Frozen<T> {
  return _EMPTY_OBJ as Frozen<T>;
}

// =============================================================================
// Array Builders
// =============================================================================

/**
 * Create a frozen array from items.
 *
 * @param items - Items for the array
 * @returns Frozen array
 *
 * @example
 * ```ts
 * const numbers = frozenArray([1, 2, 3]);
 * const users = frozenArray(fetchUsers());
 * ```
 */
export function frozenArray<T>(items: Iterable<T>): Frozen<T[]> {
  return freeze([...items]);
}

/**
 * Create a frozen array from variadic arguments.
 *
 * @param items - Items to include
 * @returns Frozen array
 *
 * @example
 * ```ts
 * const tags = frozenArrayOf("admin", "user", "guest");
 * ```
 */
export function frozenArrayOf<T>(...items: T[]): Frozen<T[]> {
  return freeze(items);
}

/**
 * Create an empty frozen array.
 * Useful as a default/sentinel value.
 *
 * @returns Empty frozen array
 */
export function emptyFrozenArray<T = never>(): Frozen<T[]> {
  return _EMPTY_ARR as unknown as Frozen<T[]>;
}

/**
 * Create a frozen array of a specific length filled with a value.
 *
 * @param length - Length of array
 * @param value - Value to fill with
 * @returns Frozen filled array
 *
 * @example
 * ```ts
 * const zeros = frozenArrayFilled(10, 0);
 * ```
 */
export function frozenArrayFilled<T>(length: number, value: T): Frozen<T[]> {
  const arr = new Array<T>(length);
  for (let i = 0; i < length; i++) {
    arr[i] = value;
  }
  return freeze(arr);
}

/**
 * Create a frozen array by mapping over a range.
 *
 * @param length - Number of elements
 * @param mapper - Function to generate each element
 * @returns Frozen array
 *
 * @example
 * ```ts
 * const squares = frozenArrayFrom(5, i => i * i);
 * // [0, 1, 4, 9, 16]
 * ```
 */
export function frozenArrayFrom<T>(
  length: number,
  mapper: (index: number) => T
): Frozen<T[]> {
  const arr = new Array<T>(length);
  for (let i = 0; i < length; i++) {
    arr[i] = mapper(i);
  }
  return freeze(arr);
}

// =============================================================================
// Map Builders
// =============================================================================

/**
 * Create a frozen Map from entries.
 *
 * @param entries - Map entries
 * @returns Frozen map
 *
 * @example
 * ```ts
 * const userRoles = frozenMap([
 *   ["alice", "admin"],
 *   ["bob", "user"]
 * ]);
 * ```
 */
export function frozenMap<K, V>(
  entries: Iterable<readonly [K, V]>
): Frozen<Map<K, V>> {
  return freeze(new Map(entries));
}

/**
 * Create a frozen Map from an object.
 * Keys become Map keys, values become Map values.
 *
 * @param obj - Object to convert
 * @returns Frozen map
 *
 * @example
 * ```ts
 * const config = frozenMapFromObject({
 *   debug: true,
 *   verbose: false
 * });
 * // Map { "debug" => true, "verbose" => false }
 * ```
 */
export function frozenMapFromObject<V>(
  obj: Record<string, V>
): Frozen<Map<string, V>> {
  const map = new Map<string, V>();
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const value = obj[key] as V;
    map.set(key, value);
  }
  return freeze(map);
}

/**
 * Create an empty frozen Map.
 *
 * @returns Empty frozen map
 */
export function emptyFrozenMap<K = never, V = never>(): Frozen<Map<K, V>> {
  return _EMPTY_MAP as unknown as Frozen<Map<K, V>>;
}

// =============================================================================
// Set Builders
// =============================================================================

/**
 * Create a frozen Set from items.
 *
 * @param items - Set items
 * @returns Frozen set
 *
 * @example
 * ```ts
 * const allowedRoles = frozenSet(["admin", "user", "guest"]);
 * ```
 */
export function frozenSet<T>(items: Iterable<T>): Frozen<Set<T>> {
  return freeze(new Set(items));
}

/**
 * Create a frozen Set from variadic arguments.
 *
 * @param items - Items to include
 * @returns Frozen set
 *
 * @example
 * ```ts
 * const tags = frozenSetOf("important", "urgent", "reviewed");
 * ```
 */
export function frozenSetOf<T>(...items: T[]): Frozen<Set<T>> {
  return freeze(new Set(items));
}

/**
 * Create an empty frozen Set.
 *
 * @returns Empty frozen set
 */
export function emptyFrozenSet<T = never>(): Frozen<Set<T>> {
  return _EMPTY_SET as unknown as Frozen<Set<T>>;
}

// =============================================================================
// Tuple Builders
// =============================================================================

/**
 * Create a frozen tuple (fixed-length array with known types).
 *
 * @param items - Tuple items
 * @returns Frozen tuple
 *
 * @example
 * ```ts
 * const point = frozenTuple(10, 20);
 * // type: Frozen<[number, number]>
 *
 * const result = frozenTuple("success", 200, { data: [] });
 * // type: Frozen<[string, number, { data: never[] }]>
 * ```
 */
export function frozenTuple<T extends unknown[]>(...items: T): Frozen<T> {
  return freeze(items) as Frozen<T>;
}

/**
 * Create a frozen pair (2-element tuple).
 * Common pattern for key-value or coordinate pairs.
 *
 * @param first - First element
 * @param second - Second element
 * @returns Frozen pair
 *
 * @example
 * ```ts
 * const entry = frozenPair("name", "Alice");
 * const point = frozenPair(10, 20);
 * ```
 */
export function frozenPair<A, B>(first: A, second: B): Frozen<[A, B]> {
  return freeze([first, second]) as Frozen<[A, B]>;
}

// =============================================================================
// Record Builders
// =============================================================================

/**
 * Create a frozen record by transforming values.
 *
 * @param keys - Keys for the record
 * @param valueMapper - Function to generate value for each key
 * @returns Frozen record
 *
 * @example
 * ```ts
 * const lengths = frozenRecordFrom(
 *   ["hello", "world"],
 *   str => str.length
 * );
 * // { hello: 5, world: 5 }
 * ```
 */
export function frozenRecordFrom<K extends string, V>(
  keys: readonly K[],
  valueMapper: (key: K, index: number) => V
): Frozen<Record<K, V>> {
  const obj = {} as Record<K, V>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    obj[key] = valueMapper(key, i);
  }
  return freeze(obj);
}

/**
 * Create a frozen record with all keys mapped to the same value.
 *
 * @param keys - Keys for the record
 * @param value - Value for all keys
 * @returns Frozen record
 *
 * @example
 * ```ts
 * const defaults = frozenRecordFilled(
 *   ["enabled", "visible", "active"],
 *   false
 * );
 * // { enabled: false, visible: false, active: false }
 * ```
 */
export function frozenRecordFilled<K extends string, V>(
  keys: readonly K[],
  value: V
): Frozen<Record<K, V>> {
  const obj = {} as Record<K, V>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    obj[key] = value;
  }
  return freeze(obj);
}
