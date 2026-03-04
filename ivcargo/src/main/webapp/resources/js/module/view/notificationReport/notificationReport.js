var PaymentTypeConstant = null;
var type = 16;
var pageNumber = 0;
var previousPage, nextPage, currentPage,html;

const mIdLogo = {
		6	: ["B","DarkGreen"],
		10	: ["B","DarkGreen"],
		11	: ["DP","Orange"],
		12	: ["R","Tomato"],
		13	: ["D","RebeccaPurple"],
		14	: ["FD","SlateGray"],
		15	: ["YU","PaleVioletRed"],
		16	: ["RT","RoyalBlue"],
		89	: ["B","DarkGreen"],
		8	: ["R","#384B70"],
		3	: ["SR","#A02334"],
		4	: ["ER","#FABC3F"],
		5	: ["DR","#522258"],
		181 : ["SRS","#FFAD60"],
		183 : ["ERS","#E85C0D"],
		185 : ["DRS","#8C3061"],
		261	: ["B","DarkGreen"]

};

define(
		[
		 'JsonUtility',
		 'messageUtility',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],//PopulateAutocomplete
		 function() {
			'use strict'; let myNod,  _this;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					showLayer();
					let loadelement		= new Array();
					let baseHtml		= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/notificationReport/notificationReport.html", function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						getNotificationsList(0,1);
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.onFind(_this);
							}
						});
					});

					return _this;
				}						
			});
});

function getNotificationsList(page,statusN) {
	if (page == null) {
		page = pageNumber;
	}
	
	let jsonObject = new Object();
	jsonObject["status"] = statusN;
	jsonObject["pageNo"] = page;
	
	$.ajax({
		url: WEB_SERVICE_URL + '/mobileNotificationWS/getNotificationList.do',
		type: 'POST',
		dataType: 'json',
		data: jsonObject,
		
		success		:	function(data) {
			if(data.page != undefined && data.page.numberOfElements != 0) {
				let html = '';
				
				if(statusN == 1) {
					html	= '<tr> <th>Title</th> <th style="width:35%">Creating Time</th><tr>';
					
					for (const element of data.page.content) {
						html = html + '<tr style="cursor: pointer; cursor: hand;" onclick="changeToStatusToRead(' + element.notificationId + ',\'' + element.title + '\',\'' + element.message + '\',' + element.moduleId + ',' + data.page.pageable.pageNumber + ',' + statusN + ')">\n' +
							'<td><div style="width: 35px; height:30px; border-radius: 50%; background: ' + mIdLogo[element.moduleId][1] + '; font-size: 14px; color: white; font-weight:bold; text-align: center; line-height: 28px; display: inline-block; font-family: arial, sans-serif;">' + mIdLogo[element.moduleId][0] + '</div> &nbsp;&nbsp;&nbsp;' + element.title + '</td>\n' +
							'<td>' + element.creationDateTimeStr + '</td>\n' +
							'</tr>';
					}
				} else {
					html	= '<tr> <th>Title</th> <th style="width:35%">Creating Time</th> <th style="width:30%;">Reading Time </th> <tr>';
					
					for (let i = data.page.content.length - 1; i >=0; i--) {
						html = html + '<tr style="cursor: pointer; cursor: hand;" onclick="displayMessage(\'' + data.page.content[i].title + '\',\'' + data.page.content[i].message + '\',' + data.page.content[i].moduleId + ');">\n' +
							'<td><div style="width: 35px; height:30px; border-radius: 50%; background: ' + mIdLogo[data.page.content[i].moduleId][1] + '; font-size: 14px; color: white; font-weight:bold; text-align: center; line-height: 28px; display: inline-block; font-family: arial, sans-serif;">' + mIdLogo[data.page.content[i].moduleId][0] + '</div> &nbsp;&nbsp;&nbsp;' + data.page.content[i].title + '</td>\n' +
							'<td>' + data.page.content[i].creationDateTimeStr + '</td>'+
							'<td>'+ data.page.content[i].readDateTimeStr + '</td> </tr>';
					}
				}
				
				$('#noti_table_id').empty();
				$('#noti_table_id').append(html);
				displayPageable(data.page.pageable, data.page.totalElements, data.page.totalPages, statusN, data.page.numberOfElements, data.page.getTotalElements, data.count);
				currentPage = data.page.number;
			} else {
				alert("No Notifications Found !!!");
				$('#display_message_div').hide();
				$('#noti_table_id').empty();
			}
			
			hideLayer();	
		}, error : function(e){
			alert("No Notifications Found !!!");
			hideLayer();
		}
	});
}

