Logic Explanation Document
This document explains the implementation of the "Smart Assign" and "Conflict Handling" features for the Real-Time Collaborative To-Do Board.

1. How Smart Assign is Implemented
The "Smart Assign" feature is designed to delegate a task to the team member who currently has the lightest workload, promoting even work distribution without requiring manual checks by a manager.

The process is implemented as a dedicated API endpoint that is triggered when a user clicks the "Smart Assign" button on a task. The logic works as follows:

Identify All Potential Assignees: When the button is clicked, the system first retrieves a complete list of all registered users from the database. This ensures every team member is considered a potential assignee.

Count Only Active Tasks: To accurately gauge workload, the system performs a database query to count the number of "active" tasks currently assigned to each user. An active task is defined as any task with a status of either "Todo" or "In Progress". Tasks that are already in the "Done" column are excluded from this count, as they do not represent current work.

Find the Least-Busy User: The system then iterates through the list of all users and uses the counts from the previous step to find the user with the minimum number of active tasks. If there is a tie (e.g., multiple users have zero active tasks), the system simply selects the first user it finds with that minimum count.

Assign the Task: Finally, the system updates the target task by setting its assignedUser field to the ID of the identified least-busy user. This change is saved to the database and, like all other updates, is broadcast in real-time to all connected clients, so everyone on the team immediately sees who the task has been assigned to.

2. How Conflict Handling Works
This feature is critical for a collaborative environment. It prevents users from accidentally overwriting each other's work when they edit the same task simultaneously. The system uses a versioning mechanism to manage this.

The Core Concept: Versioning
Every task in the database has an internal version number (e.g., version: 0). Whenever a task is successfully updated, its version number is automatically incremented by one (e.g., to version: 1). This version number acts as a "fingerprint" for the task's state at a specific point in time.

Example Scenario:
Here is how the system handles a conflict:

Initial State: A task, "Deploy App," exists with version: 0.

Two Users Open the Task:

User A opens the task to edit the description. Their browser fetches and stores the task data, including version: 0.

At the same time, User B opens the same task to change its priority. Their browser also fetches and stores the task data with version: 0.

User B Saves First:

User B changes the priority to "High" and clicks "Save".

The request is sent to the server with the task data and version: 0.

The server checks its database. The task in the database also has version: 0, so the versions match.

The server accepts the update, saves the new "High" priority, and increments the task's version to 1.

A real-time message is sent to all users, and User A's screen updates to show the new "High" priority, though their edit modal remains open with their old data.

User A Tries to Save:

User A finishes editing the description and clicks "Save".

Their browser sends the request to the server with their new description and the original version number they first fetched: version: 0.

Conflict Detected:

The server receives User A's request. It looks up the task in the database and sees that its current version is now 1.

It compares the version from User A's request (0) with the version in the database (1). They do not match.

The server rejects the update and sends back a special 409 Conflict error. Crucially, it also sends back the current, up-to-date task data from the database.

Frontend Resolution:

User A's browser catches the 409 Conflict error.

Instead of showing a generic error, it opens the "Conflict Detected" modal.

This modal displays User A's unsaved changes side-by-side with the current server version, allowing them to make an informed decision:

Cancel: Discard their own changes and accept the server's version.

Overwrite: Force their changes to be saved, creating a new version of the task.
