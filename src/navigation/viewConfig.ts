import { ComponentType } from 'react';
import BrowseScreen from '../screens/BrowseScreen';
import ReaderScreen from '../screens/ReaderScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MainFeedScreen from '../screens/MainFeedScreen';
import WebViewScreen from '../screens/WebViewScreen';
import ChapterSelectScreen from '../screens/ChapterSelectScreen';
import { ViewNames } from '../store/types';

export interface DrawerRouteConfig {
  name: ViewNames;
  component: ComponentType<any>;
  drawerLabel: string;
  icon: string;
  showInDrawer?: boolean;
  headerShown?: boolean;
}

export const drawerRoutes: DrawerRouteConfig[] = [
  {
    name: ViewNames.RapunzelMainFeed,
    component: MainFeedScreen,
    drawerLabel: 'Feed',
    icon: 'home-outline',
  },
  {
    name: ViewNames.RapunzelBrowse,
    component: BrowseScreen,
    drawerLabel: 'Browse',
    icon: 'card-search-outline',
  },
  {
    name: ViewNames.RapunzelLibrary,
    component: LibraryScreen,
    drawerLabel: 'Library',
    icon: 'tab-search',
  },
  {
    name: ViewNames.RapunzelSettings,
    component: SettingsScreen,
    drawerLabel: 'Settings',
    icon: 'cog-outline',
  },
  {
    name: ViewNames.RapunzelReader,
    component: ReaderScreen,
    drawerLabel: 'Reader',
    icon: 'book-open-variant',
    headerShown: false,
  },
  {
    name: ViewNames.RapunzelWebView,
    component: WebViewScreen,
    drawerLabel: 'WebView',
    icon: 'wifi',
  },
  {
    name: ViewNames.RapunzelChapterSelect,
    component: ChapterSelectScreen,
    drawerLabel: 'Chapter Select',
    icon: 'tray-arrow-up',
    showInDrawer: false,
    headerShown: false,
  },
];
