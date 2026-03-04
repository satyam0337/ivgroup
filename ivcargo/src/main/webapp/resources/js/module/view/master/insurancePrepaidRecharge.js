define(
		[
			'JsonUtility',
			'messageUtility',
			'/ivcargo/resources/js/generic/urlparameter.js',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			],function() {
			'use strict';
			var jsonObject = new Object(), _this = null;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				},	render : function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/insurancePrepaidAmountRechargeWS/loadInsuranceDetails.do?', _this.loadEelements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, loadEelements : function(response) {
					hideLayer();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					
					loadelement.push(baseHtml);
					
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/master/insurancePrepaidRecharge.html", function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let insurancePrepaidAmount	= response.insurancePrepaidAmount;
						
						if(insurancePrepaidAmount != null)
							$('#previousRechargeAmount').html('<b>Recharged Amount : </b>' + insurancePrepaidAmount.prepaidAmount);
						
						$("#saveBtn").click(function() {
							_this.onSave();	
						});
					});
					
					return _this;
				}, onSave : function() {
					let amount	= $('#rechargeAmount').val();
					
					if(amount <= 0) {
						showAlertMessage('error','Please Enter Amount');
						$('#rechargeAmount').focus();
						return;
					}
					
					if(!confirm('Are you sure you want to save ?'))
						return;
						
					jsonObject.Amount	= amount;
					
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/insurancePrepaidAmountRechargeWS/insertInsuranceAmountDetails.do?', _this.setSuccess, EXECUTE_WITHOUT_ERROR);
				}, setSuccess :function(response) {
					$('#previousRechargeAmount').html('<b>Recharged Amount : </b>' + response.Amount);
					$('#rechargeAmount').val('');
					hideLayer();
				}
			});
		});

