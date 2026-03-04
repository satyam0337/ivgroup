define([ 'marionette'
		 ,'selectizewrapper'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		 ,'focusnavigation'
		],
		function(Marionette, Selectizewrapper, Selection, UrlParameter, SlickGridWrapper) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(), showAllGroupsOption=false, serverIdentifier = 0, storeConfig = false, isRefreshButton = false,
	_this = '', modal1 = null, updatedTextValue='', columnConfiguration = {}, columnList = {}, isUpdateDescription = false, configHM = null, reportListForRefresh = null,
	reportConfigurationId = 0;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
		}, render: function() {
			jsonObject.currentExecutiveId 		= UrlParameter.getModuleNameFromParam(MASTERID);
			getJSON(jsonObject, WEB_SERVICE_URL + '/reportConfigurationWS/getConfigurationElement.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/reportConfiguration/ReportConfiguration.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				// all Data in response
				
				showAllGroupsOption	= response.showAllGroupsOption;
				serverIdentifier	= response.serverIdentifier;
				storeConfig			= response.storeConfig;
				reportListForRefresh= response.reportListForRefresh;
				
				if(showAllGroupsOption) {
					response.accountGroupSelection	= showAllGroupsOption;
	
					Selection.setSelectionToGetData(response);
					
					$('#accountGroupSelection').removeClass('hide');
				}
				
				_this.setModuleType(response);
				_this.setPropertyType(response);
				
				modal1 = new bootstrap.Modal(document.getElementById('staticBackdrop'));
				
				$('.cancelButton').click(function() {
					$(".update-modal-body").empty();
					$('.updateButton').removeClass('hide');
				});
				
				$('#find').click(function() {
					_this.getConfigurationForGroup();
				});
				
				if(!storeConfig) {
					$('#middle-border-boxshadow').remove();
					$('#editLogDiv').remove();
				} else {
					$('#middle-border-boxshadow').removeClass('hide');
					$('#editLogDiv').removeClass('hide');
					
					_this.setReportIdList(response);
					
					$('#storeConfig').click(function() {
						_this.storeConfiguration();
					});
					
					$('#storeColumnConfig').click(function() {
						_this.storeColumnConfiguration();
					});
					
					$('#editLogs').click(function() {
						_this.getEditHistoryByReport();
					});
				}
					 	
				$('.updateButton').click(function() {
					let remarkId		= 'updateRemarkEle';
					
					if(!_this.validateRemark(remarkId))
						return;
					
					let	value			= $('#input-field').val();
					let radioValue 		= $('input[name="radio"]:checked').val();
					let	defaultValue	= $('#defaultValue-field').val();
					
					if(value != undefined && value != "undefined") {
						if(!_this.validateInputFields(value, defaultValue))
							return;						
												
						changeTextFieldColor('input-field', 'green', '', '');
						_this.updateCheckBox(reportConfigurationId, value, remarkId);
					} else if(radioValue > 0)
						_this.updateCheckBox(reportConfigurationId, radioValue, remarkId);
					else {
						let selectedCheckboxes = getAllCheckBoxSelectValue('checkbox-field');
						let value				= "0";
						
						if (selectedCheckboxes.length != 0)
							value	= selectedCheckboxes.join(',');
				
						_this.updateCheckBox(reportConfigurationId, value, remarkId);
					}
				});
				
				$('.updateColumnButton').click(function() {
					updatedTextValue	= $('#input-data').val();
					_this.updateColumnCheckBox($('#reportConfigurationId').val(), $('#columnName').val(), updatedTextValue, $(this).data('response'));
					$('#staticColumnBackdrop').modal('hide');
				});
				
				$('.updateSequenceButton').click(function(){
					let sequenceBoxes = $(".sequenceBox");
					let emptySequenceBoxFound 	= false;
					let invalidSequenceBoxFound = false;
				
					sequenceBoxes.each(function() {
						let dataDivs = $(this).find(".data");
				
						if (dataDivs.length === 0) {
							emptySequenceBoxFound = true;
							return false; // Break the loop
						}
					});
				
					sequenceBoxes.each(function() {
						let dataDivs = $(this).find(".data");
					
						if (dataDivs.length > 1) {
							invalidSequenceBoxFound = true;
							return false; // Break the loop
						}
					});
				
					if (invalidSequenceBoxFound) {
						alert("One sequence number can accommodate only one data!");
					} else if (emptySequenceBoxFound) {
						alert("No boxes can be left empty!");
					} else {
						let response = $(this).data('response');
						
						$(".sequenceBox").each(function() {
							let value = $(this).attr('value');
							let id = $(this).attr('id');
						
							for (const element of response.columnList) {
								if (element.reportTableDataConfigurationId == +value) {
									element.sequenceNo = id;
									jsonObject.reportTableDataConfigurationId = value;
									jsonObject.sequenceNo = id;
									getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/updateSequence.do?', function(){}, EXECUTE_WITHOUT_ERROR);
									break;
								}
							}
						});
						
						$('#staticSequenceBackdrop').modal('hide');
					}
				});
				
				$('#refresh').click(function() {
					if(isRefreshButton)
						_this.refreshConfiguration();
				});
				
				$('#filter').keyup(function() {
					// Retrieve the input field text and reset the count to zero
					filterDivData('results', $(this).val().toLowerCase(), 'div');
				});
				
				hideLayer();
			});
		}, setModuleType : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.reportList,
				valueField		:	'reportId',
				labelField		:	'reportName',
				searchField		:	'reportName',
				elementId		:	'moduleTypeEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _this.resetAndHideData
			});
		}, setReportIdList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.allModuleList,
				valueField		:	'reportId',
				labelField		:	'reportName',
				searchField		:	'reportName',
				elementId		:	'moduleIdEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setColumnType : function(response) {
			columnConfiguration		= response.columnConfiguration;
			
			setTimeout(function() {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.columnList,
					valueField		:	'reportTableDataConfigurationId',
					labelField		:	'title',
					searchField		:	'title',
					elementId		:	'columnTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.getColumnPropertiesValue
				});
			}, 200);
		}, setPropertyType : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.propertyTypeList,
				valueField		:	'propertyTypeId',
				labelField		:	'propertyTypeName',
				searchField		:	'propertyTypeName',
				elementId		:	'selectionTypeEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _this.changeOnPropertyType
			});
		}, changeOnPropertyType : function() {
			let propertyType = $('#selectionTypeEle').val();
			
			_this.resetAndHideData();
				
			if(propertyType == 2) {
				$('#find').addClass('hide');
				$('#columnTypeCol').removeClass('hide');
				$('#columnTypeEle').empty();
				_this.getColumnProperties();
			} else {
				$('#columnTypeCol').addClass('hide');
				$('#find').removeClass('hide');
			}
		}, getColumnProperties : function() {
			let accountGroupId	= $('#accountGroupEle').val();
			let reportId		= $('#moduleTypeEle').val();
			
			if(showAllGroupsOption && (accountGroupId == 0 || accountGroupId == undefined || accountGroupId == '')) {
				showMessage('error', 'Select Customer !');
				return;
			}
			
			if(reportId == 0 || reportId == undefined || reportId == '') {
				showMessage('error', 'Select report type !');
				return;
			}
			
			jsonObject.reportId		= reportId;
			jsonObject.configAccountGroupId	= accountGroupId;
			
			showLayer();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getColumnPropertiesForMapping.do?', _this.setColumnType, EXECUTE_WITH_NEW_ERROR);
		}, resetAndHideData : function() {
			$('#bottom-border-boxshadow').addClass('hide');
			$('#left-border-boxshadow').addClass('hide');
			$('.insideCheckBox').empty();
			$('#editLogsDetailsDiv').empty();
			
			let reportId		= $('#moduleTypeEle').val();
			
			if(reportListForRefresh != undefined && isValueExistInArray(reportListForRefresh, reportId)) {
				$('#refreshDiv').removeClass('hide');
				isRefreshButton	= true;
			} else {
				$('#refreshDiv').addClass('hide');
				isRefreshButton	= false;
			}
		}, getConfigurationForGroup : function() {
			_this.resetAndHideData();
			
			let accountGroupId	= $('#accountGroupEle').val();
			let reportId		= $('#moduleTypeEle').val();
						
			if(!_this.validateSelection())
				return;
						
			_this.getConfigurationData(accountGroupId, reportId);
		}, validateSelection : function() {
			let accountGroupId	= $('#accountGroupEle').val();
			let reportId		= $('#moduleTypeEle').val();
			let selectionType	= $('#selectionTypeEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isReportSelected= reportId > 0;
						
			if(showAllGroupsOption && !isGroupSelected && !isUpdateDescription) {
				showAlertMessage('error', 'Select Customer !');
				return false;
			}
						
			if(!isReportSelected) {
				showAlertMessage('error', 'Select report type !');
				return false;
			}
			
			if(selectionType == 0 || selectionType == '' || selectionType == undefined) {
				showAlertMessage('error', 'Select property type !');
				return false;
			}
			
			return true;
		}, getConfigurationData : function(accountGroupId, reportId) {
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= accountGroupId;
				
			jsonObject.reportId 			= reportId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getReportConfigurationForMapping.do?', _this.displayData, EXECUTE_WITH_NEW_ERROR);
		}, displayData : function(response) {
			hideLayer();
			let configuration	= response.configuration;
			configHM			= response.configHM;
			
			$(".insideCheckBox").html("");
			let container = $(".insideCheckBox");
			
			configuration.forEach(element => {
				let div		= $("<div>", {class: "form-check form-switch shadow col"});
				let input	= $("<input>", {class: "form-check-input"})
				let buttons = $("<button>");
				let history = $("<button>");
				let flag	= true;
			
				if(!isUpdateDescription && (element.value == "true" || element.value == "false")) {
					input.attr("type", "checkbox");
					input.prop("checked", element.value == "true");
					flag = false;
				}
				
				let label = $("<label>", {class : "form-check-label", for : "flexSwitchCheckDefault", id : "description_" + element.reportConfigurationId})
					label.text(element.description);
		
				if(flag) {
					$(buttons).click(function() {
						_this.getConfigurationByConfigurationIdForUpdate(element.reportConfigurationId);
					});
		
					buttons.attr("class", "btn btn-primary btn-sm border-radius40px");
					buttons.attr("data-tooltip", element.description);
					buttons.text("Click");
					buttons.css("margin-right", "10px");
					div.css("padding", "inherit");
					div.append(buttons);
				} else {
					$(input).click(function() {
						let value			= 'false';
						let remarkId		= 'remarkEle';
						
						if(configHM != undefined && configHM[element.reportConfigurationId] != undefined)
							value = configHM[element.reportConfigurationId];
						
						if(!_this.validateRemark(remarkId)) {
							input.prop("checked", value == 'true');
							return;
						}
						
						_this.updateCheckBox(element.reportConfigurationId, input.prop('checked') + '', remarkId);
					});
				
					div.append(input);
				}
				
				div.append(label);
				
				if(storeConfig) {
					$(history).click(function() {
						_this.getEditHistoryByConfigurationId(element.reportConfigurationId, $('#accountGroupEle').val());
					});
			
					history.attr("class", "btn btn-danger btn-sm border-radius40px");
					history.text("History");
					if(flag) history.css("margin-right", "10px");
					div.append(history);
				}
				
				$(container).append(div);
			});
			
			$('#bottom-border-boxshadow').removeClass('hide');

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
				$('.form-check-label').each(function() {
					if ($(this).text().trim().toLowerCase().search(new RegExp(remark.trim().toLowerCase(), "i")) >= 0) {
						showMessage('error', 'Enter Valid Remark !');
						return false;
					}
				});
			}
			
			return true;
		}, getConfigurationByConfigurationIdForUpdate : function(reportConfigurationId) {
			let jsonObject 						= new Object();
			jsonObject.reportConfigurationId  	= reportConfigurationId;
			
			if(showAllGroupsOption && !isUpdateDescription)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
				
			jsonObject.isUpdateDescription	= isUpdateDescription;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getReportConfigurationByReportConfigurationIdForUpdate.do', _this.setDataForUpdate, EXECUTE_WITH_NEW_ERROR);
		}, setDataForUpdate : function(response) {
			let configuration 		= response.configuration;
			let selectedArray 		= configuration.value.split(',');
			let constantValueList	= response.constantValueList;
			reportConfigurationId	= configuration.reportConfigurationId;
			
			$('.modal-title').html("<b>Edit</b> " + configuration.description);
			$(".update-modal-body").empty();
				 
			let formGroup 	= $(".update-modal-body");
			
			let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "updateRemarkEle", name: "updateRemarkEle", value : '', maxlength : 199, placeholder : 'Remark'});
			formGroup.append(inputField);
			formGroup.append('<br><br>');
			
			let label 		= $("<label>").addClass("form-label").attr("for", "input-field").text("Property Value");
			let isCommaSeperated	= configuration.isCommaSeparated;
			
			if(isUpdateDescription) {
				let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "input-field", name: "input-field", value : configuration.description, maxlength : 149});
				formGroup.append(label, inputField);
			} else if(!isCommaSeperated && configuration.typeId > 0) {
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
		}, openBTModel : function() {
			modal1.show();
		}, createCheckBox : function(value, valueName, formGroup, selectedArray) {
			if(valueName == null) valueName	= value;
			
			let checkbox 			= $("<input>").addClass("form-check-input checkbox-item").attr({ type: "checkbox", id: "checkbox-field-" + value, name: "checkbox-field", value: value, checked : selectedArray.includes(value.toString()) });
			let checkboxLabel 		= $("<label>").addClass("form-check-label").css("padding-right", "10px").attr("for", "checkbox-field-" + value).text(valueName + "  ");
			let checkboxContainer 	= $("<div>").addClass("form-check").css('display', 'inline-block').append(checkbox, checkboxLabel);
			formGroup.append(checkboxContainer);
			
			//if (selectedArray.includes(value.toString())) 
				//checkbox.prop("checked", true);
		}, updateCheckBox : function(reportConfigurationId, updatedValue, remarkId) {
			let reportId		= $('#moduleTypeEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isReportSelected= reportId > 0;
			
			if(showAllGroupsOption && !isGroupSelected && !isUpdateDescription) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
			
			if(!isReportSelected) {
				showAlertMessage('error', 'Select report type !');
				return;
			}
			
			showLayer();
			
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
				
			jsonObject.reportConfigurationId	= reportConfigurationId;
			jsonObject.reportId					= reportId;
			jsonObject.remark					= $('#' + remarkId).val();
			jsonObject.value					= updatedValue;
			jsonObject.defaultValue				= updatedValue;
			
			if(isUpdateDescription)
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/updateConfigurationDescriptionById.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/updateReportConfigurationById.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, setSuccess : function (response) {
			hideLayer();
			
			let configuration	= response.reportConfiguration;
			
			if(isUpdateDescription && configuration != undefined)
				$('#description_' + configuration.reportConfigurationId).html(configuration.description);
				
			if(!isUpdateDescription && configuration != undefined && configHM != undefined && configHM[configuration.reportConfigurationId] != undefined)
				configHM[configuration.reportConfigurationId] = configuration.value;
				
			$('#remarkEle').val('');
			
			if(modal1 != null) modal1.hide();
		}, storeConfiguration : function() {
			showLayer();
			
			let jsonObject 			= new Object();
			
			jsonObject.reportId			= $('#moduleIdEle').val();
			jsonObject.serverIdentifier	= serverIdentifier;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/storeReportConfigurationInDB.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		/*}, getColumnConfigurationData : function(accountGroupId, reportId, columnId) {
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= accountGroupId;
				
			jsonObject.reportId 			= reportId;
			jsonObject.columnSequenceNo		= columnId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getColumnConfigurationForMapping.do?', _this.displayColumnData, EXECUTE_WITHOUT_ERROR);*/
		}, storeColumnConfiguration : function() {
			showLayer();
			
			let jsonObject 			= new Object();
			
			jsonObject.reportId			= $('#moduleIdEle').val();
			jsonObject.serverIdentifier	= serverIdentifier;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/storeReportColumnConfigurationInDB.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, displayColumnData : function(dataList) {
			hideLayer();	
			//let configuration	= response.columnConfiguration;
			
			$(".insideCheckBox").html("");
			let container = $(".insideCheckBox");
			
			dataList.forEach(element => {
				let div		= $("<div>", {class: "form-check form-switch shadow col"});
				let input	= $("<input>", {class: "form-check-input"})
				let buttons = $("<button>")
				let flag	= false;
			
				if(element.configValue == "true") {
					input.attr("type", "checkbox");
					input.prop("checked", true)
				} else if(element.configValue == "false") {
					input.attr("type", "checkbox");
					input.prop("checked", false);
				} else {
					flag = true;
				}
			
				$(input).click(function() {
					if(input.prop('checked'))
						_this.updateColumnCheckBox(element.reportTableDataConfigurationId, element.configKey, "true", element.configValue);
					else
						_this.updateColumnCheckBox(element.reportTableDataConfigurationId, element.configKey, "false", element.configValue);
				});
			
				$(buttons).click(function() {
					$('#reportConfigurationId').val(element.reportTableDataConfigurationId);
					$('#columnName').val(element.configKey);
					_this.getColumnConfigurationByColumnConfigurationIdForUpdate(element.reportTableDataConfigurationId, element.configKey);
				});
				
				let label = $("<label>", {class:"form-check-label", for:"flexSwitchCheckDefault"})
				label.text(element.title);
		
				if(flag) {
					buttons.attr("class", "btn btn-primary btn-sm border-radius40px");
					buttons.text("Click");
					div.css("padding", "inherit");
					buttons.css("margin-right","10px");
					div.append(buttons);
				} else {
					div.append(input);
				}
				
				div.append(label);
				
				$(container).append(div);
			});
			
			$('#bottom-border-boxshadow').removeClass('hide');

			hideLayer();	
		}, getColumnConfigurationByColumnConfigurationIdForUpdate : function(reportTableDataConfigurationId, columnName) {
			let jsonObject 					= new Object();
			jsonObject.columnConfigurationId  	= reportTableDataConfigurationId;
			jsonObject.columnName				= columnName;
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
		
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getColumnConfigurationByColumnConfigurationIdForUpdate.do', _this.setColumnDataForUpdate, EXECUTE_WITH_NEW_ERROR);
		}, setColumnDataForUpdate : function(response) {
			hideLayer();
			let configuration = response.configuration;
			$('.modal-title').html("<b>Edit</b> " + "<b id='des'>" + response.description + "</b>");
			$(".column-modal-body").empty();
			let formGroup 	= $(".column-modal-body");
			let label 		= $("<label>").addClass("form-label").attr("for", "input-field").text("Property Value");
			let input_value	= configuration;
			let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "input-data", name: "input-field", value : input_value});
				
			formGroup.append(label, inputField);
			
			_this.openColumnBTModel();
			
			$('.updateColumnButton').data('response', response);
		}, openColumnBTModel : function() {
			$('#staticColumnBackdrop').modal('show');
		}, updateColumnCheckBox : function(columnId, des, updatedValue, prevValue) {
			showLayer();
			let jsonObject 					= new Object();
			
			if(showAllGroupsOption)
				jsonObject.configAccountGroupId		= $('#accountGroupEle').val();
				
			jsonObject.reportTableDataConfigurationId	= columnId;
			jsonObject.reportIdentifier		= $('#moduleTypeEle').val();
			jsonObject.columnName			= des;
			jsonObject.updatedValue			= updatedValue;
			jsonObject.prevValue			= prevValue;

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/updateColumnConfigurationById.do', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
		}, setSequenceUpdate : function(response){
			let configuration = response.columnList;
			$('.modal-title').html("<b>Edit Column Sequence</b> ");
			$(".sequence-modal-body").empty();
			
			let formGroup = $(".sequence-modal-body");

			configuration.forEach(element => {
				let configId = element.reportTableDataConfigurationId;
				let sequenceNo = element.sequenceNo;
				let name = element.title;
			
				let containerDiv = $("<div>").addClass("sequenceBox").attr({id:sequenceNo, value:configId});
				let dataDiv = $("<div>").addClass("data").attr({draggable:"true", id:"Config-"+configId}).text(name);
			
				$(document).on("dragstart", ".data", function(event) {
					event.originalEvent.dataTransfer.setData("text", event.target.id);
				});

				$(document).on("dragover", ".data", function(event) {
					event.preventDefault();
				});
				
				$(document).on("dragover", ".sequenceBox", function(event) {
					event.preventDefault();
				});
				
				$(document).on("drop", ".sequenceBox", function(event) {
					event.preventDefault();

					// Get the dragged element ID
					var draggedElementId = event.originalEvent.dataTransfer.getData("text");
					
					// Find the sequenceBox element
					var sequenceBox = event.currentTarget;
					
					// Check if the dragged element is already a child of the sequenceBox
					if ($("#" + draggedElementId).closest(".sequenceBox")[0] !== sequenceBox) {
						// Append the dragged element to the sequenceBox
						$(sequenceBox).append($("#" + draggedElementId));
						$(sequenceBox).attr("value", (draggedElementId.split("-"))[1]);
					}
				});
				
				containerDiv.append(dataDiv);
				formGroup.append(containerDiv);
			});
			
			_this.openSequenceBTModel();
			
			$('.updateSequenceButton').data('response', response);
		}, openSequenceBTModel : function() {
			$('#staticSequenceBackdrop').modal('show');
		}, setSequenceUpdateConfiguration : function(response){
		
		}, getColumnPropertiesValue : function() {
			let columnId		= $('#columnTypeEle').val();
			let dataList		= columnConfiguration[columnId];
			
			if(dataList != undefined)
				_this.displayColumnData(dataList);
		}, getEditHistoryByConfigurationId : function(configurationId, accountGroupId) {
			let jsonObject 					= new Object();
			jsonObject.configurationId  	= configurationId;
			jsonObject.configAccountGroupId	= accountGroupId;
				
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getAccountGroupReportConfigurationEditLogs.do', _this.setLogData, EXECUTE_WITH_NEW_ERROR);
		}, setLogData : function(response) {
			hideLayer();
			
			if(response.message != undefined)
				return;
			
			let configuration				= response.configuration;
			let editLogsList				= response.editLogsList;
			let configurationEditLogsList	= response.configurationEditLogsList;
			
			$('.modal-title').html(configuration.description);
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
		}, getEditHistoryByReport : function() {
			let reportId		= $('#moduleTypeEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			
			if(!_this.validateSelection())
				return;
			
			let jsonObject 					= new Object();
			jsonObject.reportId  			= reportId;
			
			if(showAllGroupsOption)
				jsonObject.accountGroupId	= accountGroupId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/reportConfigurationWS/getReportWiseAccountGroupConfigurationEditLogs.do', _this.setReportWiseLogData, EXECUTE_WITH_NEW_ERROR);
		}, setReportWiseLogData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#left-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#left-border-boxshadow').removeClass('hide');
			$('#bottom-border-boxshadow').addClass('hide');
			
			setTimeout(function() {
				SlickGridWrapper.setGrid(response);
			}, 100);
		}, refreshConfiguration : function() {
			let reportId		= $('#moduleTypeEle').val();
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			let isReportSelected= reportId > 0;
					
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}
					
			if(!isReportSelected) {
				showAlertMessage('error', 'Select Report !');
				return;
			}
					
			refreshReportConfiguration(reportId, accountGroupId, 1);
		}, validateInputFields : function(value, defaultValue) {
			if(defaultValue != undefined) {
				if(defaultValue != "" && !isNaN(defaultValue) && defaultValue.indexOf('.') > -1) {
					if(isNaN(value) || value.indexOf('.') == -1) {
						$('#input-field').val(0.0);
						showMessage('error', 'Enter Number With Decimal !');
						changeTextFieldColor('input-field', 'red', '', '');
						return false;
					}
				} else if(!isNaN(parseInt(defaultValue)) && defaultValue.indexOf('.') == -1 && (isNaN(parseInt(value)) || value.indexOf('.') > -1)) {
					showMessage('error', 'Enter Only Number !');
					$('#input-field').val(0);
					changeTextFieldColor('input-field', 'red', '', '');
					return false;
				} else if(defaultValue.includes('_')) {
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
				}
			}
								
			return true;
		}
	});
});