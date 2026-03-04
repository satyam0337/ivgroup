define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyWiseShortCreditPaymentReport/partyWiseShortCreditPaymentReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'selectizewrapper'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,Selection,UrlParameter,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _thisRender = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, fromDate = null, toDate = null, regionId = 0, subRegionId = 0, sourceBranchId = 0,wayBillTypeId = 0,
	wayBillTypeConstantList, childwin;

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/partyWiseShortCreditPaymentReportWS/getPartyWiseShortCreditPaymentReportElementConfiguration.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
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

			$("#mainContent").load("/ivcargo/html/report/partyWiseShortCreditPaymentReport/partyWiseShortCreditPaymentReport.html",function() {
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

				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				var autoTypeName 						= new Object();
				autoTypeName.primary_key 				= 'typeId';
				autoTypeName.field 						= 'typeName';

				$("#typeEle").autocompleteCustom(autoTypeName);

				var autoType = $("#typeEle").getInstance();

				$(autoType).each(function() {
					this.option.source = response.TypeList;
				})

				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.isOneYearCalenderSelection		= false;
				response.monthLimit						= 12;
				response.sourceAreaSelection			= true;
				response.partySelection					= true;
				response.isSearchByAllParty				= false;
				response.AllOptionInPartyAutocomplete	= true;

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
					selector: '#partyNameEle',
					validate: 'validateAutocomplete:#partyNameEle',
					errorMessage: 'Select Party !'
				});

				myNod.add({
					selector: '#typeEle',
					validate: 'validateAutocomplete:#typeEle',
					errorMessage: 'Select Type !'
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
			jsonObject["partyId"] 					= $('#partyNameEle').val();
			jsonObject["typeId"] 					= $('#typeEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyWiseShortCreditPaymentReportWS/getPartyWiseShortCreditPaymentReportDetails.do?', _thisRender.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData:function(response) {

			$('#partyWiseShortCreditPaymentReportDiv').empty();

			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			if(response.ShortCreditPaymentRegister != undefined) {

				var ShortCreditPaymentRegisterColumnConfig 		= response.ShortCreditPaymentRegister.columnConfiguration;
				var ShortCreditPaymentRegisterColumnKeys		= _.keys(ShortCreditPaymentRegisterColumnConfig);
				var ShortCreditPaymentRegisterConfig			= new Object();
				var NewShortCreditPaymentRegisterColumnKeys		= new Array();

				for(var i = 0;ShortCreditPaymentRegisterColumnKeys.length > i; i++) {

					if(ShortCreditPaymentRegisterColumnKeys[i] != 'grandTotal') {
						NewShortCreditPaymentRegisterColumnKeys.push(ShortCreditPaymentRegisterColumnKeys[i]);
					} else {
						break;
					}
				}

				if(response.paymentNameHM != undefined) {
					var paymentNameHM	= response.paymentNameHM;
					for(var j in paymentNameHM) {
						if(paymentNameHM[j] != null) {
							NewShortCreditPaymentRegisterColumnKeys.push(paymentNameHM[j].replace(/[' ',.,/]/g,""));
							ShortCreditPaymentRegisterColumnConfig[paymentNameHM[j].replace(/[' ',.,/]/g,"")] = {
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

				NewShortCreditPaymentRegisterColumnKeys = _.union(NewShortCreditPaymentRegisterColumnKeys, ShortCreditPaymentRegisterColumnKeys);

				for (var i = 0; i < NewShortCreditPaymentRegisterColumnKeys.length; i++) {

					var bObj	= ShortCreditPaymentRegisterColumnConfig[NewShortCreditPaymentRegisterColumnKeys[i]];

					if (bObj != null && bObj.show != undefined && bObj.show == true) {
						ShortCreditPaymentRegisterConfig[NewShortCreditPaymentRegisterColumnKeys[i]] = bObj;
					}
				}

				response.ShortCreditPaymentRegister.columnConfiguration		= _.values(ShortCreditPaymentRegisterConfig);
				response.ShortCreditPaymentRegister.Language				= masterLangKeySet;
			}

			if(response.ShortCreditPaymentRegister != undefined && response.ShortCreditPaymentRegister.CorporateAccount != undefined) {

				for(var i=0;response.ShortCreditPaymentRegister.CorporateAccount.length > i; i++) {
					var paymentNameHM	= response.paymentNameHM;

					for(var k in paymentNameHM) {
						if(paymentNameHM[k] != null) {
							response.ShortCreditPaymentRegister.CorporateAccount[i][paymentNameHM[k].replace(/[' ',.,/]/g,"")] = 0;
						}
					}
					if(response.ShortCreditPaymentRegister.CorporateAccount[i].paymentTypeCollection != undefined) {
						var paymentHM	= response.ShortCreditPaymentRegister.CorporateAccount[i].paymentTypeCollection;
						for(var l in paymentHM) {
							if(l.split("_")[1] != undefined) {
								response.ShortCreditPaymentRegister.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = paymentHM[l];
							}
						}
					}
				}

				$('#bottom-border-boxshadow').show();
				gridObject = slickGridWrapper2.setGrid(response.ShortCreditPaymentRegister);
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
	jsonObject["partyId"] 			= dataView.getItem(row).partyMasterId;
	jsonObject["partyName"] 		= dataView.getItem(row).partyName;
	jsonObject["typeId"] 			= $('#typeEle_primary_key').val();

	console.log("log --> ", dataView.getItem(row));

	localStorage.setItem("jsonObject",JSON.stringify(jsonObject));

	childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=partyWiseShortCreditPaymentReportLR&masterid=&tab=4","_blank");

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
	jsonObject["partyId"] 			= dataView.getItem(row).partyMasterId;
	jsonObject["partyName"] 		= dataView.getItem(row).partyName;
	jsonObject["typeId"] 			= $('#typeEle_primary_key').val();

	localStorage.setItem("jsonObject",JSON.stringify(jsonObject));

	if(dataView.getItem(row).crdataExist)
		childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=partyWiseShortCreditPaymentReportCR&masterid=&tab=4","_blank");
	else
		showMessage('error',"No CR Data Found !");

	hideLayer();
}