/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
var StatusPanel = {
    init: function () {
        $("[rel^=i18n],[title^=i18n]").i18n({ attributeNames: ["title"] });
        Sidebar.updateTooltips();
        $(document).ready(function () {
            var activeAccount = Account.getAccount();
            this._setSignInState(activeAccount);
            this._addEventListeners();
            $("#status-panel-test-version").text($.i18n.getString("test.internalBeta", [BrowserHelper.getExtensionVersion()]));
            Sidebar.adjustTabIndex();
            Sidebar.removeTabIndex();
        }.bind(this));
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.addObserver(this, Topics.ACCOUNT_SIGNED_OUT);
        ObserverHelper.addObserver(this, Topics.ACCOUNT_AVATAR_IMAGE_CHANGED);
    },
    uninit: function () {
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_OUT);
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_AVATAR_IMAGE_CHANGED);
    },
    _addEventListeners: function () {
        var account = Account.getAccount();
        $("#username-label").click(function (aEvent) {
            if (!account) {
                AuthenticationService.loadAuthPage("signInButton", aEvent);
            }
        }.bind(this));
        $("#user-menu-base").click(function () {
            if (account) {
                if ($("#user-menu-base").hasClass("open")) {
                    $("#user-menu-base").removeClass("open");
                    $(".user-menu-button").attr("aria-expanded", false);
                }
                else {
                    $("#user-menu").width($("#user-menu-base").width());
                    $("#user-menu-base").addClass("open");
                    $(".user-menu-button").attr("aria-expanded", true);
                }
            }
            EventAnalytics.push({
                key: "SignedInExit",
                action: "ClickNav",
                label: "Prefs"
            });
        }.bind(this));
        $(document).click(function (aEvent) {
            if ($("#user-menu-base").hasClass("open") &&
                $(aEvent.target).closest('#user-menu-base').length === 0) {
                $("#user-menu-base").removeClass("open");
            }
        });
        $("#user-menu-signout").parent().click(function (aEvent) {
            aEvent.preventDefault();
            this._signOut(aEvent);
        }.bind(this));
        $("#user-menu-signout").bind("keypress", function (aEvent) {
            if (aEvent.keyCode == 13) {
                aEvent.preventDefault();
                this._signOut(aEvent);
            }
        }.bind(this));
        $("#user-menu-options").parent().click(function (aEvent) {
            aEvent.preventDefault();
            this._openOptionsPage("general");
        }.bind(this));
        $("#user-menu-options").parent().bind("keypress", function (aEvent) {
            if (aEvent.keyCode == 13) {
                aEvent.preventDefault();
                this._openOptionsPage("general");
            }
        }.bind(this));
        $("#user-menu-home").click(function (aEvent) {
            aEvent.preventDefault();
            this._loadHomePage(aEvent);
        }.bind(this));
        $("#user-menu-home").parent().bind("keypress", function (aEvent) {
            if (aEvent.keyCode == 13) {
                aEvent.preventDefault();
                this._loadHomePage(aEvent);
            }
        }.bind(this));
        $("#user-menu-sellItem").click(function (aEvent) {
            aEvent.preventDefault();
            this._loadSellItemPage(aEvent);
        }.bind(this));
        $("#user-menu-sellItem").parent().bind("keypress", function (aEvent) {
            if (aEvent.keyCode == 13) {
                aEvent.preventDefault();
                EventAnalytics.push({
                    key: "SignedInExit",
                    action: "ClickNav",
                    label: "Sell"
                });
                this._loadSellItemPage(aEvent);
            }
        }.bind(this));
        $("#status-panel-test-feedback-link").click(function (aEvent) {
            RoverUrlHelper.loadPage("appFeedback", "preferences", { forceNewTab: true, }, aEvent);
        });
        if ("Window" == UtilityHelper.getClient().os) {
            $("#user-menu-button .user-menu-image").focus(function (aEvent) {
                $(".panel-notification-main-content a").attr("tabindex", "0");
            });
        }
    },
    _setSignInState: function () {
        var aAccount = Account.getAccount();
        if (aAccount) {
            var displayName = aAccount.get("name");
            if (displayName && displayName.length > 0) {
                var res = displayName.split(" ");
                displayName = res[0];
            }
            else {
                displayName = aAccount.get("userId");
            }
            var maxLength = PropertyDAO.get(PropertyDAO.PROP_USERNAME_MAX_LENGTH);
            if (displayName.length > maxLength) {
                displayName = displayName.slice(0, maxLength) + "...";
            }
            $("#username-label").removeAttr("rel");
            $("#username-label").text(displayName);
            $("#user-menu-base").addClass("signed-in");
        }
        else {
            $("#username-label").text($.i18n.getString("general.signIn"));
            $("#user-menu-base").removeClass("signed-in");
        }
        this._updateAvatar(aAccount);
    },
    _updateAvatar: function () {
        var aAccount = Account.getAccount();
        if (aAccount && aAccount.get("avatarImage")) {
            $("#user-avatar").css("background-image", "url(\"" + aAccount.get("avatarImage") + "\")");
        }
        else {
            $("#user-avatar").css("background-image", "url(/ui/skin/core/img/avatar-default.png)");
        }
    },
    _loadHomePage: function (aEvent) {
        EventAnalytics.push({
            key: "SignedInExit",
            action: "ClickNav",
            label: "Homepage"
        });
        RoverUrlHelper.loadPage("homePage", "sidebarButton", null, aEvent);
    },
    _loadSellItemPage: function (aEvent) {
        EventAnalytics.push({
            key: "SignedInExit",
            action: "ClickNav",
            label: "Sell"
        });
        RoverUrlHelper.loadPage("sell", "sidebarButton", null, aEvent);
    },
    _signOut: function (aEvent) {
        EventAnalytics.push({
            key: "SignedInExit",
            action: "ClickNav",
            label: "SignOut"
        });
        if (Account.getAccount()) {
            AccountService.signOut();
        }
    },
    _openOptionsPage: function (aPaneToShow) {
        EventAnalytics.push({
            key: "SignedInExit",
            action: "ClickNav",
            label: "AppSettings"
        });
        UtilityHelper.openOptionsPage(aPaneToShow);
    },
    observe: function (aTopic, aData) {
        switch (aTopic) {
            case Topics.ACCOUNT_SIGNED_IN:
                this._setSignInState();
                break;
            case Topics.ACCOUNT_SIGNED_OUT:
                this._setSignInState(null);
                break;
            case Topics.ACCOUNT_AVATAR_IMAGE_CHANGED:
                this._updateAvatar();
                break;
        }
    }
};
$(window).unload(function () { StatusPanel.uninit(); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi91aS92aWV3L2NvcmUvc3RhdHVzUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFNSCxJQUFJLFdBQVcsR0FBRztJQUVoQixJQUFJLEVBQUc7UUFFTCxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBRSxPQUFPLENBQUUsRUFBRSxDQUFDLENBQUM7UUFDckUsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXpCLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDaEIsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFHMUIsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsSUFBSSxDQUNsQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWhGLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QixPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWQsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDM0QsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDNUQsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVE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QUssTUFBTSxDQUFDLDRCQUE0QjtnQkFDdEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUNyQixLQUFLLENBQUM7UUFDVixDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUM7QUFFRixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWEsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIENvcHlyaWdodCAoQykgMjAwNy0yMDE1IGVCYXkgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICovXG5cbi8qKlxuICogU3RhdHVzIFBhbmVsIENsYXNzLlxuICovXG5cbnZhciBTdGF0dXNQYW5lbCA9IHtcblxuICBpbml0IDogZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgJChcIltyZWxePWkxOG5dLFt0aXRsZV49aTE4bl1cIikuaTE4bih7IGF0dHJpYnV0ZU5hbWVzOiBbIFwidGl0bGVcIiBdIH0pO1xuICAgIFNpZGViYXIudXBkYXRlVG9vbHRpcHMoKTtcblxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFjdGl2ZUFjY291bnQgPSBBY2NvdW50LmdldEFjY291bnQoKTtcbiAgICAgIHRoaXMuX3NldFNpZ25JblN0YXRlKGFjdGl2ZUFjY291bnQpO1xuICAgICAgdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgICAgLy8gc2V0IHRoZSB0ZXN0IHZlcnNpb24gbGFiZWxcbiAgICAgICQoXCIjc3RhdHVzLXBhbmVsLXRlc3QtdmVyc2lvblwiKS50ZXh0KFxuICAgICAgICAkLmkxOG4uZ2V0U3RyaW5nKFwidGVzdC5pbnRlcm5hbEJldGFcIiwgW0Jyb3dzZXJIZWxwZXIuZ2V0RXh0ZW5zaW9uVmVyc2lvbigpXSkpO1xuXG4gICAgICBTaWRlYmFyLmFkanVzdFRhYkluZGV4KCk7XG4gICAgICBTaWRlYmFyLnJlbW92ZVRhYkluZGV4KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIE9ic2VydmVySGVscGVyLmFkZE9ic2VydmVyKHRoaXMsIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTik7XG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfQVZBVEFSX0lNQUdFX0NIQU5HRUQpO1xuICB9LFxuXG4gIHVuaW5pdCA6IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIE9ic2VydmVySGVscGVyLnJlbW92ZU9ic2VydmVyKHRoaXMsIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTik7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVCk7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfQVZBVEFSX0lNQUdFX0NIQU5HRUQpO1xuICB9LFxuXG4gIF9hZGRFdmVudExpc3RlbmVycyA6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGFjY291bnQgPSBBY2NvdW50LmdldEFjY291bnQoKTtcbiAgICAkKFwiI3VzZXJuYW1lLWxhYmVsXCIpLmNsaWNrKGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgaWYgKCFhY2NvdW50KSB7XG4gICAgICAgIEF1dGhlbnRpY2F0aW9uU2VydmljZS5sb2FkQXV0aFBhZ2UoXCJzaWduSW5CdXR0b25cIiwgYUV2ZW50KTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgJChcIiN1c2VyLW1lbnUtYmFzZVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgIGlmIChhY2NvdW50KSB7XG4gICAgICAgIGlmICgkKFwiI3VzZXItbWVudS1iYXNlXCIpLmhhc0NsYXNzKFwib3BlblwiKSkge1xuICAgICAgICAgICQoXCIjdXNlci1tZW51LWJhc2VcIikucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpO1xuICAgICAgICAgICQoXCIudXNlci1tZW51LWJ1dHRvblwiKS5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJChcIiN1c2VyLW1lbnVcIikud2lkdGgoJChcIiN1c2VyLW1lbnUtYmFzZVwiKS53aWR0aCgpKTtcbiAgICAgICAgICAkKFwiI3VzZXItbWVudS1iYXNlXCIpLmFkZENsYXNzKFwib3BlblwiKTtcbiAgICAgICAgICAkKFwiLnVzZXItbWVudS1idXR0b25cIikuYXR0cihcImFyaWEtZXhwYW5kZWRcIiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgRXZlbnRBbmFseXRpY3MucHVzaCh7XG4gICAgICAgIGtleTogXCJTaWduZWRJbkV4aXRcIixcbiAgICAgICAgYWN0aW9uOiBcIkNsaWNrTmF2XCIsXG4gICAgICAgIGxhYmVsOiBcIlByZWZzXCJcbiAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIGlmICgkKFwiI3VzZXItbWVudS1iYXNlXCIpLmhhc0NsYXNzKFwib3BlblwiKSAmJlxuICAgICAgICAgICQoYUV2ZW50LnRhcmdldCkuY2xvc2VzdCgnI3VzZXItbWVudS1iYXNlJykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICQoXCIjdXNlci1tZW51LWJhc2VcIikucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyogVE9ETzogd2UgbWF5IG5vdCBuZWVkIHRvIG1vdXNlIG92ZXIgdG8gc2hvdyB1c2VyIG1lbnVcbiAgICAvLyB1c2VyIG1lbnVcbiAgICAkKFwiI3VzZXItbWVudS1iYXNlXCIpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKXtcbiAgICAgIGlmICghJChcIiN1c2VyLW1lbnUtYmFzZVwiKS5oYXNDbGFzcyhcIm9wZW5cIikpIHtcbiAgICAgICAgJChcIiN1c2VyLW1lbnVcIikud2lkdGgoJChcIiN1c2VyLW1lbnUtYmFzZVwiKS53aWR0aCgpKTtcbiAgICAgICAgJChcIiN1c2VyLW1lbnUtYmFzZVwiKS5hZGRDbGFzcyhcIm9wZW5cIik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkKFwiI3VzZXItbWVudS1iYXNlXCIpLm1vdXNlbGVhdmUoZnVuY3Rpb24oKXtcbiAgICAgICQoXCIjdXNlci1tZW51LWJhc2VcIikucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpO1xuICAgIH0pO1xuXG4gICAgJChcIiN1c2VyLW1lbnUtYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCQoXCIjdXNlci1tZW51LWJhc2VcIikuaGFzQ2xhc3MoXCJvcGVuXCIpKSB7XG4gICAgICAgICQoXCIjdXNlci1tZW51LWJhc2VcIikucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiN1c2VyLW1lbnVcIikud2lkdGgoJChcIiN1c2VyLW1lbnUtYmFzZVwiKS53aWR0aCgpKTtcbiAgICAgICAgJChcIiN1c2VyLW1lbnUtYmFzZVwiKS5hZGRDbGFzcyhcIm9wZW5cIik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgKi9cblxuICAgICQoXCIjdXNlci1tZW51LXNpZ25vdXRcIikucGFyZW50KCkuY2xpY2soZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICAvLyBYWFg6IFByZXZlbnQgU2FmYXJpIHNlbmRpbmcgZGVmYXVsdCByZXF1ZXN0cyBvbiBub2RlIGNsaWNrLlxuICAgICAgYUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLl9zaWduT3V0KGFFdmVudCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICQoXCIjdXNlci1tZW51LXNpZ25vdXRcIikuYmluZChcImtleXByZXNzXCIsIGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgaWYgKGFFdmVudC5rZXlDb2RlID09IDEzKSB7XG4gICAgICAgIC8vIFhYWDogUHJldmVudCBTYWZhcmkgc2VuZGluZyBkZWZhdWx0IHJlcXVlc3RzIG9uIG5vZGUgY2xpY2suXG4gICAgICAgIGFFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9zaWduT3V0KGFFdmVudCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICQoXCIjdXNlci1tZW51LW9wdGlvbnNcIikucGFyZW50KCkuY2xpY2soZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICAvLyBYWFg6IFByZXZlbnQgU2FmYXJpIHNlbmRpbmcgZGVmYXVsdCByZXF1ZXN0cyBvbiBub2RlIGNsaWNrLlxuICAgICAgYUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLl9vcGVuT3B0aW9uc1BhZ2UoXCJnZW5lcmFsXCIpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAkKFwiI3VzZXItbWVudS1vcHRpb25zXCIpLnBhcmVudCgpLmJpbmQoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIGlmIChhRXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgICAvLyBYWFg6IFByZXZlbnQgU2FmYXJpIHNlbmRpbmcgZGVmYXVsdCByZXF1ZXN0cyBvbiBub2RlIGNsaWNrLlxuICAgICAgICBhRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5fb3Blbk9wdGlvbnNQYWdlKFwiZ2VuZXJhbFwiKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgJChcIiN1c2VyLW1lbnUtaG9tZVwiKS5jbGljayhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIC8vIFhYWDogUHJldmVudCBTYWZhcmkgc2VuZGluZyBkZWZhdWx0IHJlcXVlc3RzIG9uIG5vZGUgY2xpY2suXG4gICAgICBhRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuX2xvYWRIb21lUGFnZShhRXZlbnQpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAkKFwiI3VzZXItbWVudS1ob21lXCIpLnBhcmVudCgpLmJpbmQoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgIGlmIChhRXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgICAvLyBYWFg6IFByZXZlbnQgU2FmYXJpIHNlbmRpbmcgZGVmYXVsdCByZXF1ZXN0cyBvbiBub2RlIGNsaWNrLlxuICAgICAgICBhRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5fbG9hZEhvbWVQYWdlKGFFdmVudCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICQoXCIjdXNlci1tZW51LXNlbGxJdGVtXCIpLmNsaWNrKGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgLy8gWFhYOiBQcmV2ZW50IFNhZmFyaSBzZW5kaW5nIGRlZmF1bHQgcmVxdWVzdHMgb24gbm9kZSBjbGljay5cbiAgICAgIGFFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fbG9hZFNlbGxJdGVtUGFnZShhRXZlbnQpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAkKFwiI3VzZXItbWVudS1zZWxsSXRlbVwiKS5wYXJlbnQoKS5iaW5kKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oYUV2ZW50KSB7XG4gICAgICBpZiAoYUV2ZW50LmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICAgLy8gWFhYOiBQcmV2ZW50IFNhZmFyaSBzZW5kaW5nIGRlZmF1bHQgcmVxdWVzdHMgb24gbm9kZSBjbGljay5cbiAgICAgICAgYUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIEV2ZW50QW5hbHl0aWNzLnB1c2goe1xuICAgICAgICAgIGtleTogXCJTaWduZWRJbkV4aXRcIixcbiAgICAgICAgICBhY3Rpb246IFwiQ2xpY2tOYXZcIixcbiAgICAgICAgICBsYWJlbDogXCJTZWxsXCJcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2xvYWRTZWxsSXRlbVBhZ2UoYUV2ZW50KTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgJChcIiNzdGF0dXMtcGFuZWwtdGVzdC1mZWVkYmFjay1saW5rXCIpLmNsaWNrKGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgUm92ZXJVcmxIZWxwZXIubG9hZFBhZ2UoXCJhcHBGZWVkYmFja1wiLCBcInByZWZlcmVuY2VzXCIsXG4gICAgICAgIHsgZm9yY2VOZXdUYWIgOiB0cnVlLH0sXG4gICAgICAgIGFFdmVudCk7XG4gICAgfSk7XG5cbiAgICAvLyBPbiBXaW5kb3dzLCB0aGUgdGFiIGZ1bmN0aW9ucyBkaWZmZXJlbnQgdGhhbiBPU1guIFdlIHdvdWxkIG5lZWQgdG8gcmVtb3ZlIHRoZSB0YWJpbmRleCBpbiB0aGUgcGFyZW50IDxhPiBub2RlLCBzbyB0aGVcbiAgICAvLyBjdXJzb3IgZG9lc24ndCBnZXQgc3R1Y2sgb24gdGhlIFggZWxlbWVudCB0byBkZWxldGUgYSBOb3RpZmljYXRpb24uIFRoaXMgcGllY2Ugb2YgY29kZSByZXN0YWJsaXNoZXMgdGhlIHRhYmluZGV4IGF0dHJpYnV0ZVxuICAgIC8vIGluIGFsbCB0aGUgaXRlbSBlbGVtZW50cyBpbiB0aGUgTm90aWZpY2F0aW9ucyBwYW5lbC5cbiAgICBpZiAoXCJXaW5kb3dcIiA9PSBVdGlsaXR5SGVscGVyLmdldENsaWVudCgpLm9zKSB7XG4gICAgICAkKFwiI3VzZXItbWVudS1idXR0b24gLnVzZXItbWVudS1pbWFnZVwiKS5mb2N1cyhmdW5jdGlvbihhRXZlbnQpIHtcbiAgICAgICAgJChcIi5wYW5lbC1ub3RpZmljYXRpb24tbWFpbi1jb250ZW50IGFcIikuYXR0cihcInRhYmluZGV4XCIsIFwiMFwiKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfc2V0U2lnbkluU3RhdGUgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYUFjY291bnQgPSBBY2NvdW50LmdldEFjY291bnQoKTtcbiAgICBcbiAgICBpZiAoYUFjY291bnQpIHtcbiAgICAgIHZhciBkaXNwbGF5TmFtZSA9IGFBY2NvdW50LmdldChcIm5hbWVcIik7XG4gICAgICBpZiAoZGlzcGxheU5hbWUgJiYgZGlzcGxheU5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgcmVzID0gZGlzcGxheU5hbWUuc3BsaXQoXCIgXCIpO1xuICAgICAgICBkaXNwbGF5TmFtZSA9IHJlc1swXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpc3BsYXlOYW1lID0gYUFjY291bnQuZ2V0KFwidXNlcklkXCIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbWF4TGVuZ3RoID0gUHJvcGVydHlEQU8uZ2V0KFByb3BlcnR5REFPLlBST1BfVVNFUk5BTUVfTUFYX0xFTkdUSCk7XG4gICAgICBpZiAoZGlzcGxheU5hbWUubGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG4gICAgICAgIGRpc3BsYXlOYW1lID0gZGlzcGxheU5hbWUuc2xpY2UoMCwgbWF4TGVuZ3RoKSArIFwiLi4uXCI7XG4gICAgICB9XG5cbiAgICAgICQoXCIjdXNlcm5hbWUtbGFiZWxcIikucmVtb3ZlQXR0cihcInJlbFwiKTtcbiAgICAgICQoXCIjdXNlcm5hbWUtbGFiZWxcIikudGV4dChkaXNwbGF5TmFtZSk7XG4gICAgICAkKFwiI3VzZXItbWVudS1iYXNlXCIpLmFkZENsYXNzKFwic2lnbmVkLWluXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKFwiI3VzZXJuYW1lLWxhYmVsXCIpLnRleHQoJC5pMThuLmdldFN0cmluZyhcImdlbmVyYWwuc2lnbkluXCIpKTtcbiAgICAgICQoXCIjdXNlci1tZW51LWJhc2VcIikucmVtb3ZlQ2xhc3MoXCJzaWduZWQtaW5cIik7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZUF2YXRhcihhQWNjb3VudCk7XG4gIH0sXG5cbiAgX3VwZGF0ZUF2YXRhciA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhQWNjb3VudCA9IEFjY291bnQuZ2V0QWNjb3VudCgpO1xuICAgIFxuICAgIGlmIChhQWNjb3VudCAmJiBhQWNjb3VudC5nZXQoXCJhdmF0YXJJbWFnZVwiKSkge1xuICAgICAgJChcIiN1c2VyLWF2YXRhclwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsXG4gICAgICAgIFwidXJsKFxcXCJcIiArIGFBY2NvdW50LmdldChcImF2YXRhckltYWdlXCIpICsgXCJcXFwiKVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChcIiN1c2VyLWF2YXRhclwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsXG4gICAgICAgIFwidXJsKC91aS9za2luL2NvcmUvaW1nL2F2YXRhci1kZWZhdWx0LnBuZylcIik7XG4gICAgfVxuICB9LFxuXG4gIF9sb2FkSG9tZVBhZ2UgOiBmdW5jdGlvbihhRXZlbnQpIHtcblxuICAgIEV2ZW50QW5hbHl0aWNzLnB1c2goe1xuICAgICAga2V5OiBcIlNpZ25lZEluRXhpdFwiLFxuICAgICAgYWN0aW9uOiBcIkNsaWNrTmF2XCIsXG4gICAgICBsYWJlbDogXCJIb21lcGFnZVwiXG4gICAgfSk7XG4gICAgUm92ZXJVcmxIZWxwZXIubG9hZFBhZ2UoXCJob21lUGFnZVwiLCBcInNpZGViYXJCdXR0b25cIiwgbnVsbCwgYUV2ZW50KTtcbiAgfSxcblxuICBfbG9hZFNlbGxJdGVtUGFnZSA6IGZ1bmN0aW9uKGFFdmVudCkge1xuXG4gICAgRXZlbnRBbmFseXRpY3MucHVzaCh7XG4gICAgICBrZXk6IFwiU2lnbmVkSW5FeGl0XCIsXG4gICAgICBhY3Rpb246IFwiQ2xpY2tOYXZcIixcbiAgICAgIGxhYmVsOiBcIlNlbGxcIlxuICAgIH0pO1xuICAgIFJvdmVyVXJsSGVscGVyLmxvYWRQYWdlKFwic2VsbFwiLCBcInNpZGViYXJCdXR0b25cIiwgbnVsbCwgYUV2ZW50KTtcbiAgfSxcblxuICBfc2lnbk91dCA6IGZ1bmN0aW9uKGFFdmVudCkge1xuXG4gICAgRXZlbnRBbmFseXRpY3MucHVzaCh7XG4gICAgICBrZXk6IFwiU2lnbmVkSW5FeGl0XCIsXG4gICAgICBhY3Rpb246IFwiQ2xpY2tOYXZcIixcbiAgICAgIGxhYmVsOiBcIlNpZ25PdXRcIlxuICAgIH0pO1xuXG4gICAgaWYgKEFjY291bnQuZ2V0QWNjb3VudCgpKSB7XG4gICAgICBBY2NvdW50U2VydmljZS5zaWduT3V0KCk7XG4gICAgfVxuICB9LFxuXG4gIF9vcGVuT3B0aW9uc1BhZ2UgOiBmdW5jdGlvbihhUGFuZVRvU2hvdykge1xuXG4gICAgRXZlbnRBbmFseXRpY3MucHVzaCh7XG4gICAgICBrZXk6IFwiU2lnbmVkSW5FeGl0XCIsXG4gICAgICBhY3Rpb246IFwiQ2xpY2tOYXZcIixcbiAgICAgIGxhYmVsOiBcIkFwcFNldHRpbmdzXCJcbiAgICB9KTtcblxuICAgIFV0aWxpdHlIZWxwZXIub3Blbk9wdGlvbnNQYWdlKGFQYW5lVG9TaG93KTtcbiAgfSxcblxuICBvYnNlcnZlIDogZnVuY3Rpb24oYVRvcGljLCBhRGF0YSkge1xuICAgIFxuICAgIHN3aXRjaCAoYVRvcGljKSB7XG4gICAgICBjYXNlIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTjpcbiAgICAgICAgdGhpcy5fc2V0U2lnbkluU3RhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9PVVQ6XG4gICAgICAgIHRoaXMuX3NldFNpZ25JblN0YXRlKG51bGwpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9waWNzLkFDQ09VTlRfQVZBVEFSX0lNQUdFX0NIQU5HRUQ6XG4gICAgICAgIHRoaXMuX3VwZGF0ZUF2YXRhcigpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbiQod2luZG93KS51bmxvYWQoZnVuY3Rpb24oKSB7IFN0YXR1c1BhbmVsLnVuaW5pdCgpOyB9KTtcbiJdfQ==