export default function MerchantDashboard() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Merchant Dashboard</h1>
          <p className="text-gray-600">Placeholder - Will be built in Phase 2.8.4</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ✅ Protected Route - Only accessible by merchants (role: 'merchant')
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              ⚠️ Requires approval_status = 'approved'
            </p>
          </div>
        </div>
      </div>
    );
  }