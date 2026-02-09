// js/services/stats_service.js
//
// Purpose:
// This service computes statistics from a list of song records.
//
// Important design principle:
// - Statistics are DERIVED data.
// - We do NOT store statistics in localStorage, because they can become stale.
// - Instead, we compute them from the current song list whenever we need them.
//
// This module:
// - It does not read from localStorage.
// - It does not modify songs.
// - It does not render UI.
// - It simply returns computed values.

function is_non_empty_string(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function is_finite_number(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Safely extracts play_count from a song record.
 * If missing or invalid, defaults to 0.
 */
function get_play_count(song) {
  if (!song || !is_finite_number(song.play_count)) {
    return 0;
  }
  return song.play_count;
}

/**
 * Safely extracts duration_seconds from a song record.
 * If missing or invalid, defaults to 0.
 */
function get_duration_seconds(song) {
  if (!song || !is_finite_number(song.duration_seconds)) {
    return 0;
  }
  return song.duration_seconds;
}

/**
 * Safely extracts rating from a song record.
 * rating may be null in our model.
 */
function get_rating(song) {
  if (!song || !is_finite_number(song.rating)) {
    return null;
  }
  return song.rating;
}

/**
 * Given a map of { key: numeric_value }, returns the key with the largest numeric_value.
 * If the map is empty, returns null.
 */
function get_key_with_max_value(key_to_value_map) {
  const entries = Object.entries(key_to_value_map);
  if (entries.length === 0) {
    return null;
  }

  let best_key = entries[0][0];
  let best_value = entries[0][1];

  for (const [key, value] of entries) {
    if (value > best_value) {
      best_key = key;
      best_value = value;
    }
  }

  return best_key;
}

/**
 * Returns the song object that has the highest play_count.
 * If there are no songs, returns null.
 */
function get_most_played_song(songs) {
  if (!Array.isArray(songs) || songs.length === 0) {
    return null;
  }

  let best_song = songs[0];
  let best_play_count = get_play_count(best_song);

  for (const song of songs) {
    const current_play_count = get_play_count(song);
    if (current_play_count > best_play_count) {
      best_song = song;
      best_play_count = current_play_count;
    }
  }

  return best_song;
}

/**
 * Computes total listening time (in seconds) across all songs.
 * This is a simple sum of duration_seconds.
 */
function get_total_listening_time_seconds(songs) {
  if (!Array.isArray(songs)) {
    return 0;
  }

  let total_seconds = 0;
  for (const song of songs) {
    total_seconds += get_duration_seconds(song);
  }
  return total_seconds;
}

/**
 * Computes average rating across songs that have a rating.
 * If no rated songs exist, returns null.
 */
function get_average_rating(songs) {
  if (!Array.isArray(songs) || songs.length === 0) {
    return null;
  }

  let sum = 0;
  let count = 0;

  for (const song of songs) {
    const rating = get_rating(song);
    if (rating != null) {
      sum += rating;
      count += 1;
    }
  }

  if (count === 0) {
    return null;
  }

  return sum / count;
}

/**
 * Builds a map of totals by a string field, where the total is play_count.
 * Example for artists:
 *  "Led Zeppelin" -> 42 (sum of play_count for all Zeppelin songs)
 */
function build_play_count_totals_by_field(songs, field_name) {
  const totals = {};

  if (!Array.isArray(songs)) {
    return totals;
  }

  for (const song of songs) {
    const key_value = song ? song[field_name] : null;
    if (!is_non_empty_string(key_value)) {
      continue;
    }

    const play_count = get_play_count(song);
    totals[key_value] = (totals[key_value] || 0) + play_count;
  }

  return totals;
}

/**
 * Converts total seconds into a human-friendly string like "1h 23m 45s".
 * This is useful for the Stats View display.
 */
function format_duration_human_readable(total_seconds) {
  const seconds = Math.max(0, Math.floor(total_seconds));

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining_seconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remaining_seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remaining_seconds}s`;
  }
  return `${remaining_seconds}s`;
}

/**
 * Public API: stats_service
 *
 * get_song_statistics(songs) returns a single object containing all computed values.
 * This keeps the UI simple: one call, one payload, render it.
 */
export const stats_service = {
  /**
   * Computes all statistics needed for the Stats View.
   *
   * @param {Array} songs - array of song records
   * @returns {Object} statistics payload
   */
  get_song_statistics(songs) {
    const safe_songs = Array.isArray(songs) ? songs : [];

    const total_songs = safe_songs.length;

    const total_listening_time_seconds = get_total_listening_time_seconds(safe_songs);
    const total_listening_time_human = format_duration_human_readable(
      total_listening_time_seconds
    );

    const most_played_song = get_most_played_song(safe_songs);

    const artist_play_totals = build_play_count_totals_by_field(safe_songs, 'artist');
    const most_played_artist = get_key_with_max_value(artist_play_totals);

    const album_play_totals = build_play_count_totals_by_field(safe_songs, 'album');
    const most_played_album = get_key_with_max_value(album_play_totals);

    const average_rating = get_average_rating(safe_songs);

    return {
      total_songs,
      total_listening_time_seconds,
      total_listening_time_human,

      most_played_song, // full song record (or null)
      most_played_artist, // string (or null)
      most_played_album, // string (or null)

      average_rating // number (or null)
    };
  }
};