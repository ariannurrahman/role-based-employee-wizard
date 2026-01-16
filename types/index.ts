export type Role = 'admin' | 'ops';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';

export type EmployeeRole = 'Ops' | 'Admin' | 'Engineer' | 'Finance';

export interface BasicInfo {
  fullName: string;
  email: string;
  department: string;
  role: EmployeeRole;
  employeeId: string;
}

export interface Details {
  photo?: string; // Base64
  employmentType?: EmploymentType;
  officeLocation?: string;
  notes?: string;
  email?: string; // For merging
  employeeId?: string; // For merging
}

export interface Employee {
  id?: string;
  fullName: string;
  email: string;
  department: string;
  role: EmployeeRole;
  employeeId: string;
  photo?: string;
  employmentType?: EmploymentType;
  officeLocation?: string;
  notes?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface Draft {
  basicInfo?: Partial<BasicInfo>;
  details?: Partial<Details>;
}
