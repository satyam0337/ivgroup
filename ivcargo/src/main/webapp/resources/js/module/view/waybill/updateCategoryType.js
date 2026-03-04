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
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateCategoryTypeWS/loadCategoryType.do', _this.renderCategoryType, EXECUTE_WITHOUT_ERROR);
			}, renderCategoryType: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/module/waybill/update/updateCategoryType.html", function() {
					baseHtml.resolve();
				});
				
				$.when.apply($, loadelement).done(function() {
					_this.setCategoryTypeId(response.categoryTypeList);
					
					myNod = nod();
					myNod.configure({
						parentClass: 'validation-message'
					});

					addAutocompleteElementInNode(myNod, 'categoryTypeEle', 'Select proper Category Type !');

					$("#updateCategoryTypeBtn").bind("click", function() {
						myNod.performCheck();
						
						if (myNod.areAll('valid')) {
							if(response.categoryTypeId == $('#categoryTypeEle_primary_key').val()) {
								showMessage('error', 'Can not update same Category Type !');
								return;
							}	
							
							_this.updateCategoryType();
						}
					});

					hideLayer();
				});
			}, setCategoryTypeId: function(categoryTypeList) {
				_this.setCategorySelectionTypeAutocompleteInstance();

				let autoCategoryType = $("#categoryTypeEle").getInstance();

				$(autoCategoryType).each(function() {
					this.option.source = categoryTypeList;
				})
			}, setCategorySelectionTypeAutocompleteInstance : function() {
				let autoCategorySelectionTypeName = new Object();
				autoCategorySelectionTypeName.primary_key 	= 'categoryTypeId';
				autoCategorySelectionTypeName.field 		= 'name';

				$("#categoryTypeEle").autocompleteCustom(autoCategorySelectionTypeName)
			}, updateCategoryType: function() {
				let jsonObject = new Object();
				
				jsonObject["waybillId"] 		= wayBillId;
				jsonObject["categoryTypeId"] 	= $('#categoryTypeEle_primary_key').val();
				jsonObject.remark 				= $('#remarkEle').val();
				
				if (!doneTheStuff) {
					doneTheStuff = true;
					$('#updateCategoryTypeBtn').hide();

					btModalConfirm = new Backbone.BootstrapModal({
						content		: "Do You Want To Update Categoty Type?",
						modalWidth	: 30,
						title		: 'Update Categoty Type',
						okText		: 'YES',
						showFooter	: true,
						okCloses	: false
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						$('#updateCategoryTypeBtn').hide();
						getJSON(jsonObject, WEB_SERVICE_URL + '/updateCategoryTypeWS/updateCategoryType.do', _this.onUpdate, EXECUTE_WITHOUT_ERROR);
					});

					btModalConfirm.on('cancel', function() {
						doneTheStuff = false;
						$('#updateCategoryTypeBtn').show();
					});
				}
			}, onUpdate: function(response) {
				redirectToAfterUpdate(response);
			}
		});
	});