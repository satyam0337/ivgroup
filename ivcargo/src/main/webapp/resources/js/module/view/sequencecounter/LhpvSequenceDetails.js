/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/sequencecounter/sdwiselhpvSequencecounterfilepath.js'
	,'language'//import in require.config
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'constant'
	], function (FilePath,Language,slickGridWrapper2,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,Selection,constant) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	LangKeySet,
	columnHeaderArr,
	allGridObject,
	viewObject,
	gridObejct,
	btModal,
	masterLangObj,
	jsonObject,
	masterLangKeySet,
	myNod,
	gridObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/sdWiseLHPVSeqCounterWS/getSDWiseLHPVSequenceDetailsElement.do?',	_this.setElements,	EXECUTE_WITHOUT_ERROR);
		},setElements : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			//var executive	= response.executive;
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/lhpvSequenceCounter/SDWiseLhpvSequenceCounterDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				response.sourceAreaSelection	= true;
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.regionElement		= '#findRegionEle';
				elementConfiguration.subregionElement	= '#findSubRegionEle';
				elementConfiguration.branchElement		= '#findBranchEle';
				
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#findRegionEle',
					validate: 'validateAutocomplete:#findRegionEle',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#findSubRegionEle',
					validate: 'validateAutocomplete:#findSubRegionEle',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#findBranchEle',
					validate: 'validateAutocomplete:#findBranchEle',
					errorMessage: 'Select proper Branch !'
				});

				hideLayer();
				$("#findBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit();								
					}
				});
			});

		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			jsonObject["srcRegion"] 		= $('#findRegionEle_primary_key').val();
			jsonObject["srcSubRegion"] 		= $('#findSubRegionEle_primary_key').val();
			jsonObject["srcBranch"] 		= $('#findBranchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/sdWiseLHPVSeqCounterWS/getSDWiseLHPVSequenceDetails.do', _this.setSDWiseLhpvSequenceTableData, EXECUTE_WITH_ERROR);
		},setSDWiseLhpvSequenceTableData : function(response) {
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			var deliveryColumnConfig	= response.tableConfig.columnConfiguration;
			var deliveryKeys	= _.keys(deliveryColumnConfig);
			var dcolConfig	= new Object();
			for (var i=0; i<deliveryKeys.length; i++) {
				var dObj	= deliveryColumnConfig[deliveryKeys[i]];
				if (dObj.show == true) {
					dcolConfig[deliveryKeys[i]]	= dObj;
				}
			}
			response.tableConfig.columnConfiguration	= dcolConfig;
			response.tableConfig.Language	= masterLangKeySet;
			
			if(response.tableConfig.CorporateAccount != undefined && response.tableConfig.CorporateAccount.length > 0) {
				response.tableConfig.tableProperties.callBackFunctionForPartial = _this.updateSequenceCounter;
				gridObject = slickGridWrapper2.setGrid(response.tableConfig);
				
			}
			hideLayer();
		},updateSequenceCounter : function(grid,dataView,row) {
			var jsonObject = new Object();
			
			var minRange  = dataView.getItem(row).minRange;
			var maxRange  = dataView.getItem(row).maxRange;
			if(minRange > maxRange){
				showMessage('error','Max Range Should be greater than Min Range !');
				hideLayer();
				return;
			}
			jsonObject["maxRange"] 			= dataView.getItem(row).maxRange;
			jsonObject["minRange"] 			= dataView.getItem(row).minRange;
			jsonObject["nextVal"] 			= dataView.getItem(row).nextVal;
			jsonObject["sourceBranchId"] 	= dataView.getItem(row).sourceBranchId;
			jsonObject["destBranchId"] 		= dataView.getItem(row).destinationBranchId;
			jsonObject["destSubRegionId"] 	= dataView.getItem(row).destinationSubRegionId;
			jsonObject["counterId"] 		= dataView.getItem(row).sourceDestinationWiseLHPVSequenceCounterId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/sdWiseLHPVSeqCounterWS/updateSrcDestWiseLhpvSeqCounter.do', _this.showLHPVSequence, EXECUTE_WITH_ERROR);
		},showLHPVSequence : function(response) {
			if(response.message != undefined) {
				hideLayer();
				return;
			}
		}
	});
});