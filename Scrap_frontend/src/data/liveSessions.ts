import { AppImages } from '../assets/images';
import { LiveSession } from '../types/live';

export const LIVE_SESSIONS: LiveSession[] = [
  {
    id: '1',
    name: 'Rajesh K.',
    role: 'Senior Collector',
    area: 'South Delhi',
    viewers: 284,
    activity: 'Weighing copper wire · ₹450/kg live',
    thumbnail: AppImages.bannerAccuracy,
    tags: ['Metal', 'Copper'],
  },
  {
    id: '2',
    name: 'Priya S.',
    role: 'Pickup Partner',
    area: 'Gurgaon Sec 45',
    viewers: 156,
    activity: 'Doorstep pickup in progress',
    thumbnail: AppImages.bannerDoorstep,
    tags: ['Pickup', 'Mixed scrap'],
  },
  {
    id: '3',
    name: 'Amit V.',
    role: 'Rate Expert',
    area: 'Noida',
    viewers: 412,
    activity: 'Today\'s best rates — newspaper, laptop, AC',
    thumbnail: AppImages.heroOnboarding,
    tags: ['Rates', 'E-Waste'],
  },
  {
    id: '4',
    name: 'Suresh M.',
    role: 'E-Waste Specialist',
    area: 'East Delhi',
    viewers: 98,
    activity: 'Sorting old laptops & CPUs',
    thumbnail: AppImages.emptyPickup,
    tags: ['E-Waste', 'Laptop'],
  },
  {
    id: '5',
    name: 'Kavita R.',
    role: 'Field Agent',
    area: 'Dwarka',
    viewers: 221,
    activity: 'On the way · 3 pickups today',
    thumbnail: AppImages.bannerDoorstep,
    tags: ['Live route', 'Pickup'],
  },
];

export function getSessionsFromIndex(startId?: string): LiveSession[] {
  if (!startId) return LIVE_SESSIONS;
  const idx = LIVE_SESSIONS.findIndex((s) => s.id === startId);
  if (idx <= 0) return LIVE_SESSIONS;
  return [...LIVE_SESSIONS.slice(idx), ...LIVE_SESSIONS.slice(0, idx)];
}