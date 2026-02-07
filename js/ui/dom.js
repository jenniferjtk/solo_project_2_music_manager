// js/ui/dom.js
//
// - Purpose:
//   Small DOM helper utilities to keep UI rendering readable and consistent
//
// - Why this file exists:
//   - Reduce repetitive document.createElement code
//   - Make render files easier to scan and reason about
//   - Use only built-in browser DOM APIs; avoid third-party frameworks or helper libraries
//
// - Rules:
//   - Generic utilities only
//   - No knowledge of songs, state, or services
//   - No access to localStorage or business logic


// - Function: query_one
// - Purpose:
//   Return the first element matching a selector
//
// - Parameters:
//   selector -> CSS selector string
//   root     -> optional root element (defaults to document)
//
// - Returns:
//   Element or null
export function query_one(selector, root = document) {
  return root.querySelector(selector);
}


// - Function: query_all
// - Purpose:
//   Return all elements matching a selector as an array
//
// - Parameters:
//   selector -> CSS selector string
//   root     -> optional root element (defaults to document)
//
// - Returns:
//   Array of Elements
export function query_all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}


// - Function: create_element
// - Purpose:
//   Create a DOM element with attributes and children in a single call
//
// - Supported attributes:
//   - class        -> sets element.className
//   - dataset      -> object mapped to element.dataset
//   - onClick      -> event listener (onInput, onSubmit, etc. also work)
//   - any other key is treated as a normal HTML attribute
//
// - Parameters:
//   tag_name  -> HTML tag name (div, button, table, etc.)
//   attributes-> object of attributes and event handlers
//   children  -> string, element, or array of either
//
// - Returns:
//   Newly created DOM element
export function create_element(tag_name, attributes = {}, children = []) {
  const element = document.createElement(tag_name);

  for (const [attribute_name, attribute_value] of Object.entries(attributes)) {
    if (attribute_name === 'class') {
      element.className = String(attribute_value);
      continue;
    }
// dataset is a special case that maps an object to element.dataset
    if (attribute_name === 'dataset' && typeof attribute_value === 'object') {
      for (const [data_key, data_value] of Object.entries(attribute_value)) {
        element.dataset[data_key] = String(data_value);
      }
      continue;
    }
// Event handlers are attributes that start with "on" and have a function value
    if (attribute_name.startsWith('on') && typeof attribute_value === 'function') {
      const event_name = attribute_name.slice(2).toLowerCase();
      element.addEventListener(event_name, attribute_value);
      continue;
    }
// For boolean attributes, set the attribute name with an empty value if true, and skip if false or null
    if (attribute_value === true) {
      element.setAttribute(attribute_name, '');
      continue;
    }

    if (attribute_value === false || attribute_value == null) {
      continue;
    }

    element.setAttribute(attribute_name, String(attribute_value));
  }

  const child_list = Array.isArray(children) ? children : [children];
// Append children, converting strings and numbers to text nodes
  for (const child of child_list) {
    if (child == null) continue;
// If child is a string or number, create a text node and append it; otherwise, append the child element directly
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else {
      element.appendChild(child);
    }
  }

  return element;
}


// - Function: clear_element
// - Purpose:
//   Remove all child nodes from an element
//
// - Parameters:
//   element -> DOM element to clear
export function clear_element(element) {
  element.innerHTML = '';
}
