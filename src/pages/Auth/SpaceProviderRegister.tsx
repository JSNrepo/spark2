import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, User, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const spaceProviderSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string().max(255, 'Password is too long'),
  firstName: z.string().min(2, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(2, 'Last name is required').max(50, 'Last name is too long'),
  phone: z.string().min(10, 'Valid phone number is required').max(20, 'Phone number is too long'),
  organizationName: z.string().min(2, 'Organization name is required').max(100, 'Organization name is too long'),
  organizationType: z.enum(['individual', 'business', 'government', 'nonprofit']),
  businessLicense: z.string().max(100, 'Business license is too long').optional(),
  taxId: z.string().max(100, 'Tax ID is too long').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SpaceProviderFormData = z.infer<typeof spaceProviderSchema>;

const SpaceProviderRegister: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SpaceProviderFormData>({
    resolver: zodResolver(spaceProviderSchema),
    defaultValues: {
      organizationType: 'business',
    },
  });

  const organizationType = watch('organizationType');

  const onSubmit = async (data: SpaceProviderFormData) => {
    setLoading(true);
    try {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userType: 'space_provider',
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        businessLicense: data.businessLicense,
        taxId: data.taxId,
      };

      const success = await signUp(data.email, data.password, userData);
      
      if (success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizationTypes = [
    { value: 'individual', label: 'Individual/Personal', icon: User },
    { value: 'business', label: 'Business/Company', icon: Building },
    { value: 'government', label: 'Government Entity', icon: MapPin },
    { value: 'nonprofit', label: 'Non-Profit Organization', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Become a Space Provider
          </h2>
          <p className="mt-2 text-gray-600">
            List your parking spaces and start earning revenue
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="First Name"
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Last Name"
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Phone Number"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Password"
                    type="password"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                  />
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
              
              <div className="mb-4">
                <Input
                  label="Organization Name"
                  {...register('organizationName')}
                  error={errors.organizationName?.message}
                  placeholder="Your business or organization name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {organizationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <label key={type.value} className="relative">
                        <input
                          type="radio"
                          value={type.value}
                          {...register('organizationType')}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          organizationType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-6 w-6 ${
                              organizationType === type.value ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              organizationType === type.value ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {type.label}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.organizationType && (
                  <p className="text-red-600 text-sm mt-1">{errors.organizationType.message}</p>
                )}
              </div>

              {organizationType === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Business License Number (Optional)"
                      {...register('businessLicense')}
                      placeholder="License or registration number"
                    />
                  </div>
                  <div>
                    <Input
                      label="Tax ID (Optional)"
                      {...register('taxId')}
                      placeholder="Tax identification number"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/register')}
              >
                Back to User Registration
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SpaceProviderRegister;
