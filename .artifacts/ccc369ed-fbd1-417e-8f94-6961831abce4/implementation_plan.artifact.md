# Implementation Plan - UI Refinement and Android Crash Fix

This plan addresses the redundant sub-tabs in the Admin panel and investigates the persistent Android crash for specific users.

## User Review Required

> [!IMPORTANT]
> - **Admin UI**: We will remove the small top tabs ("Finanzas" / "Votos") since they are now redundantly handled by the bottom navigation bar.
> - **Android Crash**: I am adding extra safeguards to the login process. If the user `prueba@huertas.com` still crashes, it almost certainly means the issue is related to a native plugin (like Push Notifications) reacting to the specific user ID or role.

## Proposed Changes

### 1. Admin UI Cleanup
Remove redundant navigation elements to simplify the interface.

#### [MODIFY] [Admin.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/admin/Admin.tsx)
- Remove the "Tabs Selector Contextual" block.
- Re-order hooks and declarations to fix the "used before declaration" TypeScript error.

---

### 2. Android Stability (Crash Prevention)
Harden the login flow to prevent native app terminations.

#### [MODIFY] [Login.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/Login.tsx)
- Replace `throw new Error` with a direct `alert` and `return` when a profile is missing. This prevents potential issues with uncaught exceptions bubbling to the native layer.
- Ensure `setLoading(false)` is called correctly in all paths.

---

### 3. Layout Stability
Revert certain height constraints that might be causing the "circular movement" or scroll glitches on mobile.

#### [MODIFY] [Admin.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/admin/Admin.tsx)
#### [MODIFY] [Payroll.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/admin/Payroll.tsx)
- Use `display: 'flex'` and `flexDirection: 'column'` without forcing `minHeight: '100vh'` inside the scrollable Layout container.

## Verification Plan

### Manual Verification
- **Admin Panel**: Verify that the top sub-tabs are gone and navigation is exclusively through the bottom bar.
- **Login**: Test the `prueba@huertas.com` login on Android. Verify that it shows the alert and stays on the login screen instead of closing the app.
- **Scrolling**: Verify that the Admin screen no longer has "circular" or "jumping" scroll behavior.
