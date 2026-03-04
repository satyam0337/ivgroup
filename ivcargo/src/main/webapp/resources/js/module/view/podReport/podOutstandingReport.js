define(
		[
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ],//PopulateAutocomplete
		 function(slickGridWrapper2, Selection) {
			'use strict';
			let jsonObject = new Object(),gridObject, myNod,showBranchWiseData,  _this;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/podOutStandingReportWS/getPodOutStandingStatusElement.do?',	_this.renderPodWayBillsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPodWayBillsElements : function(response) {
					showLayer();
					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/podwaybills/podReportWaybills/podOutStandingReport.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject 		= Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						let autoPODStatusName 			= new Object();
						autoPODStatusName.primary_key 	= 'podStatusId';
						autoPODStatusName.url			= response.podStatusArr;
						autoPODStatusName.field 		= 'podStatusName';
						
						$("#podStatusEle").autocompleteCustom(autoPODStatusName)
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						
						showBranchWiseData	= response.showBranchWiseData;
						Selection.setSelectionToGetData(response);
						
						myNod = Selection.setNodElementForValidation(response);

						myNod.add({
							selector		: '#podStatusEle',
							validate		: 'presence',
							errorMessage	: 'Select Status !'
						});
						
						hideLayer();
						
						$("#byDateEle").click(function() {
							if ($('#byDateEle').prop('checked'))
								$('#dateSelection').removeClass('hide');
							else
								$('#dateSelection').addClass('hide');
						});
					
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind();
						});
					});
				}, onFind : function() {
					showLayer();
					let jsonObject 			= Selection.getElementData();
					
					jsonObject["PODStatus"] 			= $('#podStatusEle_primary_key').val();
					jsonObject["isSearchByDate"] 		= $('#byDateEle').prop('checked');
				
					if(showBranchWiseData)	
						getJSON(jsonObject, WEB_SERVICE_URL + '/podOutStandingReportWS/getAllPodOutStandingStatusCount.do', _this.setPODWayBillDetailsCountData, EXECUTE_WITH_ERROR);
					else
						getJSON(jsonObject, WEB_SERVICE_URL + '/podOutStandingReportWS/getAllPodOutStandingStatus.do', _this.setPODWayBillDetailsData, EXECUTE_WITH_ERROR);
				}, setPODWayBillDetailsData : function(response) {
					generateFileToDownload(response);
					hideLayer();
					
					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
					
					hideAllMessages();
					$('#bottom-border-boxshadow').removeClass('hide');
						
					response.tableProperties.callBackFunctionForPartial 	= _this.searchHistory;
					
					let language	= {};
					language.partialheader	= "History";
					response.Language	= language;
						
					slickGridWrapper2.setGrid(response);
					
					hideLayer();
				},setPODWayBillDetailsCountData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
					
					if (response.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').removeClass('hide');
						gridObject = slickGridWrapper2.setGrid(response);
					}

					hideAllMessages();
							
					gridObject.onClick.subscribe(function (e, args){
						var cell 		= gridObject.getCellFromEvent(e)
						var row 		= cell.row;
						var dataView 	= gridObject.getData();
						var item 		= dataView.getItem(row);
						let gridObj 	= args.grid;
						let id 			= gridObj.getColumns()[cell.cell].id;
						let isExcel		= true;
						
						if(id == 'lrTotal' && item.lrTotal < 500)
							_this.getPendingLRDetails(item.podBranchId, !isExcel);
						else
							_this.getPendingLRDetails(item.podBranchId, isExcel);	
					});	
						
					hideLayer();
				}, getPendingLRDetails : function(sourceBranchId,isExcel) {
					hideLayer();
					
					let jsonObject = new Object()		
					jsonObject["PODStatus"] 			= $('#podStatusEle_primary_key').val();
					jsonObject["isSearchByDate"] 		= $('#byDateEle').prop('checked');
					jsonObject["sourceBranchId"] 		= sourceBranchId;
					jsonObject["isExcel"] 				= isExcel;
					
					if($("#dateEle").attr('data-startdate') != undefined)
						jsonObject["fromDate"] 	= $("#dateEle").attr('data-startdate'); 

					if($("#dateEle").attr('data-enddate') != undefined)
						jsonObject["toDate"] 	= $("#dateEle").attr('data-enddate'); 

					if(isExcel) {
						let confirm = window.confirm('Are You Sure To Download Excel');
						
						if (confirm)
							getJSON(jsonObject, WEB_SERVICE_URL + '/podOutStandingReportWS/getAllPodOutStandingStatus.do', _this.setPODWayBillDetailsData, EXECUTE_WITH_ERROR);
					} else
						getJSON(jsonObject, WEB_SERVICE_URL + '/podOutStandingReportWS/getAllPodOutStandingStatus.do', _this.setPODWayBillDetailsData, EXECUTE_WITH_ERROR);
				}, searchHistory : function(grid, dataView, row) {
					hideLayer();
					
					if(dataView.getItem(row).wayBillId != undefined)
						window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewPODStatusDetails&masterid='+dataView.getItem(row).wayBillId,'newwindow','left=300,top=100,width=1000,height=450,toolbar=no,resizable=no,scrollbars=yes');
				}
			});
});