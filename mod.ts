/**
 * Deep immutability with compile-time and runtime guarantees.
 *
 * `Frozen<T>` = `DeepReadonly<T>` + recursive `Object.freeze()`.
 * Stack-based iteration, WeakSet cycle detection, no recursion.
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
