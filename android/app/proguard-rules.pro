# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# --- Reglas necesarias para Capacitor (evita crash en checkPermissions) ---
-keepattributes *Annotation*
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep @com.getcapacitor.annotation.Permission class * { *; }
-keepclassmembers @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.Permission <fields>;
}

# --- Plugin de escaneo de código de barras/QR (@capacitor-mlkit/barcode-scanning) ---
-keep class io.capawesome.capacitorjs.plugins.mlkitbarcodescanning.** { *; }
-keep class com.google.mlkit.vision.** { *; }
-keep class com.google.android.gms.internal.mlkit_vision_barcode.** { *; }
-keep class com.google.android.gms.internal.mlkit_vision_barcode_bundled_common.** { *; }
-dontwarn com.google.mlkit.**

# --- Push Notifications (@capacitor/push-notifications) - mismo tipo de crash que el QR ---
-keep class com.capacitorjs.plugins.pushnotifications.** { *; }
-keep class com.google.firebase.** { *; }
-keep class com.google.firebase.messaging.** { *; }
-dontwarn com.google.firebase.**
