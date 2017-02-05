/*********************************
 SquareAttack - classes/screen.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2013
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

//----------------- Fader -----------------//

function Fader(parent, type, callback) {
  this.parent = parent;
  this.callback = callback;
  this.alpha = (type === 'in') ? 1 : 0;
  this.increment = (type === 'in') ? -0.05 : 0.05;
}

Fader.prototype.update = function(fTime) {
  this.alpha += this.increment;
  if ((this.alpha < 0) || (this.alpha > 1)) { this.callback(); }
};

Fader.prototype.render = function(ctx) {
  ctx.save();
  ctx.globalAlpha = this.alpha;
  ctx.fillStyle = 'hsla(0, 0%, 0%, 1)';
  ctx.fillRect(0, 0, this.parent.game.W, this.parent.game.H);
  ctx.restore();
};

//---------------- Screen -----------------//

function Screen(game) {
  this.game = game;
  this.o = [];
  this.oId = 0;
  this.fadeIn();
}

Screen.prototype.loop = function() {
  this.handleEvents();
  this.update();
  this.render();
  return this.returnScreen;
};

Screen.prototype.handleEvents = function() {};

Screen.prototype.update = function() {
  for (var i = 0; i < this.o.length; i++) { this.o[i].update(this.game.frameTime); }
};

Screen.prototype.render = function() {
  var ctx = this.game.ctx;
  for (var i = 0; i < this.o.length; i++) { this.o[i].render(ctx); }
};

Screen.prototype.pushObject = function(o) {
  this.o.push(o) - 1;
  this.oId++;
  o.id = this.oId;
  return o;
};

Screen.prototype.removeObject = function(i) {
  delete this.o[i];
  this.o.splice(i, 1);
};

Screen.prototype.removeObjectById = function(id) {
  for (var i = 0; i < this.o.length; i++) {
    if (this.o[i].id === id) {
      this.removeObject(i);
      break;
    }
  }
};

Screen.prototype.fadeIn = function() {
  var that = this;
  this.pushObject(new Fader(this, 'in', function() { that.removeObject(0); if (that.onInit) that.onInit(); }));
};

Screen.prototype.fadeOut = function(returnScreen) {
  var that = this;
  this.pushObject(new Fader(this, 'out', function() { that.returnScreen = returnScreen; }));
};