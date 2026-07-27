import { ImageSourcePropType } from 'react-native';

/**
 * Real product photos for scrap items (from assets/images/brands).
 * Match is keyword-based on item name (case-insensitive).
 */

// Paths with spaces are intentional (folder/file names on disk)
const IMG = {
  ac: require('../../assets/images/brands/Untitled design/ac.png'),
  ac2: require('../../assets/images/brands/Untitled design/ac2.png'),
  washing: require('../../assets/images/brands/Untitled design/washing machine.png'),
  washingAuto: require('../../assets/images/brands/Untitled design/automatic_washing_machine.png'),
  fridge: require('../../assets/images/brands/Untitled design/fridge.png'),
  fridge2: require('../../assets/images/brands/Untitled design/fridge2.png'),
  bigFridge: require('../../assets/images/brands/Untitled design/big_fridge.png'),
  newspaper: require('../../assets/images/brands/Untitled design/newspaper.png'),
  cardboard: require('../../assets/images/brands/Untitled design/cardboard.png'),
  metal: require('../../assets/images/brands/Untitled design/metal.png'),
  laptop: require('../../assets/images/brands/Untitled design/laptop.png'),
  cpu: require('../../assets/images/brands/Untitled design/cpu.png'),
  printer: require('../../assets/images/brands/Untitled design/printer.png'),
  tv: require('../../assets/images/brands/Untitled design/tv.png'),
  oldTv: require('../../assets/images/brands/Untitled design/old_tv.png'),
  glass: require('../../assets/images/brands/Untitled design/glass.png'),
  tshirt: require('../../assets/images/brands/Untitled design/tshirt.png'),
  battery: require('../../assets/images/brands/Untitled design/battery.png'),
  cooker: require('../../assets/images/brands/Untitled design/cooker.png'),
  radio: require('../../assets/images/brands/Untitled design/radio.png'),
  pipe: require('../../assets/images/brands/Untitled design/pipe.png'),
  tab: require('../../assets/images/brands/Untitled design/tab.png'),
  bike: require('../../assets/images/brands/Untitled design/bike.png'),
  car: require('../../assets/images/brands/Untitled design/car.png'),
  scooter: require('../../assets/images/brands/Untitled design/scooter.png'),
  gym: require('../../assets/images/brands/Untitled design/gym_equipments.png'),
} as const;

/** Longer / more specific keywords first */
const RULES: [string, ImageSourcePropType][] = [
  ['washing machine', IMG.washing],
  ['automatic washing', IMG.washingAuto],
  ['air conditioner', IMG.ac],
  ['refrigerator', IMG.bigFridge],
  ['crt monitor', IMG.oldTv],
  ['crt tv', IMG.oldTv],
  ['lcd tv', IMG.tv],
  ['led tv', IMG.tv],
  ['old tv', IMG.oldTv],
  ['computer cpu', IMG.cpu],
  ['desktop', IMG.cpu],
  ['gas stove', IMG.cooker],
  ['newspaper', IMG.newspaper],
  ['cardboard', IMG.cardboard],
  ['magazine', IMG.newspaper],
  ['books', IMG.newspaper],
  ['book', IMG.newspaper],
  ['laptop', IMG.laptop],
  ['printer', IMG.printer],
  ['scanner', IMG.printer],
  ['monitor', IMG.oldTv],
  ['fridge', IMG.fridge],
  ['washer', IMG.washing],
  ['washing', IMG.washing],
  ['copper', IMG.metal],
  ['aluminium', IMG.metal],
  ['aluminum', IMG.metal],
  ['steel', IMG.metal],
  ['iron', IMG.metal],
  ['metal', IMG.metal],
  ['glass', IMG.glass],
  ['bottle', IMG.glass],
  ['clothes', IMG.tshirt],
  ['t-shirt', IMG.tshirt],
  ['tshirt', IMG.tshirt],
  ['shirt', IMG.tshirt],
  ['battery', IMG.battery],
  ['cooker', IMG.cooker],
  ['stove', IMG.cooker],
  ['radio', IMG.radio],
  ['pipe', IMG.pipe],
  ['tablet', IMG.tab],
  ['phone', IMG.tab],
  ['cpu', IMG.cpu],
  ['bike', IMG.bike],
  ['car', IMG.car],
  ['scooter', IMG.scooter],
  ['gym', IMG.gym],
  ['tv', IMG.tv],
  ['ac', IMG.ac],
];

const DEFAULT_IMAGE: ImageSourcePropType = IMG.metal;

export function getScrapItemImage(name?: string | null): ImageSourcePropType {
  if (!name) return DEFAULT_IMAGE;
  const n = name.toLowerCase().trim();

  for (const [keyword, src] of RULES) {
    if (n.includes(keyword)) return src;
  }

  // Single-letter / short "ac" at start or as whole word
  if (/\bac\b/.test(n)) return IMG.ac;

  return DEFAULT_IMAGE;
}

export const ScrapItemImages = IMG;
