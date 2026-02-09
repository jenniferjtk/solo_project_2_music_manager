// js/ui/render_stats.js
//
// - Purpose:
//   Render the Stats View for the music manager
//
// - Responsibilities:
//   - Display total record count
//   - Display domain-specific statistics (most played song/artist/album, listening time, avg rating)
//
// - Rules:
//   - No service calls
//   - No localStorage access
//   - No state mutation
//   - Rendering only

import { create_element } from './dom.js';


// - Function: format_number
// - Purpose:
//   Render numbers consistently for display
function format_number(value) {
  if (!Number.isFinite(value)) return '';
  return value.toLocaleString();
}


// - Function: format_average_rating
// - Purpose:
//   Format average rating if present
function format_average_rating(value) {
  if (!Number.isFinite(value)) return 'not rated yet';
  return value.toFixed(2);
}


// - Function: render_stat_row
// - Purpose:
//   Small helper to render a label/value pair
function render_stat_row(label, value) {
  return create_element('div', { class: 'stat_row' }, [
    create_element('div', { class: 'stat_label' }, [label]),
    create_element('div', { class: 'stat_value' }, [value])
  ]);
}


// - Function: render_stats_view
// - Purpose:
//   Render the full stats view
//
// - Parameters:
//   statistics -> object from stats_service.get_song_statistics(songs)
//
// - Returns:
//   DOM element
export function render_stats_view(statistics) {
  const safe_stats = statistics || {};

  const most_played_song = safe_stats.most_played_song;
  const most_played_song_text = most_played_song
    ? `${most_played_song.title} — ${most_played_song.artist} (${format_number(
        most_played_song.play_count || 0
      )} plays)`
    : 'none';

  const most_played_artist_text = safe_stats.most_played_artist || 'none';
  const most_played_album_text = safe_stats.most_played_album || 'none';

  const total_songs_text = Number.isFinite(safe_stats.total_songs)
    ? format_number(safe_stats.total_songs)
    : '0';

  const total_listening_time_text = safe_stats.total_listening_time_human || '0s';

  const average_rating_text = format_average_rating(safe_stats.average_rating);

  return create_element('div', { class: 'stats_view' }, [
    create_element('h2', {}, ['stats']),

    create_element('div', { class: 'stats_card' }, [
      render_stat_row('total songs', total_songs_text),
      render_stat_row('total listening time', total_listening_time_text),
      render_stat_row('most played song', most_played_song_text),
      render_stat_row('most played artist', most_played_artist_text),
      render_stat_row('most played album', most_played_album_text),
      render_stat_row('average rating', average_rating_text)
    ])
  ]);
}