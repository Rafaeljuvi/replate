interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  subtitle?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  subtitle 
}: StatsCardProps) {
  
  // Color variants
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Icon Badge */}
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>

      {/* Title */}
      <p className="text-xs sm:text-sm text-gray-600 mb-1">{title}</p>

      {/* Value - responsive & auto-shrink jika kepanjangan */}
      <p className="text-lg sm:text-3xl font-bold text-gray-900 mb-1 break-words leading-tight">
        {value}
      </p>

      {/* Subtitle (optional) */}
      {subtitle && (
        <p className="text-[10px] sm:text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}