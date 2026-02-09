// js/ui/render_navigation.js
//
// - Purpose:
//   Render the top navigation bar (list / add / stats)
//
// - Responsibilities:
//   - Display navigation buttons
//   - Highlight the active view
//
// - Rules:
//   - No service calls
//   - No state mutation
//   - Rendering only
//
// - How it works:
//   - app.js will attach one click handler for buttons with data-view
//   - this renderer only outputs markup

import { create_element } from './dom.js';


// - Function: render_navigation
// - Purpose:
//   Create the navigation bar
//
// - Parameters:
//   current_view -> string ('list' | 'form' | 'stats')
//
// - Returns:
//   DOM element
export function render_navigation(current_view) {
  function nav_button(label, view_name) {
    const is_active = current_view === view_name;

    return create_element(
      'button',
      {
        type: 'button',
        class: is_active ? 'nav_button nav_button_active' : 'nav_button',
        dataset: { view: view_name }
      },
      [label]
    );
  }

  return create_element('div', { class: 'nav_bar' }, [
    create_element('div', { class: 'nav_brand' }, ['music manager']),
    create_element('div', { class: 'nav_actions' }, [
      nav_button('list', 'list'),
      nav_button('add', 'form'),
      nav_button('stats', 'stats')
    ])
  ]);
}