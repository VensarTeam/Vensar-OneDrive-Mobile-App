import { createContext, useContext } from 'react';

const SplashGateContext = createContext(false);

export const SplashGateProvider = SplashGateContext.Provider;

export function useSplashFinished() {
  return useContext(SplashGateContext);
}