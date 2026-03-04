define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/unclaimedGoodsNotice/unclaimedGoodsNoticeFilePath.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'slickGridWrapper2',
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, jquerylingua, language, NodValidation, FocusNavigation, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	myNod,
	masterLangKeySet,
	gridObject,
	masterLangObj,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this 			= this;
			wayBillId 		= UrlParameter.getModuleNameFromParam('wayBillId');
			console.log('wayBillId in >>> ', wayBillId)
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			
			jsonObject				= new Object();
			jsonObject.waybillId	= wayBillId;
			
			console.log('jsonObject >>> ', jsonObject)
			getJSON(jsonObject, WEB_SERVICE_URL + '/unclaimedGoodsNoticeWS/getAllNoticesByWayBillId.do?', _this.setRemarksOnLR, EXECUTE_WITHOUT_ERROR);
	
		}, setRemarksOnLR : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/unclaimedGoodsNotice/viewUnclaimedGoodsNotice.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {

				initialiseFocus();
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				console.log('response >>> ', response)
				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 1000);
					return;
				}
				
				var ColumnConfig		= response.UnclaimedGoodsNotice.columnConfiguration;
				var columnKeys			= _.keys(ColumnConfig);
				var bcolConfig			= new Object();
				
				for (var i=0; i<columnKeys.length; i++) {
					var bObj		= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]]	= bObj;
					}
				}
				response.UnclaimedGoodsNotice.columnConfiguration		= _.values(bcolConfig);
				response.UnclaimedGoodsNotice.Language					= masterLangKeySet;
				
				hideLayer();
				gridObject = slickGridWrapper2.setGrid(response.UnclaimedGoodsNotice);
			});
		}
	});
});

function setPrint(response){
	console.log('response >>> ', response)
	if(response.message != undefined) {
		var errorMessage = response.message;
		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
		hideLayer();
		return;
	}
	var waybillId 	 = response.waybillId;
	var noticeId	 = response.noticeId;
}

function printNotice(grid, dataView,row){
	var object = dataView.getItem(row);
	
	var waybillId 	 = object.waybillId;
	var noticeId	 = object.noticeId;
	 childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=unclaimedGoodsNoticeprintsetup&masterid=" + waybillId + "&noticeId="+noticeId,"newwin","width=400,height=200");
}