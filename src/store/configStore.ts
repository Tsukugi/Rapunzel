import { defineStore } from '@atsu/taihou';

// Define the ConfigState interface
export interface ConfigState {
  // Add properties based on RapunzelV1 ConfigState
  theme: 'light' | 'dark';
  fontSize: number;
  language: string;
  // Add other config properties as needed
}

const initialState: ConfigState = {
  theme: 'light',
  fontSize: 16,
  language: 'en',
};

export const configStore = defineStore<ConfigState>('config', {
  state: initialState,
  reducers: {
    updateConfig: (state, payload: Partial<ConfigState>) => ({
      ...state,
      ...payload,
    }),
    setTheme: (state, theme: 'light' | 'dark') => ({
      ...state,
      theme,
    }),
    setFontSize: (state, fontSize: number) => ({
      ...state,
      fontSize,
    }),
    setLanguage: (state, language: string) => ({
      ...state,
      language,
    }),
  },
});