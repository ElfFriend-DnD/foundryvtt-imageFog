import { MODULE_ID, MyFlags } from '../constants';

export const renderSceneConfig = (app, html, data) => {
  renderUnexploredImgControls(app, html, data);
};

const renderUnexploredImgControls = (app, html, data) => {
  const unexploredImg = app.entity.getFlag(MODULE_ID, MyFlags.UnexploredImg);
  const darknessSlider = html.find('[name=fogExploration]');
  const formGroup = darknessSlider.closest('.form-group');

  const unexploredFogImageFormHtml = `
  <div class="form-group">
      <label>Unexplored Fog Background Image</label>
      <div class="form-fields">
          <button type="button" class="file-picker" data-type="imagevideo" data-target="flags.${MODULE_ID}.${
    MyFlags.UnexploredImg
  }" title="Browse Files" tabindex="-1">
              <i class="fas fa-file-import fa-fw"></i>
          </button>
          <input class="image" type="text" name="flags.${MODULE_ID}.${MyFlags.UnexploredImg}" value="${
    unexploredImg ? unexploredImg : ``
  }" placeholder="Unexplored Fog Background Image File Path" data-dtype="String" />
      </div>
  </div>
  <p class="notes">This Image is what will replace the Black of an unexplored map's area.</p>
  `;

  // insert our unexploredFogImageFormHtml into the map config form after the "Fog Exploration" checkbox
  formGroup.after(unexploredFogImageFormHtml);

  const unexploredImgFilePicker = html.find(`button[data-target="flags.${MODULE_ID}.${MyFlags.UnexploredImg}"]`)[0];
  app._activateFilePicker(unexploredImgFilePicker);
};
