/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var TradingApi = {
    _XML_HEADER: "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
    _XML_NAMESPACE: "xmlns=\"urn:ebay:apis:eBLBaseComponents\"",
    WATCH_LIST: "WatchList",
    BID_LIST: "BidList",
    WON_LIST: "WonList",
    LOST_LIST: "LostList",
    BEST_OFFER_LIST: "BestOfferList",
    FAVORITE_SELLERS: "FavoriteSellers",
    FAVORITE_SEARCHES: "FavoriteSearches",
    ACTIVE_LIST: "ActiveList",
    SOLD_LIST: "SoldList",
    UNSOLD_LIST: "UnsoldList",
    SCHEDULED_LIST: "ScheduledList",
    SELLING_OFFER_LIST: "SellingOfferList",
    SORT: {
        BEST_OFFER: "BestOffer",
        END_TIME: "EndTime",
        END_TIME_DESC: "EndTimeDescending",
        CURRENT_PRICE: "CurrentPrice",
        CURRENT_PRICE_DESC: "CurrentPriceDescending",
        WATCH_COUNT: "WatchCount",
        WATCH_COUNT_DESC: "WatchCountDescending",
        START_TIME_DESC: "StartTimeDescending",
        BEST_OFFER_COUNT_DESC: "BestOfferCountDescending"
    },
    _createGetMyeBayBuyingRequest: function (aRequestArr) {
        var request = "";
        for (var i = 0; i < aRequestArr.length; i++) {
            var requestObj = aRequestArr[i];
            var listName = requestObj.name;
            request += "<" + listName + ">";
            switch (listName) {
                case this.LOST_LIST:
                case this.WON_LIST:
                    request += "<DurationInDays>60</DurationInDays>";
                case this.WATCH_LIST:
                case this.BID_LIST:
                case this.BEST_OFFER_LIST:
                    if ("sort" in requestObj && requestObj.sort) {
                        request += "<Sort>" + requestObj.sort + "</Sort>";
                    }
                    request += "<Pagination>";
                    if ("entriesPerPage" in requestObj) {
                        request += "<EntriesPerPage>" + requestObj.entriesPerPage + "</EntriesPerPage>";
                    }
                    else {
                        request += "<EntriesPerPage>5</EntriesPerPage>";
                    }
                    if ("pageNumber" in requestObj) {
                        request += "<PageNumber>" + requestObj.pageNumber + "</PageNumber>";
                    }
                    request += "</Pagination>";
                    break;
                case this.FAVORITE_SELLERS:
                case this.FAVORITE_SEARCHES:
                    request += "<Include>true</Include>";
                    break;
            }
            request += "</" + listName + ">";
        }
        request += "<DetailLevel>ReturnSummary</DetailLevel>";
        return request;
    },
    getMyeBayBuying: function (aToken, aSiteId, aRequestArr, aCallback) {
        if (!aToken) {
            Logger.error("Attempt to make Trading API GetMyeBayBuying call when no account is " +
                "active.");
            return;
        }
        var that = this;
        var wrappedBody;
        var localCallback;
        var request;
        var innerBody = this._createGetMyeBayBuyingRequest(aRequestArr);
        var initialTimestamp = $.now();
        var finalTimestamp = 0;
        var elapsedTime = 0;
        wrappedBody = this._wrapCall("GetMyeBayBuying", innerBody, aToken);
        localCallback = function (aResponse) {
            finalTimestamp = $.now();
            elapsedTime = (finalTimestamp - initialTimestamp) / 1000;
            if (PropertyDAO.get(PropertyDAO.PROP_DISPLAY_LOGS)) {
                console.log("Response buying", aResponse);
                console.log("elapsed time (in seconds): " + elapsedTime);
                console.log("--- end response buying ---\n");
            }
            var result = that._parseGetMyeBayBuyingResponse(aResponse);
            try {
                if (aCallback) {
                    aCallback(result);
                }
            }
            catch (e) {
                Logger.error("TradingApi.getMyeBayBuying Error: " + e.message);
            }
        };
        request = this._doCall(wrappedBody, aSiteId, localCallback);
        return request;
    },
    _parseGetMyeBayBuyingResponse: function (aResponse) {
        var account = Account.getAccount();
        var result = {};
        if (!aResponse) {
            result.errors = true;
        }
        else {
            var transactions = {};
            var offerList = [];
            var watchList = [];
            var bidList = [];
            var wonList = [];
            var lostList = [];
            var summary = {};
            var watchSummary = {};
            var paginationResult;
            var list;
            var xmlItem;
            var item;
            list = $(aResponse).find("WatchList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    item = new Item($(this).find("ItemID").text());
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.WATCHING);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        watchList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                watchSummary.watchCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                watchSummary.watchTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            list = $(aResponse).find("BestOfferList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    item = new Item($(this).find("ItemID").text());
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.BEST_OFFER);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        offerList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.offerCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.offerTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            list = $(aResponse).find("BidList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    item = new Item($(this).find("ItemID").text());
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.BIDDING);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        bidList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.bidCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.bidTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            list = $(aResponse).find("WonList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    var itemId = $(this).find("ItemID").text();
                    item = new Item(itemId);
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.WON);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    var xmlTransaction = $(this).parent("Transaction");
                    if (xmlTransaction) {
                        var transactionId = $(xmlTransaction).find("TransactionID").text();
                        var transaction = new Transaction(itemId, transactionId);
                        transaction.fromXML(xmlTransaction, false, Transaction.TYPES.BUYING);
                        item.set("transactions", new Array(transaction));
                    }
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        wonList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.wonCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.wonTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            list = $(aResponse).find("LostList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    item = new Item($(this).find("ItemID").text());
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.LOST);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        lostList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.lostCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.lostTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            var favoriteSellers = [];
            $(aResponse).find("FavoriteSeller").each(function () {
                var sellerId = $(this).find("UserID").text();
                var storeName = $(this).find("StoreName").text();
                var favoriteSeller = new FavoriteSeller(account.get("userId"), sellerId);
                favoriteSeller.set("storeName", storeName);
                favoriteSellers.push(favoriteSeller);
            });
            var favoriteSearches = [];
            $(aResponse).find("FavoriteSearch").each(function () {
                var searchName = $(this).find("SearchName").text();
                var searchQuery = $(this).find("SearchQuery").text();
                var favoriteSearch = new FavoriteSearch(account.get("userId"), searchName);
                favoriteSearch.set("searchQuery", searchQuery);
                favoriteSearches.push(favoriteSearch);
            });
            var timestampText = $(aResponse).find("Timestamp").text();
            var timestamp = UtilityHelper.dateFromIso8601(timestampText);
            result.lists = {
                offerList: offerList,
                watchList: watchList,
                bidList: bidList,
                wonList: wonList,
                lostList: lostList
            };
            result.summary = summary;
            result.watchSummary = watchSummary;
            result.transactions = transactions;
            result.favoriteSearches = favoriteSearches;
            result.favoriteSellers = favoriteSellers;
            result.timestamp = timestamp;
        }
        return result;
    },
    _createGetMyeBaySellingRequest: function (aRequestArr) {
        var request = "";
        for (var i = 0; i < aRequestArr.length; i++) {
            var requestObj = aRequestArr[i];
            var listName = requestObj.name;
            if (listName == this.SELLING_OFFER_LIST) {
                listName = this.ACTIVE_LIST;
                requestObj.sort = this.SORT.BEST_OFFER_COUNT_DESC;
            }
            request += "<" + listName + ">";
            switch (listName) {
                case this.SOLD_LIST:
                    if ("filter" in requestObj && requestObj.filter) {
                        request += "<OrderStatusFilter>" + requestObj.filter + "</OrderStatusFilter>";
                    }
                case this.UNSOLD_LIST:
                    request += "<DurationInDays>60</DurationInDays>";
                case this.ACTIVE_LIST:
                    if ("sort" in requestObj && requestObj.sort) {
                        request += "<Sort>" + requestObj.sort + "</Sort>";
                    }
                    request += "<Pagination>";
                    if ("entriesPerPage" in requestObj) {
                        request += "<EntriesPerPage>" + requestObj.entriesPerPage + "</EntriesPerPage>";
                    }
                    else {
                        request += "<EntriesPerPage>5</EntriesPerPage>";
                    }
                    if ("pageNumber" in requestObj) {
                        request += "<PageNumber>" + requestObj.pageNumber + "</PageNumber>";
                    }
                    request += "</Pagination>";
                    break;
            }
            request += "</" + listName + ">";
        }
        request += "<DetailLevel>ReturnSummary</DetailLevel>";
        return request;
    },
    getMyeBaySelling: function (aToken, aSiteId, aRequestArr, aCallback) {
        if (!aToken) {
            Logger.error("Attempt to make Trading API getMyeBaySelling call when no account " +
                "is active.");
            return;
        }
        var that = this;
        var wrappedBody;
        var localCallback;
        var request;
        var innerBody = this._createGetMyeBaySellingRequest(aRequestArr);
        var initialTimestamp = $.now();
        var finalTimestamp = 0;
        var elapsedTime = 0;
        wrappedBody = this._wrapCall("GetMyeBaySelling", innerBody, aToken);
        localCallback = function (aResponse) {
            finalTimestamp = $.now();
            elapsedTime = (finalTimestamp - initialTimestamp) / 1000;
            if (PropertyDAO.get(PropertyDAO.PROP_DISPLAY_LOGS)) {
                console.log("Response selling", aResponse);
                console.log("elapsed time (in seconds): " + elapsedTime);
                console.log("--- end response selling ---\n");
            }
            var result = that._parseGetMyeBaySellingResponse(aResponse);
            try {
                if (aCallback) {
                    aCallback(result);
                }
            }
            catch (e) {
                Logger.error("TradingApi.getMyeBaySelling Error: " + e.message);
            }
        };
        request = this._doCall(wrappedBody, aSiteId, localCallback);
        return request;
    },
    _parseGetMyeBaySellingResponse: function (aResponse) {
        var result = {};
        if (!aResponse) {
            result.errors = true;
        }
        else {
            var transactions = {};
            var activeList = [];
            var soldList = [];
            var unsoldList = [];
            var scheduledList = [];
            var summary = {};
            var paginationResult;
            var list;
            var xmlItem;
            var item;
            list = $(aResponse).find("ActiveList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    item = new Item($(this).find("ItemID").text());
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.SELLING);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        activeList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.activeCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.activeTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            list = $(aResponse).find("SoldList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    var itemId = $(this).find("ItemID").text();
                    item = new Item(itemId);
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.SOLD);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    var xmlTransaction = $(this).parent("Transaction");
                    if (xmlTransaction) {
                        var transactionId = $(xmlTransaction).find("TransactionID").text();
                        var transaction = new Transaction(itemId, transactionId);
                        transaction.fromXML(xmlTransaction, false, Transaction.TYPES.SELLING);
                        item.set("transactions", new Array(transaction));
                    }
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        soldList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.soldCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.soldTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            list = $(aResponse).find("UnsoldList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    item = new Item($(this).find("ItemID").text());
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.UNSOLD);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        unsoldList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.unsoldCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.unsoldTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            list = $(aResponse).find("ScheduledList");
            if (list.length > 0) {
                list.find("Item").each(function () {
                    item = new Item($(this).find("ItemID").text());
                    xmlItem = $(this);
                    item.set("type", Item.TYPES.SCHEDULED);
                    item.fromXML(xmlItem, Item.XML_PREFIXES.BUYSELL);
                    if (TradingApi.isValidXMLItem(xmlItem)) {
                        scheduledList.push(item);
                    }
                });
                paginationResult = list.children("PaginationResult");
                summary.scheduledCount = Number(paginationResult.children("TotalNumberOfEntries").text());
                summary.scheduledTotalPages = Number(paginationResult.children("TotalNumberOfPages").text());
            }
            result.lists = {
                activeList: activeList,
                soldList: soldList,
                unsoldList: unsoldList,
                scheduledList: scheduledList
            };
            result.transactions = transactions;
            result.summary = summary;
        }
        return result;
    },
    isValidXMLItem: function (aXMLItem) {
        if ($(aXMLItem).find("ItemPolicyViolation").text().length > 0) {
            return false;
        }
        return true;
    },
    removeFromWatchList: function (aToken, aItemId, aSiteId, aCallback) {
        if (!aToken) {
            Logger.error("Attempt to make Trading API removeFromWatchList call " +
                "when no account is active.");
            return;
        }
        var wrappedBody;
        var localCallback;
        var request;
        var innerBody = "";
        $.each(aItemId, function (aIndex, aValue) {
            innerBody += "<ItemID>" + aValue + "</ItemID>";
        });
        wrappedBody = this._wrapCall("RemoveFromWatchList", innerBody, aToken);
        localCallback = function (aResponse) {
            var result = {};
            try {
                if (aCallback) {
                    if (!aResponse) {
                        result.errors = true;
                    }
                    aCallback(result);
                }
            }
            catch (e) {
                Logger.error("TradingApi.removeWatchList Error: " + e.message);
            }
        };
        request = this._doCall(wrappedBody, aSiteId, localCallback);
        return request;
    },
    _validateResponse: function (aResponse) {
        if (!aResponse) {
            Logger.error("Trading API error (no response document!)");
            return false;
        }
        var node = $(aResponse).find("Ack");
        if (!node) {
            Logger.error("Trading API error (no Ack node!)");
            return false;
        }
        var tokenError = false;
        if ($(node).text() != "Success") {
            if ($(node).text() == "Warning") {
                Logger.warn($(node).find("Errors").find("ShortMessage").text());
            }
            else {
                $.each($(aResponse).find("Errors"), function () {
                    var errorCode = Number($(this).find("ErrorCode").text());
                    switch (errorCode) {
                        case 21916984:
                            Logger.error("The new authentication mechanism requires you to " +
                                "sign in again.");
                            tokenError = true;
                            break;
                        case 841:
                            Logger.error("The user account has been suspended. Forcing logout.");
                            tokenError = true;
                            break;
                        case 931:
                            Logger.error("Auth token is invalid. Forcing logout.");
                            tokenError = true;
                            break;
                        case 932:
                            Logger.error("Auth token is hard expired. Forcing logout.");
                            tokenError = true;
                            break;
                        case 17470:
                            Logger.error("Please login again now. Your security token has " +
                                "expired. Forcing logout.");
                            tokenError = true;
                            break;
                        case 16110:
                            Logger.error("The Trading API token has expired. Forcing logout.");
                            tokenError = true;
                            break;
                        case 16112:
                            Logger.error("The authentication method used is invalid. " +
                                "Forcing logout.");
                            tokenError = true;
                            break;
                        case 16118:
                            Logger.error("The token retrieval window has expired. " +
                                "Forcing logout.");
                            tokenError = true;
                            break;
                        case 16119:
                            Logger.error("The token does not exist. Forcing logout.");
                            tokenError = true;
                            break;
                        case 17476:
                            Logger.error("The token does not match headers credentials. " +
                                "Forcing logout.");
                            tokenError = true;
                            break;
                        case 21916013:
                            Logger.error("The token Token has been revoked by App. " +
                                "Forcing logout.");
                            tokenError = true;
                            break;
                        case 21000:
                            Logger.error("Tried to add an ended item to the watchlist.");
                            break;
                        case 21002:
                            Logger.error("The Item is not in the watch list.");
                            break;
                        case 20820:
                            break;
                        case 1505:
                            Logger.error("Trading API reports that the item was not found.");
                            break;
                        case 21003:
                            Logger.error("Item is already in the watch list.");
                            break;
                        case 20819:
                            break;
                        default:
                            Logger.error("Trading API Error:\n" + "Error Code: " + errorCode +
                                "\nShort Message: " +
                                String($(this).find("ShortMessage").text()) +
                                "\nSeverity: " +
                                String($(this).find("SeverityCode").text()) +
                                "\nError Clasification: " +
                                String($(this).find("ErrorClassification").text()) + "\n");
                            break;
                    }
                    if (tokenError) {
                        return false;
                    }
                });
                if (tokenError) {
                    ObserverHelper.notify(Topics.FORCE_ACCOUNT_SIGN_OUT);
                }
                return false;
            }
        }
        return true;
    },
    _wrapCall: function (aRequestName, aInnerBody) {
        var requestIdentifier = CommonService.getRequestIdentifier();
        var wrappedBody = this._XML_HEADER +
            "<" + aRequestName + "Request " + this._XML_NAMESPACE + ">" +
            "<MessageID>" + requestIdentifier + "</MessageID>" +
            aInnerBody +
            "</" + aRequestName + "Request>";
        return wrappedBody;
    },
    _doCall: function (aRequestBody, aSiteId, aCallback) {
        var requestName;
        var request;
        var topic = null;
        var account = Account.getAccount();
        try {
            requestName = /><(.*?)Request/.exec(aRequestBody)[1];
        }
        catch (e) {
            Logger.error("Trading API request will not be sent, as it is badly-formed. \n" +
                aRequestBody);
            return;
        }
        switch (requestName) {
            case "GetMyeBayBuying":
                topic = Topics.MY_BUYING_UPDATED;
                break;
            case "GetMyeBaySelling":
                topic = Topics.MY_SELLING_UPDATED;
                break;
        }
        request =
            $.ajax({
                beforeSend: function (aXHR) {
                    aXHR.setRequestHeader("X-EBAY-API-COMPATIBILITY-LEVEL", Configs.TRADING_API_VERSION);
                    aXHR.setRequestHeader("X-EBAY-API-CALL-NAME", requestName);
                    aXHR.setRequestHeader("X-EBAY-API-SITEID", aSiteId);
                    aXHR.setRequestHeader("X-EBAY-SIDEBAR-VERSION", BrowserHelper.getExtensionVersion());
                    if (account && account.get("token")) {
                        aXHR.setRequestHeader("X-EBAY-API-IAF-TOKEN", account.get("token"), false);
                    }
                },
                type: "POST",
                contentType: "text/xml",
                url: ApiHelper.getEndPoint("tradingApi"),
                data: aRequestBody,
                dataType: "xml",
                jsonp: false,
                timeout: PropertyDAO.get(PropertyDAO.PROP_API_TIMEOUT),
                success: function (aData, aTextStatus) {
                    try {
                        if (aTextStatus == "success") {
                            if (!TradingApi._validateResponse(aData)) {
                                aData = null;
                            }
                            else {
                                MessagePanelService.dismissMessage(MessagePanelService.TYPE.CONNECT_ERROR);
                            }
                            if (aCallback) {
                                aCallback(aData);
                            }
                        }
                    }
                    catch (e) {
                        UtilityHelper.handleError("TradingApi", requestName, e.message, aCallback);
                    }
                },
                error: function (aXHR, aTextStatus, aError) {
                    UtilityHelper.handleError("TradingApi", requestName, aXHR.responseText, aCallback);
                }
            });
        ApiHelper.addPendingRequest(request, requestName, topic);
        return request;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhZGluZ0FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2tncm91bmQvY29yZS9hcGlzL3RyYWRpbmdBcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUF1QkgsSUFBSSxVQUFVLEdBQUc7SUFDZixXQUFXLEVBQUcsNENBQTRDO0lBQzFELGNBQWMsRUFBRywyQ0FBMkM7SUFHNUQsVUFBVSxFQUFFLFdBQVc7SUFDdkIsUUFBUSxFQUFFLFNBQVM7SUFDbkIsUUFBUSxFQUFFLFNBQVM7SUFDbkIsU0FBUyxFQUFFLFVBQVU7SUFDckIsZUFBZSxFQUFFLGVBQWU7SUFDaEMsZ0JBQWdCLEVBQUUsaUJBQWlCO0lBQ25DLGlCQUFpQixFQUFFLGtCQUFrQjtJQUdyQyxXQUFXLEVBQUUsWUFBWTtJQUN6QixTQUFTLEVBQUUsVUFBVTtJQUNyQixXQUFXLEVBQUUsWUFBWTtJQUN6QixjQUFjLEVBQUUsZUFBZTtJQUMvQixrQkFBa0IsRUFBRSxrQkFBa0I7SUFFdEMsSUFBSSxFQUFFO1FBQ0osVUFBVSxFQUFFLFdBQVc7UUFDdkIsUUFBUSxFQUFFLFNBQVM7UUFDbkIsYUFBYSxFQUFFLG1CQUFtQjtRQUNsQyxhQUFhLEVBQUUsY0FBYztRQUM3QixrQkFBa0IsRUFBRSx3QkFBd0I7UUFDNUMsV0FBVyxFQUFFLFlBQVk7UUFDekIsZ0JBQWdCLEVBQUUsc0JBQXNCO1FBQ3hDLGVBQWUsRUFBRSxxQkFBcUI7UUFDdEMscUJBQXFCLEVBQUUsMEJBQTBCO0tBQ2xEO0lBRUQsNkJBQTZCLEVBQUcsVUFBUyxXQUFXO1FBQ2xELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM1QyxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENB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Q0gsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekMsS0FBSyxHQUFHLElBQUksQ0FBQzs0QkFDZixDQUFDOzRCQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNOLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQzdFLENBQUM7NEJBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQ0FDZCxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ25CLENBQUM7d0JBQ0gsQ0FBQztvQkFDSCxDQUFDO29CQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ1YsYUFBYSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQzdFLENBQUM7Z0JBQ0gsQ0FBQztnQkFDRCxLQUFLLEVBQUUsVUFBUyxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU07b0JBQ3ZDLGFBQWEsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNyRixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBS0wsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFekQsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQ29weXJpZ2h0IChDKSAyMDA3LTIwMTUgZUJheSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKi9cblxuLypcbiAgdmFyIENvbmZpZ3MgPSByZXF1aXJlKFwiY29yZS9jb25maWdzL2luaXRcIikuQ29uZmlncztcbiAgdmFyIEFjY291bnQgPSByZXF1aXJlKFwiY29yZS9vYmplY3RzL2FjY291bnRcIikuQWNjb3VudDtcbiAgdmFyIExvZ2dlciA9IHJlcXVpcmUoXCJoZWxwZXJzL2xvZ2dlclwiKS5Mb2dnZXI7XG4gIHZhciBUb3BpY3MgPSByZXF1aXJlKFwiaGVscGVycy9vYnNlcnZlckhlbHBlclwiKS5Ub3BpY3M7XG4gIHZhciBPYnNlcnZlckhlbHBlciA9IHJlcXVpcmUoXCJoZWxwZXJzL29ic2VydmVySGVscGVyXCIpLk9ic2VydmVySGVscGVyO1xuICB2YXIgQXBpSGVscGVyID0gcmVxdWlyZShcImNvcmUvaGVscGVycy9hcGlIZWxwZXJcIikuQXBpSGVscGVyO1xuICB2YXIgQnJvd3NlckhlbHBlciA9IHJlcXVpcmUoXCJjb3JlL2hlbHBlcnMvYnJvd3NlckhlbHBlclwiKS5Ccm93c2VySGVscGVyO1xuICB2YXIgVXRpbGl0eUhlbHBlciA9IHJlcXVpcmUoXCJoZWxwZXJzL3V0aWxpdHlIZWxwZXJcIikuVXRpbGl0eUhlbHBlcjtcbiAgdmFyIENvbW1vblNlcnZpY2UgPSByZXF1aXJlKFwiY29yZS9zZXJ2aWNlcy9jb21tb25TZXJ2aWNlXCIpLkNvbW1vblNlcnZpY2U7XG4gIHZhciBNZXNzYWdlUGFuZWxTZXJ2aWNlID0gcmVxdWlyZShcImNvcmUvc2VydmljZXMvbWVzc2FnZVBhbmVsU2VydmljZVwiKS5NZXNzYWdlUGFuZWxTZXJ2aWNlO1xuICB2YXIgSXRlbSA9IHJlcXVpcmUoXCJjb3JlL29iamVjdHMvaXRlbVwiKS5JdGVtO1xuICB2YXIgVHJhbnNhY3Rpb24gPSByZXF1aXJlKFwiY29yZS9vYmplY3RzL3RyYW5zYWN0aW9uXCIpLlRyYW5zYWN0aW9uO1xuICB2YXIgRmF2b3JpdGVTZWFyY2ggPSByZXF1aXJlKFwiY29yZS9vYmplY3RzL2Zhdm9yaXRlU2VhcmNoXCIpLkZhdm9yaXRlU2VhcmNoO1xuICB2YXIgRmF2b3JpdGVTZWxsZXIgPSByZXF1aXJlKFwiY29yZS9vYmplY3RzL2Zhdm9yaXRlU2VsbGVyXCIpLkZhdm9yaXRlU2VsbGVyO1xuICB2YXIgUHJvcGVydHlEQU8gPSByZXF1aXJlKFwic3RvcmFnZS9wcm9wZXJ0eURBT1wiKS5Qcm9wZXJ0eURBTztcbiovXG5cbi8qKlxuICogVHJhZGluZyBBUEkgYWN0aW9uc1xuICovXG52YXIgVHJhZGluZ0FwaSA9IHtcbiAgX1hNTF9IRUFERVIgOiBcIjw/eG1sIHZlcnNpb249XFxcIjEuMFxcXCIgZW5jb2Rpbmc9XFxcInV0Zi04XFxcIj8+XCIsXG4gIF9YTUxfTkFNRVNQQUNFIDogXCJ4bWxucz1cXFwidXJuOmViYXk6YXBpczplQkxCYXNlQ29tcG9uZW50c1xcXCJcIixcblxuICAvLyBHZXRNeWVCYXlCdXlpbmdcbiAgV0FUQ0hfTElTVDogXCJXYXRjaExpc3RcIixcbiAgQklEX0xJU1Q6IFwiQmlkTGlzdFwiLFxuICBXT05fTElTVDogXCJXb25MaXN0XCIsXG4gIExPU1RfTElTVDogXCJMb3N0TGlzdFwiLFxuICBCRVNUX09GRkVSX0xJU1Q6IFwiQmVzdE9mZmVyTGlzdFwiLFxuICBGQVZPUklURV9TRUxMRVJTOiBcIkZhdm9yaXRlU2VsbGVyc1wiLFxuICBGQVZPUklURV9TRUFSQ0hFUzogXCJGYXZvcml0ZVNlYXJjaGVzXCIsXG5cbiAgLy8gR2V0TXllQmF5U2VsbGluZ1xuICBBQ1RJVkVfTElTVDogXCJBY3RpdmVMaXN0XCIsXG4gIFNPTERfTElTVDogXCJTb2xkTGlzdFwiLFxuICBVTlNPTERfTElTVDogXCJVbnNvbGRMaXN0XCIsXG4gIFNDSEVEVUxFRF9MSVNUOiBcIlNjaGVkdWxlZExpc3RcIixcbiAgU0VMTElOR19PRkZFUl9MSVNUOiBcIlNlbGxpbmdPZmZlckxpc3RcIixcblxuICBTT1JUOiB7XG4gICAgQkVTVF9PRkZFUjogXCJCZXN0T2ZmZXJcIixcbiAgICBFTkRfVElNRTogXCJFbmRUaW1lXCIsXG4gICAgRU5EX1RJTUVfREVTQzogXCJFbmRUaW1lRGVzY2VuZGluZ1wiLFxuICAgIENVUlJFTlRfUFJJQ0U6IFwiQ3VycmVudFByaWNlXCIsXG4gICAgQ1VSUkVOVF9QUklDRV9ERVNDOiBcIkN1cnJlbnRQcmljZURlc2NlbmRpbmdcIixcbiAgICBXQVRDSF9DT1VOVDogXCJXYXRjaENvdW50XCIsXG4gICAgV0FUQ0hfQ09VTlRfREVTQzogXCJXYXRjaENvdW50RGVzY2VuZGluZ1wiLFxuICAgIFNUQVJUX1RJTUVfREVTQzogXCJTdGFydFRpbWVEZXNjZW5kaW5nXCIsXG4gICAgQkVTVF9PRkZFUl9DT1VOVF9ERVNDOiBcIkJlc3RPZmZlckNvdW50RGVzY2VuZGluZ1wiXG4gIH0sXG5cbiAgX2NyZWF0ZUdldE15ZUJheUJ1eWluZ1JlcXVlc3QgOiBmdW5jdGlvbihhUmVxdWVzdEFycikge1xuICAgIHZhciByZXF1ZXN0ID0gXCJcIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYVJlcXVlc3RBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZXF1ZXN0T2JqID0gYVJlcXVlc3RBcnJbaV07XG4gICAgICB2YXIgbGlzdE5hbWUgPSByZXF1ZXN0T2JqLm5hbWU7XG5cbiAgICAgIHJlcXVlc3QgKz0gXCI8XCIgKyBsaXN0TmFtZSArIFwiPlwiO1xuICAgICAgc3dpdGNoIChsaXN0TmFtZSkge1xuICAgICAgICBjYXNlIHRoaXMuTE9TVF9MSVNUOlxuICAgICAgICBjYXNlIHRoaXMuV09OX0xJU1Q6XG4gICAgICAgICAgcmVxdWVzdCArPSBcIjxEdXJhdGlvbkluRGF5cz42MDwvRHVyYXRpb25JbkRheXM+XCI7XG4gICAgICAgIGNhc2UgdGhpcy5XQVRDSF9MSVNUOlxuICAgICAgICBjYXNlIHRoaXMuQklEX0xJU1Q6XG4gICAgICAgIGNhc2UgdGhpcy5CRVNUX09GRkVSX0xJU1Q6XG4gICAgICAgICAgaWYgKFwic29ydFwiIGluIHJlcXVlc3RPYmogJiYgcmVxdWVzdE9iai5zb3J0KSB7XG4gICAgICAgICAgICByZXF1ZXN0ICs9IFwiPFNvcnQ+XCIgKyByZXF1ZXN0T2JqLnNvcnQgKyBcIjwvU29ydD5cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVxdWVzdCArPSBcIjxQYWdpbmF0aW9uPlwiO1xuICAgICAgICAgIGlmIChcImVudHJpZXNQZXJQYWdlXCIgaW4gcmVxdWVzdE9iaikge1xuICAgICAgICAgICAgcmVxdWVzdCArPSBcIjxFbnRyaWVzUGVyUGFnZT5cIiArIHJlcXVlc3RPYmouZW50cmllc1BlclBhZ2UgKyBcIjwvRW50cmllc1BlclBhZ2U+XCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcXVlc3QgKz0gXCI8RW50cmllc1BlclBhZ2U+NTwvRW50cmllc1BlclBhZ2U+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChcInBhZ2VOdW1iZXJcIiBpbiByZXF1ZXN0T2JqKSB7XG4gICAgICAgICAgICByZXF1ZXN0ICs9IFwiPFBhZ2VOdW1iZXI+XCIgKyByZXF1ZXN0T2JqLnBhZ2VOdW1iZXIgKyBcIjwvUGFnZU51bWJlcj5cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVxdWVzdCArPSBcIjwvUGFnaW5hdGlvbj5cIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0aGlzLkZBVk9SSVRFX1NFTExFUlM6XG4gICAgICAgIGNhc2UgdGhpcy5GQVZPUklURV9TRUFSQ0hFUzpcbiAgICAgICAgICByZXF1ZXN0ICs9IFwiPEluY2x1ZGU+dHJ1ZTwvSW5jbHVkZT5cIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHJlcXVlc3QgKz0gXCI8L1wiICsgbGlzdE5hbWUgKyBcIj5cIjtcbiAgICB9XG4gICAgcmVxdWVzdCArPSBcIjxEZXRhaWxMZXZlbD5SZXR1cm5TdW1tYXJ5PC9EZXRhaWxMZXZlbD5cIjtcblxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBUcmFkaW5nIEFQSSBHZXRNeWVCYXlCdXlpbmdcbiAgICogQHBhcmFtIGFUb2tlbiB0aGUgdG9rZW4gdG8gYmUgdXNlZCBpbiB0aGUgcmVxdWVzdFxuICAgKiBAcGFyYW0gYVNpdGVJZCB0aGUgc2l0ZSBpZCB0byB1c2UgaW4gdGhlIHJlcXVlc3RcbiAgICogQHBhcmFtIGFSZXF1ZXN0QXJyIHRoZSByZXF1ZXN0IGFycmF5XG4gICAqIEBwYXJhbSBhQ2FsbGJhY2sgdGhlIGNhbGxiYWNrIG1ldGhvZC5cbiAgICogQHJldHVybnMgcmVxdWVzdCBvYmplY3RcbiAgICovXG4gIGdldE15ZUJheUJ1eWluZyA6IGZ1bmN0aW9uKGFUb2tlbiwgYVNpdGVJZCwgYVJlcXVlc3RBcnIsIGFDYWxsYmFjaykge1xuXG4gICAgaWYgKCFhVG9rZW4pIHtcbiAgICAgIExvZ2dlci5lcnJvcihcbiAgICAgICAgXCJBdHRlbXB0IHRvIG1ha2UgVHJhZGluZyBBUEkgR2V0TXllQmF5QnV5aW5nIGNhbGwgd2hlbiBubyBhY2NvdW50IGlzIFwiICtcbiAgICAgICAgXCJhY3RpdmUuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgd3JhcHBlZEJvZHk7XG4gICAgdmFyIGxvY2FsQ2FsbGJhY2s7XG4gICAgdmFyIHJlcXVlc3Q7XG4gICAgdmFyIGlubmVyQm9keSA9IHRoaXMuX2NyZWF0ZUdldE15ZUJheUJ1eWluZ1JlcXVlc3QoYVJlcXVlc3RBcnIpO1xuXG4gICAgLy9YWFg6IHRoaXMgaXMganVzdCBmb3IgdGVzdC4gUmVtb3ZlIHdoZW4gbm90IG5lZWRlZC5cbiAgICB2YXIgaW5pdGlhbFRpbWVzdGFtcCA9ICQubm93KCk7XG4gICAgdmFyIGZpbmFsVGltZXN0YW1wID0gMDtcbiAgICB2YXIgZWxhcHNlZFRpbWUgPSAwO1xuXG4gICAgd3JhcHBlZEJvZHkgPSB0aGlzLl93cmFwQ2FsbChcIkdldE15ZUJheUJ1eWluZ1wiLCBpbm5lckJvZHksIGFUb2tlbik7XG4gICAgbG9jYWxDYWxsYmFjayA9IGZ1bmN0aW9uKGFSZXNwb25zZSkge1xuXG4gICAgICAvL1hYWDogdGhpcyBpcyBqdXN0IGZvciB0ZXN0LiBSZW1vdmUgd2hlbiBub3QgbmVlZGVkLlxuICAgICAgZmluYWxUaW1lc3RhbXAgPSAkLm5vdygpO1xuICAgICAgZWxhcHNlZFRpbWUgPSAoZmluYWxUaW1lc3RhbXAgLSBpbml0aWFsVGltZXN0YW1wKSAvIDEwMDA7XG4gICAgICBpZiAoUHJvcGVydHlEQU8uZ2V0KFByb3BlcnR5REFPLlBST1BfRElTUExBWV9MT0dTKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlc3BvbnNlIGJ1eWluZ1wiLCBhUmVzcG9uc2UpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImVsYXBzZWQgdGltZSAoaW4gc2Vjb25kcyk6IFwiICsgZWxhcHNlZFRpbWUpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIi0tLSBlbmQgcmVzcG9uc2UgYnV5aW5nIC0tLVxcblwiKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3VsdCA9IHRoYXQuX3BhcnNlR2V0TXllQmF5QnV5aW5nUmVzcG9uc2UoYVJlc3BvbnNlKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgICBhQ2FsbGJhY2socmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIExvZ2dlci5lcnJvcihcIlRyYWRpbmdBcGkuZ2V0TXllQmF5QnV5aW5nIEVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3QgPSB0aGlzLl9kb0NhbGwod3JhcHBlZEJvZHksIGFTaXRlSWQsIGxvY2FsQ2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH0sXG5cbiAgX3BhcnNlR2V0TXllQmF5QnV5aW5nUmVzcG9uc2UgOiBmdW5jdGlvbihhUmVzcG9uc2UpIHtcblxuICAgIHZhciBhY2NvdW50ID0gQWNjb3VudC5nZXRBY2NvdW50KCk7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgaWYgKCFhUmVzcG9uc2UpIHtcbiAgICAgIHJlc3VsdC5lcnJvcnMgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdHJhbnNhY3Rpb25zID0ge307XG4gICAgICB2YXIgb2ZmZXJMaXN0ID0gW107XG4gICAgICB2YXIgd2F0Y2hMaXN0ID0gW107XG4gICAgICB2YXIgYmlkTGlzdCA9IFtdO1xuICAgICAgdmFyIHdvbkxpc3QgPSBbXTtcbiAgICAgIHZhciBsb3N0TGlzdCA9IFtdO1xuICAgICAgdmFyIHN1bW1hcnkgPSB7fTtcbiAgICAgIHZhciB3YXRjaFN1bW1hcnkgPSB7fTtcbiAgICAgIHZhciBwYWdpbmF0aW9uUmVzdWx0O1xuICAgICAgdmFyIGxpc3Q7XG4gICAgICB2YXIgeG1sSXRlbTtcbiAgICAgIHZhciBpdGVtO1xuXG4gICAgICAvL1hYWDogYmxvY2sgb2YgY29kZSBjb21tZW50ZWQgYmVjYXVzZSBvZiB0aGlzIGJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL2FwcGNvYXN0L0lOVEVSTkFMLTQuMC1lYmF5LXRhc2tzL2lzc3Vlcy80NTVcbiAgICAgIC8qXG4gICAgICAkKGFSZXNwb25zZSkuZmluZChcIlRyYW5zYWN0aW9uXCIpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpdGVtSWQgPSBOdW1iZXIoJCh0aGlzKS5maW5kKFwiSXRlbUlEXCIpLnRleHQoKSk7XG4gICAgICAgIHZhciB0cmFuc2FjdGlvbklkID0gTnVtYmVyKCQodGhpcykuZmluZChcIlRyYW5zYWN0aW9uSURcIikudGV4dCgpKTtcbiAgICAgICAgdmFyIHRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKGl0ZW1JZCwgdHJhbnNhY3Rpb25JZCk7XG4gICAgICAgIHRyYW5zYWN0aW9uLmZyb21YTUwodGhpcywgZmFsc2UsIFRyYW5zYWN0aW9uLlRZUEVTLkJVWUlORyk7XG4gICAgICAgIGlmIChpdGVtSWQgaW4gdHJhbnNhY3Rpb25zKSB7XG4gICAgICAgICAgdHJhbnNhY3Rpb25zW2l0ZW1JZF0ucHVzaCh0cmFuc2FjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJhbnNhY3Rpb25zW2l0ZW1JZF0gPSBbdHJhbnNhY3Rpb25dO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICovXG5cbiAgICAgIGxpc3QgPSAkKGFSZXNwb25zZSkuZmluZChcIldhdGNoTGlzdFwiKTtcbiAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGlzdC5maW5kKFwiSXRlbVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGl0ZW0gPSBuZXcgSXRlbSgkKHRoaXMpLmZpbmQoXCJJdGVtSURcIikudGV4dCgpKTtcbiAgICAgICAgICB4bWxJdGVtID0gJCh0aGlzKTtcbiAgICAgICAgICBpdGVtLnNldChcInR5cGVcIiwgSXRlbS5UWVBFUy5XQVRDSElORyk7XG4gICAgICAgICAgaXRlbS5mcm9tWE1MKHhtbEl0ZW0sIEl0ZW0uWE1MX1BSRUZJWEVTLkJVWVNFTEwpO1xuICAgICAgICAgIGlmIChUcmFkaW5nQXBpLmlzVmFsaWRYTUxJdGVtKHhtbEl0ZW0pKSB7XG4gICAgICAgICAgICB3YXRjaExpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdpbmF0aW9uUmVzdWx0ID0gbGlzdC5jaGlsZHJlbihcIlBhZ2luYXRpb25SZXN1bHRcIik7XG4gICAgICAgIHdhdGNoU3VtbWFyeS53YXRjaENvdW50ID0gTnVtYmVyKHBhZ2luYXRpb25SZXN1bHQuY2hpbGRyZW4oXCJUb3RhbE51bWJlck9mRW50cmllc1wiKS50ZXh0KCkpO1xuICAgICAgICB3YXRjaFN1bW1hcnkud2F0Y2hUb3RhbFBhZ2VzID0gTnVtYmVyKHBhZ2luYXRpb25SZXN1bHQuY2hpbGRyZW4oXCJUb3RhbE51bWJlck9mUGFnZXNcIikudGV4dCgpKTtcbiAgICAgIH1cblxuICAgICAgbGlzdCA9ICQoYVJlc3BvbnNlKS5maW5kKFwiQmVzdE9mZmVyTGlzdFwiKTtcbiAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGlzdC5maW5kKFwiSXRlbVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGl0ZW0gPSBuZXcgSXRlbSgkKHRoaXMpLmZpbmQoXCJJdGVtSURcIikudGV4dCgpKTtcbiAgICAgICAgICB4bWxJdGVtID0gJCh0aGlzKTtcbiAgICAgICAgICBpdGVtLnNldChcInR5cGVcIiwgSXRlbS5UWVBFUy5CRVNUX09GRkVSKTtcbiAgICAgICAgICBpdGVtLmZyb21YTUwoeG1sSXRlbSwgSXRlbS5YTUxfUFJFRklYRVMuQlVZU0VMTCk7XG4gICAgICAgICAgaWYgKFRyYWRpbmdBcGkuaXNWYWxpZFhNTEl0ZW0oeG1sSXRlbSkpIHtcbiAgICAgICAgICAgIG9mZmVyTGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHBhZ2luYXRpb25SZXN1bHQgPSBsaXN0LmNoaWxkcmVuKFwiUGFnaW5hdGlvblJlc3VsdFwiKTtcbiAgICAgICAgc3VtbWFyeS5vZmZlckNvdW50ID0gTnVtYmVyKHBhZ2luYXRpb25SZXN1bHQuY2hpbGRyZW4oXCJUb3RhbE51bWJlck9mRW50cmllc1wiKS50ZXh0KCkpO1xuICAgICAgICBzdW1tYXJ5Lm9mZmVyVG90YWxQYWdlcyA9IE51bWJlcihwYWdpbmF0aW9uUmVzdWx0LmNoaWxkcmVuKFwiVG90YWxOdW1iZXJPZlBhZ2VzXCIpLnRleHQoKSk7XG4gICAgICB9XG5cbiAgICAgIGxpc3QgPSAkKGFSZXNwb25zZSkuZmluZChcIkJpZExpc3RcIik7XG4gICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3QuZmluZChcIkl0ZW1cIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpdGVtID0gbmV3IEl0ZW0oJCh0aGlzKS5maW5kKFwiSXRlbUlEXCIpLnRleHQoKSk7XG4gICAgICAgICAgeG1sSXRlbSA9ICQodGhpcyk7XG4gICAgICAgICAgaXRlbS5zZXQoXCJ0eXBlXCIsIEl0ZW0uVFlQRVMuQklERElORyk7XG4gICAgICAgICAgaXRlbS5mcm9tWE1MKHhtbEl0ZW0sIEl0ZW0uWE1MX1BSRUZJWEVTLkJVWVNFTEwpO1xuICAgICAgICAgIGlmIChUcmFkaW5nQXBpLmlzVmFsaWRYTUxJdGVtKHhtbEl0ZW0pKSB7XG4gICAgICAgICAgICBiaWRMaXN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcGFnaW5hdGlvblJlc3VsdCA9IGxpc3QuY2hpbGRyZW4oXCJQYWdpbmF0aW9uUmVzdWx0XCIpO1xuICAgICAgICBzdW1tYXJ5LmJpZENvdW50ID0gTnVtYmVyKHBhZ2luYXRpb25SZXN1bHQuY2hpbGRyZW4oXCJUb3RhbE51bWJlck9mRW50cmllc1wiKS50ZXh0KCkpO1xuICAgICAgICBzdW1tYXJ5LmJpZFRvdGFsUGFnZXMgPSBOdW1iZXIocGFnaW5hdGlvblJlc3VsdC5jaGlsZHJlbihcIlRvdGFsTnVtYmVyT2ZQYWdlc1wiKS50ZXh0KCkpO1xuICAgICAgfVxuXG4gICAgICBsaXN0ID0gJChhUmVzcG9uc2UpLmZpbmQoXCJXb25MaXN0XCIpO1xuICAgICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBsaXN0LmZpbmQoXCJJdGVtXCIpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGl0ZW1JZCA9ICQodGhpcykuZmluZChcIkl0ZW1JRFwiKS50ZXh0KCk7XG4gICAgICAgICAgaXRlbSA9IG5ldyBJdGVtKGl0ZW1JZCk7XG4gICAgICAgICAgeG1sSXRlbSA9ICQodGhpcyk7XG4gICAgICAgICAgaXRlbS5zZXQoXCJ0eXBlXCIsIEl0ZW0uVFlQRVMuV09OKTtcbiAgICAgICAgICBpdGVtLmZyb21YTUwoeG1sSXRlbSwgSXRlbS5YTUxfUFJFRklYRVMuQlVZU0VMTCk7XG5cbiAgICAgICAgICB2YXIgeG1sVHJhbnNhY3Rpb24gPSAkKHRoaXMpLnBhcmVudChcIlRyYW5zYWN0aW9uXCIpO1xuICAgICAgICAgIGlmICh4bWxUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgdmFyIHRyYW5zYWN0aW9uSWQgPSAkKHhtbFRyYW5zYWN0aW9uKS5maW5kKFwiVHJhbnNhY3Rpb25JRFwiKS50ZXh0KCk7XG4gICAgICAgICAgICB2YXIgdHJhbnNhY3Rpb24gPSBuZXcgVHJhbnNhY3Rpb24oaXRlbUlkLCB0cmFuc2FjdGlvbklkKTtcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uLmZyb21YTUwoeG1sVHJhbnNhY3Rpb24sIGZhbHNlLCBUcmFuc2FjdGlvbi5UWVBFUy5CVVlJTkcpO1xuICAgICAgICAgICAgaXRlbS5zZXQoXCJ0cmFuc2FjdGlvbnNcIiwgbmV3IEFycmF5KHRyYW5zYWN0aW9uKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFRyYWRpbmdBcGkuaXNWYWxpZFhNTEl0ZW0oeG1sSXRlbSkpIHtcbiAgICAgICAgICAgIHdvbkxpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdpbmF0aW9uUmVzdWx0ID0gbGlzdC5jaGlsZHJlbihcIlBhZ2luYXRpb25SZXN1bHRcIik7XG4gICAgICAgIHN1bW1hcnkud29uQ291bnQgPSBOdW1iZXIocGFnaW5hdGlvblJlc3VsdC5jaGlsZHJlbihcIlRvdGFsTnVtYmVyT2ZFbnRyaWVzXCIpLnRleHQoKSk7XG4gICAgICAgIHN1bW1hcnkud29uVG90YWxQYWdlcyA9IE51bWJlcihwYWdpbmF0aW9uUmVzdWx0LmNoaWxkcmVuKFwiVG90YWxOdW1iZXJPZlBhZ2VzXCIpLnRleHQoKSk7XG4gICAgICB9XG5cbiAgICAgIGxpc3QgPSAkKGFSZXNwb25zZSkuZmluZChcIkxvc3RMaXN0XCIpO1xuICAgICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBsaXN0LmZpbmQoXCJJdGVtXCIpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaXRlbSA9IG5ldyBJdGVtKCQodGhpcykuZmluZChcIkl0ZW1JRFwiKS50ZXh0KCkpO1xuICAgICAgICAgIHhtbEl0ZW0gPSAkKHRoaXMpO1xuICAgICAgICAgIGl0ZW0uc2V0KFwidHlwZVwiLCBJdGVtLlRZUEVTLkxPU1QpO1xuICAgICAgICAgIGl0ZW0uZnJvbVhNTCh4bWxJdGVtLCBJdGVtLlhNTF9QUkVGSVhFUy5CVVlTRUxMKTtcbiAgICAgICAgICBpZiAoVHJhZGluZ0FwaS5pc1ZhbGlkWE1MSXRlbSh4bWxJdGVtKSkge1xuICAgICAgICAgICAgbG9zdExpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdpbmF0aW9uUmVzdWx0ID0gbGlzdC5jaGlsZHJlbihcIlBhZ2luYXRpb25SZXN1bHRcIik7XG4gICAgICAgIHN1bW1hcnkubG9zdENvdW50ID0gTnVtYmVyKHBhZ2luYXRpb25SZXN1bHQuY2hpbGRyZW4oXCJUb3RhbE51bWJlck9mRW50cmllc1wiKS50ZXh0KCkpO1xuICAgICAgICBzdW1tYXJ5Lmxvc3RUb3RhbFBhZ2VzID0gTnVtYmVyKHBhZ2luYXRpb25SZXN1bHQuY2hpbGRyZW4oXCJUb3RhbE51bWJlck9mUGFnZXNcIikudGV4dCgpKTtcbiAgICAgIH1cblxuICAgICAgLy8gRXh0cmFjdCBmYXZvcml0ZSBzZWxsZXJzIGZyb20gdGhlIGNhbGwgKGlmIGFueSlcbiAgICAgIHZhciBmYXZvcml0ZVNlbGxlcnMgPSBbXTtcbiAgICAgICQoYVJlc3BvbnNlKS5maW5kKFwiRmF2b3JpdGVTZWxsZXJcIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGxlcklkID0gJCh0aGlzKS5maW5kKFwiVXNlcklEXCIpLnRleHQoKTtcbiAgICAgICAgdmFyIHN0b3JlTmFtZSA9ICQodGhpcykuZmluZChcIlN0b3JlTmFtZVwiKS50ZXh0KCk7XG4gICAgICAgIHZhciBmYXZvcml0ZVNlbGxlciA9XG4gICAgICAgICAgbmV3IEZhdm9yaXRlU2VsbGVyKGFjY291bnQuZ2V0KFwidXNlcklkXCIpLCBzZWxsZXJJZCk7XG4gICAgICAgIGZhdm9yaXRlU2VsbGVyLnNldChcInN0b3JlTmFtZVwiLCBzdG9yZU5hbWUpO1xuICAgICAgICBmYXZvcml0ZVNlbGxlcnMucHVzaChmYXZvcml0ZVNlbGxlcik7XG4gICAgICB9KTtcblxuICAgICAgLy8gRXh0cmFjdCBmYXZvcml0ZSBzZWFyY2hlcyBmcm9tIHRoZSBjYWxsIChpZiBhbnkpXG4gICAgICB2YXIgZmF2b3JpdGVTZWFyY2hlcyA9IFtdO1xuICAgICAgJChhUmVzcG9uc2UpLmZpbmQoXCJGYXZvcml0ZVNlYXJjaFwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VhcmNoTmFtZSA9ICQodGhpcykuZmluZChcIlNlYXJjaE5hbWVcIikudGV4dCgpO1xuICAgICAgICB2YXIgc2VhcmNoUXVlcnkgPSAkKHRoaXMpLmZpbmQoXCJTZWFyY2hRdWVyeVwiKS50ZXh0KCk7XG4gICAgICAgIHZhciBmYXZvcml0ZVNlYXJjaCA9XG4gICAgICAgICAgbmV3IEZhdm9yaXRlU2VhcmNoKFxuICAgICAgICAgICAgYWNjb3VudC5nZXQoXCJ1c2VySWRcIiksIHNlYXJjaE5hbWUpO1xuICAgICAgICBmYXZvcml0ZVNlYXJjaC5zZXQoXCJzZWFyY2hRdWVyeVwiLCBzZWFyY2hRdWVyeSk7XG4gICAgICAgIGZhdm9yaXRlU2VhcmNoZXMucHVzaChmYXZvcml0ZVNlYXJjaCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gRXh0cmFjdCB0aGUgdGltZXN0YW1wICh1c2VkIGZvciB0cmFja2luZyBlQmF5IHRpbWUpXG4gICAgICB2YXIgdGltZXN0YW1wVGV4dCA9ICQoYVJlc3BvbnNlKS5maW5kKFwiVGltZXN0YW1wXCIpLnRleHQoKTtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBVdGlsaXR5SGVscGVyLmRhdGVGcm9tSXNvODYwMSh0aW1lc3RhbXBUZXh0KTtcblxuICAgICAgcmVzdWx0Lmxpc3RzID0ge1xuICAgICAgICBvZmZlckxpc3Q6IG9mZmVyTGlzdCxcbiAgICAgICAgd2F0Y2hMaXN0OiB3YXRjaExpc3QsXG4gICAgICAgIGJpZExpc3Q6IGJpZExpc3QsXG4gICAgICAgIHdvbkxpc3Q6IHdvbkxpc3QsXG4gICAgICAgIGxvc3RMaXN0OiBsb3N0TGlzdFxuICAgICAgfTtcbiAgICAgIHJlc3VsdC5zdW1tYXJ5ID0gc3VtbWFyeTtcbiAgICAgIHJlc3VsdC53YXRjaFN1bW1hcnkgPSB3YXRjaFN1bW1hcnk7XG4gICAgICByZXN1bHQudHJhbnNhY3Rpb25zID0gdHJhbnNhY3Rpb25zO1xuICAgICAgcmVzdWx0LmZhdm9yaXRlU2VhcmNoZXMgPSBmYXZvcml0ZVNlYXJjaGVzO1xuICAgICAgcmVzdWx0LmZhdm9yaXRlU2VsbGVycyA9IGZhdm9yaXRlU2VsbGVycztcbiAgICAgIHJlc3VsdC50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBfY3JlYXRlR2V0TXllQmF5U2VsbGluZ1JlcXVlc3QgOiBmdW5jdGlvbihhUmVxdWVzdEFycikge1xuICAgIHZhciByZXF1ZXN0ID0gXCJcIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYVJlcXVlc3RBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZXF1ZXN0T2JqID0gYVJlcXVlc3RBcnJbaV07XG4gICAgICB2YXIgbGlzdE5hbWUgPSByZXF1ZXN0T2JqLm5hbWU7XG5cbiAgICAgIC8vIHNlbGxpbmcgPiBvZmZlcnNcbiAgICAgIGlmIChsaXN0TmFtZSA9PSB0aGlzLlNFTExJTkdfT0ZGRVJfTElTVCkge1xuICAgICAgICBsaXN0TmFtZSA9IHRoaXMuQUNUSVZFX0xJU1Q7XG4gICAgICAgIHJlcXVlc3RPYmouc29ydCA9IHRoaXMuU09SVC5CRVNUX09GRkVSX0NPVU5UX0RFU0M7XG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QgKz0gXCI8XCIgKyBsaXN0TmFtZSArIFwiPlwiO1xuICAgICAgc3dpdGNoIChsaXN0TmFtZSkge1xuICAgICAgICBjYXNlIHRoaXMuU09MRF9MSVNUOlxuICAgICAgICAgIGlmIChcImZpbHRlclwiIGluIHJlcXVlc3RPYmogJiYgcmVxdWVzdE9iai5maWx0ZXIpIHtcbiAgICAgICAgICAgIHJlcXVlc3QgKz0gXCI8T3JkZXJTdGF0dXNGaWx0ZXI+XCIgKyByZXF1ZXN0T2JqLmZpbHRlciArIFwiPC9PcmRlclN0YXR1c0ZpbHRlcj5cIjtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgdGhpcy5VTlNPTERfTElTVDpcbiAgICAgICAgICByZXF1ZXN0ICs9IFwiPER1cmF0aW9uSW5EYXlzPjYwPC9EdXJhdGlvbkluRGF5cz5cIjtcbiAgICAgICAgY2FzZSB0aGlzLkFDVElWRV9MSVNUOlxuICAgICAgICAgIGlmIChcInNvcnRcIiBpbiByZXF1ZXN0T2JqICYmIHJlcXVlc3RPYmouc29ydCkge1xuICAgICAgICAgICAgcmVxdWVzdCArPSBcIjxTb3J0PlwiICsgcmVxdWVzdE9iai5zb3J0ICsgXCI8L1NvcnQ+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcXVlc3QgKz0gXCI8UGFnaW5hdGlvbj5cIjtcbiAgICAgICAgICBpZiAoXCJlbnRyaWVzUGVyUGFnZVwiIGluIHJlcXVlc3RPYmopIHtcbiAgICAgICAgICAgIHJlcXVlc3QgKz0gXCI8RW50cmllc1BlclBhZ2U+XCIgKyByZXF1ZXN0T2JqLmVudHJpZXNQZXJQYWdlICsgXCI8L0VudHJpZXNQZXJQYWdlPlwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXF1ZXN0ICs9IFwiPEVudHJpZXNQZXJQYWdlPjU8L0VudHJpZXNQZXJQYWdlPlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoXCJwYWdlTnVtYmVyXCIgaW4gcmVxdWVzdE9iaikge1xuICAgICAgICAgICAgcmVxdWVzdCArPSBcIjxQYWdlTnVtYmVyPlwiICsgcmVxdWVzdE9iai5wYWdlTnVtYmVyICsgXCI8L1BhZ2VOdW1iZXI+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcXVlc3QgKz0gXCI8L1BhZ2luYXRpb24+XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXF1ZXN0ICs9IFwiPC9cIiArIGxpc3ROYW1lICsgXCI+XCI7XG4gICAgfVxuICAgIHJlcXVlc3QgKz0gXCI8RGV0YWlsTGV2ZWw+UmV0dXJuU3VtbWFyeTwvRGV0YWlsTGV2ZWw+XCI7XG5cbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfSxcblxuICAvKipcbiAgICogVHJhZGluZyBBUEkgR2V0TXllQmF5U2VsbGluZy5cbiAgICogQHBhcmFtIGFUb2tlbiB0aGUgdG9rZW4gdG8gYmUgdXNlZCBpbiB0aGUgcmVxdWVzdFxuICAgKiBAcGFyYW0gYVNpdGVJZCB0aGUgc2l0ZSBpZCB0byB1c2UgaW4gdGhlIHJlcXVlc3RcbiAgICogQHBhcmFtIGFSZXF1ZXN0QXJyIHRoZSByZXF1ZXN0IGFycmF5XG4gICAqIEBwYXJhbSBhQ2FsbGJhY2tcbiAgICogQHJldHVybiByZXF1ZXN0IG9iamVjdC5cbiAgICovXG4gIGdldE15ZUJheVNlbGxpbmcgOiBmdW5jdGlvbihhVG9rZW4sIGFTaXRlSWQsIGFSZXF1ZXN0QXJyLCBhQ2FsbGJhY2spIHtcblxuICAgIGlmICghYVRva2VuKSB7XG4gICAgICBMb2dnZXIuZXJyb3IoXG4gICAgICAgIFwiQXR0ZW1wdCB0byBtYWtlIFRyYWRpbmcgQVBJIGdldE15ZUJheVNlbGxpbmcgY2FsbCB3aGVuIG5vIGFjY291bnQgXCIgK1xuICAgICAgICBcImlzIGFjdGl2ZS5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciB3cmFwcGVkQm9keTtcbiAgICB2YXIgbG9jYWxDYWxsYmFjaztcbiAgICB2YXIgcmVxdWVzdDtcbiAgICB2YXIgaW5uZXJCb2R5ID0gdGhpcy5fY3JlYXRlR2V0TXllQmF5U2VsbGluZ1JlcXVlc3QoYVJlcXVlc3RBcnIpO1xuXG4gICAgLy9YWFg6IHRoaXMgaXMganVzdCBmb3IgdGVzdC4gUmVtb3ZlIHdoZW4gbm90IG5lZWRlZC5cbiAgICB2YXIgaW5pdGlhbFRpbWVzdGFtcCA9ICQubm93KCk7XG4gICAgdmFyIGZpbmFsVGltZXN0YW1wID0gMDtcbiAgICB2YXIgZWxhcHNlZFRpbWUgPSAwO1xuXG4gICAgd3JhcHBlZEJvZHkgPSB0aGlzLl93cmFwQ2FsbChcIkdldE15ZUJheVNlbGxpbmdcIiwgaW5uZXJCb2R5LCBhVG9rZW4pO1xuICAgIGxvY2FsQ2FsbGJhY2sgPSBmdW5jdGlvbihhUmVzcG9uc2UpIHtcblxuICAgICAgLy9YWFg6IHRoaXMgaXMganVzdCBmb3IgdGVzdC4gUmVtb3ZlIHdoZW4gbm90IG5lZWRlZC5cbiAgICAgIGZpbmFsVGltZXN0YW1wID0gJC5ub3coKTtcbiAgICAgIGVsYXBzZWRUaW1lID0gKGZpbmFsVGltZXN0YW1wIC0gaW5pdGlhbFRpbWVzdGFtcCkgLyAxMDAwO1xuICAgICAgaWYgKFByb3BlcnR5REFPLmdldChQcm9wZXJ0eURBTy5QUk9QX0RJU1BMQVlfTE9HUykpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZXNwb25zZSBzZWxsaW5nXCIsIGFSZXNwb25zZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZWxhcHNlZCB0aW1lIChpbiBzZWNvbmRzKTogXCIgKyBlbGFwc2VkVGltZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiLS0tIGVuZCByZXNwb25zZSBzZWxsaW5nIC0tLVxcblwiKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3VsdCA9IHRoYXQuX3BhcnNlR2V0TXllQmF5U2VsbGluZ1Jlc3BvbnNlKGFSZXNwb25zZSk7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoYUNhbGxiYWNrKSB7XG4gICAgICAgICAgYUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBMb2dnZXIuZXJyb3IoXCJUcmFkaW5nQXBpLmdldE15ZUJheVNlbGxpbmcgRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdCA9IHRoaXMuX2RvQ2FsbCh3cmFwcGVkQm9keSwgYVNpdGVJZCwgbG9jYWxDYWxsYmFjayk7XG5cbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfSxcblxuICBfcGFyc2VHZXRNeWVCYXlTZWxsaW5nUmVzcG9uc2UgOiBmdW5jdGlvbihhUmVzcG9uc2UpIHtcblxuICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgIGlmICghYVJlc3BvbnNlKSB7XG4gICAgICByZXN1bHQuZXJyb3JzID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRyYW5zYWN0aW9ucyA9IHt9O1xuICAgICAgdmFyIGFjdGl2ZUxpc3QgPSBbXTtcbiAgICAgIHZhciBzb2xkTGlzdCA9IFtdO1xuICAgICAgdmFyIHVuc29sZExpc3QgPSBbXTtcbiAgICAgIHZhciBzY2hlZHVsZWRMaXN0ID0gW107XG4gICAgICB2YXIgc3VtbWFyeSA9IHt9O1xuICAgICAgdmFyIHBhZ2luYXRpb25SZXN1bHQ7XG4gICAgICB2YXIgbGlzdDtcbiAgICAgIHZhciB4bWxJdGVtO1xuICAgICAgdmFyIGl0ZW07XG5cbiAgICAgIC8vWFhYOiBibG9jayBvZiBjb2RlIGNvbW1lbnRlZCBiZWNhdXNlIG9mIHRoaXMgYnVnOiBodHRwczovL2dpdGh1Yi5jb20vYXBwY29hc3QvSU5URVJOQUwtNC4wLWViYXktdGFza3MvaXNzdWVzLzQ1NVxuICAgICAgLypcbiAgICAgICQoYVJlc3BvbnNlKS5maW5kKFwiVHJhbnNhY3Rpb25cIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGl0ZW1JZCA9IE51bWJlcigkKHRoaXMpLmZpbmQoXCJJdGVtSURcIikudGV4dCgpKTtcbiAgICAgICAgdmFyIHRyYW5zYWN0aW9uSWQgPSBOdW1iZXIoJCh0aGlzKS5maW5kKFwiVHJhbnNhY3Rpb25JRFwiKS50ZXh0KCkpO1xuICAgICAgICB2YXIgdHJhbnNhY3Rpb24gPSBuZXcgVHJhbnNhY3Rpb24oaXRlbUlkLCB0cmFuc2FjdGlvbklkKTtcbiAgICAgICAgdHJhbnNhY3Rpb24uZnJvbVhNTCh0aGlzLCBmYWxzZSwgVHJhbnNhY3Rpb24uVFlQRVMuU0VMTElORyk7XG4gICAgICAgIGlmIChpdGVtSWQgaW4gdHJhbnNhY3Rpb25zKSB7XG4gICAgICAgICAgdHJhbnNhY3Rpb25zW2l0ZW1JZF0ucHVzaCh0cmFuc2FjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJhbnNhY3Rpb25zW2l0ZW1JZF0gPSBbdHJhbnNhY3Rpb25dO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICovXG5cbiAgICAgIGxpc3QgPSAkKGFSZXNwb25zZSkuZmluZChcIkFjdGl2ZUxpc3RcIik7XG4gICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3QuZmluZChcIkl0ZW1cIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpdGVtID0gbmV3IEl0ZW0oJCh0aGlzKS5maW5kKFwiSXRlbUlEXCIpLnRleHQoKSk7XG4gICAgICAgICAgeG1sSXRlbSA9ICQodGhpcyk7XG4gICAgICAgICAgaXRlbS5zZXQoXCJ0eXBlXCIsIEl0ZW0uVFlQRVMuU0VMTElORyk7XG4gICAgICAgICAgaXRlbS5mcm9tWE1MKHhtbEl0ZW0sIEl0ZW0uWE1MX1BSRUZJWEVTLkJVWVNFTEwpO1xuICAgICAgICAgIGlmIChUcmFkaW5nQXBpLmlzVmFsaWRYTUxJdGVtKHhtbEl0ZW0pKSB7XG4gICAgICAgICAgICBhY3RpdmVMaXN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcGFnaW5hdGlvblJlc3VsdCA9IGxpc3QuY2hpbGRyZW4oXCJQYWdpbmF0aW9uUmVzdWx0XCIpO1xuICAgICAgICBzdW1tYXJ5LmFjdGl2ZUNvdW50ID0gTnVtYmVyKHBhZ2luYXRpb25SZXN1bHQuY2hpbGRyZW4oXCJUb3RhbE51bWJlck9mRW50cmllc1wiKS50ZXh0KCkpO1xuICAgICAgICBzdW1tYXJ5LmFjdGl2ZVRvdGFsUGFnZXMgPSBOdW1iZXIocGFnaW5hdGlvblJlc3VsdC5jaGlsZHJlbihcIlRvdGFsTnVtYmVyT2ZQYWdlc1wiKS50ZXh0KCkpO1xuICAgICAgfVxuXG4gICAgICBsaXN0ID0gJChhUmVzcG9uc2UpLmZpbmQoXCJTb2xkTGlzdFwiKTtcbiAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGlzdC5maW5kKFwiSXRlbVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBpdGVtSWQgPSAkKHRoaXMpLmZpbmQoXCJJdGVtSURcIikudGV4dCgpO1xuICAgICAgICAgIGl0ZW0gPSBuZXcgSXRlbShpdGVtSWQpO1xuICAgICAgICAgIHhtbEl0ZW0gPSAkKHRoaXMpO1xuICAgICAgICAgIGl0ZW0uc2V0KFwidHlwZVwiLCBJdGVtLlRZUEVTLlNPTEQpO1xuICAgICAgICAgIGl0ZW0uZnJvbVhNTCh4bWxJdGVtLCBJdGVtLlhNTF9QUkVGSVhFUy5CVVlTRUxMKTtcblxuICAgICAgICAgIHZhciB4bWxUcmFuc2FjdGlvbiA9ICQodGhpcykucGFyZW50KFwiVHJhbnNhY3Rpb25cIik7XG4gICAgICAgICAgaWYgKHhtbFRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNhY3Rpb25JZCA9ICQoeG1sVHJhbnNhY3Rpb24pLmZpbmQoXCJUcmFuc2FjdGlvbklEXCIpLnRleHQoKTtcbiAgICAgICAgICAgIHZhciB0cmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbihpdGVtSWQsIHRyYW5zYWN0aW9uSWQpO1xuICAgICAgICAgICAgdHJhbnNhY3Rpb24uZnJvbVhNTCh4bWxUcmFuc2FjdGlvbiwgZmFsc2UsIFRyYW5zYWN0aW9uLlRZUEVTLlNFTExJTkcpO1xuICAgICAgICAgICAgaXRlbS5zZXQoXCJ0cmFuc2FjdGlvbnNcIiwgbmV3IEFycmF5KHRyYW5zYWN0aW9uKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFRyYWRpbmdBcGkuaXNWYWxpZFhNTEl0ZW0oeG1sSXRlbSkpIHtcbiAgICAgICAgICAgIHNvbGRMaXN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcGFnaW5hdGlvblJlc3VsdCA9IGxpc3QuY2hpbGRyZW4oXCJQYWdpbmF0aW9uUmVzdWx0XCIpO1xuICAgICAgICBzdW1tYXJ5LnNvbGRDb3VudCA9IE51bWJlcihwYWdpbmF0aW9uUmVzdWx0LmNoaWxkcmVuKFwiVG90YWxOdW1iZXJPZkVudHJpZXNcIikudGV4dCgpKTtcbiAgICAgICAgc3VtbWFyeS5zb2xkVG90YWxQYWdlcyA9IE51bWJlcihwYWdpbmF0aW9uUmVzdWx0LmNoaWxkcmVuKFwiVG90YWxOdW1iZXJPZlBhZ2VzXCIpLnRleHQoKSk7XG4gICAgICB9XG5cbiAgICAgIGxpc3QgPSAkKGFSZXNwb25zZSkuZmluZChcIlVuc29sZExpc3RcIik7XG4gICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3QuZmluZChcIkl0ZW1cIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpdGVtID0gbmV3IEl0ZW0oJCh0aGlzKS5maW5kKFwiSXRlbUlEXCIpLnRleHQoKSk7XG4gICAgICAgICAgeG1sSXRlbSA9ICQodGhpcyk7XG4gICAgICAgICAgaXRlbS5zZXQoXCJ0eXBlXCIsIEl0ZW0uVFlQRVMuVU5TT0xEKTtcbiAgICAgICAgICBpdGVtLmZyb21YTUwoeG1sSXRlbSwgSXRlbS5YTUxfUFJFRklYRVMuQlVZU0VMTCk7XG4gICAgICAgICAgaWYgKFRyYWRpbmdBcGkuaXNWYWxpZFhNTEl0ZW0oeG1sSXRlbSkpIHtcbiAgICAgICAgICAgIHVuc29sZExpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdpbmF0aW9uUmVzdWx0ID0gbGlzdC5jaGlsZHJlbihcIlBhZ2luYXRpb25SZXN1bHRcIik7XG4gICAgICAgIHN1bW1hcnkudW5zb2xkQ291bnQgPSBOdW1iZXIocGFnaW5hdGlvblJlc3VsdC5jaGlsZHJlbihcIlRvdGFsTnVtYmVyT2ZFbnRyaWVzXCIpLnRleHQoKSk7XG4gICAgICAgIHN1bW1hcnkudW5zb2xkVG90YWxQYWdlcyA9IE51bWJlcihwYWdpbmF0aW9uUmVzdWx0LmNoaWxkcmVuKFwiVG90YWxOdW1iZXJPZlBhZ2VzXCIpLnRleHQoKSk7XG4gICAgICB9XG5cbiAgICAgIGxpc3QgPSAkKGFSZXNwb25zZSkuZmluZChcIlNjaGVkdWxlZExpc3RcIik7XG4gICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpc3QuZmluZChcIkl0ZW1cIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpdGVtID0gbmV3IEl0ZW0oJCh0aGlzKS5maW5kKFwiSXRlbUlEXCIpLnRleHQoKSk7XG4gICAgICAgICAgeG1sSXRlbSA9ICQodGhpcyk7XG4gICAgICAgICAgaXRlbS5zZXQoXCJ0eXBlXCIsIEl0ZW0uVFlQRVMuU0NIRURVTEVEKTtcbiAgICAgICAgICBpdGVtLmZyb21YTUwoeG1sSXRlbSwgSXRlbS5YTUxfUFJFRklYRVMuQlVZU0VMTCk7XG4gICAgICAgICAgaWYgKFRyYWRpbmdBcGkuaXNWYWxpZFhNTEl0ZW0oeG1sSXRlbSkpIHtcbiAgICAgICAgICAgIHNjaGVkdWxlZExpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdpbmF0aW9uUmVzdWx0ID0gbGlzdC5jaGlsZHJlbihcIlBhZ2luYXRpb25SZXN1bHRcIik7XG4gICAgICAgIHN1bW1hcnkuc2NoZWR1bGVkQ291bnQgPSBOdW1iZXIocGFnaW5hdGlvblJlc3VsdC5jaGlsZHJlbihcIlRvdGFsTnVtYmVyT2ZFbnRyaWVzXCIpLnRleHQoKSk7XG4gICAgICAgIHN1bW1hcnkuc2NoZWR1bGVkVG90YWxQYWdlcyA9IE51bWJlcihwYWdpbmF0aW9uUmVzdWx0LmNoaWxkcmVuKFwiVG90YWxOdW1iZXJPZlBhZ2VzXCIpLnRleHQoKSk7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdC5saXN0cyA9IHtcbiAgICAgICAgYWN0aXZlTGlzdDogYWN0aXZlTGlzdCxcbiAgICAgICAgc29sZExpc3Q6IHNvbGRMaXN0LFxuICAgICAgICB1bnNvbGRMaXN0OiB1bnNvbGRMaXN0LFxuICAgICAgICBzY2hlZHVsZWRMaXN0OiBzY2hlZHVsZWRMaXN0XG4gICAgICB9O1xuICAgICAgcmVzdWx0LnRyYW5zYWN0aW9ucyA9IHRyYW5zYWN0aW9ucztcbiAgICAgIHJlc3VsdC5zdW1tYXJ5ID0gc3VtbWFyeTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYW4gaXRlbSB2aW9sYXRlcyBhbnkgcG9saWN5IGFuZCBoYXMgYmVlbiByZW1vdmVkIGZvciB0aGlzIHJlYXNvblxuICAgKiBAcGFyYW0gYVhNTEl0ZW0gdGhlIHhtbCBub2RlIHdpdGggdGhlIGl0ZW0gaW5mb3JtYXRpb25cbiAgICovXG4gIGlzVmFsaWRYTUxJdGVtIDogZnVuY3Rpb24oYVhNTEl0ZW0pIHtcbiAgICBpZiAoJChhWE1MSXRlbSkuZmluZChcIkl0ZW1Qb2xpY3lWaW9sYXRpb25cIikudGV4dCgpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogVHJhZGluZyBBUEkgUmVtb3ZlRnJvbVdhdGNoTGlzdFxuICAgKiBAcGFyYW0gYVRva2VuIHRoZSBhdXRoIHRva2VuLlxuICAgKiBAcGFyYW0gYUl0ZW1JZCB0aGUgaXRlbSBpZC5cbiAgICogQHBhcmFtIGFTaXRlSWQgdGhlIHNpdGUgaWQgdG8gdXNlIGluIHRoZSByZXF1ZXN0XG4gICAqIEBwYXJhbSBhQ2FsbGJhY2suXG4gICAqIEByZXR1cm5zIHJlcXVlc3Qgb2JqZWN0XG4gICAqL1xuICByZW1vdmVGcm9tV2F0Y2hMaXN0IDogZnVuY3Rpb24oYVRva2VuLCBhSXRlbUlkLCBhU2l0ZUlkLCBhQ2FsbGJhY2spIHtcblxuICAgIGlmICghYVRva2VuKSB7XG4gICAgICBMb2dnZXIuZXJyb3IoXCJBdHRlbXB0IHRvIG1ha2UgVHJhZGluZyBBUEkgcmVtb3ZlRnJvbVdhdGNoTGlzdCBjYWxsIFwiICtcbiAgICAgICAgICAgICAgICAgICBcIndoZW4gbm8gYWNjb3VudCBpcyBhY3RpdmUuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB3cmFwcGVkQm9keTtcbiAgICB2YXIgbG9jYWxDYWxsYmFjaztcbiAgICB2YXIgcmVxdWVzdDtcbiAgICB2YXIgaW5uZXJCb2R5ID0gXCJcIjtcblxuICAgICQuZWFjaChhSXRlbUlkLCBmdW5jdGlvbihhSW5kZXgsIGFWYWx1ZSkge1xuICAgICAgaW5uZXJCb2R5ICs9IFwiPEl0ZW1JRD5cIiArIGFWYWx1ZSArIFwiPC9JdGVtSUQ+XCI7XG4gICAgfSk7XG5cbiAgICAvLyBkbyB0aGUgY2FsbFxuICAgIHdyYXBwZWRCb2R5ID0gdGhpcy5fd3JhcENhbGwoXCJSZW1vdmVGcm9tV2F0Y2hMaXN0XCIsIGlubmVyQm9keSwgYVRva2VuKTtcbiAgICBsb2NhbENhbGxiYWNrID0gZnVuY3Rpb24oYVJlc3BvbnNlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgICBpZiAoIWFSZXNwb25zZSkge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9ycyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFDYWxsYmFjayhyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIExvZ2dlci5lcnJvcihcIlRyYWRpbmdBcGkucmVtb3ZlV2F0Y2hMaXN0IEVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3QgPSB0aGlzLl9kb0NhbGwod3JhcHBlZEJvZHksIGFTaXRlSWQsIGxvY2FsQ2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgYW55IGVycm9yIG1lc3NhZ2VzIGluIHRoZSBBUEkgcmVzcG9uc2VcbiAgICogQHBhcmFtIGFSZXNwb25zZSB0aGUgQVBJIHJlc3BvbnNlLlxuICAgKiBAcmV0dXJuIGJvb2xlYW4gaW5kaWNhdGVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIGhhcyBlcnJvciBvciBub3QuXG4gICAqL1xuICBfdmFsaWRhdGVSZXNwb25zZSA6IGZ1bmN0aW9uKGFSZXNwb25zZSkge1xuXG4gICAgaWYgKCFhUmVzcG9uc2UpIHtcbiAgICAgIExvZ2dlci5lcnJvcihcIlRyYWRpbmcgQVBJIGVycm9yIChubyByZXNwb25zZSBkb2N1bWVudCEpXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBub2RlID0gJChhUmVzcG9uc2UpLmZpbmQoXCJBY2tcIik7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICBMb2dnZXIuZXJyb3IoXCJUcmFkaW5nIEFQSSBlcnJvciAobm8gQWNrIG5vZGUhKVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdG9rZW5FcnJvciA9IGZhbHNlO1xuICAgIGlmICgkKG5vZGUpLnRleHQoKSAhPSBcIlN1Y2Nlc3NcIikge1xuICAgICAgaWYgKCQobm9kZSkudGV4dCgpID09IFwiV2FybmluZ1wiKSB7XG4gICAgICAgIExvZ2dlci53YXJuKCQobm9kZSkuZmluZChcIkVycm9yc1wiKS5maW5kKFwiU2hvcnRNZXNzYWdlXCIpLnRleHQoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkLmVhY2goJChhUmVzcG9uc2UpLmZpbmQoXCJFcnJvcnNcIiksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBlcnJvckNvZGUgPSBOdW1iZXIoJCh0aGlzKS5maW5kKFwiRXJyb3JDb2RlXCIpLnRleHQoKSk7XG4gICAgICAgICAgc3dpdGNoIChlcnJvckNvZGUpIHtcbiAgICAgICAgICAgIC8vIEludmFsaWQgSUFGIHRva2VuICh1cGdyYWRlIGZyb20gc2VjcmV0SWQgYXV0aGVudGljYXRpb24gdG8gbmV3IG9uZSlcbiAgICAgICAgICAgIGNhc2UgMjE5MTY5ODQ6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIlRoZSBuZXcgYXV0aGVudGljYXRpb24gbWVjaGFuaXNtIHJlcXVpcmVzIHlvdSB0byBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcInNpZ24gaW4gYWdhaW4uXCIpO1xuICAgICAgICAgICAgICB0b2tlbkVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBzdXNwZW5kZWQgYWNjb3VudFxuICAgICAgICAgICAgY2FzZSA4NDE6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIlRoZSB1c2VyIGFjY291bnQgaGFzIGJlZW4gc3VzcGVuZGVkLiBGb3JjaW5nIGxvZ291dC5cIik7XG4gICAgICAgICAgICAgIHRva2VuRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIEludmFsaWQgdG9rZW5cbiAgICAgICAgICAgIGNhc2UgOTMxOlxuICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoXCJBdXRoIHRva2VuIGlzIGludmFsaWQuIEZvcmNpbmcgbG9nb3V0LlwiKTtcbiAgICAgICAgICAgICAgdG9rZW5FcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gVG9rZW4gaGFyZCBleHBpcmVkXG4gICAgICAgICAgICBjYXNlIDkzMjpcbiAgICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiQXV0aCB0b2tlbiBpcyBoYXJkIGV4cGlyZWQuIEZvcmNpbmcgbG9nb3V0LlwiKTtcbiAgICAgICAgICAgICAgdG9rZW5FcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gU2VjdXJpdHkgdG9rZW4gZXhwaXJlZFxuICAgICAgICAgICAgY2FzZSAxNzQ3MDpcbiAgICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiUGxlYXNlIGxvZ2luIGFnYWluIG5vdy4gWW91ciBzZWN1cml0eSB0b2tlbiBoYXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJleHBpcmVkLiBGb3JjaW5nIGxvZ291dC5cIik7XG4gICAgICAgICAgICAgIHRva2VuRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIFRva2VuIGV4cGlyZWRcbiAgICAgICAgICAgIGNhc2UgMTYxMTA6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIlRoZSBUcmFkaW5nIEFQSSB0b2tlbiBoYXMgZXhwaXJlZC4gRm9yY2luZyBsb2dvdXQuXCIpO1xuICAgICAgICAgICAgICB0b2tlbkVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBpbnZhbGlkIGF1dGhlbnRpY2F0aW9uIG1ldGhvZFxuICAgICAgICAgICAgY2FzZSAxNjExMjpcbiAgICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiVGhlIGF1dGhlbnRpY2F0aW9uIG1ldGhvZCB1c2VkIGlzIGludmFsaWQuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm9yY2luZyBsb2dvdXQuXCIpO1xuICAgICAgICAgICAgICB0b2tlbkVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyB0b2tlbiByZXRyaWV2YWwgd2luZG93IGV4cGlyZWRcbiAgICAgICAgICAgIGNhc2UgMTYxMTg6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIlRoZSB0b2tlbiByZXRyaWV2YWwgd2luZG93IGhhcyBleHBpcmVkLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZvcmNpbmcgbG9nb3V0LlwiKTtcbiAgICAgICAgICAgICAgdG9rZW5FcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gdG9rZW4gZG9lcyBub3QgZXhpc3RcbiAgICAgICAgICAgIGNhc2UgMTYxMTk6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIlRoZSB0b2tlbiBkb2VzIG5vdCBleGlzdC4gRm9yY2luZyBsb2dvdXQuXCIpO1xuICAgICAgICAgICAgICB0b2tlbkVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyB0b2tlbiBkb2VzIG5vdCBtYXRjaCBoZWFkZXJzIGNyZWRlbnRpYWxzXG4gICAgICAgICAgICBjYXNlIDE3NDc2OlxuICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoXCJUaGUgdG9rZW4gZG9lcyBub3QgbWF0Y2ggaGVhZGVycyBjcmVkZW50aWFscy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGb3JjaW5nIGxvZ291dC5cIik7XG4gICAgICAgICAgICAgIHRva2VuRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIFRva2VuIGhhcyBiZWVuIHJldm9rZWQgYnkgQXBwXG4gICAgICAgICAgICBjYXNlIDIxOTE2MDEzOlxuICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoXCJUaGUgdG9rZW4gVG9rZW4gaGFzIGJlZW4gcmV2b2tlZCBieSBBcHAuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRm9yY2luZyBsb2dvdXQuXCIpO1xuICAgICAgICAgICAgICB0b2tlbkVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gSW52YWxpZCBpdGVtIElkIChvbmx5IGFjdGl2ZSBpdGVtcyBjYW4gYmUgYWRkZWQgdG8gdGhlIHdhdGNobGlzdClcbiAgICAgICAgICAgIGNhc2UgMjEwMDA6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIlRyaWVkIHRvIGFkZCBhbiBlbmRlZCBpdGVtIHRvIHRoZSB3YXRjaGxpc3QuXCIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIEl0ZW0gbm90IGluIHdhdGNoIGxpc3RcbiAgICAgICAgICAgIGNhc2UgMjEwMDI6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIlRoZSBJdGVtIGlzIG5vdCBpbiB0aGUgd2F0Y2ggbGlzdC5cIik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gSXRlbXMgd2VyZSBub3QgcmVtb3ZlZCBmcm9tIHdhdGNoIGxpc3RcbiAgICAgICAgICAgIGNhc2UgMjA4MjA6XG4gICAgICAgICAgICAgIC8vIFdlIGNhbiBzYWZlbHkgaWdub3JlIHRoaXNcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBJdGVtIG5vdCBmb3VuZFxuICAgICAgICAgICAgY2FzZSAxNTA1OlxuICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoXCJUcmFkaW5nIEFQSSByZXBvcnRzIHRoYXQgdGhlIGl0ZW0gd2FzIG5vdCBmb3VuZC5cIik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gSXRlbSBhbHJlYWR5IGluIHdhdGNoIGxpc3RcbiAgICAgICAgICAgIGNhc2UgMjEwMDM6XG4gICAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIkl0ZW0gaXMgYWxyZWFkeSBpbiB0aGUgd2F0Y2ggbGlzdC5cIik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gSXRlbXMgd2VyZSBub3QgYWRkZWQgdG8gd2F0Y2ggbGlzdFxuICAgICAgICAgICAgY2FzZSAyMDgxOTpcbiAgICAgICAgICAgICAgLy8gV2UgY2FuIHNhZmVseSBpZ25vcmUgdGhpc1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIENhdGNoLWFsbFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiVHJhZGluZyBBUEkgRXJyb3I6XFxuXCIgKyBcIkVycm9yIENvZGU6IFwiICsgZXJyb3JDb2RlICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuU2hvcnQgTWVzc2FnZTogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nKCQodGhpcykuZmluZChcIlNob3J0TWVzc2FnZVwiKS50ZXh0KCkpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuU2V2ZXJpdHk6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZygkKHRoaXMpLmZpbmQoXCJTZXZlcml0eUNvZGVcIikudGV4dCgpKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcbkVycm9yIENsYXNpZmljYXRpb246IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZygkKHRoaXMpLmZpbmQoXCJFcnJvckNsYXNzaWZpY2F0aW9uXCIpLnRleHQoKSkgKyBcIlxcblwiKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU3RvcCBpdGVyYXRpbmcgdGhyb3VnaCBlcnJvcnNcbiAgICAgICAgICBpZiAodG9rZW5FcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRva2VuRXJyb3IpIHtcbiAgICAgICAgICBPYnNlcnZlckhlbHBlci5ub3RpZnkoVG9waWNzLkZPUkNFX0FDQ09VTlRfU0lHTl9PVVQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogV3JhcHMgYW4gWE1MIGZyYWdtZW50IGludG8gYSBUcmFkaW5nIEFQSSBjYWxsXG4gICAqIEBwYXJhbSBhUmVxdWVzdE5hbWUgVGhlIG5hbWUgb2YgdGhlIGNhbGwgKHdpdGhvdXQgXCJSZXF1ZXN0XCIpXG4gICAqIEBwYXJhbSBhSW5uZXJCb2R5IFRoZSBib2R5IG9mIHRoZSBjYWxsXG4gICAqIEByZXR1cm5zIHRoZSBmdWxseS1mb3JtZWQgdGV4dFxuICAgKi9cbiAgX3dyYXBDYWxsIDogZnVuY3Rpb24oYVJlcXVlc3ROYW1lLCBhSW5uZXJCb2R5KSB7XG5cbiAgICB2YXIgcmVxdWVzdElkZW50aWZpZXIgPSBDb21tb25TZXJ2aWNlLmdldFJlcXVlc3RJZGVudGlmaWVyKCk7XG4gICAgdmFyIHdyYXBwZWRCb2R5ID1cbiAgICAgIHRoaXMuX1hNTF9IRUFERVIgK1xuICAgICAgXCI8XCIgKyBhUmVxdWVzdE5hbWUgKyBcIlJlcXVlc3QgXCIgKyB0aGlzLl9YTUxfTkFNRVNQQUNFICsgXCI+XCIgK1xuICAgICAgXCI8TWVzc2FnZUlEPlwiICsgcmVxdWVzdElkZW50aWZpZXIgKyBcIjwvTWVzc2FnZUlEPlwiICtcbiAgICAgIGFJbm5lckJvZHkgK1xuICAgICAgXCI8L1wiICsgYVJlcXVlc3ROYW1lICsgXCJSZXF1ZXN0PlwiO1xuXG4gICAgcmV0dXJuIHdyYXBwZWRCb2R5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBUcmFkaW5nIEFQSSBjYWxsXG4gICAqIEBwYXJhbSBhUmVxdWVzdEJvZHkgVGhlIGZ1bGwgYm9keSBvZiB0aGUgY2FsbCwgYXMgd2lsbCBiZSBQT1NUZWRcbiAgICogQHBhcmFtIGFTaXRlSWQgdGhlIHNpdGUgaWQgdG8gdXNlIGluIHRoZSByZXF1ZXN0XG4gICAqIEBwYXJhbSBhQ2FsbGJhY2sgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHJlcXVlc3Qgb2JqZWN0XG4gICAqL1xuICBfZG9DYWxsIDogZnVuY3Rpb24oYVJlcXVlc3RCb2R5LCBhU2l0ZUlkLCBhQ2FsbGJhY2spIHtcblxuICAgIHZhciByZXF1ZXN0TmFtZTtcbiAgICB2YXIgcmVxdWVzdDtcbiAgICB2YXIgdG9waWMgPSBudWxsO1xuICAgIHZhciBhY2NvdW50ID0gQWNjb3VudC5nZXRBY2NvdW50KCk7XG5cbiAgICB0cnkge1xuICAgICAgcmVxdWVzdE5hbWUgPSAvPjwoLio/KVJlcXVlc3QvLmV4ZWMoYVJlcXVlc3RCb2R5KVsxXTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBMb2dnZXIuZXJyb3IoXG4gICAgICAgIFwiVHJhZGluZyBBUEkgcmVxdWVzdCB3aWxsIG5vdCBiZSBzZW50LCBhcyBpdCBpcyBiYWRseS1mb3JtZWQuIFxcblwiICtcbiAgICAgICAgYVJlcXVlc3RCb2R5KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHJlcXVlc3ROYW1lKSB7XG4gICAgICBjYXNlIFwiR2V0TXllQmF5QnV5aW5nXCI6XG4gICAgICAgIHRvcGljID0gVG9waWNzLk1ZX0JVWUlOR19VUERBVEVEO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJHZXRNeWVCYXlTZWxsaW5nXCI6XG4gICAgICAgIHRvcGljID0gVG9waWNzLk1ZX1NFTExJTkdfVVBEQVRFRDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmVxdWVzdCA9XG4gICAgICAkLmFqYXgoe1xuICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbihhWEhSKSB7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgXCJYLUVCQVktQVBJLUNPTVBBVElCSUxJVFktTEVWRUxcIixcbiAgICAgICAgICAgIENvbmZpZ3MuVFJBRElOR19BUElfVkVSU0lPTik7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFwiWC1FQkFZLUFQSS1DQUxMLU5BTUVcIiwgcmVxdWVzdE5hbWUpO1xuICAgICAgICAgIGFYSFIuc2V0UmVxdWVzdEhlYWRlcihcbiAgICAgICAgICAgIFwiWC1FQkFZLUFQSS1TSVRFSURcIiwgYVNpdGVJZCk7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgXCJYLUVCQVktU0lERUJBUi1WRVJTSU9OXCIsIEJyb3dzZXJIZWxwZXIuZ2V0RXh0ZW5zaW9uVmVyc2lvbigpKTtcblxuICAgICAgICAgIGlmIChhY2NvdW50ICYmIGFjY291bnQuZ2V0KFwidG9rZW5cIikpIHtcbiAgICAgICAgICAgIGFYSFIuc2V0UmVxdWVzdEhlYWRlcihcbiAgICAgICAgICAgICAgXCJYLUVCQVktQVBJLUlBRi1UT0tFTlwiLFxuICAgICAgICAgICAgICBhY2NvdW50LmdldChcInRva2VuXCIpLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgY29udGVudFR5cGU6IFwidGV4dC94bWxcIixcbiAgICAgICAgdXJsOiBBcGlIZWxwZXIuZ2V0RW5kUG9pbnQoXCJ0cmFkaW5nQXBpXCIpLFxuICAgICAgICBkYXRhOiBhUmVxdWVzdEJvZHksXG4gICAgICAgIGRhdGFUeXBlOiBcInhtbFwiLFxuICAgICAgICBqc29ucDogZmFsc2UsXG4gICAgICAgIHRpbWVvdXQ6IFByb3BlcnR5REFPLmdldChQcm9wZXJ0eURBTy5QUk9QX0FQSV9USU1FT1VUKSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oYURhdGEsIGFUZXh0U3RhdHVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChhVGV4dFN0YXR1cyA9PSBcInN1Y2Nlc3NcIikge1xuICAgICAgICAgICAgICBpZiAoIVRyYWRpbmdBcGkuX3ZhbGlkYXRlUmVzcG9uc2UoYURhdGEpKSB7XG4gICAgICAgICAgICAgICAgYURhdGEgPSBudWxsO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIE1lc3NhZ2VQYW5lbFNlcnZpY2UuZGlzbWlzc01lc3NhZ2UoTWVzc2FnZVBhbmVsU2VydmljZS5UWVBFLkNPTk5FQ1RfRVJST1IpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBhQ2FsbGJhY2soYURhdGEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICBVdGlsaXR5SGVscGVyLmhhbmRsZUVycm9yKFwiVHJhZGluZ0FwaVwiLCByZXF1ZXN0TmFtZSwgZS5tZXNzYWdlLCBhQ2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGFYSFIsIGFUZXh0U3RhdHVzLCBhRXJyb3IpIHtcbiAgICAgICAgICBVdGlsaXR5SGVscGVyLmhhbmRsZUVycm9yKFwiVHJhZGluZ0FwaVwiLCByZXF1ZXN0TmFtZSwgYVhIUi5yZXNwb25zZVRleHQsIGFDYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy8gYWRkIHBlbmRpbmcgcmVxdWVzdCB0byBhIGxpc3Qgc28gcGVuZGluZyByZXF1ZXN0IHdvdWxkIGJlIGNhbmNlbGxlZCBmb3JcbiAgICAvLyBhIGxvbmcgcGVyaW9kIG9mIHRpbWUgYW5kIGFsc28gYWxsIHBlbmRpbmcgcmVxdWVzdHMgY2FuIGJlIGFib3J0ZWQgd2hlblxuICAgIC8vIHVzZXIgc2lnbnMgb3V0LlxuICAgIEFwaUhlbHBlci5hZGRQZW5kaW5nUmVxdWVzdChyZXF1ZXN0LCByZXF1ZXN0TmFtZSwgdG9waWMpO1xuXG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH1cbn07XG4iXX0=