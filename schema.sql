-- schema.sql
-- Music Manager — MySQL schema
--
-- Run this file first to create the database and table.
-- Usage (MySQL CLI):
--   mysql -u root -p < schema.sql
--
-- Or paste into phpMyAdmin's SQL tab.

CREATE DATABASE IF NOT EXISTS music_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE music_manager;

CREATE TABLE IF NOT EXISTS songs (
  id               VARCHAR(32)   NOT NULL,
  title            VARCHAR(120)  NOT NULL,
  artist           VARCHAR(120)  NOT NULL,
  album            VARCHAR(160)  DEFAULT NULL,
  playlist         VARCHAR(60)   NOT NULL DEFAULT 'unassigned',
  genre            VARCHAR(60)   NOT NULL DEFAULT 'unknown',
  duration_seconds INT           NOT NULL,
  rating           TINYINT       DEFAULT NULL,
  play_count       INT           NOT NULL DEFAULT 0,
  image_url        VARCHAR(500)  DEFAULT NULL,
  created_at       BIGINT        NOT NULL,
  updated_at       BIGINT        NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
