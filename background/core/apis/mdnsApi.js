/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var MDNSApi = {
    _XML_NAMESPACE: "xmlns:ser=\"http://www.ebay.com/marketplace/mobile/v1/services\"",
    activateUserOnDevice: function (aToken, aDeviceToken, aUserId, aSiteId, aGlobalId, aDeviceId, aCallback) {
        if (!aToken) {
            Logger.error("Attempt to make MDNSApi API " +
                "activateUserOnDevice call when no account is active.");
            return;
        }
        var wrappedBody;
        var localCallback;
        var request;
        var innerBody = "<ser:userId>" + aUserId + "</ser:userId>" +
            "<ser:deviceHandle>" +
            "<ser:deviceToken>" + aDeviceToken + "</ser:deviceToken>" +
            "<ser:deviceType>GCM</ser:deviceType>" +
            "<ser:client>BRWSRCHROME</ser:client>" +
            "</ser:deviceHandle>" +
            "<ser:description>eBay extension for Google Chrome</ser:description>" +
            "<ser:language>en-US</ser:language>";
        wrappedBody = this._wrapCall("activateUserOnDevice", innerBody);
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
                Logger.error("MDNSApi.activateUserOnDevice Error: " +
                    e.message);
            }
        };
        request = this._doCall(wrappedBody, "activateUserOnDevice", aToken, aSiteId, aGlobalId, aDeviceId, localCallback);
        return request;
    },
    deactivateUserOnDevice: function (aToken, aDeviceToken, aUserId, aSiteId, aGlobalId, aDeviceId, aCallback) {
        if (!aToken) {
            Logger.error("Attempt to make MDNSApi API " +
                "deactivateUserOnDevice call when no account is active.");
            return;
        }
        var wrappedBody;
        var localCallback;
        var request;
        var innerBody = "<ser:userId>" + aUserId + "</ser:userId>" +
            "<ser:deviceHandle>" +
            "<ser:deviceToken>" + aDeviceToken + "</ser:deviceToken>" +
            "<ser:deviceType>GCM</ser:deviceType>" +
            "<ser:client>BRWSRCHROME</ser:client>" +
            "</ser:deviceHandle>" +
            "<ser:description>eBay extension for Google Chrome</ser:description>" +
            "<ser:language>en-US</ser:language>";
        wrappedBody = this._wrapCall("deactivateUserOnDevice", innerBody);
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
                Logger.error("MDNSApi.deactivateUserOnDevice Error: " +
                    e.message);
            }
        };
        request = this._doCall(wrappedBody, "deactivateUserOnDevice", aToken, aSiteId, aGlobalId, aDeviceId, localCallback);
        return request;
    },
    setDeviceNotificationSubscriptions: function (aToken, aDeviceToken, aUserId, aSiteId, aGlobalId, aDeviceId, aCallback) {
        if (!aToken) {
            Logger.error("Attempt to make MDNSApi API " +
                "setDeviceNotificationSubscriptions call when no account is active.");
            return;
        }
        var wrappedBody;
        var localCallback;
        var request;
        var innerBody = "<ser:userId>" + aUserId + "</ser:userId>" +
            "<ser:deviceHandle>" +
            "<ser:deviceToken>" + aDeviceToken + "</ser:deviceToken>" +
            "<ser:deviceType>GCM</ser:deviceType>" +
            "<ser:client>BRWSRCHROME</ser:client>" +
            "</ser:deviceHandle>" +
            "<ser:description>eBay extension for Google Chrome</ser:description>" +
            "<ser:language>en-US</ser:language>" +
            "<ser:preferences>" +
            "<ser:preference>" +
            "<ser:eventName>WATCHITM</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "<ser:properties>" +
            "<ser:name>TimeLeft</ser:name>" +
            "<ser:value>15</ser:value>" +
            "</ser:properties>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>OUTBID</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>BESTOFR</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>BODECLND</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>CNTROFFR</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>ITMSHPD</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>ITMPAID</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>BIDRCVD</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>ITMSOLD</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>ITMWON</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>COCMPLT</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>BIDITEM</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>PAYREM</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>MSGM2MMSGHDR</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "</ser:preference>" +
            "<ser:preference>" +
            "<ser:eventName>INTERNAL_BADGE</ser:eventName>" +
            "<ser:state>Enable</ser:state>" +
            "<ser:deliveryPolicyType>RealTime</ser:deliveryPolicyType>" +
            "</ser:preference>" +
            "</ser:preferences>";
        wrappedBody = this._wrapCall("setDeviceNotificationSubscriptions", innerBody);
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
                Logger.error("MDNSApi.setDeviceNotificationSubscriptions Error: " +
                    e.message);
            }
        };
        request = this._doCall(wrappedBody, "setDeviceNotificationSubscriptions", aToken, aSiteId, aGlobalId, aDeviceId, localCallback);
        return request;
    },
    getDeviceNotificationSubscriptions: function (aToken, aDeviceToken, aUserId, aSiteId, aGlobalId, aDeviceId, aCallback) {
        if (!aToken) {
            Logger.error("Attempt to make MDNSApi API " +
                "getDeviceNotificationSubscriptions call when no account is active.");
            return;
        }
        var wrappedBody;
        var localCallback;
        var request;
        var innerBody = "<ser:userId>" + aUserId + "</ser:userId>" +
            "<ser:deviceHandle>" +
            "<ser:deviceToken>" + aDeviceToken + "</ser:deviceToken>" +
            "<ser:deviceType>GCM</ser:deviceType>" +
            "<ser:client>BRWSRCHROME</ser:client>" +
            "</ser:deviceHandle>";
        wrappedBody = this._wrapCall("getDeviceNotificationSubscriptions", innerBody);
        localCallback = function (aResponse) {
            var result = {};
            try {
                if (aCallback) {
                    if (!aResponse) {
                        result.errors = true;
                    }
                    var active = $(aResponse).find("active");
                    result.active = (active.text().indexOf("true") != -1);
                    var subscriptions = $(aResponse).find("preference");
                    result.subscriptions = subscriptions.length;
                    aCallback(result);
                }
            }
            catch (e) {
                Logger.error("MDNSApi.getDeviceNotificationSubscriptions Error: " +
                    e.message);
            }
        };
        request = this._doCall(wrappedBody, "getDeviceNotificationSubscriptions", aToken, aSiteId, aGlobalId, aDeviceId, localCallback);
        return request;
    },
    _validateResponse: function (aResponse) {
        if (!aResponse) {
            Logger.error("MDNSApi error (no reponse document!)");
            return false;
        }
        var node = $(aResponse).find("ack");
        if (!node) {
            Logger.error("MDNSApi error (no Ack node!)");
            return false;
        }
        if ($(node).text() != "Success") {
            $.each($(aResponse).find("error"), function () {
                var errorCode = Number($(this).find("errorId").text());
                var severity = String($(this).find("severity").text());
                if (severity.indexOf("Error") != -1) {
                    var errorMsg = "MDNSApi API Error:\n" + "Error Code: " +
                        errorCode + "\Message: " +
                        String($(this).find("message").text()) +
                        "\nSeverity: " + severity +
                        "\nError category: " +
                        String($(this).find("category").text()) + "\n";
                    Logger.error(errorMsg);
                    ObserverHelper.notify(Topics.DEBUG_MESSAGE, errorMsg);
                }
            });
            return false;
        }
        return true;
    },
    _wrapCall: function (aRequestName, aInnerBody) {
        var soapRequest = "<soapenv:Envelope " +
            "xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
            this._XML_NAMESPACE + ">";
        soapRequest += "<soapenv:Header/>";
        soapRequest += "<soapenv:Body>";
        soapRequest += "<ser:" + aRequestName + ">";
        soapRequest += aInnerBody;
        soapRequest += "</ser:" + aRequestName + ">";
        soapRequest += "</soapenv:Body>";
        soapRequest += "</soapenv:Envelope>";
        return soapRequest;
    },
    _doCall: function (aRequestBody, aRequestName, aToken, aSiteId, aGlobalId, aDeviceId, aCallback) {
        var that = this;
        var request = $.ajax({
            beforeSend: function (aXHR) {
                aXHR.setRequestHeader("X-EBAY-SOA-OPERATION-NAME", aRequestName);
                aXHR.setRequestHeader("X-EBAY-SOA-SECURITY-IAFTOKEN", aToken);
                aXHR.setRequestHeader("X-EBAY-SOA-SERVICE-NAME", "MobileDeviceNotificationService");
                aXHR.setRequestHeader("X-EBAY-SOA-MESSAGE-PROTOCOL", "SOAP12");
                aXHR.setRequestHeader("X-EBAY-SOA-CONSUMER-ID", ApiHelper.getEndPoint("clientId"));
                aXHR.setRequestHeader("X-EBAY-SOA-REQUEST-DATA-FORMAT", "XML");
                aXHR.setRequestHeader("X-EBAY-SOA-GLOBAL-ID", aGlobalId);
                aXHR.setRequestHeader("X-EBAY3PP-DEVICE-ID", aDeviceId);
            },
            type: "POST",
            contentType: "text/xml",
            url: ApiHelper.getEndPoint("mdnsApi"),
            data: aRequestBody,
            dataType: "xml",
            jsonp: false,
            timeout: PropertyDAO.get(PropertyDAO.PROP_API_TIMEOUT),
            success: function (aData, aTextStatus) {
                try {
                    if (aTextStatus == "success") {
                        var validation = that._validateResponse(aData);
                        if (!validation) {
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
                    UtilityHelper.handleError("MDNSApi", aRequestName, e.message, aCallback);
                }
            },
            error: function (aXHR, aTextStatus, aError) {
                UtilityHelper.checkTokenExpired(aXHR);
                UtilityHelper.handleError("MDNSApi", aRequestName, aXHR.responseText, aCallback);
            }
        });
        ApiHelper.addPendingRequest(request, aRequestName);
        return request;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWRuc0FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2tncm91bmQvY29yZS9hcGlzL21kbnNBcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFlSCxJQUFJLE9BQU8sR0FBRztJQUNaLGNBQWMsRUFBRyxrRUFBa0U7SUFhbkYsb0JBQW9CLEVBQUcsVUFBUyxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3RDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUztRQUU3RCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QjtnQkFDOUIsc0RBQXNELENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsSUFBSSxXQUFXLENBQUM7UUFDaEIsSUFBSSxhQUFhLENBQUM7UUFDbEIsSUFBSSxPQUFPLENBQUM7UUFDWixJQUFJLFNBQVMsR0FBRyxjQUFjLEdBQUcsT0FBTyxHQUFHLGVBQWU7WUFDdEQsb0JBQW9CO1lBQ2xCLG1CQUFtQixHQUFHLFlBQVksR0FBRyxvQkFBb0I7WUFDekQsc0NBQXNDO1lBQ3RDLHNDQUFzQztZQUN4QyxxQkFBcUI7WUFDckIscUVBQXFFO1lBQ3JFLG9DQUFvQyxDQUFDO1FBR3pDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hFLGFBQWEsR0FBRyxVQUFTLFNBQVM7WUFDaEMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBRWhCLElBQUksQ0FBQztnQkFDSCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFDZixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztvQkFDdkIsQ0FBQztvQkFD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QUFFLENBQUMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUMvQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7NEJBQ2hCLEtBQUssR0FBRyxJQUFJLENBQUM7d0JBQ2YsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDTixtQkFBbUIsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUM3RSxDQUFDO3dCQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ2QsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNuQixDQUFDO29CQUNILENBQUM7Z0JBQ0gsQ0FBQztnQkFBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNWLGFBQWEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMzRSxDQUFDO1lBQ0gsQ0FBQztZQUNELEtBQUssRUFBRSxVQUFTLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTTtnQkFDdkMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNuRixDQUFDO1NBQ0YsQ0FBQyxDQUFDO1FBS0wsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVuRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDctMjAxNSBlQmF5IEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqL1xuXG4vKlxuICB2YXIgTG9nZ2VyID0gcmVxdWlyZShcImhlbHBlcnMvbG9nZ2VyXCIpLkxvZ2dlcjtcbiAgdmFyIFRvcGljcyA9IHJlcXVpcmUoXCJoZWxwZXJzL29ic2VydmVySGVscGVyXCIpLlRvcGljcztcbiAgdmFyIE9ic2VydmVySGVscGVyID0gcmVxdWlyZShcImhlbHBlcnMvb2JzZXJ2ZXJIZWxwZXJcIikuT2JzZXJ2ZXJIZWxwZXI7XG4gIHZhciBVdGlsaXR5SGVscGVyID0gcmVxdWlyZShcImhlbHBlcnMvdXRpbGl0eUhlbHBlclwiKS5VdGlsaXR5SGVscGVyO1xuICB2YXIgQXBpSGVscGVyID0gcmVxdWlyZShcImNvcmUvaGVscGVycy9hcGlIZWxwZXJcIikuQXBpSGVscGVyO1xuICB2YXIgTWVzc2FnZVBhbmVsU2VydmljZSA9IHJlcXVpcmUoXCJjb3JlL3NlcnZpY2VzL21lc3NhZ2VQYW5lbFNlcnZpY2VcIikuTWVzc2FnZVBhbmVsU2VydmljZTtcbiAgdmFyIFByb3BlcnR5REFPID0gcmVxdWlyZShcInN0b3JhZ2UvcHJvcGVydHlEQU9cIikuUHJvcGVydHlEQU87XG4qL1xuXG4vKipcbiAqIE1ETlNBcGkgQVBJIGFjdGlvbnNcbiAqL1xudmFyIE1ETlNBcGkgPSB7XG4gIF9YTUxfTkFNRVNQQUNFIDogXCJ4bWxuczpzZXI9XFxcImh0dHA6Ly93d3cuZWJheS5jb20vbWFya2V0cGxhY2UvbW9iaWxlL3YxL3NlcnZpY2VzXFxcIlwiLFxuXG4gIC8qKlxuICAgKiBNRE5TIEFQSSBhY3RpdmF0ZVVzZXJPbkRldmljZVxuICAgKiBAcGFyYW0gYVRva2VuIHRoZSB0b2tlbiB0byB1c2UgaW4gdGhlIHJlcXVlc3RcbiAgICogQHBhcmFtIGFEZXZpY2VUb2tlbiB0aGUgcmVnaXN0cmF0aW9uIGlkIHJldHVybmVkIGJ5IEdDTVxuICAgKiBAcGFyYW0gYVVzZXJJZCB0aGUgdXNlciB0byBiZSByZWdpc3RlcmVkXG4gICAqIEBwYXJhbSBhU2l0ZUlkIHRoZSBzaXRlIGlkXG4gICAqIEBwYXJhbSBhR2xvYmFsSWQgVGhlIGdsb2JhbCBpZFxuICAgKiBAcGFyYW0gYURldmljZUlkIHRoZSBkZXZpY2UgaWRcbiAgICogQHBhcmFtIGFDYWxsYmFjay5cbiAgICogQHJldHVybnMgcmVxdWVzdCBvYmplY3RcbiAgICovXG4gIGFjdGl2YXRlVXNlck9uRGV2aWNlIDogZnVuY3Rpb24oYVRva2VuLCBhRGV2aWNlVG9rZW4sIGFVc2VySWQsIGFTaXRlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYUdsb2JhbElkLCBhRGV2aWNlSWQsIGFDYWxsYmFjaykge1xuICAgIFxuICAgIGlmICghYVRva2VuKSB7XG4gICAgICBMb2dnZXIuZXJyb3IoXCJBdHRlbXB0IHRvIG1ha2UgTUROU0FwaSBBUEkgXCIgK1xuICAgICAgICAgICAgICAgICAgIFwiYWN0aXZhdGVVc2VyT25EZXZpY2UgY2FsbCB3aGVuIG5vIGFjY291bnQgaXMgYWN0aXZlLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgd3JhcHBlZEJvZHk7XG4gICAgdmFyIGxvY2FsQ2FsbGJhY2s7XG4gICAgdmFyIHJlcXVlc3Q7XG4gICAgdmFyIGlubmVyQm9keSA9IFwiPHNlcjp1c2VySWQ+XCIgKyBhVXNlcklkICsgXCI8L3Nlcjp1c2VySWQ+XCIgK1xuICAgICAgICBcIjxzZXI6ZGV2aWNlSGFuZGxlPlwiICtcbiAgICAgICAgICBcIjxzZXI6ZGV2aWNlVG9rZW4+XCIgKyBhRGV2aWNlVG9rZW4gKyBcIjwvc2VyOmRldmljZVRva2VuPlwiICtcbiAgICAgICAgICBcIjxzZXI6ZGV2aWNlVHlwZT5HQ008L3NlcjpkZXZpY2VUeXBlPlwiICtcbiAgICAgICAgICBcIjxzZXI6Y2xpZW50PkJSV1NSQ0hST01FPC9zZXI6Y2xpZW50PlwiICtcbiAgICAgICAgXCI8L3NlcjpkZXZpY2VIYW5kbGU+XCIgK1xuICAgICAgICBcIjxzZXI6ZGVzY3JpcHRpb24+ZUJheSBleHRlbnNpb24gZm9yIEdvb2dsZSBDaHJvbWU8L3NlcjpkZXNjcmlwdGlvbj5cIiArXG4gICAgICAgIFwiPHNlcjpsYW5ndWFnZT5lbi1VUzwvc2VyOmxhbmd1YWdlPlwiO1xuXG4gICAgLy8gZG8gdGhlIGNhbGxcbiAgICB3cmFwcGVkQm9keSA9IHRoaXMuX3dyYXBDYWxsKFwiYWN0aXZhdGVVc2VyT25EZXZpY2VcIiwgaW5uZXJCb2R5KTtcbiAgICBsb2NhbENhbGxiYWNrID0gZnVuY3Rpb24oYVJlc3BvbnNlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgICBpZiAoIWFSZXNwb25zZSkge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9ycyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFDYWxsYmFjayhyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIExvZ2dlci5lcnJvcihcIk1ETlNBcGkuYWN0aXZhdGVVc2VyT25EZXZpY2UgRXJyb3I6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgIGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3QgPSB0aGlzLl9kb0NhbGwod3JhcHBlZEJvZHksIFwiYWN0aXZhdGVVc2VyT25EZXZpY2VcIiwgYVRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYVNpdGVJZCwgYUdsb2JhbElkLCBhRGV2aWNlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENhbGxiYWNrKTtcblxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBNRE5TIEFQSSBkZWFjdGl2YXRlVXNlck9uRGV2aWNlXG4gICAqIEBwYXJhbSBhVG9rZW4gdGhlIHRva2VuIHRvIHVzZSBpbiB0aGUgcmVxdWVzdFxuICAgKiBAcGFyYW0gYURldmljZVRva2VuIHRoZSByZWdpc3RyYXRpb24gaWQgcmV0dXJuZWQgYnkgR0NNXG4gICAqIEBwYXJhbSBhVXNlcklkIHRoZSB1c2VyIHRvIGJlIHJlZ2lzdGVyZWRcbiAgICogQHBhcmFtIGFTaXRlSWQgdGhlIHNpdGUgaWRcbiAgICogQHBhcmFtIGFHbG9iYWxJZCBUaGUgZ2xvYmFsIGlkXG4gICAqIEBwYXJhbSBhRGV2aWNlSWQgdGhlIGRldmljZSBpZFxuICAgKiBAcGFyYW0gYUNhbGxiYWNrLlxuICAgKiBAcmV0dXJucyByZXF1ZXN0IG9iamVjdFxuICAgKi9cbiAgZGVhY3RpdmF0ZVVzZXJPbkRldmljZSA6IGZ1bmN0aW9uKGFUb2tlbiwgYURldmljZVRva2VuLCBhVXNlcklkLCBhU2l0ZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYUdsb2JhbElkLCBhRGV2aWNlSWQsIGFDYWxsYmFjaykge1xuICAgIFxuICAgIGlmICghYVRva2VuKSB7XG4gICAgICBMb2dnZXIuZXJyb3IoXCJBdHRlbXB0IHRvIG1ha2UgTUROU0FwaSBBUEkgXCIgK1xuICAgICAgICAgICAgICAgICAgIFwiZGVhY3RpdmF0ZVVzZXJPbkRldmljZSBjYWxsIHdoZW4gbm8gYWNjb3VudCBpcyBhY3RpdmUuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB3cmFwcGVkQm9keTtcbiAgICB2YXIgbG9jYWxDYWxsYmFjaztcbiAgICB2YXIgcmVxdWVzdDtcbiAgICB2YXIgaW5uZXJCb2R5ID0gXCI8c2VyOnVzZXJJZD5cIiArIGFVc2VySWQgKyBcIjwvc2VyOnVzZXJJZD5cIiArXG4gICAgICAgIFwiPHNlcjpkZXZpY2VIYW5kbGU+XCIgK1xuICAgICAgICAgIFwiPHNlcjpkZXZpY2VUb2tlbj5cIiArIGFEZXZpY2VUb2tlbiArIFwiPC9zZXI6ZGV2aWNlVG9rZW4+XCIgK1xuICAgICAgICAgIFwiPHNlcjpkZXZpY2VUeXBlPkdDTTwvc2VyOmRldmljZVR5cGU+XCIgK1xuICAgICAgICAgIFwiPHNlcjpjbGllbnQ+QlJXU1JDSFJPTUU8L3NlcjpjbGllbnQ+XCIgK1xuICAgICAgICBcIjwvc2VyOmRldmljZUhhbmRsZT5cIiArXG4gICAgICAgIFwiPHNlcjpkZXNjcmlwdGlvbj5lQmF5IGV4dGVuc2lvbiBmb3IgR29vZ2xlIENocm9tZTwvc2VyOmRlc2NyaXB0aW9uPlwiICtcbiAgICAgICAgXCI8c2VyOmxhbmd1YWdlPmVuLVVTPC9zZXI6bGFuZ3VhZ2U+XCI7XG5cbiAgICAvLyBkbyB0aGUgY2FsbFxuICAgIHdyYXBwZWRCb2R5ID0gdGhpcy5fd3JhcENhbGwoXCJkZWFjdGl2YXRlVXNlck9uRGV2aWNlXCIsIGlubmVyQm9keSk7XG4gICAgbG9jYWxDYWxsYmFjayA9IGZ1bmN0aW9uKGFSZXNwb25zZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoYUNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFhUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcnMgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhQ2FsbGJhY2socmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBMb2dnZXIuZXJyb3IoXCJNRE5TQXBpLmRlYWN0aXZhdGVVc2VyT25EZXZpY2UgRXJyb3I6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgIGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3QgPSB0aGlzLl9kb0NhbGwod3JhcHBlZEJvZHksIFwiZGVhY3RpdmF0ZVVzZXJPbkRldmljZVwiLCBhVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhU2l0ZUlkLCBhR2xvYmFsSWQsIGFEZXZpY2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH0sXG5cbiAgLyoqXG4gICAqIE1ETlMgQVBJIHNldERldmljZU5vdGlmaWNhdGlvblN1YnNjcmlwdGlvbnNcbiAgICogQHBhcmFtIGFUb2tlbiB0aGUgdG9rZW4gdG8gdXNlIGluIHRoZSByZXF1ZXN0XG4gICAqIEBwYXJhbSBhRGV2aWNlVG9rZW4gdGhlIHJlZ2lzdHJhdGlvbiBpZCByZXR1cm5lZCBieSBHQ01cbiAgICogQHBhcmFtIGFVc2VySWQgdGhlIHVzZXIgdG8gYmUgcmVnaXN0ZXJlZFxuICAgKiBAcGFyYW0gYVNpdGVJZCB0aGUgc2l0ZSBpZFxuICAgKiBAcGFyYW0gYUdsb2JhbElkIFRoZSBnbG9iYWwgaWRcbiAgICogQHBhcmFtIGFEZXZpY2VJZCB0aGUgZGV2aWNlIGlkXG4gICAqIEBwYXJhbSBhQ2FsbGJhY2suXG4gICAqIEByZXR1cm5zIHJlcXVlc3Qgb2JqZWN0XG4gICAqL1xuICBzZXREZXZpY2VOb3RpZmljYXRpb25TdWJzY3JpcHRpb25zIDogZnVuY3Rpb24oYVRva2VuLCBhRGV2aWNlVG9rZW4sIGFVc2VySWQsIGFTaXRlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhR2xvYmFsSWQsIGFEZXZpY2VJZCwgYUNhbGxiYWNrKSB7XG4gICAgXG4gICAgaWYgKCFhVG9rZW4pIHtcbiAgICAgIExvZ2dlci5lcnJvcihcIkF0dGVtcHQgdG8gbWFrZSBNRE5TQXBpIEFQSSBcIiArXG4gICAgICAgICAgICAgICAgICAgXCJzZXREZXZpY2VOb3RpZmljYXRpb25TdWJzY3JpcHRpb25zIGNhbGwgd2hlbiBubyBhY2NvdW50IGlzIGFjdGl2ZS5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHdyYXBwZWRCb2R5O1xuICAgIHZhciBsb2NhbENhbGxiYWNrO1xuICAgIHZhciByZXF1ZXN0O1xuICAgIHZhciBpbm5lckJvZHkgPSBcIjxzZXI6dXNlcklkPlwiICsgYVVzZXJJZCArIFwiPC9zZXI6dXNlcklkPlwiICtcbiAgICAgICAgXCI8c2VyOmRldmljZUhhbmRsZT5cIiArXG4gICAgICAgICAgXCI8c2VyOmRldmljZVRva2VuPlwiICsgYURldmljZVRva2VuICsgXCI8L3NlcjpkZXZpY2VUb2tlbj5cIiArXG4gICAgICAgICAgXCI8c2VyOmRldmljZVR5cGU+R0NNPC9zZXI6ZGV2aWNlVHlwZT5cIiArXG4gICAgICAgICAgXCI8c2VyOmNsaWVudD5CUldTUkNIUk9NRTwvc2VyOmNsaWVudD5cIiArXG4gICAgICAgIFwiPC9zZXI6ZGV2aWNlSGFuZGxlPlwiICtcbiAgICAgICAgXCI8c2VyOmRlc2NyaXB0aW9uPmVCYXkgZXh0ZW5zaW9uIGZvciBHb29nbGUgQ2hyb21lPC9zZXI6ZGVzY3JpcHRpb24+XCIgK1xuICAgICAgICBcIjxzZXI6bGFuZ3VhZ2U+ZW4tVVM8L3NlcjpsYW5ndWFnZT5cIiArXG4gICAgICAgIFwiPHNlcjpwcmVmZXJlbmNlcz5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5XQVRDSElUTTwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOnByb3BlcnRpZXM+XCIgK1xuICAgICAgICAgICAgICBcIjxzZXI6bmFtZT5UaW1lTGVmdDwvc2VyOm5hbWU+XCIgK1xuICAgICAgICAgICAgICBcIjxzZXI6dmFsdWU+MTU8L3Nlcjp2YWx1ZT5cIiArXG4gICAgICAgICAgICBcIjwvc2VyOnByb3BlcnRpZXM+XCIgK1xuICAgICAgICAgIFwiPC9zZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5PVVRCSUQ8L3NlcjpldmVudE5hbWU+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOnN0YXRlPkVuYWJsZTwvc2VyOnN0YXRlPlwiICtcbiAgICAgICAgICBcIjwvc2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgIFwiPHNlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgICAgIFwiPHNlcjpldmVudE5hbWU+QkVTVE9GUjwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgIFwiPC9zZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5CT0RFQ0xORDwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgIFwiPC9zZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5DTlRST0ZGUjwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgIFwiPC9zZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5JVE1TSFBEPC9zZXI6ZXZlbnROYW1lPlwiICtcbiAgICAgICAgICAgIFwiPHNlcjpzdGF0ZT5FbmFibGU8L3NlcjpzdGF0ZT5cIiArXG4gICAgICAgICAgXCI8L3NlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgICBcIjxzZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6ZXZlbnROYW1lPklUTVBBSUQ8L3NlcjpldmVudE5hbWU+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOnN0YXRlPkVuYWJsZTwvc2VyOnN0YXRlPlwiICtcbiAgICAgICAgICBcIjwvc2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgIFwiPHNlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgICAgIFwiPHNlcjpldmVudE5hbWU+QklEUkNWRDwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgIFwiPC9zZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5JVE1TT0xEPC9zZXI6ZXZlbnROYW1lPlwiICtcbiAgICAgICAgICAgIFwiPHNlcjpzdGF0ZT5FbmFibGU8L3NlcjpzdGF0ZT5cIiArXG4gICAgICAgICAgXCI8L3NlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgICBcIjxzZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6ZXZlbnROYW1lPklUTVdPTjwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgIFwiPC9zZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5DT0NNUExUPC9zZXI6ZXZlbnROYW1lPlwiICtcbiAgICAgICAgICAgIFwiPHNlcjpzdGF0ZT5FbmFibGU8L3NlcjpzdGF0ZT5cIiArXG4gICAgICAgICAgXCI8L3NlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgICBcIjxzZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6ZXZlbnROYW1lPkJJRElURU08L3NlcjpldmVudE5hbWU+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOnN0YXRlPkVuYWJsZTwvc2VyOnN0YXRlPlwiICtcbiAgICAgICAgICBcIjwvc2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgIFwiPHNlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgICAgIFwiPHNlcjpldmVudE5hbWU+UEFZUkVNPC9zZXI6ZXZlbnROYW1lPlwiICtcbiAgICAgICAgICAgIFwiPHNlcjpzdGF0ZT5FbmFibGU8L3NlcjpzdGF0ZT5cIiArXG4gICAgICAgICAgXCI8L3NlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgICBcIjxzZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6ZXZlbnROYW1lPk1TR00yTU1TR0hEUjwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgIFwiPC9zZXI6cHJlZmVyZW5jZT5cIiArXG4gICAgICAgICAgXCI8c2VyOnByZWZlcmVuY2U+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmV2ZW50TmFtZT5JTlRFUk5BTF9CQURHRTwvc2VyOmV2ZW50TmFtZT5cIiArXG4gICAgICAgICAgICBcIjxzZXI6c3RhdGU+RW5hYmxlPC9zZXI6c3RhdGU+XCIgK1xuICAgICAgICAgICAgXCI8c2VyOmRlbGl2ZXJ5UG9saWN5VHlwZT5SZWFsVGltZTwvc2VyOmRlbGl2ZXJ5UG9saWN5VHlwZT5cIiArXG4gICAgICAgICAgXCI8L3NlcjpwcmVmZXJlbmNlPlwiICtcbiAgICAgICAgXCI8L3NlcjpwcmVmZXJlbmNlcz5cIjtcblxuICAgIC8vIGRvIHRoZSBjYWxsXG4gICAgd3JhcHBlZEJvZHkgPSB0aGlzLl93cmFwQ2FsbChcInNldERldmljZU5vdGlmaWNhdGlvblN1YnNjcmlwdGlvbnNcIiwgaW5uZXJCb2R5KTtcbiAgICBsb2NhbENhbGxiYWNrID0gZnVuY3Rpb24oYVJlc3BvbnNlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhQ2FsbGJhY2spIHtcbiAgICAgICAgICBpZiAoIWFSZXNwb25zZSkge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9ycyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFDYWxsYmFjayhyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIExvZ2dlci5lcnJvcihcIk1ETlNBcGkuc2V0RGV2aWNlTm90aWZpY2F0aW9uU3Vic2NyaXB0aW9ucyBFcnJvcjogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdCA9IHRoaXMuX2RvQ2FsbCh3cmFwcGVkQm9keSwgXCJzZXREZXZpY2VOb3RpZmljYXRpb25TdWJzY3JpcHRpb25zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhVG9rZW4sIGFTaXRlSWQsIGFHbG9iYWxJZCwgYURldmljZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDYWxsYmFjayk7XG5cbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfSxcblxuICAvKipcbiAgICogTUROUyBBUEkgZ2V0RGV2aWNlTm90aWZpY2F0aW9uU3Vic2NyaXB0aW9uc1xuICAgKiBAcGFyYW0gYVRva2VuIHRoZSB0b2tlbiB0byB1c2UgaW4gdGhlIHJlcXVlc3RcbiAgICogQHBhcmFtIGFEZXZpY2VUb2tlbiB0aGUgcmVnaXN0cmF0aW9uIGlkIHJldHVybmVkIGJ5IEdDTVxuICAgKiBAcGFyYW0gYVVzZXJJZCB0aGUgdXNlciB0byBiZSByZWdpc3RlcmVkXG4gICAqIEBwYXJhbSBhU2l0ZUlkIHRoZSBzaXRlIGlkXG4gICAqIEBwYXJhbSBhR2xvYmFsSWQgVGhlIGdsb2JhbCBpZFxuICAgKiBAcGFyYW0gYURldmljZUlkIHRoZSBkZXZpY2UgaWRcbiAgICogQHBhcmFtIGFDYWxsYmFjay5cbiAgICogQHJldHVybnMgcmVxdWVzdCBvYmplY3RcbiAgICovXG4gIGdldERldmljZU5vdGlmaWNhdGlvblN1YnNjcmlwdGlvbnMgOiBmdW5jdGlvbihhVG9rZW4sIGFEZXZpY2VUb2tlbiwgYVVzZXJJZCwgYVNpdGVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFHbG9iYWxJZCwgYURldmljZUlkLCBhQ2FsbGJhY2spIHtcbiAgICBcbiAgICBpZiAoIWFUb2tlbikge1xuICAgICAgTG9nZ2VyLmVycm9yKFwiQXR0ZW1wdCB0byBtYWtlIE1ETlNBcGkgQVBJIFwiICtcbiAgICAgICAgICAgICAgICAgICBcImdldERldmljZU5vdGlmaWNhdGlvblN1YnNjcmlwdGlvbnMgY2FsbCB3aGVuIG5vIGFjY291bnQgaXMgYWN0aXZlLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgd3JhcHBlZEJvZHk7XG4gICAgdmFyIGxvY2FsQ2FsbGJhY2s7XG4gICAgdmFyIHJlcXVlc3Q7XG4gICAgdmFyIGlubmVyQm9keSA9IFwiPHNlcjp1c2VySWQ+XCIgKyBhVXNlcklkICsgXCI8L3Nlcjp1c2VySWQ+XCIgK1xuICAgICAgICBcIjxzZXI6ZGV2aWNlSGFuZGxlPlwiICtcbiAgICAgICAgICBcIjxzZXI6ZGV2aWNlVG9rZW4+XCIgKyBhRGV2aWNlVG9rZW4gKyBcIjwvc2VyOmRldmljZVRva2VuPlwiICtcbiAgICAgICAgICBcIjxzZXI6ZGV2aWNlVHlwZT5HQ008L3NlcjpkZXZpY2VUeXBlPlwiICtcbiAgICAgICAgICBcIjxzZXI6Y2xpZW50PkJSV1NSQ0hST01FPC9zZXI6Y2xpZW50PlwiICtcbiAgICAgICAgXCI8L3NlcjpkZXZpY2VIYW5kbGU+XCI7XG5cbiAgICAvLyBkbyB0aGUgY2FsbFxuICAgIHdyYXBwZWRCb2R5ID0gdGhpcy5fd3JhcENhbGwoXCJnZXREZXZpY2VOb3RpZmljYXRpb25TdWJzY3JpcHRpb25zXCIsIGlubmVyQm9keSk7XG4gICAgbG9jYWxDYWxsYmFjayA9IGZ1bmN0aW9uKGFSZXNwb25zZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoYUNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFhUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcnMgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgYWN0aXZlID0gJChhUmVzcG9uc2UpLmZpbmQoXCJhY3RpdmVcIik7XG4gICAgICAgICAgcmVzdWx0LmFjdGl2ZSA9IChhY3RpdmUudGV4dCgpLmluZGV4T2YoXCJ0cnVlXCIpICE9IC0xKTtcbiAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9ICQoYVJlc3BvbnNlKS5maW5kKFwicHJlZmVyZW5jZVwiKTtcbiAgICAgICAgICByZXN1bHQuc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnMubGVuZ3RoO1xuICAgICAgICAgIGFDYWxsYmFjayhyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIExvZ2dlci5lcnJvcihcIk1ETlNBcGkuZ2V0RGV2aWNlTm90aWZpY2F0aW9uU3Vic2NyaXB0aW9ucyBFcnJvcjogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdCA9IHRoaXMuX2RvQ2FsbCh3cmFwcGVkQm9keSwgXCJnZXREZXZpY2VOb3RpZmljYXRpb25TdWJzY3JpcHRpb25zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhVG9rZW4sIGFTaXRlSWQsIGFHbG9iYWxJZCwgYURldmljZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDYWxsYmFjayk7XG5cbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfSxcblxuICAvKipcbiAgICogUmVwb3J0cyBhbnkgZXJyb3IgbWVzc2FnZXMgaW4gdGhlIEFQSSByZXNwb25zZS5cbiAgICogQHBhcmFtIGFSZXNwb25zZSB0aGUgQVBJIHJlc3BvbnNlLlxuICAgKiBAcmV0dXJuIGJvb2xlYW4gaW5kaWNhdGVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIGhhcyBlcnJvciBvciBub3QuXG4gICAqL1xuICBfdmFsaWRhdGVSZXNwb25zZSA6IGZ1bmN0aW9uKGFSZXNwb25zZSkge1xuICAgIFxuICAgIGlmICghYVJlc3BvbnNlKSB7XG4gICAgICBMb2dnZXIuZXJyb3IoXCJNRE5TQXBpIGVycm9yIChubyByZXBvbnNlIGRvY3VtZW50ISlcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSAkKGFSZXNwb25zZSkuZmluZChcImFja1wiKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIExvZ2dlci5lcnJvcihcIk1ETlNBcGkgZXJyb3IgKG5vIEFjayBub2RlISlcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCQobm9kZSkudGV4dCgpICE9IFwiU3VjY2Vzc1wiKSB7XG4gICAgICAkLmVhY2goJChhUmVzcG9uc2UpLmZpbmQoXCJlcnJvclwiKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlcnJvckNvZGUgPSBOdW1iZXIoJCh0aGlzKS5maW5kKFwiZXJyb3JJZFwiKS50ZXh0KCkpO1xuICAgICAgICB2YXIgc2V2ZXJpdHkgPSBTdHJpbmcoJCh0aGlzKS5maW5kKFwic2V2ZXJpdHlcIikudGV4dCgpKTtcblxuICAgICAgICBpZiAoc2V2ZXJpdHkuaW5kZXhPZihcIkVycm9yXCIpICE9IC0xKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3JNc2cgPSBcIk1ETlNBcGkgQVBJIEVycm9yOlxcblwiICsgXCJFcnJvciBDb2RlOiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlICsgXCJcXE1lc3NhZ2U6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcoJCh0aGlzKS5maW5kKFwibWVzc2FnZVwiKS50ZXh0KCkpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcblNldmVyaXR5OiBcIiArIHNldmVyaXR5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcbkVycm9yIGNhdGVnb3J5OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nKCQodGhpcykuZmluZChcImNhdGVnb3J5XCIpLnRleHQoKSkgKyBcIlxcblwiO1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGVycm9yTXNnKTtcbiAgICAgICAgICAgIE9ic2VydmVySGVscGVyLm5vdGlmeShUb3BpY3MuREVCVUdfTUVTU0FHRSwgZXJyb3JNc2cpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdyYXBzIGFuIFhNTCBmcmFnbWVudCBpbnRvIGEgTXlFYmF5QXBwbGljYXRpb24gQVBJIGNhbGxcbiAgICogQHBhcmFtIGFSZXF1ZXN0TmFtZSBUaGUgbmFtZSBvZiB0aGUgY2FsbCAod2l0aG91dCBcIlJlcXVlc3RcIilcbiAgICogQHBhcmFtIGFJbm5lckJvZHkgVGhlIGJvZHkgb2YgdGhlIGNhbGxcbiAgICogQHJldHVybnMgdGhlIGZ1bGx5LWZvcm1lZCB0ZXh0XG4gICAqL1xuICBfd3JhcENhbGwgOiBmdW5jdGlvbihhUmVxdWVzdE5hbWUsIGFJbm5lckJvZHkpIHtcbiAgICBcbiAgICB2YXIgc29hcFJlcXVlc3QgPSBcIjxzb2FwZW52OkVudmVsb3BlIFwiICtcbiAgICAgIFwieG1sbnM6c29hcGVudj1cXFwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvc29hcC9lbnZlbG9wZS9cXFwiIFwiICtcbiAgICAgIHRoaXMuX1hNTF9OQU1FU1BBQ0UgKyBcIj5cIjtcblxuICAgIHNvYXBSZXF1ZXN0ICs9IFwiPHNvYXBlbnY6SGVhZGVyLz5cIjtcbiAgICBzb2FwUmVxdWVzdCArPSBcIjxzb2FwZW52OkJvZHk+XCI7XG4gICAgc29hcFJlcXVlc3QgKz0gXCI8c2VyOlwiICsgYVJlcXVlc3ROYW1lICsgXCI+XCI7XG4gICAgc29hcFJlcXVlc3QgKz0gYUlubmVyQm9keTtcbiAgICBzb2FwUmVxdWVzdCArPSBcIjwvc2VyOlwiICsgYVJlcXVlc3ROYW1lICsgXCI+XCI7XG4gICAgc29hcFJlcXVlc3QgKz0gXCI8L3NvYXBlbnY6Qm9keT5cIjtcbiAgICBzb2FwUmVxdWVzdCArPSBcIjwvc29hcGVudjpFbnZlbG9wZT5cIjtcblxuICAgIHJldHVybiBzb2FwUmVxdWVzdDtcbiAgfSxcblxuICAvKipcbiAgICogUGVyZm9ybXMgTUROU0FwaSBBUEkgY2FsbFxuICAgKiBAcGFyYW0gYVJlcXVlc3RCb2R5IFRoZSBmdWxsIGJvZHkgb2YgdGhlIGNhbGwsIGFzIHdpbGwgYmUgUE9TVGVkXG4gICAqIEBwYXJhbSBhUmVxdWVzdE5hbWUgdGhlIHJlcXVlc3QgbmFtZSB0byBiZSBwZXJmb3JtZWRcbiAgICogQHBhcmFtIGFUb2tlbiB0aGUgdG9rZW4gdG8gYmUgc2V0IGluIHRoZSByZXF1ZXN0IGhlYWRlcnNcbiAgICogQHBhcmFtIGFTaXRlSWQgdGhlIHNpdGUgaWRcbiAgICogQHBhcmFtIGFHbG9iYWxJZCBUaGUgZ2xvYmFsIGlkXG4gICAqIEBwYXJhbSBhRGV2aWNlSWQgdGhlIGluc3RhbmNlIGlkZW50aWZpZXJcbiAgICogQHBhcmFtIGFDYWxsYmFjayBUaGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICovXG4gIF9kb0NhbGwgOiBmdW5jdGlvbihhUmVxdWVzdEJvZHksIGFSZXF1ZXN0TmFtZSwgYVRva2VuLCBhU2l0ZUlkLCBhR2xvYmFsSWQsXG4gICAgICAgICAgICAgICAgICAgICBhRGV2aWNlSWQsIGFDYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIHZhciByZXF1ZXN0ID1cbiAgICAgICQuYWpheCh7XG4gICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKGFYSFIpIHtcbiAgICAgICAgICBhWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICBcIlgtRUJBWS1TT0EtT1BFUkFUSU9OLU5BTUVcIiwgYVJlcXVlc3ROYW1lKTtcbiAgICAgICAgICBhWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICAvL2ZvciBvQXV0aFxuICAgICAgICAgICAgXCJYLUVCQVktU09BLVNFQ1VSSVRZLUlBRlRPS0VOXCIsIGFUb2tlbik7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgXCJYLUVCQVktU09BLVNFUlZJQ0UtTkFNRVwiLCBcIk1vYmlsZURldmljZU5vdGlmaWNhdGlvblNlcnZpY2VcIik7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgXCJYLUVCQVktU09BLU1FU1NBR0UtUFJPVE9DT0xcIiwgXCJTT0FQMTJcIik7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgXCJYLUVCQVktU09BLUNPTlNVTUVSLUlEXCIsIEFwaUhlbHBlci5nZXRFbmRQb2ludChcImNsaWVudElkXCIpKTtcbiAgICAgICAgICBhWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICBcIlgtRUJBWS1TT0EtUkVRVUVTVC1EQVRBLUZPUk1BVFwiLCBcIlhNTFwiKTtcbiAgICAgICAgICBhWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICBcIlgtRUJBWS1TT0EtR0xPQkFMLUlEXCIsIGFHbG9iYWxJZCk7XG4gICAgICAgICAgYVhIUi5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgXCJYLUVCQVkzUFAtREVWSUNFLUlEXCIsIGFEZXZpY2VJZCk7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICBjb250ZW50VHlwZTogXCJ0ZXh0L3htbFwiLFxuICAgICAgICB1cmw6IEFwaUhlbHBlci5nZXRFbmRQb2ludChcIm1kbnNBcGlcIiksXG4gICAgICAgIGRhdGE6IGFSZXF1ZXN0Qm9keSxcbiAgICAgICAgZGF0YVR5cGU6IFwieG1sXCIsXG4gICAgICAgIGpzb25wOiBmYWxzZSxcbiAgICAgICAgdGltZW91dDogUHJvcGVydHlEQU8uZ2V0KFByb3BlcnR5REFPLlBST1BfQVBJX1RJTUVPVVQpLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihhRGF0YSwgYVRleHRTdGF0dXMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGFUZXh0U3RhdHVzID09IFwic3VjY2Vzc1wiKSB7XG4gICAgICAgICAgICAgIHZhciB2YWxpZGF0aW9uID0gdGhhdC5fdmFsaWRhdGVSZXNwb25zZShhRGF0YSk7XG4gICAgICAgICAgICAgIGlmICghdmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgIGFEYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlUGFuZWxTZXJ2aWNlLmRpc21pc3NNZXNzYWdlKE1lc3NhZ2VQYW5lbFNlcnZpY2UuVFlQRS5DT05ORUNUX0VSUk9SKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoYUNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgYUNhbGxiYWNrKGFEYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgVXRpbGl0eUhlbHBlci5oYW5kbGVFcnJvcihcIk1ETlNBcGlcIiwgYVJlcXVlc3ROYW1lLCBlLm1lc3NhZ2UsIGFDYWxsYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oYVhIUiwgYVRleHRTdGF0dXMsIGFFcnJvcikge1xuICAgICAgICAgIFV0aWxpdHlIZWxwZXIuY2hlY2tUb2tlbkV4cGlyZWQoYVhIUik7XG4gICAgICAgICAgVXRpbGl0eUhlbHBlci5oYW5kbGVFcnJvcihcIk1ETlNBcGlcIiwgYVJlcXVlc3ROYW1lLCBhWEhSLnJlc3BvbnNlVGV4dCwgYUNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAvLyBhZGQgcGVuZGluZyByZXF1ZXN0IHRvIGEgbGlzdCBzbyBwZW5kaW5nIHJlcXVlc3Qgd291bGQgYmUgY2FuY2VsbGVkIGZvclxuICAgIC8vIGEgbG9uZyBwZXJpb2Qgb2YgdGltZSBhbmQgYWxzbyBhbGwgcGVuZGluZyByZXF1ZXN0cyBjYW4gYmUgYWJvcnRlZCB3aGVuXG4gICAgLy8gdXNlciBzaWducyBvdXQuXG4gICAgQXBpSGVscGVyLmFkZFBlbmRpbmdSZXF1ZXN0KHJlcXVlc3QsIGFSZXF1ZXN0TmFtZSk7XG5cbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfVxufTtcbiJdfQ==