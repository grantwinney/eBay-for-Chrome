/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

/**
 * Logger.
 */
var Logger = {
  _LOG_SHOW_IN_CONSOLE : true,
  /* Append all messages (e.g from sidebar, etc) to the backgound
    view console. */
  _LOG_APPEND_TO_BACKGROUND_CONSOLE : true,
  _LOG_LEVEL : 4, // Warn and above. See Logger.LEVELS for different values.
  _LOG_PORT_NAME : "ebay-logger",

  _backgroundView : null,
  _internalPorts : new Array(), // for background.
  _internalPort : null, // for content script.

  LEVELS : {
    TRACE : 0,
    DEBUG : 1,
    INFO : 2,
    WARN : 3,
    ERROR : 4,
    FATAL : 5,
    DESCRIPTIONS : {
      0 : "TRACE",
      1 : "DEBUG",
      2 : "INFO",
      3 : "WARN",
      4 : "ERROR",
      5 : "FATAL"
    }
  },

  /**
   * Logs trace message.
   * @param aMessage the message.
   */
  trace : function(aMessage) {
    this._log(aMessage, this.LEVELS.TRACE);
  },

  /**
   * Logs a debug message.
   * @param aMessage the message.
   */
  debug : function(aMessage) {
    this._log(aMessage, this.LEVELS.DEBUG);
  },

  /**
   * Logs an info message.
   * @param aMessage the message.
   */
  info : function(aMessage) {
    this._log(aMessage, this.LEVELS.INFO);
  },

  /**
   * Logs a warn message.
   * @param aMessage the message.
   */
  warn : function(aMessage) {
    this._log(aMessage, this.LEVELS.WARN);
  },

  /**
   * Logs an error message.
   * @param aMessage the message.
   */
  error : function(aMessage) {
    this._log(aMessage, this.LEVELS.ERROR);
  },

  /**
   * Logs a fatal message.
   * @param aMessage the message.
   */
  fatal : function(aMessage) {
    this._log(aMessage, this.LEVELS.FATAL);
  },

  /**
   * Logs a message.
   * @param aMessage the message.
   * @param aLevel the level.
   */
  _log : function(aMessage, aLevel) {
    if (aLevel >= this._LOG_LEVEL) {
      var date = new Date();
      var message;

      message =
        date.getFullYear() + "-" + this._addZero(date.getMonth() + 1) + "-" +
        this._addZero(date.getDate()) + " " + this._addZero(date.getHours()) +
        ":" + this._addZero(date.getMinutes()) + ":" +
        this._addZero(date.getSeconds());
      message += " [" + this.LEVELS.DESCRIPTIONS[aLevel] + "]  ";
      message += aMessage;

      if (this._LOG_SHOW_IN_CONSOLE) {
        if (this._LOG_APPEND_TO_BACKGROUND_CONSOLE) {
          // this script file should be included before all scripts so it can't
          // determine whether it is in a background view or not at startup
          // so this is done here instead.
          if (typeof(ContentScript) == "object") {
            if (!this._internalPort) {
              this._internalPort =
                chrome.runtime.connect({name: this._LOG_PORT_NAME});
            }
            this._internalPort.postMessage(
              { message: "log", data: { message: message, level: aLevel } });
          } else {
            if (!this._backgroundView) {
              if (typeof(Background) == "object") {
                var that = this;

                chrome.runtime.onConnect.addListener(function(aPort) {
                  that._handleConnected(aPort); });
              }
              this._backgroundView = BrowserHelper.getBackgroundPage();
            }
            // XXX: Logger may not be avaliable yet.
            try {
              this._backgroundView.Logger.logOnConsole(message, aLevel);
            } catch (e) {
              this.logOnConsole(message, aLevel);
            }
          }
        } else {
          this.logOnConsole(message, aLevel);
        }
      }
    }
  },

  /**
   * Logs a message on console.
   * @param aMessage the message.
   * @param aLevel the log level.
   */
  logOnConsole : function(aMessage, aLevel) {
    switch (aLevel) {
      case this.LEVELS.TRACE:
        console.log(aMessage);
      break;
      case this.LEVELS.DEBUG:
        console.debug(aMessage);
      break;
      case this.LEVELS.INFO:
        console.info(aMessage);
      break;
      case this.LEVELS.WARN:
        console.warn(aMessage);
      break;
      case this.LEVELS.ERROR:
      case this.LEVELS.FATAL:
        console.error(aMessage);
      break;
    };
  },

  /**
   * Handles connected.
   * @param aPort the port.
   */
  _handleConnected : function(aPort) {
    // this is called when a content script is loaded into a webpage.
    if (this._LOG_PORT_NAME == aPort.name) {
      var that = this;

      // store the new port.
      this._internalPorts.push(aPort);
      // add event listener to process received message.
      aPort.onMessage.addListener(function(aData) {
        that._processReceivedData(aData); });
      // add event listener to remove a port from the array when a tab/window
      // is closed.
      aPort.onDisconnect.addListener(function(aDisconnectedPort) {
        $.each(that._internalPorts, function(aCurrIndex, aCurrPort) {
          if (aCurrPort == aDisconnectedPort) {
            that._internalPorts.splice(aCurrIndex, 1);
            return false;
          }
        });
      });
    }
  },

  /**
   * Processes when received data.
   * @param aData the data.
   */
  _processReceivedData : function(aData) {
    if (aData.message == "log") {
      this.logOnConsole(aData.data.message, aData.data.level);
    }
  },

  /**
   * Adds zero.
   * @param aNumber the zero to be added to this number.
   * @return the number with "0";
   */
  _addZero : function(aNumber) {
    return ((aNumber < 10) ? "0" : "") + aNumber;
  }
};
