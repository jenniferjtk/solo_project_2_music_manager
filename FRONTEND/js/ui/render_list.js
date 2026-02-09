// js/ui/render_list.js
//
// - purpose:
//   render the main "list view" of songs
//
// - responsibilities:
//   - display songs in a table (this view receives the already-paged songs)
//   - show paging controls (prev / next) with page indicator
//   - expose row actions via data attributes (play / edit / delete)
//
// - rules:
//   - no direct data mutation
//   - no calls to storage_service or song_service
//   - no global state access
//   - rendering only

import { create_element } from './dom.js';

function format_duration_seconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';

  const minutes = Math.floor(seconds / 60);
  const remaining_seconds = seconds % 60;

  return `${minutes}:${String(remaining_seconds).padStart(2, '0')}`;
}

function render_table_header() {
  return create_element('thead', {}, [
    create_element('tr', {}, [
      create_element('th', {}, ['title']),
      create_element('th', {}, ['artist']),
      create_element('th', {}, ['album']),
      create_element('th', {}, ['duration']),
      create_element('th', {}, ['plays']),
      create_element('th', {}, ['actions'])
    ])
  ]);
}

function render_song_row(song) {
  return create_element('tr', { dataset: { song_id: song.id } }, [
    create_element('td', {}, [song.title]),
    create_element('td', {}, [song.artist]),
    create_element('td', {}, [song.album || '']),
    create_element('td', {}, [format_duration_seconds(song.duration_seconds)]),
    create_element('td', {}, [String(song.play_count || 0)]),
    create_element('td', {}, [
      create_element(
        'button',
        { dataset: { action: 'play', song_id: song.id }, type: 'button' },
        ['play']
      ),
      create_element(
        'button',
        { dataset: { action: 'edit', song_id: song.id }, type: 'button' },
        ['edit']
      ),
      create_element(
        'button',
        { dataset: { action: 'delete', song_id: song.id }, type: 'button' },
        ['delete']
      )
    ])
  ]);
}

function render_table_body(songs) {
  return create_element('tbody', {}, songs.map((song) => render_song_row(song)));
}

function render_empty_state() {
  return create_element('p', { class: 'empty_state' }, ['no songs found']);
}

// pagination object expected shape:
// {
//   current_page: number,
//   page_size: number,
//   total_records: number,
//   total_pages: number
// }
function render_pagination_controls(pagination) {
  const current_page = pagination?.current_page ?? 1;
  const page_size = pagination?.page_size ?? 10;
  const total_pages = pagination?.total_pages ?? 1;
  const total_records = pagination?.total_records ?? 0;

  const is_prev_disabled = current_page <= 1;
  const is_next_disabled = current_page >= total_pages;

  // optional nicety: "showing 11–20 of 34"
  const start_index = total_records === 0 ? 0 : (current_page - 1) * page_size + 1;
  const end_index = Math.min(current_page * page_size, total_records);

  return create_element('div', { class: 'pagination' }, [
    create_element('div', { class: 'pagination_info' }, [
      create_element('span', {}, [`total: ${total_records}`]),
      create_element('span', {}, [`page ${current_page} of ${total_pages}`]),
      create_element('span', {}, [
        total_records === 0 ? '' : `showing ${start_index}–${end_index}`
      ])
    ]),

    create_element('div', { class: 'pagination_controls' }, [
      create_element(
        'button',
        {
          type: 'button',
          dataset: { pagination: 'prev' },
          disabled: is_prev_disabled ? true : undefined
        },
        ['prev']
      ),
      create_element(
        'button',
        {
          type: 'button',
          dataset: { pagination: 'next' },
          disabled: is_next_disabled ? true : undefined
        },
        ['next']
      )
    ])
  ]);
}

export function render_list_view(songs, pagination) {
  const has_songs = Array.isArray(songs) && songs.length > 0;

  return create_element('div', { class: 'list_view' }, [
    create_element('h2', {}, ['song library']),
    render_pagination_controls(pagination),

    has_songs
      ? create_element('table', { class: 'song_table' }, [
          render_table_header(),
          render_table_body(songs)
        ])
      : render_empty_state()
  ]);
}