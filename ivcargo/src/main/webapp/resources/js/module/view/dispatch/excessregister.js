/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/dispatch/dispatchfilepath.js',
			'selectizewrapper',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
			],//PopulateAutocomplete
			function(FilePath, Selectizewrapper) {
			'use strict';// this basically give strictness to this specific js
			var _this = '', btModal,
			jsonObject, LoadingSheetExcessEntryDetails;
			return Marionette.LayoutView.extend({
				initialize: function(jsonObjectData){

					//initialize is the first function called on call new view()
					//append template first 
					//the html would be set in the el element
					//this object is not found in other function so _this has been created
					_this 				= this;
					jsonObject 			= jsonObjectData.elementValue;
					btModal				= jsonObjectData.btModal;
				},render: function(){
					_this.addExcessRegister();
				},addExcessRegister : function() {

					var loadelement = new Array();
					var baseHtml = new $.Deferred();
					loadelement.push(baseHtml);

					setTimeout(function(){
						$("#modalBody").load("/ivcargo/html/module/dispatch/ExcessRegister.html",function() {
							baseHtml.resolve();
						});
					},200);

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();

						loadLanguageWithParams(FilePath.loadLanguage());

						$("#lrNumberEle").keyup(function(e) {
							_this.searchLRByNumber(e);
						});

						hideLayer();
					});

				},searchLRByNumber  : function(e) {
					if(e.which == $.ui.keyCode.ENTER||e.keyCode == $.ui.keyCode.ENTER){
						var object = new Object();
						object.wayBillNumber 		= $('#lrNumberEle').val();
						getJSON(object, WEB_SERVICE_URL+'/dispatchWs/getLRDetailsForExcessLoadForShortLR.do?', _this.setExcessEntryDetails, EXECUTE_WITH_ERROR);
					}
				},setExcessEntryDetails	: function(response) {
					if(response.message != undefined){
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						return;
					}
					
					LoadingSheetExcessEntryDetails	= response.LoadingSheetExcessEntryDetails;

					$("#wayBillId").val(LoadingSheetExcessEntryDetails.wayBillId);
					
					$("#srcBranchEle").val(LoadingSheetExcessEntryDetails.sourceBranchName);
					$("#srcBranchId").val(LoadingSheetExcessEntryDetails.sourceBranchId);

					$("#destBranchEle").val(LoadingSheetExcessEntryDetails.destinationBranchName);
					$("#destBranchId").val(LoadingSheetExcessEntryDetails.destinationBranchId);
					
					$("#quantityEle").val(LoadingSheetExcessEntryDetails.totalQuantity);
					$("#weightEle").val(LoadingSheetExcessEntryDetails.totalWeight);
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	LoadingSheetExcessEntryDetails.packingTypeMasters,
						valueField		:	'packingTypeMasterId',
						labelField		:	'packingTypeMasterName',
						searchField		:	'packingTypeMasterName',
						elementId		:	'packingTypeSelectEle',
						create			: 	false,
						maxItems		: 	1
					});

					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});

					myNod.add({
						selector: '#remarkEle',
						validate: 'presence',
						errorMessage: 'Enter Remark !'
					});

					myNod.add({
						selector: '#packingTypeSelectEle',
						validate: 'presence',
						errorMessage: 'Select Proper Packing Type !'
					});

					$("#addExcess").click(function() {
						myNod.performCheck();
						if(myNod.areAll('valid')) {
							_this.addExcessEntryDetails();
						}
					});

				}, addExcessEntryDetails : function() {
					showLayer();
					var jsonObject = new Object();
					
					jsonObject.wayBillId				= $('#wayBillId').val();
					jsonObject.wayBillNumber			= $('#lrNumberEle').val();
					jsonObject.srcBranchName			= $('#srcBranchEle').val();
					jsonObject.sourceBranchId			= $('#srcBranchId').val();
					jsonObject.destBranchName			= $('#destBranchEle').val();
					jsonObject.destinationBranchId		= $('#destBranchId').val();
					jsonObject.quantity					= $('#quantityEle').val();
					jsonObject.packingTypeName			= $("#packingTypeSelectEle option:selected").text();
					jsonObject.packingTypeId			= $('#packingTypeSelectEle').val();
					jsonObject.weight					= $('#weightEle').val();
					jsonObject.remark					= $('#remarkEle').val();
					
					excessEntryDetailsArray.push(jsonObject);
					
					hideLayer();
					btModal.close();
					
				}
			});
		});