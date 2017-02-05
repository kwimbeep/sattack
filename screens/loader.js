/*********************************
 SquareAttack - screens/loader.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2013
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

function Loader(game) {
  Screen.call(this, game);
  this.returnScreen = this.game.SCREENS.LOADER;
  this.itemsToLoad = this.game.audioManager.loadState.count + this.game.imageManager.loadState.count;
  this.step = Math.round(100 / this.itemsToLoad);
  this.loadedItems = 0;
  this.dimensions = { x: this.game.W / 2 - 150, y: this.game.H / 2 - 15, w: 300, h: 30 };
}

Loader.prototype = new Screen();
Loader.prototype.constructor = Loader;

Loader.prototype.update = function() {
  Screen.prototype.update.call(this);
  this.loadedItems = this.game.audioManager.loadState.loaded + this.game.imageManager.loadState.loaded;
  if (this.game.audioManager.loadState.ready && this.game.imageManager.loadState.ready) {
    this.fadeOut(this.game.SCREENS.MENU);
  }
};

Loader.prototype.render = function() {
  var ctx = this.game.ctx;
  ctx.save();
  this.renderBG(ctx);
  ctx.fillStyle = 'hsla(0, 0%, 50%, 1)';
  ctx.strokeStyle = 'hsla(0, 0%, 50%, 1)';
  ctx.lineWidth = 2;
  ctx.strokeRect(this.dimensions.x - 5, this.dimensions.y - 5, this.dimensions.w + 10, this.dimensions.h + 10);
  ctx.fillRect(this.dimensions.x, this.dimensions.y, Math.round(this.dimensions.w / this.itemsToLoad * this.loadedItems), this.dimensions.h);
  ctx.fillStyle = 'hsla(0, 0%, 10%, 1)';
  ctx.fillText(this.loadedItems * this.step, 0, 0);
  ctx.restore();
  Screen.prototype.render.call(this);
};

Loader.prototype.renderBG = function(ctx) {
  ctx.fillStyle = 'hsla(0, 0%, 10%, 1)';
  ctx.fillRect(0, 0, this.game.W, this.game.H);
};