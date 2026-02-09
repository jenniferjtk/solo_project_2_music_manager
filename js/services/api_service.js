// js/services/api_service.js
//
// purpose:
// - single place for all http requests to php backend
//
// contract expectations (php):
// - GET    /api/songs.php              -> { ok: true, songs: [...] }
// - POST   /api/songs.php              -> { ok: true, songs: [...] }
// - PUT    /api/songs.php?id=...       -> { ok: true, songs: [...] }
// - DELETE /api/songs.php?id=...       -> { ok: true, songs: [...] }

import { app_config } from '../config.js';

function build_url(path) {
  return `${app_config.api.base_url}${path}`;
}

async function fetch_json(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      return { ok: false, message: `http ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, message: error?.message || 'network error' };
  }
}

function unwrap_songs_payload(result) {
  if (!result.ok) return result;

  const payload = result.value;
  if (!payload || payload.ok !== true || !Array.isArray(payload.songs)) {
    return { ok: false, message: 'unexpected api response shape' };
  }

  return { ok: true, value: payload.songs };
}

export const api_service = {
  async get_all_songs() {
    const url = build_url('/api/songs.php');
    const result = await fetch_json(url);
    return unwrap_songs_payload(result);
  },

  async create_song(song_payload) {
    const url = build_url('/api/songs.php');
    const result = await fetch_json(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(song_payload)
    });
    return unwrap_songs_payload(result);
  },

  async update_song(song_id, song_payload) {
    const url = build_url(`/api/songs.php?id=${encodeURIComponent(song_id)}`);
    const result = await fetch_json(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(song_payload)
    });
    return unwrap_songs_payload(result);
  },

  async delete_song(song_id) {
    const url = build_url(`/api/songs.php?id=${encodeURIComponent(song_id)}`);
    const result = await fetch_json(url, { method: 'DELETE' });
    return unwrap_songs_payload(result);
  }
};