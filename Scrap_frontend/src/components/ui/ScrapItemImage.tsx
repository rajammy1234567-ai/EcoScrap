import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { getScrapItemImage } from '../../utils/scrapImages';
import { colors, radii } from '../../theme';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, number> = {
  sm: 40,
  md: 52,
  lg: 64,
  xl: 80,
};

interface Props {
  name: string;
  size?: Size | number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  /** Soft green frame around photo */
  framed?: boolean;
  rounded?: number;
}

/**
 * Real scrap item photo (not icon) for rate cards & lists.
 */
export function ScrapItemImage({
  name,
  size = 'md',
  style,
  imageStyle,
  framed = true,
  rounded,
}: Props) {
  const dim = typeof size === 'number' ? size : SIZES[size];
  const r = rounded ?? Math.max(10, dim * 0.22);
  const source = getScrapItemImage(name);

  return (
    <View
      style={[
        styles.wrap,
        framed && styles.framed,
        {
          width: dim,
          height: dim,
          borderRadius: r,
        },
        style,
      ]}
    >
      <Image
        source={source}
        style={[
          styles.img,
          {
            width: dim - (framed ? 6 : 0),
            height: dim - (framed ? 6 : 0),
            borderRadius: Math.max(6, r - 4),
          },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
  },
  framed: {
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
    backgroundColor: colors.primary.green50,
  },
  img: {
    backgroundColor: colors.neutral.gray100,
  },
});
