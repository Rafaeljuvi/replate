import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useForm, Controller} from 'react-hook-form';
import {User, Mail, Phone, Lock, Store, MapPin, Clock, CreditCard, CheckCircle} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {registerMerchantStep1, registerMerchantStep2, registerMerchantStep3} from '../services/api';
import type {RegisterMerchantStep1Data, RegisterMerchantStep2Data, RegisterMerchantStep3Data} from '../@types';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import MapPicker from '../components/ui/MapPicker';
import FileUpload from '../components/ui/FileUpload';
import OperatingHoursInput from '../components/ui/OperatingHourseInput';

export default function RegisterMerchantPage() {
  const [currentStep, setCurrentStep] = useState(1);
    return (
      <AuthLayout>
        <div className='space-y-6'>
          {/* progress indicator */}
          <div className='flex items-center justify-between mb-8'>
            <StepIndicator step={1} active={currentStep >= 1} label="Account" />
            <ProgressBar progress={currentStep >= 2 ? 100 : 0} />
            <StepIndicator step={2} active={currentStep >= 2} label="Bakery Details"/>
            <ProgressBar progress={currentStep >= 3 ? 100 : 0} />
            <StepIndicator step={3} active={currentStep >= 3} label="Verification"/>
          </div>

          {/* Step content */}
          {currentStep === 1 && <Step1Account onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && (<Step2StoreInfo onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />)}
          {currentStep === 3 && (<Step3Verification onBack={() => setCurrentStep(2)} />)}
        </div>
      </AuthLayout>
    );
}

//Progress compoenents
function StepIndicator({step, active, label}: {step: number; active: boolean; label: string}) {
  return (
    <div className='flex flex-col items-center'>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${active ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
        {step}
      </div>
      <span className={`text-xs mt-2 font-medium ${active ? 'text-primary': 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

function ProgressBar({progress}: {progress: number}) {
  return(
    <div className='flex-1 h-1 bg-gray-200 mx-3'>
      <div className='h-full bg-primary transition-all duration-500' style={{width: `${progress}%`}}>
      </div>
    </div>
  );
}

//Step 1 Account
function Step1Account({onNext}: {onNext: () => void}){
  const {login} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterMerchantStep1Data>();

  const password = watch('password');

  const onSubmit = async (data: RegisterMerchantStep1Data) => {
    try {
      setIsLoading(true);
      const response = await registerMerchantStep1(data);
      login(response.user, response.token);
      toast.success('Account created!');
      onNext();
    } catch (error: any) {
      if(error.response?.status === 409) {
        toast.error('Email already registered');
      } else{
        toast.error('Registration Failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>
            Create Merchant Account
          </h2>
          <p className='text-gray-600 '>Step 1 of 3</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <Input
         label="Full Name"
         placeholder='Enter your full name'
         leftIcon={<User size={20}/>}
         error={errors.name?.message}
         {...register('name',{
          required: 'Name is required',
          minLength: {value: 3, message: 'Min 3 Characters'}
         })}
         />

         <Input
            label='Email'
            type = 'email'
            placeholder = 'your@email.com'
            leftIcon={<Mail size={20}/>}
            error = {errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid Email'
              }
            })}
         />  

         <Input
         label='Phone'
         type='tel'
         placeholder='08xxxxxxxxx'
         leftIcon={<Phone size={20}/>}
         error={errors.phone?.message}
         {...register('phone',{
          required: 'Phone is required',
          pattern:{
            value: /^(08|628|\+628)[0-9]{8,11}$/,
            message: 'Invalid phone number'
          }
         })}
         />

         <Input
            label = 'Password'
            isPassword
            placeholder = 'Min 8 characters'
            leftIcon={<Lock size={20}/>}
            error = {errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {value: 8, message: 'Min 8 Characters'},
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Must have uppercase, lowercase & number"
              }
            })}
         />

         <Input
            label='Confirm Password'
            isPassword
            placeholder='Confirm Password'
            leftIcon={<Lock size={20}/>}
            error ={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Confirm Password',
              validate: (v) => v === password || 'Password do not match'
            })}
         />

         <Button type='submit' fullWidth isLoading={isLoading} className='mt-6'>
            {isLoading ? 'Creating...' : 'Next Step ->'}
         </Button>

         <p className='text-center text-sm text-gray-600 mt-4'>
            Have an account?{' '}
            <Link to="/login" className='text-primary font-semibold'>
            Login
            </Link>
         </p>
      </form>
    </div>
  );
}

//Step 2 Information
function Step2StoreInfo({ onNext, onBack }: {onNext: () => void; onBack: () => void}){
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: {errors}
  } = useForm<RegisterMerchantStep2Data>({
    defaultValues: {
      location: {lat: -6.2088, lng: 106.8456 }
    }
  });

  const onSubmit = async (data: RegisterMerchantStep2Data) => {
    try {
      setIsLoading(true)

      const payload = {
        storeName: data.storeName,
        description: data.description,
        address: data.address,
        city: data.city,
        latitude: data.location.lat,
        longitude: data.location.lng,
        phone: data.phone,
        operatingHours: data.operatingHours
      };

      await registerMerchantStep2(payload);
      toast.success('Store info saved');
      onNext();

    } catch (error:any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-800'>
            Store Information
        </h2>
        <p className='text-gray-600 text-sm mt-1'>
            Step 2 of 3
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <Input
        label='Store Name'
        placeholder='e.g., Sweet Bakery'
        leftIcon = {<Store size={20}/>}
        error = {errors.storeName?.message}
        {...register('storeName', {
          required: 'Store name required',
          minLength: {value: 3, message:'Min 3 characters'}
        })}
        />

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>
            Description <span className='text-red-500'>*</span>
          </label>
          <textarea
            placeholder='Tell customers about your store...'
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300 focus:ring-primary'}`}
            rows={4}
            {...register('description', {
              required: 'Description required',
              minLength: {value: 20, message: 'Min 20 characters'},
              maxLength: {value: 500, message: 'Max 500 characters'}
            })}
          />
          {errors.description && <p className='text-sm text-red-500 mt-1'>{errors.description.message}</p>}
        </div>
        
        <Input
          label ="Address"
          placeholder = "Street address"
          leftIcon={<MapPin size={20}/>}
          error = {errors.address?.message}
          {...register('address', {
            required: 'Address required',
            minLength: { value: 10, message:"Enter your complete address"}
          })}
        />

        <Input
          label="City"
          placeholder="e.g., Jakarta"
          leftIcon={<MapPin size={20} />}
          error={errors.city?.message}
          {...register('city', { required: 'City required' })}
        />

        <Controller
          name="location"
          control={control}
          rules={{ required: 'Select location on map' }}
          render={({ field }) => (
            <MapPicker label="Store Location" value={field.value} onChange={field.onChange} error={errors.location?.message || ''} />
          )}
        />

        <Input
          label="Store Phone"
          type="tel"
          placeholder="Store contact"
          leftIcon={<Phone size={20} />}
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Phone required',
            pattern: {
              value: /^(08|628|\+628)[0-9]{8,11}$/,
              message: 'Invalid phone'
            }
          })}
        />

        <Controller
          name='operatingHours'
          control={control}
          rules={{required: 'Operating hours required'}}
          render={({field}) => (
            <OperatingHoursInput
              label='Operating hours'
              value={field.value}
              onChange={field.onChange}
              error = {errors.operatingHours?.message}
            />
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            ← Back
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : 'Next Step →'}
          </Button>   
        </div>
      </form>
    </div>
  );
}

