/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var FavoriteSearchService = {
    _searchesCache: null,
    init: function () {
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
    },
    get favoriteSearches() {
        return this._searchesCache;
    },
    _clearSearchesCache: function () {
        delete this._searchesCache;
        this._searchesCache = [];
        ObserverHelper.notify(Topics.FAVORITE_SEARCHES_REMOVED);
    },
    removeSearches: function () {
        if (!Account.getAccount()) {
            Logger.warn("Attempt to call removeSearches without an active account");
            return;
        }
        this._clearSearchesCache();
    },
    updateSearches: function (aSearches) {
        if (!Account.getAccount()) {
            Logger.warn("Attempt to call updateSearches without an active account");
            return;
        }
        if (aSearches) {
            this._searchesCache = aSearches;
            ObserverHelper.notify(Topics.FAVORITE_SEARCHES_UPDATED);
        }
    },
    observe: function (aTopic, aData) {
        switch (aTopic) {
            case Topics.ACCOUNT_SIGNED_OUT:
                this._clearSearchesCache();
                break;
        }
    }
};
(function () { this.init(); }).apply(FavoriteSearchService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmF2b3JpdGVTZWFyY2hTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFja2dyb3VuZC9jb3JlL3NlcnZpY2VzL2Zhdm9yaXRlU2VhcmNoU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQVlILElBQUkscUJBQXFCLEdBQUc7SUFFMUIsY0FBYyxFQUFFLElBQUk7SUFLcEIsSUFBSSxFQUFFO1FBQ0osY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDOUQsQ0FBQztJQU1ELElBQUksZ0JBQWdCO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQzdCLENBQUM7SUFLRCxtQkFBbUIsRUFBRTtRQUNuQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBS0QsY0FBYyxFQUFFO1FBRWQsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsMERBQTBELENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQU1ELGNBQWMsRUFBRSxVQUFTLFNBQVM7UUFFaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsMERBQTBELENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNkLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDMUQsQ0FBQztJQUNILENBQUM7SUFPRCxPQUFPLEVBQUUsVUFBUyxNQUFNLEVBQUUsS0FBSztRQUM3QixNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsa0JBQWtCO2dCQUM1QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDM0IsS0FBSyxDQUFDO1FBQ1YsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDO0FBS0YsQ0FBQyxjQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDctMjAxNSBlQmF5IEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqL1xuXG4vKlxuICB2YXIgTG9nZ2VyID0gcmVxdWlyZShcImhlbHBlcnMvbG9nZ2VyXCIpLkxvZ2dlcjtcbiAgdmFyIFRvcGljcyA9IHJlcXVpcmUoXCJoZWxwZXJzL29ic2VydmVySGVscGVyXCIpLlRvcGljcztcbiAgdmFyIE9ic2VydmVySGVscGVyID0gcmVxdWlyZShcImhlbHBlcnMvb2JzZXJ2ZXJIZWxwZXJcIikuT2JzZXJ2ZXJIZWxwZXI7XG4gIHZhciBBY2NvdW50ID0gcmVxdWlyZShcImNvcmUvb2JqZWN0cy9hY2NvdW50XCIpLkFjY291bnQ7XG4qL1xuXG4vKipcbiAqIEZhdm9yaXRlIFNlYXJjaCBTZXJ2aWNlLlxuICovXG52YXIgRmF2b3JpdGVTZWFyY2hTZXJ2aWNlID0ge1xuICAvKiBTZWFyY2hlcyBjYWNoZSAqL1xuICBfc2VhcmNoZXNDYWNoZTogbnVsbCxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHNlcnZpY2UuXG4gICAqL1xuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGlzLCBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUKTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgc2VhcmNoZXMuXG4gICAqIEByZXR1cm4gdGhlIHNlYXJjaGVzLlxuICAgKi9cbiAgZ2V0IGZhdm9yaXRlU2VhcmNoZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlYXJjaGVzQ2FjaGU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgc2VhcmNoZXMgY2FjaGUuXG4gICAqL1xuICBfY2xlYXJTZWFyY2hlc0NhY2hlOiBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpcy5fc2VhcmNoZXNDYWNoZTtcbiAgICB0aGlzLl9zZWFyY2hlc0NhY2hlID0gW107XG4gICAgT2JzZXJ2ZXJIZWxwZXIubm90aWZ5KFRvcGljcy5GQVZPUklURV9TRUFSQ0hFU19SRU1PVkVEKTtcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlcyBmYXZvcml0ZSBzZWFyY2hlcy5cbiAgICovXG4gIHJlbW92ZVNlYXJjaGVzOiBmdW5jdGlvbigpIHtcblxuICAgIGlmICghQWNjb3VudC5nZXRBY2NvdW50KCkpIHtcbiAgICAgIExvZ2dlci53YXJuKFwiQXR0ZW1wdCB0byBjYWxsIHJlbW92ZVNlYXJjaGVzIHdpdGhvdXQgYW4gYWN0aXZlIGFjY291bnRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fY2xlYXJTZWFyY2hlc0NhY2hlKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHNlYXJjaGVzIGNhY2hlLlxuICAgKiBAcGFyYW0gYVNlYXJjaGVzIHRoZSBmYXZvcml0ZSBzZWFyY2hlcyBsaXN0LlxuICAgKi9cbiAgdXBkYXRlU2VhcmNoZXM6IGZ1bmN0aW9uKGFTZWFyY2hlcykge1xuXG4gICAgaWYgKCFBY2NvdW50LmdldEFjY291bnQoKSkge1xuICAgICAgTG9nZ2VyLndhcm4oXCJBdHRlbXB0IHRvIGNhbGwgdXBkYXRlU2VhcmNoZXMgd2l0aG91dCBhbiBhY3RpdmUgYWNjb3VudFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoYVNlYXJjaGVzKSB7XG4gICAgICB0aGlzLl9zZWFyY2hlc0NhY2hlID0gYVNlYXJjaGVzO1xuICAgICAgT2JzZXJ2ZXJIZWxwZXIubm90aWZ5KFRvcGljcy5GQVZPUklURV9TRUFSQ0hFU19VUERBVEVEKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE9ic2VydmVzIGZvciBjaGFuZ2VzLlxuICAgKiBAcGFyYW0gYVRvcGljIHRoZSB0b3BpYyBuYW1lLlxuICAgKiBAcGFyYW0gYURhdGEgdGhlIGRhdGEgc2VudC5cbiAgICovXG4gIG9ic2VydmU6IGZ1bmN0aW9uKGFUb3BpYywgYURhdGEpIHtcbiAgICBzd2l0Y2ggKGFUb3BpYykge1xuICAgICAgY2FzZSBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUOlxuICAgICAgICB0aGlzLl9jbGVhclNlYXJjaGVzQ2FjaGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENvbnN0cnVjdG9yLlxuICovXG4oZnVuY3Rpb24oKSB7IHRoaXMuaW5pdCgpOyB9KS5hcHBseShGYXZvcml0ZVNlYXJjaFNlcnZpY2UpO1xuIl19