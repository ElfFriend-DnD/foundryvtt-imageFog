import { log } from './helpers';
import { MODULE_ID } from './constants';
import { renderSceneConfig } from './module/hooks/renderSceneConfig';
import { FogImageLayer } from './module/classes/FogImageLayer';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Debugging Use.
  CONFIG[MODULE_ID] = { debug: false };
  // CONFIG.debug.hooks = true;
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

/* Recreate the Unexplored Mask Texture on every canvas Init */
Hooks.on('canvasInit', () => canvas.fogImage.createUnexploredMaskTexture());

/* Update the right things when sight refreshes */
Hooks.on('sightRefresh', () => {
  log(false, 'sightRefresh hook calling');
  canvas.fogImage.sightRefresh();
});

/* Init on Canvas Ready */
Hooks.on('canvasReady', () => canvas.fogImage.init());

/* If the updateScene is for the current scene and involved our flags changing, redraw canvas */
Hooks.on('updateScene', (scene, diff, { diff: isDiff }) => {
  if (scene.isView && isDiff && !!diff?.flags?.[MODULE_ID]) {
    log(false, 'update the scene we are viewing with a new unexploredFogImage');
    canvas.draw();
  }
});
