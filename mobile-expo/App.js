import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Caminos de la Lagunita</Text>
        <Text style={styles.subtitle}>Vista Previa Expo Go</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>
          ¡Hola! Esta es una estructura base para React Native.
        </Text>
        <Text style={styles.description}>
          Para usar Expo Go, necesitas portar tus componentes web (div, span, h1) a componentes nativos (View, Text).
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => alert('¡Funciona!')}
        >
          <Text style={styles.buttonText}>Probar Interacción</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Desarrollado para iPhone</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#bfc8c7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f5551',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 12,
    color: '#785919',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#1b1c1a',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#3f4947',
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0f5551',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#bfc8c7',
  },
});
