/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
		'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,'jquerylingua'
		,'language'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
        //constant for project name and domain urls
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,'focusnavigation'//import in require.config
        ,'selectizewrapper'
        ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
        ], function(JsonUtility, MessageUtility, UrlParameter, Lingua, Language, Selection, ElementFocusNavigation, Selectizewrapper, BootstrapModal, RedirectAfterUpdate){

	'use strict';// this basically give strictness to this specific js 
	var pumpRecieptId = 0, pumpReceipt, executiveId, pumpReceiptNumber, branchId, pumpReceiptId, prevFuelPumpId, jsonObject	= new Object(), _this = '', pumpName, doneTheStuff = false;

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			pumpRecieptId		= UrlParameter.getModuleNameFromParam('masterid');
		}, render: function() {
			jsonObject.pumpReceiptId 			= pumpRecieptId;
		
			getJSON(jsonObject, WEB_SERVICE_URL+'/pumpReceiptWS/getPumpReceiptDetails.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(response) {
			var jsonObject 	= new Object();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editFuelPumpName/EditFuelPumpName.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				pumpReceipt				= response.pumpReceiptList[0];
				
				if(typeof pumpReceipt !== 'undefined') {
					prevFuelPumpId			= pumpReceipt.fuelPumpId;
					executiveId				= pumpReceipt.executiveId;
					pumpReceiptNumber		= pumpReceipt.pumpReceiptNumber;	
					pumpName				= pumpReceipt.pumpName;
					branchId				= pumpReceipt.branachId;
					pumpReceiptId			= pumpReceipt.pumpReceiptId;
				}
				
				$('#pumpNameLabel').html(pumpName);
				$('#pumpReciptNameId').val(prevFuelPumpId);
				
				Selection.setSelectionToGetData(response);

				if(!jQuery.isEmptyObject(response.pumpNameMasterList)) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.pumpNameMasterList,
						valueField		:	'pumpNameMasterId',
						labelField		:	'name',
						searchField		:	'name',
						elementId		:	'pumpReciptNameId'
					});
				}
				
				$("#updateBtn").bind("click", function() {
					_this.updateFuelPump();
				});
			});
			
			hideLayer();
		}, updateFuelPump : function() {
			$('#updateBtn').hide();
			
			var jsonObject	= new Object();
			
			jsonObject.pumpReceiptId 			= pumpReceiptId;
			jsonObject.fuelPumpid				= $('#pumpReciptNameId').val();
			jsonObject.prevExecutiveId			= executiveId;
			jsonObject.prevFuelPumpId			= prevFuelPumpId;
			jsonObject.pumpReceiptNumber		= pumpReceiptNumber;
			jsonObject.branchId					= branchId;
			
			if($('#pumpReciptNameId').val() == prevFuelPumpId){
				showMessage( 'error',iconForErrMsg + ' ' + ' Select other Pump Name !');
				$('#updateBtn').show();
				hideLayer();
				return;
			}
			
		if(!doneTheStuff) {
				
				doneTheStuff = true;
				
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Do You Want To Change Fuel Pump ?",
					modalWidth 	: 	30,
					title		:	'Fuel Pump',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/pumpReceiptWS/updateFuelPump.do?',	_this.afterSaveFuelPump, EXECUTE_WITHOUT_ERROR);
					doneTheStuff = true;
					$('#updateBtn').hide();
					showLayer();
				});

				btModalConfirm.on('cancel', function() {
					$('#updateBtn').show();
					doneTheStuff = false;
					hideLayer();
				});
			}
			
		}, afterSaveFuelPump : function (response){
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'warning') {
					$('#updateBtn').show();
					return;
				}
			}
			
			setTimeout(() => {
				$('#TypeOfNumber').val(response.number);
				$('#wayBillNumber').val(response.number);
				$('#BranchId').val(response.branchId);
				redirectToAfterUpdate(response);
			}, 1500);
		}
	});
});