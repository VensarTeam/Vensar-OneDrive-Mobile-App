export const fontFamilies = {
  regular: 'GoogleSansFlex-Regular',
  semibold: 'GoogleSansFlex-SemiBold',
  bold: 'GoogleSansFlex-Bold',
} as const;

export const typography = {
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
} as const;
