/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var PanelBuying = {
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
        ObserverHelper.addObserver(this, Topics.MY_BUYING_UPDATED);
        ObserverHelper.addObserver(this, Topics.MY_BUYING_LIST_UPDATED);
        ObserverHelper.addObserver(this, Topics.MY_BUYING_UPDATING);
        this._addEventListeners();
        if (Account.getAccount()) {
            this._populateData();
            this._startDataUpdate();
        }
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.BIDDING] = {
            label: "list.bid",
            listName: TradingApi.BID_LIST,
            basicListId: "panel-buying-bid"
        };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.WON] = {
            label: "list.won",
            listName: TradingApi.WON_LIST,
            basicListId: "panel-buying-won"
        };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.LOST] = {
            label: "list.lost",
            listName: TradingApi.LOST_LIST,
            basicListId: "panel-buying-lost"
        };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.BEST_OFFER] = {
            label: "list.offers",
            listName: TradingApi.BEST_OFFER_LIST,
            basicListId: "panel-buying-offer"
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
                case Item.TYPES.WON:
                    MyEbayService.removeItemsFromList(TradingApi.WON_LIST, deleteItemIds);
                    break;
                case Item.TYPES.LOST:
                    MyEbayService.removeItemsFromList(TradingApi.LOST_LIST, deleteItemIds);
                    break;
            }
        }
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_OUT);
        ObserverHelper.removeObserver(this, Topics.MY_BUYING_UPDATED);
        ObserverHelper.removeObserver(this, Topics.MY_BUYING_LIST_UPDATED);
        ObserverHelper.removeObserver(this, Topics.MY_BUYING_UPDATING);
    },
    _addEventListeners: function () {
        $("#panel-buying-empty-button").click(function (aEvent) {
            EventAnalytics.push({
                key: "SignedInExit",
                action: "ClickEmptyPanel",
                label: "BuyingEmpty"
            });
            RoverUrlHelper.loadPage("homePage", "emptyListText", null, aEvent);
        }.bind(this));
        $("#item-list-buying-dock-edit, #item-list-buying-float-edit").click(function () {
            this._showEditMode(true);
        }.bind(this));
        $("#item-list-buying-dock-cancel, #item-list-buying-float-cancel").click(function () {
            this._showEditMode(false);
        }.bind(this));
        $("#panel-buying-delete-button").click(function (aEvent) {
            var items = this._getSelectedDeleteItems();
            if (items.length > 0 && this._currentFullListType) {
                this._hideDeletedItems(items);
                this._showEditMode(false);
                if (this._currentFullListType) {
                    MessagePanel.addMessage(MessagePanelService.TYPE.ITEMS_DELETED, { itemType: this._currentFullListType, itemNum: items.length });
                }
            }
        }.bind(this));
        $("#panel-buying-delete-button").mousedown(function (aEvent) {
            aEvent.preventDefault();
        });
        $("#item-list-buying-dock-refine, #item-list-buying-float-refine").click(function () {
            var eventLabel = Sidebar.getGAListTypeTrackingName(this._currentFullListType);
            EventAnalytics.push({
                key: "SignedInInternal",
                action: "ClickRefine",
                label: eventLabel
            });
            RefineContainer.show(this._currentFullListType);
        }.bind(this));
        $(".item-list-box-dock-header-box *, .item-list-box-float-header-box *").click(function (aEvent) {
            if (aEvent) {
                aEvent.preventDefault();
            }
        }.bind(this));
    },
    _populateData: function (aIsList, aListName) {
        if (aIsList && this._currentFullListType) {
            this._setFullList(this._currentFullListType, false);
        }
        else {
            this._setPanel();
        }
        Sidebar.showLoading("buying");
    },
    _setPanel: function () {
        if (this.apiHasItems()) {
            this._createItemBoxes(MyEbayService.getList(TradingApi.BID_LIST), "panel-buying-bid", { totalCount: MyEbayService.getSummary(TradingApi.BID_LIST).count });
            this._createItemBoxes(MyEbayService.getList(TradingApi.WON_LIST), "panel-buying-won", { totalCount: MyEbayService.getSummary(TradingApi.WON_LIST).count });
            this._createItemBoxes(MyEbayService.getList(TradingApi.LOST_LIST), "panel-buying-lost", { totalCount: MyEbayService.getSummary(TradingApi.LOST_LIST).count });
            this._createItemBoxes(MyEbayService.getList(TradingApi.BEST_OFFER_LIST), "panel-buying-offer", { totalCount: MyEbayService.getSummary(TradingApi.BEST_OFFER_LIST).count });
            this._setCurrencyNote();
            $("#panel-buying-empty").css("display", "none");
            $("#panel-buying-main").css("display", "block");
            $("[title^=i18n]").i18n({ attributeNames: ["title"] });
            Sidebar.updateTooltips();
        }
        else {
            if (MyEbayService.isUpdatingBuyingData) {
                $("#panel-buying-main").css("display", "none");
                $("#panel-buying-empty").css("display", "none");
            }
            else {
                $("#panel-buying-main").css("display", "none");
                $("#panel-buying-empty").css("display", "block");
            }
        }
    },
    _createItemBoxes: function (aItems, aId, aExtraInfo) {
        var container = $("#" + aId);
        var content = $("#" + aId + "-list");
        var listLength = aItems.length;
        var shouldShowViewAll = false;
        if (listLength > 0) {
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
            container.hide();
            content.empty();
        }
        Sidebar.adjustTabIndex();
        Sidebar.removeTabIndex();
    },
    _setCurrencyNote: function () {
        var note = $("#panel-buying-converted-currency-note");
        if ($("#panel-buying-main-basic").find(".item-price-inner-container.converted").length > 0) {
            note.show();
        }
        else {
            note.hide();
        }
    },
    _setFullListCurrencyNote: function () {
        var note = $("#panel-buying-full-converted-currency-note");
        if ($("#panel-buying-full-list").find(".item-price-inner-container.converted").length > 0) {
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
            TabContainer.setFullListViewTitle($.i18n.getString(this._ITEM_TYPE_PROPERTIES[aDataObj.type].label));
            $("#panel-buying-main-basic").hide();
            $("#panel-buying-main-full-list").show();
            $("#panel-buying-lazy-loading").show();
        }
        else {
            if (this._currentFullListType) {
                MessagePanel.onTabChange();
            }
            this._currentFullListType = null;
            $("#panel-buying-main-full-list").hide();
            $("#panel-buying-main-basic").show();
            this._showEditMode(false);
        }
        TabContainer.switchFullListView(aShow);
    },
    _setFullList: function (aType, aShouldFetch, aLoadMore) {
        var id = "panel-buying-full";
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
            this._setFullListCurrencyNote();
            this._createItemBoxes(list, this._ITEM_TYPE_PROPERTIES[aType].basicListId, { totalCount: MyEbayService.getSummary(listName).count });
            listName = null;
        }
        if (listName) {
            if (pageNumber > 1) {
                if (!MyEbayService.ignoreRequest[Topics.MY_BUYING_LIST_UPDATED]) {
                    Sidebar.setElementDisplayed("#panel-buying-lazy-loading", true);
                    Sidebar.scrollToBottom("panels");
                }
            }
            this._isLoadingMoreForFullList = true;
            MyEbayService.loadBuyingListData({
                name: listName,
                entriesPerPage: MyEbayService.LIST_ITEM_BATCH_SIZE,
                pageNumber: pageNumber
            });
        }
        else {
            Sidebar.setElementDisplayed("#panel-buying-lazy-loading", false);
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
            case Item.TYPES.WON:
                $("#item-list-buying-dock-refine,#item-list-buying-float-refine").hide();
                $("#item-list-buying-dock-edit,#item-list-buying-float-edit").show();
                $("#panel-buying-dock-header-box").show();
                $("#panel-buying-full-list").removeClass("no-header");
                break;
            case Item.TYPES.LOST:
                $("#item-list-buying-dock-refine,#item-list-buying-float-refine").show();
                $("#item-list-buying-dock-edit,#item-list-buying-float-edit").show();
                $("#panel-buying-dock-header-box").show();
                $("#panel-buying-full-list").removeClass("no-header");
                break;
            case Item.TYPES.BEST_OFFER:
                $("#item-list-buying-dock-refine,#item-list-buying-float-refine").show();
                $("#item-list-buying-dock-edit,#item-list-buying-float-edit").hide();
                $("#panel-buying-dock-header-box").show();
                $("#panel-buying-full-list").removeClass("no-header");
                break;
            case Item.TYPES.BIDDING:
                $("#panel-buying-dock-header-box").hide();
                $("#panel-buying-full-list").addClass("no-header");
                break;
        }
    },
    _showEditMode: function (aShow) {
        if (aShow) {
            this._isInEditMode = true;
            $("#item-list-buying-dock-edit-header, #item-list-buying-float-edit-header").hide();
            $("#item-list-buying-dock-cancel-header, #item-list-buying-float-cancel-header").show();
            $("#panel-buying-buttons-container").show();
            $("#panels").addClass("show-buttons-container");
            $("#panel-buying-full-list").addClass("edit-mode");
            $("#panel-buying-delete-button").attr("disabled", this.getSelectedDeleteCheckboxes().length === 0);
        }
        else {
            this._isInEditMode = false;
            this._cachedSelectedDeleteItems = [];
            $("#item-list-buying-dock-edit-header, #item-list-buying-float-edit-header").show();
            $("#item-list-buying-dock-cancel-header, #item-list-buying-float-cancel-header").hide();
            $("#panel-buying-buttons-container").hide();
            $("#panels").removeClass("show-buttons-container");
            $("#panel-buying-full-list").removeClass("edit-mode");
        }
    },
    getSelectedDeleteCheckboxes: function () {
        return $("#panel-buying-full-list").find(".item-edit-checkbox input[type='checkbox']:checked");
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
            var elements = $("#panel-buying-full-list").find(".item-edit-checkbox input[type='checkbox']");
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
                                case Item.TYPES.WON:
                                    MyEbayService.removeItemsFromList(TradingApi.WON_LIST, deleteItemIds);
                                    break;
                                case Item.TYPES.LOST:
                                    MyEbayService.removeItemsFromList(TradingApi.LOST_LIST, deleteItemIds);
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
                        case Item.TYPES.WON:
                            MyEbayApplicationApi.removeFromWonList(token, this._deletedItems, siteId, (aCallback ? aCallback : localCallback));
                            break;
                        case Item.TYPES.LOST:
                            MyEbayApplicationApi.removeFromDidntWinList(token, this._deletedItems, siteId, (aCallback ? aCallback : localCallback));
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
            if (this._currentFullListType == Item.TYPES.BIDDING ||
                this._currentFullListType == Item.TYPES.BEST_OFFER) {
                $("#panel-buying-full-list").children("a").each(function () {
                    ItemBox.updateTimeLeft($(this));
                });
            }
        }
        else {
            $("#panel-buying-bid-list,#panel-buying-offer-list").children("a").each(function () {
                ItemBox.updateTimeLeft($(this));
            });
        }
    },
    apiHasItems: function () {
        var apiHasItems = false;
        var bidList = MyEbayService.getList(TradingApi.BID_LIST);
        var wonList = MyEbayService.getList(TradingApi.WON_LIST);
        var lostList = MyEbayService.getList(TradingApi.LOST_LIST);
        var offerList = MyEbayService.getList(TradingApi.BEST_OFFER_LIST);
        if (bidList.length > 0 || wonList.length > 0 || lostList.length > 0 || offerList.length > 0) {
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
            case Topics.MY_BUYING_UPDATED:
                this._isLoadingMoreForFullList = false;
                this._populateData();
                break;
            case Topics.MY_BUYING_LIST_UPDATED:
                this._isLoadingMoreForFullList = false;
                this._populateData(true, aData);
                break;
            case Topics.MY_BUYING_UPDATING:
                if (!this._isLoadingMoreForFullList) {
                    Sidebar.showLoading("buying");
                }
                break;
        }
    }
};
$(window).unload(function () { PanelBuying.uninit(); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWxCdXlpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi91aS92aWV3L2NvcmUvcGFuZWxCdXlpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxJQUFJLFdBQVcsR0FBRztJQUNoQixzQkFBc0IsRUFBRyxDQUFDO0lBQzFCLHFCQUFxQixFQUFHLEVBQUU7SUFDMUIsYUFBYSxFQUFHLElBQUk7SUFDcEIsb0JBQW9CLEVBQUcsSUFBSTtJQUMzQix5QkFBeUIsRUFBRyxLQUFLO0lBQ2pDLGFBQWEsRUFBRSxFQUFFO0lBQ2pCLDBCQUEwQixFQUFHLEVBQUU7SUFDL0IsYUFBYSxFQUFHLEtBQUs7SUFFckIsSUFBSSxFQUFFO1FBQ0osQ0FBQyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsY0FBYyxFQUFFLENBQUUsT0FBTyxFQUFFLEtBQUssQ0FBRSxFQUFFLENBQUMsQ0FBQztRQUN4RixPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFekIsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDM0QsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDNUQsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDM0QsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDaEUsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFNUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHO1lBQy9DLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtZQUM3QixXQUFXLEVBQUUsa0JBQWtCO1NBQ2hDLENBQUM7UUFDRixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRztZQUMzQyxLQUFLLEVBQUUsVUFBVTtZQUNqQixRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsV0FBVyxFQUFFLGtCQUFrQjtTQUNoQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDNUMsS0FBSyxFQUFFLFdBQVc7WUFDbEIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxTQUFTO1lBQzlCLFdBQVcsRUFBRSxtQkFBbUI7U0FDakMsQ0FBQztRQUNGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHO1lBQ2xELEtBQUssRUFBRSxhQUFhO1lBQ3BCLFFBQVEsRUFBRSxVQUFVLENBQUMsZUFBZTtZQUNwQyxXQUFXLEVBQUUsb0JBQW9CO1NBQ2xDLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxFQUFHO1FBQ1AsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFZLENBQUMsQ0FBQyxDQUFDO1lBRWhDLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN2QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ25ELGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDbEMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUc7b0JBQ2pCLGFBQWEsQ0FBQyxtQkFBbUIsQ0FDL0IsVUFBVSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDdEMsS0FBSyxDQUFDO2dCQUNSLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO29CQUNsQixhQUFhLENBQUMsbUJBQW1CLENBQy9CLFVBQVUsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQ3ZDLEtBQUssQ0FBQztZQUNWLENBQUM7UUFDSCxDQUFDO1FBRUQsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDOUQsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDL0QsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDOUQsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDbkUsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELGtCQUFrQixFQUFHO1FBQ25CLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFTLE1BQU07WUFDbkQsY0FBYyxDQUFDLElBQUksQ0FBQztnQkFDbEIsR0FBRyxFQUFFLGNBQWM7Z0JBQ25CLE1BQU0sRUFBRSxpQkFBaUI7Z0JBQ3pCLEtBQUssRUFBRSxhQUFhO2FBQ3JCLENBQUMsQ0FBQztZQUNILGNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWQsQ0FBQyxDQUFDLDJEQUEyRCxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ25FLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLCtEQUErRCxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWQsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVMsTUFBTTtZQUNwRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMzQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRTFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLFlBQVksQ0FBQyxVQUFVLENBQ3JCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQ3RDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ3BFLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVMsTUFBTTtZQUV4RCxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxDQUFDLENBQUMsK0RBQStELENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDdkUsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzlFLGNBQWMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xCLEdBQUcsRUFBRSxrQkFBa0I7Z0JBQ3ZCLE1BQU0sRUFBRSxhQUFhO2dCQUNyQixLQUFLLEVBQUUsVUFBVTthQUNsQixDQUFDLENBQUM7WUFDSCxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVkLENBQUMsQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFTLE1BQU07WUFDNUYsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFFWCxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDMUIsQ0FBQztRQUNILENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRUQsYUFBYSxFQUFHLFVBQVMsT0FBTyxFQUFFLFNBQVM7UUFDekMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ25CLENBQUM7UUFDRCxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxTQUFTLEVBQUc7UUFDVixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQzFDLGtCQUFrQixFQUNsQixFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsVUFBVSxDQUNsQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsZ0JBQWdCLENBQ25CLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUMxQyxrQkFBa0IsRUFDbEIsRUFBRSxVQUFVLEVBQUUsYUFBYSxDQUFDLFVBQVUsQ0FDbEMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFDM0MsbUJBQW1CLEVBQ25CLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxVQUFVLENBQ2xDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQ2pELG9CQUFvQixFQUNwQixFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsVUFBVSxDQUNsQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUd4QixDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFaEQsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLGNBQWMsRUFBRSxDQUFFLE9BQU8sQ0FBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDdkMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0MsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0MsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNuRCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxnQkFBZ0IsRUFBRyxVQUFTLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVTtRQUNqRCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDL0IsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFFOUIsRUFBRSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWhCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZO2dCQUN0QyxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7Z0JBQ3pDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUMzQixDQUFDO1lBQ0QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDcEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDdEIsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELENBQUM7WUFDRCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBQ0QsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsZ0JBQWdCLEVBQUc7UUFDakIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDdEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFRCx3QkFBd0IsRUFBRztRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUMzRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUdELFlBQVksRUFBRyxVQUFTLEtBQUssRUFBRSxRQUFRO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztZQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzdDLFlBQVksQ0FBQyxvQkFBb0IsQ0FDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXpDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QixDQUFDO1lBQ0QsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztZQUNqQyxDQUFDLENBQUMsOEJBQThCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFDRCxZQUFZLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUtELFlBQVksRUFBRyxVQUFTLEtBQUssRUFBRSxZQUFZLEVBQUUsU0FBUztRQUNwRCxJQUFJLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQztRQUM3QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUMxRCxJQUFJLElBQUksQ0FBQztRQU1ULEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDakIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDZCxVQUFVLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNuQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ2xDLENBQUM7UUFDSCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBRWhDLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsSUFBSSxFQUNKLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQzdDLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM1RCxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLENBQUM7UUFHRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2IsRUFBRSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLEVBQUUsQ0FBQSxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDaEUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkMsQ0FBQztZQUNILENBQUM7WUFDRCxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQztnQkFDL0IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsY0FBYyxFQUFFLGFBQWEsQ0FBQyxvQkFBb0I7Z0JBQ2xELFVBQVUsRUFBRSxVQUFVO2FBQ3ZCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRSxDQUFDO0lBQ0gsQ0FBQztJQUVELGtCQUFrQixFQUFHO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDO1FBQ1QsQ0FBQztRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsWUFBWSxFQUFHLFVBQVMsS0FBSztRQUMzQixNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2QsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUc7Z0JBQ2pCLENBQUMsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6RSxDQUFDLENBQUMsMERBQTBELENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckUsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDO1lBQ1IsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7Z0JBQ2xCLENBQUMsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6RSxDQUFDLENBQUMsMERBQTBELENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckUsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDO1lBQ1IsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ3hCLENBQUMsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6RSxDQUFDLENBQUMsMERBQTBELENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckUsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDO1lBQ1IsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87Z0JBQ3JCLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMxQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25ELEtBQUssQ0FBQztRQUNWLENBQUM7SUFDSCxDQUFDO0lBRUQsYUFBYSxFQUFHLFVBQVMsS0FBSztRQUM1QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1YsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsQ0FBQyxDQUFDLHlFQUF5RSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEYsQ0FBQyxDQUFDLDZFQUE2RSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEYsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFDO1lBQ3JDLENBQUMsQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BGLENBQUMsQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEQsQ0FBQztJQUNILENBQUM7SUFFRCwyQkFBMkIsRUFBRztRQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVELHVCQUF1QixFQUFHO1FBQ3hCLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDMUQsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBRXJCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDL0MsSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QyxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRWQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7Z0JBQzlCLFVBQVUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLFdBQVcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxhQUFhLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7WUFDbkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBRUQseUJBQXlCLEVBQUc7UUFDMUIsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ25FLENBQUM7SUFFRCwrQkFBK0IsRUFBRTtRQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztZQUUvRixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFM0QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdkUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzdDLEtBQUssQ0FBQztvQkFDUixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxDQUFDLDBCQUEwQixHQUFHLEVBQUUsQ0FBQztRQUN2QyxDQUFDO0lBQ0gsQ0FBQztJQUVELGlCQUFpQixFQUFHLFVBQVMsTUFBTTtRQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztRQUU1QixJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBQzFELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0QsQ0FBQztJQUNILENBQUM7SUFFRCxtQkFBbUIsRUFBRztRQUNwQixJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBQzFELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDakUsQ0FBQztJQUNILENBQUM7SUFFRCxnQkFBZ0IsRUFBRztRQUNqQixJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBQzFELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3ZELElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDL0IsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLEtBQUssQ0FBQztnQkFDUixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsV0FBVyxFQUFHLFVBQVMsU0FBUztRQUM5QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUMvRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFekMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDbEIsSUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFdkMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDVixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ2hCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQzdCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUN0QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7b0JBQzdDLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztvQkFFdkIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUNuRCxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ25ELENBQUM7b0JBRUQsSUFBSSxhQUFhLEdBQUcsVUFBUyxPQUFPO3dCQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDOzRCQUNwQixJQUFJLFFBQVEsQ0FBQzs0QkFFYixNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dDQUNyQixLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRztvQ0FDakIsYUFBYSxDQUFDLG1CQUFtQixDQUMvQixVQUFVLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29DQUN0QyxLQUFLLENBQUM7Z0NBQ1IsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7b0NBQ2xCLGFBQWEsQ0FBQyxtQkFBbUIsQ0FDL0IsVUFBVSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztvQ0FDdkMsS0FBSyxDQUFDOzRCQUNWLENBQUM7NEJBRUQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7NEJBQzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDOzRCQUV4QixRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQzs0QkFDN0QsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUNwRCxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7d0JBQzlELENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ04sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7NEJBQ3hCLG1CQUFtQixDQUFDLFVBQVUsQ0FDNUIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUM1QyxDQUFDO29CQUNILENBQUMsQ0FBQztvQkFFRixNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO3dCQUNyQixLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRzs0QkFDakIsb0JBQW9CLENBQUMsaUJBQWlCLENBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsR0FBRyxTQUFTLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQzs0QkFDOUUsS0FBSyxDQUFDO3dCQUNSLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJOzRCQUNsQixvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FDekMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUM5RSxLQUFLLENBQUM7b0JBQ1YsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCLEVBQUc7UUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELGVBQWUsRUFBRztRQUNoQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN2QixZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQUVELGVBQWUsRUFBRztRQUNoQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87Z0JBQy9DLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQzlDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLENBQUMsQ0FBQyxpREFBaUQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RFLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVcsRUFBRztRQUNaLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLE9BQU8sR0FDVCxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxJQUFJLE9BQU8sR0FDVCxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxJQUFJLFFBQVEsR0FDVixhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxJQUFJLFNBQVMsR0FDWCxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUVwRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUYsV0FBVyxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDO1FBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBRUQsT0FBTyxFQUFHLFVBQVMsTUFBTSxFQUFFLEtBQUs7UUFDOUIsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLGlCQUFpQjtnQkFDM0IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3hCLEtBQUssQ0FBQztZQUNSLEtBQUssTUFBTSxDQUFDLGtCQUFrQjtnQkFDNUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUM7WUFDUixLQUFLLE1BQU0sQ0FBQyxpQkFBaUI7Z0JBQzNCLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDckIsS0FBSyxDQUFDO1lBQ1IsS0FBSyxNQUFNLENBQUMsc0JBQXNCO2dCQUNoQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsS0FBSyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDaEMsS0FBSyxDQUFDO1lBQ1IsS0FBSyxNQUFNLENBQUMsa0JBQWtCO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7Z0JBQ0QsS0FBSyxDQUFDO1FBQ1YsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDO0FBRUYsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFhLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDctMjAxNSBlQmF5IEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqL1xuXG52YXIgUGFuZWxCdXlpbmcgPSB7XG4gIF9CQVNJQ19MSVNUX0lURU1fQ09VTlQgOiA1LFxuICBfSVRFTV9UWVBFX1BST1BFUlRJRVMgOiB7fSxcbiAgX2RhdGFVcGRhdGVJZCA6IG51bGwsXG4gIF9jdXJyZW50RnVsbExpc3RUeXBlIDogbnVsbCxcbiAgX2lzTG9hZGluZ01vcmVGb3JGdWxsTGlzdCA6IGZhbHNlLFxuICBfZGVsZXRlZEl0ZW1zOiBbXSxcbiAgX2NhY2hlZFNlbGVjdGVkRGVsZXRlSXRlbXMgOiBbXSxcbiAgX2lzSW5FZGl0TW9kZSA6IGZhbHNlLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICQoXCJbcmVsXj1pMThuXSxbdGl0bGVePWkxOG5dLFthbHRePWkxOG5dXCIpLmkxOG4oeyBhdHRyaWJ1dGVOYW1lczogWyBcInRpdGxlXCIsIFwiYWx0XCIgXSB9KTtcbiAgICBTaWRlYmFyLnVwZGF0ZVRvb2x0aXBzKCk7XG5cbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuQUNDT1VOVF9TSUdORURfSU4pO1xuICAgIE9ic2VydmVySGVscGVyLmFkZE9ic2VydmVyKHRoaXMsIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9PVVQpO1xuICAgIE9ic2VydmVySGVscGVyLmFkZE9ic2VydmVyKHRoaXMsIFRvcGljcy5NWV9CVVlJTkdfVVBEQVRFRCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLk1ZX0JVWUlOR19MSVNUX1VQREFURUQpO1xuICAgIE9ic2VydmVySGVscGVyLmFkZE9ic2VydmVyKHRoaXMsIFRvcGljcy5NWV9CVVlJTkdfVVBEQVRJTkcpO1xuXG4gICAgdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICBpZiAoQWNjb3VudC5nZXRBY2NvdW50KCkpIHtcbiAgICAgIHRoaXMuX3BvcHVsYXRlRGF0YSgpO1xuICAgICAgdGhpcy5fc3RhcnREYXRhVXBkYXRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbSXRlbS5UWVBFUy5CSURESU5HXSA9IHtcbiAgICAgIGxhYmVsOiBcImxpc3QuYmlkXCIsXG4gICAgICBsaXN0TmFtZTogVHJhZGluZ0FwaS5CSURfTElTVCxcbiAgICAgIGJhc2ljTGlzdElkOiBcInBhbmVsLWJ1eWluZy1iaWRcIlxuICAgIH07XG4gICAgdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbSXRlbS5UWVBFUy5XT05dID0ge1xuICAgICAgbGFiZWw6IFwibGlzdC53b25cIixcbiAgICAgIGxpc3ROYW1lOiBUcmFkaW5nQXBpLldPTl9MSVNULFxuICAgICAgYmFzaWNMaXN0SWQ6IFwicGFuZWwtYnV5aW5nLXdvblwiXG4gICAgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLkxPU1RdID0ge1xuICAgICAgbGFiZWw6IFwibGlzdC5sb3N0XCIsXG4gICAgICBsaXN0TmFtZTogVHJhZGluZ0FwaS5MT1NUX0xJU1QsXG4gICAgICBiYXNpY0xpc3RJZDogXCJwYW5lbC1idXlpbmctbG9zdFwiXG4gICAgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLkJFU1RfT0ZGRVJdID0ge1xuICAgICAgbGFiZWw6IFwibGlzdC5vZmZlcnNcIixcbiAgICAgIGxpc3ROYW1lOiBUcmFkaW5nQXBpLkJFU1RfT0ZGRVJfTElTVCxcbiAgICAgIGJhc2ljTGlzdElkOiBcInBhbmVsLWJ1eWluZy1vZmZlclwiXG4gICAgfTtcbiAgfSxcblxuICB1bmluaXQgOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fZGVsZXRlZEl0ZW1zLmxlbmd0aCA+IDAgJiYgdGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSkge1xuICAgICAgdGhpcy5kZWxldGVJdGVtcyhmdW5jdGlvbigpIHt9KTtcblxuICAgICAgdmFyIGRlbGV0ZUl0ZW1JZHMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZGVsZXRlZEl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlbGV0ZUl0ZW1JZHMucHVzaCh0aGlzLl9kZWxldGVkSXRlbXNbaV0uaXRlbUlkKTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSkge1xuICAgICAgICBjYXNlIEl0ZW0uVFlQRVMuV09OOlxuICAgICAgICAgIE15RWJheVNlcnZpY2UucmVtb3ZlSXRlbXNGcm9tTGlzdChcbiAgICAgICAgICAgIFRyYWRpbmdBcGkuV09OX0xJU1QsIGRlbGV0ZUl0ZW1JZHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEl0ZW0uVFlQRVMuTE9TVDpcbiAgICAgICAgICBNeUViYXlTZXJ2aWNlLnJlbW92ZUl0ZW1zRnJvbUxpc3QoXG4gICAgICAgICAgICBUcmFkaW5nQXBpLkxPU1RfTElTVCwgZGVsZXRlSXRlbUlkcyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX0lOKTtcbiAgICBPYnNlcnZlckhlbHBlci5yZW1vdmVPYnNlcnZlcih0aGlzLCBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUKTtcbiAgICBPYnNlcnZlckhlbHBlci5yZW1vdmVPYnNlcnZlcih0aGlzLCBUb3BpY3MuTVlfQlVZSU5HX1VQREFURUQpO1xuICAgIE9ic2VydmVySGVscGVyLnJlbW92ZU9ic2VydmVyKHRoaXMsIFRvcGljcy5NWV9CVVlJTkdfTElTVF9VUERBVEVEKTtcbiAgICBPYnNlcnZlckhlbHBlci5yZW1vdmVPYnNlcnZlcih0aGlzLCBUb3BpY3MuTVlfQlVZSU5HX1VQREFUSU5HKTtcbiAgfSxcblxuICBfYWRkRXZlbnRMaXN0ZW5lcnMgOiBmdW5jdGlvbigpIHtcbiAgICAkKFwiI3BhbmVsLWJ1eWluZy1lbXB0eS1idXR0b25cIikuY2xpY2soZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICBFdmVudEFuYWx5dGljcy5wdXNoKHtcbiAgICAgICAga2V5OiBcIlNpZ25lZEluRXhpdFwiLFxuICAgICAgICBhY3Rpb246IFwiQ2xpY2tFbXB0eVBhbmVsXCIsXG4gICAgICAgIGxhYmVsOiBcIkJ1eWluZ0VtcHR5XCJcbiAgICAgIH0pO1xuICAgICAgUm92ZXJVcmxIZWxwZXIubG9hZFBhZ2UoXCJob21lUGFnZVwiLCBcImVtcHR5TGlzdFRleHRcIiwgbnVsbCwgYUV2ZW50KTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgJChcIiNpdGVtLWxpc3QtYnV5aW5nLWRvY2stZWRpdCwgI2l0ZW0tbGlzdC1idXlpbmctZmxvYXQtZWRpdFwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Nob3dFZGl0TW9kZSh0cnVlKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgICQoXCIjaXRlbS1saXN0LWJ1eWluZy1kb2NrLWNhbmNlbCwgI2l0ZW0tbGlzdC1idXlpbmctZmxvYXQtY2FuY2VsXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fc2hvd0VkaXRNb2RlKGZhbHNlKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgJChcIiNwYW5lbC1idXlpbmctZGVsZXRlLWJ1dHRvblwiKS5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIHZhciBpdGVtcyA9IHRoaXMuX2dldFNlbGVjdGVkRGVsZXRlSXRlbXMoKTtcbiAgICAgIGlmIChpdGVtcy5sZW5ndGggPiAwICYmIHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpIHtcbiAgICAgICAgdGhpcy5faGlkZURlbGV0ZWRJdGVtcyhpdGVtcyk7XG4gICAgICAgIHRoaXMuX3Nob3dFZGl0TW9kZShmYWxzZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpIHtcbiAgICAgICAgICBNZXNzYWdlUGFuZWwuYWRkTWVzc2FnZShcbiAgICAgICAgICAgIE1lc3NhZ2VQYW5lbFNlcnZpY2UuVFlQRS5JVEVNU19ERUxFVEVELFxuICAgICAgICAgICAgeyBpdGVtVHlwZTogdGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSwgaXRlbU51bTogaXRlbXMubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICAkKFwiI3BhbmVsLWJ1eWluZy1kZWxldGUtYnV0dG9uXCIpLm1vdXNlZG93bihmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIC8vIHByZXZlbnQgdGhlIHNjcm9sbCBnZXQgdGhlIGNhbGwuXG4gICAgICBhRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgICQoXCIjaXRlbS1saXN0LWJ1eWluZy1kb2NrLXJlZmluZSwgI2l0ZW0tbGlzdC1idXlpbmctZmxvYXQtcmVmaW5lXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV2ZW50TGFiZWwgPSBTaWRlYmFyLmdldEdBTGlzdFR5cGVUcmFja2luZ05hbWUodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSk7XG4gICAgICBFdmVudEFuYWx5dGljcy5wdXNoKHtcbiAgICAgICAga2V5OiBcIlNpZ25lZEluSW50ZXJuYWxcIixcbiAgICAgICAgYWN0aW9uOiBcIkNsaWNrUmVmaW5lXCIsXG4gICAgICAgIGxhYmVsOiBldmVudExhYmVsXG4gICAgICB9KTtcbiAgICAgIFJlZmluZUNvbnRhaW5lci5zaG93KHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAkKFwiLml0ZW0tbGlzdC1ib3gtZG9jay1oZWFkZXItYm94ICosIC5pdGVtLWxpc3QtYm94LWZsb2F0LWhlYWRlci1ib3ggKlwiKS5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIGlmIChhRXZlbnQpIHtcbiAgICAgICAgLy8gUHJldmVudCBTYWZhcmkgc2VuZGluZyBkZWZhdWx0IHJlcXVlc3RzIG9uIGl0ZW0gY2xpY2suXG4gICAgICAgIGFFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgX3BvcHVsYXRlRGF0YSA6IGZ1bmN0aW9uKGFJc0xpc3QsIGFMaXN0TmFtZSkge1xuICAgIGlmIChhSXNMaXN0ICYmIHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpIHtcbiAgICAgIHRoaXMuX3NldEZ1bGxMaXN0KHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0UGFuZWwoKTtcbiAgICB9XG4gICAgU2lkZWJhci5zaG93TG9hZGluZyhcImJ1eWluZ1wiKTtcbiAgfSxcblxuICBfc2V0UGFuZWwgOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5hcGlIYXNJdGVtcygpKSB7XG4gICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLkJJRF9MSVNUKSxcbiAgICAgICAgXCJwYW5lbC1idXlpbmctYmlkXCIsXG4gICAgICAgIHsgdG90YWxDb3VudDogTXlFYmF5U2VydmljZS5nZXRTdW1tYXJ5KFxuICAgICAgICAgICAgVHJhZGluZ0FwaS5CSURfTElTVCkuY291bnQgfSk7XG4gICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLldPTl9MSVNUKSxcbiAgICAgICAgXCJwYW5lbC1idXlpbmctd29uXCIsXG4gICAgICAgIHsgdG90YWxDb3VudDogTXlFYmF5U2VydmljZS5nZXRTdW1tYXJ5KFxuICAgICAgICAgICAgVHJhZGluZ0FwaS5XT05fTElTVCkuY291bnQgfSk7XG4gICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLkxPU1RfTElTVCksXG4gICAgICAgIFwicGFuZWwtYnV5aW5nLWxvc3RcIixcbiAgICAgICAgeyB0b3RhbENvdW50OiBNeUViYXlTZXJ2aWNlLmdldFN1bW1hcnkoXG4gICAgICAgICAgICBUcmFkaW5nQXBpLkxPU1RfTElTVCkuY291bnQgfSk7XG4gICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgIE15RWJheVNlcnZpY2UuZ2V0TGlzdChUcmFkaW5nQXBpLkJFU1RfT0ZGRVJfTElTVCksXG4gICAgICAgIFwicGFuZWwtYnV5aW5nLW9mZmVyXCIsXG4gICAgICAgIHsgdG90YWxDb3VudDogTXlFYmF5U2VydmljZS5nZXRTdW1tYXJ5KFxuICAgICAgICAgICAgVHJhZGluZ0FwaS5CRVNUX09GRkVSX0xJU1QpLmNvdW50IH0pO1xuICAgICAgdGhpcy5fc2V0Q3VycmVuY3lOb3RlKCk7XG4gICAgICAvL2ZvciBzb21lIHN0cmFuZ2UgcmVhc29uLCB1c2luZyAuaGlkZSgpLy5zaG93KCkgaGVyZSB3aWxsIHRocm93IGFuIGVycm9yOlxuICAgICAgLy9DYW5ub3QgcmVhZCBwcm9wZXJ0eSAnZ2V0Q29tcHV0ZWRTdHlsZScgb2YgdW5kZWZpbmVkXG4gICAgICAkKFwiI3BhbmVsLWJ1eWluZy1lbXB0eVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICQoXCIjcGFuZWwtYnV5aW5nLW1haW5cIikuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xuICAgICAgLy8gYXBwbHkgdHJhbnNsYXRpb25zIGFnYWluXG4gICAgICAkKFwiW3RpdGxlXj1pMThuXVwiKS5pMThuKHsgYXR0cmlidXRlTmFtZXM6IFsgXCJ0aXRsZVwiIF0gfSk7XG4gICAgICBTaWRlYmFyLnVwZGF0ZVRvb2x0aXBzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChNeUViYXlTZXJ2aWNlLmlzVXBkYXRpbmdCdXlpbmdEYXRhKSB7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLW1haW5cIikuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWVtcHR5XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNwYW5lbC1idXlpbmctbWFpblwiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgJChcIiNwYW5lbC1idXlpbmctZW1wdHlcIikuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBfY3JlYXRlSXRlbUJveGVzIDogZnVuY3Rpb24oYUl0ZW1zLCBhSWQsIGFFeHRyYUluZm8pIHtcbiAgICB2YXIgY29udGFpbmVyID0gJChcIiNcIiArIGFJZCk7XG4gICAgdmFyIGNvbnRlbnQgPSAkKFwiI1wiICsgYUlkICsgXCItbGlzdFwiKTtcbiAgICB2YXIgbGlzdExlbmd0aCA9IGFJdGVtcy5sZW5ndGg7XG4gICAgdmFyIHNob3VsZFNob3dWaWV3QWxsID0gZmFsc2U7XG5cbiAgICBpZiAobGlzdExlbmd0aCA+IDApIHtcbiAgICAgIGNvbnRlbnQuZW1wdHkoKTtcbiAgICAgIC8vIHByZXZlbnQgc2hvd2luZyBtb3JlIHRoYW4gZXhwZWN0ZWQgaXRlbXMgaW4gYmFzaWMgdmlld1xuICAgICAgaWYgKGFFeHRyYUluZm8gJiYgIWFFeHRyYUluZm8uZnVsbExpc3RWaWV3ICYmXG4gICAgICAgICAgYUV4dHJhSW5mby50b3RhbENvdW50ID4gdGhpcy5fQkFTSUNfTElTVF9JVEVNX0NPVU5UKSB7XG4gICAgICAgIGxpc3RMZW5ndGggPSB0aGlzLl9CQVNJQ19MSVNUX0lURU1fQ09VTlQ7XG4gICAgICAgIHNob3VsZFNob3dWaWV3QWxsID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kKEl0ZW1Cb3guY3JlYXRlSXRlbUJveChhSXRlbXNbaV0pKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaG91bGRTaG93Vmlld0FsbCkge1xuICAgICAgICBhRXh0cmFJbmZvLnR5cGUgPSBhSXRlbXNbMF0uZ2V0KFwidHlwZVwiKTtcbiAgICAgICAgY29udGVudC5hcHBlbmQoSXRlbUJveC5jcmVhdGVWaWV3QWxsQm94KGFFeHRyYUluZm8pKTtcbiAgICAgIH1cbiAgICAgIGNvbnRhaW5lci5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5oaWRlKCk7XG4gICAgICBjb250ZW50LmVtcHR5KCk7XG4gICAgfVxuICAgIFNpZGViYXIuYWRqdXN0VGFiSW5kZXgoKTtcbiAgICBTaWRlYmFyLnJlbW92ZVRhYkluZGV4KCk7XG4gIH0sXG5cbiAgX3NldEN1cnJlbmN5Tm90ZSA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub3RlID0gJChcIiNwYW5lbC1idXlpbmctY29udmVydGVkLWN1cnJlbmN5LW5vdGVcIik7XG4gICAgaWYgKCQoXCIjcGFuZWwtYnV5aW5nLW1haW4tYmFzaWNcIikuZmluZChcIi5pdGVtLXByaWNlLWlubmVyLWNvbnRhaW5lci5jb252ZXJ0ZWRcIikubGVuZ3RoID4gMCkge1xuICAgICAgbm90ZS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdGUuaGlkZSgpO1xuICAgIH1cbiAgfSxcblxuICBfc2V0RnVsbExpc3RDdXJyZW5jeU5vdGUgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbm90ZSA9ICQoXCIjcGFuZWwtYnV5aW5nLWZ1bGwtY29udmVydGVkLWN1cnJlbmN5LW5vdGVcIik7XG4gICAgaWYgKCQoXCIjcGFuZWwtYnV5aW5nLWZ1bGwtbGlzdFwiKS5maW5kKFwiLml0ZW0tcHJpY2UtaW5uZXItY29udGFpbmVyLmNvbnZlcnRlZFwiKS5sZW5ndGggPiAwKSB7XG4gICAgICBub3RlLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm90ZS5oaWRlKCk7XG4gICAgfVxuICB9LFxuXG4gIC8vIHNob3cgb25lIHNpbmdsZSBmdWxsIGxpc3RcbiAgc2hvd0Z1bGxMaXN0IDogZnVuY3Rpb24oYVNob3csIGFEYXRhT2JqKSB7XG4gICAgaWYgKGFTaG93KSB7XG4gICAgICB0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlID0gYURhdGFPYmoudHlwZTtcbiAgICAgIHRoaXMuX3NldEZ1bGxMaXN0KHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUsIHRydWUpO1xuICAgICAgdGhpcy5fc2V0RWRpdExpbmsodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSk7XG4gICAgICBUYWJDb250YWluZXIuc2V0RnVsbExpc3RWaWV3VGl0bGUoXG4gICAgICAgICQuaTE4bi5nZXRTdHJpbmcodGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbYURhdGFPYmoudHlwZV0ubGFiZWwpKTtcbiAgICAgICQoXCIjcGFuZWwtYnV5aW5nLW1haW4tYmFzaWNcIikuaGlkZSgpO1xuICAgICAgJChcIiNwYW5lbC1idXlpbmctbWFpbi1mdWxsLWxpc3RcIikuc2hvdygpO1xuICAgICAgLy9UT0RPOiBjaGVjayBpZiB0aGVyZSBhcmUgZWxlbWVudHMgdG8gZGlzcGxheSBiZWZvcmUgc2hvd2luZyB0aGUgbGF6eSBsb2FkaW5nIHBhbmVsXG4gICAgICAkKFwiI3BhbmVsLWJ1eWluZy1sYXp5LWxvYWRpbmdcIikuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSkge1xuICAgICAgICBNZXNzYWdlUGFuZWwub25UYWJDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUgPSBudWxsO1xuICAgICAgJChcIiNwYW5lbC1idXlpbmctbWFpbi1mdWxsLWxpc3RcIikuaGlkZSgpO1xuICAgICAgJChcIiNwYW5lbC1idXlpbmctbWFpbi1iYXNpY1wiKS5zaG93KCk7XG4gICAgICB0aGlzLl9zaG93RWRpdE1vZGUoZmFsc2UpO1xuICAgIH1cbiAgICBUYWJDb250YWluZXIuc3dpdGNoRnVsbExpc3RWaWV3KGFTaG93KTtcbiAgfSxcblxuICAvLyBzZXQgdGhlIGZ1bGwgbGlzdCB2aWV3XG4gIC8vIGFTaG91bGRGZXRjaCBtZWFucyBnZXR0aW5nIHRoZSBmaXJzdCBsaXN0XG4gIC8vIGFMb2FkTW9yZSBtZWFucyBwYWdlIDErXG4gIF9zZXRGdWxsTGlzdCA6IGZ1bmN0aW9uKGFUeXBlLCBhU2hvdWxkRmV0Y2gsIGFMb2FkTW9yZSkge1xuICAgIHZhciBpZCA9IFwicGFuZWwtYnV5aW5nLWZ1bGxcIjtcbiAgICB2YXIgcGFnZU51bWJlciA9IDE7XG4gICAgdmFyIGxpc3ROYW1lID0gdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbYVR5cGVdLmxpc3ROYW1lO1xuICAgIHZhciBsaXN0O1xuXG4gICAgLy8gYVNob3VsZEZldGNoID09IHRydWUgYW5kICFhTG9hZE1vcmUgbWVhbnMgd2UganVzdCBzd2l0Y2ggdG8gdGhlIGZ1bGwgbGlzdCB2aWV3IGFuZCBzaG91bGRcbiAgICAvLyBsb2FkIHRoZSBsb2NhbCBsaXN0IGJlZm9yZSBmZXRjaGluZy5cbiAgICAvLyBhU2hvdWxkRmV0Y2ggPT0gdHJ1ZSBhbmQgYUxvYWRNb3JlIG1lYW5zIHdlIGp1c3Qgd2FudCB0byBsb2FkIG1vcmUgaW4gdGhlIGZ1bGwgbGlzdCB2aWV3IGFuZFxuICAgIC8vIHNvbWUgaXRlbXMgYXJlIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSBsaXN0LlxuICAgIGlmIChhU2hvdWxkRmV0Y2gpIHtcbiAgICAgIGlmIChhTG9hZE1vcmUpIHtcbiAgICAgICAgcGFnZU51bWJlciA9IE15RWJheVNlcnZpY2UuZ2V0U3VtbWFyeShsaXN0TmFtZSkuY3VycmVudFBhZ2UgKyAxO1xuICAgICAgICB0aGlzLl9jYWNoZVNlbGVjdGVkRGVsZXRlSXRlbXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSBNeUViYXlTZXJ2aWNlLmdldExpc3QobGlzdE5hbWUpO1xuICAgICAgICB0aGlzLl9jcmVhdGVJdGVtQm94ZXMobGlzdCwgaWQsIHsgZnVsbExpc3RWaWV3OiB0cnVlIH0pO1xuICAgICAgICB0aGlzLl9zZXRGdWxsTGlzdEN1cnJlbmN5Tm90ZSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0ID0gTXlFYmF5U2VydmljZS5nZXRMaXN0KGxpc3ROYW1lKTtcbiAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Cb3hlcyhsaXN0LCBpZCwgeyBmdWxsTGlzdFZpZXc6IHRydWUgfSk7XG4gICAgICB0aGlzLl9hcHBseUNhY2hlZFNlbGVjdGVkRGVsZXRlSXRlbXMoKTtcbiAgICAgIHRoaXMuX3NldEZ1bGxMaXN0Q3VycmVuY3lOb3RlKCk7XG4gICAgICAvLyB1cGRhdGUgdGhlIGJhc2ljIGxpc3Qgdmlld1xuICAgICAgdGhpcy5fY3JlYXRlSXRlbUJveGVzKFxuICAgICAgICBsaXN0LFxuICAgICAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1thVHlwZV0uYmFzaWNMaXN0SWQsXG4gICAgICAgIHsgdG90YWxDb3VudDogTXlFYmF5U2VydmljZS5nZXRTdW1tYXJ5KGxpc3ROYW1lKS5jb3VudCB9KTtcbiAgICAgIGxpc3ROYW1lID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBtYWtlIHRoZSBjYWxsIHRvIGdldCB0aGUgZmlyc3Qgc2V0LlxuICAgIGlmIChsaXN0TmFtZSkge1xuICAgICAgaWYgKHBhZ2VOdW1iZXIgPiAxKSB7XG4gICAgICAgIGlmKCFNeUViYXlTZXJ2aWNlLmlnbm9yZVJlcXVlc3RbVG9waWNzLk1ZX0JVWUlOR19MSVNUX1VQREFURURdKSB7XG4gICAgICAgICAgU2lkZWJhci5zZXRFbGVtZW50RGlzcGxheWVkKFwiI3BhbmVsLWJ1eWluZy1sYXp5LWxvYWRpbmdcIiwgdHJ1ZSk7XG4gICAgICAgICAgU2lkZWJhci5zY3JvbGxUb0JvdHRvbShcInBhbmVsc1wiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5faXNMb2FkaW5nTW9yZUZvckZ1bGxMaXN0ID0gdHJ1ZTtcbiAgICAgIE15RWJheVNlcnZpY2UubG9hZEJ1eWluZ0xpc3REYXRhKHtcbiAgICAgICAgbmFtZTogbGlzdE5hbWUsXG4gICAgICAgIGVudHJpZXNQZXJQYWdlOiBNeUViYXlTZXJ2aWNlLkxJU1RfSVRFTV9CQVRDSF9TSVpFLFxuICAgICAgICBwYWdlTnVtYmVyOiBwYWdlTnVtYmVyXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgU2lkZWJhci5zZXRFbGVtZW50RGlzcGxheWVkKFwiI3BhbmVsLWJ1eWluZy1sYXp5LWxvYWRpbmdcIiwgZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICBsb2FkTW9yZVRvRnVsbExpc3QgOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5faXNMb2FkaW5nTW9yZUZvckZ1bGxMaXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3NldEZ1bGxMaXN0KHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUsIHRydWUsIHRydWUpO1xuICB9LFxuXG4gIF9zZXRFZGl0TGluayA6IGZ1bmN0aW9uKGFUeXBlKSB7XG4gICAgc3dpdGNoIChhVHlwZSkge1xuICAgICAgY2FzZSBJdGVtLlRZUEVTLldPTjpcbiAgICAgICAgJChcIiNpdGVtLWxpc3QtYnV5aW5nLWRvY2stcmVmaW5lLCNpdGVtLWxpc3QtYnV5aW5nLWZsb2F0LXJlZmluZVwiKS5oaWRlKCk7XG4gICAgICAgICQoXCIjaXRlbS1saXN0LWJ1eWluZy1kb2NrLWVkaXQsI2l0ZW0tbGlzdC1idXlpbmctZmxvYXQtZWRpdFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWRvY2staGVhZGVyLWJveFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWZ1bGwtbGlzdFwiKS5yZW1vdmVDbGFzcyhcIm5vLWhlYWRlclwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEl0ZW0uVFlQRVMuTE9TVDpcbiAgICAgICAgJChcIiNpdGVtLWxpc3QtYnV5aW5nLWRvY2stcmVmaW5lLCNpdGVtLWxpc3QtYnV5aW5nLWZsb2F0LXJlZmluZVwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjaXRlbS1saXN0LWJ1eWluZy1kb2NrLWVkaXQsI2l0ZW0tbGlzdC1idXlpbmctZmxvYXQtZWRpdFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWRvY2staGVhZGVyLWJveFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWZ1bGwtbGlzdFwiKS5yZW1vdmVDbGFzcyhcIm5vLWhlYWRlclwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEl0ZW0uVFlQRVMuQkVTVF9PRkZFUjpcbiAgICAgICAgJChcIiNpdGVtLWxpc3QtYnV5aW5nLWRvY2stcmVmaW5lLCNpdGVtLWxpc3QtYnV5aW5nLWZsb2F0LXJlZmluZVwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjaXRlbS1saXN0LWJ1eWluZy1kb2NrLWVkaXQsI2l0ZW0tbGlzdC1idXlpbmctZmxvYXQtZWRpdFwiKS5oaWRlKCk7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWRvY2staGVhZGVyLWJveFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWZ1bGwtbGlzdFwiKS5yZW1vdmVDbGFzcyhcIm5vLWhlYWRlclwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEl0ZW0uVFlQRVMuQklERElORzpcbiAgICAgICAgJChcIiNwYW5lbC1idXlpbmctZG9jay1oZWFkZXItYm94XCIpLmhpZGUoKTtcbiAgICAgICAgJChcIiNwYW5lbC1idXlpbmctZnVsbC1saXN0XCIpLmFkZENsYXNzKFwibm8taGVhZGVyXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0sXG5cbiAgX3Nob3dFZGl0TW9kZSA6IGZ1bmN0aW9uKGFTaG93KSB7XG4gICAgaWYgKGFTaG93KSB7XG4gICAgICB0aGlzLl9pc0luRWRpdE1vZGUgPSB0cnVlO1xuICAgICAgJChcIiNpdGVtLWxpc3QtYnV5aW5nLWRvY2stZWRpdC1oZWFkZXIsICNpdGVtLWxpc3QtYnV5aW5nLWZsb2F0LWVkaXQtaGVhZGVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCIjaXRlbS1saXN0LWJ1eWluZy1kb2NrLWNhbmNlbC1oZWFkZXIsICNpdGVtLWxpc3QtYnV5aW5nLWZsb2F0LWNhbmNlbC1oZWFkZXJcIikuc2hvdygpO1xuICAgICAgJChcIiNwYW5lbC1idXlpbmctYnV0dG9ucy1jb250YWluZXJcIikuc2hvdygpO1xuICAgICAgJChcIiNwYW5lbHNcIikuYWRkQ2xhc3MoXCJzaG93LWJ1dHRvbnMtY29udGFpbmVyXCIpO1xuICAgICAgJChcIiNwYW5lbC1idXlpbmctZnVsbC1saXN0XCIpLmFkZENsYXNzKFwiZWRpdC1tb2RlXCIpO1xuICAgICAgJChcIiNwYW5lbC1idXlpbmctZGVsZXRlLWJ1dHRvblwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgdGhpcy5nZXRTZWxlY3RlZERlbGV0ZUNoZWNrYm94ZXMoKS5sZW5ndGggPT09IDApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc0luRWRpdE1vZGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2NhY2hlZFNlbGVjdGVkRGVsZXRlSXRlbXMgPSBbXTtcbiAgICAgICQoXCIjaXRlbS1saXN0LWJ1eWluZy1kb2NrLWVkaXQtaGVhZGVyLCAjaXRlbS1saXN0LWJ1eWluZy1mbG9hdC1lZGl0LWhlYWRlclwiKS5zaG93KCk7XG4gICAgICAkKFwiI2l0ZW0tbGlzdC1idXlpbmctZG9jay1jYW5jZWwtaGVhZGVyLCAjaXRlbS1saXN0LWJ1eWluZy1mbG9hdC1jYW5jZWwtaGVhZGVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWJ1dHRvbnMtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCIjcGFuZWxzXCIpLnJlbW92ZUNsYXNzKFwic2hvdy1idXR0b25zLWNvbnRhaW5lclwiKTtcbiAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWZ1bGwtbGlzdFwiKS5yZW1vdmVDbGFzcyhcImVkaXQtbW9kZVwiKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzIDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoXCIjcGFuZWwtYnV5aW5nLWZ1bGwtbGlzdFwiKS5maW5kKFwiLml0ZW0tZWRpdC1jaGVja2JveCBpbnB1dFt0eXBlPSdjaGVja2JveCddOmNoZWNrZWRcIik7XG4gIH0sXG5cbiAgX2dldFNlbGVjdGVkRGVsZXRlSXRlbXMgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzKCk7XG4gICAgdmFyIGl0ZW1PYmplY3RzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbGVtZW50ID0gJChzZWxlY3RlZEVsZW1lbnRzW2ldKS5wYXJlbnRzKFwiLml0ZW0tYm94LWNvbnRhaW5lclwiKS5nZXQoMCk7XG4gICAgICB2YXIgaXRlbU9iamVjdCA9ICQoZWxlbWVudCkuZGF0YShcIml0ZW1PYmplY3RcIik7XG4gICAgICB2YXIgaXRlbUlkID0gaXRlbU9iamVjdC5nZXQoXCJpdGVtSWRcIik7XG4gICAgICB2YXIgaXRlbVR5cGUgPSBpdGVtT2JqZWN0LmdldChcInR5cGVcIik7XG4gICAgICB2YXIgdHJhbnNhY3Rpb24gPSBudWxsO1xuICAgICAgdmFyIHRyYW5zYWN0aW9uSWQgPSAwO1xuICAgICAgdmFyIGl0ZW0gPSB7fTtcblxuICAgICAgaWYgKGl0ZW1PYmplY3QuZ2V0KFwidHJhbnNhY3Rpb25zXCIpICYmXG4gICAgICAgICAgaXRlbU9iamVjdC5nZXQoXCJ0cmFuc2FjdGlvbnNcIikubGVuZ3RoID4gMCkge1xuICAgICAgICB0cmFuc2FjdGlvbiA9IGl0ZW1PYmplY3QuZ2V0KFwidHJhbnNhY3Rpb25zXCIpWzBdO1xuICAgICAgICB0cmFuc2FjdGlvbklkID0gdHJhbnNhY3Rpb24uZ2V0KFwidHJhbnNhY3Rpb25JZFwiKTtcbiAgICAgIH1cblxuICAgICAgaXRlbS5pdGVtSWQgPSBpdGVtSWQ7XG4gICAgICBpdGVtLml0ZW1UeXBlID0gaXRlbVR5cGU7XG4gICAgICBpdGVtLnRyYW5zYWN0aW9uSWQgPSB0cmFuc2FjdGlvbklkO1xuICAgICAgaXRlbU9iamVjdHMucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW1PYmplY3RzO1xuICB9LFxuXG4gIF9jYWNoZVNlbGVjdGVkRGVsZXRlSXRlbXMgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9jYWNoZWRTZWxlY3RlZERlbGV0ZUl0ZW1zID0gdGhpcy5fZ2V0U2VsZWN0ZWREZWxldGVJdGVtcygpO1xuICB9LFxuXG4gIF9hcHBseUNhY2hlZFNlbGVjdGVkRGVsZXRlSXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9pc0luRWRpdE1vZGUgJiYgdGhpcy5fY2FjaGVkU2VsZWN0ZWREZWxldGVJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZWxlbWVudHMgPSAkKFwiI3BhbmVsLWJ1eWluZy1mdWxsLWxpc3RcIikuZmluZChcIi5pdGVtLWVkaXQtY2hlY2tib3ggaW5wdXRbdHlwZT0nY2hlY2tib3gnXVwiKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudCA9ICQoZWxlbWVudHNbaV0pO1xuICAgICAgICB2YXIgY29udGFpbmVyID0gZWxlbWVudC5wYXJlbnRzKFwiLml0ZW0tYm94LWNvbnRhaW5lclwiKS5nZXQoMCk7XG4gICAgICAgIHZhciBpdGVtSWQgPSAkKGNvbnRhaW5lcikuZGF0YShcIml0ZW1PYmplY3RcIikuZ2V0KFwiaXRlbUlkXCIpO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAodGhpcy5fY2FjaGVkU2VsZWN0ZWREZWxldGVJdGVtcy5sZW5ndGggLSAxKTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICBpZiAodGhpcy5fY2FjaGVkU2VsZWN0ZWREZWxldGVJdGVtc1tqXS5pdGVtSWQgPT0gaXRlbUlkKSB7XG4gICAgICAgICAgICBlbGVtZW50LnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVkU2VsZWN0ZWREZWxldGVJdGVtcy5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2NhY2hlZFNlbGVjdGVkRGVsZXRlSXRlbXMgPSBbXTtcbiAgICB9XG4gIH0sXG5cbiAgX2hpZGVEZWxldGVkSXRlbXMgOiBmdW5jdGlvbihhSXRlbXMpIHtcbiAgICB0aGlzLl9kZWxldGVkSXRlbXMgPSBhSXRlbXM7XG5cbiAgICB2YXIgc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZEVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAkKHNlbGVjdGVkRWxlbWVudHNbaV0pLnBhcmVudHMoXCIuaXRlbS1ib3gtY29udGFpbmVyXCIpLmhpZGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgX2RlbGV0ZURlbGV0ZWRJdGVtcyA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxlY3RlZEVsZW1lbnRzID0gdGhpcy5nZXRTZWxlY3RlZERlbGV0ZUNoZWNrYm94ZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICQoc2VsZWN0ZWRFbGVtZW50c1tpXSkucGFyZW50cyhcIi5pdGVtLWJveC1jb250YWluZXJcIikucmVtb3ZlKCk7XG4gICAgfVxuICB9LFxuXG4gIHNob3dEZWxldGVkSXRlbXMgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZEVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWxlbWVudCA9ICQoc2VsZWN0ZWRFbGVtZW50c1tpXSk7XG4gICAgICB2YXIgY29udGFpbmVyID0gZWxlbWVudC5wYXJlbnRzKFwiLml0ZW0tYm94LWNvbnRhaW5lclwiKTtcbiAgICAgIHZhciBpdGVtSWQgPSBjb250YWluZXIuZGF0YShcIml0ZW1PYmplY3RcIikuZ2V0KFwiaXRlbUlkXCIpO1xuXG4gICAgICBmb3IgKHZhciBqID0gKHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGggLSAxKTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZWRJdGVtc1tqXS5pdGVtSWQgPT0gaXRlbUlkKSB7XG4gICAgICAgICAgZWxlbWVudC5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgY29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICB0aGlzLl9kZWxldGVkSXRlbXMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2RlbGV0ZWRJdGVtcyA9IFtdO1xuICB9LFxuXG4gIGRlbGV0ZUl0ZW1zIDogZnVuY3Rpb24oYUNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGggPiAwICYmIHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUpIHtcbiAgICAgIHZhciBhY3RpdmVBY2NvdW50ID0gQWNjb3VudC5nZXRBY2NvdW50KCk7XG5cbiAgICAgIGlmIChhY3RpdmVBY2NvdW50KSB7XG4gICAgICAgIHZhciB0b2tlbiA9IGFjdGl2ZUFjY291bnQuZ2V0KFwidG9rZW5cIik7XG5cbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgIHZhciBzaXRlSWQgPSBTaXRlLnNpdGVJZEZvclNpdGUoXG4gICAgICAgICAgICBTaXRlLmdldEhvbWVTaXRlKCkpO1xuICAgICAgICAgIHZhciBmdWxsTGlzdFR5cGUgPSB0aGlzLl9jdXJyZW50RnVsbExpc3RUeXBlO1xuICAgICAgICAgIHZhciBkZWxldGVJdGVtSWRzID0gW107XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2RlbGV0ZWRJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZXRlSXRlbUlkcy5wdXNoKHRoaXMuX2RlbGV0ZWRJdGVtc1tpXS5pdGVtSWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBsb2NhbENhbGxiYWNrID0gZnVuY3Rpb24oYVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKCFhUmVzdWx0LmVycm9ycykge1xuICAgICAgICAgICAgICB2YXIgbGlzdE5hbWU7XG5cbiAgICAgICAgICAgICAgc3dpdGNoIChmdWxsTGlzdFR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIEl0ZW0uVFlQRVMuV09OOlxuICAgICAgICAgICAgICAgICAgTXlFYmF5U2VydmljZS5yZW1vdmVJdGVtc0Zyb21MaXN0KFxuICAgICAgICAgICAgICAgICAgICBUcmFkaW5nQXBpLldPTl9MSVNULCBkZWxldGVJdGVtSWRzKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgSXRlbS5UWVBFUy5MT1NUOlxuICAgICAgICAgICAgICAgICAgTXlFYmF5U2VydmljZS5yZW1vdmVJdGVtc0Zyb21MaXN0KFxuICAgICAgICAgICAgICAgICAgICBUcmFkaW5nQXBpLkxPU1RfTElTVCwgZGVsZXRlSXRlbUlkcyk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoYXQuX2RlbGV0ZURlbGV0ZWRJdGVtcygpO1xuICAgICAgICAgICAgICB0aGF0Ll9kZWxldGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBiYXNpYyBsaXN0IHZpZXdcbiAgICAgICAgICAgICAgbGlzdE5hbWUgPSB0aGF0Ll9JVEVNX1RZUEVfUFJPUEVSVElFU1tmdWxsTGlzdFR5cGVdLmxpc3ROYW1lO1xuICAgICAgICAgICAgICB0aGF0Ll9jcmVhdGVJdGVtQm94ZXMoXG4gICAgICAgICAgICAgICAgTXlFYmF5U2VydmljZS5nZXRMaXN0KGxpc3ROYW1lKSxcbiAgICAgICAgICAgICAgICB0aGF0Ll9JVEVNX1RZUEVfUFJPUEVSVElFU1tmdWxsTGlzdFR5cGVdLmJhc2ljTGlzdElkLFxuICAgICAgICAgICAgICAgIHsgdG90YWxDb3VudDogTXlFYmF5U2VydmljZS5nZXRTdW1tYXJ5KGxpc3ROYW1lKS5jb3VudCB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoYXQuc2hvd0RlbGV0ZWRJdGVtcygpO1xuICAgICAgICAgICAgICBNZXNzYWdlUGFuZWxTZXJ2aWNlLmFkZE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgTWVzc2FnZVBhbmVsU2VydmljZS5UWVBFLkNPTk5FQ1RfRVJST1IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzd2l0Y2ggKGZ1bGxMaXN0VHlwZSkge1xuICAgICAgICAgICAgY2FzZSBJdGVtLlRZUEVTLldPTjpcbiAgICAgICAgICAgICAgTXlFYmF5QXBwbGljYXRpb25BcGkucmVtb3ZlRnJvbVdvbkxpc3QoXG4gICAgICAgICAgICAgICAgdG9rZW4sIHRoaXMuX2RlbGV0ZWRJdGVtcywgc2l0ZUlkLCAoYUNhbGxiYWNrID8gYUNhbGxiYWNrIDogbG9jYWxDYWxsYmFjaykpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgSXRlbS5UWVBFUy5MT1NUOlxuICAgICAgICAgICAgICBNeUViYXlBcHBsaWNhdGlvbkFwaS5yZW1vdmVGcm9tRGlkbnRXaW5MaXN0KFxuICAgICAgICAgICAgICAgIHRva2VuLCB0aGlzLl9kZWxldGVkSXRlbXMsIHNpdGVJZCwgKGFDYWxsYmFjayA/IGFDYWxsYmFjayA6IGxvY2FsQ2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIF9zdGFydERhdGFVcGRhdGUgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9kYXRhVXBkYXRlSWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fdXBkYXRlVGltZUxlZnQoKTtcbiAgICAgIHRoaXMuX3N0YXJ0RGF0YVVwZGF0ZSgpO1xuICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XG4gIH0sXG5cbiAgX3N0b3BEYXRhVXBkYXRlIDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2RhdGFVcGRhdGVJZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2RhdGFVcGRhdGVJZCk7XG4gICAgICBkZWxldGUgdGhpcy5fZGF0YVVwZGF0ZUlkO1xuICAgIH1cbiAgfSxcblxuICBfdXBkYXRlVGltZUxlZnQgOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSkge1xuICAgICAgaWYgKHRoaXMuX2N1cnJlbnRGdWxsTGlzdFR5cGUgPT0gSXRlbS5UWVBFUy5CSURESU5HIHx8XG4gICAgICAgICAgdGhpcy5fY3VycmVudEZ1bGxMaXN0VHlwZSA9PSBJdGVtLlRZUEVTLkJFU1RfT0ZGRVIpIHtcbiAgICAgICAgJChcIiNwYW5lbC1idXlpbmctZnVsbC1saXN0XCIpLmNoaWxkcmVuKFwiYVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIEl0ZW1Cb3gudXBkYXRlVGltZUxlZnQoJCh0aGlzKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkKFwiI3BhbmVsLWJ1eWluZy1iaWQtbGlzdCwjcGFuZWwtYnV5aW5nLW9mZmVyLWxpc3RcIikuY2hpbGRyZW4oXCJhXCIpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIEl0ZW1Cb3gudXBkYXRlVGltZUxlZnQoJCh0aGlzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgYXBpSGFzSXRlbXMgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBpSGFzSXRlbXMgPSBmYWxzZTtcbiAgICB2YXIgYmlkTGlzdCA9XG4gICAgICBNeUViYXlTZXJ2aWNlLmdldExpc3QoVHJhZGluZ0FwaS5CSURfTElTVCk7XG4gICAgdmFyIHdvbkxpc3QgPVxuICAgICAgTXlFYmF5U2VydmljZS5nZXRMaXN0KFRyYWRpbmdBcGkuV09OX0xJU1QpO1xuICAgIHZhciBsb3N0TGlzdCA9XG4gICAgICBNeUViYXlTZXJ2aWNlLmdldExpc3QoVHJhZGluZ0FwaS5MT1NUX0xJU1QpO1xuICAgIHZhciBvZmZlckxpc3QgPVxuICAgICAgTXlFYmF5U2VydmljZS5nZXRMaXN0KFRyYWRpbmdBcGkuQkVTVF9PRkZFUl9MSVNUKTtcblxuICAgIGlmIChiaWRMaXN0Lmxlbmd0aCA+IDAgfHwgd29uTGlzdC5sZW5ndGggPiAwIHx8IGxvc3RMaXN0Lmxlbmd0aCA+IDAgfHwgb2ZmZXJMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGFwaUhhc0l0ZW1zID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXBpSGFzSXRlbXM7XG4gIH0sXG5cbiAgb2JzZXJ2ZSA6IGZ1bmN0aW9uKGFUb3BpYywgYURhdGEpIHtcbiAgICBzd2l0Y2ggKGFUb3BpYykge1xuICAgICAgY2FzZSBUb3BpY3MuQUNDT1VOVF9TSUdORURfSU46XG4gICAgICAgIHRoaXMuX3N0YXJ0RGF0YVVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVDpcbiAgICAgICAgdGhpcy5fc3RvcERhdGFVcGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRvcGljcy5NWV9CVVlJTkdfVVBEQVRFRDpcbiAgICAgICAgdGhpcy5faXNMb2FkaW5nTW9yZUZvckZ1bGxMaXN0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3BvcHVsYXRlRGF0YSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLk1ZX0JVWUlOR19MSVNUX1VQREFURUQ6XG4gICAgICAgIHRoaXMuX2lzTG9hZGluZ01vcmVGb3JGdWxsTGlzdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9wb3B1bGF0ZURhdGEodHJ1ZSwgYURhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLk1ZX0JVWUlOR19VUERBVElORzpcbiAgICAgICAgaWYgKCF0aGlzLl9pc0xvYWRpbmdNb3JlRm9yRnVsbExpc3QpIHtcbiAgICAgICAgICBTaWRlYmFyLnNob3dMb2FkaW5nKFwiYnV5aW5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcblxuJCh3aW5kb3cpLnVubG9hZChmdW5jdGlvbigpIHsgUGFuZWxCdXlpbmcudW5pbml0KCk7IH0pO1xuIl19