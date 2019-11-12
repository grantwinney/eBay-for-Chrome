/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var MyEbayService = {
    LIST_ITEM_BATCH_SIZE: 25,
    FILTER: {
        ALL: "All",
        AWAITING_PAYMENT: "AwaitingPayment",
        AWAITING_SHIPMENT: "AwaitingShipment",
        PAID_AND_SHIPPED: "PaidAndShipped"
    },
    _buying: {
        bidList: { list: [] },
        offerList: { list: [] },
        wonList: { list: [] },
        lostList: { list: [], sort: TradingApi.SORT.END_TIME_DESC },
        summary: {},
        filterSummary: {}
    },
    _selling: {
        activeList: { list: [] },
        offerList: { list: [] },
        soldList: { list: [] },
        unsoldList: { list: [] },
        scheduledList: { list: [] },
        draftList: { list: [] },
        summary: {},
        filterSummary: {}
    },
    _watching: {
        watchList: { list: [] },
        summary: {}
    },
    _lastSellingCallTimestamp: null,
    _isUpdatingBuyingData: false,
    _isUpdatingSellingData: false,
    _ignoreRequest: [],
    getList: function (aType) {
        var list = [];
        switch (aType) {
            case TradingApi.WATCH_LIST:
                list = this._watching.watchList.list;
                break;
            case TradingApi.BID_LIST:
                list = this._buying.bidList.list;
                break;
            case TradingApi.WON_LIST:
                list = this._buying.wonList.list;
                break;
            case TradingApi.LOST_LIST:
                list = this._buying.lostList.list;
                break;
            case TradingApi.BEST_OFFER_LIST:
                list = this._buying.offerList.list;
                break;
            case TradingApi.ACTIVE_LIST:
                list = this._selling.activeList.list;
                break;
            case TradingApi.SELLING_OFFER_LIST:
                list = this._selling.offerList.list;
                break;
            case TradingApi.SOLD_LIST:
                list = this._selling.soldList.list;
                break;
            case TradingApi.UNSOLD_LIST:
                list = this._selling.unsoldList.list;
                break;
            case TradingApi.SCHEDULED_LIST:
                list = this._selling.scheduledList.list;
                break;
        }
        return list;
    },
    getSummary: function (aType) {
        var summary = { count: 0, currentPage: 1 };
        switch (aType) {
            case TradingApi.WATCH_LIST:
                if ("watchCount" in this._watching.summary) {
                    summary.count = this._buying.summary.watchCount;
                }
                if ("watchCurrentPage" in this._watching.summary) {
                    summary.currentPage = this._watching.summary.watchCurrentPage;
                }
                break;
            case TradingApi.BID_LIST:
                if ("bidCount" in this._buying.summary) {
                    summary.count = this._buying.summary.bidCount;
                }
                if ("bidCurrentPage" in this._buying.summary) {
                    summary.currentPage = this._buying.summary.bidCurrentPage;
                }
                break;
            case TradingApi.WON_LIST:
                if ("wonCount" in this._buying.summary) {
                    summary.count = this._buying.summary.wonCount;
                }
                if ("wonCurrentPage" in this._buying.summary) {
                    summary.currentPage = this._buying.summary.wonCurrentPage;
                }
                break;
            case TradingApi.LOST_LIST:
                if ("lostCount" in this._buying.summary) {
                    summary.count = this._buying.summary.lostCount;
                }
                if ("lostCurrentPage" in this._buying.summary) {
                    summary.currentPage = this._buying.summary.lostCurrentPage;
                }
                break;
            case TradingApi.BEST_OFFER_LIST:
                if ("offerCount" in this._buying.summary) {
                    summary.count = this._buying.summary.offerCount;
                }
                if ("offerCurrentPage" in this._buying.summary) {
                    summary.currentPage = this._buying.summary.offerCurrentPage;
                }
                break;
            case TradingApi.ACTIVE_LIST:
                if ("activeCount" in this._selling.summary) {
                    summary.count = this._selling.summary.activeCount;
                }
                if ("activeCurrentPage" in this._buying.summary) {
                    summary.currentPage = this._selling.summary.activeCurrentPage;
                }
                break;
            case TradingApi.SELLING_OFFER_LIST:
                if ("sellingOfferCount" in this._selling.summary) {
                    summary.count = this._selling.summary.sellingOfferCount;
                }
                if ("sellingOfferCurrentPage" in this._selling.summary) {
                    summary.currentPage = this._selling.summary.sellingOfferCurrentPage;
                }
                if ("sellingOfferItemTitle" in this._selling.summary) {
                    summary.title = this._selling.summary.sellingOfferItemTitle;
                }
                break;
            case TradingApi.SOLD_LIST:
                if ("soldCount" in this._selling.summary) {
                    summary.count = this._selling.summary.soldCount;
                }
                if ("soldCurrentPage" in this._selling.summary) {
                    summary.currentPage = this._selling.summary.soldCurrentPage;
                }
                break;
            case TradingApi.UNSOLD_LIST:
                if ("unsoldCount" in this._selling.summary) {
                    summary.count = this._selling.summary.unsoldCount;
                }
                if ("unsoldCurrentPage" in this._selling.summary) {
                    summary.currentPage = this._selling.summary.unsoldCurrentPage;
                }
                break;
            case TradingApi.SCHEDULED_LIST:
                if ("scheduledCount" in this._selling.summary) {
                    summary.count = this._selling.summary.scheduledCount;
                }
                if ("scheduledCurrentPage" in this._selling.summary) {
                    summary.currentPage = this._selling.summary.scheduledCurrentPage;
                }
                break;
        }
        return summary;
    },
    getFilterSummary: function (aFilter) {
        if (aFilter in this._selling.filterSummary) {
            return this._selling.filterSummary[aFilter];
        }
        return { count: 0 };
    },
    getRefine: function (aType) {
        var refine = { sort: null, filter: null };
        var list;
        switch (aType) {
            case TradingApi.WATCH_LIST:
                list = this._watching.watchList;
                break;
            case TradingApi.BID_LIST:
                list = this._buying.bidList;
                break;
            case TradingApi.WON_LIST:
                list = this._buying.wonList;
                break;
            case TradingApi.LOST_LIST:
                list = this._buying.lostList;
                break;
            case TradingApi.BEST_OFFER_LIST:
                list = this._buying.offerList;
                break;
            case TradingApi.ACTIVE_LIST:
                list = this._selling.activeList;
                break;
            case TradingApi.SELLING_OFFER_LIST:
                list = this._selling.offerList;
                break;
            case TradingApi.SOLD_LIST:
                list = this._selling.soldList;
                break;
            case TradingApi.UNSOLD_LIST:
                list = this._selling.unsoldList;
                break;
            case TradingApi.SCHEDULED_LIST:
                list = this._selling.scheduledList;
                break;
        }
        if ("sort" in list) {
            refine.sort = list.sort;
        }
        if ("filter" in list) {
            refine.filter = list.filter;
        }
        return refine;
    },
    setRefine: function (aType, aValue) {
        var list;
        switch (aType) {
            case TradingApi.WATCH_LIST:
                list = this._watching.watchList;
                break;
            case TradingApi.BID_LIST:
                list = this._buying.bidList;
                break;
            case TradingApi.WON_LIST:
                list = this._buying.wonList;
                break;
            case TradingApi.LOST_LIST:
                list = this._buying.lostList;
                break;
            case TradingApi.BEST_OFFER_LIST:
                list = this._buying.offerList;
                break;
            case TradingApi.ACTIVE_LIST:
                list = this._selling.activeList;
                break;
            case TradingApi.SELLING_OFFER_LIST:
                list = this._selling.offerList;
                break;
            case TradingApi.SOLD_LIST:
                list = this._selling.soldList;
                break;
            case TradingApi.UNSOLD_LIST:
                list = this._selling.unsoldList;
                break;
            case TradingApi.SCHEDULED_LIST:
                list = this._selling.scheduledList;
                break;
        }
        if ("sort" in aValue) {
            list.sort = aValue.sort;
        }
        if ("filter" in aValue) {
            list.filter = aValue.filter;
        }
    },
    get lastSellingCallTimestamp() {
        return this._lastSellingCallTimestamp;
    },
    get isUpdatingBuyingData() {
        return this._isUpdatingBuyingData;
    },
    get isUpdatingSellingData() {
        return this._isUpdatingSellingData;
    },
    get ignoreRequest() {
        return this._ignoreRequest;
    },
    startService: function () {
        this.loadAllData();
    },
    stopService: function (aSignOut) {
        if (aSignOut) {
            this._buying = {
                bidList: { list: [] },
                offerList: { list: [] },
                wonList: { list: [] },
                lostList: { list: [], sort: TradingApi.SORT.END_TIME_DESC },
                summary: {},
                filterSummary: {}
            };
            this._selling = {
                activeList: { list: [] },
                offerList: { list: [] },
                soldList: { list: [] },
                unsoldList: { list: [] },
                scheduledList: { list: [] },
                draftList: { list: [] },
                summary: {},
                filterSummary: {}
            };
            this._watching = {
                watchList: { list: [] },
                summary: {}
            };
        }
    },
    loadAllData: function () {
        if (Account.getAccount()) {
            this._loadAllBuyingData();
            this._loadAllSellingData();
        }
    },
    _loadBuyingData: function (aRequestArr, aCallback) {
        var token = Account.getAccount().get("token");
        var siteId = Site.siteIdForSite(Site.getHomeSite(true));
        if (!this._isUpdatingBuyingData) {
            this._isUpdatingBuyingData = true;
            ObserverHelper.notify(Topics.MY_BUYING_UPDATING);
        }
        TradingApi.getMyeBayBuying(token, siteId, aRequestArr, aCallback);
    },
    loadBuyingListData: function (aRequestObj) {
        var ignoreRequest = false;
        var mergeList = aRequestObj.pageNumber && aRequestObj.pageNumber > 1;
        var notificationTopic = Topics.MY_BUYING_LIST_UPDATED;
        switch (aRequestObj.name) {
            case TradingApi.BEST_OFFER_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._buying.summary.offerTotalPages;
                aRequestObj.sort = this._buying.offerList.sort;
                break;
            case TradingApi.BID_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._buying.summary.bidTotalPages;
                break;
            case TradingApi.WON_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._buying.summary.wonTotalPages;
                aRequestObj.sort = this._buying.wonList.sort;
                break;
            case TradingApi.LOST_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._buying.summary.lostTotalPages;
                aRequestObj.sort = this._buying.lostList.sort;
                break;
            case TradingApi.WATCH_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._watching.summary.watchTotalPages;
                aRequestObj.sort = this._watching.watchList.sort;
                aRequestObj.entriesPerPage = this.LIST_ITEM_BATCH_SIZE;
                notificationTopic = Topics.MY_BUYING_WATCH_LIST_UPDATED;
                break;
        }
        this._ignoreRequest[notificationTopic] = ignoreRequest;
        if (ignoreRequest) {
            this._isUpdatingBuyingData = false;
            ObserverHelper.notify(notificationTopic, null);
        }
        else {
            this._loadBuyingData([aRequestObj], function (aResult) {
                if (!aResult.errors) {
                    switch (aRequestObj.name) {
                        case TradingApi.BEST_OFFER_LIST:
                            this._buying.offerList.list =
                                mergeList ? this._buying.offerList.list.concat(aResult.lists.offerList) : aResult.lists.offerList;
                            this._buying.summary.offerCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                        case TradingApi.BID_LIST:
                            this._buying.bidList.list =
                                mergeList ? this._buying.bidList.list.concat(aResult.lists.bidList) : aResult.lists.bidList;
                            this._buying.summary.bidCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                        case TradingApi.WON_LIST:
                            this._buying.wonList.list =
                                mergeList ? this._buying.wonList.list.concat(aResult.lists.wonList) : aResult.lists.wonList;
                            this._buying.summary.wonCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                        case TradingApi.LOST_LIST:
                            this._buying.lostList.list =
                                mergeList ? this._buying.lostList.list.concat(aResult.lists.lostList) : aResult.lists.lostList;
                            this._buying.summary.lostCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                        case TradingApi.WATCH_LIST:
                            this._watching.watchList.list =
                                mergeList ? this._watching.watchList.list.concat(aResult.lists.watchList) : aResult.lists.watchList;
                            this._watching.summary.watchCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            for (var attrName in aResult.watchSummary) {
                                this._watching.summary[attrName] = aResult.watchSummary[attrName];
                            }
                            break;
                    }
                    for (var attrNameSummary in aResult.summary) {
                        this._buying.summary[attrNameSummary] = aResult.summary[attrNameSummary];
                    }
                    this._isUpdatingBuyingData = false;
                    ObserverHelper.notify(notificationTopic, aRequestObj.name);
                }
            }.bind(this));
        }
    },
    _loadAllBuyingData: function () {
        var requestArr = [
            { name: TradingApi.WATCH_LIST, sort: this._watching.watchList.sort,
                entriesPerPage: this.LIST_ITEM_BATCH_SIZE },
            { name: TradingApi.BID_LIST },
            { name: TradingApi.WON_LIST, sort: this._buying.wonList.sort },
            { name: TradingApi.LOST_LIST, sort: this._buying.lostList.sort },
            { name: TradingApi.BEST_OFFER_LIST, sort: this._buying.offerList.sort },
            { name: TradingApi.FAVORITE_SELLERS },
            { name: TradingApi.FAVORITE_SEARCHES }
        ];
        this._loadBuyingData(requestArr, function (aResult) {
            if (!aResult.errors) {
                this._watching.watchList.list = aResult.lists.watchList;
                this._watching.summary = aResult.watchSummary;
                this._buying.bidList.list = aResult.lists.bidList;
                this._buying.offerList.list = aResult.lists.offerList;
                this._buying.wonList.list = aResult.lists.wonList;
                this._buying.lostList.list = aResult.lists.lostList;
                this._buying.summary = aResult.summary;
                if (aResult.favoriteSellers) {
                    FavoriteSellerService.removeSellers();
                    FavoriteSellerService.updateSellers(aResult.favoriteSellers);
                }
                if (aResult.favoriteSearches) {
                    FavoriteSearchService.removeSearches();
                    FavoriteSearchService.updateSearches(aResult.favoriteSearches);
                }
                if (aResult.timestamp) {
                    CommonService.seteBayTime(aResult.timestamp);
                }
            }
            new Timer(function () {
                this._isUpdatingBuyingData = false;
                ObserverHelper.notify(Topics.MY_BUYING_UPDATED, null);
            }.bind(this), 0);
        }.bind(this));
    },
    _loadSellingData: function (aRequestArr, aCallback) {
        var token = Account.getAccount().get("token");
        var siteId = Site.siteIdForSite(Site.getHomeSite(true));
        if (!this._isUpdatingSellingData) {
            this._isUpdatingSellingData = true;
            ObserverHelper.notify(Topics.MY_SELLING_UPDATING);
        }
        TradingApi.getMyeBaySelling(token, siteId, aRequestArr, aCallback);
    },
    _loadSellingListFilterCount: function (aRequestObj) {
        if (aRequestObj.name == TradingApi.SOLD_LIST) {
            this._loadSellingData([aRequestObj], function (aResult) {
                if (!aResult.errors) {
                    if ("soldCount" in aResult.summary) {
                        var title = "";
                        if (aResult.summary.soldCount == 1 && aResult.lists.soldList.length > 0) {
                            title = aResult.lists.soldList[0].get("title");
                        }
                        this._selling.filterSummary[aRequestObj.filter] =
                            { count: aResult.summary.soldCount, title: title };
                    }
                    else {
                        this._selling.filterSummary[aRequestObj.filter] = { count: 0 };
                    }
                    ObserverHelper.notify(Topics.SELLING_SUMMARY_INFO_UPDATED, aRequestObj.filter);
                }
            }.bind(this));
        }
    },
    _loadSellingOfferListData: function (aRequestObj) {
        aRequestObj.name = TradingApi.SELLING_OFFER_LIST;
        aRequestObj.entriesPerPage = this.LIST_ITEM_BATCH_SIZE;
        if (!("pageNumber" in aRequestObj)) {
            aRequestObj.pageNumber = 1;
        }
        this._loadSellingData([aRequestObj], function (aResult) {
            if (!aResult.errors) {
                this._selling.summary.sellingOfferCurrentPage = aRequestObj.pageNumber;
                var list = aResult.lists.activeList;
                var len = list.length;
                var offerItems = [];
                var offerItemCount;
                for (var i = 0; i < len; i++) {
                    if (!list[i].get("bestOfferCount")) {
                        break;
                    }
                    list[i].set("type", Item.TYPES.SELLING_OFFER);
                    offerItems.push(list[i]);
                }
                offerItemCount = offerItems.length;
                if (aRequestObj.pageNumber == 1) {
                    this._selling.offerList.list = offerItems;
                    this._selling.summary.sellingOfferCount = offerItemCount;
                    this._selling.summary.sellingOfferItemTitle =
                        (offerItemCount > 0 ? offerItems[0].get("title") : "");
                }
                else {
                    this._selling.offerList.list =
                        this._selling.offerList.list.concat(offerItems);
                    this._selling.summary.sellingOfferCount += offerItemCount;
                }
                var nextPageNumber = aRequestObj.pageNumber + 1;
                if (offerItemCount !== 0 && offerItemCount == len &&
                    aResult.summary.activeTotalPages >= nextPageNumber) {
                    this._loadSellingOfferListData({ pageNumber: nextPageNumber });
                }
                else {
                    this._selling.summary.sellingOfferTotalPages = aRequestObj.pageNumber;
                }
                ObserverHelper.notify(Topics.SELLING_OFFER_LIST_UPDATED);
            }
        }.bind(this));
    },
    loadSellingListData: function (aRequestObj, aCallback) {
        var ignoreRequest = false;
        var mergeList = aRequestObj.pageNumber && aRequestObj.pageNumber > 1;
        switch (aRequestObj.name) {
            case TradingApi.SELLING_OFFER_LIST:
                ignoreRequest = true;
                break;
            case TradingApi.ACTIVE_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._selling.summary.activeTotalPages;
                aRequestObj.sort = this._selling.activeList.sort;
                break;
            case TradingApi.SOLD_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._selling.summary.soldTotalPages;
                aRequestObj.sort = this._selling.soldList.sort;
                aRequestObj.filter = this._selling.soldList.filter;
                break;
            case TradingApi.UNSOLD_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._selling.summary.unsoldTotalPages;
                aRequestObj.sort = this._selling.unsoldList.sort;
                break;
            case TradingApi.SCHEDULED_LIST:
                ignoreRequest = mergeList && aRequestObj.pageNumber > this._selling.summary.scheduledTotalPages;
                break;
        }
        this._ignoreRequest[Topics.MY_SELLING_LIST_UPDATED] = ignoreRequest;
        if (ignoreRequest) {
            this._isUpdatingSellingData = false;
            ObserverHelper.notify(Topics.MY_SELLING_LIST_UPDATED, null);
            if (aCallback) {
                aCallback();
            }
        }
        else {
            this._loadSellingData([aRequestObj], function (aResult) {
                if (!aResult.errors) {
                    switch (aRequestObj.name) {
                        case TradingApi.ACTIVE_LIST:
                            this._selling.activeList.list =
                                mergeList ? this._selling.activeList.list.concat(aResult.lists.activeList) : aResult.lists.activeList;
                            this._selling.summary.activeCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                        case TradingApi.SOLD_LIST:
                            this._selling.soldList.list =
                                mergeList ? this._selling.soldList.list.concat(aResult.lists.soldList) : aResult.lists.soldList;
                            this._selling.summary.soldCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                        case TradingApi.UNSOLD_LIST:
                            this._selling.unsoldList.list =
                                mergeList ? this._selling.unsoldList.list.concat(aResult.lists.unsoldList) : aResult.lists.unsoldList;
                            this._selling.summary.unsoldCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                        case TradingApi.SCHEDULED_LIST:
                            this._selling.scheduledList.list =
                                mergeList ? this._selling.scheduledList.list.concat(aResult.lists.scheduledList) : aResult.lists.scheduledList;
                            this._selling.summary.scheduledCurrentPage = mergeList ? aRequestObj.pageNumber : 1;
                            break;
                    }
                    for (var attrName in aResult.summary) {
                        this._selling.summary[attrName] = aResult.summary[attrName];
                    }
                    this._isUpdatingSellingData = false;
                    ObserverHelper.notify(Topics.MY_SELLING_LIST_UPDATED, aRequestObj.name);
                }
                if (aCallback) {
                    aCallback();
                }
            }.bind(this));
        }
    },
    _loadAllSellingData: function () {
        var requestArr = [
            { name: TradingApi.ACTIVE_LIST, sort: this._selling.activeList.sort },
            { name: TradingApi.SOLD_LIST, sort: this._selling.soldList.sort },
            { name: TradingApi.UNSOLD_LIST, sort: this._selling.unsoldList.sort },
            { name: TradingApi.SCHEDULED_LIST }
        ];
        this._loadSellingData(requestArr, function (aResult) {
            this._lastSellingCallTimestamp = (new Date()).getTime();
            if (!aResult.errors) {
                this._selling.activeList.list = aResult.lists.activeList;
                this._selling.soldList.list = aResult.lists.soldList;
                this._selling.unsoldList.list = aResult.lists.unsoldList;
                this._selling.scheduledList.list = aResult.lists.scheduledList;
                this._selling.draftList.list = aResult.lists.draftList;
                this._selling.summary = aResult.summary;
                if (this._selling.summary.soldCount > 0) {
                    this._loadSellingListFilterCount({
                        name: TradingApi.SOLD_LIST,
                        entriesPerPage: 1,
                        filter: this.FILTER.ALL
                    });
                    this._loadSellingListFilterCount({
                        name: TradingApi.SOLD_LIST,
                        entriesPerPage: 1,
                        filter: this.FILTER.AWAITING_PAYMENT
                    });
                    this._loadSellingListFilterCount({
                        name: TradingApi.SOLD_LIST,
                        entriesPerPage: 1,
                        filter: this.FILTER.AWAITING_SHIPMENT
                    });
                    this._loadSellingListFilterCount({
                        name: TradingApi.SOLD_LIST,
                        entriesPerPage: 1,
                        filter: this.FILTER.PAID_AND_SHIPPED
                    });
                }
                if (this._selling.summary.activeCount > 0) {
                    this._loadSellingOfferListData({ pageNumber: 1 });
                }
            }
            new Timer(function () {
                this._isUpdatingSellingData = false;
                ObserverHelper.notify(Topics.MY_SELLING_UPDATED, null);
            }.bind(this), 0);
        }.bind(this));
    },
    removeItemsFromList: function (aType, aItemIds) {
        var list = this.getList(aType);
        if (list) {
            for (var i = (list.length - 1); i >= 0; i--) {
                var index = aItemIds.indexOf(list[i].get("itemId"));
                if (index != -1) {
                    list.splice(i, 1);
                }
            }
        }
    },
    getItemFromList: function (aType, aItemId) {
        var item = null;
        items = this.getList(aType);
        $.each(items, function (aIndex, aItem) {
            if (aItem.get("itemId") == aItemId) {
                item = aItem;
                return item;
            }
        });
        return item;
    },
    updateItemEnded: function (aItem) {
        var listNames = [];
        listNames.push(TradingApi.WATCH_LIST);
        listNames.push(TradingApi.BID_LIST);
        listNames.push(TradingApi.BEST_OFFER_LIST);
        listNames.push(TradingApi.ACTIVE_LIST);
        listNames.push(TradingApi.SELLING_OFFER_LIST);
        var item = null;
        var itemId = aItem.get("itemId");
        $.each(listNames, function (aIndex, aListName) {
            item = MyEbayService.getItemFromList(aListName, itemId);
            if (null !== item) {
                item.set("timeLeft", "PT0S");
            }
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlFYmF5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2tncm91bmQvY29yZS9zZXJ2aWNlcy9teUViYXlTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBaUJILElBQUksYUFBYSxHQUFHO0lBQ2xCLG9CQUFvQixFQUFFLEVBQUU7SUFDeEIsTUFBTSxFQUFFO1FBQ04sR0FBRyxFQUFFLEtBQUs7UUFDVixnQkFBZ0IsRUFBRSxpQkFBaUI7UUFDbkMsaUJBQWlCLEVBQUUsa0JBQWtCO1FBQ3JDLGdCQUFnQixFQUFFLGdCQUFnQjtLQUNuQztJQUVELE9BQU8sRUFBRTtRQUNQLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7UUFDckIsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtRQUN2QixPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ3JCLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1FBQzNELE9BQU8sRUFBRSxFQUFFO1FBQ1gsYUFBYSxFQUFFLEVBQUU7S0FDbEI7SUFFRCxRQUFRLEVBQUU7UUFDUixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ3hCLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7UUFDdkIsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtRQUN0QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ3hCLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7UUFDM0IsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtRQUN2QixPQUFPLEVBQUUsRUFBRTtRQUNYLGFBQWEsRUFBRSxFQUFFO0tBQ2xCO0lBRUQsU0FBUyxF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cmlnaHQgKEMpIDIwMDctMjAxNSBlQmF5IEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqL1xuXG4vKlxuICB2YXIgTG9nZ2VyID0gcmVxdWlyZShcImhlbHBlcnMvbG9nZ2VyXCIpLkxvZ2dlcjtcbiAgdmFyIFRvcGljcyA9IHJlcXVpcmUoXCJoZWxwZXJzL29ic2VydmVySGVscGVyXCIpLlRvcGljcztcbiAgdmFyIE9ic2VydmVySGVscGVyID0gcmVxdWlyZShcImhlbHBlcnMvb2JzZXJ2ZXJIZWxwZXJcIikuT2JzZXJ2ZXJIZWxwZXI7XG4gIHZhciBUaW1lciA9IHJlcXVpcmUoXCJoZWxwZXJzL3RpbWVyXCIpLlRpbWVyO1xuICB2YXIgQWNjb3VudCA9IHJlcXVpcmUoXCJjb3JlL29iamVjdHMvYWNjb3VudFwiKS5BY2NvdW50O1xuICB2YXIgRmF2b3JpdGVTZWFyY2hTZXJ2aWNlID0gcmVxdWlyZShcImNvcmUvc2VydmljZXMvZmF2b3JpdGVTZWFyY2hTZXJ2aWNlXCIpLkZhdm9yaXRlU2VhcmNoU2VydmljZTtcbiAgdmFyIEZhdm9yaXRlU2VsbGVyU2VydmljZSA9IHJlcXVpcmUoXCJjb3JlL3NlcnZpY2VzL2Zhdm9yaXRlU2VsbGVyU2VydmljZVwiKS5GYXZvcml0ZVNlbGxlclNlcnZpY2U7XG4gIHZhciBDb21tb25TZXJ2aWNlID0gcmVxdWlyZShcImNvcmUvc2VydmljZXMvY29tbW9uU2VydmljZVwiKS5Db21tb25TZXJ2aWNlO1xuICB2YXIgVHJhZGluZ0FwaSA9IHJlcXVpcmUoXCJjb3JlL2FwaXMvdHJhZGluZ0FwaVwiKS5UcmFkaW5nQXBpO1xuKi9cblxuLyoqXG4gKiBNeSBlQmF5IHNlcnZpY2UuXG4gKi9cbnZhciBNeUViYXlTZXJ2aWNlID0ge1xuICBMSVNUX0lURU1fQkFUQ0hfU0laRTogMjUsXG4gIEZJTFRFUjoge1xuICAgIEFMTDogXCJBbGxcIixcbiAgICBBV0FJVElOR19QQVlNRU5UOiBcIkF3YWl0aW5nUGF5bWVudFwiLFxuICAgIEFXQUlUSU5HX1NISVBNRU5UOiBcIkF3YWl0aW5nU2hpcG1lbnRcIixcbiAgICBQQUlEX0FORF9TSElQUEVEOiBcIlBhaWRBbmRTaGlwcGVkXCJcbiAgfSxcblxuICBfYnV5aW5nOiB7XG4gICAgYmlkTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgIG9mZmVyTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgIHdvbkxpc3Q6IHsgbGlzdDogW10gfSxcbiAgICBsb3N0TGlzdDogeyBsaXN0OiBbXSwgc29ydDogVHJhZGluZ0FwaS5TT1JULkVORF9USU1FX0RFU0MgfSxcbiAgICBzdW1tYXJ5OiB7fSxcbiAgICBmaWx0ZXJTdW1tYXJ5OiB7fVxuICB9LFxuXG4gIF9zZWxsaW5nOiB7XG4gICAgYWN0aXZlTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgIG9mZmVyTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgIHNvbGRMaXN0OiB7IGxpc3Q6IFtdIH0sXG4gICAgdW5zb2xkTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgIHNjaGVkdWxlZExpc3Q6IHsgbGlzdDogW10gfSxcbiAgICBkcmFmdExpc3Q6IHsgbGlzdDogW10gfSxcbiAgICBzdW1tYXJ5OiB7fSxcbiAgICBmaWx0ZXJTdW1tYXJ5OiB7fVxuICB9LFxuXG4gIF93YXRjaGluZzoge1xuICAgIHdhdGNoTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgIHN1bW1hcnk6IHt9XG4gIH0sXG5cbiAgX2xhc3RTZWxsaW5nQ2FsbFRpbWVzdGFtcCA6IG51bGwsXG4gIF9pc1VwZGF0aW5nQnV5aW5nRGF0YSA6IGZhbHNlLFxuICBfaXNVcGRhdGluZ1NlbGxpbmdEYXRhIDogZmFsc2UsXG4gIF9pZ25vcmVSZXF1ZXN0IDogW10sXG5cbiAgZ2V0TGlzdCA6IGZ1bmN0aW9uKGFUeXBlKSB7XG4gICAgdmFyIGxpc3QgPSBbXTtcblxuICAgIHN3aXRjaCAoYVR5cGUpIHtcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5XQVRDSF9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fd2F0Y2hpbmcud2F0Y2hMaXN0Lmxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLkJJRF9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLmJpZExpc3QubGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuV09OX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9idXlpbmcud29uTGlzdC5saXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5MT1NUX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9idXlpbmcubG9zdExpc3QubGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQkVTVF9PRkZFUl9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLm9mZmVyTGlzdC5saXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5BQ1RJVkVfTElTVDpcbiAgICAgICAgbGlzdCA9IHRoaXMuX3NlbGxpbmcuYWN0aXZlTGlzdC5saXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5TRUxMSU5HX09GRkVSX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLm9mZmVyTGlzdC5saXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5TT0xEX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLnNvbGRMaXN0Lmxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLlVOU09MRF9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fc2VsbGluZy51bnNvbGRMaXN0Lmxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLlNDSEVEVUxFRF9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fc2VsbGluZy5zY2hlZHVsZWRMaXN0Lmxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBsaXN0O1xuICB9LFxuXG4gIGdldFN1bW1hcnkgOiBmdW5jdGlvbihhVHlwZSkge1xuICAgIHZhciBzdW1tYXJ5ID0geyBjb3VudDogMCwgY3VycmVudFBhZ2U6IDEgfTtcblxuICAgIHN3aXRjaCAoYVR5cGUpIHtcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5XQVRDSF9MSVNUOlxuICAgICAgICBpZiAoXCJ3YXRjaENvdW50XCIgaW4gdGhpcy5fd2F0Y2hpbmcuc3VtbWFyeSkge1xuICAgICAgICAgIHN1bW1hcnkuY291bnQgPSB0aGlzLl9idXlpbmcuc3VtbWFyeS53YXRjaENvdW50O1xuICAgICAgICB9XG4gICAgICAgIGlmIChcIndhdGNoQ3VycmVudFBhZ2VcIiBpbiB0aGlzLl93YXRjaGluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jdXJyZW50UGFnZSA9IHRoaXMuX3dhdGNoaW5nLnN1bW1hcnkud2F0Y2hDdXJyZW50UGFnZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5CSURfTElTVDpcbiAgICAgICAgaWYgKFwiYmlkQ291bnRcIiBpbiB0aGlzLl9idXlpbmcuc3VtbWFyeSkge1xuICAgICAgICAgIHN1bW1hcnkuY291bnQgPSB0aGlzLl9idXlpbmcuc3VtbWFyeS5iaWRDb3VudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJiaWRDdXJyZW50UGFnZVwiIGluIHRoaXMuX2J1eWluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jdXJyZW50UGFnZSA9IHRoaXMuX2J1eWluZy5zdW1tYXJ5LmJpZEN1cnJlbnRQYWdlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLldPTl9MSVNUOlxuICAgICAgICBpZiAoXCJ3b25Db3VudFwiIGluIHRoaXMuX2J1eWluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jb3VudCA9IHRoaXMuX2J1eWluZy5zdW1tYXJ5LndvbkNvdW50O1xuICAgICAgICB9XG4gICAgICAgIGlmIChcIndvbkN1cnJlbnRQYWdlXCIgaW4gdGhpcy5fYnV5aW5nLnN1bW1hcnkpIHtcbiAgICAgICAgICBzdW1tYXJ5LmN1cnJlbnRQYWdlID0gdGhpcy5fYnV5aW5nLnN1bW1hcnkud29uQ3VycmVudFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuTE9TVF9MSVNUOlxuICAgICAgICBpZiAoXCJsb3N0Q291bnRcIiBpbiB0aGlzLl9idXlpbmcuc3VtbWFyeSkge1xuICAgICAgICAgIHN1bW1hcnkuY291bnQgPSB0aGlzLl9idXlpbmcuc3VtbWFyeS5sb3N0Q291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwibG9zdEN1cnJlbnRQYWdlXCIgaW4gdGhpcy5fYnV5aW5nLnN1bW1hcnkpIHtcbiAgICAgICAgICBzdW1tYXJ5LmN1cnJlbnRQYWdlID0gdGhpcy5fYnV5aW5nLnN1bW1hcnkubG9zdEN1cnJlbnRQYWdlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLkJFU1RfT0ZGRVJfTElTVDpcbiAgICAgICAgaWYgKFwib2ZmZXJDb3VudFwiIGluIHRoaXMuX2J1eWluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jb3VudCA9IHRoaXMuX2J1eWluZy5zdW1tYXJ5Lm9mZmVyQ291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwib2ZmZXJDdXJyZW50UGFnZVwiIGluIHRoaXMuX2J1eWluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jdXJyZW50UGFnZSA9IHRoaXMuX2J1eWluZy5zdW1tYXJ5Lm9mZmVyQ3VycmVudFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQUNUSVZFX0xJU1Q6XG4gICAgICAgIGlmIChcImFjdGl2ZUNvdW50XCIgaW4gdGhpcy5fc2VsbGluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jb3VudCA9IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5hY3RpdmVDb3VudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJhY3RpdmVDdXJyZW50UGFnZVwiIGluIHRoaXMuX2J1eWluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jdXJyZW50UGFnZSA9IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5hY3RpdmVDdXJyZW50UGFnZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5TRUxMSU5HX09GRkVSX0xJU1Q6XG4gICAgICAgIGlmIChcInNlbGxpbmdPZmZlckNvdW50XCIgaW4gdGhpcy5fc2VsbGluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jb3VudCA9IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5zZWxsaW5nT2ZmZXJDb3VudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJzZWxsaW5nT2ZmZXJDdXJyZW50UGFnZVwiIGluIHRoaXMuX3NlbGxpbmcuc3VtbWFyeSkge1xuICAgICAgICAgIHN1bW1hcnkuY3VycmVudFBhZ2UgPSB0aGlzLl9zZWxsaW5nLnN1bW1hcnkuc2VsbGluZ09mZmVyQ3VycmVudFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwic2VsbGluZ09mZmVySXRlbVRpdGxlXCIgaW4gdGhpcy5fc2VsbGluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS50aXRsZSA9IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5zZWxsaW5nT2ZmZXJJdGVtVGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuU09MRF9MSVNUOlxuICAgICAgICBpZiAoXCJzb2xkQ291bnRcIiBpbiB0aGlzLl9zZWxsaW5nLnN1bW1hcnkpIHtcbiAgICAgICAgICBzdW1tYXJ5LmNvdW50ID0gdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNvbGRDb3VudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJzb2xkQ3VycmVudFBhZ2VcIiBpbiB0aGlzLl9zZWxsaW5nLnN1bW1hcnkpIHtcbiAgICAgICAgICBzdW1tYXJ5LmN1cnJlbnRQYWdlID0gdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNvbGRDdXJyZW50UGFnZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5VTlNPTERfTElTVDpcbiAgICAgICAgaWYgKFwidW5zb2xkQ291bnRcIiBpbiB0aGlzLl9zZWxsaW5nLnN1bW1hcnkpIHtcbiAgICAgICAgICBzdW1tYXJ5LmNvdW50ID0gdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnVuc29sZENvdW50O1xuICAgICAgICB9XG4gICAgICAgIGlmIChcInVuc29sZEN1cnJlbnRQYWdlXCIgaW4gdGhpcy5fc2VsbGluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jdXJyZW50UGFnZSA9IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS51bnNvbGRDdXJyZW50UGFnZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5TQ0hFRFVMRURfTElTVDpcbiAgICAgICAgaWYgKFwic2NoZWR1bGVkQ291bnRcIiBpbiB0aGlzLl9zZWxsaW5nLnN1bW1hcnkpIHtcbiAgICAgICAgICBzdW1tYXJ5LmNvdW50ID0gdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNjaGVkdWxlZENvdW50O1xuICAgICAgICB9XG4gICAgICAgIGlmIChcInNjaGVkdWxlZEN1cnJlbnRQYWdlXCIgaW4gdGhpcy5fc2VsbGluZy5zdW1tYXJ5KSB7XG4gICAgICAgICAgc3VtbWFyeS5jdXJyZW50UGFnZSA9IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5zY2hlZHVsZWRDdXJyZW50UGFnZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gc3VtbWFyeTtcbiAgfSxcblxuICBnZXRGaWx0ZXJTdW1tYXJ5IDogZnVuY3Rpb24oYUZpbHRlcikge1xuICAgIGlmIChhRmlsdGVyIGluIHRoaXMuX3NlbGxpbmcuZmlsdGVyU3VtbWFyeSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NlbGxpbmcuZmlsdGVyU3VtbWFyeVthRmlsdGVyXTtcbiAgICB9XG4gICAgcmV0dXJuIHsgY291bnQ6IDAgfTtcbiAgfSxcblxuICBnZXRSZWZpbmUgOiBmdW5jdGlvbihhVHlwZSkge1xuICAgIHZhciByZWZpbmUgPSB7IHNvcnQ6IG51bGwsIGZpbHRlcjogbnVsbCB9O1xuICAgIHZhciBsaXN0O1xuXG4gICAgc3dpdGNoIChhVHlwZSkge1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLldBVENIX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl93YXRjaGluZy53YXRjaExpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLkJJRF9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLmJpZExpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLldPTl9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLndvbkxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLkxPU1RfTElTVDpcbiAgICAgICAgbGlzdCA9IHRoaXMuX2J1eWluZy5sb3N0TGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQkVTVF9PRkZFUl9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLm9mZmVyTGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQUNUSVZFX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLmFjdGl2ZUxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLlNFTExJTkdfT0ZGRVJfTElTVDpcbiAgICAgICAgbGlzdCA9IHRoaXMuX3NlbGxpbmcub2ZmZXJMaXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5TT0xEX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLnNvbGRMaXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5VTlNPTERfTElTVDpcbiAgICAgICAgbGlzdCA9IHRoaXMuX3NlbGxpbmcudW5zb2xkTGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuU0NIRURVTEVEX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLnNjaGVkdWxlZExpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChcInNvcnRcIiBpbiBsaXN0KSB7XG4gICAgICByZWZpbmUuc29ydCA9IGxpc3Quc29ydDtcbiAgICB9XG4gICAgaWYgKFwiZmlsdGVyXCIgaW4gbGlzdCkge1xuICAgICAgcmVmaW5lLmZpbHRlciA9IGxpc3QuZmlsdGVyO1xuICAgIH1cblxuICAgIHJldHVybiByZWZpbmU7XG4gIH0sXG5cbiAgc2V0UmVmaW5lIDogZnVuY3Rpb24oYVR5cGUsIGFWYWx1ZSkge1xuICAgIHZhciBsaXN0O1xuXG4gICAgc3dpdGNoIChhVHlwZSkge1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLldBVENIX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl93YXRjaGluZy53YXRjaExpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLkJJRF9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLmJpZExpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLldPTl9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLndvbkxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLkxPU1RfTElTVDpcbiAgICAgICAgbGlzdCA9IHRoaXMuX2J1eWluZy5sb3N0TGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQkVTVF9PRkZFUl9MSVNUOlxuICAgICAgICBsaXN0ID0gdGhpcy5fYnV5aW5nLm9mZmVyTGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQUNUSVZFX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLmFjdGl2ZUxpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLlNFTExJTkdfT0ZGRVJfTElTVDpcbiAgICAgICAgbGlzdCA9IHRoaXMuX3NlbGxpbmcub2ZmZXJMaXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5TT0xEX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLnNvbGRMaXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5VTlNPTERfTElTVDpcbiAgICAgICAgbGlzdCA9IHRoaXMuX3NlbGxpbmcudW5zb2xkTGlzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuU0NIRURVTEVEX0xJU1Q6XG4gICAgICAgIGxpc3QgPSB0aGlzLl9zZWxsaW5nLnNjaGVkdWxlZExpc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChcInNvcnRcIiBpbiBhVmFsdWUpIHtcbiAgICAgIGxpc3Quc29ydCA9IGFWYWx1ZS5zb3J0O1xuICAgIH1cbiAgICBpZiAoXCJmaWx0ZXJcIiBpbiBhVmFsdWUpIHtcbiAgICAgIGxpc3QuZmlsdGVyID0gYVZhbHVlLmZpbHRlcjtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0IGxhc3RTZWxsaW5nQ2FsbFRpbWVzdGFtcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlbGxpbmdDYWxsVGltZXN0YW1wO1xuICB9LFxuXG4gIGdldCBpc1VwZGF0aW5nQnV5aW5nRGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNVcGRhdGluZ0J1eWluZ0RhdGE7XG4gIH0sXG5cbiAgZ2V0IGlzVXBkYXRpbmdTZWxsaW5nRGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNVcGRhdGluZ1NlbGxpbmdEYXRhO1xuICB9LFxuXG4gIGdldCBpZ25vcmVSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLl9pZ25vcmVSZXF1ZXN0O1xuICB9LFxuXG4gIHN0YXJ0U2VydmljZSA6IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIHRoaXMubG9hZEFsbERhdGEoKTtcbiAgfSxcblxuICBzdG9wU2VydmljZSA6IGZ1bmN0aW9uKGFTaWduT3V0KSB7XG4gICAgXG4gICAgLy8gV2Ugb25seSBjbGVhciB0aGUgbGlzdCBvbiBzaWduIG91dFxuICAgIGlmIChhU2lnbk91dCkge1xuICAgICAgdGhpcy5fYnV5aW5nID0ge1xuICAgICAgICBiaWRMaXN0OiB7IGxpc3Q6IFtdIH0sXG4gICAgICAgIG9mZmVyTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgICAgICB3b25MaXN0OiB7IGxpc3Q6IFtdIH0sXG4gICAgICAgIGxvc3RMaXN0OiB7IGxpc3Q6IFtdLCBzb3J0OiBUcmFkaW5nQXBpLlNPUlQuRU5EX1RJTUVfREVTQyB9LFxuICAgICAgICBzdW1tYXJ5OiB7fSxcbiAgICAgICAgZmlsdGVyU3VtbWFyeToge31cbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX3NlbGxpbmcgPSB7XG4gICAgICAgIGFjdGl2ZUxpc3Q6IHsgbGlzdDogW10gfSxcbiAgICAgICAgb2ZmZXJMaXN0OiB7IGxpc3Q6IFtdIH0sXG4gICAgICAgIHNvbGRMaXN0OiB7IGxpc3Q6IFtdIH0sXG4gICAgICAgIHVuc29sZExpc3Q6IHsgbGlzdDogW10gfSxcbiAgICAgICAgc2NoZWR1bGVkTGlzdDogeyBsaXN0OiBbXSB9LFxuICAgICAgICBkcmFmdExpc3Q6IHsgbGlzdDogW10gfSxcbiAgICAgICAgc3VtbWFyeToge30sXG4gICAgICAgIGZpbHRlclN1bW1hcnk6IHt9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLl93YXRjaGluZyA9IHtcbiAgICAgICAgd2F0Y2hMaXN0OiB7IGxpc3Q6IFtdIH0sXG4gICAgICAgIHN1bW1hcnk6IHt9XG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICBsb2FkQWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGlmIChBY2NvdW50LmdldEFjY291bnQoKSkge1xuICAgICAgdGhpcy5fbG9hZEFsbEJ1eWluZ0RhdGEoKTtcbiAgICAgIHRoaXMuX2xvYWRBbGxTZWxsaW5nRGF0YSgpO1xuICAgIH1cbiAgfSxcblxuICBfbG9hZEJ1eWluZ0RhdGEgOiBmdW5jdGlvbihhUmVxdWVzdEFyciwgYUNhbGxiYWNrKSB7XG5cbiAgICAvKlxuICAgICAgQWNjb3VudFNlcnZpY2UgPSByZXF1aXJlKFwiY29yZS9zZXJ2aWNlcy9hY2NvdW50U2VydmljZVwiKS5BY2NvdW50U2VydmljZTtcbiAgICAqL1xuICAgIHZhciB0b2tlbiA9IEFjY291bnQuZ2V0QWNjb3VudCgpLmdldChcInRva2VuXCIpO1xuICAgIHZhciBzaXRlSWQgPSBTaXRlLnNpdGVJZEZvclNpdGUoU2l0ZS5nZXRIb21lU2l0ZSh0cnVlKSk7XG5cbiAgICBpZiAoIXRoaXMuX2lzVXBkYXRpbmdCdXlpbmdEYXRhKSB7XG4gICAgICB0aGlzLl9pc1VwZGF0aW5nQnV5aW5nRGF0YSA9IHRydWU7XG4gICAgICBPYnNlcnZlckhlbHBlci5ub3RpZnkoVG9waWNzLk1ZX0JVWUlOR19VUERBVElORyk7XG4gICAgfVxuXG4gICAgVHJhZGluZ0FwaS5nZXRNeWVCYXlCdXlpbmcodG9rZW4sIHNpdGVJZCwgYVJlcXVlc3RBcnIsIGFDYWxsYmFjayk7XG4gIH0sXG5cbiAgbG9hZEJ1eWluZ0xpc3REYXRhIDogZnVuY3Rpb24oYVJlcXVlc3RPYmopIHtcbiAgICBcbiAgICB2YXIgaWdub3JlUmVxdWVzdCA9IGZhbHNlO1xuICAgIHZhciBtZXJnZUxpc3QgPSBhUmVxdWVzdE9iai5wYWdlTnVtYmVyICYmIGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgPiAxO1xuICAgIHZhciBub3RpZmljYXRpb25Ub3BpYyA9IFRvcGljcy5NWV9CVVlJTkdfTElTVF9VUERBVEVEO1xuXG4gICAgc3dpdGNoKGFSZXF1ZXN0T2JqLm5hbWUpIHtcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5CRVNUX09GRkVSX0xJU1Q6XG4gICAgICAgIGlnbm9yZVJlcXVlc3QgPSBtZXJnZUxpc3QgJiYgYVJlcXVlc3RPYmoucGFnZU51bWJlciA+IHRoaXMuX2J1eWluZy5zdW1tYXJ5Lm9mZmVyVG90YWxQYWdlcztcbiAgICAgICAgYVJlcXVlc3RPYmouc29ydCA9IHRoaXMuX2J1eWluZy5vZmZlckxpc3Quc29ydDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQklEX0xJU1Q6XG4gICAgICAgIGlnbm9yZVJlcXVlc3QgPSBtZXJnZUxpc3QgJiYgYVJlcXVlc3RPYmoucGFnZU51bWJlciA+IHRoaXMuX2J1eWluZy5zdW1tYXJ5LmJpZFRvdGFsUGFnZXM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLldPTl9MSVNUOlxuICAgICAgICBpZ25vcmVSZXF1ZXN0ID0gbWVyZ2VMaXN0ICYmIGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgPiB0aGlzLl9idXlpbmcuc3VtbWFyeS53b25Ub3RhbFBhZ2VzO1xuICAgICAgICBhUmVxdWVzdE9iai5zb3J0ID0gdGhpcy5fYnV5aW5nLndvbkxpc3Quc29ydDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuTE9TVF9MSVNUOlxuICAgICAgICBpZ25vcmVSZXF1ZXN0ID0gbWVyZ2VMaXN0ICYmIGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgPiB0aGlzLl9idXlpbmcuc3VtbWFyeS5sb3N0VG90YWxQYWdlcztcbiAgICAgICAgYVJlcXVlc3RPYmouc29ydCA9IHRoaXMuX2J1eWluZy5sb3N0TGlzdC5zb3J0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5XQVRDSF9MSVNUOlxuICAgICAgICBpZ25vcmVSZXF1ZXN0ID0gbWVyZ2VMaXN0ICYmIGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgPiB0aGlzLl93YXRjaGluZy5zdW1tYXJ5LndhdGNoVG90YWxQYWdlcztcbiAgICAgICAgYVJlcXVlc3RPYmouc29ydCA9IHRoaXMuX3dhdGNoaW5nLndhdGNoTGlzdC5zb3J0O1xuICAgICAgICBhUmVxdWVzdE9iai5lbnRyaWVzUGVyUGFnZSA9IHRoaXMuTElTVF9JVEVNX0JBVENIX1NJWkU7XG4gICAgICAgIG5vdGlmaWNhdGlvblRvcGljID0gVG9waWNzLk1ZX0JVWUlOR19XQVRDSF9MSVNUX1VQREFURUQ7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX2lnbm9yZVJlcXVlc3Rbbm90aWZpY2F0aW9uVG9waWNdID0gaWdub3JlUmVxdWVzdDtcblxuICAgIGlmIChpZ25vcmVSZXF1ZXN0KSB7XG4gICAgICB0aGlzLl9pc1VwZGF0aW5nQnV5aW5nRGF0YSA9IGZhbHNlO1xuICAgICAgT2JzZXJ2ZXJIZWxwZXIubm90aWZ5KG5vdGlmaWNhdGlvblRvcGljLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbG9hZEJ1eWluZ0RhdGEoW2FSZXF1ZXN0T2JqXSwgZnVuY3Rpb24oYVJlc3VsdCkge1xuICAgICAgICBpZiAoIWFSZXN1bHQuZXJyb3JzKSB7XG4gICAgICAgICAgc3dpdGNoKGFSZXF1ZXN0T2JqLm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgVHJhZGluZ0FwaS5CRVNUX09GRkVSX0xJU1Q6XG4gICAgICAgICAgICAgIHRoaXMuX2J1eWluZy5vZmZlckxpc3QubGlzdCA9XG4gICAgICAgICAgICAgICAgbWVyZ2VMaXN0ID8gdGhpcy5fYnV5aW5nLm9mZmVyTGlzdC5saXN0LmNvbmNhdChhUmVzdWx0Lmxpc3RzLm9mZmVyTGlzdCkgOiBhUmVzdWx0Lmxpc3RzLm9mZmVyTGlzdDtcbiAgICAgICAgICAgICAgdGhpcy5fYnV5aW5nLnN1bW1hcnkub2ZmZXJDdXJyZW50UGFnZSA9IG1lcmdlTGlzdCA/IGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgOiAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhZGluZ0FwaS5CSURfTElTVDpcbiAgICAgICAgICAgICAgdGhpcy5fYnV5aW5nLmJpZExpc3QubGlzdCA9XG4gICAgICAgICAgICAgICAgbWVyZ2VMaXN0ID8gdGhpcy5fYnV5aW5nLmJpZExpc3QubGlzdC5jb25jYXQoYVJlc3VsdC5saXN0cy5iaWRMaXN0KSA6IGFSZXN1bHQubGlzdHMuYmlkTGlzdDtcbiAgICAgICAgICAgICAgdGhpcy5fYnV5aW5nLnN1bW1hcnkuYmlkQ3VycmVudFBhZ2UgPSAgbWVyZ2VMaXN0ID8gYVJlcXVlc3RPYmoucGFnZU51bWJlciA6IDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBUcmFkaW5nQXBpLldPTl9MSVNUOlxuICAgICAgICAgICAgICB0aGlzLl9idXlpbmcud29uTGlzdC5saXN0ID1cbiAgICAgICAgICAgICAgICBtZXJnZUxpc3QgPyB0aGlzLl9idXlpbmcud29uTGlzdC5saXN0LmNvbmNhdChhUmVzdWx0Lmxpc3RzLndvbkxpc3QpIDogYVJlc3VsdC5saXN0cy53b25MaXN0O1xuICAgICAgICAgICAgICB0aGlzLl9idXlpbmcuc3VtbWFyeS53b25DdXJyZW50UGFnZSA9ICBtZXJnZUxpc3QgPyBhUmVxdWVzdE9iai5wYWdlTnVtYmVyIDogMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRyYWRpbmdBcGkuTE9TVF9MSVNUOlxuICAgICAgICAgICAgICB0aGlzLl9idXlpbmcubG9zdExpc3QubGlzdCA9XG4gICAgICAgICAgICAgICAgbWVyZ2VMaXN0ID8gdGhpcy5fYnV5aW5nLmxvc3RMaXN0Lmxpc3QuY29uY2F0KGFSZXN1bHQubGlzdHMubG9zdExpc3QpIDogYVJlc3VsdC5saXN0cy5sb3N0TGlzdDtcbiAgICAgICAgICAgICAgdGhpcy5fYnV5aW5nLnN1bW1hcnkubG9zdEN1cnJlbnRQYWdlID0gbWVyZ2VMaXN0ID8gYVJlcXVlc3RPYmoucGFnZU51bWJlciA6IDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBUcmFkaW5nQXBpLldBVENIX0xJU1Q6XG4gICAgICAgICAgICAgIHRoaXMuX3dhdGNoaW5nLndhdGNoTGlzdC5saXN0ID1cbiAgICAgICAgICAgICAgICBtZXJnZUxpc3QgPyB0aGlzLl93YXRjaGluZy53YXRjaExpc3QubGlzdC5jb25jYXQoYVJlc3VsdC5saXN0cy53YXRjaExpc3QpIDogYVJlc3VsdC5saXN0cy53YXRjaExpc3Q7XG4gICAgICAgICAgICAgIHRoaXMuX3dhdGNoaW5nLnN1bW1hcnkud2F0Y2hDdXJyZW50UGFnZSA9IG1lcmdlTGlzdCA/IGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgOiAxO1xuICAgICAgICAgICAgICBmb3IgKHZhciBhdHRyTmFtZSBpbiBhUmVzdWx0LndhdGNoU3VtbWFyeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3dhdGNoaW5nLnN1bW1hcnlbYXR0ck5hbWVdID0gYVJlc3VsdC53YXRjaFN1bW1hcnlbYXR0ck5hbWVdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKHZhciBhdHRyTmFtZVN1bW1hcnkgaW4gYVJlc3VsdC5zdW1tYXJ5KSB7XG4gICAgICAgICAgICB0aGlzLl9idXlpbmcuc3VtbWFyeVthdHRyTmFtZVN1bW1hcnldID0gYVJlc3VsdC5zdW1tYXJ5W2F0dHJOYW1lU3VtbWFyeV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5faXNVcGRhdGluZ0J1eWluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICBPYnNlcnZlckhlbHBlci5ub3RpZnkobm90aWZpY2F0aW9uVG9waWMsIGFSZXF1ZXN0T2JqLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cbiAgfSxcblxuICBfbG9hZEFsbEJ1eWluZ0RhdGEgOiBmdW5jdGlvbigpIHtcbiAgICBcbiAgICB2YXIgcmVxdWVzdEFyciA9IFtcbiAgICAgIHsgbmFtZTogVHJhZGluZ0FwaS5XQVRDSF9MSVNULCBzb3J0OiB0aGlzLl93YXRjaGluZy53YXRjaExpc3Quc29ydCxcbiAgICAgICAgZW50cmllc1BlclBhZ2U6IHRoaXMuTElTVF9JVEVNX0JBVENIX1NJWkUgfSxcbiAgICAgIHsgbmFtZTogVHJhZGluZ0FwaS5CSURfTElTVCB9LFxuICAgICAgeyBuYW1lOiBUcmFkaW5nQXBpLldPTl9MSVNULCBzb3J0OiB0aGlzLl9idXlpbmcud29uTGlzdC5zb3J0IH0sXG4gICAgICB7IG5hbWU6IFRyYWRpbmdBcGkuTE9TVF9MSVNULCBzb3J0OiB0aGlzLl9idXlpbmcubG9zdExpc3Quc29ydCB9LFxuICAgICAgeyBuYW1lOiBUcmFkaW5nQXBpLkJFU1RfT0ZGRVJfTElTVCwgc29ydDogdGhpcy5fYnV5aW5nLm9mZmVyTGlzdC5zb3J0IH0sXG4gICAgICB7IG5hbWU6IFRyYWRpbmdBcGkuRkFWT1JJVEVfU0VMTEVSUyB9LFxuICAgICAgeyBuYW1lOiBUcmFkaW5nQXBpLkZBVk9SSVRFX1NFQVJDSEVTIH1cbiAgICBdO1xuXG4gICAgdGhpcy5fbG9hZEJ1eWluZ0RhdGEocmVxdWVzdEFyciwgZnVuY3Rpb24oYVJlc3VsdCkge1xuICAgICAgaWYgKCFhUmVzdWx0LmVycm9ycykge1xuICAgICAgICB0aGlzLl93YXRjaGluZy53YXRjaExpc3QubGlzdCA9IGFSZXN1bHQubGlzdHMud2F0Y2hMaXN0O1xuICAgICAgICB0aGlzLl93YXRjaGluZy5zdW1tYXJ5ID0gYVJlc3VsdC53YXRjaFN1bW1hcnk7XG4gICAgICAgIHRoaXMuX2J1eWluZy5iaWRMaXN0Lmxpc3QgPSBhUmVzdWx0Lmxpc3RzLmJpZExpc3Q7XG4gICAgICAgIHRoaXMuX2J1eWluZy5vZmZlckxpc3QubGlzdCA9IGFSZXN1bHQubGlzdHMub2ZmZXJMaXN0O1xuICAgICAgICB0aGlzLl9idXlpbmcud29uTGlzdC5saXN0ID0gYVJlc3VsdC5saXN0cy53b25MaXN0O1xuICAgICAgICB0aGlzLl9idXlpbmcubG9zdExpc3QubGlzdCA9IGFSZXN1bHQubGlzdHMubG9zdExpc3Q7XG4gICAgICAgIHRoaXMuX2J1eWluZy5zdW1tYXJ5ID0gYVJlc3VsdC5zdW1tYXJ5O1xuXG4gICAgICAgIC8vIFVwZGF0ZXMgdGhlIHNlbGxlcnMuXG4gICAgICAgIGlmIChhUmVzdWx0LmZhdm9yaXRlU2VsbGVycykge1xuICAgICAgICAgIEZhdm9yaXRlU2VsbGVyU2VydmljZS5yZW1vdmVTZWxsZXJzKCk7XG4gICAgICAgICAgRmF2b3JpdGVTZWxsZXJTZXJ2aWNlLnVwZGF0ZVNlbGxlcnMoYVJlc3VsdC5mYXZvcml0ZVNlbGxlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBkYXRlcyB0aGUgc2VhcmNoZXMuXG4gICAgICAgIGlmIChhUmVzdWx0LmZhdm9yaXRlU2VhcmNoZXMpIHtcbiAgICAgICAgICBGYXZvcml0ZVNlYXJjaFNlcnZpY2UucmVtb3ZlU2VhcmNoZXMoKTtcbiAgICAgICAgICBGYXZvcml0ZVNlYXJjaFNlcnZpY2UudXBkYXRlU2VhcmNoZXMoYVJlc3VsdC5mYXZvcml0ZVNlYXJjaGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBlQmF5IHRpbWUuXG4gICAgICAgIGlmIChhUmVzdWx0LnRpbWVzdGFtcCkge1xuICAgICAgICAgIENvbW1vblNlcnZpY2Uuc2V0ZUJheVRpbWUoYVJlc3VsdC50aW1lc3RhbXApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNVcGRhdGluZ0J1eWluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgT2JzZXJ2ZXJIZWxwZXIubm90aWZ5KFRvcGljcy5NWV9CVVlJTkdfVVBEQVRFRCwgbnVsbCk7XG4gICAgICB9LmJpbmQodGhpcyksIDApO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgX2xvYWRTZWxsaW5nRGF0YSA6IGZ1bmN0aW9uKGFSZXF1ZXN0QXJyLCBhQ2FsbGJhY2spIHtcblxuICAgIC8qXG4gICAgICBBY2NvdW50U2VydmljZSA9IHJlcXVpcmUoXCJjb3JlL3NlcnZpY2VzL2FjY291bnRTZXJ2aWNlXCIpLkFjY291bnRTZXJ2aWNlO1xuICAgICovXG4gICAgdmFyIHRva2VuID0gQWNjb3VudC5nZXRBY2NvdW50KCkuZ2V0KFwidG9rZW5cIik7XG4gICAgdmFyIHNpdGVJZCA9IFNpdGUuc2l0ZUlkRm9yU2l0ZShTaXRlLmdldEhvbWVTaXRlKHRydWUpKTtcblxuICAgIGlmICghdGhpcy5faXNVcGRhdGluZ1NlbGxpbmdEYXRhKSB7XG4gICAgICB0aGlzLl9pc1VwZGF0aW5nU2VsbGluZ0RhdGEgPSB0cnVlO1xuICAgICAgT2JzZXJ2ZXJIZWxwZXIubm90aWZ5KFRvcGljcy5NWV9TRUxMSU5HX1VQREFUSU5HKTtcbiAgICB9XG5cbiAgICBUcmFkaW5nQXBpLmdldE15ZUJheVNlbGxpbmcodG9rZW4sIHNpdGVJZCwgYVJlcXVlc3RBcnIsIGFDYWxsYmFjayk7XG4gIH0sXG5cbiAgX2xvYWRTZWxsaW5nTGlzdEZpbHRlckNvdW50IDogZnVuY3Rpb24oYVJlcXVlc3RPYmopIHtcbiAgICBcbiAgICBpZiAoYVJlcXVlc3RPYmoubmFtZSA9PSBUcmFkaW5nQXBpLlNPTERfTElTVCkge1xuICAgICAgdGhpcy5fbG9hZFNlbGxpbmdEYXRhKFthUmVxdWVzdE9ial0sIGZ1bmN0aW9uKGFSZXN1bHQpIHtcbiAgICAgICAgaWYgKCFhUmVzdWx0LmVycm9ycykge1xuICAgICAgICAgIGlmIChcInNvbGRDb3VudFwiIGluIGFSZXN1bHQuc3VtbWFyeSkge1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gXCJcIjtcbiAgICAgICAgICAgIGlmIChhUmVzdWx0LnN1bW1hcnkuc29sZENvdW50ID09IDEgJiYgYVJlc3VsdC5saXN0cy5zb2xkTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIHRpdGxlID0gYVJlc3VsdC5saXN0cy5zb2xkTGlzdFswXS5nZXQoXCJ0aXRsZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NlbGxpbmcuZmlsdGVyU3VtbWFyeVthUmVxdWVzdE9iai5maWx0ZXJdID1cbiAgICAgICAgICAgICAgeyBjb3VudDogYVJlc3VsdC5zdW1tYXJ5LnNvbGRDb3VudCwgdGl0bGU6IHRpdGxlIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGxpbmcuZmlsdGVyU3VtbWFyeVthUmVxdWVzdE9iai5maWx0ZXJdID0geyBjb3VudDogMCB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBPYnNlcnZlckhlbHBlci5ub3RpZnkoVG9waWNzLlNFTExJTkdfU1VNTUFSWV9JTkZPX1VQREFURUQsIGFSZXF1ZXN0T2JqLmZpbHRlcik7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuICB9LFxuXG4gIF9sb2FkU2VsbGluZ09mZmVyTGlzdERhdGEgOiBmdW5jdGlvbihhUmVxdWVzdE9iaikge1xuICAgIFxuICAgIGFSZXF1ZXN0T2JqLm5hbWUgPSBUcmFkaW5nQXBpLlNFTExJTkdfT0ZGRVJfTElTVDtcbiAgICBhUmVxdWVzdE9iai5lbnRyaWVzUGVyUGFnZSA9IHRoaXMuTElTVF9JVEVNX0JBVENIX1NJWkU7XG5cbiAgICBpZiAoIShcInBhZ2VOdW1iZXJcIiBpbiBhUmVxdWVzdE9iaikpIHtcbiAgICAgIGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgPSAxO1xuICAgIH1cblxuICAgIHRoaXMuX2xvYWRTZWxsaW5nRGF0YShbYVJlcXVlc3RPYmpdLCBmdW5jdGlvbihhUmVzdWx0KSB7XG4gICAgICBpZiAoIWFSZXN1bHQuZXJyb3JzKSB7XG4gICAgICAgIHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5zZWxsaW5nT2ZmZXJDdXJyZW50UGFnZSA9IGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXI7XG5cbiAgICAgICAgdmFyIGxpc3QgPSBhUmVzdWx0Lmxpc3RzLmFjdGl2ZUxpc3Q7XG4gICAgICAgIHZhciBsZW4gPSBsaXN0Lmxlbmd0aDtcbiAgICAgICAgdmFyIG9mZmVySXRlbXMgPSBbXTtcbiAgICAgICAgdmFyIG9mZmVySXRlbUNvdW50O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBpZiAoIWxpc3RbaV0uZ2V0KFwiYmVzdE9mZmVyQ291bnRcIikpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsaXN0W2ldLnNldChcInR5cGVcIiwgSXRlbS5UWVBFUy5TRUxMSU5HX09GRkVSKTtcbiAgICAgICAgICBvZmZlckl0ZW1zLnB1c2gobGlzdFtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgb2ZmZXJJdGVtQ291bnQgPSBvZmZlckl0ZW1zLmxlbmd0aDtcblxuICAgICAgICBpZiAoYVJlcXVlc3RPYmoucGFnZU51bWJlciA9PSAxKSB7XG4gICAgICAgICAgdGhpcy5fc2VsbGluZy5vZmZlckxpc3QubGlzdCA9IG9mZmVySXRlbXM7XG4gICAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNlbGxpbmdPZmZlckNvdW50ID0gb2ZmZXJJdGVtQ291bnQ7XG4gICAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNlbGxpbmdPZmZlckl0ZW1UaXRsZSA9XG4gICAgICAgICAgICAob2ZmZXJJdGVtQ291bnQgPiAwID8gb2ZmZXJJdGVtc1swXS5nZXQoXCJ0aXRsZVwiKSA6IFwiXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3NlbGxpbmcub2ZmZXJMaXN0Lmxpc3QgPVxuICAgICAgICAgICAgdGhpcy5fc2VsbGluZy5vZmZlckxpc3QubGlzdC5jb25jYXQob2ZmZXJJdGVtcyk7XG4gICAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNlbGxpbmdPZmZlckNvdW50ICs9IG9mZmVySXRlbUNvdW50O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5leHRQYWdlTnVtYmVyID0gYVJlcXVlc3RPYmoucGFnZU51bWJlciArIDE7XG4gICAgICAgIGlmIChvZmZlckl0ZW1Db3VudCAhPT0gMCAmJiBvZmZlckl0ZW1Db3VudCA9PSBsZW4gJiZcbiAgICAgICAgICAgIGFSZXN1bHQuc3VtbWFyeS5hY3RpdmVUb3RhbFBhZ2VzID49IG5leHRQYWdlTnVtYmVyKSB7XG4gICAgICAgICAgdGhpcy5fbG9hZFNlbGxpbmdPZmZlckxpc3REYXRhKHsgcGFnZU51bWJlcjogbmV4dFBhZ2VOdW1iZXIgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNlbGxpbmdPZmZlclRvdGFsUGFnZXMgPSBhUmVxdWVzdE9iai5wYWdlTnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIE9ic2VydmVySGVscGVyLm5vdGlmeShUb3BpY3MuU0VMTElOR19PRkZFUl9MSVNUX1VQREFURUQpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgbG9hZFNlbGxpbmdMaXN0RGF0YSA6IGZ1bmN0aW9uKGFSZXF1ZXN0T2JqLCBhQ2FsbGJhY2spIHtcbiAgICBcbiAgICB2YXIgaWdub3JlUmVxdWVzdCA9IGZhbHNlO1xuICAgIHZhciBtZXJnZUxpc3QgPSBhUmVxdWVzdE9iai5wYWdlTnVtYmVyICYmIGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgPiAxO1xuXG4gICAgc3dpdGNoKGFSZXF1ZXN0T2JqLm5hbWUpIHtcbiAgICAgIGNhc2UgVHJhZGluZ0FwaS5TRUxMSU5HX09GRkVSX0xJU1Q6XG4gICAgICAgIC8vIHdlJ3ZlIGFscmVhZHkgbG9hZGVkIGFsbCBpdGVtc1xuICAgICAgICBpZ25vcmVSZXF1ZXN0ID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuQUNUSVZFX0xJU1Q6XG4gICAgICAgIGlnbm9yZVJlcXVlc3QgPSBtZXJnZUxpc3QgJiYgYVJlcXVlc3RPYmoucGFnZU51bWJlciA+IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5hY3RpdmVUb3RhbFBhZ2VzO1xuICAgICAgICBhUmVxdWVzdE9iai5zb3J0ID0gdGhpcy5fc2VsbGluZy5hY3RpdmVMaXN0LnNvcnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLlNPTERfTElTVDpcbiAgICAgICAgaWdub3JlUmVxdWVzdCA9IG1lcmdlTGlzdCAmJiBhUmVxdWVzdE9iai5wYWdlTnVtYmVyID4gdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNvbGRUb3RhbFBhZ2VzO1xuICAgICAgICBhUmVxdWVzdE9iai5zb3J0ID0gdGhpcy5fc2VsbGluZy5zb2xkTGlzdC5zb3J0O1xuICAgICAgICBhUmVxdWVzdE9iai5maWx0ZXIgPSB0aGlzLl9zZWxsaW5nLnNvbGRMaXN0LmZpbHRlcjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRyYWRpbmdBcGkuVU5TT0xEX0xJU1Q6XG4gICAgICAgIGlnbm9yZVJlcXVlc3QgPSBtZXJnZUxpc3QgJiYgYVJlcXVlc3RPYmoucGFnZU51bWJlciA+IHRoaXMuX3NlbGxpbmcuc3VtbWFyeS51bnNvbGRUb3RhbFBhZ2VzO1xuICAgICAgICBhUmVxdWVzdE9iai5zb3J0ID0gdGhpcy5fc2VsbGluZy51bnNvbGRMaXN0LnNvcnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUcmFkaW5nQXBpLlNDSEVEVUxFRF9MSVNUOlxuICAgICAgICBpZ25vcmVSZXF1ZXN0ID0gbWVyZ2VMaXN0ICYmIGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgPiB0aGlzLl9zZWxsaW5nLnN1bW1hcnkuc2NoZWR1bGVkVG90YWxQYWdlcztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5faWdub3JlUmVxdWVzdFtUb3BpY3MuTVlfU0VMTElOR19MSVNUX1VQREFURURdID0gaWdub3JlUmVxdWVzdDtcblxuICAgIGlmIChpZ25vcmVSZXF1ZXN0KSB7XG4gICAgICB0aGlzLl9pc1VwZGF0aW5nU2VsbGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgIE9ic2VydmVySGVscGVyLm5vdGlmeShUb3BpY3MuTVlfU0VMTElOR19MSVNUX1VQREFURUQsIG51bGwpO1xuICAgICAgaWYgKGFDYWxsYmFjaykge1xuICAgICAgICBhQ2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbG9hZFNlbGxpbmdEYXRhKFthUmVxdWVzdE9ial0sIGZ1bmN0aW9uKGFSZXN1bHQpIHtcbiAgICAgICAgaWYgKCFhUmVzdWx0LmVycm9ycykge1xuICAgICAgICAgIHN3aXRjaChhUmVxdWVzdE9iai5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFRyYWRpbmdBcGkuQUNUSVZFX0xJU1Q6XG4gICAgICAgICAgICAgIHRoaXMuX3NlbGxpbmcuYWN0aXZlTGlzdC5saXN0ID1cbiAgICAgICAgICAgICAgICBtZXJnZUxpc3QgPyB0aGlzLl9zZWxsaW5nLmFjdGl2ZUxpc3QubGlzdC5jb25jYXQoYVJlc3VsdC5saXN0cy5hY3RpdmVMaXN0KSA6IGFSZXN1bHQubGlzdHMuYWN0aXZlTGlzdDtcbiAgICAgICAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5LmFjdGl2ZUN1cnJlbnRQYWdlID0gbWVyZ2VMaXN0ID8gYVJlcXVlc3RPYmoucGFnZU51bWJlciA6IDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBUcmFkaW5nQXBpLlNPTERfTElTVDpcbiAgICAgICAgICAgICAgdGhpcy5fc2VsbGluZy5zb2xkTGlzdC5saXN0ID1cbiAgICAgICAgICAgICAgICBtZXJnZUxpc3QgPyB0aGlzLl9zZWxsaW5nLnNvbGRMaXN0Lmxpc3QuY29uY2F0KGFSZXN1bHQubGlzdHMuc29sZExpc3QpIDogYVJlc3VsdC5saXN0cy5zb2xkTGlzdDtcbiAgICAgICAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNvbGRDdXJyZW50UGFnZSA9IG1lcmdlTGlzdCA/IGFSZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgOiAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhZGluZ0FwaS5VTlNPTERfTElTVDpcbiAgICAgICAgICAgICAgdGhpcy5fc2VsbGluZy51bnNvbGRMaXN0Lmxpc3QgPVxuICAgICAgICAgICAgICAgIG1lcmdlTGlzdCA/IHRoaXMuX3NlbGxpbmcudW5zb2xkTGlzdC5saXN0LmNvbmNhdChhUmVzdWx0Lmxpc3RzLnVuc29sZExpc3QpIDogYVJlc3VsdC5saXN0cy51bnNvbGRMaXN0O1xuICAgICAgICAgICAgICB0aGlzLl9zZWxsaW5nLnN1bW1hcnkudW5zb2xkQ3VycmVudFBhZ2UgPSBtZXJnZUxpc3QgPyBhUmVxdWVzdE9iai5wYWdlTnVtYmVyIDogMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRyYWRpbmdBcGkuU0NIRURVTEVEX0xJU1Q6XG4gICAgICAgICAgICAgIHRoaXMuX3NlbGxpbmcuc2NoZWR1bGVkTGlzdC5saXN0ID1cbiAgICAgICAgICAgICAgICBtZXJnZUxpc3QgPyB0aGlzLl9zZWxsaW5nLnNjaGVkdWxlZExpc3QubGlzdC5jb25jYXQoYVJlc3VsdC5saXN0cy5zY2hlZHVsZWRMaXN0KSA6IGFSZXN1bHQubGlzdHMuc2NoZWR1bGVkTGlzdDtcbiAgICAgICAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5LnNjaGVkdWxlZEN1cnJlbnRQYWdlID0gbWVyZ2VMaXN0ID8gYVJlcXVlc3RPYmoucGFnZU51bWJlciA6IDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKHZhciBhdHRyTmFtZSBpbiBhUmVzdWx0LnN1bW1hcnkpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGxpbmcuc3VtbWFyeVthdHRyTmFtZV0gPSBhUmVzdWx0LnN1bW1hcnlbYXR0ck5hbWVdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX2lzVXBkYXRpbmdTZWxsaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICAgIE9ic2VydmVySGVscGVyLm5vdGlmeShUb3BpY3MuTVlfU0VMTElOR19MSVNUX1VQREFURUQsIGFSZXF1ZXN0T2JqLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgICBhQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH0sXG5cbiAgX2xvYWRBbGxTZWxsaW5nRGF0YSA6IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIHZhciByZXF1ZXN0QXJyID0gW1xuICAgICAgeyBuYW1lOiBUcmFkaW5nQXBpLkFDVElWRV9MSVNULCBzb3J0OiB0aGlzLl9zZWxsaW5nLmFjdGl2ZUxpc3Quc29ydCB9LFxuICAgICAgeyBuYW1lOiBUcmFkaW5nQXBpLlNPTERfTElTVCwgc29ydDogdGhpcy5fc2VsbGluZy5zb2xkTGlzdC5zb3J0IH0sXG4gICAgICB7IG5hbWU6IFRyYWRpbmdBcGkuVU5TT0xEX0xJU1QsIHNvcnQ6IHRoaXMuX3NlbGxpbmcudW5zb2xkTGlzdC5zb3J0IH0sXG4gICAgICB7IG5hbWU6IFRyYWRpbmdBcGkuU0NIRURVTEVEX0xJU1QgfVxuICAgIF07XG5cbiAgICB0aGlzLl9sb2FkU2VsbGluZ0RhdGEocmVxdWVzdEFyciwgZnVuY3Rpb24oYVJlc3VsdCkge1xuICAgICAgdGhpcy5fbGFzdFNlbGxpbmdDYWxsVGltZXN0YW1wID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgIGlmICghYVJlc3VsdC5lcnJvcnMpIHtcbiAgICAgICAgdGhpcy5fc2VsbGluZy5hY3RpdmVMaXN0Lmxpc3QgPSBhUmVzdWx0Lmxpc3RzLmFjdGl2ZUxpc3Q7XG4gICAgICAgIHRoaXMuX3NlbGxpbmcuc29sZExpc3QubGlzdCA9IGFSZXN1bHQubGlzdHMuc29sZExpc3Q7XG4gICAgICAgIHRoaXMuX3NlbGxpbmcudW5zb2xkTGlzdC5saXN0ID0gYVJlc3VsdC5saXN0cy51bnNvbGRMaXN0O1xuICAgICAgICB0aGlzLl9zZWxsaW5nLnNjaGVkdWxlZExpc3QubGlzdCA9IGFSZXN1bHQubGlzdHMuc2NoZWR1bGVkTGlzdDtcbiAgICAgICAgLy8gVE9ETzogbm90IGF2YWlsYWJsZSB5ZXQuXG4gICAgICAgIHRoaXMuX3NlbGxpbmcuZHJhZnRMaXN0Lmxpc3QgPSBhUmVzdWx0Lmxpc3RzLmRyYWZ0TGlzdDtcbiAgICAgICAgdGhpcy5fc2VsbGluZy5zdW1tYXJ5ID0gYVJlc3VsdC5zdW1tYXJ5O1xuXG4gICAgICAgIC8vIGZvciBzaG93aW5nIHNvbGQgc3VtbWFyeSBpbmZvXG4gICAgICAgIGlmICh0aGlzLl9zZWxsaW5nLnN1bW1hcnkuc29sZENvdW50ID4gMCkge1xuICAgICAgICAgIHRoaXMuX2xvYWRTZWxsaW5nTGlzdEZpbHRlckNvdW50KHtcbiAgICAgICAgICAgIG5hbWU6IFRyYWRpbmdBcGkuU09MRF9MSVNULFxuICAgICAgICAgICAgZW50cmllc1BlclBhZ2U6IDEsXG4gICAgICAgICAgICBmaWx0ZXI6IHRoaXMuRklMVEVSLkFMTCB9KTtcbiAgICAgICAgICB0aGlzLl9sb2FkU2VsbGluZ0xpc3RGaWx0ZXJDb3VudCh7XG4gICAgICAgICAgICBuYW1lOiBUcmFkaW5nQXBpLlNPTERfTElTVCxcbiAgICAgICAgICAgIGVudHJpZXNQZXJQYWdlOiAxLFxuICAgICAgICAgICAgZmlsdGVyOiB0aGlzLkZJTFRFUi5BV0FJVElOR19QQVlNRU5UIH0pO1xuICAgICAgICAgIHRoaXMuX2xvYWRTZWxsaW5nTGlzdEZpbHRlckNvdW50KHtcbiAgICAgICAgICAgIG5hbWU6IFRyYWRpbmdBcGkuU09MRF9MSVNULFxuICAgICAgICAgICAgZW50cmllc1BlclBhZ2U6IDEsXG4gICAgICAgICAgICBmaWx0ZXI6IHRoaXMuRklMVEVSLkFXQUlUSU5HX1NISVBNRU5UIH0pO1xuICAgICAgICAgIHRoaXMuX2xvYWRTZWxsaW5nTGlzdEZpbHRlckNvdW50KHtcbiAgICAgICAgICAgIG5hbWU6IFRyYWRpbmdBcGkuU09MRF9MSVNULFxuICAgICAgICAgICAgZW50cmllc1BlclBhZ2U6IDEsXG4gICAgICAgICAgICBmaWx0ZXI6IHRoaXMuRklMVEVSLlBBSURfQU5EX1NISVBQRUQgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3Igc2hvd2luZyBvZmZlcnNcbiAgICAgICAgaWYgKHRoaXMuX3NlbGxpbmcuc3VtbWFyeS5hY3RpdmVDb3VudCA+IDApIHtcbiAgICAgICAgICB0aGlzLl9sb2FkU2VsbGluZ09mZmVyTGlzdERhdGEoeyBwYWdlTnVtYmVyOiAxIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXcgVGltZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2lzVXBkYXRpbmdTZWxsaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICBPYnNlcnZlckhlbHBlci5ub3RpZnkoVG9waWNzLk1ZX1NFTExJTkdfVVBEQVRFRCwgbnVsbCk7XG4gICAgICB9LmJpbmQodGhpcyksIDApO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgLy8gcmVtb3ZlIGl0ZW1zIGZyb20gbGlzdCB3aGVuIHVzZXIgY2FycmllcyBvdXQgZGVsZXRpb25cbiAgcmVtb3ZlSXRlbXNGcm9tTGlzdCA6IGZ1bmN0aW9uKGFUeXBlLCBhSXRlbUlkcykge1xuICAgIHZhciBsaXN0ID0gdGhpcy5nZXRMaXN0KGFUeXBlKTtcblxuICAgIGlmIChsaXN0KSB7XG4gICAgICBmb3IgKHZhciBpID0gKGxpc3QubGVuZ3RoIC0gMSk7IGkgPj0wIDsgaS0tKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGFJdGVtSWRzLmluZGV4T2YobGlzdFtpXS5nZXQoXCJpdGVtSWRcIikpO1xuICAgICAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogR2V0cyBhbiBpdGVtIGZyb20gdGhlIHNwZWNpZmllZCBsaXN0LlxuICAgKiBAcGFyYW0gYVR5cGUgdGhlIGxpc3QgdHlwZS5cbiAgICogQHBhcmFtIGFJdGVtSWQgdGhlIGl0ZW0gaWQgdG8gc2VhcmNoIGZvci5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGl0ZW0gaWYgdGhlIGl0ZW0gaXMgZm91bmQsIG51bGwgb3RoZXJ3aXNlLlxuICAgKi9cbiAgZ2V0SXRlbUZyb21MaXN0IDogZnVuY3Rpb24oYVR5cGUsIGFJdGVtSWQpIHtcbiAgICB2YXIgaXRlbSA9IG51bGw7XG5cbiAgICBpdGVtcyA9IHRoaXMuZ2V0TGlzdChhVHlwZSk7XG4gICAgJC5lYWNoKGl0ZW1zLCBmdW5jdGlvbihhSW5kZXgsIGFJdGVtKSB7XG4gICAgICBpZiAoYUl0ZW0uZ2V0KFwiaXRlbUlkXCIpID09IGFJdGVtSWQpIHtcbiAgICAgICAgaXRlbSA9IGFJdGVtO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBpdGVtO1xuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBpdGVtIHRpbWUgbGVmdCBzdGF0dXMgYWZ0ZXIgdGhlIGl0ZW0gaGFzIGVuZGVkLiBXZSBuZWVkIHRvIGRvIHRoaXMgc28gdGhlIGl0ZW0gaW4gdGhlIGxpc3QgaW4gbWVtb3J5IGlzIHVwZGF0ZWRcbiAgICogYWZ0ZXIgaXMgaGFzIGZpbmlzaGVkLlxuICAgKi9cbiAgdXBkYXRlSXRlbUVuZGVkIDogZnVuY3Rpb24oYUl0ZW0pIHtcbiAgICB2YXIgbGlzdE5hbWVzID0gW107XG4gICAgbGlzdE5hbWVzLnB1c2goVHJhZGluZ0FwaS5XQVRDSF9MSVNUKTtcbiAgICBsaXN0TmFtZXMucHVzaChUcmFkaW5nQXBpLkJJRF9MSVNUKTtcbiAgICBsaXN0TmFtZXMucHVzaChUcmFkaW5nQXBpLkJFU1RfT0ZGRVJfTElTVCk7XG4gICAgbGlzdE5hbWVzLnB1c2goVHJhZGluZ0FwaS5BQ1RJVkVfTElTVCk7XG4gICAgbGlzdE5hbWVzLnB1c2goVHJhZGluZ0FwaS5TRUxMSU5HX09GRkVSX0xJU1QpO1xuICAgIHZhciBpdGVtID0gbnVsbDtcbiAgICB2YXIgaXRlbUlkID0gYUl0ZW0uZ2V0KFwiaXRlbUlkXCIpO1xuXG4gICAgJC5lYWNoKGxpc3ROYW1lcywgZnVuY3Rpb24oYUluZGV4LCBhTGlzdE5hbWUpIHtcbiAgICAgIGl0ZW0gPSBNeUViYXlTZXJ2aWNlLmdldEl0ZW1Gcm9tTGlzdChhTGlzdE5hbWUsIGl0ZW1JZCk7XG4gICAgICBpZiAobnVsbCAhPT0gaXRlbSkge1xuICAgICAgICBpdGVtLnNldChcInRpbWVMZWZ0XCIsIFwiUFQwU1wiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcbiJdfQ==