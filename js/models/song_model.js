// js/models/song_model.js
//
// Purpose:
// This module defines the rules for what a valid "Song" record looks like.
//
// In a well-structured system, validation and normalization live in ONE place.
// This prevents duplicated logic across forms, services, and UI components.
//
// Responsibilities:
// - Normalize raw input (trim strings, convert numbers)
// - Validate required fields and numeric ranges
// - Return structured validation errors keyed by field name

import { app_config } from '../config.js';

/**
 * Creates and returns a new, empty validation error object.
 * Each key in the object corresponds to a field name.
 */
function create_validation_errors() {
  return {};
}

/**
 * Safely converts a value to a trimmed string.
 * If the input is null or undefined, returns an empty string.
 */
function to_trimmed_string(value) {
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

/**
 * Safely converts a value to a number.
 * If conversion fails, returns NaN (which validation will catch).
 */
function to_number(value) {
  if (value == null || value === '') {
    return NaN;
  }
  return Number(value);
}

/**
 * Normalizes raw song input (for example, from a form).
 * This function does NOT validate — it only cleans and shapes data.
 *
 * @param {Object} raw_input - untrusted input (strings from forms, etc.)
 * @returns {Object} normalized song object (not yet guaranteed valid)
 */
export function normalize_song_input(raw_input) {
  return {
    title: to_trimmed_string(raw_input.title),
    artist: to_trimmed_string(raw_input.artist),
    album: to_trimmed_string(raw_input.album),
    playlist: to_trimmed_string(raw_input.playlist) || app_config.defaults.playlist,
    genre: to_trimmed_string(raw_input.genre) || app_config.defaults.genre,
    duration_seconds: to_number(raw_input.duration_seconds),
    rating: to_number(raw_input.rating),
    image_url: to_trimmed_string(raw_input.image_url)
  };
}

/**
 * Validates a normalized song object.
 * Returns an object containing validation errors.
 *
 * If the returned object is empty, the song is valid.
 *
 * @param {Object} song - normalized song object
 * @returns {Object} validation errors keyed by field name
 */
export function validate_song(song) {
  const errors = create_validation_errors();

  // Required string fields
  if (!song.title) {
    errors.title = 'title is required';
  } else if (song.title.length > app_config.limits.title_max_len) {
    errors.title = `title must be ${app_config.limits.title_max_len} characters or less`;
  }

  if (!song.artist) {
    errors.artist = 'artist is required';
  } else if (song.artist.length > app_config.limits.artist_max_len) {
    errors.artist = `artist must be ${app_config.limits.artist_max_len} characters or less`;
  }

  // Optional string fields with length limits
  if (song.album && song.album.length > app_config.limits.album_max_len) {
    errors.album = `album must be ${app_config.limits.album_max_len} characters or less`;
  }

  if (song.playlist && song.playlist.length > app_config.limits.playlist_max_len) {
    errors.playlist = `playlist must be ${app_config.limits.playlist_max_len} characters or less`;
  }

  if (song.genre && song.genre.length > app_config.limits.genre_max_len) {
    errors.genre = `genre must be ${app_config.limits.genre_max_len} characters or less`;
  }

  // Numeric fields
  if (
    !Number.isFinite(song.duration_seconds) ||
    song.duration_seconds < app_config.limits.duration_seconds_min ||
    song.duration_seconds > app_config.limits.duration_seconds_max
  ) {
    errors.duration_seconds = 'duration must be a positive number of seconds';
  }

  if (
    Number.isFinite(song.rating) &&
    (song.rating < app_config.limits.rating_min ||
      song.rating > app_config.limits.rating_max)
  ) {
    errors.rating = `rating must be between ${app_config.limits.rating_min} and ${app_config.limits.rating_max}`;
  }

  return errors;
}

/**
 * Convenience helper to check if a validation error object is empty.
 *
 * @param {Object} errors
 * @returns {boolean}
 */
export function has_validation_errors(errors) {
  return Object.keys(errors).length > 0;
}