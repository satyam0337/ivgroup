/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function () {
	'use strict';// this basically give strictness to this specific js
	let _this = '', jsonObject, myNod;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/getCustomerAccessDetailsByCorporateAccountId.do', _this.setCustomer, EXECUTE_WITH_ERROR);
		}, setCustomer : function(response) {

			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/customeraccess/CustomerAccessDetails.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				$('#upupdateBtn').attr("disabled",true);

				let corporateAccountAutoComplete 			= new Object();
				corporateAccountAutoComplete.primary_key 	= 'corporateAccountId';
				corporateAccountAutoComplete.field 		= 'corporateAccountDisplayName';
				$("#upcorporateNameEle").autocompleteCustom(corporateAccountAutoComplete);

				$('#upcorporateNameEle').val(response.CustomerAccess.customerAccessName);
				$('#upcorporateNameEle_primary_key').val(response.CustomerAccess.corporateAccountId);
				$('#uploginNameEle').val(response.CustomerAccess.customerAccessLogin);
				$('#uploginPasswordEle').val(response.CustomerAccess.customerAccessPassword);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#upcorporateNameEle',
					validate		: 'validateAutocomplete:#upcorporateNameEle_primary_key',
					errorMessage	: 'Select Corporate Account !'
				});
				
				myNod.add({
					selector		: '#uploginNameEle',
					validate		: 'presence',
					errorMessage	: 'Enter Login Name !'
				});
				
				myNod.add({
					selector		: '#uploginPasswordEle',
					validate		: 'presence',
					errorMessage	: 'Enter Password !'
				});

				$("#uploginNameEle").keyup(function() {
					$('#upupdateBtn').attr("disabled", false);
				});

				$("#uploginPasswordEle").keyup(function() {
					$('#upupdateBtn').attr("disabled", false);
				});
				
				$("#upupdateBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.updateCustomerAccess();
				});

				$("#updeleteBtn").click(function() {
					_this.deleteCustomerAccess();
				});

				hideLayer();
			});
		}, updateCustomerAccess : function() {
			showLayer();
			let jsonObject = new Object();

			jsonObject.corporateAccountId				= $('#upcorporateNameEle_primary_key').val();
			jsonObject.customerAccessLogin				= $('#uploginNameEle').val();
			jsonObject.customerAccessPassword			= $('#uploginPasswordEle').val();
			jsonObject.customerAccessMfd				= false;

			getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/updateCustomerAccess.do', _this.afterUpdate, EXECUTE_WITH_ERROR);
		}, afterUpdate	: function() {
			let MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=customerAccessMaster&updateCount='+true+'&dataUpdate='+false+'&dataDelete='+true);
			location.reload();
		}, deleteCustomerAccess : function() {
			showLayer();
			let jsonObject = new Object();

			jsonObject.corporateAccountId				= $('#upcorporateNameEle_primary_key').val();
			jsonObject.customerAccessLogin				= $('#uploginNameEle').val();
			jsonObject.customerAccessPassword			= $('#uploginPasswordEle').val();
			jsonObject.customerAccessMfd				= true;

			getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/updateCustomerAccess.do', _this.afterDelate, EXECUTE_WITH_ERROR);
		}, afterDelate	: function() {
			let MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=customerAccessMaster&updateCount='+true+'&dataUpdate='+false+'&dataDelete='+true);
			location.reload();
		}
	});
});