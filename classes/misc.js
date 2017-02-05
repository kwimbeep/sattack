/*********************************
 SquareAttack - classes/misc.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2013
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

//-------------- EventTimer ---------------//

function EventTimer(i) {
  this.timer = 0;
  this.interval = i;
}

EventTimer.prototype.tick = function(fTime) {
  this.timer += fTime;
  return this.timer >= this.interval;
};

EventTimer.prototype.reset = function() {
  this.timer = 0;
};

//---------------- Stats ------------------//

function Stats(parent) {
  this.parent = parent;
  this.left = 380; this.top = 20;
  this.lineHeight = 20;
  this.colors = { f: 'hsla(62, 20%, 45%, 1)', b: 'hsla(0, 0%, 10%, 1)' };
  this.count = 0;
  this.record = 0;
  this.ready = false;
}

Stats.prototype.reset = function() {
  this.count = 0;
  this.ready = true;
};

Stats.prototype.save = function() {
  localData('record', this.count);
};

Stats.prototype.load = function() {
  this.record = localData('record');
};

Stats.prototype.render = function(ctx) {
  if (!this.ready) { return; }
  ctx.save();
  ctx.strokeStyle = this.colors.b;
  ctx.fillStyle = this.colors.f;
  ctx.font = '30px safont';
  ctx.textAlign = 'end';
  ctx.textBaseline = 'top';
  ctx.fillText(this.count + ' : ' + this.record, this.left, this.top);
  ctx.strokeText(this.count + ' : ' + this.record, this.left, this.top);
  ctx.restore();
};

//-------------- Clickable ----------------//

function Clickable() {
  this.items = {};
}

Clickable.prototype.check = function(x, y, pointerDown) {
  if (pointerDown === undefined) pointerDown = false;
  var returnValue = null;
  for (var p in this.items) {
    if ((x > this.items[p].x) && (x < this.items[p].x + this.items[p].w) && (y > this.items[p].y) && (y < this.items[p].y + this.items[p].h)) {
      this.items[p].active = (pointerDown) ? true : false;
      returnValue = p;
    } else {
      this.items[p].hover = false;
      this.items[p].active = false;
    }
  }
  return returnValue;
};

Clickable.prototype.deactivateAll = function() {
  for (var p in this.items) {
    this.items[p].active = false;
  }
};

//-------------- Title Menu ---------------//

function TitleMenu() {
  this.clickable = new Clickable();
  this.items = {
    play: {
      text: 'Play',
      active: false,
      x: 10, y: 400, w: 200, h: 70
    }
  };
  this.clickable.items = this.items;
  this.colors = { f: 'hsla(62, 20%, 45%, 1)', b: 'hsla(0, 0%, 10%, 1)' };
  this.aColors = { f: 'hsla(62, 20%, 25%, 1)', b: 'hsla(0, 0%, 10%, 1)' };
}

TitleMenu.prototype.check = function(x, y, pointerDown) {
  return this.clickable.check(x, y, pointerDown);
};

TitleMenu.prototype.render = function(ctx) {
  ctx.fillStyle = this.colors.f;
  ctx.strokeStyle = this.colors.b;
  var items = this.items;
  items = this.clickable.items;
  for (var p in items) {
    ctx.save();
    if (items[p].active) { ctx.fillStyle = this.aColors.f; ctx.strokeStyle = this.aColors.b; }
    var x = items[p].x; var y = items[p].y;
    var w = items[p].w; var h = items[p].h;
    var cX = x + (w / 2); var cY = y + (h / 2);
    //ctx.strokeRect(x, y, w, h);
    ctx.fillText(items[p].text, cX, cY);
    ctx.strokeText(items[p].text, cX, cY);
    ctx.restore();
  }
};

//-------------- Background ---------------//

function Background(parent) {
  this.tileSize = 50;
  this.bg = [];
  for (var i = 0; i <= Math.ceil(parent.game.H / this.tileSize); i++) {
    for (var j = 0; j <= Math.ceil(parent.game.W / this.tileSize); j++) {
      this.bg.push([]);
      this.bg[i][j] = 'hsla(62, 20%, RANDOM%, 1)'.replace('RANDOM', getRandomInt(25, 30));
    }
  }
}

Background.prototype.render = function(ctx) {
  for (var i = 0; i < this.bg.length; i++) {
    for (var j = 0; j < this.bg[i].length; j++) {
      var x = j * this.tileSize;
      var y = i * this.tileSize;
      ctx.fillStyle = this.bg[i][j];
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
      ctx.strokeStyle = 'hsla(0, 0%, 10%, 1)';
      ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    }
  }
};

//--------------- GameOver ----------------//

function GameOver(parent, callback) {
  this.parent = parent;
  this.callback = callback;
  this.timer = new EventTimer(2);
}

GameOver.prototype.update = function(fTime) {
  if (this.timer.tick(fTime)) {
    this.timer.reset();
    this.callback();
  }
};

GameOver.prototype.render = function(ctx) {
  ctx.fillStyle = 'hsla(0, 0%, 0%, 1)';
  ctx.fillText('Game Over!', this.parent.game.W / 2, this.parent.game.H / 2);
};