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
	var 	_this = '', ElementModelArray, jsonObject, btModalConfirm, waybillId = 0, redirectFilter = 0, previousDate, executiveType, branchId
	, doneTheStuff = false;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			_this = this;
			this.$el.html(this.template);
	
			waybillId				= UrlParameter.getModuleNameFromParam('wayBillId');
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
		}, render: function() {
			if(waybillId > 0) {
				jsonObject				= new Object();
				jsonObject.waybillId	= waybillId;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/EditLRDateWS/initilizeEditLRDate.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
				
			} else {
				showMessage("error","LR not Found!");
				setTimeout(function(){
					window.close();
				},2000);
			}
			
			hideLayer();
	
		},loadElements : function(response) {
			console.log("response ", response)
			if(response.message != undefined){
				setTimeout(function(){
					window.close();
				},1500);
			}
				
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editLrDate/EditLRDate.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(response);
			});
			
		}, setModel : function(response) {
			
			if(response.message != undefined){
				showMessage("error",response.message.description);
				return false;
			}
			var wayBillDeatils				= response.wayBill;
			var previousDate 				= new Date();
			
			if(wayBillDeatils != undefined){
				previousDate 				= wayBillDeatils.wayBillCreationDateTimeStampString;
			}
			
			var minDate						= response.minDateTimeStamp;
			var options						= new Object();
			var elementConfiguration		= new Object();
			
			options.minDate								= minDate;
			response.isCalenderForSingleDate			= true;
			response.options							= options;
			elementConfiguration.singleDateElement		= $('#dateEle');
			response.elementConfiguration				= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			$('#dateEle').val(previousDate);
			$("#dateEle").attr('data-startdate', previousDate);
			$("#dateEle").attr('data-date', previousDate);
			
			$(".ok").on('click', function() {
				if($("#remarkEle").val() == undefined || $("#remarkEle").val() == ''){
					showMessage("error","Please Enter Remark !");
					$("#remarkEle").focus()
					return false;
				}
				var jsonObjectNew 	= new Object();

				if($("#dateEle").attr('data-date') != undefined) {
					jsonObjectNew["currentDate"] 	= $("#dateEle").attr('data-date'); 
				}
				jsonObjectNew["waybillId"] 			= waybillId;
				jsonObjectNew["previousDate"] 		= previousDate;
				jsonObjectNew["redirectTo"] 		= Number(redirectFilter);
				jsonObjectNew["remark"] 			= $("#remarkEle").val();
				
				console.log("jsonObjectNew",jsonObjectNew)
				$("#updateBtn").addClass('hide');
					
				btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Update Date?",
					modalWidth 	: 	30,
					title		:	'Update LR Booking Date',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				
				btModalConfirm.on('ok', function() {
					showLayer();
					if(!doneTheStuff){
						doneTheStuff = true;
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/EditLRDateWS/updateLRDate.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
					}
					
				});
				
				btModalConfirm.on('cancel', function() {
					$("#updateBtn").removeClass('hide');
					$("#updateBtn").focus();
					doneTheStuff = false;
					hideLayer();
				});
			});
		}, onUpdate : function(response) {
			hideLayer();
			if(response.message != undefined){
				doneTheStuff = false;
				showMessage("error",response.message.description);
				return false;
			} else {
				showMessage('success','Booking Date Updated Successfully ! ');
			}
			setTimeout(function() { 
				redirectToAfterUpdate(response);
			}, 800);
		}
	});
});

