let lsPropertyConfig = null, transportationModeList = null, transportationModeMap = {}, excessEntryDetailsArray = [], wayBillIdWiseChargeArr = null, branchModel = null,
showPartialDispatchButton = false, allowPartialDispatch = false, partialAutoCalculateWeightConfirmation = false, editableDeliveryAt = false, manualLsSequenceCounterPresent = false, manualLSSequenceCounter = null, 
allowCrossingBranchWiseData = false, $branchSelect;
define(['marionette'//Marionette
	 ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/default/pendingLrForDispatch.js'
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
], function(Marionette, PendingLrForDispatch, LSPrintMessage, UrlParameter) {
	'use strict';
	let jsonObject = new Object(), branchCollection,_this = '', myNod, agentMyNod, transportModeMyNod, dispatchId, lsNumber,TRANSPORTATION_MODE_AIR_ID = 3, myCrossNod, branchNode,
	isLhpvCreation = false, isLhpvAfterLs = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchId 		= UrlParameter.getModuleNameFromParam(MASTERID);
			lsNumber   		= UrlParameter.getModuleNameFromParam(MASTERID2);
			isLhpvCreation	= UrlParameter.getModuleNameFromParam('isLhpvCreation');
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/loadingSheetWS/getDispatchElementData.do?', _this.setElements, EXECUTE_WITH_NEW_ERROR);
			return _this;
		}, setElements : function(response) {
			lsPropertyConfig			= response.lsPropertyConfig;
			transportationModeList		= response.TransportationModeList;
			showPartialDispatchButton	= response.showPartialDispatchButton;
			allowPartialDispatch		= response.allowPartialDispatch;
			partialAutoCalculateWeightConfirmation		= response.partialAutoCalculateWeightConfirmation;
			manualLsSequenceCounterPresent		= response.manualLsSequenceCounterPresent;
			manualLSSequenceCounter				= response.manualLSSequenceCounter;
			editableDeliveryAt					= lsPropertyConfig.editableDeliveryAt;
			branchModel							= response.branchModel;
			allowCrossingBranchWiseData			= lsPropertyConfig.allowCrossingBranchWiseData;
			if(typeof createVideoLink != 'undefined') createVideoLink(response);
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/dispatch/dispatch.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				isLhpvAfterLs	= isLhpvCreation != null && (isLhpvCreation == true || isLhpvCreation == 'true');
				
				if(dispatchId > 0) {
					if(!isLhpvAfterLs) {
						showMessage('success', 'LS ' + lsNumber + ' created successfully !');
						hideLayer();
					}

					_this.setRePrintOption();
				}

				if(response.message != undefined) {
					hideLayer();
					let errorMessage = response.message;
					$('#selection-div').html(errorMessage.description);
					return;
				}
				
				let keyObject = Object.keys(lsPropertyConfig);
				
				for (const element of keyObject) {
					if (lsPropertyConfig[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
					else
						$("*[data-attribute=" + element + "]").remove();
				}
				
				if(lsPropertyConfig.IsCrossingDispatchAllow)
					$('#crossingAgentCheckBox').removeClass('hide');
					
				if(lsPropertyConfig.isAgentCrossingByDefaultChecked) {
					$('#isAgentCrossing').prop('checked', 'true');
					_this.showHideCrosiingFeilds(true);
				}
					
				if(lsPropertyConfig.TransportModeForSearch) {
					$('#TransportModeForSearch').removeClass('hide');
					_this.setTransportaionModeSelection(response);
				}
				
				if(lsPropertyConfig.billSelection) {
					$('#BillSelection').removeClass('hide');
					_this.setBillSelection(response);
				}
				
				if(lsPropertyConfig.showDivisionSelection) {
					$('#DivisionSelection').removeClass('hide');
					_this.setDivisionSelection(response);
				} else
					$('#DivisionSelection').remove();
				
				if(response.showBranchCrossingCheckBox)
					$('#crossingCheckBoxSpan').removeClass('hide');
				
				if(lsPropertyConfig.allowMultipleDestinationBranchSelection)
					_this.setBranchesSelection(response);
				else
					_this.setAreaSelection(response);
					
				_this.setSequenceMsg(response);
				_this.setCrossingAgentSelection(response);
				
				if(allowCrossingBranchWiseData){
					myCrossNod	= nod();
					
					_this.setSearchMode();
					_this.setCrossingBranchSelection(response);
					
					$('#searchMode').removeClass('hide');
					$('#ElementDiv').addClass('hide');
					$('#LRElementDiv').addClass('hide');
					$('#crossingAgentCheckBox').addClass('hide');
					
					$("#searchModelEle").change(function() {
						_this.showHideSearchOperationFeilds(this);
					});
					
					addAutocompleteElementInNode(myCrossNod, 'crossingBranchModeEle', 'Please, Select Crossing Branch !');
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				agentMyNod = nod();
				branchNode = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				transportModeMyNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				addAutocompleteElementInNode(agentMyNod, 'crossingAgentEle', 'Please, Select Crossing Agent !');
				addAutocompleteElementInNode(agentMyNod, 'destinationAreaEle', 'Please, Select Destination Area !');

				addAutocompleteElementInNode(myNod, 'sourceSubRegionSelectEle', 'Please, Select Source Area !');
				addAutocompleteElementInNode(myNod, 'sourceSelectEle', 'Please, Select Source Branch !');
					
				addAutocompleteElementInNode(myNod, 'areaSelectEle', 'Please, Select Destination Area !');
				addAutocompleteElementInNode(myNod, 'branchSelectEle', 'Please, Select Destination Branch !');
		
				addAutocompleteElementInNode(myNod, 'deliveryAtSearchEle', 'Please Select Delivery At');
					
				if($('#billSelectionEle').exists() && $('#billSelectionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'billSelectionEle', 'Please Select Bill Selection Type !');
					
				if($('#divisionSelectionEle').exists() && $('#divisionSelectionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'divisionSelectionEle', 'Please Select Division Type !');
					
				if($('#crossingBranchEle').exists() && $('#crossingBranchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'crossingBranchEle', 'Please Select Crossing Unloading Branch');
					
				if($('#transportModeSearchEle').exists() && $('#transportModeSearchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'transportModeSearchEle', 'Please Select Transportaion Mode');
					
				if($('#transportModeSearchEle').exists() && $('#transportModeSearchEle').is(":visible") && lsPropertyConfig.validateTransportMode)
					addAutocompleteElementInNode(transportModeMyNod, 'transportModeSearchEle', 'Please Select Transportaion Mode');
				
				if($('#multipleBranchEle').exists() && $('#multipleBranchEle').is(":visible"))
					addAutocompleteElementInNode(branchNode, 'multipleBranchEle', 'Please Select Branches !');
				
				$("#summaryTable").load("/ivcargo/html/module/dispatch/summarytemplate.html", function() {});
				
				$("#isAgentCrossing").click(function() {
					_this.showHideCrosiingFeilds(this.checked);
				});
				
				$("#searchBtn").click(function() {
					if(isCheckBoxChecked('isAgentCrossing')) {
						agentMyNod.performCheck();
						
						if(agentMyNod.areAll('valid'))
							_this.onSubmit();
					} else if (allowCrossingBranchWiseData && $('#searchModelEle').exists() && $('#searchModelEle').is(":visible") && 
						Number($('#searchModelEle_primary_key').val()) == 2){
							myCrossNod.performCheck();
						
						if(myCrossNod.areAll('valid'))
							_this.onSubmit();
						
					} else if(lsPropertyConfig.allowMultipleDestinationBranchSelection){
						branchNode.performCheck();
						
						if(branchNode.areAll('valid'))
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
				
				let pendingDispatch 	= new PendingLrForDispatch();

				$("#singlelrEle").keypress(function(e) {
					let object	= {};
									
					if(lsPropertyConfig.validateTransportMode) {
						transportModeMyNod.performCheck();

						if(transportModeMyNod.areAll('valid') && (e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER))
							pendingDispatch.searchLRByNumber(object);
						
						if(!transportModeMyNod.areAll('valid') && (e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER) && lsPropertyConfig.searchLRNumberByQRCodeScanner)
							$('#singlelrEle').val('');
					} else if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER)
						pendingDispatch.searchLRByNumber(object);
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
				return el.branchSubregionId == selectedArea || lsPropertyConfig.sourceBranchAllOption && el.branchSubregionId == -1;
			});
			
			let branchName 	= $('#branchSelectEle').getInstance();
			branchName.setSourceToAutoComplete(newArray);
			
			if(newArray.length == 0) return;
			
			let newArray1 = newArray.filter(function (el) {
				return el.branchId == -1;
			});
			
			if(newArray1.length == 1) {
				$( branchName ).each(function() {
					this.elem.combo_input.context.value = newArray1[0]['branchName'];
					document.getElementById(this.elem.combo_input.context.id + '_primary_key').value = newArray1[0]['branchId'];
				});
			}
		}, setCrossingAgentSelection : function(response) {
			let crossingAgentAutoComplete 				= new Object();
			crossingAgentAutoComplete.primary_key 		= 'crossingAgentMasterId';
			crossingAgentAutoComplete.field 			= 'name';
			crossingAgentAutoComplete.callBack 			= _this.onCrossingAgentSelect;
			$('#crossingAgentEle').autocompleteCustom(crossingAgentAutoComplete);
				
			let autoAgentName		= $('#crossingAgentEle').getInstance();
			
			$(autoAgentName).each(function() {
				this.option.source 	= response.crossingAgents;
			});
			
			let branchAutoComplete 				= new Object();
			branchAutoComplete.primary_key 		= 'destinationBranches';
			branchAutoComplete.field 			= 'destinationBranchName';
				
			$('#destinationAreaEle').autocompleteCustom(branchAutoComplete);
		}, onCrossingAgentSelect : function () {
			let jsonArray 	= new Array();

			jsonArray.push('#destinationAreaEle');

			_this.resetAutcomplete(jsonArray);

			let jsonObject 	= new Object();
			
			jsonObject.crossingAgentId	= $('#crossingAgentEle_primary_key').val();
			jsonObject.showAllOptionInCrossingAgentDestinationArea	= lsPropertyConfig.showAllOptionInCrossingAgentDestinationArea;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/crossingDispatchWS/getCrossingAgentBranchIds.do', _this.setDestinationArea, EXECUTE_WITH_ERROR);
		}, setDestinationArea : function(jsonObj) {	
			let autoBranchName = $("#destinationAreaEle").getInstance();
			
			$('#agentDestinationAreaEle').val(jsonObj.crossingAgentBranchIds);
			
			$( autoBranchName ).each(function() {
				this.option.source = jsonObj.crossingAgentBranchArr;
			})
		}, showHideCrosiingFeilds : function(checked) {
			if(checked) {
				$('#CrossingElementDiv').removeClass('hide');
				$('#ElementDiv').addClass('hide');
				$('#multipleBranchSelection').addClass('hide');
			} else {
				$('#CrossingElementDiv').addClass('hide');
				$('#crossingAgentEle_primary_key').val(0);
				$('#crossingAgentEle').val('');
				$('#destinationAreaEle_primary_key').val(0);
				$('#destinationAreaEle').val('');
				
				if(lsPropertyConfig.allowMultipleDestinationBranchSelection) {
					let selectizeBranch = $('#multipleBranchEle')[0].selectize;
  			 		
					if (selectizeBranch)
  		     			 selectizeBranch.clear();
					
					$('#multipleBranchEle').val('');
					$('#multipleBranchSelection').removeClass('hide');
				} else
					$('#ElementDiv').removeClass('hide');
			}
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
			jsonObject.transportationModeId		= $('#transportModeSearchEle_primary_key').val();
			jsonObject.deliveryAtId				= $('#deliveryAtSearchEle_primary_key').val();
			jsonObject.packingGroupTypeId		= $('#packingGroupTypeEle_primary_key').val();
			jsonObject.divisionId				= $('#divisionSelectionEle_primary_key').val();
			
			if($('#areaSelectEle_primary_key').exists())
				jsonObject.destinationSubRegionId	= $('#areaSelectEle_primary_key').val();
			else
				jsonObject.destinationSubRegionId	= $('#areaSelectEle').val();
				
			jsonObject.unloadingCrossingBranchId	= $("#crossingBranchEle_primary_key").val();
			jsonObject.crossingBranchId				= $('#crossingBranchModeEle_primary_key').val();
			jsonObject.searchModeId					= $('#searchModelEle_primary_key').val();
			
			if(lsPropertyConfig.allowMultipleDestinationBranchSelection){
				let selectedBranches = $("#multipleBranchEle")[0].selectize.getValue(); 
				let branchIdsStr = Array.isArray(selectedBranches) ? selectedBranches.join(",") : selectedBranches;
	
				if(branchIdsStr != undefined && branchIdsStr != -1 && isValueExistInArray(branchIdsStr.split(","), -1)) {
					showMessage('error', 'You cannot select ALL option with other branches !');
					return false;
				}
				
				jsonObject.destinationBranchIds = branchIdsStr != undefined ? branchIdsStr : 0;
			} else 
				jsonObject.destinationBranchIds		= $('#branchSelectEle').val();
				
			let object = new Object();
			object.elementValue 			= jsonObject;
			
			let btModal = new Backbone.BootstrapModal({
				content		: 	new PendingLrForDispatch(object),
				modalWidth 	:	100,
				modalHeight :	100,
				title		:	'Pending LRs For Dispatch',
				okText		:	'Add',
				showFooter 	: 	true
			}).open();
			
			object.btModal = btModal;
			new PendingLrForDispatch(object)
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
			object.isLhpvCreation	= isLhpvAfterLs;

			let lsPrint	= new LSPrintMessage(object);
			lsPrint.setPrint();
		}, setTransportaionModeSelection : function(response) {
			let transportaionModeAutoComplete 				= new Object();
			transportaionModeAutoComplete.url 				= response.TransportationModeList;
			transportaionModeAutoComplete.primary_key 		= 'transportModeId';
			transportaionModeAutoComplete.field 			= 'transportModeName';
			transportaionModeAutoComplete.callBack 			= _this.transportModeChange;
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
		}, setDivisionSelection : function(response) {
			let divisionSelectionAutoComplete 				= new Object();
			divisionSelectionAutoComplete.url 				= response.divisionSelectionList;
			divisionSelectionAutoComplete.primary_key 		= 'divisionMasterId';
			divisionSelectionAutoComplete.field 			= 'name';
			$('#divisionSelectionEle').autocompleteCustom(divisionSelectionAutoComplete);
		}, setBillSelection : function(response) {
			let billSelectionAutoComplete 				= new Object();
			billSelectionAutoComplete.url 				= response.billSelectionList;
			billSelectionAutoComplete.primary_key 		= 'billSelectionId';
			billSelectionAutoComplete.field 			= 'billSelectionName';
			$('#billSelectionEle').autocompleteCustom(billSelectionAutoComplete);
		}, transportModeChange : function() {
			let transportationModeId		= $('#transportModeSearchEle_primary_key').val();
			
			lsPropertyConfig.airWayBillEntry = lsPropertyConfig.showAWBFeildOnTransportModeAir && transportationModeId == TRANSPORTATION_MODE_AIR_ID;
		}, setCrossingBranchSelection : function(response) {
			let crossingBranchAutoComplete 				= new Object();
			crossingBranchAutoComplete.primary_key 		= 'branchId';
			crossingBranchAutoComplete.field 			= 'branchName';
			$('#crossingBranchModeEle').autocompleteCustom(crossingBranchAutoComplete);
				
			let autoBranchName		= $('#crossingBranchModeEle').getInstance();
			
			$(autoBranchName).each(function() {
				this.option.source 	= response.crossingBranchCollection;
			});
			
		}, showHideSearchOperationFeilds : function() {
			$('#crossingBranchModeEle_primary_key').val('');
			$('#crossingBranchModeEle').val('');
			$('#crossingAgentEle').val('');
			$('#singlelrEle').val('');
			$('#areaSelectEle_primary_key').val('');
			$('#areaSelectEle').val('');
			$('#branchSelectEle_primary_key').val('');
			$('#branchSelectEle').val('');
			$('#destinationAreaEle_primary_key').val('');
			
			let selectizeBranch = $('#multipleBranchEle')[0].selectize;
  			
			if (selectizeBranch)
 				selectizeBranch.clear();
				
			let searchModeId		= $('#searchModelEle_primary_key').val();

			if(searchModeId == 1) {
				$('#crossingBranchMode').addClass('hide');
				$('#LRElementDiv').removeClass('hide');
				$('#CrossingElementDiv').addClass('hide');
				$('#crossingAgentCheckBox').removeClass('hide');
				document.getElementById("crossingAgentCheckBox").checked = false;
				$('#multipleBranchSelection').removeClass('hide');
			} else {
				$('#crossingBranchMode').removeClass('hide');
				$('#LRElementDiv').addClass('hide');
				$('#CrossingElementDiv').addClass('hide');
				$('#crossingAgentCheckBox').addClass('hide');
				$('#multipleBranchSelection').addClass('hide');
				document.getElementById("crossingAgentCheckBox").checked = false;
			}
		}, setSearchMode : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#searchModelEle").autocompleteCustom(autoSelectTypeName)
			
			let autoSelectType = $("#searchModelEle").getInstance();
			
			let SelectTYPE = [
				{ "selectTypeId":1, "selectTypeName": "Destination Wise" },
				{ "selectTypeId":2, "selectTypeName": "TPT" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setBranchesSelection : function(response) {
			$('#ElementDiv').addClass('hide');
			
			let autoBranch = {
		        valueField: 'branchId',
		        plugins: ['remove_button'],
		        labelField: 'branchName',
		        searchField: 'branchName',
		        maxItems: null,
		        create: false,
		        options: response['branchCollection'],
		        maxItems: response['branchCollection'].length // Single or multiple selection
		    };
			
			$branchSelect = $('#multipleBranchEle').selectize(autoBranch);
		}
	});
});