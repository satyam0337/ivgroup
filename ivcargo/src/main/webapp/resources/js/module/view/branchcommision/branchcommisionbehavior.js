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
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/branchcommision/branchcommisionfilepath.js'//FilePath
        ,'language'//import in require.config
        ,'/ivcargo/resources/js/module/view/branchcommision/loadbranchcommisionmodelurls.js'
        ,'elementmodel'
        ,'slickGridWrapper'
        ,'errorshow'
        ,'messageUtility'
        ,'JsonUtility'
        ], function(Marionette,FilePath,Language,Modelurls,ElementModel,slickGridWrapper,errorshow,messageUtility,JsonUtility){
	var _this;
	var filterConfiguration = new Object();
	return Marionette.Behavior.extend({
		defaults: {
			fieldSelector: ":input",
		},
		onSave: function() {
			_this = this;
			if(!_this.validateElements()){
				return false;
			}
			showLayer();
			var jsonObject = new Object();
			$(this.options.fieldSelector).each(function (index){
				if($(this).attr('data-startdate') != undefined){
					jsonObject["startdate"] = $(this).attr('data-startdate'); 
				}
				if($(this).attr('data-enddate') != undefined){
					jsonObject["enddate"] = $(this).attr('data-enddate'); 
				}});

			jsonObject["sourceSubRegionId"] = $('#sourceSubRegionSelectEle_primary_key').val();
			jsonObject["sourceBranchId"] = $('#sourceBranchSelectEle_primary_key').val(); 
			jsonObject["destinationBranchId"] = $('#destinationBranchSelectEle_primary_key').val(); 

			getJSON(jsonObject, WEB_SERVICE_URL+'/branchCommisionReport/getBranchCommisionDetails.do', _this.setData, EXECUTE_WITH_ERROR);

		},setData:function(response){
			hideAllMessages();
			if(response.message != undefined){
				hideLayer();
				$('#myGrid').html('');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			var langObj = FilePath.loadLanguage();
			var LangKeySet = loadLanguageWithParams(langObj);
			var columnHeaderArr = Modelurls.urlModelCollection(response);
			filterConfiguration["searchFilterList"]=response.searchFilterTypeConfiguration;
			filterConfiguration["listFilterList"]=response.listFilterTypeConfiguration;
			columnHiddenConfiguration = response.byDefaultColumnHiddenConfiguration;

			var columnHeaderJsonArr = [];

			var eleArr = columnHeaderArr;
			for  (var j=0; j < eleArr.length;j++) {
				columnHeaderJsonArr.push(new ElementModel(JSON.parse(eleArr[j])).toJSON());
			}

			slickGridWrapper.applyGrid(
					{
						ColumnHead:columnHeaderJsonArr, // *compulsory // for table headers
						ColumnData:response.branchCommisionReport, 	// *compulsory // for table's data
						Language:LangKeySet, 			// *compulsory for table's header row language
						ShowPrintButton:true,
						DivId:'myGrid',				// *compulsary field // division id where slickgrid table has to be created
						SerialNo:[{						// optional field // for showing Row number
							showSerialNo:true,
							SearchFilter:false,          // for search filter on serial no
							ListFilter:false				// for list filter on serial no
						}],
						ColumnHiddenConfiguration:columnHiddenConfiguration, // optional for hiding columns account group specifically
						AllowFilter:filterConfiguration,	 // optional field // for showing filters on each column
						NoVerticalScrollBar:false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
					});
			hideLayer();
		},validateElements : function(){

			//this will check all the elements which have been added in configuration
			if(!myNod.areAll('valid')){
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			}
			myNod.performCheck();
			//this will give true if all elements validation is true
			return myNod.areAll('valid');

		}
	});
});