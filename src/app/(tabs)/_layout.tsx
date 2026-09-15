import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: '#D3A5B5',
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;
          if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'saved') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'add') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="saved" options={{ title: 'Tersimpan' }} />
      <Tabs.Screen name="add" options={{ title: 'Tambah' }} />
      <Tabs.Screen name="search" options={{ title: 'Cari' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}