define([
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'slickGridWrapper2'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		 ,'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'language',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 ],//PopulateAutocomplete
		 function(UrlParameter, slickGridWrapper2, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this, srcBranchId, fromDate, toDate, toTime, srcRegionId, srcSubRegionId, 
			lrCancelPenaltyFlag = false, LR_CANCEL = 2;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					srcBranchId		 	= UrlParameter.getModuleNameFromParam('branch');
					srcRegionId		 	= UrlParameter.getModuleNameFromParam('region');
					srcSubRegionId	 	= UrlParameter.getModuleNameFromParam('subRegion');
					lrCancelPenaltyFlag	= UrlParameter.getModuleNameFromParam('lrCancelPenaltyFlag');
					fromDate			= UrlParameter.getModuleNameFromParam('fromDate');
					toDate 				= UrlParameter.getModuleNameFromParam('toDate');
					toTime				= UrlParameter.getModuleNameFromParam('toTime');
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/penaltyReportWS/getPenaltyReportElement.do?', _this.renderRechargeRequestElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderRechargeRequestElements : function(response) {
					showLayer();
					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/report/accountreport/penaltyReport/penaltyReport.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject = Object.keys(response);
				
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						if(response.penaltyType)
							_this.setSelectType();
						
						myNod = Selection.setNodElementForValidation(response);
						
						if(response.penaltyType) {
							myNod.add({
								selector		: '#penaltyTypeEle',
								validate		: 'presence',
								errorMessage	: 'Select Type !'
							});
						}
						
						hideLayer();

						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind();
						});
							
						if(lrCancelPenaltyFlag){
							response.subRegionId	= srcSubRegionId;
							response.branchId		= srcBranchId;
							response.sourceBranchId	= srcBranchId;
							response.regionId		= srcRegionId;
							response.fromDate		= fromDate;
							response.toDate			= toDate;
							response.isFromAnotherReport	= true;
							
							Selection.setSelectionDataFromAnotherReport(response);

							$('#penaltyType_primary_key').val(LR_CANCEL);
							$("#penaltyType").val('LR CANCEL');
							
							_this.onSubmit();
						}
					});
				}, onFind : function() {
					showLayer();
					let jsonObject 			= Selection.getElementData();
					
					jsonObject.txnTypeId		= $('#penaltyTypeEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/penaltyReportWS/getPenaltyReportData.do', _this.setPenaltyReportData, EXECUTE_WITH_ERROR);
				},onSubmit : function(){
					showLayer();
					let jsonObject 			= new Object();
					
					jsonObject["fromDate"] 				= fromDate; 
					jsonObject["toDate"] 				= toDate; 
					jsonObject.regionId 				= srcRegionId;
					jsonObject.subRegionId				= srcSubRegionId;
					jsonObject.sourceBranchId			= srcBranchId;
					jsonObject.lrCancelPenaltyFlag		= lrCancelPenaltyFlag;
					jsonObject.toTime					= toTime;
					jsonObject.txnTypeId				= LR_CANCEL;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/penaltyReportWS/getPenaltyReportData.do', _this.setPenaltyReportData, EXECUTE_WITH_ERROR);
				}, setPenaltyReportData : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
						return;
					}
					
					$('#bottom-border-boxshadow').removeClass('hide');
					slickGridWrapper2.setGrid(response);
					
					hideLayer();
				}, setSelectType : function() {
					
					$('#type').removeClass('hide');
					let autoSelectTypeName 			= new Object();
					autoSelectTypeName.primary_key 	= 'typeId';
					autoSelectTypeName.field 		= 'typeName';

					$("#penaltyTypeEle").autocompleteCustom(autoSelectTypeName)
					
					let autoSelectType = $("#penaltyTypeEle").getInstance();
					
					let SelectTYPE = [
					        { "typeId":1, "typeName": "BOOKING" },
					        { "typeId":2, "typeName": "LR CANCEL" },
					    ]
					
					$( autoSelectType ).each(function() {
						this.option.source = SelectTYPE;
					})
				}
			});
});