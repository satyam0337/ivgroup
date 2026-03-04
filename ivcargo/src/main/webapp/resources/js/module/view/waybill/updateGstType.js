let doneTheStuff = false;
var wayBillTaxTxnHM = null;
define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'
	, '/ivcargo/resources/js/module/redirectAfterUpdate.js'
	, '/ivcargo/resources/js/ajax/autocompleteutils.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],	function(Marionette, UrlParameter) {
		'use strict';// this basically give strictness to this specific js
		let btModalConfirm, wayBillId, myNod, _this = '';
		return Marionette.LayoutView.extend({
			initialize: function() {
				_this = this;
				
				wayBillId	= UrlParameter.getModuleNameFromParam(MASTERID);
				
				let jsonObject = new Object();
				jsonObject.waybillId	= wayBillId;
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateGstTypeWS/loadGstType.do', _this.renderUpdateGstType, EXECUTE_WITHOUT_ERROR);
			}, renderUpdateGstType: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				
				wayBillTaxTxnHM = response.wayBillTaxTxnHM;
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/waybill/update/updateGstType.html", function() {
					baseHtml.resolve();
				});
				
				$.when.apply($, loadelement).done(function() {
					_this.setGstType(response.gstTypeList);

					myNod = nod();
					myNod.configure({
						parentClass: 'validation-message'
					});

					myNod.add({
						selector: '#gstTypeEle',
						validate: 'validateAutocomplete:#gstTypeEle_primary_key',
						errorMessage: 'Select proper Gst Type !'
					});

					$("#updateGstTypeBtn").bind("click", function() {
						myNod.performCheck();
						
						if (myNod.areAll('valid')) {
							if(wayBillTaxTxnHM != null && wayBillTaxTxnHM != undefined && wayBillTaxTxnHM[Number($('#gstTypeEle_primary_key').val())] != null) {
								showMessage('error', "Can Not Update Same Gst type!");
								return;
							}
							
							_this.updateGstType();
						}
					});

					hideLayer();
				});
			}, setGstType: function(gstTypeList) {
				_this.setGstTypeAutocompleteInstance();

				let autoPaymentType = $("#gstTypeEle").getInstance();

				$(autoPaymentType).each(function() {
					this.option.source = gstTypeList;
				})
			}, setGstTypeAutocompleteInstance : function() {
				let autoGstTypeName = new Object();
				autoGstTypeName.primary_key 	= 'gstTypeId';
				autoGstTypeName.field 				= 'gstTypeName';

				$("#gstTypeEle").autocompleteCustom(autoGstTypeName)
			}, updateGstType: function() {
				let jsonObject = new Object();
				
				jsonObject["waybillId"] 		= wayBillId;
				jsonObject["gstTypeId"] 	= $('#gstTypeEle_primary_key').val();
				
				if (!doneTheStuff) {
					doneTheStuff = true;
					$('#updateGstTypeBtn').hide();

					btModalConfirm = new Backbone.BootstrapModal({
						content		: "Do You Want To Update Gst Type?",
						modalWidth	: 30,
						title		: 'Update Gst Type',
						okText		: 'YES',
						showFooter	: true,
						okCloses	: false
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						$('#updateGstTypeBtn').hide();
						getJSON(jsonObject, WEB_SERVICE_URL + '/updateGstTypeWS/updateGstType.do', _this.onUpdate, EXECUTE_WITHOUT_ERROR);
					});

					btModalConfirm.on('cancel', function() {
						doneTheStuff = false;
						$('#updateGstTypeBtn').show();
					});
				}
			}, onUpdate: function(response) {
				redirectToAfterUpdate(response);
			}
		});
	});