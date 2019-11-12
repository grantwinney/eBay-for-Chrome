/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

var NewAlertOpener = {
  _alerts : {},

  init : function() {
    chrome.notifications.onClicked.addListener(this.notificationClicked);
    chrome.notifications.onButtonClicked.addListener(this.notificationClicked);

    ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
    ObserverHelper.addObserver(this, Topics.ALERT_SHOW_PRIMARY);
    ObserverHelper.addObserver(this, Topics.ALERT_DISMISS_PRIMARY);
  },

  _showDesktopNotification : function(aAlert) {
    var account = Account.getAccount();

    //display notifications only if the user is signed in
    if (account) {
      var image = "";
      var options = {};
      var type = aAlert.get("type");
      var itemId = aAlert.get("itemId");
      var title = aAlert.get("title");
      var message = aAlert.get("title");

      //store the notification on memory
      this._alerts[itemId] = aAlert;

      //set the title on the notification. Take the first part of the notification,
      //like from "Watched item ends in 10 minutes: 50  MIX-INDIAN HEAD & WHEAT CENT ROLL -   1857 FE  / IH TAILS ENDS"
      //we would need only the part "Watched item ends in 10 minutes"
      if (title) {
        if (title.indexOf(":") > 0) {
          title = title.substring(0, title.indexOf(":"));
        }
        title = title.toUpperCase();
        options.title = title;
      }

      //set the content of the notification.
      //Take the part after the ":" on the item description.
      if (message) {
        if (message.indexOf(":") > 0) {
          message = message.substring(message.indexOf(":") + 1, message.length);
        }
        message = message.trim();
        options.message = message;
      }

      if (type != "M2MMSGHDR") {
        //set the thumbnail for the notification.
        image = ZoomService.getZoomImageforItem(itemId, 150);
        options.buttons = [];
        options.buttons.push({ title: $.i18n.getString("item.button.view") });
      } else {
        image = chrome.runtime.getURL("/ui/skin/core/img/avatar-default.png");
      }
      options.iconUrl = image;

      options.type = "basic";
      options.priority = 2;

      chrome.notifications.create(itemId, options, NewAlertOpener.creationCallback);

      if (PropertyDAO.get(PropertyDAO.PROP_ALERT_SOUND_ENABLED)) {
        this._generateSoundForGCMAlert(aAlert);
      }
    }
  },

  creationCallback : function (aNotID) {
  },

  notificationClicked : function(aNotID) {
    var alert = NewAlertOpener._alerts[aNotID];

    if (alert.get("type") != "M2MMSGHDR") {
      RoverUrlHelper.loadPage("listing2",
        "recentAlertClick", { "itemid": alert.get("itemId") });
    } else {
      RoverUrlHelper.loadPage("notifications_MSGM2MMSGHDR",
        "recentAlertClick", { "msgid": alert.get("messageId") });
    }
    EventAnalytics.push({
      key: "SignedInExit",
      action: "ClickNotification",
      label: alert.get("type")
    });
  },

  /**
   * Determines if the extension can display a GCM notification (toaster alert)
   * depending on the user preferences.
   * @param aMessage the object received from GCM.
   * @returns true if we can display a GCM notification based on user's choice
   * on the Preferences panel. Returns false otherwise.
   */
  canDisplayAlert : function(aMessage) {
    var eventName = aMessage.data.evt;
    var itemEndTime = aMessage.data.itemEndTime;
    var canDisplayAlert = false;
    var propertyName = null;
    var currentTime;

    switch(eventName) {

      //buying events
      //Notify me before an item ends
      case "WATCHITM":
        propertyName = PropertyDAO.PROP_ALERT_BIDDING_ENDINGSOON_ENABLED;
        break;
      //Notify me when I'm outbid or win an item
      case "OUTBID":
      case "ITMWON":
        propertyName = PropertyDAO.PROP_ALERT_BIDDING_OUTBID_OR_WON_ENABLED;
        break;
      //Notify me with updates to offers I have made
      //TODO: Add "best offer expired" event here.
      case "BODECLND":
      case "CNTROFFR":
        propertyName = PropertyDAO.PROP_ALERT_BIDDING_UPDATE_TO_OFFERS_ENABLED;
        break;
      //Notify me with updates to items I've purchased
      case "ITMSHPD":
      case "COCMPLT":
      case "PAYREM":
        propertyName = PropertyDAO.PROP_ALERT_BIDDING_UPDATE_TO_PURCHASES_ENABLED;
        break;

      //selling events
      //Notify me before I receive a bid
      case "BIDRCVD":
        propertyName = PropertyDAO.PROP_ALERT_SELLING_BIDPLACED_ENABLED;
        break;
      //Notify me when I receive an offer or counteroffer
      case "BESTOFR":
        //When a seller receives a counteroffer, the event we get from GCM is a BESTOFR
        propertyName = PropertyDAO.PROP_ALERT_SELLING_BESTOFFER_NEWOFFER_ENABLED;
        break;
      //Notify me when an item is sold or payment is received
      case "ITMSOLD":
      case "ITMPAID":
        propertyName = PropertyDAO.PROP_ALERT_SELLING_SOLD_OR_PAYMENT_RECEIVED_ENABLED;
        break;

      //general events
      //Notify me when I receive a message from an eBay member
      case "M2MMSGHDR":
        propertyName = PropertyDAO.PROP_ALERT_MESSAGE_RECEIVED_ENABLED;
        break;
    }

    if (propertyName && propertyName != null) {
      canDisplayAlert = PropertyDAO.get(propertyName);
    }

    //let's check if the alert is still useful
    if (canDisplayAlert && itemEndTime) {
      currentTime = Date.now();
      itemEndTime = Date.parse(itemEndTime);

      if (itemEndTime && !isNaN(itemEndTime) && itemEndTime > currentTime) {
        canDisplayAlert = true;
      } else {
        canDisplayAlert = false;
      }
    }

    return canDisplayAlert;
  },

  /**
   * Plays a notification sound depending on the notification type.
   * @param aAlert the alert object
   * displayed on the notification.
   */
  _generateSoundForGCMAlert : function(aAlert) {
    var sound = aAlert.get("sound");
    var elementName = "alert_sound_generic_gcm";
    var audioTag;

    if (sound) {
      //XXX: only the sounds for item sold and saved search are different than
      //all the other sounds.
      switch(sound) {
        case "itmsold.caf":
          elementName = "alert_sound_itmsold_gcm";
          break;
        case "svdsrch.caf":
          elementName = "alert_sound_svdsrch_gcm";
          break;
        default:
          elementName = "alert_sound_generic_gcm";
          break
      }
    }

    audioTag = document.getElementById(elementName);
    audioTag.play();
  },

  /**
   * Observes for changes.
   * @param aTopic the topic name.
   * @param aData the data sent.
   */
  observe : function(aTopic, aData) {
    switch (aTopic) {
      case Topics.ACCOUNT_SIGNED_OUT:
        this._alerts = {};
        break;
      case Topics.ALERT_SHOW_PRIMARY:
        this._showDesktopNotification(aData);
        break;
      case Topics.ALERT_DISMISS_PRIMARY:
        this._closeNotification(aData);
        break;
    }
  }
};

$(document).ready(function() { NewAlertOpener.init(); });
