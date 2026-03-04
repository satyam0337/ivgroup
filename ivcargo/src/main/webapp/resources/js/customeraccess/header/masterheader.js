/**
 * Anant
 */

var isCRMPage = true;

$( document ).ready(function() {
	setDomainURL(JS_RESOURCES);
	loadError(CUSTOMER_ACCESS_URL_CONSTANT);
	setLogoForGroup(localStorage.getItem("currentCorporateAccountGroupId"));
	//checkValidSession();
	showHideDetails();
	
	let d = new Date();
	$("#currentYear").text(d.getFullYear());
});

function setLogoForGroup(sub) {
	let jsonObject = new Object()
	jsonObject[202] = {url : '/ivcargo/images/Logo/202_1.GIF', AccountGroupId : 202};
	jsonObject[270] = {url : '/ivcargo/images/Logo/270.GIF', AccountGroupId : 270};
	jsonObject[580] = {url : '/ivcargo/images/Logo/580.GIF', AccountGroupId : 580};
	jsonObject[619] = {url : '/ivcargo/images/Logo/619.png', AccountGroupId : 619};
	jsonObject[725] = {url : '/ivcargo/images/Logo/725.jpg', AccountGroupId : 725};
	jsonObject[669] = {url : '/ivcargo/images/Logo/669.png', AccountGroupId : 669};
	jsonObject[403] = {url : '/ivcargo/images/Logo/403.png', AccountGroupId : 403};
	jsonObject[768] = {url : '/ivcargo/images/Logo/768.jpeg', AccountGroupId : 768};
	jsonObject[609] = {url : '/ivcargo/images/Logo/609.png', AccountGroupId : 609};
		
	if (sub != null && jsonObject[sub] != undefined) {
		$(".groupLogo").attr("src", jsonObject[sub].url);
		$('#signoutLink').attr('href','/ivcustomeraccess/login/logout.do')
	}	
}

function downloadToExcel(link,tableId,reportNameId,fileName){
	let arr = document.getElementsByClassName('titletd');
	
	for (const element of arr) {
		element.setAttribute('style', 'font-weight:bold;');
	}

	link.href = "data:application/vnd.ms-excel," + encodeURIComponent(document.getElementById(tableId).innerHTML);
}

function showHideDetails() {
	let jsonObject = new Object();
	jsonObject.isCRMPage = true;
	getAjax(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/customerAccessWS/loadMasterHeader.do', setSuccess, EXECUTE_WITH_NEW_ERROR);
}

function setSuccess(response) {
	if(!response.showPickupRequestGeneration)
		$('#pickUpRequestGenerationLink').remove();
	
	if(response.searchByPickupRequestAllow) {
		$("#searchLRbtn").html('PR/LR No Search');
		$('#lrNumberEle').attr("placeholder", 'Enter LR Number or Pickup Request Number');
		$('#lrNumberEle').attr('data-tooltip', 'You can search by LR Number or Pickup Request Number');
	}
	
	const mapData = new Map();
	
	mapData.set('lrRegister', 'LR Register');
	
	if(response.showPartyBillDetailsReport)
		mapData.set('billDetails', 'Bill Details');
	
	if(response.showPartyWiseLedgerAccountReport)
		mapData.set('PartyWiseLedgerAccountsReport', 'Ledger Account Details');
	
	for (const [key, value] of mapData) {
		let href = `?modulename=${key}&isCRMPage=true`;
		let text = `<i class="fa fa-circle-o text-aqua"></i><span id="${key}" data-selector="${key}">${value}</span>`;

		let li = $('<li></li>');
		li.append(createInnerAnchorTag(href, text));
		$('.treeview-menu').append(li);
	}
	
	if(response.showNotifications) {
		$('#viewNotification').removeClass('hide');
	
		$("#viewNotification").click(function() {
			showFinalNotification();
		});
	}
}

function createInnerAnchorTag(href, text) {
	let a	= $('<a/>');
	a.attr('href', href);
	a.html(text);
	
	return a;
}

function checkValidSession() {
	fetch('/ivcustomeraccess/login/validateSession.do', {
	    method: 'GET',
	    credentials: 'include'  // Important to send cookies/session ID
	})
	.then(response => {
	    console.log(response);
	})
	.then(data => {
	    console.log('Session is valid:', data);
	})
	.catch(error => {
	   console.error(error);
	});
}

function showFinalNotification() {
	let jsonObject = new Object();
	showLayer();

	jsonObject["corporateAccountId"] = localStorage.getItem("currentCorporateAccountId");
	jsonObject["filter"] = 1;
	jsonObject["mobileNotificationsId"] = 1000000;
	jsonObject.isCRMPage = true;
				
	getAjax(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + "/mobileNotificationWS/getNotificationsByCorporateIDOnWeb.do?", responseForNotification, EXECUTE_WITH_ERROR);
}

function responseForNotification(response) {
	const notificationList = response.mobileNotificationArrLst;
	const container = document.getElementById("notificationList");
	container.innerHTML = "";

	if (!notificationList || !Array.isArray(notificationList) || notificationList.length === 0) {
		$('#notificationList').html('<tr><td colspan="3" class="text-center text-muted">No notifications available</td></tr>');
		return;
	}

	notificationList.forEach(item => {
		const tr = document.createElement("tr");
		tr.id = 'notificationRow' + item.mobileNotificationsId;
		const tdTime = document.createElement("td");
		tdTime.innerText = item.creationDateTimeStr || "";

		const tdMsg = document.createElement("td");
		tdMsg.innerHTML = (item.notifications || "").replace(/\n/g, "<br>");

		const delButton = document.createElement("button");

		delButton.textContent = " X ";
		delButton.className = "btn btn-danger btn-xs";
		delButton.onclick = function() {
			let notificationId = item.mobileNotificationsId;
			let notificationIdList = [notificationId];

			const deleteUrl = CUSTOMER_ACCESS_URL_CONSTANT + "/mobileNotificationWS/deleteNotificationsByMobileNotificationsIdsOnWeb.do?mobileNotificationsIds=" + notificationIdList.join(",");
			getAjax({}, deleteUrl, function(response) {
				if (response.mobileNotificationsIds) {
					document.getElementById("notificationRow" + response.mobileNotificationsIds).remove();
				}
			}, EXECUTE_WITH_ERROR);
		};

		const deleteBtn = document.createElement("td");
		deleteBtn.className = "text-center";
		deleteBtn.appendChild(delButton);

		tr.appendChild(tdTime);
		tr.appendChild(tdMsg);
		tr.appendChild(deleteBtn);

		container.appendChild(tr);
	});

	$('#exampleModal').modal('show');
}
