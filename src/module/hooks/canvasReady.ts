import { MODULE_ID, MyFlags } from '../../constants';
import { log } from '../../helpers';

export const canvasReady = async (canvas) => {
  await renderExploredImgOnFogLayer(canvas);
};

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
