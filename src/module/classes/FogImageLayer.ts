import { MODULE_ID, MyFlags } from '../constants';
import { log, pixiDump } from '../helpers';

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

  static get layerOptions() {
    //@ts-ignore
    return mergeObject(super.layerOptions, {
      zIndex: 215, // 215 is just above the normal sight layer
    });
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
    const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);

    // don't init if there is no unexploredImgPath
    if (!unexploredImgPath) {
      return;
    }

    log(true, 'Init FogImageLayer');

    this.unexploredFogSprite = this.addChild(new PIXI.Sprite());
    this.setUnexploredFogSpritePosition();

    this.unexploredMaskSprite = this.addChild(new PIXI.Sprite());

    this.unexploredFogSprite.mask = this.unexploredMaskSprite;

    this._updateUnexploredFogTexture();
    this._updateUnexploredMaskTexture();

    this.visible = canvas.sight.sources.size || !game.user.isGM;
  }

  sightRefresh() {
    console.warn('fogImage.sightRefresh is deprecated and will be removed in a future update.');
    this.maskRefresh();
  }

  /**
   * If the unexploredMaskSprite and unexploredFogTexture exists right now, update the texture, and set visibility
   */
  maskRefresh() {
    if (!this.unexploredMaskSprite || !this.unexploredFogTexture) {
      return;
    }
    log(false, `maskRefresh refreshing`);

    this._updateUnexploredMaskTexture();
    this.visible = canvas.sight.sources.size || !game.user.isGM;
  }

  /**
   * Get, Load, and apply the Fog Image Sprite to this.unexploredFogSprite
   */
  async _updateUnexploredFogTexture() {
    log(false, `_updateUnexploredFogTexture starting`);
    const unexploredImgPath = canvas.scene.getFlag(MODULE_ID, MyFlags.UnexploredImg);

    if (!unexploredImgPath) {
      return;
    }
    log(false, `_updateUnexploredFogTexture updating`);

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
    canvas.sight.fog.filterArea = null;

    negativeFilter.negative(false);

    if (game.modules.get('lessfog')?.active) {
      const threshold = game.settings.get('lessfog', 'unexplored_darkness');
      log(false, 'unexplored texture threshold', threshold);
      greyScaleFilter.greyscale(threshold + 0.02, false);
    } else {
      greyScaleFilter.greyscale(0.8, false);
    }

    // render the canvas.sight.fog to the waiting texture
    canvas.app.renderer.render(canvas.sight.fog, this.unexploredMaskTexture);
    this.unexploredMaskSprite.texture = this.unexploredMaskTexture;

    // revert the filters to the normal filters after rendering the mask texture
    canvas.sight.fog.filters = [canvas.sight.filter];
    canvas.sight.fog.filterArea = canvas.app.screen;
  }

  setUnexploredMaskTexture(
    texture: PIXI.Texture,
    options?: {
      isInverted?: boolean;
    }
  ) {
    const { isInverted = true } = options || {};

    if (!this.unexploredMaskSprite) {
      log(false, `setUnexploredMaskTexture`, 'tried to set a texture but the sprite does not exist');
      return;
    }

    log(false, `setUnexploredMaskTexture`, 'setting sprite texture');
    this.unexploredMaskSprite.texture = texture;
  }
}
