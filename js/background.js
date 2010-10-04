chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  sendResponse({value: localStorage[request.key]});
});