define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/editPaymentRequired/editpaymentrequiredfilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			'bootstrapSwitch',
			'slickGridWrapper2',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js'
			],
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete,AutoCompleteWrapper,
					UrlParameter, BootstrapSwitch, slickGridWrapper2, NodValidation, FocusNavigation,BootstrapModal) {
			'use strict';
			var jsonObject = new Object()
			,waybillId = "0"
				, myNod
				, masterLangObj
				, masterLangKeySet
				, gridObject
				,PaymentRequiredConstant
				,  _this;

			return Marionette.LayoutView.extend({
				initialize : function() {
					waybillId = UrlParameter.getModuleNameFromParam(MASTERID)
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					jsonObject.waybillId = waybillId;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/editPaymentRequiredWS/getEditPaymentRequiredElement.do?',_this.setEditPaymentRequiredElement, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setEditPaymentRequiredElement : function(response) {

					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					var executive	= response.executive;

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/editPaymentRequired/EditPaymentRequired.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						var keyObject = Object.keys(response);
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]].show == true) {
								$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
							}
						}

						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

						PaymentRequiredConstant	= response.PaymentRequiredConstant;

						if(response.consignmentSummary.paymentRequired == true || response.consignmentSummary.paymentRequired == 'true') {
							$("#paymentRequiredEle").val(PaymentRequiredConstant.PAYMENT_REQUIRED_YES_ID);
							$('#actualPaymentRequired').val(PaymentRequiredConstant.PAYMENT_REQUIRED_YES_ID);
						} else {
							$("#paymentRequiredEle").val(PaymentRequiredConstant.PAYMENT_REQUIRED_NO_ID);
							$('#actualPaymentRequired').val(PaymentRequiredConstant.PAYMENT_REQUIRED_NO_ID);
						}

						hideLayer();

						myNod = nod();

						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#remarkEle',
							validate: 'presence',
							errorMessage: 'Enter Remark !'
						});

						$("#updateBtn").click(function() {
							if(Number($('#paymentRequiredEle').val()) == Number($('#actualPaymentRequired').val())) {
								showMessage('error', 'Change Payment Required !');
								return;
							}
							
							myNod.performCheck();
							if(myNod.areAll('valid')){
								if(confirm("Are you sure you want change the Payment Required ?")){
									_this.onUpdate(_this);								
								}
							}
						});
					});
				},onUpdate : function() {

					showLayer();

					jsonObject["paymentRequired"] 		= $('#paymentRequiredEle').val();
					jsonObject["remark"] 				= $('#remarkEle').val();
					jsonObject["waybillId"] 			= waybillId;

					getJSON(jsonObject, WEB_SERVICE_URL+'/editPaymentRequiredWS/updatePaymentRequiredDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				},setReportData : function(response) {
					console.log("response After update : " , response);
					redirectToAfterUpdate(response);
				}
			});
		});