/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/godownstock/godownstockfilepath.js'//FilePath
        ,'/ivcargo/resources/js/module/view/godownstock/loadgodownstockmodelurls.js'
        ,'language'//import in require.config
        ,'slickGridWrapper'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'elementmodel'
        ,'elementTemplateJs'
        ,'constant'
        ], function (FilePath,ModelUrls,Language,slickGridWrapper,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	LangKeySet,
	columnHeaderArr,
	allGridObject,
	selectedGridObject,
	viewObject,
	gridObejct,
	btModal,
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this = this;

			jsonObject = jsonObjectData.elementValue;
			btModal		= jsonObjectData.btModal;
			selectedGridObject = jsonObjectData.gridObj;
		},
		render: function(){
			showLayer();
			if(jsonObject.godownId > 0){
				getJSON(jsonObject, WEB_SERVICE_URL+'/godownStockReportWS/getGodownStockDetailsByGodownId.do', _this.setElements, EXECUTE_WITH_ERROR);
			}else {
				getJSON(jsonObject, WEB_SERVICE_URL+'/godownStockReportWS/getGodownStockDetailsByDestinationId.do', _this.setElements, EXECUTE_WITH_ERROR);
			}
		},setElements : function(response){

			btModal.on('close cancel', function() {
				if(selectedGridObject != undefined){
					slickGridWrapper.applyGrid({
						UpdateGrid : selectedGridObject,
						ColumnHead:columnHeaderJsonArr, // *compulsory // for table headers
						Language:LangKeySet,
						ColumnHiddenConfiguration:columnHiddenConfiguration, // optional for hiding columns account group specifically
						AllowFilter:filterConfiguration,	 // optional field // for showing filters on each column
						EditRowsInSlick : true,
					})
				}
			})

			hideAllMessages();

			var langObj = FilePath.loadLanguage();
			var LangKeySet = loadLanguageWithParams(langObj);
			var columnHeaderArr = ModelUrls.urlModelCollection(response);
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
						ColumnData:response.godownStockReport, 	// *compulsory // for table's data
						Language:LangKeySet, 			// *compulsory for table's header row language
						ShowPrintButton:true,
						DivId:'modalBody',				// *compulsary field // division id where slickgrid table has to be created
						InnerSlickId:'popupData',
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
		}
	});
});

