import { ImageSourcePropType } from 'react-native';

export interface LiveSession {
  id: string;
  name: string;
  role: string;
  area: string;
  viewers: number;
  activity: string;
  thumbnail: ImageSourcePropType;
  tags: string[];
}