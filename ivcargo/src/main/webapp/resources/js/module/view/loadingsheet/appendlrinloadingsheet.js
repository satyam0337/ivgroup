/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var lsSrcBranchId = 0, lsPropertyConfig = null;
define([
        //the file which has only name they are are already  been loaded
        'marionette'//Marionette
        //marionette JS framework
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/singlelrelements.js'//Elements
        //this is called to get the elements
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/loadingsheet/appendlrinloadingsheetpagetemplate.html'//Template
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchbehavior.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/actionbutton/actionbuttonview.js'//,AcctionbuttonView
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchactionbuttonview.js'//,DispatchActionView
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchfilepath.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/partialConsignmentForDispatchElement.js'// ls message
        ,'slickGridWrapper3'
        ,'elementmodel'
        ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/LsMessage.js'   // ls message
        ,'language'//import in require.config
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/crossingagentdispatch.js'   // ls message
        ], function(Marionette, SingleLRElements, Template, SearchBehavior, AcctionbuttonView, DispatchActionView, FilePath, ModelUrls, PartialConsignment,
        		slickGridWrapper, ElementModel, UrlParameter) {

	'use strict';// this basically give strictness to this specific js 

	var LangKeySet,
	columnHeaderArr,
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	dispatchId,
	lsNumber,
	transportationModeMap = new Object(),
	transportModeId,
	_this,
	dispatchSourceSubregionId,
	dispatchTripDateTime,
	dispatchDestinationBranchId,
	dispatchDestinationSubregionId,
	billSelectionId,
	isDDDV,
	isCrossing = false, crossingAgentId = 0,
	showPartialDispatchButton = false, allowPartialDispatch = false, showPartialPopupOnSingelLRSearch = false, partialDispatchConsignmentChangeConfirmation = false,
	partialAutoCalculateWeightConfirmation = false, transportationMode = null, crossingAgentDestBranchList = null;
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		template: _.template(Template),//this is used to set the static layout and _.template is present in underscore.js
		regions: {//region is given to provide on which element we have to show the elements
			SingleLRDivRegion	: "#LRElementDiv",
			//key is custom and : value is the element id or value as per the jquery standards
			ActionDivRegion		: "#ActionButton",
			DataDivRegion		: "#DataDiv",
//			new code			
			LsRePrintRegion		: "#LsRePrint",
			LsSummaryregion		: "#summaryTable"
		}, initialize: function() {
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element 
			_this = this;
			this.$el.html(this.template);
			dispatchId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			
			let object	= {};
			
			object.dispatchLedgerId	= dispatchId;
			getJSON(object, WEB_SERVICE_URL+'/AppendLRInLoadingSheetWS/loadAppendLRinLS.do?', _this.initializeData, EXECUTE_WITH_ERROR);
		}, events:{
			"click #dispatchBtn": 	"submitDataFromGrid",
			"keydown #singlelrEle"	: 	"searchLRByNumber",
			"click #minifiedLsBtn"	: 	"minifiedPrintBtnLs"
			//"click #isAgentCrossing	checkbox": "showHideCrosiingFeilds",
		}, behaviors: {
			SearchBehavior: {
				behaviorClass: SearchBehavior,
				fieldSelector: "#mainContent :input"
			}
		}, initializeData : function(response) {
			billSelectionId	= response.billSelectionId;
			transportModeId	= response.transportModeId;
			crossingAgentId	= response.crossingAgentId;
			isCrossing		= response.isCrossing;
			lsSrcBranchId	= response.lsSrcBranchId;
			lsNumber		= response.lsNumber;
			isDDDV			= response.isDDDV;
			dispatchTripDateTime		= response.dispatchTripDateTime;
			dispatchDestinationBranchId	= response.destinationBranchId;
			dispatchSourceSubregionId		= response.sourceSubRegionId;
			dispatchDestinationSubregionId	= response.destinationSubRegionId;
			lsPropertyConfig 				= response.lsPropertyConfig;
			showPartialDispatchButton					= response.showPartialDispatchButton;
			allowPartialDispatch						= response.allowPartialDispatch;
			showPartialPopupOnSingelLRSearch			= response.showPartialPopupOnSingelLRSearch;
			partialDispatchConsignmentChangeConfirmation= response.partialDispatchConsignmentChangeConfirmation;
			partialAutoCalculateWeightConfirmation		= response.partialAutoCalculateWeightConfirmation;
			transportationMode				= response.TransportationModeList;
			
			//on show function is triggered when this view is displayed on user's machine browser
			//show tabs in master tab div region
			_this.SingleLRDivRegion.show(new SingleLRElements());
			_this.ActionDivRegion.show(new AcctionbuttonView());
			_this.DataDivRegion.show(new DispatchActionView());
			
			$("#summaryTable").load("/ivcargo/template/dispatch/summarytemplate.html", function() {});
		}, searchLRByNumber : function(e){
			if(e.which == $.ui.keyCode.ENTER||e.keyCode == $.ui.keyCode.ENTER){
				showLayer();
				var object = new Object();
				
				object.WAYBILLNUMBER 		= $('#singlelrEle').val();
				object.lsSrcBranchId 		= lsSrcBranchId;
				object.dispatchTripDateTime = dispatchTripDateTime;
				
				if(isCrossing && crossingAgentId > 0){
					object.isAgentCrossing		= true;
					object.crossingAgentId 		= crossingAgentId;
				}
				
				getJSON(object, WEB_SERVICE_URL+'/dispatchWs/getPendingWaybillForDispatchByWaybillNumber.do?', _this.setData, EXECUTE_WITH_NEW_ERROR);
			}
		}, reprintBtnLs : function(e){
			this.openPrint(dispatchId);
		}, minifiedPrintBtnLs : function(e){	//minified ls button Action
			this.openMinifiedLsPrint(dispatchId);
		}, setData : function(response) {
			$( "#singlelrEle" ).val("");
			
			if(response.message != undefined){
				setTimeout(function(){$('#singlelrEle').focus()}, 100);
				hideLayer();
				return;
			}
			
			if(lsPropertyConfig.showBranchCode) {
				var arr 		= response.LastWayBillNumber.split(lsPropertyConfig.specialCharacterWithBranchCode);
				var isNumber 	= _this.isNumber(arr[0]);
				
				if(!isNumber)
					$("#singlelrEle").val(arr[0] + lsPropertyConfig.specialCharacterWithBranchCode)
			}

			var langObj 								= FilePath.loadLanguage();
			LangKeySet 									= loadLanguageWithParams(langObj);
			columnHeaderArr 							= ModelUrls.urlSearchCollection(response);
			filterConfiguration["searchFilterList"]		= response.searchFilterTypeConfiguration;
			filterConfiguration["listFilterList"]		= response.listFilterTypeConfiguration;
			columnHiddenConfiguration 					= response.byDefaultColumnHiddenConfiguration;

			columnHeaderJsonArr = [];

			var eleArr = columnHeaderArr;
			
			for  (var j = 0; j < eleArr.length; j++) {
				columnHeaderJsonArr.push(new ElementModel(JSON.parse(eleArr[j])).toJSON());
			}
			
			var object 				= new Object();
			
			object.ColumnHead 					= columnHeaderJsonArr;
			object.data 						= response.pendingDispatchArr;
			object.Language 					= LangKeySet;
			object.ColumnHiddenConfiguration 	= columnHiddenConfiguration;
			object.AllowFilter					= filterConfiguration;
			object.CrossingAgentId				= response.crossingAgentId;
			var pendingDispatchArr				= response.pendingDispatchArr;
			crossingAgentDestBranchList		= response.crossingAgentDestBranchList;
			var isAgentCrossing					= response.isAgentCrossing;
		
			hideLayer();
			
			if(transportationMode != undefined) {
				for(var j = 0 ; j < transportationMode.length ; j++){
					transportationModeMap[transportationMode[j].transportModeId] = transportationMode[j].transportModeName;
				}
			}
			
			var selectedGridObject 	= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(selectedGridObject != undefined) {
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
			}
			
			if(pendingDispatchArr.length > 0) {
				if(transportationMode != undefined && !_this.checkDifferentTransportatiobMode(pendingDispatchArr, slickData)
				|| lsPropertyConfig.doNotShowCrossingAgentBranch && !_this.checkForCrossingAgentBranches(pendingDispatchArr, slickData, isAgentCrossing, crossingAgentDestBranchList)
				|| (lsPropertyConfig.validateSourceDestSubregionForSingleLR || lsPropertyConfig.validateSourceDestinationSubRegionAfterLRAdd) && !_this.validateSourceDestinationSubRegionAfterAddingLR(pendingDispatchArr)
				|| (lsPropertyConfig.validateDestinationBranchForSingleLR || lsPropertyConfig.validateDestinationBranchAfterLRAdd) && !_this.validateDestinationBranchAfterAddingLR(pendingDispatchArr)
				|| lsPropertyConfig.billSelection && !_this.checkForSameBillSelection(pendingDispatchArr, slickData)
				|| !lsPropertyConfig.allowDispatchOfDddvLRWithOtherBookingType && !_this.checkForDDDVLRWithOtherBookingType(pendingDispatchArr, slickData))
					return false;
			}
			
			var responseData 					= _this.lrNumberAppend(object);
			
			if(responseData != false) {
				if(showPartialPopupOnSingelLRSearch) {
					if(partialDispatchConsignmentChangeConfirmation) {
						var btModalConfirm = new Backbone.BootstrapModal({
							content		: "Do you want to change consignment ?",
							modalWidth 	: 40,
							okText		:'Yes',
							showFooter 	: true
						}).open();
						btModalConfirm.on('ok', function() {
							$("#Partial0").trigger( "click" );
						})
					} else {
						$("#Partial0").trigger( "click" );
					}
				}
			}
			$('#singlelrEle').focus();
		}, openPrint : function(dispatchId) {
			if ($("#oldJSPForPrint").val() == 'true') {
				window.open('LSView.do?pageId=11&eventId=9&dispatchLedgerId='+dispatchId+'&isSearchModule=true&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			}else if($("#oldDispatchPrint").val() == 'true') {
				window.open('LSView.do?pageId=11&eventId=3&dispatchLedgerId='+dispatchId+'&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			} else if(lsPropertyConfig.defaultDispatchPrint) {
				window.open('InterBranch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid='+dispatchId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');				
			} else if(lsPropertyConfig.branchWiseOldLSPrint) {
				window.open('OutboundManifest.do?pageId=11&eventId=10&dispatchLedgerId='+dispatchId+'&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');				
			}
			
		}, openMinifiedLsPrint:function(dispatchId){
			window.open('InterBranch.do?pageId=340&eventId=10&modulename=minifiedLoadingSheetPrint&masterid='+dispatchId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, lrNumberAppend : function(obj) {
			var dataObject  	= obj.data;
			var lrremarkfield 	= _.findWhere(obj.ColumnHead, {labelId: "lrRemark"});
			
			if(lsPropertyConfig.allowRemarkAsInputField && lrremarkfield != undefined){
				lrremarkfield.dataType = 'input';
				lrremarkfield.buttonCss = '';
			}
			
			if(dataObject.length > 0) {
				changeDisplayProperty('middle-border-boxshadow', 'block');
				changeDisplayProperty('bottom-border-boxshadow', 'block');
				
				if(slickGridWrapper.checkToAddRowInTable({InnerSlickId : 'data'},dataObject,'wayBillId')){
					showAlertMessage('error','LR already added.');
					return false;
				}
				
				_this.showDispatchButton();

				slickGridWrapper.applyGrid(
						{
							ColumnHead						:	obj.ColumnHead, // *compulsory // for table headers
							ColumnData						:	obj.data, 	// *compulsory // for table's data
							Language						:	obj.Language, 			// *compulsory for table's header row language
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
							PersistGridToAppend				:	true,
							UpdateTotalFunction				: 	_this.updatePaidAndTopayAmount	,	
							ShowPartialButton				:	showPartialDispatchButton,
							CallBackFunctionForPartial 		: 	_this.PartialButtonClick,
						});
			}
		}, isNumber : function(value) {
			 if (typeof value === "string")
				return !isNaN(value);
		}, PartialButtonClick : function(grid, dataView, row){
			var jsonObject = new Object();
			jsonObject.row 			= row;
			jsonObject.grid 		= grid;
			jsonObject.dataView 	= dataView;
			jsonObject.partialAutoCalculateWeightConfirmation 	= partialAutoCalculateWeightConfirmation;

			if(!allowPartialDispatch) {
				hideLayer();
				showAlertMessage('error','You do not have permission for partial dispatch !!!');
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
		},updatePaidAndTopayAmount:function(dataView, innerSlickID){

			var l = dataView.getLength();
			var totalTopay 	= 0;
			var totalPaid 	= 0;
			var totalTbb 	= 0;
			var partialLR	= 0;

			for(var i = 0; i < l; i++) {
				if(dataView.getItem(i)['wayBillTypeId'] == WAYBILL_TYPE_TO_PAY)
					totalTopay += parseInt(dataView.getItem(i)['bookingTotal']);
				else if(dataView.getItem(i)['wayBillTypeId'] == WAYBILL_TYPE_PAID)
					totalPaid += parseInt(dataView.getItem(i)['bookingTotal']);
				else if(dataView.getItem(i)['wayBillTypeId'] == WAYBILL_TYPE_CREDIT)
					totalTbb += parseInt(dataView.getItem(i)['bookingTotal']);
				
				if(dataView.getItem(i)['partial'])
					partialLR = partialLR + 1;
			}

			if(isNaN(totalTopay)) totalTopay = 0;
			if(isNaN(totalPaid)) totalPaid = 0;
			if(isNaN(totalTbb)) totalTbb = 0;

			$('*[data-columnTotal='+innerSlickID+'summarytotalPaidAmount]').html(totalPaid);
			$('*[data-columnTotal='+innerSlickID+'summarytotalToPayAmount]').html(totalTopay);
			$('*[data-columnTotal='+innerSlickID+'summarytotalTbbAmount]').html(totalTbb);
			$('*[data-columnTotal='+innerSlickID+'summarytotalAmount]').html(totalTopay+totalPaid+totalTbb);
			$('*[data-columnTotal='+innerSlickID+'summaryPartial]').html(partialLR);
		
		},showDispatchButton:function() {
			$( "#dispatchBtn").removeClass('hide');
			$( "#summaryData").removeClass('hide');
		}, submitDataFromGrid : function(){
			var selectedGridObject = slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			if(selectedGridObject != undefined) {
				var object 		= new Object();
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();

				if(slickData.length <= 0 ) {
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}
				
				if(lsPropertyConfig.appendCrossingLRInLS && isCrossing && crossingAgentId > 0) {
					object.isAgentCrossing	= true;
					object.crossingAgentId	= crossingAgentId;   
				}
				
				object.slickData 			= slickData;
				object.lrArray  			= JSON.stringify(object.slickData);
				object.dispatchLedgerId		= dispatchId;
						
				var btModal = new Backbone.BootstrapModal({
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
				});
			}
		}, onDispatch : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			hideLayer();
			showAlertMessage('success', 'LS ' + lsNumber + ' Appended successfully !');
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=appendLrInLoadingSheet',{trigger: true});
			
			setTimeout(function() {
				location.reload();
			}, 500);
		}, checkDifferentTransportatiobMode : function(pendingDispatchArr, slickData) {
			let newArray	= null;
			
			if(slickData != undefined && slickData.length > 0) {
				newArray = pendingDispatchArr.filter(function (el) {
					return ((el.transportModeId == TRANSPORTATION_MODE_RAIL_ID || el.transportModeId == TRANSPORTATION_MODE_AIR_ID)
							|| (slickData[0].transportModeId == TRANSPORTATION_MODE_RAIL_ID || slickData[0].transportModeId == TRANSPORTATION_MODE_AIR_ID))
							&& (slickData[0].transportModeId != el.transportModeId || transportModeId != el.transportModeId);
				});
			} else {
				newArray = pendingDispatchArr.filter(function (el) {
					return ((el.transportModeId == TRANSPORTATION_MODE_RAIL_ID || el.transportModeId == TRANSPORTATION_MODE_AIR_ID)
							|| (transportModeId == TRANSPORTATION_MODE_RAIL_ID || transportModeId == TRANSPORTATION_MODE_AIR_ID))
							&& (transportModeId != el.transportModeId);
				});
			}
			
			if(newArray.length > 0) {
				showAlertMessage('error', 'Transport Mode ' + transportationModeMap[newArray[0].transportModeId] + ' is  Not allowed in ' + transportationModeMap[transportModeId]);
				return false;
			}
			
			return true;
		}, checkForCrossingAgentBranches : function(dataArray, slickData, isAgentCrossing, crossingAgentDestBranchList) {
			if(dataArray.length > 0 && slickData.length > 0 && crossingAgentDestBranchList != undefined && (isAgentCrossing && !crossingAgentDestBranchList.includes(slickData[0].wayBillDestinationBranchId)
				|| !isAgentCrossing && crossingAgentDestBranchList.includes(slickData[0].wayBillDestinationBranchId))) {
				showAlertMessage('error', 'You Can Not Add Both, Either Add Normal Or Crossing Agent Branch LR');
				return false;
			} 
			
			return true;
		}, validateSourceDestinationSubRegionAfterAddingLR : function(dataArray) {
			let newArray = dataArray.filter(function (el) {
				return dispatchSourceSubregionId != el.handlingSourceSubRegionId || dispatchDestinationSubregionId != el.handlingSubregionId;
			});
			
			if(newArray == null || newArray.length == 0)
				return true;
				
			let lrArray 	= newArray.map(item => item.wayBillNumber);
			
			if(lrArray != undefined && lrArray.length > 0) {
				showAlertMessage('error', 'You can not dispatch LR of different Subregion LR Nos. are ' + lrArray.join(","));
				return false;
			}
						
			return true;
		}, validateDestinationBranchAfterAddingLR : function(dataArray) {
			let newArray = dataArray.filter(function (el) {
				return dispatchDestinationBranchId != el.handlingBranchId;
			});
				
			let lrArray 	= newArray.map(item => item.wayBillNumber);
			
			if(lrArray != undefined && lrArray.length > 0) {
				showAlertMessage('error', 'You can not dispatch LR of different Destination LR Nos. are ' + lrArray.join(","));
				return false;
			}
						
			return true;
		}, checkForSameBillSelection : function(dataArray, slickData) {
			let newArray	= null;
			
			if(slickData != undefined && slickData.length > 0) {
				newArray	= dataArray.filter(function (el) {
					return slickData[0].billSelectionId != el.billSelectionId || billSelectionId != el.billSelectionId;
				});
			} else {
				newArray	= dataArray.filter(function (el) {
					return billSelectionId != el.billSelectionId;
				});
			}
			
			if(newArray != null && newArray.length > 0) {
				showAlertMessage('error', 'Bill LRs Not Allowed with Estimate LRs');
				return false;
			}
			
			return true;
		}, checkForDDDVLRWithOtherBookingType : function(pendingDispatchArr, slickData) {
			let isExist	= false;
			
			if(slickData != undefined && slickData.length > 0) {
				isExist	= pendingDispatchArr.some(function(el) {
	    			return slickData[0].bookingTypeId != el.bookingTypeId || (!isDDDV && el.bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID) || (isDDDV && el.bookingTypeId != DIRECT_DELIVERY_DIRECT_VASULI_ID)
	    		});
    		} else {
				isExist	= pendingDispatchArr.some(function(el) {
	    			return !isDDDV && el.bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID || isDDDV && el.bookingTypeId != DIRECT_DELIVERY_DIRECT_VASULI_ID
	    		});
			}
			
			if(isExist) {
				showAlertMessage('info', 'You can not Dispatch Other LR with Direct Delivery Direct Vasuli !');
				return false;
			}
			
			return true;
		}
	});
});
