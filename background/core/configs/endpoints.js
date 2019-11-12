var EndPointsConfig = {
    END_POINTS: {
        "userToken": {
            "qa": "signin.qa",
            "pre-production": "signin.qa",
            "production": "signin"
        },
        "applicationToken": {
            "qa": "www.auth.stratus.qa.ebay.com",
            "pre-production": "www.auth.stratus.qa.ebay.com",
            "production": "idauth.ebay.com"
        },
        "tradingApi": {
            "qa": "https://api.sandbox.ebay.com/ws/api.dll",
            "pre-production": "https://api.sandbox.ebay.com/ws/api.dll",
            "production": "https://api.ebay.com/ws/api.dll"
        },
        "shoppingApi": {
            "qa": "http://open.api.sandbox.ebay.com/shopping",
            "pre-production": null,
            "production": "https://api.ebay.com/shopping"
        },
        "myEbayApplication": {
            "qa": null,
            "pre-production": null,
            "production": "https://svcs.ebay.com/ws/spf"
        },
        "authenticationApi": {
            "qa": null,
            "pre-production": null,
            "production": "https://svcs.ebay.com/services/mobile/v1/UserAuthenticationService"
        },
        "symbanApi": {
            "qa": "https://api4.qa.ebay.com/core/notificationinbox/v1/notification",
            "pre-production": "https://api4.qa.ebay.com/core/notificationinbox/v1/notification",
            "production": "https://api.ebay.com/core/notificationinbox/v1/notification"
        },
        "medsApi": {
            "qa": "https://svcs.ebay.com/services/mobile/meds/v1/user/{IdentityType},{IdentityProvider}/last_queries_used.json",
            "pre-production": "https://svcs.ebay.com/services/mobile/meds/v1/user/{IdentityType},{IdentityProvider}/last_queries_used.json",
            "production": "https://svcs.ebay.com/services/mobile/meds/v1/user/{IdentityType},{IdentityProvider}/last_queries_used.json"
        },
        "listingDraftApi": {
            "qa": null,
            "pre-production": "https://svcs.ebay.com/services/listing/ListingDraftService/v1",
            "production": "https://svcs.ebay.com/services/listing/ListingDraftService/v1"
        },
        "mdnsApi": {
            "qa": "http://api4.qa.ebay.com/mobile/DeviceNotificationService/v1",
            "pre-production": "http://api4.qa.ebay.com/mobile/DeviceNotificationService/v1",
            "production": "https://svcs.ebay.com/mobile/DeviceNotificationService/v1"
        },
        "addressBookApi": {
            "qa": null,
            "pre-production": null,
            "production": "https://mobixo.ebay.com/services/addressbookservice/v1/AddressBookService"
        },
        "locationApi": {
            "qa": "http://lbsp.vip.qa.ebay.com",
            "pre-production": "http://www.lbservice.pp.stratus.ebay.com",
            "production": "https://api.ebay.com"
        },
        "autoCompleteApi": {
            "qa": null,
            "pre-production": null,
            "production": "http://autosug.ebay.com/autosug"
        }
    },
    NEW_END_POINTS: {
        "addressBookApi": "https://mobixo.ebay.com/services/addressbookservice/v1/AddressBookService",
        "applicationToken": "idauth.ebay.com",
        "autoCompleteApi": "http://autosug.ebay.com/autosug",
        "listingDraftApi": "https://svcs.ebay.com/services/listing/ListingDraftService/v1",
        "locationApi": "https://api.ebay.com",
        "mdnsApi": "https://svcs.ebay.com/mobile/DeviceNotificationService/v1",
        "medsApi": "https://svcs.ebay.com/services/mobile/meds/v1/user/{IdentityType},{IdentityProvider}/last_queries_used.json",
        "myEbayApplication": "https://svcs.ebay.com/ws/spf",
        "shoppingApi": "https://api.ebay.com/shopping",
        "symbanApi": "https://api.ebay.com/core/notificationinbox/v1/notification",
        "tradingApi": "https://api.ebay.com/ws/api.dll",
        "userToken": "signin",
    },
    SECRETS: {},
    TRADING_API_VERSION: "905",
    SHOPPING_API_VERSION: "889"
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5kcG9pbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFja2dyb3VuZC9jb3JlL2NvbmZpZ3MvZW5kcG9pbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQU0sZUFBZSxHQUFHO0lBQ3RCLFVBQVUsRUFBRTtRQUNWLFdBQVcsRUFBRTtZQUNYLElBQUksRUFBRSxXQUFXO1lBQ2pCLGdCQUFnQixFQUFFLFdBQVc7WUFDN0IsWUFBWSxFQUFFLFFBQVE7U0FDdkI7UUFFRCxrQkFBa0IsRUFBRTtZQUNsQixJQUFJLEVBQUUsOEJBQThCO1lBQ3BDLGdCQUFnQixFQUFFLDhCQUE4QjtZQUNoRCxZQUFZLEVBQUUsaUJBQWlCO1NBQ2hDO1FBRUQsWUFBWSxFQUFFO1lBQ1osSUFBSSxFQUFFLHlDQUF5QztZQUMvQyxnQkFBZ0IsRUFBRSx5Q0FBeUM7WUFDM0QsWUFBWSxFQUFFLGlDQUFpQztTQUNoRDtRQUVELGFBQWEsRUFBRTtZQUNiLElBQUksRUFBRSwyQ0FBMkM7WUFDakQsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixZQUFZLEVBQUUsK0JBQStCO1NBQzlDO1FBRUQsbUJBQW1CLEVBQUU7WUFDbkIsSUFBSSxFQUFFLElBQUk7WUFDVixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFlBQVksRUFBRSw4QkFBOEI7U0FDN0M7UUFFRCxtQkFBbUIsRUFBRTtZQUNuQixJQUFJLEVBQUUsSUFBSTtZQUNWLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsWUFBWSxFQUFFLG9FQUFvRTtTQUNuRjtRQUVELFdBQVcsRUFBRTtZQUNYLElBQUksRUFBRSxpRUFBaUU7WUFDdkUsZ0JBQWdCLEVBQUUsaUVBQWlFO1lBQ25GLFlBQVksRUFBRSw2REFBNkQ7U0FDNUU7UUFFRCxTQUFTLEVBQUU7WUFDVCxJQUFJLEVBQUUsNkdBQTZHO1lBQ25ILGdCQUFnQixFQUFFLDZHQUE2RztZQUMvSCxZQUFZLEVBQUUsNkdBQTZHO1NBQzVIO1FBRUQsaUJBQWlCLEVBQUU7WUFDakIsSUFBSSxFQUFFLElBQUk7WUFDVixnQkFBZ0IsRUFBRSwrREFBK0Q7WUFDakYsWUFBWSxFQUFFLCtEQUErRDtTQUM5RTtRQUVELFNBQVMsRUFBRTtZQUNULElBQUksRUFBRSw2REFBNkQ7WUFDbkUsZ0JBQWdCLEVBQUUsNkRBQTZEO1lBQy9FLFlBQVksRUFBRSwyREFBMkQ7U0FDMUU7UUFFRCxnQkFBZ0IsRUFBRTtZQUNoQixJQUFJLEVBQUUsSUFBSTtZQUNWLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsWUFBWSxFQUFFLDJFQUEyRTtTQUMxRjtRQUVELGFBQWEsRUFBRTtZQUNiLElBQUksRUFBRSw2QkFBNkI7WUFDbkMsZ0JBQWdCLEVBQUUsMENBQTBDO1lBQzVELFlBQVksRUFBRSxzQkFBc0I7U0FDckM7UUFFRCxpQkFBaUIsRUFBRTtZQUNqQixJQUFJLEVBQUUsSUFBSTtZQUNWLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsWUFBWSxFQUFFLGlDQUFpQztTQUNoRDtLQUNGO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsZ0JBQWdCLEVBQUUsMkVBQTJFO1FBQzdGLGtCQUFrQixFQUFFLGlCQUFpQjtRQUNyQyxpQkFBaUIsRUFBRSxpQ0FBaUM7UUFDcEQsaUJBQWlCLEVBQUUsK0RBQStEO1FBQ2xGLGFBQWEsRUFBRSxzQkFBc0I7UUFDckMsU0FBUyxFQUFFLDJEQUEyRDtRQUN0RSxTQUFTLEVBQUUsNkdBQTZHO1FBQ3hILG1CQUFtQixFQUFFLDhCQUE4QjtRQUNuRCxhQUFhLEVBQUUsK0JBQStCO1FBQzlDLFdBQVcsRUFBRSw2REFBNkQ7UUFDMUUsWUFBWSxFQUFFLGlDQUFpQztRQUMvQyxXQUFXLEVBQUUsUUFBUTtLQUN0QjtJQUVELE9BQU8sRUFBRSxFQUFFO0lBRVgsbUJBQW1CLEVBQUUsS0FBSztJQUMxQixvQkFBb0IsRUFBRSxLQUFLO0NBQzVCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFbmRQb2ludHNDb25maWcgPSB7XG4gIEVORF9QT0lOVFM6IHtcbiAgICBcInVzZXJUb2tlblwiOiB7XG4gICAgICBcInFhXCI6IFwic2lnbmluLnFhXCIsXG4gICAgICBcInByZS1wcm9kdWN0aW9uXCI6IFwic2lnbmluLnFhXCIsXG4gICAgICBcInByb2R1Y3Rpb25cIjogXCJzaWduaW5cIlxuICAgIH0sXG5cbiAgICBcImFwcGxpY2F0aW9uVG9rZW5cIjoge1xuICAgICAgXCJxYVwiOiBcInd3dy5hdXRoLnN0cmF0dXMucWEuZWJheS5jb21cIixcbiAgICAgIFwicHJlLXByb2R1Y3Rpb25cIjogXCJ3d3cuYXV0aC5zdHJhdHVzLnFhLmViYXkuY29tXCIsXG4gICAgICBcInByb2R1Y3Rpb25cIjogXCJpZGF1dGguZWJheS5jb21cIlxuICAgIH0sXG5cbiAgICBcInRyYWRpbmdBcGlcIjoge1xuICAgICAgXCJxYVwiOiBcImh0dHBzOi8vYXBpLnNhbmRib3guZWJheS5jb20vd3MvYXBpLmRsbFwiLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBcImh0dHBzOi8vYXBpLnNhbmRib3guZWJheS5jb20vd3MvYXBpLmRsbFwiLFxuICAgICAgXCJwcm9kdWN0aW9uXCI6IFwiaHR0cHM6Ly9hcGkuZWJheS5jb20vd3MvYXBpLmRsbFwiXG4gICAgfSxcblxuICAgIFwic2hvcHBpbmdBcGlcIjoge1xuICAgICAgXCJxYVwiOiBcImh0dHA6Ly9vcGVuLmFwaS5zYW5kYm94LmViYXkuY29tL3Nob3BwaW5nXCIsXG4gICAgICBcInByZS1wcm9kdWN0aW9uXCI6IG51bGwsXG4gICAgICBcInByb2R1Y3Rpb25cIjogXCJodHRwczovL2FwaS5lYmF5LmNvbS9zaG9wcGluZ1wiXG4gICAgfSxcblxuICAgIFwibXlFYmF5QXBwbGljYXRpb25cIjoge1xuICAgICAgXCJxYVwiOiBudWxsLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBudWxsLFxuICAgICAgXCJwcm9kdWN0aW9uXCI6IFwiaHR0cHM6Ly9zdmNzLmViYXkuY29tL3dzL3NwZlwiXG4gICAgfSxcblxuICAgIFwiYXV0aGVudGljYXRpb25BcGlcIjoge1xuICAgICAgXCJxYVwiOiBudWxsLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBudWxsLFxuICAgICAgXCJwcm9kdWN0aW9uXCI6IFwiaHR0cHM6Ly9zdmNzLmViYXkuY29tL3NlcnZpY2VzL21vYmlsZS92MS9Vc2VyQXV0aGVudGljYXRpb25TZXJ2aWNlXCJcbiAgICB9LFxuXG4gICAgXCJzeW1iYW5BcGlcIjoge1xuICAgICAgXCJxYVwiOiBcImh0dHBzOi8vYXBpNC5xYS5lYmF5LmNvbS9jb3JlL25vdGlmaWNhdGlvbmluYm94L3YxL25vdGlmaWNhdGlvblwiLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBcImh0dHBzOi8vYXBpNC5xYS5lYmF5LmNvbS9jb3JlL25vdGlmaWNhdGlvbmluYm94L3YxL25vdGlmaWNhdGlvblwiLFxuICAgICAgXCJwcm9kdWN0aW9uXCI6IFwiaHR0cHM6Ly9hcGkuZWJheS5jb20vY29yZS9ub3RpZmljYXRpb25pbmJveC92MS9ub3RpZmljYXRpb25cIlxuICAgIH0sXG5cbiAgICBcIm1lZHNBcGlcIjoge1xuICAgICAgXCJxYVwiOiBcImh0dHBzOi8vc3Zjcy5lYmF5LmNvbS9zZXJ2aWNlcy9tb2JpbGUvbWVkcy92MS91c2VyL3tJZGVudGl0eVR5cGV9LHtJZGVudGl0eVByb3ZpZGVyfS9sYXN0X3F1ZXJpZXNfdXNlZC5qc29uXCIsXG4gICAgICBcInByZS1wcm9kdWN0aW9uXCI6IFwiaHR0cHM6Ly9zdmNzLmViYXkuY29tL3NlcnZpY2VzL21vYmlsZS9tZWRzL3YxL3VzZXIve0lkZW50aXR5VHlwZX0se0lkZW50aXR5UHJvdmlkZXJ9L2xhc3RfcXVlcmllc191c2VkLmpzb25cIixcbiAgICAgIFwicHJvZHVjdGlvblwiOiBcImh0dHBzOi8vc3Zjcy5lYmF5LmNvbS9zZXJ2aWNlcy9tb2JpbGUvbWVkcy92MS91c2VyL3tJZGVudGl0eVR5cGV9LHtJZGVudGl0eVByb3ZpZGVyfS9sYXN0X3F1ZXJpZXNfdXNlZC5qc29uXCJcbiAgICB9LFxuXG4gICAgXCJsaXN0aW5nRHJhZnRBcGlcIjoge1xuICAgICAgXCJxYVwiOiBudWxsLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBcImh0dHBzOi8vc3Zjcy5lYmF5LmNvbS9zZXJ2aWNlcy9saXN0aW5nL0xpc3RpbmdEcmFmdFNlcnZpY2UvdjFcIixcbiAgICAgIFwicHJvZHVjdGlvblwiOiBcImh0dHBzOi8vc3Zjcy5lYmF5LmNvbS9zZXJ2aWNlcy9saXN0aW5nL0xpc3RpbmdEcmFmdFNlcnZpY2UvdjFcIlxuICAgIH0sXG5cbiAgICBcIm1kbnNBcGlcIjoge1xuICAgICAgXCJxYVwiOiBcImh0dHA6Ly9hcGk0LnFhLmViYXkuY29tL21vYmlsZS9EZXZpY2VOb3RpZmljYXRpb25TZXJ2aWNlL3YxXCIsXG4gICAgICBcInByZS1wcm9kdWN0aW9uXCI6IFwiaHR0cDovL2FwaTQucWEuZWJheS5jb20vbW9iaWxlL0RldmljZU5vdGlmaWNhdGlvblNlcnZpY2UvdjFcIixcbiAgICAgIFwicHJvZHVjdGlvblwiOiBcImh0dHBzOi8vc3Zjcy5lYmF5LmNvbS9tb2JpbGUvRGV2aWNlTm90aWZpY2F0aW9uU2VydmljZS92MVwiXG4gICAgfSxcblxuICAgIFwiYWRkcmVzc0Jvb2tBcGlcIjoge1xuICAgICAgXCJxYVwiOiBudWxsLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBudWxsLFxuICAgICAgXCJwcm9kdWN0aW9uXCI6IFwiaHR0cHM6Ly9tb2JpeG8uZWJheS5jb20vc2VydmljZXMvYWRkcmVzc2Jvb2tzZXJ2aWNlL3YxL0FkZHJlc3NCb29rU2VydmljZVwiXG4gICAgfSxcblxuICAgIFwibG9jYXRpb25BcGlcIjoge1xuICAgICAgXCJxYVwiOiBcImh0dHA6Ly9sYnNwLnZpcC5xYS5lYmF5LmNvbVwiLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBcImh0dHA6Ly93d3cubGJzZXJ2aWNlLnBwLnN0cmF0dXMuZWJheS5jb21cIixcbiAgICAgIFwicHJvZHVjdGlvblwiOiBcImh0dHBzOi8vYXBpLmViYXkuY29tXCJcbiAgICB9LFxuXG4gICAgXCJhdXRvQ29tcGxldGVBcGlcIjoge1xuICAgICAgXCJxYVwiOiBudWxsLFxuICAgICAgXCJwcmUtcHJvZHVjdGlvblwiOiBudWxsLFxuICAgICAgXCJwcm9kdWN0aW9uXCI6IFwiaHR0cDovL2F1dG9zdWcuZWJheS5jb20vYXV0b3N1Z1wiXG4gICAgfVxuICB9LFxuICBORVdfRU5EX1BPSU5UUzoge1xuICAgIFwiYWRkcmVzc0Jvb2tBcGlcIjogXCJodHRwczovL21vYml4by5lYmF5LmNvbS9zZXJ2aWNlcy9hZGRyZXNzYm9va3NlcnZpY2UvdjEvQWRkcmVzc0Jvb2tTZXJ2aWNlXCIsXG4gICAgXCJhcHBsaWNhdGlvblRva2VuXCI6IFwiaWRhdXRoLmViYXkuY29tXCIsXG4gICAgXCJhdXRvQ29tcGxldGVBcGlcIjogXCJodHRwOi8vYXV0b3N1Zy5lYmF5LmNvbS9hdXRvc3VnXCIsXG4gICAgXCJsaXN0aW5nRHJhZnRBcGlcIjogXCJodHRwczovL3N2Y3MuZWJheS5jb20vc2VydmljZXMvbGlzdGluZy9MaXN0aW5nRHJhZnRTZXJ2aWNlL3YxXCIsXG4gICAgXCJsb2NhdGlvbkFwaVwiOiBcImh0dHBzOi8vYXBpLmViYXkuY29tXCIsXG4gICAgXCJtZG5zQXBpXCI6IFwiaHR0cHM6Ly9zdmNzLmViYXkuY29tL21vYmlsZS9EZXZpY2VOb3RpZmljYXRpb25TZXJ2aWNlL3YxXCIsXG4gICAgXCJtZWRzQXBpXCI6IFwiaHR0cHM6Ly9zdmNzLmViYXkuY29tL3NlcnZpY2VzL21vYmlsZS9tZWRzL3YxL3VzZXIve0lkZW50aXR5VHlwZX0se0lkZW50aXR5UHJvdmlkZXJ9L2xhc3RfcXVlcmllc191c2VkLmpzb25cIixcbiAgICBcIm15RWJheUFwcGxpY2F0aW9uXCI6IFwiaHR0cHM6Ly9zdmNzLmViYXkuY29tL3dzL3NwZlwiLFxuICAgIFwic2hvcHBpbmdBcGlcIjogXCJodHRwczovL2FwaS5lYmF5LmNvbS9zaG9wcGluZ1wiLFxuICAgIFwic3ltYmFuQXBpXCI6IFwiaHR0cHM6Ly9hcGkuZWJheS5jb20vY29yZS9ub3RpZmljYXRpb25pbmJveC92MS9ub3RpZmljYXRpb25cIixcbiAgICBcInRyYWRpbmdBcGlcIjogXCJodHRwczovL2FwaS5lYmF5LmNvbS93cy9hcGkuZGxsXCIsXG4gICAgXCJ1c2VyVG9rZW5cIjogXCJzaWduaW5cIixcbiAgfSxcbiAgLy8gRW1wdHksIGJlY2F1c2Ugd2Ugb25seSBoYXZlIGJyb3dzZXItc3BlY2lmaWMgc2VjcmV0c1xuICBTRUNSRVRTOiB7fSxcblxuICBUUkFESU5HX0FQSV9WRVJTSU9OOiBcIjkwNVwiLFxuICBTSE9QUElOR19BUElfVkVSU0lPTjogXCI4ODlcIlxufTtcbiJdfQ==