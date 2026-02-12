import { useNavigate } from "react-router-dom";
import { Clock, Mail, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import Logo from "../components/layout/Logo";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function MerchantPendingApprovalPage() {
  const { logout } = useAuth();
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#217851] to-[#135252] ">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Logo size="medium"/>
            <Button 
              variant="secondary"
              size="small"
              leftIcon={<LogOut size={16}/>}
              onClick={handleLogout}
              className="border-2 border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white"
              >
                LogOut
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="w-10 h-10 text-yellow-500"/>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2" >
              Application Under Review
            </h1>
            <p className="text-yellow-50 text-lg">
              Your Registration is being reviewd by our admin team
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500"/>
                What Happens Next?
              </h3>

              <div className="space-y-4 mb-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Admin Review
                    </h4>
                    <p className="text-sm text-gray-600">
                      Our admin will review your store Information and uploaded documents (QRIS & ID CARD)
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="flex gap-4 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Email Notification
                  </h4>
                  <p className="text-sm text-gray-600">
                    You'll receive an email notification once the review is complete.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Relogin
                  </h4>
                  <p className="text-sm text-gray-600">
                    Once Approved, simply <strong>Logout and Login again</strong> to access your merchant account
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  Review Timeline
                </h4>
                <p className="text-sm text-blue-800">
                Most applications are reviewed within <strong>1-3 business days</strong>. 
                We'll notify you via email as soon as possible!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 m-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  Check your email
                </h4>
                <p className="text-sm text-green-800">
                  We'll send you an email once your store is approved or if we need additional information.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 m-6 flex items-center justify-center gap-2">
          <span>🌱</span>
          Thank you for joining Replate to reduce food waste!
          <span>♻️</span>
        </p>
        </div>
      </div>
    </div>
  )
}