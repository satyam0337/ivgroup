define([
	'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/appendPreLoadingSheet/appendlrinpreloadingsheetfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper3'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	 ,'elementmodel'
],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
		slickGridWrapper3, NodValidation,ElementFocusNavigation, BootstrapModal,UrlParameter,ModelUrls,datePickerUI,ElementModel){
	'use strict';
	var jsonObject = new Object()
	, myNod
	,  _this = ''
	,viewObject
	, gridObejct
	, masterLangObj
	, masterLangKeySet
	, caLangObj
	, caLangKeySet
	, preLoadingSheetLedgerId
	, plsNumber
	, preLoadingSheetBranchId
	,LangKeySet
	,columnHeaderArr,
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	columnHeaderJsonArr2
	,count=0;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			this.$el.html(this.template);
			preLoadingSheetLedgerId 						= UrlParameter.getModuleNameFromParam("preLoadingSheetLedgerId");
			plsNumber   									= UrlParameter.getModuleNameFromParam("plsNumber");
			preLoadingSheetBranchId							= UrlParameter.getModuleNameFromParam("preLoadingSheetBranchId");
			
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/preLoadingSheetWS/getPreloadingSheetDispatchElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){
			//focus navigation initiates through this function
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/appendpreloadingsheet/appendPreLoadingSheetDispatch.html",function() {
				baseHtml.resolve();
				
				$( "#singleLREle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchLRByNumber();
					}
				});
				
				$.when.apply($, loadelement).done(function() {
					masterLangObj 		= FilePath.loadLanguage();
					masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

					myNod = nod();

					myNod.configure({
						parentClass:'validation-message'
					});

					hideLayer();

					$("#reprintBtn").click(function() {
						_this.openPrint(preLoadingSheetLedgerId);
					});
					
				});
			});
		},searchLRByNumber:function(){
			showLayer();

			var jsonObject = new Object();

			jsonObject.WAYBILLNUMBER 		= $('#singleLREle').val();
			jsonObject.lsSrcBranchId 		 	= preLoadingSheetBranchId;
			
			console.log('jsonObject ',jsonObject)
			getJSON(jsonObject, WEB_SERVICE_URL+'/dispatchWs/getPendingWaybillForDispatchByWaybillNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		},setData : function(response) {
			$( "#singleLREle" ).val("");
			if(response.message != undefined){
				setTimeout(function(){$('#singleLREle').focus()}, 100);
				hideLayer();
				return;
			}
			count	= count + 1;
			
			var langObj 								= FilePath.loadLanguage();
			LangKeySet 									= loadLanguageWithParams(langObj);
			columnHeaderArr 							= ModelUrls.urlSearchCollection(response);
			filterConfiguration["searchFilterList"]		= response.searchFilterTypeConfiguration;
			filterConfiguration["listFilterList"]		= response.listFilterTypeConfiguration;
			columnHiddenConfiguration 					= response.byDefaultColumnHiddenConfiguration;

			columnHeaderJsonArr = [];

			var eleArr = columnHeaderArr;
			
			for  (var j = 0; j < eleArr.length; j++) {
				columnHeaderJsonArr.push(new ElementModel(JSON.parse(eleArr[j])).toJSON());
			}
			
			var object 				= new Object();
			
			object.ColumnHead 					= columnHeaderJsonArr;
			object.data 						= response.pendingDispatchArr;
			object.Language 					= LangKeySet;
			object.ColumnHiddenConfiguration 	= columnHiddenConfiguration;
			object.count 						= count;
			hideLayer();
			
			var responseData 					= _this.lrNumberAppend(object);
			
			hideLayer();
			$('#singleLREle').focus();
		},lrNumberAppend:function(pendingDispatchobj){
			columnHeaderJsonArr 		= pendingDispatchobj.ColumnHead;
			columnHeaderJsonArr2 		= pendingDispatchobj.ColumnHead;
			LangKeySet 					= pendingDispatchobj.Language;
			
			if(pendingDispatchobj.count == 1) {
				$( "#dispatchBtn" ).click(function() {
					_this.submitDataFromGrid();
				});
			}
			
			$('#singleLREle').focus();
			
			console.log('pendingDispatchobj.data ',pendingDispatchobj.data)
			return _this.getDataFromGrid(pendingDispatchobj.data);
		},getDataFromGrid:function(dataObject){
			if(dataObject.length > 0) {
				changeDisplayProperty('middle-border-boxshadow', 'block');
				changeDisplayProperty('bottom-border-boxshadow', 'block');

				_this.showDispatchButton();
				
				if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'doorPickupDispatchDiv'},dataObject,'wayBillId')){
					showMessage('error','LR already added.');
					return false;
				}

				slickGridWrapper3.applyGrid(
						{
							ColumnHead						:	columnHeaderJsonArr2, // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	LangKeySet, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'doorPickupDispatchDiv',
							SerialNo						:[{					// optional field // for showing Row number
								showSerialNo	:	false,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							NoVerticalScrollBar				:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							FetchAllDataButtonId 			: 	'#dispatchBtn',
							ShowDeleteButton 				: 	true,
							DataVieObject					:	viewObject,
							DataGridObject					:	gridObejct,
							PersistGridToAppend				:	true,
						});
			}	
		},submitDataFromGrid:function(){
			var selectedGridObject = slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'doorPickupDispatchDiv'});
			if(selectedGridObject != undefined) {
				var object 		= new Object();
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
				console.log(slickData);

				if(slickData.length <= 0 ){
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}

				object.slickData = dataView.getItems();
				object.lrArray  			= JSON.stringify(object.slickData);
				object.preLoadingSheetLedgerId		= preLoadingSheetLedgerId; 
				var btModal = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Dispatch ?",
					modalWidth 	: 	30,
					title		:	'Dispatch Confirmation',
					okText		:	'Yes',
					showFooter 	: 	true,
					okCloses	:	true,
					focusOk		:	true
				}).open();
			
				btModal.on('ok', function() {
				
					console.log(object);
					getJSON(object, WEB_SERVICE_URL+'/AppendLRInPreLoadingSheetWS/validateAnddispatchWayBills.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
					showLayer();
					//_this.onDispatch()
				});

			}
		},showDispatchButton:function(){
			$( ".pendingDoorPickupContent").removeClass('hide');
			$( "#dispatchBtn").removeClass('hide');
		},openPrint:function(preLoadingSheetLedgerId) {
			var newwindow=window.open('InterBranch.do?pageId=340&eventId=10&modulename=preLoadingSheetModulePrint&masterid='+preLoadingSheetLedgerId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		},onDispatch : function(response) {
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			hideLayer();
			showMessage('success','PLS '+response.lsNumber+' Appended successfully !');
			setTimeout(() => {
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=appendLrInPreLoadingSheet&preLoadingSheetLedgerId='+response.preLoadingSheetLedgerId+'&preLoadingSheetBranchId='+response.preLoadingSheetBranchId+'&plsNumber='+response.lsNumber,{trigger: true});
				location.reload();
			}, 2000);
			
		}
	});
});