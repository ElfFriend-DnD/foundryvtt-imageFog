import { MySettings, MODULE_ID } from '../constants';

export const registerSettings = function () {
  CONFIG[MODULE_ID] = { debug: true };
  CONFIG.debug.hooks = true;
  // Register any custom module settings here
};
