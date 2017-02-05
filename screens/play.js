/*********************************
 SquareAttack - screens/play.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2013
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

function Play(game) {
  Screen.call(this, game);
  this.maxX = this.game.W - 60;
  this.maxY = this.game.H - 60;
  this.returnScreen = this.game.SCREENS.PLAY;
  this.spawnEnemyTimer = new EventTimer(2);
  this.spawnEnemyCount = 1;
  this.difficultyIncreaseStep = 10;
  this.player = null;
  this.stats = new Stats(this);
  this.playing = false;
  this.bg = new Background(this);
  var that = this;
  this.onInit = function() { that.start(); };
  this.init();
  this.info = {};
}

Play.prototype = new Screen();
Play.prototype.constructor = Play;

Play.prototype.init = function() {};

Play.prototype.start = function() {
  this.o.length = 0;
  this.spawnEnemyCount = 1;
  this.stats.reset();
  this.stats.load();
  this.player = this.pushObject(new Player(this, getRandomInt(0, this.maxX), getRandomInt(0, this.maxY)));
  this.spawnEnemies();
  this.playing = true;
};

Play.prototype.handleEvents = function() {
  if (!this.playing) { return; }
  var iManager = this.game.inputManager;
  while (event = iManager.getEvent()) {
    switch (event.type) {
      case 'keyUp':
        switch (event.key) {
          case iManager.KEYS.ESC:
            this.exit();
            break;
        }
        break;
      case 'pointerDown':
        var o = this.checkOccupied(event.x, event.y);
        if (o && o.constructor === Enemy) {
          this.player.startAttack(event.x, event.y);
        } else {
          this.player.startMove(event.x, event.y);
        }
        break;
      case 'pointerUp':
        break;
    }
  }
};

Play.prototype.update = function() {
  Screen.prototype.update.call(this);
  if (!this.playing) { return; }
  if (!this.player.alive) {
    this.playing = false;
    if (this.stats.count > this.stats.record) { this.stats.save(); }
    var that = this;
    this.pushObject(new GameOver(this, function() { that.exit(); }));
  }
  if (this.spawnEnemyTimer.tick(this.game.frameTime)) {
    this.spawnEnemyTimer.reset();
    this.spawnEnemies();
  }
};

Play.prototype.render = function() {
  var ctx = this.game.ctx;
  this.bg.render(ctx);
  Screen.prototype.render.call(this);
  this.stats.render(ctx);
  drawInfo(ctx, this.info);
};

Play.prototype.enemyDown = function() {
  this.stats.count++;
  if (this.stats.count % this.difficultyIncreaseStep === 0) {
    if (this.spawnEnemyCount < 3) {
      this.spawnEnemyCount++;
      if (this.spawnEnemyCount >= 3) {
        this.difficultyIncreaseStep = 20;
      } else {
        this.difficultyIncreaseStep *= 3;
      }
      this.spawnEnemyTimer.interval += 1;
    } else if (this.spawnEnemyTimer.interval > 0.5) {
      this.spawnEnemyTimer.interval -= 0.1;
    }
  }
};

Play.prototype.spawnEnemies = function() {
  for (var i = 1; i <= this.spawnEnemyCount; i++) {
    this.spawnEnemy();
  }
};

Play.prototype.spawnEnemy = function() {
  var x, y, c, e, side;
  do {
    side = getRandomInt(1, 4);
    switch (side) {
      case 1:
        x = getRandomInt(0, this.maxX);
        y = 0;
        break;
      case 2:
        x = this.maxX;
        y = getRandomInt(0, this.maxY);
        break;
      case 3:
        x = getRandomInt(0, this.maxX);
        y = this.maxY;
        break;
      case 4:
        x = 0;
        y = getRandomInt(0, this.maxY);
    }
    e = new Enemy(this, x, y);
    c = e.checkCollisions();
  } while (c);
  this.pushObject(e);
};

Play.prototype.exit = function() {
  this.stats.ready = false;
  this.fadeOut(this.game.SCREENS.MENU);
};

Play.prototype.checkOccupied = function(x, y) {
  for (var i = 0; i < this.o.length; i++) {
    var o = this.o[i];
    if ((o.alive) && (x > o.x) && (x < o.x + o.w) && (y > o.y) && (y < o.y + o.h)) { return o; }
  }
  return null;
};