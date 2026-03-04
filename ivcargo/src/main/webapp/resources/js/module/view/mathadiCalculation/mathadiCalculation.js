var lhpvIds = [];
let  id = 0;
let total = 0;
let a=0;
let loadingPercentAmt = 0;

define([
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		  PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		 'JsonUtility',
		 'messageUtility',
		 'autocomplete',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		],//PopulateAutocomplete
		 function(Selection, UrlParameter) {
			'use strict';
		let jsonObject = new Object(), myNod, _this, mathadiNumberId = 0, mathadiNumber = 0, isKantaWeight = false, showWarfareAmount = false, warfareAmountDay = 0,
		collectionSubstractionValue = 0, loadingSubstractionLimit = 0;
		return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			mathadiNumberId 	= UrlParameter.getModuleNameFromParam(MASTERID);
			mathadiNumber  		= UrlParameter.getModuleNameFromParam(MASTERID2);
			this.$el.html(this.template);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/mathadiCalculationWS/getMathadiCaculationModuleElement.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderAllDetailsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/mathadiCalculation/mathadiCalculation.html",function() {
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
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				Selection.setSelectionToGetData(response);
				
				showWarfareAmount 			= response.showWarfareAmount;
				warfareAmountDay 			= response.WarfareAmountDay;
				collectionSubstractionValue = response.collectionSubstractionValue;
				loadingSubstractionLimit	= response.loadingSubstractionLimit;
				
				myNod = Selection.setNodElementForValidation(response);
							
				if (mathadiNumberId != undefined && mathadiNumberId > 0) {
					$("#mathadiNumber").append(mathadiNumber);
					$("#reprint").removeClass('hide');

					$("#reprintBtn").click(function() {
						_this.showPrint(mathadiNumberId, mathadiNumber);
					})

					_this.showPrint(mathadiNumberId, mathadiNumber);
				} else
					$("#reprint").addClass('hide');

				hideLayer();
			
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$('#saveRates').click(function() {
					if ($('input[type="checkbox"]:checked').length === 0) {
						showAlertMessage('error', 'Please Select At Least One CheckBox');
						return false; // Prevent default action
					}
					
					_this.saveRates()
				});
			});
		}, onSubmit : function() {
			$('#bottom-border-boxshadow').addClass('hide');
			let jsonObject	= Selection.getElementData();
			showLayer();
				
			getJSON(jsonObject, WEB_SERVICE_URL+'/mathadiCalculationWS/getDataForMathadiCalculation.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			$('#mainTable').empty();
			
			const today = new Date();
			const day = today.getDay(); // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
				
			if (day === warfareAmountDay || showWarfareAmount) {
				if (!document.getElementById('warfare')) { 
					const inputField = document.createElement('input');
					inputField.type = 'text';
					inputField.id = 'warfare';
					inputField.placeholder = 'Warfare';
					inputField.className = 'form-control col-md-1';
					inputField.style.width = '20%';
					inputField.maxLength = 8;
					inputField.classList.add('warfare-input');
					inputField.addEventListener('input', function() { validateAndAppendTon(inputField); });
					
					$('#saveBtnDiv').append(inputField);
				}
			}
				
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			lhpvIds	= [];
			let latestDispatchData = response.latestDispatchData;
		
			$('#bottom-border-boxshadow').removeClass('hide');
			
			let headerColumnArray = new Array();
			headerColumnArray.push("<th style='text-align: center; font-size:15px;'><input style='font-weight:bold;background-colour:light green;' type='checkbox' id='checkboxAll' value='checkboxAll' unchecked> </th>");
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Date</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">LHPV No</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">LS Number</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">LS Source BranchCode</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Vehicle Number</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Vehicle Type</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Capacity</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Kata(Ton)</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Empty</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Collection</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Loading</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Actual Loading</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Loading Rate</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Loading Amount</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Loading Leavy Amount </th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Thappi</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Actual Thappi</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Thappi Rate</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Thappi Amount</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Thappi Levy Amount</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Loading & Thappi Amount</th>'); 
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Levy Amount</th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;">Total Amount </th>');
			headerColumnArray.push("<th style='text-align: center;display:none; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='oxAll' value='checkboxAll' unchecked> </th>");
			headerColumnArray.push("<th style='text-align: center;display:none; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='xAll' value='checkboxAll' unchecked> </th>");
			headerColumnArray.push('<th style="text-align: center;font-size:15px;display:none"></th>');
			headerColumnArray.push('<th style="text-align: center;font-size:15px;display:none"></th>');

			$('#mainTable').append('<tr>' + headerColumnArray.join(' ') +' </tr>');

			for (const element of latestDispatchData) {
				let data 	= element;
				let lhpvId	= data.lhpvId;
				
				lhpvIds.push(lhpvId);

				let lsNumbers 		= (data.lsNumbers).split(",").join("<br>");
				let lsBranchcode 	= (data.branchCode).split(",").join("<br>");

				let capacity 	=  data.capacity - data.grossWeight;
			 
			 	loadingPercentAmt = data.loadingLeavyAmt / 100;
			 
				let dataColumnArray = new Array();
				
				dataColumnArray.push("<td style='text-align: center'><input type='checkbox' name = 'mathadi_details'  class='checkbox' id='check_" + lhpvId + "' value='" + lhpvId + "' unchecked></td>");
				dataColumnArray.push("<td style='text-align: center'>" + data.dateStr + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='lhpvNumber_" + lhpvId + "'>" + data.lhpvNumber + "</td>");
				dataColumnArray.push("<td style='textloading-align: center' id='lsNumber_" + lhpvId + "'>" + lsNumbers + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + lsBranchcode + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='vehicleNumber_" + lhpvId + "'>" + data.vehicleNumber + "</td>");
				dataColumnArray.push("<td style='text-align: center'>" + data.vehicleName + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='capacity_" + lhpvId + "'>" + capacity + "</td>");
				dataColumnArray.push("<td style='text-align: center'><input class='kata form-control' type='text' value='' id='kata_" + lhpvId + "' style='width: 150px'/></td>");
				dataColumnArray.push("<td style='text-align: center' class='empty' id='unLadenWeight_" + lhpvId + "'>" + data.unLadenWeight + "</td>");
				dataColumnArray.push("<td style='text-align: center'><input class='collection form-control' type='text' value='' id='collection_" + lhpvId + "' style='width:150px'/></td>");
			   	dataColumnArray.push("<td style='text-align: center' id='loading_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='actualLoading_" + lhpvId +"'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingTimeHamali_" + lhpvId + "'>" + data.loadingTimeHamali + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingAmt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingLeavyAmtResult_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappi_" + lhpvId + "'>" + data.thappiWeight + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='Actualthappi_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiRate_" + lhpvId + "'>" + data.thappi + "</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiAmt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='thappiLeavyAmt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='loadingAndThappiAmt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='leavyAmt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center' id='totalAMt_" + lhpvId + "'>0</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='branchId_" + lhpvId + "'>" + data.lsSourceBranchId + "</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='vehicleNumberId_" + lhpvId + "'>" + data.vehicleNumberId + "</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='vehicleTypeId_" + lhpvId + "'>" + data.vehicleTypeId + "</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='loadingLeavyAmtId_" + lhpvId + "'>" + data.loadingLeavyAmt / 100 + "</td>");
				dataColumnArray.push("<td style='text-align: center;display:none' id='thappiLeavyAmtId_" + lhpvId + "'>" + data.thappiLeavyAmt / 100 + "</td>");

				$("#mainTable").append('<tr>' +dataColumnArray.join(' ')+ '</tr>');
		
				$('#kata_' + lhpvId).on('input', function() {
					validateAndAppendTon(this);
					limitOnDigits(this);
					
					let loadingValue = parseFloat($('#kata_' + lhpvId).val() != "" ? $('#kata_' + lhpvId).val() : 0) - parseFloat($('#unLadenWeight_' + lhpvId).text() || 0);
					loadingValue = toFixedWhenDecimal(loadingValue);

					_this.calculationOnInputChange(lhpvId, loadingValue);
					_this.updateTotal();
				});

				$('#collection_' + lhpvId).on('input', function() {
					validateAndAppendTon(this);
					limitOnDigits(this);

					let loadingValue 		= parseFloat($('#loading_' + lhpvId).text() || 0);
					
					_this.calculationOnInputChange(lhpvId, loadingValue);
					_this.updateTotal();
				});
				
				$('#collection_' + lhpvId).on('blur', function() {
					_this.updateTotal();
				});
				
				$('#lhpvNumber_' + lhpvId).on('click', function() {
					_this.searchLhpvDetails(this);
				});
			}
			
			$('#checkboxAll').on('click', function() {
				for(const element of lhpvIds) {
					$("#check_" + element).prop("checked", $(this).prop("checked"));
				}
			});
				
			let totalArray = new Array();
				
			totalArray.push("<td style='text-align: center'>Total</td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center'></td>");
 			totalArray.push("<td style='text-align: center;'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center;'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center;'></td>");
			totalArray.push("<td style='text-align: center' id='actualLoadingTotal'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center' id='loadingAmtTotal'></td>");
			totalArray.push("<td style='text-align: center' id='loadingLeavyAmtTotal'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center' id='ActualthappiTotal'></td>");
			totalArray.push("<td style='text-align: center'></td>");
			totalArray.push("<td style='text-align: center' id='thappiAmtTotal'></td>");
			totalArray.push("<td style='text-align: center' id='thappiLeavyAmtTotal'></td>");
			totalArray.push("<td style='text-align: center' id='loadingAndThappiAmtTotal'></td>");
			totalArray.push("<td style='text-align: center' id='leavyAmtTotal'></td>");
			totalArray.push("<td style='text-align: center' id='totalAmtTotal'></td>");
					
			$("#mainTable").append('<tr>' +totalArray.join(' ')+ '</tr>');
		}, calculationOnInputChange : function(lhpvId, loadingValue) {
			let collectionValue 	= parseFloat($('#collection_' + lhpvId).val() != "" ? $('#collection_' + lhpvId).val() : 0);
			let actualLoadingValue 	= (collectionValue >= 3) ? loadingValue - collectionValue : loadingValue;
			actualLoadingValue 		= toFixedWhenDecimal(actualLoadingValue);

			let loadingAmt 	= actualLoadingValue * parseFloat($("#loadingTimeHamali_" + lhpvId).text() || 0);
			loadingAmt		= toFixedWhenDecimal(loadingAmt);

			let loadingLeavyAmtResult 	= loadingAmt * parseFloat($("#loadingLeavyAmtId_" + lhpvId).text() || 0);
			loadingLeavyAmtResult 		= toFixedWhenDecimal(loadingLeavyAmtResult);
					
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
			
			let actualthappi 		= parseFloat($("#Actualthappi_" + lhpvId).text() || 0);	
			let thappiAmount 		= actualthappi * parseFloat($("#thappiRate_" + lhpvId).text() || 0);
			thappiAmount 			= toFixedWhenDecimal(thappiAmount);
			
			let thappyLeavyAmount 	= thappiAmount * parseFloat($("#thappiLeavyAmtId_" + lhpvId).text() || 0);
			thappyLeavyAmount 		= toFixedWhenDecimal(thappyLeavyAmount);
			
			let loadingAndThappiAmt = thappiAmount + loadingAmt;
			let levyAmt 			= loadingLeavyAmtResult + thappyLeavyAmount;
			levyAmt 				= toFixedWhenDecimal(levyAmt);

			$('#thappiAmt_' + lhpvId).text(thappiAmount);
			$('#thappiLeavyAmt_' + lhpvId).text(thappyLeavyAmount);
			$('#loadingAndThappiAmt_' + lhpvId).text(toFixedWhenDecimal(loadingAndThappiAmt));
			$('#leavyAmt_' + lhpvId).text(levyAmt);

			$('#totalAMt_' + lhpvId).text(toFixedWhenDecimal(loadingAmt + thappiAmount + levyAmt));
		}, updateTotal : function() {
			// Reset totals
			let actualLoadingTotal 			= 0;
			let actualThappiTotal 			= 0;
			let loadingAndThappiAmtTotal 	= 0;
			let leavyAmtTotal 				= 0;
			let totalAmtTotal 				= 0;
			let loadingAmtTotal 			= 0;
			let loadingLeavyAmtTotal 	    = 0;
			let thappiAmtTotal 				= 0;
			let thappiLeavyAmtTotal 	    = 0;
			
			// Calculate totals
			for (const element of lhpvIds) {
				actualLoadingTotal 			+= parseFloat($('#actualLoading_' + element).text() || 0);
				actualThappiTotal 			+= parseFloat($('#Actualthappi_' + element).text() || 0);
				loadingAndThappiAmtTotal 	+= parseFloat($('#loadingAndThappiAmt_' + element).text() || 0);
				leavyAmtTotal 				+= parseFloat($('#leavyAmt_' + element).text() || 0);
				totalAmtTotal 				+= parseFloat($('#totalAMt_' + element).text() || 0);
				loadingAmtTotal 			+= parseFloat($('#loadingAmt_' + element).text() || 0);
				loadingLeavyAmtTotal 		+= parseFloat($('#loadingLeavyAmtResult_' + element).text() || 0);
				thappiAmtTotal 				+= parseFloat($('#thappiAmt_' + element).text() || 0);
				thappiLeavyAmtTotal 		+= parseFloat($('#thappiLeavyAmt_' + element).text() || 0);
			}
		
			// Update total row in the table
			$("#actualLoadingTotal").text(toFixedWhenDecimal(actualLoadingTotal));
			$("#ActualthappiTotal").text(toFixedWhenDecimal(actualThappiTotal));
			$("#loadingAndThappiAmtTotal").text(toFixedWhenDecimal(loadingAndThappiAmtTotal));
			$("#leavyAmtTotal").text(toFixedWhenDecimal(leavyAmtTotal));
			$("#totalAmtTotal").text(toFixedWhenDecimal(totalAmtTotal));
			$("#loadingAmtTotal").text(toFixedWhenDecimal(loadingAmtTotal));
			$("#loadingLeavyAmtTotal").text(toFixedWhenDecimal(loadingLeavyAmtTotal));
			$("#thappiAmtTotal").text(toFixedWhenDecimal(thappiAmtTotal));
			$("#thappiLeavyAmtTotal").text(toFixedWhenDecimal(thappiLeavyAmtTotal));
		}, saveRates : function() {
			if(!confirm('Are you sure ?'))
				return;
			
			let jsonObject = _this.getDataToSave();
			
			if(isKantaWeight) {
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/mathadiCalculationWS/insertAndUpdateMathadiDetails.do?' ,_this.setResponse, EXECUTE_WITHOUT_ERROR);
			}
		}, setResponse : function(response) {
			hideLayer();

			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				
				if(errorMessage.type == 1) {//success
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					
					let MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=mathadiCalculation&masterid='+response.mathadiCalculationId+'&masterid2='+response.mathadiNumber);
					setTimeout(function(){ location.reload(); }, 1000);
				}
			}
		
			_this.onSubmit();
		}, getDataToSave : function() {
			let jsonObject 			= Selection.getElementData();
			let mathadiDetailsArray = new Array();
			let lhpvIdArr			= getAllCheckBoxSelectValue('mathadi_details');
			isKantaWeight			= false;
			
			for(const element of lhpvIdArr) {
				if($('#kata_' + element).val() > 0)
					isKantaWeight	= true;
				else {
					isKantaWeight	= false;
					showAlertMessage('error', 'Please, Enter Kanta Weight for this LHPV Number ' + $('#lhpvNumber_' + element).text() + ' !');
					return;
				}
				
				let mathadiData = new Object();
				mathadiData.lsNumber				= ($('#lsNumber_' + element).text()).split("<br>").join(",");
				mathadiData.lhpvId					= element;
				mathadiData.lhpvNumber				= $('#lhpvNumber_' + element).text();
				mathadiData.capacity				= $('#capacity_' + element).text() || 0;
				mathadiData.kataWeight 				= $('#kata_' + element).val();
				mathadiData.collection 				= $('#collection_' + element).val() || 0;
				mathadiData.loading 				= $('#loading_' + element).text() || 0;
				mathadiData.actualLoading			= $('#actualLoading_' + element).text() || 0;
				mathadiData.loadingAmount			= $('#loadingAmt_' + element).text() || 0;
				mathadiData.loadingLeavyAmt 		= $('#loadingLeavyAmtResult_' + element).text() || 0;
				mathadiData.actualThappi 			= $('#Actualthappi_' + element).text() || 0;
				mathadiData.thappiAmount 			= $('#thappiAmt_' + element).text() || 0;
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
				
				mathadiDetailsArray.push(mathadiData);
			}
			
			jsonObject.mathadiDetails = JSON.stringify(mathadiDetailsArray);
			jsonObject.warfareAmount  = $('#warfare').val();
			
			let warfareLeavyAmt = $('#warfare').val() * loadingPercentAmt ;
			jsonObject.warfareLeavyAmt = warfareLeavyAmt;

			return jsonObject;
		}, searchLhpvDetails : function(obj) {
			
		}, showPrint : function (mathadiNumberId,mathadiNumber) {
			window.open('MathadiCalculation.do?pageId=340&eventId=10&modulename=mathadiCalculationPrint&masterid='+mathadiNumberId+'&masterid1='+mathadiNumber+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});

$('input[type="checkbox"]').change(function() {
	let anyChecked = $('input[type="checkbox"]:checked').length > 0;
	$('#saveRate').prop('disabled', !anyChecked);
});

function validateAndAppendTon(inputElement) {
	let inputValue = inputElement.value;
	inputValue = inputValue.replace(/[^0-9.]+/g, '');

	let decimalCount = (inputValue.match(/\./g) || []).length;

	if (decimalCount > 1) {
		inputValue = inputValue.substring(0, inputValue.lastIndexOf('.'));
	}

	let parts = inputValue.split('.');

	if (parts[1] && parts[1].length > 3) { // Check if more than 3 digits after decimal
		parts[1] = parts[1].slice(0, 3); // Limit to 3 digits after decimal
		inputValue = parts.join('.');
	}

	inputElement.value = inputValue;
}