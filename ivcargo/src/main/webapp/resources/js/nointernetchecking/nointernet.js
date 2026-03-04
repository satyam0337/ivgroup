
var favCount = 0;

const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" 
						width="16" height="16" fill="gold" 
						viewBox="0 0 16 16" style="margin-left:5px;">
						<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765
							c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0
							l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 
							4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
					</svg>`;

function noInternetChecking(){
	window.addEventListener('load', function(e) {
		if (navigator.onLine) {
			sweetAlert.close();
		} else {
			sweetAlert({
				 title: "No Internet",
				 text: "You are offline. Please check the internet connection !",
				 icon: "info",
				 showConfirmButton: false,
			});
		}
	}, false);
	
	window.addEventListener('online', function(e) {
		sweetAlert.close();
	}, false);

	window.addEventListener('offline', function(e) {
		sweetAlert({
			title: "No Internet",
			text: "You are offline. Please check the internet connection !",
			icon: "info",
			showConfirmButton: false,
		});
	}, false); 
}

function setExecutiveDataInstorage(executiveId) {
	if (typeof(Storage) !== "undefined")
		localStorage.setItem("executiveIdCheck", executiveId);
	else
		console.log('Sorry! No Web Storage support..');
}

function updateExecutiveObj() {
	setExecutiveDataInstorage(0);
	window.location = 'Logout.do?pageId=1&eventId=2';
}

function validateExecutiveObj(executiveId) {	
	if (typeof(Storage) !== "undefined") {	
		if(localStorage.getItem("executiveIdCheck") != executiveId) { 
			window.location = 'Logout.do?pageId=1&eventId=2';
		}
	} else {
		console.log('Sorry! No Web Storage support..');
	}
}

function viewCollection() {
	let width = 350;let height = 600;let left = parseInt((screen.availWidth/2) - (width/2));
	let top = parseInt((screen.availHeight/2) - (height/2));
	childwin = window.open ('viewBranchCode.do?pageId=31&eventId=1', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
}

function gotoCreateWaybill(){
	let form = document.createElement('form');form.action = 'createWayBill.do?pageId=3&eventId=1';form.submit();
}

function updateTab(selected){
	window.status="Welcome to my homepage !!!";
	let nodeList=  document.getElementById('menu').childNodes;
	
	for(let i = 1; i < nodeList.length; i++) {
		nodeList[i].className='';
	}
	
	if(document.getElementById(selected) != null)
		document.getElementById(selected).parentNode.className='selected';
}

function validateSearchBoxForEmpty(){
	let searchBox = document.getElementById('searchHeader');
	let reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
	let str = searchBox.value.replace(reg, '');
	
	if(str.length <= 0 ||searchBox.value=='Search LR' || str <= 0){
		searchBox.value = '';searchBox.focus();
		return false;
	} else { 
		showLayer();
		document.titleWayBillSearch.submit();
	}
}

function openDashboard(dashboardUrl) {
	 let win = window.open(dashboardUrl, '_blank');
	  win.focus();
}

function viewBranchDetails() {
	let width =	 1000;let height = 400;let left = parseInt((screen.availWidth/2) - (width/2)); 
	let top = parseInt((screen.availHeight/2) - (height/2));
	childwin = window.open (branchDetailsPageUrl, 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}


function pendingBranch() {
	window.open (pendingBranchOperationsUrl);
}

function getNotifications() {
	window.open (notificationReportUrl);
}

function getNotification(notificationHostUrl) {
	let jsonObject = new Object();
	jsonObject["status"] = 1;
	jsonObject["pageNo"] = 1;
	jsonObject["notificationHostUrl"] = notificationHostUrl;
	
	if(alertify == undefined)
		return;
	
	alertify.set('notifier', 'position', 'top-center');
	alertify.set('notifier', 'delay', 3000);
	alertify.set('notifier', 'cssClass', 'custom-notifier');

	$.ajax({
		url: WEB_SERVICE_URL + '/mobileNotificationWS/getNotificationList.do',
		type: 'POST',
		dataType: 'json',
		data: jsonObject,
		success: function(data) {  
			if(data.count != undefined && data.count.unreadStatusCount > 0){
				$('#noOfNotifications').text(data.count.unreadStatusCount);
				$('#noOfNotifications').css('display', 'block');
				customNotifier(data.count.unreadStatusCount + ' Unseen Notification ', 'warning', 3)
			}else{
				$('#noOfNotifications').text(0);
				$('#noOfNotifications').css('display', 'none');
			}
		}, error: function(xhr, textStatus, errorThrown) {
			console.error(errorThrown);
		}
	});
}

function customNotifier(message, type, timeout) {
	let notifier = alertify.notify(message, type, timeout);
	
	if(notifier.elements != undefined) {
		notifier.elements.message.style.backgroundColor = 'yellow';
		notifier.elements.message.style.color = 'black';
		notifier.elements.message.style.top = '80%';
		notifier.elements.message.style.left = '50%';
	}
}

function disableEvents(event) {
	let pressedKey = String.fromCharCode(event.keyCode).toLowerCase();
	
	if (event.keyCode == 123 // Prevent F12
		|| (event.ctrlKey && event.shiftKey && (event.keyCode == 73 || event.keyCode == 74 || event.keyCode == 75)) // Prevent Ctrl+Shift+I	 and J and K
		|| (event.ctrlKey && (event.keyCode == 85 || pressedKey == "u"))  // Prevent Ctrl+U
	) {
		showMessage('info', '<i class="fa fa-info-circle"></i> Not allowed !');
		return false;
	}
}

function refreshCache(moduleId, accountGroupId) {
	if(accountGroupId == undefined)
		accountGroupId	= 0;
	
	// Assign handlers immediately after making the request,
	// and remember the jqXHR object for this request
	showLayer();
	$.ajax( "RefreshCacheAction.do?pageId=309&eventId=1&moduleId=" + moduleId + '&accountGroupId=' + accountGroupId).done(function() {
		console.log( "Cache Refresh" );
		hideLayer();
		showMessage('success', 'Refreshed !');
		
		refreshMemcache(moduleId, accountGroupId);
	}).fail(function() {
		console.log( "error" );
		hideLayer();
	});
}

function refreshPackingCache() {
	refreshCache(147);
	refreshCache(148);
}

function refreshConfiguration(moduleId, accountGroupId, filter) {
	if(filter == 1)
		showLayer();

	$.ajax( "RefreshConfigurationCacheAction.do?pageId=309&eventId=2&accountGroupId=" + accountGroupId + "&moduleId=" + moduleId).done(function() {
		console.log( "Cache Refresh" );
		hideLayer();
		
		if(filter == 1)
			showAlertMessage('success', 'Configuration refreshed, Just Refresh Operational Page and Check !');
		
		refreshMemcacheConfiguration(moduleId, accountGroupId);
	}).fail(function() {
		console.log( "error" );
		hideLayer();
	});
}

function refreshSingleConfiguration(accountGroupId, moduleId, suBmoduleId) {
	$.ajax( "RefreshConfigurationCacheAction.do?pageId=309&eventId=2&accountGroupId=" + accountGroupId + "&moduleId=" + moduleId).done(function() {
		console.log( "Cache Refresh" );
		refreshMemcacheConfiguration(moduleId, accountGroupId);
	}).fail(function() {
		console.log( "error" );
	});
}

function refreshReportConfiguration(reportId, accountGroupId, filter) {
	showLayer();
	$.ajax( "RefreshConfigurationCacheAction.do?pageId=309&eventId=2&accountGroupId=" + accountGroupId + "&reportId=" + reportId).done(function() {
		console.log( "Cache Refresh" );
		hideLayer();
		
		if(filter == 1)
			showAlertMessage('success', 'Configuration refreshed, Just Refresh Report Page and Check !');
	}).fail(function() {
		console.log( "error" );
		hideLayer();
	});
}

function refreshMemcacheConfiguration(moduleId, accountGroupId) {
	let jsonObject = new Object();
	jsonObject.accountGroupId	= accountGroupId;
	jsonObject.moduleId			= moduleId;
			
	$.ajax({
		url: WEB_SERVICE_URL + '/CacheWs/refreshGroupConfiguration.do',
		type: 'POST',
		dataType: 'json',
		data: jsonObject,
		success: function(data) {  
			if(data.success)
				console.log('Success');
		}, error: function(xhr, textStatus, errorThrown) {
			console.error(errorThrown);
		}
	});
}

function refreshDefaultConfiguration(moduleId, filter) {
	if(filter == 1)
		showLayer();

	$.ajax( "RefreshConfigurationCacheAction.do?pageId=309&eventId=2&moduleId=" + moduleId + "&isDefault=true").done(function() {
		console.log( "Cache Refresh" );
		hideLayer();
		
		if(filter == 1)
			showAlertMessage('success', 'Configuration refreshed, Just Refresh Operational Page and Check !');
		
		refreshMemcacheDefaultConfiguration(moduleId);
	}).fail(function() {
		console.log( "error" );
		hideLayer();
	});
}

function refreshMemcacheDefaultConfiguration(moduleId) {
	let jsonObject = new Object();
	jsonObject.moduleId			= moduleId;
			
	$.ajax({
		url: WEB_SERVICE_URL + '/CacheWs/refreshConfiguration.do',
		type: 'POST',
		dataType: 'json',
		data: jsonObject,
		success: function(data) {  
			if(data.success)
				console.log('Success');
		}, error: function(xhr, textStatus, errorThrown) {
			console.error(errorThrown);
		}
	});
}

function refreshMemcache(moduleId, accountGroupId) {
	let jsonObject = new Object();
	jsonObject.accountGroupId	= accountGroupId;
	jsonObject.moduleId			= moduleId;
			
	$.ajax({
		url: WEB_SERVICE_URL + '/CacheWs/updateOperationWiseCache.do',
		type: 'POST',
		dataType: 'json',
		data: jsonObject,
		success: function(data) {  
			if(data != null && data.success)
				console.log('Success');
		}, error: function(xhr, textStatus, errorThrown) {
			console.error(errorThrown);
		}
	});
}

function loadChatWidget(chatConfig, data) {
	if(getDeviceType() === 'Mobile')
		return;
	
	if(chatConfig && chatConfig.showChatApp && chatConfig.chatBaseUrl) {
		if (data.executiveId !== "") {
			let executiveObj = {
				id: data.executiveId,
				name: data.executiveName,
				cId: data.accountGroupId,
				type: "one-to-one"
			}
					
			initializeChatWidget({
				apiUrl: chatConfig.chatBaseUrl,
				currentUser: executiveObj,
				containerId: 'root'
			});
		} else {
			console.error('Executive object is null or missing required fields.');
		}
	}
}

function addFavouriteIcon(anchor, bfId) {
	if (!anchor || bfId === 0) return;

	let favIcon = $(`
	<svg class="fav-icon" data-menu="${bfId}" data-fav="false"
		 xmlns="http://www.w3.org/2000/svg"
		 width="16" height="16" viewBox="0 0 24 24"
		 fill="none" stroke="currentColor" stroke-width="2"
		 stroke-linecap="round" stroke-linejoin="round"
		 style="margin-left:8px; cursor:pointer;">
		<polygon points="12 2 15 10 23 10 17 14 19 22 
						 12 18 5 22 7 14 1 10 9 10"></polygon>
	</svg>
  `);

	favIcon.on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();

		let $star = $(this);
		let $polygon = $star.find("polygon");
		
		let dataObj = {
			bfId: bfId, 
			executiveId: executiveId
		}

		$.ajax({
			url: WEB_SERVICE_URL + '/favouritesWS/saveFavourite.do',
			type: "POST",
			data: dataObj,
			dataType: "json",
			success: function(resp) {
				if(resp == null) {
					showMessage('error', 'No response from server');
					return;	
				}
				
				let message	= resp.message;
								
				if (resp.status === "success") {
					switch (message) {
						case "Saved new":
						case "Activated":
							$polygon.attr("fill", "gold").attr("stroke", "gold");
							$star.attr("data-fav", "true");
							favCount++;
							addFav(bfId);
							break;
						case "Soft-deleted":
							$polygon.attr("fill", "none").attr("stroke", "currentColor");
							$star.attr("data-fav", "false");
							favCount--;
							$('#fav_' + bfId).remove();
							removeFromFavourites(bfId);
							break;
						default:
							showMessage('error', message.description == undefined ? response.message : message.description);
							break;
					}
				} else if (resp.status === "error")
					showMessage('error', message != undefined && message.description != undefined ? message.description : message);
				else if(message == undefined)
					showMessage('error', JSON.stringify(resp));
				else
					showMessage('error', message.description);
			},
			error: function(xhr, status, error) {
				console.error("Error saving favourite:", status, error, xhr.responseText);
			}
		});
	});

	anchor.append(favIcon);
}

function addFav(bfId) {
	let item = {}
	item.businessFunctionId = bfId;
	item.url			= $('#fbi_' + bfId).attr("href");
	item.displayName	= $('#fbi_' + bfId).html();
								
	let favoritesList = document.getElementById("favoritesList");
								
	if(favoritesList != null && favoritesList.querySelector("ul") !== null) {
		$('#favoritesList ul').append(createFavInnerLITag(item));
	} else {
		let subMenuList = [];
		subMenuList.push(item);
		$('#favoritesList').append(setInnerListData(subMenuList, true));
	}
	
	addToFavourites(item);
}

function loadFavourites() {
	$.ajax({
		url: WEB_SERVICE_URL + '/favouritesWS/getFavouritesElementConfiguration.do',
		type: "POST",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(resp) {
			if (resp && resp.data) {
				setFavourites(resp.data);
				setCookie('userFavourites', resp.data, 10);
			}
		}, error: function(xhr, status, error) {
			console.error("Error loading favourites:", status, error, xhr.responseText);
		}
	});
}

function openIVFleetLogin(defaultUrl) {
	let jsonObject			= new Object();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/ApiWS/openIVFleetLogin.do',
		data		: 	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			try {
				// prefer server redirectUrl, but fall back to defaultUrl when it's missing or empty
				let redirectUrl = (data && data.redirectUrl) ? data.redirectUrl : defaultUrl;
				if (redirectUrl) {
					window.open(redirectUrl, '_blank');
				} else {
					console.error('openIVFleetLogin: no redirectUrl returned and no defaultUrl provided');
				}
			} catch (e) {
				console.error('openIVFleetLogin: error handling response', e);
				if (defaultUrl) window.open(defaultUrl, '_blank');
			}
		},
		error: function(xhr, status, error) {
			console.error('Error calling openIVFleetLogin:', status, error, xhr && xhr.responseText);
			if (defaultUrl) {
				window.open(defaultUrl, '_blank');
			}
		}
	});
}

function refreshConfigurationKeys() {
	let jsonObject = new Object();
			
	$.ajax({
		url: WEB_SERVICE_URL + '/CacheWs/refreshConfigurationKeys.do',
		type: 'POST',
		dataType: 'json',
		data: jsonObject,
		success: function(data) {  
			if(data != null && data.success)
				console.log('Success');
		}, error: function(xhr, textStatus, errorThrown) {
			console.error(errorThrown);
		}
	});
}

function getBranchRechargeAount(){
	let jsonObject = new Object();
	jsonObject.refreshTimeForPrepaidAmountBalance 	= refreshTimeForPrepaidAmountBalance;

	$.ajax({ 
		url: IVNEXT_URL + '/branchWisePrepaidAmountWS/branchRechargeAmount',
		type: 'POST',
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		data: jsonObject,
		dataType: 'json',
		success: function (response) {
			if (response.length === 0)
				return;

			$('#branchPrepaidAmount').html("  ( Balance = " + response.RechargeAmount + " )");
		}
	});
}

function setFavourites(favourites) {
	$(".fav-icon").each(function() {
		let $star = $(this);

		let bfId = $star.data("menu");

		let isFav = favourites.some(f => f.businessFunctionId === Number(bfId));

		if (isFav) {
			$star.find("polygon").attr("fill", "gold").attr("stroke", "gold");
			$star.attr("data-fav", "true");
		}
	});

	if (favourites && favourites.length > 0)
		$('.menu').append(setFavouritesListData(starSvg, favourites, 'favorites'));
	else {
		let liMain = $('<li id="favoritesList"></li>');
		liMain.append(createMainAnchorTag(starSvg, 'favorites', 'Add Favourites'));

		$('.menu').append(liMain);
	}
}

function addToFavourites(item) {
	let favList = getCookie("userFavourites");
	
	if(favList == null) favList = [];

	// Avoid duplicates
	if (!favList.some(f => f.businessFunctionId === item.businessFunctionId)) {
		favList.push(item);
		setCookie("userFavourites", favList, 30);
	}
}

function removeFromFavourites(id) {
	let favList = getCookie("userFavourites");

	favList = favList.filter(f => f.businessFunctionId !== id);

	setCookie("userFavourites", favList, 30);
}