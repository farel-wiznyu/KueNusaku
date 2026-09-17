import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES, CATEGORIES } from '../../theme';
import { pickAndSaveImage, createRecipe } from '../../services/db';

export default function AddRecipeScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handlePickImage = async () => {
    const uri = await pickAndSaveImage();
    if (uri) setImageUri(uri);
  };

  const handleSave = async () => {
    if (!title || !ingredients || !steps || !imageUri) {
      Alert.alert('Error', 'Harap isi semua kolom dan pilih foto!');
      return;
    }
    const userId = await SecureStore.getItemAsync('userId');
    if (!userId) return;

    const stepArray = steps.split('\n').filter((s) => s.trim() !== '');
    await createRecipe(userId, title, ingredients, imageUri, category, stepArray);
    Alert.alert('Sukses', 'Resep berhasil disimpan!');

    setTitle('');
    setIngredients('');
    setSteps('');
    setImageUri(null);
    setCategory(CATEGORIES[0]);
    router.push('/(tabs)');
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      enableOnAndroid={true}
      extraScrollHeight={120}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>Tambah Resep</Text>

      <TextInput
        style={styles.input}
        placeholder="masukkan judul resep"
        placeholderTextColor={COLORS.textLight}
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>+ masukkan foto kue</Text>
        )}
      </TouchableOpacity>

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

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="masukkan bahan-bahan (pisahkan dengan enter)"
        placeholderTextColor={COLORS.textLight}
        multiline
        value={ingredients}
        onChangeText={setIngredients}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="masukkan langkah-langkah (pisahkan dengan enter)"
        placeholderTextColor={COLORS.textLight}
        multiline
        value={steps}
        onChangeText={setSteps}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>SIMPAN</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    marginTop: 40,
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
    height: 150,
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
  label: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
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