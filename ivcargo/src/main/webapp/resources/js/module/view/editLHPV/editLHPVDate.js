define([  'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			 ElementFocusNavigation, BootstrapModal,UrlParameter,Selection) {
	'use strict';// this basically give strictness to this specific js
	var 	_this = '', ElementModelArray, jsonObject, btModalConfirm, lhpvId, redirectFilter = 0, previousDate, executiveType, branchId;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			_this = this;
			this.$el.html(this.template);
	
			lhpvId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			redirectFilter   	= UrlParameter.getModuleNameFromParam(MASTERID2);
			
		}, render: function() {
			if(lhpvId > 0) {
				jsonObject			= new Object();
				jsonObject.lhpvId	= lhpvId;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/initilizeEditLHPVDate.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
				
			} else {
				showMessage("error","LHPV Id not Found!");
				setTimeout(function(){
					window.close();
				},2000);
			}
			
			hideLayer();
	
		},loadElements : function(response) {
			if(response.message != undefined){
				setTimeout(function(){
					window.close();
				},1500);
			}
				
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editLHPV/EditLHPVDate.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(response);
			});
			
		}, setModel : function(response) {
			var lhpv				= response.lhpv;
			var previousDate 		= response.previousDate;
			var currentDate			= response.currentDate;
			
			var options						= new Object();
			var elementConfiguration		= new Object();
			
			options.minDate								= previousDate;
			options.startDate							= currentDate;
			response.isCalenderForSingleDate			= true;
			response.options							= options;
			elementConfiguration.singleDateElement		= $('#dateEle');
			response.elementConfiguration				= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			$('#dateEle').val(currentDate);
			$("#dateEle").attr('data-startdate', currentDate);
			$("#dateEle").attr('data-date', currentDate);
			
			$(".ok").on('click', function() {
				
				if($('#dateEle').attr('data-date') != undefined) {
					var newLhpvDate	= $('#dateEle').attr('data-date');
				} else {
					var newLhpvDate	= $('#dateEle').attr('data-startdate');
				}
				
				var lhpvDate 			= parseDate(lhpv.lhpvCreationDateTimeString);
				var newLhpvDate 		= parseDate(newLhpvDate);
				
				var isSameTime 			= newLhpvDate.getTime() == lhpvDate.getTime();
				
				if(isSameTime) {
					showMessage('error', iconForErrMsg + ' Please, Select Different Date !');
					return;
				}
				
				var jsonObjectNew 	= new Object();
				
				jsonObjectNew["currentDate"] 		= toDateString(newLhpvDate, 1);
				jsonObjectNew["lhpvId"] 			= lhpvId;
				jsonObjectNew["previousDate"] 		= lhpv.creationDateTimeString;
				jsonObjectNew["redirectTo"] 		= Number(redirectFilter);
				
				btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Update Date?",
					modalWidth 	: 	30,
					title		:	'Update Date',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					getJSON(jsonObjectNew, WEB_SERVICE_URL+'/LHPVWS/updateLHPVDate.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
				});
			});
		}, onUpdate : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}	
			
			setTimeout(function() {
				redirectToAfterUpdate(response);
			},1500);
			
			hideLayer();
		}
	});
});

