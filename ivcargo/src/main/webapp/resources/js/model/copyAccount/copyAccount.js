define([
	'selectizewrapper'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
], function (Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(), _this = '';

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			getJSON(jsonObject, WEB_SERVICE_URL + '/copyAccountGroupConfigurationWS/loadCopyConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function (response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/copyAccount/copyAccount.html", function () {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function () {
				initialiseFocus();
				
				_this.setFromGroupList(response);
				_this.setToGroupList(response);
				_this.setModuleIdList(response);
				
				$('#accountFromGroupEle, #accountToGroupEle, #moduelOrReportEle').on('change', function(e) {
					_this.resetAndHideData();
				});

				hideLayer();
				
				$("#searchBtn").click(function () {
					if(_this.validateFeilds())
						_this.getDataForCopy();
				});

				$("#copyBtn").click(function () {
					if(_this.validateFeilds())
						_this.copyConfigurations();
				});
				
				$('#filter').keyup(function() {
					// Retrieve the input field text and reset the count to zero
					let filter = $(this).val().toLowerCase();;
					// Loop through the comment list
					$('#results div').each(function() {
						// If the list item does not contain the text phrase fade it out
						if ($(this).text().toLowerCase().search(new RegExp(filter, "i")) < 0)
							$(this).hide();
						else
							$(this).show();
					});
				});
			});		
		}, validateFeilds : function() {
			if($("#accountFromGroupEle").val() == 0) {
				showAlertMessage('error', 'Select From Account group !');
				return false;
			}
			
			if($("#accountToGroupEle").val() == 0) {
				showAlertMessage('error', 'Select To Account group !');
				return false;
			}
			
			if(($("#accountFromGroupEle").val() == $("#accountToGroupEle").val())) {
				showAlertMessage('error', sameGroupErrMsg);
				return;
			}
			
			if($("#moduelOrReportEle").val() == 0) {
				showAlertMessage('error', 'Select Operations !');
				return false;
			}
			
			return true;
		}, setFromGroupList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.accountGroupList,
				valueField		:	'accountGroupId',
				labelField		:	'accountGroupDescription',
				searchField		:	'accountGroupDescription',
				elementId		:	'accountFromGroupEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setToGroupList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.accountGroupList,
				valueField		:	'accountGroupId',
				labelField		:	'accountGroupDescription',
				searchField		:	'accountGroupDescription',
				elementId		:	'accountToGroupEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setModuleIdList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.operationsList,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'moduelOrReportEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, resetAndHideData : function() {
			$('#middle-border-boxshadow').addClass('hide');
			$('#bottom-border-boxshadow').addClass('hide');
			$('.insideCheckBox').empty();
		}, getDataForCopy : function () {
			showLayer();

			jsonObject["fromAccountGroupId"] 		= $('#accountFromGroupEle').val();
			jsonObject["toAccountGroupId"] 			= $('#accountToGroupEle').val();
			jsonObject["operationId"]				= $("#moduelOrReportEle").val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/copyAccountGroupConfigurationWS/getFromGroupData.do?', _this.getResponseData, EXECUTE_WITH_ERROR);
		}, getResponseData : function(response) {
			$(".insideCheckBox").html("");
			
			if(response.message != undefined) {
				_this.resetAndHideData();
				return;
			}
			
			let configuration	= (response.CopyAccountGroup != undefined) ? response.CopyAccountGroup : response.fromReportPerList;
			
			hideLayer();	
			
			let container = $(".insideCheckBox");
			
			configuration.forEach(element => {
				let div		= $("<div>", {class: "form-check form-switch shadow col"});
				let input	= $("<input>", {class: "form-check-input"})
				let id 			= (element.moduleId != undefined) ? element.moduleId : element.moduleIdentifier + "_" + element.permissionId;
				let displayName	= (element.moduleName != undefined) ? element.moduleName : element.displayName;
			
				input.attr("type", "checkbox");
				
				if(element.isVisible != undefined)
					input.prop("checked", element.isVisible)
				else
					input.prop("checked", element.visible)
					
				$(input).attr("data-atribute", id);
				
				let label = $("<label>", {class : "form-check-label", for : "flexSwitchCheckDefault"})
					label.text(displayName);

				div.append(input);
				div.append(label);
				
				$(container).append(div);
			});
			
			$('#middle-border-boxshadow').removeClass('hide');
			$('#bottom-border-boxshadow').removeClass('hide');

			hideLayer();	
		}, copyConfigurations : function() {
			let ids				= [];
			let permissionIds	= [];
			
			let operationId	= $("#moduelOrReportEle").val();
			
			$(".form-check-input:checked").each((index, element) => {
				let value	= $(element).attr("data-atribute");
				
				if(operationId == 2) {
					ids.push(value.split("_")[0]);
					permissionIds.push(value.split("_")[1]);
				} else
					ids.push(value);
			})
			
			if(ids.length <= 0) {
				showAlertMessage('error', "Please, Select atleast 1 checkbox");
				return;
			}
			
			if(!confirm("Are to sure to copy Configuration and Permissions ?"))
				return;
			
			jsonObject["fromAccountGroupId"] 		= $('#accountFromGroupEle').val();
			jsonObject["toAccountGroupId"] 			= $('#accountToGroupEle').val();
			jsonObject["moduleOrReportIds"]			= ids.join(",");
			jsonObject["permissionIds"]				= permissionIds.join(",");
			jsonObject["operationId"]				= operationId;

			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/copyAccountGroupConfigurationWS/copyConfigurations.do?', _this.responseData, EXECUTE_WITH_ERROR);
		}, responseData : function(){
			hideLayer();
		}
	});
});