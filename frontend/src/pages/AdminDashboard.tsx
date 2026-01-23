export default function AdminDashboard() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Placeholder - Will be built in Phase 4.3.2</p>
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              ✅ Protected Route - Only accessible by admin (role: 'admin')
            </p>
          </div>
        </div>
      </div>
    );
  }