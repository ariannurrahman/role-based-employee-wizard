import { fetchLocations } from '@/services/api/detailsInfo';

export default async function WizardPage() {
  const locations = await fetchLocations('');
  console.log('locations', locations);
  return <div>WizardPage</div>;
}
