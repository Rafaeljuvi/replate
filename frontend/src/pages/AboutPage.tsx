import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, Leaf, Heart, Users, Store, ShoppingBag, CheckCircle, Target, Sparkles, TrendingDown, Globe, Search, CreditCard, MapPin
} from 'lucide-react'
import CustomerHeader from "../components/customer/CustomerHeader";
import CustomerFooter from "../components/layout/Footer";
import Logo from "../components/layout/Logo";

export default function AbouPage(){
    const navigate = useNavigate();
    const location = useLocation();

    //AutoScroll to section
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id)
            if (element){
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location])

    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            <CustomerHeader/>

            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 w-full flex-1">

                {/* Header Card */}
                <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 shadow-sm mb-6 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                    >
                        <ArrowLeft size={20} className="text-gray-600"/>
                    </button>
                    <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Leaf size={22} className="text-primary flex-shrink-0"/>
                            About Replate
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 ml-7 sm:ml-8">
                            Rescue. Reduce. Replate.
                        </p>
                    </div>
                </div>

                {/* Section 1: About Replate */}
                <section id="about" className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm mb-6">

                    {/* Hero */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Leaf size={36} className="text-primary"/>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                            Welcome to Replate
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mx-w-2xl mx-auto leading-relaxed">
                        A food waste reduction marketplace platform that connects local bakeries
                        with conscious customers, giving surplus food a second chance.
                        </p>
                    </div>

                    <div className="prose max-w-none mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Sparkles size={20} className="text-primary" />
                            Our Story
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
                            Every day, tons of perfectly good food are thrown away by bakeries simply because
                            they didn't sell quickly enough. At the same time, many customers are looking for
                            quality food at affordable prices. Replate bridges this gap.
                        </p>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            We believe that food waste is not just an economic loss it's an environmental
                            crisis. By rescuing surplus food from local bakeries and offering it to customers
                            at discounted prices, we create a win-win situation: bakeries reduce their waste
                            and recover costs, while customers enjoy quality products for less.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <TrendingDown className="w-7 h-7 sm:w-8 sm:h-8 text-primary mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Food Saved</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">Up to 70%</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">less waste</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Save Money</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">Up to 50%</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">discount</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <Store className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Local Bakeries</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">Quality</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">verified</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 text-center">
                            <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Eco Impact</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">Green</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">planet</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Our Mission */}
                <section id="mission" className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm mb-6 scroll-mt-4">

                    <div className="flex items-start gap-3 mb-5 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Target size={22} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Our Mission
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                                What drives us forward
                            </p>
                        </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                        To create a sustainable food ecosystem where no good food goes to waste — by
                        empowering local bakeries to recover value from surplus stock and giving customers
                        access to quality food at fair prices.
                    </p>

                    {/* 3 Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                                <Heart size={20} className="text-red-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Rescue</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                Save quality food from being discarded by giving it a marketplace where it
                                can find a customer.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                                <TrendingDown size={20} className="text-yellow-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Reduce</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                Cut down food waste at the source by helping bakeries plan and sell smarter,
                                reducing their environmental footprint.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                <Leaf size={20} className="text-primary" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Replate</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                Give food a second life by serving it to customers who appreciate quality,
                                affordability, and sustainability.
                            </p>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="mt-6 bg-green-50 rounded-xl p-5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-primary" />
                            Our Core Values
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span><strong>Sustainability:</strong> Every action contributes to a greener planet</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span><strong>Community:</strong> Supporting local bakeries and conscious customers</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span><strong>Quality:</strong> Only verified merchants and fresh products</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span><strong>Affordability:</strong> Quality food shouldn't be a luxury</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Section 3: how it works */}
                <section id="how-it-works" className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm mb-6 scroll-mt-4">

                    <div className="flex items-start gap-3 mb-5 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Users size={22} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                How It Works
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Simple steps for customers and merchants
                            </p>
                        </div>
                    </div>

                    {/* For Customers */}
                    <div className="mb-8">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            For Customers
                        </h3>

                        <div className="space-y-4">

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    1
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        Browse Local Bakeries
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Discover bakeries near you and explore their available products with discounted prices.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    2
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        Order Your Favorites
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Add items to your cart, choose payment method (cash or online), and place your order.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    3
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        Pick Up Fresh
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Pick up your order at the bakery during the available time window — fresh and ready to enjoy.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    4
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        Make a Difference
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Every order helps reduce food waste and supports local businesses. Save money, save the planet!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* For Merchants */}
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            For Merchants
                        </h3>

                        <div className="space-y-4">

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    1
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                                        Register Your Bakery
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Sign up as a merchant, complete your store profile, and submit verification documents.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    2
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                                        Get Verified
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Our admin team reviews your application and approves verified bakeries within 1-2 business days.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    3
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                                        List Your Products
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Add your surplus products with photos, set discounted prices, and define availability windows.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    4
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                                        Manage Orders & Grow
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Receive orders, manage your inventory through the merchant dashboard, and track your impact.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gradient-to-r bg-primary rounded-2xl p-6 sm:p-8 shadow-sm text-center mb-6">
                    <Sparkles size={32} className="text-white mx-auto mb-3" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Ready to make a difference?
                    </h2>
                    <p className="text-sm sm:text-base text-green-50 mb-5 max-w-xl mx-auto">
                        Join thousands of customers and bakeries already reducing food waste with Replate.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm sm:text-base"
                        >
                            Browse Food Now
                        </button>
                    </div>
                </section>
            </div>
            <CustomerFooter/>
        </div>
    )
}