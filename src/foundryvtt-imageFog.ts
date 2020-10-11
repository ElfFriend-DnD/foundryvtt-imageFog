import { log } from './helpers';
import { registerSettings } from './module/settings';
import { preloadTemplates } from './module/preloadTemplates';
import { MODULE_ID, MySettings, MyFlags } from './constants';
import { libWrapper } from './module/shim';

const _drawFogContainerPatch = (_drawFogContainer) => {
  log(true, '_drawFogContainerPatch', {
    canvas,
  });

  return _drawFogContainer();
};

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  // Do anything after initialization but before ready
  libWrapper.register(MODULE_ID, 'SightLayer.prototype._drawFogContainer', _drawFogContainerPatch, 'WRAPPER');
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
  // Do anything once the module is ready
});

// Add any additional hooks if necessary

// from https://github.com/death-save/gm-bg/blob/master/gm-bg.js
Hooks.on('renderSceneConfig', (app, html, data) => {
  const exploredImg = app.entity.getFlag(MODULE_ID, MyFlags.ExploredImg);
  const unexploredImg = app.entity.getFlag(MODULE_ID, MyFlags.UnexploredImg);
  const bg = app.entity.img;

  const imgFogFormHtml = `
  <p class="notes">This Image is what will replace the Black of an unexplored map's area.</p>
  <div class="form-group">
      <label>Unexplored Fog Background Image</label>
      <div class="form-fields">
          <button type="button" class="file-picker" data-type="imagevideo" data-target="flags.${MODULE_ID}.${
    MyFlags.UnexploredImg
  }" title="Browse Files" tabindex="-1">
              <i class="fas fa-file-import fa-fw"></i>
          </button>
          <input class="image" type="text" name="flags.${MODULE_ID}.${MyFlags.UnexploredImg}" value="${
    unexploredImg ? unexploredImg : bg ? bg : ``
  }" placeholder="Unexplored Fog Background Image File Path" data-dtype="String" />
      </div>
  </div>
  <p class="notes">This Image is what will replace the lighter fog of an explored area.</p>
  <div class="form-group">
      <label>Explored Fog Background Image</label>
      <div class="form-fields">
          <button type="button" class="file-picker" data-type="imagevideo" data-target="flags.${MODULE_ID}.${
    MyFlags.ExploredImg
  }" title="Browse Files" tabindex="-1">
              <i class="fas fa-file-import fa-fw"></i>
          </button>
          <input class="image" type="text" name="flags.${MODULE_ID}.${MyFlags.ExploredImg}" value="${
    exploredImg ? exploredImg : unexploredImg ? unexploredImg : bg ? bg : ``
  }" placeholder="Explored Fog Background Image File Path" data-dtype="String" />
      </div>
  </div>
  `;

  const darknessSlider = html.find('[name=darkness]');
  const formGroup = darknessSlider.closest('.form-group');

  // insert our form fields into the map config form before the darkness level input
  formGroup.before(imgFogFormHtml);

  const unexploredImgFilePicker = html.find(`button[data-target="flags.${MODULE_ID}.${MyFlags.UnexploredImg}"]`)[0];
  const exploredImgFilePicker = html.find(`button[data-target="flags.${MODULE_ID}.${MyFlags.ExploredImg}"]`)[0];

  app._activateFilePicker(unexploredImgFilePicker);
  app._activateFilePicker(exploredImgFilePicker);
});

