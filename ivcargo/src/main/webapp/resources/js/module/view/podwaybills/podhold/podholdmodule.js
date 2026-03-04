define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/podwaybills/podhold/podholdmodulefilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper3'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/podwaybills/podhold/lrForPODHold.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper3, NodValidation,ElementFocusNavigation, BootstrapModal,lrForPODHold,UrlParameter,datePickerUI) {
	'use strict';
	var jsonObject = new Object()
	, myNod
	,  _this = ''
	, gridObject
	, masterLangObj
	, masterLangKeySet
	, caLangObj
	, caLangKeySet
	, wayBillIds = null
	,LangKeySet
	,count=0;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			this.$el.html(this.template);
			
			wayBillIds 						= UrlParameter.getModuleNameFromParam(MASTERID);
			
			if(wayBillIds != null) {
				showLayer();

				var jsonObject = new Object();

				jsonObject["wayBillIds"] 	= wayBillIds;

				getJSON(jsonObject, WEB_SERVICE_URL+'/podHoldWS/getPodDetailsForHoldByWayBillIds.do?', _this.setData, EXECUTE_WITH_ERROR);
			}
			
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/podHoldWS/getPODHoldElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){

			//focus navigation initiates through this function
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/podwaybills/podHold/podHold.html",function() {
				baseHtml.resolve();					
				$( "#singleLREle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchLRByNumber();
					}
				});
			});

			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				hideLayer();

				$("#findBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSearch();								
					}
				});
			});

		},searchLRByNumber:function(){
			showLayer();

			var jsonObject = new Object();

			jsonObject["wayBillNumber"] 	= $('#singleLREle').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/podHoldWS/getPodDetailsForHoldByWayBillNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		},setData : function(response) {
			$( "#singleLREle" ).val("");
			if(response.message != undefined){
				setTimeout(function(){$('#singleLREle').focus()}, 100);
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			var langObj 	= FilePath.loadLanguage();
			LangKeySet 		= loadLanguageWithParams(langObj);
			
			if(response.PODWaybillsModel != undefined) {
				var PODWaybillsModelColumnConfig 	= response.PODWaybillsModel.columnConfiguration;
				var PODWaybillsModelColumnKeys		= _.keys(PODWaybillsModelColumnConfig);
				var PODWaybillsModelConfig			= new Object();
				
				for (var i = 0; i < PODWaybillsModelColumnKeys.length; i++) {
					var bObj	= PODWaybillsModelColumnConfig[PODWaybillsModelColumnKeys[i]];
					
					if (bObj.show != undefined && bObj.show == true) {
						PODWaybillsModelConfig[PODWaybillsModelColumnKeys[i]] = bObj;
					}
				}
			
				response.PODWaybillsModel.columnConfiguration	= _.values(PODWaybillsModelConfig);
				response.PODWaybillsModel.Language				= LangKeySet;
			}
			
			count	= count + 1;
			
			var lrForHold 	= new lrForPODHold();
			var object 				= new Object();
			object.ColumnHead 		= response.PODWaybillsModel.columnConfiguration;
			object.data 			= _.values(response.PODWaybillsModel.CorporateAccount);
			object.Language 		= response.PODWaybillsModel.Language;
			object.count 			= count;

			var responseData	= false;
			responseData = lrForHold.lrNumberAppend(object);
			
			hideLayer();
			$('#singleLREle').focus();
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
		},onSearch : function() {
			showLayer();

			var jsonObject = new Object();

			jsonObject["wayBillNumber"] 	= $('#singleLREle').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/podHoldWS/getPodDetailsForHoldByWayBillNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		}
	});
});

function podActionHoldUnHold(grid, dataView, row) {

	var btModalConfirm = new Backbone.BootstrapModal({
		content		: 	"Are you sure you want to Hold ?",
		modalWidth 	: 	30,
		title		:	'Hold OR Unhold',
		okText		:	'YES',
		showFooter 	: 	true,
		okCloses	:	true
	}).open();

	btModalConfirm.on('ok', function() {
		var jsonObject = new Object();

		jsonObject["waybillId"] 				= dataView.getItem(row).wayBillId;
		if(dataView.getItem(row).podhold) {
			jsonObject["isPODHold"] 			= false;
		} else {
			jsonObject["isPODHold"] 			= true;
		}
		
		getJSON(jsonObject, WEB_SERVICE_URL+'/podHoldWS/holdPODWayBill.do',podHoldUnHold, EXECUTE_WITH_ERROR); //submit JSON
		
		var item = dataView.getItem(row);//row is the number of the row
		var rowID = item.id

		dataView.deleteItem(rowID);//rowID is the actual ID of the row and not the row number
		grid.invalidate();
		grid.render();		
	});	
}

function podHoldUnHold() {
	
}