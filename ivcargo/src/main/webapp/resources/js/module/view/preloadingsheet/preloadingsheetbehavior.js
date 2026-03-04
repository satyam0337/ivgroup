 var doneTheStuff	= false;
define([
		//the file which has only name they are are already	 been loaded
		'marionette',//Marionette
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/preloadingsheetfilepath.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'
		,'language'//import in require.config
		,'errorshow'
		,'JsonUtility'
		,'messageUtility'
		], function(Marionette) {
	var _this;
	
	return Marionette.Behavior.extend({
		defaults: {
			fieldSelector: ":input",
		}, onChangeArea:function(){
			myNod.performCheck();
		}, onSearch: function() {
			_this = this;
			myNod = nod()
			myNod.performCheck();
			
			if(myNod.areAll('valid')) {

				var jsonObject = new Object();
				$(this.options.fieldSelector).each(function (index){
					if($(this).val() != ""){
						jsonObject[$(this).attr('name')] = $(this).val();
					}
				});

				$("#myGrid").html("");
				
				let myArray = jsonObject.areaSelectEle;
				let result	= Array.isArray(myArray);
			
				var finalObject = new Object();
				
				if(result != undefined && result == true){
					var areaSelectEle	= jsonObject.areaSelectEle;
						
					if(areaSelectEle != -1 && isValueExistInArray(areaSelectEle.split(","), -1)) {
						showMessage('error', 'You cannot select ALL option with other area !');
						return false;
					}
		
					finalObject.areaSelectEle = areaSelectEle;
				} else {
					finalObject.areaSelectEle = jsonObject.areaSelectEle;
				}				
				
				var branchSelectEle	= "";
				
				if(allowMultipleDestinationBranchSelection){
					var selectedBranches = $("#singleBranchEle")[0].selectize.getValue(); 
					branchSelectEle = Array.isArray(selectedBranches) ? selectedBranches.join(",") : selectedBranches;
					
					if(branchSelectEle == -1 || isValueExistInArray(branchSelectEle.split(","), -1))
						finalObject.areaSelectEle = -1;
				} else {
					branchSelectEle	= jsonObject.branchSelectEle;
				}
				
				if(branchSelectEle != undefined && branchSelectEle != -1 && isValueExistInArray(branchSelectEle.split(","), -1)) {
					showMessage('error', 'You cannot select ALL option with other branches !');
					return false;
				}
				
				finalObject.branchSelectEle = branchSelectEle != undefined ? branchSelectEle : 0;
				finalObject.crossingBranchId =  $('#crossingBranchModeEle_primary_key').val();
				finalObject.searchModeId =  $('#searchModelEle_primary_key').val();

				showLayer();
				getJSON(finalObject, WEB_SERVICE_URL+'/dispatchWs/getPendingWaybillForDispatchForPreLoading.do', _this.setElements, EXECUTE_WITH_ERROR);
			}
		}, setPreloadingsheetDataFromDispatch : function(elementValue) {
			let finalObject = new Object();
			finalObject.areaSelectEle	= elementValue.destinationSubRegionId;
			finalObject.branchSelectEle = elementValue.destinationBranchId;
			
			_this = this;

			getJSON(finalObject, WEB_SERVICE_URL + '/dispatchWs/getPendingWaybillForDispatchForPreLoading.do', _this.setElements, EXECUTE_WITH_ERROR);
		}, setElements : function(response) {
			hideLayer();
			if(typeof response.flavourType != 'undefined') {
				if(response.flavourType == 'PreloadingSheet_1') {
					if(response.accountGroupId > ACCOUNT_GROUP_ID_APT || response.accountGroupId == ACCOUNT_GROUP_ID_DEMO) {
						require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/preloadingsheetsetup_19.js'], function(PreLoadingSheetSetUp) {
							PreLoadingSheetSetUp.renderElements(response);
						})
					} else {
						require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/preloadingsheetsetup_1.js'], function(PreLoadingSheetSetUp) {
							PreLoadingSheetSetUp.renderElements(response);
						})
					}
				} else {
					require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/' + response.flavourType + '.js'], function(PreLoadingSheetSetUp) {
						PreLoadingSheetSetUp.renderElements(response);
					})
				}
			} else
				hideLayer();
		}, onPrint : function() {
			PreLoadingSheetSetUp.onPrint();
		}
	});
});

function setValue(value){
	doneTheStuff = value;
}