# Solo Project 2 – Music Manager (Cloud Collection Manager)

CPSC 3750 – Web Application Development  
Spring 2026

---

## Project Overview

This project extends the Solo Project 1 Collection Manager into a cloud-based, client/server web application.

The user interface and core functionality remain similar, but **data ownership has moved from the browser to a backend service**. All song data is stored and managed on the server using JSON files. The frontend communicates with the backend exclusively through HTTP requests.

The purpose of this project is to demonstrate:
- Client vs. server responsibilities
- Clean API boundaries
- JSON-based persistence
- Real-world frontend/backend architecture

---

## Architecture Summary

This project follows a **separated frontend/backend architecture**.

### Frontend
- HTML, CSS, JavaScript
- Hosted on Netlify
- Uses `fetch()` to communicate with backend API routes
- Contains no persistent data storage

### Backend
- Written in PHP
- Runs locally using XAMPP
- Stores all data in server-side JSON files
- Implements full CRUD logic via HTTP routes

Netlify does **not** support PHP execution. This is intentional for Solo Project 2 and is part of the learning objective.

---

## Live Frontend (Netlify)

Netlify URL: https://solo-project-2-music-manager.netlify.app/
The frontend loads correctly in an incognito/private browser window.

Because Netlify cannot execute PHP, the frontend **cannot fully function without a running backend**. This is expected and explained below.

---

## Backend Execution

The backend is hosted **locally** using XAMPP.

Backend base URL: http://localhost/solo_project_2_music_manager
API endpoint:
GET /api/songs.php
POST /api/songs.php
PUT /api/songs.php?id=SONG_ID
DELETE /api/songs.php?id=SONG_ID

All data is persisted in /data/songs.json

Data persists across:
- Page refreshes
- Browser sessions
- CRUD operations

---

## Data Persistence

Song data is stored in a JSON file on the server.

- The application starts with **at least 30 records**
- All create, update, and delete operations modify the JSON file
- The browser does not store or own the data
- Refreshing the page reloads data from the backend

This satisfies the JSON persistence requirement for Solo Project 2.

---

## Application Features

### List View
- Displays songs in a table
- Shows title, artist, album, duration, and play count
- Includes paging with exactly 10 records per page
- Next and Previous page navigation
- Current page indicator

### Add / Edit Form
- Form validation on both client and server
- Required fields enforced
- Validation errors displayed to the user

### Delete
- Delete confirmation required before removal
- Delete operation persists to backend JSON file

### Stats View
- Displays total number of records
- Displays a domain-specific statistic derived from the dataset

---

## Paging Implementation

Paging is implemented entirely on the frontend using data retrieved from the backend.

- Page size is fixed at 10 records
- Paging updates correctly after add, edit, and delete operations
- Navigation buttons are disabled at boundaries

---

## Validation

Validation is implemented on both sides:

### Client-side
- Input normalization
- Required fields enforced
- Numeric range validation

### Server-side
- JSON body validation
- Required fields enforced
- Safe file handling

Invalid input is rejected and error messages are returned to the frontend.

---

## Why the Backend Is Not Publicly Hosted

This project does **not** require public PHP hosting.

Netlify cannot run PHP, and setting up public backend hosting is intentionally outside the scope of Solo Project 2.

In a real production system, this application would be deployed using:
- A PHP-capable hosting provider, or
- A cloud service with proper backend infrastructure

For this assignment:
- The backend works locally
- The frontend correctly calls backend APIs
- The architecture and deployment strategy are clearly explained

---
## How it would be deployed in production
Netlify is only capable of serving static files like HTML, CSS, and JavaScript, so it cannot execute PHP code or run a server-side environment. Because of this, the PHP backend for this project must run locally using XAMPP, which is why the application cannot fully function when the frontend is accessed on Netlify alone. In a real production environment, the frontend would still be hosted on a static hosting service like Netlify, while the backend would be deployed separately on a PHP-capable server or cloud platform, and the frontend would communicate with that server over HTTP. For this project, the focus is on understanding and implementing the architecture rather than setting up actual hosting.

## Repository

GitHub Repository: https://github.com/jenniferjtk/solo_project_2_music_manager
