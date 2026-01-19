import { Suspense } from 'react';
import { EmployeesTable } from '@/components/table/employees-table';

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <EmployeesTable />
    </Suspense>
  );
}
