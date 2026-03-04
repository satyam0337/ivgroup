define([
		'JsonUtility'
	    ,'messageUtility'
	    ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/deliveryDetailsReport/deliveryDetailsReportfilepath.js'
	    ,'jquerylingua'
	    ,'language'
	    ,'autocomplete'
	    ,'autocompleteWrapper'
	    ,'slickGridWrapper2'
	    ,'selectizewrapper'
	    ,'nodvalidation'
	    ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	    ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	    ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	    ,'focusnavigation'//import in require.config
	    ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
       ],function (JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, slickGridWrapper2,
    		   Selectizewrapper, NodValidation, BootstrapModal, datePickerUI, Selection, ElementFocusNavigation, UrlParameter) {
		'use strict';
		var jsonObject = new Object(), myNod, _thisRender = '', masterLangObj, masterLangKeySet, childwin;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/deliveryDetailsReportWS/getDeliveryDetailsReportElement.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _thisRender;
		}, loadViewForReport : function(response) {
			hideLayer();
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load( "/ivcargo/html/report/deliveryDetailsReport/deliveryDetailsReport.html" , function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}

				executive			= response.executive;

				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				var paymentTypeAutoComplete 		= new Object();
				paymentTypeAutoComplete.primary_key = 'paymentTypeId';
				paymentTypeAutoComplete.field 		= 'paymentTypeName';

				$("#paymentTypeEle").autocompleteCustom(paymentTypeAutoComplete);

				var autopaymentType 				= $("#paymentTypeEle").getInstance();

				$(autopaymentType).each(function() {
					this.option.source 	= response.paymentTypeConstants;
				});

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.isOneYearCalenderSelection	= false;
				response.monthLimit					= 12;
				response.sourceAreaSelection		= true;
				response.AllOptionInPartyAutocomplete		= true;
				response.partySelection		= true;

				Selection.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				if($('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}

				if($('#subRegionEle').is(":visible")){
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}

				if($('#branchEle').is(":visible")){
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}

				myNod.add({
					selector: '#paymentTypeEle',
					validate: 'presence:#paymentTypeEle',
					errorMessage: 'Select Payment Type !'
				});

				myNod.add({
					selector: '#partyNameEle',
					validate: 'validateAutocomplete:#partyNameEle',
					errorMessage: 'Select Party !'
				});

				hideLayer();

				$("#searchBtn").click(function(){
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_thisRender.onSubmit();
					}
				});
			});

		},onSubmit:function() {

			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
			}
			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			jsonObject["paymentTypeId"] 			= $('#paymentTypeEle_primary_key').val();
			jsonObject["partyId"] 					= $('#partyNameEle').val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryDetailsReportWS/getDeliveryDetailsReportDetails.do?', _thisRender.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData:function(response) {

			$('#deliveryDetailsReportDetailsDiv').empty();

			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			if(response.DeliveryDetailsModel != undefined) {

				var DeliveryDetailsModelColumnConfig 	= response.DeliveryDetailsModel.columnConfiguration;
				var DeliveryDetailsModelColumnKeys		= _.keys(DeliveryDetailsModelColumnConfig);
				var DeliveryDetailsModelConfig			= new Object();

				var NewDeliveryDetailsModelColumnKeys	= new Array();
				for(var i = 0;DeliveryDetailsModelColumnKeys.length > i; i++) {

					if(DeliveryDetailsModelColumnKeys[i] != 'grandTotal') {
						NewDeliveryDetailsModelColumnKeys.push(DeliveryDetailsModelColumnKeys[i]);
					} else {
						break;
					}
				}

				if(response.paymentNameHM != undefined) {
					var paymentNameHM	= response.paymentNameHM;
					for(var j in paymentNameHM) {
						if(paymentNameHM[j] != null) {
							NewDeliveryDetailsModelColumnKeys.push(paymentNameHM[j].replace(/[' ',.,/]/g,""));
							DeliveryDetailsModelColumnConfig[paymentNameHM[j].replace(/[' ',.,/]/g,"")] = {
									"dataDtoKey":paymentNameHM[j].replace(/[' ',.,/]/g,"")
									,"dataType":"number"
									,"languageKey":paymentNameHM[j].replace(/[' ',.,/]/g,"")
									,"searchFilter":false
									,"listFilter":false
									,"columnHidden":false
									,"displayColumnTotal":true
									,"columnMinimumDisplayWidthInPx":100
									,"columnInitialDisplayWidthInPx":100
									,"columnMaximumDisplayWidthInPx":120
									,"columnPrintWidthInPercentage":8
									,"elementCssClass":""
									,"columnDisplayCssClass":""
									,"columnPrintCssClass":""
									,"sortColumn":true
									,"show":true
							};
							masterLangKeySet[paymentNameHM[j].replace(/[' ',.,/]/g,"")] = paymentNameHM[j].replace(/[' ',.,/]/g,"");
						}
					}
				}

				NewDeliveryDetailsModelColumnKeys = _.union(NewDeliveryDetailsModelColumnKeys, DeliveryDetailsModelColumnKeys);

				for (var i = 0; i < NewDeliveryDetailsModelColumnKeys.length; i++) {

					var bObj	= DeliveryDetailsModelColumnConfig[NewDeliveryDetailsModelColumnKeys[i]];

					if (bObj != null && bObj.show != undefined && bObj.show == true) {
						DeliveryDetailsModelConfig[NewDeliveryDetailsModelColumnKeys[i]] = bObj;
					}
				}

				response.DeliveryDetailsModel.columnConfiguration	= _.values(DeliveryDetailsModelConfig);
				response.DeliveryDetailsModel.Language				= masterLangKeySet;
			}

			if(response.DeliveryDetailsModel != undefined && response.DeliveryDetailsModel.CorporateAccount != undefined) {

				for(var i=0;response.DeliveryDetailsModel.CorporateAccount.length > i; i++) {
					var paymentNameHM	= response.paymentNameHM;

					for(var k in paymentNameHM) {
						if(paymentNameHM[k] != null) {
							response.DeliveryDetailsModel.CorporateAccount[i][paymentNameHM[k].replace(/[' ',.,/]/g,"")] = 0;
						}
					}
					if(response.DeliveryDetailsModel.CorporateAccount[i].paymentTypeCollection != undefined) {
						var paymentHM	= response.DeliveryDetailsModel.CorporateAccount[i].paymentTypeCollection;
						for(var l in paymentHM) {
							if(l.split("_")[1] != undefined) {
								response.DeliveryDetailsModel.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = paymentHM[l];
							}
						}
					}
				}

				$('#bottom-border-boxshadow').show();
				slickGridWrapper2.setGrid(response.DeliveryDetailsModel);
			} else {
				$('#bottom-border-boxshadow').hide();
			}
			hideLayer();
		}
	});
});


function getLRWiseDetails(grid,dataView,row){

	showLayer();

	var jsonObject = new Object();

	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
	}

	jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["paymentTypeId"] 	= $('#paymentTypeEle_primary_key').val();
	jsonObject["partyId"] 			= dataView.getItem(row).partyMasterId;
	jsonObject["partyName"] 		= dataView.getItem(row).corporateAccountDisplayName;

	localStorage.setItem("jsonObject",JSON.stringify(jsonObject));

	childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=deliveryDetailsReportLRDetails&masterid=&tab=4","_blank");

	hideLayer();
}

function getCRWiseDetails(grid,dataView,row){

	showLayer();

	var jsonObject = new Object();

	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
	}

	jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["paymentTypeId"] 	= $('#paymentTypeEle_primary_key').val();
	jsonObject["partyId"] 			= dataView.getItem(row).partyMasterId;
	jsonObject["partyName"] 		= dataView.getItem(row).corporateAccountDisplayName;

	localStorage.setItem("jsonObject",JSON.stringify(jsonObject));

	childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=deliveryDetailsReportCRDetails&masterid=&tab=4","_blank");

	hideLayer();
}
