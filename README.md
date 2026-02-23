# Music Manager Solo Project 3

A production-quality music collection manager built with vanilla JavaScript and PHP, backed by a MySQL database. Browse, search, sort, and manage a personal song library from any device.

**Live site:** [jenniferjgj.com](https://jenniferjgj.com)

---

## Features

### Song Library
- Paginated table view of your entire song collection
- Each song displays an album art thumbnail, title, artist, album, duration, and play count
- Broken or missing images fall back to a consistent placeholder automatically

### Search
- Search across title, artist, album, and genre simultaneously
- Empty state updates dynamically when no results are found

### Sorting
- Click any column header (Title, Artist, Album, Duration, Plays) to sort
- First click sorts ascending, second click sorts descending
- Switching columns resets direction to ascending

### Pagination
- Configurable page size: 5, 10, 20, or 50 songs per page
- Selected page size is saved in a cookie and restored on reload
- Pagination works together with search and sorting

### Add / Edit
- Full form with validation feedback
- Fields: title, artist, album, genre, playlist, duration, rating, play count, image URL
- Supports both adding new songs and editing existing ones

### Delete
- Confirmation step before any song is permanently removed

### Stats View
- Total number of songs in the collection
- Current page size setting
- Most played artist, album, and individual song
- Average rating across the full collection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript (ES Modules), HTML, CSS |
| Backend | PHP 8.2 with PDO |
| Database | MariaDB / MySQL |
| Hosting | iFastNet shared hosting (cPanel) |
| Domain | Namecheap — jenniferjgj.com |

---

## Project Structure

```
├── api/
│   ├── db.php          # PDO database connection (credentials via env vars)
│   └── songs.php       # REST-style API endpoints (GET, POST, PUT, DELETE)
├── css/
│   └── styles.css
├── js/
│   ├── app.js          # Application state and routing
│   ├── config.js       # API base URL and constants
│   ├── data/
│   │   └── seed_songs.js
│   ├── models/
│   │   └── song_model.js
│   ├── services/
│   │   ├── api_service.js
│   │   ├── song_service.js
│   │   ├── stats_service.js
│   │   └── storage_service.js
│   └── ui/
│       ├── dom.js
│       ├── render_form.js
│       ├── render_list.js
│       ├── render_navigation.js
│       └── render_stats.js
├── index.html
├── schema.sql
├── seed.sql
└── DEPLOYMENT.md
```

---

## Configuration

Database credentials are managed via Apache environment variables set in `.htaccess` on the server. The file is excluded from version control via `.gitignore`. The application reads credentials using `getenv()` in `api/db.php` — no secrets are committed to the repository.

See `DEPLOYMENT.md` for full deployment instructions.
