import React, { createContext, useContext } from 'react';

export type DeviceMode = 'mobile' | 'web' | 'tv';

const DeviceModeContext = createContext<DeviceMode>('web');

export function DeviceModeProvider({
  mode,
  children,
}: {
  mode: DeviceMode;
  children: React.ReactNode;
}) {
  return <DeviceModeContext.Provider value={mode}>{children}</DeviceModeContext.Provider>;
}

export function useDeviceMode(): DeviceMode {
  return useContext(DeviceModeContext);
}
