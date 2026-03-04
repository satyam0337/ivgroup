define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'JsonUtility'
         ,'messageUtility'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
         function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	redirectFilter,
	previousWayBillNumber,
	isManualLrNumberSequenceCounter = false,
	minRange = 0,
	maxRange = 0,
	myNod,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/editManualLrNoWS/loadUpdateLRNumber.do?', _this.renderUpdateWayBillNumber, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderUpdateWayBillNumber : function(response) {
			
			if(response.message != undefined) {
				showMessage('error', response.message);
				return;
			}
			
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateLRNumber.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#lrNumberEle',
					validate		: 'presence',
					errorMessage	: 'Insert LR Number !'
				});
				
				myNod.add({
					selector		: '#remarkEle',
					validate		: 'presence',
					errorMessage	: 'Insert Remark !'
				});
				
				previousWayBillNumber			= response.wayBillNumber;
				isManualLrNumberSequenceCounter	= response.isManualLrNumberSequenceCounter;
				minRange						= response.MinRange;
				maxRange						= response.MaxRange;
				
				$("#previousWayBillNumber").html('<b>Previous LR No. - ' + previousWayBillNumber + '</b>');
				
				if(!response.isAllowEdit) {
					$("#previousWayBillNumber").html('<b>This LR No. is alredy present in Short Credit Bill No. ' + response.billNumber + '</b>');
					$('#saveBtn').remove();
					return;
				}
				
				if(response.customManualLRNoLength > 0)
					$('#lrNumberEle').prop('maxlength', response.customManualLRNoLength);
				else
					$('#lrNumberEle').prop('maxlength', 15);
				
				$( "#lrNumberEle" ).keypress(function(event) {
					return noSpclCharsExcludingForwardSlash(event);
				});
	
				hideLayer();

				$(".saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.updateWayBillNumber();
				});
			});
		}, updateWayBillNumber : function() {
			if(previousWayBillNumber == ($('#lrNumberEle').val()).trim()) {
				showMessage('error', 'Entered LR Number is same as previous LR Number');
				return;
			}
			
			if(isManualLrNumberSequenceCounter && (parseInt($("#lrNumberEle").val()) < parseInt(minRange) || parseInt($("#lrNumberEle").val()) > parseInt(maxRange))) {
				showMessage('error', 'LR Number not in Range !');
				return;
			}
			
			if(!confirm('Are you sure you want to Update LR Number?'))
				return;
			
			var jsonObject			= new Object();
			
			jsonObject.newWayBillNo		= $('#lrNumberEle').val();
			jsonObject.remark			= $('#remarkEle').val();
			jsonObject.waybillId		= wayBillId;
			jsonObject.redirectFilter	= redirectFilter;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/editManualLrNoWS/updateLRNumber.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		}, redirectToPage : function(response) {
			hideLayer();

			if(response.message != undefined) {
				showMessage('error', response.message);
				return;
			}
			
			redirectToAfterUpdate(response);
		}
	});
});