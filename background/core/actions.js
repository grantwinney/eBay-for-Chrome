var ADD_ACCOUNT = "ADD_ACCOUNT";
var DELETE_ACCOUNT = "DELETE_ACCOUNT";
function addAccount(account) {
    return { type: ADD_ACCOUNT, account: account };
}
function deleteAccount() {
    return { type: DELETE_ACCOUNT };
}
if (typeof exports !== "undefined") {
    exports.ADD_ACCOUNT = ADD_ACCOUNT;
    exports.DELETE_ACCOUNT = DELETE_ACCOUNT;
    exports.addAccount = addAccount;
    exports.deleteAccount = deleteAccount;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2JhY2tncm91bmQvY29yZS9hY3Rpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksV0FBVyxHQUFHLGFBQWEsQ0FBQztBQUNoQyxJQUFJLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQztBQUV0QyxvQkFBb0IsT0FBTztJQUN6QixNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRUQ7SUFDRSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFDLENBQUM7QUFDaEMsQ0FBQztBQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sT0FBTyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbkMsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDbEMsT0FBTyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDeEMsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDaEMsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDeEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBRERfQUNDT1VOVCA9IFwiQUREX0FDQ09VTlRcIjtcbnZhciBERUxFVEVfQUNDT1VOVCA9IFwiREVMRVRFX0FDQ09VTlRcIjtcblxuZnVuY3Rpb24gYWRkQWNjb3VudChhY2NvdW50KSB7XG4gIHJldHVybiB7dHlwZTogQUREX0FDQ09VTlQsIGFjY291bnQ6IGFjY291bnR9O1xufVxuXG5mdW5jdGlvbiBkZWxldGVBY2NvdW50KCkge1xuICByZXR1cm4ge3R5cGU6IERFTEVURV9BQ0NPVU5UfTtcbn1cblxuaWYgKHR5cGVvZiBleHBvcnRzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIGV4cG9ydHMuQUREX0FDQ09VTlQgPSBBRERfQUNDT1VOVDtcbiAgZXhwb3J0cy5ERUxFVEVfQUNDT1VOVCA9IERFTEVURV9BQ0NPVU5UO1xuICBleHBvcnRzLmFkZEFjY291bnQgPSBhZGRBY2NvdW50O1xuICBleHBvcnRzLmRlbGV0ZUFjY291bnQgPSBkZWxldGVBY2NvdW50O1xufVxuIl19