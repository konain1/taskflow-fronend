# TaskFlow - Project & Task Management App

Welcome to **TaskFlow**! TaskFlow is a simple and modern Project & Task Management web application designed to help teams organize projects, assign tasks, and track progress effortlessly.

This application is built with a premium glassmorphic dark-theme UI and features real-time state updates.

---

## 🚀 Key Features & How to Use Them

### 1. User Authentication (Login & Signup)
* **Register/Signup**: Toggle to the "Sign Up" tab on the landing page to register a new account. You can sign up as an **Admin** or a **Member** (based on your team role).
* **Login**: Enter your registered email and password to log in. Your authentication details will be securely saved, and you will be redirected to your custom Dashboard.
* **Logout**: When you are done, click the **Logout** button in the top-right corner of the Dashboard to securely end your session.

### 2. The Dashboard (Customized by Role)
* **Dynamic Role Title**: The dashboard displays your role (Admin Dashboard or Member Dashboard) at the top so you instantly know your access level.
* **Health Check**: Click the **Health** button (next to Logout) to quickly verify that the TaskFlow backend API services are up and running smoothly.
* **Admin Dashboard**: Contains options to view all active projects and create new projects.
* **Member Dashboard**: Allows members to view projects they own or are members of, and quickly set up new projects.

### 3. Managing Projects (For Project Owners)
When you click on a project card, you will open the **Project Details Screen**:
* **Create Project**: Click **"New Project"** on your dashboard, fill in the Title and Description, and click **"Create Project"**.
* **Edit Project Details**: If you are the owner of the project, you will see an **"Edit Project"** button. Click it to update the project's Title or Description inline.
* **Delete Project**: If you are the owner, you can delete the project by clicking the red **"Delete Project"** button. This will remove all associated tasks.
* **Add Team Members**: Click the **"+ Add new Member"** button to open the member selection dropdown. You will see a list of registered users who are not yet part of the project. Choose a member and click **"Add"**.

### 4. Task Tracking & Management (Inside Projects)
Every project has a dedicated **Tasks** section where you can collaborate:
* **Create a Task**: Click the **"+ Create Task"** button on the Project details screen. Fill in:
  - **Title & Description**
  - **Status** (To Do, In Progress, Done)
  - **Priority** (Low, Medium, High)
  - **Assignee** (Select from a dropdown of project members/owners).
* **Edit/Update Tasks**: Click the **"Edit"** button next to any task. You can change its Status, Priority, or Assignee inline and save instantly.
* **Delete Tasks**: If you are the project owner, you can permanently remove a task by clicking its red **"Delete"** button.

---

## 🛠️ How to Run Locally

Follow these quick steps to get TaskFlow running on your computer:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/konain1/taskflow-fronend.git
   cd taskflow-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the browser**:
   Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173`).

---

## 🌐 Production Deployment

This project is configured with a `vercel.json` file to make single-page app routing smooth on **Vercel**. When hosting the build, Vercel will automatically handle direct URL reloads and ensure no `404 Not Found` errors occur.
