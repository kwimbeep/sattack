/*********************************
 SquareAttack - managers/audio.js
 Copyright: Marcis Berzins (berzins.marcis@gmail.com), 2016
 Inspiration: http://stackoverflow.com/q/5313646
              http://stackoverflow.com/a/14022366
 This program is licensed under the terms of the GNU General Public License: http://www.gnu.org/licenses/gpl-3.0.txt
 *********************************/

function AudioManager() {
  this.SOUNDS = {
    MENU_CLICK: 'data/audio/menu_click.ogg',
    MOVE: 'data/audio/move.ogg',
    BOIL: 'data/audio/boil.ogg',
    PULL: 'data/audio/pull.ogg',
    COLLIDE: 'data/audio/collide.ogg',
    HIT: 'data/audio/hit.ogg',
    DIE: 'data/audio/die.ogg'
  };
  this.loadState = { count: Object.keys(this.SOUNDS).length, loaded: 0, ready: false };
  this.playing = {};
  this.init();
}

AudioManager.prototype.init = function() {
  if (!this.testAudio()) { this.loadState.ready = true; return; }
  
  for (var p in this.SOUNDS) {
    var a = new Audio(this.SOUNDS[p]);
    var that = this;
    a.addEventListener('canplaythrough', function loaded() {
      this.removeEventListener('canplaythrough', loaded);
      that.loadState.loaded++;
      if (that.loadState.loaded >= that.loadState.count) { that.loadState.ready = true; }
    }, false);
    this[p] = a;
  }
};

AudioManager.prototype.testAudio = function() {
  var test = document.createElement('audio');
  var canPlayOgg = (typeof test.canPlayType === 'function' && test.canPlayType('audio/ogg') !== '');
  return canPlayOgg;
}

AudioManager.prototype.playSound = function(s) {
  if (window.chrome) {
    this[s].currentTime = 0;
    this[s].play();
  } else {
    var a = this.SOUNDS[s] + Math.random() + '';
    this.playing[a] = this[s].cloneNode(true);
    var that = this;
    this.playing[a].addEventListener('ended', function() { delete that.playing[a]; }, false);
    this.playing[a].play();
  }
};