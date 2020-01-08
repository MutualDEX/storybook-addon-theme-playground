import * as React from 'react';

import { SettingsContext } from '../../contexts/SettingsProvider';

import Code from '../Code/Code';
import SettingsItem from '../SettingsItem/SettingsItem';
import Loading from '../Loading/Loading';
import RadioGroup from '../RadioGroup/RadioGroup';
import RadioOption from '../RadioOption/RadioOption';

import StyledPanel from './Panel.style';

const Panel = () => {
  const {
    themes,
    activeTheme: { theme, name },
    updateActiveTheme,
    config,
    resetThemes
  } = React.useContext(SettingsContext);

  return (
    <StyledPanel>
      <button onClick={() => resetThemes()}>RESET</button>
      {Object.entries(theme).length > 0 && (
        <>
          <div className="panel__content">
            {themes.length > 1 && (
              <div className="panel__themes">
                <RadioGroup
                  label="Active Theme"
                  name="themes"
                  value={name}
                  onChange={val =>
                    updateActiveTheme(themes.filter(t => t.name === val)[0])
                  }
                >
                  {themes.map(t => (
                    <RadioOption key={t.name} label={t.name} value={t.name} />
                  ))}
                </RadioGroup>
              </div>
            )}
            <SettingsItem />
            {config.showCode && <Code value={theme} />}

            <Loading />
          </div>
        </>
      )}
    </StyledPanel>
  );
};

export default Panel;
