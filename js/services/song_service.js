// js/services/song_service.js
//
// Purpose:
// This service is the ONLY place in the application that should modify song data.
//
// separation of concerns implemented in this file :
// - UI code not editing arrays 
// - UI code should not talk to localStorage directly.
// - Validation should not live in the UI.
//
// This service coordinates:
// - reading/writing songs using storage_service
// - validating + normalizing user input using song_model
// - applying business rules (timestamps, play_count updates, id generation)
//
// Result:
// The UI becomes simple: it calls these functions and then re-renders.

import { storage_service } from './storage_service.js';
import {
  normalize_song_input,
  validate_song,
  has_validation_errors
} from '../models/song_model.js';

/**
 * Returns the current timestamp in milliseconds.
 * We store timestamps as epoch milliseconds to avoid timezone issues.
 */
function now_milliseconds() {
  return Date.now();
}

/**
 * Generates a reasonably unique identifier for a new song record.
 * This is not cryptographically secure; it is intended for local app usage.
 */
function generate_song_id() {
  const random_part = Math.random().toString(16).slice(2);
  return `s_${now_milliseconds()}_${random_part}`;
}

/**
 * Returns a copy of an array of songs sorted by created_at (newest first).
 * Sorting here makes UI rendering consistent and predictable.
 */
function sort_songs_newest_first(songs) {
  return [...songs].sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

/**
 * Finds a song by id. Returns null if not found.
 */
function find_song_by_id(songs, song_id) {
  return songs.find((song) => song.id === song_id) || null;
}

/**
 * Updates the songs array in storage and returns the saved version.
 * Centralizes persistence so we have one consistent path for saving.
 */
function persist_songs(songs) {
  return storage_service.save_songs(songs);
}

/**
 * Public API: song_service
 *
 * All functions return objects in a consistent pattern:
 * - { ok: true, value: ... } on success
 * - { ok: false, errors: ... } or { ok: false, message: ... } on failure
 *
 * This makes UI wiring predictable.
 */
export const song_service = {
  /**
   * Returns all songs currently stored.
   * This does not mutate state; it is safe for UI to call anytime.
   */
  get_all_songs() {
    storage_service.init();
    const songs = storage_service.load_songs();
    return { ok: true, value: sort_songs_newest_first(songs) };
  },

  /**
   * Creates a new song record from raw input.
   * - normalizes input
   * - validates input
   * - adds required system fields (id, play_count, timestamps)
   * - saves to storage
   */
  create_song(raw_input) {
    storage_service.init();

    const normalized = normalize_song_input(raw_input);
    const errors = validate_song(normalized);

    if (has_validation_errors(errors)) {
      return { ok: false, errors };
    }

    const songs = storage_service.load_songs();

    const new_song = {
      id: generate_song_id(),
      title: normalized.title,
      artist: normalized.artist,
      album: normalized.album,
      playlist: normalized.playlist,
      genre: normalized.genre,
      duration_seconds: normalized.duration_seconds,
      rating: Number.isFinite(normalized.rating) ? normalized.rating : null,

      // business fields
      play_count: 0,

      // system fields
      created_at: now_milliseconds(),
      updated_at: now_milliseconds()
    };

    const updated_songs = [new_song, ...songs];
    const saved = persist_songs(updated_songs);

    return { ok: true, value: new_song, all_songs: sort_songs_newest_first(saved) };
  },

  /**
   * Updates an existing song by id using raw input.
   * - validates updates
   * - preserves id, created_at, play_count
   * - updates updated_at
   */
  update_song(song_id, raw_input) {
    storage_service.init();

    const songs = storage_service.load_songs();
    const existing = find_song_by_id(songs, song_id);

    if (!existing) {
      return { ok: false, message: 'song not found' };
    }

    const normalized = normalize_song_input(raw_input);
    const errors = validate_song(normalized);

    if (has_validation_errors(errors)) {
      return { ok: false, errors };
    }

    const updated_song = {
      ...existing,

      // fields editable by user
      title: normalized.title,
      artist: normalized.artist,
      album: normalized.album,
      playlist: normalized.playlist,
      genre: normalized.genre,
      duration_seconds: normalized.duration_seconds,
      rating: Number.isFinite(normalized.rating) ? normalized.rating : null,

      // system field updated on any change
      updated_at: now_milliseconds()
    };

    const updated_songs = songs.map((song) => (song.id === song_id ? updated_song : song));
    const saved = persist_songs(updated_songs);

    return { ok: true, value: updated_song, all_songs: sort_songs_newest_first(saved) };
  },

  /**
   * Deletes a song by id.
   * Use a confirmation dialog in the UI before calling this.
   */
  delete_song(song_id) {
    storage_service.init();

    const songs = storage_service.load_songs();
    const existing = find_song_by_id(songs, song_id);

    if (!existing) {
      return { ok: false, message: 'song not found' };
    }

    const updated_songs = songs.filter((song) => song.id !== song_id);
    const saved = persist_songs(updated_songs);

    return { ok: true, value: existing, all_songs: sort_songs_newest_first(saved) };
  },

  /**
   * Increments play_count for a song.
   * This is your domain-specific action (like "played this track").
   * It also updates updated_at so "recently touched" behavior is trackable.
   */
  increment_play_count(song_id) {
    storage_service.init();

    const songs = storage_service.load_songs();
    const existing = find_song_by_id(songs, song_id);

    if (!existing) {
      return { ok: false, message: 'song not found' };
    }

    const updated_song = {
      ...existing,
      play_count: (existing.play_count || 0) + 1,
      updated_at: now_milliseconds()
    };

    const updated_songs = songs.map((song) => (song.id === song_id ? updated_song : song));
    const saved = persist_songs(updated_songs);

    return { ok: true, value: updated_song, all_songs: sort_songs_newest_first(saved) };
  },

  /**
   * Convenience helper for the UI: fetch a single song record.
   * Useful for pre-filling the edit form later.
   */
  get_song_by_id(song_id) {
    storage_service.init();

    const songs = storage_service.load_songs();
    const existing = find_song_by_id(songs, song_id);

    if (!existing) {
      return { ok: false, message: 'song not found' };
    }

    return { ok: true, value: existing };
  }
};