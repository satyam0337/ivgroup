define([  
          'selectizewrapper'
		,'JsonUtility'
          ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/bootstrap/bootstrap-clockpicker.min.js'
          ],
          function(Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', savedSuccess, discountMaster, modal1 = null, rowId = 0,
	discountMasterId, discountTypeId;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData;
			rowId				= jsonObject.rowId;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/discountMasterWS/getDiscountMasterByIdForUpdate.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function (response) {
			hideLayer();
			
			discountMasterId	= jsonObject.discountMasterId;
			discountMaster		= response.DiscountMaster;
			discountTypeId		= jsonObject.discountTypeId;
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function() {
				$(".update-modal-body").load("/ivcargo/html/module/discountMaster/updateDiscountMasterDetails.html", function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$('#isPercentCheckDiv').addClass('hide');
				
				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				if(discountTypeId == DISCOUNT_TYPE_CHARGES) 
					$('#isPercentCheckDiv').removeClass('hide');
				
				var discountOnArr = new Array();
				discountOnArr[0] = {'Id':1,'Value':'Daily Basis'};
				discountOnArr[1] = {'Id':2,'Value':'Weekly Basis'};
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	discountOnArr,
					valueField		:	'Id',
					labelField		:	'Value',
					searchField		:	'updateDiscountOnName',
					elementId		:	'discountOnEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onDiscountSelect
				});

				if(response.DayConstantList != undefined) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.DayConstantList,
						valueField		:	'dayId',
						labelField		:	'dayName',
						searchField		:	'updateWeeklyBasisName',
						elementId		:	'dailyBasisEle',
						create			: 	false,
						maxItems		: 	1
					});
				}

				var selectize 		= $('#discountOnEle').get(0).selectize;
				selectize.setValue(discountMaster.discountOn); 
				
				if(discountMaster.weekDaysId > 0) {
					var selectize2 	= $('#dailyBasisEle').get(0).selectize;
					selectize2.setValue(discountMaster.weekDaysId); 
				}
				
				$('#discountValue').val(discountMaster.discountValue);
				$('#startTimeEle').val(discountMaster.startTime);
				$('#endTimeEle').val(discountMaster.endTime);
				$('#isPercentCheck').prop('checked', discountMaster.isPercent);
				
				hideLayer();
				
				$(".updateDiscountDetails").click(function() {
					_this.onUpdate();								
				});
				
				$('.clockpicker').clockpicker({
					placement: 'right',
					align: 'right',
					autoclose: true,
					twelvehour: true
				});
				
				modal1 		= new bootstrap.Modal(document.getElementById('staticBackdrop'));
				modal1.show();
			});
		}, onDiscountSelect : function(value) {
			if(value == 1)
				$("#updateWeeklyBasis").removeClass("show");
			else
				$("#updateWeeklyBasis").addClass("show");
		}, onUpdate : function() {
			if (confirm('Are you sure you want to update?')) {
				showLayer();
				var jsonObject = new Object();
				jsonObject["discountMasterId"] 			= discountMasterId;
//				jsonObject["weekDaysId"] 				= $('#updateWeeklyBasisEle').val();
//				jsonObject["discountOn"] 				= $('#updateDiscountOnEle').val();
				jsonObject["discountValue"] 			= $('#discountValue').val();
//				jsonObject["startTime"] 				= $('#startTimeEle').val();
//				jsonObject["endTime"] 					= $('#endTimeEle').val();
				jsonObject["isPercent"] 				= $('#isPercentCheck').prop("checked");
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/discountMasterWS/updateDiscountMasterDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
			} else
				hideLayer();
		}, setSavingResponse : function(response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
				return;  

			modal1.hide();
			
			$('#discountValue_' + (rowId - 1)).html(response.Amount);
			$('#isPercentStr_' + (rowId - 1)).html(response.isPercent);
			$(".update-modal-body").empty();
		}
	});
});