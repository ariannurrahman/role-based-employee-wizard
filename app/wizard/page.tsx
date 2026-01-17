import { WizardForm } from '@/components/form/wizard-form';
import { Suspense } from 'react';
import styles from './WizardPage.module.css';

export default async function WizardPage() {
  return (
    <Suspense fallback={<div className={styles.wizardPage__loading}>Loading wizard form...</div>}>
      <WizardForm />
    </Suspense>
  );
}
