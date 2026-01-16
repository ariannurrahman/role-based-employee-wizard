import { fetchBasicInfo, fetchDepartments } from '@/services/api/basicInfo';

export default async function EmployeesPage() {
  const employees = await fetchBasicInfo();
  const departments = await fetchDepartments('');
  console.log('employees', employees);
  console.log('departments', departments);
  return <div>EmployeesPage</div>;
}
