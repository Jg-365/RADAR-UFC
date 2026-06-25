export const qs = (selector, root = document) => root.querySelector(selector);

export const qsa = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

export const on = (target, type, handler, options) =>
  target.addEventListener(type, handler, options);

export const clear = (node) => {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
};

export const mount = (parent, child) => {
  clear(parent);
  parent.append(child);
  return parent;
};

export const el = (tag, options = {}, children = []) => {
  const node = document.createElement(tag);
  const { className, text, html, attrs, dataset, on: events } = options;

  if (className) node.className = className;
  if (text != null) node.textContent = text;
  if (html != null) node.innerHTML = html;

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === false || value == null) continue;
      node.setAttribute(key, value === true ? "" : value);
    }
  }

  if (dataset) {
    for (const [key, value] of Object.entries(dataset)) {
      if (value == null) continue;
      node.dataset[key] = value;
    }
  }

  if (events) {
    for (const [type, handler] of Object.entries(events)) {
      node.addEventListener(type, handler);
    }
  }

  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }

  return node;
};

export const fragment = (children = []) => {
  const frag = document.createDocumentFragment();
  for (const child of children) {
    if (child == null) continue;
    frag.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return frag;
};
