import { MODULE_ID, MySettings, MODULE_ABBREV } from './constants';

export const registerSettings = function () {
  // debug use
  // CONFIG[MODULE_ID] = { debug: true };

  game.settings.register(MODULE_ID, MySettings.performanceMode, {
    default: false,
    name: `${MODULE_ABBREV}.settings.performanceMode.Label`,
    type: Boolean,
    config: true,
    hint: `${MODULE_ABBREV}.settings.performanceMode.Hint`,
    scope: 'client',
  });
};
