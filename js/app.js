// js/app.js
//
// - Purpose:
//   Application entry point
//
// - Responsibilities:
//   - Initialize storage (seed if needed)
//   - Load songs into in-memory state
//   - Render the current view (list / form / stats)
//   - Handle user actions (play / edit / delete)
//   - Handle navigation (list / add / stats)
//   - Handle form submit (create / update) and show validation errors
//
// - Notes:
//   UI files render DOM, services update data, and app.js connects them

import { storage_service } from './services/storage_service.js';
import { stats_service } from './services/stats_service.js';
import { song_service } from './services/song_service.js';

import { render_navigation } from './ui/render_navigation.js';
import { render_list_view } from './ui/render_list.js';
import { render_form_view } from './ui/render_form.js';
import { render_stats_view } from './ui/render_stats.js';


// - State: application_state
// - Purpose:
//   Single source of truth for UI rendering
const application_state = {
  songs: [],
  statistics: null,

  current_view: 'list', // 'list' | 'form' | 'stats'

  // - Form state:
  //   - mode controls add vs edit behavior
  //   - initial_values prefill the form
  //   - validation_errors shows per-field messages
  form_mode: 'add', // 'add' | 'edit'
  form_initial_values: {},
  form_validation_errors: {}
};


// - Function: load_initial_state
// - Purpose:
//   Load persisted songs and compute derived statistics
function load_initial_state() {
  storage_service.init();

  application_state.songs = storage_service.load_songs();
  application_state.statistics = stats_service.get_song_statistics(application_state.songs);
}


// - Function: refresh_statistics
// - Purpose:
//   Recompute derived statistics after data changes
function refresh_statistics() {
  application_state.statistics = stats_service.get_song_statistics(application_state.songs);
}


// - Function: render_current_view
// - Purpose:
//   Render ONLY the view area (below the navigation)
function render_current_view() {
  if (application_state.current_view === 'list') {
    return render_list_view(application_state.songs);
  }

  if (application_state.current_view === 'form') {
    return render_form_view({
      mode: application_state.form_mode,
      initial_values: application_state.form_initial_values,
      validation_errors: application_state.form_validation_errors
    });
  }

  if (application_state.current_view === 'stats') {
    return render_stats_view(application_state.statistics);
  }

  const fallback = document.createElement('p');
  fallback.textContent = 'unknown view';
  return fallback;
}


// - Function: render_application
// - Purpose:
//   Render navigation + current view into #app_root
function render_application() {
  const root_element = document.getElementById('app_root');

  if (!root_element) {
    console.error('missing #app_root in index.html (expected: <div id="app_root"></div>)');
    return;
  }

  root_element.innerHTML = '';

  root_element.appendChild(render_navigation(application_state.current_view));
  root_element.appendChild(render_current_view());
}


// - Function: set_view
// - Purpose:
//   Change current view and re-render
function set_view(next_view) {
  application_state.current_view = next_view;
  render_application();
}


// - Function: open_add_form
// - Purpose:
//   Prepare state for adding a new song
function open_add_form() {
  application_state.form_mode = 'add';
  application_state.form_initial_values = {};
  application_state.form_validation_errors = {};
  set_view('form');
}


// - Function: open_edit_form
// - Purpose:
//   Prepare state for editing an existing song
function open_edit_form(song_id) {
  const result = song_service.get_song_by_id(song_id);

  if (!result.ok) {
    window.alert('could not load song for editing');
    return;
  }

  application_state.form_mode = 'edit';
  application_state.form_initial_values = result.value;
  application_state.form_validation_errors = {};
  set_view('form');
}


// - Function: handle_navigation_click
// - Purpose:
//   Handle clicks on navigation buttons (data-view)
function handle_navigation_click(event) {
  const button = event.target.closest('button[data-view]');
  if (!button) return;

  const next_view = button.dataset.view;
  if (!next_view) return;

  if (next_view === 'form') {
    open_add_form();
    return;
  }

  set_view(next_view);
}


// - Function: handle_list_action_click
// - Purpose:
//   Handle list action buttons (data-action + data-song_id)
function handle_list_action_click(event) {
  const button = event.target.closest('button[data-action][data-song_id]');
  if (!button) return;

  const action = button.dataset.action;
  const song_id = button.dataset.song_id;

  if (action === 'play') {
    const result = song_service.increment_play_count(song_id);

    if (result.ok) {
      application_state.songs = result.all_songs;
      refresh_statistics();
      render_application();
    }
    return;
  }

  if (action === 'edit') {
    open_edit_form(song_id);
    return;
  }

  if (action === 'delete') {
    const user_confirmed = window.confirm('delete this song? this cannot be undone.');
    if (!user_confirmed) return;

    const result = song_service.delete_song(song_id);

    if (result.ok) {
      application_state.songs = result.all_songs;
      refresh_statistics();
      render_application();
    }
    return;
  }
}


// - Function: extract_song_input_from_form
// - Purpose:
//   Convert the form fields into a raw input object for song_service
function extract_song_input_from_form(form_element) {
  const form_data = new FormData(form_element);

  return {
    title: form_data.get('title'),
    artist: form_data.get('artist'),
    album: form_data.get('album'),
    playlist: form_data.get('playlist'),
    genre: form_data.get('genre'),
    duration_seconds: form_data.get('duration_seconds'),
    rating: form_data.get('rating')
  };
}


// - Function: handle_form_submit
// - Purpose:
//   Handle the add/edit form submit event (create or update)
function handle_form_submit(event) {
  const form_element = event.target.closest('form[data-form="song"]');
  if (!form_element) return;

  event.preventDefault();

  const raw_input = extract_song_input_from_form(form_element);
  const song_id = form_element.querySelector('input[name="song_id"]')?.value || '';

  let result;

  if (application_state.form_mode === 'edit') {
    result = song_service.update_song(song_id, raw_input);
  } else {
    result = song_service.create_song(raw_input);
  }

  // - If validation fails:
  //   stay on the form and show field errors
  if (!result.ok && result.errors) {
    application_state.form_validation_errors = result.errors;

    // keep what the user typed so the form does not reset
    application_state.form_initial_values = {
      ...application_state.form_initial_values,
      ...raw_input,
      id: song_id
    };

    render_application();
    return;
  }

  // - If another failure happens:
  //   show a simple message
  if (!result.ok) {
    window.alert(result.message || 'something went wrong');
    return;
  }

  // - Success:
  //   update app data, refresh stats, return to list view
  application_state.songs = result.all_songs;
  refresh_statistics();

  application_state.form_validation_errors = {};
  application_state.form_initial_values = {};

  set_view('list');
}


// - Function: handle_document_click
// - Purpose:
//   Central click handler (event delegation)
function handle_document_click(event) {
  handle_navigation_click(event);
  handle_list_action_click(event);
}


// - Function: handle_document_submit
// - Purpose:
//   Central submit handler (event delegation)
function handle_document_submit(event) {
  handle_form_submit(event);
}


// - Function: main
// - Purpose:
//   Bootstrap the app: load -> render -> attach event handlers
function main() {
  load_initial_state();
  render_application();

  document.addEventListener('click', handle_document_click);
  document.addEventListener('submit', handle_document_submit);
}

main();