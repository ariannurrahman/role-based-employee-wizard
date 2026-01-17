'use client';

import { Role } from '@/types';
import styles from './StepIndicator.module.css';

/**
 * Represents a single step in the wizard process
 * @interface Step
 */
export interface Step {
  /** The step number (1-based index) */
  number: number;
  /** Display label for the step */
  label: string;
  /** Whether this step is currently active */
  isActive: boolean;
  /** Whether this step has been completed */
  isCompleted: boolean;
  /** Whether this step is disabled (not accessible) */
  isDisabled: boolean;
}

/**
 * Props for the StepIndicator component
 * @interface StepIndicatorProps
 */
interface StepIndicatorProps {
  /** The current active step number */
  currentStep: number;
  /** The user's role, determines step accessibility */
  role: Role;
  /** Total number of steps in the wizard */
  totalSteps?: number;
}

const STEP_CONFIG = {
  1: { label: 'Basic Info' },
  2: { label: 'Details' },
} as const;

export const StepIndicator = ({ currentStep, role, totalSteps = 2 }: StepIndicatorProps) => {
  const isOpsRole = role === 'ops';

  const getSteps = (): Step[] => {
    const steps: Step[] = [];

    for (let i = 1; i <= totalSteps; i++) {
      const config = STEP_CONFIG[i as keyof typeof STEP_CONFIG];
      const isStepOneForOps = i === 1 && isOpsRole;

      steps.push({
        number: i,
        label: isStepOneForOps ? `${config.label} (Admin Only)` : config.label,
        isActive: currentStep === i && !isStepOneForOps,
        isCompleted: currentStep > i && !isStepOneForOps,
        isDisabled: isStepOneForOps,
      });
    }

    return steps;
  };

  const steps = getSteps();

  return (
    <div className={styles.stepIndicator} role='navigation' aria-label='Form steps'>
      <div className={isOpsRole ? styles.stepIndicator__opsLayout : styles.stepIndicator__layout}>
        {steps.map((step, index) => (
          <div key={step.number} className={styles.stepIndicator__wrapper}>
            <div
              className={`${styles.stepIndicator__step} ${step.isActive ? styles['stepIndicator__step--active'] : ''} ${
                step.isCompleted ? styles['stepIndicator__step--completed'] : ''
              } ${step.isDisabled ? styles['stepIndicator__step--disabled'] : ''}`}
              aria-current={step.isActive ? 'step' : undefined}
              aria-disabled={step.isDisabled}
            >
              <span className={styles.stepIndicator__number}>{step.number}</span>
              <span className={styles.stepIndicator__label}>{step.label}</span>
            </div>
            {index < steps.length - 1 && <div className={styles.stepIndicator__connector} aria-hidden='true' />}
          </div>
        ))}
      </div>
    </div>
  );
};
