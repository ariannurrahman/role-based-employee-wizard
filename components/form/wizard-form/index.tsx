'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BasicInfo, Details, Role } from '@/types';
import { useMemo, useState } from 'react';
import { BasicInfoForm } from '@/components/form/basic-info-form';
import { DetailInfoForm } from '@/components/form/detail-info-form';
import { RoleSelector } from '@/components/role-selector';
import { StepIndicator } from '@/components/step-indicator';
import { validateBasicInfo, validateDetails } from '@/utils/validation';
import styles from './WizardForm.module.css';

/**
 * WizardForm Component
 *
 * A multi-step form wizard with role-based access control.
 * Manages the employee onboarding process across two steps:
 * - Step 1: Basic Information (Admin only)
 * - Step 2: Details (Admin and Ops)
 *
 * Features:
 * - Role-based step access control
 * - URL synchronization for role parameter
 * - Form state management across steps
 * - Validation for each step
 * - Navigation between steps (for Admin users)
 *
 * @component
 * @example
 * ```tsx
 * <WizardForm />
 * ```
 *
 * @returns {JSX.Element} The complete wizard form with role-based navigation
 */
const VALID_ROLES: Role[] = ['admin', 'ops'];

/**
 * Validates if a string is a valid Role
 */
const isValidRole = (value: string | null): value is Role => {
  return value !== null && VALID_ROLES.includes(value as Role);
};

export const WizardForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Validate role from URL
  const urlRoleParam = searchParams.get('role');
  const hasInvalidRole = urlRoleParam !== null && !isValidRole(urlRoleParam);

  // Default to 'admin' only if no role param exists, otherwise use null for invalid roles
  const initialRole = urlRoleParam === null ? 'admin' : isValidRole(urlRoleParam) ? urlRoleParam : null;

  const [role, setRole] = useState<Role | null>(initialRole);
  const [currentStep, setCurrentStep] = useState<1 | 2>(role === 'ops' ? 2 : 1);
  const [showInvalidRoleError, setShowInvalidRoleError] = useState(hasInvalidRole);

  const [basicInfo, setBasicInfo] = useState<Partial<BasicInfo>>({});
  const [details, setDetails] = useState<Partial<Details>>({});

  const [isSubmitting] = useState(false);
  const [progress] = useState(0);
  const [logs] = useState<string[]>([]);

  /**
   * Handles role change and updates URL parameters
   * Resets to appropriate step based on new role
   */
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setCurrentStep(newRole === 'ops' ? 2 : 1);
    setShowInvalidRoleError(false);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('role', newRole);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Don't render forms if role is invalid
  const shouldRenderForms = role !== null;

  /** Validates basic information form fields */
  const isValidBasicInfoForm = useMemo(() => {
    return validateBasicInfo({
      fullName: basicInfo.fullName || '',
      email: basicInfo.email || '',
      department: basicInfo.department || '',
      role: basicInfo.role || '',
    });
  }, [basicInfo]);

  /** Validates details form fields */
  const isValidDetailsForm = useMemo(() => {
    return validateDetails({
      photo: details.photo,
      employmentType: details.employmentType,
      officeLocation: details.officeLocation,
      notes: details.notes,
    });
  }, [details]);

  /** Updates basic information state */
  const handleBasicInfoChange = (data: Partial<BasicInfo>) => {
    setBasicInfo(data);
  };

  /** Updates details state */
  const handleDetailsChange = (data: Partial<Details>) => {
    setDetails(data);
  };

  /** Advances to the next step if current step is valid */
  const handleNext = () => {
    if (isValidBasicInfoForm) {
      setCurrentStep(2);
    }
  };

  /** Handles final form submission */
  const handleSubmit = () => {
    if (isValidDetailsForm) {
      console.log('submit');
      // Add your submit logic here
    }
  };

  /** Returns to the previous step (Admin only) */
  const handleBack = () => {
    if (currentStep === 2 && role === 'admin') {
      setCurrentStep(1);
    }
  };

  return (
    <div className={styles.wizardForm}>
      <header className={styles.wizardForm__header}>
        <h1 className={styles.wizardForm__title}>Employee Wizard</h1>
        <div className={styles.wizardForm__roleSelectorWrapper}>
          <RoleSelector value={role || ''} onChange={handleRoleChange} hasError={showInvalidRoleError} />
          {showInvalidRoleError && (
            <span className={styles.wizardForm__errorMessage}>Invalid role in URL. Please select a valid role.</span>
          )}
        </div>
      </header>

      {shouldRenderForms ? (
        <>
          <StepIndicator currentStep={currentStep} role={role} totalSteps={2} />

          <main className={styles.wizardForm__content}>
            {currentStep === 1 && role === 'admin' && (
              <BasicInfoForm
                data={basicInfo}
                onChange={handleBasicInfoChange}
                onNext={handleNext}
                isValidForm={isValidBasicInfoForm}
              />
            )}

            {currentStep === 2 && (
              <>
                {role === 'admin' && (
                  <button type='button' onClick={handleBack} className={styles.wizardForm__backButton}>
                    ← Back to Basic Info
                  </button>
                )}
                <DetailInfoForm
                  data={details}
                  onChange={handleDetailsChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  progress={progress}
                  logs={logs}
                  isValidForm={isValidDetailsForm}
                />
              </>
            )}
          </main>
        </>
      ) : (
        <div className={styles.wizardForm__invalidState}>
          <div className={styles.wizardForm__invalidIcon}>⚠️</div>
          <p className={styles.wizardForm__invalidText}>Please select a valid role to continue</p>
        </div>
      )}
    </div>
  );
};
