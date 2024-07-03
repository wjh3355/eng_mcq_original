(function (global) {
	var ajaxUtils = new Object();

	function getRequestObject() {
		return (global.XMLHttpRequest) ? new XMLHttpRequest() : null;
	}

	ajaxUtils.sendGetRequest = function (requestUrl, resHandlerFn, isJsonResponse) {
		var request = getRequestObject();

		if (!request) {
			console.error("XMLHttpRequest not supported.");
			return;
	  	}

		request.onreadystatechange = function () {
			if ((request.readyState == 4) && (request.status == 200)) {

				if (isJsonResponse === undefined) { isJsonResponse = true; }

				if (isJsonResponse) {
					resHandlerFn(JSON.parse(request.responseText));
				} else {
					resHandlerFn(request.responseText);
				}
			} else {
				console.error("Error fetching data. Status: ", request.status);
			}
		};

		request.onerror = function () {
			console.error("Request failed.");
	  	};

		request.open("GET", requestUrl, true);
		request.send(null);
	};

	global.$ajaxUtils = ajaxUtils;

})(window);