/*********************************
 SquareAttack - classes/game.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2013
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

//--------------- Movable -----------------//

function Movable(parent, x, y) {
  if (x === undefined) x = 0; if (y === undefined) y = 0;
  this.alive = true;
  this.parent = parent;
  this.x = x; this.y = y;
  this.w = 60; this.h = 60;
  this.hW = this.w / 2; this.hH = this.h / 2;
  this.id = 0;
  this.moving = false;
  this.attacking = false;
  this.color = 'hsla(0, 0%, 0%, 1)';
  this.image = '';
  this.alpha = 1;
  this.animations = {
    'move': new MoveAnimation(this)
  };
}

Movable.prototype.die = function(remove) {
  if (remove === undefined) remove = false;
  this.alive = false;
  if (remove) { this.parent.removeObjectById(this.id); }
};

Movable.prototype.reset = function() {
  this.x = 0; this.y = 0;
  this.attacking = false;
};

Movable.prototype.startAttack = function(dX, dY) {};

Movable.prototype.startMove = function(dX, dY) {
  this.moving = true;
  this.parent.game.audioManager.playSound('MOVE');
  this.animations.move.start(dX, dY);
};

Movable.prototype.stopMove = function(correctPosition) {
  this.moving = false;
  this.attacking = false;
  this.animations.move.stop(correctPosition);
};

Movable.prototype.update = function(fTime) {
  if (this.alive) {
    for (var p in this.animations) { this.animations[p].update(fTime); }
    var collisionObject = this.checkCollisions();
    if (collisionObject) { this.collide(collisionObject); }
  } else {
    this.alpha -= 0.025;
    if (this.alpha < 0) { this.die(true); }
  }
};

Movable.prototype.collide = function(collisionObject) {};

Movable.prototype.render = function(ctx) {
  ctx.save();
  ctx.globalAlpha = this.alpha;
  if (this.image) {
    ctx.drawImage(this.image, this.x, this.y);
  } else {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
  ctx.restore();
};

// http://www.somethinghitme.com/2013/04/16/creating-a-canvas-platformer-tutorial-part-tw/
Movable.prototype.checkCollisions = function() {
  var cX1, cX2, cY1, cY2, vX, vY, hWidths, hHeights;
  cX1 = this.x + this.hW; cY1 = this.y + this.hH;
  for (var i = 0; i < this.parent.o.length; i++) {
    var o = this.parent.o[i];
    if (o.alive && o !== this) {
      cX2 = o.x + o.hW; cY2 = o.y + o.hH;
      vX = cX1 - cX2; vY = cY1 - cY2;
      hWidths = this.hW + o.hW;
      hHeights = this.hH + o.hH;
      if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        var oX = hWidths - Math.abs(vX);
        var oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
          if (vY > 0) { this.y += oY; } // top
          else { this.y -= oY; } // bottom
        } else {
          if (vX > 0) { this.x += oX; } // left
          else { this.x -= oX; } // right
        }
        return o;
      }
    }
  }
  return null;
};

//------------ Move animation -------------//

function MoveAnimation(parent) {
  this.parent = parent;
  this.speed = 300;
  this.destination = { x: 0, y: 0 };
  this.velocity = { x: 0, y: 0 };
  this.isAnimating = false;
}

MoveAnimation.prototype.update = function(fTime) {
  if (this.isAnimating) {
    var addX, addY;
    addX = fTime * this.velocity.x;
    addY = fTime * this.velocity.y;
    this.parent.x += addX; this.parent.y += addY;
    if (((this.velocity.x > 0) && (this.parent.x >= this.destination.x))
     || ((this.velocity.x < 0) && (this.parent.x <= this.destination.x))
     || ((this.velocity.y > 0) && (this.parent.y >= this.destination.y))
     || ((this.velocity.y < 0) && (this.parent.y <= this.destination.y))) { this.parent.stopMove(); }
  }
  return this.isAnimating;
};

MoveAnimation.prototype.start = function(dX, dY) {
  this.destination.x = dX - this.parent.hW;
  this.destination.y = dY - this.parent.hH;
  var tX = this.destination.x - this.parent.x;
  var tY = this.destination.y - this.parent.y;
  var distance = Math.sqrt(Math.pow(tX, 2) + Math.pow(tY, 2));
  if (!distance) { return; }
  this.velocity.x = (tX / distance) * this.speed;
  this.velocity.y = (tY / distance) * this.speed;
  this.isAnimating = true;
};

MoveAnimation.prototype.stop = function(correctPosition) {
  if (correctPosition === undefined) correctPosition = true;
  this.isAnimating = false;
  if (correctPosition) {
    this.parent.x = this.destination.x;
    this.parent.y = this.destination.y;
  }
};

//------------ Boil animation -------------//

function BoilAnimation(parent) {
  this.parent = parent;
  this.callback = null;
  this.speed = 300;
  this.amplitude = { current: 0, direction: 1, max: 6 };
  this.origX = 0;
  this.isAnimating = false;
  this.stopTimer = new EventTimer(0.8);
}

BoilAnimation.prototype.update = function(fTime) {
  if (this.isAnimating) {
    var add = fTime * this.speed * this.amplitude.direction;
    this.parent.x += add; this.amplitude.current += add;
    if ((Math.abs(this.amplitude.current) >= this.amplitude.max)) {
      this.parent.x = this.origX + (this.amplitude.max / 2 * this.amplitude.direction);
      this.amplitude.direction *= -1;
      this.amplitude.current = 0;
    }
    if (this.stopTimer.tick(fTime)) {
      this.stopTimer.reset();
      this.stop();
    }
  }
  return this.isAnimating;
};

BoilAnimation.prototype.start = function(callback) {
  this.callback = callback;
  this.origX = this.parent.x;
  this.amplitude.current = this.amplitude.max / 2;
  this.isAnimating = true;
};

BoilAnimation.prototype.stop = function() {
  this.isAnimating = false;
  this.callback();
};

//------------ Pull animation -------------//

function PullAnimation(parent) {
  MoveAnimation.call(this, parent);
  this.speed = 200;
  this.callback = null;
  this.stopTimer = new EventTimer(0.3);
}

PullAnimation.prototype = new MoveAnimation();
PullAnimation.prototype.constructor = PullAnimation;

PullAnimation.prototype.update = function(fTime) {
  if (this.isAnimating) {
    var addX, addY;
    addX = fTime * this.velocity.x;
    addY = fTime * this.velocity.y;
    this.parent.x += addX; this.parent.y += addY;
    if (this.stopTimer.tick(fTime)) {
      this.stopTimer.reset();
      this.stop();
    }
  }
  return this.isAnimating;
};

PullAnimation.prototype.start = function(dX, dY, callback) {
  MoveAnimation.prototype.start.call(this, dX, dY);
  this.velocity.x = -this.velocity.x;
  this.velocity.y = -this.velocity.y;
  this.callback = callback;
};

PullAnimation.prototype.stop = function() {
  this.isAnimating = false;
  this.callback();
};

//---------------- Player -----------------//

function Player(parent, x, y) {
  Movable.call(this, parent, x, y);
  this.image = this.parent.game.imageManager.PLAYER_HAPPY;
  this.animations.move.speed = 1000;
  this.animations.pull = new PullAnimation(this);
}

Player.prototype = new Movable();
Player.prototype.constructor = Player;

Player.prototype.startAttack = function(dX, dY, initDone) {
  if (initDone === undefined) initDone = false;
  this.attacking = true;
  this.image = this.parent.game.imageManager.PLAYER_ATTACKING;
  if (initDone) {
    this.startMove(dX, dY);
  } else {
    var that = this;
    this.parent.game.audioManager.playSound('PULL');
    this.animations.pull.start(dX, dY, function() { that.startAttack(dX, dY, true); });
  }
};

Player.prototype.update = function(fTime) {
  Movable.prototype.update.call(this, fTime);
  if (this.parent.o.length === 1) {
    this.image = this.parent.game.imageManager.PLAYER_HAPPY;
  } else if (!this.attacking && !this.moving && this.alive) {
    this.image = this.parent.game.imageManager.PLAYER_NEUTRAL;
  }
};

Player.prototype.collide = function(collisionObject) {
  if (this.attacking) {
    this.parent.game.audioManager.playSound('HIT');
    collisionObject.die();
    this.parent.enemyDown();
  } else {
    this.parent.game.audioManager.playSound('COLLIDE');
  }
  this.stopMove(false);
};

Player.prototype.die = function(remove) {
  if (!this.attacking) {
    if (!remove) { this.parent.game.audioManager.playSound('DIE'); }
    this.image = this.parent.game.imageManager.PLAYER_DEAD;
    Movable.prototype.die.call(this, remove);
  }
};

//----------------- Enemy -----------------//

function Enemy(parent, x, y) {
  Movable.call(this, parent, x, y);
  this.image = this.parent.game.imageManager.ENEMY_NEUTRAL;
  this.color = 'hsla(0, 100%, 50%, 1)';
  this.attackTimer = new EventTimer(getRandomInt(1, 4) / 2);
  this.animations.boil = new BoilAnimation(this);
  this.animations.move.speed = 900;
  this.boiling = false;
}

Enemy.prototype = new Movable();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.startAttack = function(dX, dY, initDone) {
  if (initDone === undefined) initDone = false;
  this.boiling = true;
  this.image = this.parent.game.imageManager.ENEMY_ATTACKING;
  if (initDone) {
    this.boiling = false;
    this.attacking = true;
    this.startMove(dX, dY);
  } else {
    var that = this;
    this.parent.game.audioManager.playSound('BOIL');
    this.animations.boil.start(function() { that.startAttack(dX, dY, true); });
  }
};

Enemy.prototype.stopMove = function(correctPosition, keepImage) {
  if (!keepImage) { this.image = this.parent.game.imageManager.ENEMY_NEUTRAL; }
  Movable.prototype.stopMove.call(this, correctPosition);
};

Enemy.prototype.update = function(fTime) {
  Movable.prototype.update.call(this, fTime);
  if (!this.alive) { return; }
  if (!this.attacking && !this.boiling && !this.moving) {
    if (this.attackTimer.tick(fTime)) {
      this.attackTimer.reset();
      var attack = getRandomInt(0, 1);
      if (attack) {
        var p = this.parent.player;
        this.startAttack(p.x + p.hW, p.y + p.hH);
      } else {
        var x, y, c;
        do {
          x = getRandomInt(0, this.parent.game.W - this.w);
          y = getRandomInt(0, this.parent.game.H - this.h);
          c = this.parent.checkOccupied(x, y);
        } while (c);
        this.startMove(x, y);
      }
    }
  }
};

Enemy.prototype.collide = function(collisionObject) {
  if (this.attacking && collisionObject.constructor === Player) { collisionObject.die(); }
  var keepImage = (this.attacking) ? false : true;
  this.stopMove(false, keepImage);
};

Enemy.prototype.die = function(remove) {
  this.image = this.parent.game.imageManager.ENEMY_DEAD;
  Movable.prototype.die.call(this, remove);
};