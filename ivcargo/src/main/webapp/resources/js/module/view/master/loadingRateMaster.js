let	rowCount = 0;
let srcBranchId = 0;
let branchList =null;
let  id = 0;

let updateLoadingRateDetails =false;

function validateAndAppendTon(inputElement) {
    let inputValue = inputElement.value;
    inputValue = inputValue.replace(/[^0-9.]+/g, '');

    let decimalCount = (inputValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
        inputValue = inputValue.substring(0, inputValue.lastIndexOf('.'));
    }

    let parts = inputValue.split('.');
    if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        inputValue = parts.join('.');
    }

    inputElement.value = inputValue;
}


define([
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'language',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],//PopulateAutocomplete
		 function(Selection) {
			'use strict';
		let jsonObject = new Object(), myNod, _this;
		return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/loadingRateMasterWS/getLodingRateMasterElement.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderAllDetailsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/master/loadingRateMaster/loadingRateMaster.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
							
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let elementConfiguration				= new Object();
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
			
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$('#saveRates').click(function() {
					_this.saveRates()
				});
		
			});
			
		}, onSubmit : function() {
			let jsonObject	= new Object();
			showLayer();
			jsonObject.regionId				= $('#regionEle_primary_key').val();
			jsonObject.subRegionId			= $('#subRegionEle_primary_key').val();
			jsonObject.branchId				= $('#branchEle_primary_key').val();
				
			getJSON(jsonObject, WEB_SERVICE_URL+'/loadingRateMasterWS/getLoadingRateMasterList.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response) {
			hideLayer();
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#mainTable').empty();
			
			branchList = response.branchModelList

			let headerColumnArray		= new Array();
			
			headerColumnArray.push("<th style='text-align: center; font-size:15px;'><input style='font-weight:bold;background-colour:light blue;' type='checkbox' id='checkboxAll' onchange='checkBoxForAll();'  value='checkboxAll' unchecked> </th>");
			headerColumnArray.push('<th style="text-align:center;font-weight:bold;">Region Name</th>');
			headerColumnArray.push('<th style="text-align:center;font-weight:bold;">SubRegion Name</th>');
			headerColumnArray.push('<th style="text-align:center;font-weight:bold;">Branch Name</th>');
			headerColumnArray.push('<th style="text-align:center;font-weight:bold;">Loading Rate (Tonne)</th>');
			headerColumnArray.push('<th style="text-align:center;font-weight:bold;">Thappi Rate (Tonne)</th>');
			headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='oxAll' value='checkboxAll' unchecked> </th>");
			headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='xAll' value='checkboxAll' unchecked> </th>");
			headerColumnArray.push('<th style="text-align:center;font-weight:bold;">Loading Levy Percentage</th>');
			headerColumnArray.push('<th style="text-align:center;font-weight:bold;">Thappi Levy Percentage</th>');

			$('#mainTable').append('<tr>' + headerColumnArray.join(' ') + '</tr>');

			for(let i = 0; i < branchList.length; i++){
				let data = branchList[i];
				
				count = count + 1;
				let dataColumnArray = new Array();
				srcBranchId = data.branchId;
				dataColumnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size: 15px;'><input type='checkbox'  class='checkbox' id='check_"+i+"' value='"+data.branchId+"' unchecked> </td>");
				dataColumnArray.push("<td class='textAlignLeft'>" + data.regionName + "</td>");
				dataColumnArray.push("<td class='textAlignLeft'>" + data.subRegionName + "</td>");
				dataColumnArray.push("<td class='textAlignLeft'>" + data.branchName + "</td>");
				dataColumnArray.push("<td style='text-align:center;'><input class='loadingHamali form-control' type='text' value='"+data.loadingTimeHamali+"' id='LoadingRate_"+data.branchId +"'oninput='validateAndAppendTon(this)' style='width: 100px';/></td>");
				dataColumnArray.push("<td style='text-align:center;'><input class='thappi form-control' type='text' value='"+data.thappi+"' id='ThappiRate_"+data.branchId +"' oninput='validateAndAppendTon(this)' style='width: 100px;' /></td>");
				dataColumnArray.push("<td style='text-align:center;display:none'><input  type='hidden' value='"+data.configHamaliForVehicleTypeId+"' id='LoadingRateUpdate_"+data.branchId +"' style='width: 100px';/></td>");
				dataColumnArray.push("<td style='text-align:center;display:none'><input type='hidden' value='"+data.configHamaliForVehicleTypeId+"' id='ThappiRateUpdate_"+data.branchId +"'  style='width: 10px;' /></td>");
				dataColumnArray.push("<td style='text-align:center;'><input class='loadingLeavy form-control' type='text' value='"+data.loadingLevyAmt+"' id='LoadingLeavy_"+data.branchId +"'oninput='validateAndAppendTon(this)' style='width: 100px';/></td>");
				dataColumnArray.push("<td style='text-align:center;'><input class='thappiLeavy form-control' type='text' value='"+data.thappiLevyAmt+"' id='ThappiLeavy_"+data.branchId +"' oninput='validateAndAppendTon(this)' style='width: 100px;' /></td>");

				$('#mainTable').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
			
		},saveRates : function() {
			showLayer();
			
			let jsonObject 	= _this.getDataToSaveAndUpdate();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/loadingRateMasterWS/insertAndUpdateLoadingRateDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		},resetFeilds : function() {
			$('.loadingHamali').val("");
			$('.thappi').val("");
			$(".checkbox").prop("checked", false);

			$("#checkboxAll").prop("checked", false);
		}, setResponse : function(response) {
			_this.resetFeilds();
			hideLayer();
			
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			_this.onSubmit();
		} ,getDataToSaveAndUpdate : function() {
			let jsonObject		= new Object();
			let loadingRateMasterArrays						= new Array();
		
			for(let i = 0; i < branchList.length; i++) {
				let isChecked		= $("#check_"+i).prop("checked");

				if(isChecked) {
					let loadingRateData = new Object();
					id = $("#check_"+i).val();
					loadingRateData.loadingTimeHamali	= $('#LoadingRate_' +id).val();
					loadingRateData.thappi			= $('#ThappiRate_' + id).val();
					loadingRateData.branchId		= id;
					loadingRateData.configHamaliForVehicleTypeId =$('#LoadingRateUpdate_' +id).val();
					loadingRateData.loadingLevyAmt 	= $('#LoadingLeavy_' + id).val();
					loadingRateData.thappiLevyAmt	= $('#ThappiLeavy_' + id).val();


			
					loadingRateMasterArrays.push(loadingRateData);
				}
			}
	
			jsonObject.loadingRateMasterArrays = JSON.stringify(loadingRateMasterArrays);
		
			_this.resetFeilds();		
			return jsonObject;
		}
	});
});

function checkBoxForAll(){
	for(let i = 0; i < branchList.length; i++) {
		$("#check_"+i).prop("checked", $("#checkboxAll").prop("checked"));
	}
}

function resetAllCechkBox(){
	$("#checkboxAll").prop("checked", branchList.length == $('.checkbox:checked').length);
}