Hooks.on('canvasReady', async (canvas) => {
  const d = canvas.dimensions;
  const bg = canvas.scene.data.img;
  const sightFilter = { ...canvas.sight.filter };
  const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);
  const blurDistance = game.settings.get('core', 'softShadows') ? CONFIG.Canvas.blurStrength : 0;
  // const exploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.ExploredImg);

  log(false, 'canvasReady, adding our image sprites', {
    unexploredImgPath,
    sightFilter,
    canvas: { ...canvas },
    blurDistance: blurDistance,
  });

  const unexploredTexture = await loadTexture(unexploredImgPath);
  // const exploredTexture = await loadTexture(exploredImgPath);

  // canvas.sight.filter.blurXFilter.enabled = false; // disable blur
  // canvas.sight.filter.blurYFilter.enabled = false; // disable blur
  canvas.sight.filter.blur = 0.01;
  // canvas.sight.filter.blendMode = PIXI.BLEND_MODES.NORMAL;

  const fogContainer = canvas.sight.fog;
  const fogCurrentContainer = fogContainer.current;
  const fogExploredContainer = fogContainer.explored;

  log(false, 'fogContainer before', {
    ...fogContainer,
  });

  fogContainer.unexplored = null;

  // Apply a multiply blend filter to the fog.current Container
  fogCurrentContainer.filter =
    blurDistance > 0 ? new PIXI.filters.BlurFilter(blurDistance) : new PIXI.filters.AlphaFilter(1.0);
  // fogCurrentContainer.filter.blendMode = PIXI.BLEND_MODES.SCREEN;
  fogCurrentContainer.filters = [fogCurrentContainer.filter];

  // Apply a multiply blend filter to the fog.explored Container
  fogExploredContainer.filter =
    blurDistance > 0 ? new PIXI.filters.BlurFilter(blurDistance) : new PIXI.filters.AlphaFilter(1.0);
  // fogExploredContainer.filter.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  fogExploredContainer.filters = [fogExploredContainer.filter];

  log(false, 'fogContainer after', {
    ...fogContainer,
  });

  // create the unexplored image sprite
  const unexploredFogSprite = new PIXI.Sprite(unexploredTexture);
  unexploredFogSprite.blendMode = PIXI.BLEND_MODES.SCREEN;

  unexploredFogSprite.position.set(d.paddingX, d.paddingY);
  unexploredFogSprite.width = d.sceneWidth;
  unexploredFogSprite.height = d.sceneHeight;

  // add the sprite to the unexplored container
  fogContainer.addChildAt(unexploredFogSprite, 1); // index 0 is the black fog fill

  log(false, 'added unexploredFogSprite', {
    unexploredFogSprite,
    canvas,
  });

  //   // Non-GM users should always render the default background
  //   if (!game.user.isGM) {
  //     return;
  //   }

  //   const bg = canvas.scene.data.img;
  //   const gmFlag = canvas.scene.getFlag('gm-bg', 'gm-img');
  //   const pcFlag = canvas.scene.getFlag('gm-bg', 'pc-img');

  //   // Check that there is a GM background set, and if the scene background doesn't match, swap it out
  //   if (gmFlag && bg !== gmFlag) {
  //     canvas.scene.data.img = gmFlag;
  //     return;
  //   }
});

// Hooks.on('preUpdateScene', (scene, updateData, options, userId) => {
//   const bgUpdate = getProperty(updateData, 'img');
//   //const gmBGUpdate = getProperty(updateData, "flags.gm-bg.gm-img");

//   if (!bgUpdate) {
//     return;
//   }

//   //const bg = bgUpdate ? updateData.img : scene.img;
//   const pcFlag = canvas.scene.getFlag('gm-bg', 'pc-img');

//   // If the flag doesn't match the background
//   if (pcFlag !== bgUpdate) {
//     setProperty(updateData, 'flags.gm-bg.pc-img', bgUpdate);
//   }
// });

// Hooks.on('updateScene', (scene, updateData, options, userId) => {
//   let changed = new Set(Object.keys(updateData).filter((k) => k !== '_id'));

//   const redraw = [
//     'backgroundColor',
//     'drawings',
//     'gridType',
//     'grid',
//     'gridAlpha',
//     'gridColor',
//     'gridDistance',
//     'gridUnits',
//     'shiftX',
//     'shiftY',
//     'width',
//     'height',
//     'img',
//     'tokenVision',
//     'globalLight',
//     'fogExploration',
//     'lights',
//     'sounds',
//     'templates',
//     'tiles',
//     'tokens',
//     'walls',
//     'weather',
//   ];

//   // The scene is already going to redraw, so nothing to do
//   if (redraw.some((k) => changed.has(k))) {
//     return;
//   }

//   const gmFlag = canvas.scene.getFlag('gm-bg', 'gm-img');
//   const pcFlag = canvas.scene.getFlag('gm-bg', 'pc-img');

//   // If I am a GM user and the background does not match the flag, redraw
//   // If I am not a GM user and the background does not match the PC flag, redraw
//   if ((game.user.isGM && gmFlag && scene.img !== gmFlag) || (!game.user.isGM && pcFlag && scene.img !== pcFlag)) {
//     return canvas.draw();
//   }
// });
