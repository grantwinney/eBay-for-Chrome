/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var PanelNotification = {
    _SHOW_DEALS_DELAY: 5000,
    _paginationMoveToTop: false,
    init: function () {
        $("[rel^=i18n],[alt^=i18n]").i18n({ attributeNames: ["alt"] });
        Sidebar.updateTooltips();
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
        ObserverHelper.addObserver(this, Topics.SYMBAN_DATA_UPDATING);
        ObserverHelper.addObserver(this, Topics.SYMBAN_DATA_UPDATED);
        this._addEventListeners();
        if (Account.getAccount()) {
            this.populateNotificationData();
            this._startDataUpdate();
        }
    },
    uninit: function () {
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_OUT);
        ObserverHelper.removeObserver(this, Topics.SYMBAN_DATA_UPDATING);
        ObserverHelper.removeObserver(this, Topics.SYMBAN_DATA_UPDATED);
    },
    _addEventListeners: function () {
        $("#panel-notification-deals-link").click(function (aEvent) {
            EventAnalytics.push({
                key: "SignedInExit",
                action: "ClickEmptyPanel",
                label: "NotificationsEmpty"
            });
            if (Site.siteHasDeals() || !Site.isSupportedSite()) {
                var domain = Site.getDealsDomain();
                var params = { dealsDomain: "deals", domain: domain };
                RoverUrlHelper.loadPage("viewDeals", "dealClick", params, aEvent);
            }
            else {
                RoverUrlHelper.loadPage("homePage", "dealClick", null, aEvent);
            }
        }.bind(this));
    },
    populateNotificationData: function () {
        var symbanData = SymbanService.userData;
        Sidebar.showLoading("notification");
        this._setNotificationsBadge(symbanData.badgeCount);
        if (symbanData.loaded) {
            this._setNotificationsPanel(symbanData.notifications, symbanData.prev, symbanData.next);
        }
    },
    _showDeals: function () {
        setTimeout(function () {
            $("#panel-notification-empty-inner").fadeOut("fast", function () {
                $("#panel-notification-deals").fadeIn("fast");
            });
        }.bind(this), this._SHOW_DEALS_DELAY);
    },
    _createNotificationBoxes: function (aNotifications, aPrevPath, aNextPath) {
        var that = this;
        var content = $(".panel-notification-main-content");
        content.empty();
        $.each(aNotifications, function (aIndex, aNotification) {
            content.append(NotificationItemBox.createNotificationItemBox(aNotification));
        });
        if (this._paginationMoveToTop) {
            Sidebar.scrollToTop("panels");
            this._paginationMoveToTop = false;
        }
        if (aPrevPath || aNextPath) {
            var paginationBox = $("<div>").addClass("notification-pagination-box");
            var button;
            if (aPrevPath) {
                button =
                    $("<button>").attr({
                        "class": "image-button notification-pagination-prev",
                        "title": "<"
                    }).click(function (aEvent) {
                        that._paginationMoveToTop = true;
                        var apiPath = $(aEvent.target).data("notificationApiPath");
                        SymbanService.getSymbanData(apiPath);
                    });
                button.data("notificationApiPath", aPrevPath);
                paginationBox.append(button);
            }
            if (aNextPath) {
                button =
                    $("<button>").attr({
                        "class": "image-button notification-pagination-next",
                        "title": ">"
                    }).click(function (aEvent) {
                        that._paginationMoveToTop = true;
                        var apiPath = $(aEvent.target).data("notificationApiPath");
                        SymbanService.getSymbanData(apiPath);
                    });
                button.data("notificationApiPath", aNextPath);
                paginationBox.append(button);
            }
            content.append(paginationBox);
        }
        Sidebar.adjustTabIndex();
        Sidebar.removeTabIndex();
        if ("Window" == UtilityHelper.getClient().os) {
            $(".notification-item-close-button").focus(function (aEvent) {
                var element = $(aEvent.target);
                var parents = element.parents("a");
                if (0 < parents.length) {
                    $(parents[0]).attr("tabindex", "-1");
                }
            });
        }
    },
    _setNotificationsBadge: function (aBadgeCount) {
        if ("undefined" != typeof (aBadgeCount) && parseInt(aBadgeCount) > 0) {
            $(".badge").css("display", "inline-block");
            if (parseInt(aBadgeCount) >
                PropertyDAO.get(PropertyDAO.PROP_NOTIFICATIONS_LIMIT_ON_UI)) {
                if (false === $(".badge").hasClass("badge-more-chars")) {
                    $(".badge").addClass("badge-more-chars");
                }
                aBadgeCount = PropertyDAO.get(PropertyDAO.PROP_NOTIFICATIONS_LIMIT_ON_UI).toString() + "+";
            }
            else {
                $(".badge").removeClass("badge-more-chars");
            }
            $(".badge").text(aBadgeCount);
        }
        else {
            $(".badge").hide();
        }
    },
    _setNotificationsPanel: function (aNotifications, aPrevPath, aNextPath) {
        if ("undefined" != typeof (aNotifications) && Object.keys(aNotifications).length > 0) {
            this._createNotificationBoxes(aNotifications, aPrevPath, aNextPath);
            $("#panel-notification-empty").css("display", "none");
            $("#panel-notification-main").css("display", "block");
            $("[title^=i18n]").i18n({ attributeNames: ["title"] });
            Sidebar.updateTooltips();
        }
        else {
            if (SymbanService.isUpdatingData) {
                $("#panel-notification-main").css("display", "none");
                $("#panel-notification-empty").css("display", "none");
            }
            else {
                $("#panel-notification-main").css("display", "none");
                setTimeout(function () {
                    PanelNotification._showDeals();
                    $("#panel-notification-empty").css("display", "block");
                }, 200, false);
            }
        }
    },
    apiHasItems: function () {
        var apiHasItems = false;
        var notifications = SymbanService.userData.notifications;
        if (notifications && Object.keys(notifications).length > 0) {
            apiHasItems = true;
        }
        return apiHasItems;
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
        $(".panel-notification-main-content").children("a").each(function () {
            NotificationItemBox.updateTimeLeft($(this));
        });
    },
    observe: function (aTopic, aData) {
        switch (aTopic) {
            case Topics.ACCOUNT_SIGNED_IN:
                this._startDataUpdate();
                break;
            case Topics.ACCOUNT_SIGNED_OUT:
                this._stopDataUpdate();
                break;
            case Topics.SYMBAN_DATA_UPDATED:
                this.populateNotificationData();
                break;
            case Topics.SYMBAN_DATA_UPDATING:
                Sidebar.showLoading("notification");
                break;
        }
    }
};
$(window).unload(function () { PanelNotification.uninit(); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWxOb3RpZmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi91aS92aWV3L2NvcmUvcGFuZWxOb3RpZmljYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxJQUFJLGlCQUFpQixHQUFHO0lBRXRCLGlCQUFpQixFQUFHLElBQUk7SUFDeEIsb0JBQW9CLEVBQUcsS0FBSztJQUU1QixJQUFJLEVBQUc7UUFDTCxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBRSxLQUFLLENBQUUsRUFBRSxDQUFDLENBQUM7UUFDakUsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXpCLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNELGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzVELGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlELGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTdELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLEVBQUc7UUFDUCxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5RCxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFN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SyxDQUFDO1lBQ1IsS0FBSyxNQUFNLENBQUMsb0JBQW9CO2dCQUM5QixPQUFPLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNwQyxLQUFLLENBQUM7UUFDVixDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUM7QUFFRixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWEsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQ29weXJpZ2h0IChDKSAyMDA3LTIwMTUgZUJheSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKi9cblxudmFyIFBhbmVsTm90aWZpY2F0aW9uID0ge1xuXG4gIF9TSE9XX0RFQUxTX0RFTEFZIDogNTAwMCxcbiAgX3BhZ2luYXRpb25Nb3ZlVG9Ub3AgOiBmYWxzZSxcblxuICBpbml0IDogZnVuY3Rpb24oKSB7XG4gICAgJChcIltyZWxePWkxOG5dLFthbHRePWkxOG5dXCIpLmkxOG4oeyBhdHRyaWJ1dGVOYW1lczogWyBcImFsdFwiIF0gfSk7XG4gICAgU2lkZWJhci51cGRhdGVUb29sdGlwcygpO1xuXG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX0lOKTtcbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUKTtcbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuU1lNQkFOX0RBVEFfVVBEQVRJTkcpO1xuICAgIE9ic2VydmVySGVscGVyLmFkZE9ic2VydmVyKHRoaXMsIFRvcGljcy5TWU1CQU5fREFUQV9VUERBVEVEKTtcblxuICAgIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgaWYgKEFjY291bnQuZ2V0QWNjb3VudCgpKSB7XG4gICAgICB0aGlzLnBvcHVsYXRlTm90aWZpY2F0aW9uRGF0YSgpO1xuICAgICAgdGhpcy5fc3RhcnREYXRhVXBkYXRlKCk7XG4gICAgfVxuICB9LFxuXG4gIHVuaW5pdCA6IGZ1bmN0aW9uKCkge1xuICAgIE9ic2VydmVySGVscGVyLnJlbW92ZU9ic2VydmVyKHRoaXMsIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTik7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLlNZTUJBTl9EQVRBX1VQREFUSU5HKTtcbiAgICBPYnNlcnZlckhlbHBlci5yZW1vdmVPYnNlcnZlcih0aGlzLCBUb3BpY3MuU1lNQkFOX0RBVEFfVVBEQVRFRCk7XG4gIH0sXG5cbiAgX2FkZEV2ZW50TGlzdGVuZXJzIDogZnVuY3Rpb24oKSB7XG4gICAkKFwiI3BhbmVsLW5vdGlmaWNhdGlvbi1kZWFscy1saW5rXCIpLmNsaWNrKGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgRXZlbnRBbmFseXRpY3MucHVzaCh7XG4gICAgICAgIGtleTogXCJTaWduZWRJbkV4aXRcIixcbiAgICAgICAgYWN0aW9uOiBcIkNsaWNrRW1wdHlQYW5lbFwiLFxuICAgICAgICBsYWJlbDogXCJOb3RpZmljYXRpb25zRW1wdHlcIlxuICAgICAgfSk7XG5cbiAgICAgaWYgKFNpdGUuc2l0ZUhhc0RlYWxzKCkgfHwgIVNpdGUuaXNTdXBwb3J0ZWRTaXRlKCkpIHtcbiAgICAgIHZhciBkb21haW4gPSBTaXRlLmdldERlYWxzRG9tYWluKCk7XG4gICAgICB2YXIgcGFyYW1zID0geyBkZWFsc0RvbWFpbjogXCJkZWFsc1wiLCBkb21haW46IGRvbWFpbiB9O1xuICAgICAgUm92ZXJVcmxIZWxwZXIubG9hZFBhZ2UoXG4gICAgICAgIFwidmlld0RlYWxzXCIsIFwiZGVhbENsaWNrXCIsIHBhcmFtcywgYUV2ZW50KTtcbiAgICAgfSBlbHNlIHtcbiAgICAgIFJvdmVyVXJsSGVscGVyLmxvYWRQYWdlKFxuICAgICAgXCJob21lUGFnZVwiLCBcImRlYWxDbGlja1wiLCBudWxsLCBhRXZlbnQpO1xuICAgICB9XG5cbiAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgcG9wdWxhdGVOb3RpZmljYXRpb25EYXRhIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN5bWJhbkRhdGEgPSBTeW1iYW5TZXJ2aWNlLnVzZXJEYXRhO1xuXG4gICAgU2lkZWJhci5zaG93TG9hZGluZyhcIm5vdGlmaWNhdGlvblwiKTtcbiAgICB0aGlzLl9zZXROb3RpZmljYXRpb25zQmFkZ2Uoc3ltYmFuRGF0YS5iYWRnZUNvdW50KTtcbiAgICBpZiAoc3ltYmFuRGF0YS5sb2FkZWQpIHtcbiAgICAgIHRoaXMuX3NldE5vdGlmaWNhdGlvbnNQYW5lbChzeW1iYW5EYXRhLm5vdGlmaWNhdGlvbnMsIHN5bWJhbkRhdGEucHJldiwgc3ltYmFuRGF0YS5uZXh0KTtcbiAgICB9XG4gIH0sXG5cbiAgX3Nob3dEZWFscyA6IGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkKFwiI3BhbmVsLW5vdGlmaWNhdGlvbi1lbXB0eS1pbm5lclwiKS5mYWRlT3V0KFwiZmFzdFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIiNwYW5lbC1ub3RpZmljYXRpb24tZGVhbHNcIikuZmFkZUluKFwiZmFzdFwiKTtcbiAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKSwgdGhpcy5fU0hPV19ERUFMU19ERUxBWSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgSFRNTCBib3hlcyBmcm9tIGEgbm90aWZpY2F0aW9ucyBhcnJheSBjb21pbmcgZnJvbSBhIHJlcXVlc3QgY2FsbFxuICAgKiB0byB0aGUgU3ltYmFuIEFwaS5cbiAgICogQHBhcmFtIGFOb3RpZmljYXRpb25zIGEgSlNPTiBvYmplY3Qgd2l0aCB0aGUgbm90aWZpY2F0aW9ucyBmb3IgdGhlIHVzZXIuXG4gICAqIEBwYXJhbSBhUHJldlBhdGggdGhlIHByZXYgcGF0aFxuICAgKiBAcGFyYW0gYU5leHRQYXRoIHRoZSBuZXh0IHBhdGhcbiAgICovXG4gIF9jcmVhdGVOb3RpZmljYXRpb25Cb3hlcyA6IGZ1bmN0aW9uKGFOb3RpZmljYXRpb25zLCBhUHJldlBhdGgsIGFOZXh0UGF0aCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgY29udGVudCA9ICAkKFwiLnBhbmVsLW5vdGlmaWNhdGlvbi1tYWluLWNvbnRlbnRcIik7XG5cbiAgICBjb250ZW50LmVtcHR5KCk7XG5cbiAgICAkLmVhY2goYU5vdGlmaWNhdGlvbnMsIGZ1bmN0aW9uKGFJbmRleCwgYU5vdGlmaWNhdGlvbikge1xuICAgICAgY29udGVudC5hcHBlbmQoTm90aWZpY2F0aW9uSXRlbUJveC5jcmVhdGVOb3RpZmljYXRpb25JdGVtQm94KGFOb3RpZmljYXRpb24pKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLl9wYWdpbmF0aW9uTW92ZVRvVG9wKSB7XG4gICAgICBTaWRlYmFyLnNjcm9sbFRvVG9wKFwicGFuZWxzXCIpO1xuICAgICAgdGhpcy5fcGFnaW5hdGlvbk1vdmVUb1RvcCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChhUHJldlBhdGggfHwgYU5leHRQYXRoKSB7XG4gICAgICB2YXIgcGFnaW5hdGlvbkJveCA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcIm5vdGlmaWNhdGlvbi1wYWdpbmF0aW9uLWJveFwiKTtcbiAgICAgIHZhciBidXR0b247XG5cbiAgICAgIGlmIChhUHJldlBhdGgpIHtcbiAgICAgICAgYnV0dG9uID1cbiAgICAgICAgICAkKFwiPGJ1dHRvbj5cIikuYXR0cih7XG4gICAgICAgICAgICBcImNsYXNzXCI6IFwiaW1hZ2UtYnV0dG9uIG5vdGlmaWNhdGlvbi1wYWdpbmF0aW9uLXByZXZcIixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCI8XCJcbiAgICAgICAgICB9KS5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgICAgICAgIHRoYXQuX3BhZ2luYXRpb25Nb3ZlVG9Ub3AgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIGFwaVBhdGggPSAkKGFFdmVudC50YXJnZXQpLmRhdGEoXCJub3RpZmljYXRpb25BcGlQYXRoXCIpO1xuICAgICAgICAgICAgU3ltYmFuU2VydmljZS5nZXRTeW1iYW5EYXRhKGFwaVBhdGgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBidXR0b24uZGF0YShcIm5vdGlmaWNhdGlvbkFwaVBhdGhcIiwgYVByZXZQYXRoKTtcbiAgICAgICAgcGFnaW5hdGlvbkJveC5hcHBlbmQoYnV0dG9uKTtcbiAgICAgIH1cbiAgICAgIGlmIChhTmV4dFBhdGgpIHtcbiAgICAgICAgYnV0dG9uID1cbiAgICAgICAgICAkKFwiPGJ1dHRvbj5cIikuYXR0cih7XG4gICAgICAgICAgICBcImNsYXNzXCI6IFwiaW1hZ2UtYnV0dG9uIG5vdGlmaWNhdGlvbi1wYWdpbmF0aW9uLW5leHRcIixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCI+XCJcbiAgICAgICAgICB9KS5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgICAgICAgIHRoYXQuX3BhZ2luYXRpb25Nb3ZlVG9Ub3AgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIGFwaVBhdGggPSAkKGFFdmVudC50YXJnZXQpLmRhdGEoXCJub3RpZmljYXRpb25BcGlQYXRoXCIpO1xuICAgICAgICAgICAgU3ltYmFuU2VydmljZS5nZXRTeW1iYW5EYXRhKGFwaVBhdGgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBidXR0b24uZGF0YShcIm5vdGlmaWNhdGlvbkFwaVBhdGhcIiwgYU5leHRQYXRoKTtcbiAgICAgICAgcGFnaW5hdGlvbkJveC5hcHBlbmQoYnV0dG9uKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQuYXBwZW5kKHBhZ2luYXRpb25Cb3gpO1xuICAgIH1cbiAgICBTaWRlYmFyLmFkanVzdFRhYkluZGV4KCk7XG4gICAgU2lkZWJhci5yZW1vdmVUYWJJbmRleCgpO1xuXG4gICAgLy9PbiBXaW5kb3dzLCB0aGUgdGFiIGZ1bmN0aW9ucyBkaWZmZXJlbnQgdGhhbiBPU1guIFdlIHdvdWxkIG5lZWQgdG8gcmVtb3ZlIHRoZSB0YWJpbmRleCBpbiB0aGUgcGFyZW50IDxhPiBub2RlLCBzbyB0aGVcbiAgICAvL2N1cnNvciBkb2Vzbid0IGdldCBzdHVjayBvbiB0aGUgWCBlbGVtZW50IHRvIGRlbGV0ZSBhIE5vdGlmaWNhdGlvbi5cbiAgICBpZiAoXCJXaW5kb3dcIiA9PSBVdGlsaXR5SGVscGVyLmdldENsaWVudCgpLm9zKSB7XG4gICAgICAkKFwiLm5vdGlmaWNhdGlvbi1pdGVtLWNsb3NlLWJ1dHRvblwiKS5mb2N1cyhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSAkKGFFdmVudC50YXJnZXQpO1xuICAgICAgICB2YXIgcGFyZW50cyA9IGVsZW1lbnQucGFyZW50cyhcImFcIik7XG4gICAgICAgIGlmICgwIDwgcGFyZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAkKHBhcmVudHNbMF0pLmF0dHIoXCJ0YWJpbmRleFwiLCBcIi0xXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIG5vdGlmaWNhdGlvbnMgYmFkZ2Ugb24gdGhlIE5vdGlmaWNhdGlvbnMgdGFiLlxuICAgKiBAcGFyYW0gYUJhZGdlQ291bnQgdGhlIGJhZGdlIGNvdW50IHRvIHB1dCBvdmVyIHRoZSBiZWxsIGljb24uXG4gICAqL1xuICBfc2V0Tm90aWZpY2F0aW9uc0JhZGdlIDogZnVuY3Rpb24oYUJhZGdlQ291bnQpIHtcbiAgICAvL3NldCB0aGUgYmVsbCBpY29uIGJhZGdlXG4gICAgaWYgKFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mKGFCYWRnZUNvdW50KSAmJiBwYXJzZUludChhQmFkZ2VDb3VudCkgPiAwKSB7XG4gICAgICAkKFwiLmJhZGdlXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJpbmxpbmUtYmxvY2tcIik7XG4gICAgICBpZiAocGFyc2VJbnQoYUJhZGdlQ291bnQpID5cbiAgICAgICAgICBQcm9wZXJ0eURBTy5nZXQoUHJvcGVydHlEQU8uUFJPUF9OT1RJRklDQVRJT05TX0xJTUlUX09OX1VJKSkge1xuICAgICAgICBpZiAoZmFsc2UgPT09ICQoXCIuYmFkZ2VcIikuaGFzQ2xhc3MoXCJiYWRnZS1tb3JlLWNoYXJzXCIpKSB7XG4gICAgICAgICAgJChcIi5iYWRnZVwiKS5hZGRDbGFzcyhcImJhZGdlLW1vcmUtY2hhcnNcIik7XG4gICAgICAgIH1cbiAgICAgICAgYUJhZGdlQ291bnQgPSBQcm9wZXJ0eURBTy5nZXQoXG4gICAgICAgICAgUHJvcGVydHlEQU8uUFJPUF9OT1RJRklDQVRJT05TX0xJTUlUX09OX1VJKS50b1N0cmluZygpICsgXCIrXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiLmJhZGdlXCIpLnJlbW92ZUNsYXNzKFwiYmFkZ2UtbW9yZS1jaGFyc1wiKTtcbiAgICAgIH1cbiAgICAgICQoXCIuYmFkZ2VcIikudGV4dChhQmFkZ2VDb3VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoXCIuYmFkZ2VcIikuaGlkZSgpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgTm90aWZpY2F0aW9ucyBwYW5lbCwgc2hvd2luZyBvciBoaWRpbmcgdGhlIGNvbnRlbnQgcGFuZWxzLlxuICAgKiBAcGFyYW0gYU5vdGlmaWNhdGlvbnMgYW4gb2JqZWN0IHdpdGggdGhlIG5vdGlmaWNhdGlvbnMsIGluZGV4ZWQgYnlcbiAgICogdGhlaXIgbm90aWZpY2F0aW9uIGlkLlxuICAgKiBAcGFyYW0gYVByZXZQYXRoIHRoZSBwcmV2IHBhdGhcbiAgICogQHBhcmFtIGFOZXh0UGF0aCB0aGUgbmV4dCBwYXRoXG4gICAqL1xuICBfc2V0Tm90aWZpY2F0aW9uc1BhbmVsIDogZnVuY3Rpb24oYU5vdGlmaWNhdGlvbnMsIGFQcmV2UGF0aCwgYU5leHRQYXRoKSB7XG4gICAgLy9zZXQgdGhlIGNvbnRlbnRzIG9uIHRoZSBTeW1iYW4gdGFiXG4gICAgaWYgKFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mKGFOb3RpZmljYXRpb25zKSAmJiBPYmplY3Qua2V5cyhhTm90aWZpY2F0aW9ucykubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fY3JlYXRlTm90aWZpY2F0aW9uQm94ZXMoYU5vdGlmaWNhdGlvbnMsIGFQcmV2UGF0aCwgYU5leHRQYXRoKTtcbiAgICAgIC8vZm9yIHNvbWUgc3RyYW5nZSByZWFzb24sIHVzaW5nIC5oaWRlKCkgaGVyZSB3aWxsIHRocm93IGFuIGVycm9yOlxuICAgICAgLy9DYW5ub3QgcmVhZCBwcm9wZXJ0eSAnZ2V0Q29tcHV0ZWRTdHlsZScgb2YgdW5kZWZpbmVkXG4gICAgICAkKFwiI3BhbmVsLW5vdGlmaWNhdGlvbi1lbXB0eVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgIC8vZm9yIHNvbWUgc3RyYW5nZSByZWFzb24sIHVzaW5nIC5zaG93KCkgaGVyZSB3aWxsIHRocm93IGFuIGVycm9yOlxuICAgICAgLy9DYW5ub3QgcmVhZCBwcm9wZXJ0eSAnZ2V0Q29tcHV0ZWRTdHlsZScgb2YgdW5kZWZpbmVkXG4gICAgICAkKFwiI3BhbmVsLW5vdGlmaWNhdGlvbi1tYWluXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgIC8vIGFwcGx5IHRyYW5zbGF0aW9ucyBhZ2FpblxuICAgICAgJChcIlt0aXRsZV49aTE4bl1cIikuaTE4bih7IGF0dHJpYnV0ZU5hbWVzOiBbIFwidGl0bGVcIiBdIH0pO1xuICAgICAgU2lkZWJhci51cGRhdGVUb29sdGlwcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoU3ltYmFuU2VydmljZS5pc1VwZGF0aW5nRGF0YSkge1xuICAgICAgICAkKFwiI3BhbmVsLW5vdGlmaWNhdGlvbi1tYWluXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAkKFwiI3BhbmVsLW5vdGlmaWNhdGlvbi1lbXB0eVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoXCIjcGFuZWwtbm90aWZpY2F0aW9uLW1haW5cIikuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgUGFuZWxOb3RpZmljYXRpb24uX3Nob3dEZWFscygpO1xuICAgICAgICAgICQoXCIjcGFuZWwtbm90aWZpY2F0aW9uLWVtcHR5XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgICAgfSwgMjAwLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGFwaUhhc0l0ZW1zIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwaUhhc0l0ZW1zID0gZmFsc2U7XG4gICAgdmFyIG5vdGlmaWNhdGlvbnMgPSBTeW1iYW5TZXJ2aWNlLnVzZXJEYXRhLm5vdGlmaWNhdGlvbnM7XG4gICAgaWYgKG5vdGlmaWNhdGlvbnMgJiYgT2JqZWN0LmtleXMobm90aWZpY2F0aW9ucykubGVuZ3RoID4gMCkge1xuICAgICAgYXBpSGFzSXRlbXMgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBhcGlIYXNJdGVtcztcbiAgfSxcblxuICBfc3RhcnREYXRhVXBkYXRlIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZGF0YVVwZGF0ZUlkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVRpbWVMZWZ0KCk7XG4gICAgICB0aGlzLl9zdGFydERhdGFVcGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcyksIDEwMDApO1xuICB9LFxuXG4gIF9zdG9wRGF0YVVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9kYXRhVXBkYXRlSWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9kYXRhVXBkYXRlSWQpO1xuICAgICAgZGVsZXRlIHRoaXMuX2RhdGFVcGRhdGVJZDtcbiAgICB9XG4gIH0sXG5cbiAgX3VwZGF0ZVRpbWVMZWZ0IDogZnVuY3Rpb24oKSB7XG4gICAgJChcIi5wYW5lbC1ub3RpZmljYXRpb24tbWFpbi1jb250ZW50XCIpLmNoaWxkcmVuKFwiYVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgTm90aWZpY2F0aW9uSXRlbUJveC51cGRhdGVUaW1lTGVmdCgkKHRoaXMpKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogT2JzZXJ2ZXMgZm9yIGNoYW5nZXMuXG4gICAqIEBwYXJhbSBhVG9waWMgdGhlIHRvcGljIG5hbWUuXG4gICAqIEBwYXJhbSBhRGF0YSB0aGUgZGF0YSBzZW50LlxuICAgKi9cbiAgb2JzZXJ2ZSA6IGZ1bmN0aW9uKGFUb3BpYywgYURhdGEpIHtcbiAgICBcbiAgICBzd2l0Y2ggKGFUb3BpYykge1xuICAgICAgY2FzZSBUb3BpY3MuQUNDT1VOVF9TSUdORURfSU46XG4gICAgICAgIHRoaXMuX3N0YXJ0RGF0YVVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVDpcbiAgICAgICAgdGhpcy5fc3RvcERhdGFVcGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRvcGljcy5TWU1CQU5fREFUQV9VUERBVEVEOlxuICAgICAgICB0aGlzLnBvcHVsYXRlTm90aWZpY2F0aW9uRGF0YSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLlNZTUJBTl9EQVRBX1VQREFUSU5HOlxuICAgICAgICBTaWRlYmFyLnNob3dMb2FkaW5nKFwibm90aWZpY2F0aW9uXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbiQod2luZG93KS51bmxvYWQoZnVuY3Rpb24oKSB7IFBhbmVsTm90aWZpY2F0aW9uLnVuaW5pdCgpOyB9KTtcbiJdfQ==