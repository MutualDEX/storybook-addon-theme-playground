import * as React from 'react';
import { API } from '@storybook/api';

import { setValue } from '../helper';
import {
  Theme,
  ThemesArray,
  ThemeObject,
  ConfigProps,
  OptionsType
} from '../types';
import events from '../events';
import buildThemeComponents from '../helper/buildThemeComponents';

export type SettingsContextProps = {
  themes: ThemesArray;
  activeTheme: ThemeObject;
  themeComponents: {};
  overrides: object;
  config: ConfigProps;
  isLoading: boolean;
  updateTheme: (path: any, value: any) => void;
  updateActiveTheme: (obj: ThemeObject) => void;
};

export type SettingsProviderProps = {
  api: API;
};

const defaultConfig = {
  labelFormat: 'startCase',
  debounce: true,
  debounceRate: 500,
  showCode: true
};

const defaultProps = {
  themes: [],
  themeComponents: {},
  activeTheme: { name: '__default', theme: {} },
  overrides: {},
  config: defaultConfig,
  isLoading: false,
  updateTheme: () => {},
  updateActiveTheme: () => {}
};

export const SettingsContext = React.createContext<SettingsContextProps>(
  defaultProps
);

const SettingsProvider: React.FC<SettingsProviderProps> = ({
  api,
  children
}) => {
  const [themeComponents, setThemeComponents] = React.useState({});
  const [themes, setThemes] = React.useState<ThemesArray>([]);
  const [activeTheme, setActiveTheme] = React.useState<ThemeObject>({
    name: '',
    theme: {}
  });

  const [isMounted, setIsMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [overrides, setOverrides] = React.useState({});
  const [config, setConfig] = React.useState(defaultConfig);

  React.useEffect(() => {
    if (config.debounce && isMounted && activeTheme.theme) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        api.emit(events.updateTheme, activeTheme.theme);
      }, config.debounceRate);
      return () => {
        setIsLoading(true);
        clearTimeout(timeout);
      };
    } else {
      if (isLoading) {
        setIsLoading(false);
      }
      api.emit(events.updateTheme, activeTheme.theme);
    }
  }, [activeTheme]);

  const getInitialOptions = (options: OptionsType) => {
    const { theme, overrides, config } = options;

    if (Array.isArray(theme)) {
      setThemes(theme);
      setActiveTheme({ ...theme[0] });

      const components = {};
      theme.forEach(t => {
        components[t.name] = buildThemeComponents(t.theme, overrides);
      });

      setThemeComponents(components);
    } else {
      setActiveTheme({ name: '__default', theme });
      setThemeComponents({
        __default: buildThemeComponents(theme, overrides)
      });
    }

    if (overrides) setOverrides(overrides);

    if (config) {
      const { labelFormat } = config;

      if (
        labelFormat &&
        labelFormat !== 'path' &&
        labelFormat !== 'startCase' &&
        typeof labelFormat !== 'function'
      ) {
        console.warn(
          "config.labelFormat needs to be one of 'path' || 'startCase' || (path: string[]) => string - Fallback to 'path'"
        );
      }

      setConfig(prev => ({ ...prev, ...config }));
    }
  };

  React.useEffect(() => {
    api.on(events.receiveOptions, getInitialOptions);
    api.on(events.setThemes, setThemes);
    setIsMounted(true);

    return () => {
      api.off(events.receiveOptions, getInitialOptions);
      api.off(events.setThemes, setThemes);
      setIsMounted(false);
    };
  }, []);

  const updateTheme = (path: string, value: any) => {
    const { theme, name } = activeTheme;
    const newTheme: Theme = theme;
    setValue(path, value, newTheme);

    setActiveTheme({ name, theme: newTheme });

    setThemeComponents(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [path]: { type: prev[name][path].type, value }
      }
    }));
  };

  const updateActiveTheme = (obj: ThemeObject) => {
    const { name, theme } = obj;
    setActiveTheme({ name, theme });
  };

  const providerValue: SettingsContextProps = {
    activeTheme,
    themes,
    themeComponents,
    config,
    overrides,
    updateTheme,
    updateActiveTheme,
    isLoading
  };

  return (
    <SettingsContext.Provider value={providerValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const SettingsConsumer = SettingsContext.Consumer;

export default SettingsProvider;
