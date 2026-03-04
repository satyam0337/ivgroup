define([ PROJECT_IVUIRESOURCES+'/resources/js/dummyls/dummylsfilepath.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/dummyls/loaddummylsurls.js'
	,'language'
	,'slickGridWrapper'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'], function (FilePath, ModelUrls, Language, slickGridWrapper, errorshow, JsonUtility, MessageUtility, ElementModel, Elementtemplateutils) {
	var 
	_this = '',
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	LangKeySet,
	columnHeaderArr,
	allGridObject,
	selectedGridObject,
	viewObject,
	gridObejct,
	grid,
	gridWithoutBill,
	btModal,
	response
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this = this;

			response 		= jsonObjectData.response;
			btModal			= jsonObjectData.btModal;
			grid 			= jsonObjectData.grid;
			gridWithoutBill	= jsonObjectData.gridWithoutBill;
		},
		render: function(){
			showLayer();
			_this.setElements(response)
		},setElements : function(response){
			var langObj 							= FilePath.loadLanguage();
			LangKeySet 								= loadLanguageWithParams(langObj);
			columnHeaderArr 						= ModelUrls.elementCollection(response.configuration.htData);
			filterConfiguration["searchFilterList"]	= response.configuration.htData.searchFilterTypeConfiguration.htData;
			filterConfiguration["listFilterList"]	= response.configuration.htData.listFilterTypeConfiguration.htData;
			columnHiddenConfiguration 				= response.configuration.htData.byDefaultColumnHiddenConfiguration;

			columnHeaderJsonArr = [];

			var eleArr = columnHeaderArr;

			for  (var j = 0; j < eleArr.length; j++) {
				columnHeaderJsonArr.push(new ElementModel(JSON.parse(eleArr[j])).toJSON());
			}
			setTimeout(function(){
				allGridObject = slickGridWrapper.applyGrid(
						{
							ColumnHead			:	columnHeaderJsonArr,
							ColumnData			:	response.wayBill,
							Language			:	LangKeySet,
							DivId				:	'modalBody',
							InnerSlickId		:	'mySlickGrid',
							SerialNo			:[{showSerialNo : true,SearchFilter : false,ListFilter : false}],
							ColumnHiddenConfiguration	:	columnHiddenConfiguration,
							AllowFilter					:	filterConfiguration,
							NoVerticalScrollBar			:	false,
							ShowCheckBox 				: 	true,
							CallBackFunctionToFetchData : 	_this.getDataFromGrid,
							EditableColumn				: 	false
						});
				hideLayer();
				btModal.on('ok', function() {
					var selectedVal = slickGridWrapper.getValueForSelectedData(allGridObject);
					_this.getDataFromGrid(selectedVal);
				});
				btModal.on('close cancel', function() {
					if(selectedGridObject != undefined){
						slickGridWrapper.applyGrid({
							UpdateGrid 					: 	selectedGridObject,
							ColumnHead					:	columnHeaderJsonArr,
							Language					:	LangKeySet,
							ColumnHiddenConfiguration	:	columnHiddenConfiguration,
							AllowFilter					:	filterConfiguration,
							EditRowsInSlick 			: 	true,
						})
					}
				})
			},500)
		},getDataFromGrid:function(dataObject){
			var  dataView;
			var options = {
					enableCellNavigation: true,
					enableColumnReorder: false
			};
			if (typeof appendgrid == 'undefined') {
				appendgrid = slickGridWrapper.applyGrid(
						{
							ColumnHead			:	columnHeaderJsonArr,
							ColumnData			:	dataObject,
							Language			:	LangKeySet,
							DivId				:	'slickGridDataWithoutBill',
							InnerSlickId		:	'mySlickGrid2',
							SerialNo			:[{showSerialNo : true,SearchFilter : false,ListFilter : false}],
							ColumnHiddenConfiguration	:	columnHiddenConfiguration,
							AllowFilter					:	filterConfiguration,
							NoVerticalScrollBar			:	false,
							EditableColumn				: 	false,
							DataViewObjectCallBackFunction 	: 	_this.getDataViewObjectCallBackFunction,
						});
			} else {
				if (!slickGridWrapper.checkToAddRowInTable(viewObject,dataObject,'wayBillId')) {
					showMessage('error','LR already added.');
					return false;
				}
				appendgrid = slickGridWrapper.applyGrid(
						{
							ColumnHead						:	columnHeaderJsonArr,
							ColumnData						:	dataObject,
							Language						:	LangKeySet,
							DivId							:	'slickGridDataWithoutBill',
							InnerSlickId					:	'mySlickGrid2',
							SerialNo						:[{showSerialNo : true,SearchFilter : false,ListFilter : false}],
							ColumnHiddenConfiguration		:	columnHiddenConfiguration,
							AllowFilter						:	filterConfiguration,
							NoVerticalScrollBar				:	false,
							EditableColumn					: 	false,
							DataVieObject					:	appendgrid.getData(),
							DataGridObject					:	appendgrid,
							DataViewObjectCallBackFunction 	: 	_this.getDataViewObjectCallBackFunction,
							EditRowsInSlick 				: 	true
						});
			}
			_this1.updateSummary();
			_this.appendValueInPrintObject(dataObject);
		},getDataViewObjectCallBackFunction:function(dataViewObject,grid){
			viewObject = dataViewObject;
			gridObejct = grid;
		},appendValueInPrintObject(object) {
			for (var i=0; i<object.length; i++) {
				var summaryObject;
				var wayBillArray;
				var dummyObject = new Object();
				dummyWayBillIdArray.push(object[i].dummyWayBillId);
				if (object[i].wayBillSourceBranchId in dispatchPrintData.dispatchLRSummary) {
					summaryObject	= dispatchPrintData.dispatchLRSummary[object[i].wayBillSourceBranchId];
				} else {
					summaryObject	= new Object();
					var headerObject	= new Object();
					headerObject.branchName								= object[i].wayBillSourceBranchName;
					headerObject.branchDisplayName						= object[i].wayBillSourceBranchName;
					headerObject.branchAddress							= object[i].wayBillSourceBranchAddress;
					headerObject.branchPhoneNumber						= object[i].wayBillSourceBranchPhoneNumber;
					headerObject.accountGroupName						= object[i].wayBillAccountGroupIdentifierString;
					headerObject.branchContactDetailContactPersonName	= object[i].wayBillSourceBranchContactPerson;
					headerObject.branchContactDetailMobileNumber		= object[i].wayBillSourceBranchMobileNumber;
					headerObject.branchContactDetailPhoneNumber			= object[i].wayBillSourceBranchPhoneNumber;
					headerObject.accountGroupId							= object[i].wayBillAccountGroupId;
					var headKey		= Object.keys(dispatchPrintData.dispatchLSHeader);
					var headObject	= dispatchPrintData.dispatchLSHeader[headKey[0]];
					var formArray	= new Array();
					dispatchPrintData.dispatchLSHeader[object[i].wayBillSourceBranchId]			= headObject;
					dispatchPrintData.PrintHeaderModel[object[i].wayBillSourceBranchId]			= headerObject;
					dispatchPrintData.dispatchLSLRFormSummary[object[i].wayBillSourceBranchId]	= formArray;
				}
				if (object[i].wayBillDestinationBranchId in summaryObject) {
					wayBillArray = summaryObject[object[i].wayBillDestinationBranchId];
				} else {
					wayBillArray	= new Array();
				}
				dummyObject.quantity 						= object[i].wayBillNoOfPkgs;
				dummyObject.wayBillActualWeight				= object[i].wayBillActualWeight;
				dummyObject.wayBillArticleQuantity 			= object[i].wayBillNoOfPkgs;
				dummyObject.wayBillConsigneeName 			= object[i].wayBillConsigneeName;
				dummyObject.wayBillConsignorName 			= object[i].wayBillConsignorName;
				dummyObject.wayBillDestinationBranchId		= object[i].wayBillDestinationBranchId;
				dummyObject.wayBillDestinationBranchName	= object[i].wayBillDestinationBranchName;
				dummyObject.wayBillGrandTotal				= object[i].wayBillGrandTotal;
				dummyObject.packingTypeString				= "";
				dummyObject.wayBillNumber					= object[i].wayBillNumber;
				dummyObject.wayBillSourceBranchId			= object[i].wayBillSourceBranchId;
				dummyObject.wayBillSourceBranchName			= object[i].wayBillSourceBranchName;
				dummyObject.wayBillSourceBranchCode			= object[i].wayBillSourceBranchCode;
				dummyObject.wayBillType						= object[i].wayBillType;
				dummyObject.wayBillTypeId					= object[i].wayBillTypeId;
				dummyObject.wayBillId						= object[i].wayBillId;
				dummyObject.privateMark						= object[i].privateMark;
				dummyObject.amountShow						= true;
				wayBillArray.push(dummyObject);
				summaryObject[object[i].wayBillDestinationBranchId]	= wayBillArray;
				dispatchPrintData.dispatchLRSummary[dummyObject.wayBillSourceBranchId] = summaryObject;
				var chargeObject							= new Object();
				chargeObject.wayBillId						= object[i].wayBillId;
				chargeObject.wayBillAmount					= object[i].wayBillGrandTotal;
				chargeObject.wayBillType					= object[i].wayBillType;
				chargeObject.wayBillTypeId					= object[i].wayBillTypeId;
				chargeObject.wayBillChargeMasterId			= 1;
				chargeObject.wayBillFreightAmount			= object[i].wayBillGrandTotal;
				chargeObject.accountGroupId					= 0;
				chargeObject.bLHPVId						= 0;
				chargeObject.chargeAmount					= 0;
				chargeObject.dispatchLedgerId				= object[i].dispatchLedgerId;
				chargeObject.identifier						= 0;
				chargeObject.lhpvChargeTypeMasterId			= 0;
				chargeObject.lhpvId							= 0;
				chargeObject.lhpvSettlementChargesId		= 0;
				chargeObject.markForDelete					= false;
				chargeObject.wayBillCarrierRiskAmount		= 0;
				chargeObject.wayBillCollectionAmount		= 0;
				chargeObject.wayBillDoorCollectionAmount	= 0;
				chargeObject.wayBillDoorDeliveryAmount		= 0;
				chargeObject.wayBillFOVAmount				= 0;
				chargeObject.wayBillLoadingAmount			= 0;
				chargeObject.wayBillOtherAmount				= 0;
				chargeObject.wayBillOtherBookingAmount		= 0;
				chargeObject.wayBillReceiptAmount			= 0;
				chargeObject.wayBillServiceTaxAmount		= 0;
				chargeObject.wayBillSmsAmount				= 0;
				chargeObject.wayBillStationaryAmount		= 0;
				chargeObject.wayBillTollAmount				= 0;
				chargeObject.wayBillVasuliAmount			= object[i].wayBillGrandTotal;
				var chargeArray		= new Array();
				chargeArray.push(chargeObject)
				dispatchPrintData.dispatchLSLRCharge[object[i].wayBillId]	= chargeArray;
			}
		}
	});
});

