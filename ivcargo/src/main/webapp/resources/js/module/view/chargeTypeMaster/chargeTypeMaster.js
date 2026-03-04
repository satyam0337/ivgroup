define([ 'marionette'
		 ,'selectizewrapper'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'nodvalidation'
		 ,'focusnavigation',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
         ],
         function(Marionette, Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	myNod, myNod1, _this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/chargeTypeMasterWS/getChargeTypeMasterElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/chargeTypeMaster/chargeTypeMaster.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				_this.setChargeType();
				
				myNod = nod();
				myNod1 = nod();
				
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod1.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#chargeNameELe',
					validate		: 'presence',
					errorMessage	: 'Enter Charge Name'
				});
				
				myNod.add({
					selector		: '#chargeTypeEle',
					validate		: 'validateAutocomplete:#chargeTypeEle',
					errorMessage	: 'Enter Charge Type'
				});
				
				myNod1.add({
					selector		: '#chargeTypeEle',
					validate		: 'validateAutocomplete:#chargeTypeEle',
					errorMessage	: 'Enter Charge Type'
				});
				
				hideLayer();
				
				$("#saveChargesBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$("#viewChargesBtn").click(function() {
					myNod1.performCheck();

					if(myNod1.areAll('valid'))
						_this.onView();								
				});
			});
		}, setChargeType : function() {
			var chargeTypeObj = [
				{ "chargeTypeId":1, "chargeTypeName": "Booking" },
				{ "chargeTypeId":2, "chargeTypeName": "Delivery" },
				{ "chargeTypeId":3, "chargeTypeName": "LHPV" },
			]
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	chargeTypeObj,
				valueField		:	'chargeTypeId',
				labelField		:	'chargeTypeName',
				searchField		:	'chargeTypeName',
				elementId		:	'chargeTypeEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, onSubmit : function() {
			showLayer();
			
			jsonObject	= new Object();
			
			jsonObject.chargeTypeMasterName			= $('#chargeNameELe').val();
			jsonObject.chargeTypeMasterUnit			= 0;
			jsonObject.chargeTypeMasterType			= $('#chargeTypeEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/chargeTypeMasterWS/insertIntoChargeTypeMaster.do?',	_this.setSuccess, EXECUTE_WITHOUT_ERROR);
		}, setSuccess : function (response) {
			hideLayer();
		}, onView : function() {
			showLayer();
			
			jsonObject	= new Object();
			jsonObject.chargeTypeMasterType			= $('#chargeTypeEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/chargeTypeMasterWS/viewAllChargeTypeMaster.do?', _this.setView, EXECUTE_WITHOUT_ERROR);
		}, setView : function(response) {
			let modal1 		= new bootstrap.Modal(document.getElementById('staticBackdrop'));
			
			$(".update-modal-body").html("");
			
			let formGroup 	= $(".update-modal-body");
			
			let inputField 	= $("<input>").addClass("form-control").attr({type: "text", id: "filter", name: "", value : '', placeholder : 'Search'});
			formGroup.append(inputField);
			formGroup.append('<br>');
			
			let chargeList	= response.CHARGE_TYPE_MASTER;
			
			let table 	= $('<table>');
			let thead	= $('<thead>');
			let tbody	= $('<tbody id ="results">');
			table.attr('class', 'table table-bordered');
			
			let tr		= $('<tr class = "bg-info">');

			tr.append('<td><b>Sr. No.</b></td>');
			tr.append('<td><b>Name</b></td>');
			tr.append('<td><b>Description</b></td>');
			
			thead.append(tr);
			table.append(thead);
			
			let i = 1;
			
			chargeList.forEach(element => {
				let tr		= $('<tr>');
				tbody.append(tr);
				
				tr.append('<td>' + (i++) + '</td>');
				tr.append('<td>' + (element.chargeTypeMasterName != undefined ? element.chargeTypeMasterName : element.chargeName) + '</td>');
				tr.append('<td>' + (element.chargeTypeMasterNameWithChargeId != undefined ? element.chargeTypeMasterNameWithChargeId : element.chargeNameWithChargeId) + '</td>');
			});
			
			table.append(tbody);
			formGroup.append(table);
			
			setTimeout(function() {
				$('#filter').keyup(function() {
					// Retrieve the input field text and reset the count to zero
					filterTableData($(this).val().toLowerCase(), 'results');
				});
			}, 100);
			
			modal1.show();
			hideLayer();
		}
	});
});