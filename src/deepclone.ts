/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { types as utilTypes } from 'util';

type any_object_t = Record<string | symbol, any>;
type warn_callback_t = (path: string, value: any, reason: string) => void;

const getType = (value: any): string =>
  Object.prototype.toString.call(value).slice(8, -1);

function deepClone<T = any>(
  input: T,
  options: {
    on_unclonable?: 'nullify' | 'use_original';
    clone_functions_from_strings__insecure_eval?: boolean;
    warn_on_uncloneable?: warn_callback_t;
    _path?: string;
    _seen?: WeakMap<any, any>;
  } = {}
): T {
  // default behavior is nullify unclonables
  if (!options?.on_unclonable) options.on_unclonable = 'nullify';

  const {
    warn_on_uncloneable,
    _path = 'root',
    _seen = new WeakMap()
  } = options;

  if (Object(input) !== input) return input;

  if (_seen.has(input)) return _seen.get(input);

  const type = getType(input);
  let output: any;

  const setSeen = (val: any) => {
    _seen.set(input, val);
    return val;
  };

  switch (type) {
    case 'Date':
      return setSeen(new Date((input as Date).getTime()));
    case 'RegExp':
      {
        const { source, flags } = input as RegExp;
        return setSeen(new RegExp(source, flags));
      }
      break;
    case 'Buffer':
      return setSeen(Buffer.from(input as Buffer));
    case 'URL':
      return setSeen(new URL((input as URL).toString()));
    case 'BigInt':
      return input;
    case 'ArrayBuffer':
      return setSeen((input as ArrayBuffer).slice(0));
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'BigInt64Array':
    case 'BigUint64Array':
      return setSeen(new (Object.getPrototypeOf(input).constructor)(input));
    case 'Set':
      output = setSeen(new Set());
      for (const val of input as Set<any>) {
        output.add(
          deepClone(val, { ...options, _path: `${_path}.set`, _seen })
        );
      }
      return output;
    case 'Map':
      output = setSeen(new Map());
      for (const [k, v] of input as Map<any, any>) {
        output.set(
          deepClone(k, { ...options, _path: `${_path}.mapKey`, _seen }),
          deepClone(v, { ...options, _path: `${_path}.mapVal`, _seen })
        );
      }
      return output;
    case 'Array':
      {
        output = setSeen([]);
        const arr = input as any[];
        for (let i = 0; i < arr.length; i++) {
          output[i] = deepClone(arr[i], {
            ...options,
            _path: `${_path}[${i}]`,
            _seen
          });
        }
        return output;
      }
      break;

    case 'Function':
      if (options.clone_functions_from_strings__insecure_eval) {
        return setSeen(cloneFunctionFromStringUnsafeEval(input as Function));
      } else {
        try {
          const originalFn = input as Function;
          const cloneFn = function (this: any, ...args: any[]) {
            return originalFn.apply(this, args);
          };
          Object.defineProperty(cloneFn, 'name', {
            value: originalFn.name,
            configurable: true
          });
          return setSeen(cloneFn);
        } catch (e) {
          warn_on_uncloneable?.(_path, input, 'failed_to_clone_function');

          if (options?.on_unclonable === 'nullify') return null as unknown as T;
          else return input;
        }
      }
    case 'Error':
      {
        const err = input as Error;
        const cloned = new (err.constructor as any)(err.message);
        Object.assign(cloned, err);
        return setSeen(cloned);
      }
      break;

    case 'Object':
      if (
        utilTypes.isPromise(input) ||
        utilTypes.isProxy(input) ||
        utilTypes.isGeneratorFunction(input) ||
        utilTypes.isGeneratorObject(input) ||
        utilTypes.isModuleNamespaceObject(input)
      ) {
        warn_on_uncloneable?.(_path, input, 'uncloneable_object_type');
        if (options?.on_unclonable === 'nullify') return null as unknown as T;
        else return input;
      }

      try {
        const proto = Object.getPrototypeOf(input);
        output = setSeen(Object.create(proto));
        for (const key of Reflect.ownKeys(input as object)) {
          output[key] = deepClone((input as any_object_t)[key], {
            ...options,
            _path: `${_path}.${String(key)}`,
            _seen
          });
        }
        return output;
      } catch (e) {
        warn_on_uncloneable?.(_path, input, 'failed_during_object_clone');
        return input;
      }
    default:
      warn_on_uncloneable?.(
        _path,
        input,
        `unhandled_type__${type.toLowerCase()}`
      );
      if (options?.on_unclonable === 'nullify') return null as unknown as T;
      else return input;
  }
}

function cloneFunctionFromStringUnsafeEval(fn: Function): Function {
  const fnString = fn.toString();

  try {
    const clonedFn = eval(`(${fnString})`);
    Object.defineProperty(clonedFn, 'name', {
      value: fn.name,
      configurable: true
    });

    // Optionally copy any own properties (e.g., static props or metadata)
    for (const key of Reflect.ownKeys(fn)) {
      // skip prototype for safety
      if (key === 'prototype') continue;

      const desc = Object.getOwnPropertyDescriptor(fn, key);
      if (desc) Object.defineProperty(clonedFn, key, desc);
    }

    return clonedFn;
  } catch (e) {
    console.warn(`[cloneFunction] Failed to clone function "${fn.name}": ${e}`);
    return fn;
  }
}

export { deepClone, warn_callback_t };
