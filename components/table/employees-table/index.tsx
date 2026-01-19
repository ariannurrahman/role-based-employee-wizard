'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { fetchBasicInfo } from '@/services/api/basicInfo';
import { fetchDetails } from '@/services/api/detailsInfo';
import styles from './EmployeesTable.module.css';
import { Pagination } from '@/services/api/types';
import { MergedEmployee, mergeEmployeeData } from './utils';

const LIMIT_OPTIONS = [1, 5, 10, 20, 50];

export const EmployeesTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState<MergedEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get initial values from URL or use defaults
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const limitFromUrl = parseInt(searchParams.get('limit') || '10', 10);
  
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [limit, setLimit] = useState(limitFromUrl);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Update URL parameters
  const updateUrl = useCallback((page: number, itemsPerPage: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', itemsPerPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const loadEmployees = useCallback(
    async (page: number, itemsPerPage: number) => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch both APIs with same pagination
        const [basicInfoResponse, detailsResponse] = await Promise.all([
          fetchBasicInfo(page, itemsPerPage),
          fetchDetails(page, itemsPerPage),
        ]);

        // Merge page-scoped data (driven by details)
        const merged = mergeEmployeeData(basicInfoResponse.data, detailsResponse.data);
        setEmployees(merged);
        setCurrentPage(page);
        setPagination(detailsResponse);
      } catch (err) {
        console.error('Failed to load employees:', err);
        setError(err instanceof Error ? err.message : 'Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEmployees(currentPage, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const handleAddEmployee = () => {
    router.push('/wizard');
  };

  const handlePageChange = (page: number) => {
    updateUrl(page, limit);
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    // Reset to page 1 when changing limit
    updateUrl(1, newLimit);
    setLimit(newLimit);
    setCurrentPage(1);
  };
 
 

  return (
    <div className={styles.employeesTable}>
      
      <div className={styles.employeesTable__header}>
        <h1 className={styles.employeesTable__title}>Employee List</h1>
        <div className={styles.employeesTable__headerActions}>
          <div className={styles.employeesTable__limitSelector}>
            <label htmlFor="limit-select" className={styles.employeesTable__limitLabel}>
              Show:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className={styles.employeesTable__limitSelect}
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className={styles.employeesTable__limitLabel}>per page</span>
          </div>
          <button onClick={handleAddEmployee} className={styles.employeesTable__addButton}>
            + Add Employee
          </button>
        </div>
      </div>
      
      {error && ( <div className={styles.employeesTable__errorContainer}>
        <div className={styles.employeesTable__error}>{error}</div>
      </div> )}
 
 
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

            {isLoading ? 
              <tr>
                <td colSpan={5} className={styles.employeesTable__loading}>Loading employees...</td>
              </tr>
            : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.employeesTable__empty}>
                  No employees found. Click &quot;+ Add Employee&quot; to add one.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
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
