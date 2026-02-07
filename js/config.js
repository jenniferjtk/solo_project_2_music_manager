// js/config.js

export const app_config = {
  app_name: 'solo_project_1_music_manager',

  storage: {
    key: 'solo_project_1_music_manager__songs',
    backup_key: 'solo_project_1_music_manager__songs_backup',
    meta_key: 'solo_project_1_music_manager__meta',
    schema_version: 1
  },

  seed: {
    minimum_records: 30
  },

  defaults: {
    playlist: 'unassigned',
    genre: 'unknown'
  },

  limits: {
    title_max_len: 120,
    artist_max_len: 120,
    album_max_len: 160,
    playlist_max_len: 60,
    genre_max_len: 60,
    duration_seconds_min: 1,
    duration_seconds_max: 60 * 60, // 1 hour
    rating_min: 1,
    rating_max: 5
  }
};