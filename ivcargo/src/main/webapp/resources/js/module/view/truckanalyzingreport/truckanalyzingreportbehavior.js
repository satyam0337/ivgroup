/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        //the file which has only name they are are already  been loaded
        'marionette'//Marionette
        //marionette JS framework
        ,PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/truckanalyzingreport/truckanalyzingreportfilepath.js'//FilePath
        ,'language'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/truckanalyzingreport/loadtruckanalyzingreportmodelurls.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/truckanalyzingreport/settruckanalyzingreportdetails.js'
        ,'elementmodel'
        ,'slickGridWrapper'
        ,'errorshow'
        ,'messageUtility'
        ,'JsonUtility'
        ], function(Marionette,BootstrapModal,FilePath,Language,Modelurls,TruckAnalyzeReport,ElementModel,slickGridWrapper,errorshow,messageUtility,JsonUtility){
	var _this,
	gridObj,
	myNod;
	var filterConfiguration = new Object();
	return Marionette.Behavior.extend({
		defaults: {
			fieldSelector: ":input",
		},
		onSearchLRDetails: function() {
			_this = this;
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector: '#LSNumberEle',
				validate: 'validateAutocomplete:#LSNumberEle',
				errorMessage: 'Enter LS Number !'
			});
			
			myNod.performCheck();
			if(!myNod.areAll('valid')){
				return;							
			}	
			
			showLayer();
			var jsonObject = new Object();
			
			jsonObject["lsNumber"] = $('#LSNumberEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/truckAnalyzingReportWS/getTruckAnalyzingReportDetails.do', _this.setData, EXECUTE_WITH_ERROR);

		},setData:function(response){
			hideAllMessages();

			if(response.message != undefined){
				hideLayer();
				$('#myGrid').html('');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			TruckAnalyzeReport.setTruckAnalyzingReportDetails(response);
			
			hideLayer();
		}
	});
});