import { BasicInfo, Details } from "@/types";

export interface MergedEmployee {
    employeeId: string;
    fullName: string;
    email: string;
    department: string;
    role: string;
    officeLocation?: string;
    photo?: string;
    employmentType?: string;
    notes?: string;
    id: string;
  }

export const mergeEmployeeData = (
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
          id: basicInfo.id
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
          id: detail.id
        };
      }
    });
  };
