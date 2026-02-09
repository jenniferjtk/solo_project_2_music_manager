# Solo Project 2 – Music Manager (Cloud Collection Manager)

CPSC 3750 – Web Application Development  
Spring 2026

---

## Project Overview

This project extends the Solo Project 1 Collection Manager into a cloud-based, client/server web application.

The user interface and core functionality remain similar, but **data ownership has moved from the browser to a backend service**. All song data is stored and managed on the server using JSON files. The frontend communicates with the backend exclusively through HTTP requests.

The purpose of this project is to demonstrate client vs. server responsibilities, clean API boundaries, JSON-based persistence, and a realistic frontend/backend architecture.

---

## Live Frontend (Netlify)

Netlify URL:  
https://solo-project-2-music-manager.netlify.app/

The frontend loads correctly in an incognito/private browser window.

Because Netlify cannot execute PHP, the frontend cannot fully function without a running backend. This behavior is expected for Solo Project 2 and is explained below.

---

## Backend Implementation

**Backend language used:** PHP

The backend is written in PHP and runs locally using XAMPP. It exposes REST-style API routes that the frontend communicates with using `fetch()`.

Backend base URL (local):  
http://localhost/solo_project_2_music_manager

API routes:
- GET `/api/songs.php`
- POST `/api/songs.php`
- PUT `/api/songs.php?id=SONG_ID`
- DELETE `/api/songs.php?id=SONG_ID`

All CRUD operations are handled on the server and return JSON responses to the frontend.

---

## JSON Data Persistence

All application data is persisted in a server-side JSON file:

`/data/songs.json`

The application starts with **at least 30 records** stored in this file. All create, update, and delete operations modify the JSON file directly on the server. The browser does not store or own the data.

Data persists across:
- Page refreshes
- Browser sessions
- CRUD operations
- Different users/devices (when the backend is running)

Refreshing the page reloads data from the backend, not from local storage.

---

## Application Features

### List View
- Displays songs in a table
- Shows title, artist, album, duration, and play count
- Paging implemented with exactly 10 records per page
- Next and Previous navigation controls
- Current page indicator

### Add / Edit Form
- Client-side and server-side validation
- Required fields enforced
- Validation errors displayed to the user

### Delete
- Delete confirmation required
- Deletions persist to the backend JSON file

### Stats View
- Displays total number of records
- Displays a domain-specific statistic derived from the dataset

---

## Paging Implementation

Paging is implemented on the frontend using data retrieved from the backend.

- Fixed page size of 10 records
- Paging updates correctly after add, edit, and delete operations
- Navigation buttons are disabled at page boundaries

---

## Validation

Validation is implemented on both the client and server.

Client-side validation:
- Input normalization
- Required fields enforced
- Numeric range validation

Server-side validation:
- JSON body validation
- Required fields enforced
- Safe file handling and error responses

Invalid input is rejected and descriptive error messages are returned to the frontend.

---

## Why the Backend Is Not Publicly Hosted

Netlify is only capable of serving static files such as HTML, CSS, and JavaScript, and it cannot execute PHP or run a server-side environment. Because of this, the PHP backend for this project runs locally using XAMPP, which is why the application cannot fully function when accessed through the Netlify URL alone. This limitation is intentional for Solo Project 2 and is meant to emphasize the separation between frontend and backend responsibilities rather than deployment complexity.

---

## How This Would Be Deployed in Production

In a real production environment, the frontend would still be hosted on a static hosting platform like Netlify, while the backend would be deployed separately on a PHP-capable server or cloud hosting provider. The frontend would communicate with the backend over HTTP using the same API routes implemented in this project. Production deployment would involve proper hosting, security configuration, and environment management, which are intentionally outside the scope of this assignment.

---

## Repository

GitHub Repository:  
https://github.com/jenniferjtk/solo_project_2_music_manager
