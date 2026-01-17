'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BasicInfo, Details } from '@/types';
import { fetchBasicInfo } from '@/services/api/basicInfo';
import { fetchDetails } from '@/services/api/detailsInfo';
import styles from './EmployeesTable.module.css';

interface MergedEmployee {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  role: string;
  officeLocation?: string;
  photo?: string;
  employmentType?: string;
  notes?: string;
}

export const EmployeesTable = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState<MergedEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const loadEmployees = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const [basicInfoData, detailsData] = await Promise.all([fetchBasicInfo(page, limit), fetchDetails(page, limit)]);

      // Merge data using email or employeeId as identifier
      const merged = mergeEmployeeData(basicInfoData, detailsData as Details[]);
      setEmployees(merged);

      // Calculate total pages (assuming both APIs return similar counts)
      // In a real app, you'd get this from response headers or API
      setTotalPages(Math.max(1, Math.ceil(merged.length / limit)));
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mergeEmployeeData = (basicInfo: BasicInfo[], details: Details[]): MergedEmployee[] => {
    const detailsMap = new Map<string, Details>();

    // Build map with both email and employeeId as keys for flexible merging
    details.forEach((d) => {
      if (d.email) detailsMap.set(d.email, d);
      if (d.employeeId) detailsMap.set(d.employeeId, d);
    });

    return basicInfo.map((basic) => {
      // Find matching details using email or employeeId
      const detail = detailsMap.get(basic.email) || detailsMap.get(basic.employeeId);

      return {
        // From BasicInfo (port 4001)
        employeeId: basic.employeeId,
        fullName: basic.fullName,
        email: basic.email,
        department: basic.department,
        role: basic.role,
        // From Details (port 4002)
        photo: detail?.photo,
        employmentType: detail?.employmentType,
        officeLocation: detail?.officeLocation,
        notes: detail?.notes,
      };
    });
  };

  useEffect(() => {
    loadEmployees(currentPage);
  }, [currentPage, loadEmployees]);

  const handleAddEmployee = () => {
    router.push('/wizard');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className={styles.employeesTable}>
        <div className={styles.employeesTable__loading}>Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.employeesTable}>
        <div className={styles.employeesTable__error}>{error}</div>
      </div>
    );
  }
  console.log('employees', employees);

  return (
    <div className={styles.employeesTable}>
      <div className={styles.employeesTable__header}>
        <h1 className={styles.employeesTable__title}>Employee List</h1>
        <button onClick={handleAddEmployee} className={styles.employeesTable__addButton}>
          + Add Employee
        </button>
      </div>

      <div className={styles.employeesTable__tableWrapper}>
        <table className={styles.employeesTable__table}>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.employeesTable__empty}>
                  No employees found. Click &quot;+ Add Employee&quot; to add one.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td>
                    {employee.photo ? (
                      <Image
                        src={employee.photo}
                        alt={employee.fullName}
                        width={40}
                        height={40}
                        className={styles.employeesTable__photo}
                      />
                    ) : (
                      <div className={styles.employeesTable__photoPlaceholder}>—</div>
                    )}
                  </td>
                  <td>{employee.fullName || '—'}</td>
                  <td>{employee.department || 'N/A'}</td>
                  <td>{employee.role || 'N/A'}</td>
                  <td>{employee.officeLocation || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {employees.length > 0 && totalPages > 1 && (
        <div className={styles.employeesTable__pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.employeesTable__pageButton}
          >
            Previous
          </button>
          <span className={styles.employeesTable__pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.employeesTable__pageButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
