define([
		 PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorDeliveryMemo/doorDeliveryMemoFilePath.js'
        ,'slickGridWrapper3'
        ,'elementmodel'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorDeliveryMemo/doorDeliveryDetails.js'
        ,'language'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'elementTemplateJs'
        ,'constant'
        ], function (FilePath, slickGridWrapper, ElementModel, DDMDetails) {
	'use strict';
	let _this = '',
	columnHeaderJsonArr,
	LangKeySet,
	selectedGridObject,
	btModal,
	jsonObject,
	chargeTypeModel
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData){
			_this = this;
			jsonObject 	= jsonObjectData.data;
			btModal		= jsonObjectData.btModal;
		}, render : function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/deliveryRunsheetWS/getWaybilDetailsByBranchIdsAndDeliveryToForPendingDoorDelivery.do', _this.openModelToSelectDDMWayBills, EXECUTE_WITH_ERROR);
		}, openModelToSelectDDMWayBills : function(response){
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}

			_this.setConfigurationForSlickGridTable(response);
			
			slickGridWrapper.applyGrid({
					ColumnHead			:	columnHeaderJsonArr,
					ColumnData			:	response.pendingLRColl,
					Language			:	LangKeySet,
					DivId				:	'modalBody',
					InnerSlickId		:	'popupData',
					SerialNo			:[{
						showSerialNo	:	true,
						SearchFilter	:	false,
						ListFilter		:	false
					}],
					NoVerticalScrollBar			:	false,
					ShowCheckBox 				: 	true,
					CallBackFunctionToFetchData : 	_this.getDataFromGrid,
					EditableColumn				: 	false,
			});
			hideLayer();
			btModal.on('ok', function() {
				var selectedVal = slickGridWrapper.getValueForSelectedData({InnerSlickId : 'popupData'});
				_this.getDataFromGrid(selectedVal);
				
				$("#createDDMBtn").click(function() {
					_this.onSubmitDataFromGrid();
				});
			});
		}, getDataFromGrid : function(dataObject) {
			$('#singleLRSearchEle').val('');
			$("#bottom-border-boxshadow").removeClass('hide');
			$("#createDDMBtn").removeClass('hide');
			
			selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(dataObject.length > 0) {
				if(slickGridWrapper.checkToAddRowInTable({InnerSlickId : 'data'},dataObject,'wayBillId')){
					showMessage('error', '<i class="fa fa-info-circle"></i> LR Number present which you are trying to append !');
					hideLayer();
					return false;
				}
			
				var dataViewObject;
			
				if(selectedGridObject != undefined)
					dataViewObject = selectedGridObject.getData();
			
				selectedGridObject = slickGridWrapper.applyGrid({
							ColumnHead					:	columnHeaderJsonArr,
							ColumnData					:	dataObject,
							Language					:	LangKeySet,
							DivId						:	'myGrid',
							InnerSlickId				:	'data',
							SerialNo:[{
								showSerialNo			:	true,
								SearchFilter			:	false,
								ListFilter				:	false
							}],
							NoVerticalScrollBar			:	false,
							FetchAllDataButtonId		:	'#createDDMBtn',
							ShowDeleteButton			:	true,
							EditRowsInSlick				:	true,
							DataVieObject				:	dataViewObject,
							DataGridObject				:	selectedGridObject,
							PersistGridToAppend			:	true
						});
				hideLayer();
			}
		}, onSubmitDataFromGrid : function() {
			selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(selectedGridObject != undefined){
				let dataView 	= selectedGridObject.getData();
				let slickData 	= dataView.getItems();
			
				if(slickData.length <= 0) {
					showMessage('error', '<i class="fa fa-info-circle"></i> Please provide atleaset One LR to Door Deliver');
					return false;
				}
			}

			var jsonArr = new Array();
			
			for(var key in slickData) {
				jsonArr.push({wayBillId:slickData[key]['wayBillId'],wayBillRemark:slickData[key]['wayBillRemark']})
			}
			
			if(jsonArr.length <= 0) {
				showMessage('error', '<i class="fa fa-info-circle"></i> Provide atleast one LR to Door Deliver !');
				return false;
			}
			
			DDMDetails.setChargeTypeModelList(chargeTypeModel);
			DDMDetails.setLorryHireDetails({data:dataView})
		}, searchLRByNumber : function() {
			let jsonObject = new Object();
			jsonObject.wayBillNumber = $('#singleLRSearchEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/deliveryRunsheetWS/getWaybilDetailsByWaybillNumberForDoorDelivery.do', _this.processSingleLRResponse, EXECUTE_WITH_ERROR)
		}, processSingleLRResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			$("#createDDMBtn").click(function() {
				_this.onSubmitDataFromGrid();
			});
			
			$("#singleLRSearchEle").val("");
			$("#bottom-border-boxshadow").removeClass('hide');
			
			selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if (selectedGridObject == undefined)
				_this.setConfigurationForSlickGridTable(response);
			
			_this.getDataFromGrid(response.pendingLRColl);
		}, setConfigurationForSlickGridTable : function(response) {
			var langObj 							= FilePath.loadLanguage();
			LangKeySet 								= loadLanguageWithParams(langObj);
			
			columnHeaderJsonArr		= _.values(response.columnConfiguration);

			if (response.ddmConfiguration.htData.chargeTypeModel != undefined) {
				chargeTypeModel	= response.ddmConfiguration.htData.chargeTypeModel;
				
				for (var i = 0; i < chargeTypeModel.length; i++) {
					let chargeObject	= new Object();
					chargeObject.title	= chargeTypeModel[i].chargeTypeMasterName;
					chargeObject.elementConfigKey	= "charge_" + chargeTypeModel[i].chargeTypeMasterId;
					chargeObject.dataDtoKey		= "charge_" + chargeTypeModel[i].chargeTypeMasterId;
					chargeObject.columnPrintWidthInPercentage	= '18';
					chargeObject.columnWidth			= 100;
					chargeObject.columnMinWidth			= 60;
					chargeObject.dataType				= 'input';
					chargeObject.buttonCss 				= 'inputElementForSlick form-control';
					columnHeaderJsonArr.push(new ElementModel(JSON.parse(JSON.stringify(chargeObject))).toJSON());
				}
			}
		}
	});
});

