define([  
        '/ivcargo/resources/js/generic/urlparameter.js'
          ,'slickGridWrapper2'
          ,PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ],function(UrlParameter, slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', branchId,fromDate,toDate,filter,toTime,onDebitCreditFlag = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			branchId		 	= UrlParameter.getModuleNameFromParam('sourceBranchId');
			fromDate			= UrlParameter.getModuleNameFromParam('fromDate');
			toDate 				= UrlParameter.getModuleNameFromParam('toDate');
			filter				= UrlParameter.getModuleNameFromParam('filter');
			onDebitCreditFlag	= UrlParameter.getModuleNameFromParam('onDebitCreditFlag');
			toTime				= UrlParameter.getModuleNameFromParam('toTime');
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditLimitTransactionReportWS/getCreditLimitTransactionReportElement.do?',	_this.renderCreditLimitTransactionElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderCreditLimitTransactionElements : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/collectionreport/creditLimitTransactionReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				
				response.isCalenderSelection	= true;
				response.agentBranchSelection	= true;
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle',
					errorMessage: 'Select proper Branch !'
				});

				hideLayer();
				
				if(onDebitCreditFlag){
					let result = response.branchList.find(function(branch) {
						if(branch.branchId == branchId){
							return branch;
						}
					});
					
					$("#dateEle").attr('data-startdate', fromDate);
					$("#dateEle").attr('data-enddate', toDate); 
					$('#dateEle').val(fromDate + " - " + toDate);
					$('#controlinput_branchEle').val(result.branchName);
					_this.onSubmit();	
				}
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
			
			if(onDebitCreditFlag){
				jsonObject["fromDate"] 	= fromDate;
				jsonObject["toDate"] 	= toDate;
				jsonObject["sourceBranchId"] = branchId;
				jsonObject["txnTypeId"] = filter;
				jsonObject["toTime"] = toTime;
				jsonObject["onDebitCreditFlag"] = onDebitCreditFlag;
			} else {
				if($("#dateEle").attr('data-startdate') != undefined){
					jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
				}
	
				if($("#dateEle").attr('data-enddate') != undefined){
					jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
				}
				
				jsonObject["sourceBranchId"] 		= $('#branchEle').val();
			}
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/creditLimitTransactionReportWS/getCreditLimitTransactionData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#billDetailsDiv').empty();
				return;
			}

			if(response.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response);
			}
			
			$('#branchLimit').html('<h4><b>Branch Limit : </b>' + response.branchLimit + '</h4>');
			
			hideLayer();
		}
	});
});