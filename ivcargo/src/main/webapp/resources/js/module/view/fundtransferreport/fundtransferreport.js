define([  
          '/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
          ,'slickGridWrapper2'
		  ,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ],function(UrlParameter, Selection, slickGridWrapper2) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', isFromCashStatement	= false, fromDate 		= null,
	toDate = null, srcRegionId = 0, srcSubRegionId = 0, srcBranchId	= 0, fundType = 0;
	return Marionette.LayoutView.extend({
		initialize : function() {
			isFromCashStatement	= UrlParameter.getModuleNameFromParam("isFromCashStatement")
			fromDate 			= UrlParameter.getModuleNameFromParam("fromDate")
			toDate 				= UrlParameter.getModuleNameFromParam("toDate")
			srcRegionId 		= UrlParameter.getModuleNameFromParam("regionId")
			srcSubRegionId 		= UrlParameter.getModuleNameFromParam("subRegionId")
			srcBranchId 		= UrlParameter.getModuleNameFromParam("sourceBranchId")
			fundType 			= UrlParameter.getModuleNameFromParam("fundType")
			
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/fundTransferReportWS/getFundTransferReportElement.do?',	_this.setFundTransferReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setFundTransferReportsElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/fundtransferreport/FundTransferReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				_this.setFundType();
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				var elementConfiguration				= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.AllOptionsForRegion	= true;
				response.AllOptionsForSubRegion	= true;
				response.AllOptionsForBranch	= true;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= response.date;
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				if(isFromCashStatement != null && isFromCashStatement) {
					setTimeout(() => {
						$('#regionEle_primary_key').val(srcRegionId);
						$('#subRegionEle_primary_key').val(srcSubRegionId);
						$('#branchEle_primary_key').val(srcBranchId);
						$('#fundTypeEle_primary_key').val(fundType);
					}, 200);
					
					response.subRegionId	= srcSubRegionId;
					response.branchId		= srcBranchId;
					response.sourceBranchId	= srcBranchId;
					response.regionId		= srcRegionId;
					response.fromDate		= fromDate;
					response.toDate			= toDate;
					response.isFromAnotherReport	= true;
					
					setTimeout(() => {
						Selection.setSelectionDataFromAnotherReport(response);
					}, 100);
					
					setTimeout(() => {
						_this.onSubmit();
					}, 300);
				}
			
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		},setReportData : function(response) {
			$("#fundTransferDiv").empty();
			$("#fundReceivedDiv").empty();
			$("#fundRejectdDiv").empty();
			
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				return;
			}

			if(response.RECEIVED != undefined && response.RECEIVED.CorporateAccount != undefined ) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.RECEIVED);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			if(response.TRANSFERED != undefined && response.TRANSFERED.CorporateAccount != undefined ) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.TRANSFERED);
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}
			
			if(response.REJECTED != undefined && response.REJECTED.CorporateAccount != undefined) {
				$('#left-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.REJECTED);
			} else {
				$('#left-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
		},onSubmit : function() {
			showLayer();
			var jsonObject = Selection.getElementData();

			jsonObject["fundTypeId"] 		= $('#fundTypeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/fundTransferReportWS/getFundTransferReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setFundType : function(){
			
			_this.setsetFundTypeAutocompleteInstance();
			
			var autoFundType = $("#fundTypeEle").getInstance();
			
			var FundTypeOption = [
					{ "fundTypeId":0, "fundTypeName": "ALL" },
			        { "fundTypeId":1, "fundTypeName": "TRANSFER" },
			        { "fundTypeId":2, "fundTypeName": "REJECT" },
			        { "fundTypeId":3, "fundTypeName": "RECEIVE" },
			    ]
			
			$( autoFundType ).each(function() {
				this.option.source = FundTypeOption;
			})
		},setsetFundTypeAutocompleteInstance : function() {
			var autoFundTypeName 			= new Object();
			autoFundTypeName.primary_key 	= 'fundTypeId';
			autoFundTypeName.field 			= 'fundTypeName';

			$("#fundTypeEle").autocompleteCustom(autoFundTypeName)
		}
	});
});