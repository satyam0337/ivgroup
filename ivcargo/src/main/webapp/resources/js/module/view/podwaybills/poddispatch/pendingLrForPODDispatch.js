define([
	'slickGridWrapper3'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/podwaybills/poddispatch/poddispatchdetails.js'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'constant'
	], function (slickGridWrapper3, PODDispatchDetails) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	columnHeaderJsonArr,
	langKeySet,
	selectedGridObject,
	viewObject,
	gridObejct,
	btModal,
	isPodUploadRequired,
	jsonObject = new Object();
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			btModal				= jsonObjectData.btModal;
			
			jsonObject['searchByDate']	= jsonObjectData.searchByDate;
			jsonObject["fromDate"] 		= jsonObjectData.fromDate; 
			jsonObject["toDate"] 		= jsonObjectData.toDate; 
		}, render: function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/podDispatchWS/getPodDetailsForDispatchByBranchId.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				btModal.close();
				return;
			}
			
			hideAllMessages();

			if(response.CorporateAccount != undefined) {
				columnHeaderJsonArr = response.columnConfiguration;
				langKeySet			= response.Language;
				isPodUploadRequired = response.isPodUploadRequired;
				let tableProperties		= response.tableProperties;
	
				setTimeout(function() {
					slickGridWrapper3.applyGrid(
						{
							ColumnHead			: _.values(columnHeaderJsonArr), // *compulsory // for table headers
							ColumnData			: _.values(response.CorporateAccount), 	// *compulsory // for table's data
							Language			: langKeySet, 			// *compulsory for table's header row language
							tableProperties		: tableProperties,
							DivId				: tableProperties.divId,				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId		: tableProperties.gridDataId,		//	*compulsary field // unique Key for id to be set in slickgrid table
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo	: tableProperties.showSerialNumber,
								SearchFilter	: false,          // for search filter on serial no
								ListFilter		: false,		// for list filter on serial no
								title 			: "SR No."
							}],
							NoVerticalScrollBar			:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							//FetchDataButtonId : '.ok',//Add button in modal pop-up
							ShowCheckBox 				: 	tableProperties.showCheckBox,
							CallBackFunctionToFetchData : 	_this.getDataFromGrid,
							EditableColumn				: 	false,
							RemoveSelectAllCheckBox		:	tableProperties.removeSelectAllCheckBox
						});
					}, 500);
			}
			
			hideLayer();
			
			$("#dispatchBtn")
				.off("click") // remove any existing handlers
				.on("click", function() {
					_this.submitDataFromGrid();
			});

			
			btModal.on('ok', function() {
				var selectedVal = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'popupData'});
				_this.getDataFromGrid(selectedVal);
			});
		}, lrNumberAppend : function(pendingDispatchobj) {
			columnHeaderJsonArr 		= pendingDispatchobj.ColumnHead;
			langKeySet 					= pendingDispatchobj.Language;

			$('#singleLREle').focus();
			
			if (pendingDispatchobj.count == 1) {
				$("#dispatchBtn")
					.off("click") // remove any previous handlers
					.on("click", function() {
						_this.submitDataFromGrid();
					});
			}

			
			return _this.getDataFromGrid(pendingDispatchobj.data);
		}, getDataFromGrid : function(dataObject) {
			if(dataObject.length > 0) {
				changeDisplayProperty('middle-border-boxshadow', 'block');
				changeDisplayProperty('bottom-border-boxshadow', 'block');

				_this.showDispatchButton();
				selectedGridObject = slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'popupData'});
				
				if(isPodUploadRequired && selectedGridObject != undefined) {
					let dataView 	= selectedGridObject.getData();
					let slickData 	= dataView.getItems();

					if(!_this.checkIfPodUploadRequired(dataObject))
						return false;
				}
				
				if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'podDispatchDiv'}, dataObject, 'wayBillId')) {
					showMessage('error','LR already added.');
					return false;
				}

				slickGridWrapper3.applyGrid(
						{
							ColumnHead						:	_.values(columnHeaderJsonArr), // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	langKeySet, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'podDispatchDiv',
							SerialNo						:[{					// optional field // for showing Row number
								showSerialNo	:	false,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							NoVerticalScrollBar				:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							FetchAllDataButtonId 			: 	'#dispatchBtn',
							ShowDeleteButton 				: 	true,
							DataVieObject					:	viewObject,
							DataGridObject					:	gridObejct,
							PersistGridToAppend				:	true,
						});
			}	
		}, showDispatchButton : function() {
			$( ".pendingPODContent").removeClass('hide');
			$( "#dispatchBtn").removeClass('hide');
		}, submitDataFromGrid : function() {
			selectedGridObject = slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'podDispatchDiv'});
			
			if(selectedGridObject != undefined) {
				var object 		= new Object();
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
				
				if(slickData.length <= 0) {
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}

				object.slickData = dataView.getItems();

				var btModal = new Backbone.BootstrapModal({
					content		: 	new PODDispatchDetails(object),
					modalWidth 	: 	80,
					title		:	'Dispatch Information',
					okText		:	'Dispatch',
					showFooter 	: 	true,
					okCloses	:	false,
					focusOk		:	false
				}).open();
			}
		}, checkIfPodUploadRequired: function(slickData) {
			const found = slickData.find(element => {
				return !element.poduploaded;
			});
			
			if(found) {
				showMessage('error', podUploadedRequiredForDispatch(found.wayBillNumber, found.deliveryDateString));
				return false;
			}
			
			return true;
		}
	});
});