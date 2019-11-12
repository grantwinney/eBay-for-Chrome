/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

/**
 * Timer Helper Object.
 */
function Timer(aCallback, aDelay, aIsInterval) {
  this._callback = aCallback;
  this._delay = aDelay;
  this._isInterval = aIsInterval;
  this._timerId = null;

  this._init();
}

Timer.prototype = {

  /**
   * Initializes the object.
   */
  _init : function() {
    
    var that = this;

    if (this._isInterval) {
      this._timerId =
        setInterval(function() {
          that._callback();
        }, this._delay);
    } else {
      this._timerId = setTimeout(function() { that._callback(); }, this._delay);
    }
  },

  /**
   * The interval of this timer.
   */
  get interval() {
    return this._delay;
  },

  /**
   * Clear the timer.
   */
  cancel : function() {
    
    if (this._isInterval) {
      clearInterval(this._timerId);
    } else {
      clearTimeout(this._timerId);
    }
  }
};
