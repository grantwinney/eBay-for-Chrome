/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */

var ContextMenuHandler = {
  _init : function() {
    chrome.contextMenus.create({
      "title": $.i18n.getString("context.menu.search").replace(/\'/g, '"'),
      "contexts": ["selection"],
      "onclick": ContextMenuHandler.contextMenuOnClick});
  },

  contextMenuOnClick : function(aInfo) {
    var keywords = $.trim(aInfo.selectionText);
    if (keywords != "") {
      RoverUrlHelper.performSearch(keywords, "contextMenu", null, null, null);
    }
  }
};
/**
 * Constructor.
 */
(function() { this._init(); }).apply(ContextMenuHandler);
