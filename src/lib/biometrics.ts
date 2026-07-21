import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Preferences } from '@capacitor/preferences';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export async function enableBiometric(): Promise<boolean> {
  try {
    await BiometricAuth.authenticate({
      reason: 'Confirma tu identidad para activar el acceso biométrico',
      cancelTitle: 'Cancelar',
      allowDeviceCredential: true,
    });
    await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: 'true' });
    return true;
  } catch {
    return false;
  }
}

export async function disableBiometric(): Promise<void> {
  await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: 'false' });
}

export async function isBiometricEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
  return value === 'true';
}

export async function verifyBiometric(): Promise<boolean> {
  try {
    await BiometricAuth.authenticate({
      reason: 'Usa tu huella o Face ID para entrar',
      cancelTitle: 'Usar contraseña',
      allowDeviceCredential: true,
    });
    return true;
  } catch {
    return false;
  }
}
