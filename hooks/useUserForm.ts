import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../network/apiService';
import { UserRole } from '../types';
import { ROLE_CONFIG, getAvailableRoles } from '../utils/roleConfig';
import { getErrorMessage } from '../utils/errorUtils';

export interface UserFormData {
  name: string;
  phone: string;
  role: string;
  businessId: string;
  locationId: string;
  parentUserId: string;
  distributorIds: string[];
}

const INITIAL_FORM_DATA: UserFormData = {
  name: '',
  phone: '',
  role: 'BUSINESS_USER',
  businessId: '',
  locationId: '',
  parentUserId: '',
  distributorIds: [],
};

/**
 * Custom hook encapsulating all Add User form logic.
 * Single Responsibility: Only handles form state, validation, and submission.
 */
export const useUserForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<UserFormData>({ ...INITIAL_FORM_DATA });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isBusinessAdmin = user?.role === UserRole.BUSINESS_ADMIN;
  const businessId = isBusinessAdmin ? user?.businessId : formData.businessId;

  const availableRoles = getAvailableRoles(isAdmin, isBusinessAdmin);

  // Derive role config from centralized ROLE_CONFIG
  const currentRoleConfig = ROLE_CONFIG[formData.role];
  const isFieldRole = currentRoleConfig?.isFieldRole ?? false;
  const parentRole = currentRoleConfig?.parentRole;

  // Track if form is dirty
  const isFormDirty = useCallback(() => {
    return !!formData.name || !!formData.phone;
  }, [formData.name, formData.phone]);

  // Warn before browser navigation if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty()) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  // Clear parentUserId when role changes
  useEffect(() => {
    const config = ROLE_CONFIG[formData.role];
    if (!config?.parentRole) {
      setFormData(prev => ({ ...prev, parentUserId: '' }));
    }
  }, [formData.role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Name: letters and spaces only, max 50 chars
    if (name === 'name') {
      const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
      return;
    }

    // Numeric only and max 10 chars for phone
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!formData.name) return 'Please enter the full name';
    if (formData.name.trim().length < 2) return 'Name must be at least 2 characters long';
    if (!formData.phone) return 'Please enter a phone number';
    if (formData.phone.length !== 10) return 'Please enter a valid 10-digit phone number';

    if (parentRole && !formData.parentUserId) {
      const parentLabel = ROLE_CONFIG[parentRole]?.label || parentRole;
      return `Please select a ${parentLabel}`;
    }

    if (formData.role === 'ASE' && (!formData.distributorIds || formData.distributorIds.length === 0)) {
      return 'Please select at least one Distributor for ASE user';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const error = validate();
      if (error) {
        showToast(error, 'error', 3000);
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        authType: 'OTP',
        businessId: businessId || '',
        locationId: formData.locationId || undefined,
        parentUserId: parentRole ? formData.parentUserId : undefined,
        distributorIds: formData.role === 'ASE' ? formData.distributorIds : undefined,
      };

      const response = await apiService.users.create(payload);

      if (response.success) {
        setIsSuccess(true);
        showToast(`User "${formData.name}" added successfully!`, 'success', 3000);
        setIsSubmitting(false);
        setTimeout(() => navigate('/users'), 2000);
      } else {
        showToast(response.error || 'Failed to create user', 'error', 4000);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error', 4000);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isFormDirty()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return {
    formData,
    isSubmitting,
    isSuccess,
    isFieldRole,
    parentRole,
    availableRoles,
    currentRoleConfig,
    businessId,
    handleChange,
    handleSubmit,
    handleCancel,
  };
};
