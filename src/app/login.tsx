import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES } from '../theme';
import { loginUser } from '../services/db';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Isi semua kolom dulu ya!');
      return;
    }
    const res = await loginUser(username, password);
    if (res.success && res.user) {
      await SecureStore.setItemAsync('userId', res.user.id.toString());
      router.replace('/(tabs)');
    } else {
      Alert.alert('Gagal', res.error || 'Login gagal');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Selamat Datang Kembali</Text>
      <Text style={styles.subtitle}>harap login kembali</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="masukkan username"
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="masukkan password"
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/register')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>
          belum punya akun?{' '}
          <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>register</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: { marginBottom: 15 },
  label: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.h3,
    letterSpacing: 1,
  },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: COLORS.textLight, fontSize: SIZES.body },
});