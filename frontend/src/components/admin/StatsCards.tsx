import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
    subtitle?: string;
}

export default function StatsCard ({title, value, icon: Icon, color, subtitle}: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6"/>
                </div>
            </div>

            <div>
                <p className="text-sm text-gray-600 mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    );
}