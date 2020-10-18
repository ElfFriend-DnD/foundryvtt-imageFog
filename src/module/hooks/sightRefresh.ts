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

export const sightRefresh = async (sightLayer) => {
  // updateUnexploredMask(sightLayer);
};

// this some baaaaad juju
const updateUnexploredMask = async (sightLayer) => {
  try {
    const d = canvas.dimensions;
    const unexploredMaskTexture = PIXI.RenderTexture.create({ width: d.width, height: d.height });
    canvas.app.renderer.render(canvas.sight.fog, unexploredMaskTexture);

    log(false, {
      canvas,
    });

    const prior = canvas.sight.removeChild(canvas.sight.unexploredFogMask);

    canvas.sight.unexploredFogMask = canvas.sight.addChild(new PIXI.Sprite(unexploredMaskTexture));
    canvas.sight.unexploredFogSprite.mask = canvas.sight.unexploredFogMask;
  } catch (e) {
    log(true, e);
  }
};
