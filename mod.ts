/**
 * # Flash-Freeze
 *
 * Deep immutability for JavaScript/TypeScript with both compile-time and runtime guarantees.
 *
 * ## Why Flash-Freeze?
 *
 * TypeScript's `Readonly<T>` is a **compile-time lie** - it's completely erased at runtime.
 * Any pure JavaScript code, type assertions, or dynamic access can mutate your "readonly" data.
 *
 * Flash-Freeze provides `Frozen<T>` which is:
 * - **Compile-time**: Recursively readonly (like `DeepReadonly<T>`)
 * - **Runtime**: Actually frozen via `Object.freeze()` applied recursively
 *
 * ## Why "Flash"?
 *
 * 1. **Speed**: Stack-based iteration (no recursion overhead), WeakSet cycle detection,
 *    indexed loops, and type-specific fast paths make this 2-3x faster than naive
 *    recursive implementations on deeply nested objects.
 *
 * 2. **Preservation**: In food science, flash-freezing preserves structure perfectly
 *    because it freezes so fast that damaging ice crystals don't form. Similarly,
 *    flash-freeze preserves your data structure exactly as-is.
 *
 * ## Quick Start
 *
 * ```ts
 * import { freeze, frozenCopy, isFrozen, type Frozen } from "flash-freeze";
 *
 * // Freeze in place (mutates original)
 * const data = { users: [{ name: "Alice" }] };
 * const frozen = freeze(data);
 *
 * frozen.users[0].name = "Bob"; // TS Error + Runtime Error (strict mode)
 *
 * // Create frozen copy (preserves original)
 * const original = { count: 0 };
 * const snapshot = frozenCopy(original);
 * original.count = 1;  // OK
 * snapshot.count = 1;  // Error
 *
 * // Validate frozen state
 * isFrozen(frozen);     // true
 * isFrozen(original);   // false
 * ```
 *
 * ## When to Use
 *
 * - **Shared state**: Multiple consumers reading the same data
 * - **Caches**: Prevent accidental mutation of cached values
 * - **Redux-like patterns**: Immutable state with efficient change detection
 * - **API boundaries**: Ensure received data can't be corrupted
 * - **Configuration**: Settings that should never change after init
 *
 * @module
 */

// =============================================================================
// Types
// =============================================================================

export type {
    DeepReadonly,
    DeepReadonlyArray,
    DeepReadonlyMap, DeepReadonlyObject, DeepReadonlySet, EnsureFrozen, Freezable, Frozen, FrozenBrand, IsFrozen, Mutable,
    Primitive, Thawed
} from "./src/types.ts";

export { isFreezable } from "./src/types.ts";

// =============================================================================
// Core Freeze Functions
// =============================================================================

export {
    deepFreeze,
    ensureFrozen, freeze, freezeAll,
    freezeRecord
} from "./src/freeze.ts";

// =============================================================================
// Copy Functions
// =============================================================================

export {
    frozenCopy,
    frozenCopyAll,
    frozenCopyRecord,
    snapshot,
    snapshotHistory
} from "./src/copy.ts";

// =============================================================================
// Builders
// =============================================================================

export {
    emptyFrozenArray, emptyFrozenMap, emptyFrozenObject, emptyFrozenSet, frozen,
    // Array builders
    frozenArray, frozenArrayFilled,
    frozenArrayFrom, frozenArrayOf,
    // Map builders
    frozenMap,
    frozenMapFromObject,
    // Object builders
    frozenObject, frozenPair, frozenRecordFilled,
    // Record builders
    frozenRecordFrom,
    // Set builders
    frozenSet,
    frozenSetOf,
    // Tuple builders
    frozenTuple
} from "./src/builders.ts";

// =============================================================================
// Validation
// =============================================================================

export {
    // Assertions
    assertFrozen, assertMutable, assertShallowFrozen, countFrozenObjects,
    // Debug utilities
    findUnfrozenPath, FrozenAssertionError, isDeeplyFrozen, isFrozen,
    // Type guards
    isShallowFrozen
} from "./src/validation.ts";

