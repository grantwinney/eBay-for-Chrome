/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

/**
 * Content script class.
 */
var ContentScript = {
  _itemId : null,
  _RE_OAUTH_ACCEPT_EBAY_LOVE_URL :
    /^(http)s?:\/\/(www\.)?auth\.ebay(\.\w{2,3}){1,2}\/oauth2\/populatefragmentinfo/i,

  init : function() {
    var that = this;
    $(document).ready(function() {
      ContentScript._getAccessToken();
      that._itemId = that._getItemIdFromURL();
      ContentScript._bindClickListeners();

      if (that._itemId != null) {
        if ($(".watchLnk").length > 0) {
          // listen for the dom change for the add to watch list link
          var observer = new WebKitMutationObserver(function (aMutations) {
            aMutations.forEach(function(mutation) {
              chrome.extension.sendRequest({forceUpdate: "true"}, function(aResponse) {
              });
            });
          });
          observer.observe($("#linkTopAct").get(0), { attributes: true });
        }
      }
    });
  },

  _bindClickListeners : function() {
    $("body").on("submit", "#SignInForm", function(aEvent) {
      var userId = $("#userid").val();
      chrome.extension.sendRequest({signInRequest:"true", userId:userId}, function(aResponse) {});
    });
  },

  _getItemIdFromURL : function() {
    var itemId = null;
    var url = location.href;

    if (null != url) {
      var matches;

      // old formats
      // used in ebay.co.uk
      // http://cgi.ebay.co.uk/some-string-with-numbers_W0QQitemZ290424547886QQcmdZViewItemQQptZUK_Local_Services_Other_Local_Services_ET?hash=item439ea6ea2e
      matches = url.match(/itemZ(\d*?)(?:QQ|#|$)/i);
      if (!matches) {
        // the link may be using the old URL style (e.g. the sandbox)
        // old format used in other domains such as ebay.com
        // http://cgi.ebay.com/ws/eBayISAPI.dll?ViewItem&item=170474050147
        matches = url.match(/item=(\d*?)(?:&|#|$)/i);
      }
      if (matches && matches[1]) {
        itemId = matches[1];
      }
      // new formats
      // http://cgi.ebay.com/some-string-with-numbers-/260590269172?cmd=ViewItem
      matches =
        url.match(/\/[^/]+\/(\d*?)(?:\?|&|#|$)cmd=ViewItem/i);
      if (matches && matches[1]) {
        itemId = matches[1];
      }
      // newer formats
      // http://www.ebay.com/itm/Studio-M-NEW-Black-Sleeveless-Twist-Front-Tiered-Tulle-Tank-Top-XL-BHFO-/330909486742?pt=US_Womens_Tshirts&hash=item4d0bbe0e96
      matches =
        url.match(/http:\/\/www(\.sandbox)?(\.\w{2,4})?\.ebay(\.\w{2,3}){1,2}\/itm\/[^/]+\/(\d*?)(?:\?|&|#|$)/i);
      if (matches && matches[4]) {
        itemId = matches[4];
      }
    }

    return itemId;
  },

  /**
   * Gets the access token from the response url body.
   */
  _getAccessToken : function() {
    var url = location.href;
    if (null != url && url.match(ContentScript._RE_OAUTH_ACCEPT_EBAY_LOVE_URL)) {
      //extract the access_token from the response body
      var bodyContent = $("body").text();
      var bodyJSON = JSON.parse(bodyContent);
      var access_token = bodyJSON.access_token;
      var expires_in = bodyJSON.expires_in;
      var messageParameters = {};
      messageParameters.operation = "getToken";
      messageParameters.access_token = access_token;
      messageParameters.expires_in = expires_in;

      chrome.runtime.sendMessage(null, messageParameters, null, function(aState) {
        // nothing to do here as the message is processed asynchronously
      });
    }
  }
};
ContentScript.init();
