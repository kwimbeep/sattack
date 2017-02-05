/*********************************
 SquareAttack - managers/image.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2013
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

function ImageManager() {
  this.IMAGES = {
    PLAYER_HAPPY: 'data/images/player_happy.png',
    PLAYER_NEUTRAL: 'data/images/player_neutral.png',
    PLAYER_ATTACKING: 'data/images/player_attacking.png',
    PLAYER_DEAD: 'data/images/player_dead.png',
    ENEMY_NEUTRAL: 'data/images/enemy_neutral.png',
    ENEMY_ATTACKING: 'data/images/enemy_attacking.png',
    ENEMY_DEAD: 'data/images/enemy_dead.png'
  };
  this.loadState = { count: Object.keys(this.IMAGES).length, loaded: 0, ready: false };
  this.init();
}

ImageManager.prototype.init = function() {
  for (var p in this.IMAGES) {
    var i = new Image();
    var that = this;
    i.addEventListener('load', function() {
      that.loadState.loaded++;
      if (that.loadState.loaded >= that.loadState.count) { that.loadState.ready = true; }
    }, false);
    i.src = this.IMAGES[p];
    this[p] = i;
  }
};