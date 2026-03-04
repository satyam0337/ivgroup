/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var checkForAllOptionAllow  = true;
var	unloadingCrossingBranchId	= 0; var excessEntryDetailsArray = new Array();
var lsPropertyConfig	= null, transportationModeList, transportationModeMap = {}, deliveryToList, latestDispatchData = null, billSelectionList, crossingBrnachList,
showPartialDispatchButton = false, allowPartialDispatch = false, partialAutoCalculateWeightConfirmation = false, manualLsSequenceCounterPresent = false, manualLSSequenceCounter = null;
define([
	//the file which has only name they are are already  been loaded
	'marionette'//Marionette
	//marionette JS framework
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/searchOperationelements.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/crossingdispatchelements.js'//CrossingElements
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchelements.js'//Elements
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/singlelrelements.js'//Elements
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/singleplselements.js'
	//this is called to get the elements
	,'text!'+PROJECT_IVVIEWPAGES+'/template/dispatch/dispatchpagetemplate.html'//Template
	//text! is used to convert the html to plain text which helps to fetch HTML through require
	//Master Template is used to get standard Layout of master pages
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchbehavior.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/actionbutton/actionbuttonview.js'//,AcctionbuttonView
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchactionbuttonview.js'//,DispatchActionView
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/pendingLrForDispatch.js'//,PendingLrForDispatch
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchfilepath.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/LsMessage.js'   // ls message
	,'slickGridWrapper3'
	,'elementmodel'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/crossingagentdispatch.js'   // ls message
	], function(Marionette, SearchOperation, CrossingElements, Elements, SingleLRElements, SinglePLSElements, Template, SearchBehavior, AcctionbuttonView, DispatchActionView, PendingLrForDispatch, FilePath, ModelUrls, LsMessage,
			slickGridWrapper, ElementModel, UrlParameter) {

	'use strict';// this basically give strictness to this specific js 

	var myNod,
	LangKeySet,
	columnHeaderArr,
	crossingChargesModelArr,
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	crossingChargesJsonArr,
	dispatchId,
	lsNumber,
	isLhpvLockingAfterLsCreation,
	isNewModuleLhpvLockingAfterLsCreation,
	_this, branchModel,
	showPartialPopupOnSingelLRSearch = false,partialDispatchConsignmentChangeConfirmation = false;
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		template: _.template(Template),//this is used to set the static layout and _.template is present in underscore.js
		regions: {//region is given to provide on which element we have to show the elements
			searchElementDiv		: "#searchElementDiv",
			CrossingElementDiv		: "#CrossingElementDiv", 
			ElementDivRegion		: "#ElementDiv",
			SingleLRDivRegion		: "#LRElementDiv",
			SinglePLSDivRegion		: "#plsElementDiv",
			SinglePLSLabelDivRegion : "#plsLabelDiv",
			//key is custom and 	: value is the element id or value as per the jquery standards
			ActionDivRegion			: "#ActionButton",
			DataDivRegion			: "#DataDiv",
//			new code			
			LsRePrintRegion			: "#LsRePrint"
		}, initialize: function(){
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element 
			_this = this;
			this.$el.html(this.template);
			dispatchId 								= UrlParameter.getModuleNameFromParam(MASTERID);
			lsNumber   								= UrlParameter.getModuleNameFromParam(MASTERID2);
			isLhpvLockingAfterLsCreation			= UrlParameter.getModuleNameFromParam('isLhpvLockingAfterLsCreation');
			isNewModuleLhpvLockingAfterLsCreation	= UrlParameter.getModuleNameFromParam('isNewModuleLhpvLockingAfterLsCreation');

			getJSON(null, WEB_SERVICE_URL+'/dispatchWs/getDispatchElementData.do', _this.setElements, EXECUTE_WITH_ERROR);
		}, setElements: function(response) {
			lsPropertyConfig				= response.lsPropertyConfig;
			transportationModeList 			= response.TransportationModeList;
			deliveryToList					= response.DeliveryToList;
			latestDispatchData				= response.latestDispatchData;
			billSelectionList				= response.billSelectionList;
			crossingBrnachList				= response.crossingBrnachList;
			branchModel						= response.branchModel;
			showPartialDispatchButton				= response.showPartialDispatchButton;
			allowPartialDispatch					= response.allowPartialDispatch;
			partialAutoCalculateWeightConfirmation	= response.partialAutoCalculateWeightConfirmation;
			showPartialPopupOnSingelLRSearch		= response.showPartialPopupOnSingelLRSearch;
			partialDispatchConsignmentChangeConfirmation	= response.partialDispatchConsignmentChangeConfirmation;
			manualLsSequenceCounterPresent		= response.manualLsSequenceCounterPresent;
			manualLSSequenceCounter				= response.manualLSSequenceCounter;
			
			if(typeof createVideoLink != 'undefined') createVideoLink(response);
			//on show function is triggered when this view is displayed on user's machine browser
			//show tabs in master tab div region
			hideLayer();
			
			if(dispatchId != null && lsNumber != null) {
				let jsonInobj = new Object();
				jsonInobj.lsNumber = lsNumber;
				
				_this.LsRePrintRegion.show(new LsMessage(jsonInobj));

				if(isLhpvLockingAfterLsCreation == 'false' && isNewModuleLhpvLockingAfterLsCreation == 'false') {
					showMessage('success', 'LS ' + lsNumber + ' created successfully !');
					hideLayer();
				}
				
				if(!lsPropertyConfig.doNotOpenPrintPopupAfterDispatch) {
					_this.openPrint(dispatchId);
					hideLayer();
				}
			}
			
			_this.searchElementDiv.show(new SearchOperation());
			_this.CrossingElementDiv.show(new CrossingElements());
			_this.ElementDivRegion.show(new Elements(response));
			_this.SingleLRDivRegion.show(new SingleLRElements());
			_this.SinglePLSDivRegion.show(new SinglePLSElements());
			_this.ActionDivRegion.show(new AcctionbuttonView());
			_this.DataDivRegion.show(new DispatchActionView());
			
			if(lsPropertyConfig.groupWiseLanguageFileLoad)
				loadLanguageWithParams(FilePath.loadLanguageGroupWise(lsPropertyConfig.accountGroupId));
			else
				loadLanguageWithParams(FilePath.loadLanguage());
			
			$("#summaryTable").load("/ivcargo/html/module/dispatch/summarytemplate.html", function() {});
		}, triggers: {
			"click #searchBtn"		: 	"search",
			"click #dispatchBtn"	: 	"saveDispatch",
			"click #excessEntry"	: 	"enterExcessEntry",
			"click #viewExcessEntry": 	"viewExcessEntry",
		}, events:{
			"keydown #singlelrEle"	: 	"searchLRByNumber",
			"keydown #singleplsEle"	: 	"searchLRByPLSNumber",
			"click #reprintBtn" 	: 	"reprintBtnLs",	
			"click #hamaliDetailsBtn" 	: 	"hamaliDetailsBtnLs",
			"click #minifiedLsBtn"	: 	"minifiedPrintBtnLs"
				//"click #isAgentCrossing	checkbox": "showHideCrosiingFeilds",
		}, behaviors: {
			SearchBehavior: {
				behaviorClass: SearchBehavior,
				fieldSelector: "#mainContent :input"
			}
		}, searchLRByNumber : function(e){
			if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER) {
				let accountGroupId = branchModel.accountGroupId;
				
				if(lsPropertyConfig.validateDestinationBranchForSingleLR) {
					var branchIds	= (lsPropertyConfig.branchesForAllowAllOption).split(",")
					
					for (const element of branchIds) {
						if(Number(branchModel.branchId) == Number(element)) {
							checkForAllOptionAllow	= false;
						}
					}
					
					if(checkForAllOptionAllow) {
						next = 'singlelrEle';
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#areaSelectEle',
							validate: 'checkForNumber:#areaSelectEle_primary_key',
							errorMessage: 'Please Select Specific Sub Region !'
						});

						myNod.performCheck();
						
						if(!myNod.areAll('valid'))
							return;							
					}
				}
				
				if(lsPropertyConfig.validateDestinationBranchAfterLRAdd && Number($('*[data-columnTotal=datatotalNumberofRows]').html()) > 0) {
					var branchIds	= (lsPropertyConfig.branchesForAllowAllOption).split(",")

					for (const element of branchIds) {
						if(Number(branchModel.branchId) == Number(element))
							checkForAllOptionAllow	= false;
					}

					if(checkForAllOptionAllow) {
						next = 'singlelrEle';
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#areaSelectEle',
							validate: 'checkForNumber:#areaSelectEle_primary_key',
							errorMessage: 'Please Select Specific Sub Region !'
						});

						myNod.add({
							selector: '#branchSelectEle',
							validate: 'checkForNumber:#branchSelectEle_primary_key',
							errorMessage: 'Please Select Specific Branch !'
						});

						myNod.performCheck();
						
						if(!myNod.areAll('valid'))
							return;							
					}
				}

				showLayer();
				let object = new Object();

				object.WAYBILLNUMBER 		= $('#singlelrEle').val();
				object.isAgentCrossing		= isCheckBoxChecked('isAgentCrossing');

				if($('#crossingAgentSelectEle_primary_key').val() > 0) {
					object.crossingAgentId 	= $('#crossingAgentSelectEle_primary_key').val();
					object.destinationArea	= $('#destinationAreaEle_primary_key').val();
				}
				
				if(accountGroupId == 442) {
					setTimeout(function() {
						hideLayer();
					},10000);
				}
				
				object.crossingBranchEle_primary_key	= $('#crossingBranchEle_primary_key').val();
				
				getJSON(object, WEB_SERVICE_URL+'/dispatchWs/getPendingWaybillForDispatchByWaybillNumber.do?', _this.setData, EXECUTE_WITH_NEW_ERROR);
			}
		}, searchLRByPLSNumber : function(e) {
			if(e.which == $.ui.keyCode.ENTER||e.keyCode == $.ui.keyCode.ENTER){
				showLayer();
				let object = new Object();

				object.PLSNUMBER 		= $('#singleplsEle').val();
				getJSON(object, WEB_SERVICE_URL+'/dispatchWs/getPendingWaybillForDispatchByPLSNumber.do?', _this.setPLSData, EXECUTE_WITH_NEW_ERROR);
			}
		}, reprintBtnLs : function() {
			this.openPrint(dispatchId);
		}, hamaliDetailsBtnLs:function() {
			this.openHamaliPrint(dispatchId);
		}, minifiedPrintBtnLs:function() {	//minified ls button Action
			this.openMinifiedLsPrint(dispatchId);
		}, setData : function(response) {
			$( "#singlelrEle" ).val("");
			
			if(response.message != undefined) {
				setTimeout(function(){$('#singlelrEle').focus()}, 100);
				hideLayer();
				return;
			}
			
			if(lsPropertyConfig.showBranchCode) {
				let arr 		= response.LastWayBillNumber.split(lsPropertyConfig.specialCharacterWithBranchCode);
				let isNumber 	= _this.isNumber(arr[0]);
				
				if(!isNumber)
					$("#singlelrEle").val(arr[0] + lsPropertyConfig.specialCharacterWithBranchCode)
			}
			
			editableDeliveryAt						= lsPropertyConfig.editableDeliveryAt;

			let langObj 								= FilePath.loadLanguage();
			LangKeySet 									= loadLanguageWithParams(langObj);
			columnHeaderArr 							= ModelUrls.urlSearchCollection(response);
			
			filterConfiguration["searchFilterList"]		= response.searchFilterTypeConfiguration;
			filterConfiguration["listFilterList"]		= response.listFilterTypeConfiguration;
			columnHiddenConfiguration 					= response.byDefaultColumnHiddenConfiguration;

			columnHeaderJsonArr = [];

			let eleArr = columnHeaderArr;

			for  (var j = 0; j < eleArr.length; j++) {
				columnHeaderJsonArr.push(new ElementModel(JSON.parse(eleArr[j])).toJSON());
			}

			crossingChargesJsonArr	= [];

			if(lsPropertyConfig.IsCrossingDispatchAllow) {
				crossingChargesModelArr			= ModelUrls.crossingChargesCollection(response);
				
				for  (const element of crossingChargesModelArr) {
					crossingChargesJsonArr.push(new ElementModel(JSON.parse(element)).toJSON());
				}
			}
			
			let pendingDispatch 	= new PendingLrForDispatch();
			let object 				= new Object();
			object.ColumnHead 					= columnHeaderJsonArr;
			object.ColumnHead1					= crossingChargesJsonArr;
			object.data 						= response.pendingDispatchArr;
			object.Language 					= LangKeySet;
			object.ColumnHiddenConfiguration 	= columnHiddenConfiguration;
			object.AllowFilter					= filterConfiguration;
			object.CrossingAgentId				= response.crossingAgentId;
			object.GeneralConfiguration			= lsPropertyConfig;
			object.PersistGridToAppend			= true;
			let crossingAgentDestBranchList		= response.crossingAgentDestBranchList
			let isAgentCrossing					= response.isAgentCrossing
			let pendingDispatchArr				= response.pendingDispatchArr
			let responseData					= false;
			
			if(transportationModeList != undefined && transportationModeList.length > 0) {
				for(const element of transportationModeList) {
					transportationModeMap[element.transportModeId] = element.transportModeName;
				}
			}
			
			var selectedGridObject 	= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(selectedGridObject != undefined) {
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
			}
			
			if(slickData == undefined) slickData = [];

			if(!pendingDispatch.checkForSameTransportationMode(pendingDispatchArr, slickData))
				return;
			
			if(lsPropertyConfig.doNotShowCrossingAgentBranch
				&& !pendingDispatch.checkForCrossingAgentBranches(pendingDispatchArr, slickData, isAgentCrossing, crossingAgentDestBranchList))
				return;
			
			if((lsPropertyConfig.validateSourceDestSubregionForSingleLR || lsPropertyConfig.validateSourceDestinationSubRegionAfterLRAdd) && !pendingDispatch.validateSourceDestinationSubRegionAfterAddingLR(pendingDispatchArr, slickData))
				return;
			
			if(lsPropertyConfig.billSelection && !pendingDispatch.checkForSameBillSelection(pendingDispatchArr, slickData))
				return;
			
			if(lsPropertyConfig.doNotAllowedOtherLrsInDoorDeliveryLrs && !pendingDispatch.checkForDoorDeliveryLRWithOtherDeliveryTo(slickData, pendingDispatchArr))
				return false;
			
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
				
				slickGridWrapper.updateRowColor({InnerSlickId:'data'},'partyBlackListed',1,'highlight-row-red');
			}
			
			if(lsPropertyConfig.validateDestinationBranchForSingleLR || lsPropertyConfig.validateDestinationBranchAfterLRAdd) {
				if(checkForAllOptionAllow) {
					if(Number($('#branchSelectEle_primary_key').val()) > 0) {
						if(Number($('#branchSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].handlingBranchId)){
							responseData = pendingDispatch.lrNumberAppend(object);
						} else {
							if(lsPropertyConfig.confirmForAddOtherDestinationLR) {
								var btModalConfirm = new Backbone.BootstrapModal({
									content				: "You are adding LR of different destination.Are you sure you want to add ?",
									title				: 'Confirmation Dialog',
									modalWidth 			: 30,
									showAddButtonText	: 'Yes',
									showFooter 			: true,
									showAddButton		: true,
									focusOk				: false,
									focusAdd			: true
								}).open();
								
								btModalConfirm.on('add', function() {
									responseData = pendingDispatch.lrNumberAppend(object);
								})
							} else {
								showMessage('error', 'Your Selected Destination Branch Does Not Match With LR Destination Branch');
							}
						}
					} else if (!lsPropertyConfig.validateDestinationBranchAfterLRAdd) {
						if(Number($('#areaSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].wayBillDestinationSubRegionId))
							responseData = pendingDispatch.lrNumberAppend(object);
						else
							showMessage('error', 'Your Selected Sub Region Does Not Match With LR Destination Sub Region');
					} else
						responseData = pendingDispatch.lrNumberAppend(object);
				} else if(Number($('#branchSelectEle_primary_key').val()) > 0) {
					if(Number($('#branchSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].handlingBranchId)){
						responseData = pendingDispatch.lrNumberAppend(object);
					} else {
						if(lsPropertyConfig.confirmForAddOtherDestinationLR) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content				: "You are adding LR of different destination.Are you sure you want to add ?",
								title				: 'Confirmation Dialog',
								modalWidth 			: 30,
								showAddButtonText	: 'Yes',
								showFooter 			: true,
								showAddButton		: true,
								focusOk				: false,
								focusAdd			: true
							}).open();
								
							btModalConfirm.on('add', function() {
								responseData = pendingDispatch.lrNumberAppend(object);
							})
						} else
							showMessage('error', 'Your Selected Destination Branch Does Not Match With LR Destination Branch');
					}
				} else if(Number($('#areaSelectEle_primary_key').val()) > 0) {
					if (!lsPropertyConfig.validateDestinationBranchAfterLRAdd) {
						if(Number($('#areaSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].wayBillDestinationSubRegionId))
							responseData = pendingDispatch.lrNumberAppend(object);
						else
							showMessage('error', 'Your Selected Sub Region Does Not Match With LR Destination Sub Region');
					} else
						responseData = pendingDispatch.lrNumberAppend(object);
				} else
					responseData = pendingDispatch.lrNumberAppend(object);
			} else if(lsPropertyConfig.validateSourceBranchForSingleLR || lsPropertyConfig.validateSourceBranchAfterLRAdd) {
				if(Number($('#sourceSelectEle_primary_key').val()) > 0) {
					if(Number($('#sourceSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].wayBillSourceBranchId)){
						if(lsPropertyConfig.confirmForAddOtherLROfSameSource) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content				: " 1 LR is already added in loading sheet do want to Add this lr ?",
								title				: 'Confirmation Dialog',
								modalWidth 			: 30,
								showFooter 			: true,
								focusOk				: true,
								okText				: 'YES',
								okCloses			: true
							}).open();
							
							btModalConfirm.on('ok', function() {
								responseData = pendingDispatch.lrNumberAppend(object);
							})
						}
					} else
						showMessage('error', 'you can not dispatch LRs Of Other Source Branch');
				} else {
					$('#sourceSelectEle_primary_key').val((response.pendingDispatchArr)[0].wayBillSourceBranchId);
					responseData = pendingDispatch.lrNumberAppend(object);
				}
			} else if(lsPropertyConfig.validateDeliveryTo || lsPropertyConfig.validateDeliveryToAfterLRAdd) {
				if(Number($('#deliveryAtSearchEle_primary_key').val()) > 0) {
					if(Number($('#deliveryAtSearchEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].deliveryToId))
						responseData = pendingDispatch.lrNumberAppend(object);
					else
						showMessage('error', 'You can not dispatch LRs Of Multiple Delivery To At same time');
				} else {
					$('#deliveryAtSearchEle_primary_key').val((response.pendingDispatchArr)[0].deliveryToId);
					responseData = pendingDispatch.lrNumberAppend(object);
				}
			} else
				responseData = pendingDispatch.lrNumberAppend(object);
				
			hideLayer();

			if(responseData != false) {
				if(showPartialPopupOnSingelLRSearch) {
					if(partialDispatchConsignmentChangeConfirmation) {
						var btModalConfirm = new Backbone.BootstrapModal({
							content		: "Do you want to change consgignment ?",
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

			if(lsPropertyConfig.setAreaORDestinationBranchAfterLRAdd && $('#areaSelectEle_primary_key').val() <= 0 && $('#branchSelectEle_primary_key').val() <= 0) {
				$('#areaSelectEle').val(response.pendingDispatchArr[0].wayBillDestinationSubRegionName);
				$('#areaSelectEle_primary_key').val(response.pendingDispatchArr[0].wayBillDestinationSubRegionId);
				$('#branchSelectEle').val(response.pendingDispatchArr[0].handlingBranchName);
				$('#branchSelectEle_primary_key').val(response.pendingDispatchArr[0].handlingBranchId);
			}
			
			if(lsPropertyConfig.showPartyIsBlackListedParty) {
				var selectedGridObject 	= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
				var dataView 			= selectedGridObject.getData();
				var slickData 			= dataView.getItems();
				
				for(const element of slickData){
					slickGridWrapper.updateRowColor({InnerSlickId:'data'},'partyBlackListed',1,'highlight-row-red');
				}
			}
	
			$('#singlelrEle').focus();
		},setPLSData : function(response) {
			$( "#singleplsEle" ).val("");
			
			if(response.message != undefined) {
				setTimeout(function(){$('#singleplsEle').focus()}, 100);
				hideLayer();
				return;
			}
			
			if(lsPropertyConfig.showBranchCode) {
				let arr 		= response.LastWayBillNumber.split(lsPropertyConfig.specialCharacterWithBranchCode);
				let isNumber 	= _this.isNumber(arr[0]);
				
				if(!isNumber)
					$("#singleplsEle").val(arr[0] + lsPropertyConfig.specialCharacterWithBranchCode)
			}
			
			editableDeliveryAt						= lsPropertyConfig.editableDeliveryAt;

			let langObj 								= FilePath.loadLanguage();
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

			crossingChargesJsonArr	= [];

			if(lsPropertyConfig.IsCrossingDispatchAllow) {
				crossingChargesModelArr			= ModelUrls.crossingChargesCollection(response);
				
				for  (const element of crossingChargesModelArr) {
					crossingChargesJsonArr.push(new ElementModel(JSON.parse(element)).toJSON());
				}
			}
			
			var pendingDispatch 	= new PendingLrForDispatch();
			var object 				= new Object();
			object.ColumnHead 					= columnHeaderJsonArr;
			object.ColumnHead1					= crossingChargesJsonArr;
			object.data 						= response.pendingDispatchArr;
			object.Language 					= LangKeySet;
			object.ColumnHiddenConfiguration 	= columnHiddenConfiguration;
			object.AllowFilter					= filterConfiguration;
			object.CrossingAgentId				= response.crossingAgentId;
			object.PersistGridToAppend			= false;
			
			let pendingDispatchArr				= response.pendingDispatchArr
			let responseData					= false;
			
			if(transportationModeList != undefined && transportationModeList.length > 0) {
				for(const element of transportationModeList) {
					transportationModeMap[element.transportModeId] = element.transportModeName;
				}
			}
			
			var selectedGridObject 	= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(selectedGridObject != undefined) {
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();

				if(pendingDispatchArr.length > 0 && slickData != undefined && slickData.length > 0) {
					for(const element of pendingDispatchArr) {
						if((element.transportModeId == TRANSPORTATION_MODE_RAIL_ID || element.transportModeId == TRANSPORTATION_MODE_AIR_ID) 
								|| (slickData[0].transportModeId == TRANSPORTATION_MODE_RAIL_ID || slickData[0].transportModeId == TRANSPORTATION_MODE_AIR_ID)) {
							if(slickData[0].transportModeId != element.transportModeId) {
								showMessage('error', 'Transport Mode '+transportationModeMap[element.transportModeId]+' is  Not allowed in '+ transportationModeMap[slickData[0].transportModeId]);
								hideLayer();
								return false;
							}
						}
					}
				}
			}
			
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
				
				slickGridWrapper.updateRowColor({InnerSlickId:'data'},'partyBlackListed',1,'highlight-row-red');
			}
			
			if(lsPropertyConfig.validateDestinationBranchForSingleLR || lsPropertyConfig.validateDestinationBranchAfterLRAdd) {
				if(checkForAllOptionAllow) {
					if(Number($('#branchSelectEle_primary_key').val()) > 0) {
						if(Number($('#branchSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].handlingBranchId)){
							responseData = pendingDispatch.lrNumberAppend(object);
						} else {
							if(lsPropertyConfig.confirmForAddOtherDestinationLR) {
								var btModalConfirm = new Backbone.BootstrapModal({
									content				: "You are adding LR of different destination.Are you sure you want to add ?",
									title				: 'Confirmation Dialog',
									modalWidth 			: 30,
									showAddButtonText	: 'Yes',
									showFooter 			: true,
									showAddButton		: true,
									focusOk				: false,
									focusAdd			: true
								}).open();
								
								btModalConfirm.on('add', function() {
									responseData = pendingDispatch.lrNumberAppend(object);
								})
							} else
								showMessage('error', 'Your Selected Destination Branch Does Not Match With LR Destination Branch');
						}
					} else if (!lsPropertyConfig.validateDestinationBranchAfterLRAdd) {
						if(Number($('#areaSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].wayBillDestinationSubRegionId))
							responseData = pendingDispatch.lrNumberAppend(object);
						else
							showMessage('error', 'Your Selected Sub Region Does Not Match With LR Destination Sub Region');
					} else
						responseData = pendingDispatch.lrNumberAppend(object);
				} else {
					if(Number($('#branchSelectEle_primary_key').val()) > 0) {
						if(Number($('#branchSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].handlingBranchId)){
							responseData = pendingDispatch.lrNumberAppend(object);
						} else if(lsPropertyConfig.confirmForAddOtherDestinationLR) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content				: "You are adding LR of different destination.Are you sure you want to add ?",
								title				: 'Confirmation Dialog',
								modalWidth 			: 30,
								showAddButtonText	: 'Yes',
								showFooter 			: true,
								showAddButton		: true,
								focusOk				: false,
								focusAdd			: true
							}).open();
								
							btModalConfirm.on('add', function() {
								responseData = pendingDispatch.lrNumberAppend(object);
							})
						} else
							showMessage('error', 'Your Selected Destination Branch Does Not Match With LR Destination Branch');
					} else if(Number($('#areaSelectEle_primary_key').val()) > 0) {
						if (!lsPropertyConfig.validateDestinationBranchAfterLRAdd) {
							if(Number($('#areaSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].wayBillDestinationSubRegionId))
								responseData = pendingDispatch.lrNumberAppend(object);
							else
								showMessage('error', 'Your Selected Sub Region Does Not Match With LR Destination Sub Region');
						} else
							responseData = pendingDispatch.lrNumberAppend(object);
					} else
						responseData = pendingDispatch.lrNumberAppend(object);
				}
			} else if(lsPropertyConfig.validateSourceBranchForSingleLR || lsPropertyConfig.validateSourceBranchAfterLRAdd) {
				if(Number($('#sourceSelectEle_primary_key').val()) > 0) {
					if(Number($('#sourceSelectEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].wayBillSourceBranchId)){
						if(lsPropertyConfig.confirmForAddOtherLROfSameSource) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content				: " 1 LR is already added in loading sheet do want to Add this lr ?",
								title				: 'Confirmation Dialog',
								modalWidth 			: 30,
								showFooter 			: true,
								focusOk				: true,
								okText				: 'YES',
								okCloses			: true
							}).open();
							
							btModalConfirm.on('ok', function() {
								responseData = pendingDispatch.lrNumberAppend(object);
							})
						}
					} else
						showMessage('error', 'You can not dispatch LRs Of Other Source Branch');
				} else {
					$('#sourceSelectEle_primary_key').val((response.pendingDispatchArr)[0].wayBillSourceBranchId);
					responseData = pendingDispatch.lrNumberAppend(object);
				}
			} else if(lsPropertyConfig.validateDeliveryTo || lsPropertyConfig.validateDeliveryToAfterLRAdd) {
				if(Number($('#deliveryAtSearchEle_primary_key').val()) > 0) {
					if(Number($('#deliveryAtSearchEle_primary_key').val()) == Number((response.pendingDispatchArr)[0].deliveryToId))
						responseData = pendingDispatch.lrNumberAppend(object);
					else
						showMessage('error', 'You can not dispatch LRs Of Multiple Delivery To At same time');
				} else {
					$('#deliveryAtSearchEle_primary_key').val((response.pendingDispatchArr)[0].deliveryToId);
					responseData = pendingDispatch.lrNumberAppend(object);
				}
			} else
				responseData = pendingDispatch.lrNumberAppend(object);
			
			unloadingCrossingBranchId		= $("#crossingBranchEle_primary_key").val();
			hideLayer();

			if(responseData != false) {
				if(showPartialPopupOnSingelLRSearch) {
					if(partialDispatchConsignmentChangeConfirmation) {
						var btModalConfirm = new Backbone.BootstrapModal({
							content		: "Do you want to change consgignment ?",
							modalWidth 	: 40,
							okText		:'Yes',
							showFooter 	: true
						}).open();
						btModalConfirm.on('ok', function() {
							$("#Partial0").trigger( "click" );
						})
					} else
						$("#Partial0").trigger( "click" );
				}
			}

			if(lsPropertyConfig.setAreaORDestinationBranchAfterLRAdd) {
				if($('#areaSelectEle_primary_key').val() <= 0 && $('#branchSelectEle_primary_key').val() <= 0) {
					$('#areaSelectEle').val(response.pendingDispatchArr[0].wayBillDestinationSubRegionName);
					$('#areaSelectEle_primary_key').val(response.pendingDispatchArr[0].wayBillDestinationSubRegionId);
					$('#branchSelectEle').val(response.pendingDispatchArr[0].handlingBranchName);
					$('#branchSelectEle_primary_key').val(response.pendingDispatchArr[0].handlingBranchId);
				}
			}

			if(lsPropertyConfig.showPartyIsBlackListedParty) {
				var selectedGridObject 	= slickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
				var dataView 			= selectedGridObject.getData();
				var slickData 			= dataView.getItems();
				
				for(const element of slickData){
					slickGridWrapper.updateRowColor({InnerSlickId:'data'},'partyBlackListed',1,'highlight-row-red');
				}
			}
	
			$('#singleplsEle').focus();
		}, openPrint : function(dispatchId) {
			if ($("#oldJSPForPrint").val() == 'true')
				window.open('LSView.do?pageId=11&eventId=9&dispatchLedgerId='+dispatchId+'&isSearchModule=true&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			else if($("#oldDispatchPrint").val() == 'true')
				window.open('LSView.do?pageId=11&eventId=3&dispatchLedgerId='+dispatchId+'&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			else if(lsPropertyConfig.defaultDispatchPrint) {
				if(isNewModuleLhpvLockingAfterLsCreation == 'true')
					window.location.href = 'LHPV.do?pageId=340&eventId=1&modulename=lhpvAction&isLhpvAfterLS=true&dispatchLedgerId=' + dispatchId + '&lsNumber=' + lsNumber;
				else if(isLhpvLockingAfterLsCreation == 'true')
					window.location.href = 'CreateLHPV.do?pageId=228&eventId=1&dispatchLedgerId=' + dispatchId + '&lsNumber=' + lsNumber + '&isLhpvLockingAfterLsCreation=true&unloadingCrossingBranchId='+unloadingCrossingBranchId+'';
				else
					window.open('InterBranch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid=' + dispatchId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');	
			} else if(lsPropertyConfig.branchWiseOldLSPrint)
				window.open('OutboundManifest.do?pageId=11&eventId=10&dispatchLedgerId='+dispatchId+'&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');				
		}, openMinifiedLsPrint : function(dispatchId) {
			window.open('InterBranch.do?pageId=340&eventId=10&modulename=minifiedLoadingSheetPrint&masterid='+dispatchId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		},openHamaliPrint:function(dispatchId){
			window.open('HamaliDetails.do?pageId=340&eventId=10&modulename=loadingHamaliDetailsPrint&masterid='+dispatchId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		},isNumber:function(value){
			 if (typeof value === "string") {
		        return !isNaN(value);
		    }
		}
	});
});
