[**@opsimathically/deepclone**](../README.md)

***

[@opsimathically/deepclone](../README.md) / deepClone

# Function: deepClone()

> **deepClone**\<`T`\>(`input`, `options`): `T`

Defined in: [deepclone.ts:12](https://github.com/opsimathically/deepclone/blob/767df64c843fb808b5322ad8016f17ceae58cf21/src/deepclone.ts#L12)

## Type Parameters

### T

`T` = `any`

## Parameters

### input

`T`

### options

#### _path?

`string`

#### _seen?

`WeakMap`\<`any`, `any`\>

#### clone_functions_from_strings__insecure_eval?

`boolean`

#### on_unclonable?

`"nullify"` \| `"use_original"`

#### warn_on_uncloneable?

[`warn_callback_t`](../type-aliases/warn_callback_t.md)

## Returns

`T`
