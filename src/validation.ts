/**
 * Flash-Freeze Validation Utilities
 *
 * Functions for checking whether objects are frozen and asserting frozen state.
 * Use these to validate data at boundaries or in debug/test scenarios.
 *
 * @module
 */

import type { Frozen } from "./types.ts";

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a value is shallowly frozen.
 * Only checks the top level - nested objects may still be mutable.
 *
 * @param value - Value to check
 * @returns True if value is frozen at the top level
 *
 * @example
 * ```ts
 * const obj = Object.freeze({ nested: { mutable: true } });
 * isShallowFrozen(obj);        // true
 * isShallowFrozen(obj.nested); // false
 * ```
 */
export function isShallowFrozen(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true; // Primitives are inherently immutable
  }

  const type = typeof value;
  if (type !== "object" && type !== "function") {
    return true; // Primitives are inherently immutable
  }

  return Object.isFrozen(value);
}

/**
 * Check if a value is deeply frozen (all nested properties frozen).
 * This is the comprehensive check that validates the entire object graph.
 *
 * Handles:
 * - Circular references (won't infinite loop)
 * - Arrays, Maps, Sets
 * - Objects with custom prototypes
 *
 * @param value - Value to check
 * @returns True if value and ALL nested values are frozen
 *
 * @example
 * ```ts
 * import { freeze, isFrozen } from "flash-freeze";
 *
 * const obj = { nested: { deep: { value: 1 } } };
 * isFrozen(obj);        // false
 *
 * const frozen = freeze(obj);
 * isFrozen(frozen);     // true
 * ```
 */
export function isFrozen(value: unknown): value is Frozen<unknown> {
  return isFrozenImpl(value, new WeakSet());
}

/**
 * Alias for `isFrozen` - explicit name for those who prefer it.
 */
export const isDeeplyFrozen: (value: unknown) => value is Frozen<unknown> = isFrozen;

/**
 * Internal implementation with visited set for cycle detection.
 */
function isFrozenImpl(value: unknown, visited: WeakSet<object>): boolean {
  // Primitives and null/undefined are inherently immutable
  if (value === null || value === undefined) {
    return true;
  }

  const type = typeof value;
  if (type !== "object" && type !== "function") {
    return true;
  }

  const obj = value as object;

  // Already visited? Consider it frozen (handles cycles)
  if (visited.has(obj)) {
    return true;
  }

  // Top level must be frozen
  if (!Object.isFrozen(obj)) {
    return false;
  }

  visited.add(obj);

  // Check arrays
  if (Array.isArray(obj)) {
    const len = obj.length;
    for (let i = 0; i < len; i++) {
      if (!isFrozenImpl(obj[i], visited)) {
        return false;
      }
    }
    return true;
  }

  // Check Maps
  if (obj instanceof Map) {
    for (const [key, val] of obj) {
      if (!isFrozenImpl(key, visited) || !isFrozenImpl(val, visited)) {
        return false;
      }
    }
    return true;
  }

  // Check Sets
  if (obj instanceof Set) {
    for (const item of obj) {
      if (!isFrozenImpl(item, visited)) {
        return false;
      }
    }
    return true;
  }

  // Check plain objects and objects with custom prototypes
  const propNames = Object.getOwnPropertyNames(obj);
  for (let i = 0; i < propNames.length; i++) {
    const propName = propNames[i]!;
    try {
      const propValue = (obj as Record<string, unknown>)[propName];
      if (!isFrozenImpl(propValue, visited)) {
        return false;
      }
    } catch {
      // Some properties may throw on access (getters)
      // Skip them - if we can't read it, we can't check it
    }
  }

  return true;
}

// =============================================================================
// Assertions
// =============================================================================

/**
 * Error thrown when an assertion about frozen state fails.
 */
export class FrozenAssertionError extends Error {
  constructor(
    message: string,
    public readonly value: unknown,
    public readonly path?: string
  ) {
    super(message);
    this.name = "FrozenAssertionError";
  }
}

/**
 * Assert that a value is deeply frozen.
 * Throws if not frozen.
 *
 * Use this at boundaries where you expect frozen data:
 * - Function entry points
 * - API responses
 * - Cache retrievals
 *
 * @param value - Value to check
 * @param name - Optional name for error messages
 * @throws FrozenAssertionError if value is not deeply frozen
 *
 * @example
 * ```ts
 * function processConfig(config: Frozen<Config>) {
 *   assertFrozen(config, "config");
 *   // Safe to use - we know it's frozen
 * }
 * ```
 */
export function assertFrozen(
  value: unknown,
  name: string = "value"
): asserts value is Frozen<unknown> {
  if (!isFrozen(value)) {
    throw new FrozenAssertionError(
      `Expected ${name} to be deeply frozen, but it is not. ` +
        `Use freeze() or frozenCopy() to create immutable data.`,
      value
    );
  }
}

/**
 * Assert that a value is shallowly frozen.
 * Less strict than assertFrozen - only checks top level.
 *
 * @param value - Value to check
 * @param name - Optional name for error messages
 * @throws FrozenAssertionError if value is not frozen at top level
 */
