'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BasicInfo, Details } from '@/types';
import { fetchBasicInfo } from '@/services/api/basicInfo';
import { fetchDetails } from '@/services/api/detailsInfo';
import styles from './EmployeesTable.module.css';
import { Pagination } from '@/services/api/types';

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
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const limit = 10;

  const loadEmployees = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch both APIs with same pagination
        const [basicInfoResponse, detailsResponse] = await Promise.all([
          fetchBasicInfo(page, limit),
          fetchDetails(page, limit),
        ]);

        // Merge page-scoped data (driven by details)
        const merged = mergeEmployeeData(basicInfoResponse.data, detailsResponse.data);
        setEmployees(merged);
        setCurrentPage(page);
        setPagination(detailsResponse);
      } catch (err) {
        console.error('Failed to load employees:', err);
        setError('Failed to load employees. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  const mergeEmployeeData = (
    basicInfoPage: BasicInfo[],
    detailsPage: Details[]
  ): MergedEmployee[] => {
    // Create a lookup map for the current page of basicInfo
    const basicInfoMap = new Map<string, BasicInfo>();
    basicInfoPage.forEach((basic) => {
      if (basic.email) basicInfoMap.set(basic.email, basic);
      if (basic.employeeId) basicInfoMap.set(basic.employeeId, basic);
    });

    // Drive from details (the superset) - always returns exactly detailsPage.length items
    return detailsPage.map((detail) => {
      // Try to find matching basicInfo by email or employeeId
      const basicInfo =
        basicInfoMap.get(detail.email || '') || basicInfoMap.get(detail.employeeId || '');

      if (basicInfo) {
        // Admin user: has both basicInfo and details
        return {
          employeeId: basicInfo.employeeId,
          fullName: basicInfo.fullName,
          email: basicInfo.email,
          department: basicInfo.department,
          role: basicInfo.role,
          photo: detail.photo,
          employmentType: detail.employmentType,
          officeLocation: detail.officeLocation,
          notes: detail.notes,
        };
      } else {
        // Ops user: only has details (no basicInfo on this page)
        return {
          employeeId: detail.employeeId || '—',
          fullName: '—',
          email: detail.email || '—',
          department: 'N/A',
          role: 'N/A',
          photo: detail.photo,
          employmentType: detail.employmentType,
          officeLocation: detail.officeLocation,
          notes: detail.notes,
        };
      }
    });
  };

  useEffect(() => {
    loadEmployees(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddEmployee = () => {
    router.push('/wizard');
  };

  const handlePageChange = (page: number) => {
    loadEmployees(page);
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

      {employees.length > 0 && pagination && pagination.pages > 1 && (
        <div className={styles.employeesTable__pagination}>
          <button
            onClick={() => handlePageChange(pagination.prev!)}
            disabled={pagination.prev === null}
            className={styles.employeesTable__pageButton}
          >
            Previous
          </button>
          <span className={styles.employeesTable__pageInfo}>
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.next!)}
            disabled={pagination.next === null}
            className={styles.employeesTable__pageButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
