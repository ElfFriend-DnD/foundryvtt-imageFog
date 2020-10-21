import { MODULE_ID, MyFlags } from '../../constants';
import { log } from '../../helpers';

export class FogImageLayer extends CanvasLayer {
  unexploredFogTexture: PIXI.Texture;
  unexploredFogSprite: PIXI.Sprite;

  unexploredMaskTexture: PIXI.RenderTexture;
  unexploredMaskSprite: PIXI.Sprite;

  createUnexploredMaskTexture() {
    log(false, 'createUnexploredMaskTexture');
    const d = canvas.dimensions;

    this.unexploredMaskTexture = PIXI.RenderTexture.create({ width: d.width, height: d.height });
  }

  init() {
    log(true, 'Init FogImageLayer', {
      unexploredFogTexture: this.unexploredFogTexture,
      unexploredFogSprite: this.unexploredFogSprite,
      unexploredMaskTexture: this.unexploredMaskTexture,
      unexploredMaskSprite: this.unexploredMaskSprite,
    });
    const d = canvas.dimensions;

    this.unexploredFogSprite = this.addChild(new PIXI.Sprite());
    this.unexploredFogSprite.position.set(d.paddingX, d.paddingY);
    this.unexploredFogSprite.width = d.sceneWidth;
    this.unexploredFogSprite.height = d.sceneHeight;

    this.unexploredMaskSprite = this.addChild(new PIXI.Sprite());

    this.unexploredFogSprite.mask = this.unexploredMaskSprite;

    this._updateUnexploredFogTexture();
    this._updateUnexploredMaskTexture();
  }

  sightRefresh() {
    if (!!this.unexploredMaskSprite) {
      this._updateUnexploredMaskTexture();
    }
  }

  /**
   * Get, Load, and apply the Fog Image Sprite to this.unexploredFogSprite
   */
  async _updateUnexploredFogTexture() {
    log(false, `_updateUnexploredFogTexture starting`);
    const d = canvas.dimensions;
    const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);
    this.unexploredFogTexture = await loadTexture(unexploredImgPath);

    this.unexploredFogSprite.texture = this.unexploredFogTexture;
    log(false, `_updateUnexploredFogTexture ending`, {
      unexploredImgPath,
      unexploredTexture: this.unexploredFogTexture,
    });
  }

  /**
   * 1. Change the filters on the SightLayer.fog container
   * 2. Render that container into the existing unexploredMaskTexture RenderTexture
   * 3. reset the filters on the SightLayer.fog
   */
  async _updateUnexploredMaskTexture() {
    log(false, `_updateUnexploredMaskTexture`, {
      fog: canvas.sight.fog,
      unexploredMaskTexture: this.unexploredMaskTexture,
    });

    // apply filters to canvas.sight.fog
    const greyScaleFilter = new PIXI.filters.ColorMatrixFilter();
    const negativeFilter = new PIXI.filters.ColorMatrixFilter();
    const blurDistance = game.settings.get('core', 'softShadows') ? CONFIG.Canvas.blurStrength : 0;
    const filter = blurDistance > 0 ? new PIXI.filters.BlurFilter(blurDistance) : new PIXI.filters.AlphaFilter(1.0);
    filter.blendMode = PIXI.BLEND_MODES.NORMAL;
    canvas.sight.fog.filters = [filter, greyScaleFilter, negativeFilter];

    negativeFilter.negative(false);

    greyScaleFilter.greyscale(0.8, false);

    canvas.app.renderer.render(canvas.sight.fog, this.unexploredMaskTexture);
    this.unexploredMaskSprite.texture = this.unexploredMaskTexture;

    // revert the filters to the normal filters after rendering the mask texture
    canvas.sight.fog.filters = [canvas.sight.filter];
  }
}
