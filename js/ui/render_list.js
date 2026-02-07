// js/ui/render_list.js
//
// - Purpose:
//   Render the main "List View" of songs
//
// - Responsibilities:
//   - Display all songs in a table
//   - Show core fields (title, artist, album, duration, play count)
//   - Expose actions via data attributes (play / edit / delete)
//
// - Rules:
//   - No direct data mutation
//   - No calls to storage_service or song_service
//   - No global state access
//   - Rendering only

import { create_element } from './dom.js';


// - Function: format_duration_seconds
// - Purpose:
//   Convert seconds into m:ss format for display
//
// - Parameters:
//   seconds -> number
//
// - Returns:
//   formatted string (e.g. "4:32")
function format_duration_seconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '';
  }

  const minutes = Math.floor(seconds / 60);
  const remaining_seconds = seconds % 60;

  return `${minutes}:${String(remaining_seconds).padStart(2, '0')}`;
}


// - Function: render_table_header
// - Purpose:
//   Create the table header row
//
// - Returns:
//   <thead> element
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


// - Function: render_song_row
// - Purpose:
//   Render a single song as a table row
//
// - Parameters:
//   song -> song record object
//
// - Returns:
//   <tr> element
function render_song_row(song) {
  return create_element(
    'tr',
    { dataset: { song_id: song.id } },
    [
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
    ]
  );
}


// - Function: render_table_body
// - Purpose:
//   Render all song rows
//
// - Parameters:
//   songs -> array of song records
//
// - Returns:
//   <tbody> element
function render_table_body(songs) {
  return create_element(
    'tbody',
    {},
    songs.map((song) => render_song_row(song))
  );
}


// - Function: render_list_view
// - Purpose:
//   Render the complete List View (header + table)
//
// - Parameters:
//   songs -> array of song records
//
// - Returns:
//   root DOM element for the list view
export function render_list_view(songs) {
  return create_element('div', { class: 'list_view' }, [
    create_element('h2', {}, ['song library']),

    create_element('table', { class: 'song_table' }, [
      render_table_header(),
      render_table_body(songs)
    ])
  ]);
}