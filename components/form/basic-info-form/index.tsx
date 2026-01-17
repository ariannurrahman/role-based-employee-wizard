'use client';

import { BasicInfo, EmployeeRole } from '@/types';
import styles from './BasicInfoForm.module.css';
import { useState, useCallback } from 'react';
import { validateEmail } from '@/utils/validation';
import { Autocomplete } from '@/components/autocomplete';
import { fetchDepartments } from '@/services/api/basicInfo';

interface BasicInfoFormProps {
  data: Partial<BasicInfo>;
  onChange: (data: Partial<BasicInfo>) => void;
  onNext: () => void;
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

  const handleFetchDepartments = useCallback((query: string) => {
    return fetchDepartments(query);
  }, []);

  return (
    <div className={styles.basicInfoForm}>
      <h2 className={styles.title}>Basic Information</h2>
      <form className={styles.form}>
        <div className={styles.field}>
          <label htmlFor='fullName' className={styles.label}>
            Full Name
          </label>
          <input
            id='fullName'
            type='text'
            value={data.fullName || ''}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            className={styles.input}
            placeholder='Enter full name'
          />
        </div>

        <div className={styles.field}>
          <label htmlFor='email' className={styles.label}>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={data.email || ''}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`${styles.input} ${emailError ? styles.inputError : ''}`}
            placeholder='Enter email address'
          />
          {emailError && <span className={styles.error}>{emailError}</span>}
        </div>

        <Autocomplete
          value={data.department || ''}
          onSelect={(value) => onChange({ ...data, department: value })}
          fetchOptions={handleFetchDepartments}
          placeholder='Search department'
          label='Department'
          id='department'
        />

        <div className={styles.field}>
          <label htmlFor='role' className={styles.label}>
            Role
          </label>
          <select
            id='role'
            value={data.role || ''}
            onChange={(e) => onChange({ ...data, role: e.target.value as EmployeeRole })}
            className={styles.select}
          >
            <option value=''>Select role</option>
            {EMPLOYEE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor='employeeId' className={styles.label}>
            Employee ID
          </label>
          <input
            id='employeeId'
            type='text'
            value={data.employeeId || ''}
            className={`${styles.input} ${styles.inputReadonly}`}
            readOnly
            placeholder='Auto-generated'
          />
        </div>

        {isValidForm && (
          <button
            type='button'
            onClick={onNext}
            disabled={!isValidForm}
            className={`${styles.button} ${!isValidForm ? styles.buttonDisabled : ''}`}
          >
            Next
          </button>
        )}
      </form>
    </div>
  );
};
