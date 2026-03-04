define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(UrlParameter, Selection) {
	'use strict';// this basically give strictness to this specific js
	let 	_this = '', jsonObject, btModalConfirm, waybillId = 0, redirectFilter = 0, doneTheStuff = false;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);
	
			waybillId				= UrlParameter.getModuleNameFromParam(MASTERID);
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
		}, render: function() {
			jsonObject				= new Object();
			jsonObject.waybillId	= waybillId;
				
			getJSON(jsonObject, WEB_SERVICE_URL+'/editDeliveryDateWS/initilizeEditLRDeliveryDate.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
			
			hideLayer();
		}, loadElements : function(response) {
			if(response.message != undefined) {
				let successMessage = response.message;
				showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
					
				setTimeout(function(){
					window.close();
				},1500);
			}
				
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editLrDate/EditLRDeliveryDate.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(response);
			});
			
		}, setModel : function(response) {
			if(response.message != undefined){
				let successMessage = response.message;
				showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
				return false;
			}

			let previousDate 				= response.previousDate;
			
			let options						= new Object();
			let elementConfiguration		= new Object();
			
			options.minDate								= response.minDateTimeStamp;
			
			elementConfiguration.singleDateElement		= $('#dateEle');
			
			response.options							= options;
			response.isCalenderForSingleDate			= true;
			response.elementConfiguration				= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			$('#dateEle').val(previousDate);
			$("#dateEle").attr('data-startdate', previousDate);
			$("#dateEle").attr('data-date', previousDate);
			
			$(".ok").on('click', function() {
				if($("#remarkEle").val() == undefined || $("#remarkEle").val() == '') {
					showMessage("error","Please Enter Remark !");
					$("#remarkEle").focus()
					return false;
				}

				let jsonObjectNew 	= new Object();

				if($("#dateEle").attr('data-date') != undefined)
					jsonObjectNew["currentDate"] 	= $("#dateEle").attr('data-date'); 

				jsonObjectNew["waybillId"] 			= waybillId;
				jsonObjectNew["redirectTo"] 		= Number(redirectFilter);
				jsonObjectNew["remark"] 			= $("#remarkEle").val();
				
				$("#updateBtn").addClass('hide');
					
				btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Update Date?",
					modalWidth 	: 	30,
					title		:	'Update Delivery Date',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				btModalConfirm.on('ok', function() {
					showLayer();

					if(!doneTheStuff) {
						doneTheStuff = true;
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/editDeliveryDateWS/updateLRDeliveryDate.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
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
			
			if(response.message != undefined) {
				let successMessage = response.message;
				showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
				return false;
			}
			
			setTimeout(function() { 
				redirectToAfterUpdate(response);
			}, 200);
		}
	});
});
