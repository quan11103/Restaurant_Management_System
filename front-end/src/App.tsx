import './App.css';
import MenuManagementView from './views/admin/menu/MenuManagementView';
import AdminLayout from './views/admin/layouts/AdminLayout';
import HomeView from './views/online order/home/HomeView';
import DashboardView from './views/admin/dashboard/DashboardView';

function App() {
  return (
    <AdminLayout>
      <DashboardView />
    </AdminLayout>
    // <HomeView />
  );
}

export default App;