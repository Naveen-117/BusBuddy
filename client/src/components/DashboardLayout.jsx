import { Outlet, Link } from 'react-router-dom';
import { ChartBarIcon, MapIcon, ClockIcon, HomeIcon } from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-indigo-600">Transit Analytics</h2>
        </div>
        <nav className="mt-4">
          <Link to="/dashboard" className="flex items-center p-3 text-gray-700 hover:bg-gray-100">
            <HomeIcon className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link to="/dashboard/routes" className="flex items-center p-3 text-gray-700 hover:bg-gray-100">
            <ChartBarIcon className="w-5 h-5 mr-3" />
            Route Statistics
          </Link>
          <Link to="/dashboard/map" className="flex items-center p-3 text-gray-700 hover:bg-gray-100">
            <MapIcon className="w-5 h-5 mr-3" />
            Geospatial View
          </Link>
          <Link to="/dashboard/times" className="flex items-center p-3 text-gray-700 hover:bg-gray-100">
            <ClockIcon className="w-5 h-5 mr-3" />
            Trip Times
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;