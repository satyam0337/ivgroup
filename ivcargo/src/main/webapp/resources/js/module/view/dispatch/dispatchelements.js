/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
    	'slickGridWrapper3'
        ,'marionette'//Marionette
        //marionette JS framework
        ,'elementmodel'//ElementModel
        //Elementmodel consist of default values which is passed when setting it in template
        ,'elementTemplateJs'//elementTemplateJs
        //elementtemplate is javascript utility which consist of functions that operate on elements
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/newDispatchElementtemplate.html'
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //template for element
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
        ,'jquerylingua'//import in require.ig
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'validation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
         ,'autocomplete'
        ,'autocompleteWrapper',//ModelUrls
        ,'JsonUtility'
        ,'messageUtility'
        ], function (slickGridWrapper, Marionette, ElementModel, elementTemplateJs, elementtemplate, newDispatchElementtemplate, ModelUrls, PopulateAutocomplete) {
	var 
	//global objects
	ElementModelArray,  _this, isAgentCrossingChecked = false, loadData;

	return Marionette.ItemView.extend({
		initialize: function(response) {
			loadData	= response;
		},
		render: function(){
			//_this object is added because this object is not found in onRender function
			_this = this; 

			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		}, onBeforeRender: function() {
			//code which needs to be rendered before render
		}, onRender: function(){
			_this.setElements();
			return _this;
		}, onAfterRender: function() {
			//code which needs to be rendered after render
		}, setElements : function() {
			hideLayer();

			if(lsPropertyConfig.isLhpvMandatoryForEachLS) {
				if(latestDispatchData != null && latestDispatchData != undefined) {
					if(latestDispatchData.lhpvId == 0 && latestDispatchData.lHPVNumber == undefined) {
						$("#top-border-boxshadow").hide();
						hideLayer();
					
						$('#popUpContentOnLsLoad').bPopup({
							modalClose: false,
							opacity: 0.6,
							positionStyle: 'fixed'
						},function(){
							var _thisMod = this;
						
							$(this).html("<div class='confirm' style='font-size:15px; font-color:white; width: 435px;height: 180px;padding: 20px; border-width:4px;'><h1 style='font-size:20px;'>Before creating LS please create LHPV of LS No.<span style='font-size:20px;color:yellow;'>"+ latestDispatchData.lsNumber+"</span></h1>" +
									"<br/><input type='button'class='btn btn-primary' id='cancel' value='CANCEL' style='width:45%'/><input type='button'class='btn btn-danger' id='createLhpv' value='Create LHPV' style='float:right;width:45%'/></div>" )
									
							$("#confirm").focus();
							$("#cancel").click(function(){
								location.reload(false);
								_thisMod.close();
							})
	
							$('#createLhpv').click(function() {
								window.open("CreateLHPV.do?pageId=228&eventId=1&isLhpvMandatoryForEachLS="+lsPropertyConfig.isLhpvMandatoryForEachLS+"&vehicleNumber="+latestDispatchData.vehicleNumber+"&vehicleNumberMasterId="+latestDispatchData.vehicleNumberMasterId);
							});
						});
							
						return false;
					} else if(latestDispatchData.lHPVNumber != undefined) {
						$("#top-border-boxshadow").hide();
						hideLayer();
					
						$('#popUpContentOnLsLoad').bPopup({
						},function(){
							var _thisMod = this;
					
							$(this).html("<div class='confirm' style='font-size:15px; font-color:white; width: 435px;height: 180px;padding: 20px; border-width:4px;'><h1 style='font-size:20px;'>Before creating LS please append LS No: <span style='font-size:20px;color:yellow;'>"+latestDispatchData.lsNumber+"</span>  to LHPV no <span style='font-size:20px;color:yellow;'>"+ latestDispatchData.lHPVNumber +"</span></h1>" +
								"<br/><input type='button'class='btn btn-primary' id='cancel' value='CANCEL' style='width:45%'/><input type='button'class='btn btn-danger' id='appendLSInLHPV' value='Append LHPV' style='float:right;width:45%'/></div>" )
								
							$("#confirm").focus();
							$("#cancel").click(function(){
								location.reload(false);
								_thisMod.close();
							})
						
							$('#appendLSInLHPV').click(function() {
								window.open("CreateLHPV.do?pageId=228&eventId=1&isLhpvMandatoryForEachLS="+lsPropertyConfig.isLhpvMandatoryForEachLS+"&lHPVNumber="+latestDispatchData.lHPVNumber);
							});
						});
						return false;
					}
				}
			}
			
			groupWiseLanguageFileLoad					= lsPropertyConfig.groupWiseLanguageFileLoad;
			
			ElementModelArray = ModelUrls.urlModelCollection(lsPropertyConfig);

			//elementtemplate.js
			//append value in template
			if(lsPropertyConfig.wayBillDispatchForMultipleBranch)
				elementTemplateJs.appendElementInTemplate(ElementModelArray, ElementModel, newDispatchElementtemplate, _this);
			else
				elementTemplateJs.appendElementInTemplate(ElementModelArray, ElementModel, elementtemplate, _this);
			
			//focus navigation initiates through this function
			initialiseFocus();
			
			setTimeout(function() {
				if(lsPropertyConfig.sourcebranch)
					_this.setSourceBranches(lsPropertyConfig);
		
				if(lsPropertyConfig.TransportModeForSearch)
					_this.setTransportModeSearch();
			
				if(lsPropertyConfig.DeliveryAtForSearch)
					_this.setDeliveryAtSearch();
			
				if(lsPropertyConfig.billSelection)
					_this.setBillSelection();
	
				if(lsPropertyConfig.unloadingCrossingBranch && crossingBranchList != undefined) {
					$("*[data-attribute='unloadingCrossingDispatch']").removeClass("hide");
					_this.setCrossingbranchMap();
				}
			}, 100);
			
			if(lsPropertyConfig.IsCrossingDispatchAllow)
				$("*[data-attribute='crossingAgentDispatch']").removeClass("hide");
			
			_this.setSequenceMsg(loadData);

			if(lsPropertyConfig.isAgentCrossingByDefaultChecked && $('#isAgentCrossing').exists() && $('#isAgentCrossing').is(":visible")){
				$('#isAgentCrossing').prop('checked','true');
				setTimeout(function(){
					showHideCrosiingFeilds();
				}, 2000)
			}

			var branchAreaAutoComplete = new Object();
			branchAreaAutoComplete.url = WEB_SERVICE_URL+'/dispatchWs/getPendingDispatchArea.do';
			
			if(!lsPropertyConfig.subregion)
				branchAreaAutoComplete.showsubregion = lsPropertyConfig.subregion;
				
			if(lsPropertyConfig.disableAgentCrossingCheckbox && $('#isAgentCrossing').exists() && $('#isAgentCrossing').is(":visible"))
				$( "#isAgentCrossing" ).prop( "disabled", true );
			
			$("#isAgentCrossing").change(function() {
				if(lsPropertyConfig.showLsCommissionOnlyForCrossingAgent)
					_this.onCrossingAgentCheckBoxSelect();
			});
			
			//populatesubregionandbranch.js
			
			if(lsPropertyConfig.wayBillDispatchForMultipleBranch) {
				PopulateAutocomplete.setSubregionAndBranchWithMultipleBranches(branchAreaAutoComplete);
				
				$('#isAgentCrossing').click(function(){
					if($('#isAgentCrossing').prop('checked')) {
						$('#areaSelectEle_wrapper').hide();
						$('#crossingAgentSelectEle').show();
						
						if(!isAgentCrossingChecked) {
							PopulateAutocomplete.setSubregionAndBranch(branchAreaAutoComplete);
							isAgentCrossingChecked = true;
						}
					} else {
						$('#areaSelectEle_wrapper').show();
						$('#crossingAgentSelectEle').hide();
					}
				});
			} else
				PopulateAutocomplete.setSubregionAndBranch(branchAreaAutoComplete);
		}, setSourceBranches : function(response){
			//populatesubregionandbranch.js
			
			if(response.sourcesubregion && response.sourcebranch) {
				PopulateAutocomplete.setSourceSubregionAndBranch({url : WEB_SERVICE_URL+'/dispatchWs/getPendingSourceArea.do'
					, areaElementId : '#sourceSubRegionSelectEle'
					, branchElementId : '#sourceSelectEle'
					, areaParameter : 'sourceAreaCollection'
					, branchParameter : 'sourceBranchCollection'
				});
			} else if(response.sourcebranch) {
				let jsonObject = new Object();
				getJSON(jsonObject, WEB_SERVICE_URL+'/dispatchWs/getPendingSourceBranch.do', _this.setSourceBranchCombobox, EXECUTE_WITH_ERROR);
			}
		}, setSourceBranchCombobox : function(response) {
			let sourceBranchAutocomplete = new Object();
			sourceBranchAutocomplete.url 			= response.sourceBranchCollection;
			sourceBranchAutocomplete.primary_key 	= 'branchId';
			sourceBranchAutocomplete.field 			= 'branchName';
			$("#sourceSelectEle").autocompleteCustom(sourceBranchAutocomplete);
		}, setSequenceMsg : function(response) {
			if(response.LSSequenceMissing != undefined)
				$('#lsSequenceRegion').html('<p style="text-align: right;"><b style="background:#fff8c4;">' + response.LSSequenceMissing + '</b><input type="hidden" id="LSSequenceMissing" value="' + response.lsSequenceCounterPresent + '"/></p>');
			
			if(!response.hideMannualLsSequenceMsg && response.manualLSSequenceMissing != undefined)
				$('#ManualLsSequenceRegion').html('<p style="text-align: right;"><b style="background:#fff8c4;">' + response.manualLSSequenceMissing + '</b><input type="hidden" id="manualLSSequenceMissing" value="' + response.manualLsSequenceCounterPresent + '"/></p>');
			
			if(response.isLHPVNumberRequired && response.LHPVSequenceMissing != undefined)
				$('#LHPVSequenceRegion').html('<p style="text-align: right;"><b style="background:#fff8c4;">' + response.LHPVSequenceMissing + '</b><input type="hidden" id="lhpvSequenceMissing" value="' + response.lhpvSequenceCounterPresent + '"/></p>');
			
			if(response.LSSequenceMissing && response.manualLSSequenceMissing)
				$('#searchBtn').attr('disabled', true);
		}, setTransportModeSearch : function() {
			for(let i = 0; i < transportationModeList.length ; i++) {
				if(Number(transportationModeList[i].transportModeId) == Number(TRANSPORTATION_MODE_ROAD_MIXED_ID)
					|| Number(transportationModeList[i].transportModeId) == Number(TRANSPORTATION_MODE_MIXED_ID)) {
					transportationModeList.splice(i, 2);
				}
			}
			
			let transportModeAutoComplete		 	= new Object();
			transportModeAutoComplete.primary_key 	= 'transportModeId';
			transportModeAutoComplete.url 			= transportationModeList;
			transportModeAutoComplete.field 		= 'transportModeName';
			$("#transportModeSearchEle").autocompleteCustom(transportModeAutoComplete);
			
			for(let i = 0; i < transportationModeList.length; i++) {
				if(transportationModeList[i].transportModeId == lsPropertyConfig.defaultTransportModeForSearch) {
					$("#transportModeSearchEle_primary_key").val(transportationModeList[i].transportModeId);
					$("#transportModeSearchEle").val(transportationModeList[i].transportModeName);
				}
			}
		}, setDeliveryAtSearch : function() {
			let deliveryAtComplete		 	= new Object();
			deliveryAtComplete.primary_key 	= 'deliveryAtId';
			deliveryAtComplete.url 			= deliveryToList;
			deliveryAtComplete.field 		= 'deliveryAtName';
			$("#deliveryAtSearchEle").autocompleteCustom(deliveryAtComplete);
		}, setBillSelection : function() {
			let billSelectionAutoComplete			= new Object();
			billSelectionAutoComplete.primary_key 	= 'billSelectionId';
			billSelectionAutoComplete.url 			=  billSelectionList;//dispatch.js
			billSelectionAutoComplete.field 		= 'billSelectionName';
			$("#billSelectionEle").autocompleteCustom(billSelectionAutoComplete);
			
			for (let i = 0; i < billSelectionList.length; i++) {
				if (billSelectionList[i].billSelectionId == lsPropertyConfig.defaultBillSelectionId) {
					$("#billSelectionEle_primary_key").val(billSelectionList[i].billSelectionId);
					$("#billSelectionEle").val(billSelectionList[i].billSelectionName);
				}
			}
		}, onCrossingAgentCheckBoxSelect : function() {
			$("#data").load(location.href+" #data>*", "");
			slickGridWrapper.resetSlickGridInstance({InnerSlickId : 'data'});
		}, setCrossingbranchMap : function() {
			let crossingBranchAutoComplete			= new Object();
			crossingBranchAutoComplete.primary_key 	= 'crossingBranchId';
			crossingBranchAutoComplete.url 			=  crossingBranchList;//dispatch.js
			crossingBranchAutoComplete.field 		= 'crossingBranchName';
			crossingBranchAutoComplete.callBack 	= _this.onUnloadingCrossingBranchSelect;
			
			$("#crossingBranchEle").autocompleteCustom(crossingBranchAutoComplete);
		}, onUnloadingCrossingBranchSelect : function() {
			$("#data").load(location.href+" #data>*", "");
			slickGridWrapper.resetSlickGridInstance({InnerSlickId : 'data'});
		}
	});	
});

function showHideUnloadingCrosiingFeilds() {
	var agentChkBx = document.getElementById('isunloadingCrossing');
	
	if(agentChkBx.checked)
		$('#crossingBranch').show();
	else {
		$('#crossingBranch').hide();
		$("#crossingBranchEle_primary_key").val(0);
	}
}