var PANEL_TYPES = ["general", "alerts", "legal", "debug"];
var Options = {
    init: function () {
        $("[rel*=i18n]").i18n();
        $("#main-window").addClass(UtilityHelper.getClient().os);
        var that = this;
        var activeAccount = Account.getAccount();
        new Timer(function () {
            that._loadInnerPages();
            that._initNavbar();
            var selectedOptionPane = PropertyDAO.get(PropertyDAO.PROP_SELECTED_OPTION_PANE);
            if (selectedOptionPane && selectedOptionPane !== null) {
                if (!activeAccount && selectedOptionPane == "alerts") {
                    that._selectPane("general");
                }
                else {
                    that._selectPane(selectedOptionPane);
                }
            }
            else {
                that._selectPane("general");
            }
            ObserverHelper.addObserver(that, Topics.ACCOUNT_SIGNED_IN);
            ObserverHelper.addObserver(that, Topics.ACCOUNT_SIGNED_OUT);
        }, 300);
        if (!activeAccount) {
            $("#nav-item-alerts").addClass("disabled");
        }
    },
    uninit: function () {
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_IN);
        ObserverHelper.removeObserver(this, Topics.ACCOUNT_SIGNED_OUT);
    },
    _loadInnerPages: function () {
        $("#pane-general").load("core/optionsGeneral.html", function () {
            GeneralPane.init();
        });
        $("#pane-alerts").load("core/optionsAlerts.html", function () {
            AlertsPane.init();
        });
        $("#pane-legal").load("core/optionsLegal.html", function () {
            LegalPane.init();
        });
    },
    _initNavbar: function () {
        $(".navbar-item").bind("click", function (aEvent) {
            Options.selectPane($(this).attr("panel"));
        });
    },
    selectPane: function (aType) {
        if (!$("#nav-item-" + aType).hasClass("disabled")) {
            this._selectPane(aType);
            PropertyDAO.set(PropertyDAO.PROP_SELECTED_OPTION_PANE, aType);
        }
    },
    _selectPane: function (aType, aCallback) {
        $(".pane-selector > .pane-button-container[ebayselected]").removeAttr("ebayselected");
        $("#pane-button-" + aType).parent().attr("ebayselected", true);
        $.each(PANEL_TYPES, function (aIndex, aValue) {
            if (aValue == aType) {
                $(".navbar-item").removeClass("navbar-item-selected");
                $("#nav-item-" + aType).addClass("navbar-item-selected");
                $("#pane-general").hide();
                $("#pane-alerts").hide();
                $("#pane-legal").hide();
                $("#pane-" + aType).show();
                if (aCallback) {
                    aCallback();
                }
            }
        });
        if (aType == 'legal') {
            new Timer(function () {
                $("#legal-licence-frame-container").mCustomScrollbar('scrollTo', 'left');
            }, 100);
        }
    },
    observe: function (aTopic, aData) {
        switch (aTopic) {
            case Topics.ACCOUNT_SIGNED_IN:
            case Topics.ACCOUNT_SIGNED_OUT:
                window.location.href = window.location.href;
                break;
        }
    }
};
$(document).ready(function () { Options.init(); });
$(window).unload(function () { Options.uninit(); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3VpL3ZpZXcvY29yZS9vcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLElBQU0sV0FBVyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFLNUQsSUFBSSxPQUFPLEdBQUc7SUFDWixJQUFJLEVBQUc7UUFFTCxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHeEIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFekQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV6QyxJQUFJLEtBQUssQ0FBQztZQUNSLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFbkIsSUFBSSxrQkFBa0IsR0FDcEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUN6RCxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSxrQkFBa0IsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxrQkFBa0IsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsV0FBVyxD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QUFDLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMzQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNkLFNBQVMsRUFBRSxDQUFDO2dCQUNkLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEtBQUssQ0FBQztnQkFDUixDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLEVBQUcsVUFBUyxNQUFNLEVBQUUsS0FBSztRQUM5QixNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsaUJBQWlCLENBQUM7WUFDOUIsS0FBSyxNQUFNLENBQUMsa0JBQWtCO2dCQUM1QixNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDNUMsS0FBSyxDQUFDO1FBQ1YsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDO0FBRUYsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFhLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChDKSAyMDA3LTIwMTUgZUJheSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKi9cbmNvbnN0IFBBTkVMX1RZUEVTID0gW1wiZ2VuZXJhbFwiLCBcImFsZXJ0c1wiLCBcImxlZ2FsXCIsIFwiZGVidWdcIl07XG5cbi8qKlxuICogT3B0aW9ucyBXaW5kb3cgQ2xhc3MuXG4gKi9cbnZhciBPcHRpb25zID0ge1xuICBpbml0IDogZnVuY3Rpb24oKSB7XG4gICAgLy8gc2V0IHRoZSBsb2NhbGUgYW5kIGFwcGx5IHRoZW0gdG8gdGhlIHJlbGV2YW50IG5vZGVzLlxuICAgICQoXCJbcmVsKj1pMThuXVwiKS5pMThuKCk7XG5cbiAgICAvLyBhcHBseSBvcyBmb3Igc3R5bGluZ1xuICAgICQoXCIjbWFpbi13aW5kb3dcIikuYWRkQ2xhc3MoVXRpbGl0eUhlbHBlci5nZXRDbGllbnQoKS5vcyk7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGFjdGl2ZUFjY291bnQgPSBBY2NvdW50LmdldEFjY291bnQoKTtcblxuICAgIG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgIHRoYXQuX2xvYWRJbm5lclBhZ2VzKCk7XG4gICAgICB0aGF0Ll9pbml0TmF2YmFyKCk7XG5cbiAgICAgIHZhciBzZWxlY3RlZE9wdGlvblBhbmUgPVxuICAgICAgICBQcm9wZXJ0eURBTy5nZXQoUHJvcGVydHlEQU8uUFJPUF9TRUxFQ1RFRF9PUFRJT05fUEFORSk7XG4gICAgICBpZiAoc2VsZWN0ZWRPcHRpb25QYW5lICYmIHNlbGVjdGVkT3B0aW9uUGFuZSAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoIWFjdGl2ZUFjY291bnQgJiYgc2VsZWN0ZWRPcHRpb25QYW5lID09IFwiYWxlcnRzXCIpIHtcbiAgICAgICAgICB0aGF0Ll9zZWxlY3RQYW5lKFwiZ2VuZXJhbFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGF0Ll9zZWxlY3RQYW5lKHNlbGVjdGVkT3B0aW9uUGFuZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuX3NlbGVjdFBhbmUoXCJnZW5lcmFsXCIpO1xuICAgICAgfVxuXG4gICAgICBPYnNlcnZlckhlbHBlci5hZGRPYnNlcnZlcih0aGF0LCBUb3BpY3MuQUNDT1VOVF9TSUdORURfSU4pO1xuICAgICAgT2JzZXJ2ZXJIZWxwZXIuYWRkT2JzZXJ2ZXIodGhhdCwgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVCk7XG4gICAgfSwgMzAwKTtcblxuICAgIGlmICghYWN0aXZlQWNjb3VudCkge1xuICAgICAgJChcIiNuYXYtaXRlbS1hbGVydHNcIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICB9XG4gIH0sXG5cbiAgdW5pbml0IDogZnVuY3Rpb24oKSB7XG4gICAgT2JzZXJ2ZXJIZWxwZXIucmVtb3ZlT2JzZXJ2ZXIodGhpcywgVG9waWNzLkFDQ09VTlRfU0lHTkVEX0lOKTtcbiAgICBPYnNlcnZlckhlbHBlci5yZW1vdmVPYnNlcnZlcih0aGlzLCBUb3BpY3MuQUNDT1VOVF9TSUdORURfT1VUKTtcbiAgfSxcblxuICBfbG9hZElubmVyUGFnZXMgOiBmdW5jdGlvbigpIHtcbiAgICAkKFwiI3BhbmUtZ2VuZXJhbFwiKS5sb2FkKFwiY29yZS9vcHRpb25zR2VuZXJhbC5odG1sXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgR2VuZXJhbFBhbmUuaW5pdCgpO1xuICAgIH0pO1xuICAgICQoXCIjcGFuZS1hbGVydHNcIikubG9hZChcImNvcmUvb3B0aW9uc0FsZXJ0cy5odG1sXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgQWxlcnRzUGFuZS5pbml0KCk7XG4gICAgfSk7XG4gICAgJChcIiNwYW5lLWxlZ2FsXCIpLmxvYWQoXCJjb3JlL29wdGlvbnNMZWdhbC5odG1sXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgTGVnYWxQYW5lLmluaXQoKTtcbiAgICB9KTtcbiAgfSxcblxuICBfaW5pdE5hdmJhciA6IGZ1bmN0aW9uKCkge1xuICAgICQoXCIubmF2YmFyLWl0ZW1cIikuYmluZChcImNsaWNrXCIsIGZ1bmN0aW9uKGFFdmVudCkge1xuICAgICAgT3B0aW9ucy5zZWxlY3RQYW5lKCQodGhpcykuYXR0cihcInBhbmVsXCIpKTtcbiAgICB9KTtcbiAgfSxcblxuICBzZWxlY3RQYW5lIDogZnVuY3Rpb24oYVR5cGUpIHtcbiAgICBpZiAoISQoXCIjbmF2LWl0ZW0tXCIgKyBhVHlwZSkuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSkge1xuICAgICAgdGhpcy5fc2VsZWN0UGFuZShhVHlwZSk7XG4gICAgICBQcm9wZXJ0eURBTy5zZXQoUHJvcGVydHlEQU8uUFJPUF9TRUxFQ1RFRF9PUFRJT05fUEFORSwgYVR5cGUpO1xuICAgIH1cbiAgfSxcblxuICBfc2VsZWN0UGFuZSA6IGZ1bmN0aW9uKGFUeXBlLCBhQ2FsbGJhY2spIHtcbiAgICAkKFwiLnBhbmUtc2VsZWN0b3IgPiAucGFuZS1idXR0b24tY29udGFpbmVyW2ViYXlzZWxlY3RlZF1cIikucmVtb3ZlQXR0cihcImViYXlzZWxlY3RlZFwiKTtcbiAgICAkKFwiI3BhbmUtYnV0dG9uLVwiICsgYVR5cGUpLnBhcmVudCgpLmF0dHIoXCJlYmF5c2VsZWN0ZWRcIiwgdHJ1ZSk7XG5cbiAgICAkLmVhY2goUEFORUxfVFlQRVMsIGZ1bmN0aW9uKGFJbmRleCwgYVZhbHVlKSB7XG4gICAgICBpZiAoYVZhbHVlID09IGFUeXBlKSB7XG4gICAgICAgICQoXCIubmF2YmFyLWl0ZW1cIikucmVtb3ZlQ2xhc3MoXCJuYXZiYXItaXRlbS1zZWxlY3RlZFwiKTtcbiAgICAgICAgJChcIiNuYXYtaXRlbS1cIiArIGFUeXBlKS5hZGRDbGFzcyhcIm5hdmJhci1pdGVtLXNlbGVjdGVkXCIpO1xuICAgICAgICAkKFwiI3BhbmUtZ2VuZXJhbFwiKS5oaWRlKCk7XG4gICAgICAgICQoXCIjcGFuZS1hbGVydHNcIikuaGlkZSgpO1xuICAgICAgICAkKFwiI3BhbmUtbGVnYWxcIikuaGlkZSgpO1xuICAgICAgICAkKFwiI3BhbmUtXCIgKyBhVHlwZSkuc2hvdygpO1xuICAgICAgICBpZiAoYUNhbGxiYWNrKSB7XG4gICAgICAgICAgYUNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChhVHlwZSA9PSAnbGVnYWwnKSB7XG4gICAgICBuZXcgVGltZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIjbGVnYWwtbGljZW5jZS1mcmFtZS1jb250YWluZXJcIikubUN1c3RvbVNjcm9sbGJhcignc2Nyb2xsVG8nLCdsZWZ0Jyk7XG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfSxcblxuICBvYnNlcnZlIDogZnVuY3Rpb24oYVRvcGljLCBhRGF0YSkge1xuICAgIHN3aXRjaCAoYVRvcGljKSB7XG4gICAgICBjYXNlIFRvcGljcy5BQ0NPVU5UX1NJR05FRF9JTjpcbiAgICAgIGNhc2UgVG9waWNzLkFDQ09VTlRfU0lHTkVEX09VVDpcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHsgT3B0aW9ucy5pbml0KCk7IH0pO1xuJCh3aW5kb3cpLnVubG9hZChmdW5jdGlvbigpIHsgT3B0aW9ucy51bmluaXQoKTsgfSk7XG4iXX0=