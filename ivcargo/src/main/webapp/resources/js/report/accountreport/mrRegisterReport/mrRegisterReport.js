define(
		[
		PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'slickGridWrapper2'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,'focusnavigation'//import in require.config
		 ],//PopulateAutocomplete
		 function(Selection, slickGridWrapper2) {
			'use strict';
			var jsonObject = new Object(), myNod, _this; 
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/mrRegisterReportWS/getMrRegisterReportElement.do?',	_this.renderMrRegisterReportElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderMrRegisterReportElements : function(response) {					
					showLayer();
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/report/accountreport/mrRegisterReport/mrRegisterReport.html",
							function() {
								baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject 		= Object.keys(response);
						
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]]) 
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
						}
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						var elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						myNod = Selection.setNodElementForValidation(response);

						hideLayer();
						
						$("#findBtn").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.onFind();
						});
					});
				},onFind : function() {
					showLayer();
					var jsonObject 			= Selection.getElementData();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/mrRegisterReportWS/getMrRegisterReportData.do', _this.setMrRegisterData, EXECUTE_WITH_ERROR);
				},setMrRegisterData : function(response) {
					if(response.message != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						hideLayer();
						return;
					}
					
					hideAllMessages();
					$('#bottom-border-boxshadow').removeClass('hide');
					slickGridWrapper2.setGrid(response);
					
					hideLayer();
				}			
					
			});
});

function wayBillSearch(grid, dataView,row) {
	hideLayer();
	
	if(dataView.getItem(row).wayBillTypeId == WAYBILL_TYPE_TO_PAY || dataView.getItem(row).wayBillTypeId  == WAYBILL_TYPE_PAID) {
		lrSearch(grid, dataView, row);
	}
	else{
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/billdetails/billlrdetails.js'], function(LRDetails){
		if(dataView.getItem(row).billId != undefined){
			var jsonObject 			= new Object();
			jsonObject.billId 		= dataView.getItem(row).billId;
			var object 				= new Object();
			object.elementValue 	= jsonObject;
			object.gridObj 			= grid;
			object.billId			= dataView.getItem(row).billId;

			if(dataView.getItem(row).billTypeId == NORMAL_BILL_TYPE_ID) {
				var btModal = new Backbone.BootstrapModal({
					content: new LRDetails(object),
					modalWidth : 80,
					title:'LR Details'
	
				}).open();
				object.btModal = btModal;
				new LRDetails(object)
				btModal.open();
			} else {
				showMessage('error',"No LR Details");
			}
		};
	});
	}
}

function transportSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.billId != undefined && item.billId > 0)
		billSearch(grid, dataView, row);
	else if(dataView.getItem(row).wayBillTypeId == WAYBILL_TYPE_TO_PAY || dataView.getItem(row).wayBillTypeId  == WAYBILL_TYPE_PAID)
		lrSearch(grid, dataView, row);
}