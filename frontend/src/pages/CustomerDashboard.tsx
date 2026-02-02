// frontend/src/pages/CustomerDashboard.tsx
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Simple Header with Logout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customer Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
          </div>
          <button 
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-600">Placeholder - Will be built in Phase 2.8.3</p>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✅ Protected Route - Only accessible by customers (role: 'user')
          </p>
        </div>
      </div>
    </div>
  );
}