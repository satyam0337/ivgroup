/**
 * Anant 12-Apr-2024 3:58:57 pm 2024
 */
define([  
		'slickGridWrapper2'
		, PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		, 'JsonUtility'
		, 'messageUtility'
		, 'nodvalidation'
		, 'focusnavigation'//import in require.config
		],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/fetchAllServicablePincodes.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderElements : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/trancereport/cityWisePincodeReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				_this.renderCityWisePincodeReport(response);

				_this.setupFilter(response);
				$('#printButton').on('click', function() {
					const printWindow = window.open('', '_blank');

					const reportContent = $('#cityWisePincodeReport').html();

					printWindow.document.write(`
			<html>
				<head>
					<title>Print Report</title>
					<style>
						body {
							font-family: Arial, sans-serif;
							margin: 20px;
						}
						h1 {
							text-align: center;
						}
						.city-block {
							border: 1px solid #ccc;
							margin: 10px 0;
							padding: 10px;
							border-radius: 5px;
						}
						.pincode-list {
							display: grid;
							grid-template-columns: repeat(6, 1fr); 
							gap: 10px; 
							margin-left: 20px;
						}
					</style>
				</head>
				<body>
					<h1>City Wise Pincode Report</h1>
					<div>${reportContent}</div>
				</body>
			</html>
		`);

					printWindow.document.close();
					printWindow.print();
					printWindow.close();
				});
			});
		}, renderCityWisePincodeReport: function(cityPincodeData) {
			const $reportDiv = $('#cityWisePincodeReport .city-container');

			$reportDiv.empty();

			$.each(cityPincodeData, function(city, pincodes) {
				const $cityDiv = $('<div>').addClass('city-block').text(city);
				const $pincodeUl = $('<ul>').addClass('pincode-list');

				$.each(pincodes, function(index, pincode) {
					const $pincodeLi = $('<li>').text(pincode);
					$pincodeUl.append($pincodeLi);
				});


				$cityDiv.append($pincodeUl);
				$reportDiv.append($cityDiv);
			});

			$('.city-block').click(function() {
				$(this).find('.pincode-list li').slideToggle();
			});
		}, setupFilter: function(cityPincodeData) {
			const $cityInput = $('#cityInput');

			$cityInput.on('input', function() {
				const input = $(this).val().toLowerCase();
				const filteredData = {};

				$.each(cityPincodeData, function(city) {
					if (city.toLowerCase().includes(input)) {
						filteredData[city] = cityPincodeData[city];
					}
				});

				_this.renderCityWisePincodeReport(filteredData);
			});
		}
	});
});
