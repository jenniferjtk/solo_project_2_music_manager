// js/app.js

import { stats_service } from './services/stats_service.js';
import { song_service }  from './services/song_service.js';

import { render_navigation } from './ui/render_navigation.js';
import { render_list_view }  from './ui/render_list.js';
import { render_form_view }  from './ui/render_form.js';
import { render_stats_view } from './ui/render_stats.js';

// ── constants ─────────────────────────────────────────────────────────────────

const COOKIE_NAME      = 'music_manager_page_size';
const VALID_PAGE_SIZES = [5, 10, 20, 50];

// ── cookie helpers ────────────────────────────────────────────────────────────

function read_cookie(name) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function write_cookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function read_saved_page_size() {
  const saved = parseInt(read_cookie(COOKIE_NAME), 10);
  return VALID_PAGE_SIZES.includes(saved) ? saved : 10;
}

// ── application state ─────────────────────────────────────────────────────────

const application_state = {
  songs:      [],
  statistics: null,

  current_view: 'list', // 'list' | 'form' | 'stats'

  // search + sort (client-side)
  search_query: '',
  sort_field:   'created_at',
  sort_dir:     'desc',

  // pagination — page_size is restored from cookie in load_initial_state
  page_size:    10,
  current_page: 1,

  // form
  form_mode:              'add', // 'add' | 'edit'
  form_initial_values:    {},
  form_validation_errors: {}
};

// ── derived data ──────────────────────────────────────────────────────────────

function refresh_statistics() {
  application_state.statistics = stats_service.get_song_statistics(application_state.songs);
}

function get_filtered_sorted_songs() {
  let songs = [...application_state.songs];

  // filter: case-insensitive match across title / artist / album / genre
  const q = application_state.search_query.trim().toLowerCase();
  if (q) {
    songs = songs.filter(
      (song) =>
        (song.title  || '').toLowerCase().includes(q) ||
        (song.artist || '').toLowerCase().includes(q) ||
        (song.album  || '').toLowerCase().includes(q) ||
        (song.genre  || '').toLowerCase().includes(q)
    );
  }

  // sort
  const field = application_state.sort_field;
  const dir   = application_state.sort_dir === 'asc' ? 1 : -1;

  songs.sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (typeof av === 'string' && typeof bv === 'string') {
      return dir * av.localeCompare(bv, undefined, { sensitivity: 'base' });
    }
    return dir * ((av ?? 0) - (bv ?? 0));
  });

  return songs;
}

function get_total_pages() {
  const total = get_filtered_sorted_songs().length;
  return Math.max(1, Math.ceil(total / application_state.page_size));
}

function clamp_current_page() {
  const total_pages = get_total_pages();
  if (application_state.current_page > total_pages) application_state.current_page = total_pages;
  if (application_state.current_page < 1)           application_state.current_page = 1;
}

// ── rendering ─────────────────────────────────────────────────────────────────

function render_current_view() {
  if (application_state.current_view === 'list') {
    clamp_current_page();

    const filtered   = get_filtered_sorted_songs();
    const { page_size, current_page, sort_field, sort_dir, search_query } = application_state;

    const start      = (current_page - 1) * page_size;
    const page_songs = filtered.slice(start, start + page_size);

    const pagination = {
      current_page,
      page_size,
      total_records: filtered.length,
      total_pages:   Math.max(1, Math.ceil(filtered.length / page_size))
    };

    const controls = { search_query, sort_field, sort_dir };

    return render_list_view(page_songs, pagination, controls);
  }

  if (application_state.current_view === 'form') {
    return render_form_view({
      mode:              application_state.form_mode,
      initial_values:    application_state.form_initial_values,
      validation_errors: application_state.form_validation_errors
    });
  }

  if (application_state.current_view === 'stats') {
    return render_stats_view(application_state.statistics, application_state.page_size);
  }

  const fallback = document.createElement('p');
  fallback.textContent = 'unknown view';
  return fallback;
}

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

// ── view helpers ──────────────────────────────────────────────────────────────

function set_view(next_view) {
  application_state.current_view = next_view;
  render_application();
}

function open_add_form() {
  application_state.form_mode             = 'add';
  application_state.form_initial_values   = {};
  application_state.form_validation_errors = {};
  set_view('form');
}

function open_edit_form(song_id) {
  const existing = application_state.songs.find((s) => s.id === song_id) || null;

  if (!existing) {
    window.alert('could not load song for editing');
    return;
  }

  application_state.form_mode              = 'edit';
  application_state.form_initial_values    = existing;
  application_state.form_validation_errors = {};
  set_view('form');
}

// ── event handlers ────────────────────────────────────────────────────────────

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

