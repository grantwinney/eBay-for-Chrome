/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

/**
 * Background class.
 */
var Background = {

  /* eBay accept url regex. */
  _RE_OAUTH_ACCEPT_EBAY_LOVE_URL :
    /^(http)s?:\/\/www\.ebay(\.\w{2,3}){1,2}\/\?access_token=(.*)/i,
  _RE_OAUTH_ACCEPT_NEW_EBAY_LOVE_URL :
    /^(http)s?:\/\/www\.ebay(\.\w{2,3}){1,2}\/(.*)\#access_token=(.*)/i,

  /* Item listed url(sale/watch) */
  _RE_ITEM_LISTED :
    /^http:\/\/cgi\d{0,2}(\.sandbox)?(\.\w{2,4})?\.ebay(\.\w{2,3}){1,2}\/ws\/eBayISAPI\.dll/i,
   /* BIN item purchases */
  _RE_ITEM_PURCHASED :
    /^http:\/\/offer(\.sandbox)?\.ebay(\.\w{2,3}){1,2}\/ws\/eBayISAPI\.dll/i,
  _RE_SEARCH_URL :
    /^http:\/\/www\.ebay(\.\w{2,3}){1,2}\/sch\/i.html\?(.*)(_nkw|_odkw)=(.*)/i,

  _authTabIds : null,
  _signInOngoing: false,

  _forceRefresh : function(aForce) {
    UpdateController.forceRefresh(aForce);
  },

  /**
   * Initiliazes the object.
   */
  _init : function() {

    // set the locale and apply them to the relevant nodes.
    $("[rel^=i18n]").i18n();

    this._addTabUpdatedListener();
    this._addWebRequestListener();
    this._storeExtensionVersion();

    chrome.extension.onRequest.addListener(
      function(aRequest, aSender, aSendResponse) {
        if (aRequest.forceUpdate) {
          Background._forceRefresh();
        }
        aSendResponse({updateCalled : "true"});
      }
    );

    RoverUrlHelper.sendTrackingRequest("install");

    // add GCM listener
    // Set up a listener for GCM message event.
    chrome.gcm.onMessage.addListener(Background.messageReceived);

    Background._openFirstRunPage2();
    AuthenticationService.autoSignInUser();
  },

  _openFirstRunPage2 : function() {
    if (PropertyDAO.get(PropertyDAO.PROP_FIRST_RUN_PAGE_SHOWED)) {
      return;
    }

    var localCallback = function(aUrl) {
      Site.openRawURL(aUrl, null, true);
      EventAnalytics.push({
        key: "Acquisition",
        action: "Install"
      });
      PropertyDAO.set(PropertyDAO.PROP_FIRST_RUN_PAGE_SHOWED, true);
    };

    Site.getRedirectUrl(localCallback, true);
  },

  /**
   * Adds tab update listener.
   */
  _addTabUpdatedListener : function() {
    var that = this;

    chrome.tabs.onUpdated.addListener(function(aTabId, aChangeInfo, aTab) {
      var msgEvent = {};
      msgEvent.tabId = aTabId;
      msgEvent.tab = aTab;

      if (aTab.url && aTab.url.match(that._RE_OAUTH_ACCEPT_NEW_EBAY_LOVE_URL)) {
        Background.startSignIn("new", msgEvent);
      } else {
        if (aTab.url && aTab.url.match(that._RE_OAUTH_ACCEPT_EBAY_LOVE_URL)) {
          Background.startSignIn("old", msgEvent);
        } else {
          if (aTab.status == "complete" && aTab.url) {
            if(aTab.url.match(that._RE_SEARCH_URL)) {
              //update the recent searches after an user has searched for something
              //on the eBay website.
              var account = Account.getAccount();
              if (account) {
                var userId = account.get("userId");
                var homeSite = Site.getHomeSite();
                RecentSearchMedsService.getRecentSearches(userId, homeSite);
              }
            }
          }
        }
      }
    });
  },

  /**
   * Adds web request listener.
   */
  _addWebRequestListener : function() {

    var that = this;

    chrome.webRequest.onCompleted.addListener(function(aDetails) {
      var url = aDetails.url;

      if (url.match(that._RE_ITEM_LISTED)) {
        if ((url.indexOf("fromMakeTrack=true") > -1 ||
             url.indexOf("ViewItemMakeTrack") > -1 ||
             url.indexOf("SearchMakeTrack") > -1) &&
            Account.getAccount()) {
          // trigger a hard update
          Background._forceRefresh();
        }
      } else if (url.match(that._RE_ITEM_PURCHASED)) {
        if (url.indexOf("MakeQuickBid") != -1 &&
            url.indexOf("mode=1") != -1 &&
            Account.getAccount()) {
          // trigger a hard update
          Background._forceRefresh();
        }
      }
    },
    { urls: [
        "*://*.ebay.com/*",
        "*://*.ebay.co.uk/*",
        "*://*.ebay.com.au/*",
        "*://*.ebay.at/*",
        "*://*.ebay.be/*",
        "*://*.ebay.ca/*",
        "*://*.ebay.com.hk/*",
        "*://*.ebay.fr/*",
        "*://*.ebay.de/*",
        "*://*.ebay.in/*",
        "*://*.ebay.ie/*",
        "*://*.ebay.it/*",
        "*://*.ebay.com.my/*",
        "*://*.ebay.nl/*",
        "*://*.ebay.ph/*",
        "*://*.ebay.pl/*",
        "*://*.ebay.com.sg/*",
        "*://*.ebay.es/*",
        "*://*.ebay.ch/*"
    ]});
  },

  /**
   * Processes a message received from GCM
   */
  messageReceived : function(aMessage) {
    var messageString = "New Message: " +JSON.stringify(aMessage);

    ObserverHelper.notify(Topics.DEBUG_MESSAGE, messageString);
    var eventName = aMessage.data.evt;
    var itemId = aMessage.data.itm;
    var title = aMessage.data.title;
    var sound = aMessage.data.sound;
    var user = aMessage.data.usr;
    var badge = aMessage.data.badge;
    var messageId = aMessage.data.msg;
    var alert = new Alert();
    var forceRefresh = true;
    var account = Account.getAccount();

    //before doing anything, let's check if there's a signed in user and the signed in user corresponds to the user that
    //receives the notification.
    if (user && account && account.get("userId") &&
      user == account.get("userId")) {
      //XXX: let's not force an update because we received a private message.
      if (eventName == "M2MMSGHDR") {
        forceRefresh = false;
      } else {
        if (eventName == "INTERNAL_BADGE" && badge && badge == "0") {
          forceRefresh = false;
        }
      }

      if (forceRefresh) {
        if (PropertyDAO.get(PropertyDAO.PROP_DISPLAY_LOGS)) {
          console.log("forcing update");
        }
        UpdateController.forceRefresh(true);
      }

      if (PropertyDAO.get(PropertyDAO.PROP_DISPLAY_LOGS)) {
        console.log("+++++ GCM MESSAGE RECEIVED +++++");
        console.log(aMessage);
        console.log("----- END -----");
      }

      //display a toast alert
      if (eventName != "INTERNAL_BADGE" && NewAlertOpener.canDisplayAlert(aMessage)) {
        if (!itemId) {
          itemId = "0";
        }

        alert.set("type", eventName);
        alert.set("itemId", itemId);
        alert.set("title", title);
        alert.set("sound", sound);
        if (eventName == "M2MMSGHDR") {
          alert.set("messageId", messageId);
        }

        ObserverHelper.notify(Topics.ALERT_SHOW_PRIMARY, alert);
      }
    }
  },

  _storeExtensionVersion: function() {
    var details = chrome.runtime.getManifest();
    PropertyDAO.set(PropertyDAO.PROP_EXTENSION_VERSION, details.version);
  },

  /**
   * Starts the sign in process after detecting an access_token in the URL.
   * @param aSignInType the eBay love sign in type: old: using the old eBay Love endpoint,
   * new: using the new eBay LoVe endpoint.
   * @param aTabId the id of the tab where the access_token was detected in the URL.
   * @param aTab the tab object where the access_token was detected in the URL.
   */
  startSignIn : function(aSignInType, aMsgEvent) {
    var initialSignInTimestamp;
    var userToken = null;
    var userTokenArray;
    var urlParametersArray;
    var tab = aMsgEvent.tab;
    var tabId = aMsgEvent.tabId;
    var token = aMsgEvent.token;

    // We don't want to perform the sign in process more than once
    if (Background._signInOngoing) {
      return;
    }
    Background._signInOngoing = true;
    initialSignInTimestamp = $.now();


    switch(aSignInType) {
      case "old":
        userToken = UtilityHelper.getURLParameters(tab.url, "access_token");
        userToken = decodeURIComponent(userToken);
        break;
      case "new":
        urlParametersArray = tab.url.split("#");
        $.each(urlParametersArray, function(aIndex, aValue) {
          if(-1 < aValue.indexOf("access_token")) {
            userTokenArray = aValue.split("=");
            userToken = userTokenArray[1];
            userToken = decodeURIComponent(userToken);
          }
        });
        break;
      case "contentScript":
        userToken = decodeURIComponent(token);
        break;
    }

    if (null != userToken) {
      AccountService.setUserToken(userToken,
        function() { Background.postSignIn(tabId, initialSignInTimestamp); });
    }
  },

  /**
   * Opens the eBay page after the user has signed in to the extension.
   * @param aTabId the id of the tab where the url is to be updated.
   * @param aInitialTimestamp the timestamp when the whole sign in process began.
   */
  postSignIn : function(aTabId, aInitialSignInTimestamp) {
    var finalSignInTimestamp = $.now();
    var elapsedSignInTime = (finalSignInTimestamp - aInitialSignInTimestamp) / 1000;
    if (PropertyDAO.get(PropertyDAO.PROP_DISPLAY_LOGS)) {
      console.log("***** Sign in elapsed time (in seconds): " + elapsedSignInTime);
    }

    var localCallback = function(aUrl) {
      chrome.tabs.update(aTabId, { url: aUrl });
    };
    Background._signInOngoing = false;

    Site.getRedirectUrl(localCallback, false);
  }
};

/**
 * Constructor.
 */
(function() { this._init(); }).apply(Background);

window.addEventListener("offline", function(e) {
  ObserverHelper.notify(Topics.CONNECTION_OFFLINE);
});
window.addEventListener("online", function(e) {
  ObserverHelper.notify(Topics.CONNECTION_ONLINE);
});

/**
 * Listen to message passing from the content scripts.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(null != request.operation) {
    switch(request.operation) {
      case "getToken": {
        var msgEvent = {};
        msgEvent.tabId = sender.tab.id;
        msgEvent.tab = sender.tab;
        msgEvent.token = request.access_token;
        Background.startSignIn("contentScript", msgEvent);
        break;
      }
    }
  }
  return true;
});

