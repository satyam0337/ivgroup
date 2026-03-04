define(
	[
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'focusnavigation',
	'nodvalidation'
	],
	function(slickGridWrapper2, Selection) {
	'use strict';
	var myNod,  _this = '' ,searchOperation = 0, searchVehicleAgentNod;
			
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL+'/lhpvRegisterReportWS/getLHPVRegisterElement.do', _this.renderVehicleAgentElements, EXECUTE_WITH_ERROR);
			return _this;
		},renderVehicleAgentElements :function(response){
			showLayer();
			var loadelement			= new Array();
			var baseHtml 			= new $.Deferred();
					
			loadelement.push(baseHtml);
					
			$("#mainContent").load("/ivcargo/html/report/dispatchreport/vehicleAgentReport/vehicleAgentReport.html",
					function() {
				baseHtml.resolve();
			});
					
			$.when.apply($, loadelement).done(function() {
				hideLayer();

				var elementConfiguration	= new Object();
						
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
						
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.isCalenderSelection	= true;
				response.vehicleAgentSelection	= true;
		
				Selection.setSelectionToGetData(response);
						
				myNod 					= nod();
				searchVehicleAgentNod 	= nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				searchVehicleAgentNod.configure({
					parentClass:'validation-message'
				});

				if($('#regionEle').exists() && $('#regionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region !');
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Area !');
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');
						
				$("#searchOperation").change (function() {
					initialiseFocus();
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					searchOperation	= $("#searchOperation").val();
							
					if(searchOperation == LHPV_SEARCH_TYPE_VEHICLE_AGENT) {
						$("#vehicleAgentDiv").removeClass("hide");
						$("#vehicleNumberDiv").addClass("hide");
						$("#branchWise").addClass("hide");
						$("#vehicleAgentEle").val("");
						$("#agentVehicleNumberEle").val("");
								
						$('#vehicleAgentEle').get(0).selectize.clear();
					} else if(searchOperation == LHPV_SEARCH_TYPE_VEHICLE) {
						$("#branchWise").removeClass("hide");
						$("#vehicleAgentDiv").addClass("hide");
						$("#vehicleNumberDiv").addClass("hide");
						$("#regionEle_primary_key").val("");
						$("#subRegionEle_primary_key").val("");
						$("#branchEle_primary_key").val("");
						$("#regionEle").val("");
						$("#subRegion").val("");
						$("#branchEle").val("");
					}

					if(Number(searchOperation) == LHPV_SEARCH_TYPE_VEHICLE_AGENT)
						addAutocompleteElementInNode(searchVehicleAgentNod, 'vehicleAgentEle', 'Select proper Vehicle Agent !');
					
					$("#vehicleAgentEle").change(function() {
						_this.getAgentVehicleAutoComplete();
						$('#vehicleNumberDiv').removeClass('hide');
					});
				});
				
				if(!vehicleAgentSelection) {
					$('#searchTypeSelection').remove();
					$('#vehicleAgentDiv').remove();
					$('#vehicleNumberDiv').remove();
					$('#branchWise').removeClass('hide');
				}

				$("#findBtn").click(function() {
					if(Number(searchOperation) == 0) {
						showMessage('error', "Please Select Search Type");
						return false;
					} else if(Number(searchOperation) == LHPV_SEARCH_TYPE_VEHICLE_AGENT) {
						removeTableRows('lhpvDetailsTable', 'tbody');
						searchVehicleAgentNod.performCheck();
						
						if(searchVehicleAgentNod.areAll('valid'))
							_this.onFind();
					} else {
						myNod.performCheck();
					
						if(myNod.areAll('valid'))
							_this.onFind();								
					}
				});
			});
		}, onFind : function() {
			showLayer();
					
			var jsonObject = Selection.getElementData();

			jsonObject.serachType			= Number($('#searchOperation').val());

			getJSON(jsonObject, WEB_SERVICE_URL+'/lhpvRegisterReportWS/getLHPVRegisterDetails.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response){
			if (response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				response.Language	= {};
				slickGridWrapper2.setGrid(response);
			}
		}
	});
});