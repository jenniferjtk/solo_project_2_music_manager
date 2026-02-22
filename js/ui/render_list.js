// js/ui/render_list.js
//
// - purpose:
//   render the main "list view" of songs
//
// - responsibilities:
//   - search bar (live filter)
//   - sortable column headers
//   - song table with thumbnail, play/edit/delete actions
//   - pagination controls with configurable page-size select
//
// - rules:
//   - no direct data mutation
//   - no calls to storage_service or song_service
//   - no global state access
//   - rendering only

import { create_element } from './dom.js';

// ── constants ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/no_image/60/60';

// columns that support sorting — order matches table columns
const SORT_COLUMNS = [
  { field: 'title',            label: 'title'    },
  { field: 'artist',           label: 'artist'   },
  { field: 'album',            label: 'album'    },
  { field: 'duration_seconds', label: 'duration' },
  { field: 'play_count',       label: 'plays'    }
];

// ── formatting helpers ────────────────────────────────────────────────────────

function format_duration_seconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';

  const minutes           = Math.floor(seconds / 60);
  const remaining_seconds = seconds % 60;

  return `${minutes}:${String(remaining_seconds).padStart(2, '0')}`;
}

// ── table header (sortable) ───────────────────────────────────────────────────

function sort_indicator(field, sort_field, sort_dir) {
  if (field !== sort_field) return '';
  return sort_dir === 'asc' ? ' ▲' : ' ▼';
}

function render_table_header(sort_field, sort_dir) {
  const sort_cells = SORT_COLUMNS.map(({ field, label }) =>
    create_element('th', {}, [
      create_element(
        'button',
        { type: 'button', class: 'sort_btn', dataset: { sort_field: field } },
        [label + sort_indicator(field, sort_field, sort_dir)]
      )
    ])
  );

  return create_element('thead', {}, [
    create_element('tr', {}, [
      create_element('th', {}),         // thumbnail — not sortable
      ...sort_cells,
      create_element('th', {}, ['actions'])
    ])
  ]);
}

// ── song rows ─────────────────────────────────────────────────────────────────

function render_song_thumbnail(song) {
  const src = song.image_url || PLACEHOLDER_IMAGE;
  const img = create_element('img', {
    src,
    alt:    song.title,
    class:  'song_thumb',
    width:  '60',
    height: '60',
    onerror: function () {
      this.onerror = null;
      this.src = PLACEHOLDER_IMAGE;
    }
  });
  return create_element('td', { class: 'song_thumb_cell' }, [img]);
}

function render_song_row(song) {
  return create_element('tr', { dataset: { song_id: song.id } }, [
    render_song_thumbnail(song),
    create_element('td', {}, [song.title]),
    create_element('td', {}, [song.artist]),
    create_element('td', {}, [song.album || '']),
    create_element('td', {}, [format_duration_seconds(song.duration_seconds)]),
    create_element('td', {}, [String(song.play_count || 0)]),
    create_element('td', {}, [
      create_element(
        'button',
        { type: 'button', dataset: { action: 'play', song_id: song.id } },
        ['play']
      ),
      create_element(
        'button',
        { type: 'button', dataset: { action: 'edit', song_id: song.id } },
        ['edit']
      ),
      create_element(
        'button',
        { type: 'button', dataset: { action: 'delete', song_id: song.id } },
        ['delete']
      )
    ])
  ]);
}

function render_table_body(songs) {
  return create_element('tbody', {}, songs.map((song) => render_song_row(song)));
}

function render_empty_state(search_query) {
  const message = search_query
    ? `no songs match "${search_query}"`
    : 'no songs found';
  return create_element('p', { class: 'empty_state' }, [message]);
}

// ── search bar ────────────────────────────────────────────────────────────────

function render_search_bar(search_query) {
  return create_element('div', { class: 'list_controls' }, [
    create_element('input', {
      type:        'text',
      class:       'search_input',
      placeholder: 'search title, artist, album, genre…',
      value:       search_query || '',
      dataset:     { search: 'query' }
    })
  ]);
}

// ── pagination + page size ────────────────────────────────────────────────────

function render_page_size_select(page_size) {
  const options = [5, 10, 20, 50].map((n) =>
    create_element(
      'option',
      { value: String(n), selected: n === page_size ? true : null },
      [`${n} per page`]
    )
  );

  return create_element(
    'select',
    { class: 'page_size_select', dataset: { page_size_select: 'true' } },
    options
  );
}

function render_pagination_controls(pagination) {
  const current_page  = pagination?.current_page  ?? 1;
  const page_size     = pagination?.page_size     ?? 10;
  const total_pages   = pagination?.total_pages   ?? 1;
  const total_records = pagination?.total_records ?? 0;

  const is_prev_disabled = current_page <= 1;
  const is_next_disabled = current_page >= total_pages;

  const start_index = total_records === 0 ? 0 : (current_page - 1) * page_size + 1;
  const end_index   = Math.min(current_page * page_size, total_records);

  return create_element('div', { class: 'pagination' }, [
    create_element('div', { class: 'pagination_info' }, [
      create_element('span', {}, [`total: ${total_records}`]),
      create_element('span', {}, [`page ${current_page} of ${total_pages}`]),
      create_element('span', {}, [
        total_records === 0 ? '' : `showing ${start_index}–${end_index}`
      ])
    ]),

    create_element('div', { class: 'pagination_controls' }, [
      render_page_size_select(page_size),
      create_element(
        'button',
        { type: 'button', dataset: { pagination: 'prev' }, disabled: is_prev_disabled ? true : undefined },
        ['prev']
      ),
      create_element(
        'button',
        { type: 'button', dataset: { pagination: 'next' }, disabled: is_next_disabled ? true : undefined },
        ['next']
      )
    ])
  ]);
}

// ── public export ─────────────────────────────────────────────────────────────

// controls shape: { search_query, sort_field, sort_dir }
export function render_list_view(songs, pagination, controls = {}) {
  const has_songs    = Array.isArray(songs) && songs.length > 0;
  const sort_field   = controls.sort_field   || 'created_at';
  const sort_dir     = controls.sort_dir     || 'desc';
  const search_query = controls.search_query || '';

  return create_element('div', { class: 'list_view' }, [
    create_element('h2', {}, ['song library']),
    render_search_bar(search_query),
    render_pagination_controls(pagination),

    has_songs
      ? create_element('table', { class: 'song_table' }, [
          render_table_header(sort_field, sort_dir),
          render_table_body(songs)
        ])
      : render_empty_state(search_query)
  ]);
}
