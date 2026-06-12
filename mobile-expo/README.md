# Entorno Expo Go para iPhone

Este directorio contiene una base para utilizar **Expo Go** en tu iPhone.

## Diferencia Importante
Tu proyecto principal utiliza **Capacitor** (React Web), el cual se previsualiza en el iPhone mediante Xcode. **Expo Go** es exclusivo para **React Native**.

Para usar este entorno:
1. Asegúrate de tener instalado Node.js.
2. Abre una terminal en esta carpeta (`mobile-expo`).
3. Ejecuta `npm install` (requiere conexión a internet la primera vez).
4. Ejecuta `npx expo start`.
5. Escanea el código QR con la cámara de tu iPhone (teniendo la app **Expo Go** instalada).

## Pasos para el Desarrollo
Para que tus diseños actuales funcionen aquí, debes:
- Cambiar `<div>` por `<View>`
- Cambiar `<span>`, `<h1>`, `<p>` por `<Text>`
- Utilizar `StyleSheet.create` en lugar de clases de Tailwind directas (o usar una librería como NativeWind).
