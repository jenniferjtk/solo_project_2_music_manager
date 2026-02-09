<?php
// api/songs.php
//
// purpose:
// - CRUD for songs stored in ../data/songs.json
//
// api contract:
// - GET    /api/songs.php              -> { ok: true, songs: [...] }
// - POST   /api/songs.php              -> create, returns full dataset
// - PUT    /api/songs.php?id=...       -> update, returns full dataset
// - DELETE /api/songs.php?id=...       -> delete, returns full dataset

header('content-type: application/json; charset=utf-8');

$path = __DIR__ . '/../data/songs.json';

function respond($status_code, $payload) {
  http_response_code($status_code);
  echo json_encode($payload);
  exit;
}

function read_songs($path) {
  if (!file_exists($path)) {
    // treat missing file as empty dataset (you can also choose to 500)
    return [];
  }

  $raw = file_get_contents($path);
  if ($raw === false) {
    respond(500, [ 'ok' => false, 'message' => 'failed to read songs.json' ]);
  }

  $data = json_decode($raw, true);

  if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    respond(500, [
      'ok' => false,
      'message' => 'songs.json contains invalid json',
      'error' => json_last_error_msg()
    ]);
  }

  if (!is_array($data)) return [];
  return $data;
}

function write_songs($path, $songs) {
  $json = json_encode($songs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

  if ($json === false) {
    respond(500, [ 'ok' => false, 'message' => 'failed to encode json' ]);
  }

  $ok = file_put_contents($path, $json);
  if ($ok === false) {
  respond(500, [
    'ok' => false,
    'message' => 'failed to write songs.json',
    'path' => $path,
    'dir_writable' => is_writable(dirname($path)),
    'file_exists' => file_exists($path),
    'file_writable' => file_exists($path) ? is_writable($path) : null
  ]);
}
}

function get_json_body() {
  $raw = file_get_contents('php://input');
  if ($raw === false || trim($raw) === '') return null;

  $data = json_decode($raw, true);
  if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    respond(400, [ 'ok' => false, 'message' => 'invalid json body', 'error' => json_last_error_msg() ]);
  }

  return $data;
}

function now_ms() {
  return round(microtime(true) * 1000);
}

function generate_id() {
  // good enough for class project
  return 's_' . now_ms() . '_' . bin2hex(random_bytes(3));
}

function find_index_by_id($songs, $id) {
  for ($i = 0; $i < count($songs); $i++) {
    if (isset($songs[$i]['id']) && $songs[$i]['id'] === $id) return $i;
  }
  return -1;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $songs = read_songs($path);
  respond(200, [ 'ok' => true, 'songs' => $songs ]);
}

// POST: create
if ($method === 'POST') {
  $input = get_json_body();
  if (!is_array($input)) {
    respond(400, [ 'ok' => false, 'message' => 'missing json body' ]);
  }

  $songs = read_songs($path);

  $new_song = $input;

  // enforce server-side fields
  $new_song['id'] = generate_id();
  $new_song['created_at'] = now_ms();
  $new_song['updated_at'] = now_ms();

  // defaults if not provided
  if (!isset($new_song['play_count'])) $new_song['play_count'] = 0;

  array_unshift($songs, $new_song);

  write_songs($path, $songs);
  respond(200, [ 'ok' => true, 'songs' => $songs ]);
}

// PUT: update
if ($method === 'PUT') {
  $id = isset($_GET['id']) ? $_GET['id'] : '';
  if ($id === '') {
    respond(400, [ 'ok' => false, 'message' => 'missing id' ]);
  }

  $input = get_json_body();
  if (!is_array($input)) {
    respond(400, [ 'ok' => false, 'message' => 'missing json body' ]);
  }

  $songs = read_songs($path);
  $idx = find_index_by_id($songs, $id);

  if ($idx < 0) {
    respond(404, [ 'ok' => false, 'message' => 'song not found' ]);
  }

  $existing = $songs[$idx];

  // keep id + created_at stable, update updated_at
  $updated = array_merge($existing, $input);
  $updated['id'] = $existing['id'];
  if (isset($existing['created_at'])) $updated['created_at'] = $existing['created_at'];
  $updated['updated_at'] = now_ms();

  $songs[$idx] = $updated;

  write_songs($path, $songs);
  respond(200, [ 'ok' => true, 'songs' => $songs ]);
}

// DELETE: remove
if ($method === 'DELETE') {
  $id = isset($_GET['id']) ? $_GET['id'] : '';
  if ($id === '') {
    respond(400, [ 'ok' => false, 'message' => 'missing id' ]);
  }

  $songs = read_songs($path);
  $idx = find_index_by_id($songs, $id);

  if ($idx < 0) {
    respond(404, [ 'ok' => false, 'message' => 'song not found' ]);
  }

  array_splice($songs, $idx, 1);

  write_songs($path, $songs);
  respond(200, [ 'ok' => true, 'songs' => $songs ]);
}

respond(405, [ 'ok' => false, 'message' => 'method not allowed' ]);