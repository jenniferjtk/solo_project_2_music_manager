# DEPLOYMENT.md

## Music Manager — Deployment Documentation

### Live URL
https://jenniferjgj.com

### Domain
- **Domain name:** jenniferjgj.com
- **Registrar:** Namecheap

### Hosting
- **Provider:** iFastNet (via InfinityFree Premium / Starter plan)
- **Control Panel:** cPanel
- **Server IP:** 31.22.4.140

### Tech Stack
- **Frontend:** Vanilla JavaScript (ES modules), HTML, CSS
- **Backend:** PHP 8.4.17 with PDO
- **Database:** MariaDB 10.11.15 (MySQL-compatible), hosted on iFastNet cPanel
- **Web Server:** Apache

### Database
- **Type:** MySQL
- **Host:** localhost (relative to server)
- **Database name:** jennife1_musicManager
- **Location:** iFastNet shared hosting cPanel

### How to Deploy / Update
1. Make changes locally and test with XAMPP
2. Upload changed files to `public_html` via cPanel File Manager
3. For database schema changes, run SQL in cPanel phpMyAdmin

### Secrets Management
Database credentials are stored as Apache environment variables set in `.htaccess` on the server using `SetEnv`. This file is excluded from the repository via `.gitignore`. The application reads credentials using PHP `getenv()` in `api/db.php`. No secrets are committed to Git.

### Initial Database Setup
1. Create MySQL database and user in cPanel
2. Run `schema.sql` in phpMyAdmin SQL tab
3. Run `seed.sql` in phpMyAdmin SQL tab