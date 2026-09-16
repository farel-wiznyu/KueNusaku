import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
      {/* Logo */}
      <Image
        source={require('../../assets/logo-kana.png')}
        style={styles.logo}
        resizeMode="contain"
      />
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
  logo: {
    width: 180,
    height: 180,
    marginBottom: 24,
    borderRadius: 20
  },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 6 },
});