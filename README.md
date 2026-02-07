# Solo Project 1 – Music Manager

CPSC 3750 – Web Application Development  
Spring 2026

## Overview

This project is a locally hosted Music Manager web application that allows users to manage a personal song collection.

The application supports full CRUD functionality (Create, Read, Update, Delete), persists data using `localStorage`, and includes a statistics view that summarizes listening habits.

This project runs **locally only** using XAMPP and is not deployed to the public internet.

---

## Features

- View a list of songs in a clean, readable table
- Add new songs with input validation
- Edit existing song details
- Delete songs with confirmation
- Increment play count via a "play" action
- Persistent storage using browser `localStorage`
- Statistics view including:
  - Total number of songs
  - Total listening time
  - Most played song
  - Most played artist
  - Most played album
  - Average rating

---

## Technology Used

- HTML5
- CSS3 (custom styling, no frameworks)
- Vanilla JavaScript (ES modules)
- localStorage for persistence
- XAMPP (Apache) for local hosting

---

## How to Run the Application

### 1. Folder Placement

Place the project folder exactly here:
XAMPP/htdocs/solo_project_1_music_manager

### 2. Start XAMPP

- Open XAMPP Control Panel
- Start **Apache**

### 3. Open the Application

In your browser, navigate to:
http://localhost/solo_project_1_music_manager/

---

## Notes

- The application initializes with **30+ seeded song records**
- Data persists across page refreshes using `localStorage`
- No server-side code is used
- This project is intended for local execution only
