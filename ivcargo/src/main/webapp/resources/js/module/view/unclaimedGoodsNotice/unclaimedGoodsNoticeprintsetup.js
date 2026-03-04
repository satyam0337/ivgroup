define(['JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	// to get parameter from url to send it to ws
	
	,'jquerylingua'
	,'language'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/genericfunctions.js'
	],
	function(JsonUtility, MessageUtility, UrlParameter,jquerylingua, language) {
	'use strict';// this basically give strictness to this specific js
	var 
	wayBillId = 0,
	jsonObject	= new Object(),
	masterLangObj, 
	masterLangKeySet,
	noticeId = 0,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			wayBillId = UrlParameter.getModuleNameFromParam("masterid");
			noticeId = UrlParameter.getModuleNameFromParam("noticeId");
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {
			jsonObject.waybillId = wayBillId;	
			jsonObject.noticeId = noticeId;	
			getJSON(jsonObject, WEB_SERVICE_URL + '/unclaimedGoodsNoticeWS/printNotice.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);

			return _this;
		},getResponseForPrint : function(response) {

			console.log("response---",response)
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			if(response.CorporateAccount.noticeId == 1){
				$("#mainContent").load("/ivcargo/html/print/unclaimedGoodsNotice/unclaimedGoodsNoticeprint_notice1.html",function(){
					baseHtml.resolve();
				});
			} else if(response.CorporateAccount.noticeId == 2){
				$("#mainContent").load("/ivcargo/html/print/unclaimedGoodsNotice/unclaimedGoodsNoticeprint_notice2.html",function() {
					baseHtml.resolve();
				});
			} else if(response.CorporateAccount.noticeId == 3){
				$("#mainContent").load("/ivcargo/html/print/unclaimedGoodsNotice/unclaimedGoodsNoticeprint_notice3.html",function() {
					baseHtml.resolve();
				});
			}
			$.when.apply($, loadelement).done(function() {
				_this.getunclaimedGoodsNoticeData(response.CorporateAccount);
			});
			hideLayer();
		},getunclaimedGoodsNoticeData(unclaimedGoodsNoticeData){
			
			setTimeout(() => {
				
			$("*[data-lr='bookingDateTimeStr']").html(unclaimedGoodsNoticeData.bookingDateTimeStr);
			$("*[data-lr='consignee']").html(unclaimedGoodsNoticeData.consignee);
			$("*[data-lr='consigneeAddress']").html(unclaimedGoodsNoticeData.consigneeAddress);
			$("*[data-lr='consigneeMobile']").html(unclaimedGoodsNoticeData.consigneeMobile);
			$("*[data-lr='consignmentDetails']").html(unclaimedGoodsNoticeData.consignmentDetails);
			$("*[data-lr='consignor']").html(unclaimedGoodsNoticeData.consignor);
			$("*[data-lr='consignorAddress']").html(unclaimedGoodsNoticeData.consignorAddress);
			$("*[data-lr='consignorMobile']").html(unclaimedGoodsNoticeData.consignorMobile);
			$("*[data-lr='destinationBranch']").html(unclaimedGoodsNoticeData.destinationBranch);
			$("*[data-lr='noticeNumber']").html(unclaimedGoodsNoticeData.noticeNumber);
			$("*[data-lr='quantity']").html(unclaimedGoodsNoticeData.quantity);
			$("*[data-lr='saidToContain']").html(unclaimedGoodsNoticeData.saidToContain);
			$("*[data-lr='sourceBranch']").html(unclaimedGoodsNoticeData.sourceBranch);
			$("*[data-lr='transactionTimeStr']").html(unclaimedGoodsNoticeData.transactionTimeStr);
			$("*[data-lr='waybillNumber']").html(unclaimedGoodsNoticeData.waybillNumber);
			$("*[data-lr='noticeId']").html(unclaimedGoodsNoticeData.noticeId);
			$("*[data-lr='consignorEmail']").html(unclaimedGoodsNoticeData.consignorEmail);
			$("*[data-lr='consigneeEmail']").html(unclaimedGoodsNoticeData.consigneeEmail);
			$("*[data-lr='arrivalDateTimeStr']").html(unclaimedGoodsNoticeData.arrivalDateTimeStr);
			
			if(unclaimedGoodsNoticeData.noticeOneNumber != null){
				$("*[data-lr='noticeOneNumber']").html(unclaimedGoodsNoticeData.noticeOneNumber);
			} else {
				$("*[data-lr='noticeOneNumber']").html('--');
			}
			if(unclaimedGoodsNoticeData.noticeTwoNumber != null){
				$("*[data-lr='noticeTwoNumber']").html(unclaimedGoodsNoticeData.noticeTwoNumber);
			} else {
				$("*[data-lr='noticeTwoNumber']").html('--');
			}
			if(unclaimedGoodsNoticeData.noticeOneDate != null){
				$("*[data-lr='noticeOneDate']").html(unclaimedGoodsNoticeData.noticeOneDate);
			} else {
				$("*[data-lr='noticeOneDate']").html('--');
			}
			if(unclaimedGoodsNoticeData.noticeTwoDate != null){
				$("*[data-lr='noticeTwoDate']").html(unclaimedGoodsNoticeData.noticeTwoDate);
			} else {
				$("*[data-lr='noticeTwoDate']").html('--');
			}
			hideLayer();
				}, 50);
			
			setTimeout(() => {
				window.print();
			}, 100);
			}
		
	});
	
});