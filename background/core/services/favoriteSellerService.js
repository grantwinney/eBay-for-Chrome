/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var FavoriteSellerService = {
    _sellersCache: null,
    init: function () {
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
    },
    get favoriteSellers() {
        return this._sellersCache;
    },
    _clearSellersCache: function () {
        delete this._sellersCache;
        this._sellersCache = [];
    },
    removeSellers: function () {
        if (!Account.getAccount()) {
            Logger.warn("Attempt to call removeSellers without an active account");
            return;
        }
        this._clearSellersCache();
    },
    updateSellers: function (aSellers) {
        if (!Account.getAccount()) {
            Logger.warn("Attempt to call updateSellers without an active account");
            return;
        }
        if (aSellers) {
            this._sellersCache = aSellers;
        }
    },
    observe: function (aTopic, aData) {
        switch (aTopic) {
            case Topics.ACCOUNT_SIGNED_OUT:
                this._clearSellersCache();
                break;
        }
    }
};
(function () { this.init(); }).apply(FavoriteSellerService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmF2b3JpdGVTZWxsZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFja2dyb3VuZC9jb3JlL3NlcnZpY2VzL2Zhdm9yaXRlU2VsbGVyU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQVlILElBQUkscUJBQXFCLEdBQUc7SUFFMUIsYUFBYSxFQUFFLElBQUk7SUFLbkIsSUFBSSxFQUFFO1FBQ0osY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDOUQsQ0FBQztJQU1ELElBQUksZUFBZTtRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBS0Qsa0JBQWtCLEVBQUU7UUFDbEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFLRCxhQUFhLEVBQUU7UUFFYixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBTUQsYUFBYSxFQUFFLFVBQVMsUUFBUTtRQUU5QixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQztRQUNULENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7UUFDaEMsQ0FBQztJQUNILENBQUM7SUFPRCxPQUFPLEVBQUUsVUFBUyxNQUFNLEVBQUUsS0FBSztRQUM3QixNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsa0JBQWtCO2dCQUM1QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDMUIsS0FBSyxDQUFDO1FBQ1YsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDO0FBS0YsQ0FBQyxjQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDctMjAxNSBlQmF5IEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqL1xuXG4vKlxuICB2YXIgTG9nZ2VyID0gcmVxdWlyZShcImhlbHBlcnMvbG9nZ2VyXCIpLkxvZ2dlcjtcbiAgdmFyIFRvcGljcyA9IHJlcXVpcmUoXCJoZWxwZXJzL29ic2VydmVySGVscGVyXCIpLlRvcGljcztcbiAgdmFyIE9ic2VydmVySGVscGVyID0gcmVxdWlyZShcImhlbHBlcnMvb2JzZXJ2ZXJIZWxwZXJcIikuT2JzZXJ2ZXJIZWxwZXI7XG4gIHZhciBBY2NvdW50ID0gcmVxdWlyZShcImNvcmUvb2JqZWN0cy9hY2NvdW50XCIpLkFjY291bnQ7XG4qL1xuXG4vKipcbiAqIEZhdm9yaXRlIFNlbGxlciBTZXJ2aWNlLlxuICovXG52YXIgRmF2b3JpdGVTZWxsZXJTZXJ2aWNlID0ge1xuICAvKiBTZWxsZXJzIGNhY2hlICovXG4gIF9zZWxsZXJzQ2FjaGU6IG51bGwsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBzZXJ2aWNlLlxuICAgKi9cbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHNlbGxlcnMuXG4gICAqIEByZXR1cm4gdGhlIHNlbGxlcnMuXG4gICAqL1xuICBnZXQgZmF2b3JpdGVTZWxsZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxsZXJzQ2FjaGU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgc2VsbGVycyBjYWNoZS5cbiAgICovXG4gIF9jbGVhclNlbGxlcnNDYWNoZTogZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXMuX3NlbGxlcnNDYWNoZTtcbiAgICB0aGlzLl9zZWxsZXJzQ2FjaGUgPSBbXTtcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlcyBmYXZvcml0ZSBzZWxsZXIuXG4gICAqL1xuICByZW1vdmVTZWxsZXJzOiBmdW5jdGlvbigpIHtcblxuICAgIGlmICghQWNjb3VudC5nZXRBY2NvdW50KCkpIHtcbiAgICAgIExvZ2dlci53YXJuKFwiQXR0ZW1wdCB0byBjYWxsIHJlbW92ZVNlbGxlcnMgd2l0aG91dCBhbiBhY3RpdmUgYWNjb3VudFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhclNlbGxlcnNDYWNoZSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBzZWxsZXJzIGNhY2hlLlxuICAgKiBAcGFyYW0gYVNlbGxlcnMgdGhlIGZhdm9yaXRlIHNlbGxlcnMgbGlzdC5cbiAgICovXG4gIHVwZGF0ZVNlbGxlcnM6IGZ1bmN0aW9uKGFTZWxsZXJzKSB7XG5cbiAgICBpZiAoIUFjY291bnQuZ2V0QWNjb3VudCgpKSB7XG4gICAgICBMb2dnZXIud2FybihcIkF0dGVtcHQgdG8gY2FsbCB1cGRhdGVTZWxsZXJzIHdpdGhvdXQgYW4gYWN0aXZlIGFjY291bnRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGFTZWxsZXJzKSB7XG4gICAgICB0aGlzLl9zZWxsZXJzQ2FjaGUgPSBhU2VsbGVycztcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE9ic2VydmVzIGZvciBjaGFuZ2VzLlxuICAgKiBAcGFyYW0gYVRvcGljIHRoZSB0b3BpYyBuYW1lLlxuICAgKiBAcGFyYW0gYURhdGEgdGhlIGRhdGEgc2VudC5cbiAgICovXG4gIG9ic2VydmU6IGZ1bmN0aW9uKGFUb3BpYywgYURhdGEpIHtcbiAgICBzd2l0Y2ggKGFUb3BpYykge1xuICAgICAgY2FzZSBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUOlxuICAgICAgICB0aGlzLl9jbGVhclNlbGxlcnNDYWNoZSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ29uc3RydWN0b3IuXG4gKi9cbihmdW5jdGlvbigpIHsgdGhpcy5pbml0KCk7IH0pLmFwcGx5KEZhdm9yaXRlU2VsbGVyU2VydmljZSk7XG4iXX0=