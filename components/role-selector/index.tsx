'use client';

import { Role } from '@/types';
import styles from './RoleSelector.module.css';

/**
 * Props for the RoleSelector component
 * @interface RoleSelectorProps
 */
interface RoleSelectorProps {
  /** The currently selected role (or empty string for no selection) */
  value: Role | '';
  /** Callback function triggered when the role changes */
  onChange: (role: Role) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Whether the selector has an error state */
  hasError?: boolean;
}

const ROLES: Array<{ value: Role; label: string }> = [
  { value: 'admin', label: 'Admin' },
  { value: 'ops', label: 'Ops' },
];

export const RoleSelector = ({ value, onChange, disabled = false, hasError = false }: RoleSelectorProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
      onChange(selectedValue as Role);
    }
  };

  return (
    <div className={styles.roleSelector}>
      <label htmlFor='role' className={styles.roleSelector__label}>
        Your Role:
      </label>
      <select
        id='role'
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`${styles.roleSelector__select} ${hasError ? styles['roleSelector__select--error'] : ''}`}
        aria-label='Select user role'
        aria-invalid={hasError}
      >
        {value === '' && (
          <option value='' disabled>
            -- Select a role --
          </option>
        )}
        {ROLES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
