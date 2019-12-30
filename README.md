# storybook-addon-theme-playground

## Installation

Yet another theme addon for storybook.

![Screenshot](./assets/screenshot.png)

#### 1. Install the addon

```sh
yarn add -D storybook-addon-theme-playground
```

#### 2. Register the panel

Add to `.storybook/addons.js`

```js
import 'storybook-addon-theme-playground/dist/register';
```

#### 3. Add decorator

Add to `.storybook/config.js`

```js
import { addDecorator } from '@storybook/react';
import { withThemePlayground } from 'storybook-addon-theme-playground';

import theme from 'path/to/theme';

addDecorator(withThemePlayground({ theme }));
```

... or to particular story

```js
import React from 'react';
import Button from './Button';
import { withThemePlayground } from 'storybook-addon-theme-playground';

import theme from 'path/to/theme';

export default {
  title: 'Button with theme',
  decorators: [withThemePlayground({ theme })]
};

export const Primary = () => <Button>Primary Button</Button>;
```

#### 4. Add multiple themes

It is also possible to add multiple themes. Just add an `Array` to the `theme` key. Each theme must have a `name` and a `theme` key.

```js
import defaultTheme from 'path/to/default/theme';
import anotherTheme from 'path/to/another/theme';

addDecorator(
  withThemePlayground({
    theme: [
      { name: 'Theme', theme: defaultTheme },
      { name: 'Another Theme', theme: anotherTheme }
    ]
  })
);
```

## ThemeProvider

By default `storybook-addon-theme-playground` is using the `emotion` ThemeProvider which comes with the storybook packages. But you also can add a custom ThemeProvider, for example from `styled-components`.

```js
import { addDecorator } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { withThemePlayground } from 'storybook-addon-theme-playground';

import theme from 'path/to/theme';

addDecorator(withThemePlayground({ theme, provider: ThemeProvider }));
```

## Overrides

`storybook-addon-theme-playground` will render a default component based on the theme value. If you want to customize them, you can override the default components by adding an `overrides` object to your decorator.

As a key use the theme object path, e.g `'button.color.spacing'`

**Example**

```js
import { addDecorator } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { withThemePlayground } from 'storybook-addon-theme-playground';

import theme from 'path/to/theme';

const overrides = {
  'button.color.spacing': {
    type: 'counter',
    label: 'Button Spacing',
    description: 'Spacing for all buttons',
    min: 1,
    max: 10,
    steps: 1,
    suffix: 'rem'
  },
  'button.color.primary': {
    type: 'color',
    label: 'Button Primary Color'
  }
};

addDecorator(
  withThemePlayground({ theme, overrides, provider: ThemeProvider })
);
```

## Override components

### Color

```js
'theme.path': {
  type: 'color',
  label: String | 'theme.path'
}
```

### Counter

```js
'theme.path': {
  type: 'counter',
  label: String | 'theme.path',
  description: String | null,
  min: Number | 0,
  max: Number | 100,
  steps: Number | 1,
  suffix: String | null
}
```

### Select

```js
'theme.path': {
  type: 'select',
  label: String | 'theme.path',
  options: [
    {
      value: String,
      label: String
    }
  ]
}
```

### Shorthand

```js
'theme.path': {
  type: 'shorthand',
  label: String | 'theme.path',
  description: String | null
}
```

### Switch

```js
'theme.path': {
  type: 'switch',
  label: String | 'theme.path'
}
```

### Range

```js
'theme.path': {
  type: 'range',
  label: String | 'theme.path',
  min: Number | 0,
  max: Number | 100,
  steps: Number | 1,
  suffix: String | null
}
```

## Roadmap

- [ ] Add testing
