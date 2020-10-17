import { log } from './helpers';
import { registerSettings } from './module/settings';
import { MODULE_ID, MySettings, MyFlags } from './constants';
import { libWrapper } from './module/shim';
import { renderSceneConfig } from './module/hooks/renderSceneConfig';
import { canvasReady } from './module/hooks/canvasReady';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();
});

// from https://github.com/death-save/gm-bg/blob/master/gm-bg.js
Hooks.on('renderSceneConfig', renderSceneConfig);

Hooks.on('canvasReady', canvasReady);
