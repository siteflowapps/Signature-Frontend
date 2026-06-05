import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../network/apiService';
import { UserRole } from '../types';
import { getErrorMessage } from '../utils/errorUtils';

export interface DistributorFormData {
  name: string;
  address: string;
  gstNumber: string;
  businessId: string;
  locationId: string;
  email: string;
  phone: string;
  dmsId: string;
}

const INITIAL_DISTRIBUTOR_DATA: DistributorFormData = {
  name: '',
  address: '',
  gstNumber: '',
  businessId: '',
  locationId: '',
  email: '',
  phone: '',
  dmsId: '',
};

// Alphanumeric check for GST
const isAlphanumeric = (str: string) => /^[a-zA-Z0-9]*$/.test(str);

/**
 * Custom hook encapsulating Distributor form logic.
 * SOLID: Single Responsibility Principle - Handles form state, validation, and submission.
 */
export const useDistributorForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<DistributorFormData>({ ...INITIAL_DISTRIBUTOR_DATA });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isBusinessAdmin = user?.role === UserRole.BUSINESS_ADMIN;
  
  // If Business Admin, pull businessId from their profile
  const effectiveBusinessId = isBusinessAdmin ? (user?.businessId || '') : formData.businessId;

  const isFormDirty = useCallback(() => {
    return !!formData.name || !!formData.address || !!formData.gstNumber || !!formData.email || !!formData.phone || !!formData.dmsId;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Auto-uppercase GST Number and enforce Alphanumeric
    if (name === 'gstNumber') {
      const upperValue = value.toUpperCase();
      if (isAlphanumeric(upperValue)) {
        setFormData(prev => ({ ...prev, [name]: upperValue }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Please enter distributor name';
    if (!formData.address.trim()) return 'Please enter office address';
    
    // GST Validation - Simplified: Alphanumeric and 15 chars
    const gst = formData.gstNumber.trim();
    if (!gst) return 'Please enter GST number';
    if (gst.length !== 15) return 'GST number must be exactly 15 characters';
    if (!isAlphanumeric(gst)) return 'Invalid GST number format (alphanumeric only)';

    if (!effectiveBusinessId) return 'Please select a business';
    if (!formData.locationId) return 'Please select a location';
    if (!formData.dmsId.trim()) return 'Please enter DMS ID';

    // Contact details are mandatory
    const email = formData.email.trim();
    if (!email) return 'Please enter an email address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';

    const phone = formData.phone.trim();
    if (!phone) return 'Please enter a phone number';
    if (!/^\d{10}$/.test(phone)) return 'Phone number must be exactly 10 digits';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        businessId: effectiveBusinessId,
      };

      const response = await apiService.distributors.create(payload);
      if (response.success) {
        setIsSuccess(true);
        showToast(`Distributor "${formData.name}" created successfully!`, 'success');
        setTimeout(() => navigate('/distributors'), 1500);
      } else {
        showToast(response.error || 'Failed to create distributor', 'error');
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isFormDirty()) {
      if (window.confirm('You have unsaved changes. Discard?')) {
        navigate('/distributors');
      }
    } else {
      navigate('/distributors');
    }
  };

  return {
    formData,
    isSubmitting,
    isSuccess,
    isAdmin,
    isBusinessAdmin,
    handleChange,
    handleSubmit,
    handleCancel,
  };
};
