define([
	 'slickGridWrapper2',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	'JsonUtility',
	 'messageUtility',
	 'bootstrapSwitch',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],function(slickGridWrapper2, Selection, UrlParameter) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this,
		flagToSetExecutiveDetails = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			flagToSetExecutiveDetails		= UrlParameter.getModuleNameFromParam("flag");
			_this = this;
		}, render : function() {
			jsonObject.setExecutiveDetails	= flagToSetExecutiveDetails;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/userCashReportWS/getUserCashReportElement.do?',	_this.setCashStatementReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setCashStatementReportsElements : function(response){
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/usercashreport/userCashReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				var elementConfiguration	= new Object();
				
				response.executiveListByBranch			= true;
				
				elementConfiguration.singleDateElement	= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.executiveElement	= $('#executiveEle');
				
				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isPhysicalBranchesShow		= true;
				response.isDisplaySuperAdmin		= false;
				
				Selection.setSelectionToGetData(response);
				Selection.setExecutive(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if(flagToSetExecutiveDetails){
					response.subRegion	= response.subRegionList;
					Selection.setSubRegionOnRegion(response);
					Selection.setBranch(response);
					Selection.setExecutive(response);
					$("#regionEle_primary_key").val(executive.regionId);
					$("#regionEle").val(executive.regionName);
					$("#subRegionEle").val(executive.subRegionName);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
					$("#branchEle").val(executive.branchName);
					$("#executiveEle_primary_key").val(executive.executiveId);
					$("#executiveEle").val(executive.executiveName);
					setTimeout(function(){
						$("#saveBtn").trigger("click");
					},200);
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
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
					
					myNod.add({
						selector		: '#executiveEle',
						validate		: 'validateAutocomplete:#executiveEle_primary_key',
						errorMessage	: 'Select proper Executive !'
					});
				}
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
				
			})
		},onSubmit :function(){
			showLayer();
			var jsonObject = Selection.getElementData();
			
			jsonObject["fromDate"] 		= $('#dateEle').val();
			jsonObject["toDate"] 		= $('#dateEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/userCashReportWS/getUserCashReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response){
			$("#userCashCreditDetailsDiv").empty();
			$("#userCashDebitDetailsDiv").empty();
			$("#userCashDebitDetailsSummaryDiv").empty();

			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.UserCashReportCredit != undefined && response.UserCashReportCredit.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.UserCashReportCredit);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			if(response.UserCashReportDebit != undefined && response.UserCashReportDebit.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.UserCashReportDebit);
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}
			
			if(response.UserCashReportSummary != undefined && response.UserCashReportSummary.CorporateAccount != undefined) {
				$('#left-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.UserCashReportSummary);
			} else {
				$('#left-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
		}
	});
});