function handle_sort_click(event) {
  const button = event.target.closest('button[data-sort_field]');
  if (!button) return;

  const field = button.dataset.sort_field;

  if (application_state.sort_field === field) {
    // same column — toggle direction
    application_state.sort_dir = application_state.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    // new column — sort ascending
    application_state.sort_field = field;
    application_state.sort_dir   = 'asc';
  }

  application_state.current_page = 1;
  render_application();
}

function handle_pagination_click(event) {
  const button = event.target.closest('button[data-pagination]');
  if (!button) return;

  const action = button.dataset.pagination;

  if (action === 'prev') {
    application_state.current_page -= 1;
    clamp_current_page();
    render_application();
    return;
  }

  if (action === 'next') {
    application_state.current_page += 1;
    clamp_current_page();
    render_application();
    return;
  }
}

async function handle_list_action_click(event) {
  const button = event.target.closest('button[data-action][data-song_id]');
  if (!button) return;

  const action  = button.dataset.action;
  const song_id = button.dataset.song_id;

  if (action === 'play') {
    const result = await song_service.increment_play_count(song_id, application_state.songs);

    if (result.ok) {
      application_state.songs = result.all_songs;
      refresh_statistics();
      render_application();
    } else {
      window.alert(result.message || 'could not update play count');
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

    const result = await song_service.delete_song(song_id);

    if (result.ok) {
      application_state.songs = result.all_songs;
      refresh_statistics();
      clamp_current_page();
      render_application();
    } else {
      window.alert(result.message || 'could not delete song');
    }
    return;
  }
}

function extract_song_input_from_form(form_element) {
  const form_data = new FormData(form_element);

  return {
    title:            form_data.get('title'),
    artist:           form_data.get('artist'),
    album:            form_data.get('album'),
    playlist:         form_data.get('playlist'),
    genre:            form_data.get('genre'),
    duration_seconds: form_data.get('duration_seconds'),
    rating:           form_data.get('rating'),
    image_url:        form_data.get('image_url')
  };
}

async function handle_form_submit(event) {
  const form_element = event.target.closest('form[data-form="song"]');
  if (!form_element) return;

  event.preventDefault();

  const raw_input = extract_song_input_from_form(form_element);
  const song_id   = form_element.querySelector('input[name="song_id"]')?.value || '';

  let result;

  if (application_state.form_mode === 'edit') {
    result = await song_service.update_song(song_id, raw_input, application_state.songs);
  } else {
    result = await song_service.create_song(raw_input);
  }

  if (!result.ok && result.errors) {
    application_state.form_validation_errors = result.errors;

    application_state.form_initial_values = {
      ...application_state.form_initial_values,
      ...raw_input,
      id: song_id
    };

    render_application();
    return;
  }

  if (!result.ok) {
    window.alert(result.message || 'something went wrong');
    return;
  }

  application_state.songs = result.all_songs;
  refresh_statistics();

  // on add: go to page 1 so the newly created song (newest first) is visible
  application_state.current_page = 1;

  application_state.form_validation_errors = {};
  application_state.form_initial_values    = {};

  set_view('list');
}

function handle_search_input(event) {
  const input = event.target.closest('input[data-search="query"]');
  if (!input) return;

  application_state.search_query = input.value;
  application_state.current_page = 1;
  render_application();

  // restore focus + cursor to search input after full DOM re-render
  const new_input = document.querySelector('input[data-search="query"]');
  if (new_input) {
    const len = new_input.value.length;
    new_input.focus();
    new_input.setSelectionRange(len, len);
  }
}

function handle_page_size_change(event) {
  const select = event.target.closest('select[data-page_size_select]');
  if (!select) return;

  const new_size = parseInt(select.value, 10);
  if (!VALID_PAGE_SIZES.includes(new_size)) return;

  application_state.page_size    = new_size;
  application_state.current_page = 1;
  write_cookie(COOKIE_NAME, new_size);
  render_application();
}

// ── document-level event dispatch ─────────────────────────────────────────────

function handle_document_click(event) {
  handle_navigation_click(event);
  handle_sort_click(event);
  handle_pagination_click(event);
  handle_list_action_click(event);
}

function handle_document_submit(event) {
  handle_form_submit(event);
}

function handle_document_input(event) {
  handle_search_input(event);
}

function handle_document_change(event) {
  handle_page_size_change(event);
}

// ── initialization ────────────────────────────────────────────────────────────

async function load_initial_state() {
  // restore page size from cookie before first render
  application_state.page_size = read_saved_page_size();

  const result = await song_service.get_all_songs();

  if (!result.ok) {
    window.alert(result.message || 'could not load songs from backend');
    application_state.songs = [];
  } else {
    application_state.songs = result.value;
  }

  refresh_statistics();
  clamp_current_page();
}

async function main() {
  await load_initial_state();
  render_application();

  document.addEventListener('click',  handle_document_click);
  document.addEventListener('submit', handle_document_submit);
  document.addEventListener('input',  handle_document_input);
  document.addEventListener('change', handle_document_change);
}

main();
