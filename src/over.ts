/**
 * Applying an operation across a tuple or a record.
 *
 * `freezeAll` and `frozenCopyAll` differ in one call, and so do `freezeRecord`
 * and `frozenCopyRecord`. Both pairs were written out in full, so the loop, the
 * key handling and the cast existed twice each and could drift apart while
 * still looking right.
 *
 * @module
 */

import type { Frozen } from "./types.ts";

/**
 * Apply an operation to every element, keeping the tuple's shape.
 */
export function overAll<T extends unknown[]>(
  objects: T,
  each: (value: unknown) => unknown,
): { [K in keyof T]: Frozen<T[K]> } {
  const result = new Array(objects.length);
  for (let i = 0; i < objects.length; i++) {
    result[i] = each(objects[i]);
  }
  return result as { [K in keyof T]: Frozen<T[K]> };
}

/**
 * Apply an operation to every value, keeping the keys.
 */
export function overRecord<K extends string | number | symbol, V>(
  record: Record<K, V>,
  each: (value: V) => Frozen<V>,
): Record<K, Frozen<V>> {
  const result = {} as Record<K, Frozen<V>>;
  const keys = Object.keys(record) as K[];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    result[key] = each(record[key]);
  }
  return result;
}
