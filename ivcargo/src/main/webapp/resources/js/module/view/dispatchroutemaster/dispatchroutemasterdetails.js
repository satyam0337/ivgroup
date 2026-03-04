/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/dispatchroutemaster/dispatchroutemasterfilepath.js',
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
	CorporateAccount,
	masterLangKeySet,
	myNod,
	gridObject,
	dispatchRouteId;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
			dispatchRouteId		= jsonObject.dispatchRouteId;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/getDispatchRouteDetailsByDispatchRouteMasterId.do', _this.setDispatchRoute, EXECUTE_WITH_ERROR);
		},setDispatchRoute : function(response) {

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/dispatchroutemaster/DispatchRouteDetails.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);

				$('#upupdateBtn').attr("disabled",true);

				$('#updispatchRouteNameEle').val(response.DispatchRoute.dispatchRouteName);
				$('#updispatchRouteTimeEle').val(response.DispatchRoute.dispatchRouteTime);

				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#updispatchRouteTimeEle',
					validate		: 'presence',
					errorMessage	: 'Enter Route Time !'
				});
				
				myNod.add({
					selector		: '#updispatchRouteNameEle',
					validate		: 'presence',
					errorMessage	: 'Enter Route Description !'
				});

				$("#updispatchRouteTimeEle").keyup(function() {
					$('#upupdateBtn').attr("disabled",false);
				});

				$("#updispatchRouteNameEle").keyup(function() {
					$('#upupdateBtn').attr("disabled",false);
				});
				
				$("#upupdateBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')) {
						_this.updateDispatchRoute();
					}
				});

				$("#updeleteBtn").click(function() {
					_this.deleteDispatchRoute();
				});

				hideLayer();
			});

		}, updateDispatchRoute : function() {
			showLayer();
			var jsonObject = new Object();

			jsonObject.dispatchRouteId		= dispatchRouteId;
		    jsonObject.dispatchRouteName	= $('#updispatchRouteNameEle').val();
			jsonObject.dispatchRouteTime	= $('#updispatchRouteTimeEle').val();
			jsonObject.markForDelete		= false;

			getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/updateDispatchRoute.do', _this.afterUpdate, EXECUTE_WITH_ERROR);
		},afterUpdate	: function(response) {
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=dispatchRouteMaster&updateCount='+true+'&dataUpdate='+true+'&dataDelete='+false+'&dataAdd='+false);
			location.reload();
		}, deleteDispatchRoute : function() {
			showLayer();
			var jsonObject = new Object();

			jsonObject.dispatchRouteId		= dispatchRouteId;
		    jsonObject.dispatchRouteName	= $('#updispatchRouteNameEle').val();
			jsonObject.dispatchRouteTime	= $('#updispatchRouteTimeEle').val();
			jsonObject.markForDelete		= true;

			getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/updateDispatchRoute.do', _this.afterDelate, EXECUTE_WITH_ERROR);
		},afterDelate	: function(response) {
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=dispatchRouteMaster&updateCount='+true+'&dataUpdate='+false+'&dataDelete='+true+'&dataAdd='+false);
			location.reload();
		}
	});
});