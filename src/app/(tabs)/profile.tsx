import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES } from '../../theme';
import { getMyRecipes, getSavedRecipes, getUserById, getUserStats } from '../../services/db';

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState({ recipeCount: 0, savedCount: 0 });
  const [myRecipes, setMyRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const id = await SecureStore.getItemAsync('userId');
        if (!id) return;
        const user = await getUserById(id);
        if (user) setUsername(user.username);
        setStats(await getUserStats(id));
        setMyRecipes(await getMyRecipes(id));
        setSavedRecipes(await getSavedRecipes(id));
      };
      fetchData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin mau keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('userId');
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Profil</Text>

      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={80} color={COLORS.primary} />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.statsText}>
            {stats.recipeCount} resep · {stats.savedCount} tersimpan
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Resepmu</Text>
      {myRecipes.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada resep.</Text>
      ) : (
        myRecipes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/recipe/${item.id}`)}
          >
            <Image source={{ uri: item.image_path }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Tersimpan</Text>
      {savedRecipes.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada resep tersimpan.</Text>
      ) : (
        savedRecipes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/recipe/${item.id}`)}
          >
            <Image source={{ uri: item.image_path }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 40,
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: 15,
    marginBottom: 25,
  },
  username: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text },
  statsText: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  logoutText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
  sectionTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.text },
  cardCategory: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
});