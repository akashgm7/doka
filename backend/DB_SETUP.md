# Database Setup Instructions

The backend server is failing to start because it cannot connect to a database. You need a **MongoDB Connection URI**.

## Option 1: Use MongoDB Atlas (Free Cloud Database)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up for a free account.
2.  Create a **New Project** (e.g., "DokaApp").
3.  Click **Build a Database** -> select **Shared (Free)** -> **Create**.
4.  **Security Quickstart**:
    - Creat a **Username** and **Password** (write these down!).
    - Add your IP Address (click "Add My Current IP Address").
5.  Click **Finish and Close**.
6.  Click **Connect** on your Database Cluster.
7.  Select **Drivers** (Node.js).
8.  **Copy the Connection String**. It will look like this:
    `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`

## Option 2: Update your .env file

1.  Open the file `backend/.env` in your editor.
2.  Find the line starting with `MONGO_URI=`.
3.  Replace the entire value with the string you copied.
4.  **IMPORTANT**: Replace `<password>` with your actual password (remove the `< >` brackets).

**Example:**
`MONGO_URI=mongodb+srv://myuser:mypassword123@cluster0.abcde.mongodb.net/doka_app?retryWrites=true&w=majority`

## Option 3: Verify

1.  Save the `.env` file.
2.  In your terminal (backend folder), run:
    ```bash
    npm start
    ```
3.  You should see: `MongoDB Connected: ...`
