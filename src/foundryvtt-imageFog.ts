import { log } from './helpers';
import { registerSettings } from './module/settings';
import { MODULE_ID, MySettings, MyFlags } from './constants';
import { libWrapper } from './module/shim';
import { renderSceneConfig } from './module/hooks/renderSceneConfig';
import { canvasReady } from './module/hooks/canvasReady';
import { sightRefresh } from './module/hooks/sightRefresh';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();
});

Hooks.once('setup', function () {
  // Do anything after initialization but before ready
  libWrapper.register(
    MODULE_ID,
    'SightLayer.prototype._drawFogContainer',
    (original) => {
      log(false, 'Drawing Fog', { canvasConfig: CONFIG.Canvas, sceneConfig: canvas.scene.data });
      return original();
    },
    'WRAPPER'
  );
});

// from https://github.com/death-save/gm-bg/blob/master/gm-bg.js
Hooks.on('renderSceneConfig', renderSceneConfig);

Hooks.on('canvasReady', canvasReady);

Hooks.on('sightRefresh', sightRefresh);
// Hooks.on('canvasReady', FogImgLayer.init);
