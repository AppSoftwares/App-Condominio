# Implementation Plan - Combined Stability and iOS Layout Fixes

This comprehensive plan addresses the Android app crashes, authentication hangs, and the layout/navigation issues reported on iOS.

## User Review Required

> [!IMPORTANT]
> - **Android Stability**: We will ensure the app never hangs on the loading screen and handles profile errors gracefully without crashing.
> - **iOS Layout**: We will implement "Safe Area" support to prevent headers from overlapping with the status bar (clock/battery).
> - **Navigation**: The "Votos" (Polls) section will be moved to a primary icon in the bottom navigation bar for Admins to ensure easy access.

## Proposed Changes

### 1. Stability & Auth (Android Crash Prevention)
- **State Guarantee**: Update `useAuthStore.ts` to ensure `authReady` is set to `true` even in error paths.
- **Login Safety**: Update `Login.tsx` to sign out before throwing profile errors, preventing background sync conflicts.
- **Data Types**: Convert numeric IDs to strings during Excel import in `Admin.tsx` to satisfy native plugin requirements.

---

### 2. iOS Layout & Safe Areas
- **Dynamic Padding**: Update `Admin.tsx` and `Payroll.tsx` to use `env(safe-area-inset-top)` for top padding.
- **Header Separation**: Ensure titles like "Relación Mensual" are positioned safely below the system UI.

---

### 3. Navigation Enhancement
- **Primary Votos Access**: Add the "Votos" icon to the bottom navigation bar in `Layout.tsx` specifically for the Admin role.
- **URL Synchronization**: Ensure the new navigation icon correctly sets the `tab=polls` parameter.

## Verification Plan

### Manual Verification
- **Login**: Test `prueba@huertas.com` on Android (verify no crash, just a clear alert).
- **iOS Display**: Verify the Admin header on an iPhone (verify it's below the clock).
- **Navigation**: Verify the new "Votos" icon in the bottom bar and that it loads the correct section.