function displayPageable(pageable, totalElements, totalPages, statusN, numberOfElements, getTotalElements, count) {
	previousPage = pageable.pageNumber - 1;
	
	if (previousPage < 0)
		previousPage = 0;
	
	nextPage = pageable.pageNumber + 1;
	
	if (nextPage > totalPages - 1)
		nextPage = totalPages - 1;
	
	if(totalPages == 1) {
		html = '<button id=' + 1 + ' class="btn btn-outline-info" style=\'width : 40px\' >' + 1 + '</button>'+
					  '<br><span>' + (pageable.offset + numberOfElements) + ' of ' + totalElements + ' elements</span>';
	} else {
		var html = '<button class="btn btn-outline-info" onclick="getNotificationsList(\'' + previousPage + '\',\''+statusN+'\')">&laquo; Previous</button>' +
			'<button class="btn btn-outline-info" onclick="getNotificationsList(\'' + nextPage + '\',\''+statusN+'\')">Next &raquo;</button>';
			
		for (let i = 1; i <= totalPages; i++) {
			html = html + '<button id=' + i + ' class="btn btn-outline-info" style=\'width : 40px\' onclick="getNotificationsList(\'' + (i - 1) + '\',\''+statusN+'\')">' + i + '</button>';
		}
		
		html = html + '<button class="btn btn-outline-info" onclick="getNotificationsList(\'' + (totalPages - 1) + '\',\''+statusN+'\')">Last</button>' +
					  '<br><span>' + (pageable.offset + numberOfElements) + ' of ' + totalElements + ' elements</span>';
	}
	
	$('#pageable_div_id').empty();
	$('#pageable_div_id').append(html);
	$('#spancount').empty();
	$('#spancount').append(count.unreadStatusCount);
	document.getElementById(pageable.pageNumber+1).style.background='#cef2e3';
	hideLayer();
}

function changeToStatusToRead(notificationId, title, message, moduleId, pageNumber, statusN){	
	let jsonObject					= new Object();
	jsonObject["notificationId"]	= notificationId;
	
	$.ajax({
		type		:	"POST",
		url			:	'/ivwebservices/mobileNotificationWS/updateStatus.do',
		data		:	jsonObject,
		dataType	:	'json',
		success		:	function(dataS) {
			displayMessage(title, message, moduleId);
			getNotificationsList(pageNumber,statusN);
			hideLayer();
		},
		
		error		:	function(e){
			alert("Unable to Read !!!");
		}
	});
}

function displayMessage(title, message, moduleId) {
	$('#display_message_div').show();
	let html = '<div id="closebtn" style="cursor: pointer; position: absolute; top: 1%; right: 1%; font-size: 2rem; color: red; font-weight: bolder; padding: 5px 10px; background-color: #f5f5f5; border: 2px solid red; border-radius: 50%; transition: background-color 0.3s, color 0.3s;">X</div><br><div style="margin-top: 30px; margin-bottom: 10px; text-align: center;"><div style="width: 28px; height:28px; border-radius: 50%; background: ' + mIdLogo[moduleId][1] + '; font-size: 14px; color: white; font-weight:bold; text-align: center; line-height: 28px; display: inline-block; font-family: arial, sans-serif;">' + mIdLogo[moduleId][0] + '</div>&nbsp;&nbsp;&nbsp;<div style="text-align: center; display: inline-block; font-size: 30px; font-weight: 500; color: ' + mIdLogo[moduleId][1] + ';">' + title + '</div></div><textarea readonly name="text" cols="50" rows="8" style="font-size: 12pt;">' + message + '</textarea>';
	$('#display_message_div').empty();
	$('#display_message_div').append(html);
	$("#closebtn").click(function(){
			$('#display_message_div').fadeOut(500);;
		});
}

