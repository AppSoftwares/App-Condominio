# Reparación del Build de iOS - Módulo Capacitor no encontrado

El objetivo es corregir el error `no such module 'Capacitor'` en GitHub Actions asegurando que las configuraciones de Xcode incluyan correctamente los archivos `.xcconfig` generados por CocoaPods.

## User Review Required

> [!IMPORTANT]
> La modificación de `project.pbxproj` se realizará manualmente mediante reemplazo de texto. Aunque es una operación precisa, un error en el formato del archivo `.pbxproj` puede corromper el proyecto de Xcode. Se ha optado por esta vía para cumplir con la solicitud de separar las configuraciones de Debug y Release.

## Proposed Changes

### [iOS Configuration]

#### [MODIFY] [debug.xcconfig](file:///C:/Users/admin/Documents/CaminosApp/ios/debug.xcconfig)
Se agregará el `#include` al archivo de configuración de CocoaPods para Debug.

#### [NEW] [release.xcconfig](file:///C:/Users/admin/Documents/CaminosApp/ios/release.xcconfig)
Se creará este archivo para incluir la configuración de CocoaPods para Release.

#### [MODIFY] [project.pbxproj](file:///C:/Users/admin/Documents/CaminosApp/ios/App/App.xcodeproj/project.pbxproj)
- Se registrará `release.xcconfig` como `PBXFileReference`.
- Se añadirá al grupo principal de archivos.
- Se asignará como `baseConfigurationReference` para las configuraciones de **Release** tanto a nivel de Proyecto como de Target.

### [GitHub Actions]

#### [MODIFY] [ios-build.yml](file:///C:/Users/admin/Documents/CaminosApp/.github/workflows/ios-build.yml)
Se añadirá un paso de diagnóstico para verificar que `debug.xcconfig` contiene el include necesario después de `pod install`.

## Verification Plan

### Manual Verification
1. Revisar los archivos `.xcconfig` resultantes.
2. Validar que el archivo `project.pbxproj` mantiene su estructura válida (paréntesis balanceados, secciones correctas).
3. El éxito final se confirmará cuando el workflow de GitHub Actions logre compilar el módulo `Capacitor`.
