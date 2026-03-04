define([  
        'slickGridWrapper2'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/ctodetain/saveCTODetainDetails.js'
		,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ],function(slickGridWrapper, SaveCTODetainDetails) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', executive, ctoDetainProperties;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/CTODetainWS/getCtoDetainAddNewTabElements.do?',	_this.setCtoDetainElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setCtoDetainElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#mainContent").load("/ivcargo/html/module/ctodetain/ctodetain.html",function() {
					baseHtml.resolve();
				});
			},200);
		
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				ctoDetainProperties	= response;
				executive					= response.executive;
				$("*[data-selector=header]").html(response.moduleName);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			jsonObject["wayBillNumber"] 	= $('#wayBillNumberEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/CTODetainWS/getWayBillDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
 				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				
				if(response.CorporateAccount.length > 1)
					response.tableProperties.callBackFunctionForPartial = _this.viewWayBillCTODetainDetails;
				else {
					response.tableProperties.partialButtonLableName 	= response.CorporateAccount[0].ctoDetainStatus;
					response.tableProperties.callBackFunctionForPartial = _this.setRecordInCTODetain;
				}
				
				slickGridWrapper.setGrid(response);
			}
			
			hideLayer();
		}, viewWayBillCTODetainDetails : function(grid, dataView, row) {
			var jsonObject 		= new Object();
			jsonObject.waybillId = dataView.getItem(row).wayBillId;
			getJSON(jsonObject, WEB_SERVICE_URL+'/CTODetainWS/getWayBillDetailsByWayBillId.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setRecordInCTODetain : function(grid, dataView, row) {
			hideLayer();
			
			if ((executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE || executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN) && dataView.getItem(row).destinationBranchId != executive.branchId)
				showAlertMessage('info', 'You Are Allowed To Edit Only Which LR  Destination Is Your Branch !');	
			
			if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN && dataView.getItem(row).destinationRegionId != executive.regionId)
				showAlertMessage('info', 'You Are Allowed To Edit Only Which LR  Destination Is Your Region !');	
			
			if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN && dataView.getItem(row).destinationSubRegionId != executive.subRegionId)
				showAlertMessage('info', 'You Are Allowed To Edit Only Which LR  Destination Is Your SubRegion !');	

			var object 			= new Object();
			object.elementValue = dataView.getItem(row);
			
			var btModal = new Backbone.BootstrapModal({
				content: new SaveCTODetainDetails(object),
				modalWidth : 100,
				title: ctoDetainProperties.moduleName

			}).open();
		}
	});
});
