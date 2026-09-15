import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES } from '../../theme';
import { getMyRecipes, getRandomRecipe, getUserById } from '../../services/db';

export default function HomeScreen() {
  const router = useRouter();
  const [myRecipes, setMyRecipes] = useState<any[]>([]);
  const [randomRecipe, setRandomRecipe] = useState<any>(null);
  const [username, setUsername] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const id = await SecureStore.getItemAsync('userId');
        if (!id) return;

        const user = await getUserById(id);
        if (user) setUsername(user.username);

        const recipes = await getMyRecipes(id);
        setMyRecipes(recipes);

        const random = await getRandomRecipe(id);
        setRandomRecipe(random);
      };
      fetchData();
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {username || 'Chef'}</Text>
          <Text style={styles.subGreeting}>Mau masak apa hari ini?</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-circle-outline" size={42} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {randomRecipe ? (
        <TouchableOpacity
          style={styles.banner}
          onPress={() => router.push(`/recipe/${randomRecipe.id}`)}
        >
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Temukan Ide Resep Spesial Hari Ini!</Text>
            <Text style={styles.bannerSubtitle}>
              Hmm, kira-kira masak apa ya hari ini?
            </Text>
          </View>
          <Image source={{ uri: randomRecipe.image_path }} style={styles.bannerImage} />
        </TouchableOpacity>
      ) : (
        <View style={styles.banner}>
          <Text style={styles.bannerSubtitle}>
            Belum ada resep dari pengguna lain untuk ditampilkan.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Resep Terbaru Kamu</Text>

      {myRecipes.length === 0 ? (
        <Text style={styles.emptyText}>
          Belum ada resep. Yuk mulai buat resep pertamamu! 🍰
        </Text>
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
              <Text style={styles.cardAuthor}>{item.username}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  greeting: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.primary },
  subGreeting: { fontSize: SIZES.h3, color: COLORS.text },
  banner: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerTextContainer: { flex: 1, paddingRight: 10 },
  bannerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  bannerSubtitle: { fontSize: 12, color: COLORS.textLight },
  bannerImage: { width: 80, height: 80, borderRadius: 10 },
  sectionTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  emptyText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: 70, height: 70, borderRadius: 10, marginRight: 15 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.text },
  cardCategory: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  cardAuthor: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
});