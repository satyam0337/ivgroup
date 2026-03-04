define([ 'marionette'
		 ,'selectizewrapper'
         ,'JsonUtility'
         ,'messageUtility'
		 ,'focusnavigation'
		 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
        ], function(Marionette, Selectizewrapper) {

	'use strict';// this basically give strictness to this specific js 
	let jsonObject	= new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyDataTransferWS/getPartyDataTransferElement.do', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/partydatatransfer/partydatatransfer.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				
				Selectizewrapper.setAutocomplete({
					url 				: WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true',
					valueField			: 'corporateAccountId',
					labelField			: 'corporateAccountDisplayName',
					searchField			: 'corporateAccountDisplayName',
					elementId			: 'fromParty',
					responseObjectKey 	: 'result',
					maxItems			: 5,
					onChange			: _this.createPartyTable
				});
				
				Selectizewrapper.setAutocomplete({
					url 				: WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true',
					valueField			: 'corporateAccountId',
					labelField			: 'corporateAccountDisplayName',
					searchField			: 'corporateAccountDisplayName',
					elementId			: 'toParty',
					responseObjectKey 	: 'result',
					maxItems			: 1,
				});
				
				$("#transferPartyDataBtn").on('click',function() {
					_this.validateParty(1);
				});
				
				$("#transferPartyDataBtnWithDelete").click(function() {
					_this.validateParty(2);
				});
				
			});
		}, validateParty : function(filter) {
			if(Number($('#fromParty').val()) <= 0) {
				showAlertMessage('error', 'Please Select From Party !');
				return false;
			}
			
			if(Number($('#toParty').val()) <= 0) {
				showAlertMessage('error', 'Please Select To Party !');
				return false;
			}
			
			_this.transferPartyData(filter);
	    }, transferPartyData : function(filter) {
			jsonObject = new Object();
			
			jsonObject.partyIdsStr 		= $('#fromParty').val();
			jsonObject.toPartyId		= $('#toParty').val();
			jsonObject.FILTER			= filter;
			
			let btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to continue ?",
				modalWidth 	: 	30,
				title		:	'Party Transfer',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				getJSON(jsonObject, WEB_SERVICE_URL+'/partyDataTransferWS/processTransferPartyData.do', _this.setSuccess, EXECUTE_WITHOUT_ERROR);
				showLayer();
			});

			btModalConfirm.on('cancel', function() {
				hideLayer();
			});
			
		}, setSuccess : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				if(errorMessage.messageId == 20) {
					setTimeout(() => {
						location.reload();
					}, 100);
				}
			}
		}
	});
});