export type OcrReviewColors = Readonly<{
  canvas: string;
  surface: string;
  subtle: string;
  text: string;
  secondaryText: string;
  disabledText: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  border: string;
  warning: string;
  warningSurface: string;
  danger: string;
  dangerSurface: string;
  overlay: string;
}>;

export const ocrReviewColors: Readonly<{
  light: OcrReviewColors;
  dark: OcrReviewColors;
}> = {
  light: {
    canvas: '#F7F8FA',
    surface: '#FFFFFF',
    subtle: '#EEF1F5',
    text: '#17202A',
    secondaryText: '#5D6875',
    disabledText: '#929BA5',
    primary: '#3563E9',
    primaryPressed: '#254DC0',
    onPrimary: '#FFFFFF',
    border: '#D9DEE5',
    warning: '#8A4B00',
    warningSurface: '#FFF7EB',
    danger: '#B52E2E',
    dangerSurface: '#FCE8E8',
    overlay: 'rgba(12,18,28,.48)',
  },
  dark: {
    canvas: '#101318',
    surface: '#191E25',
    subtle: '#242B34',
    text: '#F3F5F7',
    secondaryText: '#B7C0CA',
    disabledText: '#77818C',
    primary: '#7C9DFF',
    primaryPressed: '#9AB3FF',
    onPrimary: '#0C1738',
    border: '#39424D',
    warning: '#FFB45C',
    warningSurface: '#2C261E',
    danger: '#FF8585',
    dangerSurface: '#3D2226',
    overlay: 'rgba(0,0,0,.64)',
  },
};
