// js/services/storage_service.js


import { app_config } from '../config.js';
import { seed_songs } from '../data/seed_songs.js';

function now_ms() {
  return Date.now();
}

function read_json(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw);
}

function write_json(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
// purpose of ensure_meta function is to create or validate the meta information 
// in localStorage, which tracks schema version and timestamps. 
// This helps with data integrity and potential future migrations. 
// If the meta is missing or has an incompatible schema version, 
// it initializes it with the current schema version and timestamps.
function ensure_meta() {
  const meta = read_json(app_config.storage.meta_key);
  if (meta && meta.schema_version === app_config.storage.schema_version) return meta;

  const new_meta = {
    schema_version: app_config.storage.schema_version,
    initialized_at: now_ms(),
    updated_at: now_ms()
  };
  write_json(app_config.storage.meta_key, new_meta);
  return new_meta;
}

function backup_corrupt(raw_value) {
  try {
    write_json(app_config.storage.backup_key, {
      backed_up_at: now_ms(),
      raw_value
    });
  } catch (_) {
    // if backup fails, we still want the app to run
  }
}

function is_valid_song_record(song) {
  if (!song || typeof song !== 'object') return false;
  if (typeof song.id !== 'string' || song.id.trim() === '') return false;
  if (typeof song.title !== 'string' || song.title.trim() === '') return false;
  if (typeof song.artist !== 'string' || song.artist.trim() === '') return false;
  if (typeof song.duration_seconds !== 'number' || !Number.isFinite(song.duration_seconds)) return false;
  if (typeof song.play_count !== 'number' || !Number.isFinite(song.play_count)) return false;
  return true;
}

function sanitize_songs(songs) {
  if (!Array.isArray(songs)) return [];
  return songs.filter(is_valid_song_record);
}

export const storage_service = {
  init() {
console.log('storage_service.init: v2 (seed only first run)');
  ensure_meta();

  const key = app_config.storage.key;

  // seed only if the songs key does not exist (first run)
  const raw = localStorage.getItem(key);
  if (raw == null) {
    this.save_songs(seed_songs);
    return;
  }

  // if the key exists but the data is invalid/corrupt, recover once
  const existing = this.load_songs();
  if (existing.length === 0) {
    this.save_songs(seed_songs);
  }
  },

  load_songs() {
    const key = app_config.storage.key;

    const raw = localStorage.getItem(key);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return sanitize_songs(parsed);
    } catch (err) {
      backup_corrupt(raw);
      return [];
    }
  },

  save_songs(songs) {
    ensure_meta();

    const cleaned = sanitize_songs(songs);
    write_json(app_config.storage.key, cleaned);

    const meta = read_json(app_config.storage.meta_key) || {};
    meta.updated_at = now_ms();
    meta.schema_version = app_config.storage.schema_version;
    write_json(app_config.storage.meta_key, meta);

    return cleaned;
  },

  reset_to_seed() {
    ensure_meta();
    this.save_songs(seed_songs);
  }
};