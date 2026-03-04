define([ 'marionette'
		 ,'selectizewrapper'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		 ,'focusnavigation'
		],
		function(Marionette, Selectizewrapper, Selection, UrlParameter, SlickGridWrapper) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(), showAllGroupsOption=false, serverIdentifier = 0, storeConfig = false, deleteConfig = false, subModuleList= null,
	_this = '', modal1 = null, isRefreshButton = false, isUpdateDescription = false, addModel = null, configurationTypeConstantHM = null,
	isCheckConfiguration = false, configHM = null, disableSmsServiceObj = null, smsConfigurationId = 0, isRemarkRequired = false, isStoreConfiguration = false;
	const TDS_TYPE_ID = 14, MAIL_CONFIGURATION = 216, DATE_TIME = 23, API_CONFIGURATION = 204;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
		}, render: function() {
			jsonObject.currentExecutiveId 		= UrlParameter.getModuleNameFromParam(MASTERID);
			getJSON(jsonObject, WEB_SERVICE_URL + '/configurationWS/getConfigurationElement.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/configurationMappingMaster/configuration.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				// all Data in response
				
				showAllGroupsOption	= response.showAllGroupsOption;
				serverIdentifier	= response.serverIdentifier;
				storeConfig			= response.storeConfig;
				deleteConfig		= response.deleteConfig;
				subModuleList		= response.subModuleList;
				configurationTypeConstantHM	= response.configurationTypeConstantHM;
				disableSmsServiceObj		= response.disableSmsService;
				isRemarkRequired			= response.isRemarkRequired;
				
				if (disableSmsServiceObj != null) {
					smsConfigurationId	= disableSmsServiceObj.configurationId;
					
					if(disableSmsServiceObj.defaultValue === 'true')
						$('#smsAction').text('Activate SMS').removeClass('btn-danger').addClass('btn-success');
				}
				
				let elementConfiguration	= {};
				elementConfiguration.dateElement = $('#editLogDateEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.isCalenderSelection	= true;
				
				if(showAllGroupsOption) {
					response.accountGroupSelection	= showAllGroupsOption;
					$('#accountGroupSelection').removeClass('hide');
					$('#accountGroupEle').on('change', function(e) {
						console.log(e);
						_this.resetAndHideData();
					});
				}
				
				Selection.setSelectionToGetData(response);
				
				_this.setModuleType(response);
				_this.setMasterType(response);
				
				showAllGroupsOption	= response.showAllGroupsOption;

				modal1 		= new bootstrap.Modal(document.getElementById('staticBackdrop'));
				addModel 	= new bootstrap.Modal(document.getElementById('staticBackdropAdd'));
				
				$('.cancelButton').click(function() {
					$(".update-modal-body").empty();
					$('.updateButton').removeClass('hide');
					$('#todayEntry').prop("checked", false);
				});
				
				$('#find').click(function() {
					$('#editLogsDetailsDiv').empty();
					$('#left-border-boxshadow').addClass('hide');
					$('#bottom-border-boxshadow').removeClass('hide');
					isStoreConfiguration	= false;
					_this.getConsigurationForGroup();
				});
				
				$('#updateDescription').click(function() {
					_this.resetAndHideSelection(this);
				});
				
				$('#refresh').click(function() {
					_this.refreshConfiguration();
				});
				
				$('#refreshDefault').click(function() {
					_this.refreshDefaultConfiguration();
				});
				
				$('#refreshConfigurationKeys').click(function() {
					_this.refreshConfigurationKeys();
				});
				
				$('#editLogDiv').removeClass('hide');
				
				$('#editLogs').click(function() {
					_this.getEditHistoryByModule();
				});
				
				$('#dateWiseEditLogs').click(function() {
					_this.getEditHistoryByDate();
				});
				
				$('#downloadConfiguration').click(function() {
					_this.downloadConfiguration();
				});

				if(!storeConfig) {
					$('#middle-border-boxshadow').remove();
					$('#insertConfigurationDiv').remove();
					$('#checkConfigurationDiv').remove();
					$('#viewConfigurationDiv').remove();
					$('#todayEntryDiv').remove();
					$('#smsActionEditLogsDiv').remove();
				} else {
					$('#middle-border-boxshadow').removeClass('hide');
					$('#insertConfigurationDiv').removeClass('hide');
					$('#checkConfigurationDiv').removeClass('hide');
					$('#todayEntryDiv').removeClass('hide');
					$('#viewConfigurationDiv').removeClass('hide');
					
					_this.setModuleIdList(response);
					_this.setSubModuleIdList(response);

					$("#moduleIdEle").change(function() {
						let moduleId			= $('#moduleIdEle').val();

						if(moduleId == MAIL_CONFIGURATION)
							_this.setAutocompleteList(response.allMailModuleList);
						else
							_this.setAutocompleteList(response.allApiModuleList);
						
						if(moduleId == MAIL_CONFIGURATION || moduleId == API_CONFIGURATION)
							$("*[data-attribute=apiSubModuleId]").removeClass("hide");
						else
							$("*[data-attribute=apiSubModuleId]").addClass("hide");
					});

					_this.setConfigurationTypeOptions();
					
					$('#storeConfig').click(function() {
						isStoreConfiguration = true;
						_this.storeConfiguration();
					});
					
					$('#insertConfiguration').click(function() {
						_this.resetAndHideSelection(this);
						
						if(this.checked)
							_this.openAndSetDataForAdd(this);
					});
					
					$('#checkConfiguration').click(function() {
						_this.resetAndHideSelection(this);
					});
					
					$('#viewConfiguration').click(function() {
						_this.resetAndHideSelection(this);
					});
					
					$('#todayEntry').click(function() {
						_this.viewTodayEntry(this);
					});
	
					$('.addButton').click(function() {
						_this.addConfiguration(this);
					});
				}
					 	
				$('.updateButton').click(function() {
					let remarkId		= 'updateRemarkEle';
					
					if(isRemarkRequired && !_this.validateRemark(remarkId))
						return;
							
					let	value			= $('#input-field').val();
					let radioValue		= $('input[name="radio"]:checked').val();
					let	defaultValue	= $('#defaultValue-field').val();
					
					if(value != undefined && value != "undefined") {
						if(!_this.validateInputFields(value, defaultValue))
							return;						
						
						changeTextFieldColor('input-field', 'green', '', '');
						_this.updateCheckBox($('#configurationId').val(), "", value, remarkId);
					} else if(radioValue > 0)
						_this.updateCheckBox($('#configurationId').val(), "", radioValue, remarkId);
					else {
						let selectedCheckboxes = getAllCheckBoxSelectValue('checkbox-field');
						let value				= "0";
						
						if (selectedCheckboxes.length != 0)
							value	= selectedCheckboxes.join(',');
				
						_this.updateCheckBox($('#configurationId').val(), "", value, remarkId);
					}
				});
				
				$('#filter').keyup(function() {
					// Retrieve the input field text and reset the count to zero
					filterDivData('results', $(this).val().toLowerCase(), 'div');
				});
				
				$('#refreshOtherData').click(function() {
					_this.refreshOtherOperations();
				});
				
				$('#smsAction').click(function() {
					_this.activateDeactivateSMSService();
				});
				
				$('#smsActionEditLogs').click(function() {
					_this.getEditHistoryByConfigurationId(smsConfigurationId, 0);
				});
				
				if(!isRemarkRequired)
					$('#remarkEle').remove();
				
				hideLayer();
			});
		}, setModuleType : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.moduleList,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'moduleTypeEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _this.getSubModuleList
			});
		}, setSubModuleType : function(moduleList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	moduleList,
				valueField		:	'subModuleId',
				labelField		:	'subModuleName',
				searchField		:	'subModuleName',
				elementId		:	'subModuleTypeEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _this.resetAndHideData
			});
		}, setMasterType : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.masterListForRefresh,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'masterTypeEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setConfigurationTypeOptions : function() {
			for (let k in configurationTypeConstantHM) {
				$('#configType').append('<option value="' + k + '">' + configurationTypeConstantHM[k] + '</option>');
			}
		}, getSubModuleList : function() {
			_this.resetAndHideData();
			
			let moduleId		= $('#moduleTypeEle').val();
			
			if(subModuleList != undefined && subModuleList[moduleId] != undefined) {
				_this.setSubModuleType(_.sortBy(subModuleList[Number(moduleId)], 'subModuleName'));
				$('#subModuleTypeCol').removeClass('hide');
			} else {
				_this.setSubModuleType([]);
				$('#subModuleTypeCol').addClass('hide');
				
				if($('#insertConfiguration').prop("checked") && moduleId > 0)
					addModel.show();
			}
			
			if(storeConfig) {
				$('#refreshDiv').removeClass('hide');
				isRefreshButton	= true;
			}
		}, resetAndHideData : function() {
			$('#bottom-border-boxshadow').addClass('hide');
			$('#left-border-boxshadow').addClass('hide');
			$('.insideCheckBox').empty();
			$('#editLogsDetailsDiv').empty();
			
			if($('#insertConfiguration').prop("checked") && $('#subModuleTypeEle').val() > 0)
				addModel.show();
		}, getConsigurationForGroup : function() {
			let accountGroupId	= $('#accountGroupEle').val();
			let moduleId		= $('#moduleTypeEle').val();
			let subModuleId		= $('#subModuleTypeEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isModuleSelected= moduleId > 0;
			let isSubModuleSel	= subModuleId > 0;
			
			if(showAllGroupsOption && !isGroupSelected && !isUpdateDescription && !isCheckConfiguration) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
			
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Module !');
				return;
			}
			
			if(subModuleList != undefined && subModuleList[moduleId] != undefined && !isSubModuleSel) {
				showAlertMessage('error', 'Select Sub-module type !');
				return;
			}
			
			if(isCheckConfiguration && !validateInputTextFeild(1, 'configurationNameEle', 'configurationNameEle', 'error', 'Please, Insert Configuration Name/Description !'))
				return;
			
			_this.getConfigurationData(accountGroupId, moduleId, subModuleId);
		}, getConfigurationData : function(accountGroupId, moduleId, subModuleId) {
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= accountGroupId;
				
			jsonObject.moduleId  			= moduleId;
			jsonObject.subModuleId 			= subModuleId;
			jsonObject.isCheckConfiguration	= isCheckConfiguration;
			jsonObject.name					= $('#configurationNameEle').val();
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getGroupConfigurationForMapping.do?', _this.displayData, EXECUTE_WITH_NEW_ERROR);
		}, displayData : function(response) {
			hideLayer();
			$(".insideCheckBox").html("");
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#count').html('Total -> ' + response.count);
			
			goToPosition('bottom-border-boxshadow', 200);
			
			if(isCheckConfiguration) {
				_this.displayConfigurationToGivenGroups(response);
				return;
			}
			
			let configuration	= response.configuration;
			configHM			= response.configHM;
			
			let container = $(".insideCheckBox");
			
			configuration.forEach(element => {
				let div		= $("<div>", {class: "form-check form-switch shadow col"});
				let input	= $("<input>", {class: "form-check-input"})
				let buttons = $("<button>");
				let history = $("<button>");
				let deleteBtn 	= $("<button>");
				let flag	= true;
			
				if(!isUpdateDescription && (element.value == "true" || element.value == "false")) {
					input.attr("type", "checkbox");
					input.attr("id", "flexSwitchCheckDefault");
					input.prop("checked", element.value == "true");
					flag = false;
				}
				
				let label = $("<label>", {class : "form-check-label", for : "flexSwitchCheckDefault", id : "description_" + element.configurationId})
					label.text(" " + element.description);
		
				if(flag) {
					$(buttons).click(function() {
						$('#configurationId').val(element.configurationId);
						_this.getConfigurationByConfigurationIdForUpdate(element.configurationId);
					});
		
					buttons.attr("class", "btn btn-primary btn-sm border-radius40px");
					buttons.attr("data-tooltip", element.description);
					buttons.text("Click");
					buttons.css("margin-right", "10px");
					div.css("padding", "inherit");
					div.append(buttons);
				} else {
					$(input).click(function() {
						if(input.attr("type") != "checkbox") return;
						
						let value			= 'false';
						let remarkId		= 'remarkEle';
						
						if(configHM != undefined && configHM[element.configurationId] != undefined)
							value = configHM[element.configurationId];
						
						if(isRemarkRequired && !_this.validateRemark(remarkId)) {
							input.prop("checked", value == 'true');
							return;
						}
						
						_this.updateCheckBox(element.configurationId, element.name, input.prop('checked'), remarkId);
					});
				
					div.append(input);
				}
				
				div.append(label);
				
				$(history).click(function() {
					_this.getEditHistoryByConfigurationId(element.configurationId, $('#accountGroupEle').val());
				});
			
				history.attr("class", "btn btn-success btn-sm border-radius40px");
				history.html('<i class="fa fa-history" aria-hidden="true"></i>');
				history.css("margin-right", "10px");
				div.append(history);

				if(storeConfig) {
					if(deleteConfig) {
						$(deleteBtn).click(function() {
							_this.deleteConfigurationByConfigurationId(element.configurationId, $('#accountGroupEle').val());
						});
				
						deleteBtn.attr("class", "btn btn-danger btn-sm border-radius40px");
						deleteBtn.html('<i class="fa fa-trash" aria-hidden="true"></i>');
						deleteBtn.css("margin-right", "10px");
						div.append(deleteBtn);
					}
				}
				
				$(container).append(div);
			});
			
			if($('#filter').val() != "")
				filterDivData('results', $('#filter').val().toLowerCase(), 'div');

			hideLayer();	
		}, validateRemark : function(id) {
			let remark			= $('#' + id).val();
			
			if(remark == '' || remark == undefined) {
				$('#' + id).focus();
				showMessage('error', 'Enter Remark !');
				return false;
			} else if (remark.trim().length < 15) {
				$('#' + id).focus();
				showMessage('error', 'Enter Remark atleast 15 Character !');
				return false;
			} else if(remark.trim().toUpperCase() === 'OK' || /^(.)\1+$/.test(remark.trim())) {
				$('#' + id).focus();
				showMessage('error', 'Enter Valid Remark !');
				return false;
			} else {
				let isValid = true;
				const remarkLower = remark.trim().toLowerCase();

				$('.form-check-label').each(function () {
					const labelText = $(this).text().trim().toLowerCase();

					if (labelText.includes(remarkLower)) {
						isValid = false;
						return false; // break loop
					}
				});

				if (!isValid) {
					 showMessage('error', 'Enter Valid Remark!');
					 return false;
				}
			}
			
			return true;
		}, getConfigurationByConfigurationIdForUpdate : function(configurationId) {
			let jsonObject 					= new Object();
			jsonObject.configurationId  	= configurationId;
			
			if(showAllGroupsOption && !isUpdateDescription)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
				
			jsonObject.isUpdateDescription	= isUpdateDescription;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getConfigurationByConfigurationIdForUpdate.do', _this.setDataForUpdate, EXECUTE_WITH_NEW_ERROR);
		}, setDataForUpdate : function(response) {
			let configuration 		= (response.configuration)[0];
			let value				= configuration.value;
			let selectedArray 		= value == null ? [] : value.split(',');
			let constantValueList	= response.constantValueList;
			let smsTags				= response.smsTags;
			
			$('.update-modal-title').html(configuration.description);
			$(".update-modal-body").empty();
				 
			let formGroup 	= $(".update-modal-body");
			
			if(isRemarkRequired) {
				let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "updateRemarkEle", name: "updateRemarkEle", value : '', maxlength : 199, placeholder : 'Remark'});
				formGroup.append(inputField);
				formGroup.append('<br>');
			}
			
			let label 		= $("<label>").addClass("form-label").attr("for", "input-field").text("Property Value");
			let isCommaSeperated	= configuration.isCommaSeperated;
			
			if(isUpdateDescription) {
				let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "input-field", name: "input-field", value : configuration.description, maxlength : 149});
				formGroup.append(label, inputField);
			} else if (configuration.typeId == TDS_TYPE_ID) {
				if(isCommaSeperated) {
					for (let i = 0; i <= 30 ; i++) {
						_this.createCheckBox(i, null, formGroup, selectedArray);
						
						if(i < 30)
							_this.createCheckBox(i + 0.5, null, formGroup, selectedArray);
					}
				} else {
					for (let i = 0; i <= 30 ; i++) {
						_this.createRadioButton(i, null, formGroup, selectedArray);
						
						if(i < 30)
							_this.createRadioButton(i + 0.5, null, formGroup, selectedArray);
					}
				}
			} else if (configuration.typeId == DATE_TIME) {
				let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "input-field", name: "input-field", value : value, readonly : 'readonly'});
				formGroup.append(label, inputField);
				
				$('#input-field').SingleDatePickerCus('');
				
				if(value != undefined && value != '') {
					$("#input-field").attr('data-startdate', value);
					$("#input-field").attr('data-enddate', value);
					$("#dateEle").val(value);
				}
			} else if(!isCommaSeperated && configuration.typeId > 0) {
				for(let element of constantValueList) {
					if(value > 0 && value == element.valueId)
						formGroup.append($('<input type="radio" name="radio" value="' + element.valueId + '" checked="checked"/> ' + element.valueName + '<br>'));
					else
						formGroup.append($('<input type="radio" name="radio" value="' + element.valueId + '"/> ' + element.valueName + '<br>'));
				}
			} else if(!isCommaSeperated && configuration.typeId == 0) {
				formGroup.append(label);
				
				if(smsTags != undefined) {
					formGroup.append('<textarea id="input-field" class="smsTemplate" rows="4" cols="60" placeholder="Drag variables here...">' + value + ' </textarea>');
					
					setTagsForTemplate(formGroup, smsTags);
				} else
					formGroup.append($("<input>").addClass("form-control").attr({type: "text", id: "input-field", name: "input-field", value : value}));
				
				formGroup.append($("<input>").addClass("form-control").attr({type: "hidden", id: "defaultValue-field", name: "defaultValue-field", value : configuration.defaultValue}));
			} else if(isCommaSeperated && configuration.typeId > 0 && constantValueList != undefined) {
				let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "filter1", name: "", value : '', placeholder : 'Search'});
				formGroup.append(inputField);
				formGroup.append('<br>');
				
				let results1 	= $("<div id='results1'/>");
			
				for(let element of constantValueList)
					_this.createCheckBox(element.valueId, element.valueName, results1, selectedArray);
					
				formGroup.append(results1);
				
				setTimeout(function() {
					$('#filter1').keyup(function() {
						// Retrieve the input field text and reset the count to zero
						filterDivData('results1', $(this).val().toLowerCase(), 'div');
					});
				}, 100);
			} else {
				hideLayer();
				showAlertMessage('info', 'Not available right now, we are working and it will be available soon !');
				return;
			}
			
			hideLayer();
			_this.openBTModel();
		}, openBTModel : function() {
			if(modal1 == null)
				modal1 = new bootstrap.Modal(document.getElementById('staticBackdrop'));
			
			modal1.show();
		}, updateCheckBox : function(configurationId, configurationKey, updatedValue, remarkId) {
			showLayer();
			
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
				
			jsonObject.configurationId		= configurationId;
			jsonObject.name					= configurationKey;
			jsonObject.moduleId				= $('#moduleTypeEle').val();
			jsonObject.subModuleId			= $('#subModuleTypeEle').val();
			jsonObject.remark				= $('#' + remarkId).val();
			
			if(isUpdateDescription) {
				jsonObject.description			= updatedValue;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/configurationWS/updateConfigurationDescriptionById.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
			} else {
				jsonObject.defaultValue			= updatedValue;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/updateAccountGroupConfigurationById.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
			}
		}, setSuccess : function (response) {
			hideLayer();
			
			let configuration	= response.configuration;
			
			if(isUpdateDescription && configuration != undefined)
				$('#description_' + configuration.configurationId).html(configuration.description);
				
			if(!isUpdateDescription && configuration != undefined && configHM != undefined && configHM[configuration.configurationId] != undefined)
				configHM[configuration.configurationId] = configuration.defaultValue;
			
			$('#remarkEle').val('');
			
			if(response.configAccountGroupId != undefined)
				refreshSingleConfiguration(response.configAccountGroupId, $('#moduleTypeEle').val(), 0);
				
			if(modal1 != null) modal1.hide();
			if(addModel != null) addModel.hide();
			
			if(isCheckConfiguration && !isStoreConfiguration)
				_this.getConfigurationData(0, $('#moduleTypeEle').val(), 0);
			
			$('#configurationNameEle').val('');
		}, setSuccessAfterAddConfiguration : function(response) {
			let message	= response.message;
			
			if(message.typeId == MESSAGE_TYPE_ERROR)
				return;
				
			_this.resetConfigurationData();
			refreshMemcacheDefaultConfiguration($('#moduleTypeEle').val());
				
			if(!confirm('Do you want to add another configuration?')) {
				if(addModel != null) addModel.hide();
			}
		}, storeConfiguration : function() {
			showLayer();
			
			let jsonObject 			= new Object();
			
			jsonObject.name				= $('#configurationNameEle').val();
			jsonObject.moduleId			= $('#moduleIdEle').val();
			jsonObject.subModuleId		= $('#subModuleIdEle').val();
			jsonObject.apiSubModuleId	= $('#apiSubModuleIdEle').val();
			jsonObject.serverIdentifier	= serverIdentifier;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/storeConfigurationInDB.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, setModuleIdList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.allModuleList,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'moduleIdEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setSubModuleIdList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.allModuleList,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'subModuleIdEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, createCheckBox : function(value, valueName, formGroup, selectedArray) {
			if(valueName == null) valueName	= value;
			
			let checkbox 			= $("<input>").addClass("form-check-input checkbox-item").attr({ type: "checkbox", id: "checkbox-field-" + value, name: "checkbox-field", value: value, checked : selectedArray.includes(value.toString()) });
			let checkboxLabel 		= $("<label>").addClass("form-check-label").css("padding-right", "10px").attr("for", "checkbox-field-" + value).text(valueName + "  ");
			let checkboxContainer 	= $("<div>").addClass("form-check").css('display', 'inline-block').append(checkbox, checkboxLabel);
			formGroup.append(checkboxContainer);
		}, createRadioButton : function(value, valueName, formGroup, selectedArray) {
			if(valueName == null) valueName	= value;
			
			let checkbox 			= $("<input>").addClass("form-check-input checkbox-item").attr({ type: "radio", id: "checkbox-field-" + value, name: "checkbox-field", value: value, checked : selectedArray.includes(value.toString()) });
			let checkboxLabel 		= $("<label>").addClass("form-check-label").css("padding-right", "10px").attr("for", "checkbox-field-" + value).text(valueName + "  ");
			let checkboxContainer 	= $("<div>").addClass("form-check").css('display', 'inline-block').append(checkbox, checkboxLabel);
			formGroup.append(checkboxContainer);
		}, refreshDefaultConfiguration : function() {
			let moduleId		= $('#moduleTypeEle').val();
			let isModuleSelected= moduleId > 0;
			
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Module !');
				return;
			}
			
			refreshDefaultConfiguration(moduleId, 1);
		}, refreshConfiguration : function() {
			let moduleId		= $('#moduleTypeEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isModuleSelected= moduleId > 0;
			
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
			
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Module !');
				return;
			}
			
			refreshConfiguration(moduleId, accountGroupId, 1);
		}, resetAndHideSelection : function(obj) {
			isCheckConfiguration	= false;
			isUpdateDescription		= false;
			isStoreConfiguration	= false;
			
			$('#searchDiv').removeClass('hide');
			
			if(obj.checked) {
				$('#refreshDiv').addClass('hide');
				
				if(obj.id == 'viewConfiguration') {
					$('#checkConfiguration').prop("checked", false);
					$('#updateDescription').prop("checked", false);
					$('#insertConfiguration').prop("checked", false);
					$('#configurationNameCol').addClass('hide');
					$('#accountGroupSelection').removeClass('hide');
					
					if(isRefreshButton && storeConfig) $('#refreshDiv').removeClass('hide');
				} else if(obj.id == 'insertConfiguration') {
					$('#updateDescription').prop("checked", false);
					$('#checkConfiguration').prop("checked", false);
					$('#viewConfiguration').prop("checked", false);
					$('#configurationNameCol').addClass('hide');
					$('#accountGroupSelection').addClass('hide');
					$('#searchDiv').addClass('hide');
				} else if(obj.id == 'checkConfiguration') {
					$('#updateDescription').prop("checked", false);
					$('#insertConfiguration').prop("checked", false);
					$('#viewConfiguration').prop("checked", false);
					$('#configurationNameCol').removeClass('hide');
					$('#accountGroupSelection').addClass('hide');
					isCheckConfiguration	= true;
				} else {
					$('#insertConfiguration').prop("checked", false);
					$('#checkConfiguration').prop("checked", false);
					$('#viewConfiguration').prop("checked", false);
					$('#configurationNameCol').addClass('hide');
					$('#accountGroupSelection').addClass('hide');
					isUpdateDescription	= true;
				}
			} else {
				$('#configurationNameCol').addClass('hide');
				
				if(showAllGroupsOption) $('#accountGroupSelection').removeClass('hide');
				if(isRefreshButton && storeConfig) $('#refreshDiv').removeClass('hide');
			}
			
			_this.resetAndHideData();
		}, setAutocompleteList : function(moduleList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	moduleList,
				valueField		:	'apiModuleId',
				labelField		:	'apiModuleName',
				searchField		:	'apiModuleName',
				elementId		:	'apiSubModuleIdEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, openAndSetDataForAdd : function(obj) {
			if(!$('#moduleTypeEle').val() > 0) {
				obj.checked	= false;
				showAlertMessage('error', 'Select Module !');
				return;
			}
			
			addModel.show();
		}, addConfiguration : function() {
			let jo	= {};
			
			jo.moduleId			= $('#moduleTypeEle').val();
			jo.subModuleId		= $('#subModuleTypeEle').val();
			jo.name				= $('#configUniqueName').val();
			jo.description		= $('#configDescription').val();
			jo.defaultValue		= $('#configValue').val();
			jo.typeId			= $('#configType').val();
			jo.isVisible		= $('#isVisible').prop('checked');
			jo.isGroupSpecific	= $('#isGroupSpecific').prop('checked');
			jo.isCommaSeperated	= $('#isCommaSeparated').prop('checked');
			
			getJSON(jo, WEB_SERVICE_URL	+ '/configurationWS/insertConfiguration.do', _this.setSuccessAfterAddConfiguration, EXECUTE_WITH_NEW_ERROR);
		}, resetConfigurationData : function() {
			$('#configUniqueName').val('');
			$('#configDescription').val('');
			$('#configValue').val('');
			$('#configType').val(0);
			//$('#isVisible').prop("checked", false);
			//$('#isGroupSpecific').prop("checked", false);
			$('#isCommaSeparated').prop("checked", false);
		}, displayConfigurationToGivenGroups : function(response) {
			let configuration	= response.configuration;
			
			let table 	= $('<table>');
			table.attr('class', 'table table-bordered');
			
			let tr		= $('<tr class = "bg-info">');
			table.append(tr);
			
			tr.append('<td><b>Description</b></td>');
			tr.append('<td><b>Default Value</b></td>');
			tr.append('<td><b>Group Specific</b></td>');
			tr.append('<td><b>Group Name</b></td>');
			tr.append('<td><b>Value</b></td>');
			tr.append('<td><b>History</b></td>');
			
			configuration.forEach(element => {
				let tr		= $('<tr>');
				table.append(tr);
				
				tr.append('<td>' + element.description + '</td>');
				tr.append('<td>' + element.defaultValue + '</td>');
				tr.append('<td>' + element.groupSpecific + '</td>');
				
				if(element.accountGroupId > 0)
					tr.append('<td>' + element.accountGroupName + '(' + element.accountGroupId + ')</td>');
				else
					tr.append('<td></td>');
			
				tr.append('<td>' + element.value + '</td>');
				
				let history = $("<button>");
				
				$(history).click(function() {
					_this.getEditHistoryByConfigurationId(element.configurationId, element.accountGroupId);
				});
				
				history.attr("class", "btn btn-danger btn-sm border-radius40px");
				history.text("History");
				
				let td = $("<td>");				
				td.append(history);				
				tr.append(td);
			});
			
			$('.insideCheckBox').append(table);
		}, getEditHistoryByConfigurationId : function(configurationId, accountGroupId) {
			let jsonObject 					= new Object();
			jsonObject.configurationId  	= configurationId;
			jsonObject.configAccountGroupId	= accountGroupId;
				
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getAccountGroupConfigurationEditLogs.do', _this.setLogData, EXECUTE_WITH_NEW_ERROR);
		}, setLogData : function(response) {
			hideLayer();
			
			if(response.message != undefined)
				return;
			
			let configuration				= response.configuration;
			let editLogsList				= response.editLogsList;
			let configurationEditLogsList	= response.configurationEditLogsList;
			
			$('.update-modal-title').html(configuration.description);
			$(".update-modal-body").empty();
			
			let table 	= $('<table>');
			table.attr('class', 'table table-bordered');
			
			let tr		= $('<tr class = "bg-info">');
			table.append(tr);
			
			tr.append('<td><b>Current Value</b></td>');
			tr.append('<td><b>Previous Value</b></td>');
			tr.append('<td><b>Updated On</b></td>');
			tr.append('<td><b>Updated By</b></td>');
			
			if(editLogsList != undefined) {
				tr.append('<td><b>Operation type</b></td>');
				tr.append('<td><b>Copied From</b></td>');
			} else {
				tr.append('<td><b>Description</b></td>');
				tr.append('<td><b>Previous Descrition</b></td>');
			}
			
			tr.append('<td><b>Remark</b></td>');
			
			if(editLogsList != undefined) {
				editLogsList.forEach(element => {
					let tr		= $('<tr>');
					table.append(tr);
					
					tr.append('<td>' + element.value + '</td>');
					tr.append('<td>' + element.previousValue + '</td>');
					tr.append('<td>' + element.updatedOnStr + '</td>');
					tr.append('<td>' + element.updatedBy + '</td>');
					tr.append('<td>' + element.operationTypeName + '</td>');
					tr.append('<td>' + element.copiedFromGroupName + '</td>');
					tr.append('<td>' + element.remark + '</td>');
				});
			} else {
				configurationEditLogsList.forEach(element => {
					let tr		= $('<tr>');
					table.append(tr);
					
					tr.append('<td>' + element.value + '</td>');
					tr.append('<td>' + element.previousValue + '</td>');
					tr.append('<td>' + element.updatedOnStr + '</td>');
					tr.append('<td>' + element.updatedBy + '</td>');
					tr.append('<td>' + element.description + '</td>');
					tr.append('<td>' + element.previousDescription + '</td>');
					tr.append('<td>' + element.remark + '</td>');
				});
			}
			
			let formGroup 	= $(".update-modal-body");
			
			formGroup.append(table);
			$('.updateButton').addClass('hide');
			_this.openBTModel();
		}, getEditHistoryByModule : function() {
			let moduleId		= $('#moduleTypeEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isModuleSelected= moduleId > 0;
			
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
			
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Module !');
				return;
			}
			
			let jsonObject 					= new Object();
			jsonObject.moduleId  			= moduleId;
			jsonObject.subModuleId		  	= $('#subModuleTypeEle').val();
			
			if(showAllGroupsOption)
				jsonObject.accountGroupId	= accountGroupId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getModuleWiseAccountGroupConfigurationEditLogs.do', _this.setModuleWiseLogData, EXECUTE_WITH_NEW_ERROR);
		}, getEditHistoryByDate : function() {
			let jsonObject 		= new Object();
			
			let dateElement = $('#editLogDateEle');
			
			if(dateElement.attr('data-startdate') != undefined)
				jsonObject["fromDate"] 	= dateElement.attr('data-startdate'); 

			if(dateElement.attr('data-enddate') != undefined)
				jsonObject["toDate"] 	= dateElement.attr('data-enddate'); 
				
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getDateWiseAccountGroupConfigurationEditLogs.do', _this.setModuleWiseLogData, EXECUTE_WITH_NEW_ERROR);
		}, setModuleWiseLogData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#left-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#left-border-boxshadow').removeClass('hide');
			$('#bottom-border-boxshadow').addClass('hide');
			goToPosition('left-border-boxshadow', 200);
			
			setTimeout(function() {
				response.dateWiseSortOrder	= 1;//descending
				SlickGridWrapper.setGrid(response);
			}, 100);
		}, refreshOtherOperations : function() {
			let moduleId		= $('#masterTypeEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isModuleSelected= moduleId > 0;
			
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
			
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Master for Update !');
				return;
			}
			
			refreshCache(moduleId, accountGroupId);
		}, activateDeactivateSMSService : function() {
			if(!confirm('Are you sure?'))
				return;
				
			jsonObject.configurationId = smsConfigurationId;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/configurationWS/activateDeactivateSMSService.do', _this.setSuccessAndReloadPage, EXECUTE_WITH_NEW_ERROR);
		}, setSuccessAndReloadPage : function (response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
				return;
			
			if (response.isActivateSms)
				$('#smsAction').text('Activate SMS (All Group)').removeClass('btn-danger').addClass('btn-success');
			else
				$('#smsAction').text('Deactivate SMS (All Group)').removeClass('btn-success').addClass('btn-danger');
		}, validateInputFields : function(value, defaultValue) {
			if(defaultValue != undefined) {
				if(defaultValue.includes('_')) {
					if(!value.includes('_')) {
						let array	= defaultValue.split('_');
									
						if(array.length == 2) {
							$('#input-field').val('0_0');
							showMessage('error', 'Enter Value in this format 0_0 !');
							changeTextFieldColor('input-field', 'red', '', '');
							return false;
						} else if(array.length == 3) {
							$('#input-field').val('0_0_0');
							showMessage('error', 'Enter Value in this format 0_0_0 !');
							changeTextFieldColor('input-field', 'red', '', '');
							return false;
						}
					}
				} else if(defaultValue != "" && !isNaN(defaultValue) && defaultValue.indexOf('.') > -1) {
					if(isNaN(value) || value.indexOf('.') == -1) {
						$('#input-field').val(0.0);
						showMessage('error', 'Enter Number With Decimal !');
						changeTextFieldColor('input-field', 'red', '', '');
						return false;
					}
				} else  if(!isNaN(parseInt(defaultValue)) && defaultValue.indexOf('.') == -1 && (isNaN(parseInt(value)) || value.indexOf('.') > -1)) {
					showMessage('error', 'Enter Only Number !');
					$('#input-field').val(0);
					changeTextFieldColor('input-field', 'red', '', '');
					return false;
				}
			}
			
			return true;
		}, deleteConfigurationByConfigurationId : function(configurationId, accountGroupId) {
			if(!confirm('Are you sure?'))
				return;
				
			let jsonObject 					= new Object();
			jsonObject.configurationId  	= configurationId;
			jsonObject.configAccountGroupId	= accountGroupId;
				
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/deleteAccountGroupConfiguration.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, viewTodayEntry : function(obj) {
			if(obj.checked)
				getJSON(null, WEB_SERVICE_URL	+ '/configurationWS/viewTodaysConfigurationEntry.do', _this.setTodaysEntryData, EXECUTE_WITH_NEW_ERROR);
		}, setTodaysEntryData : function(response) {
			hideLayer();
						
			if(response.message != undefined)
				return;
			
			let configurationList	= response.configurationList;

			$('.update-modal-title').html("Today's Entry - (" + configurationList.length + ")");
			$(".update-modal-body").empty();
			
			let table 	= $('<table>');
			table.attr('class', 'table table-bordered');
						
			let tr		= $('<tr class = "bg-info">');
			table.append(tr);
			
			tr.append('<td><b>Sr. No.</b></td>');
			tr.append('<td><b>Module Name</b></td>');
			tr.append('<td><b>Name</b></td>');
			tr.append('<td><b>Description</b></td>');
			tr.append('<td><b>Value</b></td>');
			
			let i = 1;
						
			configurationList.forEach(element => {
				let tr		= $('<tr>');
				table.append(tr);
								
				tr.append('<td>' + (i++) + '</td>');
				tr.append('<td>' + element.moduleName + '</td>');
				tr.append('<td>' + element.name + '</td>');
				tr.append('<td>' + element.description + '</td>');
				tr.append('<td>' + element.value + '</td>');
			});
			
			let formGroup 	= $(".update-modal-body");
						
			formGroup.append(table);
			$('.updateButton').addClass('hide');
			_this.openBTModel();
		}, downloadConfiguration : function() {
			let moduleId		= $('#moduleTypeEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isModuleSelected= moduleId > 0;
						
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
						
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Module !');
				return;
			}
						
			let jsonObject 					= new Object();
			jsonObject.moduleId  			= moduleId;
			jsonObject.subModuleId		  	= $('#subModuleTypeEle').val();
			
			if(showAllGroupsOption)
				jsonObject.accountGroupId	= $('#accountGroupEle').val();
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/downlaodGroupConfiguration.do', _this.setResponseForDownload, EXECUTE_WITH_NEW_ERROR);
		}, setResponseForDownload : function(response) {
			hideLayer();
					
			if(response.message.messageId != 409)//excel id
				return;
				
			generateFileToDownload(response);
		}
	});
});
