/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

/**
 * BrowserActionHandler class.
 */
var BrowserActionHandler = {

  /* browser action types. */
  _BROWSER_ACTION_TYPE_SIGNED_OUT : 0,
  _BROWSER_ACTION_TYPE_SIGNED_IN : 1,
  _BROWSER_ACTION_TYPE_ALERT : 2,
  _BROWSER_ACTION_TYPE_CONNECTION_ONLINE : 3,
  _BROWSER_ACTION_TYPE_CONNECTION_OFFLINE : 4,

  /**
   * Initializes the object
   */
  _init : function() {
    ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_IN);
    ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
    ObserverHelper.addObserver(this, Topics.CONNECTION_OFFLINE);
    ObserverHelper.addObserver(this, Topics.CONNECTION_ONLINE);

    switch (Configs.BROWSER) {
      case "cr":
        ObserverHelper.addObserver(this, Topics.UPDATE_BROWSER_ACTION_BADGE);
        break;
      case "sf":
        //do not add Topics.UPDATE_BROWSER_ACTION_BADGE observer to Safari,
        //because the icon badge will be overriden with the amount of unread
        //messages and we do not want this happening on Safari.
        break;
    }
    this._updateBrowserActionTooltip();

    //On browser start up or extension load, check if there is an Internet
    //connection regarless of being signed in or signed out.
    this.updateExtensionIcon();
  },

  /**
   * Shows the sign in state.
   * @param aData object.
   */
  _setBrowserActionSignInState : function(aType) {
    
    switch (Configs.BROWSER) {
      case "cr":
        switch(aType) {
          case this._BROWSER_ACTION_TYPE_SIGNED_IN:
            if (UtilityHelper.internetConnectionExists()) {
              this._updateBrowserActionBadge({ newMessages: 0 });
            }
            break;
          case this._BROWSER_ACTION_TYPE_CONNECTION_ONLINE:
            if (Account.getAccount()) {
              this._updateBrowserActionBadge({ newMessages: 0 });
            } else {
              this._updateBrowserActionBadge(
                { extensionState: this._BROWSER_ACTION_TYPE_SIGNED_OUT });
            }
            break;
          case this._BROWSER_ACTION_TYPE_SIGNED_OUT:
            this._updateBrowserActionBadge(
              { extensionState: this._BROWSER_ACTION_TYPE_SIGNED_OUT });
            break;
          case this._BROWSER_ACTION_TYPE_CONNECTION_OFFLINE:
            this._updateBrowserActionBadge(
              { extensionState: this._BROWSER_ACTION_TYPE_CONNECTION_OFFLINE });
            break;
        }
        break;
      case "sf":
        switch(aType) {
          case this._BROWSER_ACTION_TYPE_SIGNED_OUT:
            //clear the number of alerts if the users signs out.
            $.each(safari.extension.toolbarItems, function(index, item) {
              item.badge = "";
            })
            break;
        }
        break;
    }
  },

  /**
   * Updates Browser Action Badge text and background color.
   */
  _updateBrowserActionBadge : function(aInfo) {
    
    var extensionStateChanged = false;
    var newMessagesChanged = false;
    var newMessages = 0;
    var badgeText = "";

    if ("undefined" != typeof(aInfo.newMessages)) {
      newMessagesChanged = true;
      newMessages = parseInt(aInfo.newMessages);
    }

    if ("undefined" != typeof(aInfo.extensionState)) {
      extensionStateChanged = true;
    }

    switch (Configs.BROWSER) {
      case "cr":
        if (newMessagesChanged) {
          //indicate there are new messages
          if (PropertyDAO.get(PropertyDAO.PROP_NOTIFY_NEW_MESSAGES)) {
            if (Account.getAccount()) {
              try {
                if (newMessages > 0) {
                  if (newMessages > PropertyDAO.get(
                      PropertyDAO.PROP_NOTIFICATIONS_LIMIT_ON_UI)) {
                    newMessages = PropertyDAO.get(
                      PropertyDAO.PROP_NOTIFICATIONS_LIMIT_ON_UI.toString()) + "+";
                  }
                  // blue background for badge
                  chrome.browserAction.setBadgeBackgroundColor(
                    { color: "#DD1E31" });
                  chrome.browserAction.setBadgeText(
                    { text: newMessages.toString() });
                } else {
                  chrome.browserAction.setBadgeText({ text: "" });
                }
              } catch (e) {
                // XXX: account service may not be avaliable yet.
              }
            } else {
              chrome.browserAction.setBadgeText({ text: "" });
            }
          }
        } else if (extensionStateChanged) {
          switch(aInfo.extensionState) {
            case this._BROWSER_ACTION_TYPE_CONNECTION_OFFLINE:
            case this._BROWSER_ACTION_TYPE_SIGNED_OUT:
              badgeText = "?";
              chrome.browserAction.setBadgeBackgroundColor(
                { color: "#e5e5e5" });
              break;
            case this._BROWSER_ACTION_TYPE_CONNECTION_ONLINE:
              badgeText = "";
          }
          chrome.browserAction.setBadgeText({ text: badgeText });
        }
        break;
    }
  },

  /**
   * Updates the browser action button's tooltip after checking the
   * current state of the extension.
   */
  _updateBrowserActionTooltip : function() {
    
    var text = $.i18n.getString("button.openPopup");
    switch (Configs.BROWSER) {
      case "cr":
        chrome.browserAction.setTitle({ title: text });
      break;
      case "sf":
        $.each(safari.extension.toolbarItems, function(index, item) {
          item.tooltip = text || "";
        });
      break;
    }
  },

  /**
   * Checks if there is an active Internet connection and updates the
   * extension icon.
   */
  updateExtensionIcon : function() {
    var internetConnectionExists = UtilityHelper.internetConnectionExists();
    if (internetConnectionExists) {
      this._setBrowserActionSignInState(this._BROWSER_ACTION_TYPE_CONNECTION_ONLINE);
    } else {
      this._setBrowserActionSignInState(this._BROWSER_ACTION_TYPE_CONNECTION_OFFLINE);
    }
  },

  /**
  * Observes for changes.
  * @param aTopic the topic name.
  * @param aData the data sent.
  */
  observe : function(aTopic, aData) {
    
    switch (aTopic) {
      case Topics.ACCOUNT_SIGNED_IN:
        this._setBrowserActionSignInState(this._BROWSER_ACTION_TYPE_SIGNED_IN);
        break;
      case Topics.ACCOUNT_SIGNED_OUT:
        this._setBrowserActionSignInState(this._BROWSER_ACTION_TYPE_SIGNED_OUT);
        break;
      case Topics.UPDATE_BROWSER_ACTION_BADGE:
        this._updateBrowserActionBadge(aData);
        break;
      case Topics.CONNECTION_OFFLINE:
        this._setBrowserActionSignInState(this._BROWSER_ACTION_TYPE_CONNECTION_OFFLINE);
        break;
      case Topics.CONNECTION_ONLINE:
        this._setBrowserActionSignInState(this._BROWSER_ACTION_TYPE_CONNECTION_ONLINE);
        setTimeout(function() {
          if (UpdateController) {
            UpdateController.updateInProgress = false;
            UpdateController.forceRefresh();
          }
        }, 1 * 1000);
        break;
    }
  }
};

/**
 * Constructor.
 */
(function() { this._init(); }).apply(BrowserActionHandler);
