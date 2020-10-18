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
};

const renderUnexploredImgLayer = async (canvas) => {
  const d = canvas.dimensions;
  const blurDistance = game.settings.get('core', 'softShadows') ? CONFIG.Canvas.blurStrength : 0;
  const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);
  const unexploredTexture = await loadTexture(unexploredImgPath);

  // add fogImg CanvasLayer
  // const index = canvas.stage.getChildIndex(canvas.sight) + 1;
  // canvas.fogImg = canvas.stage.addChildAt(new CanvasLayer(), index);

  // add image sprite to sight layer.
  canvas.sight.unexploredFogSprite = new PIXI.Sprite(unexploredTexture);
  canvas.sight.unexploredFogSprite.position.set(d.paddingX, d.paddingY);
  canvas.sight.unexploredFogSprite.width = d.sceneWidth;
  canvas.sight.unexploredFogSprite.height = d.sceneHeight;

  canvas.sight.addChild(canvas.sight.unexploredFogSprite);

  log(false, {
    sightLayer: canvas.sight,
    fog: canvas.sight.fog,
  });

  // canvas.sight.filter.blendMode = PIXI.BLEND_MODES.NORMAL;

  const filter = blurDistance > 0 ? new PIXI.filters.BlurFilter(blurDistance) : new PIXI.filters.AlphaFilter(1.0);
  filter.blendMode = PIXI.BLEND_MODES.NORMAL;
  const invertFilter = new PIXI.filters.ColorMatrixFilter();

  log(false, { existingFilter: canvas.sight.fog.filters, newFilter: [filter] });

  // // apply ColorMatrixFilter to sight layer
  canvas.sight.fog.filters = [filter, invertFilter];
  // activate the negative ColorMatrixFilter
  invertFilter.negative(false);

  const unexploredMaskTexture = PIXI.RenderTexture.create({ width: d.width, height: d.height });
  canvas.app.renderer.render(canvas.sight.fog, unexploredMaskTexture);

  canvas.sight.unexploredFogSprite.mask = new PIXI.Sprite(unexploredMaskTexture);
  canvas.sight.addChild(canvas.sight.unexploredFogSprite.mask);
};
