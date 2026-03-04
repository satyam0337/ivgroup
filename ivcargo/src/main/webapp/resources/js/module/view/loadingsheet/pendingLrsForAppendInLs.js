var editableDeliveryAt = false;
var activeDeliveryCharges	= null;
var wayBillData				= null;
var wayBillIdWiseObj		= new Object();
var transportModeId,dispatchLedgerId;
define([
		'slickGridWrapper3'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/default/dispatchdetails.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/default/partialConsignmentForDispatchElement.js'
		,'errorshow'
		,'JsonUtility'
		,'messageUtility'
		,'elementTemplateJs'
		,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
		,'nodvalidation'//import in require.config
		//,'/ivcargo/resources/js/backbone/backbone.bootstrap5-modal.js'
		], function (slickGridWrapper, DispatchDetails, PartialConsignment) {
	'use strict';// this basically give strictness to this specific js
	let _this = '', elementValue, crossingAgentId, columnConfiguration, columnConfiguration1, tableProperties, columnHeaderJsonArr = [], crossingChargesJsonArr = [], isAnyReceive, isAnyDDWBs,
	crossingAgentDestBranchList = [], btModal, Language, searchByLRNumber = false, searchByPLSNumber = false, isTableColumnConfig = false, totalLrCommission = 0;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this = this;
			elementValue		= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		}, render: function() {
			showLayer();
			
			//crossingAgentId		= elementValue.crossingAgentId;
			elementValue.isTableColumnConfig	= isTableColumnConfig;
			
			getJSON(Object.assign(elementValue, lsPropertyConfig), WEB_SERVICE_URL+'/loadingSheetWS/getPendingWaybillForDispatch.do', _this.setElementsWithTimeout, EXECUTE_WITH_ERROR);
		}, setElementsWithTimeout : function(response) {
			setTimeout(function() {
				_this.setElements(response);
			}, 1000);
		}, setElements : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				btModal.close();
				return;
			}
			
			if(!isTableColumnConfig) {
				columnConfiguration		= response.columnConfiguration;
				columnConfiguration1	= response.columnConfiguration1;
				tableProperties			= response.tableProperties;
				Language				= response.Language;
				isTableColumnConfig		= true;
			}
			
			crossingChargesJsonArr	= [];
			columnHeaderJsonArr		= _.values(columnConfiguration);
			
			//if(lsPropertyConfig.IsCrossingDispatchAllow && crossingAgentId > 0)
				//crossingChargesJsonArr	= _.values(columnConfiguration1);
			
			if(response.CorporateAccount != undefined) {
				hideAllMessages();
				
				slickGridWrapper.applyGrid(
						{
							ColumnHead		: columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData		: response.CorporateAccount, 	// *compulsory // for table's data
							tableProperties	: tableProperties,
							Language		: Language, 			// *compulsory for table's header row language
							DivId				:	'modalBody',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId		:	'popupData',
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo	: true,
								searchFilter	: false,          // for search filter on serial no
								ListFilter		: false,		// for list filter on serial no
								title 			: "SR No."
							}],
							EditableColumn				: 	false,
							CallBackFunctionToFetchData : 	_this.getDataFromGrid,
							NoVerticalScrollBar	: false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
						});
						
				_this.crossingLRColour('popupData');
				_this.expressDeliveryLRColour('popupData');
				_this.updateShortExcessLRRowColor('popupData');
				_this.blackListPartyLRColour('popupData');
				_this.updateTCELRRowColor('popupData');
				
				$("#modalBody").css("height","450px");
				$("#popupData").css("height","420px");
				$(".slick-viewport").css("height","350px");
				$(".slick-pane-left").css("height","490px");
			}
			
			btModal.on('ok', function() {
				let selectionMsg		= ' Please, Select atleast one LR For Dispatch !';
				let selectedVal 		= slickGridWrapper.getValueForSelectedData({InnerSlickId : 'popupData'}, selectionMsg);
				let selectedGridObject 	= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
				let slickData	= [];
				
				if(selectedGridObject != undefined) {
					let dataView 		= selectedGridObject.getData();
					slickData 			= dataView.getItems();
				} else if(selectedVal != undefined)
					slickData			= selectedVal;
						
				if(selectedVal != undefined && selectedVal.length > 0 && slickData.length > 0) {
					// Prevent selection of TranCE LR
					if (selectedVal.some(lr => { return lr.isTceBooking })) {
						showMessage('error', 'TranCE LR cannot be Append in LS !');
						btModal.close();
						return;
					}
			    
					if(lsPropertyConfig.showPartyIsBlackListedParty && !_this.allowToAddBlackListedLRs(selectedVal))
						return;
						
					if(lsPropertyConfig.billSelection && !_this.checkForSameWithPrevBillSelection(selectedVal, elementValue.prevBillSelectionId))
						return;

					if(lsPropertyConfig.showDivisionSelection && !_this.checkForSameWithPrevDivisionSelection(selectedVal, elementValue.prevDivisionId))
						return;
					
					if(lsPropertyConfig.removeLRForShortExcessReceive && !_this.checkForPendingShortExcess(selectedVal)
					|| !_this.checkForSameTransportationMode(selectedVal, slickData)
					|| lsPropertyConfig.doNotShowCrossingAgentBranch && !_this.checkForCrossingAgentBranches(selectedVal, slickData, crossingAgentId > 0, crossingAgentDestBranchList)
					|| (lsPropertyConfig.validateSourceDestSubregionForSingleLR || lsPropertyConfig.validateSourceDestinationSubRegionAfterLRAdd) && !_this.validateSourceDestinationSubRegionAfterAddingLR(selectedVal, slickData)
					|| lsPropertyConfig.validateDestinationBranchAfterLRAdd && !_this.validateDestinationBranchAfterAddingLR(selectedVal, slickData)
					|| lsPropertyConfig.divisionSelection && !_this.checkForSameDivisionSelection(selectedVal, slickData)
					|| lsPropertyConfig.billSelection && !_this.checkForSameBillSelection(selectedVal, slickData))
						return;
					
					_this.validateAndAddData(selectedVal, selectedGridObject);
				}
			});
		}, crossingLRColour : function(slickgrid) {
			slickGridWrapper.updateRowColor({InnerSlickId : slickgrid}, 'txnType', 2, 'highlight-row-onchange');
		}, expressDeliveryLRColour : function(slickgrid) {
			slickGridWrapper.updateRowColor({InnerSlickId : slickgrid}, 'deliveryToId', 7, 'highlight-row-onchange-blue');
		}, blackListPartyLRColour : function(slickgrid){
			slickGridWrapper.updateRowColor({InnerSlickId : slickgrid}, 'partyBlackListed', 1, 'highlight-row-red');
		}, updateShortExcessLRRowColor : function(slickgrid) {
			slickGridWrapper.updateRowColor({InnerSlickId : slickgrid}, 'shortReceive', 1, 'highlight-row-red');
			slickGridWrapper.updateRowColor({InnerSlickId : slickgrid}, 'excessReceive', 1, 'highlight-row-blue');
		}, updateTCELRRowColor: function(slickgrid) {
    		slickGridWrapper.updateRowColor({InnerSlickId: slickgrid}, 'isTceBooking', true, 'highlight-row-lightBlue');
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
						"<div class='modal-body'>You are Adding Blacklisted Party LRs "+wayBillNumber.substring(0,wayBillNumber.length -1)+"</div><div class='modal-footer'>" +
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
				
			if(shortLRsArray != undefined) {
				showMessage('error', 'Short Entry found for ' + shortLRsArray[0].wayBillNumber + ', Please Settle.');
				return false;
			}
				
			if(excessLRsArray != undefined) {
				showMessage('error', 'Excess Entry found for ' + excessLRsArray[0].wayBillNumber + ', Please Settle.');
				return false;
			}
			
			return true;
		}, checkForSameTransportationMode : function(dataArray, slickData) {

			if(dataArray.length > 0 && slickData.length > 0) {
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
		}, checkForNormalOrCrossingAgentLR : function(dataArray, slickData) {
			let isAgentCrossing		= isCheckBoxChecked('isAgentCrossing');
			
			if(dataArray.length > 0 && crossingAgentDestBranchList != undefined && slickData != undefined && slickData.length > 0) {
				if(isAgentCrossing && !crossingAgentDestBranchList.includes(slickData[0].wayBillDestinationBranchId)
					|| !isAgentCrossing && crossingAgentDestBranchList.includes(slickData[0].wayBillDestinationBranchId)) {
					showMessage('error', 'You Can Not Add Both, Either Add Normal Or Crossing Agent Branch LR');
					hideLayer();
					return false;
				} 
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
			let newArray	= dataArray.filter(function (el) {
				return slickData[0].billSelectionId != el.billSelectionId;
			});
			
			if(newArray != undefined && newArray.length > 0) {
				showMessage('error', 'Bill LRs Not Allowed with Estimate LRs');
				return false;
			}
			
			return true;
		}, checkForSameWithPrevBillSelection : function(dataArray, prevBillSelectionId) {
			let newArray	= dataArray.filter(function (el) {
				return prevBillSelectionId != el.billSelectionId;
			});

			if(newArray != undefined && newArray.length > 0) {
				showMessage('error', 'Bill LRs Not Allowed with Estimate LRs');
				return false;
			}
			
			return true;
		}, checkForSameDivisionSelection : function(dataArray, slickData) {
			let newArray	= dataArray.filter(function (el) {
				return slickData[0].divisionId != el.divisionId;
			});
			
			if(newArray != undefined && newArray.length > 0) {
				showMessage('error', 'You cannot mix the different Division LRs');
				return false;
			}
			
			return true;
		}, checkForSameWithPrevDivisionSelection : function(dataArray, prevDivisionId) {
			let newArray	= dataArray.filter(function (el) {
				return prevDivisionId != el.divisionId;
			});

			if(newArray != undefined && newArray.length > 0) {
				showMessage('error', 'You cannot mix the different Division LRs');
				return false;
			}
			
			return true;
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
		}, checkForTotalNumberOfLRForDispatch : function(slickData) {
			let totalLRExistInLS 	= 0;
			let totalLrAppend	= Number(slickData.length);
			
			if(totalNoOfWayBillsInLS != undefined && totalNoOfWayBillsInLS > 0)
				totalLRExistInLS = totalNoOfWayBillsInLS;
				
			let totalLRCount = totalLRExistInLS + totalLrAppend; 
			
			if(totalLRCount > lsPropertyConfig.totalNumberOfLRAllowToDispatch) {
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
		}, checkForDoorDeliveryLRWithOtherDeliveryTo : function(slickData) {
			let isExist	= slickData.some(function(el) {
				return el.deliveryToId === DELIVERY_TO_DOOR_ID && slickData[0].deliveryToId != el.deliveryToId
			});
			
			if(isExist) {
				showMessage('info', doNotAllowToDispatchOtherLRWithDoorDly);
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
		}, validateAndAddData : function(dataArray, selectedGridObject) {
			_this.getDataFromGrid(dataArray);
		}, getDataFromGrid : function(dataObject) {
			if(dataObject.length > 0) {
				$('#middle-border-boxshadow').removeClass('hide');
				$('#bottom-border-boxshadow').removeClass('hide');
				
				//columnHeaderJsonArr		= columnHeaderJsonArr.concat(crossingChargesJsonArr);
				
				_this.showChargesFeild(dataObject);
				_this.showDispatchButton();
				_this.showExcessEntryButton();

				if(slickGridWrapper.checkToAddRowInTable({InnerSlickId : 'data'}, dataObject, 'wayBillId')) {
					showMessage('error', 'LR already added.');
					return false;
				}

				slickGridWrapper.applyGrid({
							ColumnHead						:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	Language, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'data',
							SerialNo						:[{					// optional field // for showing Row number
								showSerialNo	:	true,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							NoVerticalScrollBar				:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							FetchAllDataButtonId 			: 	'#dispatchBtn',
							ShowDeleteButton 				: 	true,
							EditRowsInSlick 				: 	true,
							ShowPartialButton				:	allowPartialDispatch,
							CallBackFunctionForPartial 		: 	_this.partialButtonClick,
							PersistGridToAppend				:	true,
							UpdateTotalFunction				: 	_this.updatePaidAndTopayAmount			
						});
						
				_this.crossingLRColour('data');
				_this.expressDeliveryLRColour('data');
				_this.updateShortExcessLRRowColor('data');
				_this.blackListPartyLRColour('data');
			}
		}, partialButtonClick : function(grid, dataView, row) {
			let jsonObject = new Object();
			jsonObject.row 			= row;
			jsonObject.grid 		= grid;
			jsonObject.dataView 	= dataView;
			jsonObject.partialAutoCalculateWeightConfirmation 	= partialAutoCalculateWeightConfirmation;

			if(!allowPartialDispatch) {
				hideLayer();
				showMessage('error', 'You do not have permission for partial dispatch !!!');
				return false;
			}
			
			let pendingDispatchStockId = dataView.getItem(row).pendingDispatchStockId;
			
			if(pendingDispatchStockId == undefined || pendingDispatchStockId <= 0) {
				showMessage('error', 'Provide a valid LS Number');
				return;
			}
			
			jsonObject.pendingDispatchStockId	= pendingDispatchStockId;

			let btModal = new Backbone.BootstrapModal({
				content		: new PartialConsignment(jsonObject),
				modalWidth 	: 50,
				title		: ' LR NUMBER : <b>' + dataView.getItem(row).wayBillNumber + '</b>',
				okText		: 'Update',
				showFooter 	: true,
				focusOk 	: false,
				okCloses	: false
			});
			
			jsonObject.btModal = btModal;
			let partialCon = new PartialConsignment(jsonObject)
			btModal.open();
		}, submitDataFromGrid : function(){
			var selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(selectedGridObject != undefined) {
				var object 		= new Object();
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();

				if(slickData.length <= 0) {
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}
				
				if(lsPropertyConfig.validateNumberOfLRToDispatch && !_this.checkForTotalNumberOfLRForDispatch(slickData))
					return false;

				if(!_this.checkForDDDVLRWithOtherBookingType(slickData))
					return false;
				
				if(lsPropertyConfig.appendCrossingLRInLS && isCrossing != undefined && isCrossing && crossingAgentId > 0) {
					object.isAgentCrossing	= true;
					object.crossingAgentId	= crossingAgentId;   
				}
				
				
				object.slickData 			= slickData;
				object.lrArray  			= JSON.stringify(object.slickData);
				object.dispatchLedgerId		= dispatchId;
			
				const lrArray = JSON.parse(object.lrArray);
				
				if (Array.isArray(lrArray) && lrArray.length > 0) {
					const accountGroupId = lrArray[0].accountGroupId;
					const wayBillIds = [...new Set(lrArray.map(item => item.wayBillId))]; 
					const wayBillIdsCsv = wayBillIds.join(',');
					object.accountGroupId		= accountGroupId;
					object.wayBillId			= wayBillIdsCsv;
				}
						
				let btModal = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Dispatch ?",
					modalWidth 	: 	30,
					title		:	'Dispatch Confirmation',
					okText		:	'Yes',
					showFooter 	: 	true,
					okCloses	:	true,
					focusOk		:	true
				}).open();
					
				btModal.on('ok', function() {
					console.log(object);
					getJSON(object, WEB_SERVICE_URL+'/AppendLRInLoadingSheetWS/validateAnddispatchWayBills.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
					showLayer();
					//_this.onDispatch()
				});
			}
		}, onDispatch : function(response) {
			if(response != null && response.LRsFoundForCreateEwayBill != undefined && response.LRsFoundForCreateEwayBill) {
				hideLayer();
				_this.showMessage(response);
				return;
			}
			
			if(response.message != undefined){
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			setTimeout(function(){
				hideLayer();
				showMessage('success','LS '+lsNumber+' Appended successfully !');
			},1000);
			let MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=appendLrInLoadingSheet',{trigger: true});
			location.reload();
		},viewDispatchElements : function(data) {
			if(data != null && data.LRsFoundForCreateEwayBill != undefined && data.LRsFoundForCreateEwayBill) {
				hideLayer();
				_this.showMessage(data);
			} else {
				let selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
				
				if(selectedGridObject != undefined) {
					let object		= {};
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
		}, showMessage : function(response) {
			let height = 33;
			$('.error').addClass("showElemnt");
			$('.error').removeClass("hideElemnt");
			let validatedLRsForCreateEwayBill = response.validatedLRsForCreateEwayBill;
			$('.error').empty();
			$('.error').append('<p>Please, Create E-wayBill For :<span style="float : right;font-size: 20px;"><span onclick="hideAllMessages()" ><span class="glyphicon glyphicon-remove-sign"></span> Close</span></span></p>');
			
			for (let customerDetails in validatedLRsForCreateEwayBill) {
				let consignor = customerDetails.split('_')[0];
				let consignee = customerDetails.split('_')[1];
				let lrDetails = validatedLRsForCreateEwayBill[customerDetails];	
			
				height	= height + 33;
				$('.error').append("<p>LR Nos : " + lrDetails + " ( Consignor - " + consignor + " And Consignee - " + consignee + " )</p>")	
			}
			
			$('.error').animate({
				top : "0",
				height : height
			}, 400);
		}, showChargesFeild : function(dataObject) {
			for(const element of dataObject) {
				let isReceive		= element.wayBillStatus == WAYBILL_STATUS_RECEIVED;  //7 - received lr

				for(const element of columnHeaderJsonArr) {
					if(isReceive) {
						if(element.dataDtoKey == 'netLoading')
							element.buttonCss = 'form-control netLoading show';
						
						if(element.dataDtoKey == 'netUnloading')
							element.buttonCss = 'form-control netUnLoading show';
					} else {
						if(element.dataDtoKey == 'netLoading') {
							element.dataDtoKey = 'xyz';
							element.dataType 	= 'text';
						}
						
						if(element.dataDtoKey == 'netUnloading') {
							element.dataDtoKey = 'xyz';
							element.dataType 	= 'text';
						}
					}

					if(isReceive || crossingAgentId > 0) {
						if(element.dataDtoKey == 'crossingHire')
							element.buttonCss = 'form-control crossingHire show';
					} else if(element.dataDtoKey == 'crossingHire') {
						element.dataDtoKey = 'xyz';
						element.dataType 	= 'text';
					}

					if(crossingAgentId > 0 && element.dataDtoKey == 'lrCommission')
						element.buttonCss = 'form-control lrCommission show';
					else if(element.dataDtoKey == 'lrCommission') {
						element.dataDtoKey = 'xyz';
						element.dataType 	= 'text';
					}
					
					if(isReceive || crossingAgentId > 0) {
						if(element.dataDtoKey == 'crossingLrNumber')
							element.buttonCss = 'form-control crossingLrNumber show';
					} else if(element.dataDtoKey == 'crossingLrNumber') {
						element.dataDtoKey = 'xyz';
						element.dataType 	= 'text';
					}
				}
			}
		}, showDispatchButton : function() {
			$( "#dispatchBtn").removeClass('hide');
			$( "#summaryData").removeClass('hide');
		}, showExcessEntryButton : function() {
			if(lsPropertyConfig.allowExcessEntryInLoading) {
				$( "#excessEntry").removeClass('hide');
				$( "#viewExcessEntry").removeClass('hide');
			}
		}, searchLRByNumber : function(response, prevBillSelectionId) {
			if($('#singlelrEle').val() == '') {
				setTimeout(function(){$('#singlelrEle').focus()}, 100);
				return;
			}

			let accountGroupId 			= response.accountGroupId;
			transportModeId 			= response.transportModeId;
			dispatchLedgerId			= response.dispatchLedgerId;
			
			if(lsPropertyConfig.branchesForAllowAllOption == 0)
				lsPropertyConfig.branchesForAllowAllOption	= '0';
			
			let branchIds				= (lsPropertyConfig.branchesForAllowAllOption).split(",");
			let checkForAllOptionAllow	= true;
			
			if(lsPropertyConfig.validateDestinationBranchForSingleLR) {
				for (const element of branchIds) {
					if(Number(branchModel.branchId) == Number(element))
						checkForAllOptionAllow	= false;
				}
					
				if(checkForAllOptionAllow) {
					next = 'singlelrEle';
					let myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});

					addAutocompleteElementInNode(myNod, 'areaSelectEle', 'Please, Select Destination Area !');

					myNod.performCheck();
						
					if(!myNod.areAll('valid'))
						return;							
				}
			}
				
			if(lsPropertyConfig.validateDestinationBranchAfterLRAdd && Number($('*[data-columnTotal=datatotalNumberofRows]').html()) > 0) {
				for (const element of branchIds) {
					if(Number(branchModel.branchId) == Number(element))
						checkForAllOptionAllow	= false;
				}

				if(checkForAllOptionAllow) {
					next = 'singlelrEle';
					let myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					
					addAutocompleteElementInNode(myNod, 'areaSelectEle', 'Please, Select Destination Area !');
					addAutocompleteElementInNode(myNod, 'branchSelectEle', 'Please, Select Destination Branch !');

					myNod.performCheck();

					if(!myNod.areAll('valid'))
						return;							
				}
			}

			showLayer();
			let object = new Object();

			object.lrNumber		 		= $('#singlelrEle').val();
			object.isAgentCrossing		= isCheckBoxChecked('isAgentCrossing');

			if($('#crossingAgentEle_primary_key').val() > 0) {
				crossingAgentId			= $('#crossingAgentEle_primary_key').val();
				object.crossingAgentId 	= crossingAgentId;
				object.destinationArea	= $('#destinationAreaEle_primary_key').val();
			}
			
			if(accountGroupId == 442) {
				setTimeout(function() {
					hideLayer();
				},10000);
			}
			
			searchByLRNumber	= true;
			searchByPLSNumber	= false;
			
			object.crossingBranchEle_primary_key	= $('#crossingBranchEle_primary_key').val();
			object.isAppendLRInLS = true;
			object.transportationModeId = transportModeId;
			object.dispatchLedgerId = dispatchLedgerId;
			object.lrArray  			= JSON.stringify(object);
			
			getJSON(Object.assign(object, lsPropertyConfig), WEB_SERVICE_URL+'/loadingSheetWS/getPendingWaybillForDispatch.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, searchLRByPLSNumber : function() {
			if($('#plsNumberEle').val() == '') {
				setTimeout(function(){$('#plsNumberEle').focus()}, 100);
				return;
			}
			
			showLayer();
			searchByLRNumber	= false;
			searchByPLSNumber	= true;
			let object = new Object();

			object.plsNumberEle 	= $('#plsNumberEle').val();
			getJSON(Object.assign(object, lsPropertyConfig), WEB_SERVICE_URL+'/loadingSheetWS/getPendingWaybillForDispatch.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			if(response != null && response.LRsFoundForCreateEwayBill != undefined && response.LRsFoundForCreateEwayBill) {
				hideLayer();
				_this.showMessage(response);
				return;
			}
			
			let elementId	 = '';
			
			if(searchByPLSNumber) elementId = 'plsNumberEle';
			else if(searchByLRNumber) elementId = 'singlelrEle';
			
			$( "#" + elementId).val("");
			hideLayer();
			
			if(response.message != undefined) {
				setTimeout(function(){$('#' + elementId).focus()}, 100);
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			let pendingDispatchArr			= response.CorporateAccount;
				crossingAgentDestBranchList	= response.crossingAgentDestBranchList;

			if (transportModeId != pendingDispatchArr[0].transportModeId) {
				showMessage('error', 'Transport Mode ' + transportationModeMap[pendingDispatchArr[0].transportModeId] + ' is  Not allowed in ' + transportationModeMap[transportModeId]);
				return false;
			}
			
			if(searchByLRNumber && lsPropertyConfig.billSelection && !_this.checkForSameWithPrevBillSelection(pendingDispatchArr, prevBillSelectionId))
				return;
				
			if(searchByLRNumber && lsPropertyConfig.showDivisionSelection && !_this.checkForSameWithPrevDivisionSelection(pendingDispatchArr, prevDivisionId))
				return;

			if(lsPropertyConfig.showBranchCode) {
				let arr 		= response.LastWayBillNumber.split(lsPropertyConfig.specialCharacterWithBranchCode);
				let isNumber 	= _this.isNumber(arr[0]);
				
				if(!isNumber)
					$("#" + elementId).val(arr[0] + lsPropertyConfig.specialCharacterWithBranchCode)
			}
			
			let selectedGridObject 	= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});

			if(selectedGridObject != undefined) {
				let dataView 	= selectedGridObject.getData();
				let slickData 	= dataView.getItems();

				if(slickData.length > 0 && (!_this.checkForSameTransportationMode(pendingDispatchArr, slickData)
					|| lsPropertyConfig.doNotShowCrossingAgentBranch && !_this.doNotShowCrossingAgentBranch(pendingDispatchArr, slickData)
					|| (lsPropertyConfig.validateSourceDestSubregionForSingleLR || lsPropertyConfig.validateSourceDestinationSubRegionAfterLRAdd) && !_this.validateSourceDestinationSubRegionAfterAddingLR(pendingDispatchArr, slickData)
					|| lsPropertyConfig.showDivisionSelection && !_this.checkForSameDivisionSelection(pendingDispatchArr, slickData)
					|| lsPropertyConfig.billSelection && !_this.checkForSameBillSelection(pendingDispatchArr, slickData)))
					return;
			}
			
			_this.showMessageForBlackListedParty(pendingDispatchArr);
			
			if(!isTableColumnConfig) {
				columnConfiguration		= response.columnConfiguration;
				columnConfiguration1	= response.columnConfiguration1;
				tableProperties			= response.tableProperties;
				Language				= response.Language;
				isTableColumnConfig		= true;
			}
			
			crossingChargesJsonArr	= [];
			columnHeaderJsonArr		= _.values(columnConfiguration);
			Language				= response.Language;
			
			if(lsPropertyConfig.IsCrossingDispatchAllow)
				crossingChargesJsonArr	= _.values(columnConfiguration1);
			
			let responseData = _this.getDataFromGrid(pendingDispatchArr);
			
			_this.setAreaOrDestinationBranchAferAddingLR(pendingDispatchArr);
			$('#' + elementId).focus();
		}, isNumber : function(value) {
			 if (typeof value === "string")
				return !isNaN(value);
		}, showMessageForBlackListedParty : function(pendingDispatchArr) {
			if(lsPropertyConfig.showPartyIsBlackListedParty) {
				for(const element of pendingDispatchArr) {
					if(element.consignorBlackListed > 0 && element.tbbPartyBlackListed > 0)
						showMessage('error','Consignor And TBB is BlackListed');
					else if(element.consignorBlackListed > 0)
						showMessage('error','Consignor Party is BlackListed');
					else if(element.consigneeBlackListed >0)
						showMessage('error',' Consignee Party is BlackListed')
					else if(element.tbbPartyBlackListed > 0)
						showMessage('error',' TBB Party is BlackListed');
				}
				
				slickGridWrapper.updateRowColor({InnerSlickId:'data'}, 'partyBlackListed', 1, 'highlight-row-red');
			}
		}, setAreaOrDestinationBranchAferAddingLR : function(pendingDispatchArr) {
			if(lsPropertyConfig.setAreaORDestinationBranchAfterLRAdd && $('#areaSelectEle_primary_key').val() <= 0 && $('#branchSelectEle_primary_key').val() <= 0) {
				$('#areaSelectEle').val(pendingDispatchArr[0].wayBillDestinationSubRegionName);
				$('#areaSelectEle_primary_key').val(pendingDispatchArr[0].wayBillDestinationSubRegionId);
				$('#branchSelectEle').val(pendingDispatchArr[0].handlingBranchName);
				$('#branchSelectEle_primary_key').val(pendingDispatchArr[0].handlingBranchId);
			}
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
