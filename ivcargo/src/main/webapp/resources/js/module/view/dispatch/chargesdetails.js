/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        'marionette'//Marionette
        //marionette JS framework
        ,'elementmodel'//ElementModel
        //Elementmodel consist of default values which is passed when setting it in template
        ,'elementTemplateJs'//elementTemplateJs
        //elementtemplate is javascript utility which consist of functions that operate on elements
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchdetails.js'
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'validation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,'JsonUtility'
        ,'messageUtility'
        ,PROJECT_IVUIRESOURCES+'/js/element/elementoperation.js'
        ], function (Marionette, ElementModel, elementTemplateJs, ElementTemplate, ModelUrls, DispatchDetails) {
	var dispatchData, lsPropertyConfig,
	commision,
	_this;
	return Marionette.ItemView.extend({
		initialize: function(data) {
			//_this object is added because this object is not found in onRender function
			dispatchData 			= data.slickData;
			lsPropertyConfig		= data.lsPropertyConfig;
			_this 					= this;
		}, render: function(){
			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		}, onBeforeRender: function() {}, 
		onRender: function(){
			//jsonutility.js
			var finalJsonObj = new Object();
			finalJsonObj.lrArray  = JSON.stringify(dispatchData);
			getJSON(finalJsonObj, WEB_SERVICE_URL+'/dispatchWs/getChrgsForLhpvWhileDispatch.do', _this.setElements, EXECUTE_WITH_ERROR);
			
			return _this;
		}, onAfterRender: function() {},
		setElements:function(data){
			
			var valObj				= data.valObject;
			var chargeColl 			= _.sortBy(valObj.lhpvChargesArrList, 'sequenceNumber');
			var chargeModel 		= ModelUrls.lhpvCharges();
			var chargesModelArray 	= new Array(); 
			
			_.each(chargeColl,function(lhpvCharge){
				var newChargeData = JSON.parse(chargeModel);
				newChargeData.elementId 			= 'charge' + lhpvCharge.lhpvChargeTypeMasterId;
				newChargeData.labelId 				= 'label' + lhpvCharge.lhpvChargeTypeMasterId;
				newChargeData.labelValue 			= lhpvCharge.displayName;
				newChargeData.tooltipName 			= lhpvCharge.displayName;
				newChargeData.elementDefaultValue 	= lhpvCharge.amount;
				newChargeData.elementonFocus 		= 'this.select()';
				
				if(lhpvCharge.lhpvChargeTypeMasterId == 2) {
					commision = lhpvCharge.amount;
				}
				
				chargesModelArray.push(newChargeData);
			})
			
			showLayer();
			elementTemplateJs.appendElementInTemplate(chargesModelArray, ElementModel, ElementTemplate, _this);		
			
			if(!lsPropertyConfig.validateSourceBranchForSingleLR) {
				$('#lhpvChargeModal').prepend("<div id='information' style='padding-left : 15px;font-size : 18px;font-weight: bold'>Topay Details</div>");

				$('#information').append("<table class='table table-bordered' style='width : 35%' id='topayDetails'></table>");

				$('#topayDetails').append("<thead>");
				$('thead').append("<tr>");
				$('thead tr').append("<th height='30px' style='font-size : 15px;font-weight: bold'>Freight</th>");
				$('thead tr').append("<th height='30px' style='font-size : 15px;font-weight: bold'>Hamali</th>");
				$('thead tr').append("<th height='30px' style='font-size : 15px;font-weight: bold'>S Tax</th>");
				$('thead').append("</tr>");
				$('#topayDetails').append("</thead>");

				$('#topayDetails').append("<tbody>");
				$('tbody').append("<tr>");
				$('tbody tr').append("<td>"+ valObj.topayFreight+"</td>");
				$('tbody tr').append("<td>"+ valObj.hamali+"</td>");
				$('tbody tr').append("<td>"+ valObj.topayServiceTax+"</td>");
				$('tbody').append("</tr>");
				$('#topayDetails').append("</tbody>");
			}

			hideLayer();
			//append value in template
			setTimeout(_this.executeFunctions,200);
		},setCommision:function(){
			$('#charge2').val(($('#charge55').val())/10  + commision)
		},checkPaidCedit:function(){
			if($('#charge59').val() > 0 && $('#charge55').val() > 0){
				showMessage('error', '<i class="fa fa-times-circle"></i>' + ' ' + 'You can enter either "Paid Credit" or "Paid Debit" amount only. Not both at a time.');
				$('#charge55').val(0);
				$('#charge55').focus();
			} else {
				hideAllMessages();
			}
		},checkPaidDebit:function(){
			if($('#charge55').val() > 0 && $('#charge59').val() > 0){
				showMessage('error', '<i class="fa fa-times-circle"></i>' + ' ' + 'You can enter either "Paid Credit" or "Paid Debit" amount only. Not both at a time.');
				$('#charge59').val(0);
				$('#charge59').focus();
			} else {
				hideAllMessages();
			}
		},setBalanceAmount:function(){
			if($('#charge4').val() > 0 && $('#charge5').val() > 0){
				var lorryhire	=	Number($('#charge4').val());
				var advance		=   Number($('#charge5').val());
				$('#charge6').val(lorryhire - advance);
				$('#charge6').attr("disabled", true);
				$('#charge7').attr("disabled", true);
			}else if($('#charge4').val() > 0){
				var lorryhire	=	Number($('#charge4').val());
				$('#charge6').val(lorryhire);
				$('#charge6').attr("disabled", true);
				$('#charge7').attr("disabled", true);
			}else if($('#charge4').val() == '' && $('#charge5').val() > 0){
				var lorryhire	= 0;
				var advance		=   Number($('#charge5').val());
				$('#charge6').val(lorryhire - advance);
				$('#charge6').attr("disabled", true);
				$('#charge7').attr("disabled", true);
			}
		},executeFunctions:function(){
			initialiseFocus('#lhpvChargeModal');
			$('#charge55').focus();
			$(".ok").on('click', function() {
				var object 		= new Object();
				
				object.slickData 					= dispatchData;
				object.lsPropertyConfig				= lsPropertyConfig;
				
				var btModal = new Backbone.BootstrapModal({
					content		: new DispatchDetails(object),
					modalWidth 	: 90,
					title		: 'Truck Information',
					okText		: 'Dispatch',
					showFooter 	: true,
					okCloses	: false,
					focusOk		: false
				}).open();
			});
		},events:{
			"blur #charge55": "setCommision,checkPaidCedit",
			//"blur #charge55": "checkPaidCedit",
			"blur #charge59": "checkPaidDebit",
			"keyup #charge55": "checkPaidCedit",
			"keyup #charge59": "checkPaidDebit",
			"blur  #charge5": "setBalanceAmount",
			"keyup #charge5": "setBalanceAmount",
			"blur  #charge4": "setBalanceAmount",
			"keyup #charge4": "setBalanceAmount"
			
		}
	});	
});
