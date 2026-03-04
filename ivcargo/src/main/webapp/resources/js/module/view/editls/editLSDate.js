define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
          ],
          function(JsonUtility, MessageUtility, UrlParameter,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		 NodValidation,ElementFocusNavigation,Selectizewrapper,redirectTo,Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '',dispatchLedgerId,redirectTo,previousDate;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
			jsonObject.dispatchLedgerId		= dispatchLedgerId;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/editLSWS/getDispatchDateByDispatchLedgerId.do?', _this.renderUpdateLSDate, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderUpdateLSDate : function (response){
			console.log("response ", response)
			hideLayer();
			if(response.message != undefined){
				setTimeout(function(){
					window.close();
				},1500);
			}
				
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editLS/editLSDate.html",function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(response);
			});
			
		}, setModel : function(response){
			
			var minDate						= response.minDateTime;
			var maxDate						= response.maxDateTime;
			var options						= new Object();
			var elementConfiguration		= new Object();
			previousDate				= response.lsDate;
				
			options.minDate								= minDate;
			options.maxDate								= maxDate;
			response.isCalenderForSingleDate			= true;
			response.options							= options;
			elementConfiguration.singleDateElement		= $('#dateEle');
			response.elementConfiguration				= elementConfiguration;
				
			Selection.setSelectionToGetData(response);
				
			$('#dateEle').val(previousDate);
			$("#dateEle").attr('data-startdate', previousDate);
			$("#dateEle").attr('data-date', previousDate);

			$("#updateBtn").click(function() {
				_this.onSubmit(_this);								
			});
				
		},onSubmit : function() {
			showLayer();
			var answer = confirm ("Are you Sure to Update LS Date?");
			
			if (answer){
				var jsonObjectNew 	= new Object();

				if($("#dateEle").attr('data-date') != undefined) {
					jsonObjectNew["newDispatchDate"] 	= $("#dateEle").attr('data-date'); 
				}
				jsonObjectNew["dispatchLedgerId"] 	= dispatchLedgerId;
				jsonObjectNew["previousDate"] 		= previousDate;
				jsonObjectNew["redirectTo"] 		= Number(redirectTo);
				
				getJSON(jsonObjectNew, WEB_SERVICE_URL+'/editLSWS/updateLSDate.do', _this.setEditLsDateResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		},setEditLsDateResponse : function(response) {
			if(response.message.typeName != undefined) {
				hideLayer();
				setTimeout(function(){redirectToAfterUpdate(response)}, 1500);
			}
			hideLayer();
		}
	});
});