import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Clock, Home } from 'lucide-react';
import Logo from '../layout/Logo';

export default function CustomerFooter() {
    const navigate = useNavigate();

    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

                    {/* Brand */}
                    <div>
                    <div className="mb-3 ">
                        <Logo size="small" align='left' />
                    </div>
                        <p className="text-sm text-gray-500 leading-relaxed mt-4">
                            Helping reduce food waste by connecting customers with quality discounted food from local bakeries.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {[
                                { label: 'Home', icon: <Home size={14} />, path: '/dashboard' },
                                { label: 'Browse Food', icon: <ShoppingBag size={14} />, path: '/dashboard' },
                                { label: 'Active Orders', icon: <Package size={14} />, path: '/orders/active' },
                                { label: 'Order History', icon: <Clock size={14} />, path: '/orders/history' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-4">About</h4>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => navigate('/about')}
                                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                                >
                                    About Replate
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/about#mission')}
                                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                                >
                                    Our Mission
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/about#how-it-works')}
                                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                                >
                                    How It Works
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} Replate. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}