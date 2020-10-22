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

  setUnexploredFogSpritePosition() {
    log(false, 'setUnexploredFogSpritePosition');
    if (!this.unexploredFogSprite) {
      return;
    }
    const d = canvas.dimensions.sceneRect;
    this.unexploredFogSprite.position.set(d.x, d.y);
    this.unexploredFogSprite.width = d.width;
    this.unexploredFogSprite.height = d.height;
  }

  /**
   * Create the Unexplored Fog Sprite and Mask Sprite
   */
  init() {
    log(true, 'Init FogImageLayer');
    const d = canvas.dimensions;

    this.unexploredFogSprite = this.addChild(new PIXI.Sprite());
    this.setUnexploredFogSpritePosition();

    this.unexploredMaskSprite = this.addChild(new PIXI.Sprite());

    this.unexploredFogSprite.mask = this.unexploredMaskSprite;

    this._updateUnexploredFogTexture();
    this._updateUnexploredMaskTexture();

    this.visible = canvas.sight.sources.size || !game.user.isGM;
  }

  /**
   * If the unexploredMaskSprite exists right now, update the texture, and set visibility
   */
  sightRefresh() {
    if (!this.unexploredMaskSprite) {
      return;
    }

    this._updateUnexploredMaskTexture();
    this.visible = canvas.sight.sources.size || !game.user.isGM;
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

    // render the canvas.sight.fog to the waiting texture
    canvas.app.renderer.render(canvas.sight.fog, this.unexploredMaskTexture);
    this.unexploredMaskSprite.texture = this.unexploredMaskTexture;

    // revert the filters to the normal filters after rendering the mask texture
    canvas.sight.fog.filters = [canvas.sight.filter];
  }
}
