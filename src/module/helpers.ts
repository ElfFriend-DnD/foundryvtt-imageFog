import { MODULE_ID } from './constants';

export function log(force: boolean, ...args) {
  if (force || CONFIG[MODULE_ID].debug === true) {
    console.log(MODULE_ID, '|', ...args);
  }
}

/**
 * Dumps a render of a given pixi container or texture to a new tab
 */
export async function pixiDump(tgt = null) {
  canvas.app.render();
  const data = canvas.app.renderer.extract.base64(tgt);
  const win = window.open();
  win.document.write(`<img src='${data}'/>`);
}

// Debugging use
// @ts-ignore
// window.ImgFog = {
//   pixiDump,
// };
