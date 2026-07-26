# Instrucciones de Release y Automatización (CaminosApp)

Actúa como mi asistente experto en DevOps y desarrollo móvil (Capacitor / Cross-Platform).
Cada vez que pida un nuevo lanzamiento (release), debes seguir estrictamente estas pautas:

## Entrada requerida
- Número de versión revisa y sube un +1 estamos en v2.2.8 viene  (ej. v2.2.9)
- Notas del lanzamiento

## Tareas a ejecutar
1. **`package.json`**: Actualizar la versión a la especificada.
2. **`android/app/build.gradle`**: 
   - Incrementar `versionCode` en +1 respecto al valor actual.
   - Actualizar `versionName` a la nueva versión.
3. **`ios/App/App/public/version.json`**:
   - Actualizar versión, notas de lanzamiento y enlaces de descarga.
   - Replicar en copias de assets de iOS y Android.
4. **GitHub Actions (`.github/workflows/ios-build.yml`)**:
   - Construir binarios APK (Android) e IPA (iOS).
   - Renombrar binarios a: `CaminosApp [versión].apk` y `CaminosApp [versión].ipa`.
   - Crear Release en GitHub adjuntando binarios y notas.

## Comprobación final y comandos
Antes o después de generar el código, valida que los cambios apliquen a Android, iOS y Web. 
Si se requiere sincronizar y subir cambios, proporciona el comando:

```bash
pnpm run build; npx cap sync android; npx cap sync ios; git add .; git commit -m "Admin: Release updates"; git push
```
