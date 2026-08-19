# Plan de Actualización a la Versión v2.3.8

Este plan detalla los pasos para sincronizar todos los componentes del proyecto a la versión **v2.3.8**, siguiendo las directrices del archivo `instrucciones_de_chat.md`.

## User Review Required

> [!IMPORTANT]
> Se ha detectado que `package.json` y `android/app/build.gradle` ya contienen la versión `2.3.8` y el `versionCode 41` (incrementado desde el `40` usado en la `2.3.7`). Este plan sincronizará el resto de los archivos (`version.json` en todas las plataformas y el proyecto iOS) a estos valores.

## Proposed Changes

### [Core / Metadata]

#### [MODIFY] [version.json](file:///C:/Users/admin/Documents/CaminosApp/public/version.json)
- Actualizar `versionName` a `2.3.8`.
- Actualizar `versionCode` a `41`.
- Actualizar URLs de descarga y notas de lanzamiento.

#### [MODIFY] [version.json](file:///C:/Users/admin/Documents/CaminosApp/android/app/src/main/assets/public/version.json)
- Sincronizar con el archivo raíz.

#### [MODIFY] [version.json](file:///C:/Users/admin/Documents/CaminosApp/ios/App/App/public/version.json)
- Sincronizar con el archivo raíz.

### [iOS Platform]

#### [MODIFY] [project.pbxproj](file:///C:/Users/admin/Documents/CaminosApp/ios/App/App.xcodeproj/project.pbxproj)
- Actualizar `MARKETING_VERSION` a `2.3.8`.
- Actualizar `CURRENT_PROJECT_VERSION` a `41`.

## Verification Plan

### Manual Verification
- Verificar que todos los archivos `version.json` tengan el mismo contenido.
- Confirmar que los archivos de configuración de Android e iOS reflejen la versión `2.3.8`.
- Ejecutar comandos de sincronización sugeridos:
  ```bash
  pnpm run build; npx cap sync android; npx cap sync ios;
  ```
