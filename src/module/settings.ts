import { MySettings, MODULE_ID } from '../constants';

export const registerSettings = function () {
  CONFIG[MODULE_ID] = { debug: false };
  // Register any custom module settings here
};
