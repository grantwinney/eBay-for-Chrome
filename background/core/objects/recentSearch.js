/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
function RecentSearch(aUserId, aSearchString) {
    this._init(aUserId, aSearchString);
}
RecentSearch.SCHEMA = {
    NAME: "RecentSearch",
    PROPERTIES: {
        "userId": { type: "string", xml: "" },
        "searchString": { type: "string", xml: "SearchString" },
        "timestamp": { type: "string", xml: "Timestamp" }
    }
};
RecentSearch.prototype = {
    name: RecentSearch.SCHEMA.NAME,
    _init: function (aUserId, aSearchString) {
        this.set("userId", aUserId);
        this.set("searchString", aSearchString);
    },
    get: function (aProperty) {
        return this["_" + aProperty];
    },
    set: function (aProperty, aValue) {
        var type = RecentSearch.SCHEMA.PROPERTIES[aProperty].type;
        aValue = ObjectHelper.getTypedValue(type, aValue);
        this["_" + aProperty] = aValue;
    },
    updateTo: function (aNewObject) {
        return ObjectHelper.updateTo(this, aNewObject, RecentSearch.SCHEMA);
    },
    copy: function () {
        return ObjectHelper.copyObject(this, RecentSearch);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjZW50U2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFja2dyb3VuZC9jb3JlL29iamVjdHMvcmVjZW50U2VhcmNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBU0gsc0JBQXNCLE9BQU8sRUFBRSxhQUFhO0lBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFHRCxZQUFZLENBQUMsTUFBTSxHQUFHO0lBQ3BCLElBQUksRUFBRSxjQUFjO0lBQ3BCLFVBQVUsRUFBRTtRQUNWLFFBQVEsRUFBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRTtRQUMzQyxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFHLEdBQUcsRUFBRSxjQUFjLEVBQUU7UUFDeEQsV0FBVyxFQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRyxHQUFHLEVBQUUsV0FBVyxFQUFFO0tBQ3JEO0NBQ0YsQ0FBQztBQUdGLFlBQVksQ0FBQyxTQUFTLEdBQUc7SUFJdkIsSUFBSSxFQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSTtJQU8vQixLQUFLLEVBQUcsVUFBUyxPQUFPLEVBQUUsYUFBYTtRQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBUUQsR0FBRyxFQUFHLFVBQVMsU0FBUztRQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBUUQsR0FBRyxFQUFHLFVBQVMsU0FBUyxFQUFFLE1BQU07UUFDOUIsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRTFELE1BQU0sR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUNqQyxDQUFDO0lBTUQsUUFBUSxFQUFHLFVBQVMsVUFBVTtRQUM1QixNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBTUQsSUFBSSxFQUFHO1FBQ0wsTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3JELENBQUM7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDctMjAxNSBlQmF5IEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqL1xuXG4vKlxuICB2YXIgT2JqZWN0SGVscGVyID0gcmVxdWlyZShcImNvcmUvaGVscGVycy9vYmplY3RIZWxwZXJcIikuT2JqZWN0SGVscGVyO1xuKi9cblxuLyoqXG4gKiBTYXZlZCBSZWNlbnQgU2VhcmNoIERhdGEgVHJhbnNmZXIgT2JqZWN0LlxuICovXG5mdW5jdGlvbiBSZWNlbnRTZWFyY2goYVVzZXJJZCwgYVNlYXJjaFN0cmluZykge1xuICB0aGlzLl9pbml0KGFVc2VySWQsIGFTZWFyY2hTdHJpbmcpO1xufVxuXG4vKiBEVE8gU2NoZW1hLiAqL1xuUmVjZW50U2VhcmNoLlNDSEVNQSA9IHtcbiAgTkFNRTogXCJSZWNlbnRTZWFyY2hcIixcbiAgUFJPUEVSVElFUzoge1xuICAgIFwidXNlcklkXCI6ICAgICAgeyB0eXBlOiBcInN0cmluZ1wiLCAgeG1sOiBcIlwiIH0sXG4gICAgXCJzZWFyY2hTdHJpbmdcIjogeyB0eXBlOiBcInN0cmluZ1wiLCAgeG1sOiBcIlNlYXJjaFN0cmluZ1wiIH0sXG4gICAgXCJ0aW1lc3RhbXBcIjogICB7IHR5cGU6IFwic3RyaW5nXCIsICB4bWw6IFwiVGltZXN0YW1wXCIgfVxuICB9XG59O1xuXG4vKiBEVE8gUHJvdG90eXBlLiAqL1xuUmVjZW50U2VhcmNoLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB0eXBlIG9mIHRoZSBvYmplY3QuXG4gICAqL1xuICBuYW1lIDogUmVjZW50U2VhcmNoLlNDSEVNQS5OQU1FLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgb2JqZWN0LlxuICAgKiBAcGFyYW0gYVVzZXJJZCB0aGUgdXNlciBpZC5cbiAgICogQHBhcmFtIGFTZWFyY2hTdHJpbmcgdGhlIHNlYXJjaCBzdHJpbmcgYnkgdGhlIHVzZXIuXG4gICAqL1xuICBfaW5pdCA6IGZ1bmN0aW9uKGFVc2VySWQsIGFTZWFyY2hTdHJpbmcpIHtcbiAgICB0aGlzLnNldChcInVzZXJJZFwiLCBhVXNlcklkKTtcbiAgICB0aGlzLnNldChcInNlYXJjaFN0cmluZ1wiLCBhU2VhcmNoU3RyaW5nKTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gcHJvcGVydHkuXG4gICAqIEBwYXJhbSBhUHJvcGVydHkgdGhlIHByb3BlcnR5IG5hbWUuXG4gICAqIEByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlLlxuICAgKi9cbiAgZ2V0IDogZnVuY3Rpb24oYVByb3BlcnR5KSB7XG4gICAgcmV0dXJuIHRoaXNbXCJfXCIgKyBhUHJvcGVydHldO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBnaXZlbiBwcm9wZXJ0eSB0byB0aGUgZ2l2ZW4gdmFsdWUsIGNoZWNraW5nIHRoYXQgdGhlIHZhbHVlIGlzIG9mXG4gICAqIHRoZSBjb3JyZWN0IHR5cGUgZm9yIHRoZSBwcm9wZXJ0eS5cbiAgICogQHBhcmFtIGFQcm9wZXJ0eSB0aGUgcHJvcGVydHkgbmFtZS5cbiAgICogQHBhcmFtIGFWYWx1ZSB0aGUgcHJvcGVydHkgdmFsdWUuXG4gICAqL1xuICBzZXQgOiBmdW5jdGlvbihhUHJvcGVydHksIGFWYWx1ZSkge1xuICAgIHZhciB0eXBlID0gUmVjZW50U2VhcmNoLlNDSEVNQS5QUk9QRVJUSUVTW2FQcm9wZXJ0eV0udHlwZTtcblxuICAgIGFWYWx1ZSA9IE9iamVjdEhlbHBlci5nZXRUeXBlZFZhbHVlKHR5cGUsIGFWYWx1ZSk7XG4gICAgdGhpc1tcIl9cIiArIGFQcm9wZXJ0eV0gPSBhVmFsdWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGN1cnJlbnQgcmVjZW50IHNlYXJjaCB0byB0aGUgbmV3IHJlY2VudCBzZWFyY2ggcGFzc2VkLlxuICAgKiBAcmV0dXJuIHRoZSBtb2RpZmllZCBmaWVsZHMsIGlmIGFueS5cbiAgICovXG4gIHVwZGF0ZVRvIDogZnVuY3Rpb24oYU5ld09iamVjdCkge1xuICAgIHJldHVybiBPYmplY3RIZWxwZXIudXBkYXRlVG8odGhpcywgYU5ld09iamVjdCwgUmVjZW50U2VhcmNoLlNDSEVNQSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoZSByZWNlbnQgc2VhcmNoLlxuICAgKiBAcmV0dXJuIHRoZSBjb3B5IG9mIHRoZSByZWNlbnQgc2VhcmNoLlxuICAgKi9cbiAgY29weSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBPYmplY3RIZWxwZXIuY29weU9iamVjdCh0aGlzLCBSZWNlbnRTZWFyY2gpO1xuICB9XG59O1xuIl19