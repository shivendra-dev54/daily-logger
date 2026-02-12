# 🌊 Daily Logger

> **Ride the Wave of Productivity.**

Daily Logger is a holistic productivity and wellness tracking application designed to help users organize tasks, reflect on their days, and optimize sleep patterns. Built with a serene "Ocean" theme, it offers a distraction-free environment with enterprise-grade authentication and data visualization.

---

## ✨ Features

### **Secure Authentication**

* **JWT-Based Auth:** Secure Access and Refresh token rotation.
* **Auto-Logout:** Automatic session flushing upon token expiry.
* **Middleware:** Protected routes ensuring only authenticated access to dashboard features.

### **Task Management**

* **CRUD Operations:** Create, Read, Update, and Delete tasks seamlessly.
* **Smart Sorting:** Pending tasks always appear first; Completed tasks move to the bottom.
* **Filtering:** Filter views by All, Pending, or Completed.
* **Optimistic UI:** Instant status toggling for a snappy user experience.

### **Daily Journaling**

* **Star Ratings:** Rate your day on a 1-5 scale.
* **Validation:** Prevents logging for future dates to ensure data integrity.
* **Rich Summaries:** Text area for detailed daily reflections.

### **Sleep Tracker**

* **Visual Timeline:** Timeline view showing Bedtime vs. Wake Up time.
* **Smart Validation:**
* Prevents overlapping sleep sessions.
* Ensures Start Time < End Time.
* Limits sleep duration (Max 12 hours) to prevent erroneous data.
* History restriction (Cannot log sleep older than 5 days).


* **Auto-Calculation:** Automatically calculates sleep duration.

### **Profile & Analytics**

* **Custom SVG Charts:** Lightweight, dependency-free visualization of data.
* *Pie Chart:* Task Completion rates.
* *Line Chart:* Mood trends over the last 7 logs.
* *Bar Chart:* Sleep duration history.


* **Quote of the Day:** Daily motivational quotes that update every 24 hours (with manual refresh option).
* **Profile Management:** Update user details (Name, Username, Email) with uniqueness checks.

### **UI/UX**

* **Ocean Theme:** A custom-designed Light/Dark mode (`ocean-light` / `ocean-dark`) using Tailwind.
* **Responsive Design:** Fully mobile-optimized with a custom collapsible hamburger menu.
* **Loading States:** Skeleton loaders and spinners for smooth data fetching.

---

## Tech Stack

### **Frontend**

| Technology | Description |
| --- | --- |
| **Next.js** | App Router framework for React. |
| **TypeScript** | Static typing for reliability. |
| **Tailwind CSS** | Utility-first styling with custom theme configuration. |
| **Zustand** | Lightweight, persisted global state management (Auth/Theme). |
| **Axios** | HTTP client with interceptors for token refreshing. |
| **React Hot Toast** | Beautiful, stacked notifications. |

### **Backend**

| Technology | Description |
| --- | --- |
| **Next.js API Routes** | Serverless backend endpoints. |
| **Drizzle ORM** | Type-safe SQL ORM. |
| **MySQL** | Relational database (PlanetScale / Local MySQL). |
| **Jose / Bcrypt** | JWT handling and password hashing. |

---

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* MySQL Database

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/daily-logger.git
cd daily-logger

```


2. **Install dependencies**
```bash
npm install

```


3. **Set up the Database**
* Ensure your MySQL server is running.
* Run Drizzle migrations (if applicable) or push schema:


```bash
npx drizzle-kit push:mysql

```


4. **Configure Environment Variables**
* Create a `.env` file in the root directory.
* Copy the contents from `.env.example` (see below).


5. **Run the development server**
```bash
npm run dev

```


6. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file and add the following keys:

```env
DATABASE_URL=mysql://

ACCESS_SECRET=
REFRESH_SECRET=

NODE_ENV=development

ENCRYPTION_SECRET=

ADMIN_SECRET=
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Register a new user. |
| `POST` | `/api/auth/signin` | Login and receive tokens. |
| `POST` | `/api/auth/refresh` | Refresh access token using cookie. |
| `POST` | `/api/auth/logout` | Clear HTTP-only cookies. |

### User

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user` | Fetch current user details. |
| `PATCH` | `/api/user` | Update profile (Username, Email, Name). |

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/tasks` | Get all tasks. |
| `POST` | `/api/tasks` | Create a new task. |
| `PATCH` | `/api/tasks/:id` | Update task (Status/Content). |
| `DELETE` | `/api/tasks/:id` | Delete a task. |

### Logs & Sleep

*Endpoints follow the standard CRUD pattern for `/api/logs` and `/api/sleep`.*

---

## Contributing

Contributions are welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
Made with 💙 by Shivendra Devadhe
</p>