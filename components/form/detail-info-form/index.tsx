'use client';

import { useState, useRef } from 'react';
import { Details, EmploymentType } from '@/types';
// import { fetchLocations } from '@/services/api/detailsInfo';
import { fileToBase64 } from '@/utils/file';
// import Autocomplete from '../Autocomplete/Autocomplete';
import styles from './DetailInfoForm.module.css';
import Image from 'next/image';

interface DetailInfoFormProps {
  data: Partial<Details>;
  onChange: (data: Partial<Details>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  progress: number;
  logs: string[];
  isValidForm?: boolean;
}

const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Intern'];

export const DetailInfoForm = ({ data, onChange, onSubmit, isSubmitting, progress, logs, isValidForm }: DetailInfoFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.photo || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        onChange({ ...data, photo: base64 });
        setPhotoPreview(base64);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        alert('Failed to process image');
      }
    }
  };

  const handleLocationSelect = (location: string) => {
    onChange({ ...data, officeLocation: location });
  };

  return (
    <div className={styles.detailInfoForm}>
      <h2 className={styles.detailInfoForm__title}>Details & Submit</h2>
      <form className={styles.detailInfoForm__form}>
        <div className={styles.detailInfoForm__field}>
          <label htmlFor='photo' className={styles.detailInfoForm__label}>
            Photo
          </label>
          <div className={styles.detailInfoForm__photoSection}>
            <input
              ref={fileInputRef}
              id='photo'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className={styles.detailInfoForm__fileInput}
            />
            <button type='button' onClick={() => fileInputRef.current?.click()} className={styles.detailInfoForm__uploadButton}>
              Choose File
            </button>
            {photoPreview && (
              <div className={styles.detailInfoForm__preview}>
                <Image src={photoPreview} alt='Preview' className={styles.detailInfoForm__previewImage} width={100} height={100} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.detailInfoForm__field}>
          <label htmlFor='employmentType' className={styles.detailInfoForm__label}>
            Employment Type
          </label>
          <select
            id='employmentType'
            value={data.employmentType || ''}
            onChange={(e) =>
              onChange({
                ...data,
                employmentType: e.target.value as EmploymentType,
              })
            }
            className={styles.detailInfoForm__select}
          >
            <option value=''>Select employment type</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* <Autocomplete
          value={data.officeLocation || ''}
          onChange={(value) => onChange({ ...data, officeLocation: value })}
          onSelect={handleLocationSelect}
          fetchOptions={fetchLocations}
          placeholder='Search location'
          label='Office Location'
          id='officeLocation'
        /> */}

        <div className={styles.detailInfoForm__field}>
          <label htmlFor='notes' className={styles.detailInfoForm__label}>
            Notes
          </label>
          <textarea
            id='notes'
            value={data.notes || ''}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            className={styles.detailInfoForm__textarea}
            placeholder='Enter notes'
            rows={4}
          />
        </div>

        {isSubmitting && (
          <div className={styles.detailInfoForm__progressSection}>
            <div className={styles.detailInfoForm__progressBar}>
              <div className={styles.detailInfoForm__progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.detailInfoForm__logs}>
              {logs.map((log, index) => (
                <div key={index} className={styles.detailInfoForm__log}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type='button'
          onClick={onSubmit}
          disabled={isSubmitting || !isValidForm}
          className={`${styles.detailInfoForm__button} ${(isSubmitting || !isValidForm) ? styles['detailInfoForm__button--disabled'] : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};
