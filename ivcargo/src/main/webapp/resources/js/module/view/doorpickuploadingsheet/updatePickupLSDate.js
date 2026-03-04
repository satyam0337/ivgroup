let doneTheStuff = false;

define([
	'/ivcargo/resources/js/generic/urlparameter.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'moment'
	, PROJECT_IVUIRESOURCES + '/resources/js/datepicker/datepickerwrapper.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'

	//constant for project name and domain urls
	//text! is used to convert the html to plain text which helps to fetch HTML through require
	//Master Template is used to get standard Layout of master pages
	, 'focusnavigation'//import in require.config
], function(UrlParameter, Selection) {

	'use strict';// this basically give strictness to this specific js 
	var myNod, btModalConfirm, doorPickupLedgerId, _this = '', minDate, maxDate;

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(masterObj) {
			_this = this;
			doorPickupLedgerId = UrlParameter.getModuleNameFromParam(MASTERID);

			let jsonObject = new Object();
			jsonObject.doorPickupLedgerId = doorPickupLedgerId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/updateDoorPickupDispatchDetailsWS/getDoorPickupDispatchElement.do?', _this.renderUpdatePickupLsDate, EXECUTE_WITHOUT_ERROR);
		}, renderUpdatePickupLsDate: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/doorpickupls/update/updatePickupLSDate.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				let options = new Object();

				options.minDate 	= response.minDate;
				options.maxDate 	= response.maxDate;
				options.startDate 	= response.maxDate;
				
				let elementConfiguration = {};

				elementConfiguration.singleDateElement = $("#manualDateEle");
				
				response.elementConfiguration 		= elementConfiguration;
				response.options					= options;
				response.isCalenderForSingleDate	= true;

				Selection.setSelectionToGetData(response);

				$("#update").bind("click", function() {
					_this.updatePickupLSDate();
				});

				hideLayer();
			});
		}, updatePickupLSDate: function() {
			let jsonObject = new Object();

			jsonObject["doorPickupLedgerId"] = doorPickupLedgerId;
			jsonObject["creationDateTimeStamp"] = $('#manualDateEle').val();

			if (!doneTheStuff) {
				doneTheStuff = true;
				$('#update').hide();

				btModalConfirm = new Backbone.BootstrapModal({
					content: "Do You want to update date?",
					modalWidth: 30,
					title: 'Update Date',
					okText: 'YES',
					showFooter: true,
					okCloses: false
				}).open();

				btModalConfirm.on('ok', function() {
					showLayer();
					$('#update').hide();
					getJSON(jsonObject, WEB_SERVICE_URL + '/updateDoorPickupDispatchDetailsWS/updateDoorPickupLedgerPickupLsDate.do', _this.setSuccess, EXECUTE_WITH_ERROR);
				});

				btModalConfirm.on('cancel', function() {
					doneTheStuff = false;
					$('#update').show();
				});
			}
		}, setSuccess: function(response) {
			if(response.redirectTo > 0) {
				showMessage("success", "Date updated successfully !");
				
				setTimeout(function(){
					redirectToAfterUpdate(response);
				},1000);
			}
			   
			hideLayer();
		}
	});
});