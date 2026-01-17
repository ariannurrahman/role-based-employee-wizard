import Link from 'next/link';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.notFound__content}>
        <div className={styles.notFound__icon}>404</div>
        <h1 className={styles.notFound__title}>Page Not Found</h1>
        <p className={styles.notFound__description}>
          Oops! The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className={styles.notFound__actions}>
          <Link href="/employees" className={styles.notFound__button}>
            Go to Employees
          </Link>
          <Link href="/wizard?role=admin" className={styles.notFound__buttonSecondary}>
            Add New Employee
          </Link>
        </div>
      </div>
    </div>
  );
}
