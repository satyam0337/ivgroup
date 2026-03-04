define([
        'marionette'
		,'/ivcargo/resources/js/generic/urlparameter.js'
        ,'constant'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
        ], function(Marionette,UrlParameter,Constant,errorshow,JsonUtility,MessageUtility, BootstrapModal) {
	'use strict'; 
	var LangKeySet,myNod, blhpvId, bLHPVBranchId, blhpvCreditAmountTxnList, totalPayment = 0, _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			blhpvId 					= UrlParameter.getModuleNameFromParam('blhpvId');
			bLHPVBranchId				= UrlParameter.getModuleNameFromParam('bLHPVBranchId');
		}, render : function() {
			var object		= new Object();
			
			object.blhpvId				= blhpvId;
			object.blhpvBranchId		= bLHPVBranchId;
			
			getJSON(object, WEB_SERVICE_URL + '/blhpvCreditPaymentWS/getDetailsToCancelBlhpvCreditPayment.do?',	_this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements: function(response) {
			if(response.message != undefined) {
				var errorMessage	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				setTimeout(function() {
					if (window.opener != null && !window.opener.closed) {
		                window.opener.location.reload();
		            }
				}, 1000);
				setTimeout(() => {
					window.close();
				}, 1200);
				
				hideLayer();
				return;
			}
			
			var jsonObject 		= new Object();
			
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/creditpayment/cancelBLHPVCreditPayment.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				_this.setBlhpvDataForCancelPayment(response);
				
				$("#cancelPayment").bind("click", function() {
					_this.cancelPayment();
				});
				
				hideLayer();
			});
		}, setBlhpvDataForCancelPayment : function(response) {
			$('#reportTable tbody').empty();
			$('#reportTable tfoot').empty();
			
			blhpvCreditAmountTxnList	= response.BLHPVCreditAmountTxn;
			var totalSettleAmount		= response.totalSettleAmount;
			totalPayment				= blhpvCreditAmountTxnList.length;
			
			var columnArray				= new Array();
			
			for(var i = 0; i < totalPayment; i++) {
				var blhpv		= blhpvCreditAmountTxnList[i];
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='bLHPVCreditAmountTxnId' id='bLHPVCreditAmountTxnId_" + i + "' value='"+ blhpv.bLHPVCreditAmountTxnId +"'/><input type='hidden' name='branchWiseLhpvAmountId' id='branchWiseLhpvAmountId_" + blhpv.bLHPVCreditAmountTxnId + "' value='"+ blhpv.branchWiseLhpvAmountId +"'/></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.bLHPVNumber + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.creationDate + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.totalAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.settledAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.receivedByBranch + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.paymentTypeName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.chequeNumber + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpv.bankName + "</td>");
				
				$('#reportTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
			}
			
			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Total</b></td>");		
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + totalSettleAmount + "</b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");					
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			$('#reportTable tfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
		}, cancelPayment : function() {
			var checkBoxArray	= new Array();
			var branchWiseLhpvAmountArray = new Array();
			
			$.each($("input[name=bLHPVCreditAmountTxnId]:checked"), function() { 
				var bLHPVCreditAmountTxnId	= $(this).val();
				checkBoxArray.push(bLHPVCreditAmountTxnId);
				
				if($("#branchWiseLhpvAmountId_" + bLHPVCreditAmountTxnId).val() > 0)
					branchWiseLhpvAmountArray.push(bLHPVCreditAmountTxnId + "_" + $("#branchWiseLhpvAmountId_" + bLHPVCreditAmountTxnId).val());
			});
			
			if(checkBoxArray.length == 0) {
				alert('Please select atleast one ');
				return;
			}
			
			$("#cancelPayment").addClass('hide');

			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Do you Want to cancel Payment ?",
				modalWidth 	: 	30,
				title		:	'Cancel Payment',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				var jsonObject		= new Object();
				jsonObject["blhpvCreditAmountTxnIds"]	= checkBoxArray.join(',');
				jsonObject["branchWiseLhpvAmountIds"]	= branchWiseLhpvAmountArray.join(',');
				jsonObject["totalPayment"] 				= totalPayment;
				jsonObject["blhpvId"] 					= blhpvId;
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/blhpvCreditPaymentWS/cancelBlhpvCreditPayment.do', _this.getResponseData, EXECUTE_WITH_ERROR);
				showLayer();
			});

			btModalConfirm.on('cancel', function() {
				$("#cancelPayment").removeClass('hide');
				hideLayer();
			});
		}, getResponseData : function(response) {
			if(response.message != undefined) {
				var errorMessage	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function() {
					if (window.opener != null && !window.opener.closed) {
		                window.opener.location.reload();
		            }
				}, 1000);
				setTimeout(() => {
					window.close();
				}, 1200);
				hideLayer();
				return;
			}
			
			hideLayer();
		}
	});
});