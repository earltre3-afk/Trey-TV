import { m as mapObject } from "./map-obj.mjs";
import { c as camelCase } from "./camelcase.mjs";
import { Q as QuickLRU } from "./quick-lru.mjs";
const has = (array, key) => array.some((element) => {
  if (typeof element === "string") {
    return element === key;
  }
  element.lastIndex = 0;
  return element.test(key);
});
const cache = new QuickLRU({ maxSize: 1e5 });
const isObject = (value) => typeof value === "object" && value !== null && !(value instanceof RegExp) && !(value instanceof Error) && !(value instanceof Date);
const transform = (input, options = {}) => {
  if (!isObject(input)) {
    return input;
  }
  const {
    exclude,
    pascalCase = false,
    stopPaths,
    deep = false,
    preserveConsecutiveUppercase = false
  } = options;
  const stopPathsSet = new Set(stopPaths);
  const makeMapper = (parentPath) => (key, value) => {
    if (deep && isObject(value)) {
      const path = parentPath === void 0 ? key : `${parentPath}.${key}`;
      if (!stopPathsSet.has(path)) {
        value = mapObject(value, makeMapper(path));
      }
    }
    if (!(exclude && has(exclude, key))) {
      const cacheKey = pascalCase ? `${key}_` : key;
      if (cache.has(cacheKey)) {
        key = cache.get(cacheKey);
      } else {
        const returnValue = camelCase(key, { pascalCase, locale: false, preserveConsecutiveUppercase });
        if (key.length < 100) {
          cache.set(cacheKey, returnValue);
        }
        key = returnValue;
      }
    }
    return [key, value];
  };
  return mapObject(input, makeMapper(void 0));
};
function camelcaseKeys(input, options) {
  if (Array.isArray(input)) {
    return Object.keys(input).map((key) => transform(input[key], options));
  }
  return transform(input, options);
}
export {
  camelcaseKeys as default
};
