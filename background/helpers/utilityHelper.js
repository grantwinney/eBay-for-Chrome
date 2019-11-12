/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

/**
 * Utility Helper.
 */
var UtilityHelper = {
  _RE_EBAY_PAGE : /^https?:\/\/(\.?\w{2,8})*\.ebay(\.\w{2,3}){1,2}/i,
  _RE_DURATION : /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/i,
  _OPTIONS_WINDOW_URL : "ui/view/options.html",
  _browser : null,
  _os : null,
  _osVersion : null,
  _lastUsedTabs : {},

  /**
   * Gets the last used tab for a given window.
   * @return the last used tab.
   */
  getLastUsedTab : function(aWindowId) {
    return this._lastUsedTabs[aWindowId];
  },

  /**
   * Set the last used tab for a given window.
   */
  setLastUsedTab : function(aWindowId, aTabId) {
    this._lastUsedTabs[aWindowId] = aTabId;
  },

  /**
   * Converts a timestamp (in milliseconds) to a date string with the given
   * format.
   * @param aTimestamp a timestamp, in milliseconds.
   * @param aDateFormat a string that determines how the date will be formatted.
   * @param aIsTwelveHourTime a boolean that indicate the time should be in AM or PM format.
   * This is a RegExp replacement string with backreferences.
   * @return the date string in the given format.
   */
  formatDate : function(aTimestamp, aDateFormat, aIsTwelveHourTime) {
    
    var dateObject = new Date(Number(aTimestamp));
    var month = dateObject.getMonth() + 1;
    var dateString = "";

    dateString =
      aDateFormat.replace("DD", this.formatTwoDigits(dateObject.getDate()));
    dateString = dateString.replace("D", dateObject.getDate());

    if (0 <= dateString.indexOf("MMM")) {
      var monthString =
        $.i18n.getString("common.datetime.month." + month);

      dateString = dateString.replace("MMM", monthString);
    }

    dateString = dateString.replace("MM", this.formatTwoDigits(month));

    if (0 <= dateString.indexOf("YYYY")) {
      dateString = dateString.replace("YYYY", String(dateObject.getFullYear()));
    } else {
      dateString =
        dateString.replace("YY", String(dateObject.getFullYear()).substring(2));
    }

    if (aIsTwelveHourTime) {
      var hours = this.formatTwoDigits(dateObject.getHours());
      if (hours == 0) {
        dateString = dateString.replace("hh", 12);
        dateString += " " + $.i18n.getString("common.datetime.am");
      } else if (hours < 12) {
        dateString = dateString.replace("hh", hours);
        dateString += " " + $.i18n.getString("common.datetime.am");
      } else if (hours == 12) {
        dateString = dateString.replace("hh", hours);
        dateString += " " + $.i18n.getString("common.datetime.pm");
      } else {
        dateString = dateString.replace("hh", hours - 12);
        dateString += " " + $.i18n.getString("common.datetime.pm");
      }
    } else {
      dateString =
        dateString.replace("hh", this.formatTwoDigits(dateObject.getHours()));
    }
    dateString =
      dateString.replace(
        "mm", this.formatTwoDigits(dateObject.getMinutes()));
    dateString =
      dateString.replace(
        "ss", this.formatTwoDigits(dateObject.getSeconds()));

    return dateString;
  },

  /**
   * Represents a non-negative number as a string of 2 digits. This is usually
   * needed to show hours, minutes and seconds on time displays.
   * @param aNumber the number to format to two digits. 0 <= aNumber < 100.
   * @return the formatted number. It's a string of 2 digits.
   */
  formatTwoDigits : function(aNumber) {
    
    var formattedNumber = "";

    if (aNumber >= 0 && aNumber < 100) {
      if (aNumber < 10) {
        formattedNumber += "0";
      }

      formattedNumber += aNumber;
    }

    return formattedNumber;
  },

  /**
   * Formats the number to add the thousand separators.
   * @param aValue the numerical value to be formatted.
   * @param aDecimals the fixed decimals value.
   * @return the formatted number.
   */
  formatNumber : function(aValue, aDecimals) {
    
    var decimalSeparator =
      $.i18n.getString("common.num.format.decimal").
        replace(/"/g, "");
    var thousandSeparator =
      $.i18n.getString("common.num.format.thousandSep").
        replace(/"/g, "");
    var value = aValue.toFixed(aDecimals);
    var valueString = String(value);
    var valueInteger = parseInt(value);
    var valueIntegerString = String(valueInteger);
    var valueIntegerStringSize = valueIntegerString.length;
    var valueDecimalIndex = valueString.indexOf(".") + 1;
    var valueDecimalString = "";
    var valueLabel = "";

    if (-1 != valueDecimalIndex) {
      valueDecimalString =
        valueString.substring(valueDecimalIndex, valueString.length);
    }
    for (var i = valueIntegerStringSize - 1; i >= 0; i--) {
      valueLabel = valueIntegerString[i] + valueLabel;
      if ((0 == (valueIntegerStringSize - i) % 3) && i > 0) {
        valueLabel = thousandSeparator + valueLabel;
      }
    }
    if (0 < aDecimals) {
      valueLabel += decimalSeparator + valueDecimalString;
    }

    return valueLabel;
  },

  /**
   * Gets exchange rate
   */
  getExchangeRate: function(aFrom, aTo) {
    return aFrom/aTo;
  },

  /**
   * Given an ISO-8601 formatted time stamp, return a Date object
   * @param aTime.
   * @returns Date object.
   */
  dateFromIso8601 : function(aTime) {
    
    // TODO: ensure compatibility with other browsers and older versions of them
    var date = new Date(aTime);
    return date;
  },

  /**
   * Convert an ISO-8601 duration to milli-seconds
   * @param aDuration.
   * @returns milli seocnds.
   */
  iso8601DurationToMilliseconds : function(aDuration) {
    
    var milliseconds = 0;
    if (aDuration) {
      var matches = aDuration.toString().match(this._RE_DURATION);
      if (matches) {
        var days = matches[9]? parseInt(matches[9]) : 0;
        var hours = matches[12]? parseInt(matches[12]) : 0;
        var minutes = matches[14]? parseInt(matches[14]) : 0;
        var seconds = matches[16]? parseInt(matches[16]) : 0;

        milliseconds = days * 86400000 + hours * 3600000 + minutes * 60000 + seconds * 1000;
      }
    }
    return milliseconds;
  },

  /**
   * Returns the time left for an item as a string
   * @param aTimeLeft the time left to be converted
   */
  timeLeftAsString : function (aTimeLeft) {
    
    var acc = aTimeLeft / (1000 * 60 * 60 * 24);
    var days = Math.floor(acc);
    var leftover = acc - days;

    acc = leftover * 24;
    var hours = Math.floor(acc);
    leftover = acc - hours;

    acc = leftover * 60;
    var minutes = Math.floor(acc);
    leftover = acc - minutes;

    acc = leftover * 60;
    var seconds = Math.floor(acc);

    return this._formatTimeLeft(days, hours, minutes, seconds);
  },

  _formatTimeLeft : function(aDays, aHours, aMins, aSecs) {
    var vals = [aDays, aHours, aMins, aSecs];
    var units = ["day", "hour", "min", "sec"];

    // Determine which is the most significant non-zero unit
    var skip = 0;
    while (vals[skip] == 0) {
      skip++;
    }

    // Make sure we use at least one unit!
    skip = Math.min(vals.length-1, skip);

    // The following value determines how many units to display at a time
    var numValsToUse = 2;

    var params = [];
    var end = Math.min(skip + numValsToUse, vals.length);
    for (var i = skip; i < end; i++) {
      var propName = "item.timeleft." + units[i] + ".abbv";
      var text = $.i18n.getString(propName, [vals[i]]);
      params.push(text);
    }

    var separator = $.i18n.getString("item.timeleft.separator").replace(/"/g, "");

    var timeLeftString = params.join(separator);

    return timeLeftString;
  },

  /**
   * Replaces the provided label with a series of label elements, of which those
   * that are intended to be clickable are assigned a callback.  The source
   * label should have a value containing text in the form "plain text [1 link]
   * plain text...".  The number at the start of the link construct is used as
   * an index into the provided "callbacks" array (1 -> 0th element etc...).
   * The retrieved element is assigned as on onclick handler.  This makes it
   * possible to reorder the text during localisation without changing the order
   * of elements in the "callbacks" array.  The link labels are assigned the
   * class "link" for styling.
   */
  explodeLabelWithLinks : function(aLabel, aCallbacks) {
    var text = aLabel.text();

    while (text.length > 0) {
      var element = $(aLabel).clone(false);

      if (text.charAt(0) == "[") {
        // link
        element = $("<a></a>");
        var endIndex = text.indexOf("]");
        var left = text.slice(0, endIndex + 1);
        var linkRe = /\[(\d+) (.*?)\]/g;
        linkRe.lastIndex = 0;
        var results = linkRe.exec(left);
        var index = results[1];

        element.text(results[2]);
        element.attr("class", "text-link");

        var callback = aCallbacks[index - 1];
        if (callback) {
          element.click(callback);
        }

        text = text.slice(endIndex + 1);
      } else {
        // text
        var endIndex = text.indexOf("[");
        if (endIndex == -1) {
          endIndex = text.length;
        }

        element.text(text.slice(0, endIndex));
        text = text.slice(endIndex);
      }

      $(aLabel).parent().append(element);
    }
    $(aLabel).remove();
  },

  /**
   * Opens a link where it's specified.
   * @param aURL the link to be open.
   * @param aWhere where to be open.
   */
  openLinkIn : function(aURL, aWhere) {
    
    //if there are no open windows, open one.
    chrome.windows.getAll(null, function(aWindows) {
      if (aWindows.length == 0) {
        UtilityHelper._openLinkIn(aURL, "window");
      } else {
        UtilityHelper._openLinkIn(aURL, aWhere);
      }
    });
  },

  _openLinkIn : function(aURL, aWhere) {
    
    var that = this;
    var createNewTab = function(aWindow) {
      chrome.tabs.create({ url : aURL }, function(tab) {
        that.setLastUsedTab(tab.windowId, tab.id);
        chrome.windows.update(tab.windowId, { focused:true }, function() {});
      });
    };

    switch (aWhere) {
      case "current":
        chrome.windows.getLastFocused(function(aWindow) {
          var lastUsedTabId = that.getLastUsedTab(aWindow.id);
          var shouldOpenNewTab = false;

          if (lastUsedTabId) {
            chrome.windows.update(aWindow.id, { focused:true }, function() {
              chrome.tabs.get(lastUsedTabId, function(tab) {
                if (tab && tab.url.match(that._RE_EBAY_PAGE)) {
                  chrome.tabs.update(tab.id, { url : aURL, active: true });
                } else {
                  createNewTab();
                }
              });
            });
          } else {
            shouldOpenNewTab = true
          }
          if (shouldOpenNewTab) {
            createNewTab(aWindow);
          }
        });
        break;
      case "tab":
        chrome.windows.getCurrent(function(aWindow) {
          createNewTab(aWindow);
        });
        break;
      case "window":
        chrome.windows.create({ url : aURL, focused: true }, function(window) {
          chrome.windows.update(window.id, {focused:true}, function(){});
        });
        break;
    }
  },

  /**
   * Finds where to open a link according to the event object.
   * @param aEvent the event object.
   */
  findWhereToOpenLink : function(aEvent) {
    
    var where = "current";

    if (aEvent) {
      if (1 == aEvent.button || (aEvent.metaKey && 0 == aEvent.button)) {
        where = "tab";
      } else if (aEvent.shiftKey && 0 == aEvent.button) {
        where = "window";
      }
    }

    return where;
  },

  /**
   * Gets client.
   * @return the client object.
   */
  getClient : function() {
    if (!this._browser) {
      var ua = navigator.userAgent;
      var platform = navigator.platform;

      if (ua.indexOf("Chrome") != -1) {
        this._browser = "Chrome";
      } else if (ua.indexOf("Firefox") != -1) {
        this._browser = "Firefox";
      } else if (ua.indexOf("Safari") != -1) {
        this._browser = "Safari";
      } else {
        this._browser = "Unknown";
      }

      if (platform.indexOf("Win") != -1) {
        this._os = "Window";
      } else if (platform.indexOf("Mac") != -1) {
        this._os = "Mac";
      } else if (platform.indexOf("Linux") != -1) {
        this._os = "Linux";
      } else {
        this._os = "Unknown";
      }

      if (this._os == "Mac") {
        var version = /Mac OS X (10[\.\_\d]+)/.exec(ua)[1];
        this._osVersion = version.replace(/\_/g, ".");
      } else {
        if (/Windows NT 6\.0/ig.test(ua)) {
          this._osVersion = "Vista";
        } else if (/Windows NT 6\.1/ig.test(ua)) {
          this._osVersion = "W7";
        } else if (/Windows NT 6\.2/ig.test(ua)) {
          this._osVersion = "W8";
        } else {
          this._osVersion = "Unknown";
        }
      }
    }
    return  {
      browser: this._browser,
      os: this._os,
      osVersion: this._osVersion
    }
  },

  /**
   * Checks if there is an active Internet connection and returns true if there
   * is an active Internet connection, and returns false otherwise.
   */
  internetConnectionExists : function() {
    return navigator.onLine;
  },

  /**
   * Gets an HTML escaped string.
   * @param aString the string to escape
   * @return the escaped string
   */
  escapeHtml : function(aString) {
    //XXX: No logging for efficiency reasons
    var findReplace = [
      [/&/g, "&amp;"], [/</g, "&lt;"], [/>/g, "&gt;"], [/"/g, "&quot;"],
      [/'/g, "&apos;"]];

    if (aString != null && aString.length > 0) {
      $.each(findReplace, function(){
        aString = aString.replace(this[0], this[1]);
      });
    } else {
      aString = "";
    }

    return aString;
  },

  /***
   * Checks if the user token has expired.
   * This method is specific for XML responses that contain an <errorId> node
   * with a value of "11002".
   * @param aXHR the response from the api call.
   */
  checkTokenExpired : function(aXHR) {
    var xml = aXHR.responseText;
    var xmlDoc = $.parseXML(xml);
    var $xml = $(xmlDoc);
    var $errorId = $xml.find("errorId");

    //error code 11002 indicates an invalid token.
    if ($errorId && $errorId.text() == "11002") {
      ObserverHelper.notify(Topics.USER_TOKEN_EXPIRED, null);
    }
  },

  /**
   * Gets the language in which is currently displayed the browser.
   * @returns a string with the code for the browser language.
   */
  getBrowserLanguage : function() {
    return navigator.language;
  },

  /**
   * Converts a currency symbol to another currency symbol
   * @param aCurreny the original currency symbol.
   * @returns the new currency symbol.
   */
  convertCurrency : function(aCurrency) {
    var newCurrency = aCurrency;
    switch (aCurrency) {
      case "BRL":
        newCurrency = "R$";
        break;
    }

    return newCurrency;
  },

  /**
   * Handles the error after a failed API call.
   * @param aApiName the name of the calling api.
   * @param aRequestName the name of the api method that was called.
   * @param aMessage the error message or the exception message.
   * @param aCallback the callback function to be called after the error.
   */
  handleError : function(aApiName, aRequestName, aMessage, aCallback) {
    var apiName = aApiName ? aApiName : "Unkown API";
    var requestName = aRequestName ? aRequestName : "Unknown request name";
    var message = aMessage ? aMessage : "";

    Logger.error(
      apiName + " Error: Unable to contact the server. Call: " + requestName + ". Error: " + message);

    MessagePanelService.addMessage(MessagePanelService.TYPE.CONNECT_ERROR);
    // there were errors, so we notify the observer to stop the refresh
    // throbber
    ObserverHelper.notify(Topics.API_REQUEST_TIMEOUT, null);

    if (aCallback) {
      aCallback(null);
    }
  },

  /**
   * Gets the default empty image URL.
   * @param aImageName if present, this parameter contains the image name to be used as the default empty image. If not present,
   * use the default image name.
   */
  getEmptyImage : function(aImageName) {
    var imageURL = "";
    if (aImageName) {
      imageURL = "/ui/skin/core/img/" + aImageName;
    } else {
      imageURL = "/ui/skin/core/img/empty-image.png";
    }

    return chrome.runtime.getURL(imageURL);
  },

  /**
   * Sends an "UpgradeApp" Acquisition event request to the Google Analytics API after users upgrade the extension.
   */
  sendUpgradeTrackingRequest : function() {
    var currentVersion = null;
    var previousVersion = null;
    var action = null;
    var label = null;

    new Timer(function () {
      currentVersion = BrowserHelper.getExtensionVersion();
      previousVersion = PropertyDAO.get(PropertyDAO.PROP_INSTALLED_VERSION);
      action = Account.getAccount() ? "SignedIn" : "SignedOut";
      label = currentVersion + "-" + Configs.BROWSER;

      if (previousVersion && previousVersion != currentVersion) {
        // send the upgrade event to Google Analytics
        EventAnalytics.push({
          key: "UpgradeApp",
          action: action,
          label: label
        });
      }

      PropertyDAO.set(PropertyDAO.PROP_INSTALLED_VERSION, currentVersion);
    }, 1000);
  },

  getURLParameters : function (aUrl, aParamName) {
    if (aUrl.indexOf("?") > 0) {
      var arrParams = aUrl.split("?");
      var arrURLParams = arrParams[1].split("&");
      var arrParamNames = new Array(arrURLParams.length);
      var arrParamValues = new Array(arrURLParams.length);
      var i = 0;
      for (i=0;i<arrURLParams.length;i++) {
        var sParam =  arrURLParams[i].split("=");
        arrParamNames[i] = sParam[0];
        if (sParam[1] != "") {
          arrParamValues[i] = unescape(sParam[1]);
        } else {
          arrParamValues[i] = null;
        }
      }

      for (i=0;i<arrURLParams.length;i++) {
        if (arrParamNames[i] == aParamName){
          return arrParamValues[i];
        }
      }
    }
    return null;
  },

  /**
   * Opens the options page.
   * @param aPaneToShow the pane to show from the options page.
   */
  openOptionsPage : function(aPaneToShow) {

    // Set the pane to open
    if (aPaneToShow) {
      PropertyDAO.set(PropertyDAO.PROP_SELECTED_OPTION_PANE, aPaneToShow);
    }

    this.openLinkIn(
      chrome.runtime.getURL(this._OPTIONS_WINDOW_URL), "tab");
  }
};
