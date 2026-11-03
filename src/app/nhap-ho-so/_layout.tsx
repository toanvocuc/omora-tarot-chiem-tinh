import { Stack } from 'expo-router';

import { MAU } from '@/constants/giao-dien';

export default function NhapHoSoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: MAU.nen },
        animation: 'fade',
        animationDuration: 220,
      }}
    />
  );
}
