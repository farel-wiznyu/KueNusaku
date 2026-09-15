import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from '../theme';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userId = await SecureStore.getItemAsync('userId');
      setTimeout(() => {
        if (userId) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }, 1800);
    };
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={{ fontSize: 60 }}>🍰</Text>
      </View>
      <Text style={styles.title}>KueNusaku</Text>
      <Text style={styles.subtitle}>Koleksi Resep Kue Tradisional</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logoCircle: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.primary,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 6 },
}); 