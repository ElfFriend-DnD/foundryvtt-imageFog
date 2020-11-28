import { log } from './module/helpers';
import { MODULE_ID, MyFlags, MySettings } from './module/constants';
import { renderSceneConfig } from './module/hooks/renderSceneConfig';
import { FogImageLayer } from './module/classes/FogImageLayer';
import { libWrapper } from './module/libWrapperShim';
import { registerSettings } from './module/settings';

/* Create the FogImageLayer once on the canvas on load */

//@ts-ignore
let theLayers = Canvas.layers;
theLayers.fogImage = FogImageLayer;

//@ts-ignore
Object.defineProperty(Canvas, 'layers', {
  get: function () {
    return theLayers;
  },
});

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  await registerSettings();

  // Debugging Use.
  CONFIG[MODULE_ID] = { debug: true };
  // CONFIG.debug.hooks = true;
  // @ts-ignore
  // CONFIG.debug.fog = true;

  libWrapper.register(
    MODULE_ID,
    'SightLayer.prototype.updateFog',
    function (updateFog, ...args) {
      const performanceMode = game.settings.get(MODULE_ID, MySettings.performanceMode);
      if (performanceMode && canvas?.fogImage?.unexploredFogTexture) {
        log(false, 'SightLayer.updateFog called, ImageFog is updating the mask', {
          ...args,
        });
        canvas.fogImage.maskRefresh();
      }

      updateFog(args);
    },
    'WRAPPER'
  );
});

/* Inject our scene config settings */
Hooks.on('renderSceneConfig', renderSceneConfig);

/* Recreate the Unexplored Mask Texture on every canvas Init */
Hooks.on('canvasInit', () => {
  canvas.fogImage.createUnexploredMaskTexture();

  // @ts-ignore
  window.fogImage = {
    maskRefresh: canvas.fogImage.maskRefresh,
    setUnexploredMaskTexture: (texture: PIXI.Texture) => {
      if (!canvas.fogImage?.unexploredMaskSprite) {
        log(false, `setUnexploredMaskTexture`, 'tried to set a texture but the sprite does not exist');
        return;
      }

      log(false, `setUnexploredMaskTexture`, 'setting sprite texture');
      canvas.fogImage.unexploredMaskSprite.texture = texture;
    },
  };

  Hooks.call('ImageFogReady');
});

/* Update the right things when sight refreshes */
Hooks.on('sightRefresh', () => {
  const performanceMode = game.settings.get(MODULE_ID, MySettings.performanceMode);

  if (!performanceMode) {
    log(false, 'sightRefresh hook called, updating ImageFog mask');
    canvas.fogImage.maskRefresh();
  }
});

/* Init on Canvas Ready */
Hooks.on('canvasReady', () => {
  const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);
  if (!!unexploredImgPath) {
    canvas.fogImage.init();
  }
});

/* If the updateScene is for the current scene and involved our flags changing, redraw canvas */
Hooks.on('updateScene', (scene, diff, { diff: isDiff }) => {
  if (scene.isView && isDiff && !!diff?.flags?.[MODULE_ID]) {
    log(false, 'update the scene we are viewing with a new unexploredFogImage');
    canvas.draw();
  }
});
