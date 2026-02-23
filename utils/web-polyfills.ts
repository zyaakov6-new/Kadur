import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function (obj, prop, descriptor) {
    try {
      return originalDefineProperty(obj, prop, descriptor);
    } catch (e) {
      if (
        e instanceof TypeError &&
        typeof (e as Error).message === 'string' &&
        (e as Error).message.includes('Cannot redefine property')
      ) {
        console.warn(`[web-polyfills] Suppressed: ${(e as Error).message}`);
        return obj;
      }
      throw e;
    }
  } as typeof Object.defineProperty;
}
