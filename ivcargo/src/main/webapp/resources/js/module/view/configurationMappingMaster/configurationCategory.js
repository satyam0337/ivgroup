define([ 'marionette'
		 ,'selectizewrapper'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/module/view/configurationMappingMaster/configuration.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		 ,'focusnavigation'
		],
		function(Marionette, Selectizewrapper, Selection, UrlParameter, SlickGridWrapper, Configuration) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(), showAllGroupsOption=false,
	_this = '', modal1 = null, configHM = null, isRemarkRequired = false, moduleId = 0, subModuleId = 0, switchAll = false,
	reportId = 0, subReportId = 0, config = null, configurationCategory = null;
	const TDS_TYPE_ID = 14, DATE_TIME = 23;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			jsonObject.currentExecutiveId 		= UrlParameter.getModuleNameFromParam(MASTERID);
			getJSON(jsonObject, WEB_SERVICE_URL + '/configurationWS/getConfigurationElement.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/configurationMappingMaster/configurationCategory.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				// all Data in response
				
				showAllGroupsOption	= response.showAllGroupsOption;
				isRemarkRequired	= response.isRemarkRequired;
				
				if(showAllGroupsOption) {
					response.accountGroupSelection	= showAllGroupsOption;
					
					$('#accountGroupSelection').removeClass('hide');
					$('#accountGroupEle').on('change', function(e) {
						console.log(e);
						_this.resetAndHideData();
					});
				}
				
				Selection.setSelectionToGetData(response);
				
				config = new Configuration();
				
				_this.setCategoryType();
				
				showAllGroupsOption	= response.showAllGroupsOption;
				
				if(response.deleteConfig) {
					$('#deleteCategory').removeClass('hide');
					
					$('#deleteCategory').click(function() {
						_this.deleteCategory();
					});
					
					$('#updateCategory').click(function() {
						_this.updateCategory();
					});
				} else {
					$('#deleteCategory').remove();
					$('#updateCategory').remove();
				}

				modal1 		= new bootstrap.Modal(document.getElementById('staticBackdrop'));
				
				$('.cancelButton').click(function() {
					$(".update-modal-body").empty();
					$('.updateButton').removeClass('hide');
				});
				
				$('#find').click(function() {
					_this.getConsigurationForGroup();
				});
				
				$('#description').click(function() {
					_this.showCategoryDescription();
				});
				
				$('#updateCategoryName').click(function() {
					_this.updateCategoryName();
				});
				
				$('#submit').click(function() {
					_this.submitDetails();
				});
				
				$('#switchAll').click(function() {
					let isChecked	= this.checked;
					let remarkId	= 'remarkEle';
											
					if(isRemarkRequired && !config.validateRemark(remarkId)) {
						$('#switchAll').prop("checked", !isChecked);
						return;
					}

					if(isChecked)
						$('#switchAllLabel').text('Switch Off');
					else
						$('#switchAllLabel').text('Switch On');
					
					document.querySelectorAll("input[type='checkbox'].checkbox-item1").forEach((chk) => {
						chk.checked = isChecked;
					})
				});
				
				$('#editLogDiv').removeClass('hide');
								
				$('#editLogs').click(function() {
					_this.getEditHistory();
				});

				$('.updateButton').click(function() {
					let remarkId		= 'updateRemarkEle';
					
					if(isRemarkRequired && !config.validateRemark(remarkId))
						return;
							
					let	value			= $('#input-field').val();
					let radioValue		= $('input[name="radio"]:checked').val();
					let	defaultValue	= $('#defaultValue-field').val();
					
					if(value != undefined && value != "undefined") {
						if(!config.validateInputFields(value, defaultValue))
							return;						
						
						changeTextFieldColor('input-field', 'green', '', '');
						_this.updateCheckBox("", value, remarkId);
					} else if(radioValue > 0)
						_this.updateCheckBox("", radioValue, remarkId);
					else {
						let selectedCheckboxes = getAllCheckBoxSelectValue('checkbox-field');
						let value				= "0";
						
						if (selectedCheckboxes.length != 0)
							value	= selectedCheckboxes.join(',');
				
						_this.updateCheckBox("", value, remarkId);
					}
				});
				
				$('#filter').keyup(function() {
					// Retrieve the input field text and reset the count to zero
					filterDivData('results', $(this).val().toLowerCase(), 'div');
				});
				
				if(!isRemarkRequired)
					$('#remarkEle').remove();
				
				hideLayer();
			});
		}, setCategoryType : function() {
			Selectizewrapper.setAutocomplete({
				url				: 	WEB_SERVICE_URL+'/autoCompleteWS/getAllConfigurationCategoryByName.do?',
				valueField		:	'categoryIdWithPriority',
				labelField		:	'name',
				searchField		:	'name',
				elementId		:	'configurationNameEle',
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _this.resetAndHideData
			});
		}, resetAndHideData : function() {
			$('#bottom-border-boxshadow').addClass('hide');
			$('#middle-border-boxshadow').addClass('hide');
			$('.middle-border-boxshadow').addClass('hide');
			$('#left-border-boxshadow').addClass('hide');
			$('#right-border-boxshadow').addClass('hide');
			$('.bottom-border-boxshadow').addClass('hide');
			$('.insideCheckBox').empty();
			$('.insideCheckBox1').empty();
			$('.insideCheckBox2').empty();
			$('#editLogsDetailsDiv').empty();
		}, getConsigurationForGroup : function() {
			let accountGroupId	= $('#accountGroupEle').val();
			let categoryTypeId	= $('#configurationNameEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isModuleSelected= categoryTypeId != "";
			
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
			
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Category !');
				return;
			}
			
			switchAll = false;
			_this.getConfigurationData(accountGroupId, categoryTypeId);
		}, getConfigurationData : function(accountGroupId, categoryTypeId) {
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= accountGroupId;
			
			showLayer();

			let arr	= categoryTypeId.split("_");
			
			if(arr[1] == 1) {//category
				jsonObject.categoryTypeId	= arr[0];
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getGroupConfigurationByCategory.do?', _this.displayData, EXECUTE_WITH_NEW_ERROR);
			} else {//configuration
				jsonObject.configurationId	= arr[0];
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getConfigurationByConfigurationIdForUpdate.do?', _this.displayData, EXECUTE_WITH_NEW_ERROR);
			} 
		}, displayData : function(response) {
			hideLayer();
			$(".insideCheckBox").html("");
			$(".insideCheckBox1").html("");
			$(".insideCheckBox2").html("");
			$('#right-border-boxshadow').addClass('hide');

			if (response.message !== undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				$('.middle-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				return;
			}

			$('#left-border-boxshadow').removeClass('hide');
			
			let configuration				= response.configuration;
			let accountGroupPermission		= response.AccountGroupPermission;
			let accountGroupReportConfig	= response.reportConfiguration;
			configurationCategory			= response.configurationCategory;
			
			configHM					= response.configHM;
			
			if(configuration && configuration.length > 0)
				_this.setModuleWiseConfiguration(configuration, response);
			else
				$('#bottom-border-boxshadow').addClass('hide');

			if (accountGroupPermission && accountGroupPermission.length > 0)
				_this.setPermssionsDetails(accountGroupPermission);
			else
				$('#middle-border-boxshadow').addClass('hide');
				
			if (accountGroupReportConfig && accountGroupReportConfig.length > 0)
				_this.setReportConfigurationDetails(accountGroupReportConfig);
			else
				$('.middle-border-boxshadow').addClass('hide');
			
			if(configuration && configuration.length > 0)
				goToPosition('bottom-border-boxshadow', 200);
			else if (accountGroupPermission && accountGroupPermission.length > 0)
				goToPosition('middle-border-boxshadow', 200);
			else if (accountGroupReportConfig && accountGroupReportConfig.length > 0)
				goToPosition('reportConfigDiv', 200);
			
			$('#switchAll').prop("checked", switchAll);
			
			$('.bottom-border-boxshadow').removeClass('hide');

			hideLayer();
		}, setModuleWiseConfiguration : function(configuration, response) {
			$('#bottom-border-boxshadow').removeClass('hide');
			
			let container = $(".insideCheckBox");

			// Group configuration by moduleName
			let groupedConfig = {};
						
			configuration.forEach(item => {
				let module = item.moduleName || "Others";
							
				if (!groupedConfig[module]) 
					groupedConfig[module] = [];
							
				groupedConfig[module].push(item);
			});

			Object.keys(groupedConfig).forEach(moduleName => {
				container.append(`
					<div style="width: 100%; margin-top: 20px;">
						<strong style="font-size: 18px;">${moduleName}</strong>
					</div>
				`);

				let configRow = $("<div>").css({
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "flex-start",
					width: "100%",
					marginTop: "10px"
				});

				groupedConfig[moduleName].forEach(element => {
					let tile = $("<div>").css({
						width: "280px",
						margin: "10px",
						backgroundColor: "#fff",
						padding: "12px",
						borderRadius: "10px",
						boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center"
					});
					
					let history = $("<button>");
										
					$(history).click(function() {
						config.getEditHistoryByConfigurationId(element.configurationId, $('#accountGroupEle').val());
					});
													
					history.attr("class", "btn btn-sm btn-success border-radius40px");
					history.html('<i class="fa fa-history" aria-hidden="true"></i>');

					let isToggle = (element.value === "true" || element.value === "false");

					if (isToggle) {
						let toggleWrapper = $("<div>", {
							class: "form-check form-switch"
						}).css({
							display: "flex",
							alignItems: "center",
							gap: "10px"
						});

						let toggleId = "switch_" + element.configurationId;

						let toggleInput = $("<input>", {
							type: "checkbox",
							class: "form-check-input checkbox-item1",
							id: toggleId,
							value: element.uniqueKey,
							checked: !response.entryFound ? true : element.value === "true"
						}).css({
							transform: "scale(1.2)"
						});

						let toggleLabel = $("<label>", {
							class: "form-check-label",
							for: toggleId,
							id: "description_" + element.configurationId
						}).text(element.description).css({
							fontSize: "14px"
						});

						toggleInput.click(function() {
							let value = 'false';
							let remarkId = 'remarkEle';

							if (configHM && configHM[element.configurationId] !== undefined)
								value = configHM[element.configurationId];
							
							if (isRemarkRequired && !config.validateRemark(remarkId))
								toggleInput.prop("checked", value === 'true');
						});

						toggleWrapper.append(toggleInput).append(toggleLabel).append(history);
						tile.append(toggleWrapper);
					} else {
						let buttonRow = $("<div>").css({
							display: "flex",
							alignItems: "center",
							gap: "8px"
						});

						let button = $("<button>", {
							class: "btn btn-primary btn-sm",
							text: "Click",
							"data-tooltip": element.description
						}).click(function() {
							$('#configurationId').val(0);
							_this.getConfigurationByConfigurationIdForUpdate(element.configurationId);
						}).css({
							borderRadius: "20px"
						});

						let labelOnly = $("<div>").text(element.description).css({
							fontSize: "14px"
						});

						buttonRow.append(button).append(labelOnly).append(history);
						
						tile.append(buttonRow);
					}
					
					if(element.value == 'true')
						switchAll = true;

					configRow.append(tile);
				});

				container.append(configRow);
			});			
		}, setPermssionsDetails: function(accountGroupPermission) {
			let count	= 0;
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			let container = $(".insideCheckBox1");
			container.html(""); 

			container.css({
				backgroundColor: "#f2e27c",  
				padding: "15px",
				borderRadius: "10px"
			});

			let configRow = $("<div>").css({
				display: "flex",
				flexWrap: "wrap",
				justifyContent: "flex-start",
				width: "100%",
				marginTop: "10px"
			});

			accountGroupPermission.forEach(element => {
				if(element.accountGroupPermissionId > 0 && !element.markForDelete)
					count++;
				
				let tile = $("<div>").css({
					width: "280px",
					margin: "10px",
					backgroundColor: "#ffffff", 
					padding: "12px",
					borderRadius: "10px",
					boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center"
				});

				let toggleWrapper = $("<div>", {
					class: "form-check form-switch"
				}).css({
					display: "flex",
					alignItems: "center",
					gap: "10px"
				});

				let toggleId = "permSwitch_" + element.permissionId;

				let input = $("<input>", {
					type: "checkbox",
					class: "form-check-input checkbox-item1",
					id: toggleId,
					value: element.uniqueKey,
					checked: element.accountGroupPermissionId > 0 && !element.markForDelete
				}).css({
					transform: "scale(1.2)"
				});

				let label = $("<label>", {
					class: "form-check-label",
					for: toggleId,
					id: "description_" + element.permissionId
				}).text(element.displayName).css({
					fontSize: "14px"
				});

				input.click(function() {
					let remarkId = 'remarkEle';
					
					if (isRemarkRequired && !config.validateRemark(remarkId))
						input.prop("checked", element.accountGroupPermissionId > 0 && !element.markForDelete);
				});

				toggleWrapper.append(input).append(label);
				tile.append(toggleWrapper);
				configRow.append(tile);
			});
			
			if(count == accountGroupPermission.length)
				switchAll = true;

			container.append(configRow);
		}, setReportConfigurationDetails: function(accountGroupReportConfig) {
			$('.middle-border-boxshadow').removeClass('hide');

			let container = $(".insideCheckBox2");

			// Group configuration by moduleName
			let groupedConfig = {};
									
			accountGroupReportConfig.forEach(item => {
				let reportName = item.reportName || "Others";
										
				if (!groupedConfig[reportName]) 
					groupedConfig[reportName] = [];
										
				groupedConfig[reportName].push(item);
			});

			Object.keys(groupedConfig).forEach(reportName => {
				container.append(`
					<div style="width: 100%; margin-top: 20px;">
						<strong style="font-size: 18px;">${reportName}</strong>
					</div>
				`);

				let configRow = $("<div>").css({
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "flex-start",
					width: "100%",
					marginTop: "10px"
				});

				groupedConfig[reportName].forEach(element => {
					let tile = $("<div>").css({
						width: "280px",
						margin: "10px",
						backgroundColor: "#fff",
						padding: "12px",
						borderRadius: "10px",
						boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center"
					});

					let isToggle = (element.value === "true" || element.value === "false");

					if (isToggle) {
						let toggleWrapper = $("<div>", {
							class: "form-check form-switch"
						}).css({
							display: "flex",
							alignItems: "center",
							gap: "10px"
						});

						let toggleId = "switch_" + element.reportConfigurationId;

						let toggleInput = $("<input>", {
							type: "checkbox",
							class: "form-check-input checkbox-item1",
							id: toggleId,
							value: element.uniqueKey,
							checked: !response.entryFound ? true : element.value === "true"
						}).css({
							transform: "scale(1.2)"
						});

						let toggleLabel = $("<label>", {
							class: "form-check-label",
							for: toggleId,
							id: "description_" + element.reportConfigurationId
						}).text(element.description).css({
							fontSize: "14px"
						});

						toggleInput.click(function() {
							let value = 'false';
							let remarkId = 'remarkEle';

							if (configHM && configHM[element.reportConfigurationId] !== undefined)
								value = configHM[element.reportConfigurationId];
									
							if (isRemarkRequired && !config.validateRemark(remarkId))
								toggleInput.prop("checked", value === 'true');
						});

						toggleWrapper.append(toggleInput).append(toggleLabel);
						tile.append(toggleWrapper);
					} else {
						let buttonRow = $("<div>").css({
							display: "flex",
							alignItems: "center",
							gap: "8px"
						});

						let button = $("<button>", {
							class: "btn btn-primary btn-sm",
							text: "Click",
							"data-tooltip": element.description
						}).click(function() {
							$('#reportConfigurationId').val(0);
							_this.getReportConfigurationByConfigurationIdForUpdate(element.reportConfigurationId);
						}).css({
							borderRadius: "20px"
						});

						let labelOnly = $("<div>").text(element.description).css({
							fontSize: "14px"
						});

						buttonRow.append(button).append(labelOnly);
									
						tile.append(buttonRow);
					}
								
					if(element.value == 'true')
						switchAll = true;

					configRow.append(tile);
				});

				container.append(configRow);
			});			
		}, getConfigurationByConfigurationIdForUpdate : function(configurationId) {
			let jsonObject 					= new Object();
			jsonObject.configurationId  	= configurationId;
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
				
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getConfigurationByConfigurationIdForUpdate.do', _this.setDataForUpdate, EXECUTE_WITH_NEW_ERROR);
		}, setDataForUpdate : function(response) {
			let configuration 		= (response.configuration)[0];
			let value				= configuration.value;
			let selectedArray 		= value.split(',');
			let constantValueList	= response.constantValueList;
			
			$('#configurationId').val(configuration.configurationId);
			moduleId				= configuration.moduleId;
			subModuleId				= configuration.subModuleId;
			
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
			
			if (configuration.typeId == TDS_TYPE_ID) {
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
			modal1.show();
		}, updateCheckBox : function(configurationKey, updatedValue, remarkId) {
			showLayer();
			
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
			
			if($('#reportConfigurationId').val() > 0) {
				jsonObject.reportConfigurationId= $('#reportConfigurationId').val();
				jsonObject.reportId				= reportId;
				jsonObject.subReportId			= subReportId;
			} else {
				jsonObject.configurationId		= $('#configurationId').val();
				jsonObject.moduleId				= moduleId;
				jsonObject.subModuleId			= subModuleId;
			}
			
			jsonObject.name					= configurationKey;
			jsonObject.remark				= $('#' + remarkId).val();
			jsonObject.defaultValue			= updatedValue;
			
			if($('#reportConfigurationId').val() > 0)
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/updateReportConfigurationById.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/updateAccountGroupConfigurationById.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, setSuccess : function (response) {
			hideLayer();
			
			let configuration	= response.configuration;
			let moduleList		= response.moduleList;
			
			if(configuration != undefined && configHM != undefined && configHM[configuration.configurationId] != undefined)
				configHM[configuration.configurationId] = configuration.defaultValue;
			
			if(moduleList != undefined) {
				for(let moduleId of moduleList)
					refreshConfiguration(moduleId, response.accountGroupId, 0);
			}
			
			$('#remarkEle').val('');
			$('#configurationId').val(0);
			$('#reportConfigurationId').val(0);
				
			if(modal1 != null) modal1.hide();
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
		}, submitDetails : function() {
			let remarkId		= 'remarkEle';
								
			if(isRemarkRequired && !config.validateRemark(remarkId))
				return;
								
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
							
			jsonObject.categoryTypeId				= $('#configurationNameEle').val();
			
			let selectedConfig	= [];
			let selectedPerm	= [];
			let selectedRepo	= [];
			
			$('.insideCheckBox input').each(function() {
				selectedConfig.push($(this).val() + "_" + $(this).prop('checked'));
			})
			
			$('.insideCheckBox1 input').each(function() {
				selectedPerm.push($(this).val() + "_" + $(this).prop('checked'));
			});
			
			$('.insideCheckBox2 input').each(function() {
				selectedRepo.push($(this).val() + "_" + $(this).prop('checked'));
			});
			
			jsonObject.selectedConfig	= selectedConfig.join(',');
			jsonObject.selectedPerm		= selectedPerm.join(',');
			jsonObject.selectedRepo		= selectedRepo.join(',');
			jsonObject.remark			= $('#remarkEle').val();
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/updateConfigurationAndPermissions.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, getEditHistory : function() {
			let categoryTypeId	= $('#configurationNameEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isModuleSelected= categoryTypeId != "";
					
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
					
			if(!isModuleSelected) {
				showAlertMessage('error', 'Select Category !');
				return;
			}
			
			let arr	= categoryTypeId.split("_");
					
			showLayer();

			let jsonObject 					= new Object();

			if(showAllGroupsOption) {
				jsonObject.accountGroupId	= accountGroupId;
				jsonObject.configAccountGroupId	= accountGroupId;
			}
			
			if(arr[1] == 1) {//category
				jsonObject.categoryTypeId	= arr[0];
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getCategoryWiseAccountGroupConfigurationEditLogs.do', _this.setLogData, EXECUTE_WITH_NEW_ERROR);
			} else {
				jsonObject.configurationId	= arr[0];
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/getAccountGroupConfigurationEditLogs.do', _this.setLogData, EXECUTE_WITH_NEW_ERROR);
			}
		}, setLogData : function(response) {
			_this.resetAndHideData();
			hideLayer();
						
			if(response.message != undefined) {
				$('#right-border-boxshadow').addClass('hide');
				return;
			}
						
			$('#right-border-boxshadow').removeClass('hide');
			goToPosition('right-border-boxshadow', 200);
						
			setTimeout(function() {
				response.dateWiseSortOrder	= 1;//descending
				SlickGridWrapper.setGrid(response);
			}, 100);
		}, getReportConfigurationByConfigurationIdForUpdate : function(reportConfigurationId) {
			let jsonObject 						= new Object();
			jsonObject.reportConfigurationId  	= reportConfigurationId;
					
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
						
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getReportConfigurationByReportConfigurationIdForUpdate.do', _this.setReportDataForUpdate, EXECUTE_WITH_NEW_ERROR);
		}, setReportDataForUpdate : function(response) {
			let configuration 		= response.configuration;
			let selectedArray 		= configuration.value.split(',');
			let constantValueList	= response.constantValueList;
			
			$('#reportConfigurationId').val(configuration.reportConfigurationId);
			reportId				= configuration.reportId;
			subReportId				= configuration.subReportId;
					
			$('.modal-title').html("<b>Edit</b> " + configuration.description);
			$(".update-modal-body").empty();
						 
			let formGroup 	= $(".update-modal-body");
					
			let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "updateRemarkEle", name: "updateRemarkEle", value : '', maxlength : 199, placeholder : 'Remark'});
			formGroup.append(inputField);
			formGroup.append('<br><br>');
					
			let label 		= $("<label>").addClass("form-label").attr("for", "input-field").text("Property Value");
			let isCommaSeperated	= configuration.isCommaSeparated;
					
			if(!isCommaSeperated && configuration.typeId > 0) {
				for(let element of constantValueList) {
					if(configuration.value > 0 && configuration.value == element.valueId)
						formGroup.append($('<input type="radio" name="radio" value="' + element.valueId + '" checked="checked"/> ' + element.valueName + '<br>'));
					else
						formGroup.append($('<input type="radio" name="radio" value="' + element.valueId + '"/> ' + element.valueName + '<br>'));
				}
			} else if(!isCommaSeperated && configuration.typeId == 0) {
				let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "input-field", name: "input-field", value : configuration.value});
				formGroup.append(label, inputField);
			} else if(isCommaSeperated && configuration.typeId > 0 && constantValueList != undefined) {
				for(let element of constantValueList)
					_this.createCheckBox(element.valueId, element.valueName, formGroup, selectedArray);
			} else {
				showAlertMessage('info', 'Not available right now, we are working and it will be available soon !');
				return;
			}
					
			_this.openBTModel();
		}, deleteCategory : function() {
			let jsonObject 					= new Object();
							
			jsonObject.categoryTypeId				= categoryTypeId;
						
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/deleteCategoryConfigurationByCategory.do?', _this.responseAfterDelete, EXECUTE_WITH_NEW_ERROR);
		}, responseAfterDelete: function() {
			$('#bottom-border-boxshadow').addClass('hide');
			$('#middle-border-boxshadow').addClass('hide');
			$('.middle-border-boxshadow').addClass('hide');
			$('#left-border-boxshadow').addClass('hide');
			hideLayer();
		}, showCategoryDescription : function() {
			if(configurationCategory == undefined || configurationCategory.description == undefined) {
				showAlertMessage('info', 'Not available right now, we are working and it will be available soon !');
				return;
			}
			
			$(".update-modal-body").empty();
			$('.updateButton').removeClass('hide');
			$('.update-modal-title').html(configurationCategory.name);
			$('.update-modal-body').html(configurationCategory.description);
			_this.openBTModel();
		}
	});
});
