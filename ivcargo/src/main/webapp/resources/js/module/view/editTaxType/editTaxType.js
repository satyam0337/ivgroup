define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/editTaxType/editTaxTypeDetailsfilepath.js'//FilePath
	,'language'//import in require.config
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'nodvalidation'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (FilePath,Language,AutoComplete, AutoCompleteWrapper,slickGridWrapper2,errorshow,JsonUtility,MessageUtility,UrlParameter,NodValidation,ElementModel,Elementtemplateutils,constant,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	myNod,
	waybillId,
	redirectFilter,
	masterLangKeySet,
	gridObject,
	masterLangObj,
	previousTaxTypeId,
	btModalConfirm,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			waybillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');

			jsonObject.waybillId	= waybillId;
		}, render: function() {

			jsonObject	= new Object();

			jsonObject.waybillId	= waybillId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/editTaxTypeWS/getLrTaxTypeData.do?', _this.setTaxTypeData, EXECUTE_WITHOUT_ERROR);

		}, setTaxTypeData : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/editTaxType/editTaxType.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				//initialiseFocus();

				_this.setData(response);
				hideLayer();
				//	_this.setWeightWiseTableDetails(response);
			});
		}, setData : function(response) {

			var taxTypeAutoComplete 			= new Object();
			taxTypeAutoComplete.primary_key 	= 'taxTypeId';
			taxTypeAutoComplete.url 			= response.taxTypeList;
			taxTypeAutoComplete.field 			= 'taxTypeName';
			$("#isTaxTypeEle").autocompleteCustom(taxTypeAutoComplete);

			if(response.taxTypeObj != undefined && response.taxTypeObj != null ){
				previousTaxTypeId =  response.taxTypeObj.taxTypeId;
				$("#isTaxTypeEle_primary_key").val(response.taxTypeObj.taxTypeId);
				$("#isTaxTypeEle").val(response.taxTypeObj.taxTypeName);
			}


			$("#updateBtn").on('click', function() {
				var jsonObject			= new Object();

				if( $("#isTaxTypeEle").val() == undefined || $("#isTaxTypeEle").val() == "" ){
					showMessage("error", "Please Select Valid Tax Type");
					return false;
				}else if(previousTaxTypeId == Number($('#isTaxTypeEle_primary_key').val())) {
					showMessage("error", "Please Select a Different Tax Type");
					return false;
				}else{

					jsonObject.taxTypeId				= $('#isTaxTypeEle_primary_key').val();
					jsonObject.waybillId				= waybillId;

					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Tax Type ?",
						modalWidth 	: 	30,
						title		:	'Update Tax Type',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL+'/editTaxTypeWS/updateTaxType.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
					});
				}
			});

		},onUpdate : function(response) {
			hideLayer();
			if(redirectFilter > 0) {

				response.redirectTo	= Number(redirectFilter);
				response.wayBillId  = waybillId;

				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);

				if(Number(errorMessage.messageId) == 20){
					setTimeout(function(){
						redirectToAfterUpdate(response);
					},1000);
				}
			}
		}

	});
});