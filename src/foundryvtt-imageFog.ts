import { log } from './helpers';
import { registerSettings } from './module/settings';
import { MODULE_ID, MySettings, MyFlags } from './constants';
import { libWrapper } from './module/shim';
import { renderSceneConfig } from './module/hooks/renderSceneConfig';
import { sightRefresh } from './module/hooks/sightRefresh';
import { FogImageLayer } from './module/classes/FogImageLayer';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();
});

/* Inject our scene config settings */
Hooks.on('renderSceneConfig', renderSceneConfig);

/* Only Create the FogImageLayer once */
Hooks.once('canvasInit', () => {
  log(true, `Adding FogImageLayer`);
  // add FogImageLayer
  const index = canvas.stage.getChildIndex(canvas.sight) + 1;
  canvas.fogImage = canvas.stage.addChildAt(new FogImageLayer(), index);
});

Hooks.on('canvasInit', () => canvas.fogImage.createUnexploredMaskTexture());

Hooks.on('sightRefresh', () => {
  log(false, 'sightRefresh hook calling');
  canvas.fogImage.sightRefresh();
});

Hooks.on('canvasReady', () => canvas.fogImage.init());

Hooks.on('updateScene', (scene, diff, { diff: isDiff }) => {
  if (scene.isView && isDiff && !!diff?.flags?.[MODULE_ID]) {
    log(false, 'update the scene we are viewing with a new unexploredFogImage');
    canvas.draw();
  }
});
