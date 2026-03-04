define(['marionette'
		,'selectizewrapper'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
		,'messageUtility'
		,'jquerylingua'
		,'language'
		,'nodvalidation'
		,'focusnavigation'
		], function(Marionette, Selectizewrapper, Selection) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	myNod,
	newDataArray = new Array(), configId,
	moduleId, SAID_TO_CONTAIN_IDS = 13, PACKING_TYPE_IDS = 8, EXECUTIVE_IDS = 3,
	previousDataList =	null, accountGroupId = 0, _this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/configurationMappingMasterWS/getConfigurationMappingElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/configurationMappingMaster/configurationMappingMaster.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				_this.setModuleType(response);
				accountGroupId	= response.accountGroupId;
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				addAutocompleteElementInNode1(myNod, 'chargeNameEle', 'Please Select Atleast 1 Name !');
				
				hideLayer();
				
				$("#saveChargesBtn").click(function() {
					_this.onSubmit();								
				});
			});
		}, addNewConfiguration : function(typeId) {
			$('#saveChargesBtn').removeClass('hide');
			$("#middle-border-boxshadow").removeClass("hide");
			
			let bookingChargeSelectize 	= $('#chargeNameEle').get(0).selectize;
			
			let configArray = (bookingChargeSelectize.getValue()).split(',');
			
			for (const element of configArray) {
				let	isDataExist = false;
				let bkgChargeOption 	= bookingChargeSelectize.options[ element ];
				
				let valueName	= bkgChargeOption.valueName;
				let valueId		= bkgChargeOption.valueId;
				
				if(typeId == SAID_TO_CONTAIN_IDS) {
					valueName	= bkgChargeOption.name;
					valueId		= bkgChargeOption.consignmentGoodsId;
				} else if(typeId == PACKING_TYPE_IDS) {
					valueName	= bkgChargeOption.packingGroupTypeName;
					valueId		= bkgChargeOption.packingTypeMasterId;
				} else if(typeId == EXECUTIVE_IDS) {
					valueName	= bkgChargeOption.executiveName;
					valueId		= bkgChargeOption.executiveId;
				}
		
				let temp = _.find(previousDataList, function(value) { 
					return value.valueId == valueId; 
				});
				
				let temp3 = _.find(newDataArray, function(value) { 
					return value.configurationId == valueId; 
				});
				
				if(temp || temp3) {
					showMessage('error', valueName + ' Already Added !');
					$('#saveChargesBtn').addClass('hide');
					isDataExist = true;
				}
				
				if(!isDataExist) {
					let chargesObj 		= new Object();
					chargesObj.configurationId		= valueId;
					chargesObj.configurationName	= valueName;
					newDataArray.push(chargesObj);
				}
			}
			
			$("#currentBookingChargesDiv").removeClass('hide');
			_this.setNewDataForConfiguration();			
			bookingChargeSelectize.setValue(''); 
			$('#chargeNameEle').val('');
		}, setModuleType : function(response) {
			let object	= new Object();
			
			let array	= [];
			
			object.moduleId			= '0';
			object.moduleName		= '--Select--';
			
			array.push(object);
			
			array	= array.concat(response.moduleList);
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	array,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'moduleTypeEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _this.getModuleWiseData
			});
		}, setConfigurationValues : function(allDataList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	allDataList,
				valueField		:	'valueId',
				labelField		:	'valueName',
				searchField		:	'valueName',
				elementId		:	'chargeNameEle',
				create			: 	false,
				maxItems		: 	(allDataList).length
			});
		}, showConfigurationValuePanel : function(previousDataList) {
			if(previousDataList != undefined && previousDataList.length > 0) {
				$("#middle-border-boxshadow").removeClass("hide");
				$("#currentConfigTable").removeClass("hide");
			
				let columnArray		= new Array();
				
				for (let i = 0; i < previousDataList.length; i++) {
					let obj		= previousDataList[i];
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'> <input type='checkbox' name='configValues' class='checkBox' value='" + obj.valueId + "' data-tooltip = '"+ obj.valueName +"' checked></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='chargeNameTd_" + i + "' name='chargeNameTd_" + obj.valueId + "'>" + (obj.valueName) + "</td>");
					$('#previousBookingChargesTable tbody').append('<tr id="mappingDetails_' + obj.valueId + '">' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
				}
				
				$(".checkBox").click(function() {
					$('#saveChargesBtn').removeClass('hide');
				});
				
				$(".checkBox").change(function() {
					$('#saveChargesBtn').removeClass('hide');
				});
				
				hideLayer();
			}
		}, setNewDataForConfiguration : function() {
			$("#removeBookingCharges").empty();
			
			let columnArray		= new Array();
			
			for (let i = 0; i < newDataArray.length; i++) {
				let obj				 		= newDataArray[i];
				let chargeName 				= obj.configurationName;
				let chargeTypeMasterId 		= obj.configurationId;

				columnArray.push("<td id='srNo'>" + (i + 1) + "</td>");
				columnArray.push("<td id='chargeName_" + chargeTypeMasterId + "'>" + chargeName + "</td>");
				columnArray.push("<td style='display:none;'> <input type='checkbox' name='configValues' class='checkBox' value='" + chargeTypeMasterId + "' data-tooltip = '"+ chargeName +"' checked></td>");
				columnArray.push("<td><button type='button' class='btn btn-danger remove' id='removeBookingCharges_" + chargeTypeMasterId + "' data-tooltip='Remove " + chargeName + "'>Remove</button></td>");

				$('#currentBookingChargesTable tbody').append('<tr id="mappingDetails_' + chargeTypeMasterId + '">' + columnArray.join(' ') + '</tr>');
					
				columnArray	= [];
			}
			
			$('.remove').click(function(event) {
				_this.removeBookingCharges((event.target.id).split('_')[1]);
			});
			
			$('#saveChargesBtn').removeClass('hide');
		}, removeBookingCharges : function(chargeTypeMasterId) {
			let row = $('#removeBookingCharges_' + chargeTypeMasterId).closest('tr');
			setTimeout(function() { // Simulating ajax
				let siblings = row.siblings();
				row.remove();
				
				siblings.each(function(index) {
					$(this).children().first().text(index + 1);
				});
			}, 100);
			
			newDataArray = newDataArray.filter(function(el) { return el.configurationId != chargeTypeMasterId; }); 
		}, onSubmit : function() {
			showLayer();
			
			let checkBoxArray	= getAllCheckBoxSelectValue('configValues');
			
			if (confirm("Are you sure to save data?")) {
				let jsonObject	= new Object();
				
				jsonObject.defaultValue			= checkBoxArray.join(',');
				jsonObject.configurationId		= configId; 
				jsonObject.moduleId 			= moduleId;
				
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/accountGroupConfigurationWS/updateAccountGroupConfigurationById.do?', _this.setSuccess, EXECUTE_WITHOUT_ERROR);
			} else {
				hideLayer();
			}
		}, setSuccess : function (response) {
			if(response.message != undefined) {
				hideLayer();
				
				refreshConfiguration(moduleId, accountGroupId, 0);
				
				setTimeout(() => {
					location.reload();
				}, 500);
			}
		}, getModuleWiseData : function() {
			let jsonObject 			= new Object();
			
			moduleId				= $('#moduleTypeEle').val()
			
			jsonObject.moduleId 	= moduleId;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/configurationMappingMasterWS/getModuleWiseConfigurationData.do?', _this.setModuleWiseConfigurationData, EXECUTE_WITHOUT_ERROR);
		}, setModuleWiseConfigurationData : function(data) {
			$("*[data-attribute=configurationName]").removeClass("hide");
			
			let object	= new Object();
			
			let array	= [];
			
			object.typeAndConfigurationIdString	= '0_0';
			object.description					= '--Select--';
			
			array.push(object);
			
			array	= array.concat(data.moduleWiseConfigList);
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: array,
				valueField		: 'typeAndConfigurationIdString',
				labelField		: 'description',
				searchField		: 'description',
				elementId		: 'configurationEle',
				create			: false,
				maxItems		: 1,
				onChange		: _this.getAccountConfigurationData
			});
			
			$("#configData>div.ac_container").width(600);
			$("#configData>div.ac_container_open").width(600);
			$("#configData>div.ac_container").removeClass("ac_container");
			$("#configData>div.ac_container_open").removeClass("ac_container_open");
		}, getAccountConfigurationData : function() {
			let typeAndconfigId	= $('#configurationEle').val();
			
			if(typeAndconfigId == undefined)
				return;
				
			let typeId	= typeAndconfigId.split('_')[0];
			
			if(typeId == "" || typeId == 0) {
				_this.resetAndHideData();
				return;
			}
			
			let jsonObject 				= new Object();
			jsonObject.typeId			= typeId;
			configId 					= typeAndconfigId.split('_')[1];
			jsonObject.configurationId  = configId;
			jsonObject.moduleId			= moduleId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/configurationMappingMasterWS/getAccountGroupConfigurationData.do?', _this.setAccountConfigurationData, EXECUTE_WITHOUT_ERROR);
		}, setAccountConfigurationData : function(response) {
			let configuration	= response.configuration;
			let typeId			= response.typeId;
			
			if(configuration != undefined) {
				$('#addCharge').html('ADD ' + configuration.typeName)
				$('#currentName').html("CURRENT " + configuration.typeName)
				$('#newName').html("NEW " + configuration.typeName)
			}
		
			previousDataList 	= response.previousDataList;
			
			_this.resetAndHideData();
			
			$("*[data-attribute=addCharge]").removeClass("hide")
			$("*[data-attribute=addChargeBtn]").removeClass("hide");
			
			newDataArray 			= new Array();
			
			if(response.allDataList != undefined)
				_this.setConfigurationValues(response.allDataList);
				
			if(typeId == SAID_TO_CONTAIN_IDS) {
				response.saidToContainEle			= 'chargeNameEle';
				response.maxItemsForSaidToContain	= 10;
				Selection.setSaidToContainAutocomplete(response);
			}
			
			if(typeId == PACKING_TYPE_IDS) {
				response.packingTypeEle			= 'chargeNameEle';
				response.maxItemsForPackingType	= 10;
				Selection.setPackingTypeAutocomplete(response);
			}
			
			if(typeId == EXECUTIVE_IDS) {
				executiveElement.packingTypeEle	= 'chargeNameEle';
				response.maxItemsForExecutive	= 10;
				Selection.setExecutiveAutocomplete(response);
			}
				
			_this.showConfigurationValuePanel(previousDataList);
			
			$("#addChargesBtn").click(function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid'))
					_this.addNewConfiguration(typeId);								
			});
			
			hideLayer();
		}, resetAndHideData : function() {
			$("#removeBookingCharges").empty();
			$("#deleteBookingCharges").empty();
			$('#saveChargesBtn').addClass('hide');
			$("*[data-attribute=addCharge]").addClass("hide")
			$("*[data-attribute=addChargeBtn]").addClass("hide");
			$("#middle-border-boxshadow").addClass("hide");
		}
	});
});