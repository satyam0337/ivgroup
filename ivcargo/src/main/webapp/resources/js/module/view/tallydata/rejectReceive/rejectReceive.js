define([  
		PROJECT_IVUIRESOURCES + '/resources/js/generic/tabledatawrapper.js'
		,'JsonUtility'
		,'messageUtility'
        ,'autocomplete'
        ,'autocompleteWrapper'
        ,'nodvalidation'
        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
        ,'focusnavigation'//import in require.config
		,PROJECT_IVUIRESOURCES + '/js/generic/customValidation.js'
          ],function(TableDataWrapper) {
	'use strict';
	let jsonObject = new Object(), _this = '', confirmModal, wayBillIdMap = new Map();
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/rejectReceiveWS/getRejectedTransferLedgerToReceive.do?',	_this.renderElements, EXECUTE_WITH_NEW_ERROR);
			return _this;
		}, renderElements : function(response) {
			hideLayer();
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/tce/rejectReceive.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					hideLayer();
					return;
				}
				
				_this.setWayBillReceivableModel(response);
				
				confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
				
				$("#receiveRejectedTL").click(function (event) {
					let wayBillIdArr	= getAllCheckBoxSelectValue('uniqueIds');
			
					if(wayBillIdArr.length == 0) {
						showAlertMessage('error', 'Please, Select atleast 1 LR !');
						return;
					}
					
					confirmModal.show();
				});
				
				
				$('#receiveFinalData').click(function() {
					_this.receiveFinalData();
				});
			});
			hideLayer();
		}, setWayBillReceivableModel : function(response) {
			let corporateAccount		= response.CorporateAccount;
			
			if(corporateAccount != undefined && corporateAccount.length > 0) {
				TableDataWrapper.setTableData(response);
				$('#bottom-border-boxshadow').removeClass('hide');
				
				corporateAccount.forEach(obj => {
			    	wayBillIdMap.set(obj.wayBillId, obj);
				});
			} else
				$('#bottom-border-boxshadow').addClass('hide');
		}, receiveFinalData : function() {
			let finalJsonObj = new Object();
			let wayBillList	 = [];
			
			let wayBillIdArr	= getAllCheckBoxSelectValue('uniqueIds');
			
			wayBillIdArr.forEach(wayBillId => {
				wayBillId = Number(wayBillId);
		   		
		   		if (wayBillIdMap.has(wayBillId)) {
		        	wayBillList.push(wayBillIdMap.get(wayBillId))
		    	} else {
		        	console.log(`No account found for WayBillId ${wayBillId}`);
		    	}
			});
			
			finalJsonObj.wayBillIds 			= wayBillIdArr.join(',');
			finalJsonObj.rejectedWayBills		= JSON.stringify(wayBillList);

			showLayer();
			getJSON(finalJsonObj, WEB_SERVICE_URL+'/rejectReceiveWS/insertPendingTransferLedgerDetails.do', _this.onReceivingReject, EXECUTE_WITH_NEW_ERROR); //submit JSON
		}, onReceivingReject : function(response) {
			hideLayer();

			setTimeout(function() {
				location.reload();
			}, 500);
		}
	});
});
