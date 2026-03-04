
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
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	showBalanceRow = false;
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchIncomeExpenseReportWS/getBranchIncomeExpenseReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/branchincomeexpensereport/BranchIncomeExpenseReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				var elementConfiguration					= new Object();

				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');
				elementConfiguration.companyElement			= $('#companyEle');
				elementConfiguration.voucherTypeElement		= $('#voucherTypeEle');
				elementConfiguration.ledgerNameElement		= $('#ledgerNameEle');

				response.elementConfiguration				= elementConfiguration;
				response.isCalenderSelection				= response.date;
				response.sourceAreaSelection				= true;
				response.companySelection					= response.company;
				response.voucherTypeSelection				= response.voucherType;
				response.ledgerNameSelection				= response.ledgerName;
				showBalanceRow								= response.showBalanceRow;
				
				Selection.setSelectionToGetData(response);

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				
				addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region !');
				addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Sub Region !');
				addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');

				if(response.company)
					addAutocompleteElementInNode(myNod, 'companyEle', 'Select proper Company !');
				
				if(response.voucherType)
					addAutocompleteElementInNode(myNod, 'voucherTypeEle', 'Select proper Voucher Type !');
					
				if(response.ledgerName)
					addAutocompleteElementInNode(myNod, 'ledgerNameEle', 'Select proper Ledger Name !');
				
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')){
						_this.onSubmit();								
					}
				});
			});
		},setReportData : function(response) {
			$("#branchIncomeExpenseReportDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#truckWiseAgencyStatementReportDiv').show();
				
				var balanceAmt	= 0;
				
				if(showBalanceRow){
					var incomeExpenseArr = response.CorporateAccount;
					var incomeAmt		= 0;
					var expenseAmount	= 0;
					
					for (var i = 0; i < incomeExpenseArr.length; i++) {
						var obj	= incomeExpenseArr[i];
						incomeAmt 		+= obj.incomeAmount;
						expenseAmount 	+= obj.expenseAmount;
					}
					
					balanceAmt	= incomeAmt - expenseAmount;
					
					$("#balanceAmount").html(incomeAmt - expenseAmount);
					$("#balanceRow").show();
					
					response.balanceAmt = balanceAmt;
				}

				gridObject = slickGridWrapper2.setGrid(response);
				_this.cancelVoucherColour(gridObject);
			}
			
			hideLayer();
		},onSubmit : function() {
			
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

			jsonObject["companyId"] 				= $('#companyEle_primary_key').val();
			jsonObject["voucherTypeId"] 			= $('#voucherTypeEle_primary_key').val();
			jsonObject["ledgerNameId"] 				= $('#ledgerNameEle_primary_key').val();

			
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchIncomeExpenseReportWS/getBranchIncomeExpenseReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},cancelVoucherColour:function(gridObject){
			console.log("inside update color..");
			slickGridWrapper2.updateRowColor(gridObject,'status',2,'highlight-row-onchange');
		}
	});
});