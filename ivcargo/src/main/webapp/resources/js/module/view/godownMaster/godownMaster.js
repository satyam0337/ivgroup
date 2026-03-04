define([
	'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/godownMaster/godownMaterFilePath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'
	 ,'nodvalidation'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
], function(JsonUtility, MessageUtility, FilePath, Lingua, Language, slickGridWrapper2, NodValidation, BootstrapModal, UrlParameter, Selection) {
	'use strict';
	var jsonObject = new Object(),_this = '', executive;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/godownMasterWS/loadGodownElements.do?', _this.setGodownDetailsData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setGodownDetailsData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/godown/godownMaster.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show)
						$("*[data-attribute=" + keyObject[i] + "]").removeClass("hide");
				}
				
				executive					= response.executive;
				
				var elementConfiguration				= new Object();
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.godownElement		= $('#godownEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.godownListByBranch				= true;
				response.AllOptionsForRegion			= false;
				response.AllOptionsForSubRegion			= false;
				response.AllOptionsForBranch			= false;

				Selection.setSelectionToGetData(response);
				
				loadLanguageWithParams(FilePath.loadMasterLanguage());
				
				var myNod	= _this.formValidations();
				
				_this.bindEvents(myNod);

				hideLayer();
			});
		}, bindEvents : function(myNod) {
			$("#godownEle").change(function() {
				_this.getGodownDetails();
			});
			
			$("#addBtn").click(function() {
				myNod.performCheck();
							
				if(myNod.areAll('valid'))
					_this.createGodown();
			});
				
			$("#editBtn").click(function() {
				_this.enableDisbaleElements(false);
				$('#updateBtn').removeClass('hide');
				$('#cancelBtn').removeClass('hide');
			});
			
			$("#updateBtn").click(function() {
				myNod.performCheck();
							
				if(myNod.areAll('valid'))
					_this.updateGodown();
			});
			
			$("#deleteBtn").click(function() {
				_this.deleteGodown();
			});
			
			$("#resetBtn, #cancelBtn").click(function() {
				_this.resetElements();
			});
			
			$("#viewAllBtn").click(function() {
				window.open ('viewDetails.do?pageId=340&eventId=1&modulename=godownDetails');
			});
		}, getGodownDetails : function() {
			showLayer();
			
			var jsonObject = new Object;
			
			jsonObject["godownId"] 		= $('#godownEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/godownMasterWS/getGodownDetailsByGodownId.do', _this.setGodownDetails, EXECUTE_WITH_ERROR);
		}, setGodownDetails : function(response) {
			var godown	= response.GODOWN;
			
			hideLayer();
			
			if(!godown) {
				_this.resetElements();
				return;
			}
				
			_this.enableDisbaleElements(true);
			$('#editBtn').removeClass('disabled');
			$('#deleteBtn').removeClass('disabled');
			
			$('#nameEle').val(godown.name);
			$('#addressEle').val(godown.address);
			$('#pinCodeEle').val(godown.pincode);
			$('#contactPersonEle').val(godown.contactPersonName);
			$('#mobileNumberEle').val(godown.mobileNumber);
			
			var stdCodeAndPhNo	= godown.phoneNumber;
			
			if(stdCodeAndPhNo.length > 0) {
				var stdCodeAndPhNo = stdCodeAndPhNo.split("-");
				
				$('#stdCodeEle').val(stdCodeAndPhNo[0]);
				$('#phoneNumberEle').val(stdCodeAndPhNo[1]);
			}
		}, createGodown : function() {
			var btModalConfirm = _this.getConfirmation('Create Godown', 'Do you want to create new godown !');
			
			var jsonObject = _this.getData();
			
			btModalConfirm.on('ok', function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/godownMasterWS/createGodown.do', _this.setResponse, EXECUTE_WITH_ERROR);
				showLayer();
			});
		}, updateGodown : function() {
			var btModalConfirm = _this.getConfirmation('Update Godown', 'Do you want to update godown !');
			
			var jsonObject = _this.getData();
			
			jsonObject["godownId"] 			= $('#godownEle_primary_key').val();
			
			btModalConfirm.on('ok', function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/godownMasterWS/updateGodown.do', _this.setResponse, EXECUTE_WITH_ERROR);
				showLayer();
			});
		}, deleteGodown : function() {
			var btModalConfirm = _this.getConfirmation('Delete Godown', 'Do you want to delete godown !');
					
			var jsonObject = new Object();
			
			jsonObject["godownId"] 				= $('#godownEle_primary_key').val();
			
			btModalConfirm.on('ok', function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/godownMasterWS/deleteGodown.do', _this.setResponse, EXECUTE_WITH_ERROR);
				showLayer();
			});
		}, setResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				_this.resetElements();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
				
			hideLayer();
		}, formValidations : function() {
			var myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			_this.branchSelectionValidation(myNod);
			
			addElementToCheckEmptyInNode(myNod, 'nameEle', 'Please Enter Name')
			addElementToCheckLength6InNode(myNod, 'pinCodeEle', 'minimum  6 numbers')
			addAutocompleteElementInNode(myNod, 'godownBranchEle', 'Please Select Branch')
			addElementToCheckLength10InNode(myNod, 'mobileNumberEle', 'Min Length should be 10')
			
			return myNod;
		}, branchSelectionValidation : function(myNod) {
			addAutocompleteElementInNode(myNod, 'regionEle', 'Please Select Region')
			addAutocompleteElementInNode(myNod, 'subRegionEle', 'Please Select Sub-Region')
			addAutocompleteElementInNode(myNod, 'branchEle', 'Please Select Branch')
		}, getData : function() {
			var jsonObject = new Object();
			
			jsonObject["name"] 				= $('#nameEle').val();
			jsonObject["address"] 			= $('#addressEle').val();
			jsonObject["sourceBranchId"] 	= $('#godownBranchEle_primary_key').val();
			jsonObject["pinCode"] 			= $('#pinCodeEle').val();
			jsonObject["contactPersonName"] = $('#contactPersonEle').val();
			jsonObject["MobileNumber"] 		= $('#mobileNumberEle').val();
			
			var stdCode		= $('#stdCodeEle').val();
			var phoneNumber	= $('#phoneNumberEle').val();
			
			if(stdCode.length > 0 && phoneNumber.length > 0)
				jsonObject["PhoneNumber"] 	= stdCode + '-' + phoneNumber;
				
			return jsonObject;
		}, resetElements : function() {
			$('#addBtn').removeClass('disabled');
			$('#resetBtn').removeClass('disabled');
			$('#editBtn').addClass('disabled');
			$('#deleteBtn').addClass('disabled');
			$('#updateBtn').addClass('hide');
			$('#cancelBtn').addClass('hide');
			
			$('#nameEle').val('');
			$('#addressEle').val('');
			$('#pinCodeEle').val('');
			$('#contactPersonEle').val('');
			$('#stdCodeEle').val('');
			$('#phoneNumberEle').val('');
			$('#mobileNumberEle').val('');
			$('#selectedGodownId').val(0);
			
			if(executive.executiveType != EXECUTIVE_TYPE_BRANCHADMIN)
				$('#branch').removeClass('disabled');
		}, enableDisbaleElements : function(trueFalse) {
			setReadOnly('nameEle', trueFalse);
			setReadOnly('addressEle', trueFalse);
			setReadOnly('pinCodeEle', trueFalse);
			setReadOnly('contactPersonEle', trueFalse);
			setReadOnly('stdCodeEle', trueFalse);
			setReadOnly('phoneNumberEle', trueFalse);
			setReadOnly('mobileNumberEle', trueFalse);
		}, getConfirmation : function(title, content) {
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	content,
				modalWidth 	: 	30,
				title		:	title,
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
			
			return btModalConfirm;
		}
	});
});