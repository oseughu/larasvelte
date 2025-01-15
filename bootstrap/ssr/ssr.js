import { clsx as clsx$1 } from "clsx";
import { router, setupProgress } from "@inertiajs/core";
import escape from "html-escape";
import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";
import createServer from "@inertiajs/core/server";
const HYDRATION_START = "[";
const HYDRATION_END = "]";
const ELEMENT_IS_NAMESPACED = 1;
const ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;
const ATTR_REGEX = /[&"<]/g;
const CONTENT_REGEX = /[&<]/g;
function escape_html(value, is_attr) {
  const str = String(value ?? "");
  const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
  pattern.lastIndex = 0;
  let escaped = "";
  let last = 0;
  while (pattern.test(str)) {
    const i = pattern.lastIndex - 1;
    const ch = str[i];
    escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
    last = i + 1;
  }
  return escaped + str.substring(last);
}
const replacements = {
  translate: /* @__PURE__ */ new Map([
    [true, "yes"],
    [false, "no"]
  ])
};
function attr(name, value, is_boolean = false) {
  if (value == null || !value && is_boolean || value === "" && name === "class") return "";
  const normalized = name in replacements && replacements[name].get(value) || value;
  const assignment = is_boolean ? "" : `="${escape_html(normalized, true)}"`;
  return ` ${name}${assignment}`;
}
function clsx(value) {
  if (typeof value === "object") {
    return clsx$1(value);
  } else {
    return value ?? "";
  }
}
const noop = () => {
};
function fallback(value, fallback2, lazy = false) {
  return value === void 0 ? lazy ? (
    /** @type {() => V} */
    fallback2()
  ) : (
    /** @type {V} */
    fallback2
  ) : value;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function lifecycle_outside_component(name) {
  {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
  }
}
let active_reaction = null;
function untrack(fn) {
  const previous_reaction = active_reaction;
  try {
    active_reaction = null;
    return fn();
  } finally {
    active_reaction = previous_reaction;
  }
}
const VOID_ELEMENT_NAMES = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
function is_void(name) {
  return VOID_ELEMENT_NAMES.includes(name) || name.toLowerCase() === "!doctype";
}
const DOM_BOOLEAN_ATTRIBUTES = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "hidden",
  "indeterminate",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected",
  "webkitdirectory"
];
function is_boolean_attribute(name) {
  return DOM_BOOLEAN_ATTRIBUTES.includes(name);
}
const RAW_TEXT_ELEMENTS = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function is_raw_text_element(name) {
  return RAW_TEXT_ELEMENTS.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    name
  );
}
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop = null;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set2(fn(
      /** @type {T} */
      value
    ));
  }
  function subscribe2(run, invalidate = noop) {
    const subscriber = [run, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2, update) || noop;
    }
    run(
      /** @type {T} */
      value
    );
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update, subscribe: subscribe2 };
}
function subscribe_to_store(store, run, invalidate) {
  if (store == null) {
    run(void 0);
    return noop;
  }
  const unsub = untrack(
    () => store.subscribe(
      run,
      // @ts-expect-error
      invalidate
    )
  );
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
var current_component = null;
function getContext(key2) {
  const context_map = get_or_init_context_map();
  const result = (
    /** @type {T} */
    context_map.get(key2)
  );
  return result;
}
function setContext(key2, context) {
  get_or_init_context_map().set(key2, context);
  return context;
}
function get_or_init_context_map(name) {
  if (current_component === null) {
    lifecycle_outside_component();
  }
  return current_component.c ?? (current_component.c = new Map(get_parent_context(current_component) || void 0));
}
function push(fn) {
  current_component = { p: current_component, c: null, d: null };
}
function pop() {
  var component = (
    /** @type {Component} */
    current_component
  );
  var ondestroy = component.d;
  if (ondestroy) {
    on_destroy.push(...ondestroy);
  }
  current_component = component.p;
}
function get_parent_context(component_context) {
  let parent = component_context.p;
  while (parent !== null) {
    const context_map = parent.c;
    if (context_map !== null) {
      return context_map;
    }
    parent = parent.p;
  }
  return null;
}
const BLOCK_OPEN = `<!--${HYDRATION_START}-->`;
const BLOCK_CLOSE = `<!--${HYDRATION_END}-->`;
const EMPTY_COMMENT = `<!---->`;
const INVALID_ATTR_NAME_CHAR_REGEX = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function copy_payload({ out, css, head: head2 }) {
  return {
    out,
    css: new Set(css),
    head: {
      title: head2.title,
      out: head2.out
    }
  };
}
function assign_payload(p1, p2) {
  p1.out = p2.out;
  p1.head = p2.head;
}
function element(payload, tag, attributes_fn = noop, children_fn = noop) {
  payload.out += "<!---->";
  if (tag) {
    payload.out += `<${tag}`;
    attributes_fn();
    payload.out += `>`;
    if (!is_void(tag)) {
      children_fn();
      if (!is_raw_text_element(tag)) {
        payload.out += EMPTY_COMMENT;
      }
      payload.out += `</${tag}>`;
    }
  }
  payload.out += "<!---->";
}
let on_destroy = [];
function render(component, options = {}) {
  const payload = { out: "", css: /* @__PURE__ */ new Set(), head: { title: "", out: "" } };
  const prev_on_destroy = on_destroy;
  on_destroy = [];
  payload.out += BLOCK_OPEN;
  if (options.context) {
    push();
    current_component.c = options.context;
  }
  component(payload, options.props ?? {}, {}, {});
  if (options.context) {
    pop();
  }
  payload.out += BLOCK_CLOSE;
  for (const cleanup of on_destroy) cleanup();
  on_destroy = prev_on_destroy;
  let head2 = payload.head.out + payload.head.title;
  for (const { hash, code } of payload.css) {
    head2 += `<style id="${hash}">${code}</style>`;
  }
  return {
    head: head2,
    html: payload.out,
    body: payload.out
  };
}
function head(payload, fn) {
  const head_payload = payload.head;
  head_payload.out += BLOCK_OPEN;
  fn(head_payload);
  head_payload.out += BLOCK_CLOSE;
}
function spread_attributes(attrs, classes2, styles, flags = 0) {
  if (attrs.class) {
    attrs.class = clsx(attrs.class);
  }
  let attr_str = "";
  let name;
  const is_html = (flags & ELEMENT_IS_NAMESPACED) === 0;
  const lowercase = (flags & ELEMENT_PRESERVE_ATTRIBUTE_CASE) === 0;
  for (name in attrs) {
    if (typeof attrs[name] === "function") continue;
    if (name[0] === "$" && name[1] === "$") continue;
    if (INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;
    var value = attrs[name];
    if (lowercase) {
      name = name.toLowerCase();
    }
    attr_str += attr(name, value, is_html && is_boolean_attribute(name));
  }
  return attr_str;
}
function spread_props(props) {
  const merged_props = {};
  let key2;
  for (let i = 0; i < props.length; i++) {
    const obj = props[i];
    for (key2 in obj) {
      const desc = Object.getOwnPropertyDescriptor(obj, key2);
      if (desc) {
        Object.defineProperty(merged_props, key2, desc);
      } else {
        merged_props[key2] = obj[key2];
      }
    }
  }
  return merged_props;
}
function stringify(value) {
  return typeof value === "string" ? value : value == null ? "" : value + "";
}
function style_object_to_string(style_object) {
  return Object.keys(style_object).filter(
    /** @param {any} key */
    (key2) => style_object[key2] != null && style_object[key2] !== ""
  ).map(
    /** @param {any} key */
    (key2) => `${key2}: ${escape_html(style_object[key2], true)};`
  ).join(" ");
}
function add_styles(style_object) {
  const styles = style_object_to_string(style_object);
  return styles ? ` style="${styles}"` : "";
}
function store_get(store_values, store_name, store) {
  var _a;
  if (store_name in store_values && store_values[store_name][0] === store) {
    return store_values[store_name][2];
  }
  (_a = store_values[store_name]) == null ? void 0 : _a[1]();
  store_values[store_name] = [store, null, void 0];
  const unsub = subscribe_to_store(
    store,
    /** @param {any} v */
    (v) => store_values[store_name][2] = v
  );
  store_values[store_name][1] = unsub;
  return store_values[store_name][2];
}
function store_set(store, value) {
  store.set(value);
  return value;
}
function store_mutate(store_values, store_name, store, expression) {
  store_set(store, store_get(store_values, store_name, store));
  return expression;
}
function unsubscribe_stores(store_values) {
  for (const store_name in store_values) {
    store_values[store_name][1]();
  }
}
function slot(payload, $$props, name, slot_props, fallback_fn) {
  var _a;
  var slot_fn = (_a = $$props.$$slots) == null ? void 0 : _a[name];
  if (slot_fn === true) {
    slot_fn = $$props["children"];
  }
  if (slot_fn !== void 0) {
    slot_fn(payload, slot_props);
  }
}
function rest_props(props, rest) {
  const rest_props2 = {};
  let key2;
  for (key2 in props) {
    if (!rest.includes(key2)) {
      rest_props2[key2] = props[key2];
    }
  }
  return rest_props2;
}
function sanitize_props(props) {
  const { children, $$slots, ...sanitized } = props;
  return sanitized;
}
function bind_props(props_parent, props_now) {
  var _a;
  for (const key2 in props_now) {
    const initial_value = props_parent[key2];
    const value = props_now[key2];
    if (initial_value === void 0 && value !== void 0 && ((_a = Object.getOwnPropertyDescriptor(props_parent, key2)) == null ? void 0 : _a.set)) {
      props_parent[key2] = value;
    }
  }
}
function ensure_array_like(array_like_or_iterator) {
  if (array_like_or_iterator) {
    return array_like_or_iterator.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
  }
  return [];
}
function ApplicationLogo($$payload, $$props) {
  let { $$slots, $$events, ...attrs } = $$props;
  $$payload.out += `<svg${spread_attributes(
    {
      viewBox: "0 0 316 316",
      xmlns: "http://www.w3.org/2000/svg",
      ...attrs
    },
    void 0,
    void 0,
    3
  )}><path d="M305.8 81.125C305.77 80.995 305.69 80.885 305.65 80.755C305.56 80.525 305.49 80.285 305.37 80.075C305.29 79.935 305.17 79.815 305.07 79.685C304.94 79.515 304.83 79.325 304.68 79.175C304.55 79.045 304.39 78.955 304.25 78.845C304.09 78.715 303.95 78.575 303.77 78.475L251.32 48.275C249.97 47.495 248.31 47.495 246.96 48.275L194.51 78.475C194.33 78.575 194.19 78.725 194.03 78.845C193.89 78.955 193.73 79.045 193.6 79.175C193.45 79.325 193.34 79.515 193.21 79.685C193.11 79.815 192.99 79.935 192.91 80.075C192.79 80.285 192.71 80.525 192.63 80.755C192.58 80.875 192.51 80.995 192.48 81.125C192.38 81.495 192.33 81.875 192.33 82.265V139.625L148.62 164.795V52.575C148.62 52.185 148.57 51.805 148.47 51.435C148.44 51.305 148.36 51.195 148.32 51.065C148.23 50.835 148.16 50.595 148.04 50.385C147.96 50.245 147.84 50.125 147.74 49.995C147.61 49.825 147.5 49.635 147.35 49.485C147.22 49.355 147.06 49.265 146.92 49.155C146.76 49.025 146.62 48.885 146.44 48.785L93.99 18.585C92.64 17.805 90.98 17.805 89.63 18.585L37.18 48.785C37 48.885 36.86 49.035 36.7 49.155C36.56 49.265 36.4 49.355 36.27 49.485C36.12 49.635 36.01 49.825 35.88 49.995C35.78 50.125 35.66 50.245 35.58 50.385C35.46 50.595 35.38 50.835 35.3 51.065C35.25 51.185 35.18 51.305 35.15 51.435C35.05 51.805 35 52.185 35 52.575V232.235C35 233.795 35.84 235.245 37.19 236.025L142.1 296.425C142.33 296.555 142.58 296.635 142.82 296.725C142.93 296.765 143.04 296.835 143.16 296.865C143.53 296.965 143.9 297.015 144.28 297.015C144.66 297.015 145.03 296.965 145.4 296.865C145.5 296.835 145.59 296.775 145.69 296.745C145.95 296.655 146.21 296.565 146.45 296.435L251.36 236.035C252.72 235.255 253.55 233.815 253.55 232.245V174.885L303.81 145.945C305.17 145.165 306 143.725 306 142.155V82.265C305.95 81.875 305.89 81.495 305.8 81.125ZM144.2 227.205L100.57 202.515L146.39 176.135L196.66 147.195L240.33 172.335L208.29 190.625L144.2 227.205ZM244.75 114.995V164.795L226.39 154.225L201.03 139.625V89.825L219.39 100.395L244.75 114.995ZM249.12 57.105L292.81 82.265L249.12 107.425L205.43 82.265L249.12 57.105ZM114.49 184.425L96.13 194.995V85.305L121.49 70.705L139.85 60.135V169.815L114.49 184.425ZM91.76 27.425L135.45 52.585L91.76 77.745L48.07 52.585L91.76 27.425ZM43.67 60.135L62.03 70.705L87.39 85.305V202.545V202.555V202.565C87.39 202.735 87.44 202.895 87.46 203.055C87.49 203.265 87.49 203.485 87.55 203.695V203.705C87.6 203.875 87.69 204.035 87.76 204.195C87.84 204.375 87.89 204.575 87.99 204.745C87.99 204.745 87.99 204.755 88 204.755C88.09 204.905 88.22 205.035 88.33 205.175C88.45 205.335 88.55 205.495 88.69 205.635L88.7 205.645C88.82 205.765 88.98 205.855 89.12 205.965C89.28 206.085 89.42 206.225 89.59 206.325C89.6 206.325 89.6 206.325 89.61 206.335C89.62 206.335 89.62 206.345 89.63 206.345L139.87 234.775V285.065L43.67 229.705V60.135ZM244.75 229.705L148.58 285.075V234.775L219.8 194.115L244.75 179.875V229.705ZM297.2 139.625L253.49 164.795V114.995L278.85 100.395L297.21 89.825V139.625H297.2Z"></path></svg>`;
}
function Dropdown($$payload, $$props) {
  push();
  let {
    align = "right",
    width = "48",
    contentClasses = "py-1 bg-white dark:bg-gray-700",
    trigger,
    content
  } = $$props;
  $$payload.out += `<div class="relative"><div>`;
  trigger == null ? void 0 : trigger($$payload);
  $$payload.out += `<!----></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ?? (context.d = [])).push(fn);
}
async function tick() {
}
function Link($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "href",
    "as",
    "data",
    "method",
    "replace",
    "preserveScroll",
    "preserveState",
    "only",
    "except",
    "headers",
    "queryStringArrayFormat",
    "async",
    "prefetch",
    "cacheFor"
  ]);
  push();
  let asProp, elProps;
  let href = $$props["href"];
  let as = fallback($$props["as"], "a");
  let data = fallback($$props["data"], () => ({}), true);
  let method = fallback($$props["method"], "get");
  let replace = fallback($$props["replace"], false);
  let preserveScroll = fallback($$props["preserveScroll"], false);
  let preserveState = fallback($$props["preserveState"], null);
  let only = fallback($$props["only"], () => [], true);
  let except = fallback($$props["except"], () => [], true);
  let headers = fallback($$props["headers"], () => ({}), true);
  let queryStringArrayFormat = fallback($$props["queryStringArrayFormat"], "brackets");
  let async = fallback($$props["async"], false);
  let prefetch = fallback($$props["prefetch"], false);
  let cacheFor = fallback($$props["cacheFor"], 0);
  asProp = method !== "get" ? "button" : as.toLowerCase();
  elProps = { a: { href }, button: { type: "button" } }[asProp] || {};
  element(
    $$payload,
    asProp,
    () => {
      $$payload.out += `${spread_attributes({ ...$$restProps, ...elProps })}`;
    },
    () => {
      $$payload.out += `<!---->`;
      slot($$payload, $$props, "default", {});
      $$payload.out += `<!---->`;
    }
  );
  bind_props($$props, {
    href,
    as,
    data,
    method,
    replace,
    preserveScroll,
    preserveState,
    only,
    except,
    headers,
    queryStringArrayFormat,
    async,
    prefetch,
    cacheFor
  });
  pop();
}
const h = (component, propsOrChildren, childrenOrKey, key2 = null) => {
  const hasProps = typeof propsOrChildren === "object" && propsOrChildren !== null && !Array.isArray(propsOrChildren);
  return {
    component,
    key: hasProps ? key2 : typeof childrenOrKey === "number" ? childrenOrKey : null,
    props: hasProps ? propsOrChildren : {},
    children: hasProps ? Array.isArray(childrenOrKey) ? childrenOrKey : childrenOrKey !== null ? [childrenOrKey] : [] : Array.isArray(propsOrChildren) ? propsOrChildren : propsOrChildren !== null ? [propsOrChildren] : []
  };
};
function Render($$payload, $$props) {
  push();
  let component = $$props["component"];
  let props = fallback($$props["props"], () => ({}), true);
  let children = fallback($$props["children"], () => [], true);
  let key2 = fallback($$props["key"], null);
  if (component) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<!---->`;
    {
      if (children.length > 0) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<!---->`;
        component == null ? void 0 : component($$payload, spread_props([
          props,
          {
            children: ($$payload2) => {
              const each_array = ensure_array_like(children);
              $$payload2.out += `<!--[-->`;
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let child = each_array[$$index];
                Render($$payload2, spread_props([child]));
                $$payload2.out += `<!---->`;
              }
              $$payload2.out += `<!--]-->`;
            },
            $$slots: { default: true }
          }
        ]));
        $$payload.out += `<!---->`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<!---->`;
        component == null ? void 0 : component($$payload, spread_props([props]));
        $$payload.out += `<!---->`;
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { component, props, children, key: key2 });
  pop();
}
const { set, subscribe } = writable();
const setPage = set;
const page = { subscribe };
function App($$payload, $$props) {
  push();
  let initialComponent = $$props["initialComponent"];
  let initialPage = $$props["initialPage"];
  let resolveComponent = $$props["resolveComponent"];
  let component = initialComponent;
  let key2 = null;
  let page2 = initialPage;
  let renderProps = resolveRenderProps(component, page2, key2);
  setPage(page2);
  const isServer = typeof window === "undefined";
  if (!isServer) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async (args) => {
        component = args.component;
        page2 = args.page;
        key2 = args.preserveState ? key2 : Date.now();
        renderProps = resolveRenderProps(component, page2, key2);
        setPage(page2);
      }
    });
  }
  function resolveRenderProps(component2, page22, key22 = null) {
    const child = h(component2.default, page22.props, [], key22);
    const layout = component2.layout;
    return layout ? resolveLayout(layout, child, page22.props, key22) : child;
  }
  function resolveLayout(layout, child, pageProps, key22) {
    if (isLayoutFunction(layout)) {
      return layout(h, child);
    }
    if (Array.isArray(layout)) {
      return layout.slice().reverse().reduce((currentRender, layoutComponent) => h(layoutComponent, pageProps, [currentRender], key22), child);
    }
    return h(layout, pageProps, child ? [child] : [], key22);
  }
  function isLayoutFunction(layout) {
    return typeof layout === "function" && layout.length === 2 && typeof layout.prototype === "undefined";
  }
  Render($$payload, spread_props([renderProps]));
  bind_props($$props, {
    initialComponent,
    initialPage,
    resolveComponent
  });
  pop();
}
async function createInertiaApp({ id = "app", resolve, setup, progress = {}, page: page2 }) {
  const isServer = typeof window === "undefined";
  const el = isServer ? null : document.getElementById(id);
  const initialPage = page2 || JSON.parse((el == null ? void 0 : el.dataset.page) || "{}");
  const resolveComponent = (name) => Promise.resolve(resolve(name));
  const [initialComponent] = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {
    })
  ]);
  const props = { initialPage, initialComponent, resolveComponent };
  const svelteApp = setup({
    el,
    App,
    props
  });
  if (isServer) {
    const { html, head: head2, css } = svelteApp;
    return {
      body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${html}</div>`,
      head: [head2, css ? `<style data-vite-css>${css.code}</style>` : ""]
    };
  }
  if (progress) {
    setupProgress(progress);
  }
}
function useForm(rememberKeyOrData, maybeData) {
  const rememberKey = typeof rememberKeyOrData === "string" ? rememberKeyOrData : null;
  const inputData = (typeof rememberKeyOrData === "string" ? maybeData : rememberKeyOrData) ?? {};
  const data = typeof inputData === "function" ? inputData() : inputData;
  const restored = rememberKey ? router.restore(rememberKey) : null;
  let defaults = cloneDeep(data);
  let cancelToken = null;
  let recentlySuccessfulTimeoutId = null;
  let transform = (data2) => data2;
  const store = writable({
    ...restored ? restored.data : data,
    isDirty: false,
    errors: restored ? restored.errors : {},
    hasErrors: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    processing: false,
    setStore(keyOrData, maybeValue = void 0) {
      store.update((store2) => {
        return Object.assign(store2, typeof keyOrData === "string" ? { [keyOrData]: maybeValue } : keyOrData);
      });
    },
    data() {
      return Object.keys(data).reduce((carry, key2) => {
        carry[key2] = this[key2];
        return carry;
      }, {});
    },
    transform(callback) {
      transform = callback;
      return this;
    },
    defaults(fieldOrFields, maybeValue) {
      defaults = typeof fieldOrFields === "undefined" ? cloneDeep(this.data()) : Object.assign(cloneDeep(defaults), typeof fieldOrFields === "string" ? { [fieldOrFields]: maybeValue } : fieldOrFields);
      return this;
    },
    reset(...fields) {
      const clonedData = cloneDeep(defaults);
      if (fields.length === 0) {
        this.setStore(clonedData);
      } else {
        this.setStore(Object.keys(clonedData).filter((key2) => fields.includes(key2)).reduce((carry, key2) => {
          carry[key2] = clonedData[key2];
          return carry;
        }, {}));
      }
      return this;
    },
    setError(fieldOrFields, maybeValue) {
      this.setStore("errors", {
        ...this.errors,
        ...typeof fieldOrFields === "string" ? { [fieldOrFields]: maybeValue } : fieldOrFields
      });
      return this;
    },
    clearErrors(...fields) {
      this.setStore("errors", Object.keys(this.errors).reduce((carry, field) => ({
        ...carry,
        ...fields.length > 0 && !fields.includes(field) ? { [field]: this.errors[field] } : {}
      }), {}));
      return this;
    },
    submit(method, url, options = {}) {
      const data2 = transform(this.data());
      const _options = {
        ...options,
        onCancelToken: (token) => {
          cancelToken = token;
          if (options.onCancelToken) {
            return options.onCancelToken(token);
          }
        },
        onBefore: (visit) => {
          this.setStore("wasSuccessful", false);
          this.setStore("recentlySuccessful", false);
          if (recentlySuccessfulTimeoutId) {
            clearTimeout(recentlySuccessfulTimeoutId);
          }
          if (options.onBefore) {
            return options.onBefore(visit);
          }
        },
        onStart: (visit) => {
          this.setStore("processing", true);
          if (options.onStart) {
            return options.onStart(visit);
          }
        },
        onProgress: (event) => {
          this.setStore("progress", event);
          if (options.onProgress) {
            return options.onProgress(event);
          }
        },
        onSuccess: async (page2) => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          this.clearErrors();
          this.setStore("wasSuccessful", true);
          this.setStore("recentlySuccessful", true);
          recentlySuccessfulTimeoutId = setTimeout(() => this.setStore("recentlySuccessful", false), 2e3);
          if (options.onSuccess) {
            return options.onSuccess(page2);
          }
        },
        onError: (errors) => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          this.clearErrors().setError(errors);
          if (options.onError) {
            return options.onError(errors);
          }
        },
        onCancel: () => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          if (options.onCancel) {
            return options.onCancel();
          }
        },
        onFinish: (visit) => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          cancelToken = null;
          if (options.onFinish) {
            return options.onFinish(visit);
          }
        }
      };
      if (method === "delete") {
        router.delete(url, { ..._options, data: data2 });
      } else {
        router[method](url, data2, _options);
      }
    },
    get(url, options) {
      this.submit("get", url, options);
    },
    post(url, options) {
      this.submit("post", url, options);
    },
    put(url, options) {
      this.submit("put", url, options);
    },
    patch(url, options) {
      this.submit("patch", url, options);
    },
    delete(url, options) {
      this.submit("delete", url, options);
    },
    cancel() {
      cancelToken == null ? void 0 : cancelToken.cancel();
    }
  });
  store.subscribe((form) => {
    if (form.isDirty === isEqual(form.data(), defaults)) {
      form.setStore("isDirty", !form.isDirty);
    }
    const hasErrors = Object.keys(form.errors).length > 0;
    if (form.hasErrors !== hasErrors) {
      form.setStore("hasErrors", !form.hasErrors);
    }
    if (rememberKey) {
      router.remember({ data: form.data(), errors: form.errors }, rememberKey);
    }
  });
  return store;
}
function DropdownLink($$payload, $$props) {
  push();
  let {
    href,
    children,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  Link($$payload, spread_props([
    attrs,
    {
      href,
      class: "block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800",
      children: ($$payload2) => {
        children == null ? void 0 : children($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function NavLink($$payload, $$props) {
  push();
  let {
    active = false,
    children,
    href,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  Link($$payload, spread_props([
    attrs,
    {
      href,
      class: `
        inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out
        ${active ? "border-indigo-400 text-gray-900 focus:border-indigo-700 focus:outline-none dark:border-indigo-600 dark:text-gray-100" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300"}
    `,
      children: ($$payload2) => {
        children == null ? void 0 : children($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function ResponsiveNavLink($$payload, $$props) {
  push();
  let {
    active = false,
    children,
    href,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  Link($$payload, spread_props([
    attrs,
    {
      href,
      class: `
        block w-full border-l-4 py-2 pe-4 ps-3 text-start text-base font-medium transition duration-150 ease-in-out
        ${active ? "border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800 focus:outline-none dark:border-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300 dark:focus:border-indigo-300 dark:focus:bg-indigo-900 dark:focus:text-indigo-200" : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 focus:outline-none dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:border-gray-600 dark:focus:bg-gray-700 dark:focus:text-gray-200"}
    `,
      children: ($$payload2) => {
        children($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function AuthenticatedLayout($$payload, $$props) {
  push();
  var $$store_subs;
  let { header, children } = $$props;
  let user = store_get($$store_subs ?? ($$store_subs = {}), "$page", page).props.auth.user;
  $$payload.out += `<div class="min-h-screen bg-gray-100 dark:bg-gray-900"><nav class="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div class="flex h-16 justify-between"><div class="flex"><div class="flex shrink-0 items-center">`;
  Link($$payload, {
    href: "dashboard",
    children: ($$payload2) => {
      ApplicationLogo($$payload2, {
        class: "block h-9 w-auto fill-current text-gray-800 dark:text-gray-200"
      });
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div> <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">`;
  NavLink($$payload, {
    href: "/dashboard",
    active: store_get($$store_subs ?? ($$store_subs = {}), "$page", page).component === "Dashboard",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Dashboard`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> `;
  NavLink($$payload, {
    href: "/about",
    active: store_get($$store_subs ?? ($$store_subs = {}), "$page", page).component === "About",
    children: ($$payload2) => {
      $$payload2.out += `<!---->About`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> `;
  NavLink($$payload, {
    href: "/links",
    active: store_get($$store_subs ?? ($$store_subs = {}), "$page", page).component === "Links",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Links`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div></div> <div class="hidden sm:ms-6 sm:flex sm:items-center"><div class="relative ms-3">`;
  {
    let trigger = function($$payload2) {
      $$payload2.out += `<span class="inline-flex rounded-md"><button type="button" class="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300">${escape_html(user.name)} <svg class="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414
                           1.414l-4 4a1 1 0 01-1.414
                           0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></span>`;
    }, content = function($$payload2) {
      $$payload2.out += `<div>`;
      DropdownLink($$payload2, {
        href: "/profile",
        children: ($$payload3) => {
          $$payload3.out += `<!---->Profile`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      DropdownLink($$payload2, {
        href: "/logout",
        method: "post",
        as: "button",
        type: "button",
        children: ($$payload3) => {
          $$payload3.out += `<!---->Logout`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----></div>`;
    };
    Dropdown($$payload, {
      align: "right",
      width: "48",
      trigger,
      content,
      $$slots: { trigger: true, content: true }
    });
  }
  $$payload.out += `<!----></div></div> <div class="-me-2 flex items-center sm:hidden"><button class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"><svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"${attr("class", [
    "",
    "inline-flex"
  ].filter(Boolean).join(" "))}></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"${attr("class", [
    "hidden",
    ""
  ].filter(Boolean).join(" "))}></path></svg></button></div></div></div> <div${attr("class", `sm:hidden ${stringify([
    "",
    "hidden"
  ].filter(Boolean).join(" "))}`)}><div class="pt-2 pb-3 space-y-1">`;
  ResponsiveNavLink($$payload, {
    href: "/dashboard",
    active: store_get($$store_subs ?? ($$store_subs = {}), "$page", page).component === "Dashboard",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Dashboard`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> `;
  ResponsiveNavLink($$payload, {
    href: "/about",
    active: store_get($$store_subs ?? ($$store_subs = {}), "$page", page).component === "About",
    children: ($$payload2) => {
      $$payload2.out += `<!---->About`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> `;
  ResponsiveNavLink($$payload, {
    href: "/links",
    active: store_get($$store_subs ?? ($$store_subs = {}), "$page", page).component === "Links",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Links`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div> <div class="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600"><div class="px-4"><div class="text-base font-medium text-gray-800 dark:text-gray-200">${escape_html(user.name)}</div> <div class="text-sm font-medium text-gray-500">${escape_html(user.email)}</div></div> <div class="mt-3 space-y-1">`;
  ResponsiveNavLink($$payload, {
    href: "/profile",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Profile`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> `;
  ResponsiveNavLink($$payload, {
    href: "/logout",
    method: "post",
    as: "button",
    type: "button",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Logout`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div></div></div></nav> `;
  if (header) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<header class="bg-white shadow dark:bg-gray-800"><div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">`;
    header == null ? void 0 : header($$payload);
    $$payload.out += `<!----></div></header>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <main>`;
  children == null ? void 0 : children($$payload);
  $$payload.out += `<!----></main></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function About($$payload) {
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>About</title>`;
  });
  {
    let header = function($$payload2) {
      $$payload2.out += `<h2 class="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-200">About</h2>`;
    };
    AuthenticatedLayout($$payload, {
      header,
      children: ($$payload2) => {
        $$payload2.out += `<div class="py-12"><div class="max-w-7xl mx-auto sm:px-6 lg:px-8"><div class="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800"><div class="p-6 text-gray-900 dark:text-gray-100">This is the about page.</div></div></div></div>`;
      },
      $$slots: { header: true, default: true }
    });
  }
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: About
}, Symbol.toStringTag, { value: "Module" }));
function Checkbox($$payload, $$props) {
  let {
    checked = false,
    class: className,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  $$payload.out += `<input${spread_attributes({
    ...attrs,
    type: "checkbox",
    checked,
    class: `rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800 ${stringify(className)}`
  })}>`;
  bind_props($$props, { checked });
}
function InputError($$payload, $$props) {
  let { message, $$slots, $$events, ...attrs } = $$props;
  if (message) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div${spread_attributes({ ...attrs })}><p class="text-sm text-red-600 dark:text-red-400">${escape_html(message)}</p></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
}
function InputLabel($$payload, $$props) {
  push();
  let {
    class: className,
    value,
    children,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  $$payload.out += `<label${spread_attributes({
    ...attrs,
    class: `block text-sm font-medium text-gray-700 dark:text-gray-300 ${stringify(className)}`
  })}>`;
  if (value) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<span>${escape_html(value)}</span>`;
  } else {
    $$payload.out += "<!--[!-->";
    if (children) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<span>`;
      children == null ? void 0 : children($$payload);
      $$payload.out += `<!----></span>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></label>`;
  pop();
}
function PrimaryButton($$payload, $$props) {
  push();
  let {
    class: className,
    children,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  $$payload.out += `<button${spread_attributes({
    ...attrs,
    class: `inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:bg-white dark:focus:ring-offset-gray-800 dark:active:bg-gray-300 ${stringify(className)}`
  })}>`;
  children == null ? void 0 : children($$payload);
  $$payload.out += `<!----></button>`;
  pop();
}
function TextInput($$payload, $$props) {
  let {
    class: className,
    value = void 0,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  $$payload.out += `<input${spread_attributes({
    ...attrs,
    class: `rounded-md shadow-sm focus:border-indigo-500 dark:border-gray-700 focus:outline-none dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 p-2 h-10 ${stringify(className)}`,
    value
  })}>`;
  bind_props($$props, { value });
}
function GuestLayout($$payload, $$props) {
  push();
  let { children } = $$props;
  $$payload.out += `<div class="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0 dark:bg-gray-900"><div>`;
  Link($$payload, {
    href: "/",
    children: ($$payload2) => {
      ApplicationLogo($$payload2, { class: "h-20 w-20 fill-current text-gray-500" });
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div> <div class="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg dark:bg-gray-800">`;
  children == null ? void 0 : children($$payload);
  $$payload.out += `<!----></div></div>`;
  pop();
}
function Login$1($$payload, $$props) {
  push();
  var $$store_subs;
  let { canResetPassword, status } = $$props;
  let form = useForm({ email: "", password: "", remember: false });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Login</title>`;
    });
    GuestLayout($$payload2, {
      children: ($$payload3) => {
        if (status) {
          $$payload3.out += "<!--[-->";
          $$payload3.out += `<div class="mb-4 text-sm font-medium text-green-600">${escape_html(status)}</div>`;
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--> <form><div>`;
        InputLabel($$payload3, { for: "email", value: "Email" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "email",
          type: "email",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "username",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.email
        });
        $$payload3.out += `<!----></div> <div class="mt-4">`;
        InputLabel($$payload3, { for: "password", value: "Password" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "password",
          type: "password",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "current-password",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password
        });
        $$payload3.out += `<!----></div> <div class="mt-4 block"><label class="flex items-center">`;
        Checkbox($$payload3, {
          name: "remember",
          get checked() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).remember;
          },
          set checked($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).remember = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> <span class="ms-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span></label></div> <div class="mt-4 flex items-center justify-end">`;
        if (canResetPassword) {
          $$payload3.out += "<!--[-->";
          Link($$payload3, {
            href: "/forgot-password",
            class: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800",
            children: ($$payload4) => {
              $$payload4.out += `<!---->Forgot your password?`;
            },
            $$slots: { default: true }
          });
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--> `;
        PrimaryButton($$payload3, {
          class: `ms-4 ${stringify(store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25")}`,
          disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Log in`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----></div></form>`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login$1
}, Symbol.toStringTag, { value: "Module" }));
function Dashboard$1($$payload) {
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Admin Dashboard</title>`;
  });
  {
    let header = function($$payload2) {
      $$payload2.out += `<h2 class="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Admin Dashboard</h2>`;
    };
    AuthenticatedLayout($$payload, {
      header,
      children: ($$payload2) => {
        $$payload2.out += `<div class="py-12"><div class="mx-auto max-w-7xl sm:px-6 lg:px-8"><div class="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800"><div class="p-6 text-gray-900 dark:text-gray-100">You're logged in as an admin!</div></div></div></div>`;
      },
      $$slots: { header: true, default: true }
    });
  }
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard$1
}, Symbol.toStringTag, { value: "Module" }));
function Home$1($$payload, $$props) {
  push();
  var $$store_subs;
  let {
    canLogin,
    canRegister,
    laravelVersion,
    phpVersion
  } = $$props;
  let user = store_get($$store_subs ?? ($$store_subs = {}), "$page", page).props.auth.user;
  $$payload.out += `<div class="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50"><img id="background" class="absolute -left-20 top-0 max-w-[877px]" src="https://laravel.com/assets/img/welcome/background.svg" alt="Laravel Logo"> <div class="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white"><div class="relative w-full max-w-2xl px-6 lg:max-w-7xl"><header class="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3"><div class="flex lg:col-start-2 lg:justify-center"><svg class="h-12 w-auto text-white lg:h-16 lg:text-[#FF2D20]" viewBox="0 0 62 65" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M61.8548 14.6253C61.8778 14.7102 61.8895 14.7978 61.8897 14.8858V28.5615C61.8898 28.737 61.8434 28.9095 61.7554 29.0614C61.6675 29.2132 61.5409 29.3392 61.3887 29.4265L49.9104 36.0351V49.1337C49.9104 49.4902 49.7209 49.8192 49.4118 49.9987L25.4519 63.7916C25.3971 63.8227 25.3372 63.8427 25.2774 63.8639C25.255 63.8714 25.2338 63.8851 25.2101 63.8913C25.0426 63.9354 24.8666 63.9354 24.6991 63.8913C24.6716 63.8838 24.6467 63.8689 24.6205 63.8589C24.5657 63.8389 24.5084 63.8215 24.456 63.7916L0.501061 49.9987C0.348882 49.9113 0.222437 49.7853 0.134469 49.6334C0.0465019 49.4816 0.000120578 49.3092 0 49.1337L0 8.10652C0 8.01678 0.0124642 7.92953 0.0348998 7.84477C0.0423783 7.8161 0.0598282 7.78993 0.0697995 7.76126C0.0884958 7.70891 0.105946 7.65531 0.133367 7.6067C0.152063 7.5743 0.179485 7.54812 0.20192 7.51821C0.230588 7.47832 0.256763 7.43719 0.290416 7.40229C0.319084 7.37362 0.356476 7.35243 0.388883 7.32751C0.425029 7.29759 0.457436 7.26518 0.498568 7.2415L12.4779 0.345059C12.6296 0.257786 12.8015 0.211853 12.9765 0.211853C13.1515 0.211853 13.3234 0.257786 13.475 0.345059L25.4531 7.2415H25.4556C25.4955 7.26643 25.5292 7.29759 25.5653 7.32626C25.5977 7.35119 25.6339 7.37362 25.6625 7.40104C25.6974 7.43719 25.7224 7.47832 25.7523 7.51821C25.7735 7.54812 25.8021 7.5743 25.8196 7.6067C25.8483 7.65656 25.8645 7.70891 25.8844 7.76126C25.8944 7.78993 25.9118 7.8161 25.9193 7.84602C25.9423 7.93096 25.954 8.01853 25.9542 8.10652V33.7317L35.9355 27.9844V14.8846C35.9355 14.7973 35.948 14.7088 35.9704 14.6253C35.9792 14.5954 35.9954 14.5692 36.0053 14.5405C36.0253 14.4882 36.0427 14.4346 36.0702 14.386C36.0888 14.3536 36.1163 14.3274 36.1375 14.2975C36.1674 14.2576 36.1923 14.2165 36.2272 14.1816C36.2559 14.1529 36.292 14.1317 36.3244 14.1068C36.3618 14.0769 36.3942 14.0445 36.4341 14.0208L48.4147 7.12434C48.5663 7.03694 48.7383 6.99094 48.9133 6.99094C49.0883 6.99094 49.2602 7.03694 49.4118 7.12434L61.3899 14.0208C61.4323 14.0457 61.4647 14.0769 61.5021 14.1055C61.5333 14.1305 61.5694 14.1529 61.5981 14.1803C61.633 14.2165 61.6579 14.2576 61.6878 14.2975C61.7103 14.3274 61.7377 14.3536 61.7551 14.386C61.7838 14.4346 61.8 14.4882 61.8199 14.5405C61.8312 14.5692 61.8474 14.5954 61.8548 14.6253ZM59.893 27.9844V16.6121L55.7013 19.0252L49.9104 22.3593V33.7317L59.8942 27.9844H59.893ZM47.9149 48.5566V37.1768L42.2187 40.4299L25.953 49.7133V61.2003L47.9149 48.5566ZM1.99677 9.83281V48.5566L23.9562 61.199V49.7145L12.4841 43.2219L12.4804 43.2194L12.4754 43.2169C12.4368 43.1945 12.4044 43.1621 12.3682 43.1347C12.3371 43.1097 12.3009 43.0898 12.2735 43.0624L12.271 43.0586C12.2386 43.0275 12.2162 42.9888 12.1887 42.9539C12.1638 42.9203 12.1339 42.8916 12.114 42.8567L12.1127 42.853C12.0903 42.8156 12.0766 42.7707 12.0604 42.7283C12.0442 42.6909 12.023 42.656 12.013 42.6161C12.0005 42.5688 11.998 42.5177 11.9931 42.4691C11.9881 42.4317 11.9781 42.3943 11.9781 42.3569V15.5801L6.18848 12.2446L1.99677 9.83281ZM12.9777 2.36177L2.99764 8.10652L12.9752 13.8513L22.9541 8.10527L12.9752 2.36177H12.9777ZM18.1678 38.2138L23.9574 34.8809V9.83281L19.7657 12.2459L13.9749 15.5801V40.6281L18.1678 38.2138ZM48.9133 9.14105L38.9344 14.8858L48.9133 20.6305L58.8909 14.8846L48.9133 9.14105ZM47.9149 22.3593L42.124 19.0252L37.9323 16.6121V27.9844L43.7219 31.3174L47.9149 33.7317V22.3593ZM24.9533 47.987L39.59 39.631L46.9065 35.4555L36.9352 29.7145L25.4544 36.3242L14.9907 42.3482L24.9533 47.987Z" fill="currentColor"></path></svg></div> `;
  if (canLogin) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<nav class="-mx-3 flex flex-1 justify-end">`;
    if (user) {
      $$payload.out += "<!--[-->";
      Link($$payload, {
        href: "/dashboard",
        class: "rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white",
        children: ($$payload2) => {
          $$payload2.out += `<!---->Dashboard`;
        },
        $$slots: { default: true }
      });
    } else {
      $$payload.out += "<!--[!-->";
      Link($$payload, {
        href: "/login",
        class: "rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white",
        children: ($$payload2) => {
          $$payload2.out += `<!---->Log in`;
        },
        $$slots: { default: true }
      });
      $$payload.out += `<!----> `;
      if (canRegister) {
        $$payload.out += "<!--[-->";
        Link($$payload, {
          href: "/register",
          class: "rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white",
          children: ($$payload2) => {
            $$payload2.out += `<!---->Register`;
          },
          $$slots: { default: true }
        });
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]--></nav>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></header> <main class="mt-6"><div class="grid gap-6 lg:grid-cols-2 lg:gap-8"><a href="https://laravel.com/docs" id="docs-card" class="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] md:row-span-3 lg:p-10 lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"><div id="screenshot-container" class="relative flex w-full flex-1 items-stretch"><img src="https://laravel.com/assets/img/welcome/docs-light.svg" alt="Laravel documentation screenshot" class="aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.06)] dark:hidden" onerror="this.__e=event"> <img src="https://laravel.com/assets/img/welcome/docs-dark.svg" alt="Laravel documentation screenshot" class="hidden aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.25)] dark:block"> <div class="absolute -bottom-16 -left-16 h-40 w-[calc(100%+8rem)] bg-gradient-to-b from-transparent via-white to-white dark:via-zinc-900 dark:to-zinc-900"></div></div> <div class="relative flex items-center gap-6 lg:items-end"><div id="docs-card-content" class="flex items-start gap-6 lg:flex-col"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="#FF2D20" d="M23 4a1 1 0 0 0-1.447-.894L12.224 7.77a.5.5 0 0 1-.448 0L2.447 3.106A1 1 0 0 0 1 4v13.382a1.99 1.99 0 0 0 1.105 1.79l9.448 4.728c.14.065.293.1.447.1.154-.005.306-.04.447-.105l9.453-4.724a1.99 1.99 0 0 0 1.1-1.789V4ZM3 6.023a.25.25 0 0 1 .362-.223l7.5 3.75a.251.251 0 0 1 .138.223v11.2a.25.25 0 0 1-.362.224l-7.5-3.75a.25.25 0 0 1-.138-.22V6.023Zm18 11.2a.25.25 0 0 1-.138.224l-7.5 3.75a.249.249 0 0 1-.329-.099.249.249 0 0 1-.033-.12V9.772a.251.251 0 0 1 .138-.224l7.5-3.75a.25.25 0 0 1 .362.224v11.2Z"></path><path fill="#FF2D20" d="m3.55 1.893 8 4.048a1.008 1.008 0 0 0 .9 0l8-4.048a1 1 0 0 0-.9-1.785l-7.322 3.706a.506.506 0 0 1-.452 0L4.454.108a1 1 0 0 0-.9 1.785H3.55Z"></path></svg></div> <div class="pt-3 sm:pt-5 lg:pt-0"><h2 class="text-xl font-semibold text-black dark:text-white">Documentation</h2> <p class="mt-4 text-sm/relaxed">Laravel has wonderful documentation covering every aspect of the framework.
                    Whether you are a newcomer or have prior experience with Laravel, we recommend
                    reading our documentation from beginning to end.</p></div></div> <svg class="size-6 shrink-0 stroke-[#FF2D20]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path></svg></div></a> <a href="https://laracasts.com" class="flex items-start gap-4 rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="#FF2D20"><path d="M24 8.25a.5.5 0 0 0-.5-.5H.5a.5.5 0 0 0-.5.5v12a2.5 2.5 0 0 0 2.5 2.5h19a2.5 2.5 0 0 0 2.5-2.5v-12Zm-7.765 5.868a1.221 1.221 0 0 1 0 2.264l-6.626 2.776A1.153 1.153 0 0 1 8 18.123v-5.746a1.151 1.151 0 0 1 1.609-1.035l6.626 2.776ZM19.564 1.677a.25.25 0 0 0-.177-.427H15.6a.106.106 0 0 0-.072.03l-4.54 4.543a.25.25 0 0 0 .177.427h3.783c.027 0 .054-.01.073-.03l4.543-4.543ZM22.071 1.318a.047.047 0 0 0-.045.013l-4.492 4.492a.249.249 0 0 0 .038.385.25.25 0 0 0 .14.042h5.784a.5.5 0 0 0 .5-.5v-2a2.5 2.5 0 0 0-1.925-2.432ZM13.014 1.677a.25.25 0 0 0-.178-.427H9.101a.106.106 0 0 0-.073.03l-4.54 4.543a.25.25 0 0 0 .177.427H8.4a.106.106 0 0 0 .073-.03l4.54-4.543ZM6.513 1.677a.25.25 0 0 0-.177-.427H2.5A2.5 2.5 0 0 0 0 3.75v2a.5.5 0 0 0 .5.5h1.4a.106.106 0 0 0 .073-.03l4.54-4.543Z"></path></g></svg></div> <div class="pt-3 sm:pt-5"><h2 class="text-xl font-semibold text-black dark:text-white">Laracasts</h2> <p class="mt-4 text-sm/relaxed">Laracasts offers thousands of video tutorials on Laravel, PHP, and JavaScript
                development. Check them out, see for yourself, and massively level up your
                development skills in the process.</p></div> <svg class="size-6 shrink-0 self-center stroke-[#FF2D20]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path></svg></a> <a href="https://laravel-news.com" class="flex items-start gap-4 rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="#FF2D20"><path d="M8.75 4.5H5.5c-.69 0-1.25.56-1.25 1.25v4.75c0 .69.56 1.25 1.25 1.25h3.25c.69 0 1.25-.56 1.25-1.25V5.75c0-.69-.56-1.25-1.25-1.25Z"></path><path d="M24 10a3 3 0 0 0-3-3h-2V2.5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2V20a3.5 3.5 0 0 0 3.5 3.5h17A3.5 3.5 0 0 0 24 20V10ZM3.5 21.5A1.5 1.5 0 0 1 2 20V3a.5.5 0 0 1 .5-.5h14a.5.5 0 0 1 .5.5v17c0 .295.037.588.11.874a.5.5 0 0 1-.484.625L3.5 21.5ZM22 20a1.5 1.5 0 1 1-3 0V9.5a.5.5 0 0 1 .5-.5H21a1 1 0 0 1 1 1v10Z"></path><path d="M12.751 6.047h2a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-2A.75.75 0 0 1 12 7.3v-.5a.75.75 0 0 1 .751-.753ZM12.751 10.047h2a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-2A.75.75 0 0 1 12 11.3v-.5a.75.75 0 0 1 .751-.753ZM4.751 14.047h10a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-10A.75.75 0 0 1 4 15.3v-.5a.75.75 0 0 1 .751-.753ZM4.75 18.047h7.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-7.5A.75.75 0 0 1 4 19.3v-.5a.75.75 0 0 1 .75-.753Z"></path></g></svg></div> <div class="pt-3 sm:pt-5"><h2 class="text-xl font-semibold text-black dark:text-white">Laravel News</h2> <p class="mt-4 text-sm/relaxed">Laravel News is a community driven portal and newsletter aggregating all of the
                latest and most important news in the Laravel ecosystem, including new package
                releases and tutorials.</p></div> <svg class="size-6 shrink-0 self-center stroke-[#FF2D20]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path></svg></a> <div class="flex items-start gap-4 rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="#FF2D20"><path d="M16.597 12.635a.247.247 0 0 0-.08-.237 2.234 2.234 0 0 1-.769-1.68c.001-.195.03-.39.084-.578a.25.25 0 0 0-.09-.267 8.8 8.8 0 0 0-4.826-1.66.25.25 0 0 0-.268.181 2.5 2.5 0 0 1-2.4 1.824.045.045 0 0 0-.045.037 12.255 12.255 0 0 0-.093 3.86.251.251 0 0 0 .208.214c2.22.366 4.367 1.08 6.362 2.118a.252.252 0 0 0 .32-.079 10.09 10.09 0 0 0 1.597-3.733ZM13.616 17.968a.25.25 0 0 0-.063-.407A19.697 19.697 0 0 0 8.91 15.98a.25.25 0 0 0-.287.325c.151.455.334.898.548 1.328.437.827.981 1.594 1.619 2.28a.249.249 0 0 0 .32.044 29.13 29.13 0 0 0 2.506-1.99ZM6.303 14.105a.25.25 0 0 0 .265-.274 13.048 13.048 0 0 1 .205-4.045.062.062 0 0 0-.022-.07 2.5 2.5 0 0 1-.777-.982.25.25 0 0 0-.271-.149 11 11 0 0 0-5.6 2.815.255.255 0 0 0-.075.163c-.008.135-.02.27-.02.406.002.8.084 1.598.246 2.381a.25.25 0 0 0 .303.193 19.924 19.924 0 0 1 5.746-.438ZM9.228 20.914a.25.25 0 0 0 .1-.393 11.53 11.53 0 0 1-1.5-2.22 12.238 12.238 0 0 1-.91-2.465.248.248 0 0 0-.22-.187 18.876 18.876 0 0 0-5.69.33.249.249 0 0 0-.179.336c.838 2.142 2.272 4 4.132 5.353a.254.254 0 0 0 .15.048c1.41-.01 2.807-.282 4.117-.802ZM18.93 12.957l-.005-.008a.25.25 0 0 0-.268-.082 2.21 2.21 0 0 1-.41.081.25.25 0 0 0-.217.2c-.582 2.66-2.127 5.35-5.75 7.843a.248.248 0 0 0-.09.299.25.25 0 0 0 .065.091 28.703 28.703 0 0 0 2.662 2.12.246.246 0 0 0 .209.037c2.579-.701 4.85-2.242 6.456-4.378a.25.25 0 0 0 .048-.189 13.51 13.51 0 0 0-2.7-6.014ZM5.702 7.058a.254.254 0 0 0 .2-.165A2.488 2.488 0 0 1 7.98 5.245a.093.093 0 0 0 .078-.062 19.734 19.734 0 0 1 3.055-4.74.25.25 0 0 0-.21-.41 12.009 12.009 0 0 0-10.4 8.558.25.25 0 0 0 .373.281 12.912 12.912 0 0 1 4.826-1.814ZM10.773 22.052a.25.25 0 0 0-.28-.046c-.758.356-1.55.635-2.365.833a.25.25 0 0 0-.022.48c1.252.43 2.568.65 3.893.65.1 0 .2 0 .3-.008a.25.25 0 0 0 .147-.444c-.526-.424-1.1-.917-1.673-1.465ZM18.744 8.436a.249.249 0 0 0 .15.228 2.246 2.246 0 0 1 1.352 2.054c0 .337-.08.67-.23.972a.25.25 0 0 0 .042.28l.007.009a15.016 15.016 0 0 1 2.52 4.6.25.25 0 0 0 .37.132.25.25 0 0 0 .096-.114c.623-1.464.944-3.039.945-4.63a12.005 12.005 0 0 0-5.78-10.258.25.25 0 0 0-.373.274c.547 2.109.85 4.274.901 6.453ZM9.61 5.38a.25.25 0 0 0 .08.31c.34.24.616.561.8.935a.25.25 0 0 0 .3.127.631.631 0 0 1 .206-.034c2.054.078 4.036.772 5.69 1.991a.251.251 0 0 0 .267.024c.046-.024.093-.047.141-.067a.25.25 0 0 0 .151-.23A29.98 29.98 0 0 0 15.957.764a.25.25 0 0 0-.16-.164 11.924 11.924 0 0 0-2.21-.518.252.252 0 0 0-.215.076A22.456 22.456 0 0 0 9.61 5.38Z"></path></g></svg></div> <div class="pt-3 sm:pt-5"><h2 class="text-xl font-semibold text-black dark:text-white">Vibrant Ecosystem</h2> <p class="mt-4 text-sm/relaxed">Laravel's robust library of first-party tools and libraries, such as <a href="https://forge.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white dark:focus-visible:ring-[#FF2D20]">Forge</a>, <a href="https://vapor.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Vapor</a>, <a href="https://nova.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Nova</a>, <a href="https://envoyer.io" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Envoyer</a>, and <a href="https://herd.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Herd</a> help you take your projects to the next level. Pair them with powerful open source libraries
                like <a href="https://laravel.com/docs/billing" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Cashier</a>, <a href="https://laravel.com/docs/dusk" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Dusk</a>, <a href="https://laravel.com/docs/broadcasting" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Echo</a>, <a href="https://laravel.com/docs/horizon" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Horizon</a>, <a href="https://laravel.com/docs/sanctum" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Sanctum</a>, <a href="https://laravel.com/docs/telescope" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Telescope</a>, and more.</p></div></div></div></main> <footer class="py-16 text-center text-sm text-black dark:text-white/70">Laravel v${escape_html(laravelVersion)} (PHP v${escape_html(phpVersion)})</footer></div></div></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home$1
}, Symbol.toStringTag, { value: "Module" }));
function ConfirmPassword($$payload, $$props) {
  push();
  var $$store_subs;
  let form = useForm({ password: "" });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Confirm Password</title>`;
    });
    GuestLayout($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">This is a secure area of the application. Please confirm your password before continuing.</div> <form><div>`;
        InputLabel($$payload3, { for: "password", value: "Password" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "password",
          type: "password",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "current-password",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password
        });
        $$payload3.out += `<!----></div> <div class="mt-4 flex justify-end">`;
        PrimaryButton($$payload3, {
          class: `ms-4 ${stringify(store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25")}`,
          disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Confirm`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----></div></form>`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ConfirmPassword
}, Symbol.toStringTag, { value: "Module" }));
function ForgotPassword($$payload, $$props) {
  push();
  var $$store_subs;
  let { status } = $$props;
  let form = useForm({ email: "" });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Forgot Password</title>`;
    });
    GuestLayout($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">Forgot your password? No problem. Just let us know your email address and we will email you a
    password reset link that will allow you to choose a new one.</div> `;
        if (status) {
          $$payload3.out += "<!--[-->";
          $$payload3.out += `<div class="mb-4 text-sm font-medium text-green-600 dark:text-green-400">${escape_html(status)}</div>`;
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--> <form><div>`;
        InputLabel($$payload3, { for: "email", value: "Email" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "email",
          type: "email",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "username",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.email
        });
        $$payload3.out += `<!----></div> <div class="mt-4 flex items-center justify-end">`;
        PrimaryButton($$payload3, {
          class: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25",
          disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Email Password Reset Link`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----></div></form>`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ForgotPassword
}, Symbol.toStringTag, { value: "Module" }));
function Login($$payload, $$props) {
  push();
  var $$store_subs;
  let { canResetPassword, status } = $$props;
  let form = useForm({ email: "", password: "", remember: false });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Login</title>`;
    });
    GuestLayout($$payload2, {
      children: ($$payload3) => {
        if (status) {
          $$payload3.out += "<!--[-->";
          $$payload3.out += `<div class="mb-4 text-sm font-medium text-green-600">${escape_html(status)}</div>`;
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--> <form><div>`;
        InputLabel($$payload3, { for: "email", value: "Email" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "email",
          type: "email",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "username",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.email
        });
        $$payload3.out += `<!----></div> <div class="mt-4">`;
        InputLabel($$payload3, { for: "password", value: "Password" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "password",
          type: "password",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "current-password",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password
        });
        $$payload3.out += `<!----></div> <div class="mt-4 block"><label class="flex items-center">`;
        Checkbox($$payload3, {
          name: "remember",
          get checked() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).remember;
          },
          set checked($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).remember = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> <span class="ms-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span></label></div> <div class="mt-4 flex items-center justify-end">`;
        if (canResetPassword) {
          $$payload3.out += "<!--[-->";
          Link($$payload3, {
            href: "/forgot-password",
            class: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800",
            children: ($$payload4) => {
              $$payload4.out += `<!---->Forgot your password?`;
            },
            $$slots: { default: true }
          });
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--> `;
        PrimaryButton($$payload3, {
          class: `ms-4 ${stringify(store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25")}`,
          disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Log in`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----></div></form>`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
function Register($$payload, $$props) {
  push();
  var $$store_subs;
  let form = useForm({
    name: null,
    email: null,
    password: null,
    password_confirmation: null,
    terms: false
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Register</title>`;
    });
    GuestLayout($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<form><div>`;
        InputLabel($$payload3, { for: "name", value: "Name" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "name",
          type: "text",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "name",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).name;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).name = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.name
        });
        $$payload3.out += `<!----></div> <div class="mt-4">`;
        InputLabel($$payload3, { for: "email", value: "Email" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "email",
          type: "email",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "username",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.email
        });
        $$payload3.out += `<!----></div> <div class="mt-4">`;
        InputLabel($$payload3, { for: "password", value: "Password" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "password",
          type: "password",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "new-password",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password
        });
        $$payload3.out += `<!----></div> <div class="mt-4">`;
        InputLabel($$payload3, {
          for: "password_confirmation",
          value: "Confirm Password"
        });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "password_confirmation",
          type: "password",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "new-password",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password_confirmation;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password_confirmation = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password_confirmation
        });
        $$payload3.out += `<!----></div> <div class="mt-4 flex items-center justify-end">`;
        Link($$payload3, {
          href: "/login",
          class: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800",
          children: ($$payload4) => {
            $$payload4.out += `<!---->Already registered?`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> `;
        PrimaryButton($$payload3, {
          class: `ms-4 ${stringify(store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25")}`,
          disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Register`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----></div></form>`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Register
}, Symbol.toStringTag, { value: "Module" }));
function ResetPassword($$payload, $$props) {
  push();
  var $$store_subs;
  let { email, token } = $$props;
  const form = useForm({
    token,
    email,
    password: null,
    password_confirmation: null
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Reset Password</title>`;
    });
    GuestLayout($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<form><div>`;
        InputLabel($$payload3, { for: "email", value: "Email" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "email",
          type: "email",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "username",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.email
        });
        $$payload3.out += `<!----></div> <div class="mt-4">`;
        InputLabel($$payload3, { for: "password", value: "Password" });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "password",
          type: "password",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "new-password",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password
        });
        $$payload3.out += `<!----></div> <div class="mt-4">`;
        InputLabel($$payload3, {
          for: "password_confirmation",
          value: "Confirm Password"
        });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          id: "password_confirmation",
          type: "password",
          class: "mt-1 block w-full",
          required: true,
          autocomplete: "new-password",
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password_confirmation;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password_confirmation = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          class: "mt-2",
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password_confirmation
        });
        $$payload3.out += `<!----></div> <div class="flex items-center justify-end mt-4">`;
        PrimaryButton($$payload3, {
          class: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25",
          disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Reset Password`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----></div></form>`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ResetPassword
}, Symbol.toStringTag, { value: "Module" }));
function VerifyEmail($$payload, $$props) {
  push();
  var $$store_subs;
  let verificationLinkSent = status === "verification-link-sent";
  let { status } = $$props;
  const form = useForm({});
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Email Verification</title>`;
  });
  GuestLayout($$payload, {
    children: ($$payload2) => {
      $$payload2.out += `<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">Thanks for signing up! Before getting started, could you verify your email address by clicking
    on the link we just emailed to you? If you didn't receive the email, we will gladly send you
    another.</div> `;
      if (verificationLinkSent) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<div class="mb-4 text-sm font-medium text-green-600 dark:text-green-400">A new verification link has been sent to the email address you provided during registration.</div>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--> <form><div class="mt-4 flex items-center justify-between">`;
      PrimaryButton($$payload2, {
        class: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25",
        disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
        children: ($$payload3) => {
          $$payload3.out += `<!---->Resend Verification Email`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      Link($$payload2, {
        href: "logout",
        method: "post",
        as: "button",
        class: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800",
        children: ($$payload3) => {
          $$payload3.out += `<!---->Log Out`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----></div></form>`;
    },
    $$slots: { default: true }
  });
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: VerifyEmail
}, Symbol.toStringTag, { value: "Module" }));
function Dashboard($$payload) {
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Dashboard</title>`;
  });
  {
    let header = function($$payload2) {
      $$payload2.out += `<h2 class="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Dashboard</h2>`;
    };
    AuthenticatedLayout($$payload, {
      header,
      children: ($$payload2) => {
        $$payload2.out += `<div class="py-12"><div class="mx-auto max-w-7xl sm:px-6 lg:px-8"><div class="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800"><div class="p-6 text-gray-900 dark:text-gray-100">You're logged in!</div></div></div></div>`;
      },
      $$slots: { header: true, default: true }
    });
  }
}
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard
}, Symbol.toStringTag, { value: "Module" }));
function Home($$payload, $$props) {
  push();
  var $$store_subs;
  let {
    canLogin,
    canRegister,
    laravelVersion,
    phpVersion
  } = $$props;
  let user = store_get($$store_subs ?? ($$store_subs = {}), "$page", page).props.auth.user;
  $$payload.out += `<div class="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50"><img id="background" class="absolute -left-20 top-0 max-w-[877px]" src="https://laravel.com/assets/img/welcome/background.svg" alt="Laravel Logo"> <div class="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white"><div class="relative w-full max-w-2xl px-6 lg:max-w-7xl"><header class="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3"><div class="flex lg:col-start-2 lg:justify-center"><svg class="h-12 w-auto text-white lg:h-16 lg:text-[#FF2D20]" viewBox="0 0 62 65" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M61.8548 14.6253C61.8778 14.7102 61.8895 14.7978 61.8897 14.8858V28.5615C61.8898 28.737 61.8434 28.9095 61.7554 29.0614C61.6675 29.2132 61.5409 29.3392 61.3887 29.4265L49.9104 36.0351V49.1337C49.9104 49.4902 49.7209 49.8192 49.4118 49.9987L25.4519 63.7916C25.3971 63.8227 25.3372 63.8427 25.2774 63.8639C25.255 63.8714 25.2338 63.8851 25.2101 63.8913C25.0426 63.9354 24.8666 63.9354 24.6991 63.8913C24.6716 63.8838 24.6467 63.8689 24.6205 63.8589C24.5657 63.8389 24.5084 63.8215 24.456 63.7916L0.501061 49.9987C0.348882 49.9113 0.222437 49.7853 0.134469 49.6334C0.0465019 49.4816 0.000120578 49.3092 0 49.1337L0 8.10652C0 8.01678 0.0124642 7.92953 0.0348998 7.84477C0.0423783 7.8161 0.0598282 7.78993 0.0697995 7.76126C0.0884958 7.70891 0.105946 7.65531 0.133367 7.6067C0.152063 7.5743 0.179485 7.54812 0.20192 7.51821C0.230588 7.47832 0.256763 7.43719 0.290416 7.40229C0.319084 7.37362 0.356476 7.35243 0.388883 7.32751C0.425029 7.29759 0.457436 7.26518 0.498568 7.2415L12.4779 0.345059C12.6296 0.257786 12.8015 0.211853 12.9765 0.211853C13.1515 0.211853 13.3234 0.257786 13.475 0.345059L25.4531 7.2415H25.4556C25.4955 7.26643 25.5292 7.29759 25.5653 7.32626C25.5977 7.35119 25.6339 7.37362 25.6625 7.40104C25.6974 7.43719 25.7224 7.47832 25.7523 7.51821C25.7735 7.54812 25.8021 7.5743 25.8196 7.6067C25.8483 7.65656 25.8645 7.70891 25.8844 7.76126C25.8944 7.78993 25.9118 7.8161 25.9193 7.84602C25.9423 7.93096 25.954 8.01853 25.9542 8.10652V33.7317L35.9355 27.9844V14.8846C35.9355 14.7973 35.948 14.7088 35.9704 14.6253C35.9792 14.5954 35.9954 14.5692 36.0053 14.5405C36.0253 14.4882 36.0427 14.4346 36.0702 14.386C36.0888 14.3536 36.1163 14.3274 36.1375 14.2975C36.1674 14.2576 36.1923 14.2165 36.2272 14.1816C36.2559 14.1529 36.292 14.1317 36.3244 14.1068C36.3618 14.0769 36.3942 14.0445 36.4341 14.0208L48.4147 7.12434C48.5663 7.03694 48.7383 6.99094 48.9133 6.99094C49.0883 6.99094 49.2602 7.03694 49.4118 7.12434L61.3899 14.0208C61.4323 14.0457 61.4647 14.0769 61.5021 14.1055C61.5333 14.1305 61.5694 14.1529 61.5981 14.1803C61.633 14.2165 61.6579 14.2576 61.6878 14.2975C61.7103 14.3274 61.7377 14.3536 61.7551 14.386C61.7838 14.4346 61.8 14.4882 61.8199 14.5405C61.8312 14.5692 61.8474 14.5954 61.8548 14.6253ZM59.893 27.9844V16.6121L55.7013 19.0252L49.9104 22.3593V33.7317L59.8942 27.9844H59.893ZM47.9149 48.5566V37.1768L42.2187 40.4299L25.953 49.7133V61.2003L47.9149 48.5566ZM1.99677 9.83281V48.5566L23.9562 61.199V49.7145L12.4841 43.2219L12.4804 43.2194L12.4754 43.2169C12.4368 43.1945 12.4044 43.1621 12.3682 43.1347C12.3371 43.1097 12.3009 43.0898 12.2735 43.0624L12.271 43.0586C12.2386 43.0275 12.2162 42.9888 12.1887 42.9539C12.1638 42.9203 12.1339 42.8916 12.114 42.8567L12.1127 42.853C12.0903 42.8156 12.0766 42.7707 12.0604 42.7283C12.0442 42.6909 12.023 42.656 12.013 42.6161C12.0005 42.5688 11.998 42.5177 11.9931 42.4691C11.9881 42.4317 11.9781 42.3943 11.9781 42.3569V15.5801L6.18848 12.2446L1.99677 9.83281ZM12.9777 2.36177L2.99764 8.10652L12.9752 13.8513L22.9541 8.10527L12.9752 2.36177H12.9777ZM18.1678 38.2138L23.9574 34.8809V9.83281L19.7657 12.2459L13.9749 15.5801V40.6281L18.1678 38.2138ZM48.9133 9.14105L38.9344 14.8858L48.9133 20.6305L58.8909 14.8846L48.9133 9.14105ZM47.9149 22.3593L42.124 19.0252L37.9323 16.6121V27.9844L43.7219 31.3174L47.9149 33.7317V22.3593ZM24.9533 47.987L39.59 39.631L46.9065 35.4555L36.9352 29.7145L25.4544 36.3242L14.9907 42.3482L24.9533 47.987Z" fill="currentColor"></path></svg></div> `;
  if (canLogin) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<nav class="-mx-3 flex flex-1 justify-end">`;
    if (user) {
      $$payload.out += "<!--[-->";
      Link($$payload, {
        href: "/dashboard",
        class: "rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white",
        children: ($$payload2) => {
          $$payload2.out += `<!---->Dashboard`;
        },
        $$slots: { default: true }
      });
    } else {
      $$payload.out += "<!--[!-->";
      Link($$payload, {
        href: "/login",
        class: "rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white",
        children: ($$payload2) => {
          $$payload2.out += `<!---->Log in`;
        },
        $$slots: { default: true }
      });
      $$payload.out += `<!----> `;
      if (canRegister) {
        $$payload.out += "<!--[-->";
        Link($$payload, {
          href: "/register",
          class: "rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white",
          children: ($$payload2) => {
            $$payload2.out += `<!---->Register`;
          },
          $$slots: { default: true }
        });
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]--></nav>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></header> <main class="mt-6"><div class="grid gap-6 lg:grid-cols-2 lg:gap-8"><a href="https://laravel.com/docs" id="docs-card" class="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] md:row-span-3 lg:p-10 lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"><div id="screenshot-container" class="relative flex w-full flex-1 items-stretch"><img src="https://laravel.com/assets/img/welcome/docs-light.svg" alt="Laravel documentation screenshot" class="aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.06)] dark:hidden" onerror="this.__e=event"> <img src="https://laravel.com/assets/img/welcome/docs-dark.svg" alt="Laravel documentation screenshot" class="hidden aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.25)] dark:block"> <div class="absolute -bottom-16 -left-16 h-40 w-[calc(100%+8rem)] bg-gradient-to-b from-transparent via-white to-white dark:via-zinc-900 dark:to-zinc-900"></div></div> <div class="relative flex items-center gap-6 lg:items-end"><div id="docs-card-content" class="flex items-start gap-6 lg:flex-col"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="#FF2D20" d="M23 4a1 1 0 0 0-1.447-.894L12.224 7.77a.5.5 0 0 1-.448 0L2.447 3.106A1 1 0 0 0 1 4v13.382a1.99 1.99 0 0 0 1.105 1.79l9.448 4.728c.14.065.293.1.447.1.154-.005.306-.04.447-.105l9.453-4.724a1.99 1.99 0 0 0 1.1-1.789V4ZM3 6.023a.25.25 0 0 1 .362-.223l7.5 3.75a.251.251 0 0 1 .138.223v11.2a.25.25 0 0 1-.362.224l-7.5-3.75a.25.25 0 0 1-.138-.22V6.023Zm18 11.2a.25.25 0 0 1-.138.224l-7.5 3.75a.249.249 0 0 1-.329-.099.249.249 0 0 1-.033-.12V9.772a.251.251 0 0 1 .138-.224l7.5-3.75a.25.25 0 0 1 .362.224v11.2Z"></path><path fill="#FF2D20" d="m3.55 1.893 8 4.048a1.008 1.008 0 0 0 .9 0l8-4.048a1 1 0 0 0-.9-1.785l-7.322 3.706a.506.506 0 0 1-.452 0L4.454.108a1 1 0 0 0-.9 1.785H3.55Z"></path></svg></div> <div class="pt-3 sm:pt-5 lg:pt-0"><h2 class="text-xl font-semibold text-black dark:text-white">Documentation</h2> <p class="mt-4 text-sm/relaxed">Laravel has wonderful documentation covering every aspect of the framework.
                    Whether you are a newcomer or have prior experience with Laravel, we recommend
                    reading our documentation from beginning to end.</p></div></div> <svg class="size-6 shrink-0 stroke-[#FF2D20]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path></svg></div></a> <a href="https://laracasts.com" class="flex items-start gap-4 rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="#FF2D20"><path d="M24 8.25a.5.5 0 0 0-.5-.5H.5a.5.5 0 0 0-.5.5v12a2.5 2.5 0 0 0 2.5 2.5h19a2.5 2.5 0 0 0 2.5-2.5v-12Zm-7.765 5.868a1.221 1.221 0 0 1 0 2.264l-6.626 2.776A1.153 1.153 0 0 1 8 18.123v-5.746a1.151 1.151 0 0 1 1.609-1.035l6.626 2.776ZM19.564 1.677a.25.25 0 0 0-.177-.427H15.6a.106.106 0 0 0-.072.03l-4.54 4.543a.25.25 0 0 0 .177.427h3.783c.027 0 .054-.01.073-.03l4.543-4.543ZM22.071 1.318a.047.047 0 0 0-.045.013l-4.492 4.492a.249.249 0 0 0 .038.385.25.25 0 0 0 .14.042h5.784a.5.5 0 0 0 .5-.5v-2a2.5 2.5 0 0 0-1.925-2.432ZM13.014 1.677a.25.25 0 0 0-.178-.427H9.101a.106.106 0 0 0-.073.03l-4.54 4.543a.25.25 0 0 0 .177.427H8.4a.106.106 0 0 0 .073-.03l4.54-4.543ZM6.513 1.677a.25.25 0 0 0-.177-.427H2.5A2.5 2.5 0 0 0 0 3.75v2a.5.5 0 0 0 .5.5h1.4a.106.106 0 0 0 .073-.03l4.54-4.543Z"></path></g></svg></div> <div class="pt-3 sm:pt-5"><h2 class="text-xl font-semibold text-black dark:text-white">Laracasts</h2> <p class="mt-4 text-sm/relaxed">Laracasts offers thousands of video tutorials on Laravel, PHP, and JavaScript
                development. Check them out, see for yourself, and massively level up your
                development skills in the process.</p></div> <svg class="size-6 shrink-0 self-center stroke-[#FF2D20]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path></svg></a> <a href="https://laravel-news.com" class="flex items-start gap-4 rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="#FF2D20"><path d="M8.75 4.5H5.5c-.69 0-1.25.56-1.25 1.25v4.75c0 .69.56 1.25 1.25 1.25h3.25c.69 0 1.25-.56 1.25-1.25V5.75c0-.69-.56-1.25-1.25-1.25Z"></path><path d="M24 10a3 3 0 0 0-3-3h-2V2.5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2V20a3.5 3.5 0 0 0 3.5 3.5h17A3.5 3.5 0 0 0 24 20V10ZM3.5 21.5A1.5 1.5 0 0 1 2 20V3a.5.5 0 0 1 .5-.5h14a.5.5 0 0 1 .5.5v17c0 .295.037.588.11.874a.5.5 0 0 1-.484.625L3.5 21.5ZM22 20a1.5 1.5 0 1 1-3 0V9.5a.5.5 0 0 1 .5-.5H21a1 1 0 0 1 1 1v10Z"></path><path d="M12.751 6.047h2a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-2A.75.75 0 0 1 12 7.3v-.5a.75.75 0 0 1 .751-.753ZM12.751 10.047h2a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-2A.75.75 0 0 1 12 11.3v-.5a.75.75 0 0 1 .751-.753ZM4.751 14.047h10a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-10A.75.75 0 0 1 4 15.3v-.5a.75.75 0 0 1 .751-.753ZM4.75 18.047h7.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-7.5A.75.75 0 0 1 4 19.3v-.5a.75.75 0 0 1 .75-.753Z"></path></g></svg></div> <div class="pt-3 sm:pt-5"><h2 class="text-xl font-semibold text-black dark:text-white">Laravel News</h2> <p class="mt-4 text-sm/relaxed">Laravel News is a community driven portal and newsletter aggregating all of the
                latest and most important news in the Laravel ecosystem, including new package
                releases and tutorials.</p></div> <svg class="size-6 shrink-0 self-center stroke-[#FF2D20]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path></svg></a> <div class="flex items-start gap-4 rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800"><div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16"><svg class="size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="#FF2D20"><path d="M16.597 12.635a.247.247 0 0 0-.08-.237 2.234 2.234 0 0 1-.769-1.68c.001-.195.03-.39.084-.578a.25.25 0 0 0-.09-.267 8.8 8.8 0 0 0-4.826-1.66.25.25 0 0 0-.268.181 2.5 2.5 0 0 1-2.4 1.824.045.045 0 0 0-.045.037 12.255 12.255 0 0 0-.093 3.86.251.251 0 0 0 .208.214c2.22.366 4.367 1.08 6.362 2.118a.252.252 0 0 0 .32-.079 10.09 10.09 0 0 0 1.597-3.733ZM13.616 17.968a.25.25 0 0 0-.063-.407A19.697 19.697 0 0 0 8.91 15.98a.25.25 0 0 0-.287.325c.151.455.334.898.548 1.328.437.827.981 1.594 1.619 2.28a.249.249 0 0 0 .32.044 29.13 29.13 0 0 0 2.506-1.99ZM6.303 14.105a.25.25 0 0 0 .265-.274 13.048 13.048 0 0 1 .205-4.045.062.062 0 0 0-.022-.07 2.5 2.5 0 0 1-.777-.982.25.25 0 0 0-.271-.149 11 11 0 0 0-5.6 2.815.255.255 0 0 0-.075.163c-.008.135-.02.27-.02.406.002.8.084 1.598.246 2.381a.25.25 0 0 0 .303.193 19.924 19.924 0 0 1 5.746-.438ZM9.228 20.914a.25.25 0 0 0 .1-.393 11.53 11.53 0 0 1-1.5-2.22 12.238 12.238 0 0 1-.91-2.465.248.248 0 0 0-.22-.187 18.876 18.876 0 0 0-5.69.33.249.249 0 0 0-.179.336c.838 2.142 2.272 4 4.132 5.353a.254.254 0 0 0 .15.048c1.41-.01 2.807-.282 4.117-.802ZM18.93 12.957l-.005-.008a.25.25 0 0 0-.268-.082 2.21 2.21 0 0 1-.41.081.25.25 0 0 0-.217.2c-.582 2.66-2.127 5.35-5.75 7.843a.248.248 0 0 0-.09.299.25.25 0 0 0 .065.091 28.703 28.703 0 0 0 2.662 2.12.246.246 0 0 0 .209.037c2.579-.701 4.85-2.242 6.456-4.378a.25.25 0 0 0 .048-.189 13.51 13.51 0 0 0-2.7-6.014ZM5.702 7.058a.254.254 0 0 0 .2-.165A2.488 2.488 0 0 1 7.98 5.245a.093.093 0 0 0 .078-.062 19.734 19.734 0 0 1 3.055-4.74.25.25 0 0 0-.21-.41 12.009 12.009 0 0 0-10.4 8.558.25.25 0 0 0 .373.281 12.912 12.912 0 0 1 4.826-1.814ZM10.773 22.052a.25.25 0 0 0-.28-.046c-.758.356-1.55.635-2.365.833a.25.25 0 0 0-.022.48c1.252.43 2.568.65 3.893.65.1 0 .2 0 .3-.008a.25.25 0 0 0 .147-.444c-.526-.424-1.1-.917-1.673-1.465ZM18.744 8.436a.249.249 0 0 0 .15.228 2.246 2.246 0 0 1 1.352 2.054c0 .337-.08.67-.23.972a.25.25 0 0 0 .042.28l.007.009a15.016 15.016 0 0 1 2.52 4.6.25.25 0 0 0 .37.132.25.25 0 0 0 .096-.114c.623-1.464.944-3.039.945-4.63a12.005 12.005 0 0 0-5.78-10.258.25.25 0 0 0-.373.274c.547 2.109.85 4.274.901 6.453ZM9.61 5.38a.25.25 0 0 0 .08.31c.34.24.616.561.8.935a.25.25 0 0 0 .3.127.631.631 0 0 1 .206-.034c2.054.078 4.036.772 5.69 1.991a.251.251 0 0 0 .267.024c.046-.024.093-.047.141-.067a.25.25 0 0 0 .151-.23A29.98 29.98 0 0 0 15.957.764a.25.25 0 0 0-.16-.164 11.924 11.924 0 0 0-2.21-.518.252.252 0 0 0-.215.076A22.456 22.456 0 0 0 9.61 5.38Z"></path></g></svg></div> <div class="pt-3 sm:pt-5"><h2 class="text-xl font-semibold text-black dark:text-white">Vibrant Ecosystem</h2> <p class="mt-4 text-sm/relaxed">Laravel's robust library of first-party tools and libraries, such as <a href="https://forge.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white dark:focus-visible:ring-[#FF2D20]">Forge</a>, <a href="https://vapor.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Vapor</a>, <a href="https://nova.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Nova</a>, <a href="https://envoyer.io" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Envoyer</a>, and <a href="https://herd.laravel.com" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Herd</a> help you take your projects to the next level. Pair them with powerful open source libraries
                like <a href="https://laravel.com/docs/billing" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Cashier</a>, <a href="https://laravel.com/docs/dusk" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Dusk</a>, <a href="https://laravel.com/docs/broadcasting" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Echo</a>, <a href="https://laravel.com/docs/horizon" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Horizon</a>, <a href="https://laravel.com/docs/sanctum" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Sanctum</a>, <a href="https://laravel.com/docs/telescope" class="rounded-sm underline hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D20] dark:hover:text-white">Telescope</a>, and more.</p></div></div></div></main> <footer class="py-16 text-center text-sm text-black dark:text-white/70">Laravel v${escape_html(laravelVersion)} (PHP v${escape_html(phpVersion)})</footer></div></div></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
function Links($$payload, $$props) {
  push();
  var $$store_subs;
  let { links } = $$props;
  let form = useForm({ title: null, url: null });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Links</title>`;
    });
    {
      let header = function($$payload3) {
        $$payload3.out += `<h2 class="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-200">Links</h2>`;
      };
      AuthenticatedLayout($$payload2, {
        header,
        children: ($$payload3) => {
          $$payload3.out += `<div class="py-12"><div class="mx-auto max-w-7xl sm:px-6 lg:px-8"><div class="overflow-hidden bg-white shadow-sm sm:rounded-lg"><div class="p-6 bg-white dark:text-gray-300 dark:bg-gray-800">`;
          if (!links.length) {
            $$payload3.out += "<!--[-->";
            $$payload3.out += `No links added. Why don't you add one below?`;
          } else {
            $$payload3.out += "<!--[!-->";
            const each_array = ensure_array_like(links);
            $$payload3.out += `<!--[-->`;
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let link = each_array[$$index];
              $$payload3.out += `<li><a${attr("href", link.url)} target="_blank">${escape_html(link.title)}</a> <button class="inline-flex items-center px-3 py-2 mt-4 ml-3 text-sm font-medium leading-4 text-white dark:text-gray-100 bg-red-400 border border-transparent rounded-md shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700">Delete Link</button></li>`;
            }
            $$payload3.out += `<!--]-->`;
          }
          $$payload3.out += `<!--]--> <form><div class="mt-8"><div>`;
          InputLabel($$payload3, { for: "title", value: "Title" });
          $$payload3.out += `<!----> `;
          TextInput($$payload3, {
            id: "title",
            type: "text",
            class: "mt-1 block w-full lg:w-1/2",
            required: true,
            autocomplete: "title",
            get value() {
              return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).title;
            },
            set value($$value) {
              store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).title = $$value);
              $$settled = false;
            }
          });
          $$payload3.out += `<!----> `;
          InputError($$payload3, {
            class: "mt-2",
            message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.title
          });
          $$payload3.out += `<!----></div> <div class="mt-4">`;
          InputLabel($$payload3, { for: "url", value: "URL" });
          $$payload3.out += `<!----> <div class="flex w-full lg:w-1/2 mt-1 rounded-md shadow-sm"><span class="inline-flex items-center px-3 dark:text-gray-300 dark:bg-gray-900 rounded-l-md sm:text-sm">https://</span> `;
          TextInput($$payload3, {
            id: "url",
            type: "text",
            class: "flex-1 block min-w-0 px-3 py-2 border-gray-300 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
            required: true,
            autocomplete: "url",
            get value() {
              return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).url;
            },
            set value($$value) {
              store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).url = $$value);
              $$settled = false;
            }
          });
          $$payload3.out += `<!----></div> `;
          InputError($$payload3, {
            class: "mt-2",
            message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.url
          });
          $$payload3.out += `<!----></div> <button${attr("disabled", store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing, true)} type="submit" class="inline-flex items-center px-3 py-2 mt-4 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Submit</button></div></form></div></div></div></div>`;
        },
        $$slots: { header: true, default: true }
      });
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Links
}, Symbol.toStringTag, { value: "Module" }));
function DangerButton($$payload, $$props) {
  push();
  let {
    children,
    class: className,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  $$payload.out += `<button${spread_attributes({
    class: `inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 dark:focus:ring-offset-gray-800 ${stringify(className)}`,
    ...attrs
  })}>`;
  children == null ? void 0 : children($$payload);
  $$payload.out += `<!----></button>`;
  pop();
}
function Portal($$payload, $$props) {
  push();
  let target = fallback($$props["target"], "body");
  $$payload.out += `<div hidden><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div>`;
  bind_props($$props, { target });
  pop();
}
const key = {};
function classes(classes2) {
  return classes2 ? classes2.split(" ").filter((x) => x) : [];
}
function Transition($$payload, $$props) {
  push();
  let show = fallback($$props["show"], null);
  let appear = fallback($$props["appear"], false);
  let unmount = fallback($$props["unmount"], false);
  let enter = fallback($$props["enter"], "");
  let enterFrom = fallback($$props["enterFrom"], "");
  let enterTo = fallback($$props["enterTo"], "");
  let leave = fallback($$props["leave"], null);
  let leaveFrom = fallback($$props["leaveFrom"], null);
  let leaveTo = fallback($$props["leaveTo"], null);
  const parent = show === null ? getContext(key) : null;
  const { subscribe: subscribe2, set: set2 } = writable(show);
  const context = {
    appear: parent ? parent.appear : appear,
    count: 0,
    show: { subscribe: subscribe2 },
    completed: () => {
    }
  };
  setContext(key, context);
  let display = show && !context.appear ? "contents" : "none";
  let mounted = !unmount || show === true;
  classes(enter);
  classes(enterFrom);
  classes(enterTo);
  classes(leave === null ? enter : leave);
  classes(leaveFrom === null ? enterTo : leaveFrom);
  classes(leaveTo === null ? enterFrom : leaveTo);
  $$payload.out += `<div${add_styles({ display })}>`;
  if (mounted) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<!---->`;
    slot($$payload, $$props, "default", {});
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, {
    show,
    appear,
    unmount,
    enter,
    enterFrom,
    enterTo,
    leave,
    leaveFrom,
    leaveTo
  });
  pop();
}
function Modal($$payload, $$props) {
  push();
  let {
    children,
    closeable = true,
    maxWidth = "2xl",
    onclose = () => {
    },
    show = false
  } = $$props;
  let maxWidthClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl"
  }[maxWidth];
  onDestroy(() => document.body.style.overflow = "visible");
  Portal($$payload, {
    target: "body",
    children: ($$payload2) => {
      Transition($$payload2, {
        show,
        leave: "duration-200",
        children: ($$payload3) => {
          $$payload3.out += `<div class="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0">`;
          Transition($$payload3, {
            enter: "ease-out duration-300",
            enterFrom: "opacity-0",
            enterTo: "opacity-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100",
            leaveTo: "opacity-0",
            children: ($$payload4) => {
              $$payload4.out += `<div class="fixed inset-0 transform transition-all"><div class="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900"></div></div>`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!----> `;
          Transition($$payload3, {
            enter: "ease-out duration-300",
            enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            enterTo: "opacity-100 translate-y-0 sm:scale-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
            leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            children: ($$payload4) => {
              $$payload4.out += `<div${attr("class", `mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full dark:bg-gray-800 ${stringify(maxWidthClass)}`)}>`;
              children == null ? void 0 : children($$payload4);
              $$payload4.out += `<!----></div>`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!----></div>`;
        },
        $$slots: { default: true }
      });
    },
    $$slots: { default: true }
  });
  pop();
}
function SecondaryButton($$payload, $$props) {
  push();
  let {
    type,
    children,
    $$slots,
    $$events,
    ...attrs
  } = $$props;
  $$payload.out += `<button${spread_attributes({
    ...attrs,
    type,
    class: "inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
  })}>`;
  children == null ? void 0 : children($$payload);
  $$payload.out += `<!----></button>`;
  pop();
}
function DeleteUserForm($$payload, $$props) {
  push();
  var $$store_subs;
  let confirmingUserDeletion = false;
  let passwordInput = void 0;
  let form = useForm({ password: "" });
  async function confirmUserDeletion() {
    confirmingUserDeletion = true;
    await tick();
    passwordInput.focus();
  }
  function deleteUser() {
    store_get($$store_subs ?? ($$store_subs = {}), "$form", form).delete("/profile", {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordInput.focus(),
      onFinish: () => store_get($$store_subs ?? ($$store_subs = {}), "$form", form).reset()
    });
  }
  function closeModal() {
    confirmingUserDeletion = false;
    store_get($$store_subs ?? ($$store_subs = {}), "$form", form).clearErrors();
    store_get($$store_subs ?? ($$store_subs = {}), "$form", form).reset();
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<section class="space-y-6"><header><h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Delete Account</h2> <p class="lg:w-1/2 text-justify tracking-tight mt-1 text-sm text-gray-600 dark:text-gray-400">Once your account is deleted, all of its resources and data will be permanently deleted.
      Before deleting your account, please download any data or information that you wish to retain.</p></header> `;
    DangerButton($$payload2, {
      onclick: confirmUserDeletion,
      children: ($$payload3) => {
        $$payload3.out += `<!---->Delete Account`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> `;
    Modal($$payload2, {
      show: confirmingUserDeletion,
      onclose: closeModal,
      children: ($$payload3) => {
        $$payload3.out += `<div class="p-6"><h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Are you sure you want to delete your account?</h2> <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Once your account is deleted, all of its resources and data will be permanently deleted.
        Please enter your password to confirm you would like to permanently delete your account.</p> <div class="mt-6">`;
        InputLabel($$payload3, {
          for: "password",
          value: "Password",
          class: "sr-only"
        });
        $$payload3.out += `<!----> `;
        TextInput($$payload3, {
          type: "password",
          class: "mt-1 block w-3/4",
          placeholder: "Password",
          onkeyup: deleteUser,
          get value() {
            return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password;
          },
          set value($$value) {
            store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password = $$value);
            $$settled = false;
          }
        });
        $$payload3.out += `<!----> `;
        InputError($$payload3, {
          message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password,
          class: "mt-2"
        });
        $$payload3.out += `<!----></div> <div class="mt-6 flex justify-end">`;
        SecondaryButton($$payload3, {
          onclick: closeModal,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Cancel`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> `;
        DangerButton($$payload3, {
          class: `ms-3 ${store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing && "opacity-25"}`,
          disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
          onclick: deleteUser,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Delete Account`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----></div></div>`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----></section>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function UpdatePasswordForm($$payload, $$props) {
  push();
  var $$store_subs;
  let form = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<section><header><h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Update Password</h2> <p class="text-justify tracking-tight mt-1 text-sm text-gray-600 dark:text-gray-400">Ensure your account is using a long, random password to stay secure.</p></header> <form class="mt-6 space-y-6"><div>`;
    InputLabel($$payload2, {
      for: "current_password",
      value: "Current Password"
    });
    $$payload2.out += `<!----> `;
    TextInput($$payload2, {
      id: "current_password",
      type: "password",
      class: "mt-1 block w-full lg:w-1/2",
      autocomplete: "current-password",
      get value() {
        return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).current_password;
      },
      set value($$value) {
        store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).current_password = $$value);
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    InputError($$payload2, {
      message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.current_password,
      class: "mt-2"
    });
    $$payload2.out += `<!----></div> <div>`;
    InputLabel($$payload2, { for: "password", value: "New Password" });
    $$payload2.out += `<!----> `;
    TextInput($$payload2, {
      id: "password",
      type: "password",
      class: "mt-1 block w-full lg:w-1/2",
      autocomplete: "new-password",
      get value() {
        return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password;
      },
      set value($$value) {
        store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password = $$value);
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    InputError($$payload2, {
      message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password,
      class: "mt-2"
    });
    $$payload2.out += `<!----></div> <div>`;
    InputLabel($$payload2, {
      for: "password_confirmation",
      value: "Confirm Password"
    });
    $$payload2.out += `<!----> `;
    TextInput($$payload2, {
      id: "password_confirmation",
      type: "password",
      class: "mt-1 block w-full lg:w-1/2",
      autocomplete: "new-password",
      get value() {
        return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password_confirmation;
      },
      set value($$value) {
        store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).password_confirmation = $$value);
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    InputError($$payload2, {
      message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.password_confirmation,
      class: "mt-2"
    });
    $$payload2.out += `<!----></div> <div class="flex items-center gap-4">`;
    PrimaryButton($$payload2, {
      disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
      children: ($$payload3) => {
        $$payload3.out += `<!---->Save`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> `;
    if (store_get($$store_subs ?? ($$store_subs = {}), "$form", form).recentlySuccessful) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<p class="text-sm text-gray-600 dark:text-gray-400">Saved.</p>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div></form></section>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function UpdateProfileInformationForm($$payload, $$props) {
  push();
  var $$store_subs;
  let { mustVerifyEmail, status } = $$props;
  const user = store_get($$store_subs ?? ($$store_subs = {}), "$page", page).props.auth.user;
  let form = useForm({ name: user.name, email: user.email });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<section><header><h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h2> <p class="text-justify mt-1 text-sm text-gray-600 dark:text-gray-400">Update your account's profile information and email address.</p></header> <form class="mt-6 space-y-6"><div>`;
    InputLabel($$payload2, { for: "name", value: "Name" });
    $$payload2.out += `<!----> `;
    TextInput($$payload2, {
      id: "name",
      type: "text",
      class: "mt-1 block w-full lg:w-1/2",
      required: true,
      autocomplete: "name",
      get value() {
        return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).name;
      },
      set value($$value) {
        store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).name = $$value);
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    InputError($$payload2, {
      class: "mt-2",
      message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.name
    });
    $$payload2.out += `<!----></div> <div>`;
    InputLabel($$payload2, { for: "email", value: "Email" });
    $$payload2.out += `<!----> `;
    TextInput($$payload2, {
      id: "email",
      type: "email",
      class: "mt-1 block w-full lg:w-1/2",
      required: true,
      autocomplete: "username",
      get value() {
        return store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email;
      },
      set value($$value) {
        store_mutate($$store_subs ?? ($$store_subs = {}), "$form", form, store_get($$store_subs ?? ($$store_subs = {}), "$form", form).email = $$value);
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    InputError($$payload2, {
      class: "mt-2",
      message: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).errors.email
    });
    $$payload2.out += `<!----></div> `;
    if (mustVerifyEmail && user.email_verified_at === null) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<p class="mt-2 text-sm text-gray-800 dark:text-gray-200">Your email address is unverified. `;
      Link($$payload2, {
        href: "email/verification-notification",
        method: "post",
        as: "button",
        class: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800",
        children: ($$payload3) => {
          $$payload3.out += `<!---->Click here to re-send the verification email.`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----></p> `;
      if (status === "verification-link-sent") {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<div class="mt-2 text-sm font-medium text-green-600 dark:text-green-400">A new verification link has been sent to your email address.</div>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--> <div class="flex items-center gap-4">`;
    PrimaryButton($$payload2, {
      disabled: store_get($$store_subs ?? ($$store_subs = {}), "$form", form).processing,
      children: ($$payload3) => {
        $$payload3.out += `<!---->Save`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> `;
    if (store_get($$store_subs ?? ($$store_subs = {}), "$form", form).recentlySuccessful) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<p class="text-sm text-gray-600 dark:text-gray-400">Saved.</p>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div></form></section>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Profile($$payload, $$props) {
  let { mustVerifyEmail, status } = $$props;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Profile</title>`;
  });
  {
    let header = function($$payload2) {
      $$payload2.out += `<h2 class="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Profile</h2>`;
    };
    AuthenticatedLayout($$payload, {
      header,
      children: ($$payload2) => {
        $$payload2.out += `<div class="py-12"><div class="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8"><div class="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">`;
        UpdateProfileInformationForm($$payload2, { mustVerifyEmail, status, class: "max-w-xl" });
        $$payload2.out += `<!----></div> <div class="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">`;
        UpdatePasswordForm($$payload2);
        $$payload2.out += `<!----></div> <div class="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">`;
        DeleteUserForm($$payload2);
        $$payload2.out += `<!----></div></div></div>`;
      },
      $$slots: { header: true, default: true }
    });
  }
}
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Profile
}, Symbol.toStringTag, { value: "Module" }));
createServer(
  (page2) => createInertiaApp({
    page: page2,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/About.svelte": __vite_glob_0_0, "./Pages/Admin/Auth/Login.svelte": __vite_glob_0_1, "./Pages/Admin/Dashboard.svelte": __vite_glob_0_2, "./Pages/Admin/Home.svelte": __vite_glob_0_3, "./Pages/Auth/ConfirmPassword.svelte": __vite_glob_0_4, "./Pages/Auth/ForgotPassword.svelte": __vite_glob_0_5, "./Pages/Auth/Login.svelte": __vite_glob_0_6, "./Pages/Auth/Register.svelte": __vite_glob_0_7, "./Pages/Auth/ResetPassword.svelte": __vite_glob_0_8, "./Pages/Auth/VerifyEmail.svelte": __vite_glob_0_9, "./Pages/Dashboard.svelte": __vite_glob_0_10, "./Pages/Home.svelte": __vite_glob_0_11, "./Pages/Links.svelte": __vite_glob_0_12, "./Pages/Profile.svelte": __vite_glob_0_13 });
      return pages[`./Pages/${name}.svelte`];
    },
    setup({ App: App2, props }) {
      return render(App2, { props });
    }
  })
);
