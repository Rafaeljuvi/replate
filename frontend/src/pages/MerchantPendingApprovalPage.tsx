import { logout } from "../services/api";

export default function MerchantPendingApprovalPage() {
    const user = { name: 'John Doe' }; // Replace with actual user data or context
    return (
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Simple Header with Logout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
          </div>
          <button 
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Logout
          </button>
        </div>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Approval</h1>
            <p className="text-gray-600 mb-4">Placeholder - Will be built in Phase 2.7.1</p>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ✅ Protected Route - Only accessible by merchants
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                📌 Shown when approval_status = 'pending'
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    );
  }