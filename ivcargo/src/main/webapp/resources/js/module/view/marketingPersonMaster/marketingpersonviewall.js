/**
 * pradip
 */

define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/marketingPersonMaster/marketingpersonlanguagefilepath.js'//FilePath
	,'language'//import in require.config
	,'slickGridWrapper3'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	], function (FilePath,Language,slickGridWrapper3,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,myNod1,Selection) {
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
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData;
		},
		render: function(){
			showLayer();
			getJSON(null, WEB_SERVICE_URL	+ '/MarketingPersonMasterWS/getMarketingPersonViewAllElements.do?',	_this.setElements, EXECUTE_WITH_ERROR);
			return _this;
			
			
		},setElements : function(response) {
			console.log("response",response)
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/marketingPersonMaster/MarketingPersonViewAll.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				
				myNod1 = nod();
				myNod1.configure({
					parentClass:'validation-message'
				});

				var keyObject 		= Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
					
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				var regionAutoComplete 			= new Object();
				regionAutoComplete.primary_key 	= 'regionId';
				regionAutoComplete.callBack 	= _this.onRegionSelect;
				regionAutoComplete.field 		= 'regionName';
				$("#findRegionEle").autocompleteCustom(regionAutoComplete);

				var autoRegionName = $("#findRegionEle").getInstance();
				$(autoRegionName).each(function() {
					this.option.source = response.regionList;
				});

				var subRegionAutoComplete 			= new Object();
				subRegionAutoComplete.primary_key 	= 'subRegionId';
				subRegionAutoComplete.callBack 		= _this.onSubRegionSelect;
				subRegionAutoComplete.field 		= 'subRegionName';
				$("#findSubRegionEle").autocompleteCustom(subRegionAutoComplete);

				var branchAutoComplete 			= new Object();
				branchAutoComplete.primary_key 	= 'branchId';
				branchAutoComplete.field 		= 'branchName';
				branchAutoComplete.callBack		= _this.onBranchSelect;
				$("#findBranchEle").autocompleteCustom(branchAutoComplete);
				
				myNod1.add({
					selector		: '#findRegionEle',
					validate		: 'validateAutocomplete:#findRegionEle_primary_key',
					errorMessage	: 'Please Select Region!'
				});
				myNod1.add({
					selector		: '#findSubRegionEle',
					validate		: 'validateAutocomplete:#findSubRegionEle_primary_key',
					errorMessage	: 'Please Select SubRegion!'
				});
				myNod1.add({
					selector		: '#findBranchEle',
					validate		: 'validateAutocomplete:#findBranchEle_primary_key',
					errorMessage	: 'Please Select Branch!'
				});
				
				$('#findBtn').click( function(){
					 myNod1.performCheck();
					 if(myNod1.areAll('valid')) {
						 showLayer();
						 _this.onSubmitForFindData();
					 }
				 });
				var langObj 				= FilePath.loadLanguage();
				LangKeySet 					= loadLanguageWithParams(langObj);
				hideLayer();
			});
		
		},onRegionSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#findSubRegionEle');
			jsonArray.push('#findBranchEle');
			_this.resetAutcomplete(jsonArray);
			var jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setSubRegion,EXECUTE_WITHOUT_ERROR);
	
		},setSubRegion : function(jsonObj) {
			var autoSubRegionName = $("#findSubRegionEle").getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = jsonObj.subRegion;
			});
		
		},onSubRegionSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#findBranchEle');
			_this.resetAutcomplete(jsonArray);
			jsonObject = new Object();
			jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _this.setBranch,EXECUTE_WITHOUT_ERROR);
		
		},setBranch : function (jsonObj) {
			var autoBranchName = $("#findBranchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		
		},resetAutcomplete : function (jsonArray) {
			for ( var eleId in jsonArray) {
				var elem = $(jsonArray[eleId]).getInstance();
				$(elem).each(function() {
					var elemObj = this.elem.combo_input;
					$(elemObj).each(function() {
						$("#" + $(this).attr("id")).val('');
						$("#" + $(this).attr("id") + '_primary_key').val("");
					})
				})
			}
		
		},onSubmitForFindData : function (){
			jsonObject				= new Object
			jsonObject.branchId 	= $("#findBranchEle_primary_key").val();
			jsonObject.regionId 	= $("#findRegionEle_primary_key").val();
			jsonObject.subRegionId 	= $("#findSubRegionEle_primary_key").val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/MarketingPersonMasterWS/getMarketingPersonsDataList.do', _this.getMarketingPersonDeatilsToView, EXECUTE_WITH_ERROR);
		
		}, getMarketingPersonDeatilsToView : function(response){
			initialiseFocus();
			
			if(response.marketingPersonList == undefined || response.marketingPersonList == null){
				hideLayer();
				showMessage("error",response.message.description);
				$("#billDetailsDiv").children().addClass("hide");
				$("#billDetailsDiv").css("height","0px");
				return false;
			}
			$("#billDetailsDiv").children().removeClass("hide");
			$("#billDetailsDiv").css("height","300px");
			
			LangKeySet 			= loadLanguageWithParams(FilePath.loadLanguage());
			
			var ColumnConfig 	= response.marketingPersonList.columnConfiguration;
			var columnKeys		= _.keys(ColumnConfig);

			var bcolConfig		= new Object();

			for (var i = 0; i < columnKeys.length; i++) {
				var bObj	= ColumnConfig[columnKeys[i]];

				if (bObj.show == true) {
					bcolConfig[columnKeys[i]] = bObj;
				}
			}

			response.marketingPersonList.columnConfiguration	= _.values(bcolConfig);
			response.marketingPersonList.Language				= LangKeySet;
			
			gridObejct = slickGridWrapper3.applyGrid(
					{
						ColumnHead					: response.marketingPersonList.columnConfiguration, // *compulsory // for table headers
						ColumnData					: _.values(response.marketingPersonList.CorporateAccount), 	// *compulsory // for table's data
						Language					:response.marketingPersonList.Language,		// *compulsory for table's header row language
						ShowPrintButton				: true,
						ShowCheckBox				: false,
						removeSelectAllCheckBox		: 'false',
						fullTableHeight				: false,
						rowHeight 					: 	30,
						DivId						: 'billDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
						SerialNo:[{						// optional field // for showing Row number
							showSerialNo	: true,
							searchFilter	: true,          // for search filter on serial no
							ListFilter		: true				// for list filter on serial no
						}],
						InnerSlickId				: 'billDetailsDiv1', // Div Id
						InnerSlickHeight			: '300px',
						NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
					});
			
			hideLayer();
		}
	});
});