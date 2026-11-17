import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CrudScreen from './src/screens/CrudScreen';
import ApiScreen from './src/screens/ApiScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = route.name === 'Records'
              ? focused ? 'list-circle' : 'list-circle-outline'
              : focused ? 'cloud-download' : 'cloud-download-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen
          name="Records"
          component={CrudScreen}
          options={{ title: 'My Records (CRUD)' }}
        />
        <Tab.Screen
          name="API Feed"
          component={ApiScreen}
          options={{ title: 'Public API Data' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}