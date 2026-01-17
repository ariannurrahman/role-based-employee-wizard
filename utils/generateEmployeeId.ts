export function generateEmployeeId(department: string, existingCount: number): string {
  const deptPrefix = department.toUpperCase().slice(0, 3).padEnd(3, 'X');
  const sequence = (existingCount + 1).toString().padStart(3, '0');

  return `${deptPrefix}-${sequence}`;
}
