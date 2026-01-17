'use client';

import { useSearchParams } from 'next/navigation';
import { BasicInfo, Details, Role } from '@/types';
import { useMemo, useState } from 'react';
import { BasicInfoForm } from '@/components/form/basic-info-form';
import { DetailInfoForm } from '@/components/form/detail-info-form';
import { validateBasicInfo, validateDetails } from '@/utils/validation';

export const WizardForm = () => {
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') || 'admin') as Role;

  const [currentStep, setCurrentStep] = useState<1 | 2>(role === 'ops' ? 2 : 1);

  const [basicInfo, setBasicInfo] = useState<Partial<BasicInfo>>({});
  const [details, setDetails] = useState<Partial<Details>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const isValidBasicInfoForm = useMemo(() => {
    return validateBasicInfo({
      fullName: basicInfo.fullName || '',
      email: basicInfo.email || '',
      department: basicInfo.department || '',
      role: basicInfo.role || '',
    });
  }, [basicInfo]);

  const isValidDetailsForm = useMemo(() => {
    return validateDetails({
      photo: details.photo,
      employmentType: details.employmentType,
      officeLocation: details.officeLocation,
      notes: details.notes,
    });
  }, [details]);

  const handleBasicInfoChange = (data: Partial<BasicInfo>) => {
    setBasicInfo(data);
  };

  const handleDetailsChange = (data: Partial<Details>) => {
    setDetails(data);
  };

  const handleNext = () => {
    if (isValidBasicInfoForm) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = () => {
    if (isValidDetailsForm) {
      console.log('submit');
      // Add your submit logic here
    }
  };

  return (
    <div>
      <h1>WizardForm</h1>
      <p>Role: {role}</p>

      {currentStep === 1 && role === 'admin' && (
        <BasicInfoForm
          data={basicInfo}
          onChange={handleBasicInfoChange}
          onNext={handleNext}
          isValidForm={isValidBasicInfoForm}
        />
      )}

      {currentStep === 2 && (
        <DetailInfoForm
          data={details}
          onChange={handleDetailsChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          progress={progress}
          logs={logs}
          isValidForm={isValidDetailsForm}
        />
      )}
    </div>
  );
};
