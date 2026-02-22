<?php
// api/db.php
//
// purpose:
// - return a PDO connection to the music_manager database
// - credentials come from environment variables so secrets are never
//   committed to the repository
//
// local dev (XAMPP):
//   set DB_HOST / DB_NAME / DB_USER / DB_PASS in your Apache VirtualHost
//   or in a .env file loaded by a small bootstrap (see README).
//   defaults below work for a stock XAMPP install.
//
// production:
//   set the same env vars in your host's environment config panel.

function get_db(): PDO {
    $host = getenv('DB_HOST') !== false ? getenv('DB_HOST') : 'localhost';
    $port = getenv('DB_PORT') !== false ? getenv('DB_PORT') : '3306';
    $name = getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'music_manager';
    $user = getenv('DB_USER') !== false ? getenv('DB_USER') : 'root';
    $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        // respond and exit so songs.php can include this file safely
        http_response_code(500);
        header('content-type: application/json; charset=utf-8');
        echo json_encode([
            'ok'      => false,
            'message' => 'database connection failed',
            'error'   => $e->getMessage()
        ]);
        exit;
    }
}
