/**
 * 
 */

var headerConfig			= null;
var minDateFromProperty		= '00-00-0000';
var curDate	= null;
var clientAndSysDateTimeDiff	= null;
var manualBookingPageUrl		= null;
var localBookingPageUrl			= null;
var ftlBookingPageUrl			= null;
var deliveryPageUrl				= null;
var liveBranchesUrl				= null;
var announcementPageUrl			= null;
var branchDetailsPageUrl		= null;
var pendingBranchOperationsUrl	= null;
var notificationReportUrl		= null;
var customerActivityModel		= null;
var homePageUrl					= "Home.do?pageId=0&eventId=0";
var executiveId;
var planTypeName	= null;
var refreshTimeForPrepaidAmountBalance = 0;

$( document ).ready(function() {
	loadHeader();
});

function loadHeader() {
	let jsonObjectdata = new Object();
	jsonObjectdata.filter = 26; 
	
	let jsonStr = JSON.stringify(jsonObjectdata);
	
	$.getJSON("AjaxAction.do?pageId=9&eventId=16", {json:jsonStr}, function(data) {
		hideLayer();
		
		if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
			showMessage('error', data.errorDescription);
			return;
		}
		
		let homeModel		= data.homeModel;
		let wayBillModel	= data.wayBillModel;
		let mastersModel	= data.mastersModel;
		let profileModel	= data.profileModel;
		let searchModel		= data.searchModel;
		let searchModelNew	= data.searchModelNew;
		let reportModel		= data.reportModel;
		let dashBoardModel	= data.dashBoardModel;
		let tceModel		= data.tceModel;
		let chatConfig		= data.chatConfig;
		executiveId = data.executiveId;
		
		headerConfig			= data.headerConfig;
		minDateFromProperty		= data.minDate;
		deliveryPageUrl			= data.deliveryPageUrl;
		liveBranchesUrl			= data.liveBranchesUrl;
		announcementPageUrl		= data.announcementPageUrl;
		branchDetailsPageUrl	= data.branchDetailsPageUrl;
		pendingBranchOperationsUrl	= data.pendingBranchOperationsUrl;
		notificationReportUrl		= data.notificationReportUrl;
		customerActivityModel		= data.customerActivityModel;
		planTypeName				= data.planTypeName;
		
		let count = 0;
		
		if(data.logoPath && headerConfig.showCompanyLogo)
			$('.navbar-brand').html('<img id="groupLogo" style="height:43px; width: auto;" src="/ivcargo' + data.logoPath + '"></img>');
		else
			$('.navbar-brand').html('<span id="groupName">' + data.groupName + '</span>');
			
		$('#groupNameWithArea').html('Welcome ' + data.userNameWithArea);
		
		refreshTimeForPrepaidAmountBalance		= headerConfig.refreshTimeForPrepaidAmountBalance;

		if(headerConfig.showPrepaidBranchBalanceAmount && refreshTimeForPrepaidAmountBalance > 0) {
			getBranchRechargeAount();
			setInterval(getBranchRechargeAount, refreshTimeForPrepaidAmountBalance * 1000);
		}

		if(headerConfig.showCaptionOnLr)
			$('.caption').removeClass('hide');
			
		if(headerConfig.companySupportNumber != undefined)
			$('#supportNoNew').html(headerConfig.companySupportNumber);
		else
			$('#supportNoNew').html("<a href='" + headerConfig.companySupportNumberLink + "' target='_blank'><b style='color: red;'>Contact Support</b></a>");
		
		/*
			menu section started
		*/

		if(homeModel.displayName) {
			//homePageUrl	= homeModel.url;
			$('.menu').append('<li class="nav-item active"><a id="home" href="' + homeModel.url + '" onclick="showLayer();">' + homeModel.displayName + '</a></li>');
			count++;
		}
		
		if(wayBillModel.displayName && data.operationsList != undefined) {
			const operationsList = JSON.parse((data.operationsList).replace(/\//g, ''));
			
			$('.menu').append(setSubMenuData(wayBillModel, operationsList, 'create'));
			count++;
		}
		
		if(searchModel.displayName) {
			$('.menu').append('<li class="nav-item"><a id="search" href="' + searchModel.url + '" onclick="showLayer();">' + searchModel.displayName + '</a></li>');
			count++;
		}
		
		if(searchModelNew.displayName) {
			$('.menu').append('<li class="nav-item"><a id="search" href="' + searchModelNew.url + '" onclick="showLayer();">' + searchModelNew.displayName + '</a></li>');
			count++;
		}
		
		if(reportModel.displayName) {
			$('.menu').append('<li class="nav-item"><a id="report" href="' + reportModel.url + '" onclick="showLayer();">' + reportModel.displayName + '</a></li>');
			//reportSideMenu(JSON.parse((data.reportList).replace(/\//g, '')));
			count++;
		}
		
		if(profileModel.displayName) {
			$('.menu').append(setProfileListData(profileModel, profileModel.profileList, 'profile'));
			count++;
		}

		if(mastersModel.displayName && data.mastersList != undefined) {
			const mastersList = JSON.parse((data.mastersList).replace(/\//g, ''));
			
			$('.menu').append(setSubMenuData(mastersModel, mastersList, 'masters'));
			count++;
		}
		
		if(dashBoardModel.displayName && data.dashboardList != undefined) {
			const dashboardList = JSON.parse((data.dashboardList).replace(/\//g, ''));
						
			let analyticalReportList	= [];
						
			for(let mainKey in dashboardList) {
				let innerMap	= dashboardList[mainKey];
							
				if(mainKey.includes('Analytical Dashboard') && innerMap != null && !jQuery.isEmptyObject(innerMap)) {
					for (let subKey in innerMap) {
						analyticalReportList.push(subKey);
					}
				}
				
				if(!headerConfig.showSubmenuForAnalyticalDashBoard && analyticalReportList.length > 0)
					dashboardList[mainKey] = null;
			}
			
			if(!headerConfig.showSubmenuForAnalyticalDashBoard && analyticalReportList.length > 0)
				dashboardSideMenu(analyticalReportList);
			else
				$('.dashboard-left-td').remove();
								
			$('.menu').append(setSubMenuData(dashBoardModel, dashboardList, 'dashboard'));
			count++;
		}
		
		if(tceModel.displayName) {
			$('.menu').append(setProfileListData(tceModel, tceModel.tceList, 'tce'));
			count++;
		}
		
		if(customerActivityModel != undefined && customerActivityModel.userActivityList != undefined) {
			customerActivityModel.displayName = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
			$('.menu').append(setProfileListData(customerActivityModel, customerActivityModel.userActivityList, 'userActivity'));
			count++;
		}
		
		if(count <= 7)
			$('#menu-list').css('width', '40%');
		
		if(headerConfig.showUserFavourites) {
			let favourites = getCookie('userFavourites');
			
			if(favourites == null)
				loadFavourites();
			else
				setFavourites(favourites);
		} 
		
		/*
			menu section end
		*/
		
		loadChatWidget(chatConfig, data);
		
		addEventListerOnMenu();
		
		setLRTypes(data);
		setOtherSections(data);
		setMarquee(data);
		
		try {
			const urlParams		= getAllUrlParams();
			const branchCode	= urlParams.branchCode;
			
			if(branchCode != undefined)
				$('#searchHeader').val(branchCode);
		} catch(e) {
			console.log('error', e);
		}
		
		let serverDate	= new Date(data.curSystemDate);
		
		curDate			= new Date(serverDate);
		var curClient		= new Date();
		clientAndSysDateTimeDiff = curClient.getTime() - curDate.getTime();
		
		showClock();
		
		if(data.showCountDownTimer)
			startTimer(headerConfig.countDownDateTime);
		else
			$('.count-down-timer').remove();
		
		if(headerConfig.showNoInternetMsg)
			noInternetChecking();
			
		$('#website_path').val(data.WebSitePath);
		
		setExecutiveDataInstorage(data.executiveId);
		localStorage.setItem('accountGroupId', data.accountGroupId);
		localStorage.setItem('branchId', data.branchId);
		setInterval(function() {validateExecutiveObj(data.executiveId);}, 1000);
		callShortcut();
		
		if(headerConfig.DisableRightClick && !data.enableRightClick) {
			$(document).bind("contextmenu", function(e) {
				showMessage('info', '<i class="fa fa-info-circle"></i> Right Click not allowed !');
				return false;
			});
			
			$(document).keydown(function (event) {
				return disableEvents(event);
			});
		}
		
		if(headerConfig.allowToStoreBranchGeoLocation && data.storeGeoLocation) {
			loadJS('/ivcargo/resources/js/generic/getGeoLocationData.js');
			setTimeout(function() {
				getcurrentPosition();
			}, 200);
		}
		
		let gtag1	= data.gtag;
		
		if(gtag1 != undefined && gtag1.length > 0) {
			loadJS('https://www.googletagmanager.com/gtag/js?id=' + gtag1);
			
			setTimeout(function() {
				window.dataLayer = window.dataLayer || [];
				
				function gtag(){dataLayer.push(arguments);}
				gtag('js', new Date());
				gtag('config', gtag1);
			}, 100);
		}
			
		$('#Logout').click(function() {
			showLayer();updateExecutiveObj();
		});
		
		$('#TitleBarSearchButton').click(function() {
			validateSearchBoxForEmpty();
		});
		
		//getNotification(headerConfig.notificationHostUrl);
		
		$(".searcheventid").val(data.transportSearch ? 3 : 1);
	
		if(headerConfig.showIvFleetWebsiteUrlInHomepage && data.ivFleetWebsiteURL != undefined) {
			// Ensure the URL is passed as a string to the function and avoid malformed inline onclick
			let fleetUrl = data.ivFleetWebsiteURL;
			let a = $('<a/>', { id: 'fleetUrlLink', href: '#', text: 'IV Fleet Home Page' });
			// Bind click handler so the URL string is passed safely and we can prevent default navigation
			a.on('click', function(e) {
				e.preventDefault();
				try {
					openIVFleetLogin(fleetUrl);
				} catch (err) {
					console.error('Error opening IV Fleet URL:', err);
					// fallback: attempt to open as a direct link
					if (fleetUrl) window.open(fleetUrl, '_blank');
				}
			});

			$('#fleetUrl').append(a);
		}
	});
}

function setSubMenuData(wayBillModel, operationsList, id) {
	let liMain	= $('<li class="nav-item dropdown"></li>');
	liMain.append(createMainAnchorTag(wayBillModel.displayName, id, ''));
			
	let ulMain	= $('<ul class="dropdown-menu"></ul>');
	
	for(let mainKey in operationsList) {
		$(ulMain).append(setOuterListData(operationsList, mainKey));
	}
			
	$(liMain).append(ulMain);
	
	return liMain;
}

function createMainAnchorTag(displayName, id, title) {
	let a	= $('<a/>');
	a.attr('id', id);
	a.attr('class', 'nav-link dropdown-toggle');
	a.attr('data-bs-toggle', 'dropdown');
	a.attr('title', title);
	a.html(displayName);
	
	return a;
}

function setOuterListData(operationsList, mainKey) {
	let innerMap	= operationsList[mainKey];
	let liInner		= null;
		
	if(innerMap == null || jQuery.isEmptyObject(innerMap)) {
		liInner	= createInnerLITag(mainKey);
	} else {
		liInner	= $('<li class="mainmenucolor text-white"></li>');
		liInner.append(createInnerAnchorTag(mainKey));
						
		let ulInner	= $('<ul class="submenu dropdown-menu"></ul>');
				
		for (let subKey in innerMap) {
			ulInner.append(setInnerMapData(innerMap, subKey));
		}
						
		liInner.append(ulInner);
	}
	
	return liInner;
}

function createInnerAnchorTag(mainKey) {
	let a	= $('<a/>');
	a.attr('href', '#');
	a.attr('class', 'dropdown-item');
	a.attr('style', 'background:url(images/arrow.gif) no-repeat 250px;');
	a.text(mainKey.split("_")[1]);
	
	return a;
}

function createInnerLITag(mainKey) {
	let liInner	= headerConfig.showUserFavourites ? $('<li style="display:flex; align-items:center; justify-content:space-between;"></li>') : $('<li></li>');
	liInner.addClass('text-white');
	liInner.append('<a class="dropdown-item" href="' + mainKey.split("_")[0] + '" id="fbi_' + mainKey.split("_")[2] + '" onclick="showLayer();">' + mainKey.split("_")[1] + '</a>');
	
	if(headerConfig.showUserFavourites) addFavouriteIcon(liInner, mainKey.split("_")[2]);
	
	return liInner;
}

function createFavInnerLITag(item) {
	let liInner	= $('<li id="fav_' + item.businessFunctionId + '"></li>');
	liInner.append('<a href="' + item.url + '" onclick="showLayer();">' + item.displayName + '</a>');
	
	return liInner;
}

function setInnerMapData(innerMap, subKey) {
	let subMenuList	= innerMap[subKey];
	let liInner1	= null;
						
	if(subMenuList == null || jQuery.isEmptyObject(subMenuList)) {
		liInner1	= createInnerLITag(subKey);
	} else {
		liInner1	= $('<li class="submenucolor text-white"></li>');
							
		liInner1.append(createInnerAnchorTag(subKey));
		liInner1.append(setInnerListData(subMenuList, false));
	}
	
	return liInner1;
}

function setInnerListData(subMenuList, isFavourite) {
	let ulInner1	= $('<ul class="submenu dropdown-menu"></ul>');
							
	subMenuList.forEach(function (item, index) {
		if(isFavourite)
			ulInner1.append(createFavInnerLITag(item));
		else
			ulInner1.append(createInnerLITag(item));
	});
	
	return ulInner1;
}

function setProfileListData(wayBillModel, operationsList, id) {
	let liMain	= $('<li class="nav-item dropdown"></li>');
	liMain.append(createMainAnchorTag(wayBillModel.displayName, id, ''));
	
	if(operationsList)
		liMain.append(setInnerListData(operationsList, false));
	
	return liMain;
}

function setFavouritesListData(displayName, favoritesList, id) {
	let liMain	= $('<li id="favoritesList"></li>');
	liMain.append(createMainAnchorTag(displayName, id, ''));
	liMain.append(setInnerListData(favoritesList, true));
	
	return liMain;
}

function setLRTypes(data) {
	let manualBookingModel	= data.manualBookingModel;
	let localBookingModel	= data.localBookingModel;
	let ftlBookingModel		= data.ftlBookingModel;
	
	if(data.paidBooking)
		setLRTypeList('PAID', "'F7'", 'PAID');
		
	if(data.topayBooking)
		setLRTypeList('TOPAY', "'F8'", 'TO PAY');
		
	if(data.tbbBooking)
		setLRTypeList('CREDITOR', "'F9'", 'TBB');
		
	if(data.focBooking)
		setLRTypeList('FOC', "'F10'", 'FOC');
		
	if(data.isManualPermitted && manualBookingModel.displayName) {
		manualBookingPageUrl	= manualBookingModel.url;
		setManualLRTypes('MANUAL', manualBookingPageUrl, manualBookingModel.displayName, 'ALT+M', 'FFF');
	}
		
	if(data.isLocalBookingPermitted && localBookingModel.displayName) {
		localBookingPageUrl		= localBookingModel.url;
		setManualLRTypes('LOCALBOOKING', localBookingPageUrl, localBookingModel.displayName, 'ALT+L', 'FFF');
	}

	if(data.isFtlBookingPermitted && ftlBookingModel.displayName) {
		ftlBookingPageUrl		= ftlBookingModel.url;
		setManualLRTypes('FTLBOOKING', ftlBookingPageUrl, ftlBookingModel.displayName, 'ALT+F', 'FFF');
	}
}

function setLRTypeList(id, shortcut, lrType) {
	let liMain	= $('<li></li>');
	
	let span	= $('<span id="' + id + '" onclick="createForm('+ shortcut +');"> ' + shortcut.replace(/'/g, "") + ' </span>');
	let a		= $('<a style="text-decoration:none; color: #FFF;" onclick="createForm('+ shortcut +');" href="#" title="Create ' + lrType + ' LR"> : ' + lrType + '</a>');
	
	liMain.append(span);
	//liMain.append(" : ");
	liMain.append(a);
	
	$('#waybillTypesNewList').append(liMain);
}

function setManualLRTypes(id, url, displayName, shortcut, color) {
	let liMain	= $('<li></li>');
		
	let span	= $('<span id="' + id + '" onclick="showLayer();window.location = ' + url + '"> ' + shortcut + ' </span>');
	let a		= $('<a style="text-decoration:none; color: #' + color + ';" href="' + url + '" title="Create ' + displayName + ' LR"> : ' + displayName + '</a>');
		
	liMain.append(span);
	//liMain.append(" : ");
	liMain.append(a);
		
	$('#waybillTypesNewList').append(liMain);
}

function setOtherSections(data) {
	let subRegionWiseLimitedPermission	= data.subRegionWiseLimitedPermission;
	
	let pointer	= "'pointer'";
	
	if(!subRegionWiseLimitedPermission) {
		$('#othersection').append('<span><img height="20px" title="Click Here to View Branches" onclick="viewBranchDetails();" onmouseover="this.style.cursor=' + pointer + ';" src="/ivcargo/images/branch.jpg"></img></span>');
		
		if (pendingBranchOperationsUrl != undefined) 
			$('#othersection').append('<span><img height="20px" title="Pending Branch Operation Reports" onclick="pendingBranch();" onmouseover="this.style.cursor=' + pointer + ';" src="/ivcargo/images/Bell.jpg"></img></span>');
		
		if(notificationReportUrl != undefined)
			$('#othersection').append('<span><i class="fa-sharp fa-solid fa-bell fa-bounce fa-xl " style="color: #478bff; cursor: pointer; position: relative; top: 5px; right: 20px " onclick="getNotifications();"> <sup style="background-color: red; color: white; border-radius: 50%; padding: 8px 4px; font-size: 12px; position: absolute; bottom: 5px; left: 5px; transform: translate(50%, -50%);" id="noOfNotifications"></sup> </i></span>')
		
		let span	= $('<span></span>');
		
		if(announcementPageUrl != undefined) {
			$(span).append('<a href="' + announcementPageUrl + '" onclick="showLayer();"><img height="25px" title="Announcement" src="/ivcargo/images/NewStar.gif"></img></a>');
			$('#othersection').append(span);
		}

		span	= $('<span></span>');
		
		if(liveBranchesUrl != undefined) {
			$(span).append('<img height="25px" title="New" src="/ivcargo/images/NewStar.gif"></img>');
			$(span).append('<a href="' + liveBranchesUrl + '" onclick="showLayer();"><font style="font-weight: bold;color:#FFF">Live Branches</font></a>');
			$('#othersection').append(span);
		}
	}
}

function setMarquee(data) {
	let marqueeList		= data.marqueeList;
	
	if(marqueeList == undefined) {
		$('#marqueMessageDiv').remove();
		return;
	}
	
	for(const element of marqueeList) {
		$('#marqueMessage').append('<font color="' + element.color + '" size="3px"><B>' + element.marquee + '</B></font>');
	}
	
	data = $('#marqueMessage').html();
	$('#marqueMessage').html(data.replace(/\<br>/g, "")); 
}

function loadJS(file) {
	   // DOM: Create the script element
	   let jsElm = document.createElement("script");
	   // set the type attribute
	   jsElm.type = "text/javascript";
	   // make the script element load file
	   jsElm.src = file;
	   // finally insert the element to the body element in order to load the script
	   document.body.appendChild(jsElm);
}

function addEventListerOnMenu() {
	document.addEventListener("DOMContentLoaded", function() {
		/////// Prevent closing from click inside dropdown
		document.querySelectorAll('.dropdown-menu').forEach(function(element) {
			element.addEventListener('click', function (e) {
				e.stopPropagation();
			});
		})
	
		// make it as accordion for smaller screens
		if (window.innerWidth < 992) {
			// close all inner dropdowns when parent is closed
			document.querySelectorAll('.navbar .dropdown').forEach(function(everydropdown) {
				everydropdown.addEventListener('hidden.bs.dropdown', function () {
					// after dropdown is hidden, then find all submenus
					this.querySelectorAll('.submenu').forEach(function(everysubmenu) {
						// hide every submenu as well
						everysubmenu.style.display = 'none';
					});
				});
			});
				
			document.querySelectorAll('.dropdown-menu a').forEach(function(element) {
				element.addEventListener('click', function (e) {
					let nextEl = this.nextElementSibling;
					
					if(nextEl && nextEl.classList.contains('submenu')) {	
						// prevent opening link if link needs to open dropdown
						e.preventDefault();
					
						if(nextEl.style.display == 'block')
							nextEl.style.display = 'none';
						else
							nextEl.style.display = 'block';
					}
				});
			});
		}
		// end if innerWidth
	}); 
	// DOMContentLoaded	 end
}

function dashboardSideMenu(dashboardList) {
	if(dashboardList != undefined) {
		dashboardList.forEach(function (item, index) {
			$("#main_menus_dashboard").append(createInnerLITag(item));
		});
	}
}

function reportSideMenu(reportList) {
	let data = `<div class="row sidenav" id="mySidenav">
		<a href="javascript:void(0)" class="closebtn" onclick="closeNav()"> &times;</a>
			<div class="col-md-12">
				<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">` ;
				
					let count = 1;
				
					for (let [reportKey, value] of Object.entries(reportList)) {
						
						let reportHead	= (reportKey.split("_")[1]).replace(" ", "_").toLowerCase();
						
						let bgColor	= '';
						
						if(reportHead.toLowerCase().includes("trance"))
							bgColor = 'background: blue';
						
						let inp = '';
						
						if(count == 1) inp = 'in';
						
						let reports = '';
						
						value.forEach(function (str, index) {
							reports	+= `<a href="${str.split("_")[0]}&tab=${count}" onclick="showLayer();">${str.split("_")[1]}</a>`
						});
						
						data += `<div class="panel panel-primary">
							<div class="panel-heading report-heading" role="tab" id="heading_${reportHead}" style="${bgColor}">
								<h6 class="panel-title report-title">
									<a role="button" data-toggle="collapse" data-trigger="hover" data-parent="#accordion" href="#collapse_${reportHead}" aria-expanded="true" aria-controls="collapse_${reportHead}">
										<span class=""></span>
									</a>
								</h6>
							</div>
							<div id="collapse" class="tabpanel_${count} report-collapse panel-collapse collapse ${inp}" role="tabpanel" aria-labelledby="heading_${reportHead}">
								<div class="report_list">${reports}</div>
							</div>
						</div>
					</div>
				</div>
			</div>`;
			count++;
		}
					
		data += `<span id="menu_button" style="cursor:pointer" onclick="openNav()">&#9776;</span>`
		
		setTimeout(function() {
			$('#leftPanel').html(data);
		}, 1000);
}

function createVideoLink(data) {
	let ivcargoVideos	= data.ivcargoVideos;
	
	if(ivcargoVideos && ivcargoVideos != undefined && ivcargoVideos != null && ivcargoVideos.length > 0) {
		let ivcargoVideos1 = ivcargoVideos[0];
		
		if(ivcargoVideos1 == undefined || ivcargoVideos1.link == undefined || ivcargoVideos1.link == null || ivcargoVideos1.link == '')
			return;
		
		let span	= $('<span id="youtube_training_video_link"></span>');
		$(span).append('<a href="' + ivcargoVideos1.link + '" target="_blank"><i class="fa fa-youtube-play" style="font-size:36px;color:red"></i></a>');
		$('#othersection').append(span);
	}
}