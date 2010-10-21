chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if(request.key == 'theme' && (!localStorage[request.key] || localStorage[request.key] == ''))
    localStorage[request.key] = 'pablo';
  sendResponse({value: localStorage[request.key]});
});