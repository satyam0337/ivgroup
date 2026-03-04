define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyWiseOutstandingReport/partyWiseOutstandingReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(),myNod,_this = '',gridObject,masterLangObj,masterLangKeySet,caLangObj, 
					caLangKeySet,executive;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyWiseOutStandingReportWS/getPartyWiseOutStandingReportElement.do?',_this.getElementConfigDetails,EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement 				= new Array();
			var baseHtml 				    = new $.Deferred();
			executive						= response.executive;
			

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/partyWiseOutstandingReport/PartyWiseOutstandingReport.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				var elementConfiguration	= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isPhysicalBranchesShow			= true;
				
				
				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				hideLayer();
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					if($('#regionEle').is(":visible")){
						myNod.add({
							selector	: '#regionEle',
							validate	: 'validateAutocomplete:#regionEle_primary_key',
							errorMessage	: 'Select proper Region !'
						});
					}
					if($('#subRegionEle').is(":visible")){
						myNod.add({
							selector	: '#subRegionEle',
							validate	: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage	: 'Select proper Area !'
						});
					}
					
					if($('#branchEle').is(":visible")){
						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
					}
					
				}
				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					if($('#subRegionEle').is(":visible")){
						myNod.add({
							selector	: '#subRegionEle',
							validate	: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage	: 'Select proper Area !'
						});
					}
					
					if($('#branchEle').is(":visible")){
						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
					}

				}
				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN ) {
					if($('#branchEle').is(":visible")){
						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
					}

				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN
						|| executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE ) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				
			});

		},setReportData : function(response) {
			$("#bookButNotDispatchDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_branchUnloadingDetails').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var partyWiseLedgerAccountsColumnConfig			= response.PartyWiseLedgerAccounts.columnConfiguration;
			var partyWiseLedgerAccountsKeys					= _.keys(partyWiseLedgerAccountsColumnConfig);
			var bcolConfig								    = new Object();
			
			for (var i= 0; i< partyWiseLedgerAccountsKeys.length; i++) {
				var bObj	= partyWiseLedgerAccountsColumnConfig[partyWiseLedgerAccountsKeys[i]];
				if (bObj.show == true) {
					bcolConfig[partyWiseLedgerAccountsKeys[i]]	= bObj;
				}
			}
			
			
			
			response.PartyWiseLedgerAccounts.columnConfiguration	= bcolConfig;
			response.PartyWiseLedgerAccounts.Language				= masterLangKeySet;
			if(response.PartyWiseLedgerAccounts.CorporateAccount != undefined && response.PartyWiseLedgerAccounts.CorporateAccount.length > 0) {
				hideLayer();
				$('#bottom-border-boxshadow').show();
				$('#btnprint_branchUnloadingDetails').show();
				gridObject = slickGridWrapper2.setGrid(response.PartyWiseLedgerAccounts);
				
				$('#print_branchUnloadingDetails').css("padding-left", "15px");
				$('#print_branchUnloadingDetails').css("padding-top", "10px");
				

				var dataViewObject = grid.getData();
				var columnsArr 		= new Array();
				var columns 	= grid.getColumns();
				columns.forEach(function (col) {
					columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
				});
					
				
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_branchUnloadingDetails').hide();
			}

			hideLayer();
		},onSubmit : function() {
			showLayer();
			
			var jsonObject = new Object();
			
			
			if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE ) {
				console.log("executive ",executive);
				jsonObject["regionId"] 							= executive.regionId
				jsonObject["subRegionId"] 						= executive.subRegionId;
				jsonObject["sourceBranchId"] 					= executive.branchId;
			}else {
				jsonObject["regionId"] 							= $('#regionEle_primary_key').val();
				jsonObject["subRegionId"] 						= $('#subRegionEle_primary_key').val();
				jsonObject["sourceBranchId"] 					= $('#branchEle_primary_key').val();
			}
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseOutStandingReportWS/getPartyWiseOutStandingReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function receiveSearch(grid, dataView, row) {
	if(dataView.getItem(row).receiveStringLink.trim().length > 0) {
		window.open('ClearBill.do?pageId=216&eventId=5&SetAutoData=true&CreditorId='+dataView.getItem(row).partyMasterId+'&CreditorName='+dataView.getItem(row).partyName);
	} 
}

function clearVoucherSearch(grid, dataView, row) {
	if(dataView.getItem(row).clearVoucherLink.trim().length > 0) {
		console.log("clearVoucherSearch 2",(dataView.getItem(row).clearVoucherLink.trim().length > 0))
		window.open('ClearVoucher.do?pageId=340&eventId=1&SetAutoData=true&corporateAccountId='+dataView.getItem(row).partyMasterId+'&CreditorName='+dataView.getItem(row).partyName+'&isFromPartyOutStanding=true&modulename=partyWiseExpensePayment');
	} 
}

function detailsSearch(grid, dataView, row) {
	if(dataView.getItem(row).detailsStringLink.trim().length > 0) {
		console.log("detailsSearch 2",(dataView.getItem(row).detailsStringLink.trim().length>0))
		window.open('PartyWiseLedger.do?pageId=50&eventId=130&SetAutoData=true&creditorId='+dataView.getItem(row).partyMasterId+'&creditor='+dataView.getItem(row).partyName+'&timeDuration='+30);
	} 
}

function sendMailAction(grid, dataView, row){
	var jsonObject = new Object();
	
		if(dataView.getItem(row).creditAmount == 0)
			return showMessage('error', "Credit Amount Should Not Be Zero.");
		
		jsonObject.partyName			= dataView.getItem(row).partyName;
		jsonObject.creditAmount			= dataView.getItem(row).creditAmount;
		jsonObject.corporateAccountId	= dataView.getItem(row).partyMasterId;
		
		if(confirm("Are you sure you want to send Email to " + jsonObject.partyName)) {
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseOutStandingReportWS/sendPartyOutstandingReportEmail.do',showMailMessage, EXECUTE_WITH_ERROR)
		}
}

function showMailMessage(response){
	if (response.message != undefined) {
		var errorMessage = response.message;
		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
	}
}