define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/masters/view/categoryTypeMaster/categoryDetails.js',
			PROJECT_IVUIRESOURCES + '/resources/js/masters/view/categoryTypeMaster/categoryLogsDetails.js',
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'nodvalidation',
			'validation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			], function(CategoryDetails, CategoryLogsDetails) {
			'use strict';
			let jsonObject = new Object(), myNod, myNodUpdate, myNodDelete, _this = '', isAllowToSave = true, isAllowToUpdate = false, isAllowToDelete = false;
		return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL+ '/categoryTypeMasterWS/getCategoryTypeMasterTabs.do?',_this.renderCategoryTypeMasterTabs, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCategoryTypeMasterTabs : function(response) {
					hideLayer();
					
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					
					loadelement.push(baseHtml);
					
					//changed
					$("#mainContent").load("/ivcargo/html/master/categoryTypeMaster/categoryTypeMaster.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						let categoryTypeMasterNameAutoComplete = new Object();
						categoryTypeMasterNameAutoComplete.primary_key 	= 'categoryTypeId';
						categoryTypeMasterNameAutoComplete.field 		= 'name';
						categoryTypeMasterNameAutoComplete.url 			= WEB_SERVICE_URL + '/categoryTypeMasterWS/searchCategoryByName.do?';
						categoryTypeMasterNameAutoComplete.callBack 	= _this.getCategoriesToUpdate;
						$("#categoryTypeEle").autocompleteCustom(categoryTypeMasterNameAutoComplete);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						addElementToCheckEmptyInNode(myNod, 'categoryNameEle', 'Enter Category');
						
						myNodUpdate = nod();
						myNodUpdate.configure({
							parentClass:'validation-message'
						});
						
						addAutocompleteElementInNode(myNodUpdate, 'categoryTypeEle', 'Select proper Category');
						
						myNodDelete = nod();
						myNodDelete.configure({
							parentClass:'validation-message'
						});
						
						addAutocompleteElementInNode(myNodDelete, 'categoryTypeEle', 'Select proper Category');
						
						if(response.viewAll)
							$('#viewAll').removeClass('hide');
						else
							$('#viewAll').remove();
							
						if(response.viewAllEdits)
							$('#viewEdits').removeClass('hide');
						else
							$('#viewEdits').remove();
							
						_this.bindEvent();	
					});
				}, bindEvent : function() {
					$("#saveBtn").click(function() {
						if(isAllowToSave) {
							myNod.performCheck();
						
							if(myNod.areAll('valid'))
								_this.save();
						}
					});

					$("#updateBtn").click(function() {
						if(isAllowToUpdate) {
							myNodUpdate.performCheck();
					
							if(myNodUpdate.areAll('valid'))
								_this.update();
						}
					});

					$("#deleteBtn").click(function() {
						if(isAllowToDelete) {
							myNodDelete.performCheck();
						
							if(myNodDelete.areAll('valid'))
								_this.delete();
						}
					});
					
					$("#resetBtn").click(function() {
						_this.resetFeilds();
					});
					
					$("#categoryTypeEle").keyup(function(e) {
						if(getKeyCode(e) == 8 || getKeyCode(e) == 46)
							_this.resetFeilds();
					});
					
					$("#viewAll").click(function() {
						_this.viewAllCategory();
					});
					
					$("#viewEdits").click(function() {
						_this.viewAllCategoryEditLogs();
					});
				}, getCategoriesToUpdate : function() {
					let jsonObject = new Object();
					
					jsonObject.categoryTypeId	= $("#categoryTypeEle_primary_key").val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/getCategoryById.do?',_this.setCategoryDetails, EXECUTE_WITH_ERROR);
				}, setCategoryDetails : function(response) {
					let categoryTypeMaster	= response.categoryTypeMaster;
					
					if(categoryTypeMaster != undefined) {
						$('#categoryNameEle').val(categoryTypeMaster.name);
						$('#descriptionEle').val(categoryTypeMaster.description);
						$("#updateBtn").removeClass("disabled");
						$("#saveBtn").addClass("disabled");
						$("#deleteBtn").removeClass("disabled");
						isAllowToUpdate	= true;
						isAllowToDelete	= true;
						isAllowToSave	= false;
					}
				}, save : function() {
					showLayer();
					let jsonObject = new Object();
					jsonObject.name				= $("#categoryNameEle").val();
					jsonObject.description		= $("#descriptionEle").val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/addNewCategory.do?',_this.afterSaveOrUpdate, EXECUTE_WITH_ERROR);
				}, afterSaveOrUpdate : function(response) {
					if(response.message != undefined) {
						hideLayer();
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
					
					_this.resetFeilds();
					hideLayer();
				}, update : function() {
					let btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update ?",
						modalWidth 	: 	30,
						title		:	'Update Category',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
						
					btModalConfirm.on('ok', function() {
						showLayer();
						let jsonObject = new Object();
						jsonObject.name				= $("#categoryNameEle").val();
						jsonObject.description		= $("#descriptionEle").val();
						jsonObject.categoryTypeId	= $("#categoryTypeEle_primary_key").val();
						
						getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/updateCategoryById.do?', _this.afterSaveOrUpdate, EXECUTE_WITH_ERROR);
					});
				}, resetFeilds : function() {
					$('#categoryTypeEle').val("");
					$('#categoryNameEle').val("");
					$('#descriptionEle').val("");
					$("#saveBtn").removeClass("disabled");
					$("#updateBtn").addClass("disabled");
					$("#deleteBtn").addClass("disabled");
					isAllowToUpdate	= false;
					isAllowToDelete	= false;
					isAllowToSave	= true;
				}, delete : function() {
					if($("#categoryTypeEle_primary_key").val() <= 0) {
						showMessage('error', 'Select Category');
						return;
					}
					
					let btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Delete ?",
						modalWidth 	: 	30,
						title		:	'Delete Category',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
						
					btModalConfirm.on('ok', function() {
						let jsonObject = new Object();
						jsonObject.categoryTypeId	= $("#categoryTypeEle_primary_key").val();

						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/categoryTypeMasterWS/deleteCategoryById.do?',_this.afterSaveOrUpdate, EXECUTE_WITH_ERROR);
					});
				}, viewAllCategory : function() {
					var object 		= new Object();
			
					var btModal = new Backbone.BootstrapModal({
						content		: new CategoryDetails(object),
						modalWidth 	: 70,
						modalHeight : 160,
						title		: 'Category Details',
						showFooter 	: true,
						cancelText	: false,
						okText		: 'Close'
					}).open();
					object.btModal = btModal;
					new CategoryDetails(object)
					btModal.open();
				}, viewAllCategoryEditLogs : function() {
					var object 		= new Object();
					
					object.categoryTypeId = $("#categoryTypeEle_primary_key").val();
			
					var btModal = new Backbone.BootstrapModal({
						content		: new CategoryLogsDetails(object),
						modalWidth 	: 70,
						modalHeight : 160,
						title		: 'Category Logs Details',
						showFooter 	: true,
						cancelText	: false,
						okText		: 'Close'
					}).open();
					object.btModal = btModal;
					new CategoryLogsDetails(object)
					btModal.open();
				}
			});
		});