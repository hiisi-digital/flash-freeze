/**
 * Flash-Freeze Copy Utilities
 *
 * Functions that create frozen copies of data without mutating the original.
 * Use these when you need to preserve the original mutable version.
 *
 * @module
 */

import { freeze } from "./freeze.ts";
import type { Frozen } from "./types.ts";

// =============================================================================
// Core Copy Function
// =============================================================================

/**
 * Create a deep copy of an object and freeze it.
 * The original object is NOT modified.
 *
 * Use this when:
 * - You need to keep the original mutable
 * - You're creating a snapshot of changing data
 * - You want to safely share a copy while continuing to mutate the original
 *
 * ## Performance Note
 * This is slower than `freeze()` because it must clone first.
 * If you don't need to preserve the original, use `freeze()` directly.
 *
 * @param obj - Object to copy and freeze
 * @returns Frozen deep copy (original unchanged)
 *
 * @example
 * ```ts
 * const original = { count: 0 };
 * const snapshot = frozenCopy(original);
 *
 * original.count = 1;           // OK - original is still mutable
 * console.log(snapshot.count);  // 0 - snapshot is unchanged
 * snapshot.count = 2;           // Error - snapshot is frozen
 * ```
 */
export function frozenCopy<T>(obj: T): Frozen<T> {
  const copy = deepClone(obj);
  return freeze(copy);
}

// =============================================================================
// Deep Clone Implementation
// =============================================================================

/**
 * Create a deep clone of a value.
 * Handles all common JavaScript types.
 *
 * @param value - Value to clone
 * @param visited - WeakMap for cycle detection
 * @returns Deep clone of the value
 */
function deepClone<T>(value: T, visited = new WeakMap<object, unknown>()): T {
  // Primitives pass through
  if (value === null || value === undefined) {
    return value;
  }

  const type = typeof value;
  if (type !== "object" && type !== "function") {
    return value;
  }

  // Functions can't be cloned meaningfully
  if (type === "function") {
    return value;
  }

  const obj = value as object;

  // Check for cycles
  if (visited.has(obj)) {
    return visited.get(obj) as T;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const clone: unknown[] = [];
    visited.set(obj, clone);

    const len = obj.length;
    for (let i = 0; i < len; i++) {
      clone[i] = deepClone(obj[i], visited);
    }

    return clone as T;
  }

  // Handle Map
  if (obj instanceof Map) {
    const clone = new Map();
    visited.set(obj, clone);

    for (const [key, val] of obj) {
      clone.set(deepClone(key, visited), deepClone(val, visited));
    }

    return clone as T;
  }

  // Handle Set
  if (obj instanceof Set) {
    const clone = new Set();
    visited.set(obj, clone);

    for (const item of obj) {
      clone.add(deepClone(item, visited));
    }

    return clone as T;
  }

  // Fast path: Plain objects (most common case)
  const proto = Object.getPrototypeOf(obj);
  if (proto === Object.prototype || proto === null) {
    const clone = proto === null ? Object.create(null) : {} as Record<string, unknown>;
    visited.set(obj, clone);
    const keys = Object.keys(obj as Record<string, unknown>);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!;
      clone[key] = deepClone((obj as Record<string, unknown>)[key], visited);
    }
    // Also clone symbol-keyed properties
    const symbols = Object.getOwnPropertySymbols(obj);
    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i]!;
      (clone as Record<symbol, unknown>)[sym] = deepClone(
        (obj as Record<symbol, unknown>)[sym],
        visited,
      );
    }
    return clone as T;
  }

  // Slow path: Objects with custom prototypes
  const clone = Object.create(proto);
  visited.set(obj, clone);

  const propNames = Object.getOwnPropertyNames(obj);
  const propLen = propNames.length;

  for (let i = 0; i < propLen; i++) {
    const key = propNames[i]!;
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (descriptor) {
      if ("value" in descriptor) {
        // Mutate descriptor in-place (getOwnPropertyDescriptor returns a fresh object)
        descriptor.value = deepClone(descriptor.value, visited);
      }
      Object.defineProperty(clone, key, descriptor);
    }
  }

  // Handle symbol properties
  const symbols = Object.getOwnPropertySymbols(obj);
  const symLen = symbols.length;

  for (let i = 0; i < symLen; i++) {
    const sym = symbols[i]!;
    const descriptor = Object.getOwnPropertyDescriptor(obj, sym);

    if (descriptor) {
      if ("value" in descriptor) {
        descriptor.value = deepClone(descriptor.value, visited);
      }
      Object.defineProperty(clone, sym, descriptor);
    }
  }

  return clone as T;
}

// =============================================================================
// Batch Copy Operations
// =============================================================================

/**
 * Create frozen copies of multiple objects.
 *
 * @param objects - Objects to copy and freeze
 * @returns Array of frozen copies
 *
 * @example
 * ```ts
 * const [copyA, copyB] = frozenCopyAll(objA, objB);
 * ```
 */
export function frozenCopyAll<T extends unknown[]>(
  ...objects: T
): { [K in keyof T]: Frozen<T[K]> } {
  const result = new Array(objects.length);
  for (let i = 0; i < objects.length; i++) {
    result[i] = frozenCopy(objects[i]);
  }
  return result as { [K in keyof T]: Frozen<T[K]> };
}

/**
 * Create a frozen copy of a record's values.
 *
 * @param record - Record to copy
 * @returns New record with frozen copies of values
 */
export function frozenCopyRecord<K extends string | number | symbol, V>(
  record: Record<K, V>
): Record<K, Frozen<V>> {
  const result = {} as Record<K, Frozen<V>>;
  const keys = Object.keys(record) as K[];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    result[key] = frozenCopy(record[key]);
  }

  return result;
}

// =============================================================================
// Snapshot Utilities
// =============================================================================

/**
 * Create a frozen snapshot of an object at a point in time.
 * Alias for `frozenCopy` with more semantic naming for temporal use cases.
 *
 * @param obj - Object to snapshot
 * @returns Frozen snapshot
 *
 * @example
 * ```ts
 * const state = { version: 1, data: [] };
 *
 * const v1 = snapshot(state);
 * state.version = 2;
 * state.data.push("item");
 *
 * const v2 = snapshot(state);
 *
 * console.log(v1.version); // 1
 * console.log(v2.version); // 2
 * ```
 */
export const snapshot = frozenCopy;

/**
 * Create a series of frozen snapshots from an array of states.
 * Useful for creating an immutable history.
 *
 * @param states - Array of states to snapshot
 * @returns Array of frozen snapshots
 */
export function snapshotHistory<T>(states: T[]): Frozen<T>[] {
  const result: Frozen<T>[] = new Array(states.length);
  for (let i = 0; i < states.length; i++) {
    result[i] = frozenCopy(states[i]);
  }
  return result;
}