// Step 3: verification
function Step3Verification({onBack}: {onBack: () => void}){
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: {errors}
  } = useForm<RegisterMerchantStep3Data>();

  const onSubmit = async (data: RegisterMerchantStep3Data) => {
    try {
      setIsLoading(true);
      await registerMerchantStep3(data);
      
      toast.success('Registration complete!');
      setRegistrationSuccess(true);  
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  if(registrationSuccess) {
    return (
      <div className='text-center'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <CheckCircle className='w-10 h-10 text-green-600'/>
        </div>

        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          Registration Succesful
        </h2>

        <p className="text-gray-600 mb-6">
          We've sent a verification email to your inbox.
          <br />
          Please verify your email to continue.
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800 font-semibold">📋 Next steps:</p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the verification link</li>
            <li>Login to your account</li>
            <li>Wait for admin approval (1-3 business days)</li>
          </ul>
        </div>

        {/* Login Button */}
        <Button
          variant="primary"
          size="medium"
          fullWidth
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className='text-center mb-6'> 
        <h2 className='text-wxl font-bold text-gray-800'>
          Verification
        </h2>
        <p className='text-gray-600 text-sm mt-1'>
          Step 3 of 3
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <Input
        label="Bank account number"
        placeholder='10-16 digits'
        leftIcon={<CreditCard size={20}/>}
        error={errors.bankAccountNumber?.message}
        {...register('bankAccountNumber', {
          required: 'Banl Account Required',
          pattern:{
            value: /^[0-9]{10,16}$/,
            message: 'Invalid account number'
          }
        })}
        />

        <Controller
          name='qrisImage'
          control = {control}
          render={({field}) => (
            <FileUpload
              label="QRIS Code (Optional)"
              accept='image/*'
              maxSize={5}
              value={field.value || null}
              onChange={field.onChange}
              helperText='Max 5MB'
            />
          )}
        />

        <Controller
          name="idCardImage"
          control={control}
          render={({ field }) => (
            <FileUpload
              label="ID Card (Optional)"
              accept="image/*"
              maxSize={5}
              value={field.value || null}
              onChange={field.onChange}
              helperText="Max 5MB"
            />
          )}
        />

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-sm text-blue-800 font-semibold'>
              What's Next:
          </p>
          <ul className='text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside'>
            <li>Verify your Email</li>
            <li>Admin review (1-3 working days)</li>
            <li>Start managing products</li>
          </ul>
        </div>

        <div className='flex gap-3 mt-4'>
            <Button type='button' variant="outline" onClick=        {onBack} className='flex-1'>
             ← Back
            </Button>

            <Button type='submit' variant='primary' fullWidth isLoading={isLoading} className='flex-1'>
              {isLoading ? 'Submitting...' : 'Complete ✓'}
            </Button>
        </div>
      </form>
    </div>
  );

}






  