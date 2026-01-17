'use client';

import { BasicInfoForm } from '@/components/form/basic-info-form';
import { DetailInfoForm } from '@/components/form/detail-info-form';
import { RoleSelector } from '@/components/role-selector';
import { StepIndicator } from '@/components/step-indicator';

import styles from './WizardForm.module.css';
import { useWizardForm } from './useWizardForm';
import { useRouter } from 'next/navigation';
export const WizardForm = () => {
  const router = useRouter();
  const {
    role,
    currentStep,
    isSubmitting,
    handleRoleChange,
    showInvalidRoleError,
    shouldRenderForms,
    isSaving,
    lastSaved,
    basicInfo,
    details,
    handleBasicInfoChange,
    handleDetailsChange,
    handleNext,
    handleBack,
    handleSubmit,
    isValidBasicInfoForm,
    isValidDetailsForm,
    handleClearDraft,
    progress,
    logs,
  } = useWizardForm();
 
  const onClickBack = () => {
    router.push('/employees');
  };

  return (
    <div className={styles.wizardForm}>
      <header className={styles.wizardForm__header}>
        <div className={styles.wizardForm__headerTop}>
          <h1 className={styles.wizardForm__title}><button type='button' aria-label='Back to employee list' className={styles.wizardForm__backToEmployeeButton} onClick={onClickBack}>←</button> Employee Wizard</h1>
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

      {shouldRenderForms && role ? (
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
