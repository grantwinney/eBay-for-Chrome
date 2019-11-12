/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var ItemBox = {
    _itemBoxTemplate: null,
    _itemViewAllBoxTemplate: null,
    _STATE_PROPERTIES: {},
    _ITEM_TYPE_PROPERTIES: {},
    init: function () {
        this._STATE_PROPERTIES[Item.STATES.WATCHING_CLASSIFIED_AD] =
            { label: "item.price.classified" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_SUCCESS_RESERVE_NOT_MET] =
            { label: "item.state.buying.highBidder" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_SUCCESS] =
            { label: "item.state.buying.highBidder" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_OUTBID_RESERVE_NOT_MET] =
            { label: "item.state.buying.outbid" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_OUTBID] =
            { label: "item.state.buying.outbid" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_ITEM_WON_NOT_PAID] =
            { label: "item.state.won.payNow" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_ITEM_WON_PAID] =
            { label: "item.state.won.paid" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_ITEM_WON_SHIPPED] =
            { label: "item.state.general.shipped" };
        this._STATE_PROPERTIES[Item.STATES.BUYING_ITEM_WON_SHIPPED_FEEDBACK_LEFT] =
            { label: "item.state.general.shipped" };
        this._STATE_PROPERTIES[Item.STATES.SELLING_RESERVE_NOT_MET] =
            { label: ["item.state.selling.bidReceived", "item.state.selling.bidsReceived"] };
        this._STATE_PROPERTIES[Item.STATES.SELLING_ITEM_SOLD] =
            { label: ["item.state.selling.bidReceived", "item.state.selling.bidsReceived"] };
        this._STATE_PROPERTIES[Item.STATES.SELLING_WITH_OFFERS] =
            { label: ["item.state.selling.offerReceived", "item.state.selling.offersReceived"] };
        this._STATE_PROPERTIES[Item.STATES.SELLING_ITEM_SOLD_SHIPPED] =
            { label: "item.state.general.shipped" };
        this._STATE_PROPERTIES[Item.STATES.SELLING_ITEM_SOLD_NOT_PAID] =
            { label: "item.state.sold.notPaid" };
        this._STATE_PROPERTIES[Item.STATES.SELLING_ITEM_SOLD_PAID_AND_SHIP] =
            { label: "item.state.sold.paidAndShip" };
        this._STATE_PROPERTIES[Item.STATES.SELLING_ITEM_SOLD_REFUNDED] =
            { label: "item.state.sold.refunded" };
        this._STATE_PROPERTIES[Item.STATES.SELLING_ITEM_SOLD_FEEDBACK_RECEIVED] =
            { label: "item.state.general.shipped" };
        this._STATE_PROPERTIES[Item.STATES.SELLING_ITEM_UNSOLD_RELISTED] =
            { label: "item.state.unsold.relisted" };
        this._STATE_PROPERTIES[Item.STATES.BEST_OFFER_PENDING] =
            { label: "item.state.buying.offer.pending" };
        this._STATE_PROPERTIES[Item.STATES.BEST_OFFER_DECLINED] =
            { label: "item.state.buying.offer.declined" };
        this._STATE_PROPERTIES[Item.STATES.BEST_OFFER_EXPIRED] =
            { label: "item.state.buying.offer.expired" };
        this._STATE_PROPERTIES[Item.STATES.BEST_OFFER_COUNTERED] =
            { label: "item.state.buying.offer.countered" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SELLING_OFFER] =
            { label: "list.offers.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SELLING] =
            { label: "list.selling.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SOLD] =
            { label: "list.sold.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.UNSOLD] =
            { label: "list.unsold.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.SCHEDULED] =
            { label: "list.scheduled.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.BIDDING] =
            { label: "list.bidding.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.WON] =
            { label: "list.won.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.LOST] =
            { label: "list.lost.view.all" };
        this._ITEM_TYPE_PROPERTIES[Item.TYPES.BEST_OFFER] =
            { label: "list.offers.view.all" };
        this._loadTemplates();
    },
    _loadTemplates: function () {
        var that = this;
        $.ajax({
            url: "core/itemBox.html",
            dataType: "text",
            success: function (aData, aStatus) {
                that._itemBoxTemplate = $(aData);
            }
        });
        $.ajax({
            url: "core/itemViewAllBox.html",
            dataType: "text",
            success: function (aData, aStatus) {
                that._itemViewAllBoxTemplate = $(aData);
            }
        });
    },
    createItemBox: function (aItemObject) {
        var box = $("<a></a>").attr({
            "href": "#",
            "data-update-tooltip": "true",
            "class": "item-box-container " + aItemObject.get("type")
        }).append(this._itemBoxTemplate.clone());
        box.click(function (aEvent) {
            var tagName = aEvent.target.tagName ? aEvent.target.tagName.toLowerCase() : null;
            if (box.parents(".edit-mode").length > 0) {
                var elements = box.find(".item-edit-checkbox:visible");
                if (elements.length > 0) {
                    var checkbox = box.find("input[type='checkbox']");
                    if (checkbox && tagName && "span" != tagName && "input" != tagName) {
                        if ($(checkbox).prop("checked")) {
                            $(checkbox).prop("checked", false);
                        }
                        else {
                            $(checkbox).prop("checked", true);
                        }
                        aEvent.preventDefault();
                    }
                    var parents = box.parents(".item-list-box");
                    if (parents.length > 0) {
                        var elementId = $(parents[0]).attr("id");
                        if (elementId == "panel-watching") {
                            $("#panel-watching-delete-button").attr("disabled", PanelWatching.getSelectedDeleteCheckboxes().length === 0);
                        }
                        else if (elementId == "panel-buying-full") {
                            $("#panel-buying-delete-button").attr("disabled", PanelBuying.getSelectedDeleteCheckboxes().length === 0);
                        }
                        else if (elementId == "panel-selling-full") {
                            $("#panel-selling-delete-button").attr("disabled", PanelSelling.getSelectedDeleteCheckboxes().length === 0);
                        }
                    }
                }
                return;
            }
            var object = box.data("itemObject");
            var eventLabel = Sidebar.getGATabTrackingName(TabContainer.getDefaultTab());
            EventAnalytics.push({
                key: "SignedInExit",
                action: "ClickItem",
                label: eventLabel
            });
            RoverUrlHelper.loadPage("listing2", "itemClick", { "itemid": object.get("itemId"),
                "forceNewTab": true
            }, aEvent);
        }.bind(this));
        if ("Window" == UtilityHelper.getClient().os) {
            box.focus(function (aEvent) {
                var previousSibling = $(aEvent.target).prev("a");
                if (0 < previousSibling.length) {
                    $(previousSibling[0]).attr("tabindex", "0");
                }
                var nextSibling = $(aEvent.target).next("a");
                if (0 < nextSibling.length) {
                    $(nextSibling[0]).attr("tabindex", "0");
                }
            });
            box.find("input[type='checkbox']").focus(function (aEvent) {
                var element = $(aEvent.target);
                var parents = element.parents("a");
                if (0 < parents.length) {
                    $(parents[0]).attr("tabindex", "-1");
                }
            });
        }
        this._updateItemBox(box, aItemObject);
        return box;
    },
    _updateItemBox: function (aBox, aItemObject) {
        var itemTitle = aBox.find(".item-title");
        var itemDescription = aBox.find(".item-description");
        var checkboxDescription = aBox.find(".checkbox-description");
        var itemPrice = aBox.find(".item-price");
        var itemPriceContainer = aBox.find(".item-price-inner-container");
        var itemTime = aBox.find(".item-time");
        var itemShipping = aBox.find(".item-shipping");
        var checkbox = aBox.find(".item-edit-checkbox");
        var listingFormat = aItemObject.get("listingFormat");
        var state = this._getState(aItemObject);
        var label = this._getStateLabel(state);
        var that = this;
        var imageUrl;
        var timeLeft;
        var bids;
        var quantity;
        var setPriceAndShipping = function () {
            var priceInfo = that._getPriceInfo(aItemObject);
            itemPrice.text(priceInfo.label);
            if (priceInfo.isConvertedShown) {
                itemPriceContainer.addClass("converted");
                var shippingInfo = that._getShippingInfo(aItemObject, priceInfo);
                if (shippingInfo.isConvertedShown) {
                    itemShipping.addClass("converted");
                }
                itemShipping.text(shippingInfo.label);
            }
            else {
                itemShipping.text(that._getShippingInfo(aItemObject).label);
            }
        };
        switch (aItemObject.get("type")) {
            case Item.TYPES.SELLING_OFFER:
            case Item.TYPES.SELLING:
                if (label) {
                    if (state == Item.STATES.SELLING_WITH_OFFERS) {
                        var offerCount = aItemObject.get("bestOfferCount");
                        if (offerCount) {
                            if (offerCount == 1) {
                                itemTitle.text(label[0]);
                            }
                            else {
                                var offersLabel = $.i18n.getString(this._STATE_PROPERTIES[Item.STATES.SELLING_WITH_OFFERS].label[1], [offerCount]);
                                itemTitle.text(offersLabel);
                            }
                            itemTitle.addClass("state-" + state);
                        }
                        else {
                            itemTitle.hide();
                        }
                    }
                    else {
                        bids = aItemObject.get("numBids");
                        if (bids && bids > 0) {
                            if (bids == 1) {
                                itemTitle.text(label[0]);
                            }
                            else {
                                itemTitle.text(label[1]);
                            }
                            itemTitle.addClass("state-" + state);
                            if (state == Item.STATES.SELLING_RESERVE_NOT_MET) {
                                aBox.find(".item-reserve-not-met").text($.i18n.getString("item.state.selling.reserveNotMet")).show();
                            }
                        }
                        else {
                            itemTitle.hide();
                        }
                    }
                }
                else {
                    itemTitle.hide();
                }
                bids = this._getBids(aItemObject, true);
                if (bids.length > 0) {
                    aBox.find(".item-bids").addClass(Item.TYPES.SELLING).text(bids);
                }
                aBox.find(".item-watchers").text(this._getWatchers(aItemObject));
                timeLeft = this._getTimeLeftInfo(aItemObject);
                if (timeLeft.endSoon) {
                    itemTime.addClass("endSoon");
                }
                itemTime.addClass(Item.TYPES.SELLING).text(timeLeft.label);
                setPriceAndShipping();
                break;
            case Item.TYPES.SOLD:
                if (label) {
                    itemTitle.text(label);
                    itemTitle.addClass("state-" + state);
                }
                else {
                    itemTitle.hide();
                }
                checkbox.addClass("state-" + state);
                quantity = this._getTotalTransactionQuantity(aItemObject);
                if (quantity > 1) {
                    itemDescription.addClass("single-line");
                    aBox.find(".item-quantity").text($.i18n.getString("item.sold.quantity", [quantity])).show();
                }
                aBox.find(".item-buyer").text(this._getBuyer(aItemObject));
                itemTime.text(this._getTransactionTime(aItemObject));
                setPriceAndShipping();
                if (state == Item.STATES.SELLING_ITEM_SOLD_FEEDBACK_RECEIVED) {
                    aBox.find(".item-feedback-action").text($.i18n.getString("item.state.sold.feedbackReceived")).show();
                }
                break;
            case Item.TYPES.UNSOLD:
                if (label) {
                    itemTitle.text(label);
                }
                else {
                    itemTitle.hide();
                }
                bids = this._getBids(aItemObject, true);
                if (bids.length > 0) {
                    aBox.find(".item-bids").text(bids);
                }
                aBox.find(".item-watchers").text(this._getWatchers(aItemObject));
                itemTime.text(this._getEndTime(aItemObject));
                setPriceAndShipping();
                break;
            case Item.TYPES.SCHEDULED:
                var scheduledTime = this._getScheduledTime(aItemObject);
                itemTitle.hide();
                aBox.find(".item-scheduled-date").text(scheduledTime[0]);
                aBox.find(".item-scheduled-time").text(scheduledTime[1]);
                setPriceAndShipping();
                break;
            case Item.TYPES.WATCHING:
                var buyItNowPrice = aItemObject.get("buyItNowPrice");
                itemTitle.hide();
                if (state == Item.STATES.WATCHING_CLASSIFIED_AD) {
                    if (label) {
                        aBox.find(".item-action-one").text(label);
                    }
                }
                else if (Item.LISTING_FORMATS.CHINESE == listingFormat ||
                    Item.LISTING_FORMATS.DUTCH == listingFormat ||
                    Item.LISTING_FORMATS.LIVE == listingFormat) {
                    aBox.find(".item-bids").text(this._getBids(aItemObject));
                    if (buyItNowPrice) {
                        aBox.find(".item-action-one").text($.i18n.getString("item.price.orbuyitnow"));
                    }
                }
                else if (buyItNowPrice) {
                    aBox.find(".item-action-one").text($.i18n.getString("item.price.buyitnow.label"));
                }
                timeLeft = this._getTimeLeftInfo(aItemObject);
                if (timeLeft.endSoon) {
                    itemTime.addClass("endSoon");
                }
                itemTime.text(timeLeft.label);
                setPriceAndShipping();
                break;
            case Item.TYPES.BIDDING:
                if (label) {
                    itemTitle.text(label);
                    itemTitle.addClass("state-" + state);
                }
                else {
                    itemTitle.hide();
                }
                if (state == Item.STATES.BUYING_SUCCESS_RESERVE_NOT_MET ||
                    state == Item.STATES.BUYING_OUTBID_RESERVE_NOT_MET) {
                    aBox.find(".item-reserve-not-met").text($.i18n.getString("item.state.selling.reserveNotMet")).show();
                }
                aBox.find(".item-bids").text(this._getBids(aItemObject));
                timeLeft = this._getTimeLeftInfo(aItemObject);
                if (timeLeft.endSoon) {
                    itemTime.addClass("endSoon");
                }
                itemTime.text(timeLeft.label);
                setPriceAndShipping();
                break;
            case Item.TYPES.WON:
                if (label) {
                    itemTitle.text(label);
                    itemTitle.addClass("state-" + state);
                }
                else {
                    itemTitle.hide();
                }
                checkbox.addClass("state-" + state);
                quantity = this._getTotalTransactionQuantity(aItemObject);
                if (quantity > 1) {
                    itemDescription.addClass("single-line");
                    aBox.find(".item-quantity").text($.i18n.getString("item.won.quantity", [quantity])).show();
                }
                itemTime.text(this._getTransactionTime(aItemObject));
                setPriceAndShipping();
                if (state == Item.STATES.BUYING_ITEM_WON_SHIPPED) {
                    aBox.find(".item-feedback-action").addClass("leave-feedback").
                        text($.i18n.getString("item.state.won.leaveFeedback")).show();
                }
                else if (state == Item.STATES.BUYING_ITEM_WON_SHIPPED_FEEDBACK_LEFT) {
                    aBox.find(".item-feedback-action").text($.i18n.getString("item.state.won.feedbackLeft")).show();
                }
                break;
            case Item.TYPES.LOST:
                priceInfo = this._getPriceInfo(aItemObject);
                itemTitle.hide();
                if (Item.LISTING_FORMATS.CHINESE == listingFormat ||
                    Item.LISTING_FORMATS.DUTCH == listingFormat ||
                    Item.LISTING_FORMATS.LIVE == listingFormat) {
                    aBox.find(".item-bids").text(this._getBids(aItemObject));
                }
                else if (aItemObject.get("buyItNowPrice")) {
                    aBox.find(".item-action-one").text($.i18n.getString("item.price.buyitnow.label"));
                }
                itemPrice.text(priceInfo.label);
                if (priceInfo.isConvertedShown) {
                    itemPriceContainer.addClass("converted");
                }
                break;
            case Item.TYPES.BEST_OFFER:
                if (label) {
                    itemTitle.text(label);
                    itemTitle.addClass("state-" + state);
                }
                else {
                    itemTitle.hide();
                }
                timeLeft = this._getTimeLeftInfo(aItemObject);
                if (timeLeft.endSoon) {
                    itemTime.addClass("endSoon");
                }
                itemTime.text(timeLeft.label);
                setPriceAndShipping();
                break;
        }
        imageUrl = this._getImage(aItemObject);
        aBox.find(".item-image").css("background-image", "url(\"" + imageUrl + "\")");
        itemDescription.text(aItemObject.get("title"));
        checkboxDescription.text(aItemObject.get("title"));
        aBox.data("itemObject", aItemObject);
    },
    createViewAllBox: function (aDataObj) {
        var box = $("<a></a>").attr({
            "href": "#",
            "data-update-tooltip": "true",
        }).append(this._itemViewAllBoxTemplate.clone());
        var itemTitle = box.find(".item-view-all-title");
        var itemCount = box.find(".item-view-all-count");
        itemTitle.text($.i18n.getString(this._ITEM_TYPE_PROPERTIES[aDataObj.type].label));
        itemCount.text(aDataObj.totalCount);
        box.click(function (aEvent) {
            var object = box.data("dataObject");
            EventAnalytics.push({
                key: "SignedInInternal",
                action: "ClickSeeAll",
                label: Sidebar.getGAListTypeTrackingName(object.type)
            });
            if (object.type == Item.TYPES.BIDDING ||
                object.type == Item.TYPES.WON ||
                object.type == Item.TYPES.LOST ||
                object.type == Item.TYPES.BEST_OFFER) {
                PanelBuying.showFullList(true, object);
            }
            else {
                PanelSelling.showFullList(true, object);
            }
        }.bind(this));
        box.data("dataObject", aDataObj);
        return box;
    },
    _getImage: function (aItem) {
        var galleryUrl = aItem.get("galleryUrl");
        var url;
        if (galleryUrl) {
            var urls = galleryUrl.split(";");
            if (urls.length > 0 && urls[(urls.length - 1)].search(/thumbs\.ebaystatic\.com/) == -1) {
                url = urls[(urls.length - 1)];
            }
        }
        if (!url) {
            url = ZoomService.getZoomImageforItem(aItem.get("itemId"), 150);
        }
        return url;
    },
    _getState: function (aItem) {
        var userId = Account.getAccount().get("userId");
        var state = aItem.getCurrentState(userId);
        return state;
    },
    _getStateLabel: function (aState) {
        var stateLabel;
        if (aState in this._STATE_PROPERTIES) {
            if (typeof (this._STATE_PROPERTIES[aState].label) == "object") {
                stateLabel = [
                    $.i18n.getString(this._STATE_PROPERTIES[aState].label[0]),
                    $.i18n.getString(this._STATE_PROPERTIES[aState].label[1])
                ];
            }
            else {
                stateLabel = $.i18n.getString(this._STATE_PROPERTIES[aState].label);
            }
        }
        return stateLabel;
    },
    _getPriceInfo: function (aItem) {
        var isBestOfferItem = (aItem.get("type") == Item.TYPES.BEST_OFFER);
        var currency = isBestOfferItem ? aItem.get("bestOfferCurrency") : aItem.get("currency");
        var price = isBestOfferItem ? aItem.get("bestOffer") : aItem.get("currentPrice");
        var convertedCurrency = isBestOfferItem ? aItem.get("convertedBestOfferCurrency") : aItem.get("convertedCurrency");
        var convertedPrice = isBestOfferItem ? aItem.get("convertedBestOffer") : aItem.get("convertedCurrentPrice");
        var transactions = aItem.get("transactions");
        var isConvertedShown = false;
        var useTransactionData = false;
        var priceLabel = "";
        var exchangeRate;
        var transaction;
        var finalPrice;
        var finalCurrency;
        convertedCurrency = UtilityHelper.convertCurrency(convertedCurrency);
        if (transactions && transactions.length > 0) {
            transaction = transactions[0];
            if (transaction.get("transactionPrice") != price) {
                useTransactionData = true;
                var tsCurrency = transaction.get("transactionPriceCurrency");
                var tsPrice = transaction.get("transactionPrice");
                var tsConvertedCurrency = transaction.get("convertedTransactionPriceCurrency");
                var tsConvertedPrice = transaction.get("convertedTransactionPrice");
                if (tsCurrency && tsPrice) {
                    if (tsConvertedCurrency && tsConvertedPrice) {
                        exchangeRate = UtilityHelper.getExchangeRate(tsConvertedPrice, tsPrice);
                        isConvertedShown = true;
                        finalPrice = tsConvertedPrice;
                        finalCurrency = tsConvertedCurrency;
                    }
                    else if (currency && currency.length > 0 && price > 0 &&
                        convertedCurrency && convertedCurrency.length > 0 && convertedPrice > 0) {
                        exchangeRate = UtilityHelper.getExchangeRate(convertedPrice, price);
                        isConvertedShown = true;
                        finalPrice = tsPrice * exchangeRate;
                        finalCurrency = convertedCurrency;
                    }
                    else {
                        finalPrice = tsPrice;
                        finalCurrency = tsCurrency;
                    }
                }
            }
        }
        if (!useTransactionData && currency && currency.length > 0 && price > 0) {
            if (convertedCurrency && convertedCurrency.length > 0 && convertedPrice > 0) {
                exchangeRate = UtilityHelper.getExchangeRate(convertedPrice, price);
                isConvertedShown = true;
                finalPrice = convertedPrice;
                finalCurrency = convertedCurrency;
            }
            else {
                finalPrice = price;
                finalCurrency = currency;
            }
        }
        if (finalPrice && finalCurrency) {
            priceLabel = UtilityHelper.formatNumber(finalPrice, 2);
            priceLabel = Site.addCurrencySymbol(priceLabel, finalCurrency);
        }
        return { label: UtilityHelper.escapeHtml(priceLabel),
            convertedCurrency: convertedCurrency,
            isConvertedShown: isConvertedShown,
            exchangeRate: exchangeRate };
    },
    _getShippingInfo: function (aItem, aExtraInfo) {
        var shippingType = aItem.get("shippingType");
        var isLocalPickup = aItem.get("isLocalPickup");
        var isConvertedShown = false;
        var itemShipping;
        var shippingCost;
        var shippingInfo;
        var calculateForLabel = function (aShippingCost, aCurrentItem, aCurrentInfo) {
            var finalCurrency;
            var finalShippingCost;
            var label;
            var isConverted = false;
            if (aExtraInfo && aCurrentInfo.isConvertedShown) {
                finalCurrency = aCurrentInfo.convertedCurrency;
                finalShippingCost = aShippingCost * aCurrentInfo.exchangeRate;
                isConverted = true;
            }
            else {
                finalCurrency = aCurrentItem.get("currency");
                finalShippingCost = aShippingCost;
            }
            label = UtilityHelper.formatNumber(finalShippingCost, 2);
            label = "+ " + Site.addCurrencySymbol(label, finalCurrency);
            return { label: label, isConvertedShown: isConverted };
        };
        if (isLocalPickup) {
            itemShipping = $.i18n.getString("item.shippingType.pickup");
        }
        else {
            switch (shippingType) {
                case Item.SHIPPING.SHIPPING_TYPE_CALCULATED:
                case Item.SHIPPING.SHIPPING_TYPE_CALCULATED_DOMESTIC:
                    shippingCost = aItem.get("shippingCost");
                    if (shippingCost === 0) {
                        itemShipping = $.i18n.getString("item.shippingType.calculated");
                    }
                    else if (shippingCost) {
                        shippingInfo = calculateForLabel(shippingCost, aItem, aExtraInfo);
                        itemShipping = shippingInfo.label;
                        isConvertedShown = shippingInfo.isConvertedShown;
                    }
                    break;
                case Item.SHIPPING.SHIPPING_TYPE_FLAT:
                case Item.SHIPPING.SHIPPING_TYPE_FLAT_DOMESTIC:
                    shippingCost = aItem.get("shippingCost");
                    if (shippingCost === 0) {
                        itemShipping = $.i18n.getString("item.shippingType.free");
                    }
                    else if (shippingCost) {
                        shippingInfo = calculateForLabel(shippingCost, aItem, aExtraInfo);
                        itemShipping = shippingInfo.label;
                        isConvertedShown = shippingInfo.isConvertedShown;
                    }
                    break;
                case Item.SHIPPING.SHIPPING_TYPE_FREE:
                    itemShipping = $.i18n.getString("item.shippingType.free");
                    break;
                case Item.SHIPPING.SHIPPING_TYPE_UNSPECIFIED:
                    itemShipping = $.i18n.getString("item.shippingType.unspecified");
                    break;
                case Item.SHIPPING.SHIPPING_TYPE_FREIGHT:
                case Item.SHIPPING.SHIPPING_TYPE_FREIGHT_FLAT:
                    itemShipping = $.i18n.getString("item.shippingType.freight");
                    break;
                default:
                    itemShipping = $.i18n.getString("item.shippingType.view");
            }
        }
        return { label: itemShipping, isConvertedShown: isConvertedShown };
    },
    _getEndTime: function (aItem) {
        var endDate = Number(aItem.get("endTime"));
        var dateFormat = $.i18n.getString("item.endDate.ended");
        return UtilityHelper.formatDate(endDate, dateFormat);
    },
    _getScheduledTime: function (aItem) {
        var startDate = Number(aItem.get("startTime"));
        var dateFormat = $.i18n.getString("item.startDate.scheduled.date");
        var timeFormat = $.i18n.getString("item.startDate.scheduled.time");
        var lang = UtilityHelper.getBrowserLanguage().substring(0, 2);
        var displayTweleveHours = false;
        if (["en-GB", "en-US", "es-419", "es-XL", "es-CO"].indexOf(lang) != -1) {
            displayTweleveHours = true;
        }
        return [UtilityHelper.formatDate(startDate, dateFormat),
            UtilityHelper.formatDate(startDate, timeFormat, displayTweleveHours)];
    },
    _getTransactionTime: function (aItem) {
        var transactions = aItem.get("transactions");
        if (transactions && transactions.length > 0) {
            var transaction = transactions[0];
            var endDate = Number(transaction.get("creationTime"));
            var dateFormat = $.i18n.getString("item.endDate.ended");
            return UtilityHelper.formatDate(endDate, dateFormat);
        }
        else {
            return this._getEndTime(aItem);
        }
    },
    _getTotalTransactionQuantity: function (aItem) {
        var transactions = aItem.get("transactions");
        var quantity = 0;
        if (transactions) {
            var len = transactions.length;
            for (var i = 0; i < len; i++) {
                quantity += transactions[i].get("quantityPurchased");
            }
        }
        return quantity;
    },
    _getTimeLeftInfo: function (aItem) {
        var timeLabel = "";
        var endSoon = false;
        var isEnded = false;
        if (aItem && !aItem.isEnded()) {
            var endTime = aItem.get("endTime");
            var timeLeft;
            if (endTime) {
                var ebayTime = CommonService.geteBayTime().getTime();
                timeLeft = Math.max(0, endTime - ebayTime);
            }
            else {
                var lastTimestamp = MyEbayService.lastSellingCallTimestamp;
                var timeDiff = 0;
                var time;
                if (lastTimestamp) {
                    timeDiff = (new Date()).getTime() - lastTimestamp;
                }
                time = UtilityHelper.iso8601DurationToMilliseconds(aItem.get("timeLeft"));
                timeLeft = Math.max(0, time - timeDiff);
            }
            if (timeLeft < 1000) {
                timeLabel = $.i18n.getString("item.timeleft.ended.label");
                isEnded = true;
                if (Configs.BROWSER !== "cr") {
                    ObserverHelper.notify(Topics.ITEM_ENDED, aItem);
                }
            }
            else {
                if (timeLeft < 86400000) {
                    endSoon = true;
                }
                timeLabel = UtilityHelper.timeLeftAsString(timeLeft);
            }
        }
        else {
            timeLabel = $.i18n.getString("item.timeleft.ended.label");
        }
        return { label: timeLabel, endSoon: endSoon, isEnded: isEnded };
    },
    _getBids: function (aItem, aIgnoreZero) {
        var listingFormat = aItem.get("listingFormat");
        var bidsLabel;
        if (Item.LISTING_FORMATS.STORE_FIXED == listingFormat ||
            Item.LISTING_FORMATS.FIXED == listingFormat ||
            Item.LISTING_FORMATS.CLASSIFIED == listingFormat ||
            Item.LISTING_FORMATS.LEAD_GENERATION == listingFormat) {
            bidsLabel = "";
        }
        else {
            var numBids = aItem.get("numBids");
            if (!numBids) {
                numBids = 0;
            }
            if (aIgnoreZero && numBids === 0) {
                bidsLabel = "";
            }
            else {
                bidsLabel =
                    $.i18n.getString((numBids === 0 ? "item.history.bid.zero" :
                        numBids == 1 ? "item.history.bid" : "item.history.bid.plural"), [numBids]);
            }
        }
        return UtilityHelper.escapeHtml(bidsLabel);
    },
    _getWatchers: function (aItem) {
        var watchCount = aItem.get("numWatching");
        var watchStringKey = (watchCount === 0 ? "item.history.watcher.zero" :
            watchCount == 1 ? "item.history.watcher" :
                "item.history.watcher.plural");
        return $.i18n.getString(watchStringKey, [watchCount]);
    },
    _getBuyer: function (aItem) {
        var transactions = aItem.get("transactions");
        var buyer = "";
        if (transactions && transactions.length > 0) {
            buyer = transactions[0].get("buyerUserId");
        }
        return buyer;
    },
    updateTimeLeft: function (aBox) {
        var itemObject = aBox.data("itemObject");
        var itemTime = aBox.find(".item-time");
        var timeLeft = this._getTimeLeftInfo(itemObject);
        if (timeLeft.endSoon) {
            if (!itemTime.hasClass("endSoon")) {
                itemTime.addClass("endSoon");
            }
        }
        else {
            itemTime.removeClass("endSoon");
        }
        itemTime.text(timeLeft.label);
    }
};
$(document).ready(function () { ItemBox.init(); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlbUJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3VpL3ZpZXcvY29yZS9pdGVtQm94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBS0gsSUFBSSxPQUFPLEdBQUc7SUFDWixnQkFBZ0IsRUFBRyxJQUFJO0lBQ3ZCLHVCQUF1QixFQUFHLElBQUk7SUFDOUIsaUJBQWlCLEVBQUcsRUFBRTtJQUN0QixxQkFBcUIsRUFBRyxFQUFFO0lBRTFCLElBQUksRUFBRztRQUVMLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDO1lBQ3hELEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUM7WUFDaEUsRUFBRSxLQUFLLEVBQUUsOEJBQThCLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7WUFDaEQsRUFBRSxLQUFLLEVBQUUsOEJBQThCLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQztZQUMvRCxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUMvQyxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDO1lBQzFELEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENB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USxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGLENBQUM7QUFFRixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWEsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIENvcHlyaWdodCAoQykgMjAwNy0yMDE1IGVCYXkgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICovXG5cbi8qKlxuICogSXRlbSBMaXN0IGJveC5cbiAqL1xudmFyIEl0ZW1Cb3ggPSB7XG4gIF9pdGVtQm94VGVtcGxhdGUgOiBudWxsLFxuICBfaXRlbVZpZXdBbGxCb3hUZW1wbGF0ZSA6IG51bGwsXG4gIF9TVEFURV9QUk9QRVJUSUVTIDoge30sXG4gIF9JVEVNX1RZUEVfUFJPUEVSVElFUyA6IHt9LFxuXG4gIGluaXQgOiBmdW5jdGlvbigpIHtcbiAgICBcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLldBVENISU5HX0NMQVNTSUZJRURfQURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5wcmljZS5jbGFzc2lmaWVkXCIgfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLkJVWUlOR19TVUNDRVNTX1JFU0VSVkVfTk9UX01FVF0gPVxuICAgICAgeyBsYWJlbDogXCJpdGVtLnN0YXRlLmJ1eWluZy5oaWdoQmlkZGVyXCIgfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLkJVWUlOR19TVUNDRVNTXSA9XG4gICAgICB7IGxhYmVsOiBcIml0ZW0uc3RhdGUuYnV5aW5nLmhpZ2hCaWRkZXJcIiB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuQlVZSU5HX09VVEJJRF9SRVNFUlZFX05PVF9NRVRdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS5idXlpbmcub3V0YmlkXCIgfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLkJVWUlOR19PVVRCSURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS5idXlpbmcub3V0YmlkXCIgfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLkJVWUlOR19JVEVNX1dPTl9OT1RfUEFJRF0gPVxuICAgICAgeyBsYWJlbDogXCJpdGVtLnN0YXRlLndvbi5wYXlOb3dcIiB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuQlVZSU5HX0lURU1fV09OX1BBSURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS53b24ucGFpZFwiIH07XG4gICAgdGhpcy5fU1RBVEVfUFJPUEVSVElFU1tJdGVtLlNUQVRFUy5CVVlJTkdfSVRFTV9XT05fU0hJUFBFRF0gPVxuICAgICAgeyBsYWJlbDogXCJpdGVtLnN0YXRlLmdlbmVyYWwuc2hpcHBlZFwiIH07XG4gICAgdGhpcy5fU1RBVEVfUFJPUEVSVElFU1tJdGVtLlNUQVRFUy5CVVlJTkdfSVRFTV9XT05fU0hJUFBFRF9GRUVEQkFDS19MRUZUXSA9XG4gICAgICB7IGxhYmVsOiBcIml0ZW0uc3RhdGUuZ2VuZXJhbC5zaGlwcGVkXCIgfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLlNFTExJTkdfUkVTRVJWRV9OT1RfTUVUXSA9XG4gICAgICB7IGxhYmVsOiBbXCJpdGVtLnN0YXRlLnNlbGxpbmcuYmlkUmVjZWl2ZWRcIiwgXCJpdGVtLnN0YXRlLnNlbGxpbmcuYmlkc1JlY2VpdmVkXCJdIH07XG4gICAgdGhpcy5fU1RBVEVfUFJPUEVSVElFU1tJdGVtLlNUQVRFUy5TRUxMSU5HX0lURU1fU09MRF0gPVxuICAgICAgeyBsYWJlbDogW1wiaXRlbS5zdGF0ZS5zZWxsaW5nLmJpZFJlY2VpdmVkXCIsIFwiaXRlbS5zdGF0ZS5zZWxsaW5nLmJpZHNSZWNlaXZlZFwiXSB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuU0VMTElOR19XSVRIX09GRkVSU10gPVxuICAgICAgeyBsYWJlbDogW1wiaXRlbS5zdGF0ZS5zZWxsaW5nLm9mZmVyUmVjZWl2ZWRcIiwgXCJpdGVtLnN0YXRlLnNlbGxpbmcub2ZmZXJzUmVjZWl2ZWRcIl0gfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLlNFTExJTkdfSVRFTV9TT0xEX1NISVBQRURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS5nZW5lcmFsLnNoaXBwZWRcIiB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuU0VMTElOR19JVEVNX1NPTERfTk9UX1BBSURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS5zb2xkLm5vdFBhaWRcIiB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuU0VMTElOR19JVEVNX1NPTERfUEFJRF9BTkRfU0hJUF0gPVxuICAgICAgeyBsYWJlbDogXCJpdGVtLnN0YXRlLnNvbGQucGFpZEFuZFNoaXBcIiB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuU0VMTElOR19JVEVNX1NPTERfUkVGVU5ERURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS5zb2xkLnJlZnVuZGVkXCIgfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLlNFTExJTkdfSVRFTV9TT0xEX0ZFRURCQUNLX1JFQ0VJVkVEXSA9XG4gICAgICB7IGxhYmVsOiBcIml0ZW0uc3RhdGUuZ2VuZXJhbC5zaGlwcGVkXCIgfTtcbiAgICB0aGlzLl9TVEFURV9QUk9QRVJUSUVTW0l0ZW0uU1RBVEVTLlNFTExJTkdfSVRFTV9VTlNPTERfUkVMSVNURURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS51bnNvbGQucmVsaXN0ZWRcIiB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuQkVTVF9PRkZFUl9QRU5ESU5HXSA9XG4gICAgICB7IGxhYmVsOiBcIml0ZW0uc3RhdGUuYnV5aW5nLm9mZmVyLnBlbmRpbmdcIiB9O1xuICAgIHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuQkVTVF9PRkZFUl9ERUNMSU5FRF0gPVxuICAgICAgeyBsYWJlbDogXCJpdGVtLnN0YXRlLmJ1eWluZy5vZmZlci5kZWNsaW5lZFwiIH07XG4gICAgdGhpcy5fU1RBVEVfUFJPUEVSVElFU1tJdGVtLlNUQVRFUy5CRVNUX09GRkVSX0VYUElSRURdID1cbiAgICAgIHsgbGFiZWw6IFwiaXRlbS5zdGF0ZS5idXlpbmcub2ZmZXIuZXhwaXJlZFwiIH07XG4gICAgdGhpcy5fU1RBVEVfUFJPUEVSVElFU1tJdGVtLlNUQVRFUy5CRVNUX09GRkVSX0NPVU5URVJFRF0gPVxuICAgICAgeyBsYWJlbDogXCJpdGVtLnN0YXRlLmJ1eWluZy5vZmZlci5jb3VudGVyZWRcIiB9O1xuXG4gICAgdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbSXRlbS5UWVBFUy5TRUxMSU5HX09GRkVSXSA9XG4gICAgICB7IGxhYmVsOiBcImxpc3Qub2ZmZXJzLnZpZXcuYWxsXCIgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLlNFTExJTkddID1cbiAgICAgIHsgbGFiZWw6IFwibGlzdC5zZWxsaW5nLnZpZXcuYWxsXCIgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLlNPTERdID1cbiAgICAgIHsgbGFiZWw6IFwibGlzdC5zb2xkLnZpZXcuYWxsXCIgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLlVOU09MRF0gPVxuICAgICAgeyBsYWJlbDogXCJsaXN0LnVuc29sZC52aWV3LmFsbFwiIH07XG4gICAgdGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbSXRlbS5UWVBFUy5TQ0hFRFVMRURdID1cbiAgICAgIHsgbGFiZWw6IFwibGlzdC5zY2hlZHVsZWQudmlldy5hbGxcIiB9O1xuICAgIHRoaXMuX0lURU1fVFlQRV9QUk9QRVJUSUVTW0l0ZW0uVFlQRVMuQklERElOR10gPVxuICAgICAgeyBsYWJlbDogXCJsaXN0LmJpZGRpbmcudmlldy5hbGxcIiB9O1xuICAgIHRoaXMuX0lURU1fVFlQRV9QUk9QRVJUSUVTW0l0ZW0uVFlQRVMuV09OXSA9XG4gICAgICB7IGxhYmVsOiBcImxpc3Qud29uLnZpZXcuYWxsXCIgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLkxPU1RdID1cbiAgICAgIHsgbGFiZWw6IFwibGlzdC5sb3N0LnZpZXcuYWxsXCIgfTtcbiAgICB0aGlzLl9JVEVNX1RZUEVfUFJPUEVSVElFU1tJdGVtLlRZUEVTLkJFU1RfT0ZGRVJdID1cbiAgICAgIHsgbGFiZWw6IFwibGlzdC5vZmZlcnMudmlldy5hbGxcIiB9O1xuXG4gICAgdGhpcy5fbG9hZFRlbXBsYXRlcygpO1xuICB9LFxuXG4gIF9sb2FkVGVtcGxhdGVzIDogZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IFwiY29yZS9pdGVtQm94Lmh0bWxcIixcbiAgICAgIGRhdGFUeXBlOiBcInRleHRcIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGFEYXRhLCBhU3RhdHVzKSB7XG4gICAgICAgIHRoYXQuX2l0ZW1Cb3hUZW1wbGF0ZSA9ICQoYURhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IFwiY29yZS9pdGVtVmlld0FsbEJveC5odG1sXCIsXG4gICAgICBkYXRhVHlwZTogXCJ0ZXh0XCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihhRGF0YSwgYVN0YXR1cykge1xuICAgICAgICB0aGF0Ll9pdGVtVmlld0FsbEJveFRlbXBsYXRlID0gJChhRGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgY3JlYXRlSXRlbUJveCA6IGZ1bmN0aW9uKGFJdGVtT2JqZWN0KSB7XG4gICAgXG4gICAgdmFyIGJveCA9XG4gICAgICAkKFwiPGE+PC9hPlwiKS5hdHRyKHtcbiAgICAgICAgXCJocmVmXCI6IFwiI1wiLFxuICAgICAgICBcImRhdGEtdXBkYXRlLXRvb2x0aXBcIiA6IFwidHJ1ZVwiLFxuICAgICAgICBcImNsYXNzXCIgOiBcIml0ZW0tYm94LWNvbnRhaW5lciBcIiArIGFJdGVtT2JqZWN0LmdldChcInR5cGVcIilcbiAgICAgIH0pLmFwcGVuZCh0aGlzLl9pdGVtQm94VGVtcGxhdGUuY2xvbmUoKSk7XG5cbiAgICBib3guY2xpY2soZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IGFFdmVudC50YXJnZXQudGFnTmFtZSA/IGFFdmVudC50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcblxuICAgICAgaWYgKGJveC5wYXJlbnRzKFwiLmVkaXQtbW9kZVwiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGJveC5maW5kKFwiLml0ZW0tZWRpdC1jaGVja2JveDp2aXNpYmxlXCIpO1xuXG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIGNoZWNrYm94ID0gYm94LmZpbmQoXCJpbnB1dFt0eXBlPSdjaGVja2JveCddXCIpO1xuICAgICAgICAgIGlmIChjaGVja2JveCAmJiB0YWdOYW1lICYmIFwic3BhblwiICE9IHRhZ05hbWUgJiYgXCJpbnB1dFwiICE9IHRhZ05hbWUpIHtcbiAgICAgICAgICAgIGlmICgkKGNoZWNrYm94KS5wcm9wKFwiY2hlY2tlZFwiKSkge1xuICAgICAgICAgICAgICAkKGNoZWNrYm94KS5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICQoY2hlY2tib3gpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJldmVudCBTYWZhcmkgZnJvbSBzZW5kaW5nIGRlZmF1bHQgcmVxdWVzdHMgb24gaXRlbSBjbGljay5cbiAgICAgICAgICAgIGFFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwYXJlbnRzID0gYm94LnBhcmVudHMoXCIuaXRlbS1saXN0LWJveFwiKTtcbiAgICAgICAgICBpZiAocGFyZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudElkID0gJChwYXJlbnRzWzBdKS5hdHRyKFwiaWRcIik7XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50SWQgPT0gXCJwYW5lbC13YXRjaGluZ1wiKSB7XG4gICAgICAgICAgICAgICQoXCIjcGFuZWwtd2F0Y2hpbmctZGVsZXRlLWJ1dHRvblwiKS5hdHRyKFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIiwgUGFuZWxXYXRjaGluZy5nZXRTZWxlY3RlZERlbGV0ZUNoZWNrYm94ZXMoKS5sZW5ndGggPT09IDApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50SWQgPT0gXCJwYW5lbC1idXlpbmctZnVsbFwiKSB7XG4gICAgICAgICAgICAgICQoXCIjcGFuZWwtYnV5aW5nLWRlbGV0ZS1idXR0b25cIikuYXR0cihcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCIsIFBhbmVsQnV5aW5nLmdldFNlbGVjdGVkRGVsZXRlQ2hlY2tib3hlcygpLmxlbmd0aCA9PT0gMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnRJZCA9PSBcInBhbmVsLXNlbGxpbmctZnVsbFwiKSB7XG4gICAgICAgICAgICAgICQoXCIjcGFuZWwtc2VsbGluZy1kZWxldGUtYnV0dG9uXCIpLmF0dHIoXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiLCBQYW5lbFNlbGxpbmcuZ2V0U2VsZWN0ZWREZWxldGVDaGVja2JveGVzKCkubGVuZ3RoID09PSAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBvYmplY3QgPSBib3guZGF0YShcIml0ZW1PYmplY3RcIik7XG4gICAgICB2YXIgZXZlbnRMYWJlbCA9IFNpZGViYXIuZ2V0R0FUYWJUcmFja2luZ05hbWUoVGFiQ29udGFpbmVyLmdldERlZmF1bHRUYWIoKSk7XG5cbiAgICAgIEV2ZW50QW5hbHl0aWNzLnB1c2goe1xuICAgICAgICBrZXk6IFwiU2lnbmVkSW5FeGl0XCIsXG4gICAgICAgIGFjdGlvbjogXCJDbGlja0l0ZW1cIixcbiAgICAgICAgbGFiZWw6IGV2ZW50TGFiZWxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBEaXNhYmxlIHRoaXMgZm9yIG5vdyBhcyBub3QgYWxsIHNpdGVzIGFyZSBzdXBwb3J0ZWQuXG4gICAgICAvLyBvcGVuIHByaW50IGxhYmVsIHBhZ2UgZm9yIHNvbGQgcGFpZCBpdGVtXG4gICAgICAvLyBpZiAob2JqZWN0LmdldChcInR5cGVcIikgPT0gSXRlbS5UWVBFUy5TT0xEICYmXG4gICAgICAvLyAgICAgdGhpcy5fZ2V0U3RhdGUob2JqZWN0KSA9PSBJdGVtLlNUQVRFUy5TRUxMSU5HX0lURU1fU09MRF9QQUlEX0FORF9TSElQKSB7XG4gICAgICAvLyAgIHZhciB0cmFuc2FjdGlvbnMgPSBvYmplY3QuZ2V0KFwidHJhbnNhY3Rpb25zXCIpO1xuICAgICAgLy8gICBpZiAodHJhbnNhY3Rpb25zICYmIHRyYW5zYWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyAgICAgUm92ZXJVcmxIZWxwZXIubG9hZFBhZ2UoXCJwcmludFNoaXBMYWJlbFwiLCBcIml0ZW1DbGlja1wiLFxuICAgICAgLy8gICAgICAgeyBcIml0ZW1pZFwiOiBvYmplY3QuZ2V0KFwiaXRlbUlkXCIpLCBcInRyYW5zaWRcIjogdHJhbnNhY3Rpb25zWzBdLmdldChcInRyYW5zYWN0aW9uSWRcIikgfSwgYUV2ZW50KTtcbiAgICAgIC8vICAgICByZXR1cm47XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH1cblxuICAgICAgLy9YWFg6IHdlIHdvbid0IHVzZSB2aWV3SXRlbVVybCBiZWNhdXNlIGZvciB1bnNpdGVkIGNvdW50cmllcywgdGhlIGRvbWFpbiB0byB1c2Ugb24gdGhlIGl0ZW0gcGFnZSB3b24ndCBleGlzdFxuICAgICAgLy92YXIgaXRlbVVybCA9IG9iamVjdC5nZXQoXCJ2aWV3SXRlbVVybFwiKTtcbiAgICAgIFJvdmVyVXJsSGVscGVyLmxvYWRQYWdlKFwibGlzdGluZzJcIiwgXCJpdGVtQ2xpY2tcIixcbiAgICAgICAgeyBcIml0ZW1pZFwiOiBvYmplY3QuZ2V0KFwiaXRlbUlkXCIpLFxuICAgICAgICAgIFwiZm9yY2VOZXdUYWJcIiA6IHRydWVcbiAgICAgICAgfSwgYUV2ZW50KTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy9PbiBXaW5kb3dzLCB0aGUgdGFiIGZ1bmN0aW9ucyBkaWZmZXJlbnQgdGhhbiBPU1guIFdlIHdvdWxkIG5lZWQgdG8gcmVtb3ZlIHRoZSB0YWJpbmRleCBpbiB0aGUgcGFyZW50IDxhPiBub2RlLCBzbyB0aGVcbiAgICAvL2N1cnNvciBkb2Vzbid0IGdldCBzdHVjayBvbiB0aGUgY2hlY2tib3ggZWxlbWVudCB0byBzZWxlY3QgYW4gSXRlbS4gVGhpcyBwaWVjZSBvZiBjb2RlIHJlc3RhYmxpc2hlZCB0aGUgdGFiaW5kZXggYXR0cmlidXRlXG4gICAgLy9pbiB0aGUgcHJldmlvdXMgYW5kIG5leHQgc2ltYmxpbmcgaXRlbSBlbGVtZW50cyBmb3IgdGhlIGN1cnJlbnQgZm9jdXNlZCBpdGVtIGVsZW1lbnQuXG4gICAgaWYgKFwiV2luZG93XCIgPT0gVXRpbGl0eUhlbHBlci5nZXRDbGllbnQoKS5vcykge1xuICAgICAgYm94LmZvY3VzKGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgICB2YXIgcHJldmlvdXNTaWJsaW5nID0gJChhRXZlbnQudGFyZ2V0KS5wcmV2KFwiYVwiKTtcbiAgICAgICAgaWYgKDAgPCBwcmV2aW91c1NpYmxpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgJChwcmV2aW91c1NpYmxpbmdbMF0pLmF0dHIoXCJ0YWJpbmRleFwiLCBcIjBcIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV4dFNpYmxpbmcgPSAkKGFFdmVudC50YXJnZXQpLm5leHQoXCJhXCIpO1xuICAgICAgICBpZiAoMCA8IG5leHRTaWJsaW5nLmxlbmd0aCkge1xuICAgICAgICAgICQobmV4dFNpYmxpbmdbMF0pLmF0dHIoXCJ0YWJpbmRleFwiLCBcIjBcIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBib3guZmluZChcImlucHV0W3R5cGU9J2NoZWNrYm94J11cIikuZm9jdXMoZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gJChhRXZlbnQudGFyZ2V0KTtcbiAgICAgICAgdmFyIHBhcmVudHMgPSBlbGVtZW50LnBhcmVudHMoXCJhXCIpO1xuICAgICAgICBpZiAoMCA8IHBhcmVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgJChwYXJlbnRzWzBdKS5hdHRyKFwidGFiaW5kZXhcIiwgXCItMVwiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlSXRlbUJveChib3gsIGFJdGVtT2JqZWN0KTtcblxuICAgIHJldHVybiBib3g7XG4gIH0sXG5cbiAgX3VwZGF0ZUl0ZW1Cb3ggOiBmdW5jdGlvbihhQm94LCBhSXRlbU9iamVjdCkge1xuICAgIFxuICAgIHZhciBpdGVtVGl0bGUgPSBhQm94LmZpbmQoXCIuaXRlbS10aXRsZVwiKTtcbiAgICB2YXIgaXRlbURlc2NyaXB0aW9uID0gYUJveC5maW5kKFwiLml0ZW0tZGVzY3JpcHRpb25cIik7XG4gICAgdmFyIGNoZWNrYm94RGVzY3JpcHRpb24gPSBhQm94LmZpbmQoXCIuY2hlY2tib3gtZGVzY3JpcHRpb25cIik7XG4gICAgdmFyIGl0ZW1QcmljZSA9IGFCb3guZmluZChcIi5pdGVtLXByaWNlXCIpO1xuICAgIHZhciBpdGVtUHJpY2VDb250YWluZXIgPSBhQm94LmZpbmQoXCIuaXRlbS1wcmljZS1pbm5lci1jb250YWluZXJcIik7XG4gICAgdmFyIGl0ZW1UaW1lID0gYUJveC5maW5kKFwiLml0ZW0tdGltZVwiKTtcbiAgICB2YXIgaXRlbVNoaXBwaW5nID0gYUJveC5maW5kKFwiLml0ZW0tc2hpcHBpbmdcIik7XG4gICAgdmFyIGNoZWNrYm94ID0gYUJveC5maW5kKFwiLml0ZW0tZWRpdC1jaGVja2JveFwiKTtcbiAgICB2YXIgbGlzdGluZ0Zvcm1hdCA9IGFJdGVtT2JqZWN0LmdldChcImxpc3RpbmdGb3JtYXRcIik7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fZ2V0U3RhdGUoYUl0ZW1PYmplY3QpO1xuICAgIHZhciBsYWJlbCA9IHRoaXMuX2dldFN0YXRlTGFiZWwoc3RhdGUpO1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgaW1hZ2VVcmw7XG4gICAgdmFyIHRpbWVMZWZ0O1xuICAgIHZhciBiaWRzO1xuICAgIHZhciBxdWFudGl0eTtcblxuICAgIHZhciBzZXRQcmljZUFuZFNoaXBwaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJpY2VJbmZvID0gdGhhdC5fZ2V0UHJpY2VJbmZvKGFJdGVtT2JqZWN0KTtcblxuICAgICAgaXRlbVByaWNlLnRleHQocHJpY2VJbmZvLmxhYmVsKTtcbiAgICAgIGlmIChwcmljZUluZm8uaXNDb252ZXJ0ZWRTaG93bikge1xuICAgICAgICBpdGVtUHJpY2VDb250YWluZXIuYWRkQ2xhc3MoXCJjb252ZXJ0ZWRcIik7XG4gICAgICAgIHZhciBzaGlwcGluZ0luZm8gPSB0aGF0Ll9nZXRTaGlwcGluZ0luZm8oYUl0ZW1PYmplY3QsIHByaWNlSW5mbyk7XG4gICAgICAgIGlmIChzaGlwcGluZ0luZm8uaXNDb252ZXJ0ZWRTaG93bikge1xuICAgICAgICAgIGl0ZW1TaGlwcGluZy5hZGRDbGFzcyhcImNvbnZlcnRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpdGVtU2hpcHBpbmcudGV4dChzaGlwcGluZ0luZm8ubGFiZWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXRlbVNoaXBwaW5nLnRleHQodGhhdC5fZ2V0U2hpcHBpbmdJbmZvKGFJdGVtT2JqZWN0KS5sYWJlbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHN3aXRjaCAoYUl0ZW1PYmplY3QuZ2V0KFwidHlwZVwiKSkge1xuICAgICAgY2FzZSBJdGVtLlRZUEVTLlNFTExJTkdfT0ZGRVI6XG4gICAgICBjYXNlIEl0ZW0uVFlQRVMuU0VMTElORzpcbiAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09IEl0ZW0uU1RBVEVTLlNFTExJTkdfV0lUSF9PRkZFUlMpIHtcbiAgICAgICAgICAgIHZhciBvZmZlckNvdW50ID0gYUl0ZW1PYmplY3QuZ2V0KFwiYmVzdE9mZmVyQ291bnRcIik7XG4gICAgICAgICAgICBpZiAob2ZmZXJDb3VudCkge1xuICAgICAgICAgICAgICBpZiAob2ZmZXJDb3VudCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgaXRlbVRpdGxlLnRleHQobGFiZWxbMF0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHNpbmNlIGl0IGhhcyBudW1iZXIgc28gbmVlZCB0byBnZXQgdGhhdCBhZ2FpblxuICAgICAgICAgICAgICAgIHZhciBvZmZlcnNMYWJlbCA9XG4gICAgICAgICAgICAgICAgICAkLmkxOG4uZ2V0U3RyaW5nKHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbSXRlbS5TVEFURVMuU0VMTElOR19XSVRIX09GRkVSU10ubGFiZWxbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvZmZlckNvdW50XSk7XG4gICAgICAgICAgICAgICAgaXRlbVRpdGxlLnRleHQob2ZmZXJzTGFiZWwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGl0ZW1UaXRsZS5hZGRDbGFzcyhcInN0YXRlLVwiICsgc3RhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaXRlbVRpdGxlLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmlkcyA9IGFJdGVtT2JqZWN0LmdldChcIm51bUJpZHNcIik7XG4gICAgICAgICAgICBpZiAoYmlkcyAmJiBiaWRzID4gMCkge1xuICAgICAgICAgICAgICBpZiAoYmlkcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgaXRlbVRpdGxlLnRleHQobGFiZWxbMF0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1UaXRsZS50ZXh0KGxhYmVsWzFdKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpdGVtVGl0bGUuYWRkQ2xhc3MoXCJzdGF0ZS1cIiArIHN0YXRlKTtcblxuICAgICAgICAgICAgICBpZiAoc3RhdGUgPT0gSXRlbS5TVEFURVMuU0VMTElOR19SRVNFUlZFX05PVF9NRVQpIHtcbiAgICAgICAgICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1yZXNlcnZlLW5vdC1tZXRcIikudGV4dChcbiAgICAgICAgICAgICAgICAgICQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnN0YXRlLnNlbGxpbmcucmVzZXJ2ZU5vdE1ldFwiKSkuc2hvdygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpdGVtVGl0bGUuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtVGl0bGUuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgIGJpZHMgPSB0aGlzLl9nZXRCaWRzKGFJdGVtT2JqZWN0LCB0cnVlKTtcbiAgICAgICAgaWYgKGJpZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGFCb3guZmluZChcIi5pdGVtLWJpZHNcIikuYWRkQ2xhc3MoSXRlbS5UWVBFUy5TRUxMSU5HKS50ZXh0KGJpZHMpO1xuICAgICAgICB9XG4gICAgICAgIGFCb3guZmluZChcIi5pdGVtLXdhdGNoZXJzXCIpLnRleHQodGhpcy5fZ2V0V2F0Y2hlcnMoYUl0ZW1PYmplY3QpKTtcbiAgICAgICAgdGltZUxlZnQgPSB0aGlzLl9nZXRUaW1lTGVmdEluZm8oYUl0ZW1PYmplY3QpO1xuICAgICAgICBpZiAodGltZUxlZnQuZW5kU29vbikge1xuICAgICAgICAgIGl0ZW1UaW1lLmFkZENsYXNzKFwiZW5kU29vblwiKTtcbiAgICAgICAgfVxuICAgICAgICBpdGVtVGltZS5hZGRDbGFzcyhJdGVtLlRZUEVTLlNFTExJTkcpLnRleHQodGltZUxlZnQubGFiZWwpO1xuICAgICAgICBzZXRQcmljZUFuZFNoaXBwaW5nKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBJdGVtLlRZUEVTLlNPTEQ6XG4gICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgIGl0ZW1UaXRsZS50ZXh0KGxhYmVsKTtcbiAgICAgICAgICBpdGVtVGl0bGUuYWRkQ2xhc3MoXCJzdGF0ZS1cIiArIHN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtVGl0bGUuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdlIGNhbiBkZXRlcm1pbiB3aGV0aGVyIHdlIGRpc3BsYXkgY2hlY2tib3ggb3Igbm90LlxuICAgICAgICBjaGVja2JveC5hZGRDbGFzcyhcInN0YXRlLVwiICsgc3RhdGUpO1xuICAgICAgICBxdWFudGl0eSA9IHRoaXMuX2dldFRvdGFsVHJhbnNhY3Rpb25RdWFudGl0eShhSXRlbU9iamVjdCk7XG4gICAgICAgIGlmIChxdWFudGl0eSA+IDEpIHtcbiAgICAgICAgICBpdGVtRGVzY3JpcHRpb24uYWRkQ2xhc3MoXCJzaW5nbGUtbGluZVwiKTtcbiAgICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1xdWFudGl0eVwiKS50ZXh0KCQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnNvbGQucXVhbnRpdHlcIiwgW3F1YW50aXR5XSkpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1idXllclwiKS50ZXh0KHRoaXMuX2dldEJ1eWVyKGFJdGVtT2JqZWN0KSk7XG4gICAgICAgIGl0ZW1UaW1lLnRleHQodGhpcy5fZ2V0VHJhbnNhY3Rpb25UaW1lKGFJdGVtT2JqZWN0KSk7XG4gICAgICAgIHNldFByaWNlQW5kU2hpcHBpbmcoKTtcblxuICAgICAgICBpZiAoc3RhdGUgPT0gSXRlbS5TVEFURVMuU0VMTElOR19JVEVNX1NPTERfRkVFREJBQ0tfUkVDRUlWRUQpIHtcbiAgICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1mZWVkYmFjay1hY3Rpb25cIikudGV4dCgkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zdGF0ZS5zb2xkLmZlZWRiYWNrUmVjZWl2ZWRcIikpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgSXRlbS5UWVBFUy5VTlNPTEQ6XG4gICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgIGl0ZW1UaXRsZS50ZXh0KGxhYmVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtVGl0bGUuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgIGJpZHMgPSB0aGlzLl9nZXRCaWRzKGFJdGVtT2JqZWN0LCB0cnVlKTtcbiAgICAgICAgaWYgKGJpZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGFCb3guZmluZChcIi5pdGVtLWJpZHNcIikudGV4dChiaWRzKTtcbiAgICAgICAgfVxuICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS13YXRjaGVyc1wiKS50ZXh0KHRoaXMuX2dldFdhdGNoZXJzKGFJdGVtT2JqZWN0KSk7XG4gICAgICAgIGl0ZW1UaW1lLnRleHQodGhpcy5fZ2V0RW5kVGltZShhSXRlbU9iamVjdCkpO1xuICAgICAgICBzZXRQcmljZUFuZFNoaXBwaW5nKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBJdGVtLlRZUEVTLlNDSEVEVUxFRDpcbiAgICAgICAgdmFyIHNjaGVkdWxlZFRpbWUgPSB0aGlzLl9nZXRTY2hlZHVsZWRUaW1lKGFJdGVtT2JqZWN0KTtcbiAgICAgICAgaXRlbVRpdGxlLmhpZGUoKTtcblxuICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1zY2hlZHVsZWQtZGF0ZVwiKS50ZXh0KHNjaGVkdWxlZFRpbWVbMF0pO1xuICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1zY2hlZHVsZWQtdGltZVwiKS50ZXh0KHNjaGVkdWxlZFRpbWVbMV0pO1xuICAgICAgICBzZXRQcmljZUFuZFNoaXBwaW5nKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBJdGVtLlRZUEVTLldBVENISU5HOlxuICAgICAgICB2YXIgYnV5SXROb3dQcmljZSA9IGFJdGVtT2JqZWN0LmdldChcImJ1eUl0Tm93UHJpY2VcIik7XG4gICAgICAgIGl0ZW1UaXRsZS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHN0YXRlID09IEl0ZW0uU1RBVEVTLldBVENISU5HX0NMQVNTSUZJRURfQUQpIHtcbiAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgIGFCb3guZmluZChcIi5pdGVtLWFjdGlvbi1vbmVcIikudGV4dChsYWJlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKEl0ZW0uTElTVElOR19GT1JNQVRTLkNISU5FU0UgPT0gbGlzdGluZ0Zvcm1hdCB8fFxuICAgICAgICAgICAgSXRlbS5MSVNUSU5HX0ZPUk1BVFMuRFVUQ0ggPT0gbGlzdGluZ0Zvcm1hdCB8fFxuICAgICAgICAgICAgSXRlbS5MSVNUSU5HX0ZPUk1BVFMuTElWRSA9PSBsaXN0aW5nRm9ybWF0KSB7XG4gICAgICAgICAgYUJveC5maW5kKFwiLml0ZW0tYmlkc1wiKS50ZXh0KHRoaXMuX2dldEJpZHMoYUl0ZW1PYmplY3QpKTtcblxuICAgICAgICAgIGlmIChidXlJdE5vd1ByaWNlKSB7XG4gICAgICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1hY3Rpb24tb25lXCIpLnRleHQoJC5pMThuLmdldFN0cmluZyhcIml0ZW0ucHJpY2Uub3JidXlpdG5vd1wiKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGJ1eUl0Tm93UHJpY2UpIHtcbiAgICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1hY3Rpb24tb25lXCIpLnRleHQoJC5pMThuLmdldFN0cmluZyhcIml0ZW0ucHJpY2UuYnV5aXRub3cubGFiZWxcIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGltZUxlZnQgPSB0aGlzLl9nZXRUaW1lTGVmdEluZm8oYUl0ZW1PYmplY3QpO1xuICAgICAgICBpZiAodGltZUxlZnQuZW5kU29vbikge1xuICAgICAgICAgIGl0ZW1UaW1lLmFkZENsYXNzKFwiZW5kU29vblwiKTtcbiAgICAgICAgfVxuICAgICAgICBpdGVtVGltZS50ZXh0KHRpbWVMZWZ0LmxhYmVsKTtcbiAgICAgICAgc2V0UHJpY2VBbmRTaGlwcGluZygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgSXRlbS5UWVBFUy5CSURESU5HOlxuICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICBpdGVtVGl0bGUudGV4dChsYWJlbCk7XG4gICAgICAgICAgaXRlbVRpdGxlLmFkZENsYXNzKFwic3RhdGUtXCIgKyBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVRpdGxlLmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZSA9PSBJdGVtLlNUQVRFUy5CVVlJTkdfU1VDQ0VTU19SRVNFUlZFX05PVF9NRVQgfHxcbiAgICAgICAgICAgIHN0YXRlID09IEl0ZW0uU1RBVEVTLkJVWUlOR19PVVRCSURfUkVTRVJWRV9OT1RfTUVUKSB7XG4gICAgICAgICAgYUJveC5maW5kKFwiLml0ZW0tcmVzZXJ2ZS1ub3QtbWV0XCIpLnRleHQoXG4gICAgICAgICAgICAkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zdGF0ZS5zZWxsaW5nLnJlc2VydmVOb3RNZXRcIikpLnNob3coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFCb3guZmluZChcIi5pdGVtLWJpZHNcIikudGV4dCh0aGlzLl9nZXRCaWRzKGFJdGVtT2JqZWN0KSk7XG4gICAgICAgIHRpbWVMZWZ0ID0gdGhpcy5fZ2V0VGltZUxlZnRJbmZvKGFJdGVtT2JqZWN0KTtcbiAgICAgICAgaWYgKHRpbWVMZWZ0LmVuZFNvb24pIHtcbiAgICAgICAgICBpdGVtVGltZS5hZGRDbGFzcyhcImVuZFNvb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbVRpbWUudGV4dCh0aW1lTGVmdC5sYWJlbCk7XG4gICAgICAgIHNldFByaWNlQW5kU2hpcHBpbmcoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEl0ZW0uVFlQRVMuV09OOlxuICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICBpdGVtVGl0bGUudGV4dChsYWJlbCk7XG4gICAgICAgICAgaXRlbVRpdGxlLmFkZENsYXNzKFwic3RhdGUtXCIgKyBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVRpdGxlLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICBjaGVja2JveC5hZGRDbGFzcyhcInN0YXRlLVwiICsgc3RhdGUpO1xuICAgICAgICBxdWFudGl0eSA9IHRoaXMuX2dldFRvdGFsVHJhbnNhY3Rpb25RdWFudGl0eShhSXRlbU9iamVjdCk7XG4gICAgICAgIGlmIChxdWFudGl0eSA+IDEpIHtcbiAgICAgICAgICBpdGVtRGVzY3JpcHRpb24uYWRkQ2xhc3MoXCJzaW5nbGUtbGluZVwiKTtcbiAgICAgICAgICBhQm94LmZpbmQoXCIuaXRlbS1xdWFudGl0eVwiKS50ZXh0KCQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLndvbi5xdWFudGl0eVwiLCBbcXVhbnRpdHldKSkuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgIGl0ZW1UaW1lLnRleHQodGhpcy5fZ2V0VHJhbnNhY3Rpb25UaW1lKGFJdGVtT2JqZWN0KSk7XG4gICAgICAgIHNldFByaWNlQW5kU2hpcHBpbmcoKTtcbiAgICAgICAgaWYgKHN0YXRlID09IEl0ZW0uU1RBVEVTLkJVWUlOR19JVEVNX1dPTl9TSElQUEVEKSB7XG4gICAgICAgICAgYUJveC5maW5kKFwiLml0ZW0tZmVlZGJhY2stYWN0aW9uXCIpLmFkZENsYXNzKFwibGVhdmUtZmVlZGJhY2tcIikuXG4gICAgICAgICAgICB0ZXh0KCQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnN0YXRlLndvbi5sZWF2ZUZlZWRiYWNrXCIpKS5zaG93KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT0gSXRlbS5TVEFURVMuQlVZSU5HX0lURU1fV09OX1NISVBQRURfRkVFREJBQ0tfTEVGVCkge1xuICAgICAgICAgIGFCb3guZmluZChcIi5pdGVtLWZlZWRiYWNrLWFjdGlvblwiKS50ZXh0KCQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnN0YXRlLndvbi5mZWVkYmFja0xlZnRcIikpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgSXRlbS5UWVBFUy5MT1NUOlxuICAgICAgICBwcmljZUluZm8gPSB0aGlzLl9nZXRQcmljZUluZm8oYUl0ZW1PYmplY3QpO1xuICAgICAgICBpdGVtVGl0bGUuaGlkZSgpO1xuXG4gICAgICAgIGlmIChJdGVtLkxJU1RJTkdfRk9STUFUUy5DSElORVNFID09IGxpc3RpbmdGb3JtYXQgfHxcbiAgICAgICAgICAgIEl0ZW0uTElTVElOR19GT1JNQVRTLkRVVENIID09IGxpc3RpbmdGb3JtYXQgfHxcbiAgICAgICAgICAgIEl0ZW0uTElTVElOR19GT1JNQVRTLkxJVkUgPT0gbGlzdGluZ0Zvcm1hdCkge1xuICAgICAgICAgIGFCb3guZmluZChcIi5pdGVtLWJpZHNcIikudGV4dCh0aGlzLl9nZXRCaWRzKGFJdGVtT2JqZWN0KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYUl0ZW1PYmplY3QuZ2V0KFwiYnV5SXROb3dQcmljZVwiKSkge1xuICAgICAgICAgIGFCb3guZmluZChcIi5pdGVtLWFjdGlvbi1vbmVcIikudGV4dCgkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5wcmljZS5idXlpdG5vdy5sYWJlbFwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtUHJpY2UudGV4dChwcmljZUluZm8ubGFiZWwpO1xuICAgICAgICBpZiAocHJpY2VJbmZvLmlzQ29udmVydGVkU2hvd24pIHtcbiAgICAgICAgICBpdGVtUHJpY2VDb250YWluZXIuYWRkQ2xhc3MoXCJjb252ZXJ0ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEl0ZW0uVFlQRVMuQkVTVF9PRkZFUjpcbiAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgaXRlbVRpdGxlLnRleHQobGFiZWwpO1xuICAgICAgICAgIGl0ZW1UaXRsZS5hZGRDbGFzcyhcInN0YXRlLVwiICsgc3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1UaXRsZS5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lTGVmdCA9IHRoaXMuX2dldFRpbWVMZWZ0SW5mbyhhSXRlbU9iamVjdCk7XG4gICAgICAgIGlmICh0aW1lTGVmdC5lbmRTb29uKSB7XG4gICAgICAgICAgaXRlbVRpbWUuYWRkQ2xhc3MoXCJlbmRTb29uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGl0ZW1UaW1lLnRleHQodGltZUxlZnQubGFiZWwpO1xuICAgICAgICBzZXRQcmljZUFuZFNoaXBwaW5nKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGltYWdlVXJsID0gdGhpcy5fZ2V0SW1hZ2UoYUl0ZW1PYmplY3QpO1xuICAgIGFCb3guZmluZChcIi5pdGVtLWltYWdlXCIpLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJ1cmwoXFxcIlwiICsgaW1hZ2VVcmwgKyBcIlxcXCIpXCIpO1xuXG4gICAgaXRlbURlc2NyaXB0aW9uLnRleHQoYUl0ZW1PYmplY3QuZ2V0KFwidGl0bGVcIikpO1xuICAgIGNoZWNrYm94RGVzY3JpcHRpb24udGV4dChhSXRlbU9iamVjdC5nZXQoXCJ0aXRsZVwiKSk7XG4gICAgYUJveC5kYXRhKFwiaXRlbU9iamVjdFwiLCBhSXRlbU9iamVjdCk7XG4gIH0sXG5cbiAgY3JlYXRlVmlld0FsbEJveCA6IGZ1bmN0aW9uKGFEYXRhT2JqKSB7XG4gICAgXG4gICAgdmFyIGJveCA9XG4gICAgICAkKFwiPGE+PC9hPlwiKS5hdHRyKHtcbiAgICAgICAgXCJocmVmXCI6IFwiI1wiLFxuICAgICAgICBcImRhdGEtdXBkYXRlLXRvb2x0aXBcIiA6IFwidHJ1ZVwiLFxuICAgICAgfSkuYXBwZW5kKHRoaXMuX2l0ZW1WaWV3QWxsQm94VGVtcGxhdGUuY2xvbmUoKSk7XG5cbiAgICB2YXIgaXRlbVRpdGxlID0gYm94LmZpbmQoXCIuaXRlbS12aWV3LWFsbC10aXRsZVwiKTtcbiAgICB2YXIgaXRlbUNvdW50ID0gYm94LmZpbmQoXCIuaXRlbS12aWV3LWFsbC1jb3VudFwiKTtcblxuICAgIGl0ZW1UaXRsZS50ZXh0KCQuaTE4bi5nZXRTdHJpbmcodGhpcy5fSVRFTV9UWVBFX1BST1BFUlRJRVNbYURhdGFPYmoudHlwZV0ubGFiZWwpKTtcbiAgICBpdGVtQ291bnQudGV4dChhRGF0YU9iai50b3RhbENvdW50KTtcblxuICAgIGJveC5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIHZhciBvYmplY3QgPSBib3guZGF0YShcImRhdGFPYmplY3RcIik7XG5cbiAgICAgIEV2ZW50QW5hbHl0aWNzLnB1c2goe1xuICAgICAgICBrZXk6IFwiU2lnbmVkSW5JbnRlcm5hbFwiLFxuICAgICAgICBhY3Rpb246IFwiQ2xpY2tTZWVBbGxcIixcbiAgICAgICAgbGFiZWw6IFNpZGViYXIuZ2V0R0FMaXN0VHlwZVRyYWNraW5nTmFtZShvYmplY3QudHlwZSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAob2JqZWN0LnR5cGUgPT0gSXRlbS5UWVBFUy5CSURESU5HIHx8XG4gICAgICAgICAgb2JqZWN0LnR5cGUgPT0gSXRlbS5UWVBFUy5XT04gfHxcbiAgICAgICAgICBvYmplY3QudHlwZSA9PSBJdGVtLlRZUEVTLkxPU1QgfHxcbiAgICAgICAgICBvYmplY3QudHlwZSA9PSBJdGVtLlRZUEVTLkJFU1RfT0ZGRVIpIHtcbiAgICAgICAgUGFuZWxCdXlpbmcuc2hvd0Z1bGxMaXN0KHRydWUsIG9iamVjdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQYW5lbFNlbGxpbmcuc2hvd0Z1bGxMaXN0KHRydWUsIG9iamVjdCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICBib3guZGF0YShcImRhdGFPYmplY3RcIiwgYURhdGFPYmopO1xuXG4gICAgcmV0dXJuIGJveDtcbiAgfSxcblxuICBfZ2V0SW1hZ2UgOiBmdW5jdGlvbihhSXRlbSkge1xuICAgIFxuICAgIHZhciBnYWxsZXJ5VXJsID0gYUl0ZW0uZ2V0KFwiZ2FsbGVyeVVybFwiKTtcbiAgICB2YXIgdXJsO1xuXG4gICAgaWYgKGdhbGxlcnlVcmwpIHtcbiAgICAgIHZhciB1cmxzID0gZ2FsbGVyeVVybC5zcGxpdChcIjtcIik7XG4gICAgICBpZiAodXJscy5sZW5ndGggPiAwICYmIHVybHNbKHVybHMubGVuZ3RoIC0gMSldLnNlYXJjaCgvdGh1bWJzXFwuZWJheXN0YXRpY1xcLmNvbS8pID09IC0xKSB7XG4gICAgICAgIC8vIEdldCB0aGUgbGFzdCB1cmwgYXMgaXQncyBub3JtYWxseSB0aGUgc21hbGxlciBzaXplIG9uZS5cbiAgICAgICAgdXJsID0gdXJsc1sodXJscy5sZW5ndGggLSAxKV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdXJsKSB7XG4gICAgICB1cmwgPSBab29tU2VydmljZS5nZXRab29tSW1hZ2Vmb3JJdGVtKGFJdGVtLmdldChcIml0ZW1JZFwiKSwgMTUwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xuICB9LFxuXG4gIF9nZXRTdGF0ZSA6IGZ1bmN0aW9uKGFJdGVtKSB7XG4gICAgXG4gICAgdmFyIHVzZXJJZCA9IEFjY291bnQuZ2V0QWNjb3VudCgpLmdldChcInVzZXJJZFwiKTtcbiAgICB2YXIgc3RhdGUgPSBhSXRlbS5nZXRDdXJyZW50U3RhdGUodXNlcklkKTtcblxuICAgIHJldHVybiBzdGF0ZTtcbiAgfSxcblxuICBfZ2V0U3RhdGVMYWJlbCA6IGZ1bmN0aW9uKGFTdGF0ZSkge1xuICAgIFxuICAgIHZhciBzdGF0ZUxhYmVsO1xuXG4gICAgaWYgKGFTdGF0ZSBpbiB0aGlzLl9TVEFURV9QUk9QRVJUSUVTKSB7XG4gICAgICBpZiAodHlwZW9mKHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbYVN0YXRlXS5sYWJlbCkgPT0gXCJvYmplY3RcIikge1xuICAgICAgICBzdGF0ZUxhYmVsID0gW1xuICAgICAgICAgICQuaTE4bi5nZXRTdHJpbmcodGhpcy5fU1RBVEVfUFJPUEVSVElFU1thU3RhdGVdLmxhYmVsWzBdKSxcbiAgICAgICAgICAkLmkxOG4uZ2V0U3RyaW5nKHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbYVN0YXRlXS5sYWJlbFsxXSlcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlTGFiZWwgPSAkLmkxOG4uZ2V0U3RyaW5nKHRoaXMuX1NUQVRFX1BST1BFUlRJRVNbYVN0YXRlXS5sYWJlbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlTGFiZWw7XG4gIH0sXG5cbiAgX2dldFByaWNlSW5mbyA6IGZ1bmN0aW9uKGFJdGVtKSB7XG5cbiAgICB2YXIgaXNCZXN0T2ZmZXJJdGVtID0gKGFJdGVtLmdldChcInR5cGVcIikgPT0gSXRlbS5UWVBFUy5CRVNUX09GRkVSKTtcbiAgICB2YXIgY3VycmVuY3kgPSBpc0Jlc3RPZmZlckl0ZW0gPyBhSXRlbS5nZXQoXCJiZXN0T2ZmZXJDdXJyZW5jeVwiKSA6IGFJdGVtLmdldChcImN1cnJlbmN5XCIpO1xuICAgIHZhciBwcmljZSA9IGlzQmVzdE9mZmVySXRlbSA/IGFJdGVtLmdldChcImJlc3RPZmZlclwiKSA6IGFJdGVtLmdldChcImN1cnJlbnRQcmljZVwiKTtcbiAgICB2YXIgY29udmVydGVkQ3VycmVuY3kgPVxuICAgICAgaXNCZXN0T2ZmZXJJdGVtID8gYUl0ZW0uZ2V0KFwiY29udmVydGVkQmVzdE9mZmVyQ3VycmVuY3lcIikgOiBhSXRlbS5nZXQoXCJjb252ZXJ0ZWRDdXJyZW5jeVwiKTtcbiAgICB2YXIgY29udmVydGVkUHJpY2UgPVxuICAgICAgaXNCZXN0T2ZmZXJJdGVtID8gYUl0ZW0uZ2V0KFwiY29udmVydGVkQmVzdE9mZmVyXCIpIDogYUl0ZW0uZ2V0KFwiY29udmVydGVkQ3VycmVudFByaWNlXCIpO1xuICAgIHZhciB0cmFuc2FjdGlvbnMgPSBhSXRlbS5nZXQoXCJ0cmFuc2FjdGlvbnNcIik7XG4gICAgdmFyIGlzQ29udmVydGVkU2hvd24gPSBmYWxzZTtcbiAgICB2YXIgdXNlVHJhbnNhY3Rpb25EYXRhID0gZmFsc2U7XG4gICAgdmFyIHByaWNlTGFiZWwgPSBcIlwiO1xuICAgIHZhciBleGNoYW5nZVJhdGU7XG4gICAgdmFyIHRyYW5zYWN0aW9uO1xuICAgIHZhciBmaW5hbFByaWNlO1xuICAgIHZhciBmaW5hbEN1cnJlbmN5O1xuXG4gICAgLy9YWFg6IGZvciBzb21lIGNvdW50cmllcywgd2UgZG9uJ3QgZ2V0IHRoZSB3YW50ZWQgY3VycmVueSBzeW1ib2wgZnJvbSB0aGUgR01FQiBvciBHTUVTIHJlc3BvbnNlLCBzbywgd2UgY2hhbmdlIGl0IG1hbnVhbGx5LlxuICAgIGNvbnZlcnRlZEN1cnJlbmN5ID0gVXRpbGl0eUhlbHBlci5jb252ZXJ0Q3VycmVuY3koY29udmVydGVkQ3VycmVuY3kpO1xuXG4gICAgLy8gaWYgdGhlIGl0ZW0gaGFzIGEgdHJhbnNhY3Rpb24sIHdlIHVzZSB0aGUgZmluYWwgc2FsZSBwcmljZS5cbiAgICBpZiAodHJhbnNhY3Rpb25zICYmIHRyYW5zYWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICB0cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uc1swXTtcblxuICAgICAgaWYgKHRyYW5zYWN0aW9uLmdldChcInRyYW5zYWN0aW9uUHJpY2VcIikgIT0gcHJpY2UpIHtcbiAgICAgICAgdXNlVHJhbnNhY3Rpb25EYXRhID0gdHJ1ZTtcbiAgICAgICAgdmFyIHRzQ3VycmVuY3kgPSB0cmFuc2FjdGlvbi5nZXQoXCJ0cmFuc2FjdGlvblByaWNlQ3VycmVuY3lcIik7XG4gICAgICAgIHZhciB0c1ByaWNlID0gdHJhbnNhY3Rpb24uZ2V0KFwidHJhbnNhY3Rpb25QcmljZVwiKTtcbiAgICAgICAgdmFyIHRzQ29udmVydGVkQ3VycmVuY3kgPSB0cmFuc2FjdGlvbi5nZXQoXCJjb252ZXJ0ZWRUcmFuc2FjdGlvblByaWNlQ3VycmVuY3lcIik7XG4gICAgICAgIHZhciB0c0NvbnZlcnRlZFByaWNlID0gdHJhbnNhY3Rpb24uZ2V0KFwiY29udmVydGVkVHJhbnNhY3Rpb25QcmljZVwiKTtcblxuICAgICAgICBpZiAodHNDdXJyZW5jeSAmJiB0c1ByaWNlKSB7XG4gICAgICAgICAgaWYgKHRzQ29udmVydGVkQ3VycmVuY3kgJiYgdHNDb252ZXJ0ZWRQcmljZSkge1xuICAgICAgICAgICAgZXhjaGFuZ2VSYXRlID0gVXRpbGl0eUhlbHBlci5nZXRFeGNoYW5nZVJhdGUodHNDb252ZXJ0ZWRQcmljZSwgdHNQcmljZSk7XG4gICAgICAgICAgICBpc0NvbnZlcnRlZFNob3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpbmFsUHJpY2UgPSB0c0NvbnZlcnRlZFByaWNlO1xuICAgICAgICAgICAgZmluYWxDdXJyZW5jeSA9IHRzQ29udmVydGVkQ3VycmVuY3k7XG4gICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW5jeSAmJiBjdXJyZW5jeS5sZW5ndGggPiAwICYmIHByaWNlID4gMCAmJlxuICAgICAgICAgICAgY29udmVydGVkQ3VycmVuY3kgJiYgY29udmVydGVkQ3VycmVuY3kubGVuZ3RoID4gMCAmJiBjb252ZXJ0ZWRQcmljZSA+IDApIHtcbiAgICAgICAgICAgIC8vIHNpbmNlIHRoZSB0cmFuc2FjdGlvbiBkb2Vzbid0IGhhdmUgY29udmVydGVkIGN1cnJlbmN5LiB3ZSBoYXZlIGEgbG9vayBhdCB0aGVcbiAgICAgICAgICAgIC8vIGN1cnJlbnQgcHJpY2UgYW5kIGN1cnJlbnlcbiAgICAgICAgICAgIGV4Y2hhbmdlUmF0ZSA9IFV0aWxpdHlIZWxwZXIuZ2V0RXhjaGFuZ2VSYXRlKGNvbnZlcnRlZFByaWNlLCBwcmljZSk7XG4gICAgICAgICAgICBpc0NvbnZlcnRlZFNob3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpbmFsUHJpY2UgPSB0c1ByaWNlICogZXhjaGFuZ2VSYXRlO1xuICAgICAgICAgICAgZmluYWxDdXJyZW5jeSA9IGNvbnZlcnRlZEN1cnJlbmN5O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaW5hbFByaWNlID0gdHNQcmljZTtcbiAgICAgICAgICAgIGZpbmFsQ3VycmVuY3kgPSB0c0N1cnJlbmN5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdXNlVHJhbnNhY3Rpb25EYXRhICYmIGN1cnJlbmN5ICYmIGN1cnJlbmN5Lmxlbmd0aCA+IDAgJiYgcHJpY2UgPiAwKSB7XG4gICAgICBpZiAoY29udmVydGVkQ3VycmVuY3kgJiYgY29udmVydGVkQ3VycmVuY3kubGVuZ3RoID4gMCAmJiBjb252ZXJ0ZWRQcmljZSA+IDApIHtcbiAgICAgICAgZXhjaGFuZ2VSYXRlID0gVXRpbGl0eUhlbHBlci5nZXRFeGNoYW5nZVJhdGUoY29udmVydGVkUHJpY2UsIHByaWNlKTtcbiAgICAgICAgaXNDb252ZXJ0ZWRTaG93biA9IHRydWU7XG4gICAgICAgIGZpbmFsUHJpY2UgPSBjb252ZXJ0ZWRQcmljZTtcbiAgICAgICAgZmluYWxDdXJyZW5jeSA9IGNvbnZlcnRlZEN1cnJlbmN5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmluYWxQcmljZSA9IHByaWNlO1xuICAgICAgICBmaW5hbEN1cnJlbmN5ID0gY3VycmVuY3k7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbmFsUHJpY2UgJiYgZmluYWxDdXJyZW5jeSkge1xuICAgICAgcHJpY2VMYWJlbCA9IFV0aWxpdHlIZWxwZXIuZm9ybWF0TnVtYmVyKGZpbmFsUHJpY2UsIDIpO1xuICAgICAgcHJpY2VMYWJlbCA9IFNpdGUuYWRkQ3VycmVuY3lTeW1ib2wocHJpY2VMYWJlbCwgZmluYWxDdXJyZW5jeSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgbGFiZWw6IFV0aWxpdHlIZWxwZXIuZXNjYXBlSHRtbChwcmljZUxhYmVsKSxcbiAgICAgICAgICAgICBjb252ZXJ0ZWRDdXJyZW5jeTogY29udmVydGVkQ3VycmVuY3ksXG4gICAgICAgICAgICAgaXNDb252ZXJ0ZWRTaG93bjogaXNDb252ZXJ0ZWRTaG93bixcbiAgICAgICAgICAgICBleGNoYW5nZVJhdGU6IGV4Y2hhbmdlUmF0ZSB9O1xuICB9LFxuXG4gIF9nZXRTaGlwcGluZ0luZm8gOiBmdW5jdGlvbihhSXRlbSwgYUV4dHJhSW5mbykge1xuICAgIFxuICAgIHZhciBzaGlwcGluZ1R5cGUgPSBhSXRlbS5nZXQoXCJzaGlwcGluZ1R5cGVcIik7XG4gICAgdmFyIGlzTG9jYWxQaWNrdXAgPSBhSXRlbS5nZXQoXCJpc0xvY2FsUGlja3VwXCIpO1xuICAgIHZhciBpc0NvbnZlcnRlZFNob3duID0gZmFsc2U7XG4gICAgdmFyIGl0ZW1TaGlwcGluZztcbiAgICB2YXIgc2hpcHBpbmdDb3N0O1xuICAgIHZhciBzaGlwcGluZ0luZm87XG5cbiAgICB2YXIgY2FsY3VsYXRlRm9yTGFiZWwgPSBmdW5jdGlvbihhU2hpcHBpbmdDb3N0LCBhQ3VycmVudEl0ZW0sIGFDdXJyZW50SW5mbykge1xuICAgICAgdmFyIGZpbmFsQ3VycmVuY3k7XG4gICAgICB2YXIgZmluYWxTaGlwcGluZ0Nvc3Q7XG4gICAgICB2YXIgbGFiZWw7XG4gICAgICB2YXIgaXNDb252ZXJ0ZWQgPSBmYWxzZTtcblxuICAgICAgaWYgKGFFeHRyYUluZm8gJiYgYUN1cnJlbnRJbmZvLmlzQ29udmVydGVkU2hvd24pIHtcbiAgICAgICAgZmluYWxDdXJyZW5jeSA9IGFDdXJyZW50SW5mby5jb252ZXJ0ZWRDdXJyZW5jeTtcbiAgICAgICAgZmluYWxTaGlwcGluZ0Nvc3QgPSBhU2hpcHBpbmdDb3N0ICogYUN1cnJlbnRJbmZvLmV4Y2hhbmdlUmF0ZTtcbiAgICAgICAgaXNDb252ZXJ0ZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmluYWxDdXJyZW5jeSA9IGFDdXJyZW50SXRlbS5nZXQoXCJjdXJyZW5jeVwiKTtcbiAgICAgICAgZmluYWxTaGlwcGluZ0Nvc3QgPSBhU2hpcHBpbmdDb3N0O1xuICAgICAgfVxuICAgICAgbGFiZWwgPSBVdGlsaXR5SGVscGVyLmZvcm1hdE51bWJlcihmaW5hbFNoaXBwaW5nQ29zdCwgMik7XG4gICAgICBsYWJlbCA9IFwiKyBcIiArIFNpdGUuYWRkQ3VycmVuY3lTeW1ib2wobGFiZWwsIGZpbmFsQ3VycmVuY3kpO1xuXG4gICAgICByZXR1cm4geyBsYWJlbDogbGFiZWwsIGlzQ29udmVydGVkU2hvd246IGlzQ29udmVydGVkIH07XG4gICAgfTtcblxuICAgIGlmIChpc0xvY2FsUGlja3VwKSB7XG4gICAgICBpdGVtU2hpcHBpbmcgPSAkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zaGlwcGluZ1R5cGUucGlja3VwXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHNoaXBwaW5nVHlwZSkge1xuICAgICAgICBjYXNlIEl0ZW0uU0hJUFBJTkcuU0hJUFBJTkdfVFlQRV9DQUxDVUxBVEVEOlxuICAgICAgICBjYXNlIEl0ZW0uU0hJUFBJTkcuU0hJUFBJTkdfVFlQRV9DQUxDVUxBVEVEX0RPTUVTVElDOlxuICAgICAgICAgIHNoaXBwaW5nQ29zdCA9IGFJdGVtLmdldChcInNoaXBwaW5nQ29zdFwiKTtcbiAgICAgICAgICBpZiAoc2hpcHBpbmdDb3N0ID09PSAwKSB7XG4gICAgICAgICAgICBpdGVtU2hpcHBpbmcgPSAkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zaGlwcGluZ1R5cGUuY2FsY3VsYXRlZFwiKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNoaXBwaW5nQ29zdCkge1xuICAgICAgICAgICAgc2hpcHBpbmdJbmZvID0gY2FsY3VsYXRlRm9yTGFiZWwoc2hpcHBpbmdDb3N0LCBhSXRlbSwgYUV4dHJhSW5mbyk7XG4gICAgICAgICAgICBpdGVtU2hpcHBpbmcgPSBzaGlwcGluZ0luZm8ubGFiZWw7XG4gICAgICAgICAgICBpc0NvbnZlcnRlZFNob3duID0gc2hpcHBpbmdJbmZvLmlzQ29udmVydGVkU2hvd247XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEl0ZW0uU0hJUFBJTkcuU0hJUFBJTkdfVFlQRV9GTEFUOlxuICAgICAgICBjYXNlIEl0ZW0uU0hJUFBJTkcuU0hJUFBJTkdfVFlQRV9GTEFUX0RPTUVTVElDOlxuICAgICAgICAgIHNoaXBwaW5nQ29zdCA9IGFJdGVtLmdldChcInNoaXBwaW5nQ29zdFwiKTtcbiAgICAgICAgICBpZiAoc2hpcHBpbmdDb3N0ID09PSAwKSB7XG4gICAgICAgICAgICBpdGVtU2hpcHBpbmcgPSAkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zaGlwcGluZ1R5cGUuZnJlZVwiKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNoaXBwaW5nQ29zdCkge1xuICAgICAgICAgICAgc2hpcHBpbmdJbmZvID0gY2FsY3VsYXRlRm9yTGFiZWwoc2hpcHBpbmdDb3N0LCBhSXRlbSwgYUV4dHJhSW5mbyk7XG4gICAgICAgICAgICBpdGVtU2hpcHBpbmcgPSBzaGlwcGluZ0luZm8ubGFiZWw7XG4gICAgICAgICAgICBpc0NvbnZlcnRlZFNob3duID0gc2hpcHBpbmdJbmZvLmlzQ29udmVydGVkU2hvd247XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEl0ZW0uU0hJUFBJTkcuU0hJUFBJTkdfVFlQRV9GUkVFOlxuICAgICAgICAgIGl0ZW1TaGlwcGluZyA9ICQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnNoaXBwaW5nVHlwZS5mcmVlXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEl0ZW0uU0hJUFBJTkcuU0hJUFBJTkdfVFlQRV9VTlNQRUNJRklFRDpcbiAgICAgICAgICBpdGVtU2hpcHBpbmcgPSAkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zaGlwcGluZ1R5cGUudW5zcGVjaWZpZWRcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgSXRlbS5TSElQUElORy5TSElQUElOR19UWVBFX0ZSRUlHSFQ6XG4gICAgICAgIGNhc2UgSXRlbS5TSElQUElORy5TSElQUElOR19UWVBFX0ZSRUlHSFRfRkxBVDpcbiAgICAgICAgICBpdGVtU2hpcHBpbmcgPSAkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zaGlwcGluZ1R5cGUuZnJlaWdodFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpdGVtU2hpcHBpbmcgPSAkLmkxOG4uZ2V0U3RyaW5nKFwiaXRlbS5zaGlwcGluZ1R5cGUudmlld1wiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBsYWJlbDogaXRlbVNoaXBwaW5nLCBpc0NvbnZlcnRlZFNob3duOiBpc0NvbnZlcnRlZFNob3duIH07XG4gIH0sXG5cbiAgX2dldEVuZFRpbWUgOiBmdW5jdGlvbihhSXRlbSkge1xuICAgIFxuICAgIHZhciBlbmREYXRlID0gTnVtYmVyKGFJdGVtLmdldChcImVuZFRpbWVcIikpO1xuICAgIHZhciBkYXRlRm9ybWF0ID0gJC5pMThuLmdldFN0cmluZyhcIml0ZW0uZW5kRGF0ZS5lbmRlZFwiKTtcblxuICAgIHJldHVybiBVdGlsaXR5SGVscGVyLmZvcm1hdERhdGUoZW5kRGF0ZSwgZGF0ZUZvcm1hdCk7XG4gIH0sXG5cbiAgX2dldFNjaGVkdWxlZFRpbWUgOiBmdW5jdGlvbihhSXRlbSkge1xuICAgIFxuICAgIHZhciBzdGFydERhdGUgPSBOdW1iZXIoYUl0ZW0uZ2V0KFwic3RhcnRUaW1lXCIpKTtcbiAgICB2YXIgZGF0ZUZvcm1hdCA9ICQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnN0YXJ0RGF0ZS5zY2hlZHVsZWQuZGF0ZVwiKTtcbiAgICB2YXIgdGltZUZvcm1hdCA9ICQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnN0YXJ0RGF0ZS5zY2hlZHVsZWQudGltZVwiKTtcblxuICAgIHZhciBsYW5nID0gVXRpbGl0eUhlbHBlci5nZXRCcm93c2VyTGFuZ3VhZ2UoKS5zdWJzdHJpbmcoMCwgMik7XG4gICAgdmFyIGRpc3BsYXlUd2VsZXZlSG91cnMgPSBmYWxzZTtcbiAgICBpZiAoW1wiZW4tR0JcIiwgXCJlbi1VU1wiLCBcImVzLTQxOVwiLCBcImVzLVhMXCIsIFwiZXMtQ09cIl0uaW5kZXhPZihsYW5nKSAhPSAtMSkge1xuICAgICAgZGlzcGxheVR3ZWxldmVIb3VycyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtVdGlsaXR5SGVscGVyLmZvcm1hdERhdGUoc3RhcnREYXRlLCBkYXRlRm9ybWF0KSxcbiAgICAgICAgICAgIFV0aWxpdHlIZWxwZXIuZm9ybWF0RGF0ZShzdGFydERhdGUsIHRpbWVGb3JtYXQsIGRpc3BsYXlUd2VsZXZlSG91cnMpXTtcbiAgfSxcblxuICBfZ2V0VHJhbnNhY3Rpb25UaW1lIDogZnVuY3Rpb24oYUl0ZW0pIHtcbiAgICBcbiAgICB2YXIgdHJhbnNhY3Rpb25zID0gYUl0ZW0uZ2V0KFwidHJhbnNhY3Rpb25zXCIpO1xuXG4gICAgLy8gaWYgdGhlIGl0ZW0gaGFzIGEgdHJhbnNhY3Rpb24sIHVzZSB0aGUgY3JlYXRlIHRpbWUgb2YgdGhlIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbnMgJiYgdHJhbnNhY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB0cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uc1swXTtcbiAgICAgIHZhciBlbmREYXRlID0gTnVtYmVyKHRyYW5zYWN0aW9uLmdldChcImNyZWF0aW9uVGltZVwiKSk7XG4gICAgICB2YXIgZGF0ZUZvcm1hdCA9ICQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLmVuZERhdGUuZW5kZWRcIik7XG5cbiAgICAgIHJldHVybiBVdGlsaXR5SGVscGVyLmZvcm1hdERhdGUoZW5kRGF0ZSwgZGF0ZUZvcm1hdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRFbmRUaW1lKGFJdGVtKTtcbiAgICB9XG4gIH0sXG5cbiAgX2dldFRvdGFsVHJhbnNhY3Rpb25RdWFudGl0eSA6IGZ1bmN0aW9uKGFJdGVtKSB7XG4gICAgXG4gICAgdmFyIHRyYW5zYWN0aW9ucyA9IGFJdGVtLmdldChcInRyYW5zYWN0aW9uc1wiKTtcbiAgICB2YXIgcXVhbnRpdHkgPSAwO1xuXG4gICAgaWYgKHRyYW5zYWN0aW9ucykge1xuICAgICAgdmFyIGxlbiA9IHRyYW5zYWN0aW9ucy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHF1YW50aXR5ICs9IHRyYW5zYWN0aW9uc1tpXS5nZXQoXCJxdWFudGl0eVB1cmNoYXNlZFwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcXVhbnRpdHk7XG4gIH0sXG5cbiAgX2dldFRpbWVMZWZ0SW5mbyA6IGZ1bmN0aW9uKGFJdGVtKSB7XG4gICAgXG4gICAgdmFyIHRpbWVMYWJlbCA9IFwiXCI7XG4gICAgdmFyIGVuZFNvb24gPSBmYWxzZTtcbiAgICB2YXIgaXNFbmRlZCA9IGZhbHNlO1xuXG4gICAgaWYgKGFJdGVtICYmICFhSXRlbS5pc0VuZGVkKCkpIHtcbiAgICAgIHZhciBlbmRUaW1lID0gYUl0ZW0uZ2V0KFwiZW5kVGltZVwiKTtcbiAgICAgIHZhciB0aW1lTGVmdDtcblxuICAgICAgaWYgKGVuZFRpbWUpIHtcbiAgICAgICAgdmFyIGViYXlUaW1lID0gQ29tbW9uU2VydmljZS5nZXRlQmF5VGltZSgpLmdldFRpbWUoKTtcbiAgICAgICAgdGltZUxlZnQgPSBNYXRoLm1heCgwLCBlbmRUaW1lIC0gZWJheVRpbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxhc3RUaW1lc3RhbXAgPSBNeUViYXlTZXJ2aWNlLmxhc3RTZWxsaW5nQ2FsbFRpbWVzdGFtcDtcbiAgICAgICAgdmFyIHRpbWVEaWZmID0gMDtcbiAgICAgICAgdmFyIHRpbWU7XG5cbiAgICAgICAgaWYgKGxhc3RUaW1lc3RhbXApIHtcbiAgICAgICAgICB0aW1lRGlmZiA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSBsYXN0VGltZXN0YW1wO1xuICAgICAgICB9XG4gICAgICAgIHRpbWUgPSBVdGlsaXR5SGVscGVyLmlzbzg2MDFEdXJhdGlvblRvTWlsbGlzZWNvbmRzKGFJdGVtLmdldChcInRpbWVMZWZ0XCIpKTtcbiAgICAgICAgdGltZUxlZnQgPSBNYXRoLm1heCgwLCB0aW1lIC0gdGltZURpZmYpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZUxlZnQgPCAxMDAwKSB7XG4gICAgICAgIHRpbWVMYWJlbCA9ICQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnRpbWVsZWZ0LmVuZGVkLmxhYmVsXCIpO1xuICAgICAgICBpc0VuZGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKENvbmZpZ3MuQlJPV1NFUiAhPT0gXCJjclwiKSB7XG4gICAgICAgICAgT2JzZXJ2ZXJIZWxwZXIubm90aWZ5KFRvcGljcy5JVEVNX0VOREVELCBhSXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aW1lTGVmdCA8IDg2NDAwMDAwKSB7IC8vIGxlc3MgdGhhbiAyNCBob3Vyc1xuICAgICAgICAgIGVuZFNvb24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRpbWVMYWJlbCA9IFV0aWxpdHlIZWxwZXIudGltZUxlZnRBc1N0cmluZyh0aW1lTGVmdCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbWVMYWJlbCA9ICQuaTE4bi5nZXRTdHJpbmcoXCJpdGVtLnRpbWVsZWZ0LmVuZGVkLmxhYmVsXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGxhYmVsOiB0aW1lTGFiZWwsIGVuZFNvb246IGVuZFNvb24sIGlzRW5kZWQ6IGlzRW5kZWQgfTtcbiAgfSxcblxuICBfZ2V0QmlkcyA6IGZ1bmN0aW9uKGFJdGVtLCBhSWdub3JlWmVybykge1xuICAgIFxuICAgIHZhciBsaXN0aW5nRm9ybWF0ID0gYUl0ZW0uZ2V0KFwibGlzdGluZ0Zvcm1hdFwiKTtcbiAgICB2YXIgYmlkc0xhYmVsO1xuICAgIC8vIHRoaXMgaXMgYSBCSU4gaXRlbSBhbmQgY2xhc3NpZmllZCBhZFxuICAgIGlmIChJdGVtLkxJU1RJTkdfRk9STUFUUy5TVE9SRV9GSVhFRCA9PSBsaXN0aW5nRm9ybWF0IHx8XG4gICAgICAgIEl0ZW0uTElTVElOR19GT1JNQVRTLkZJWEVEID09IGxpc3RpbmdGb3JtYXQgfHxcbiAgICAgICAgSXRlbS5MSVNUSU5HX0ZPUk1BVFMuQ0xBU1NJRklFRCA9PSBsaXN0aW5nRm9ybWF0IHx8XG4gICAgICAgIEl0ZW0uTElTVElOR19GT1JNQVRTLkxFQURfR0VORVJBVElPTiA9PSBsaXN0aW5nRm9ybWF0KSB7XG4gICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGRpc3BsYXkgdGhpcyBcIkJ1eSBpdCBub3dcIiBsYWJlbCBiZWNhdXNlXG4gICAgICAvLyBpdGVtIGJ1dHRvbiBkb2VzIGl0IHRvbyFcbiAgICAgIGJpZHNMYWJlbCA9IFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRoaXMgaXMgYSBiaWQgaXRlbVxuICAgICAgdmFyIG51bUJpZHMgPSBhSXRlbS5nZXQoXCJudW1CaWRzXCIpO1xuICAgICAgaWYgKCFudW1CaWRzKSB7XG4gICAgICAgIG51bUJpZHMgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKGFJZ25vcmVaZXJvICYmIG51bUJpZHMgPT09IDApIHtcbiAgICAgICAgYmlkc0xhYmVsID0gXCJcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJpZHNMYWJlbCA9XG4gICAgICAgICAgJC5pMThuLmdldFN0cmluZyhcbiAgICAgICAgICAgIChudW1CaWRzID09PSAwID8gXCJpdGVtLmhpc3RvcnkuYmlkLnplcm9cIiA6XG4gICAgICAgICAgICBudW1CaWRzID09IDEgPyBcIml0ZW0uaGlzdG9yeS5iaWRcIiA6IFwiaXRlbS5oaXN0b3J5LmJpZC5wbHVyYWxcIiksIFtudW1CaWRzXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFV0aWxpdHlIZWxwZXIuZXNjYXBlSHRtbChiaWRzTGFiZWwpO1xuICB9LFxuXG4gIF9nZXRXYXRjaGVycyA6IGZ1bmN0aW9uKGFJdGVtKSB7XG4gICAgXG4gICAgdmFyIHdhdGNoQ291bnQgPSBhSXRlbS5nZXQoXCJudW1XYXRjaGluZ1wiKTtcbiAgICB2YXIgd2F0Y2hTdHJpbmdLZXkgPVxuICAgICAgKHdhdGNoQ291bnQgPT09IDAgPyBcIml0ZW0uaGlzdG9yeS53YXRjaGVyLnplcm9cIiA6XG4gICAgICAgIHdhdGNoQ291bnQgPT0gMSA/IFwiaXRlbS5oaXN0b3J5LndhdGNoZXJcIiA6XG4gICAgICAgICBcIml0ZW0uaGlzdG9yeS53YXRjaGVyLnBsdXJhbFwiKTtcblxuICAgIHJldHVybiAkLmkxOG4uZ2V0U3RyaW5nKHdhdGNoU3RyaW5nS2V5LCBbd2F0Y2hDb3VudF0pO1xuICB9LFxuXG4gIF9nZXRCdXllciA6IGZ1bmN0aW9uKGFJdGVtKSB7XG4gICAgXG4gICAgdmFyIHRyYW5zYWN0aW9ucyA9IGFJdGVtLmdldChcInRyYW5zYWN0aW9uc1wiKTtcbiAgICB2YXIgYnV5ZXIgPSBcIlwiO1xuXG4gICAgaWYgKHRyYW5zYWN0aW9ucyAmJiB0cmFuc2FjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgYnV5ZXIgPSB0cmFuc2FjdGlvbnNbMF0uZ2V0KFwiYnV5ZXJVc2VySWRcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1eWVyO1xuICB9LFxuXG4gIHVwZGF0ZVRpbWVMZWZ0IDogZnVuY3Rpb24oYUJveCkge1xuICAgIFxuICAgIHZhciBpdGVtT2JqZWN0ID0gYUJveC5kYXRhKFwiaXRlbU9iamVjdFwiKTtcbiAgICB2YXIgaXRlbVRpbWUgPSBhQm94LmZpbmQoXCIuaXRlbS10aW1lXCIpO1xuICAgIHZhciB0aW1lTGVmdCA9IHRoaXMuX2dldFRpbWVMZWZ0SW5mbyhpdGVtT2JqZWN0KTtcblxuICAgIGlmICh0aW1lTGVmdC5lbmRTb29uKSB7XG4gICAgICBpZiAoIWl0ZW1UaW1lLmhhc0NsYXNzKFwiZW5kU29vblwiKSkge1xuICAgICAgICBpdGVtVGltZS5hZGRDbGFzcyhcImVuZFNvb25cIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZW1UaW1lLnJlbW92ZUNsYXNzKFwiZW5kU29vblwiKTtcbiAgICB9XG4gICAgaXRlbVRpbWUudGV4dCh0aW1lTGVmdC5sYWJlbCk7XG4gIH1cbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkgeyBJdGVtQm94LmluaXQoKTsgfSk7XG4iXX0=