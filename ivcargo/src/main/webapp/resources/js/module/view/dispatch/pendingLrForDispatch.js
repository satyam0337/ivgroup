var editableDeliveryAt = false;
var activeDeliveryCharges	= null;
var wayBillData				= null;
var wayBillIdWiseChargeArr		= new Array();
var crossingAgentDestBranchList		= new Array();
var wayBillIdWiseObj		= new Object();

define([
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchfilepath.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'
        ,'slickGridWrapper3'
        ,'elementmodel'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/partialConsignmentForDispatchElement.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/truckengagementdetails.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchdetails.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/chargesdetails.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/excessregister.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/excessregisterdetails.js'
        ,'language'//import in require.config
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'elementTemplateJs'
        ,'/ivcargo/resources/js/validation/regexvalidation.js'
        ], function (FilePath, ModelUrls, slickGridWrapper, ElementModel,
        			PartialConsignment, TruckEngagementDetails, DispatchDetails, ChargesDetails, ExcessRegister, ExcessRegisterDetails) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	filterConfiguration = new Object(), columnConfiguration, columnConfiguration1, tableProperties, Language, isTableColumnConfig = false,
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	crossingChargesJsonArr,
	LangKeySet,
	columnHeaderArr,
	selectedGridObject,
	viewObject,
	gridObejct,
	btModal,
	crossingAgentId,
	jsonObject,
	crossingChargesModelArr,
	isAnyDDWBs,
	isAnyReceive,
	transportationModeMap = new Object(),
	PersistGridToAppend, totalLrCommission = 0;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this = this;

			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		},
		render: function(){
			showLayer();

			if(!isCheckBoxChecked('isAgentCrossing')) {
				jsonObject.crossingAgentSelectEle_primary_key	= 0;
			}
			
			if(lsPropertyConfig.wayBillDispatchForMultipleBranch && !isCheckBoxChecked('isAgentCrossing')) {
				jsonObject.areaSelectEle = jsonObject.areaSelectEle;
				jsonObject.branchSelectEle	= (jsonObject.branchSelectEle).join(",");
			}
			
			jsonObject.unloadingCrossingBranchId		= $("#crossingBranchEle_primary_key").val();
			jsonObject.isTableColumnConfig		= isTableColumnConfig;
			
			if(lsPropertyConfig.showBillSelectionOnCrossingAgent)
				jsonObject.billSelectionId	=  $('#billSelectionEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/dispatchWs/getPendingWaybillForDispatchByBranchId.do', _this.setElementsWithTimeout, EXECUTE_WITH_ERROR);
		}, setElementsWithTimeout : function(response) {
			setTimeout(function() {
				_this.setElements(response);
			}, 1000);
		}, setElements : function(response) {
			editableDeliveryAt								= lsPropertyConfig.editableDeliveryAt;
			activeDeliveryCharges							= response.activeDeliveryCharges;
			
			PersistGridToAppend	= true;
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				btModal.close();
				return;
			}

			var langObj 							= FilePath.loadLanguage();
			LangKeySet 								= loadLanguageWithParams(langObj);
			columnHeaderArr 						= ModelUrls.urlSearchCollection(response);
			filterConfiguration["searchFilterList"]	= response.searchFilterTypeConfiguration;
			filterConfiguration["listFilterList"]	= response.listFilterTypeConfiguration;
			columnHiddenConfiguration 				= response.byDefaultColumnHiddenConfiguration;
			crossingAgentId							= response.crossingAgentId;
			crossingAgentDestBranchList				= response.crossingAgentDestBranchList;
			
			if(!isTableColumnConfig) {
				columnConfiguration		= response.columnConfiguration;
				columnConfiguration1	= response.columnConfiguration1;
				tableProperties			= response.tableProperties;
				Language				= response.Language;
				isTableColumnConfig		= true;
			}
			
			columnHeaderJsonArr = [];

			var eleArr = columnHeaderArr;
		
			for  (var j = 0; j < eleArr.length; j++) {
				columnHeaderJsonArr.push(new ElementModel(JSON.parse(eleArr[j])).toJSON());
			}
			
			crossingChargesJsonArr	= [];
			
			if(lsPropertyConfig.IsCrossingDispatchAllow) {
				crossingChargesModelArr				= ModelUrls.crossingChargesCollection(response);
				
				for  (var j = 0; j < crossingChargesModelArr.length; j++) {
					crossingChargesJsonArr.push(new ElementModel(JSON.parse(crossingChargesModelArr[j])).toJSON());
				}
			}
			
			slickGridWrapper.applyGrid(
						{
							ColumnHead			:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData			:	response.pendingDispatchArr, 	// *compulsory // for table's data
							Language			:	LangKeySet, 			// *compulsory for table's header row language
							DivId				:	'modalBody',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId		:	'popupData',		//	*compulsary field // unique Key for id to be set in slickgrid table
							SerialNo			:[{					// optional field // for showing Row number
								showSerialNo	:	true,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							ColumnHiddenConfiguration	:	columnHiddenConfiguration, // optional for hiding columns account group specifically
							AllowFilter					:	filterConfiguration,	 // optional field // for showing filters on each column
							NoVerticalScrollBar			:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							//FetchDataButtonId : '.ok',//Add button in modal pop-up
							ShowCheckBox 				: 	true,
							CallBackFunctionToFetchData : 	_this.getDataFromGrid,
							EditableColumn				: 	false,
							RemoveSelectAllCheckBox		:	lsPropertyConfig.removeSelectAllCheckBox
						});
								
				_this.updateMultiRowColor('popupData');
				
				$("#modalBody").css("height","450px");
				$("#popupData").css("height","420px");
				$(".slick-viewport").css("height","350px");
				$(".slick-pane-left").css("height","490px");
				
				hideLayer();
				
				btModal.on('ok', function() {
					var selectionMsg		= ' Please, Select atleast one LR For Dispatch !';
					var selectedVal 		= slickGridWrapper.getValueForSelectedData({InnerSlickId : 'popupData'}, selectionMsg);
						
					if(selectedVal != undefined && selectedVal.length > 0) {
						if(lsPropertyConfig.showPartyIsBlackListedParty && !_this.allowToAddBlackListedLRs(selectedVal))
							return;

						_this.validateAndAddData(slickGridWrapper);
					}
				});
		}, validateAndAddData : function (slickGridWrapper) {
			var selectionMsg		= ' Please, Select atleast one LR For Dispatch !';
			var	selectedVal 		= slickGridWrapper.getValueForSelectedData({InnerSlickId : 'popupData'}, selectionMsg);
			selectedGridObject 		= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			slickData	= [];
				
			if(selectedGridObject != undefined) {
				let dataView 		= selectedGridObject.getData();
				slickData 			= dataView.getItems();
			} else if(selectedVal != undefined)
				slickData			= selectedVal;
			
			if(selectedVal != undefined && selectedVal.length > 0 && slickData.length > 0) {
				if(lsPropertyConfig.removeLRForShortExcessReceive && !_this.checkForPendingShortExcess(selectedVal)
					|| !_this.checkForSameTransportationMode(selectedVal, slickData)
					|| lsPropertyConfig.doNotShowCrossingAgentBranch && !_this.checkForCrossingAgentBranches(selectedVal, slickData, crossingAgentId > 0, crossingAgentDestBranchList)
					|| (lsPropertyConfig.validateSourceDestSubregionForSingleLR || lsPropertyConfig.validateSourceDestinationSubRegionAfterLRAdd) && !_this.validateSourceDestinationSubRegionAfterAddingLR(selectedVal, slickData)
					|| (lsPropertyConfig.validateDestinationBranchForSingleLR || lsPropertyConfig.validateDestinationBranchAfterLRAdd) && !_this.validateDestinationBranchAfterAddingLR(selectedVal, slickData)
					|| lsPropertyConfig.billSelection && !_this.checkForSameBillSelection(selectedVal, slickData)
					|| lsPropertyConfig.doNotAllowedOtherLrsInDoorDeliveryLrs && !_this.checkForDoorDeliveryLRWithOtherDeliveryTo(slickData, selectedVal))
					return false;
			}
			
			if(lsPropertyConfig.validateSourceBranchForSingleLR) {
				if(selectedGridObject == undefined || selectedGridObject == 'undefined') {
					if(selectedVal.length > 1) {
						if(lsPropertyConfig.confirmForAddOtherLROfSameSource) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content				: " More Than 1 LR Selected , do want to Add this lr ?",
								title				: 'Confirmation Dialog',
								modalWidth 			: 30,
								focusOk				: true,
								okText				: 'YES',
								showFooter 			: true,
								okCloses			: true
							}).open();
							
							btModalConfirm.on('ok', function() {
								_this.getDataFromGrid(selectedVal);
							})
						}
					} else
						_this.getDataFromGrid(selectedVal);
				} else {
					var dataView 	= selectedGridObject.getData();
					var slickData 	= dataView.getItems();
					
					if(slickData.length > 0) {
						if(slickData[0].wayBillSourceBranchId == selectedVal[0].wayBillSourceBranchId) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content				: slickData.length + " LRs Already Added, do want to Add this LR ?",
								title				: 'Confirmation Dialog',
								modalWidth 			: 30,
								focusOk				: true,
								okText				: 'YES',
								showFooter 			: true,
								okCloses			: true
							}).open();
							
							btModalConfirm.on('ok', function() {
								_this.getDataFromGrid(selectedVal);
							})
						} else {
							showMessage('error', 'you can not dispatch LRs Of Other Source Branch');
						}
					}else{
						if(selectedVal.length > 1){
							if(lsPropertyConfig.confirmForAddOtherLROfSameSource){
								var btModalConfirm = new Backbone.BootstrapModal({
									content				: " More Than 1 LR Selected , do want to Add this lr ?",
									title				: 'Confirmation Dialog',
									modalWidth 			: 30,
									focusOk				: true,
									okText				: 'YES',
									showFooter 			: true,
									okCloses			: true
								}).open();
								
								btModalConfirm.on('ok', function() {
									_this.getDataFromGrid(selectedVal);
								})
							}
						} else {
							_this.getDataFromGrid(selectedVal);
						}
					}
				}
			} else if(lsPropertyConfig.validateDeliveryTo) {
				if(selectedGridObject == undefined || selectedGridObject == 'undefined') {
					_this.getDataFromGrid(selectedVal);
				} else {
					var dataView 	= selectedGridObject.getData();
					var slickData 	= dataView.getItems();
					
					if(slickData.length > 0 ) {
						if(slickData[0].deliveryToId == selectedVal[0].deliveryToId)
							_this.getDataFromGrid(selectedVal);
						else
							showMessage('error', 'you can not dispatch LRs Of Multiple Delivery To At same time');
					} else
						_this.getDataFromGrid(selectedVal);
				}
			} else
				_this.getDataFromGrid(selectedVal);
			//confirmMsg = false;
		}, allowToAddBlackListedLRs : function(dataArray) {
			let newArray = dataArray.filter(function (el) {
				return el.consignorBlackListed > 0 || el.consigneeBlackListed > 0 || el.tbbPartyBlackListed > 0;
			});
				
			let blackListedParty	= newArray.length > 0;
			let lrArray 			= newArray.map(item => item.wayBillNumber);
				
			if(blackListedParty && lrArray.length > 0) {
				$('#popUpContentOnLsLoad').bPopup({}, function() {
					let _thisMod 	= this;
					$(this).html("<div class='confirmation-modal modal fade in' tabindex='-1' role='dialog' style='display: block; padding-right: 17px;'><div class='modal-dialog modal-sm'><div class='modal-content'>" +
						"<div class='modal-body'>You are Adding Blacklisted Party LRs " + lrArray.join(",") + "</div><div class='modal-footer'>" +
						"<button class='btn btn-danger' type='button'>ok</button></div></div></div></div>");
					
					$(".confirmation-modal button").one('click', function() {
						_thisMod.close();
						return true;
					});
				});
				
				return false;
			}
			
			return true;
		}, checkForPendingShortExcess : function(dataArray) {
			let shortLRsArray = dataArray.filter(obj => {
				return obj.shortReceive;
			});
				
			let excessLRsArray = dataArray.filter(obj => {
				return obj.excessReceive;
			});
				
			if(shortLRsArray != undefined && shortLRsArray.length > 0) {
				showMessage('error', 'Short Entry found for ' + shortLRsArray[0].wayBillNumber + ', Please Settle.');
				return false;
			}
				
			if(excessLRsArray != undefined && excessLRsArray.length > 0) {
				showMessage('error', 'Excess Entry found for ' + excessLRsArray[0].wayBillNumber + ', Please Settle.');
				return false;
			}
			
			return true;
		}, checkForSameTransportationMode : function(dataArray, slickData) {
			if(dataArray.length > 0 && slickData.length > 0 && lsPropertyConfig.validateTransportMode) {
				let tModeLRsArray = dataArray.filter(obj => {
					return (obj.transportModeId == TRANSPORTATION_MODE_RAIL_ID || obj.transportModeId == TRANSPORTATION_MODE_AIR_ID
					|| slickData[0].transportModeId == TRANSPORTATION_MODE_RAIL_ID || slickData[0].transportModeId == TRANSPORTATION_MODE_AIR_ID)
					&& slickData[0].transportModeId != obj.transportModeId;
				});
					
				if(tModeLRsArray != undefined && tModeLRsArray.length > 0) {
					showMessage('error', 'Transport Mode ' + transportationModeMap[tModeLRsArray[0].transportModeId] + ' is  Not allowed in ' + transportationModeMap[slickData[0].transportModeId]);
					return false;
				}
			}
			
			return true;
		}, checkForCrossingAgentBranches : function(dataArray, slickData, isAgentCrossing, crossingAgentDestBranchList) {
			if(dataArray.length > 0 && slickData.length > 0 && crossingAgentDestBranchList != undefined && (isAgentCrossing && !crossingAgentDestBranchList.includes(slickData[0].wayBillDestinationBranchId)
				|| !isAgentCrossing && crossingAgentDestBranchList.includes(slickData[0].wayBillDestinationBranchId))) {
				showMessage('error', 'You Can Not Add Both, Either Add Normal Or Crossing Agent Branch LR');
				return false;
			} 
			
			return true;
		}, validateSourceDestinationSubRegionAfterAddingLR : function(dataArray, slickData) {
			let newArray = dataArray.filter(function (el) {
				return slickData[0].handlingSourceSubRegionId != el.handlingSourceSubRegionId || slickData[0].handlingSubregionId != el.handlingSubregionId;
			});
			
			if(newArray == null || newArray.length == 0)
				return true;
				
			let lrArray 	= newArray.map(item => item.wayBillNumber);
			
			if(lrArray != undefined && lrArray.length > 0) {
				showMessage('error', 'You can not dispatch LR of different Subregion LR Nos. are ' + lrArray.join(","));
				return false;
			}
						
			return true;
		}, validateDestinationBranchAfterAddingLR : function(dataArray, slickData) {
			let newArray = dataArray.filter(function (el) {
				return slickData[0].handlingBranchId != el.handlingBranchId;
			});
				
			let lrArray 	= newArray.map(item => item.wayBillNumber);
			
			if(lrArray != undefined && lrArray.length > 0) {
				showMessage('error', 'You can not dispatch LR of different Destination LR Nos. are ' + lrArray.join(","));
				return false;
			}
						
			return true;
		}, checkForSameBillSelection : function(dataArray, slickData) {
			if(!lsPropertyConfig.showBillSelectionOnCrossingAgent && isCheckBoxChecked('isAgentCrossing'))
				return true;
				
			let newArray	= dataArray.filter(function (el) {
				if(slickData != undefined && slickData.length > 0)
					return slickData[0].billSelectionId != el.billSelectionId;
			});
				
			if(newArray != undefined && newArray.length > 0) {
				showMessage('error', 'Bill LRs Not Allowed with Estimate LRs');
				return false;
			}
						
			return true;
		}, getDataFromGrid : function(dataObject){
			if(dataObject.length > 0) {
				changeDisplayProperty('middle-border-boxshadow', 'block');
				changeDisplayProperty('bottom-border-boxshadow', 'block');
				
				columnHeaderJsonArr		= columnHeaderJsonArr.concat(crossingChargesJsonArr);
				
				_this.showChargesFeild(dataObject);
				_this.showDispatchButton();
				_this.showExcessEntryButton();

				if(slickGridWrapper.checkToAddRowInTable({InnerSlickId : 'data'},dataObject,'wayBillId')) {
					showMessage('error','LR already added.');
					return false;
				}

				slickGridWrapper.applyGrid(
						{
							ColumnHead						:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	LangKeySet, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'data',
							SerialNo						:[{					// optional field // for showing Row number
								showSerialNo	:	true,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							ColumnHiddenConfiguration		:	columnHiddenConfiguration, // optional for hiding columns account group specifically
							AllowFilter						:	filterConfiguration,	 // optional field // for showing filters on each column
							NoVerticalScrollBar				:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							FetchAllDataButtonId 			: 	'#dispatchBtn',
							ShowDeleteButton 				: 	true,
							EditRowsInSlick 				: 	true,
							DataVieObject					:	viewObject,
							DataGridObject					:	gridObejct,
							ShowPartialButton				:	showPartialDispatchButton,
							CallBackFunctionForPartial 		: 	_this.PartialButtonClick,
							PersistGridToAppend				:	PersistGridToAppend,
							UpdateTotalFunction				: 	_this.updatePaidAndTopayAmount			
						});
						
				_this.updateMultiRowColor('data');
			}
		}, submitDataFromGrid : function() {
			selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(selectedGridObject != undefined) {
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
				
				if(slickData.length <= 0) {
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}

				isAnyDDWBs		= _this.checkIsAnyDDWBs(slickData);
				isAnyReceive	= _this.checkIsAnyReceive(slickData);

				if(lsPropertyConfig.validateSourceBranchAfterLRAdd && !_this.checkForSameSourceBranch(slickData)
					|| lsPropertyConfig.validateDestinationBranchAfterLRAdd && !_this.checkForSameDestinationBranch(slickData)
					|| lsPropertyConfig.allowDispatchOfSameDestinationMultipleDDDVLr && !_this.checkForSameDestintionWithMultipleDDDVLR(slickData)
					|| lsPropertyConfig.validateDeliveryToAfterLRAdd && !_this.checkForSameDeliveryTo(slickData)
					|| !_this.checkForDifferentCrossingAgentLR(slickData)
					|| lsPropertyConfig.ValidateCrossingHireAmount && !_this.checkCrossingHireAmount(slickData)
					|| lsPropertyConfig.validateSourceDestinationSubRegionAfterLRAdd && !_this.validateSourceDestinationSubRegionAfterAddingLR(slickData, slickData)
					|| !lsPropertyConfig.allowDispatchOfDddvLRWithOtherBookingType && !_this.checkForDDDVLRWithOtherBookingType(slickData)
					|| lsPropertyConfig.validateNumberOfLRToDispatch && !_this.checkForTotalNumberOfLRForDispatch(slickData))
					return false;
				
				totalLrCommission	= _this.getCommissionTotal(slickData); 

				if(lsPropertyConfig.isValidateLRsForDeclaredValueForConsignorConsignee) {				
					var finalJsonObj = new Object();
					finalJsonObj.lrArray  			= JSON.stringify(slickData);
					getJSON(finalJsonObj, WEB_SERVICE_URL+'/loadingSheetWS/checkForCreateEWayBillLR.do', _this.viewDispatchElements, EXECUTE_WITH_ERROR);
				} else
					_this.viewDispatchElements();
			}
		}, checkIsAnyDDWBs : function(slickData) {
			return slickData.some(function(el) {
    			return el.deliveryToId === DIRECT_DELIVERY_DIRECT_VASULI_ID
    		});
    	}, checkIsAnyReceive : function(slickData) {
			return slickData.some(function(el) {
    			return el.wayBillStatus === WAYBILL_STATUS_RECEIVED
    		});
    	}, checkForSameDestintionWithMultipleDDDVLR : function(slickData) {
			let isExist	= slickData.some(function(el) {
    			return el.deliveryToId === DIRECT_DELIVERY_DIRECT_VASULI_ID && slickData[0].wayBillDestinationBranchId != el.wayBillDestinationBranchId
    		});
			
			if(isExist) {
				showMessage('info', sameDestinationMultipleDDDVLrError);
				return false;
			}
			
			return true;
		}, checkForSameDeliveryTo : function(slickData) {
			let isExist	= slickData.some(function(el) {
				return slickData[0].deliveryToId != el.deliveryToId
			});
			
			if(isExist) {
				showMessage('warning', 'You can not dispatch LRs Of Multiple Delivery To At same time');
				return false;
			}
			
			return true;
		}, checkForSameSourceBranch : function(slickData) {
			let isExist	= slickData.some(function(el) {
				return slickData[0].wayBillSourceBranchId != el.wayBillSourceBranchId
			});
			
			if(isExist) {
				showMessage('info', 'You can not dispatch LRs Of More Than One Source Branch');
				return false;
			}
			
			return true;
		}, checkForSameDestinationBranch : function(slickData) {
			let isExist	= slickData.some(function(el) {
    			return slickData[0].handlingBranchId != el.handlingBranchId
    		});
			
			if(isExist) {
				showMessage('info', 'You can not dispatch LRs Of More Than One Destination Branch');
				return false;
			}
			
			return true;
		}, checkForDifferentCrossingAgentLR : function(slickData) {
			let isAgentCrossing		= isCheckBoxChecked('isAgentCrossing');
			
			if(!isAgentCrossing || crossingAgentId <= 0)
				return true;
			
			let isExist	= slickData.some(function(el) {
				return Number(crossingAgentId) != el.crossingAgentId
			});
			
			if(isExist) {
				showMessage('warning', dispatchWithDifferentAgentWarningMsg);
				return false;
			}
			
			let crossingBranchIds	= $('#agentDestinationAreaEle').val();
			let crossingBranchIdArr	= crossingBranchIds.split(',');
			
			let newArray	= slickData.filter(function(el) {
				return !isValueExistInArray(crossingBranchIdArr, el.wayBillDestinationBranchId)
			});
			
			if(newArray != undefined && newArray.length > 0) {
				showMessage('warning', sameCrossingDestinationBranchWarningMsg);
				return false;
			}
			
			return true;
		}, checkCrossingHireAmount : function(slickData) {
			let isAgentCrossing		= isCheckBoxChecked('isAgentCrossing');
			
			if(!isAgentCrossing || crossingAgentId <= 0)
				return true;
				
			const found = slickData.find(element => {
				return element.crossingHire <= 0;
			});
			
			if(found) {
				showMessage('error', enterCrossingHireAmountErrMsg(found.wayBillNumber));
				return false;
			}
			
			return true;
		}, checkForTotalNumberOfLRForDispatch : function(slickData) {
			if(slickData.length > lsPropertyConfig.totalNumberOfLRAllowToDispatch) {
				showMessage('info', 'The number of LR to dispatch exceeds the allowed limit '+ lsPropertyConfig.totalNumberOfLRAllowToDispatch);
				return false;
			}
			
			return true;
		}, checkForDDDVLRWithOtherBookingType : function(slickData) {
			let isExist	= slickData.some(function(el) {
    			return el.deliveryToId === DIRECT_DELIVERY_DIRECT_VASULI_ID && slickData[0].deliveryToId != el.deliveryToId
    		});
			
			if(isExist) {
				showMessage('info', doNotAllowToDispatchOtherLRWithDDDv);
				return false;
			}
			
			return true;
		}, viewDispatchElements : function(data) {
			if(data != null && data.LRsFoundForCreateEwayBill != undefined && data.LRsFoundForCreateEwayBill) {
				hideLayer();
				_this.showMessage(data);
				return;
			} else {
				selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});

				if(selectedGridObject != undefined) {
					var object 		= new Object();
					let dataView 	= selectedGridObject.getData();
					let slickData 	= dataView.getItems();
					
					let showCustomMessage		= false;
					let	customMessage			= '';

					if(lsPropertyConfig.isConvertToDDDV && isAnyReceive) {
						showCustomMessage		= true;
						customMessage			= '<b> Received LRs are not allowed for DDDV.</b>';
					}
					
					lsPropertyConfig.isAnyDDDVWBs	= isAnyDDWBs;
					lsPropertyConfig.isAnyReceive	= isAnyReceive;
					lsPropertyConfig.totalLrCommission		= totalLrCommission;
					
					object.slickData 		= slickData;
					object.isAnyDDDVWBs 	= isAnyDDWBs;
					object.isAnyReceive 	= isAnyReceive;
					object.totalLrCommission= totalLrCommission;
					object.lsPropertyConfig	= lsPropertyConfig;
					
					let isDispatchDetails	= true;
					
					if(lsPropertyConfig.automateLHVPCreation) {
						isDispatchDetails	= false;
						
						new Backbone.BootstrapModal({
							content		: 	new ChargesDetails(object),
							modalWidth 	: 	90,
							title		:	'Charges Information',
							okText		:	'Next',
							modalBodyId	:	'lhpvChargeModal',
							showFooter 	: 	true,
							okCloses	:	false,
							focusOk		:	false,
							showMessage	:	showCustomMessage,
							messageText	:   customMessage
						}).open();
					} else if(lsPropertyConfig.IsTruckIngagementSlipAllow) {
						var isAgentCrossing		= isCheckBoxChecked('isAgentCrossing');
							
						if(lsPropertyConfig.IsTruckIngagementSlipAllowForDDDV)
							isAnyDDWBs			= false;
								
						lsPropertyConfig.isAnyDDDVWBs	= isAnyDDWBs;
						object.isAnyDDDVWBs 			= isAnyDDWBs;
							
						if(!isAgentCrossing && !isAnyDDWBs) {
							isDispatchDetails	= false;
							
							new Backbone.BootstrapModal({
								content		: 	new TruckEngagementDetails(object),
								modalWidth 	: 	90,
								title		:	'Truck Engagement Details',
								okText		:	'Next',
								modalBodyId	:	'lorryHireModelBody',
								showFooter 	: 	true,
								okCloses	:	false,
								focusOk		:	false,
								showMessage	:	showCustomMessage,
								messageText	:   customMessage
							}).open();
						}
					}
					
					if(isDispatchDetails) {
						new Backbone.BootstrapModal({
							content		: 	new DispatchDetails(object),
							modalWidth 	: 	90,
							title		:	'Truck Information',
							okText		:	'Dispatch',
							showFooter 	: 	true,
							okCloses	:	false,
							focusOk		:	false,
							showMessage	:	showCustomMessage,
							messageText	:   customMessage
						}).open();
					}
				}
			}
		}, showMessage : function(response) {
			var height = 33;
			$('.error').addClass("showElemnt");
			$('.error').removeClass("hideElemnt");
			var validatedLRsForCreateEwayBill = response.validatedLRsForCreateEwayBill;
			$('.error').empty();
			$('.error').append('<p>Please, Create E-wayBill For :<span style="float : right;font-size: 20px;"><span onclick="hideAllMessages()" ><span class="glyphicon glyphicon-remove-sign"></span> Close</span></span></p>');
			
			for (var customerDetails in validatedLRsForCreateEwayBill) {
				var consignor = customerDetails.split('_')[0];
				var consignee = customerDetails.split('_')[1];
				var lrDetails = validatedLRsForCreateEwayBill[customerDetails];	
			
				height	= height + 33;
				$('.error').append("<p>LR Nos : " + lrDetails + " ( Consignor - " + consignor + " And Consignee - " + consignee + " )</p>")	
			}
			
			$('.error').animate({
				top : "0",
				height : height
			}, 400);
		},enterLRExcessEntry:function(){
			var object 		= new Object();
			
			var btModal = new Backbone.BootstrapModal({
				content		: 	new ExcessRegister(object),
				modalWidth 	: 	60,
				title		:	'Excess Register',
			}).open();
			
			object.btModal = btModal;
			new ExcessRegister(object)
			btModal.open();
		},viewLRExcessEntry:function(){
			if(!(_.isArray(excessEntryDetailsArray) && _.isEmpty(excessEntryDetailsArray))) {
				var object 		= new Object();
				
				var btModal = new Backbone.BootstrapModal({
					content		: 	new ExcessRegisterDetails(object),
					modalWidth 	: 	60,
					title		:	'Added Excess Entries',
				}).open();
				
				object.btModal = btModal;
				new ExcessRegisterDetails(object)
				btModal.open();
			} else {
				showMessage('error', 'Add Excess Entry First!')
			}
		}, PartialButtonClick : function(grid, dataView, row) {
			var jsonObject = new Object();
			jsonObject.row 			= row;
			jsonObject.grid 		= grid;
			jsonObject.dataView 	= dataView;
			
			if(dataView.getItem(row).isTceBooking) {
				hideLayer();
				showMessage('error','Partial Dispatch Is Not Allowed For TranCE LR!!!');
				return false;
			}
			
			if(!allowPartialDispatch) {
				hideLayer();
				showMessage('error','You do not have permission for partial dispatch !!!');
				return false;
			}

			var btModal = new Backbone.BootstrapModal({
				content		: 	new PartialConsignment(jsonObject),
				modalWidth 	:	50,
				title:		'	LR NUMBER : <b>'+dataView.getItem(row).wayBillNumber+'</b>',
				okText		:	'Update',
				showFooter 	: 	true,
				focusOk 	: 	false,
				okCloses	:	false
			})
			jsonObject.btModal = btModal;
			var partialCon = new PartialConsignment(jsonObject)
			btModal.open();
		},events:{
			"click 	#dispatchBtn"			: 	"submitDataFromGrid",
			"click 	#excessEntry"			: 	"enterLRExcessEntry",
			"click 	#viewExcessEntry"		: 	"viewLRExcessEntry",
		}, lrNumberAppend : function(pendingDispatchobj) {
			columnHeaderJsonArr 							= pendingDispatchobj.ColumnHead;
			crossingChargesJsonArr							= pendingDispatchobj.ColumnHead1;
			LangKeySet 										= pendingDispatchobj.Language;
			columnHiddenConfiguration 						= pendingDispatchobj.ColumnHiddenConfiguration;
			filterConfiguration 							= pendingDispatchobj.AllowFilter;
			crossingAgentId									= pendingDispatchobj.CrossingAgentId;
			PersistGridToAppend								= pendingDispatchobj.PersistGridToAppend;

			$('#singlelrEle').focus();
			return _this.getDataFromGrid(pendingDispatchobj.data);
		},showDispatchButton:function(){
			$( "#dispatchBtn").removeClass('hide');
			$( "#summaryData").removeClass('hide');
		},showExcessEntryButton:function(){
			if(lsPropertyConfig.allowExcessEntryInLoading) {
				$( "#excessEntry").removeClass('hide');
				$( "#viewExcessEntry").removeClass('hide');
			}
		},showChargesFeild : function(dataObject) {
			for(var i = 0; i < dataObject.length; i++) {
				var isReceive		= dataObject[i].wayBillStatus == WAYBILL_STATUS_RECEIVED;  //7 - received lr

				for(var j = 0; j < columnHeaderJsonArr.length; j++) {
					if(isReceive) {
						if(columnHeaderJsonArr[j].dataDtoKey == 'netLoading')
							columnHeaderJsonArr[j].buttonCss = 'form-control netLoading show';
						
						if(columnHeaderJsonArr[j].dataDtoKey == 'netUnloading')
							columnHeaderJsonArr[j].buttonCss = 'form-control netUnLoading show';
					} else {
						if(columnHeaderJsonArr[j].dataDtoKey == 'netLoading') {
							columnHeaderJsonArr[j].dataDtoKey = 'xyz';
							columnHeaderJsonArr[j].dataType 	= 'text';
						}
						
						if(columnHeaderJsonArr[j].dataDtoKey == 'netUnloading') {
							columnHeaderJsonArr[j].dataDtoKey = 'xyz';
							columnHeaderJsonArr[j].dataType 	= 'text';
						}
					}

					if(isReceive || crossingAgentId > 0) {
						if(columnHeaderJsonArr[j].dataDtoKey == 'crossingHire')
							columnHeaderJsonArr[j].buttonCss = 'form-control crossingHire show';
					} else if(columnHeaderJsonArr[j].dataDtoKey == 'crossingHire') {
						columnHeaderJsonArr[j].dataDtoKey = 'xyz';
						columnHeaderJsonArr[j].dataType 	= 'text';
					}

					if(crossingAgentId > 0 && columnHeaderJsonArr[j].dataDtoKey == 'lrCommission')
						columnHeaderJsonArr[j].buttonCss = 'form-control lrCommission show';
					else if(columnHeaderJsonArr[j].dataDtoKey == 'lrCommission') {
						columnHeaderJsonArr[j].dataDtoKey = 'xyz';
						columnHeaderJsonArr[j].dataType 	= 'text';
					}
					
					if(isReceive || crossingAgentId > 0) {
						if(columnHeaderJsonArr[j].dataDtoKey == 'crossingLrNumber')
							columnHeaderJsonArr[j].buttonCss = 'form-control crossingLrNumber show';
					} else if(columnHeaderJsonArr[j].dataDtoKey == 'crossingLrNumber') {
						columnHeaderJsonArr[j].dataDtoKey = 'xyz';
						columnHeaderJsonArr[j].dataType 	= 'text';
					}
				}
			}
		}, updatePaidAndTopayAmount:function(dataView, innerSlickID) {
			var l = dataView.getLength();
			var totalTopay 	= 0;
			var totalPaid 	= 0;
			var totalTbb 	= 0;
			var partialLR	= 0;
			
			for(var i = 0; i < l; i++) {
				if(dataView.getItem(i)['wayBillTypeId'] == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
					totalTopay 	+= parseInt(dataView.getItem(i)['bookingTotal']);
				} else if(dataView.getItem(i)['wayBillTypeId'] == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
					totalPaid 	+= parseInt(dataView.getItem(i)['bookingTotal']);
				} else if(dataView.getItem(i)['wayBillTypeId'] == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
					totalTbb 	+= parseInt(dataView.getItem(i)['bookingTotal']);
				}
				
				if(dataView.getItem(i)['partial']) {
					partialLR = partialLR + 1;
				}
			}
			
			if(isNaN(totalTopay)) {
				totalTopay = 0;
			}
			
			if(isNaN(totalPaid)) {
				totalPaid = 0;
			}
			
			if(isNaN(totalTbb)) {
				totalTbb = 0;
			}

			$('*[data-columnTotal=' + innerSlickID + 'summarytotalPaidAmount]').html(totalPaid);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalToPayAmount]').html(totalTopay);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalTbbAmount]').html(totalTbb);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalAmount]').html(totalTopay + totalPaid + totalTbb);
			$('*[data-columnTotal=' + innerSlickID + 'summaryPartial]').html(partialLR);
		}, updateMultiRowColor : function(slickgrid) {
			let slickgridObj	 = {InnerSlickId : slickgrid};
			
			slickgridObj.lsPropertyConfig = lsPropertyConfig;
			
			slickGridWrapper.updateMultiRowColor(slickgridObj);
		}, checkForDoorDeliveryLRWithOtherDeliveryTo : function(slickData, dataArray) {
			
			let newArray	= dataArray.filter(function (el) {
				if(slickData != undefined && slickData.length > 0) {
					return slickData[0].deliveryToId != el.deliveryToId;
				}
			});
			
			if(newArray != undefined && newArray.length > 0) {
				showMessage('info', doNotAllowToDispatchOtherLRWithDoorDly);
				return false;
			}
			
			return true;
		}, getCommissionTotal : function(slickData) {
			let totalLrCommission = 0;
			
			for(const element of slickData) {
				if(element['lrCommission'] != undefined)
					totalLrCommission += Number(element['lrCommission']);
			}
			
			return totalLrCommission;
		}
	});
});

