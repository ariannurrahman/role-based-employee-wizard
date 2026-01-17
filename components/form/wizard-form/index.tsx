'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BasicInfo, Details, Role } from '@/types';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { BasicInfoForm } from '@/components/form/basic-info-form';
import { DetailInfoForm } from '@/components/form/detail-info-form';
import { RoleSelector } from '@/components/role-selector';
import { StepIndicator } from '@/components/step-indicator';
import { validateBasicInfo, validateDetails } from '@/utils/validation';
import { saveDraft, loadDraft, clearDraft } from '@/utils/storage';
import { submitBasicInfo, BasicInfoPayload } from '@/services/api/basicInfo';
import { submitDetails, DetailsPayload } from '@/services/api/detailsInfo';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasMountedRef = useRef(false);

  // Load draft on mount when role changes
  useEffect(() => {
    if (role) {
      // Use requestAnimationFrame to defer setState and avoid cascading renders
      requestAnimationFrame(() => {
        const draft = loadDraft(role);
        if (draft) {
          if (draft.basicInfo) {
            setBasicInfo(draft.basicInfo);
          }
          if (draft.details) {
            setDetails(draft.details);
          }
        }
      });
    }
  }, [role]);

  // Auto-save draft every 2 seconds when data changes
  useEffect(() => {
    // Skip save on initial mount
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Don't save if role is invalid
    if (!role) {
      return;
    }

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Save after 2 seconds of inactivity
    saveTimerRef.current = setTimeout(() => {
      setIsSaving(true);

      const hasBasicInfo = Object.keys(basicInfo).length > 0;
      const hasDetails = Object.keys(details).length > 0;

      if (hasBasicInfo || hasDetails) {
        saveDraft(role, {
          basicInfo: hasBasicInfo ? basicInfo : undefined,
          details: hasDetails ? details : undefined,
        });
        setLastSaved(new Date());
      }

      setIsSaving(false);
    }, 2000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [role, basicInfo, details]);

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
  const handleSubmit = useCallback(async () => {
    if (!isValidDetailsForm || !role) return;

    setIsSubmitting(true);
    setProgress(0);
    setLogs([]);

    try {
      // Step 1: Submit Basic Info (Admin only)
      if (role === 'admin' && basicInfo) {
        setLogs((prev) => [...prev, '⏳ Submitting basicInfo...']);
        setProgress(25);

        const basicInfoPayload: BasicInfoPayload = {
          fullName: basicInfo.fullName || '',
          email: basicInfo.email || '',
          department: basicInfo.department || '',
          role: basicInfo.role || '',
          employeeId: basicInfo.employeeId || '',
        };

        await submitBasicInfo(basicInfoPayload);

        setLogs((prev) => [...prev, '✅ basicInfo saved!']);
        setProgress(50);
      } else {
        // For Ops, skip to 50% since they don't submit basicInfo
        setProgress(50);
      }

      // Step 2: Submit Details
      setLogs((prev) => [...prev, '⏳ Submitting details...']);
      setProgress(75);

      const detailsPayload: DetailsPayload = {
        email: basicInfo.email || '',
        employeeId: basicInfo.employeeId || '',
        photo: details.photo,
        employmentType: details.employmentType,
        officeLocation: details.officeLocation,
        notes: details.notes,
      };

      await submitDetails(detailsPayload);

      setLogs((prev) => [...prev, '✅ details saved!']);
      setProgress(100);
      setLogs((prev) => [...prev, '🎉 All data processed successfully!']);

      // Clear the draft after successful submission
      clearDraft(role);
      setLastSaved(null);

      // Redirect to employees list after a short delay
      setTimeout(() => {
        router.push('/employees');
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setLogs((prev) => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Submission failed'}`]);
      setProgress(0);
      setIsSubmitting(false);
    }
  }, [isValidDetailsForm, role, basicInfo, details, router]);

  /** Returns to the previous step (Admin only) */
  const handleBack = () => {
    if (currentStep === 2 && role === 'admin') {
      setCurrentStep(1);
    }
  };

  /** Clears the draft for the current role */
  const handleClearDraft = useCallback(() => {
    if (!role) return;

    const confirmClear = window.confirm(
      `Are you sure you want to clear the draft for ${
        role === 'admin' ? 'Admin' : 'Ops'
      } role?\n\nThis will delete all unsaved form data.`,
    );

    if (confirmClear) {
      // Clear from localStorage
      clearDraft(role);

      // Reset form state
      setBasicInfo({});
      setDetails({});
      setLastSaved(null);

      // Reset to first step
      setCurrentStep(role === 'ops' ? 2 : 1);
    }
  }, [role]);

  return (
    <div className={styles.wizardForm}>
      <header className={styles.wizardForm__header}>
        <div className={styles.wizardForm__headerTop}>
          <h1 className={styles.wizardForm__title}>Employee Wizard</h1>
          <div className={styles.wizardForm__roleSelectorWrapper}>
            <RoleSelector value={role || ''} onChange={handleRoleChange} hasError={showInvalidRoleError} />
            {showInvalidRoleError && (
              <span className={styles.wizardForm__errorMessage}>Invalid role in URL. Please select a valid role.</span>
            )}
          </div>
        </div>
        {shouldRenderForms && (
          <div className={styles.wizardForm__draftStatus}>
            <div className={styles.wizardForm__draftStatusLeft}>
              {isSaving ? (
                <span className={styles.wizardForm__savingIndicator}>
                  <span className={styles.wizardForm__savingDot}></span>
                  Saving draft...
                </span>
              ) : lastSaved ? (
                <span className={styles.wizardForm__savedIndicator}>
                  ✓ Draft saved at {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
            {(lastSaved || Object.keys(basicInfo).length > 0 || Object.keys(details).length > 0) && (
              <button
                type='button'
                onClick={handleClearDraft}
                className={styles.wizardForm__clearDraftButton}
                title='Clear draft for current role'
              >
                🗑️ Clear Draft
              </button>
            )}
          </div>
        )}
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
