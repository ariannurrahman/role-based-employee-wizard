'use client';

import { Role } from '@/types';
import styles from './RoleSelector.module.css';

/**
 * Props for the RoleSelector component
 * @interface RoleSelectorProps
 */
interface RoleSelectorProps {
  /** The currently selected role */
  value: Role;
  /** Callback function triggered when the role changes */
  onChange: (role: Role) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

const ROLES: Array<{ value: Role; label: string }> = [
  { value: 'admin', label: 'Admin' },
  { value: 'ops', label: 'Ops' },
];

export const RoleSelector = ({ value, onChange, disabled = false }: RoleSelectorProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as Role);
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
        className={styles.roleSelector__select}
        aria-label='Select user role'
      >
        {ROLES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
