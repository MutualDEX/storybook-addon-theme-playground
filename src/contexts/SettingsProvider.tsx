import * as React from 'react';

import { updateValueBasedOnPath } from '../helper';
import {
  Theme,
  ThemesArray,
  ThemeObject,
  ConfigProps,
  OptionsType,
  Overrides,
  SettingsContextProps,
  SettingsProviderProps
} from '../types';
import events from '../events';
import buildThemeComponents from '../helper/buildThemeComponents';

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

  const [overrides, setOverrides] = React.useState<Overrides>({});
  const [config, setConfig] = React.useState<ConfigProps>(defaultConfig);

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

  const getInitialOptions = React.useCallback((options: OptionsType) => {
    const { theme, overrides, config } = options;

    if (Array.isArray(theme)) {
      setThemes(theme);
      setActiveTheme({ ...theme[0] });

      const components = {};
      theme.forEach(({ name, theme }) => {
        components[name] = buildThemeComponents(theme, overrides);
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
  }, []);

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

  const updateTheme = React.useCallback(
    (path: string, value: any) => {
      const { theme, name } = activeTheme;

      // Update theme object value based on path and set active theme state
      const newTheme: Theme = theme;
      updateValueBasedOnPath(path, value, newTheme);
      setActiveTheme({ name, theme: newTheme });

      // Set new theme components state
      setThemeComponents(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          [path]: { type: prev[name][path].type, value }
        }
      }));
    },
    [activeTheme]
  );

  const updateActiveTheme = React.useCallback(
    ({ name, theme }: ThemeObject) => {
      setActiveTheme({ name, theme });
    },
    [activeTheme.theme]
  );

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
