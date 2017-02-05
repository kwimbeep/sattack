/*********************************
 SquareAttack - screens/menu.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2013
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

function Menu(game) {
  Screen.call(this, game);
  this.returnScreen = this.game.SCREENS.MENU;
  this.menu = new TitleMenu();
  this.menu.items.play.x = (this.game.W / 2) - (this.menu.items.play.w / 2);
  this.bg = new Background(this);
  this.info = {};
}

Menu.prototype = new Screen();
Menu.prototype.constructor = Menu;

Menu.prototype.handleEvents = function() {
  while (event = this.game.inputManager.getEvent()) {
    switch (event.type) {
      case 'keyUp':
        switch (event.key) {
          case this.game.inputManager.KEYS.DELETE:
            localStorage.clear();
            break;
        }
        break;
      case 'pointerDown':
        var button = this.menu.check(event.x, event.y, true);
        if (button) { this.game.audioManager.playSound('MENU_CLICK'); }
        break;
      case 'pointerUp':
        var button = this.menu.check(event.x, event.y, false);
        switch (button) {
          case 'play':
            this.fadeOut(this.game.SCREENS.PLAY);
            break;
        }
        break;
    }
  }
};

Menu.prototype.update = function() {
  Screen.prototype.update.call(this);
};

Menu.prototype.render = function() {
  var ctx = this.game.ctx;
  this.bg.render(ctx);
  this.renderTitle(ctx);
  this.menu.render(ctx);
  Screen.prototype.render.call(this);
  drawInfo(ctx, this.info);
};

Menu.prototype.renderTitle = function(ctx) {
  ctx.fillStyle = 'hsla(62, 20%, 45%, 1)';
  ctx.strokeStyle = 'hsla(0, 0%, 10%, 1)';
  ctx.fillText('SquareAttack', this.game.W / 2, 100);
  ctx.strokeText('SquareAttack', this.game.W / 2, 100);
};