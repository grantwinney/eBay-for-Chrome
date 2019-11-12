/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var PanelSelling = {
    _BASIC_LIST_ITEM_COUNT: 5,
    _ITEM_TYPE_PROPERTIES: {},
    _dataUpdateId: null,
    _currentFullListType: null,
    _isLoadingMoreForFullList: false,
    _deletedItems: [],
    _cachedSelectedDeleteItems: [],
    _isInEditMode: false,
    init: function () {
        $("[rel^=i18n],[title^=i18n],[alt^=i18n]").i18n({ attributeNames: ["title", "alt"] });
        Sidebar.updateTooltips();
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
        ObserverHelper.addObserver(this, Topics.SAVED_LISTING_DRAFTS_UPDATED);
        ObserverHelper.addObserver(this, Topics.MY_SELLING_UPDATED);
        ObserverHelper.addObserver(this, Topics.MY_SELLING_LIST_UPDATED);
        ObserverHelper.addObserver(this, Topics.MY_SELLING_UPDATING);
        ObserverHelper.addObserver(this, Topics.SELLING_SUMMARY_INFO_UPDATED);
        ObserverHelper.addObserver(this, Topics.SELLING_OFFER_LIST_UPDATED);
        this._addEventListeners();
        if (Account.getAccount()) {
            this._populateData();
            this._setSummaryInfo();
            this._startDataUpdate();
        }
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SELLING_OFFER] = {
            label: "list.offers",
            listName: TradingApi.SELLING_OFFER_LIST,
            basicListId: "panel-selling-offer"
        };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SELLING] = {
            label: "list.active",
            listName: TradingApi.ACTIVE_LIST,
            basicListId: "panel-selling-active"
        };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SOLD] = {
            label: "list.sold",
            listName: TradingApi.SOLD_LIST,
            basicListId: "panel-selling-sold"
        };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.UNSOLD] = {
            label: "list.unsold",
            listName: TradingApi.UNSOLD_LIST,
            basicListId: "panel-selling-unsold"
        };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SCHEDULED] = {
            label: "list.scheduled",
            listName: TradingApi.SCHEDULED_LIST,
            basicListId: "panel-selling-scheduled"
        };
    },
    uninit: function () {
        if (this._deletedItems.length > 0 && this._currentFullListType) {
            this.deleteItems(function () { });
            var deleteItemIds = [];
            for (var i = 0; i < this._deletedItems.length; i++) {
                deleteItemIds.push(this._deletedItems[i].itemId);
            }
            switch (this._currentFullListType) {
                case Item.TYPES.SOLD:
                    MyEbayService.removeItemsFromList(TradingApi.SOLD_LIST, deleteItemIds);
                    break;
                case Item.TYPES.UNSOLD:
                    MyEbayService.removeItemsFromList(TradingApi.UNSOLD_LIST, deleteItemIds);
                    break;
            }
        }
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_OUT);
        ObserverHelper.removeObserver(this, Topics.SAVED_LISTING_DRAFTS_UPDATED);
        ObserverHelper.removeObserver(this, Topics.MY_SELLING_UPDATED);
        ObserverHelper.removeObserver(this, Topics.MY_SELLING_LIST_UPDATED);
        ObserverHelper.removeObserver(this, Topics.MY_SELLING_UPDATING);
        ObserverHelper.removeObserver(this, Topics.SELLING_SUMMARY_INFO_UPDATED);
        ObserverHelper.removeObserver(this, Topics.SELLING_OFFER_LIST_UPDATED);
    },
    _addEventListeners: function () {
        $("#panel-selling-sell-button").click(function (aEvent) {
            EventAnalytics.push({
                key: "SignedInExit",
                action: "ClickSelling",
                label: "Sell"
            });
            RoverUrlHelper.loadPage("sell", "emptyListText", null, aEvent);
        }.bind(this));
        $("#panel-selling-sell-button").mousedown(function (aEvent) {
            aEvent.preventDefault();
        });
        $("#item-list-selling-dock-edit, #item-list-selling-float-edit").click(function () {
            this._showEditMode(true);
        }.bind(this));
        $("#item-list-selling-dock-cancel, #item-list-selling-float-cancel").click(function () {
            this._showEditMode(false);
        }.bind(this));
        $("#panel-selling-delete-button").click(function (aEvent) {
            var items = this._getSelectedDeleteItems();
            if (items.length > 0 && this._currentFullListType) {
                this._hideDeletedItems(items);
                this._showEditMode(false);
                if (this._currentFullListType) {
                    MessagePanel.addMessage(MessagePanelService.TYPE.ITEMS_DELETED, { itemType: this._currentFullListType, itemNum: items.length });
                }
            }
        }.bind(this));
        $("#panel-selling-delete-button").mousedown(function (aEvent) {
            aEvent.preventDefault();
        });
        $("#item-list-selling-dock-refine, #item-list-selling-float-refine").click(function () {
            var eventLabel = Sidebar.getGAListTypeTrackingName(this._currentFullListType);
            EventAnalytics.push({
                key: "SignedInInternal",
                action: "ClickRefine",
                label: eventLabel
            });
            RefineContainer.show(this._currentFullListType);
        }.bind(this));
        $("#panel-selling-summary-awaiting-shipment").click(function () {
            var listName = TradingApi.SOLD_LIST;
            var that = this;
            MyEbayService.setRefine(listName, { filter: MyEbayService.FILTER.AWAITING_SHIPMENT });
            MyEbayService.loadSellingListData({
                name: listName,
                entriesPerPage: MyEbayService.LIST_ITEM_BATCH_SIZE
            }, function () {
                that.showFullList(true, { type: Item.TYPES.SOLD });
            });
            EventAnalytics.push({
                key: "SignedInInternal",
                action: "ClickSellingHeader",
                label: "SellingHeaderShip"
            });
        }.bind(this));
        $("#panel-selling-summary-offer").click(function () {
            this.showFullList(true, { type: Item.TYPES.SELLING_OFFER });
            EventAnalytics.push({
                key: "SignedInInternal",
                action: "ClickSellingHeader",
                label: "SellingHeaderOffers"
            });
        }.bind(this));
    },
    _populateData: function (aIsList, aListName) {
        if (aIsList && this._currentFullListType) {
            this._setFullList(this._currentFullListType, false);
        }
        else {
            this._setPanel();
        }
        Sidebar.showLoading("selling");
    },
    _setSummaryInfo: function () {
        var hasShippingSummary = false;
        var hasOfferSummary = false;
        if (!this._currentFullListType) {
            var summary = MyEbayService.getFilterSummary(MyEbayService.FILTER.AWAITING_SHIPMENT);
            if (summary.count > 0) {
                $("#panel-selling-summary-awaiting-shipment").show();
                $("#panel-selling-summary-awaiting-shipment-count").text(summary.count);
                $("#panel-selling-summary-description-subtitle").text(summary.count == 1 ? summary.title : $.i18n.getString("selling.todo.sold.itemsToShip.sub"));
                hasShippingSummary = true;
            }
            else {
                $("#panel-selling-summary-awaiting-shipment").hide();
            }
            summary = MyEbayService.getSummary(TradingApi.SELLING_OFFER_LIST);
            if (summary.count > 0) {
                $("#panel-selling-summary-offer").show();
                $("#panel-selling-summary-offer-count").text(summary.count);
                if (summary.count == 1) {
                    $("#panel-selling-summary-offer-description-title").text($.i18n.getString("selling.todo.offer.respondToOffer"));
                    $("#panel-selling-summary-offer-description-subtitle").text(summary.title);
                }
                else {
                    $("#panel-selling-summary-offer-description-title").text($.i18n.getString("selling.todo.offer.respondToOffers"));
                    $("#panel-selling-summary-offer-description-subtitle").text($.i18n.getString("selling.todo.offer.respondToOffers.sub"));
                }
                hasOfferSummary = true;
            }
            else {
                $("#panel-selling-summary-offer").hide();
            }
        }
        if (hasShippingSummary || hasOfferSummary) {
            var element = $("#panel-selling-summary-awaiting-shipment");
            if (!hasOfferSummary) {
                if (!element.hasClass("one-item-only")) {
                    element.addClass("one-item-only");
                }
            }
            else {
                element.removeClass("one-item-only");
            }
            $("#panel-selling-summary").show();
        }
        else {
            $("#panel-selling-summary").hide();
        }
    },
    _setPanel: function () {
        if (this.apiHasItems()) {
            this._isLoadingMoreForFullList = false;
            this._createItemBoxes(MyEbayService.getList(TradingApi.SELLING_OFFER_LIST), "panel-selling-offer", { totalCount: MyEbayService.getSummary(TradingApi.SELLING_OFFER_LIST).count });
            this._createItemBoxes(MyEbayService.getList(TradingApi.ACTIVE_LIST), "panel-selling-active", { totalCount: MyEbayService.getSummary(TradingApi.ACTIVE_LIST).count });
            this._createItemBoxes(MyEbayService.getList(TradingApi.SOLD_LIST), "panel-selling-sold", { totalCount: MyEbayService.getSummary(TradingApi.SOLD_LIST).count });
            this._createItemBoxes(MyEbayService.getList(TradingApi.UNSOLD_LIST), "panel-selling-unsold", { totalCount: MyEbayService.getSummary(TradingApi.UNSOLD_LIST).count });
            this._createItemBoxes(MyEbayService.getList(TradingApi.SCHEDULED_LIST), "panel-selling-scheduled", { totalCount: MyEbayService.getSummary(TradingApi.SCHEDULED_LIST).count });
            this._setCurrencyNote();
            $("#panel-selling-empty").css("display", "none");
            $("#panel-selling-main").css("display", "block");
            $("[title^=i18n]").i18n({ attributeNames: ["title"] });
            Sidebar.updateTooltips();
        }
        else {
            if (MyEbayService.isUpdatingSellingData) {
                $("#panel-selling-main").css("display", "none");
                $("#panel-selling-empty").css("display", "none");
            }
            else {
                $("#panel-selling-main").css("display", "none");
                $("#panel-selling-empty").css("display", "block");
            }
        }
    },
    _createItemBoxes: function (aItems, aId, aExtraInfo) {
        var container = $("#" + aId);
        var content = $("#" + aId + "-list");
        var listLength = aItems.length;
        var shouldShowViewAll = false;
        if (aItems.length > 0) {
            content.empty();
            if (aExtraInfo && !aExtraInfo.fullListView &&
                aExtraInfo.totalCount > this._BASIC_LIST_ITEM_COUNT) {
                listLength = this._BASIC_LIST_ITEM_COUNT;
                shouldShowViewAll = true;
            }
            for (var i = 0; i < listLength; i++) {
                content.append(ItemBox.createItemBox(aItems[i]));
            }
            if (shouldShowViewAll) {
                aExtraInfo.type = aItems[0].get("type");
                content.append(ItemBox.createViewAllBox(aExtraInfo));
            }
            container.show();
        }
        else {
            if (aExtraInfo && aExtraInfo.fullListView) {
                container.show();
            }
            else {
                container.hide();
            }
            content.empty();
        }
        Sidebar.adjustTabIndex();
        Sidebar.removeTabIndex();
    },
    _resetFilterForBasicList: function (aPrevFullViewType) {
        if (aPrevFullViewType && aPrevFullViewType == Item.TYPES.SOLD) {
            var listName = this._ITEM_TYPE_PROPERTIES[aPrevFullViewType].listName;
            var filter = MyEbayService.getRefine(listName).filter;
            if (filter && filter != MyEbayService.FILTER.ALL) {
                MyEbayService.setRefine(listName, { filter: null });
                MyEbayService.loadSellingListData({
                    name: listName
                });
            }
        }
    },
    _setCurrencyNote: function () {
        var note = $("#panel-selling-converted-currency-note");
        if ($("#panel-selling-main-basic").find(".item-price-inner-container.converted").length > 0) {
            note.show();
        }
        else {
            note.hide();
        }
    },
    _setFullListCurrencyNote: function () {
        var note = $("#panel-selling-full-converted-currency-note");
        if ($("#panel-selling-full-list").find(".item-price-inner-container.converted").length > 0) {
            note.show();
        }
        else {
            note.hide();
        }
    },
    showFullList: function (aShow, aDataObj) {
        if (aShow) {
            this._currentFullListType = aDataObj.type;
            this._setFullList(this._currentFullListType, true);
            this._setEditLink(this._currentFullListType);
            this._updateRefineLabel(this._currentFullListType);
            TabContainer.setFullListViewTitle($.i18n.getString(this._ITEM_TYPE_PROPERTIES[aDataObj.type].label));
            $("#panel-selling-main-basic").hide();
            $("#panel-selling-main-full-list").show();
            if (aDataObj.type == Item.TYPES.SELLING_OFFER) {
                Sidebar.scrollToTop("panels");
            }
            else {
                $("#panel-selling-lazy-loading").show();
            }
        }
        else {
            if (this._currentFullListType) {
                MessagePanel.onTabChange();
            }
            this._resetFilterForBasicList(this._currentFullListType);
            this._currentFullListType = null;
            $("#panel-selling-main-full-list").hide();
            $("#panel-selling-main-basic").show();
            this._showEditMode(false);
        }
        this._setSummaryInfo();
        TabContainer.switchFullListView(aShow);
    },
    _setFullList: function (aType, aShouldFetch, aLoadMore) {
        var id = "panel-selling-full";
        var pageNumber = 1;
        var listName = this._ITEM_TYPE_PROPERTIES[aType].listName;
        var list;
        if (aShouldFetch) {
            if (aLoadMore) {
                pageNumber = MyEbayService.getSummary(listName).currentPage + 1;
                this._cacheSelectedDeleteItems();
            }
            else {
                list = MyEbayService.getList(listName);
                this._createItemBoxes(list, id, { fullListView: true });
                this._setFullListCurrencyNote();
            }
        }
        else {
            list = MyEbayService.getList(listName);
            this._createItemBoxes(list, id, { fullListView: true });
            this._applyCachedSelectedDeleteItems();
            this._updateRefineLabel(this._currentFullListType);
            this._setFullListCurrencyNote();
            this._createItemBoxes(list, this._ITEM_TYPE_PROPERTIES[aType].basicListId, { totalCount: MyEbayService.getSummary(listName).count });
            listName = null;
        }
        if (listName) {
            if (pageNumber > 1) {
                if (!MyEbayService.ignoreRequest[Topics.MY_SELLING_LIST_UPDATED]) {
                    Sidebar.setElementDisplayed("#panel-selling-lazy-loading", true);
                    Sidebar.scrollToBottom("panels");
                }
            }
            this._isLoadingMoreForFullList = true;
            MyEbayService.loadSellingListData({
                name: listName,
                entriesPerPage: MyEbayService.LIST_ITEM_BATCH_SIZE,
                pageNumber: pageNumber
            });
        }
        else {
            Sidebar.setElementDisplayed("#panel-selling-lazy-loading", false);
        }
    },
    loadMoreToFullList: function () {
        if (this._isLoadingMoreForFullList) {
            return;
        }
        this._setFullList(this._currentFullListType, true, true);
    },
    _setEditLink: function (aType) {
        switch (aType) {
            case Item.TYPES.SELLING:
                $("#item-list-selling-dock-edit,#item-list-selling-float-edit").hide();
                $("#panel-selling-dock-header-box").show();
                $("#panel-selling-full-list").removeClass("no-header");
                break;
            case Item.TYPES.SOLD:
            case Item.TYPES.UNSOLD:
                $("#item-list-selling-dock-edit,#item-list-selling-float-edit").show();
                $("#panel-selling-dock-header-box").show();
                $("#panel-selling-full-list").removeClass("no-header");
                break;
            case Item.TYPES.SELLING_OFFER:
            case Item.TYPES.SCHEDULED:
                $("#panel-selling-dock-header-box,#panel-selling-float-header-box").hide();
                $("#panel-selling-full-list").addClass("no-header");
                break;
        }
    },
    _showEditMode: function (aShow) {
        if (aShow) {
            this._isInEditMode = true;
            $("#item-list-selling-dock-edit-header, #item-list-selling-float-edit-header").hide();
            $("#item-list-selling-dock-cancel-header, #item-list-selling-float-cancel-header").show();
            $("#panel-selling-sell-button, #panel-selling-draft-button").hide();
            $("#panel-selling-delete-button").show();
            $("#panel-selling-full-list").addClass("edit-mode");
            $("#panel-selling-delete-button").attr("disabled", this.getSelectedDeleteCheckboxes().length === 0);
        }
        else {
            this._isInEditMode = false;
            this._cachedSelectedDeleteItems = [];
            $("#item-list-selling-dock-edit-header, #item-list-selling-float-edit-header").show();
            $("#item-list-selling-dock-cancel-header, #item-list-selling-float-cancel-header").hide();
            $("#panel-selling-delete-button").hide();
            $("#panel-selling-sell-button").show();
            $("#panel-selling-full-list").removeClass("edit-mode");
            this.updateDraftsButton();
        }
    },
    _updateRefineLabel: function (aType) {
        if (aType == Item.TYPES.SOLD) {
            var filter = MyEbayService.getRefine(TradingApi.SOLD_LIST).filter;
            switch (filter) {
                case MyEbayService.FILTER.AWAITING_PAYMENT:
                    $("#item-list-selling-dock-filter-text,#item-list-selling-float-filter-text").
                        text($.i18n.getString("refine.filterBy.notPaid"));
                    $("#item-list-selling-dock-filter,#item-list-selling-float-filter").show();
                    $("#item-list-selling-dock-edit,#item-list-selling-float-edit").show();
                    break;
                case MyEbayService.FILTER.AWAITING_SHIPMENT:
                    $("#item-list-selling-dock-filter-text, #item-list-selling-float-filter-text").
                        text($.i18n.getString("refine.filterBy.awaitingShipment"));
                    $("#item-list-selling-dock-filter, #item-list-selling-float-filter").show();
                    $("#item-list-selling-dock-edit,#item-list-selling-float-edit").hide();
                    break;
                case MyEbayService.FILTER.PAID_AND_SHIPPED:
                    $("#item-list-selling-dock-filter-text, #item-list-selling-float-filter-text").
                        text($.i18n.getString("refine.filterBy.shipped"));
                    $("#item-list-selling-dock-filter, #item-list-selling-float-filter").show();
                    $("#item-list-selling-dock-edit,#item-list-selling-float-edit").show();
                    break;
                default:
                    $("#item-list-selling-dock-filter, #item-list-selling-float-filter").hide();
                    $("#item-list-selling-dock-edit,#item-list-selling-float-edit").show();
            }
        }
        else {
            $("#item-list-selling-dock-filter, #item-list-selling-float-filter").hide();
        }
    },
    getSelectedDeleteCheckboxes: function () {
        return $("#panel-selling-full-list").find(".item-edit-checkbox input[type='checkbox']:checked");
    },
    _getSelectedDeleteItems: function () {
        var selectedElements = this.getSelectedDeleteCheckboxes();
        var itemObjects = [];
        for (var i = 0; i < selectedElements.length; i++) {
            var element = $(selectedElements[i]).parents(".item-box-container").get(0);
            var itemObject = $(element).data("itemObject");
            var itemId = itemObject.get("itemId");
            var itemType = itemObject.get("type");
            var transaction = null;
            var transactionId = 0;
            var item = {};
            if (itemObject.get("transactions") &&
                itemObject.get("transactions").length > 0) {
                transaction = itemObject.get("transactions")[0];
                transactionId = transaction.get("transactionId");
            }
            item.itemId = itemId;
            item.itemType = itemType;
            item.transactionId = transactionId;
            itemObjects.push(item);
        }
        return itemObjects;
    },
    _cacheSelectedDeleteItems: function () {
        this._cachedSelectedDeleteItems = this._getSelectedDeleteItems();
    },
    _applyCachedSelectedDeleteItems: function () {
        if (this._isInEditMode && this._cachedSelectedDeleteItems.length > 0) {
            var elements = $("#panel-selling-full-list").find(".item-edit-checkbox input[type='checkbox']");
            for (var i = 0; i < elements.length; i++) {
                var element = $(elements[i]);
                var container = element.parents(".item-box-container").get(0);
                var itemId = $(container).data("itemObject").get("itemId");
                for (var j = (this._cachedSelectedDeleteItems.length - 1); j >= 0; j--) {
                    if (this._cachedSelectedDeleteItems[j].itemId == itemId) {
                        element.prop("checked", true);
                        this._cachedSelectedDeleteItems.splice(j, 1);
                        break;
                    }
                }
            }
            this._cachedSelectedDeleteItems = [];
        }
    },
    _hideDeletedItems: function (aItems) {
        this._deletedItems = aItems;
        var selectedElements = this.getSelectedDeleteCheckboxes();
        for (var i = 0; i < selectedElements.length; i++) {
            $(selectedElements[i]).parents(".item-box-container").hide();
        }
    },
    _deleteDeletedItems: function () {
        var selectedElements = this.getSelectedDeleteCheckboxes();
        for (var i = 0; i < selectedElements.length; i++) {
            $(selectedElements[i]).parents(".item-box-container").remove();
        }
    },
    showDeletedItems: function () {
        var selectedElements = this.getSelectedDeleteCheckboxes();
        for (var i = 0; i < selectedElements.length; i++) {
            var element = $(selectedElements[i]);
            var container = element.parents(".item-box-container");
            var itemId = container.data("itemObject").get("itemId");
            for (var j = (this._deletedItems.length - 1); j >= 0; j--) {
                if (this._deletedItems[j].itemId == itemId) {
                    element.prop("checked", false);
                    container.show();
                    this._deletedItems.splice(j, 1);
                    break;
                }
            }
        }
        this._deletedItems = [];
    },
    deleteItems: function (aCallback) {
        if (this._deletedItems.length > 0 && this._currentFullListType) {
            var activeAccount = Account.getAccount();
            if (activeAccount) {
                var token = activeAccount.get("token");
                if (token) {
                    var that = this;
                    var siteId = Site.siteIdForSite(Site.getHomeSite());
                    var fullListType = this._currentFullListType;
                    var deleteItemIds = [];
                    for (var i = 0; i < this._deletedItems.length; i++) {
                        deleteItemIds.push(this._deletedItems[i].itemId);
                    }
                    var localCallback = function (aResult) {
                        if (!aResult.errors) {
                            var listName;
                            switch (fullListType) {
                                case Item.TYPES.SOLD:
                                    MyEbayService.removeItemsFromList(TradingApi.SOLD_LIST, deleteItemIds);
                                    break;
                                case Item.TYPES.UNSOLD:
                                    MyEbayService.removeItemsFromList(TradingApi.UNSOLD_LIST, deleteItemIds);
                                    break;
                            }
                            that._deleteDeletedItems();
                            that._deletedItems = [];
                            listName = that._ITEM_TYPE_PROPERTIES[fullListType].listName;
                            that._createItemBoxes(MyEbayService.getList(listName), that._ITEM_TYPE_PROPERTIES[fullListType].basicListId, { totalCount: MyEbayService.getSummary(listName).count });
                        }
                        else {
                            that.showDeletedItems();
                            MessagePanelService.addMessage(MessagePanelService.TYPE.CONNECT_ERROR);
                        }
                    };
                    switch (fullListType) {
                        case Item.TYPES.SOLD:
                            MyEbayApplicationApi.removeFromSoldList(token, this._deletedItems, siteId, (aCallback ? aCallback : localCallback));
                            break;
                        case Item.TYPES.UNSOLD:
                            MyEbayApplicationApi.removeFromUnsoldList(token, this._deletedItems, siteId, (aCallback ? aCallback : localCallback));
                            break;
                    }
                }
            }
        }
    },
    _startDataUpdate: function () {
        this._dataUpdateId = setTimeout(function () {
            this._updateTimeLeft();
            this._startDataUpdate();
        }.bind(this), 1000);
    },
    _stopDataUpdate: function () {
        if (this._dataUpdateId) {
            clearTimeout(this._dataUpdateId);
            delete this._dataUpdateId;
        }
    },
    _updateTimeLeft: function () {
        if (this._currentFullListType) {
            if (this._currentFullListType == Item.TYPES.SELLING ||
                this._currentFullListType == Item.TYPES.SELLING_OFFER) {
                $("#panel-selling-full-list").children("a").each(function () {
                    ItemBox.updateTimeLeft($(this));
                });
            }
        }
        else {
            $("#panel-selling-active-list,#panel-selling-offer-list").children("a").each(function () {
                ItemBox.updateTimeLeft($(this));
            });
        }
    },
    updateDraftsButton: function () {
        var draftsNum = ListingDraftService.savedDrafts;
        if (draftsNum > 0) {
            $("#panel-selling-draft-count").text(draftsNum);
            if (!$("#panel-selling-buttons-container").hasClass("show-drafts")) {
                $("#panel-selling-buttons-container").addClass("show-drafts");
            }
        }
        else {
            $("#panel-selling-buttons-container").removeClass("show-drafts");
        }
    },
    apiHasItems: function () {
        var apiHasItems = false;
        var sellingOfferList = MyEbayService.getList(TradingApi.SELLING_OFFER_LIST);
        var activeList = MyEbayService.getList(TradingApi.ACTIVE_LIST);
        var soldList = MyEbayService.getList(TradingApi.SOLD_LIST);
        var unsoldList = MyEbayService.getList(TradingApi.UNSOLD_LIST);
        var scheduledList = MyEbayService.getList(TradingApi.SCHEDULED_LIST);
        if (sellingOfferList > 0 || activeList.length > 0 || soldList.length > 0 ||
            unsoldList.length > 0 || scheduledList.length > 0) {
            apiHasItems = true;
        }
        return apiHasItems;
    },
    observe: function (aTopic, aData) {
        switch (aTopic) {
            case Topics.ACCOUNT_SIGNED_IN:
                this._startDataUpdate();
                break;
            case Topics.ACCOUNT_SIGNED_OUT:
                this._stopDataUpdate();
                break;
            case Topics.SAVED_LISTING_DRAFTS_UPDATED:
                this.updateDraftsButton();
                break;
            case Topics.MY_SELLING_UPDATED:
                this._isLoadingMoreForFullList = false;
                this._populateData();
                break;
            case Topics.MY_SELLING_LIST_UPDATED:
                this._isLoadingMoreForFullList = false;
                this._populateData(true, aData);
                break;
            case Topics.MY_SELLING_UPDATING:
                if (!this._isLoadingMoreForFullList) {
                    Sidebar.showLoading("selling");
                }
                break;
            case Topics.SELLING_SUMMARY_INFO_UPDATED:
                if (aData == MyEbayService.FILTER.AWAITING_SHIPMENT) {
                    this._setSummaryInfo();
                }
                break;
            case Topics.SELLING_OFFER_LIST_UPDATED:
                this._isLoadingMoreForFullList = false;
                this._setSummaryInfo();
                this._populateData();
                break;
        }
    }
};
$(window).unload(function () { PanelSelling.uninit(); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWxTZWxsaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdWkvdmlldy9jb3JlL3BhbmVsU2VsbGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILElBQUksWUFBWSxHQUFHO0lBQ2pCLHNCQUFzQixFQUFHLENBQUM7SUFDMUIscUJBQXFCLEVBQUcsRUFBRTtJQUMxQixhQUFhLEVBQUcsSUFBSTtJQUNwQixvQkFBb0IsRUFBRyxJQUFJO0lBQzNCLHlCQUF5QixFQUFHLEtBQUs7SUFDakMsYUFBYSxFQUFFLEVBQUU7SUFDakIsMEJBQTBCLEVBQUUsRUFBRTtJQUM5QixhQUFhLEVBQUcsS0FBSztJQUVyQixJQUFJLEVBQUU7UUFDSixDQUFDLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBRSxPQUFPLEVBQUUsS0FBSyxDQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hGLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV6QixjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMzRCxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM1RCxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUN0RSxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM1RCxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNqRSxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM3RCxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxN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QkFDcEMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLEtBQUssQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3JCLEtBQUssQ0FBQztRQUNWLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQztBQUVGLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYSxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQ29weXJpZ2h0IChDKSAyMDA3LTIwMTUgZUJheSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKi9cblxudmFyIFBhbmVsU2VsbGluZyA9IHtcbiAgX0JBU0lDX0xJU1RfSVRFTV9DT1VOVCA6IDUsXG4gIF9JVEVNX1RZUEVfUFJPUEVSVElFUyA6IHt9LFxuICBfZGF0YVVwZGF0ZUlkIDogbnVsbCxcbiAgX2N1cnJlbnRGdWxsTGlzdFR5cGUgOiBudWxsLFxuICBfaXNMb2FkaW5nTW9yZUZvckZ1bGxMaXN0IDogZmFsc2UsXG4gIF9kZWxldGVkSXRlbXM6IFtdLFxuICBfY2FjaGVkU2VsZWN0ZWREZWxldGVJdGVtczogW10sXG4gIF9pc0luRWRpdE1vZGUgOiBmYWxzZSxcblxuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAkKFwiW3JlbF49aTE4bl0sW3RpdGxlXj1pMThuXSxbYWx0Xj1pMThuXVwiKS5pMThuKHsgYXR0cmlidXRlTmFtZXM6IFsgXCJ0aXRsZVwiLCBcImFsdFwiIF0gfSk7XG4gICAgU2lkZWJhci51cGRhdGVUb29sdGlwcygpO1xuXG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX0lOKTtcbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUKTtcbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuU0FWRURfTElTVElOR19EUkFGVFNfVVBEQVRFRCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLk1ZX1NFTExJTkdfVVBEQVRFRCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLk1ZX1NFTExJTkdfTElTVF9VUERBVEVEKTtcbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuTVlfU0VMTElOR19VUERBVElORyk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLlNFTExJTkdfU1VNTUFSWV9JTkZPX1VQREFURUQpO1xuICAgIE9ic2VydmVySGVscGVyLmFkZE9ic2VydmVyKHRoaXMsIFRvcGljcy5TRUxMSU5HX09GRkVSX0xJU1RfVVBEQVRFRCk7XG5cbiAgICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpO1xuICAgIGlmIChBY2NvdW50LmdldEFjY291bnQoKSkge1xuICAgICAgdGhpcy5fcG9wdWxhdGVEYXRhKCk7XG4gICAgICB0aGlzLl9zZXRTdW1tYXJ5SW5mbygpO1xuICAgICAgdGhpcy5fc3RhcnREYXRhVXBkYXRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbSXRlbS5UWVBFUy5TRUxMSU5HX09GRkVSXSA9IHtcbiAgICAgIGxhYmVsOiBcImxpc3Qub2ZmZXJzXCIsXG4gICAgICBsaXN0TmFtZTogVHJhZGluZ0FwaS5TRUxMSU5HX09GRkVSX0xJU1QsXG4gICAgICBiYXNpY0xpc3RJZDogXCJwYW5lbC1zZWxsaW5nLW9mZmVyXCJcbiAgICB9O1xuICAgIHRoaXMuX0lURU1fVFlQRV9QUk9QRVJUSUVTW0l0ZW0uVFlQRVMuU0VMTElOR10gPSB7XG4gICAgICBsYWJlbDogXCJsaXN0LmFjdGl2ZVwiLFxuICAgICAgbGlzdE5hbWU6IFRyYWRpbmdBcGkuQUNUSVZFX0xJU1QsXG4gICAgICBiYXNpY0xpc3RJZDogXCJwYW5lbC1zZWxsaW5nLWFjdGl2ZVwiXG4gICAgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLlNPTERdID0ge1xuICAgICAgbGFiZWw6IFwibGlzdC5zb2xkXCIsXG4gICAgICBsaXN0TmFtZTogVHJhZGluZ0FwaS5TT0xEX0xJU1QsXG4gICAgICBiYXNpY0xpc3RJZDogXCJwYW5lbC1zZWxsaW5nLXNvbGRcIlxuICAgIH07XG4gICAgdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbSXRlbS5UWVBFUy5VTlNPTERdID0ge1xuICAgICAgbGFiZWw6IFwibGlzdC51bnNvbGRcIixcbiAgICAgIGxpc3ROYW1lOiBUcmFkaW5nQXBpLlVOU09MRF9MSVNULFxuICAgICAgYmFzaWNMaXN0SWQ6IFwicGFuZWwtc2VsbGluZy11bnNvbGRcIlxuICAgIH07XG4gICAgdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbSXRlbS5UWVBFUy5TQ0hFRFVMRURdID0ge1xuICAgICAgbGFiZWw6IFwibGlzdC5zY2hlZHVsZWRcIixcbiAgICAgIGxpc3ROYW1lOiBUcmFkaW5nQXBpLlNDSEVEVUxFRF9MSVNULFxuICAgICAgYmFzaWNMaXN0SWQ6IFwicGFuZWwtc2VsbGluZy1zY2hlZHVsZWRcIlxuICAgIH07XG4gIH0sXG5cbiAgdW5pbml0IDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGggPiAwICYmIHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpIHtcbiAgICAgIHRoaXMuZGVsZXRlSXRlbXMoZnVuY3Rpb24oKSB7fSk7XG5cbiAgICAgIHZhciBkZWxldGVJdGVtSWRzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWxldGVJdGVtSWRzLnB1c2godGhpcy5fZGVsZXRlZEl0ZW1zW2ldLml0ZW1JZCk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpIHtcbiAgICAgICAgY2FzZSBJdGVtLlRZUEVTLlNPTEQ6XG4gICAgICAgICAgTXlFYmF5U2VydmljZS5yZW1vdmVJdGVtc0Zyb21MaXN0KFxuICAgICAgICAgICAgVHJhZGluZ0FwaS5TT0xEX0xJU1QsIGRlbGV0ZUl0ZW1JZHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEl0ZW0uVFlQRVMuVU5TT0xEOlxuICAgICAgICAgIE15RWJheVNlcnZpY2UucmVtb3ZlSXRlbXNGcm9tTGlzdChcbiAgICAgICAgICAgIFRyYWRpbmdBcGkuVU5TT0xEX0xJU1QsIGRlbGV0ZUl0ZW1JZHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIE9ic2VydmVySGVscGVyLnJlbW92ZU9ic2VydmVyKHRoaXMsIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTik7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLlNBVkVEX0xJU1RJTkdfRFJBRlRTX1VQREFURUQpO1xuICAgIE9ic2VydmVySGVscGVyLnJlbW92ZU9ic2VydmVyKHRoaXMsIFRvcGljcy5NWV9TRUxMSU5HX1VQREFURUQpO1xuICAgIE9ic2VydmVySGVscGVyLnJlbW92ZU9ic2VydmVyKHRoaXMsIFRvcGljcy5NWV9TRUxMSU5HX0xJU1RfVVBEQVRFRCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLk1ZX1NFTExJTkdfVVBEQVRJTkcpO1xuICAgIE9ic2VydmVySGVscGVyLnJlbW92ZU9ic2VydmVyKHRoaXMsIFRvcGljcy5TRUxMSU5HX1NVTU1BUllfSU5GT19VUERBVEVEKTtcbiAgICBPYnNlcnZlckhlbHBlci5yZW1vdmVPYnNlcnZlcih0aGlzLCBUb3BpY3MuU0VMTElOR19PRkZFUl9MSVNUX1VQREFURUQpO1xuICB9LFxuXG4gIF9hZGRFdmVudExpc3RlbmVycyA6IGZ1bmN0aW9uKCkge1xuICAgICQoXCIjcGFuZWwtc2VsbGluZy1zZWxsLWJ1dHRvblwiKS5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIEV2ZW50QW5hbHl0aWNzLnB1c2goe1xuICAgICAgICBrZXk6IFwiU2lnbmVkSW5FeGl0XCIsXG4gICAgICAgIGFjdGlvbjogXCJDbGlja1NlbGxpbmdcIixcbiAgICAgICAgbGFiZWw6IFwiU2VsbFwiXG4gICAgICB9KTtcbiAgICAgIFJvdmVyVXJsSGVscGVyLmxvYWRQYWdlKFwic2VsbFwiLCBcImVtcHR5TGlzdFRleHRcIiwgbnVsbCwgYUV2ZW50KTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgICQoXCIjcGFuZWwtc2VsbGluZy1zZWxsLWJ1dHRvblwiKS5tb3VzZWRvd24oZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICAvLyBwcmV2ZW50IHRoZSBzY3JvbGwgZ2V0IHRoZSBjYWxsLlxuICAgICAgYUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAkKFwiI2l0ZW0tbGlzdC1zZWxsaW5nLWRvY2stZWRpdCwgI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWVkaXRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9zaG93RWRpdE1vZGUodHJ1ZSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICAkKFwiI2l0ZW0tbGlzdC1zZWxsaW5nLWRvY2stY2FuY2VsLCAjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtY2FuY2VsXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fc2hvd0VkaXRNb2RlKGZhbHNlKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgJChcIiNwYW5lbC1zZWxsaW5nLWRlbGV0ZS1idXR0b25cIikuY2xpY2soZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICB2YXIgaXRlbXMgPSB0aGlzLl9nZXRTZWxlY3RlZERlbGV0ZUl0ZW1zKCk7XG4gICAgICBpZiAoaXRlbXMubGVuZ3RoID4gMCAmJiB0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlKSB7XG4gICAgICAgIHRoaXMuX2hpZGVEZWxldGVkSXRlbXMoaXRlbXMpO1xuICAgICAgICB0aGlzLl9zaG93RWRpdE1vZGUoZmFsc2UpO1xuXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlKSB7XG4gICAgICAgICAgTWVzc2FnZVBhbmVsLmFkZE1lc3NhZ2UoXG4gICAgICAgICAgICBNZXNzYWdlUGFuZWxTZXJ2aWNlLlRZUEUuSVRFTVNfREVMRVRFRCxcbiAgICAgICAgICAgIHsgaXRlbVR5cGU6IHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUsIGl0ZW1OdW06IGl0ZW1zLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgJChcIiNwYW5lbC1zZWxsaW5nLWRlbGV0ZS1idXR0b25cIikubW91c2Vkb3duKGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgLy8gcHJldmVudCB0aGUgc2Nyb2xsIGdldCB0aGUgY2FsbC5cbiAgICAgIGFFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLXJlZmluZSwgI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LXJlZmluZVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgIHZhciBldmVudExhYmVsID0gU2lkZWJhci5nZXRHQUxpc3RUeXBlVHJhY2tpbmdOYW1lKHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpO1xuICAgICAgRXZlbnRBbmFseXRpY3MucHVzaCh7XG4gICAgICAgIGtleTogXCJTaWduZWRJbkludGVybmFsXCIsXG4gICAgICAgIGFjdGlvbjogXCJDbGlja1JlZmluZVwiLFxuICAgICAgICBsYWJlbDogZXZlbnRMYWJlbFxuICAgICAgfSk7XG4gICAgICBSZWZpbmVDb250YWluZXIuc2hvdyh0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgJChcIiNwYW5lbC1zZWxsaW5nLXN1bW1hcnktYXdhaXRpbmctc2hpcG1lbnRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGlzdE5hbWUgPSBUcmFkaW5nQXBpLlNPTERfTElTVDtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIE15RWJheVNlcnZpY2Uuc2V0UmVmaW5lKFxuICAgICAgICBsaXN0TmFtZSwgeyBmaWx0ZXI6IE15RWJheVNlcnZpY2UuRklMVEVSLkFXQUlUSU5HX1NISVBNRU5UIH0pO1xuICAgICAgTXlFYmF5U2VydmljZS5sb2FkU2VsbGluZ0xpc3REYXRhKHtcbiAgICAgICAgbmFtZTogbGlzdE5hbWUsXG4gICAgICAgIGVudHJpZXNQZXJQYWdlOiBNeUViYXlTZXJ2aWNlLkxJU1RfSVRFTV9CQVRDSF9TSVpFXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhhdC5zaG93RnVsbExpc3QodHJ1ZSwgeyB0eXBlOiBJdGVtLlRZUEVTLlNPTEQgfSk7XG4gICAgICB9KTtcblxuICAgICAgRXZlbnRBbmFseXRpY3MucHVzaCh7XG4gICAgICAgIGtleTogXCJTaWduZWRJbkludGVybmFsXCIsXG4gICAgICAgIGFjdGlvbjogXCJDbGlja1NlbGxpbmdIZWFkZXJcIixcbiAgICAgICAgbGFiZWw6IFwiU2VsbGluZ0hlYWRlclNoaXBcIlxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICQoXCIjcGFuZWwtc2VsbGluZy1zdW1tYXJ5LW9mZmVyXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zaG93RnVsbExpc3QodHJ1ZSwgeyB0eXBlOiBJdGVtLlRZUEVTLlNFTExJTkdfT0ZGRVIgfSk7XG5cbiAgICAgIEV2ZW50QW5hbHl0aWNzLnB1c2goe1xuICAgICAgICBrZXk6IFwiU2lnbmVkSW5JbnRlcm5hbFwiLFxuICAgICAgICBhY3Rpb246IFwiQ2xpY2tTZWxsaW5nSGVhZGVyXCIsXG4gICAgICAgIGxhYmVsOiBcIlNlbGxpbmdIZWFkZXJPZmZlcnNcIlxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBfcG9wdWxhdGVEYXRhIDogZnVuY3Rpb24oYUlzTGlzdCwgYUxpc3ROYW1lKSB7XG4gICAgaWYgKGFJc0xpc3QgJiYgdGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSkge1xuICAgICAgdGhpcy5fc2V0RnVsbExpc3QodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRQYW5lbCgpO1xuICAgIH1cbiAgICBTaWRlYmFyLnNob3dMb2FkaW5nKFwic2VsbGluZ1wiKTtcbiAgfSxcblxuICBfc2V0U3VtbWFyeUluZm8gOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGFzU2hpcHBpbmdTdW1tYXJ5ID0gZmFsc2U7XG4gICAgdmFyIGhhc09mZmVyU3VtbWFyeSA9IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlKSB7XG4gICAgICB2YXIgc3VtbWFyeSA9IE15RWJheVNlcnZpY2UuZ2V0RmlsdGVyU3VtbWFyeShcbiAgICAgICAgTXlFYmF5U2VydmljZS5GSUxURVIuQVdBSVRJTkdfU0hJUE1FTlQpO1xuICAgICAgaWYgKHN1bW1hcnkuY291bnQgPiAwKSB7XG4gICAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1zdW1tYXJ5LWF3YWl0aW5nLXNoaXBtZW50XCIpLnNob3coKTtcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLXN1bW1hcnktYXdhaXRpbmctc2hpcG1lbnQtY291bnRcIikudGV4dChzdW1tYXJ5LmNvdW50KTtcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLXN1bW1hcnktZGVzY3JpcHRpb24tc3VidGl0bGVcIikudGV4dChcbiAgICAgICAgICBzdW1tYXJ5LmNvdW50ID09IDEgPyBzdW1tYXJ5LnRpdGxlIDogJC5pMThuLmdldFN0cmluZyhcInNlbGxpbmcudG9kby5zb2xkLml0ZW1zVG9TaGlwLnN1YlwiKSk7XG4gICAgICAgIGhhc1NoaXBwaW5nU3VtbWFyeSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctc3VtbWFyeS1hd2FpdGluZy1zaGlwbWVudFwiKS5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIHN1bW1hcnkgPSBNeUViYXlTZXJ2aWNlLmdldFN1bW1hcnkoXG4gICAgICAgIFRyYWRpbmdBcGkuU0VMTElOR19PRkZFUl9MSVNUKTtcbiAgICAgIGlmIChzdW1tYXJ5LmNvdW50ID4gMCkge1xuICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctc3VtbWFyeS1vZmZlclwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1zdW1tYXJ5LW9mZmVyLWNvdW50XCIpLnRleHQoc3VtbWFyeS5jb3VudCk7XG4gICAgICAgIGlmIChzdW1tYXJ5LmNvdW50ID09IDEpIHtcbiAgICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctc3VtbWFyeS1vZmZlci1kZXNjcmlwdGlvbi10aXRsZVwiKS50ZXh0KFxuICAgICAgICAgICAgJC5pMThuLmdldFN0cmluZyhcInNlbGxpbmcudG9kby5vZmZlci5yZXNwb25kVG9PZmZlclwiKSk7XG4gICAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLXN1bW1hcnktb2ZmZXItZGVzY3JpcHRpb24tc3VidGl0bGVcIikudGV4dChzdW1tYXJ5LnRpdGxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctc3VtbWFyeS1vZmZlci1kZXNjcmlwdGlvbi10aXRsZVwiKS50ZXh0KFxuICAgICAgICAgICAgJC5pMThuLmdldFN0cmluZyhcInNlbGxpbmcudG9kby5vZmZlci5yZXNwb25kVG9PZmZlcnNcIikpO1xuICAgICAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1zdW1tYXJ5LW9mZmVyLWRlc2NyaXB0aW9uLXN1YnRpdGxlXCIpLnRleHQoXG4gICAgICAgICAgICAkLmkxOG4uZ2V0U3RyaW5nKFwic2VsbGluZy50b2RvLm9mZmVyLnJlc3BvbmRUb09mZmVycy5zdWJcIikpO1xuICAgICAgICB9XG4gICAgICAgIGhhc09mZmVyU3VtbWFyeSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctc3VtbWFyeS1vZmZlclwiKS5oaWRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc1NoaXBwaW5nU3VtbWFyeSB8fCBoYXNPZmZlclN1bW1hcnkpIHtcbiAgICAgIC8vIGhpZGUgdGhlIGJvdHRvbSBib3JkZXIgY3NzIGlmIG9ubHkgb25lIGl0ZW1cbiAgICAgIHZhciBlbGVtZW50ID0gJChcIiNwYW5lbC1zZWxsaW5nLXN1bW1hcnktYXdhaXRpbmctc2hpcG1lbnRcIik7XG4gICAgICBpZiAoIWhhc09mZmVyU3VtbWFyeSkge1xuICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoXCJvbmUtaXRlbS1vbmx5XCIpKSB7XG4gICAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhcIm9uZS1pdGVtLW9ubHlcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJvbmUtaXRlbS1vbmx5XCIpO1xuICAgICAgfVxuICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLXN1bW1hcnlcIikuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctc3VtbWFyeVwiKS5oaWRlKCk7XG4gICAgfVxuICB9LFxuXG4gIF9zZXRQYW5lbCA6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmFwaUhhc0l0ZW1zKCkpIHtcbiAgICAgIHRoaXMuX2lzTG9hZGluZ01vcmVGb3JGdWxsTGlzdCA9IGZhbHNlO1xuICAgICAgdGhpcy5fY3JlYXRlSXRlbUJveGVzKFxuICAgICAgICBNeUViYXlTZXJ2aWNlLmdldExpc3QoVHJhZGluZ0FwaS5TRUxMSU5HX09GRkVSX0xJU1QpLFxuICAgICAgICBcInBhbmVsLXNlbGxpbmctb2ZmZXJcIixcbiAgICAgICAgeyB0b3RhbENvdW50OiBNeUViYXlTZXJ2aWNlLmdldFN1bW1hcnkoXG4gICAgICAgICAgICBUcmFkaW5nQXBpLlNFTExJTkdfT0ZGRVJfTElTVCkuY291bnQgfSk7XG4gICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLkFDVElWRV9MSVNUKSxcbiAgICAgICAgXCJwYW5lbC1zZWxsaW5nLWFjdGl2ZVwiLFxuICAgICAgICB7IHRvdGFsQ291bnQ6IE15RWJheVNlcnZpY2UuZ2V0U3VtbWFyeShcbiAgICAgICAgICAgIFRyYWRpbmdBcGkuQUNUSVZFX0xJU1QpLmNvdW50IH0pO1xuICAgICAgdGhpcy5fY3JlYXRlSXRlbUJveGVzKFxuICAgICAgICBNeUViYXlTZXJ2aWNlLmdldExpc3QoVHJhZGluZ0FwaS5TT0xEX0xJU1QpLFxuICAgICAgICBcInBhbmVsLXNlbGxpbmctc29sZFwiLFxuICAgICAgICB7IHRvdGFsQ291bnQ6IE15RWJheVNlcnZpY2UuZ2V0U3VtbWFyeShcbiAgICAgICAgICAgIFRyYWRpbmdBcGkuU09MRF9MSVNUKS5jb3VudCB9KTtcbiAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Cb3hlcyhcbiAgICAgICAgTXlFYmF5U2VydmljZS5nZXRMaXN0KFRyYWRpbmdBcGkuVU5TT0xEX0xJU1QpLFxuICAgICAgICBcInBhbmVsLXNlbGxpbmctdW5zb2xkXCIsXG4gICAgICAgIHsgdG90YWxDb3VudDogTXlFYmF5U2VydmljZS5nZXRTdW1tYXJ5KFxuICAgICAgICAgICAgVHJhZGluZ0FwaS5VTlNPTERfTElTVCkuY291bnQgfSk7XG4gICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLlNDSEVEVUxFRF9MSVNUKSxcbiAgICAgICAgXCJwYW5lbC1zZWxsaW5nLXNjaGVkdWxlZFwiLFxuICAgICAgICB7IHRvdGFsQ291bnQ6IE15RWJheVNlcnZpY2UuZ2V0U3VtbWFyeShcbiAgICAgICAgICAgIFRyYWRpbmdBcGkuU0NIRURVTEVEX0xJU1QpLmNvdW50IH0pO1xuICAgICAgdGhpcy5fc2V0Q3VycmVuY3lOb3RlKCk7XG4gICAgICAvL2ZvciBzb21lIHN0cmFuZ2UgcmVhc29uLCB1c2luZyAuaGlkZSgpLy5zaG93KCkgaGVyZSB3aWxsIHRocm93IGFuIGVycm9yOlxuICAgICAgLy9DYW5ub3QgcmVhZCBwcm9wZXJ0eSAnZ2V0Q29tcHV0ZWRTdHlsZScgb2YgdW5kZWZpbmVkXG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctZW1wdHlcIikuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctbWFpblwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAvLyBhcHBseSB0cmFuc2xhdGlvbnMgYWdhaW5cbiAgICAgICQoXCJbdGl0bGVePWkxOG5dXCIpLmkxOG4oeyBhdHRyaWJ1dGVOYW1lczogWyBcInRpdGxlXCIgXSB9KTtcbiAgICAgIFNpZGViYXIudXBkYXRlVG9vbHRpcHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKE15RWJheVNlcnZpY2UuaXNVcGRhdGluZ1NlbGxpbmdEYXRhKSB7XG4gICAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1tYWluXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctZW1wdHlcIikuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctbWFpblwiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWVtcHR5XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX2NyZWF0ZUl0ZW1Cb3hlcyA6IGZ1bmN0aW9uKGFJdGVtcywgYUlkLCBhRXh0cmFJbmZvKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9ICQoXCIjXCIgKyBhSWQpO1xuICAgIHZhciBjb250ZW50ID0gJChcIiNcIiArIGFJZCArIFwiLWxpc3RcIik7XG4gICAgdmFyIGxpc3RMZW5ndGggPSBhSXRlbXMubGVuZ3RoO1xuICAgIHZhciBzaG91bGRTaG93Vmlld0FsbCA9IGZhbHNlO1xuXG4gICAgaWYgKGFJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb250ZW50LmVtcHR5KCk7XG4gICAgICAvLyBwcmV2ZW50IHNob3dpbmcgbW9yZSB0aGFuIGV4cGVjdGVkIGl0ZW1zIGluIGJhc2ljIHZpZXdcbiAgICAgIGlmIChhRXh0cmFJbmZvICYmICFhRXh0cmFJbmZvLmZ1bGxMaXN0VmlldyAmJlxuICAgICAgICAgIGFFeHRyYUluZm8udG90YWxDb3VudCA+IHRoaXMuX0JBU0lDX0xJU1RfSVRFTV9DT1VOVCkge1xuICAgICAgICBsaXN0TGVuZ3RoID0gdGhpcy5fQkFTSUNfTElTVF9JVEVNX0NPVU5UO1xuICAgICAgICBzaG91bGRTaG93Vmlld0FsbCA9IHRydWU7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RMZW5ndGg7IGkrKykge1xuICAgICAgICBjb250ZW50LmFwcGVuZChJdGVtQm94LmNyZWF0ZUl0ZW1Cb3goYUl0ZW1zW2ldKSk7XG4gICAgICB9XG4gICAgICBpZiAoc2hvdWxkU2hvd1ZpZXdBbGwpIHtcbiAgICAgICAgYUV4dHJhSW5mby50eXBlID0gYUl0ZW1zWzBdLmdldChcInR5cGVcIik7XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kKEl0ZW1Cb3guY3JlYXRlVmlld0FsbEJveChhRXh0cmFJbmZvKSk7XG4gICAgICB9XG4gICAgICBjb250YWluZXIuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpZiB1c2luZyBmaWx0ZXIgYW5kIHRoZXJlIGlzIG5vIGl0ZW1zIHJldHVybmVkLCBzaG91bGQgZGlzcGxheSB0aGUgZWRpdCBoZWFkZXIgYmFyLlxuICAgICAgaWYgKGFFeHRyYUluZm8gJiYgYUV4dHJhSW5mby5mdWxsTGlzdFZpZXcpIHtcbiAgICAgICAgY29udGFpbmVyLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9XG4gICAgICBjb250ZW50LmVtcHR5KCk7XG4gICAgfVxuICAgIFNpZGViYXIuYWRqdXN0VGFiSW5kZXgoKTtcbiAgICBTaWRlYmFyLnJlbW92ZVRhYkluZGV4KCk7XG4gIH0sXG5cbiAgX3Jlc2V0RmlsdGVyRm9yQmFzaWNMaXN0IDogZnVuY3Rpb24oYVByZXZGdWxsVmlld1R5cGUpIHtcbiAgICBpZiAoYVByZXZGdWxsVmlld1R5cGUgJiYgYVByZXZGdWxsVmlld1R5cGUgPT0gSXRlbS5UWVBFUy5TT0xEKSB7XG4gICAgICAvLyBpZiB0aGVyZSBpcyBhIGZpbHRlciwgY2xlYXIgaXQgYW5kIGRvIHRoZSBmZXRjaC5cbiAgICAgIHZhciBsaXN0TmFtZSA9IHRoaXMuX0lURU1fVFlQRV9QUk9QRVJUSUVTW2FQcmV2RnVsbFZpZXdUeXBlXS5saXN0TmFtZTtcbiAgICAgIHZhciBmaWx0ZXIgPSBNeUViYXlTZXJ2aWNlLmdldFJlZmluZShsaXN0TmFtZSkuZmlsdGVyO1xuICAgICAgaWYgKGZpbHRlciAmJiBmaWx0ZXIgIT0gTXlFYmF5U2VydmljZS5GSUxURVIuQUxMKSB7XG4gICAgICAgIE15RWJheVNlcnZpY2Uuc2V0UmVmaW5lKGxpc3ROYW1lLCB7IGZpbHRlcjogbnVsbCB9KTtcbiAgICAgICAgTXlFYmF5U2VydmljZS5sb2FkU2VsbGluZ0xpc3REYXRhKHtcbiAgICAgICAgICBuYW1lOiBsaXN0TmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX3NldEN1cnJlbmN5Tm90ZSA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub3RlID0gJChcIiNwYW5lbC1zZWxsaW5nLWNvbnZlcnRlZC1jdXJyZW5jeS1ub3RlXCIpO1xuICAgIGlmICgkKFwiI3BhbmVsLXNlbGxpbmctbWFpbi1iYXNpY1wiKS5maW5kKFwiLml0ZW0tcHJpY2UtaW5uZXItY29udGFpbmVyLmNvbnZlcnRlZFwiKS5sZW5ndGggPiAwKSB7XG4gICAgICBub3RlLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm90ZS5oaWRlKCk7XG4gICAgfVxuICB9LFxuXG4gIF9zZXRGdWxsTGlzdEN1cnJlbmN5Tm90ZSA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub3RlID0gJChcIiNwYW5lbC1zZWxsaW5nLWZ1bGwtY29udmVydGVkLWN1cnJlbmN5LW5vdGVcIik7XG4gICAgaWYgKCQoXCIjcGFuZWwtc2VsbGluZy1mdWxsLWxpc3RcIikuZmluZChcIi5pdGVtLXByaWNlLWlubmVyLWNvbnRhaW5lci5jb252ZXJ0ZWRcIikubGVuZ3RoID4gMCkge1xuICAgICAgbm90ZS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdGUuaGlkZSgpO1xuICAgIH1cbiAgfSxcblxuICAvLyBzaG93IG9uZSBzaW5nbGUgZnVsbCBsaXN0XG4gIHNob3dGdWxsTGlzdCA6IGZ1bmN0aW9uKGFTaG93LCBhRGF0YU9iaikge1xuICAgIGlmIChhU2hvdykge1xuICAgICAgdGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSA9IGFEYXRhT2JqLnR5cGU7XG4gICAgICB0aGlzLl9zZXRGdWxsTGlzdCh0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlLCB0cnVlKTtcbiAgICAgIHRoaXMuX3NldEVkaXRMaW5rKHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpO1xuICAgICAgdGhpcy5fdXBkYXRlUmVmaW5lTGFiZWwodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSk7XG4gICAgICBUYWJDb250YWluZXIuc2V0RnVsbExpc3RWaWV3VGl0bGUoXG4gICAgICAgICQuaTE4bi5nZXRTdHJpbmcodGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbYURhdGFPYmoudHlwZV0ubGFiZWwpKTtcbiAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1tYWluLWJhc2ljXCIpLmhpZGUoKTtcbiAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1tYWluLWZ1bGwtbGlzdFwiKS5zaG93KCk7XG4gICAgICAvL1RPRE86IGNoZWNrIGlmIHRoZXJlIGFyZSBlbGVtZW50cyB0byBkaXNwbGF5IGJlZm9yZSBzaG93aW5nIHRoZSBsYXp5IGxvYWRpbmcgcGFuZWxcbiAgICAgIGlmIChhRGF0YU9iai50eXBlID09IEl0ZW0uVFlQRVMuU0VMTElOR19PRkZFUikge1xuICAgICAgICBTaWRlYmFyLnNjcm9sbFRvVG9wKFwicGFuZWxzXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWxhenktbG9hZGluZ1wiKS5zaG93KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlKSB7XG4gICAgICAgIE1lc3NhZ2VQYW5lbC5vblRhYkNoYW5nZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcmVzZXRGaWx0ZXJGb3JCYXNpY0xpc3QodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSk7XG4gICAgICB0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlID0gbnVsbDtcbiAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1tYWluLWZ1bGwtbGlzdFwiKS5oaWRlKCk7XG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctbWFpbi1iYXNpY1wiKS5zaG93KCk7XG4gICAgICB0aGlzLl9zaG93RWRpdE1vZGUoZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRTdW1tYXJ5SW5mbygpO1xuICAgIFRhYkNvbnRhaW5lci5zd2l0Y2hGdWxsTGlzdFZpZXcoYVNob3cpO1xuICB9LFxuXG4gIC8vIHNldCB0aGUgZnVsbCBsaXN0IHZpZXdcbiAgLy8gYVNob3VsZEZldGNoIG1lYW5zIGdldHRpbmcgdGhlIGZpcnN0IGxpc3RcbiAgLy8gYUxvYWRNb3JlIG1lYW5zIHBhZ2UgMStcbiAgX3NldEZ1bGxMaXN0IDogZnVuY3Rpb24oYVR5cGUsIGFTaG91bGRGZXRjaCwgYUxvYWRNb3JlKSB7XG4gICAgdmFyIGlkID0gXCJwYW5lbC1zZWxsaW5nLWZ1bGxcIjtcbiAgICB2YXIgcGFnZU51bWJlciA9IDE7XG4gICAgdmFyIGxpc3ROYW1lID0gdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbYVR5cGVdLmxpc3ROYW1lO1xuICAgIHZhciBsaXN0O1xuXG4gICAgLy8gYVNob3VsZEZldGNoID09IHRydWUgYW5kICFhTG9hZE1vcmUgbWVhbnMgd2UganVzdCBzd2l0Y2ggdG8gdGhlIGZ1bGwgbGlzdCB2aWV3IGFuZCBzaG91bGRcbiAgICAvLyBsb2FkIHRoZSBsb2NhbCBsaXN0IGJlZm9yZSBmZXRjaGluZy5cbiAgICAvLyBhU2hvdWxkRmV0Y2ggPT0gdHJ1ZSBhbmQgYUxvYWRNb3JlIG1lYW5zIHdlIGp1c3Qgd2FudCB0byBsb2FkIG1vcmUgaW4gdGhlIGZ1bGwgbGlzdCB2aWV3IGFuZFxuICAgIC8vIHNvbWUgaXRlbXMgYXJlIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSBsaXN0LlxuICAgIGlmIChhU2hvdWxkRmV0Y2gpIHtcbiAgICAgIGlmIChhTG9hZE1vcmUpIHtcbiAgICAgICAgcGFnZU51bWJlciA9IE15RWJheVNlcnZpY2UuZ2V0U3VtbWFyeShsaXN0TmFtZSkuY3VycmVudFBhZ2UgKyAxO1xuICAgICAgICB0aGlzLl9jYWNoZVNlbGVjdGVkRGVsZXRlSXRlbXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSBNeUViYXlTZXJ2aWNlLmdldExpc3QobGlzdE5hbWUpO1xuICAgICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMobGlzdCwgaWQsIHsgZnVsbExpc3RWaWV3OiB0cnVlIH0pO1xuICAgICAgICB0aGlzLl9zZXRGdWxsTGlzdEN1cnJlbmN5Tm90ZSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0ID0gTXlFYmF5U2VydmljZS5nZXRMaXN0KGxpc3ROYW1lKTtcbiAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Cb3hlcyhsaXN0LCBpZCwgeyBmdWxsTGlzdFZpZXc6IHRydWUgfSk7XG4gICAgICB0aGlzLl9hcHBseUNhY2hlZFNlbGVjdGVkRGVsZXRlSXRlbXMoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVJlZmluZUxhYmVsKHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpO1xuICAgICAgdGhpcy5fc2V0RnVsbExpc3RDdXJyZW5jeU5vdGUoKTtcbiAgICAgIC8vIHVwZGF0ZSB0aGUgYmFzaWMgbGlzdCB2aWV3XG4gICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgIGxpc3QsXG4gICAgICAgIHRoaXMuX0lURU1fVFlQRV9QUk9QRVJUSUVTW2FUeXBlXS5iYXNpY0xpc3RJZCxcbiAgICAgICAgeyB0b3RhbENvdW50OiBNeUViYXlTZXJ2aWNlLmdldFN1bW1hcnkobGlzdE5hbWUpLmNvdW50IH0pO1xuICAgICAgbGlzdE5hbWUgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIG1ha2UgdGhlIGNhbGwgdG8gZ2V0IHRoZSBmaXJzdCBzZXQuXG4gICAgaWYgKGxpc3ROYW1lKSB7XG4gICAgICBpZiAocGFnZU51bWJlciA+IDEpIHtcbiAgICAgICAgaWYoIU15RWJheVNlcnZpY2UuaWdub3JlUmVxdWVzdFtUb3BpY3MuTVlfU0VMTElOR19MSVNUX1VQREFURURdKSB7XG4gICAgICAgICAgU2lkZWJhci5zZXRFbGVtZW50RGlzcGxheWVkKFwiI3BhbmVsLXNlbGxpbmctbGF6eS1sb2FkaW5nXCIsIHRydWUpO1xuICAgICAgICAgIFNpZGViYXIuc2Nyb2xsVG9Cb3R0b20oXCJwYW5lbHNcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2lzTG9hZGluZ01vcmVGb3JGdWxsTGlzdCA9IHRydWU7XG4gICAgICBNeUViYXlTZXJ2aWNlLmxvYWRTZWxsaW5nTGlzdERhdGEoe1xuICAgICAgICBuYW1lOiBsaXN0TmFtZSxcbiAgICAgICAgZW50cmllc1BlclBhZ2U6IE15RWJheVNlcnZpY2UuTElTVF9JVEVNX0JBVENIX1NJWkUsXG4gICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2VOdW1iZXJcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBTaWRlYmFyLnNldEVsZW1lbnREaXNwbGF5ZWQoXCIjcGFuZWwtc2VsbGluZy1sYXp5LWxvYWRpbmdcIiwgZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICBsb2FkTW9yZVRvRnVsbExpc3QgOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5faXNMb2FkaW5nTW9yZUZvckZ1bGxMaXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3NldEZ1bGxMaXN0KHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUsIHRydWUsIHRydWUpO1xuICB9LFxuXG4gIF9zZXRFZGl0TGluayA6IGZ1bmN0aW9uKGFUeXBlKSB7XG4gICAgc3dpdGNoIChhVHlwZSkge1xuICAgICAgY2FzZSBJdGVtLlRZUEVTLlNFTExJTkc6XG4gICAgICAgICQoXCIjaXRlbS1saXN0LXNlbGxpbmctZG9jay1lZGl0LCNpdGVtLWxpc3Qtc2VsbGluZy1mbG9hdC1lZGl0XCIpLmhpZGUoKTtcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWRvY2staGVhZGVyLWJveFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1mdWxsLWxpc3RcIikucmVtb3ZlQ2xhc3MoXCJuby1oZWFkZXJcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBJdGVtLlRZUEVTLlNPTEQ6XG4gICAgICBjYXNlIEl0ZW0uVFlQRVMuVU5TT0xEOlxuICAgICAgICAkKFwiI2l0ZW0tbGlzdC1zZWxsaW5nLWRvY2stZWRpdCwjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtZWRpdFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1kb2NrLWhlYWRlci1ib3hcIikuc2hvdygpO1xuICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctZnVsbC1saXN0XCIpLnJlbW92ZUNsYXNzKFwibm8taGVhZGVyXCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgSXRlbS5UWVBFUy5TRUxMSU5HX09GRkVSOlxuICAgICAgY2FzZSBJdGVtLlRZUEVTLlNDSEVEVUxFRDpcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWRvY2staGVhZGVyLWJveCwjcGFuZWwtc2VsbGluZy1mbG9hdC1oZWFkZXItYm94XCIpLmhpZGUoKTtcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWZ1bGwtbGlzdFwiKS5hZGRDbGFzcyhcIm5vLWhlYWRlclwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9LFxuXG4gIF9zaG93RWRpdE1vZGUgOiBmdW5jdGlvbihhU2hvdykge1xuICAgIGlmIChhU2hvdykge1xuICAgICAgdGhpcy5faXNJbkVkaXRNb2RlID0gdHJ1ZTtcbiAgICAgICQoXCIjaXRlbS1saXN0LXNlbGxpbmctZG9jay1lZGl0LWhlYWRlciwgI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWVkaXQtaGVhZGVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCIjaXRlbS1saXN0LXNlbGxpbmctZG9jay1jYW5jZWwtaGVhZGVyLCAjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtY2FuY2VsLWhlYWRlclwiKS5zaG93KCk7XG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctc2VsbC1idXR0b24sICNwYW5lbC1zZWxsaW5nLWRyYWZ0LWJ1dHRvblwiKS5oaWRlKCk7XG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctZGVsZXRlLWJ1dHRvblwiKS5zaG93KCk7XG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctZnVsbC1saXN0XCIpLmFkZENsYXNzKFwiZWRpdC1tb2RlXCIpO1xuICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWRlbGV0ZS1idXR0b25cIikuYXR0cihcImRpc2FibGVkXCIsIHRoaXMuZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzKCkubGVuZ3RoID09PSAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faXNJbkVkaXRNb2RlID0gZmFsc2U7XG4gICAgICB0aGlzLl9jYWNoZWRTZWxlY3RlZERlbGV0ZUl0ZW1zID0gW107XG4gICAgICAkKFwiI2l0ZW0tbGlzdC1zZWxsaW5nLWRvY2stZWRpdC1oZWFkZXIsICNpdGVtLWxpc3Qtc2VsbGluZy1mbG9hdC1lZGl0LWhlYWRlclwiKS5zaG93KCk7XG4gICAgICAkKFwiI2l0ZW0tbGlzdC1zZWxsaW5nLWRvY2stY2FuY2VsLWhlYWRlciwgI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWNhbmNlbC1oZWFkZXJcIikuaGlkZSgpO1xuICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWRlbGV0ZS1idXR0b25cIikuaGlkZSgpO1xuICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLXNlbGwtYnV0dG9uXCIpLnNob3coKTtcbiAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1mdWxsLWxpc3RcIikucmVtb3ZlQ2xhc3MoXCJlZGl0LW1vZGVcIik7XG4gICAgICB0aGlzLnVwZGF0ZURyYWZ0c0J1dHRvbigpO1xuICAgIH1cbiAgfSxcblxuICBfdXBkYXRlUmVmaW5lTGFiZWwgOiBmdW5jdGlvbihhVHlwZSkge1xuICAgIGlmIChhVHlwZSA9PSBJdGVtLlRZUEVTLlNPTEQpIHtcbiAgICAgIHZhciBmaWx0ZXIgPVxuICAgICAgICBNeUViYXlTZXJ2aWNlLmdldFJlZmluZShUcmFkaW5nQXBpLlNPTERfTElTVCkuZmlsdGVyO1xuICAgICAgc3dpdGNoIChmaWx0ZXIpIHtcbiAgICAgICAgY2FzZSBNeUViYXlTZXJ2aWNlLkZJTFRFUi5BV0FJVElOR19QQVlNRU5UOlxuICAgICAgICAgICQoXCIjaXRlbS1saXN0LXNlbGxpbmctZG9jay1maWx0ZXItdGV4dCwjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtZmlsdGVyLXRleHRcIikuXG4gICAgICAgICAgICB0ZXh0KCQuaTE4bi5nZXRTdHJpbmcoXCJyZWZpbmUuZmlsdGVyQnkubm90UGFpZFwiKSk7XG4gICAgICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWZpbHRlciwjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtZmlsdGVyXCIpLnNob3coKTtcbiAgICAgICAgICAkKFwiI2l0ZW0tbGlzdC1zZWxsaW5nLWRvY2stZWRpdCwjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtZWRpdFwiKS5zaG93KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTXlFYmF5U2VydmljZS5GSUxURVIuQVdBSVRJTkdfU0hJUE1FTlQ6XG4gICAgICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWZpbHRlci10ZXh0LCAjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtZmlsdGVyLXRleHRcIikuXG4gICAgICAgICAgICB0ZXh0KCQuaTE4bi5nZXRTdHJpbmcoXCJyZWZpbmUuZmlsdGVyQnkuYXdhaXRpbmdTaGlwbWVudFwiKSk7XG4gICAgICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWZpbHRlciwgI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWZpbHRlclwiKS5zaG93KCk7XG4gICAgICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWVkaXQsI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWVkaXRcIikuaGlkZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE15RWJheVNlcnZpY2UuRklMVEVSLlBBSURfQU5EX1NISVBQRUQ6XG4gICAgICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWZpbHRlci10ZXh0LCAjaXRlbS1saXN0LXNlbGxpbmctZmxvYXQtZmlsdGVyLXRleHRcIikuXG4gICAgICAgICAgICB0ZXh0KCQuaTE4bi5nZXRTdHJpbmcoXCJyZWZpbmUuZmlsdGVyQnkuc2hpcHBlZFwiKSk7XG4gICAgICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWZpbHRlciwgI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWZpbHRlclwiKS5zaG93KCk7XG4gICAgICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWVkaXQsI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWVkaXRcIikuc2hvdygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICQoXCIjaXRlbS1saXN0LXNlbGxpbmctZG9jay1maWx0ZXIsICNpdGVtLWxpc3Qtc2VsbGluZy1mbG9hdC1maWx0ZXJcIikuaGlkZSgpO1xuICAgICAgICAgICQoXCIjaXRlbS1saXN0LXNlbGxpbmctZG9jay1lZGl0LCNpdGVtLWxpc3Qtc2VsbGluZy1mbG9hdC1lZGl0XCIpLnNob3coKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgJChcIiNpdGVtLWxpc3Qtc2VsbGluZy1kb2NrLWZpbHRlciwgI2l0ZW0tbGlzdC1zZWxsaW5nLWZsb2F0LWZpbHRlclwiKS5oaWRlKCk7XG4gICAgfVxuICB9LFxuXG4gIGdldFNlbGVjdGVkRGVsZXRlQ2hlY2tib3hlcyA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKFwiI3BhbmVsLXNlbGxpbmctZnVsbC1saXN0XCIpLmZpbmQoXCIuaXRlbS1lZGl0LWNoZWNrYm94IGlucHV0W3R5cGU9J2NoZWNrYm94J106Y2hlY2tlZFwiKTtcbiAgfSxcblxuICBfZ2V0U2VsZWN0ZWREZWxldGVJdGVtcyA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxlY3RlZEVsZW1lbnRzID0gdGhpcy5nZXRTZWxlY3RlZERlbGV0ZUNoZWNrYm94ZXMoKTtcbiAgICB2YXIgaXRlbU9iamVjdHMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsZW1lbnQgPSAkKHNlbGVjdGVkRWxlbWVudHNbaV0pLnBhcmVudHMoXCIuaXRlbS1ib3gtY29udGFpbmVyXCIpLmdldCgwKTtcbiAgICAgIHZhciBpdGVtT2JqZWN0ID0gJChlbGVtZW50KS5kYXRhKFwiaXRlbU9iamVjdFwiKTtcbiAgICAgIHZhciBpdGVtSWQgPSBpdGVtT2JqZWN0LmdldChcIml0ZW1JZFwiKTtcbiAgICAgIHZhciBpdGVtVHlwZSA9IGl0ZW1PYmplY3QuZ2V0KFwidHlwZVwiKTtcbiAgICAgIHZhciB0cmFuc2FjdGlvbiA9IG51bGw7XG4gICAgICB2YXIgdHJhbnNhY3Rpb25JZCA9IDA7XG4gICAgICB2YXIgaXRlbSA9IHt9O1xuXG4gICAgICBpZiAoaXRlbU9iamVjdC5nZXQoXCJ0cmFuc2FjdGlvbnNcIikgJiZcbiAgICAgICAgICBpdGVtT2JqZWN0LmdldChcInRyYW5zYWN0aW9uc1wiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRyYW5zYWN0aW9uID0gaXRlbU9iamVjdC5nZXQoXCJ0cmFuc2FjdGlvbnNcIilbMF07XG4gICAgICAgIHRyYW5zYWN0aW9uSWQgPSB0cmFuc2FjdGlvbi5nZXQoXCJ0cmFuc2FjdGlvbklkXCIpO1xuICAgICAgfVxuXG4gICAgICBpdGVtLml0ZW1JZCA9IGl0ZW1JZDtcbiAgICAgIGl0ZW0uaXRlbVR5cGUgPSBpdGVtVHlwZTtcbiAgICAgIGl0ZW0udHJhbnNhY3Rpb25JZCA9IHRyYW5zYWN0aW9uSWQ7XG4gICAgICBpdGVtT2JqZWN0cy5wdXNoKGl0ZW0pO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtT2JqZWN0cztcbiAgfSxcblxuICBfY2FjaGVTZWxlY3RlZERlbGV0ZUl0ZW1zIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fY2FjaGVkU2VsZWN0ZWREZWxldGVJdGVtcyA9IHRoaXMuX2dldFNlbGVjdGVkRGVsZXRlSXRlbXMoKTtcbiAgfSxcblxuICBfYXBwbHlDYWNoZWRTZWxlY3RlZERlbGV0ZUl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5faXNJbkVkaXRNb2RlICYmIHRoaXMuX2NhY2hlZFNlbGVjdGVkRGVsZXRlSXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGVsZW1lbnRzID0gJChcIiNwYW5lbC1zZWxsaW5nLWZ1bGwtbGlzdFwiKS5maW5kKFwiLml0ZW0tZWRpdC1jaGVja2JveCBpbnB1dFt0eXBlPSdjaGVja2JveCddXCIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gJChlbGVtZW50c1tpXSk7XG4gICAgICAgIHZhciBjb250YWluZXIgPSBlbGVtZW50LnBhcmVudHMoXCIuaXRlbS1ib3gtY29udGFpbmVyXCIpLmdldCgwKTtcbiAgICAgICAgdmFyIGl0ZW1JZCA9ICQoY29udGFpbmVyKS5kYXRhKFwiaXRlbU9iamVjdFwiKS5nZXQoXCJpdGVtSWRcIik7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9ICh0aGlzLl9jYWNoZWRTZWxlY3RlZERlbGV0ZUl0ZW1zLmxlbmd0aCAtIDEpOyBqID49IDA7IGotLSkge1xuICAgICAgICAgIGlmICh0aGlzLl9jYWNoZWRTZWxlY3RlZERlbGV0ZUl0ZW1zW2pdLml0ZW1JZCA9PSBpdGVtSWQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZWRTZWxlY3RlZERlbGV0ZUl0ZW1zLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fY2FjaGVkU2VsZWN0ZWREZWxldGVJdGVtcyA9IFtdO1xuICAgIH1cbiAgfSxcblxuICBfaGlkZURlbGV0ZWRJdGVtcyA6IGZ1bmN0aW9uKGFJdGVtcykge1xuICAgIHRoaXMuX2RlbGV0ZWRJdGVtcyA9IGFJdGVtcztcbiAgICB2YXIgc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZEVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAkKHNlbGVjdGVkRWxlbWVudHNbaV0pLnBhcmVudHMoXCIuaXRlbS1ib3gtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgX2RlbGV0ZURlbGV0ZWRJdGVtcyA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxlY3RlZEVsZW1lbnRzID0gdGhpcy5nZXRTZWxlY3RlZERlbGV0ZUNoZWNrYm94ZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICQoc2VsZWN0ZWRFbGVtZW50c1tpXSkucGFyZW50cyhcIi5pdGVtLWJveC1jb250YWluZXJcIikucmVtb3ZlKCk7XG4gICAgfVxuICB9LFxuXG4gIHNob3dEZWxldGVkSXRlbXMgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZEVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWxlbWVudCA9ICQoc2VsZWN0ZWRFbGVtZW50c1tpXSk7XG4gICAgICB2YXIgY29udGFpbmVyID0gZWxlbWVudC5wYXJlbnRzKFwiLml0ZW0tYm94LWNvbnRhaW5lclwiKTtcbiAgICAgIHZhciBpdGVtSWQgPSBjb250YWluZXIuZGF0YShcIml0ZW1PYmplY3RcIikuZ2V0KFwiaXRlbUlkXCIpO1xuXG4gICAgICBmb3IgKHZhciBqID0gKHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGggLSAxKTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZWRJdGVtc1tqXS5pdGVtSWQgPT0gaXRlbUlkKSB7XG4gICAgICAgICAgZWxlbWVudC5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgY29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICB0aGlzLl9kZWxldGVkSXRlbXMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2RlbGV0ZWRJdGVtcyA9IFtdO1xuICB9LFxuXG4gIGRlbGV0ZUl0ZW1zIDogZnVuY3Rpb24oYUNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGggPiAwICYmIHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpIHtcbiAgICAgIHZhciBhY3RpdmVBY2NvdW50ID0gQWNjb3VudC5nZXRBY2NvdW50KCk7XG5cbiAgICAgIGlmIChhY3RpdmVBY2NvdW50KSB7XG4gICAgICAgIHZhciB0b2tlbiA9IGFjdGl2ZUFjY291bnQuZ2V0KFwidG9rZW5cIik7XG5cbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgIHZhciBzaXRlSWQgPSBTaXRlLnNpdGVJZEZvclNpdGUoXG4gICAgICAgICAgICBTaXRlLmdldEhvbWVTaXRlKCkpO1xuICAgICAgICAgIHZhciBmdWxsTGlzdFR5cGUgPSB0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlO1xuICAgICAgICAgIHZhciBkZWxldGVJdGVtSWRzID0gW107XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZXRlSXRlbUlkcy5wdXNoKHRoaXMuX2RlbGV0ZWRJdGVtc1tpXS5pdGVtSWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBsb2NhbENhbGxiYWNrID0gZnVuY3Rpb24oYVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKCFhUmVzdWx0LmVycm9ycykge1xuICAgICAgICAgICAgICB2YXIgbGlzdE5hbWU7XG5cbiAgICAgICAgICAgICAgc3dpdGNoIChmdWxsTGlzdFR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIEl0ZW0uVFlQRVMuU09MRDpcbiAgICAgICAgICAgICAgICAgIE15RWJheVNlcnZpY2UucmVtb3ZlSXRlbXNGcm9tTGlzdChcbiAgICAgICAgICAgICAgICAgICAgVHJhZGluZ0FwaS5TT0xEX0xJU1QsIGRlbGV0ZUl0ZW1JZHMpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBJdGVtLlRZUEVTLlVOU09MRDpcbiAgICAgICAgICAgICAgICAgIE15RWJheVNlcnZpY2UucmVtb3ZlSXRlbXNGcm9tTGlzdChcbiAgICAgICAgICAgICAgICAgICAgVHJhZGluZ0FwaS5VTlNPTERfTElTVCwgZGVsZXRlSXRlbUlkcyk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoYXQuX2RlbGV0ZURlbGV0ZWRJdGVtcygpO1xuICAgICAgICAgICAgICB0aGF0Ll9kZWxldGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBiYXNpYyBsaXN0IHZpZXdcbiAgICAgICAgICAgICAgbGlzdE5hbWUgPSB0aGF0Ll9JVEVNX1RZUEVfUFJPUEVSVElFU1tmdWxsTGlzdFR5cGVdLmxpc3ROYW1lO1xuICAgICAgICAgICAgICB0aGF0Ll9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgICAgICAgICAgTXlFYmF5U2VydmljZS5nZXRMaXN0KGxpc3ROYW1lKSxcbiAgICAgICAgICAgICAgICB0aGF0Ll9JVEVNX1RZUEVfUFJPUEVSVElFU1tmdWxsTGlzdFR5cGVdLmJhc2ljTGlzdElkLFxuICAgICAgICAgICAgICAgIHsgdG90YWxDb3VudDogTXlFYmF5U2VydmljZS5nZXRTdW1tYXJ5KGxpc3ROYW1lKS5jb3VudCB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoYXQuc2hvd0RlbGV0ZWRJdGVtcygpO1xuICAgICAgICAgICAgICBNZXNzYWdlUGFuZWxTZXJ2aWNlLmFkZE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgTWVzc2FnZVBhbmVsU2VydmljZS5UWVBFLkNPTk5FQ1RfRVJST1IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzd2l0Y2ggKGZ1bGxMaXN0VHlwZSkge1xuICAgICAgICAgICAgY2FzZSBJdGVtLlRZUEVTLlNPTEQ6XG4gICAgICAgICAgICAgIE15RWJheUFwcGxpY2F0aW9uQXBpLnJlbW92ZUZyb21Tb2xkTGlzdChcbiAgICAgICAgICAgICAgICB0b2tlbiwgdGhpcy5fZGVsZXRlZEl0ZW1zLCBzaXRlSWQsIChhQ2FsbGJhY2sgPyBhQ2FsbGJhY2sgOiBsb2NhbENhbGxiYWNrKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBJdGVtLlRZUEVTLlVOU09MRDpcbiAgICAgICAgICAgICAgTXlFYmF5QXBwbGljYXRpb25BcGkucmVtb3ZlRnJvbVVuc29sZExpc3QoXG4gICAgICAgICAgICAgICAgdG9rZW4sIHRoaXMuX2RlbGV0ZWRJdGVtcywgc2l0ZUlkLCAoYUNhbGxiYWNrID8gYUNhbGxiYWNrIDogbG9jYWxDYWxsYmFjaykpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX3N0YXJ0RGF0YVVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2RhdGFVcGRhdGVJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVUaW1lTGVmdCgpO1xuICAgICAgdGhpcy5fc3RhcnREYXRhVXBkYXRlKCk7XG4gICAgfS5iaW5kKHRoaXMpLCAxMDAwKTtcbiAgfSxcblxuICBfc3RvcERhdGFVcGRhdGUgOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fZGF0YVVwZGF0ZUlkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fZGF0YVVwZGF0ZUlkKTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhVXBkYXRlSWQ7XG4gICAgfVxuICB9LFxuXG4gIF91cGRhdGVUaW1lTGVmdCA6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlKSB7XG4gICAgICBpZiAodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSA9PSBJdGVtLlRZUEVTLlNFTExJTkcgfHxcbiAgICAgICAgICB0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlID09IEl0ZW0uVFlQRVMuU0VMTElOR19PRkZFUikge1xuICAgICAgICAkKFwiI3BhbmVsLXNlbGxpbmctZnVsbC1saXN0XCIpLmNoaWxkcmVuKFwiYVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIEl0ZW1Cb3gudXBkYXRlVGltZUxlZnQoJCh0aGlzKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkKFwiI3BhbmVsLXNlbGxpbmctYWN0aXZlLWxpc3QsI3BhbmVsLXNlbGxpbmctb2ZmZXItbGlzdFwiKS5jaGlsZHJlbihcImFcIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgSXRlbUJveC51cGRhdGVUaW1lTGVmdCgkKHRoaXMpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGVEcmFmdHNCdXR0b24gOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZHJhZnRzTnVtID0gTGlzdGluZ0RyYWZ0U2VydmljZS5zYXZlZERyYWZ0cztcbiAgICBpZiAoZHJhZnRzTnVtID4gMCkge1xuICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWRyYWZ0LWNvdW50XCIpLnRleHQoZHJhZnRzTnVtKTtcbiAgICAgIGlmICghJChcIiNwYW5lbC1zZWxsaW5nLWJ1dHRvbnMtY29udGFpbmVyXCIpLmhhc0NsYXNzKFwic2hvdy1kcmFmdHNcIikpIHtcbiAgICAgICAgJChcIiNwYW5lbC1zZWxsaW5nLWJ1dHRvbnMtY29udGFpbmVyXCIpLmFkZENsYXNzKFwic2hvdy1kcmFmdHNcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1idXR0b25zLWNvbnRhaW5lclwiKS5yZW1vdmVDbGFzcyhcInNob3ctZHJhZnRzXCIpO1xuICAgIH1cbiAgfSxcblxuICBhcGlIYXNJdGVtcyA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcGlIYXNJdGVtcyA9IGZhbHNlO1xuICAgIHZhciBzZWxsaW5nT2ZmZXJMaXN0ID1cbiAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLlNFTExJTkdfT0ZGRVJfTElTVCk7XG4gICAgdmFyIGFjdGl2ZUxpc3QgPVxuICAgICAgTXlFYmF5U2VydmljZS5nZXRMaXN0KFRyYWRpbmdBcGkuQUNUSVZFX0xJU1QpO1xuICAgIHZhciBzb2xkTGlzdCA9XG4gICAgICBNeUViYXlTZXJ2aWNlLmdldExpc3QoVHJhZGluZ0FwaS5TT0xEX0xJU1QpO1xuICAgIHZhciB1bnNvbGRMaXN0ID1cbiAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLlVOU09MRF9MSVNUKTtcbiAgICB2YXIgc2NoZWR1bGVkTGlzdCA9XG4gICAgICBNeUViYXlTZXJ2aWNlLmdldExpc3QoVHJhZGluZ0FwaS5TQ0hFRFVMRURfTElTVCk7XG5cbiAgICBpZiAoc2VsbGluZ09mZmVyTGlzdCA+IDAgfHwgYWN0aXZlTGlzdC5sZW5ndGggPiAwIHx8IHNvbGRMaXN0Lmxlbmd0aCA+IDAgfHxcbiAgICAgICAgdW5zb2xkTGlzdC5sZW5ndGggPiAwIHx8IHNjaGVkdWxlZExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgYXBpSGFzSXRlbXMgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBhcGlIYXNJdGVtcztcbiAgfSxcblxuICBvYnNlcnZlIDogZnVuY3Rpb24oYVRvcGljLCBhRGF0YSkge1xuICAgIHN3aXRjaCAoYVRvcGljKSB7XG4gICAgICBjYXNlIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTjpcbiAgICAgICAgdGhpcy5fc3RhcnREYXRhVXBkYXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUOlxuICAgICAgICB0aGlzLl9zdG9wRGF0YVVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLlNBVkVEX0xJU1RJTkdfRFJBRlRTX1VQREFURUQ6XG4gICAgICAgIHRoaXMudXBkYXRlRHJhZnRzQnV0dG9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb3BpY3MuTVlfU0VMTElOR19VUERBVEVEOlxuICAgICAgICB0aGlzLl9pc0xvYWRpbmdNb3JlRm9yRnVsbExpc3QgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcG9wdWxhdGVEYXRhKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb3BpY3MuTVlfU0VMTElOR19MSVNUX1VQREFURUQ6XG4gICAgICAgIHRoaXMuX2lzTG9hZGluZ01vcmVGb3JGdWxsTGlzdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9wb3B1bGF0ZURhdGEodHJ1ZSwgYURhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLk1ZX1NFTExJTkdfVVBEQVRJTkc6XG4gICAgICAgIGlmICghdGhpcy5faXNMb2FkaW5nTW9yZUZvckZ1bGxMaXN0KSB7XG4gICAgICAgICAgU2lkZWJhci5zaG93TG9hZGluZyhcInNlbGxpbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRvcGljcy5TRUxMSU5HX1NVTU1BUllfSU5GT19VUERBVEVEOlxuICAgICAgICBpZiAoYURhdGEgPT0gTXlFYmF5U2VydmljZS5GSUxURVIuQVdBSVRJTkdfU0hJUE1FTlQpIHtcbiAgICAgICAgICB0aGlzLl9zZXRTdW1tYXJ5SW5mbygpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb3BpY3MuU0VMTElOR19PRkZFUl9MSVNUX1VQREFURUQ6XG4gICAgICAgIHRoaXMuX2lzTG9hZGluZ01vcmVGb3JGdWxsTGlzdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9zZXRTdW1tYXJ5SW5mbygpO1xuICAgICAgICB0aGlzLl9wb3B1bGF0ZURhdGEoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG4kKHdpbmRvdykudW5sb2FkKGZ1bmN0aW9uKCkgeyBQYW5lbFNlbGxpbmcudW5pbml0KCk7IH0pO1xuIl19