import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { TopNav } from './TopNav.jsx';

export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <TopNav />
      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}
