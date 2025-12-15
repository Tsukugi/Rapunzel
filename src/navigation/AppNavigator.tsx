import React, { useEffect } from 'react';
import {
  NavigationContainer,
  NavigationState,
  PartialState,
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';
import { ViewNames, useRapunzelStore } from '../store';
import { DrawerRouteConfig, drawerRoutes } from './viewConfig';

export type RootDrawerParamList = Record<ViewNames, undefined>;

const Drawer = createDrawerNavigator<RootDrawerParamList>();

const getActiveRouteName = (
  state?: NavigationState | PartialState<NavigationState>,
): string | undefined => {
  if (!state) return undefined;
  const route = state.routes[state.index ?? 0];
  if (!route) return undefined;
  if ('state' in route && route.state) {
    return getActiveRouteName(route.state as NavigationState | PartialState<NavigationState>);
  }
  return route.name;
};

export const AppNavigator = () => {
  const {
    config: [config],
    router: [router],
  } = useRapunzelStore();
  const { colors } = useTheme();

  useEffect(() => {
    router.currentRoute = config.initialView;
    router.history = [config.initialView];
  }, [config.initialView, router]);

  const onStateChange = (state?: NavigationState) => {
    const nextRoute = getActiveRouteName(state);
    if (!nextRoute) return;
    const view = nextRoute as ViewNames;
    router.currentRoute = view;
    router.history = [...router.history, view];
  };

  const getDrawerOptions = (route: DrawerRouteConfig) => ({
    title: route.drawerLabel,
    headerShown: route.headerShown ?? true,
    drawerLabel: route.drawerLabel,
    drawerItemStyle: route.showInDrawer === false ? { display: 'none' } : undefined,
    drawerIcon:
      route.showInDrawer === false
        ? undefined
        : ({ size = 24, color = colors.primary }) => (
            <MaterialCommunityIcons name={route.icon} size={size} color={color} />
          ),
  });

  return (
    <NavigationContainer onStateChange={onStateChange}>
      <Drawer.Navigator
        initialRouteName={config.initialView}
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.black,
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.gray,
          drawerStyle: { backgroundColor: colors.background },
          sceneContainerStyle: { backgroundColor: colors.background },
        }}
      >
        {drawerRoutes.map((route) => (
          <Drawer.Screen
            key={route.name}
            name={route.name}
            component={route.component}
            options={getDrawerOptions(route)}
          />
        ))}
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
