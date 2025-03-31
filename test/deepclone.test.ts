/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'node:test';
import assert from 'node:assert';

import { deepEqual } from 'fast-equals';
import { deepClone } from '@src/deepclone';

(async function () {
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Tests %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  test('Ensure primitives are cloned ok.', async function () {
    let cloned: any = deepClone(42);
    assert(cloned === 42);

    cloned = deepClone(null);
    assert(cloned === null);

    cloned = deepClone(100000000000000000000000000n);
    assert(cloned === 100000000000000000000000000n);

    cloned = deepClone(undefined);
    assert(cloned === undefined);

    cloned = deepClone(true);
    assert(cloned === true);

    cloned = deepClone(false);
    assert(cloned === false);
  });

  test('Ensure basic objects are cloned ok.', async function () {
    const clone_from_obj = {
      hello: {
        hi: 'hi',
        something: [1, 2, 3, 'somedata']
      }
    };

    const cloned: any = deepClone(clone_from_obj);
    assert(deepEqual(cloned, clone_from_obj));
  });

  test('Ensure object functions are cloned ok.', async function () {
    const clone_from_obj = {
      hello: {
        hi: 'hi',
        something: [1, 2, 3, 'somedata']
      },
      something_else: {
        a_function: (moo: any) => {
          return 'abcd1234';
        }
      }
    };

    let cloned: any = deepClone(clone_from_obj, {
      clone_functions_from_strings__insecure_eval: true
    });

    assert(
      cloned.something_else.a_function.toString() ===
        clone_from_obj.something_else.a_function.toString()
    );

    let function_ret_val: any = cloned.something_else.a_function('abcd');
    assert(function_ret_val === 'abcd1234');

    cloned = deepClone(clone_from_obj);
    function_ret_val = cloned.something_else.a_function('abcd');
    assert(function_ret_val === 'abcd1234');
  });

  test('Test graceful unclonable callback/unclonable behaviors.', async function () {
    const clone_from_obj_with_unclonable = {
      hello: {
        a_promise: new Promise(function (resolve, reject) {})
      }
    };

    let fail_reason: string = '';
    let cloned: any = deepClone(clone_from_obj_with_unclonable, {
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
  });

  test('Ensure maps are cloned ok.', async function () {
    const clone_from_obj = {
      hello: {
        hi: 'hi',
        something: [1, 2, 3, 'somedata']
      },
      something_else: {
        a_map: new Map<any, any>([
          [1, 2],
          ['hi', 'there']
        ])
      }
    };
    const cloned: any = deepClone(clone_from_obj);
    assert(deepEqual(clone_from_obj, cloned));
  });

  test('Ensure sets are cloned ok.', async function () {
    const clone_from_obj = {
      hello: {
        hi: 'hi',
        something: [1, 2, 3, 'somedata']
      },
      something_else: {
        a_set: new Set<any>([1, 2, 3, 4])
      }
    };
    const cloned: any = deepClone(clone_from_obj);
    assert(deepEqual(clone_from_obj, cloned));
  });

  test('Ensure readme code works.', async function () {
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
  });
})();
