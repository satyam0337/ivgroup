var expenseDetailsList 	= null;
var chargeMasterList	= null;
var incomeExpenseChargeToExclude	= null;
define([	'JsonUtility'
			,'messageUtility'
			,'/ivcargo/resources/js/generic/urlparameter.js'
	        ,'nodvalidation'
	        ,'focusnavigation'//import in require.config
	        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	        ],function(JsonUtility, MessageUtility, UrlParameter, NodValidation,ElementFocusNavigation,Selection,btModalConfirm){
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet ,voucherDetailsId, lhpvId = 0;;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			voucherDetailsId	= UrlParameter.getModuleNameFromParam('masterid');
			lhpvId			   	= UrlParameter.getModuleNameFromParam('lhpvId');
		},render : function(){
			if(voucherDetailsId > 0) {
				var jsonObject = new Object();
				jsonObject["lhpvId"] 					= lhpvId;
				jsonObject["exepenseVoucherDetailsId"] 	= voucherDetailsId;
				getJSON(jsonObject, WEB_SERVICE_URL + '/lhpvAdvanceSettlementWS/getExpenseVoucherDetailsChangeDateById.do?', _this.renderVoucherDetails, EXECUTE_WITH_ERROR);
				return _this;
			} else {
				showMessage("error","Voucher Id not Found!");
				setTimeout(function(){
					window.close();
				},2000);
			}
		},renderVoucherDetails : function(response){
			if(response.message != undefined){
				setTimeout(function(){
					window.close();
				},1500);
			}
			var loadelement 	= [];
			var baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editvoucherdetails/EditLHPVVoucherDetails.html",
			function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				$("#editLHPVAdvanceVoucherPaymentMode").remove();
				if(response.expenseVoucherDetails != undefined)
					_this.setModel(response);
				else 
					showMessege("error","No Records Found!!");	
			});
			
		},setModel : function(response) {
			
			var elementConfiguration		= new Object();
			var expenseVoucherDetails		= response.expenseVoucherDetails;
			var previousDate 				= response.previousDate;
			var currentDate					= response.currentDate;
			
			var options	= new Object();
			
			options.minDate		= previousDate;
			
			response.isCalenderForSingleDate			= true;
			response.options							= options;
			elementConfiguration.singleDateElement		= $('#dateEle');
			response.elementConfiguration				= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			$('#dateEle').val(currentDate);
			$("#dateEle").attr('data-startdate', currentDate);
			$("#dateEle").attr('data-date', currentDate);
			
			$(".ok").on('click', function() {
				if($('#dateEle').attr('data-date') != undefined) {
					var expenseDateTime	= $('#dateEle').attr('data-date');
				} else {
					var expenseDateTime	= $('dateEle').attr('data-startdate');
				}
				
				var expenseDateTime		= parseDate(expenseDateTime);
				var oldExpenseDateTime 	= parseDate(expenseVoucherDetails.expenseDateTimeStr);
				
				var isSameTime 			= expenseDateTime.getTime() == oldExpenseDateTime.getTime();
				
				if(isSameTime) {
					showMessage('error', iconForErrMsg + ' Please, Select Different Date !');
					return;
				}
				
				var jsonObjectNew 	= new Object();
				
				jsonObjectNew["currentDate"] 				= toDateString(expenseDateTime, 1);  //dd-mm-YYYY
				jsonObjectNew["exepenseVoucherDetailsId"] 	= voucherDetailsId;
				jsonObjectNew["previousDate"] 				= previousDate;
				
				btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Update Date?",
					modalWidth 	: 	30,
					title		:	'Update Date',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				btModalConfirm.on('ok', function() {
					getJSON(jsonObjectNew, WEB_SERVICE_URL+'/lhpvAdvanceSettlementWS/updateLHPVAdvancePaymentVoucherDate.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
					
				});
			});
		},onUpdate : function(response){
			redirectToAfterUpdate(response);
		}
	});
});