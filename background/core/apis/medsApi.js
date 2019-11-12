/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var MEDSApi = {
    addRecentSearch: function (aHomeSite, aParameters, aCallback) {
        var that = this;
        var callback = function (aResponse) {
            var result = null;
            if (aResponse) {
                result = that._parseResponse(aResponse);
            }
            if (aCallback) {
                aCallback(result);
            }
        };
        var request = this._doCall("addRecentSearch", aHomeSite, aParameters, callback);
        return request;
    },
    getRecentSearches: function (aHomeSite, aParameters, aCallback) {
        var that = this;
        var callback = function (aResponse) {
            var result = null;
            if (aResponse) {
                result = that._parseResponse(aResponse);
            }
            if (aCallback) {
                aCallback(result);
            }
        };
        var request = this._doCall("getRecentSearches", aHomeSite, aParameters, callback);
        return request;
    },
    clearRecentSearches: function (aHomeSite, aParameters, aCallback) {
        var that = this;
        var callback = function (aResponse) {
            var result = null;
            if (aResponse) {
                result = that._parseResponse(aResponse);
            }
            if (aCallback) {
                aCallback(result);
            }
        };
        var request = this._doCall("clearRecentSearches", aHomeSite, aParameters, callback);
        return request;
    },
    _parseResponse: function (aResponse) {
        return aResponse;
    },
    _validateResponse: function (aResponse) {
        if (!aResponse) {
            Logger.error("MEDSApi Error: no response!");
            return false;
        }
        return true;
    },
    _checkTokenExpired: function (aXHR) {
        if ((aXHR.status && aXHR.status.toString() == "401") ||
            (aXHR.statusText && aXHR.statusText == "Unauthorized")) {
            ObserverHelper.notify(Topics.USER_TOKEN_EXPIRED, null);
            return true;
        }
        return false;
    },
    _checkDataNoFound: function (aXHR) {
        if ((aXHR.status && aXHR.status.toString() == "404") ||
            (aXHR.statusText && aXHR.statusText == "Not Found")) {
            return true;
        }
        return false;
    },
    _doCall: function (aRequestName, aHomeSite, aParameters, aCallback) {
        var that = this;
        var request;
        var requestType;
        var parametersString;
        var urlParametersString = "?action=prepend";
        var siteId = Site.siteIdForSite(aHomeSite);
        var url = ApiHelper.getEndPoint("medsApi");
        var account = Account.getAccount();
        url = url.replace("{IdentityType}", "User");
        url = url.replace("{IdentityProvider}", "Marketplace");
        var params = {
            deviceId: "AQABgvmuZpi4DhtLQU4ua8GEPQZU+0cwjE6WycazSDBcMHVk63SfnYpZ1OkyqEfSb11l",
            deviceIdSource: "4PP",
            appVersion: "3.3.0"
        };
        switch (aRequestName) {
            case "addRecentSearch":
                requestType = "POST";
                url += urlParametersString;
                parametersString = aParameters;
                break;
            case "clearRecentSearches":
                requestType = "DELETE";
                break;
            case "getRecentSearches":
            default:
                requestType = "GET";
                break;
        }
        request =
            $.ajax({
                beforeSend: function (aXHR) {
                    aXHR.setRequestHeader("Content", "application/json");
                    aXHR.setRequestHeader("Accept", "application/json");
                    aXHR.setRequestHeader("X-EBAY-C-MARKETPLACE-ID", siteId);
                    aXHR.setRequestHeader("X-EBAY-C-IDENTITY", "id=123;idp=456");
                    aXHR.setRequestHeader("X-EBAY-C-ENDUSERCTX", "deviceId=" + params.deviceId +
                        ",deviceIdSource=" + params.deviceIdSource +
                        ",appVersion=" + params.appVersion);
                    aXHR.setRequestHeader("If-Modified-Since", "");
                    if (account) {
                        var token = account.get("token");
                        if (token) {
                            aXHR.setRequestHeader("Authorization", "IAF " + token);
                        }
                    }
                },
                url: url,
                data: parametersString,
                dataType: "json",
                type: requestType,
                contentType: "application/json",
                jsonp: false,
                timeout: PropertyDAO.get(PropertyDAO.PROP_API_TIMEOUT),
                success: function (aData, aTextStatus) {
                    try {
                        if (!that._validateResponse(aData)) {
                            aData = null;
                        }
                        else {
                            MessagePanelService.dismissMessage(MessagePanelService.TYPE.CONNECT_ERROR);
                        }
                        if (aCallback) {
                            aCallback(aData);
                        }
                    }
                    catch (e) {
                        UtilityHelper.handleError("MEDSApi", aRequestName, e.message, aCallback);
                    }
                },
                error: function (aXHR, aTextStatus, aError) {
                    MEDSApi._checkTokenExpired(aXHR);
                    MEDSApi._checkDataNoFound(aXHR);
                    UtilityHelper.handleError("MEDSApi", aRequestName, aXHR.responseText, aCallback);
                }
            });
        ApiHelper.addPendingRequest(request, aRequestName, Topics.RECENT_SEARCHES_UPDATED);
        return request;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkc0FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2tncm91bmQvY29yZS9hcGlzL21lZHNBcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFnQkgsSUFBSSxPQUFPLEdBQUc7SUFRWixlQUFlLEVBQUcsVUFBUyxTQUFTLEVBQUUsV0FBVyxFQUFFLFNBQVM7UUFDMUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksUUFBUSxHQUFHLFVBQVMsU0FBUztZQUMvQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFFZCxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDZCxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVGLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVoRixNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFRRCxpQkFBaUIsRUFBRyxVQUFTLFNBQVMsRUFBRSxXQUFXLEVBQUUsU0FBUztRQUM1RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsSUFBSSxRQUFRLEdBQUcsVUFBUyxTQUFTO1lBQy9CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztZQUNsQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUVkLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FB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LEtBQUssQ0FBQyxDQUFDO3dCQUNuQixDQUFDO29CQUNILENBQUM7b0JBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDVixhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDM0UsQ0FBQztnQkFDSCxDQUFDO2dCQUNELEtBQUssRUFBRSxVQUFTLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTTtvQkFDdkMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2hDLGFBQWEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBS0wsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFbkYsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQ29weXJpZ2h0IChDKSAyMDA3LTIwMTUgZUJheSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKi9cblxuLypcbiAgdmFyIEFjY291bnQgPSByZXF1aXJlKFwiY29yZS9vYmplY3RzL2FjY291bnRcIikuQWNjb3VudDtcbiAgdmFyIExvZ2dlciA9IHJlcXVpcmUoXCJoZWxwZXJzL2xvZ2dlclwiKS5Mb2dnZXI7XG4gIHZhciBUb3BpY3MgPSByZXF1aXJlKFwiaGVscGVycy9vYnNlcnZlckhlbHBlclwiKS5Ub3BpY3M7XG4gIHZhciBPYnNlcnZlckhlbHBlciA9IHJlcXVpcmUoXCJoZWxwZXJzL29ic2VydmVySGVscGVyXCIpLk9ic2VydmVySGVscGVyO1xuICB2YXIgVXRpbGl0eUhlbHBlciA9IHJlcXVpcmUoXCJoZWxwZXJzL3V0aWxpdHlIZWxwZXJcIikuVXRpbGl0eUhlbHBlcjtcbiAgdmFyIEFwaUhlbHBlciA9IHJlcXVpcmUoXCJjb3JlL2hlbHBlcnMvYXBpSGVscGVyXCIpLkFwaUhlbHBlcjtcbiAgdmFyIE1lc3NhZ2VQYW5lbFNlcnZpY2UgPSByZXF1aXJlKFwiY29yZS9zZXJ2aWNlcy9tZXNzYWdlUGFuZWxTZXJ2aWNlXCIpLk1lc3NhZ2VQYW5lbFNlcnZpY2U7XG4gIHZhciBQcm9wZXJ0eURBTyA9IHJlcXVpcmUoXCJzdG9yYWdlL3Byb3BlcnR5REFPXCIpLlByb3BlcnR5REFPO1xuKi9cblxuLyoqXG4gKiBUaGUgTUVEUyBBUEkuXG4gKi9cbnZhciBNRURTQXBpID0ge1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgbmV3IHJlY2VudCBzZWFyY2ggZnJvbSBhbiB1c2VyLlxuICAgKiBAcGFyYW0gYUhvbWVTaXRlIHRoZSB1c2VyJ3MgaG9tZSBzaXRlLlxuICAgKiBAcGFyYW0gYVBhcmFtZXRlcnMgdGhlIHBhcmFtZXRlcnMgdG8gYmUgc2VudCBvbiB0aGUgY2FsbC5cbiAgICogQHBhcmFtIGFDYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqL1xuICBhZGRSZWNlbnRTZWFyY2ggOiBmdW5jdGlvbihhSG9tZVNpdGUsIGFQYXJhbWV0ZXJzLCBhQ2FsbGJhY2spIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oYVJlc3BvbnNlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICAgIGlmIChhUmVzcG9uc2UpIHtcbiAgICAgICAgLy9UT0RPOiBkZWZpbmUgaG93IHdlIHNob3VsZCBwYXJzZSB0aGUgcmVzcG9uc2UgZnJvbSBNRURTIEFQSS5cbiAgICAgICAgcmVzdWx0ID0gdGhhdC5fcGFyc2VSZXNwb25zZShhUmVzcG9uc2UpO1xuICAgICAgfVxuICAgICAgaWYgKGFDYWxsYmFjaykge1xuICAgICAgICBhQ2FsbGJhY2socmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHJlcXVlc3QgPSB0aGlzLl9kb0NhbGwoXCJhZGRSZWNlbnRTZWFyY2hcIiwgYUhvbWVTaXRlLCBhUGFyYW1ldGVycywgY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJlY2VudCBzZWFyY2hlcyBmcm9tIGFuIHVzZXIuXG4gICAqIEBwYXJhbSBhSG9tZVNpdGUgdGhlIHVzZXIncyBob21lIHNpdGUuXG4gICAqIEBwYXJhbSBhUGFyYW1ldGVycyB0aGUgcGFyYW1ldGVycyB0byBiZSBzZW50IG9uIHRoZSBjYWxsLlxuICAgKiBAcGFyYW0gYUNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICovXG4gIGdldFJlY2VudFNlYXJjaGVzIDogZnVuY3Rpb24oYUhvbWVTaXRlLCBhUGFyYW1ldGVycywgYUNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKGFSZXNwb25zZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgICBpZiAoYVJlc3BvbnNlKSB7XG4gICAgICAgIC8vVE9ETzogZGVmaW5lIGhvdyB3ZSBzaG91bGQgcGFyc2UgdGhlIHJlc3BvbnNlIGZyb20gTUVEUyBBUEkuXG4gICAgICAgIHJlc3VsdCA9IHRoYXQuX3BhcnNlUmVzcG9uc2UoYVJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgYUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciByZXF1ZXN0ID0gdGhpcy5fZG9DYWxsKFwiZ2V0UmVjZW50U2VhcmNoZXNcIiwgYUhvbWVTaXRlLCBhUGFyYW1ldGVycywgY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgcmVjZW50IHNlYXJjaGVzIHJlbGF0ZWQgdG8gYW4gdXNlci5cbiAgICogQHBhcmFtIGFIb21lU2l0ZSB0aGUgdXNlcidzIGhvbWUgc2l0ZS5cbiAgICogQHBhcmFtIGFQYXJhbWV0ZXJzIHJlcXVlc3QgYXJncy5cbiAgICogQHBhcmFtIGFDYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqL1xuICBjbGVhclJlY2VudFNlYXJjaGVzIDogZnVuY3Rpb24oYUhvbWVTaXRlLCBhUGFyYW1ldGVycywgYUNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKGFSZXNwb25zZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG5cbiAgICAgIGlmIChhUmVzcG9uc2UpIHtcbiAgICAgICAgLy9UT0RPOiBkZWZpbmUgaG93IHdlIHNob3VsZCBwYXJzZSB0aGUgcmVzcG9uc2UgZnJvbSBNRURTIEFQSS5cbiAgICAgICAgcmVzdWx0ID0gdGhhdC5fcGFyc2VSZXNwb25zZShhUmVzcG9uc2UpO1xuICAgICAgfVxuICAgICAgaWYgKGFDYWxsYmFjaykge1xuICAgICAgICBhQ2FsbGJhY2socmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHJlcXVlc3QgPSB0aGlzLl9kb0NhbGwoXCJjbGVhclJlY2VudFNlYXJjaGVzXCIsIGFIb21lU2l0ZSwgYVBhcmFtZXRlcnMsIGNhbGxiYWNrKTtcblxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIHJlc3BvbnNlLlxuICAgKiBAcGFyYW0gYVJlc3BvbnNlIHRoZSBBUEkgcmVzcG9uc2UuXG4gICAqIEByZXR1cm4gdGhlIHBhcnNlZCByZXNwb25zZS5cbiAgICovXG4gIF9wYXJzZVJlc3BvbnNlIDogZnVuY3Rpb24oYVJlc3BvbnNlKSB7XG4gICAgXG4gICAgcmV0dXJuIGFSZXNwb25zZTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwb3J0cyBhbnkgZXJyb3IgbWVzc2FnZXMgaW4gdGhlIEFQSSByZXNwb25zZS5cbiAgICogQHBhcmFtIGFSZXNwb25zZSB0aGUgQVBJIHJlc3BvbnNlLlxuICAgKiBAcmV0dXJuIGJvb2xlYW4gaW5kaWNhdGVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIGNvbnRhaW5zIGVycm9yIG9yIG5vdC5cbiAgICovXG4gIF92YWxpZGF0ZVJlc3BvbnNlIDogZnVuY3Rpb24oYVJlc3BvbnNlKSB7XG4gICAgXG4gICAgaWYgKCFhUmVzcG9uc2UpIHtcbiAgICAgIExvZ2dlci5lcnJvcihcIk1FRFNBcGkgRXJyb3I6IG5vIHJlc3BvbnNlIVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKioqXG4gICAqIENoZWNrcyBpZiB0aGUgdXNlciB0b2tlbiBoYXMgZXhwaXJlZC5cbiAgICogQHBhcmFtIGFYSFIgdGhlIHJlc3BvbnNlIGZyb20gdGhlIGFwaSBjYWxsLlxuICAgKiBAcmV0dXJuIGJvb2xlYW4gaW5kaWNhdGVzIHdoZXRoZXIgdGhlIHRva2VuIGlzIGV4cGlyZWQgb3Igbm90LlxuICAgKi9cbiAgX2NoZWNrVG9rZW5FeHBpcmVkIDogZnVuY3Rpb24oYVhIUikge1xuICAgIGlmICgoYVhIUi5zdGF0dXMgJiYgYVhIUi5zdGF0dXMudG9TdHJpbmcoKSA9PSBcIjQwMVwiKSB8fFxuICAgICAgICAoYVhIUi5zdGF0dXNUZXh0ICYmIGFYSFIuc3RhdHVzVGV4dCA9PSBcIlVuYXV0aG9yaXplZFwiKSkge1xuICAgICAgT2JzZXJ2ZXJIZWxwZXIubm90aWZ5KFRvcGljcy5VU0VSX1RPS0VOX0VYUElSRUQsIG51bGwpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKioqXG4gICAqIENoZWNrcyBpZiBkYXRhIGlzIG5vdCBmb3VuZC5cbiAgICogQHBhcmFtIGFYSFIgdGhlIHJlc3BvbnNlIGZyb20gdGhlIGFwaSBjYWxsLlxuICAgKiBAcmV0dXJuIGJvb2xlYW4gaW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRhdGEgaXMgZm91bmQgb3Igbm90LlxuICAgKi9cbiAgX2NoZWNrRGF0YU5vRm91bmQgOiBmdW5jdGlvbihhWEhSKSB7XG4gICAgaWYgKChhWEhSLnN0YXR1cyAmJiBhWEhSLnN0YXR1cy50b1N0cmluZygpID09IFwiNDA0XCIpIHx8XG4gICAgICAgIChhWEhSLnN0YXR1c1RleHQgJiYgYVhIUi5zdGF0dXNUZXh0ID09IFwiTm90IEZvdW5kXCIpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBBUEkgY2FsbC5cbiAgICogQHBhcmFtIGFSZXF1ZXN0TmFtZSB0aGUgbmFtZSBvZiB0aGUgcmVxdWVzdDogcHVsbCB8IHB1Ymxpc2ggfCB1cGRhdGUuXG4gICAqIEBwYXJhbSBhUGFyYW1ldGVycyB0aGUgcGFyYW1ldGVycyB0byBiZSBzZW50IG9uIHRoZSBjYWxsLlxuICAgKiBAcGFyYW0gYUhvbWVTaXRlIHRoZSB1c2VyJ3MgaG9tZSBzaXRlLlxuICAgKiBAcGFyYW0gYUNhbGxiYWNrIFRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHJldHVybnMgcmVxdWVzdCBvYmplY3QuXG4gICAqL1xuICBfZG9DYWxsIDogZnVuY3Rpb24oYVJlcXVlc3ROYW1lLCBhSG9tZVNpdGUsIGFQYXJhbWV0ZXJzLCBhQ2FsbGJhY2spIHtcbiAgICBcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHJlcXVlc3Q7XG4gICAgdmFyIHJlcXVlc3RUeXBlO1xuICAgIHZhciBwYXJhbWV0ZXJzU3RyaW5nO1xuICAgIHZhciB1cmxQYXJhbWV0ZXJzU3RyaW5nID0gXCI/YWN0aW9uPXByZXBlbmRcIjtcbiAgICB2YXIgc2l0ZUlkID0gU2l0ZS5zaXRlSWRGb3JTaXRlKGFIb21lU2l0ZSk7XG4gICAgdmFyIHVybCA9IEFwaUhlbHBlci5nZXRFbmRQb2ludChcIm1lZHNBcGlcIik7XG4gICAgdmFyIGFjY291bnQgPSBBY2NvdW50LmdldEFjY291bnQoKTtcblxuICAgIC8vIFRvRG86IHdoYXQgYXJlIHRoZSB2YWx1ZXM/XG4gICAgdXJsID0gdXJsLnJlcGxhY2UoXCJ7SWRlbnRpdHlUeXBlfVwiLCBcIlVzZXJcIik7XG4gICAgdXJsID0gdXJsLnJlcGxhY2UoXCJ7SWRlbnRpdHlQcm92aWRlcn1cIiwgXCJNYXJrZXRwbGFjZVwiKTtcblxuICAgIC8vIFRvRG86IHdoYXQgZGV2aWNlSWQsIGRldmljZUlkU291cmNlIHdlIHBhc3MgaW4/XG4gICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgIGRldmljZUlkIDogXCJBUUFCZ3ZtdVpwaTREaHRMUVU0dWE4R0VQUVpVKzBjd2pFNld5Y2F6U0RCY01IVms2M1NmbllwWjFPa3lxRWZTYjExbFwiLFxuICAgICAgZGV2aWNlSWRTb3VyY2UgOiBcIjRQUFwiLFxuICAgICAgYXBwVmVyc2lvbiA6IFwiMy4zLjBcIlxuICAgIH07XG5cbiAgICBzd2l0Y2goYVJlcXVlc3ROYW1lKSB7XG4gICAgICBjYXNlIFwiYWRkUmVjZW50U2VhcmNoXCI6XG4gICAgICAgIHJlcXVlc3RUeXBlID0gXCJQT1NUXCI7XG4gICAgICAgIHVybCArPSB1cmxQYXJhbWV0ZXJzU3RyaW5nO1xuICAgICAgICBwYXJhbWV0ZXJzU3RyaW5nID0gYVBhcmFtZXRlcnM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImNsZWFyUmVjZW50U2VhcmNoZXNcIjpcbiAgICAgICAgcmVxdWVzdFR5cGUgPSBcIkRFTEVURVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJnZXRSZWNlbnRTZWFyY2hlc1wiOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmVxdWVzdFR5cGUgPSBcIkdFVFwiO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXF1ZXN0ID1cbiAgICAgICQuYWpheCh7XG4gICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKGFYSFIpIHtcbiAgICAgICAgICBhWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICBcIkNvbnRlbnRcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgIGFYSFIuc2V0UmVxdWVzdEhlYWRlcihcbiAgICAgICAgICAgIFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICAgICAgICBhWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICBcIlgtRUJBWS1DLU1BUktFVFBMQUNFLUlEXCIsIHNpdGVJZCk7XG4gICAgICAgICAgLy8gVG9Ebzogd2hhdCBhcmUgdGhlIHZhbHVlcz9cbiAgICAgICAgICBhWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICBcIlgtRUJBWS1DLUlERU5USVRZXCIsIFwiaWQ9MTIzO2lkcD00NTZcIik7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgXCJYLUVCQVktQy1FTkRVU0VSQ1RYXCIsXG4gICAgICAgICAgICBcImRldmljZUlkPVwiICsgcGFyYW1zLmRldmljZUlkICtcbiAgICAgICAgICAgIFwiLGRldmljZUlkU291cmNlPVwiICsgcGFyYW1zLmRldmljZUlkU291cmNlICtcbiAgICAgICAgICAgIFwiLGFwcFZlcnNpb249XCIgKyBwYXJhbXMuYXBwVmVyc2lvbik7XG4gICAgICAgICAgLy9yZW1vdmUgdGhlIFwiSWYtTW9kaWZpZWQtU2luY2VcIiBoZWFkZXIgc28gd2UgZG9uJ3QgaGF2ZSBjYWNoaW5nIGlzc3Vlc1xuICAgICAgICAgIGFYSFIuc2V0UmVxdWVzdEhlYWRlcihcIklmLU1vZGlmaWVkLVNpbmNlXCIsIFwiXCIpO1xuXG4gICAgICAgICAgaWYgKGFjY291bnQpIHtcbiAgICAgICAgICAgIHZhciB0b2tlbiA9IGFjY291bnQuZ2V0KFwidG9rZW5cIik7XG4gICAgICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiLCBcIklBRiBcIiArIHRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBkYXRhOiBwYXJhbWV0ZXJzU3RyaW5nLFxuICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgIHR5cGU6IHJlcXVlc3RUeXBlLFxuICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIGpzb25wOiBmYWxzZSxcbiAgICAgICAgdGltZW91dDogUHJvcGVydHlEQU8uZ2V0KFByb3BlcnR5REFPLlBST1BfQVBJX1RJTUVPVVQpLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihhRGF0YSwgYVRleHRTdGF0dXMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCF0aGF0Ll92YWxpZGF0ZVJlc3BvbnNlKGFEYXRhKSkge1xuICAgICAgICAgICAgICBhRGF0YSA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBNZXNzYWdlUGFuZWxTZXJ2aWNlLmRpc21pc3NNZXNzYWdlKE1lc3NhZ2VQYW5lbFNlcnZpY2UuVFlQRS5DT05ORUNUX0VSUk9SKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgYUNhbGxiYWNrKGFEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIFV0aWxpdHlIZWxwZXIuaGFuZGxlRXJyb3IoXCJNRURTQXBpXCIsIGFSZXF1ZXN0TmFtZSwgZS5tZXNzYWdlLCBhQ2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGFYSFIsIGFUZXh0U3RhdHVzLCBhRXJyb3IpIHtcbiAgICAgICAgICBNRURTQXBpLl9jaGVja1Rva2VuRXhwaXJlZChhWEhSKTtcbiAgICAgICAgICBNRURTQXBpLl9jaGVja0RhdGFOb0ZvdW5kKGFYSFIpO1xuICAgICAgICAgIFV0aWxpdHlIZWxwZXIuaGFuZGxlRXJyb3IoXCJNRURTQXBpXCIsIGFSZXF1ZXN0TmFtZSwgYVhIUi5yZXNwb25zZVRleHQsIGFDYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy8gYWRkIHBlbmRpbmcgcmVxdWVzdCB0byBhIGxpc3Qgc28gcGVuZGluZyByZXF1ZXN0IHdvdWxkIGJlIGNhbmNlbGxlZCBmb3JcbiAgICAvLyBhIGxvbmcgcGVyaW9kIG9mIHRpbWUgYW5kIGFsc28gYWxsIHBlbmRpbmcgcmVxdWVzdHMgY2FuIGJlIGFib3J0ZWQgd2hlblxuICAgIC8vIHVzZXIgc2lnbnMgb3V0LlxuICAgIEFwaUhlbHBlci5hZGRQZW5kaW5nUmVxdWVzdChyZXF1ZXN0LCBhUmVxdWVzdE5hbWUsIFRvcGljcy5SRUNFTlRfU0VBUkNIRVNfVVBEQVRFRCk7XG5cbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfVxufTtcbiJdfQ==