# ShiftFlow

ShiftFlow is a comprehensive shift management and operational tool designed for coffee shops. It streamlines the workflow for baristas and managers by handling shift tracking, task dispatching, communications, and wastage logging in a unified interface.

## 🚀 Features

### For Baristas
- **Shift Management**: Easy clock-in/clock-out functionality via the **Opening Page**.
- **Dashboard**: A centralized hub aimed at daily operations.
- **Wastage Logging**: detailed logging for inventory waste tracking.
- **Real-time Updates**: Live updates on tasks and notifications.

### For Managers & Core Team
- **Core Dashboard**: A high-level overview of operations across locations.
- **Task Dispatching**: Create and assign tasks to specific locations or shifts.
- **Communications**: Manage shift briefings and announcements.
- **Oversight**: detailed auditing and operational oversight tools.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (configured with `clsx` and `tailwind-merge`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/)

## 📂 Project Structure

```
shiftflow/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Contexts (e.g., AuthContext)
│   ├── lib/             # Utility libraries and API clients
│   ├── pages/           # Application views/pages
│   │   ├── OpeningPage.jsx       # Shift start screen
│   │   ├── DashboardPage.jsx     # Main barista dashboard
│   │   ├── CorePage.jsx          # Manager dashboard
│   │   ├── CommunicationsPage.jsx# Message & task management
│   │   └── LoginPage.jsx         # Authentication screen
│   ├── App.jsx          # Main application component & routing
│   └── main.jsx         # Entry point
├── public/              # Public assets
└── ...config files
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Supabase project set up (URL and Anon components required in environment variables).

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd shiftflow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app should now be running at `http://localhost:5173`.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Previews the production build locally.

---
Built with ❤️ using React & Vite.
