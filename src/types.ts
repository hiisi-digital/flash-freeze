/**
 * Type definitions for compile-time and runtime immutability.
 *
 * @module
 */

// =============================================================================
// Brand Symbol
// =============================================================================

/**
 * Unique symbol used to brand frozen objects at the type level.
 * This symbol is never actually added to objects - it's purely for TypeScript.
 */
declare const FROZEN_BRAND: unique symbol;

/**
 * Brand type that marks an object as frozen.
 * Objects with this brand have been verified frozen at runtime.
 */
export type FrozenBrand = { readonly [FROZEN_BRAND]: true };

// =============================================================================
// Deep Readonly Types
// =============================================================================

/**
 * Primitive types that don't need freezing.
 */
export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null;

/**
 * Deep readonly for arrays.
 */
export type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;

/**
 * Deep readonly for Maps.
 */
export type DeepReadonlyMap<K, V> = ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>;

/**
 * Deep readonly for Sets.
 */
export type DeepReadonlySet<T> = ReadonlySet<DeepReadonly<T>>;

/**
 * Deep readonly for plain objects.
 */
export type DeepReadonlyObject<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

/**
 * Recursively makes all properties readonly.
 * Unlike TypeScript's built-in `Readonly<T>`, this goes deep.
 */
export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
    ? DeepReadonlyArray<U>
    : T extends Map<infer K, infer V>
      ? DeepReadonlyMap<K, V>
      : T extends Set<infer U>
        ? DeepReadonlySet<U>
        : T extends Function
          ? T
          : T extends Date
            ? Readonly<Date>
            : T extends RegExp
              ? Readonly<RegExp>
              : DeepReadonlyObject<T>;

// =============================================================================
// Frozen<T> - The Main Type
// =============================================================================

/**
 * A deeply frozen object with both compile-time (DeepReadonly) and
 * runtime (Object.freeze) guarantees.
 */
export type Frozen<T> = DeepReadonly<T> & FrozenBrand;

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Extract the underlying type from a Frozen wrapper.
 *
 * ```ts
 * type User = { name: string };
 * type FrozenUser = Frozen<User>;
 * type Original = Thawed<FrozenUser>; // { name: string }
 * ```
 */
export type Thawed<T> = T extends Frozen<infer U> ? U : T;

/**
 * Check if a type is already frozen.
 */
export type IsFrozen<T> = T extends FrozenBrand ? true : false;

/**
 * Make a type frozen only if it isn't already.
 * Prevents double-wrapping.
 */
export type EnsureFrozen<T> = T extends FrozenBrand ? T : Frozen<T>;

// =============================================================================
// Freezable Interface
// =============================================================================

/**
 * Interface for types with custom freeze logic.
 */
export interface Freezable<T = unknown> {
  /**
   * Freeze this object and return the frozen version.
   * May perform cleanup or validation before freezing.
   */
  freeze(): Frozen<T>;
}

/**
 * Type guard to check if a value implements Freezable.
 */
export function isFreezable<T>(value: unknown): value is Freezable<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "freeze" in value &&
    typeof (value as Freezable<T>).freeze === "function"
  );
}

// =============================================================================
// Mutable<T> - Escape Hatch
// =============================================================================

/**
 * Remove frozen brand and readonly modifiers.
 * Type-level escape hatch — the data is still frozen at runtime.
 */
export type Mutable<T> = T extends FrozenBrand
  ? MutableDeep<Thawed<T>>
  : MutableDeep<T>;

/**
 * Recursively removes readonly modifiers.
 */
type MutableDeep<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<infer U>
    ? Array<MutableDeep<U>>
    : T extends ReadonlyMap<infer K, infer V>
      ? Map<MutableDeep<K>, MutableDeep<V>>
      : T extends ReadonlySet<infer U>
        ? Set<MutableDeep<U>>
        : T extends object
          ? { -readonly [K in keyof T]: MutableDeep<T[K]> }
          : T;
