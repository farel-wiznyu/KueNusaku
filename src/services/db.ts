import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('kuenusaku.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        ingredients TEXT,
        image_path TEXT,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        step_number INTEGER NOT NULL,
        instruction TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS saved_recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        UNIQUE(user_id, recipe_id)
      );
    `);
  }
  return db;
}

// ==================== AUTH ====================
export async function registerUser(username: string, password: string) {
  const database = await getDB();
  try {
    const result = await database.runAsync(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      username,
      password
    );
    return { success: true, userId: result.lastInsertRowId };
  } catch (e) {
    return { success: false, error: 'Username sudah dipakai' };
  }
}

export async function loginUser(username: string, password: string) {
  const database = await getDB();
  const user = await database.getFirstAsync<{ id: number; username: string }>(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    username,
    password
  );
  if (user) return { success: true, user };
  return { success: false, error: 'Username atau password salah' };
}

export async function getUserById(userId: string | number) {
  const database = await getDB();
  return await database.getFirstAsync<{ id: number; username: string }>(
    'SELECT * FROM users WHERE id = ?',
    userId
  );
}

// ==================== IMAGE PICKER ====================
export async function pickAndSaveImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alert('Izin akses galeri dibutuhkan!');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled) return null;

  const sourceUri = result.assets[0].uri;
  const fileName = `recipe_${Date.now()}.jpg`;
  const destPath = FileSystem.documentDirectory + fileName;

  await FileSystem.copyAsync({ from: sourceUri, to: destPath });
  return destPath;
}

// ==================== RECIPE CREATE ====================
export async function createRecipe(
  userId: string,
  title: string,
  ingredients: string,
  imagePath: string,
  category: string,
  stepsArray: string[]
) {
  const database = await getDB();
  const recipeResult = await database.runAsync(
    'INSERT INTO recipes (user_id, title, ingredients, image_path, category) VALUES (?, ?, ?, ?, ?)',
    userId,
    title,
    ingredients,
    imagePath,
    category
  );
  const recipeId = recipeResult.lastInsertRowId;

  for (let i = 0; i < stepsArray.length; i++) {
    await database.runAsync(
      'INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)',
      recipeId,
      i + 1,
      stepsArray[i]
    );
  }
  return recipeId;
}

// ==================== RECIPE READ ====================
export async function getMyRecipes(userId: string) {
  const database = await getDB();
  return await database.getAllAsync<any>(
    `SELECT r.*, u.username FROM recipes r
     JOIN users u ON r.user_id = u.id
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC`,
    userId
  );
}

export async function getRandomRecipe(excludeUserId: string) {
  const database = await getDB();
  return await database.getFirstAsync<any>(
    `SELECT r.*, u.username FROM recipes r
     JOIN users u ON r.user_id = u.id
     WHERE r.user_id != ?
     ORDER BY RANDOM() LIMIT 1`,
    excludeUserId
  );
}

export async function getRecipeDetail(recipeId: string | number) {
  const database = await getDB();
  const recipe = await database.getFirstAsync<any>(
    `SELECT r.*, u.username FROM recipes r
     JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    recipeId
  );
  const steps = await database.getAllAsync<any>(
    'SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_number',
    recipeId
  );
  return { ...recipe, steps };
}

export async function searchRecipes(query: string) {
  const database = await getDB();
  return await database.getAllAsync<any>(
    `SELECT r.*, u.username FROM recipes r
     JOIN users u ON r.user_id = u.id
     WHERE r.title LIKE ?
     ORDER BY r.created_at DESC`,
    `%${query}%`
  );
}

// ==================== RECIPE UPDATE ====================
export async function updateRecipe(
  recipeId: string | number,
  title: string,
  ingredients: string,
  imagePath: string,
  category: string,
  stepsArray: string[]
) {
  const database = await getDB();

  // 1. Update data resep
  await database.runAsync(
    'UPDATE recipes SET title = ?, ingredients = ?, image_path = ?, category = ? WHERE id = ?',
    title,
    ingredients,
    imagePath,
    category,
    recipeId
  );

  // 2. Hapus semua step lama
  await database.runAsync('DELETE FROM steps WHERE recipe_id = ?', recipeId);

  // 3. Insert step baru
  for (let i = 0; i < stepsArray.length; i++) {
    await database.runAsync(
      'INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)',
      recipeId,
      i + 1,
      stepsArray[i]
    );
  }
}

// ==================== RECIPE DELETE ====================
export async function deleteRecipe(recipeId: string | number) {
  const database = await getDB();

  // Ambil path gambar sebelum hapus resep
  const recipe = await database.getFirstAsync<{ image_path: string }>(
    'SELECT image_path FROM recipes WHERE id = ?',
    recipeId
  );

  // Hapus file gambar dari local storage
  if (recipe?.image_path) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(recipe.image_path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(recipe.image_path);
      }
    } catch (e) {
      console.log('Gagal hapus file gambar:', e);
    }
  }

  // Hapus resep dari DB (cascade akan hapus steps & saved_recipes)
  await database.runAsync('DELETE FROM recipes WHERE id = ?', recipeId);
}

// ==================== SAVED RECIPES ====================
export async function toggleSaveRecipe(userId: string, recipeId: string | number) {
  const database = await getDB();
  const existing = await database.getFirstAsync<{ id: number }>(
    'SELECT * FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
    userId,
    recipeId
  );

  if (existing) {
    await database.runAsync('DELETE FROM saved_recipes WHERE id = ?', existing.id);
    return { saved: false };
  } else {
    await database.runAsync(
      'INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)',
      userId,
      recipeId
    );
    return { saved: true };
  }
}

export async function getSavedRecipes(userId: string) {
  const database = await getDB();
  return await database.getAllAsync<any>(
    `SELECT r.*, u.username FROM recipes r
     JOIN saved_recipes s ON r.id = s.recipe_id
     JOIN users u ON r.user_id = u.id
     WHERE s.user_id = ?
     ORDER BY s.saved_at DESC`,
    userId
  );
}

export async function checkIsSaved(userId: string, recipeId: string | number) {
  const database = await getDB();
  const res = await database.getFirstAsync<{ id: number }>(
    'SELECT * FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
    userId,
    recipeId
  );
  return !!res;
}

// ==================== PROFILE STATS ====================
export async function getUserStats(userId: string) {
  const database = await getDB();
  const recipeCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM recipes WHERE user_id = ?',
    userId
  );
  const savedCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM saved_recipes WHERE user_id = ?',
    userId
  );
  return {
    recipeCount: recipeCount?.count ?? 0,
    savedCount: savedCount?.count ?? 0,
  };
}