export function assertShallowFrozen(
  value: unknown,
  name: string = "value"
): void {
  if (!isShallowFrozen(value)) {
    throw new FrozenAssertionError(
      `Expected ${name} to be frozen at the top level, but it is not.`,
      value
    );
  }
}

/**
 * Assert that a value is NOT frozen.
 * Useful for ensuring you have mutable data before modifications.
 *
 * @param value - Value to check
 * @param name - Optional name for error messages
 * @throws FrozenAssertionError if value is frozen
 *
 * @example
 * ```ts
 * function mutate(obj: SomeType) {
 *   assertMutable(obj, "obj");
 *   obj.value = newValue; // Safe - we verified it's mutable
 * }
 * ```
 */
export function assertMutable(
  value: unknown,
  name: string = "value"
): void {
  if (value !== null && typeof value === "object" && Object.isFrozen(value)) {
    throw new FrozenAssertionError(
      `Expected ${name} to be mutable, but it is frozen. ` +
        `Create a mutable copy if you need to modify it.`,
      value
    );
  }
}

// =============================================================================
// Debug Utilities
// =============================================================================

/**
 * Find the first unfrozen path in an object.
 * Useful for debugging why isFrozen() returns false.
 *
 * @param value - Value to inspect
 * @returns Path to first unfrozen value, or null if fully frozen
 *
 * @example
 * ```ts
 * const obj = {
 *   a: Object.freeze({ x: 1 }),
 *   b: { y: 2 } // not frozen
 * };
 * Object.freeze(obj);
 *
 * findUnfrozenPath(obj); // "b" - the nested object isn't frozen
 * ```
 */
export function findUnfrozenPath(value: unknown): string | null {
  return findUnfrozenPathImpl(value, "", new WeakSet());
}

function findUnfrozenPathImpl(
  value: unknown,
  path: string,
  visited: WeakSet<object>
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const type = typeof value;
  if (type !== "object" && type !== "function") {
    return null;
  }

  const obj = value as object;

  if (visited.has(obj)) {
    return null;
  }

  if (!Object.isFrozen(obj)) {
    return path || "(root)";
  }

  visited.add(obj);

  // Check arrays
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = findUnfrozenPathImpl(
        obj[i],
        path ? `${path}[${i}]` : `[${i}]`,
        visited
      );
      if (result !== null) return result;
    }
    return null;
  }

  // Check Maps
  if (obj instanceof Map) {
    let index = 0;
    for (const [key, val] of obj) {
      const keyResult = findUnfrozenPathImpl(
        key,
        path ? `${path}.keys()[${index}]` : `keys()[${index}]`,
        visited
      );
      if (keyResult !== null) return keyResult;

      const valResult = findUnfrozenPathImpl(
        val,
        path ? `${path}.get(${String(key)})` : `get(${String(key)})`,
        visited
      );
      if (valResult !== null) return valResult;

      index++;
    }
    return null;
  }

  // Check Sets
  if (obj instanceof Set) {
    let index = 0;
    for (const item of obj) {
      const result = findUnfrozenPathImpl(
        item,
        path ? `${path}.values()[${index}]` : `values()[${index}]`,
        visited
      );
      if (result !== null) return result;
      index++;
    }
    return null;
  }

  // Check object properties
  const propNames = Object.getOwnPropertyNames(obj);
  for (const propName of propNames) {
    try {
      const propValue = (obj as Record<string, unknown>)[propName];
      const result = findUnfrozenPathImpl(
        propValue,
        path ? `${path}.${propName}` : propName,
        visited
      );
      if (result !== null) return result;
    } catch {
      // Skip inaccessible properties
    }
  }

  return null;
}

/**
 * Count how many objects in a structure are frozen vs unfrozen.
 * Useful for understanding the freeze coverage of complex data.
 *
 * @param value - Value to analyze
 * @returns Object with frozen and unfrozen counts
 *
 * @example
 * ```ts
 * const stats = countFrozenObjects(myData);
 * console.log(`${stats.frozen}/${stats.total} objects frozen`);
 * ```
 */
export function countFrozenObjects(value: unknown): {
  frozen: number;
  unfrozen: number;
  total: number;
} {
  const visited = new WeakSet<object>();
  let frozen = 0;
  let unfrozen = 0;

  function count(val: unknown): void {
    if (val === null || val === undefined) return;

    const type = typeof val;
    if (type !== "object" && type !== "function") return;

    const obj = val as object;

    if (visited.has(obj)) return;
    visited.add(obj);

    if (Object.isFrozen(obj)) {
      frozen++;
    } else {
      unfrozen++;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) count(item);
    } else if (obj instanceof Map) {
      for (const [k, v] of obj) {
        count(k);
        count(v);
      }
    } else if (obj instanceof Set) {
      for (const item of obj) count(item);
    } else {
      for (const key of Object.keys(obj)) {
        try {
          count((obj as Record<string, unknown>)[key]);
        } catch {
          // Skip inaccessible
        }
      }
    }
  }

  count(value);

  return { frozen, unfrozen, total: frozen + unfrozen };
}
