/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var ListingDrafts = ebay.apis.listingDraft;
var ListingDraftService = {
    _savedListingDrafts: 0,
    init: function () {
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
    },
    get savedDrafts() {
        return this._savedListingDrafts;
    },
    getSavedDrafts: function () {
        var that = this;
        var getDrafts = function (aResult) {
            if (aResult && !aResult.message) {
                that._savedListingDrafts = aResult;
            }
            ObserverHelper.notify(Topics.SAVED_LISTING_DRAFTS_UPDATED);
        };
        var authConfig = {
            token: Account.getAccount().get("token"),
            endPoint: ApiHelper.getEndPoint("listingDraftApi"),
            globalId: Site.getGlobalId()
        };
        ListingDrafts.getNoOfSavedListingDrafts(authConfig)
            .then(getDrafts)
            .catch(function (error) {
            console.log(error);
        });
    },
    _clearCache: function () {
        this._savedListingDrafts = [];
    },
    observe: function (aTopic, aData) {
        switch (aTopic) {
            case Topics.ACCOUNT_SIGNED_IN:
                this.getSavedDrafts();
                break;
            case Topics.ACCOUNT_SIGNED_OUT:
                this._clearCache();
                break;
        }
    }
};
(function () { this.init(); }).apply(ListingDraftService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGluZ0RyYWZ0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2tncm91bmQvY29yZS9zZXJ2aWNlcy9saXN0aW5nRHJhZnRTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBUUgsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFLM0MsSUFBSSxtQkFBbUIsR0FBRztJQUN4QixtQkFBbUIsRUFBRyxDQUFDO0lBRXZCLElBQUksRUFBRztRQUNMLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNELGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ2xDLENBQUM7SUFFRCxjQUFjLEVBQUc7UUFFZixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsSUFBSSxTQUFTLEdBQUcsVUFBUyxPQUFPO1lBRzlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDO1lBQ3JDLENBQUM7WUFDRCxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQztRQUNGLElBQUksVUFBVSxHQUFHO1lBQ2YsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ3hDLFFBQVEsRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDO1lBQ2xELFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO1NBQzdCLENBQUM7UUFDRixhQUFhLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDO2FBQ2hELElBQUksQ0FBQyxTQUFTLENBQUM7YUFDZixLQUFLLENBQUMsVUFBUyxLQUFLO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsV0FBVyxFQUFHO1FBQ1osSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsT0FBTyxFQUFHLFVBQVMsTUFBTSxFQUFFLEtBQUs7UUFDOUIsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLGlCQUFpQjtnQkFDM0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN0QixLQUFLLENBQUM7WUFDUixLQUFLLE1BQU0sQ0FBQyxrQkFBa0I7Z0JBQzVCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkIsS0FBSyxDQUFDO1FBQ1YsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDO0FBS0YsQ0FBQyxjQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDctMjAxNSBlQmF5IEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqL1xuXG4vKlxuICB2YXIgTG9nZ2VyID0gcmVxdWlyZShcImhlbHBlcnMvbG9nZ2VyXCIpLkxvZ2dlcjtcbiAgdmFyIFRvcGljcyA9IHJlcXVpcmUoXCJoZWxwZXJzL29ic2VydmVySGVscGVyXCIpLlRvcGljcztcbiAgdmFyIE9ic2VydmVySGVscGVyID0gcmVxdWlyZShcImhlbHBlcnMvb2JzZXJ2ZXJIZWxwZXJcIikuT2JzZXJ2ZXJIZWxwZXI7XG4gIHZhciBMaXN0aW5nRHJhZnRBcGkgPSByZXF1aXJlKFwiY29yZS9hcGlzL2xpc3RpbmdEcmFmdEFwaVwiKS5MaXN0aW5nRHJhZnRBcGk7XG4qL1xudmFyIExpc3RpbmdEcmFmdHMgPSBlYmF5LmFwaXMubGlzdGluZ0RyYWZ0O1xuXG4vKipcbiAqIExpc3RpbmcgRHJhZnQgU2VydmljZS5cbiAqL1xudmFyIExpc3RpbmdEcmFmdFNlcnZpY2UgPSB7XG4gIF9zYXZlZExpc3RpbmdEcmFmdHMgOiAwLFxuXG4gIGluaXQgOiBmdW5jdGlvbigpIHtcbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuQUNDT1VOVF9TSUdORURfSU4pO1xuICAgIE9ic2VydmVySGVscGVyLmFkZE9ic2VydmVyKHRoaXMsIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9PVVQpO1xuICB9LFxuXG4gIGdldCBzYXZlZERyYWZ0cygpIHtcbiAgICByZXR1cm4gdGhpcy5fc2F2ZWRMaXN0aW5nRHJhZnRzO1xuICB9LFxuXG4gIGdldFNhdmVkRHJhZnRzIDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGdldERyYWZ0cyA9IGZ1bmN0aW9uKGFSZXN1bHQpIHtcbiAgICAgIC8vIElmIGl0IGRvZXNuJ3QgaGF2ZSBhICdtZXNzYWdlJyBwcm9wZXJ0eSwgdGhlbiBpdCdzIG5vdFxuICAgICAgLy8gYW4gRXhjZXB0aW9uXG4gICAgICBpZiAoYVJlc3VsdCAmJiAhYVJlc3VsdC5tZXNzYWdlKSB7XG4gICAgICAgIHRoYXQuX3NhdmVkTGlzdGluZ0RyYWZ0cyA9IGFSZXN1bHQ7XG4gICAgICB9XG4gICAgICBPYnNlcnZlckhlbHBlci5ub3RpZnkoVG9waWNzLlNBVkVEX0xJU1RJTkdfRFJBRlRTX1VQREFURUQpO1xuICAgIH07XG4gICAgdmFyIGF1dGhDb25maWcgPSB7XG4gICAgICB0b2tlbjogQWNjb3VudC5nZXRBY2NvdW50KCkuZ2V0KFwidG9rZW5cIiksXG4gICAgICBlbmRQb2ludDogQXBpSGVscGVyLmdldEVuZFBvaW50KFwibGlzdGluZ0RyYWZ0QXBpXCIpLFxuICAgICAgZ2xvYmFsSWQ6IFNpdGUuZ2V0R2xvYmFsSWQoKVxuICAgIH07XG4gICAgTGlzdGluZ0RyYWZ0cy5nZXROb09mU2F2ZWRMaXN0aW5nRHJhZnRzKGF1dGhDb25maWcpXG4gICAgICAudGhlbihnZXREcmFmdHMpXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgfSk7XG4gIH0sXG5cbiAgX2NsZWFyQ2FjaGUgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zYXZlZExpc3RpbmdEcmFmdHMgPSBbXTtcbiAgfSxcblxuICBvYnNlcnZlIDogZnVuY3Rpb24oYVRvcGljLCBhRGF0YSkge1xuICAgIHN3aXRjaCAoYVRvcGljKSB7XG4gICAgICBjYXNlIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTjpcbiAgICAgICAgdGhpcy5nZXRTYXZlZERyYWZ0cygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVDpcbiAgICAgICAgdGhpcy5fY2xlYXJDYWNoZSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ29uc3RydWN0b3IuXG4gKi9cbihmdW5jdGlvbigpIHsgdGhpcy5pbml0KCk7IH0pLmFwcGx5KExpc3RpbmdEcmFmdFNlcnZpY2UpO1xuIl19