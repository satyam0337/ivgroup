define([ 'marionette'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'selectizewrapper'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		 ,'focusnavigation'
		],
		function(Marionette, Selection) {
	'use strict';
	let jsonObject	= new Object(), showAllGroupsOption=false, myNod,_this = '', accountGroup = null, isActive = false;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/accountGroupWS/getConfigurationElement.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/accountGroupMaster/accountGroupMaster.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				showAllGroupsOption	= response.showAllGroupsOption;
				
				if(showAllGroupsOption) {
					response.accountGroupSelection	= showAllGroupsOption;
	
					Selection.setSelectionToGetData(response);
					
					$('#accountGroupEle').on('change', function(e) {
						console.log(e);
						_this.resetAndHideData();
						$('#statusEle').addClass('hide');
					});
				}
				
				$('#searchEle').click(function() {
					_this.getDetailsForGroup();
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				addElementToCheckEmptyInNode(myNod, 'accountGroupNameEle', 'Enter Account Group Name');
				addElementToCheckEmptyInNode(myNod, 'descriptionEle', 'Enter Description');
				addElementToCheckEmptyInNode(myNod, 'groupCodeEle', 'Enter Account Group Code');
				addElementToCheckEmptyInNode(myNod, 'addressEle', 'Enter Address');
				addElementToCheckEmptyInNode(myNod, 'contactPersonEle', 'Enter Contact Person');
				addElementToCheckEmptyInNode(myNod, 'mobileNoEle', 'Enter Mobile Number');
				
				$('#updateEle').click(function() {
					if(!_this.validateRemark('remarkEle'))
						return;
					
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.updateAccountGroupDetails();
				});
				
				$('#statusEle').click(function() {
					let accountGroupId	= $('#accountGroupEle').val();
			
					if(accountGroupId <= 0) {
						showAlertMessage('error', 'Select Group !');
						return;
					}
			
					if(!_this.validateRemark('remarkEle'))
						return;
					
					_this.activateDeactivateGroup();
				});
				
				hideLayer();
			});
		}, resetAndHideData : function() {
			$('#middle-border-boxshadow').addClass('hide');
			$('#bottom-border-boxshadow').addClass('hide');
			clearFormElements('elementDiv');
		}, getDetailsForGroup : function() {
			let accountGroupId	= $('#accountGroupEle').val();
			
			if(accountGroupId <= 0) {
				showAlertMessage('error', 'Select Group !');
				return;
			}
			
			let jsonObject 	= new Object();
			jsonObject.accountGroupId		= accountGroupId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupWS/getGroupDetailsById.do?', _this.displayData, EXECUTE_WITH_NEW_ERROR);
		}, displayData : function(response) {
			hideLayer();
			
			accountGroup	= response.accountGroup;

			if(accountGroup == undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				$('#statusEle').addClass('hide');
				return;
			}
			
			isActive = response.ACTIVE;
			_this.changeStatusButtonClass();
			$('#statusEle').removeClass('hide');
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			if(!isActive) {
				showAlertMessage('error', 'Activate Group First !');
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			
			$('#accountGroupNameEle').val(accountGroup.accountGroupName);
			$('#descriptionEle').val(accountGroup.accountGroupDescription);
			$('#groupCodeEle').val(accountGroup.accountGroupCode);
			$('#addressEle').val(accountGroup.accountGroupAddress);
			$('#contactPersonEle').val(accountGroup.accountGroupContactPersonName);
			$('#mobileNoEle').val(accountGroup.accountGroupMobileNumber);
			$('#phoneNoEle').val(accountGroup.accountGroupPhoneNumber);
			$('#emailAdrEle').val(accountGroup.accountGroupEmailAddress);
			$('#websiteEle').val(accountGroup.website);
			$('#helplineNoEle').val(accountGroup.helplineNumbers);
			$('#panNoEle').val(accountGroup.panNumber);
			$('#gstNoEle').val(accountGroup.gstNumber);
			
			hideLayer();	
		}, validateRemark : function(id) {
			let remark			= $('#' + id).val();
			
			if(remark == '' || remark == undefined) {
				$('#' + id).focus();
				showAlertMessage('error', 'Enter Remark !');
				return false;
			} else if (remark.trim().length < 15) {
				$('#' + id).focus();
				showAlertMessage('error', 'Enter Remark atleast 15 Character !');
				return false;
			} else if(remark.trim().toUpperCase() === 'OK' || /^(.)\1+$/.test(remark.trim())) {
				$('#' + id).focus();
				showAlertMessage('error', 'Enter Valid Remark !');
				return false;
			}
			
			return true;
		}, updateAccountGroupDetails : function() {
		    let isEdited = false;
			let isGroupCodeEdit = false;
		    let jsonObject = new Object();
		    let jsonObjectLog = new Object();
			
			$('#elementDiv input').each(function() {
				let fieldId 	= $(this).attr('id');
				let fieldName 	= $(this).attr('name');
				let fieldValue 	= $(this).val();
			   
				if (fieldId === 'remarkEle')
					return true;
				
				if(fieldId === 'groupCodeEle' && fieldValue !== accountGroup[fieldName])
					isGroupCodeEdit = true;

				if (accountGroup[fieldName] !== fieldValue) {
					jsonObject[fieldName] = fieldValue;
					jsonObjectLog[fieldName] = fieldValue;
					isEdited = true;
				} else {
					jsonObject[fieldName] = accountGroup[fieldName];
				}
			});

			if(!isEdited) {
				showAlertMessage('error', 'No Modifications Detected. Please update at least one value.!');
				return;
			}
		   
		   	showLayer();
			
			jsonObject.configAccountGroupId			= accountGroup.accountGroupId;
			jsonObject.remark						= $('#remarkEle').val();
			jsonObject.isGroupCodeEdit				= isGroupCodeEdit;
			jsonObject.editLogs						= JSON.stringify(jsonObjectLog);
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupWS/updateAccountGroupDetails.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, activateDeactivateGroup : function() {
			let jsonObject = new Object();
			jsonObject["accountGroupId"] 	= accountGroup.accountGroupId;
			jsonObject["status"] 			= isActive ? 1 : 0;
			jsonObject["remark"] 			= $('#remarkEle').val();
		
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupWS/activateDeactivateGroup.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, setSuccess : function (response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
				return;
				
			isActive = response.ACTIVE;
			_this.changeStatusButtonClass();
			
			$('#remarkEle').val('');
			
			if(!isActive)
				_this.resetAndHideData();
			
			refreshCache(ACCOUNT_GROUP_MASTER, accountGroup.accountGroupId);
		}, changeStatusButtonClass : function() {
			if (isActive)
				$('#statusEle').text('Deactivate').removeClass('btn-success').addClass('btn-danger');
			else
				$('#statusEle').text('Activate').removeClass('btn-danger').addClass('btn-success');
		}
	});
});
