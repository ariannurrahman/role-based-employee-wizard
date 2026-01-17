export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateBasicInfo(data: {
  fullName: string;
  email: string;
  department: string;
  role: string;
}): boolean {
  return (
    data.fullName.trim().length > 0 &&
    validateEmail(data.email) &&
    data.department.trim().length > 0 &&
    data.role.trim().length > 0
  );
}

export function validateDetails(data: {
  photo?: string;
  employmentType?: string;
  officeLocation?: string;
  notes?: string;
}): boolean {
  return !!(data.photo && data.employmentType && data.officeLocation?.trim().length && data.notes?.trim().length);
}