function showPopUpWindow(grid,dataView,row) {	
	
	wayBillData = dataView.getItem(row);
	var waybillId	= wayBillData.wayBillId;
	var	wayBillNumber	= wayBillData.wayBillNumber;
	var destinationBranchId = wayBillData.wayBillDestinationBranchId;
	
	$('#popUpOnLsLoad').bPopup({
	},function(){
		var _thisMod 	= this;
		var	 keyCollection = addDeliveryCharges(grid,dataView,row);
		$(this).html("<div class='confirmation-modal modal fade in' tabindex='-1' role='dialog' style='display: block; padding-right: 17px;'><div class='modal-dialog modal-xss'><div class='modal-content' style='width: 70%;'>" +
				"<div class='modal-body'><table width='100%'><tr><th style='text-align:center;font-size:20px;background-color: #31708f;color: white; height:35p;'>Add Delivery Charges<th></tr>" +
				"<tr><td style='text-align: center; font-size:20px;color: red;'>LR Number : "+wayBillNumber+"</td></tr></table></div>"+
				"<div class='modal-body'><table width='100%'align='center'>"+keyCollection+"</table></div>" +
				"<div style='padding-left: 265px;padding-bottom: 10px;'><button id='addButton_"+waybillId+"' class='btn btn-success'>Add</button>&nbsp;&nbsp;<button id='cancelButton' class='btn btn-danger'>Close</button></div>"
		);
		$("#cancelButton").click(function(){
			_thisMod.close();
		})

		$("#addButton_"+waybillId).click(function(){
			storeCharges(waybillId,destinationBranchId);
			_thisMod.close();
		})

	});
}
function addDeliveryCharges(grid,dataView,row) {
	
	var wayBillDataObj = dataView.getItem(row);
	var waybillId	= wayBillDataObj.wayBillId;
	var dataKey			= Object.keys(activeDeliveryCharges);
	var collection = '';
	var wayBillIdWiseChargelist	= null;
	if(typeof dataKey !== 'undefined'){

		if(wayBillIdWiseObj != null) {

			wayBillIdWiseChargelist = wayBillIdWiseObj['wayBillId_'+waybillId];
			for (var i=0; i<dataKey.length; i++) {

				var obj		= activeDeliveryCharges[dataKey[i]];
				var objKey	= Object.keys(obj);
				for (var k=0; k<objKey.length; k++){
					var chargeId		= objKey[k];
					var chargeName		= obj[objKey[k]];
					if(i == 0){
						initialiseFocusId = chargeId
					}
					setTimeout(function(){
					$('#charge_'+initialiseFocusId).focus();
						initialiseFocus();
					}, 500);
					
					if(typeof wayBillIdWiseChargelist != 'undefined' || wayBillIdWiseChargelist != undefined) {
						if(wayBillIdWiseChargelist != null && wayBillIdWiseChargelist.length > 0){
							
							for(var j=0;j < wayBillIdWiseChargelist.length; j++) {
								var obj = wayBillIdWiseChargelist[j];
								if(obj.chargeId == chargeId){
									/*if(typeof obj == 'undefined' || typeof obj.Amount == 'undefined') {
										obj.Amount= 0;
									}*/
									$('#'+waybillId+'_charge_'+chargeId).val(obj.Amount)
									collection += "<tr><td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>"  + chargeName +  "</td>"
									collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='"+waybillId+"_charge_"+chargeId+"' id='"+waybillId+"_charge_"+chargeId+"'  value ='"+obj.Amount+"'/></td></tr>"
								}
							}
						} else {
							collection += "<tr><td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>"  + chargeName +  "</td>"
							collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='"+waybillId+"_charge_"+chargeId+"' id='"+waybillId+"_charge_"+chargeId+"' value ='0'/></td></tr>"
						}
					} else {
						collection += "<tr><td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>"  + chargeName +  "</td>"
						collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='"+waybillId+"_charge_"+chargeId+"' id='"+waybillId+"_charge_"+chargeId+"' value ='0'/></td></tr>"
					}
				}
			  }
			} else {
			collection = '';

			for (var i=0; i<dataKey.length; i++) {

				var obj		= activeDeliveryCharges[dataKey[i]];
				var objKey	= Object.keys(obj);


				for (var k=0; k<objKey.length; k++){
					var chargeId		= objKey[k];
					var chargeName		= obj[objKey[k]];

					if(i == 0){
						initialiseFocusId = chargeId
					}
					setTimeout(function(){
						//$('#charge_'+initialiseFocusId).focus();
						initialiseFocus();
					}, 500);

					collection += "<tr><td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>"  + chargeName +  "</td>"
					collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='"+waybillId+"_charge_"+chargeId+"' id='"+waybillId+"_charge_"+chargeId+"' value ='0'/></td></tr>"
				}
			}
		}
	}
	
	return collection;
}
function setBlankAmount(obj) {
	if(obj.value=='0') {
		obj.value='';
	}
}

function storeCharges(waybillId,destinationBranchId){
	
	var dataKey			= Object.keys(activeDeliveryCharges);
	var dataObj			= new Object();
	var locakWayBillIdWiseChargeArr		= new Array();
	for (var i=0; i<dataKey.length; i++) {

		var obj		= activeDeliveryCharges[dataKey[i]];
		
		var objKey	= Object.keys(obj);

		for (var k=0; k<objKey.length; k++){
			var chargeId		= objKey[k];
			var chargeName		= obj[objKey[k]];
			
			dataObj			  	= new Object();
			dataObj.chargeId  	= chargeId;
			dataObj.waybillId 	= waybillId;
			dataObj.destinationBranchId = destinationBranchId
			dataObj.Amount 		= $('#'+waybillId+'_charge_'+chargeId).val();
			wayBillIdWiseChargeArr.push(dataObj);
			locakWayBillIdWiseChargeArr.push(dataObj);
		}
	}
	wayBillIdWiseObj["wayBillId_"+waybillId] = locakWayBillIdWiseChargeArr ;
}