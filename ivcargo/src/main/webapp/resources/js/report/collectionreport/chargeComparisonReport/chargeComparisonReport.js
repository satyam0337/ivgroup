define([
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
	let myNod,  _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL+'/chargeComparisonReportWS/getChargeComparisonReportElement.do', _this.renderElements, EXECUTE_WITH_ERROR);
			return _this;
		}, renderElements :function(response) {
			showLayer();
			let loadelement			= new Array();
			let baseHtml 			= new $.Deferred();
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/report/collectionreport/chargeComparisonReport/chargeComparisonReport.html",
					function() {
				baseHtml.resolve();
			});
					
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				initialiseFocus();
				
				let keyObject 		= Object.keys(response);
			
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				let elementConfiguration	= new Object();
						
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
						
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
		
				Selection.setSelectionToGetData(response);

				myNod 		= Selection.setNodElementForValidation(response);

				let chargeAutoComplete1 = new Object();
				chargeAutoComplete1.primary_key = 'chargeTypeMasterId';
				chargeAutoComplete1.field 		= 'chargeTypeMasterDisplayName';
				chargeAutoComplete1.url			= response.chargeMasterForGroupList1;
				$("#chargeNameEle1").autocompleteCustom(chargeAutoComplete1);
				
				let chargeAutoComplete2 = new Object();
				chargeAutoComplete2.primary_key = 'chargeTypeMasterId';
				chargeAutoComplete2.field 		= 'chargeTypeMasterDisplayName';
				chargeAutoComplete2.url			= response.chargeMasterForGroupList2;
				$("#chargeNameEle2").autocompleteCustom(chargeAutoComplete2);
								
				$("#findBtn").click(function() {
					myNod.performCheck();

					function getChargeTypeMasterType(chargeTypeMasterId) {
						const chargeGroup = response.chargeMasterForGroupList2.find(item => item.chargeTypeMasterId == chargeTypeMasterId);
						return chargeGroup ? chargeGroup.chargeTypeMasterType : null;
					}
					
					const filter = getChargeTypeMasterType($('#chargeNameEle2_primary_key').val());

					if(myNod.areAll('valid'))
						_this.onFind(filter);								
				});
			});
		}, onFind : function(filter) {
			let charge1Id	= $('#chargeNameEle1_primary_key').val();
			let charge2Id	= $('#chargeNameEle2_primary_key').val();
			
			if(charge1Id == charge2Id) {
				showAlertMessage('error', 'Please, select different charges !');
				return;
			}
	
			let jsonObject 	= Selection.getElementData();
			
			jsonObject["charge1Id"]		= charge1Id;
			jsonObject["charge2Id"]		= charge2Id;
			jsonObject["charge1Name"]	= $('#chargeNameEle1').val();
			jsonObject["charge2Name"]	= $('#chargeNameEle2').val();
			jsonObject["filter"]		= filter;

			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/chargeComparisonReportWS/getChargeComparisonReportData.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
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