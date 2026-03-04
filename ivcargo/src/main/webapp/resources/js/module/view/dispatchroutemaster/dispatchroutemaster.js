define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/dispatchroutemaster/dispatchroutemasterfilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'slickGridWrapper2',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchroutemaster/dispatchroutemasterdetails.js',
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchroutemaster/dispatchroutehistorydetails.js'],

			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, 
					AutoCompleteWrapper,slickGridWrapper2, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal,UrlParameter, Selection, DispatchRouteDetails, DispatchRouteHistoryDetails) {
			'use strict';

			var jsonObject = new Object(), 
			myNod,
			myNod2,
			_this = '',
			masterLangKeySet,
			gridObject,
			dispatchRouteId,
			showViewAllDispatchRoute = false,
			dataUpdated = false,
			dataDeleted = false,
			dataAdded = false;

			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					showViewAllDispatchRoute 			= UrlParameter.getModuleNameFromParam('updateCount');
					dataUpdated 						= UrlParameter.getModuleNameFromParam('dataUpdate');
					dataDeleted 						= UrlParameter.getModuleNameFromParam('dataDelete');
					dataAdded 							= UrlParameter.getModuleNameFromParam('dataAdd');

				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchRouteWS/getDispatchRouteElement.do?',	_this.setDispatchRouteElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setDispatchRouteElements : function(response) {
					showLayer();

					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/dispatchroutemaster/DispatchRouteMaster.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						masterLangKeySet = loadLanguageWithParams(FilePath.loadLanguage());

						$("#middle-border-boxshadow").hide();
						$("#bottom-border-boxshadow").css("opacity", 0);

						var dispatchRouteAutoComplete = new Object();
						dispatchRouteAutoComplete.primary_key 	= 'dispatchRouteId';
						dispatchRouteAutoComplete.callBack 		= _this.onDispatchRouteSelect;
						dispatchRouteAutoComplete.field 		= 'dispatchRouteNameAndTime';
						$("#dispatchRouteEle").autocompleteCustom(dispatchRouteAutoComplete);

						var autoDispatchRoute = $("#dispatchRouteEle").getInstance();
						$(autoDispatchRoute).each(function() {
							this.option.source = response.DispatchRoute.CorporateAccount;
						});
						
						var dispatchRouteColumnConfig	= response.DispatchRoute.columnConfiguration;
						var dispatchRouteKeys			= _.keys(dispatchRouteColumnConfig);
						var bcolConfig					= new Object();

						for (var i=0; i<dispatchRouteKeys.length; i++) {
							var bObj	= dispatchRouteColumnConfig[dispatchRouteKeys[i]];
							if (bObj.show == true) {
								bcolConfig[dispatchRouteKeys[i]]	= bObj;
							}
						}

						response.DispatchRoute.columnConfiguration	= bcolConfig;
						response.DispatchRoute.Language				= masterLangKeySet;

						if(response.DispatchRoute.CorporateAccount != undefined && response.DispatchRoute.CorporateAccount.length > 0) {
							response.DispatchRoute.tableProperties.callBackFunctionForPartial = _this.callBackFunctionForHistory;
							gridObject = slickGridWrapper2.setGrid(response.DispatchRoute);

							gridObject.onDblClick.subscribe(function (e, args){
								var cell = gridObject.getCellFromEvent(e)
								var row = cell.row;
								var dataView = gridObject.getData();
								var item = dataView.getItem(row);
								_this.getDataPopForUpdate(item,response);
							});
						}

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector		: '#dispatchRouteTimeEle',
							validate		: 'presence',
							errorMessage	: 'Enter Route Time !'
						});

						myNod.add({
							selector		: '#dispatchRouteNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Route Description !'
						});

						myNod2 = nod();
						myNod2.configure({
							parentClass:'validation-message'
						});

						myNod2.add({
							selector		: '#dispatchRouteTimeEle',
							validate		: 'presence',
							errorMessage	: 'Enter Route Time !'
						});
						
						myNod2.add({
							selector		: '#dispatchRouteNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Route Description !'
						});

						$("#dispatchRouteTimeEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});

						$("#dispatchRouteNameEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});

						$("#saveBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')) {
								_this.saveDispatchRoute();
							}
						});

						$("#updateBtn").click(function() {
							myNod2.performCheck();
							if(myNod2.areAll('valid')) {
								_this.updateDispatchRoute();
							}
						});

						$("#deleteBtn").click(function() {
							_this.deleteDispatchRoute();
						});

						$("#viewAllDispatchRoute").click(function() {
							_this.viewAllDispatchRoute();
						});

						$("#add").click(function(){
							_this.addDispatchRoute();
						});

						if(showViewAllDispatchRoute != null && (showViewAllDispatchRoute == 'true' || showViewAllDispatchRoute == true)) {
							_this.viewAllDispatchRoute();
						}
						
						if(dataAdded != null && (dataAdded == 'true' || dataAdded == true)) {
							showMessage('success','Data Added Successfully !');
						} else if(dataUpdated != null && (dataUpdated == 'true' || dataUpdated == true)) {
							showMessage('success','Data Updated Successfully !');
						} else if(dataDeleted != null && (dataDeleted == 'true' || dataDeleted == true)) {
							showMessage('success','Data Deleted Successfully !');
						}
					});
				},onDispatchRouteSelect : function () {
					showLayer();
					var jsonObject = new Object();

					jsonObject.dispatchRouteId		= $('#dispatchRouteEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/getDispatchRouteDetailsByDispatchRouteMasterId.do', _this.setDispatchRoute, EXECUTE_WITH_ERROR);
				},setDispatchRoute : function (response) {
					$("#dispatchRouteTime").removeClass("hide");
					$("#dispatchRouteName").removeClass("hide");

					$('#updateBtn').attr("disabled",true);

					$('#dispatchRouteNameEle').val(response.DispatchRoute.dispatchRouteName);
					$('#dispatchRouteTimeEle').val(response.DispatchRoute.dispatchRouteTime);

					$("#saveBtn").addClass("hide");
					$("#updateBtn").removeClass("hide");
					$("#deleteBtn").removeClass("hide");

					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "right" }, 500);

					hideLayer();
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
				}, saveDispatchRoute : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.dispatchRouteTime	= $('#dispatchRouteTimeEle').val();
					jsonObject.dispatchRouteName	= $('#dispatchRouteNameEle').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/addDispatchRoute.do', _this.afterSave, EXECUTE_WITH_ERROR);
				},afterSave	: function(response) {
					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=dispatchRouteMaster&updateCount='+false+'&dataUpdate='+false+'&dataDelete='+false+'&dataAdd='+true);
					location.reload();
				}, updateDispatchRoute : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.dispatchRouteId		= $('#dispatchRouteEle_primary_key').val();
				    jsonObject.dispatchRouteName	= $('#dispatchRouteNameEle').val();
					jsonObject.dispatchRouteTime	= $('#dispatchRouteTimeEle').val();
					jsonObject.markForDelete		= false;

					getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/updateDispatchRoute.do', _this.afterUpdate, EXECUTE_WITH_ERROR);
				},afterUpdate	: function(response) {
					var jsonObject = new Object();

//					if(response.dispatchRouteId != undefined && response.dispatchRouteId > 0) {
//						jsonObject.dispatchRouteId		= response.dispatchRouteId;
//						getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/getDispatchRouteDetailsByDispatchRouteMasterId.do', _this.setDispatchRoute, EXECUTE_WITH_ERROR);
//					}
					
					_this.setDispatchRouteElements(response);
					showMessage('success','Data Updated Successfully !');
					hideLayer();
				}, deleteDispatchRoute : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.dispatchRouteId		= $('#dispatchRouteEle_primary_key').val();
				    jsonObject.dispatchRouteName	= $('#dispatchRouteNameEle').val();
					jsonObject.dispatchRouteTime	= $('#dispatchRouteTimeEle').val();
					jsonObject.markForDelete		= true;

					getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/updateDispatchRoute.do', _this.afterDelate, EXECUTE_WITH_ERROR);
				},afterDelate	: function(response) {
					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=dispatchRouteMaster&updateCount='+false+'&dataUpdate='+false+'&dataDelete='+true+'&dataAdd='+false);
					location.reload();
				},resetDispatchRouteFeilds	: function() {
					$('#dispatchRouteTimeEle').val("");
					$('#dispatchRouteNameEle').val("");
				},viewAllDispatchRoute	: function() {

					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 1);
					$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);

				},addDispatchRoute	: function() {
					_this.resetDispatchRouteFeilds();
					$("#dispatchRouteTime").removeClass("hide");
					$("#dispatchRouteName").removeClass("hide");
					
					$("#saveBtn").removeClass("hide");
					$("#updateBtn").addClass("hide");
					$("#deleteBtn").addClass("hide");
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "left" }, 500);
				},getDataPopForUpdate:function(item){
					var jsonObject = new Object();

					if(item.dispatchRouteId != undefined && item.dispatchRouteId > 0) {
						jsonObject["dispatchRouteId"] 		= item.dispatchRouteId;
					}

					var object 			= new Object();
					object.elementValue = jsonObject;

					var btModal = new Backbone.BootstrapModal({
						content: new DispatchRouteDetails(object),
						modalWidth : 60,
						title:'Update Dispatch Route Details'

					}).open();
					object.btModal = btModal;
					new DispatchRouteDetails(object)
					btModal.open();
				},callBackFunctionForHistory:function(grid,dataView,row){

					var jsonObject = new Object();
					jsonObject["dispatchRouteId"] 	= dataView.getItem(row).dispatchRouteId;
					dispatchRouteId					= dataView.getItem(row).dispatchRouteId;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchRouteWS/getDispatchRouteHistoryDetailsByDispatchRouteMasterId.do', _this.showDispatchRouteHistory, EXECUTE_WITH_ERROR);
				},showDispatchRouteHistory : function(response) {
					if(response.DispatchRouteHistory != undefined && (response.DispatchRouteHistory.CorporateAccount).length > 0) {
						var jsonObject = new Object();
						jsonObject["response"] 		= response;
						
						var object = new Object();
						object.elementValue = jsonObject;

						var btModal = new Backbone.BootstrapModal({
							content: new DispatchRouteHistoryDetails(object),
							modalWidth : 55,
							title:'Dispatch Route History Details'
						}).open();
						
						object.btModal = btModal;
						new DispatchRouteHistoryDetails(object)
						btModal.open();
					} else {
						hideLayer();
						showMessage('error','Route History Not Found!');
					}
				}
			});
		});