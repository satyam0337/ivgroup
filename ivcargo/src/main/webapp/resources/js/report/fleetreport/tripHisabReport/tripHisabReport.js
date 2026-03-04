/**
 * Aditya 28-Feb-2025
 */
define([
	'slickGridWrapper2'
	, 'selectizewrapper'
	, PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'//import in require.config
], function(slickGridWrapper2, Selectizewrapper, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/tripHisabReportWS/getTripHisabReportElement.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderElements: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/fleetreport/tripHisabReport/tripHisabReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				let vehicleDetails = response.vehicleNumberMasterList;
				initialiseFocus();

				$("*[data-selector=header]").html(response.reportName);

				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
				}

				let elementConfiguration = new Object();

				elementConfiguration.dateElement 		= $('#dateEle');
				elementConfiguration.regionElement 		= $('#regionEle');
				elementConfiguration.subregionElement 	= $('#subRegionEle');
				elementConfiguration.branchElement 		= $('#branchEle');
				elementConfiguration.vehicleElement		= 'vehicleNumberEle';
				
				response.elementConfiguration 			= elementConfiguration;

				Selection.setSelectionToGetData(response);

				let myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#findBtn").click(function() {
					myNod.performCheck();

					if (myNod.areAll('valid'))
						if ($("#vehicleOwnerTypeEle_primary_key").val() == "" || $("#vehicleOwnerTypeEle_primary_key").val() == 0) {
							showMessage('error', "Please select Vehicle Owner Type");
							return;
						}
						
						_this.onSubmit();
				});


				let vehicleOwnerTypesAutoComplete = new Object();
				vehicleOwnerTypesAutoComplete.url = WEB_SERVICE_URL + '/autoCompleteWS/getVehicleOwnerType.do'; // Corrected API URL
				vehicleOwnerTypesAutoComplete.primary_key = 'vehicleOwnerId'; // Updated to match the expected key
				vehicleOwnerTypesAutoComplete.field = 'vehicleOwnerName'; // Corrected field name

				$("#vehicleOwnerTypeEle").autocompleteCustom(vehicleOwnerTypesAutoComplete);
				
				$("#vehicleOwnerTypeEle").on("change", function(event) {
					event.preventDefault(); // Prevent default focus behavior

					let selectedOwnerType = $(this).val().trim();

					if (selectedOwnerType !== "") {
						let filteredVehicles = vehicleDetails.filter(v => String(v.vehicleOwnerType) === String(selectedOwnerType));

						Selectizewrapper.setAutocomplete({
							jsonResultList: filteredVehicles,
							valueField: 'vehicleNumberMasterId',
							labelField: 'vehicleNumber',
							searchField: 'vehicleNumber',
							elementId: 'vehicleNumberEle',
							create: false,
							maxItems: 1,
						});
					}
				});
			});
		}, onSubmit: function() {
			showLayer();

			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/tripHisabReportWS/getTripHisabReportDetails.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData: function(response) {
			hideLayer();

			if (response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			$('#bottom-border-boxshadow').removeClass('hide');
			
			let bookingChargesNameHM	= response.chargesNameHM;
				
			if(bookingChargesNameHM != undefined) {
				for(const obj of response.CorporateAccount) {
					let chargesMap	= obj.chargesCollection;

					for(let chargeId in bookingChargesNameHM) {
						let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");

						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
					}
				}
			}
			
			slickGridWrapper2.setGrid(response);
		}
	});
});
