let lsPropertyConfig = null, transportationModeList = null, transportationModeMap = {}, excessEntryDetailsArray = [], wayBillIdWiseChargeArr = null,
showPartialDispatchButton = false, allowPartialDispatch = false, partialAutoCalculateWeightConfirmation = false, manualLsSequenceCounterPresent = false;
let dispatchId, prevBillSelectionId, isCrossing = false, crossingAgentId = 0, totalNoOfWayBillsInLS = 0, prevDivisionId;
define(['marionette'//Marionette
	 ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/loadingsheet/pendingLrsForAppendInLs.js'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/default/LSPrintMessage.js'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,"selectizewrapper"
	 ,'slickGridWrapper3'
	 ,'messageUtility'
	 ,'JsonUtility'
	 ,"focusnavigation"
	 ,'nodvalidation'
	 ,'autocomplete'
	 ,'autocompleteWrapper'
	 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
	 //,'/ivcargo/resources/js/backbone/backbone.bootstrap5-modal.js'
], function(Marionette, PendingLrsForAppendInLs, LSPrintMessage, UrlParameter) { 
	'use strict';
	let jsonObject = new Object(), branchCollection,_this = '', myNod, agentMyNod,lsSourceBranchId, lsNumber;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchId 		= UrlParameter.getModuleNameFromParam("dispatchLedgerId");
		}, render : function() {
			jsonObject.dispatchLedgerId	= dispatchId;
			jsonObject.isAppendLRInLS	= true;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/loadingSheetWS/getDispatchElementData.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements : function(response) {
			if(response.message != undefined){
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function() {
					window.close();
				}, 2000);

				return;
			}
			
			lsPropertyConfig			= response.lsPropertyConfig;
			transportationModeList		= response.TransportationModeList;
			showPartialDispatchButton	= response.showPartialDispatchButton;
			allowPartialDispatch		= response.allowPartialDispatch;
			totalNoOfWayBillsInLS		= response.totalNoOfWayBillsInLS;
			partialAutoCalculateWeightConfirmation		= response.partialAutoCalculateWeightConfirmation;
			manualLsSequenceCounterPresent				= response.manualLsSequenceCounterPresent;
			prevBillSelectionId	= response.billSelectionId;
			crossingAgentId		= response.crossingAgentId;
			isCrossing			= response.isCrossing;
			lsSourceBranchId	= response.lsSrcBranchId;
			lsNumber			= response.lsNumber;
			transportModeId 	= response.transportModeId
			prevDivisionId		= response.divisionId;
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/dispatch/appendLrInLSNew.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				if(response.message != undefined) {
					hideLayer();
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					return;
				}
				
				let keyObject = Object.keys(lsPropertyConfig);
				
				for (const element of keyObject) {
					if (lsPropertyConfig[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
					else
						$("*[data-attribute=" + element + "]").remove();
				}
				
				if(lsPropertyConfig.billSelection) {
					$('#BillSelection').removeClass('hide');
					_this.setBillSelection(response);
				}
					
				if(lsPropertyConfig.showDivisionSelection) {
					$('#DivisionSelection').removeClass('hide');
					_this.setDivisionSelection(response);
				}
				
				_this.setSequenceMsg(response);
				_this.setAreaSelection(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				agentMyNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				addAutocompleteElementInNode(myNod, 'sourceSubRegionSelectEle', 'Please, Select Source Area !');
				addAutocompleteElementInNode(myNod, 'sourceSelectEle', 'Please, Select Source Branch !');
				
				if(lsPropertyConfig.allowLsBranchId) {
					$("#ElementDiv").removeClass("hide");
					addAutocompleteElementInNode(myNod, 'areaSelectEle', 'Please, Select Destination Area !');
					addAutocompleteElementInNode(myNod, 'branchSelectEle', 'Please, Select Destination Branch !');
					
					document.getElementById('areaSelectEle').onchange = function () { 
	   					checkIfAllSelectedInArea(); 
					};
				}
				
				function checkIfAllSelectedInArea(){
					if($("#areaSelectEle_primary_key").val() == -1){
						$("#branchSelectEle_primary_key").val(-1);
						$("#branchSelectEle").val("ALL");
					}
				}
		
				addAutocompleteElementInNode(myNod, 'deliveryAtSearchEle', 'Please Select Delivery At');
					
				if($('#billSelectionEle').exists() && $('#billSelectionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'billSelectionEle', 'Please Select Bill Selection Type !');
					
				if($('#divisionSelectionEle').exists() && $('#divisionSelectionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'divisionSelectionEle', 'Please Select Division Type !');
					
				$("#summaryTable").load("/ivcargo/html/module/dispatch/summarytemplate.html", function() {});
						
				$("#searchBtn").click(function() {
					if(isCheckBoxChecked('isAgentCrossing')) {
						agentMyNod.performCheck();
						
						if(agentMyNod.areAll('valid'))
							_this.onSubmit();
					} else {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.onSubmit();
					}
				});
				
				if(transportationModeList != undefined) {
					for(const element of transportationModeList) {
						transportationModeMap[element.transportModeId] = element.transportModeName;
					}
				}
				
				let pendingDispatch 	= new PendingLrsForAppendInLs();
				
				$("#singlelrEle").keypress(function(e) {
					let object = {};
					object.transportModeId = transportModeId;
					object.dispatchLedgerId	= dispatchId;
					if (e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER) {
						pendingDispatch.searchLRByNumber(object, prevBillSelectionId);
					}
				});
				
				$("#plsNumberEle").keypress(function(e) {
					let object	= {};
					
					if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER)
						pendingDispatch.searchLRByPLSNumber(object);
				});
				
				$("#dispatchBtn").click(function() {
					pendingDispatch.submitDataFromGrid();
				});

				hideLayer();
			});
		}, setAreaSelection : function(response) {
			branchCollection	= response.branchCollection;
			
			let subRegionAutoComplete 				= new Object();
			subRegionAutoComplete.primary_key 		= 'subRegionId';
			subRegionAutoComplete.field 			= 'subRegionName';
			subRegionAutoComplete.callBack 			= _this.onSubRegionSelect;
			$('#areaSelectEle').autocompleteCustom(subRegionAutoComplete);
				
			let autoRegionName		= $('#areaSelectEle').getInstance();
			
			$(autoRegionName).each(function() {
				this.option.source 	= response.areaCollection;
			});
				
			let branchAutoComplete 				= new Object();
			branchAutoComplete.primary_key 		= 'branchId';
			branchAutoComplete.field 			= 'branchName';
				
			$('#branchSelectEle').autocompleteCustom(branchAutoComplete);
		}, onSubRegionSelect : function() {
			let selectedArea = $('#' + $(this).attr('id') + '_primary_key').val();
			
			let newArray = branchCollection.filter(function (el) {
				return el.branchSubregionId == selectedArea;
			});
			
			let branchName 	= $('#branchSelectEle').getInstance();
			branchName.setSourceToAutoComplete(newArray);
		}, setDestinationArea : function(jsonObj) {	
			let autoBranchName = $("#destinationAreaEle").getInstance();
			
			$('#agentDestinationAreaEle').val(jsonObj.crossingAgentBranchIds);
			
			$( autoBranchName ).each(function() {
				this.option.source = jsonObj.crossingAgentBranchArr;
			})
		}, onSubmit : function() {
			let jsonObject = new Object();
				
			if($('#isAgentCrossing').is(":checked")) {
				jsonObject.crossingAgentId 		= $('#crossingAgentEle_primary_key').val();
				jsonObject.destinationAreaEle 	= $('#destinationAreaEle_primary_key').val();
			} else {
				jsonObject.destinationBranchId	= $('#branchSelectEle_primary_key').val();
			}
			
			jsonObject.sourceBranchId			= $('#sourceSelectEle_primary_key').val();
			jsonObject.billSelectionId			= $('#billSelectionEle_primary_key').val();
			jsonObject.deliveryAtId				= $('#deliveryAtSearchEle_primary_key').val();
			jsonObject.packingGroupTypeId		= $('#packingGroupTypeEle_primary_key').val();
			jsonObject.prevBillSelectionId		= prevBillSelectionId;
			jsonObject.divisionId				= $('#divisionSelectionEle_primary_key').val();
			jsonObject.prevDivisionId			= prevDivisionId;
			
			if ($('#transportModeSearchEle_primary_key').exists())
				jsonObject.transportationModeId = $('#transportModeSearchEle_primary_key').val();
			else
				jsonObject.transportationModeId = transportModeId
			
			if($('#areaSelectEle_primary_key').exists())
				jsonObject.destinationSubRegionId	= $('#areaSelectEle_primary_key').val();
			else
				jsonObject.destinationSubRegionId	= $('#areaSelectEle').val();
				
			jsonObject.destinationBranchIds		= $('#branchSelectEle').val();
			jsonObject.unloadingCrossingBranchId= $("#crossingBranchEle_primary_key").val();

			let object = new Object();
			object.elementValue 			= jsonObject;
			
			let btModal = new Backbone.BootstrapModal({
				content		: 	new PendingLrsForAppendInLs(object),
				modalWidth 	:	100,
				modalHeight :	100,
				title		:	'Pending LRs For Dispatch',
				okText		:	'Add',
				showFooter 	: 	true
			}).open();
			
			console.log(btModal)
			
			object.btModal = btModal;
			new PendingLrsForAppendInLs(object)
			btModal.open();
		}, resetAutcomplete : function(jsonArray) {
			for(let eleId in jsonArray) {
				let elem = $(jsonArray[eleId]).getInstance();
				
				$( elem ).each(function() {
					this.elem.combo_input.context.value = '';
					$(this.elem.combo_input.context.id + '_primary_key').val("");
				}) 
			}
		}, setRePrintOption : function() {
			let object = {};
			
			object.dispatchId		= dispatchId;
			object.lsNumber			= lsNumber;
			
			let lsPrint	= new LSPrintMessage(object);
			lsPrint.setPrint();
		}, setTransportaionModeSelection : function(response) {
			let transportaionModeAutoComplete 				= new Object();
			transportaionModeAutoComplete.url 				= response.TransportationModeList;
			transportaionModeAutoComplete.primary_key 		= 'transportModeId';
			transportaionModeAutoComplete.field 			= 'transportModeName';
			$('#transportModeSearchEle').autocompleteCustom(transportaionModeAutoComplete);
		}, setSequenceMsg : function(response) {
			if(response.LSSequenceMissing != undefined)
				$('#lsSequenceRegion').html('<p style="text-align: right;"><b style="background:#fff8c4;">' + response.LSSequenceMissing + '</b><input type="hidden" id="LSSequenceMissing" value="' + response.lsSequenceCounterPresent + '"/></p>');
			
			if(!lsPropertyConfig.hideMannualLsSequenceMsg && response.manualLSSequenceMissing != undefined)
				$('#ManualLsSequenceRegion').html('<p style="text-align: right;"><b style="background:#fff8c4;">' + response.manualLSSequenceMissing + '</b><input type="hidden" id="manualLSSequenceMissing" value="' + response.manualLsSequenceCounterPresent + '"/></p>');
			
			if(response.isLHPVNumberRequired && response.LHPVSequenceMissing != undefined)
				$('#LHPVSequenceRegion').html('<p style="text-align: right;"><b style="background:#fff8c4;">' + response.LHPVSequenceMissing + '</b><input type="hidden" id="lhpvSequenceMissing" value="' + response.lhpvSequenceCounterPresent + '"/></p>');
			
			if(response.LSSequenceMissing && response.manualLSSequenceMissing)
				$('#searchBtn').attr('disabled', true);
		}, setBillSelection : function(response) {
			let billSelectionAutoComplete 				= new Object();
			billSelectionAutoComplete.url 				= response.billSelectionList;
			billSelectionAutoComplete.primary_key 		= 'billSelectionId';
			billSelectionAutoComplete.field 			= 'billSelectionName';
			$('#billSelectionEle').autocompleteCustom(billSelectionAutoComplete);
		}, setDivisionSelection : function(response) {
			let divisionSelectionAutoComplete 				= new Object();
			divisionSelectionAutoComplete.url 				= response.divisionSelectionList;
			divisionSelectionAutoComplete.primary_key 		= 'divisionMasterId';
			divisionSelectionAutoComplete.field 			= 'name';
			$('#divisionSelectionEle').autocompleteCustom(divisionSelectionAutoComplete);
		}
	});
});