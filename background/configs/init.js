var Browser = {
  BROWSER: "cr",
  FLAGS_LOCATION: "/ui/skin/core/img/flags/",
  LOCATION_LOOKUP_ID: "appbrwcr_install_ip_1"
};

var BrowserConfigs = _.merge(
  Browser,
  BrowserEndPointsConfig,
  BrowserSitesConfig,
  BrowserUrlsConfig
);
