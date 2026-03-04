define([
	'selectizewrapper', 
	'JsonUtility', 
	'messageUtility', 
	'nodvalidation', PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js', 
	'focusnavigation' //import in require.config
], function(Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(),
		_this = '',
		deleteAllPermissions = false;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/copyUserPermissionMasterWS/loadCopyConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},	getElementConfigDetails: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
		  
			  $("#mainContent").load("/ivcargo/html/master/copyUserPermissionMaster/copyUserPermissionMaster.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				_this.setFromUserList(response);
				hideLayer();
			
				$("#copyBtn").click(function() {
					if (_this.validateFeilds())
						_this.copyConfigurations();
				});
				
				$("#deleteAndCopyBtn").click(function() {
					deleteAllPermissions = true;
					
					if (_this.validateFeilds())
						_this.copyConfigurations();
				});
			});
		}, validateFeilds: function() {
			if ($("#fromExecutiveEle").val() == 0) {
				showAlertMessage('error', 'Select From Executive !');
				return false;
			}
			
			if ($("#toExecutiveEle").val() == 0) {
				showAlertMessage('error', 'Select To Executive !');
				return false;
			}
			
			if (($("#fromExecutiveEle").val() == $("#toExecutiveEle").val())) {
				showAlertMessage('error', sameGroupErrMsg);
				return;
			}
			
			return true;
		}, setFromUserList: function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList: response.executiveList,
				valueField: 'executiveId',
				labelField: 'executiveName',
				searchField: 'executiveName',
				elementId: 'fromExecutiveEle',
				create: false,
				maxItems: 1
			});
			
			$('#fromExecutiveEle').on('change', function() {
				let selectedUserId = $(this).val(); // Get the selected user ID
				let selectedUser = response.executiveList.find(user => user.executiveId == selectedUserId);
				
				if (selectedUser) {
					let executiveType = selectedUser.executiveType;
					let filteredList = response.executiveList.filter(function(user) {
						return user.executiveType == executiveType && user.executiveId != selectedUserId;
					});
				
					_this.setToUserList(filteredList)
				}
			});
		}, setToUserList: function(filteredList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList: filteredList,
				valueField: 'executiveId',
				labelField: 'executiveName',
				searchField: 'executiveName',
				elementId: 'toExecutiveEle',
				create: false,
				maxItems: 10
			});
		}, copyConfigurations: function() {
			jsonObject["fromExecutiveId"] = $('#fromExecutiveEle').val();
			jsonObject["toExecutiveIds"] = $('#toExecutiveEle').val();
			jsonObject["deleteAllPermissions"] = deleteAllPermissions;
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/copyUserPermissionMasterWS/copyPermissions.do?', _this.responseData, EXECUTE_WITH_ERROR);
		},	responseData: function() {
			hideLayer();
		}
	});
});