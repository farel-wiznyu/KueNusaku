import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES } from '../../theme';
import { getRecipeDetail, toggleSaveRecipe, checkIsSaved } from '../../services/db';

export default function RecipeDetailScreen() {
  // ✨ INI KUNCINYA: ambil parameter 'id' dari URL
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Setiap kali halaman ini dibuka, ambil data terbaru dari DB
  useFocusEffect(
    useCallback(() => {
      const fetchDetail = async () => {
        // Ambil detail resep + langkah-langkah
        const detail = await getRecipeDetail(id);
        setRecipe(detail);

        // Cek apakah user yang login adalah pemilik resep ini
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) return;

        if (detail && detail.user_id.toString() === userId) {
          setIsOwner(true); // Kalau iya, sembunyikan tombol bookmark
        } else {
          setIsOwner(false);
        }

        // Cek apakah resep ini udah disimpan user
        const savedStatus = await checkIsSaved(userId, id);
        setIsSaved(savedStatus);
      };
      fetchDetail();
    }, [id])
  );

  // Fungsi bookmark: simpan / hapus dari tersimpan
  const handleSaveToggle = async () => {
    const userId = await SecureStore.getItemAsync('userId');
    if (!userId) return;
    const res = await toggleSaveRecipe(userId, id);
    setIsSaved(res.saved);
    Alert.alert('Info', res.saved ? 'Resep disimpan! 🔖' : 'Resep dihapus dari tersimpan');
  };

  // Loading state
  if (!recipe) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Foto kue */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: recipe.image_path }} style={styles.image} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Header: kategori, judul, author, tombol bookmark */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.category}>{recipe.category}</Text>
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.author}>Oleh: {recipe.username}</Text>
            </View>
            {!isOwner && (
              <TouchableOpacity onPress={handleSaveToggle}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={32}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Bahan-bahan */}
          <Text style={styles.sectionTitle}>Bahan-Bahan</Text>
          <Text style={styles.bodyText}>{recipe.ingredients}</Text>

          {/* Langkah-langkah step by step */}
          <Text style={styles.sectionTitle}>Langkah-Langkah</Text>
          {recipe.steps?.map((step: any) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.step_number}</Text>
              </View>
              <Text style={styles.stepText}>{step.instruction}</Text>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: SIZES.padding,
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  category: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
  },
  title: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.text },
  author: { color: COLORS.textLight, fontSize: 12, marginTop: 5 },
  sectionTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  bodyText: { fontSize: SIZES.body, color: COLORS.text, lineHeight: 22 },
  stepRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  stepText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
});1