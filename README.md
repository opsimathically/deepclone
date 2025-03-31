# deepclone

When using [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone) I was made aware that it doesn't copy/clone functions. This package is
intended to work similarly to structuredClone, but will also work on functions etc. Cloning functions
can be done in two ways, the first being using a wrapper that utilizes originalFn.apply, and the second
is by stringifying and eval()'ing the function as a string. The first will preserve scope, closures, etc,
the latter will not. It should be known that the second is also possibly insecure, considering that
it requires the use of eval. For that reason, it's provided as an option (clone_functions_from_strings\_\_insecure_eval)
but is not used by default. Also, some things simply can't be cloned reliably, such as sockets etc. This
package will do its best to clone as much as is possible, and will gracefully fail, executing a callback
rather than asserting/erroring. This is so that you can attempt to clone things deeply with best-effort
result generation. When working with unknown, unusual data, this is in my opinion, preferred.

## Install

```bash
npm install @opsimathically/deepclone
```

## Building from source

This package is intended to be run via npm, but if you'd like to build from source,
clone this repo, enter directory, and run `npm install` for dev dependencies, then run
`npm run build`.

## Usage

[See API Reference for documentation](https://github.com/opsimathically/deepclone/blob/main/docs/)

[See unit tests for more direct usage examples](https://github.com/opsimathically/deepclone/blob/main/test/deepclone.test.ts)

```typescript
import { deepClone, warn_callback_t } from '@opsimathically/deepclone';
import { deepEqual } from 'fast-equals';

(async function () {
  const clone_from_obj = {
    hello: {
      hi: 'hi',
      something: [1, 2, 3, 'somedata']
    },
    something_else: {
      a_map: new Map<any, any>([
        [1, 2],
        ['hi', 'there']
      ]),
      a_set: new Set<any>([1, 2, 3, 4])
    }
  };
  let cloned: any = deepClone(clone_from_obj);
  assert(deepEqual(clone_from_obj, cloned));

  const clone_from_str_insecure_eval = {
    some_func: (moo: any) => {
      return 'abcd1234';
    }
  };

  cloned = deepClone(clone_from_str_insecure_eval, {
    clone_functions_from_strings__insecure_eval: true
  });

  assert(
    clone_from_str_insecure_eval.some_func.toString() ===
      cloned.some_func.toString()
  );

  const clone_from_obj_with_unclonable = {
    hello: {
      a_promise: new Promise(function (resolve, reject) {})
    }
  };

  let fail_reason: string = '';
  cloned = deepClone(clone_from_obj_with_unclonable, {
    on_unclonable: 'nullify',
    warn_on_uncloneable: (path: string, value: any, reason: string) => {
      fail_reason = reason;
    }
  });

  assert(fail_reason === 'unhandled_type__promise');
  assert(cloned.hello.a_promise === null);

  // clone again, but use the original promise instead of nullifying
  // the value.
  cloned = deepClone(clone_from_obj_with_unclonable, {
    on_unclonable: 'use_original'
  });
  assert(typeof cloned.hello.a_promise === 'object');
  // Note: deepEqual will not work with cloned objects with functions, see the readme information
  //       at the top of this file as to why.
})();
```
