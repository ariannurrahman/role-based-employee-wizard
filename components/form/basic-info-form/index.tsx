'use client';

import { BasicInfo, EmployeeRole } from '@/types';
import styles from './BasicInfoForm.module.css';
import { useState, useCallback } from 'react';
import { validateEmail } from '@/utils/validation';
import { Autocomplete } from '@/components/autocomplete';
import { fetchBasicInfo, fetchDepartments } from '@/services/api/basicInfo';
import { generateEmployeeId } from '@/utils/generateEmployeeId';

/**
 * Props for the BasicInfoForm component
 * @interface BasicInfoFormProps
 */

interface BasicInfoFormProps {
  /** The current data for the basic information form */
  data: Partial<BasicInfo>;
  /** Callback function triggered when the data changes */
  onChange: (data: Partial<BasicInfo>) => void;
  /** Callback function triggered when the next button is clicked */
  onNext: () => void;
  /** Whether the form is valid */
  isValidForm: boolean;
}

const EMPLOYEE_ROLES = ['Ops', 'Admin', 'Engineer', 'Finance'];

export const BasicInfoForm = ({ data, onChange, onNext, isValidForm }: BasicInfoFormProps) => {
  const [emailError, setEmailError] = useState<string>('');

  const handleEmailChange = (value: string) => {
    onChange({ ...data, email: value });
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const generateAndSetEmployeeId = useCallback(
    async (department: string, role: EmployeeRole) => {
      try {
        const existing = await fetchBasicInfo();
        const deptCount = existing.data.filter((emp) => emp.department === department).length;
        const employeeId = generateEmployeeId(department, deptCount);
        onChange({ ...data, department, role, employeeId });
      } catch (error) {
        console.error(error);
      }
    },
    [data, onChange],
  );

  const handleDepartmentChange = useCallback(
    (department: string) => {
      if (data.role && department) {
        generateAndSetEmployeeId(department, data.role);
      } else {
        onChange({ ...data, department });
      }
    },
    [data, generateAndSetEmployeeId, onChange],
  );

  const handleRoleChange = useCallback(
    (role: EmployeeRole) => {
      if (data.department && role) {
        generateAndSetEmployeeId(data.department, role);
      } else {
        onChange({ ...data, role });
      }
    },
    [data, generateAndSetEmployeeId, onChange],
  );

  const handleFetchDepartments = useCallback((query: string) => {
    return fetchDepartments(query);
  }, []);

  return (
    <div className={styles.basicInfoForm}>
      <h2 className={styles.basicInfoForm__title}>Basic Information</h2>
      <form className={styles.basicInfoForm__form}>
        <div className={styles.basicInfoForm__field}>
          <label htmlFor='fullName' className={styles.basicInfoForm__label}>
            Full Name
          </label>
          <input
            id='fullName'
            type='text'
            value={data.fullName || ''}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            className={styles.basicInfoForm__input}
            placeholder='Enter full name'
          />
        </div>

        <div className={styles.basicInfoForm__field}>
          <label htmlFor='email' className={styles.basicInfoForm__label}>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={data.email || ''}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`${styles.basicInfoForm__input} ${emailError ? styles['basicInfoForm__input--error'] : ''}`}
            placeholder='Enter email address'
          />
          {emailError && <span className={styles.basicInfoForm__error}>{emailError}</span>}
        </div>

        <Autocomplete
          value={data.department || ''}
          onSelect={handleDepartmentChange}
          fetchOptions={handleFetchDepartments}
          placeholder='Search department'
          label='Department'
          id='department'
        />

        <div className={styles.basicInfoForm__field}>
          <label htmlFor='role' className={styles.basicInfoForm__label}>
            Role
          </label>
          <select
            id='role'
            value={data.role || ''}
            onChange={(e) => handleRoleChange(e.target.value as EmployeeRole)}
            className={styles.basicInfoForm__select}
          >
            <option value=''>Select role</option>
            {EMPLOYEE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.basicInfoForm__field}>
          <label htmlFor='employeeId' className={styles.basicInfoForm__label}>
            Employee ID
          </label>
          <input
            id='employeeId'
            type='text'
            value={data.employeeId || ''}
            className={`${styles.basicInfoForm__input} ${styles['basicInfoForm__input--readonly']}`}
            readOnly
            placeholder='Auto-generated'
          />
        </div>

        {isValidForm && (
          <button
            type='button'
            onClick={onNext}
            disabled={!isValidForm}
            className={`${styles.basicInfoForm__button} ${
              !isValidForm ? styles['basicInfoForm__button--disabled'] : ''
            }`}
          >
            Next
          </button>
        )}
      </form>
    </div>
  );
};
