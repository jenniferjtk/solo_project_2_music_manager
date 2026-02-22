<?php
// api/songs.php
//
// purpose:
// - CRUD for songs stored in MySQL via PDO
//
// api contract:
// - GET    /api/songs.php              -> { ok: true, songs: [...] }
// - POST   /api/songs.php              -> create, returns full dataset
// - PUT    /api/songs.php?id=...       -> update, returns full dataset
// - DELETE /api/songs.php?id=...       -> delete, returns full dataset
// ------------------------------
// CORS (so Netlify frontend can call this backend)
// NOTE: "*" is fine for class/demo. In production you'd restrict it.
// ------------------------------
header('access-control-allow-origin: *');
header('access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS');
header('access-control-allow-headers: content-type');

// handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('content-type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

// ── helpers ─────────────────────────────────────────────────────────────────

function respond(int $status_code, array $payload): void {
    http_response_code($status_code);
    echo json_encode($payload);
    exit;
}

function get_json_body(): ?array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return null;

    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        respond(400, ['ok' => false, 'message' => 'invalid json body', 'error' => json_last_error_msg()]);
    }
    return $data;
}

function now_ms(): int {
    return (int)round(microtime(true) * 1000);
}

function generate_id(): string {
    return 's_' . now_ms() . '_' . bin2hex(random_bytes(3));
}

// Cast a raw DB row to the expected song shape so numeric fields arrive as
// proper JS numbers (not strings) after json_encode.
function row_to_song(array $row): array {
    return [
        'id'               => $row['id'],
        'title'            => $row['title'],
        'artist'           => $row['artist'],
        'album'            => $row['album'],
        'playlist'         => $row['playlist'],
        'genre'            => $row['genre'],
        'duration_seconds' => (int)$row['duration_seconds'],
        'rating'           => $row['rating'] !== null ? (int)$row['rating'] : null,
        'play_count'       => (int)$row['play_count'],
        'image_url'        => $row['image_url'],
        'created_at'       => (int)$row['created_at'],
        'updated_at'       => (int)$row['updated_at'],
    ];
}

function fetch_all_songs(PDO $db): array {
    $stmt = $db->query('SELECT * FROM songs ORDER BY created_at DESC');
    $rows = $stmt->fetchAll();
    return array_map('row_to_song', $rows);
}

// ── routing ──────────────────────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'];
$db     = get_db();

// GET: list all songs
if ($method === 'GET') {
    $songs = fetch_all_songs($db);
    respond(200, ['ok' => true, 'songs' => $songs]);
}

// POST: create a new song
if ($method === 'POST') {
    $input = get_json_body();
    if (!is_array($input)) {
        respond(400, ['ok' => false, 'message' => 'missing json body']);
    }

    $id         = generate_id();
    $now        = now_ms();
    $play_count = 0;

    $stmt = $db->prepare(
        'INSERT INTO songs
           (id, title, artist, album, playlist, genre, duration_seconds,
            rating, play_count, image_url, created_at, updated_at)
         VALUES
           (:id, :title, :artist, :album, :playlist, :genre, :duration_seconds,
            :rating, :play_count, :image_url, :created_at, :updated_at)'
    );

    $stmt->execute([
        ':id'               => $id,
        ':title'            => trim($input['title']     ?? ''),
        ':artist'           => trim($input['artist']    ?? ''),
        ':album'            => isset($input['album'])   ? trim($input['album'])    : null,
        ':playlist'         => trim($input['playlist']  ?? 'unassigned'),
        ':genre'            => trim($input['genre']     ?? 'unknown'),
        ':duration_seconds' => (int)($input['duration_seconds'] ?? 0),
        ':rating'           => isset($input['rating']) && $input['rating'] !== '' && $input['rating'] !== null
                                   ? (int)$input['rating'] : null,
        ':play_count'       => $play_count,
        ':image_url'        => isset($input['image_url']) && trim($input['image_url']) !== ''
                                   ? trim($input['image_url']) : null,
        ':created_at'       => $now,
        ':updated_at'       => $now,
    ]);

    $songs = fetch_all_songs($db);
    respond(200, ['ok' => true, 'songs' => $songs]);
}

// PUT: update an existing song
if ($method === 'PUT') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';
    if ($id === '') {
        respond(400, ['ok' => false, 'message' => 'missing id']);
    }

    $input = get_json_body();
    if (!is_array($input)) {
        respond(400, ['ok' => false, 'message' => 'missing json body']);
    }

    // verify the song exists
    $check = $db->prepare('SELECT id FROM songs WHERE id = :id');
    $check->execute([':id' => $id]);
    if (!$check->fetch()) {
        respond(404, ['ok' => false, 'message' => 'song not found']);
    }

    // build the SET clause from whitelisted fields only
    $allowed = [
        'title', 'artist', 'album', 'playlist', 'genre',
        'duration_seconds', 'rating', 'play_count', 'image_url'
    ];

    $set_parts = [];
    $params    = [':id' => $id, ':updated_at' => now_ms()];

    foreach ($allowed as $field) {
        if (!array_key_exists($field, $input)) continue;

        $placeholder = ':' . $field;

        if ($field === 'rating') {
            $params[$placeholder] = ($input[$field] !== null && $input[$field] !== '')
                ? (int)$input[$field] : null;
        } elseif ($field === 'duration_seconds' || $field === 'play_count') {
            $params[$placeholder] = (int)$input[$field];
        } elseif ($field === 'image_url') {
            $val = isset($input[$field]) ? trim($input[$field]) : '';
            $params[$placeholder] = $val !== '' ? $val : null;
        } else {
            $params[$placeholder] = trim((string)$input[$field]);
        }

        $set_parts[] = "`{$field}` = {$placeholder}";
    }

    if (empty($set_parts)) {
        // nothing to update — still return current dataset
        $songs = fetch_all_songs($db);
        respond(200, ['ok' => true, 'songs' => $songs]);
    }

    $set_parts[] = '`updated_at` = :updated_at';
    $sql = 'UPDATE songs SET ' . implode(', ', $set_parts) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $songs = fetch_all_songs($db);
    respond(200, ['ok' => true, 'songs' => $songs]);
}

// DELETE: remove a song
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';
    if ($id === '') {
        respond(400, ['ok' => false, 'message' => 'missing id']);
    }

    $check = $db->prepare('SELECT id FROM songs WHERE id = :id');
    $check->execute([':id' => $id]);
    if (!$check->fetch()) {
        respond(404, ['ok' => false, 'message' => 'song not found']);
    }

    $stmt = $db->prepare('DELETE FROM songs WHERE id = :id');
    $stmt->execute([':id' => $id]);

    $songs = fetch_all_songs($db);
    respond(200, ['ok' => true, 'songs' => $songs]);
}

respond(405, ['ok' => false, 'message' => 'method not allowed']);
