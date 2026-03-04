let configuration;
let jsonObj = new Object()
define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let myNod, _this = '', childwin, isFromPendingBellIcon;

	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			jsonObj		= JSON.parse(localStorage.getItem("jsonObject"));
			if(jsonObj == null)
				isFromPendingBellIcon = false;
			else
				isFromPendingBellIcon = jsonObj.isFromPendingBellIcon;
			
			localStorage.removeItem("jsonObject");

		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/partyWiseShortCreditOutStandingReportWS/getPartyWiseShortCreditOutStandingReportElementConfiguration.do?',	_this.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, loadViewForReport : function(response) {
			hideLayer();
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			let loadelement		= new Array();
			let baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/partyWiseShortCreditOutStandingReport/partyWiseShortCreditOutStandingReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}

				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
			
				if(response['bookingType'])
             		_this.setBookingType();
             
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.sourceAreaSelection			= true;
				response.partySelection					= true;
				
				let bookTypeId							= $('#bookingTypeEle_primary_key').val();

				Selection.setSelectionToGetData(response);
				
				if(isFromPendingBellIcon){
					$('#ElementDiv').hide();
					_this.onSubmit();					
				}else{
					myNod = Selection.setNodElementForValidation(response);
					
					if(response['bookingType'] && bookTypeId <= 0){
						myNod.add({
							selector: '#bookingTypeEle',
							validate: 'validateAutocomplete:#bookingTypeEle_primary_key',
							errorMessage: 'Select proper Booking Type !'
						});
					}
	
					myNod.add({
						selector: '#partyNameEle',
						validate: 'validateAutocomplete:#partyNameEle',
						errorMessage: 'Select Party !'
					});
	
					hideLayer();
	
					$("#searchBtn").click(function(){
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.onSubmit();
					});
				}

			});

		}, setBookingType : function(){
			_this.setBookingTypeAutocompleteInstance();
			
			let autoBookingType = $("#bookingTypeEle").getInstance();
			
			let SelectTYPE = [
				
				{ "bookingTypeId":1, "bookingTypeName": "OTHERS" },
				{ "bookingTypeId":3, "bookingTypeName": "DDDV" },
			]
			
			$( autoBookingType ).each(function() {
				this.option.source = SelectTYPE;
			})
		},setBookingTypeAutocompleteInstance : function() {
			let autoBookingTypeName 			= new Object();
			autoBookingTypeName.primary_key 	= 'bookingTypeId';
			autoBookingTypeName.field 			= 'bookingTypeName';

			$("#bookingTypeEle").autocompleteCustom(autoBookingTypeName)
			
		},onSubmit : function() {
			showLayer();
			let jsonObject;

			if(isFromPendingBellIcon)
				jsonObject = jsonObj;
			else
				jsonObject = Selection.getElementData();
			
			jsonObject["stbsTypeCheckBox"]	= $('#stbsTypeCheckBox').is(':checked');

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyWiseShortCreditOutStandingReportWS/getPartyWiseShortCreditOutStandingReportDetails.do?', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
			}
		}
	});
});


function getPartyWiseLrDetails(grid,dataView,row){
	showLayer();
	let jsonObject = new Object();
	
	if(jsonObj != null){
		jsonObject["fromDate"] 			= jsonObj.fromDate;
		
		if($("#dateEle").attr('data-enddate') != undefined)
			jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
			
		jsonObject["sourceBranchId"] 	= jsonObj.sourceBranchId
		jsonObject["corporateAccountId"] = dataView.getItem(row).partyMasterId;
		jsonObject["partyName"] 		= dataView.getItem(row).partyName;
		
	}else{
		if($("#dateEle").attr('data-startdate') != undefined)
			jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
	
		if($("#dateEle").attr('data-enddate') != undefined)
			jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
	
		jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
		jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
		jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
		jsonObject["corporateAccountId"] = dataView.getItem(row).partyMasterId;
		jsonObject["partyName"] 		= dataView.getItem(row).partyName;
	    jsonObject["bookingTypeId"]     = $('#bookingTypeEle_primary_key').val();
	}
			    
	jsonObject["stbsTypeCheckBox"] 	= dataView.getItem(row).stbsCheckBox;
	
	localStorage.setItem("jsonObject", JSON.stringify(jsonObject));
    
    childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=partyWiseShortCreditOutStandingReportLR&masterid=&tab=6","_blank");
	hideLayer();
}