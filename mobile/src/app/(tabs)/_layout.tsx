import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/navigation/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Posts',
        }}
      />

      <Tabs.Screen
        name="channels"
        options={{
          title: 'Channels',
        }}
      />

      <Tabs.Screen
        name="compose-tab"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

