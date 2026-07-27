import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type FeatherName = ComponentProps<typeof Feather>['name'];
type MCIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type IconFamily = 'feather' | 'material';

export interface ScrapIconConfig {
  family: IconFamily;
  name: FeatherName | MCIconName;
}

const CATEGORY_ICONS: Record<string, ScrapIconConfig> = {
  paper: { family: 'feather', name: 'file-text' },
  plastic: { family: 'material', name: 'bottle-soda-outline' },
  metal: { family: 'feather', name: 'tool' },
  metals: { family: 'feather', name: 'tool' },
  'e-waste': { family: 'feather', name: 'monitor' },
  ewaste: { family: 'feather', name: 'monitor' },
  carton: { family: 'feather', name: 'package' },
  cartons: { family: 'feather', name: 'package' },
  glass: { family: 'feather', name: 'disc' },
  clothes: { family: 'feather', name: 'shopping-bag' },
  appliance: { family: 'material', name: 'fridge-outline' },
  appliances: { family: 'material', name: 'fridge-outline' },
  others: { family: 'material', name: 'battery-outline' },
  battery: { family: 'material', name: 'battery-outline' },
  bike: { family: 'material', name: 'bike' },
  car: { family: 'material', name: 'car-outline' },
  gym: { family: 'material', name: 'dumbbell' },
  scooter: { family: 'material', name: 'scooter' },
};

const ITEM_KEYWORDS: [string, ScrapIconConfig][] = [
  ['newspaper', { family: 'feather', name: 'file-text' }],
  ['cardboard', { family: 'feather', name: 'package' }],
  ['book', { family: 'feather', name: 'book' }],
  ['magazine', { family: 'feather', name: 'book-open' }],
  ['crt monitor', { family: 'feather', name: 'monitor' }],
  ['crt tv', { family: 'material', name: 'television-classic' }],
  ['old tv', { family: 'material', name: 'television-classic' }],
  ['lcd tv', { family: 'material', name: 'television' }],
  ['led tv', { family: 'material', name: 'television' }],
  ['printer', { family: 'material', name: 'printer' }],
  ['scanner', { family: 'material', name: 'scanner' }],
  ['laptop', { family: 'feather', name: 'monitor' }],
  ['computer', { family: 'material', name: 'desktop-tower-monitor' }],
  ['cpu', { family: 'material', name: 'desktop-tower' }],
  ['tablet', { family: 'feather', name: 'tablet' }],
  ['tab', { family: 'feather', name: 'tablet' }],
  ['phone', { family: 'feather', name: 'smartphone' }],
  ['refrigerator', { family: 'material', name: 'fridge-outline' }],
  ['fridge', { family: 'material', name: 'fridge-outline' }],
  ['washing machine', { family: 'material', name: 'washing-machine' }],
  ['air conditioner', { family: 'material', name: 'air-conditioner' }],
  ['ac ', { family: 'material', name: 'air-conditioner' }],
  ['cooker', { family: 'material', name: 'pot-steam-outline' }],
  ['gas stove', { family: 'material', name: 'stove' }],
  ['iron', { family: 'material', name: 'anvil' }],
  ['steel', { family: 'material', name: 'anvil' }],
  ['copper', { family: 'material', name: 'pipe' }],
  ['aluminium', { family: 'material', name: 'pipe' }],
  ['aluminum', { family: 'material', name: 'pipe' }],
  ['brass', { family: 'material', name: 'pipe' }],
  ['metal', { family: 'feather', name: 'tool' }],
  ['glass', { family: 'feather', name: 'disc' }],
  ['bottle', { family: 'material', name: 'bottle-soda-outline' }],
  ['plastic', { family: 'material', name: 'bottle-soda-outline' }],
  ['clothes', { family: 'feather', name: 'shopping-bag' }],
  ['t-shirt', { family: 'feather', name: 'shopping-bag' }],
  ['shirt', { family: 'feather', name: 'shopping-bag' }],
  ['fabric', { family: 'material', name: 'hanger' }],
  ['battery', { family: 'material', name: 'battery-outline' }],
  ['bike', { family: 'material', name: 'bike' }],
  ['car', { family: 'material', name: 'car-outline' }],
  ['scooter', { family: 'material', name: 'scooter' }],
  ['gym', { family: 'material', name: 'dumbbell' }],
  ['radio', { family: 'material', name: 'radio' }],
  ['pipe', { family: 'material', name: 'pipe' }],
  ['tv', { family: 'material', name: 'television' }],
];

const DEFAULT_ICON: ScrapIconConfig = { family: 'feather', name: 'box' };

export function getScrapIcon(name: string): ScrapIconConfig {
  const lower = name.toLowerCase().trim();

  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lower.includes(key)) return CATEGORY_ICONS[key];
  }

  for (const [keyword, icon] of ITEM_KEYWORDS) {
    if (lower.includes(keyword)) return icon;
  }

  return DEFAULT_ICON;
}

export const BANNER_ICONS: Record<string, ScrapIconConfig> = {
  accuracy: { family: 'feather', name: 'shield' },
  pickup: { family: 'material', name: 'truck-delivery-outline' },
};

export const ONBOARDING_CATEGORIES: {
  name: string;
  desc: string;
  icon: ScrapIconConfig;
}[] = [
  { name: 'Paper', desc: 'Newspapers, cardboard, books', icon: { family: 'feather', name: 'file-text' } },
  { name: 'Plastic', desc: 'Bottles, containers, PVC', icon: { family: 'material', name: 'bottle-soda-outline' } },
  { name: 'Metal', desc: 'Iron, copper, steel, aluminium', icon: { family: 'feather', name: 'tool' } },
  { name: 'E-Waste', desc: 'Laptops, phones, appliances', icon: { family: 'feather', name: 'monitor' } },
  { name: 'Clothes', desc: 'Old garments, fabric, jute', icon: { family: 'feather', name: 'shopping-bag' } },
  { name: 'Glass', desc: 'Bottles, glassware', icon: { family: 'feather', name: 'disc' } },
];