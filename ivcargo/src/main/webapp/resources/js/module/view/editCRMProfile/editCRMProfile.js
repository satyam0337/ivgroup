define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	], function(Marionette) {
	'use strict';// this basically give strictness to this specific js
	let jsondata = new Object(), _this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			showLayer();
			let jsonObject	= new Object();
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + "/partyMasterWS/getPartyDataToUpdateFromCRM.do?", _this.renderEditProfile, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderEditProfile : function(response) {
			showLayer();
			jsondata = response.CorporateAccount;
			
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/editCRMProfile/editCRMProfile.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				_this.setPartyData(response.CorporateAccount);
				
				$("#updateProfile").click(function() {
					_this.validatePartyData();
				});
			});
		}, setPartyData : function(response) {
			$('#mobileNumber').val(response.corporateAccountMobileNumber);
			$('#gstNumber').val(response.gstn);
			$('#panNumber').val(response.corporateAccountPanNumber);
			$('#address').val(response.corporateAccountAddress);
			$('#email').text(response.corporateAccountEmailAddress);
			$('#branch').text(response.branchName);
		}, validatePartyData : function() {
			if(!validateInputTextFeild(5, 'mobileNumber', 'mobileNumber', 'error', "Enter valid mobile number")){return false;}
			if(!validateInputTextFeild(9, 'gstNumber', 'gstNumber', 'error', gstnErrMsg)){return false;}
			if(!validateInputTextFeild(8, 'panNumber', 'panNumber', 'err0r', "Enter valid PAN number")){return false;}
			_this.updatePartyData();
		}, updatePartyData : function() {
			let jsonObject = new Object();
			_this.setDataToSaveOrUpdate(jsonObject);

			if(confirm('Are you sure you want to update the Party ?')) {
				showLayer();
				$.ajax({
					type		: "POST",
					url			: CUSTOMER_ACCESS_URL_CONSTANT+'/partyMasterWS/updatePartyMaster.do',
					data		: jsonObject,
					dataType	: 'json',
					success: function(data) {
						if(data.message != undefined) {
							let errorMessage = data.message;
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						}
						
						hideLayer();
					}
				});
			}
		}, setDataToSaveOrUpdate : function(jsonObject) {
			jsonObject.corporateAccountId 			= jsondata.corporateAccountId;
			jsonObject.mobileNumber1Ele 			= $('#mobileNumber').val();
			jsonObject.gstnEle 						= $('#gstNumber').val();
			jsonObject.panNumberEle 				= $('#panNumber').val();
			jsonObject.addressEle 					= $('#address').val();
			jsonObject.isTBBEle 					= jsondata.corporateAccountTBBParty;
			jsonObject.accountGroupId				= localStorage.getItem("currentCorporateAccountGroupId");
			jsonObject.executiveId					= localStorage.getItem("currentExecutiveId");
			jsonObject.isCustomerAccess				= true;
			jsonObject.partyNameEle					= jsondata.corporateAccountName.split('_')[0];
			
		}
	});
});
