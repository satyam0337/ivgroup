let allowCrossingBranchWiseData	= false;
let allowMultipleDestinationBranchSelection	= false;
let $branchSelect;
let responseData;
define([
        'marionette'//Marionette
       // ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/preloadingsheetelements.js'//Elements
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/pagetemplate.html'//Template
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/preloadingsheetbehavior.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/actionbutton/actionbuttonview.js'//,AcctionbuttonView
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/actionbutton/printview.js'//,PrintView
        ,'language'//import in require.config
        ,'errorshow'
        ,'elementmodel'
         ,"selectizewrapper"
	 ,'slickGridWrapper3'
	 ,'messageUtility'
	 ,'JsonUtility'
	 ,"focusnavigation"
	 ,'nodvalidation'
	 ,'autocomplete'
	 ,'autocompleteWrapper'
        ], function(Marionette, Template, Preloadingsheetbehavior, AcctionbuttonView){

	'use strict';// this basically give strictness to this specific js 
	let jsonObject = new Object(),_this = '', myNod, myCrossNod, myBranchNod;
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL+'/dispatchWs/getPendingDispatchArea.do', _this.setElements, EXECUTE_WITH_ERROR);
			return _this;
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/preloadingSheet/preloadingSheet.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				allowCrossingBranchWiseData	= response.allowCrossingBranchWiseData;
				allowMultipleDestinationBranchSelection	= response.allowMultipleDestinationBranchSelection;
				
				if(allowMultipleDestinationBranchSelection){
					$('#singleBranchSelect').removeClass('hide');
					_this.setBranchesSelection(response, 'singleBranchEle');
				}else
					_this.setSourceAndDestinationComboboxForMultipleBranches(response);
				
				myCrossNod = nod();
				myBranchNod = nod();
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
	
				myNod.add({
					selector: '#areaSelectEle',
					validate: 'presence',
					errorMessage: 'Select proper Area'
				});
				myNod.add({
					selector: '#branchSelectEle',
					validate: 'presence',
					errorMessage: 'Select proper Branch'
				});
				
				//addAutocompleteElementInNode(myNod, 'areaSelectEle', 'Please, Select Destination Area !');
				//addAutocompleteElementInNode(myNod, 'branchSelectEle', 'Please, Select Destination Branch !');
				
				addAutocompleteElementInNode(myCrossNod, 'crossingBranchModeEle', 'Please, Select Crossing Branch !');
				//addAutocompleteElementInNode(myBranchNod, 'singleBranchEle', 'Please, Select Branch !');
				
				$("#searchBtn").click(function() {
					if (allowCrossingBranchWiseData && $('#searchModelEle').exists() && $('#searchModelEle').is(":visible") && 
						Number($('#searchModelEle_primary_key').val()) == 2){
							
						myCrossNod.performCheck();
						if(myCrossNod.areAll('valid')){
							let preloadingsheetbehavior = new Preloadingsheetbehavior();
							preloadingsheetbehavior.onSearch();
						}
					} else if(allowMultipleDestinationBranchSelection){
						var selectedBranches = $("#singleBranchEle")[0].selectize.getValue(); 
						myBranchNod.performCheck();
						
						if(selectedBranches != undefined && selectedBranches != null && selectedBranches.length > 0){
							let preloadingsheetbehavior = new Preloadingsheetbehavior();
							preloadingsheetbehavior.onSearch();
						} else{
							myBranchNod.add({
								selector: '#singleBranchEle',
								validate: 'presence',
								errorMessage: 'Select proper Branches'
							});		
						}
					} else{
						myNod.performCheck();
						if(myNod.areAll('valid')){
							let preloadingsheetbehavior = new Preloadingsheetbehavior();
							preloadingsheetbehavior.onSearch();
						}
					}
				})
				
				if(allowCrossingBranchWiseData){
					_this.setSearchMode();
					_this.setCrossingBranchSelection(response);
					
					$('#searchMode').removeClass('hide');
					$('#ElementDiv').addClass('hide');
					$('#singleBranchSelect').addClass('hide');
					
					$("#searchModelEle").change(function() {
						_this.showHideSearchOperationFeilds(this);
					});
					
				}
					
				hideLayer();
			});
		}, setSourceAndDestinationComboboxForMultipleBranches : function(response) {
			hideLayer();
			responseData = response;
			$('#ElementDiv').removeClass('hide');
			
			 let autoArea = {
		        valueField: 'subRegionId',
		        labelField: 'subRegionName',
		        searchField: 'subRegionName',
		        options: responseData['areaCollection'],
		        onChange: _this.onSubRegionSelectForMultipleBranches,
		        create: false,
		        maxItems: responseData.allowMultipleSubregionSelection ? responseData['areaCollection'].length : 1 // Single or multiple selection
		    };

			$('#areaSelectEle').selectize(autoArea);

			_this.setBranchesSelection(response, 'branchSelectEle');
			
		}, onSubRegionSelectForMultipleBranches : function(value) {
			var dataCollection = responseData['branchCollection'];
			var resultArr = new Array(); 
			
			if(responseData.allowMultipleSubregionSelection != undefined && responseData.allowMultipleSubregionSelection == true){
				var arr = new Array();
				let subRegionIds = value.split(',');
				
				for(var k = 0; k < subRegionIds.length; k++) {
					arr.push(parseInt(subRegionIds[k]));
				}
				
				for(var i = 0; i < dataCollection.length; i++) {
					if(arr.includes(parseInt(dataCollection[i]['branchSubregionId'])))
						resultArr.push(dataCollection[i]);
				}
			} else {
				for(var i = 0; i < dataCollection.length; i++) {
					if(parseInt(dataCollection[i]['branchSubregionId']) == parseInt(value))
						resultArr.push(dataCollection[i]);
				}	
			}	

			var control = $branchSelect[0].selectize;
			control.clear();
			control.clearOptions();
			control.addOption(resultArr)
			
			if(value == -1){
				var controls = $branchSelect[0].selectize;
				controls.addItem(-1,false);
			}
		} , setCrossingBranchSelection : function(response) {
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
			$('#branchSelectEle_primary_key').val('');
			$('#branchSelectEle').val('');
			
			 var selectizeArea = $('#areaSelectEle')[0].selectize;
		    if (selectizeArea) {
		        selectizeArea.clear();
		    }
		    
		     var selectizeBranch = $('#branchSelectEle')[0].selectize;
  			  if (selectizeBranch) {
  		     	 selectizeBranch.clear();
   			 }
				
			var searchModeId		= $('#searchModelEle_primary_key').val();
			if(searchModeId == 1) {
				$('#crossingBranchMode').addClass('hide');
				$('#ElementDiv').addClass('hide');
				$('#areaSelectEle').val('') 
				$('#branchSelectEle').val('') 
				$('#crossingBranchModeEle').val('') 
				$('#singleBranchSelect').removeClass('hide');
				
			} else {
				$('#crossingBranchMode').removeClass('hide');
				$('#ElementDiv').addClass('hide');
				$('#LRElementDiv').addClass('hide');
				
				$('#areaSelectEle').val('') 
				$('#branchSelectEle').val('') 
				$('#crossingBranchModeEle').val('') 
				$('#singleBranchSelect').addClass('hide');
				
			}
		},setSearchMode : function() {
			
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
		}, setBranchesSelection : function(response, id) {
			
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
			$branchSelect = $('#'+ id).selectize(autoBranch);
		}
	});
});