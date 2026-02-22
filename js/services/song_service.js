// js/services/song_service.js
//
// purpose:
// this service is the only place that should modify song data
//
// solo project 2 change:
// - persistence is done via api_service (php + json)
// - no localStorage usage

import { api_service } from './api_service.js';
import {
  normalize_song_input,
  validate_song,
  has_validation_errors
} from '../models/song_model.js';

function sort_songs_newest_first(songs) {
  return [...songs].sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

function find_song_by_id(songs, song_id) {
  return songs.find((song) => song.id === song_id) || null;
}

export const song_service = {
  async get_all_songs() {
    const result = await api_service.get_all_songs();
    if (!result.ok) return result;
    return { ok: true, value: sort_songs_newest_first(result.value) };
  },

  async create_song(raw_input) {
    const normalized = normalize_song_input(raw_input);
    const errors = validate_song(normalized);

    if (has_validation_errors(errors)) {
      return { ok: false, errors };
    }

    const create_payload = {
      title: normalized.title,
      artist: normalized.artist,
      album: normalized.album,
      playlist: normalized.playlist,
      genre: normalized.genre,
      duration_seconds: normalized.duration_seconds,
      rating: Number.isFinite(normalized.rating) ? normalized.rating : null,
      play_count: 0,
      image_url: normalized.image_url || null
    };

    const result = await api_service.create_song(create_payload);
    if (!result.ok) return result;

    return { ok: true, all_songs: sort_songs_newest_first(result.value) };
  },

  async update_song(song_id, raw_input, current_songs) {
    const existing = find_song_by_id(current_songs, song_id);
    if (!existing) {
      return { ok: false, message: 'song not found' };
    }

    const normalized = normalize_song_input(raw_input);
    const errors = validate_song(normalized);

    if (has_validation_errors(errors)) {
      return { ok: false, errors };
    }

    const update_payload = {
      title: normalized.title,
      artist: normalized.artist,
      album: normalized.album,
      playlist: normalized.playlist,
      genre: normalized.genre,
      duration_seconds: normalized.duration_seconds,
      rating: Number.isFinite(normalized.rating) ? normalized.rating : null,
      image_url: normalized.image_url || null
    };

    const result = await api_service.update_song(song_id, update_payload);
    if (!result.ok) return result;

    return { ok: true, all_songs: sort_songs_newest_first(result.value) };
  },

  async delete_song(song_id) {
    const result = await api_service.delete_song(song_id);
    if (!result.ok) return result;

    return { ok: true, all_songs: sort_songs_newest_first(result.value) };
  },

  async increment_play_count(song_id, current_songs) {
    const existing = find_song_by_id(current_songs, song_id);
    if (!existing) {
      return { ok: false, message: 'song not found' };
    }

    const update_payload = {
      play_count: (existing.play_count || 0) + 1
    };

    const result = await api_service.update_song(song_id, update_payload);
    if (!result.ok) return result;

    return { ok: true, all_songs: sort_songs_newest_first(result.value) };
  }
};