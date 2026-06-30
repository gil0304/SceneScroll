export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  const {
    className,
    text,
    html,
    attrs,
    dataset,
    style,
    children
  } = options;

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = text;
  }

  if (html !== undefined && html !== null) {
    element.innerHTML = html;
  }

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value === undefined || value === null) {
        return;
      }

      if (value === true) {
        element.setAttribute(key, "");
        return;
      }

      element.setAttribute(key, String(value));
    });
  }

  if (dataset) {
    Object.entries(dataset).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        element.dataset[key] = String(value);
      }
    });
  }

  if (style) {
    Object.assign(element.style, style);
  }

  if (children) {
    children.filter(Boolean).forEach((child) => element.appendChild(child));
  }

  return element;
}
