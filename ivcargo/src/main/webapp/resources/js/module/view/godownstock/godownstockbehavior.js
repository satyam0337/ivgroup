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
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/godownstock/LRDetails.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/godownstock/godownstockfilepath.js'//FilePath
        ,'language'//import in require.config
        ,'/ivcargo/resources/js/module/view/godownstock/loadgodownstockmodelurls.js'
        ,'elementmodel'
        ,'slickGridWrapper'
        ,'errorshow'
        ,'messageUtility'
        ,'JsonUtility'
        ], function(Marionette,BootstrapModal,LRDetails,FilePath,Language,Modelurls,ElementModel,slickGridWrapper,errorshow,messageUtility,JsonUtility){
	var _this,
	gridObj;
	var filterConfiguration = new Object();
	return Marionette.Behavior.extend({
		defaults: {
			fieldSelector: ":input",
		},
		onSearchLRDetails: function() {
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

			jsonObject["regionId"] 			= $('#regionSelectEle_primary_key').val();
			jsonObject["subRegionId"] 		= $('#subRegionSelectEle_primary_key').val();
			jsonObject["sourceBranchId"] 	= $('#branchSelectEle_primary_key').val();
			jsonObject["godownId"] 			= $('#godownEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/godownStockReportWS/getGodownStockDetails.do', _this.setData, EXECUTE_WITH_ERROR);

		},setData:function(response){
			hideAllMessages();
			if(response.message != undefined){
				hideLayer();
				$('#myGrid').html('');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			var configuration = response.configuration;
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

			var showDetailsButton =true;

			if(!configuration.hasOwnProperty(12)){
				showDetailsButton = false;
			}

			gridObj = slickGridWrapper.applyGrid(
					{
						ColumnHead:columnHeaderJsonArr, // *compulsory // for table headers
						ColumnData:response.godownStockReport, 	// *compulsory // for table's data
						Language:LangKeySet, 			// *compulsory for table's header row language
						ShowPrintButton:true,
						ShowPartialButton:showDetailsButton,
						CallBackFunctionForPartial:_this.callBackFunctionForPartial,
						DivId:'myGrid',				// *compulsary field // division id where slickgrid table has to be created
						InnerSlickId:'data',
						InnerSlickHeight : '500px',
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

		},callBackFunctionForPartial:function(grid,dataView,row){


			var jsonObject = new Object();
			jsonObject["sourceBranchId"] 		= $('#branchSelectEle_primary_key').val();
			jsonObject["destinationBranchId"] 	= dataView.getItem(row).destinationBranchId;
			jsonObject["godownId"] = dataView.getItem(row).godownId;

			var object = new Object();
			object.elementValue = jsonObject;
			object.gridObj = gridObj;

			var btModal = new Backbone.BootstrapModal({
				content: new LRDetails(object),
				modalWidth : 50,
				title:'LR Details'

			}).open();
			object.btModal = btModal;
			new LRDetails(object)
			btModal.open();
		}
	});
});