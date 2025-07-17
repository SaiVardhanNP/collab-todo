# Real-Time Collaborative To-Do Board

## 1. Project Overview

This is a full-stack web application that functions as a real-time, collaborative Kanban-style to-do board. Inspired by platforms like Trello, it allows multiple users to register, log in, and manage tasks across different stages ("Todo", "In Progress", "Done"). All changes, including task creation, updates, drag-and-drop movements, and assignments, are synchronized live across all connected clients using WebSockets.

The project is built from the ground up with a custom backend API and a responsive frontend with no third-party UI component libraries. It focuses on unique business logic for smart task assignment and robust conflict resolution to ensure a seamless collaborative experience.

---

## 2. Tech Stack

**Backend:**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose ODM
* **Real-Time Communication:** Socket.IO
* **Authentication:** JSON Web Tokens (JWT) & bcrypt.js for password hashing

**Frontend:**
* **Library:** React
* **Build Tool:** Vite
* **API Communication:** Axios
* **Styling:** 100% Custom CSS (no frameworks like Bootstrap or Tailwind)
* **Drag & Drop:** `@hello-pangea/dnd`

---

## 3. Features List & Usage Guide

* **User Authentication:** Secure user registration and login system.
* **Real-Time Kanban Board:** A three-column board ("Todo", "In Progress", "Done") where all updates are reflected instantly for all users.
* **Task Management:**
    * Click the **"+ Add Task"** button to create a new task.
    * Click any existing task card to open a modal and edit its title, description, or priority.
* **Drag & Drop:** Click and hold a task card to drag it to a different column, updating its status.
* **Live Activity Log:** A side panel showing a live feed of the last 20 actions (create, edit, move, assign) performed by all users on the board.
* **Smart Assign:** In the edit modal, click the "Smart Assign" button to automatically assign the task to the user with the fewest active ("Todo" or "In Progress") tasks.
* **Conflict Handling:** If two users save the same task simultaneously, the second user is presented with a "Conflict Detected" modal, allowing them to either accept the server's changes or overwrite them with their own.
* **Fully Responsive Design:** The interface adapts cleanly for optimal use on desktop, tablet, and mobile devices.

---

## 4. Local Setup and Installation Instructions

To run this project locally, you will need Node.js and a running MongoDB instance (local or a free Atlas cluster).

### Backend Setup

1.  Navigate to the `server` directory:
    ```sh
    cd server
    ```
2.  Install all required dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `server` directory.
4.  Add the following environment variables to your `.env` file, replacing the placeholder values:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_random_string
    PORT=3001
    ```
5.  Start the backend server:
    ```sh
    node server.js
    ```
    The server will be running at `http://localhost:3001`.

### Frontend Setup

1.  Navigate to the `client` (or `frontend`) directory:
    ```sh
    cd client
    ```
2.  Install all required dependencies:
    ```sh
    npm install
    ```
3.  Start the frontend development server:
    ```sh
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

---

## 5. Explanations for Unique Logic

### Smart Assign Logic

The "Smart Assign" feature is designed to delegate a task to the team member who currently has the lightest workload, promoting even work distribution.

The process is implemented as a dedicated API endpoint and works as follows:
1.  **Identify All Users:** The system first retrieves a list of all registered users from the database.
2.  **Count Active Tasks:** It then performs a database aggregation to count the number of "active" tasks (status of "Todo" or "In Progress") assigned to each user.
3.  **Find the Least-Busy User:** The system iterates through the list of all users and uses the counts from the previous step to find the user with the minimum number of active tasks. If there's a tie, the first user found is selected.
4.  **Assign the Task:** The system updates the target task by setting its `assignedUser` field to the ID of the least-busy user. The change is then broadcast to all clients in real-time.

### Conflict Handling Logic

This feature prevents users from accidentally overwriting each other's work when editing the same task simultaneously. It uses a versioning system (`versionKey` in Mongoose).

The process works as follows:
1.  **Versioning:** Every task in the database has a version number (e.g., `__v: 0`).
2.  **Fetch with Version:** When a user opens a task to edit, the frontend fetches and stores the task's current version number.
3.  **Save with Version:** When the user saves their changes, the frontend sends the updated data *along with the original version number* it first fetched.
4.  **Server-Side Check:** The backend receives the request and performs an atomic `findOneAndUpdate` operation. It tries to find a task that matches **both the Task ID and the version number** sent by the client.
    * **If a match is found:** It means no one else has edited the task in the meantime. The server applies the update and atomically increments the version number in the database.
    * **If no match is found:** It means another user has already saved a change, which incremented the version number in the database. The version sent by the current user is now stale. The backend rejects the update and returns a `409 Conflict` error, along with the latest data from the server.
5.  **Frontend Resolution:** The frontend catches the `409 Conflict` error and opens a special "Conflict Detected" modal, showing the user's unsaved changes alongside the current server version, allowing them to make an informed decision to either discard their changes or overwrite the server's version.

---

## 6. Live Links

* **Deployed App URL:** **[Your Deployed Frontend URL Here]**
* **Demo Video Link:** **[Your Demo Video URL Here (YouTube, Loom, etc.)]**
