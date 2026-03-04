let	 id = 0;
let total = 0;
let a=0;
let loadingPercentAmt = 0;
var mathadiLhpvId =0;
define([
		PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
		  PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		 'jqueryConfirm',
		 'JsonUtility',
		 'messageUtility',
		 'autocomplete',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation'
		],//PopulateAutocomplete
		 function(Selection, UrlParameter) {
			'use strict';
		let jsonObject = new Object(), _this, mathadiNumberId = 0, lhpvIds = [], mathadiList, loadingHamaliLedgerId = 0,isKantaWeight =false,mathadiNumber,
		collectionSubstractionValue,loadingSubstractionLimit;
	
		return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			mathadiNumberId		= UrlParameter.getModuleNameFromParam(MASTERID);
			this.$el.html(this.template);
		}, render : function() {
			jsonObject.mathadiNumberId = mathadiNumberId;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/mathadiCalculationWS/getMathadiDataByMathadiNumberIdForEdit.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderAllDetailsElements : function(response) {
			
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/mathadiCalculation/mathadiEdit.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				mathadiList 				= response.datalist;
				mathadiNumber				= mathadiList[0].mathadiNumber;
				loadingHamaliLedgerId		= mathadiList[0].loadingHamaliLedgerId;
				collectionSubstractionValue	= response.collectionSubstractionValue;
				loadingSubstractionLimit	= response.loadingSubstractionLimit;

				_this.createHeader(false);
				_this.setMathadiDetailsData(mathadiList);
				
				$('#mathadiNumbers').html('<button type="button" id="mathadiPrint" class="btn btn-primary text-white">Mathadi No.: ' + mathadiList[0].mathadiNumber + ' Print</button>');
				$('#editWarfareAmountDiv').html(
						'<input class="form-control" onkeypress="return validateFloatKeyPress(event, this);" name ="warfareAmt" type="text" value="' + mathadiList[0].warfareAmount + '" id="warfareAmt" maxlength="8" placeholder="Warefare Amount"/>'
						+ '<label for="warfareAmt">WarFare Amount</label>');
				$('#editWarfareLevyAmountDiv').html(
						'<input class="form-control" onkeypress="return validateFloatKeyPress(event, this);" name ="warfareLeavyAmt" type="text" value="' + mathadiList[0].warfareLeavyAmt + '" id="warfareLeavyAmt" maxlength="8" placeholder = "Warfare Levy Amount"/>'
						+ '<label for="warfareLeavyAmt">WarFare Levy Amount</label>');
				
				$('#mathadiPrint').click(function() {
					_this.printMathadiNumberReceipt();
				});
				
				$('#addLhpv').click(function() {
					_this.addLhpvInMathadi();
				});
				
				$('#updateBtn').click(function() {
					$.confirm({
					    title: 'Confirm!',
					    content: 'Are you sure you want to update?',
						btnClass: 'btn-blue',
					    buttons: {
					        confirm: function () {
								let jsonObject = _this.saveUpdatedValue();		
								showLayer();
								getJSON(jsonObject, WEB_SERVICE_URL + '/mathadiCalculationWS/updateMathadiDataForLoadingHamali.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
					        },
					        cancel: function () {
					            console.log('Canceled!');
					        }
					    }
					});
				});
				
				$("#removeLhpv").on("click", function() {
					_this.removeLhpvFromMathadi(mathadiList);
				});
				
				$("#cancelLhpv").on("click", function() {
					_this.cancelMathadi();
				});
			});
		}, createHeader : function(isAppendLhpv) {
			let headerColumnArray = [];
	
			if(isAppendLhpv)
				headerColumnArray.push("<th><input style='font-weight:bold;background-colour:light green;' name ='appendLhpvDetails' type='checkbox' id='appendLhpvDetailsCheckAll' value='checkboxAll' checked> </th>");
			else
				headerColumnArray.push("<th><input style='font-weight:bold;background-colour:light green;' name ='mathadi_details' type='checkbox' id='checkboxAll' value='checkboxAll' unchecked> </th>");
			
			headerColumnArray.push('<th>LHPV No</th>');
			headerColumnArray.push('<th>LHPV Creation Date</th>');
			headerColumnArray.push('<th>Kata</th>');
			headerColumnArray.push('<th>Collection</th>');
			headerColumnArray.push('<th style="display:none"></th>');
			headerColumnArray.push('<th style="display:none"></th>');
			headerColumnArray.push('<th>Empty</th>');
			headerColumnArray.push('<th>Loading</th>');
			headerColumnArray.push('<th>Actual Loading</th>');
			headerColumnArray.push('<th>Loading Time Hamali</th>');
			headerColumnArray.push('<th>Loading Amt</th>');
			headerColumnArray.push('<th>Loading Leavy Rate</th>');
			headerColumnArray.push('<th>Loading Leavy Amt</th>');
			headerColumnArray.push('<th>Thappi Weight</th>');
			headerColumnArray.push('<th>Actual Thappi</th>');
			headerColumnArray.push('<th>Thappi Rate</th>');
			headerColumnArray.push('<th>Thappi Amt</th>');
			headerColumnArray.push('<th>Thappi Leavy Rate</th>');
			headerColumnArray.push('<th>Thappi Leavy Amt</th>');
			headerColumnArray.push('<th>Loading & Thappi Amt</th>');
			headerColumnArray.push('<th>Leavy Amt</th>');
			headerColumnArray.push('<th>Total Amt</th>');
			
			if(isAppendLhpv)
				$('#lhpvDetailsThead').append('<tr class="bg-secondary text-white">' + headerColumnArray.join(' ') +' </tr>');
			else
				$('#mainTable').append('<tr class="bg-info">' + headerColumnArray.join(' ') +' </tr>');
			
			$('#checkboxAll').on('click', function() {
				for(const element of lhpvIds) {
					$("#check_" + element).prop("checked", $(this).prop("checked"));
				}
			});
			
			$('#appendLhpvDetailsCheckAll').on('click', function() {
				let tab 	= document.getElementById('lhpvDetailsTbody');
				let count 	= parseFloat(tab.rows.length);
				
				for (let row = 0; row < count; row++) {
					if(tab.rows[row].cells[0].firstElementChild)
						tab.rows[row].cells[0].firstElementChild.checked = $("#appendLhpvDetailsCheckAll").is(":checked");
				}
			});
		}, setMathadiDetailsData : function(mathadiList) {
			$('#bottom-border-boxshadow').removeClass('hide');
			
			for (const element of mathadiList) {
				let obj		= element;
				let lhpvId	= obj.lhpvId;
				let dataColumnArray = [];
					
				lhpvIds.push(lhpvId);
					
				dataColumnArray.push("<td style='text-align: center;'><input type='checkbox' name = 'mathadi_details'  class='checkbox' id='check_" + lhpvId + "' value='" + lhpvId + "' unchecked></td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.lhpvNumber + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + obj.lhpvCreationDateTimeStr + "</td>");
				dataColumnArray.push("<td style='text-align: center;text-align: -webkit-center;'><input class=' form-control' onkeypress='return validateFloatKeyPress(event, this);' type='text' value='" + obj.kata + "' id='kata_" + lhpvId + "' style='width: 150px;' maxlength='8'/></td>");
				dataColumnArray.push("<td style='text-align: center;text-align: -webkit-center;'><input class=' form-control' onkeypress='return validateFloatKeyPress(event, this);' type='text' value='" + obj.collection + "' id='collection_" + lhpvId + "' style='width: 150px' maxlength='8'/></td>");
				dataColumnArray.push("<td style='text-align: center' id='unLadenWeight_" + lhpvId + "'>" + obj.unLadenWeight + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loading_" + lhpvId + "'>"+ obj.loading + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='actualLoading_" + lhpvId + "'>" + obj.actualLoading + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingTimeHamali_" + lhpvId + "'>" + obj.loadingTimeHamali + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingAmt_" + lhpvId + "'>" + obj.loadingAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingLeavyAmtId_" + lhpvId + "'>" + obj.loadingLeavyPercentage / 100 + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingLeavyAmtResult_" + lhpvId + "'>" + obj.loadingLeavyAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappi_" + lhpvId + "'>" + obj.thappiWeight + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='Actualthappi_" + lhpvId + "'>" + obj.actualThappi + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiRate_" + lhpvId + "'>" + obj.thappiRate + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiAmt_" + lhpvId + "'>" + obj.thappiAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiLeavyAmtId_" + lhpvId + "'>" + obj.thappiLeavyPercentage / 100 + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiLeavyAmt_" + lhpvId + "'>" + obj.thappiLeavyAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingAndThappiAmt_" + lhpvId + "'>" + obj.loadingAndThappiAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='leavyAmt_" + lhpvId + "'>" + obj.leavyAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='totalAMt_" + lhpvId + "'>" + obj.totalAmt + "</td>");

				$("#mainTable tbody").append('<tr "' + lhpvId + '">' + dataColumnArray.join(' ') + '</tr>');
					
				$('#kata_' + lhpvId).on('change click blur ', function() {
					let elementId		= $(this).attr('id');
					let lhpvId			= elementId.split('_')[1];
					let loadingValue	= parseFloat($('#kata_' + lhpvId).val() != "" ? $('#kata_' + lhpvId).val() : 0) - parseFloat($('#unLadenWeight_' + lhpvId).text() || 0);
					_this.calculationOnInputChange(lhpvId, toFixedWhenDecimal(loadingValue));
				});
	
				$('#collection_' + lhpvId).on('change click blur', function() {
					let elementId		= $(this).attr('id');
					let lhpvId			= elementId.split('_')[1];
					let loadingValue	= parseFloat($('#loading_' + lhpvId).text() || 0);
						
					_this.calculationOnInputChange(lhpvId, loadingValue);
				});
					
				$('#kata_' + lhpvId).trigger('load');
				$('#collection_' + lhpvId).trigger('load'); 
			}
		}, addLhpvInMathadi : function() {
			$('#middle-border-boxshadow').removeClass('hide');
			$('#lhpvNumberEle').focus();
			goToPosition('middle-border-boxshadow', 'slow');
			
			$("#lhpvNumberEle").bind("keydown", function(event) {
				_this.getLhpvDetailsToAppend(event);
			});
			
			$("#findBtnForAppendLhpv").on("keydown click", function(event) {
				_this.getLhpvDetailsToAppend(event);
			});
			
			$("#appendBtn").on("click", function() {
				_this.appendLhpvDetails();
			});
		}, getLhpvDetailsToAppend : function(e) {
			if (e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER || e.type === 'click') {
				let lhpvNumberEle = $('#lhpvNumberEle').val();

				if (lhpvNumberEle == '') {
					showAlertMessage('info', 'Enter Lhpv Number !');
					e.preventDefault(); 
					e.stopPropagation();
					return false;
				}
				
				let jsonObject = new Object();

				jsonObject.lhpvNumber = lhpvNumberEle.replace(/\s+/g, "");
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/mathadiCalculationWS/getLhpvToAppendInMathadi.do', _this.addLhpvToAppendInMathadi, EXECUTE_WITH_ERROR);
			}
		}, addLhpvToAppendInMathadi : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#lhpvNumberEle').val('');
				return;
			}
			
			let lhpvList		= response.addLhpvData;
			let lhpvNumberEle	= $('#lhpvNumberEle').val();
			
			if($('#lhpvNumber_' + lhpvList[0].lhpvId).exists()) {
				showAlertMessage('error', `LHPV Number '${lhpvNumberEle}' is already added!`);
				return;
			}
			
			$('#lhpvDetails').removeClass('hide');
			$('#appendLhpvButtonDiv').removeClass('hide');
			
			if($('#lhpvDetailsThead tr').length == 0)
				_this.createHeader(true);
			
			_this.setMathadiDetailsDataForAppend(lhpvList);
		}, setMathadiDetailsDataForAppend : function(list) {
			for (const element of list) {
				let obj 		= element;
				let lhpvId		= obj.lhpvId;
				let capacity 	=  obj.capacity - obj.grossWeight;
				loadingPercentAmt = obj.loadingLeavyAmt / 100;
				
				let dataColumnArray = [];
					
				dataColumnArray.push("<td style='text-align: center;display:'><input type='checkbox' name = 'lhpvToAppend'  class='checkbox' id='lhpvToAppend" + lhpvId + "' value='" + lhpvId + "' checked></td>");
				dataColumnArray.push("<td style='text-align: center' id='lhpvNumber_" + lhpvId + "'>" + obj.lhpvNumber + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='lhpvCreationDateTimeStr_" + lhpvId + "'>" + obj.lhpvCreationDateTimeStr + "</td>");
				dataColumnArray.push("<td style='text-align: center;text-align: -webkit-center;'><input class=' form-control' onkeypress='return validateFloatKeyPress(event, this);' type='text' value=' ' id='kata_" + lhpvId + "' style='width: 150px;' maxlength='8'/></td>");
				dataColumnArray.push("<td style='text-align: center;text-align: -webkit-center;'><input class=' form-control' onkeypress='return validateFloatKeyPress(event, this);' type='text' value=' ' id='collection_" + lhpvId + "' style='width: 150px' maxlength='8'/></td>");
				dataColumnArray.push("<td style='text-align: center' id='unLadenWeight_" + lhpvId + "'>" + obj.unLadenWeight + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loading_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='actualLoading_" + lhpvId + "'>" + obj.actualLoading + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingTimeHamali_" + lhpvId + "'>" + obj.loadingTimeHamali + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingAmt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingLeavyAmtId_" + lhpvId + "'>" + obj.loadingLeavyPercentage / 100 + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingLeavyAmtResult_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappi_" + lhpvId + "'>" + obj.thappiWeight + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='Actualthappi_" + lhpvId + "'>" + obj.actualThappi + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiRate_" + lhpvId + "'>" + obj.thappiRate + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiAmt_" + lhpvId + "'>" + obj.thappiAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiLeavyAmtId_" + lhpvId + "'>" + obj.thappiLeavyPercentage / 100 + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiLeavyAmt_" + lhpvId + "'>" + obj.thappiLeavyAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingAndThappiAmt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='leavyAmt_" + lhpvId + "'>" + obj.leavyAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='totalAMt_" + lhpvId + "'>" + obj.totalAmt + "</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='capacity_" + lhpvId + "'>" + capacity + "</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='vehicleNumberId_" + lhpvId + "'>" + obj.vehicleNumberId + "</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='vehicleTypeId_" + lhpvId + "'>" + obj.vehicleTypeId + "</td>");

				$("#lhpvDetailsTable tbody").append('<tr "' +lhpvId+ '">' + dataColumnArray.join(' ') + '</tr>');
					
				$('#kata_' + lhpvId).on('input', function() {
					let elementId		= $(this).attr('id');
					let lhpvId			= elementId.split('_')[1];
					 
					let loadingValue	= parseFloat($('#kata_' + lhpvId).val() != "" ? $('#kata_' + lhpvId).val() : 0) - parseFloat($('#unLadenWeight_' + lhpvId).text() || 0);
					_this.calculationOnInputChange(lhpvId, toFixedWhenDecimal(loadingValue));
				});
	
				$('#collection_' + lhpvId).on('input', function() {
					let elementId		= $(this).attr('id');
					let lhpvId			= elementId.split('_')[1];
					let loadingValue	= parseFloat($('#loading_' + lhpvId).text() || 0);
					
					_this.calculationOnInputChange(lhpvId, loadingValue);
					
				});
					
				$('#kata_' + lhpvId).trigger('input load');
				$('#collection_' + lhpvId).trigger('input load'); 
			}
		}, appendLhpvDetails : function () {
			let jsonObject 			= Selection.getElementData();
			let mathadiDetailsArray = new Array();
			let lhpvIdArr			= getAllCheckBoxSelectValue('lhpvToAppend');
			isKantaWeight		= false;
			
			if ($('input[type="checkbox"]:checked').length === 0) {
				showAlertMessage('error', 'Please Select At Least One CheckBox');
				return false; // Prevent default action
			}
			
			for(const element of lhpvIdArr) {
 				if($('#kata_' + element).val() > 0)
					isKantaWeight	= true;
				else {
					isKantaWeight	= false;
					showAlertMessage('error', 'Please, Enter Kata Weight for this LHPV Number ' + $('#lhpvNumber_' + element).text() + ' !');
					return;
				}

				let collectionValue = $('#collection_' + element).val().trim();
				
				let mathadiData 	= new Object();
				mathadiData.lsNumber				= ($('#lsNumber_' + element).text()).split("<br>").join(",");
				mathadiData.lhpvId					= element;
				mathadiData.lhpvNumber				= $('#lhpvNumber_' + element).text();
				mathadiData.lhpvCreationDateTimeStr	= $('#lhpvCreationDateTimeStr_' + element).text();
				mathadiData.kataWeight				= $('#kata_' + element).val();
				mathadiData.collection 				= collectionValue && !isNaN(collectionValue) ? parseFloat(collectionValue) : 0;
				mathadiData.loading 				= $('#loading_' + element).text() || 0;
				mathadiData.actualLoading			= $('#actualLoading_' + element).text() || 0;
				mathadiData.loadingAmount			= $('#loadingAmt_' + element).text() || 0;
				mathadiData.loadingLeavyAmt 		= $('#loadingLeavyAmtResult_' + element).text() || 0;
				mathadiData.actualThappi 			= $('#Actualthappi_' + element).text() || 0;
				mathadiData.thappiAmount			= $('#thappiAmt_' + element).text() || 0;
				mathadiData.thappiLeavyAmt			= $('#thappiLeavyAmt_' + element).text() || 0;
				mathadiData.loadingAndThappiAmt 	= $('#loadingAndThappiAmt_' + element).text() || 0;
				mathadiData.thappiWeight 			= $('#thappi_' + element).text() || 0;
				mathadiData.unLadenWeight			= $('#unLadenWeight_' + element).text() || 0;
				mathadiData.leavyAmt 				= $('#leavyAmt_' + element).text() || 0;
				mathadiData.bharaiAmount 			= $('#bharaiAmount_' + element).text() || 0;
				mathadiData.totalLoadingHamali		= $('#totalAMt_' + element).text() || 0;
				mathadiData.totalActualLoadingHamali= $('#totalActualLoadingHamali_' + element).text() || 0;
				mathadiData.actualWeight			= $('#actualWeight_' + element).text() || 0;
				mathadiData.vehicleNumberId			= $('#vehicleNumberId_' + element).text();
				mathadiData.lsSourceBranchId		= $('#branchId_' + element).text();
				mathadiData.capacity				= $('#capacity_' + element).text();
				
				mathadiDetailsArray.push(mathadiData);
			}
			
			jsonObject.mathadiDetails 	= JSON.stringify(mathadiDetailsArray);
			jsonObject.warfareAmount 	= $('#warfareAmt').val();
			jsonObject.warfareLeavyAmt 	= $('#warfareLeavyAmt').val();
			jsonObject.mathadiNumberId 	= mathadiNumberId;
			jsonObject.mathadiNumber	= mathadiNumber;
			
			if(!isKantaWeight) return;
			
			$.confirm({
				title: 'Confirm!',
				content: 'Do you want to proceed with appending LHPV details?',
				btnClass: 'btn-danger',
				buttons: {
					confirm: function () {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/mathadiCalculationWS/appendLhpvInMathadi.do', _this.responseAfterAdd, EXECUTE_WITH_ERROR);
					},
					cancel: function () { }
				}
			});
		}, removeLhpvFromMathadi : function (mathadiList) {
			let jsonObject 			= Selection.getElementData();
			let lhpvIdArr			= getAllCheckBoxSelectValue('mathadi_details');
			
			if(lhpvIdArr.length == 0) {
				showAlertMessage('error', 'Please, Select atleast 1 LR to Remove !');
				return false;
			}

			if(mathadiList.length == 1) {
				showAlertMessage('error', 'Please, Cancel this Mathadi if Mathadi has only 1 LHPV !');
				return false;
			}

			jsonObject.lhpvIds			= lhpvIdArr.join(',');
			jsonObject.mathadiNumberId 	= mathadiNumberId;
			jsonObject.mathadiNumber 	= mathadiNumber;
			jsonObject.warfareAmount  	= $('#warfareAmt').val();
			jsonObject.warfareLeavyAmt 	= $('#warfareLeavyAmt').val() * loadingPercentAmt;
			
			$.confirm({
				title: 'Confirm!',
				content: 'Are you sure you want to remove Lhpv?',
				btnClass: 'btn-danger',
				buttons: {
					confirm: function () {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/mathadiCalculationWS/removeLhpvInMathadi.do', _this.responseAfterAdd, EXECUTE_WITH_ERROR);
					},
					cancel: function () { }
				}
			});
		}, cancelMathadi : function () {
			let jsonObject 			= {};
			
			jsonObject.mathadiNumberId	= mathadiNumberId;
			jsonObject.mathadiNumber	= mathadiNumber;
			
			$.confirm({
				title: 'Confirm!',
				content: 'Are you sure you want to cancel mathadi?',
				btnClass: 'btn-danger',
				buttons: {
					confirm: function () {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/mathadiCalculationWS/mathadiCancellation.do', _this.responseAfterCancel, EXECUTE_WITH_ERROR);
					},
					cancel: function () { }
				}
			});
		}, responseAfterAdd: function() {
			$('#lhpvDetails').addClass('hide');
			$('#lhpvDetailsTable').empty();
			
			jsonObject.mathadiNumberId = mathadiNumberId;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/mathadiCalculationWS/getMathadiDataByMathadiNumberIdForEdit.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
		}, responseAfterCancel : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
				$('#mainTable').addClass('hide');
				$('#ElementDiv').html(response.message.description);
			}
		}, saveUpdatedValue : function() {
			let jsonObject = new Object();
			let mathadiDetailsArray = new Array();

			for (const element of mathadiList) {
				let obj		= element;
				let lhpvId	= obj.lhpvId;
				
				let mathadiData = new Object();
				mathadiData.lhpvId					= lhpvId;
				mathadiData.vehicleConfigHamaliId	= obj.vehicleConfigHamaliId;
				mathadiData.lhpvNumber				= obj.lhpvNumber;
				mathadiData.lhpvCreationDateTimeStr	= obj.lhpvCreationDateTimeStr;
				mathadiData.kataWeight				= $('#kata_' + lhpvId).val();
				mathadiData.collection				= $('#collection_' + lhpvId).val() || 0;
				mathadiData.loading					= $('#loading_' + lhpvId).html();
				mathadiData.actualLoading			= $('#actualLoading_' + lhpvId).text() ||0;
				mathadiData.loadingAmount			= $('#loadingAmt_' + lhpvId).text() ||0;
				mathadiData.loadingLeavyAmt			= $('#loadingLeavyAmtResult_' + lhpvId).text() ||0;
				mathadiData.actualThappi			= $('#Actualthappi_' + lhpvId).text() ||0;
				mathadiData.thappiAmount			= $('#thappiAmt_' + lhpvId).html();
				mathadiData.thappiLeavyAmt			= $('#thappiLeavyAmt_' + lhpvId).html();
				mathadiData.loadingAndThappiAmt		= $('#loadingAndThappiAmt_' + lhpvId).html();
				mathadiData.leavyAmt				= $('#leavyAmt_' + lhpvId).text() || 0;
				mathadiData.totalLoadingHamali		= $('#totalAMt_' + lhpvId).text() || 0;

				mathadiDetailsArray.push(mathadiData);
			}
				
			jsonObject.mathadiDetails = JSON.stringify(mathadiDetailsArray);
				
			jsonObject.warfareAmount			= $('#warfareAmt').val();
			jsonObject.warfareLeavyAmt			= $('#warfareLeavyAmt').val();
			jsonObject.loadingHamaliLedgerId	= loadingHamaliLedgerId;

			return jsonObject;
		}, setResponse: function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				setTimeout(function() {
					location.reload();
				}, 200);
			}
		}, calculationOnInputChange : function(lhpvId, loadingValue) {
			let collectionValue		= parseFloat($('#collection_' + lhpvId).val() != "" ? $('#collection_' + lhpvId).val() : 0);
			let actualLoadingValue	= (collectionValue >= 3) ? loadingValue - collectionValue : loadingValue;
			actualLoadingValue		= toFixedWhenDecimal(actualLoadingValue);

			let loadingAmt	= actualLoadingValue * parseFloat($("#loadingTimeHamali_" + lhpvId).text() || 0);
			loadingAmt		= toFixedWhenDecimal(loadingAmt);

			let loadingLeavyAmtResult	= loadingAmt * parseFloat($("#loadingLeavyAmtId_" + lhpvId).text() || 0);
			loadingLeavyAmtResult		= toFixedWhenDecimal(loadingLeavyAmtResult);
			
			$('#loading_' + lhpvId).text(loadingValue);
			$('#actualLoading_' + lhpvId).text(actualLoadingValue);
			$('#loadingAmt_' + lhpvId).text(loadingAmt);
			$('#loadingLeavyAmtResult_' + lhpvId).text(loadingLeavyAmtResult);
			
			let thappi = $('#thappi_' + lhpvId).text() || 0;
			
			if (collectionValue === 0)
				$('#Actualthappi_' + lhpvId).text(toFixedWhenDecimal(thappi));
			else if (collectionValue > 0 && collectionValue < collectionSubstractionValue)
				$('#Actualthappi_' + lhpvId).text(toFixedWhenDecimal(thappi - collectionValue));
			else
				$('#Actualthappi_' + lhpvId).text(toFixedWhenDecimal(thappi || 0));
			
			
			if(loadingValue > loadingSubstractionLimit) {
				let actualThappiValue = $('#Actualthappi_' + lhpvId).text();
				$('#Actualthappi_' + lhpvId).text(toFixedWhenDecimal(Number(actualThappiValue) + (loadingValue - loadingSubstractionLimit)));
			}
				
			let actualthappi		= parseFloat($("#Actualthappi_" + lhpvId).text() || 0);	
			let thappiAmount		= actualthappi * parseFloat($("#thappiRate_" + lhpvId).text() || 0);
			thappiAmount			= toFixedWhenDecimal(thappiAmount);
			
			let thappyLeavyAmount	= thappiAmount * parseFloat($("#thappiLeavyAmtId_" + lhpvId).text() || 0);
			thappyLeavyAmount		= toFixedWhenDecimal(thappyLeavyAmount);
			
			let loadingAndThappiAmt = thappiAmount + loadingAmt;
			let levyAmt				= loadingLeavyAmtResult + thappyLeavyAmount;
			levyAmt					= toFixedWhenDecimal(levyAmt);
			
			$('#thappiAmt_' + lhpvId).text(thappiAmount);
			$('#thappiLeavyAmt_' + lhpvId).text(thappyLeavyAmount);
			$('#loadingAndThappiAmt_' + lhpvId).text(toFixedWhenDecimal(loadingAndThappiAmt));
			$('#leavyAmt_' + lhpvId).text(levyAmt);
			$('#totalAMt_' + lhpvId).text(toFixedWhenDecimal(loadingAmt + thappiAmount + levyAmt));
		}, printMathadiNumberReceipt : function() {
			window.open('module.do?pageId=340&eventId=10&modulename=mathadiCalculationPrint&masterid=' + loadingHamaliLedgerId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});

$('input[type="checkbox"]').change(function() {
	let anyChecked = $('input[type="checkbox"]:checked').length > 0;
	$('#saveRate').prop('disabled', !anyChecked);
});
