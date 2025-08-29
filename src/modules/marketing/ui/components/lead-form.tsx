/**
 * Lead Form Component
 * UI layer - React component for lead capture form
 */

'use client';

import { useState } from 'react';

import { LeadSource } from '../../domain/entities/lead';

export interface LeadFormData {
  email: string;
  phoneNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  source: LeadSource;
  interestedFeatures?: string[];
  notes?: string;
}

export interface LeadFormProps {
  source: LeadSource;
  onSubmit: (data: LeadFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  featuresOptions?: string[];
  title?: string;
  description?: string;
}

const DEFAULT_FEATURES = [
  'WhatsApp Business API Integration',
  'Multi-channel Bot Platform',
  'AI-powered Customer Support',
  'Analytics & Reporting',
  'CRM Integration',
  'Message Templates',
  'Broadcast Messaging',
  'Webhook Management',
];

/**
 * Lead capture form component
 * Handles user input validation and submission
 */
export function LeadForm({
  source,
  onSubmit,
  isLoading = false,
  className = '',
  featuresOptions = DEFAULT_FEATURES,
  title = 'Get Started with WhatsApp Cloud API',
  description = 'Join thousands of businesses already using our platform',
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    email: '',
    phoneNumber: '',
    companyName: '',
    firstName: '',
    lastName: '',
    source,
    interestedFeatures: [],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation (if provided)
    if (formData.phoneNumber?.trim() && !formData.phoneNumber.startsWith('+')) {
      newErrors.phoneNumber = 'Phone number must include country code (e.g., +1234567890)';
    }

    // First name validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        companyName: formData.companyName?.trim() || undefined,
        firstName: formData.firstName?.trim() || undefined,
        lastName: formData.lastName?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = formData.interestedFeatures || [];
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];

    setFormData(prev => ({
      ...prev,
      interestedFeatures: updatedFeatures,
    }));
  };

  const inputClassName = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";
  const errorClassName = "text-red-500 text-sm mt-1";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className={`bg-white rounded-xl shadow-xl p-8 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClassName}>
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className={inputClassName}
              placeholder="John"
              disabled={isSubmitting || isLoading}
            />
            {errors.firstName && <p className={errorClassName}>{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className={labelClassName}>
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className={inputClassName}
              placeholder="Doe"
              disabled={isSubmitting || isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClassName}>
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={inputClassName}
            placeholder="john@company.com"
            disabled={isSubmitting || isLoading}
          />
          {errors.email && <p className={errorClassName}>{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phoneNumber" className={labelClassName}>
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            className={inputClassName}
            placeholder="+1234567890"
            disabled={isSubmitting || isLoading}
          />
          {errors.phoneNumber && <p className={errorClassName}>{errors.phoneNumber}</p>}
          <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
        </div>

        {/* Company */}
        <div>
          <label htmlFor="companyName" className={labelClassName}>
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className={inputClassName}
            placeholder="Acme Corp"
            disabled={isSubmitting || isLoading}
          />
        </div>

        {/* Interested Features */}
        <div>
          <label className={labelClassName}>
            Interested Features (select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featuresOptions.map((feature) => (
              <label key={feature} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interestedFeatures?.includes(feature) || false}
                  onChange={() => handleFeatureToggle(feature)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={isSubmitting || isLoading}
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className={labelClassName}>
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className={`${inputClassName} h-24 resize-none`}
            placeholder="Tell us about your specific needs or questions..."
            disabled={isSubmitting || isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {(isSubmitting || isLoading) ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Get Started Now'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting this form, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}