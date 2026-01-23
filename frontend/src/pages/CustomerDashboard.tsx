export default function CustomerDashboard() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Dashboard</h1>
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