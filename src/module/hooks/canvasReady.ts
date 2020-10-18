import { MODULE_ID, MyFlags } from '../../constants';
import { log, pixiDump } from '../../helpers';

// export class FogImgLayer extends CanvasLayer {
//   constructor() {
//     super();
//   }

//   static init() {
//     log(true, 'Init FogImgLayer', { this: this });
//   }
// }

export const canvasReady = async (canvas) => {
  await renderUnexploredImgLayer(canvas);
  log(false, 'dumping', canvas.sight.filter.blendMode);
};

const renderUnexploredImgLayer = async (canvas) => {
  const d = canvas.dimensions;
  const blurDistance = game.settings.get('core', 'softShadows') ? CONFIG.Canvas.blurStrength : 0;
  const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);
  const unexploredTexture = await loadTexture(unexploredImgPath);

  log(false, 'renderUnexploredImgLayer', {
    unexploredImgPath,
  });

  const unexploredFogSprite = new PIXI.Sprite(unexploredTexture);

  unexploredFogSprite.position.set(d.paddingX, d.paddingY);
  unexploredFogSprite.width = d.sceneWidth;
  unexploredFogSprite.height = d.sceneHeight;

  const index = canvas.stage.getChildIndex(canvas.sight) + 1;
  canvas.fogImg = canvas.stage.addChildAt(new CanvasLayer(), index);

  log(false, {
    sightLayer: canvas.sight,
    fog: canvas.sight.fog,
  });

  // canvas.sight.filter.blendMode = PIXI.BLEND_MODES.NORMAL;

  const filter = blurDistance > 0 ? new PIXI.filters.BlurFilter(blurDistance) : new PIXI.filters.AlphaFilter(1.0);
  filter.blendMode = PIXI.BLEND_MODES.NORMAL;

  log(false, { existingFilter: canvas.sight.fog.filters, newFilter: [filter] });

  canvas.sight.fog.filters = [filter];

  // pixiDump(canvas.sight.fog);
  // pixiDump(canvas.sight.fog.explored);

  // canvas.fogImg.addChild(unexploredFogSprite);
  // let renderer = PIXI.autoDetectRenderer({
  //   backgroundColor: 0xffffff,
  // });

  // log(false, 'renderer being used', renderer);

  const unexploredMaskTexture = PIXI.RenderTexture.create({ width: d.width, height: d.height });
  canvas.app.renderer.render(canvas.sight, unexploredMaskTexture);

  // pixiDump(unexploredMaskTexture);

  const unexploredMaskSprite = new PIXI.Sprite(unexploredMaskTexture);
  unexploredMaskSprite.position.set(0, 0);
  unexploredMaskSprite.width = d.width;
  unexploredMaskSprite.height = d.height;

  pixiDump(unexploredMaskSprite);

  // canvas.fogImg.addChild(unexploredMaskSprite);
};

/* Ditched in Favor of new Method */
const renderExploredImgOnFogLayer = async (canvas) => {
  const d = canvas.dimensions;
  const bg = canvas.scene.data.img;
  const sightFilter = { ...canvas.sight.filter };
  const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);
  const blurDistance = game.settings.get('core', 'softShadows') ? CONFIG.Canvas.blurStrength : 0;

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
  canvas.sight.filter.blendMode = PIXI.BLEND_MODES.NORMAL;

  const fogContainer = canvas.sight.fog;
  const fogCurrentContainer = fogContainer.current;
  const fogExploredContainer = fogContainer.explored;

  log(false, 'fogContainer before', {
    ...fogContainer,
  });

  // fogContainer.unexplored = null;

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
};
