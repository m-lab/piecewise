const StaticArrayBufferProto = new ArrayBuffer().__proto__;
const StaticUint8ArrayProto = new Uint8Array().__proto__;
const StaticBufferProto = Buffer.from([]).__proto__;

export function isString(s) {
  return typeof s === 'string' || s instanceof String;
}

function getString(thing) {
  if (thing === Object(thing)) {
    if (thing.__proto__ === StaticUint8ArrayProto)
      return String.fromCharCode.apply(null, thing);
    if (thing.__proto__ === StaticArrayBufferProto)
      return getString(new Uint8Array(thing));
    if (thing.__proto__ === StaticBufferProto) return thing.toString('binary');
  }
  return thing;
}

function isStringable(thing) {
  return (
    typeof thing === 'string' ||
    typeof thing === 'number' ||
    typeof thing === 'boolean' ||
    (thing === Object(thing) &&
      (thing.__proto__ === StaticArrayBufferProto ||
        thing.__proto__ === StaticUint8ArrayProto ||
        thing.__proto__ === StaticBufferProto))
  );
}

function ensureStringed(thing) {
  if (isStringable(thing)) return getString(thing);
  else if (thing instanceof Array) {
    const res = [];
    for (let i = 0; i < thing.length; i += 1) res[i] = ensureStringed(thing[i]);
    return res;
  } else if (thing === Object(thing)) {
    const res = {};
    for (const key in thing) res[key] = ensureStringed(thing[key]);
    return res;
  } else if (thing === null) {
    return null;
  }
  throw new Error(`unsure of how to jsonify object of type ${typeof thing}`);
}

export function jsonThing(thing) {
  return JSON.stringify(ensureStringed(thing));
}

export function fetchWithTimeout(uri, options = {}, time = 5000) {
  const controller = new AbortController();
  const config = { ...options, signal: controller.signal };
  setTimeout(() => {
    controller.abort();
  }, time);
  return fetch(uri, config)
    .then(response => {
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response;
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Response timed out');
      }
      throw new Error(error.message);
    });
}
