import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SIZES, CATEGORIES } from '../../theme';
import {
  pickAndSaveImage,
  getRecipeDetail,
  updateRecipe,
} from '../../services/db';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    const loadRecipe = async () => {
      const detail = await getRecipeDetail(id);
      if (!detail) {
        Alert.alert('Error', 'Resep tidak ditemukan');
        router.back();
        return;
      }

      setTitle(detail.title);
      setIngredients(detail.ingredients || '');
      setImageUri(detail.image_path);
      setCategory(detail.category);

      // Gabungin semua step jadi 1 string, pisah dengan newline
      const stepText = detail.steps
        .map((s: any) => s.instruction)
        .join('\n');
      setSteps(stepText);

      setLoading(false);
    };
    loadRecipe();
  }, [id]);

  const handleChangeImage = async () => {
    const uri = await pickAndSaveImage();
    if (uri) setImageUri(uri);
  };

  const handleUpdate = async () => {
    if (!title || !ingredients || !steps || !imageUri) {
      Alert.alert('Error', 'Harap isi semua kolom!');
      return;
    }

    const stepArray = steps.split('\n').filter((s) => s.trim() !== '');
    await updateRecipe(id, title, ingredients, imageUri, category, stepArray);

    Alert.alert('Sukses', 'Resep berhasil diupdate!');
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header dengan tombol back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Resep</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Judul Resep</Text>
      <TextInput
        style={styles.input}
        placeholder="masukkan judul resep"
        placeholderTextColor={COLORS.textLight}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Foto Kue</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={handleChangeImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>+ masukkan foto kue</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.hint}>Ketuk foto untuk mengganti</Text>

      <Text style={styles.label}>Kategori</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 15 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[styles.catText, category === cat && styles.catTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Bahan-Bahan</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="masukkan bahan-bahan"
        placeholderTextColor={COLORS.textLight}
        multiline
        value={ingredients}
        onChangeText={setIngredients}
      />

      <Text style={styles.label}>Langkah-Langkah</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="satu langkah per baris"
        placeholderTextColor={COLORS.textLight}
        multiline
        value={steps}
        onChangeText={setSteps}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>SIMPAN PERUBAHAN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
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
    marginBottom: 15,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  imagePicker: {
    backgroundColor: COLORS.secondary,
    height: 180,
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePickerText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  previewImage: { width: '100%', height: '100%' },
  hint: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 15,
  },
  catChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    marginRight: 10,
  },
  catChipActive: { backgroundColor: COLORS.primary },
  catText: { color: COLORS.text, fontSize: 12 },
  catTextActive: { color: COLORS.white, fontWeight: 'bold' },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.h3,
    letterSpacing: 1,
  },
});