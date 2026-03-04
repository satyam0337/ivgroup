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
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/blhpvedit/editblhpvfilepath.js'//FilePath
		,'jquerylingua'
		,'language'
		,'autocompleteWrapper'
        //constant for project name and domain urls
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,'focusnavigation'//import in require.config
        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
        ], function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language, ElementFocusNavigation){

	'use strict';// this basically give strictness to this specific js 
	var myNod, blhpvId = 0, lhpvId = 0, jsonObject	= new Object(),
	blhpvEditList, lhpvChargesList, BlhpvConfiguration, preExecutiveId,
	blhpvData, blhpvPreData, preBlhpvDataArray = new Array(),
	totalCharges = 0, BLhpvPrintFromNewFlow, isRefundAmountShow, totalRefund = 0,finalAmt = 0, totalReceivedAmount = 0,dieselWiseSplitAmtList = [],splitDieselArrList = null,totalDieselAmount = 0,balDieselAmount = 0,prevDieselAmount = 0,balPayableAmount = 0,
	_this = '';

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			blhpvId				= UrlParameter.getModuleNameFromParam('blhpvId');
			lhpvId				= UrlParameter.getModuleNameFromParam('lhpvId');
		}, render: function() {
			jsonObject.blhpvId 	= blhpvId;
			jsonObject.lhpvId 	= lhpvId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvWS/getBLHPVChargesForEditByBlhpvId.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(response) {
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/template/blhpvedit/blhpvedittemplate.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				loadLanguageWithParams(FilePath.loadLanguage());
				
				blhpvEditList				= response.blhpvEditList;
				lhpvChargesList		 		= response.lhpvChargesList;
				BlhpvConfiguration			= response.BlhpvConfiguration;
				isRefundAmountShow			= BlhpvConfiguration.isRefundAmountShow;
				totalReceivedAmount			= response.totalReceivedAmount;
				splitDieselArrList			= response.splitDieselArrList;
				
				if(BlhpvConfiguration.showSplitDieselWiseBlhpv) {
					_this.openPopupForDieselBlhpv(response);
				}else{
					$("#openSplitDiesel").remove();
				}
				
				
				$('#left-border-boxshadow').remove();
				$('#middle-border-boxshadow').remove();
				
				$("#updateBtn").bind("click", function() {
					_this.onSaveBlhpv();
				});
				
				_this.setBLHPVCharges();
				_this.setLHPVCharges();
				
				$('.datainput').keyup(function(event) {
					_this.setActualBalance();
				});
				
				$('.datainput').focus(function() {$(this).select();})

				$('#charge_' + ACTUAL_BALANCE).attr("disabled", "disabled");
				$('#charge_' + ACTUAL_REFUND).attr("disabled", "disabled");
				
				if(BlhpvConfiguration.calculateFuelTotal)
					$("#charge_" + TOTAL_FUEL).attr("readonly", true);
			});
			
			hideLayer();
		}, setBLHPVCharges : function() {
			var newDiv;
			var balanceDiv;
			
			for(var i = 0; i < blhpvEditList.length; i++) {
				blhpvPreData  =  new Object();
				
				if(blhpvEditList[i].chargeAmount > 0) {
					blhpvPreData.lhpvChargeMasterId = blhpvEditList[i].lhpvChargeMasterId;
					blhpvPreData.chargeAmount 		= blhpvEditList[i].chargeAmount;
				}
				
				if(blhpvEditList[i].lhpvChargeMasterId == DIESEL) {
					prevDieselAmount	= Math.round(blhpvEditList[i].chargeAmount);
				}	
				
				initialiseFocus();
				preBlhpvDataArray.push(blhpvPreData);
				
				newDiv = $('<div />');
				newDiv.attr("id", "data");
				newDiv.attr("class", "form-group row");
				
				if(isRefundAmountShow) {
					if(blhpvEditList[i].operationtype == OPERATION_TYPE_ADD) {
						newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;'>" + blhpvEditList[i].displayName + " ( + )</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_"+blhpvEditList[i].lhpvChargeMasterId+"' data-tooltip='"+blhpvEditList[i].displayName+"' value ='"+blhpvEditList[i].chargeAmount+"'/></div>");
					}
					
					if(blhpvEditList[i].operationtype == OPERATION_TYPE_SUBTRACT) {
						newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;'>" + blhpvEditList[i].displayName + " ( - )</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_"+blhpvEditList[i].lhpvChargeMasterId+"' data-tooltip='"+blhpvEditList[i].displayName+"' value ='"+blhpvEditList[i].chargeAmount+"'/></div>");
					}
					
					if(blhpvEditList[i].operationtype == OPERATION_TYPE_STATIC || blhpvEditList[i].operationtype == OPERATION_TYPE_NO_EFFECT_BALANCE) {
						newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;'>" + blhpvEditList[i].displayName + "</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_"+blhpvEditList[i].lhpvChargeMasterId+"' data-tooltip='"+blhpvEditList[i].displayName+"' value ='"+blhpvEditList[i].chargeAmount+"'/></div>");
					}
					
					$('#DataDiv').append(newDiv);
				} else {
					if(blhpvEditList[i].lhpvChargeMasterId != ACTUAL_REFUND) {
						if(blhpvEditList[i].operationtype == OPERATION_TYPE_ADD) {
							newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;'>"+blhpvEditList[i].displayName+" ( + )</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_"+blhpvEditList[i].lhpvChargeMasterId+"' data-tooltip='"+blhpvEditList[i].displayName+"' value ='"+blhpvEditList[i].chargeAmount+"'/></div>");
						}
						
						if(blhpvEditList[i].operationtype == OPERATION_TYPE_SUBTRACT) {
							newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;'>"+blhpvEditList[i].displayName+" ( - )</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_"+blhpvEditList[i].lhpvChargeMasterId+"' data-tooltip='"+blhpvEditList[i].displayName+"' value ='"+blhpvEditList[i].chargeAmount+"'/></div>");
						}
						
						if(blhpvEditList[i].operationtype == OPERATION_TYPE_STATIC || blhpvEditList[i].operationtype == OPERATION_TYPE_NO_EFFECT_BALANCE) {
							newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;'>"+blhpvEditList[i].displayName+"</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);'  id='charge_"+blhpvEditList[i].lhpvChargeMasterId+"' data-tooltip='"+blhpvEditList[i].displayName+"' value ='"+blhpvEditList[i].chargeAmount+"'/></div>");
						}
						
						$('#DataDiv').append(newDiv);
					} else {
						if(blhpvEditList[i].operationtype == OPERATION_TYPE_ADD) {
							newDiv.append("<label class='col-sm-2 control-label' style='width: 150px; display: none;'>" + blhpvEditList[i].displayName + " ( + )</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_" + blhpvEditList[i].lhpvChargeMasterId + "' data-tooltip='" + blhpvEditList[i].displayName + "' value ='" + blhpvEditList[i].chargeAmount + "'/></div>");
						}
						
						if(blhpvEditList[i].operationtype == OPERATION_TYPE_SUBTRACT) {
							newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;' display: none;>" + blhpvEditList[i].displayName + " ( - )</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_" + blhpvEditList[i].lhpvChargeMasterId + "' data-tooltip='" + blhpvEditList[i].displayName + "' value ='" + blhpvEditList[i].chargeAmount + "'/></div>");
						}
						
						if(blhpvEditList[i].operationtype == OPERATION_TYPE_STATIC || blhpvEditList[i].operationtype == OPERATION_TYPE_NO_EFFECT_BALANCE) {
							newDiv.append("<label class='col-sm-2 control-label' style='width: 150px;' display: none;>" + blhpvEditList[i].displayName + "</label><div class='col-sm-6 validation-message'><input class='datainput form-control text-right' onfocus='' onblur='clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event);' id='charge_" + blhpvEditList[i].lhpvChargeMasterId + "' data-tooltip='" + blhpvEditList[i].displayName + "' value ='" + blhpvEditList[i].chargeAmount + "'/></div>");
						}
						
						$('#DataDiv').append(newDiv);
					}
				}
			}
		}, setLHPVCharges : function() {
			var lhpvDiv;
			
			for(var i = 0; i < lhpvChargesList.length; i++) {
				lhpvDiv = $('<div />');
				lhpvDiv.attr("id", "lhpvdata");
				lhpvDiv.attr("class", "form-group row");
				
				if(lhpvChargesList[i].operationtype == OPERATION_TYPE_ADD) {
					lhpvDiv.append("<div><label style='width: 150px;'>" + lhpvChargesList[i].displayName + " (+)</label><label>" + lhpvChargesList[i].chargeAmount + "</label></div>");
				}
				if(lhpvChargesList[i].operationtype == OPERATION_TYPE_SUBTRACT) {
					lhpvDiv.append("<div><label style='width: 150px;'>" + lhpvChargesList[i].displayName + " (-)</label><label>" + lhpvChargesList[i].chargeAmount + "</label></div>");
				}
				if(lhpvChargesList[i].operationtype == OPERATION_TYPE_STATIC) {
					lhpvDiv.append("<div><label style='width: 150px;'>" + lhpvChargesList[i].displayName + "</label><label>" + lhpvChargesList[i].chargeAmount + "</label></div>");
				}
				$('#LhpvDataDiv').append(lhpvDiv);
				
				if(lhpvChargesList[i].lhpvChargeMasterId == BALANCE_AMOUNT) {
					totalCharges += lhpvChargesList[i].chargeAmount;
				}
				if(lhpvChargesList[i].lhpvChargeMasterId == REFUND_AMOUNT) {
					totalRefund += lhpvChargesList[i].chargeAmount;
				}	
			}
		}, onSaveBlhpv : function() {
			if(totalReceivedAmount > 0 && finalAmt <= totalReceivedAmount) {
				showMessage('error', iconForErrMsg + ' ' + ' Balance or Refund amount can not be less than already received amount !');
				return;
			}
			var currentDieselAmount  = Number($("#charge_" + DIESEL).val());
			
			if(BlhpvConfiguration.showSplitDieselWiseBlhpv){
				var totalDieselAmt = Number(totalDieselAmount);
				var dieselAmt = Number($("#charge_" + DIESEL).val());
				if(dieselAmt != 0 && currentDieselAmount != prevDieselAmount) {
					if(totalDieselAmt != dieselAmt){
						showMessage('error', 'Please Split Diesel Amount !');
						changeTextFieldColor('openSplitDiesel', '', '', 'red');
						return false;
					}
				}
			}
			
			$('#ActionButton').hide();
			var array	 = new Array();
			
			for(var i = 0; i < blhpvEditList.length ; i++) {
				blhpvData 		= new Object();
				var value		= $('#charge_' + blhpvEditList[i].lhpvChargeMasterId).val();
				var id			= blhpvEditList[i].lhpvChargeMasterId;
				var identifier  = blhpvEditList[i].identifier;

				blhpvData.lhpvChargeMasterId		    = id;
				blhpvData.chargeAmount					= value;
				blhpvData.Identifier					= identifier;

				if(blhpvEditList[i].executiveId > 0) {
					preExecutiveId			= blhpvEditList[i].executiveId;
				}
				
				array.push(blhpvData);
			}       

			var finalJsonObj 				= new Object();
			finalJsonObj.blhpvDataArray  	= JSON.stringify(array);
			finalJsonObj.blhpvPreDataArray  = JSON.stringify(preBlhpvDataArray);
			finalJsonObj.blhpvId 			= blhpvId;
			finalJsonObj.preExecutiveId 	= preExecutiveId;
			finalJsonObj.dieselWiseSplitAmtList = dieselWiseSplitAmtList.join(',');
			finalJsonObj.currentDieselAmount 	= currentDieselAmount;
			
			showLayer();
			
			if(confirm("Do You Want To Save BLHPV! ")) {
				showLayer();
				getJSON(finalJsonObj, WEB_SERVICE_URL+'/blhpvWS/saveBLHPVChargesAfterEdit.do', _this.afterSaveBlhpv, EXECUTE_WITHOUT_ERROR);
				$('#updateBtn').hide();
			} else {
				$('#updateBtn').show();
				hideLayer();
			}
		}, afterSaveBlhpv : function (response){
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			BLhpvPrintFromNewFlow	= response.BLhpvPrintFromNewFlow;
			
			setTimeout(() => {
				redirectToAfterUpdate(response);
				if(BLhpvPrintFromNewFlow == true) {
					var newwindow = window.open('BLHPVAjaxAction.do?pageId=48&eventId=11&blhpvId='+blhpvId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				} else {
					var newwindow = window.open('BLHPVAjaxAction.do?pageId=48&eventId=6&blhpvId='+blhpvId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			}, 1500);
			
			setTimeout(() => {
				window.close();
			}, 2000);
			
			hideLayer();
		}, setActualBalance : function() {
			var totalAmt 	 = 0;
			var newTotalAmt	 = 0;
			var diff		 = 0;
			var actualAmt    = 0;
			var finalAmount  = 0;
			actualAmt = totalCharges;
			
			if(BlhpvConfiguration.calculateFuelTotal){
				_this.calculateFuelTotal();
			}

			for(var i = 0 ; i < blhpvEditList.length; i++) {
				if(blhpvEditList[i].lhpvChargeMasterId != ACTUAL_BALANCE && blhpvEditList[i].lhpvChargeMasterId != ACTUAL_REFUND) {
					if(blhpvEditList[i].operationtype == OPERATION_TYPE_SUBTRACT) {
						newTotalAmt -= Number($('#charge_' + blhpvEditList[i].lhpvChargeMasterId).val());
						totalAmt 	-= blhpvEditList[i].chargeAmount;
					}
					
					if(blhpvEditList[i].operationtype == OPERATION_TYPE_ADD) {
						newTotalAmt += Number($('#charge_' + blhpvEditList[i].lhpvChargeMasterId).val());
						totalAmt 	+= blhpvEditList[i].chargeAmount;
					}
				}
			} 
			
			if(totalRefund > 0) {
				finalAmount = newTotalAmt - parseInt(totalRefund,10);
			} else {
				finalAmount = newTotalAmt + parseInt(totalCharges,10);
			}
			
			if(finalAmount >= 0) {
				$("#charge_" + ACTUAL_BALANCE).val(Math.abs(finalAmount));
				$("#charge_" + ACTUAL_REFUND).val(0);
			} else {
				$("#charge_" + ACTUAL_BALANCE).val(0);
				$("#charge_" + ACTUAL_REFUND).val(Math.abs(finalAmount));
			};
			
			finalAmt	= finalAmount;
			
			/*diff = totalAmt - newTotalAmt;
			
			if(totalAmt == newTotalAmt){
				document.getElementById("charge_"+ACTUAL_BALANCE).value = Math.abs(actualAmt);
			} else {
				document.getElementById("charge_"+ACTUAL_BALANCE).value = Math.abs(actualAmt+diff);
			}*/
		},calculateFuelTotal : function() {
			var fuelByDriver	= Number($("#charge_" + FUEL_BY_DRIVER).val());
			var fuelByOffice	= Number($("#charge_" + FUEL_BY_OFFICE).val());
			$("#charge_" + TOTAL_FUEL).val(fuelByDriver + fuelByOffice);
		}, resetTable : function() {
			$('#tableDieselElements tbody').empty();
			return false;
		}, openPopupForDieselBlhpv : function(response){
			
			$('#editlhpvDiesel').removeClass('hide');

			$("#splitDieselDataDetailPanel").load("/ivcargo/html/lhpv/splitDieselDataDetail.html", function(){

				var fuelPumpEleAutoComplete = new Object();
				fuelPumpEleAutoComplete.url = response.pumpNameMasterList;
				fuelPumpEleAutoComplete.primary_key = 'pumpNameMasterId';
				fuelPumpEleAutoComplete.field = 'name';
				$("#fuelPumpEle").autocompleteCustom(fuelPumpEleAutoComplete);

				$("#editlhpvDiesel").bind('click',function() {
					if($('#charge_' + DIESEL).val() <= 0) {
						showMessage('error', iconForErrMsg + ' Please Enter Diesel Amount');
						changeTextFieldColor('charge' + DIESEL, '', '', 'red');
						return;
					}
					$("#liter").keypress(function() {
						_this.calculateLiterAmount();
					});

					$("#dieselAmounts").keypress(function() {
						_this.calculateLiterAmount();
					});

					_this.openSplitDieselInBlhpv(); 
					_this.splitDieselWiseBlhpvTable();
				});

				//_this.disableChargesAmount(lhpvChargesList);
				showMessage('info', iconForInfoMsg + ' You cannot edit other charges if amount splited !');

				$('#dieselDeductPayment').bind('click', function() {
					_this.calculateLiterAmount();
					_this.splitDieselAmountInBlhpv(); 
				});

				$(".close").click(function(){
					_this.resetTable();
					$('#dieselBalanceAmt').val(0);
					changeTextFieldColor('dieselBalanceAmt', '', '', 'black');
				});

				$('#saveAllDieselpaymentData').bind('click', function() {
					if(Number($("#dieselBalanceAmt").val()) > 0) {
						showMessage('error', 'Please Split Full Diesel Amount !');
						changeTextFieldColor('dieselBalanceAmt', '', '', 'red');
						return false;
					}
					_this.onSaveBLHPVDieselDetails(); 
				});

			});
		},onSaveBLHPVDieselDetails : function() {
			//$('#balPayableAmount').val('');
			
			dieselWiseSplitAmtList	= [];
			totalDieselAmount		= 0;
			$("#tableDieselElements tbody tr").each(function () {
				var elementId		= $(this).attr('id');
				var fuelPumpId		= elementId.split('_')[1];
				
				totalDieselAmount += Number($("#dieselAmount_" + fuelPumpId).val());
				
				if($("#liter_" + fuelPumpId).exists()) {
					if(isNaN(Number($("#liter_" + fuelPumpId).val()))){
						$("#liter_" + fuelPumpId).val(0);
					}
				}
				if($("#perLiterRate_" + fuelPumpId).exists()) {
					if(isNaN(Number($("#perLiterRate_" + fuelPumpId).val()))){
						$("#perLiterRate_" + fuelPumpId).val(0);
					}
				}
				
				if($("#liter_" + fuelPumpId).exists() && $("#perLiterRate_" + fuelPumpId).exists() ) {
					dieselWiseSplitAmtList.push(Number(fuelPumpId) +  "_"  + Number($("#dieselAmount_" + fuelPumpId).val()) +"_"+ Number($("#liter_" + fuelPumpId).val()) + "_" + Number($("#perLiterRate_" + fuelPumpId).val()));
				} else {
					dieselWiseSplitAmtList.push(Number(fuelPumpId) +  "_"  + Number($("#dieselAmount_" + fuelPumpId).val()) +"_"+ Number(0) + "_" + Number(0));
				}
			})
            
            $("#splitDieselDataDetailPanel").modal('hide');
		}, openSplitDieselInBlhpv : function() {
			$("#splitDieselDataDetailPanel").modal({
				backdrop : 'static',
				keyboard : false
			});
			
			setTimeout(function() {
				var lhpvDieselTotalAmount = $('#charge_' + DIESEL).val();
				var balanceAmount	= lhpvDieselTotalAmount;
				if($('#charge_' + DIESEL).val() > 0)
					balanceAmount	= $('#charge_' + DIESEL).val();
				
				balDieselAmount	= balanceAmount - totalDieselAmount;
			
				$('#dieselTotalAmount').val(lhpvDieselTotalAmount);
				$('#dieselBalanceAmt').val(balDieselAmount);
			}, 500);
			if(BlhpvConfiguration.showLiterAmout){
				$("#literDiv").removeClass('hide');
				$("#literHeader").removeClass('hide');
			}else{
				$("#literDiv").addClass('hide');
				$("#literHeader").addClass('hide');
			}
			if(BlhpvConfiguration.showPerLiterRateAmount){
				$("#perLiterRateDiv").removeClass('hide');
				$("#perLiterRateHeader").removeClass('hide');
			}else{
				$("#perLiterRateDiv").addClass('hide');
				$("#perLiterRateHeader").addClass('hide');
			}
			
			dieselWiseSplitAmtList	= [];
		}, splitDieselWiseBlhpvTable : function() {
			$('#tableDieselElements tbody').empty();
			
			totalDieselAmount	= 0;
			
			var columnArray		= new Array();
			
			if(splitDieselArrList != null && splitDieselArrList.length > 0) { 
				for(var i = 0; i < splitDieselArrList.length; i++) {
					var dieselWiseLhpvAmount = splitDieselArrList[i];
					
					
					
					var pumpName 			= dieselWiseLhpvAmount.pumpName;
					var dieselAmount 		= dieselWiseLhpvAmount.dieselAmount;
					var liter		 		= dieselWiseLhpvAmount.liter;
					var perLiterRate 		= dieselWiseLhpvAmount.perLiterRate;
					var fuelPumpId			= dieselWiseLhpvAmount.fuelPumpId;
					totalDieselAmount		+= dieselWiseLhpvAmount.dieselAmount;
					
					var columnArray		= new Array();
					
					columnArray.push("<td style='text-align: center;'>" + pumpName + "</td>");
					columnArray.push("<td style='text-align: center;'><input class='form-control' id='dieselAmount_" + fuelPumpId + "' type='text' name='dieselAmount_" + fuelPumpId + "' value='"+dieselAmount+"' onkeypress='return allowOnlyNumeric(event);'/></td>");
					if(BlhpvConfiguration.showLiterAmout){
						columnArray.push("<td style='text-align: center;'><input class='form-control' id='liter_" + fuelPumpId + "' type='text' name='liter_" + fuelPumpId + "' value='"+liter+"' onkeypress='return allowOnlyNumeric(event);'/></td>");
					}
					if(BlhpvConfiguration.showPerLiterRateAmount){
						columnArray.push("<td style='text-align: center;'><input class='form-control' id='perLiterRate_" + fuelPumpId + "' type='text' name='perLiterRate_" + fuelPumpId + "' value='"+perLiterRate+"' onkeypress='return allowOnlyNumeric(event);'/></td>");
					}
					columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'Remove' id='removeRowElement_" + fuelPumpId + "'>Remove</button></td>");
					$('#tableDieselElements tbody').append("<tr id='row_" + fuelPumpId + "'>" + columnArray.join(' ') + "</tr>");
					
					$("#removeRowElement_" + fuelPumpId).bind("click", function() {
						var elementId			= $(this).attr('id');
						_this.showMultipleAddInDieselDetails();
						_this.deleteDieselWiseLhpvColumn(elementId.split('_')[1]);
					});

					$("#dieselAmount_" + fuelPumpId).bind("keyup", function() {
						 _this.recheckDieselAmount(this);
					});

					columnArray	= [];
				}
			}
		}, deleteDieselWiseLhpvColumn : function(fuelPumpId) {
			if(confirm("Are you sure to delete?")) {
				balPayableAmount	= balPayableAmount + Number($("#dieselAmount_" + fuelPumpId).val());
				$('#dieselBalanceAmt').val(Number($("#dieselBalanceAmt").val()) + Number($("#dieselAmount_" + fuelPumpId).val()));
				$("#row_" + fuelPumpId).remove();
			}
			
			$("#fuelPumpEle").val('');
			$("#dieselAmounts").val('');
			$("#liter").val('');
			$("#perLiterRate").val('');
		}, recheckDieselAmount : function(obj) {
			var totalDieselAmount	= 0;
			var dieselBalanceAmt	= 0;
			
			$("#tableDieselElements tbody tr").each(function () {
				var elementId		= $(this).attr('id');
				var fuelPumpId		= elementId.split('_')[1];
				
				totalDieselAmount += Number($("#dieselAmount_" + fuelPumpId).val());
            })
            
            dieselBalanceAmt	= $('#dieselTotalAmount').val() - totalDieselAmount;
            
            if(dieselBalanceAmt < 0) {
				showMessage('info', 'Amount can not be greater than ' + $('#dieselBalanceAmt').val());
				$('#dieselBalanceAmt').val(dieselBalanceAmt);
				//obj.value = 0;
				return false;
            }
            
            $('#dieselBalanceAmt').val(dieselBalanceAmt);
		}, splitDieselAmountInBlhpv : function() {
			var fuelPumpId = $('#fuelPumpEle_primary_key').val();
			
			if($("#row_" + fuelPumpId).exists()) {
				showMessage('error','Please enter a new Pump Name');
				return false;
			}
			
			var dieselAmount	= $("#dieselAmounts").val();
			var liter			= $("#liter").val();
			var perLiterRate	= $("#perLiterRate").val();
			
			if(dieselAmount == '' || dieselAmount == 0) {
				showMessage('error',iconForErrMsg + ' Please Enter Diesel Amount');
				changeTextFieldColor('', '', '', 'red');
				return false;
			}

			if($('#dieselBalanceAmt').val() == 0) {
				showMessage('info','Balance Amount is Zero');
				return false;
			}
			
			if(Number($('#dieselAmounts').val()) > Number($('#dieselBalanceAmt').val())) {
				showMessage('info', 'Amount can not be greater than ' + $('#dieselBalanceAmt').val());
				return false;
			}
			_this.showMultipleAddInDieselDetails();
			_this.addNewDieselAmount(fuelPumpId, dieselAmount,liter,perLiterRate);

			$("#fuelPumpEle").val('');
			$("#dieselAmounts").val('');
			$("#liter").val('');
			$("#perLiterRate").val('');

		}, addNewDieselAmount : function(fuelPumpId, dieselAmount,liter,perLiterRate) {
			var PumpName = $('#fuelPumpEle').val();
			
			var columnArray		= new Array();
			
			columnArray.push("<td style='text-align: center; text-transform: uppercase' >" + PumpName + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><input  class='form-control' id='dieselAmount_" + fuelPumpId + "' type='text' name='dieselAmount_" + fuelPumpId + "' value='" + dieselAmount + "' onkeypress='return allowOnlyNumeric(event);' disabled/></td>");
			if(BlhpvConfiguration.showLiterAmout){
				columnArray.push("<td style='text-align: center;'><input class='form-control' id='liter_" + fuelPumpId + "' type='text' name='liter_" + fuelPumpId + "' value='"+liter+"' onkeypress='return allowOnlyNumeric(event);' disabled/></td>");
			}
			if(BlhpvConfiguration.showPerLiterRateAmount){
				columnArray.push("<td style='text-align: center;'><input class='form-control' id='perLiterRate_" + fuelPumpId + "' type='text' name='perLiterRate_" + fuelPumpId + "' value='"+perLiterRate+"' onkeypress='return allowOnlyNumeric(event);' disabled/></td>");
			}
			
			columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'Remove' id='removeRowElement_" + fuelPumpId + "'>Remove</button></td>");
			
			$('#tableDieselElements tbody').append('<tr id="row_'+ fuelPumpId +'">' + columnArray.join(' ') + '</tr>');
			
			balDieselAmount	= balDieselAmount - Number($("#dieselAmount_" + fuelPumpId).val());
			
			$('#dieselBalanceAmt').val(Number($('#dieselBalanceAmt').val()) - Number(dieselAmount));
			
			$("#removeRowElement_" + fuelPumpId).bind('click',function() {
				var elementId			= $(this).attr('id');
				_this.showMultipleAddInDieselDetails();
				_this.deleteDieselWiseLhpvColumn(elementId.split('_')[1]);
			});
			
			$("#dieselAmount_" + fuelPumpId).bind("keyup", function() {
			    _this.recheckDieselAmount(this);
			});
			
			columnArray	= [];
		}, disableChargesAmount : function(lhpvChargesList) {
			/*if(lhpvChargesList) {
				for(var i = 0; i < lhpvChargesList.length; i++) {
					if(lhpvChargesList[i]  == DIESEL){}
					else 
						$('#charge_' + lhpvChargesList[i]).attr('readonly', true);
				}
			}*/
		}, calculateLiterAmount : function(){
			setTimeout(() => {
				liter 		  = Number($('#liter').val());
				dieselAmounts = Number($('#dieselAmounts').val());
				if(liter != '' && liter != 0 && dieselAmounts != '' && dieselAmounts != ''){
					$("#perLiterRate").val((dieselAmounts/liter).toFixed(2));
				}else{
					$("#perLiterRate").val('');
				}
			}, 100);
		}, showMultipleAddInDieselDetails : function(){
			
			if(!BlhpvConfiguration.showMultipleAddInDieselDetails){
				var rowCount = $('#tableDieselElements tr').length;
				if(rowCount == 2){
					$("#dieselDeductPayment").attr("disabled", true);
				}else{
					$("#dieselDeductPayment").attr("disabled", false);
				}
			}
		}
	});
});

function allowOnlyNumeric(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum 	= null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		if(keynum != null) {
			if(keynum == 13 || keynum == 8 || keynum == 45 || keynum == 47) {
				hideAllMessages();
				return true;
			} else if (keynum < 48 || keynum > 57) {
				showMessage('warning', ' Only A-Z and 0-9 allowed, No other Character Allowed !');
				return false;
			}
		}
		return true;
	}
}