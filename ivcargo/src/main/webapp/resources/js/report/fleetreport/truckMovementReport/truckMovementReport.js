define([
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	'nodvalidation',
	'focusnavigation'
], function(slickGridWrapper2, Selection) {
	'use strict';

	let jsonObject = {}, myNod, _this = '';

	return Marionette.LayoutView.extend({
		initialize: function(options) {
			this.options = options || {};
			_this = this;
		},
		render: function() {
			// Auto-generated render function for JSP: truckMovementReport
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/truckMovementReportWS/loadTruckMovementReportData.do?', _this.settruckMovementReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, settruckMovementReportElements: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/fleetreport/truckMovementReport/truckMovementReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				$("*[data-selector=header]").html(response.reportName);

				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$('*[data-attribute=' + element + ']').removeClass('hide');
				}

				let elementConfiguration = new Object();
				elementConfiguration.vehicleElement			= $('#vehicleNumberEle');
				elementConfiguration.dateElement			= $('#dateEle');			

				response.elementConfiguration				= elementConfiguration;
				response.isCalenderSelection				= true;
				response.vehicleSelectionWithSelectize		= true;
				response.viewAllVehicle						= true;
				
				$('#vehicleOwnerCheckBox').on('change', function () {
					if($(this).prop('checked')) {
						_this.destroySource();
						response.url = WEB_SERVICE_URL + '/autoCompleteWS/getVehicleNumberAutocomplete.do?isOwnVehicleNumber=' + true;
						Selection.setVehicleAutocompleteWithSelectize(response);
					} else {
						delete response.url;
						Selection.setSelectionToGetData(response);
					}
				});

				Selection.setSelectionToGetData(response);
				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$('#findBtn').click(function() {
					myNod.performCheck();
					if (myNod.areAll('valid')) _this.onSubmit();
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/truckMovementReportWS/getTruckMovementReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function (response) {
			hideLayer();
		
			if (response.message !== undefined) {
				['#bottom-border-boxshadow', '#left-border-boxshadow', '#right-border-boxshadow']
					.forEach(id => $(id).addClass('hide'));
				return;
			}
		
			function processConfig(config, selector) {
				if (config?.CorporateAccount && config.CorporateAccount.length > 0) {
					$(selector).removeClass('hide');
					slickGridWrapper2.setGrid(config);
				} else {
					$(selector).addClass('hide');
				}
			}

			processConfig(response.tableConfig,	 '#bottom-border-boxshadow');
			processConfig(response.tableConfig1, '#left-border-boxshadow');
			processConfig(response.tableConfig2, '#right-border-boxshadow');

			hideLayer();
		}, destroySource: function() {
			if ($('#vehicleNumberEle').selectize() != undefined)
				$('#vehicleNumberEle').selectize()[0].selectize.destroy();
		}
	});
});