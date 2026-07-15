import { Stack } from 'expo-router';

import { OcrReviewScreen } from '@/features/ocr-review/screens/ocr-review-screen';

export default function OcrReviewRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OcrReviewScreen />
    </>
  );
}
