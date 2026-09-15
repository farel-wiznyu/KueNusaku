import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../theme';
import { searchRecipes } from '../../services/db';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim() === '') {
      setResults([]);
      return;
    }
    const data = await searchRecipes(text.trim());
    setResults(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Cari Resep</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="cari judul resep"
        placeholderTextColor={COLORS.textLight}
        value={query}
        onChangeText={handleSearch}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {query.trim() !== '' && results.length === 0 && (
          <Text style={styles.emptyText}>Resep tidak ditemukan 😔</Text>
        )}

        {results.map((item) => (
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
        ))}
      </ScrollView>
    </View>
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
  searchInput: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 30,
    fontSize: SIZES.body,
    color: COLORS.text,
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