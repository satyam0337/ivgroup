define([
	'marionette',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'slickGridWrapper2',
	'selectizewrapper',
	'JsonUtility',
	'messageUtility',
	'focusnavigation',
	'nodvalidation'
], function (Marionette, Selection, slickGridWrapper2, Selectizewrapper) {
	'use strict';

	let _this = this, selectedType;
	let selectType = '';
	let opBasedReportsTypeArr = {};

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			getJSON({}, WEB_SERVICE_URL + '/report/opBasedReportsWS/getInitialDetailsOfOpBasedReports.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setGroup: function (response) {
			let loadelement = [$.Deferred()];
			
			$("#mainContent").load("/ivcargo/html/report/opreport/opBasedReports/opBasedReports.html", function () {
				loadelement[0].resolve();
			});

			$.when.apply($, loadelement).done(function () {
				initialiseFocus();

				response.elementConfiguration		= { dateElement: $('#dateEle') };
				response.isCalenderSelection		= true;
				response.isOneYearCalenderSelection = true;
				response.monthLimit					= 12;

				response.opBasedReportsTypeArr.forEach(item => {
					opBasedReportsTypeArr[item.typeId] = item.type;
				});

				Selection.setSelectionToGetData(response);

				Selectizewrapper.setAutocomplete({
					jsonResultList: response.opBasedReportsTypeArr,
					valueField: 'typeId',
					labelField: 'type',
					searchField: 'type',
					elementId: 'opbasedreportsEle',
					create: false,
					maxItems: 1,
					onChange: _this.validateTypeSelection
				});

				$("#getRequestOpBasedReports").click(() => _this.getRequestOpBasedReports());
				_this.validateTypeSelection();

				Selectizewrapper.setAutocomplete({
					jsonResultList: response.supportTicketTypeArr,
					valueField: 'typeId',
					labelField: 'type',
					searchField: 'type',
					elementId: 'ticketTypeEle',
					create: false,
					maxItems: 10,
				});
			});

			hideLayer();
		}, validateTypeSelection : function() {
			const selectedTypeId = $('#opbasedreportsEle').val();
			
			if(selectedTypeId == '18')
				$("*[data-attribute=ticketType]").removeClass("hide");
			else
				$("*[data-attribute=ticketType]").addClass("hide");
			
			selectType = opBasedReportsTypeArr[selectedTypeId] || '';

			$('#typeWarning').toggle(!selectedTypeId);
			$('#getRequestOpBasedReports').prop('disabled', !selectedTypeId);
		}, getRequestOpBasedReports: function () {
			let jsonObject = {};
			let fromDate		= $("#dateEle").attr('data-startdate');
			let toDate			= $("#dateEle").attr('data-enddate');
			selectedType		= $('#opbasedreportsEle').val();

			let fromYear	= fromDate && fromDate.split('-')[2];
			let toYear		= toDate && toDate.split('-')[2];
			
			if (selectedType === "15" && fromYear !== toYear) {
				showAlertMessage('error', "Select dates within the same year !");
				return;
			}

			if (fromDate) jsonObject["fromDate"] = fromDate;
			if (toDate) jsonObject["toDate"] = toDate;

			if (selectedType === "0") {
				$('#typeWarning').css('display', 'inline');
				return;
			} else {
				jsonObject["filter"] = selectedType;
			}

			if( selectedType == '18')
				jsonObject["ticketTypeIdsStr"] = $('#ticketTypeEle').val();

			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + "/report/opBasedReportsWS/getDetailsOfOpBasedReports.do?", _this.setResults, EXECUTE_WITH_ERROR);
		}, setResults: function (response) {
			hideLayer();
			
			if (response.message) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}

			$('#middle-border-boxshadow').removeClass('hide');
			hideAllMessages();
			$('#deliveryVarianceSummary').empty();
			
			if(selectedType == '17' && response.varianceSummaryModel != undefined) {
				$("#bottom-border-boxshadow").removeClass('hide');
				hideAllMessages();
				
				let summaryObj = response.varianceSummaryModel;
				let table	= $('<table class="table table-bordered" />'); 
				let trHead	=  $('<tr class="danger"/>'); 
				let trBody	= $('<tr/>');
				let tFoot	= $('<tfoot/>');
				let trFoot	= $('<tr/>');

				trHead.append('<th> Label</th>');
				trHead.append('<th> Total Expected Days </th>');
				trHead.append('<th> Total Actual Days </th>');
				trHead.append('<th> Total Variance Days </th>');
				trHead.append('<th> Overall Delays % </th>');
				trBody.append('<td> Total </td>');
				trBody.append('<td>' + summaryObj.totalExpectedDays + '</td>');
				trBody.append('<td>' + summaryObj.totalActualDays + '</td>');
				trBody.append('<td>' + summaryObj.totalVarianceDays + '</td>');
				trBody.append('<td>' + summaryObj.overallDelays + '</td>');
				table.append(trHead);
				table.append(trBody);
			
				let tdFoot = $('<td colspan="5" style="background:#f9f9f9;">' +
    							'<div style="display:flex; gap:20px;">' +

						    '<div style="width:60%;">' +
						    '<strong>Notes:</strong><br>' +
						    '• <b>Dev Variance %</b> = Dev Variance (TMPD → TMAD) / Expected Days(DASD → Plan) × 100 .<br>' +
						    '• <b>Total Expected Days</b> = Σ working days (DASD → Plan) across tickets.<br>' +
						    '• <b>Total Actual Days</b> = Σ working days (DASD → Actual) across tickets.<br>' +
						    '• <b>Total Variance (Days)</b> = Σ working days (Actual − Plan).<br>' +
						    '• <b>Overall Delay %</b> = Total Variance (Days) / Total Expected Days × 100 (weighted).' +
						    '</div>' +

						   '<div style="width:40%; background:#eef7ff; padding:10px; border-left:3px solid #5bc0de; font-size:0.95em;">' +
						    '<strong>Simplified Formula:</strong><br><br>' +
						    '• <b>Dev Variance % (E)</b> = (C × 100) / A<br>' +
						    '• <b>Overall Delay % (F)</b> = (D × 100) / A<br><br>' +
						    '<strong>Where:</strong><br>' +
						    '• <b>Expected Days (A)</b> = Plan Date − DASD<br>' +
						    '• <b>Actual Days (B)</b> = Actual Date − DASD<br>' +
						    '• <b>Variance Days (C)</b> = TMAD − TMPD<br>' +
						    '• <b>Total Overall Var. Days (D)</b> = Actual Release Date − Plan Release Date<br><br>' +
						    '<strong>Examples:</strong><br>' +
						    'A. Released Plan Date − DASD (Dev Actual Start Date)<br>' +
						    'Ex: 02-01-2026 − 27-12-2025 = 5 days<br><br>' +
						    'B. Released Actual Date − Released Plan Date<br>' +
						    'Ex: 06-01-2026 − 02-01-2026 = 4 days' +
						    '</div>' +
						
						    '</div>' +
						
						'</td>');


				trFoot.append(tdFoot);
				tFoot.append(trFoot);
				table.append(tFoot);
				$('#deliveryVarianceSummary').append(table);
			} else
				$("#bottom-border-boxshadow").addClass('hide');

			$('#dynamic-header').text(`${selectType} Report from ${$('#dateEle').val()}`);
			response.groupingWithoutLabel = true;
			slickGridWrapper2.setGrid(response);
		}
	});
});
