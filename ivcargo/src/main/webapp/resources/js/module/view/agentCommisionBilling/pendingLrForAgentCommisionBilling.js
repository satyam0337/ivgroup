var totalReceivableAmount 	= 0;
var totalPayableAmount 		= 0;
var totalRecoveryAmount 	= 0;

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
	,'constant'
	], function (slickGridWrapper3) {
	'use strict';// this basically give strictness to this specific js
	var myNod,
	_this = '',
	columnHeaderJsonArr,
	selectedGridObject,
	viewObject,
	gridObejct,
	btModal,
	jsonObject,
	agentCommisionBillingModel,
	doneTheStuff = false;
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/agentCommissionBillingModuleWS/getAgentCommissionBillingDetailsByBranchId.do?', _this.setData, EXECUTE_WITH_ERROR);
		},setData : function(response) {
			if(response.message != undefined) {
				btModal.close();
				hideLayer();
				return;
			}

			columnHeaderJsonArr = response.columnConfigurationList;
			
			var selectedGridObject 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'agentCommissionBillingDiv'});
			
			if(selectedGridObject != undefined){

				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
				 agentCommisionBillingModel	= response.CorporateAccount;

				if(agentCommisionBillingModel.length > 0 && slickData != undefined && slickData.length > 0){
					for(var i = 0 ; i < agentCommisionBillingModel.length ; i++){
						
						if(slickData[0].branchId != agentCommisionBillingModel[i].branchId){
							btModal.close();
							showMessage('error', 'You Cannot Add LRs Of Different Branch');
							hideLayer();
							return false;
						}
					}
				}
			}
			
			let language	= {};
			language.removeheader = 'Remove';

			if(response.CorporateAccount != undefined) {
				slickGridWrapper3.applyGrid(
						{
							ColumnHead			:	response.columnConfigurationList, // *compulsory // for table headers
							ColumnData			:	_.values(response.CorporateAccount), 	// *compulsory // for table's data
							Language			:	language, 			// *compulsory for table's header row language
							ShowPrintButton		: 	true,
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

				if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'agentCommissionBillingDiv'},dataObject,'wayBillId')){
					if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'agentCommissionBillingDiv'},dataObject,'txnTypeId')){
						showMessage('error','LR already added.');
						return false;
					}
				}
				
				totalReceivableAmount 	= 0;
				totalPayableAmount 		= 0;
				totalRecoveryAmount 	= 0;
				
				for(var i=0;i < dataObject.length; i++) {
					
					totalReceivableAmount += dataObject[i].commissionReceivable;
					totalPayableAmount	  += dataObject[i].commissionPayable;
					
				}
				
				var selectedGridObject 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'agentCommissionBillingDiv'});
				
				if(selectedGridObject != undefined){
					var dataView 	= selectedGridObject.getData();
					var slickData 	= dataView.getItems();
					
					if(slickData != undefined && slickData.length > 0) {
						for(var i = 0; i < slickData.length; i++){
							totalReceivableAmount += slickData[i].commissionReceivable;
							totalPayableAmount	  += slickData[i].commissionPayable;
						}
					}
				}
				
				totalRecoveryAmount	= Number(Math.abs(totalReceivableAmount) - Math.abs(totalPayableAmount));
				
				$('#totalRecoveryAmount').html(Math.abs(totalReceivableAmount).toFixed(2) + " - " + Math.abs(totalPayableAmount).toFixed(2) + " = " + totalRecoveryAmount.toFixed(2));	

				let language	= {};
				language.removeheader = 'Remove';
			
				slickGridWrapper3.applyGrid(
						{
							ColumnHead						:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	language, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'agentCommissionBillingDiv',
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
							CallBackFunctionForRemove		:   _this.RemoveButtonClick
						});
			}	
		},showDispatchButton:function(){
			$( ".pendingPODContent").removeClass('hide');
			$( "#dispatchBtn").removeClass('hide');
		},RemoveButtonClick:function(grid,dataView,row){
			
			if(typeof dataView.getItem(row) !== 'undefined') {
				totalReceivableAmount = Number(totalReceivableAmount - dataView.getItem(row).commissionReceivable);
				totalPayableAmount = Number(totalPayableAmount - dataView.getItem(row).commissionPayable);
			}
			
			totalRecoveryAmount	= Number(Math.abs(totalReceivableAmount) - Math.abs(totalPayableAmount));
			
			$('#totalRecoveryAmount').html(Math.abs(totalReceivableAmount) + "  -  " + Math.abs(totalPayableAmount) + "  =  " + totalRecoveryAmount.toFixed(2));
			
		},submitDataFromGrid:function(){
			
			myNod = nod();

			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector: '#collectionPersonNameEle',
				validate: 'validateAutocomplete:#collectionPersonNameEle_primary_key',
				errorMessage: 'Select Collection Person !'
			});

			myNod.add({
				selector: '#RemarkEle',
				validate: 'presence',
				errorMessage: 'Enter Remark !'
			});

			myNod.performCheck();
			if(!(myNod.areAll('valid'))){
				return;
			}
			
			selectedGridObject = slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'agentCommissionBillingDiv'});
			
			if(selectedGridObject != undefined) {
				var object 		= new Object();
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
				if(slickData.length <= 0 ){
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}
				
				for(var i = 0; i < slickData.length; i++){
					if(slickData[i].commissionReceivable <= 0 && slickData[i].commissionPayable <=0 && slickData[i].totalCommission <= 0 && slickData[i].commissionValue <= 0
					 && slickData[i].commissionOnFreight <= 0){
						showMessage('error', NoCommissionOnLRErrorMsg + slickData[i].wayBillNumber);
						return false;
					}
				}
				
				if($('#statusTypeEle').exists() && $('#statusTypeEle').is(":visible")){
					
					if($('#statusTypeEle_primary_key').val() == 1){
						var wayBillNumberArr = new Array();
						for(var i = 1; i < slickData.length; i++){
							if(slickData[i].sourceBranchId != slickData[0].sourceBranchId){
								wayBillNumberArr.push(slickData[i].wayBillNumber);
							}
							
						}
						
						if(wayBillNumberArr.length > 0){
							showMessage('error', 'Please Select Booking And Delivery For Mixed Lrs '+wayBillNumberArr.join(','));
							return false;
						}
						
					} else if($('#statusTypeEle_primary_key').val() == 2){
						var wayBillNumberArr = new Array();
						
						for(var i = 1; i < slickData.length; i++){
							if(slickData[i].destinationBranchId != slickData[0].destinationBranchId){
								wayBillNumberArr.push(slickData[i].wayBillNumber);
							}
						}
							
						if(wayBillNumberArr.length > 0){
							showMessage('error', 'Please Select Booking And Delivery For Mixed Lrs '+wayBillNumberArr.join(','));
							return false;
						}
					}
				}
				
				var finalJsonObj = new Object();
				var jsonObject = new Object();
				var lrArrayObject 	= new Object();
				var lrArray			= new Array()
				
				jsonObject["collectionPersonId"] 	= $('#collectionPersonNameEle_primary_key').val();
				jsonObject["remark"] 				= $('#RemarkEle').val();
				
				if($("#dateEle").attr('data-startdate') != undefined){
					jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
				}
				
				if($("#dateEle").attr('data-enddate') != undefined){
					jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
				}
				
				jsonObject["dateWise"] 			= $('#dateCheckEle').prop('checked');
				
				if($('#statusTypeEle').exists() && $('#statusTypeEle').is(":visible")){
					jsonObject["statusTypeId"] 	= $('#statusTypeEle_primary_key').val();
				}
				
				for(var i = 0; i < slickData.length; i++){
					lrArrayObject 	= new Object();
					
					lrArrayObject.wayBillId								= slickData[i].wayBillId;
					lrArrayObject.wayBillTypeId							= slickData[i].wayBillTypeId;
					lrArrayObject.sourceBranchId						= slickData[i].sourceBranchId;
					lrArrayObject.txnTypeId								= slickData[i].txnTypeId;
					lrArrayObject.commissionOnFreight					= slickData[i].commissionOnFreight;
					lrArrayObject.commissionPayable						= slickData[i].commissionPayable;
					lrArrayObject.commissionReceivable					= slickData[i].commissionReceivable;
					lrArrayObject.pendingAgentCommissionBillingStockId	= slickData[i].pendingAgentCommissionBillingStockId;
					
					lrArray.push(lrArrayObject);
				}
				
				finalJsonObj.lrArray  = JSON.stringify(lrArray);
				finalJsonObj.jsondata 	= JSON.stringify(jsonObject);
				
				if(!doneTheStuff) {
					doneTheStuff = true;
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
					getJSON(finalJsonObj, WEB_SERVICE_URL+'/agentCommissionBillingModuleWS/validateAndSaveAgentCommissionBillingDetails.do', _this.onCommissionSave, EXECUTE_WITH_ERROR); //submit JSON
					});
					btModalConfirm.on('cancel', function() {
						doneTheStuff = false;
					});
				}
			}
		}, onCommissionSave : function(response) {
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			hideLayer();
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=agentCommisionBilling&masterid='+response.agentCommissionBillingSummaryId+'&masterid2='+response.agentCommissionBillingSummaryNumber);
			location.reload();
		}
	});
});