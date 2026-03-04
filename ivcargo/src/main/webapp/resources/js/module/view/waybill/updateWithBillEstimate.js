let doneTheStuff = false;
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
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateWithBillEstimateWS/loadWithBillEstimate.do', _this.renderUpdateWithBillEstimate, EXECUTE_WITHOUT_ERROR);
			}, renderUpdateWithBillEstimate: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/waybill/update/updateWithBillEstimate.html", function() {
					baseHtml.resolve();
				});
				
				$.when.apply($, loadelement).done(function() {
					_this.setBillSelectionType(response.billSelectionList);

					myNod = nod();
					myNod.configure({
						parentClass: 'validation-message'
					});

					myNod.add({
						selector: '#billTypeEle',
						validate: 'validateAutocomplete:#billTypeEle_primary_key',
						errorMessage: 'Select proper Bill Type !'
					});

					$("#updateBillTypeBtn").bind("click", function() {
						myNod.performCheck();
						
						if (myNod.areAll('valid')) {
							if(response.billSelectionId == $('#billTypeEle_primary_key').val())
								return;
							
							_this.updateBillType();
						}
					});

					hideLayer();
				});
			}, setBillSelectionType: function(billSelectionList) {
				_this.setBillSelectionTypeAutocompleteInstance();

				let autoPaymentType = $("#billTypeEle").getInstance();

				$(autoPaymentType).each(function() {
					this.option.source = billSelectionList;
				})
			}, setBillSelectionTypeAutocompleteInstance : function() {
				let autoBillSelectionTypeName = new Object();
				autoBillSelectionTypeName.primary_key 	= 'billSelectionId';
				autoBillSelectionTypeName.field 		= 'billSelectionName';

				$("#billTypeEle").autocompleteCustom(autoBillSelectionTypeName)
			}, updateBillType: function() {
				let jsonObject = new Object();
				
				jsonObject["waybillId"] 		= wayBillId;
				jsonObject["billSelectionId"] 	= $('#billTypeEle_primary_key').val();

				if (!doneTheStuff) {
					doneTheStuff = true;
					$('#updateBillTypeBtn').hide();

					btModalConfirm = new Backbone.BootstrapModal({
						content		: "Do You Want To Update Bill Type?",
						modalWidth	: 30,
						title		: 'Update With Bill-Estimate',
						okText		: 'YES',
						showFooter	: true,
						okCloses	: false
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						$('#updateBillTypeBtn').hide();
						getJSON(jsonObject, WEB_SERVICE_URL + '/updateWithBillEstimateWS/updateWithBillEstimate.do', _this.onUpdate, EXECUTE_WITHOUT_ERROR);
					});

					btModalConfirm.on('cancel', function() {
						doneTheStuff = false;
						$('#updateBillTypeBtn').show();
					});
				}
			}, onUpdate: function(response) {
				redirectToAfterUpdate(response);
			}
		});
	});