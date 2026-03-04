define([  'JsonUtility'
          ,'messageUtility'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/deliveryBranchLedger/deliverybranchledgerfilepath.js'
          ,'jquerylingua'
          ,'language'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
          ],function(JsonUtility, MessageUtility, FilePath, Lingua, Language,
        		  slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _this = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/deliveryBranchLedgerWS/getDeliveryBranchLedgerElement.do?',	_this.setDeliveryBranchLedgerElement, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setDeliveryBranchLedgerElement : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/deliverybranchledger/deliveryBranchLedger.html",function() {
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
				
				response.isCalenderForSingleDate	= true;
				response.sourceAreaSelection		= true;
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.singleDateElement	= $('#dateEle');
				
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#regionEle',
					validate: 'validateAutocomplete:#regionEle_primary_key',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#subRegionEle',
					validate: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select proper Branch !'
				});
			
				hideLayer();
			
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
			});
		},setReportData : function(response) {
			
			$("#deliveryBranchLedgerDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_deliveryBranchLedger').hide();
				$("#deliveryBranchLedgerDiv").hide();
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			if(response.DeliveryBranchLedger != undefined) {
				var DeliveryBranchLedgerColumnConfig = response.DeliveryBranchLedger.columnConfiguration;
				var DeliveryBranchLedgerColumnKeys	= _.keys(DeliveryBranchLedgerColumnConfig);
				var DeliveryBranchLedgerConfig		= new Object();
				
				for (var i = 0; i < DeliveryBranchLedgerColumnKeys.length; i++) {
					var bObj	= DeliveryBranchLedgerColumnConfig[DeliveryBranchLedgerColumnKeys[i]];
					
					if (bObj.show != undefined && bObj.show == true) {
						DeliveryBranchLedgerConfig[DeliveryBranchLedgerColumnKeys[i]] = bObj;
					}
				}
			
				response.DeliveryBranchLedger.columnConfiguration	= _.values(DeliveryBranchLedgerConfig);
				response.DeliveryBranchLedger.Language				= masterLangKeySet;
			}
			
			if(response.DeliveryBranchLedger != undefined && response.DeliveryBranchLedger.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').show();
				$('#print_deliveryBranchLedger').show();
				$("#deliveryBranchLedgerDiv").show();
				hideAllMessages();
				
				gridObject = slickGridWrapper2.setGrid(response.DeliveryBranchLedger);
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#print_deliveryBranchLedger').hide();
				$("#deliveryBranchLedgerDiv").hide();
			}
			
			hideLayer();
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-date') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-date'); 
			} else if ($("#dateEle").attr('data-startdate') != undefined) {
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/deliveryBranchLedgerWS/getDeliveryBranchLedgerDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function transportSearch(grid,dataView,row){

	if($("#dateEle").attr('data-date') != undefined){
		var fromDate = $("#dateEle").attr('data-date');
	} else if ($("#dateEle").attr('data-startdate') != undefined) {
		var fromDate = $("#dateEle").attr('data-startdate');
	}
	
	var regionId 			= $('#regionEle_primary_key').val();
	var subRegionId 		= $('#subRegionEle_primary_key').val();
	var sourceBranchId 	    = $('#branchEle_primary_key').val();
	
	if(dataView.getItem(row).chargeType != undefined && dataView.getItem(row).chargeType > 0 && dataView.getItem(row).amount > 0){
		window.open('BranchWiseIncomeExpenseDetails.do?pageId=281&eventId=2&fromDate='+fromDate+'&toDate='+fromDate+'&region='+regionId+'&subRegion='+subRegionId+'&branch='+sourceBranchId+'&selectCharge='+dataView.getItem(row).chargeType+'&expenseType='+3+'&searchBy=');
	} else {
		showMessage('info', "No Record Found");
	}
}