/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper3'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	], function (slickGridWrapper3) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	columnHeaderJsonArr,
	selectedGridObject,
	viewObject,
	gridObejct,
	btModal,
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
			selectedGridObject 	= jsonObjectData.gridObj;
		},
		render: function(){
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyAgentCommissionModuleWS/getPartyAgentCommissionDetailsByWayBillNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		},setData : function(response) {
			hideAllMessages();

			columnHeaderJsonArr = response.columnConfigurationList;

			let language	= {};
			language.removeheader = 'Remove';
				
			if(response.CorporateAccount != undefined) {
				slickGridWrapper3.applyGrid(
						{
							ColumnHead			:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData			:	_.values(response.CorporateAccount), 	// *compulsory // for table's data
							Language			:	language, 			// *compulsory for table's header row language
							DivId				:	'modalBody',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId		:	'popupData',		//	*compulsary field // unique Key for id to be set in slickgrid table
							SerialNo			:[{					// optional field // for showing Row number
								showSerialNo	:	false,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							NoVerticalScrollBar			:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							//FetchDataButtonId : '.ok',//Add button in modal pop-up
							ShowCheckBox 				: 	true,
							CallBackFunctionToFetchData : 	_this.getDataFromGrid,
							EditableColumn				: 	false,
							RemoveSelectAllCheckBox		:	false
						});
			}
			hideLayer();
			$( "#dispatchBtn" ).click(function() {
				_this.submitDataFromGrid();
			});
			btModal.on('ok', function() {
				var selectedVal = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'popupData'});
				_this.getDataFromGrid(selectedVal);
			});
		},lrNumberAppend:function(pendingDispatchobj){
			columnHeaderJsonArr 		= pendingDispatchobj.ColumnHead;

			$('#singleLREle').focus();
			
			if(pendingDispatchobj.count == 1) {
				$( "#dispatchBtn" ).click(function() {
					_this.submitDataFromGrid();
				});
			}
			
			return _this.getDataFromGrid(pendingDispatchobj.data);
		},getDataFromGrid:function(dataObject){
			if(dataObject.length > 0) {
				changeDisplayProperty('middle-border-boxshadow', 'block');
				changeDisplayProperty('bottom-border-boxshadow', 'block');

				_this.showDispatchButton();

				if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'partyAgentCommissionDiv'},dataObject,'wayBillId')){
					showMessage('error','LR already added.');
					return false;
				}
				
				let language	= {};
				language.removeheader = 'Remove';

				slickGridWrapper3.applyGrid(
						{
							ColumnHead						:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	language, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'partyAgentCommissionDiv',
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
		},showDispatchButton:function(){
			$( ".pendingPODContent").removeClass('hide');
			$( "#dispatchBtn").removeClass('hide');
		},submitDataFromGrid:function(){
			
			selectedGridObject = slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'partyAgentCommissionDiv'});
			
			if(selectedGridObject != undefined) {
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
				
				if(slickData.length <= 0 ){
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}

				var finalJsonObj = new Object();

				finalJsonObj["partyAgentCommisionId"] 	= $('#partyAgentCommisionEle_primary_key').val();
				finalJsonObj.lrArray  			= JSON.stringify(dataView.getItems());

				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Save ?",
					modalWidth 	: 	30,
					title		:	'Party Agent Commission',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					showLayer();
					getJSON(finalJsonObj, WEB_SERVICE_URL+'/partyAgentCommissionModuleWS/validateAndSavePartyAgentCommissionDetails.do', _this.onCommissionSave, EXECUTE_WITH_ERROR); //submit JSON
				});
			}
		}, onCommissionSave : function(response) {
			if(response.message != undefined){
				hideLayer();
				return;
			}

			hideLayer();
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=partyAgentCommision&masterid='+response.agentCommisionSummaryId+'&masterid2='+response.partyAgentCommissionNumber);
			location.reload();
		}
	});
});