# `flash-freeze`

<div align="center" style="text-align: center;">

[![JSR](https://jsr.io/badges/@hiisi/flash-freeze)](https://jsr.io/@hiisi/flash-freeze)
[![GitHub Issues](https://img.shields.io/github/issues/hiisi-digital/flash-freeze.svg)](https://github.com/hiisi-digital/flash-freeze/issues)
![License](https://img.shields.io/github/license/hiisi-digital/flash-freeze?color=%23009689)

> Deep immutability with compile-time and runtime guarantees.

</div>

## What it does

`flash-freeze` recursively applies `Object.freeze()` and wraps the result in a `Frozen<T>` type
that is `DeepReadonly<T>` with a runtime brand. TypeScript's `Readonly<T>` is erased at runtime;
this is not.

```ts
import { freeze, frozenCopy, isFrozen } from "@hiisi/flash-freeze";

const data = freeze({ users: [{ name: "Alice" }] });
data.users[0].name = "Bob"; // TS error + runtime error

const snapshot = frozenCopy(mutableState); // clone then freeze
isFrozen(snapshot); // true
```

Stack-based iteration (no recursion), WeakSet cycle detection, indexed loops,
early termination on already-frozen objects.

## Installation

```bash
deno add jsr:@hiisi/flash-freeze
```

```ts
import { freeze, frozenCopy, isFrozen, type Frozen } from "@hiisi/flash-freeze";
```

## API

### Core

- `freeze(obj)` -- deep freeze in place, returns `Frozen<T>`
- `frozenCopy(obj)` -- clone then freeze (original untouched)
- `ensureFrozen(obj)` -- no-op if already frozen
- `freezeAll(...objs)` -- freeze multiple objects
- `freezeRecord(record)` -- freeze all values in a record

### Builders

- `frozenArray(items)`, `frozenArrayOf(...items)`, `frozenArrayFilled(n, val)`, `frozenArrayFrom(n, fn)`
- `frozenMap(entries)`, `frozenMapFromObject(obj)`
- `frozenSet(items)`, `frozenSetOf(...items)`
- `frozenObject(entries)`, `frozen(obj)`
- `frozenTuple(...items)`, `frozenPair(a, b)`
- `frozenRecordFrom(keys, fn)`, `frozenRecordFilled(keys, val)`
- `emptyFrozenArray()`, `emptyFrozenMap()`, `emptyFrozenSet()`, `emptyFrozenObject()`

### Validation

- `isFrozen(obj)` -- type guard for deep frozen
- `isShallowFrozen(obj)`, `isDeeplyFrozen(obj)`
- `assertFrozen(obj, name?)`, `assertShallowFrozen(obj, name?)`, `assertMutable(obj, name?)` -- throw `FrozenAssertionError`
- `findUnfrozenPath(obj)` -- returns path to first unfrozen property
- `countFrozenObjects(obj)` -- `{ frozen, unfrozen, total }`

### Types

- `Frozen<T>` -- `DeepReadonly<T>` + runtime brand
- `DeepReadonly<T>` -- compile-time only
- `Thawed<T>` -- extract `T` from `Frozen<T>`
- `Freezable<T>` -- interface for custom freeze logic
- `isFreezable(obj)` -- type guard for `Freezable`
- `Mutable<T>` -- escape hatch (removes readonly)

## Support

Whether you use this project, have learned something from it, or just like it,
please consider supporting it by buying me a coffee, so I can dedicate more time
on open-source projects like this :)

<a href="https://buymeacoffee.com/orgrinrt" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

## License

> You can check out the full license [here](https://github.com/hiisi-digital/flash-freeze/blob/main/LICENSE)

This project is licensed under the terms of the **Mozilla Public License 2.0**.

`SPDX-License-Identifier: MPL-2.0`
