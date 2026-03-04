
define([

	'slickGridWrapper2'
	, PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/module/view/vehiclewisedispatchreport/dispatchdetails.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'autocomplete'
	, 'autocompleteWrapper'
	, 'nodvalidation'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	, 'focusnavigation'//import in require.config
], function(slickGridWrapper2, Selection, LSDetails) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '', gridObject;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/vehiclewiseDispatchReportWS/getVehicleWiseDispatchReportElement.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/vehiclewisedispatchreport/VehicleWiseDispatchReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute=" + keyObject[i] + "]").removeClass("hide");
				}

				let elementConfiguration = new Object();

				elementConfiguration.dateElement 			= $('#dateEle');
				elementConfiguration.srcSubRegionElement 	= $('#subRegionEle');
				elementConfiguration.destSubregionElement 	= $('#destSubRegionEle');

				response.elementConfiguration = elementConfiguration;
				response.isCalenderSelection = true;
				response.sourceDestSubregionSelection = true;

				Selection.setSelectionToGetData(response);

				response.subRegion = true;
				response.destSubRegion = true;

				myNod = Selection.setNodElementForValidation(response);

				if (response.dispatchRoute && response.DispatchRouteList) {
					addAutocompleteElementInNode(myNod, 'dispatchRouteEle', 'Please Select Route!');

					var dispatchRouteAutoComplete = new Object();
					dispatchRouteAutoComplete.primary_key = 'dispatchRouteId';
					dispatchRouteAutoComplete.field = 'dispatchRouteNameAndTime';
					$("#dispatchRouteEle").autocompleteCustom(dispatchRouteAutoComplete);

					let autoDispatchRoute = $("#dispatchRouteEle").getInstance();

					$(autoDispatchRoute).each(function() {
						this.option.source = response.DispatchRouteList;
					});
				}

				if (response.dispatchRoute && response.DispatchRouteList)
					addAutocompleteElementInNode(myNod, 'dispatchRouteEle', 'Please Select Route!');

				hideLayer();

				$("#find").click(function() {
					myNod.performCheck();

					if (myNod.areAll('valid'))
						_this.onSubmit(_this);
				});
			});

		}, onSubmit: function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			jsonObject["dispatchRouteId"] = $('#dispatchRouteEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/vehiclewiseDispatchReportWS/getVehicleWiseDispatchReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function(response) {
			hideLayer();

			if (response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			if (response.CorporateAccount == undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
			} else {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				response.tableProperties.callBackFunctionForPartial = _this.getLSDetails;
				gridObject = slickGridWrapper2.setGrid(response);

				gridObject.onDblClick.subscribe(function(e, args) {
					var cell = gridObject.getCellFromEvent(e)
					var row = cell.row;
					var dataView = gridObject.getData();
					var item = dataView.getItem(row);
					if (cell.cell == 2) {
						if (item.dispatchRouteId != undefined && item.dispatchRouteId > 0) {
							_this.getLoadingSheetDetails(item.dispatchRouteId);
						} else {
							showAlertMessage('error', 'Trip not defined.');
						}
					}
				});
			}

			hideLayer();
		}, getLSDetails: function(grid, dataView, row) {
			hideLayer();

			if (dataView.getItem(row).dispatchRouteId != undefined && dataView.getItem(row).dispatchRouteId > 0)
				_this.getLoadingSheetDetails(dataView.getItem(row).dispatchRouteId);
			else
				showAlertMessage('error', 'Trip not defined.');
		}, getLoadingSheetDetails: function(dispatchRouteId) {
			hideLayer();

			let jsonObject = Selection.getElementData();

			jsonObject["dispatchRouteId"] = dispatchRouteId;

			var object = new Object();
			object.jsonObject = jsonObject;

			var btModal = new Backbone.BootstrapModal({
				content: new LSDetails(object),
				modalWidth: 80,
				title: 'LS Details'

			}).open();
			object.btModal = btModal;
			new LSDetails(object)
			btModal.open();

		}
	});
});