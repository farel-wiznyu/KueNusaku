import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES } from '../../theme';
import { getSavedRecipes } from '../../services/db';

export default function SavedScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const id = await SecureStore.getItemAsync('userId');
        if (!id) return;
        const data = await getSavedRecipes(id);
        setRecipes(data);
      };
      fetchData();
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Tersimpan</Text>

      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>
          Belum ada resep tersimpan. Yuk cari resep menarik! 🔖
        </Text>
      ) : (
        recipes.map((item) => (
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
  emptyText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 30,
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