# Implementation Plan - Bug Fixes and Improvements

This plan addresses several issues reported by the user across different areas of the application, including session management, UI responsiveness, communication, and report generation.

## User Review Required

> [!IMPORTANT]
> Some fixes involve changes to how PDFs are handled on mobile devices. If these changes do not solve the "Admin PDF view" issue, we may need to investigate Capacitor-specific plugins for file opening.

> [!NOTE]
> The login issue ("No profile associated") typically indicates missing data in the `profiles` database table for certain users. While I will improve the error handling, the underlying data may need manual correction in the Supabase dashboard.

## Proposed Changes

### 1. Session Management (Logout Fix)
Improve the reliability of the logout process by ensuring local state is cleared even if the network call to Supabase fails.

#### [MODIFY] [useAuthStore.ts](file:///C:/Users/admin/Documents/CaminosApp/src/store/useAuthStore.ts)
- Update `signOut` to use a `try-finally` block or ensure `set({ user: null })` is always called.

#### [MODIFY] [Profile.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/prof/Profile.tsx)
- Add a fallback navigation in case `signOut` hangs.

---

### 2. Communication (Email Destination)
Update the support email address as requested by the user.

#### [MODIFY] [Support.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/prof/Support.tsx)
- Change `Jess.pirela@gmail.com` to `desarollodeappcondominio@gmail.com`.

---

### 3. Report Generation (Complaints PDF)
Add functionality to generate and download a PDF report when a complaint (incident) is submitted.

#### [MODIFY] [Incidents.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/res/Incidents.tsx)
- Implement a `generateIncidentPDF` function that creates a PDF with the complaint details using `jsPDF`.
- Trigger this function after a successful submission.

---

### 4. UI & UX (Input Fields and Keyboard)
Improve the house number input to use an appropriate keyboard while allowing the hyphen character.

#### [MODIFY] [Incidents.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/res/Incidents.tsx)
#### [MODIFY] [Payments.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/res/Payments.tsx)
- Update "Número de Casa" inputs to use `type="text"` with `inputMode="tel"`. This typically shows a numeric keypad that includes the hyphen/dash character on most mobile devices, satisfying the requirement for "14-28" style input.

---

### 5. Payment Processing (Stuck at "Procesando")
Improve feedback and error handling during payment registration.

#### [MODIFY] [Payments.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/res/Payments.tsx)
- Add more granular logging and ensure the loading state is cleared even on unexpected errors.
- Verify the `rpc_insert_payment` call parameters.

---

### 6. Admin Tools (PDF View & Cluster Filter)
- Fix the issue where viewing a PDF as an admin "does nothing".
- Restrict the residential cluster dropdown to the superadmin only.

#### [MODIFY] [Admin.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/admin/Admin.tsx)
- Use a more robust way to open PDFs (e.g., `window.open` with proper attributes).
- Wrap the cluster selector (dropdown) in a conditional check: `user?.role === 'superadmin'`.
- For regular admins, lock the cluster selection to their assigned `residential_cluster` from their profile.

---

### 7. Layout (Home Screen Size)
Adjust the splash screen layout to be more responsive on various Android screen sizes.

#### [MODIFY] [AuthSplash.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/AuthSplash.tsx)
- Change `height: '100vh'` to `minHeight: '100vh'` and adjust padding/flex properties to prevent content from being cut off.

---

### 8. Authentication (Login Error)
Provide clearer guidance when a profile is missing and ensure the whitelist fallback is robust.

#### [MODIFY] [Login.tsx](file:///C:/Users/admin/Documents/CaminosApp/src/features/auth/Login.tsx)
- Improve the error message for missing profiles.
- Ensure the whitelist check is properly handling edge cases.

## Verification Plan

### Manual Verification
- **Logout**: Test the logout button in the profile section.
- **Email**: Trigger a support email and verify the recipient address in the mail client.
- **Complaints**: Submit a complaint and verify the PDF is generated and downloaded.
- **Inputs**: Test the house number input on a mobile device (emulated) to see the keyboard behavior.
- **Payments**: Test payment registration with a mock file and verify it doesn't get stuck.
- **Admin PDF**: Open the admin panel and try to view a PDF attachment from a payment.
- **Splash Screen**: Verify the splash screen layout on different viewport heights.
