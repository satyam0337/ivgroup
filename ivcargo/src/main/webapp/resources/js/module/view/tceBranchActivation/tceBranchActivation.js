define(['marionette'
	, 'selectizewrapper'
	,'/ivcargo/resources/js/blockenablebooking/commonfunctionblockenable.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	//, PROJECT_IVUIRESOURCES + '/resources/js/blockenablebooking/blockbooking.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation'
/*	, 'blockbooking'*/
],
	function(Marionette, Selectizewrapper, blockbooking, UrlParameter) {
		'use strict';

		let jsonObject = new Object(), _this = '', map, branchId, sourceBranchObj, selectedCity, sourceBranchPin, modal1 = null,
		branchDetailsFound = false, removeCurrentPickupAndDropRow = null, removeCurrentPincodeRow = null, isActiveTCEBranch = false, slabs = null,
		branchPincodeList = null, remark, maxRate, maxDropRate;
		
		return Marionette.LayoutView.extend({
			initialize: function() {
				_this = this;
			}, render: function() {
				branchId = UrlParameter.getModuleNameFromParam(MASTERID);
				_this.loadBranchActivationWizards();
				alertify.set('notifier', 'position', 'top-right');
			}, loadBranchActivationWizards: function() {
				let jObject = new Object();
				getJSON(jObject, WEB_SERVICE_URL + '/branchActivationWS/loadBranchActivationWizards.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			}, setElements: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				let blockEnableBookingHtml = new $.Deferred();
				loadelement.push(baseHtml);
				loadelement.push(blockEnableBookingHtml);

				$("#mainContent").load("/ivcargo/html/module/tceBranchActivation/tceBranchActivation.html", function() {
					baseHtml.resolve();
				});
				
				$("#modalContentBlockEnable").load("/ivcargo/html/module/blockEnableBooking/blockEnableBookingModal.html", function() {
					blockEnableBookingHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					initialiseFocus();
					_this.setActiveBranch(response);
					_this.setRouteDestinationBranchesSelection(response);
					_this.getSlabsOfBranch();
					_this.setupEventHandlers();

					maxRate			= response.maxRate;
					maxDropRate		= response.maxDropRate;
					
					if(branchId > 0) {
						_this.getBranchDetailsById(branchId);
						_this.getBranchPincodeList(branchId);
						$('#pickupAndDropBranch').val(2); 
						_this.showPickupDropRate();
					}

					_this.disableBranchDetails();
					_this.disableEtaFieldsAndButtons();
					_this.showStep(1);
					_this.addNewRow();
					//_this.addNewRowForPincode();
					_this.setValidTime();

					//$('#form-step-1').find('input').prop('disabled', true);

					$('#addNewPickupDropRow').click(function() {
						_this.addNewRow();
					});

					$('#addNewPincodeRow').click(function() {
						_this.addNewRowForPincode();
					});

					$('#savePickupRate').click(function() {
						_this.saveAndNext();
					});

					$('#saveServicablePincode').click(function() {
						_this.addPincodeData();
					});

					$('#etaSave').click(function() {
						_this.saveBranchDistanceDetails();
					});
					
					$('#submitBlockBooking').on('click', function() {
						blockbooking.blockBookingLegDetails();
					 });
					 
					  $('#blockReason').on('input', function() {
						  var currentLength = $(this).val().length;
						  $('#charCount').text(currentLength + '/500 characters used');
					  });
					 
					 $('#submitEnableBooking').on('click', function() {
						blockbooking.enableBookingLegDetails();
					 });
					 
					  $('#enableReason').on('input', function() {
						  var currentLength = $(this).val().length;
						  $('#enableCharCount').text(currentLength + '/500 characters used');
					  });

					$('#saveBranchDetails').click(function() {
						if (_this.validateOnsaveBranchDetails())
							_this.saveBranchDetails();
					});

					_this.bindEventOnNextPrevTab();

					$('#pickupAndDropBranch').change(function() {
						_this.showPickupDropRate();
					});

					$('#activateBranch').click(function() {
						if(!branchDetailsFound) {
							showMessage('error', 'Branch Details not Found !');
							return;
						}
						
						if(isActiveTCEBranch) {
							showMessage('warning', 'Branch is already Active !');
							return;
						}
						
						_this.getCityListFromTCE();
					});

					$('#etaCity').change(function() {
						selectedCity = $(this).val();
					});

					$('#finalSave').click(function() {
						_this.activateBranchInTCE();
					});

					$('#destinationBranch').change(function() {
						 _this.viewRouteWiseRates();
					});

					$('#selectBranch').change(function() {
						$('#pickupAndDropDataTable tbody').html('')
						_this.addNewRow()						

						let	optionValue = $(this).val();
						
						if (optionValue == 0) {
							$('#form-step-2').find('input').prop('disabled', true)
							$('#form-step-2').find('select').prop('disabled', true)
							$('#form-step-1').find('input').val('')
							$('#pickupAndDropBranch').prop('disabled', true)
						} else {
							$('#form-step-2').find('input').prop('disabled', false)
							$('#form-step-2').find('select').prop('disabled', false)
							$('#pickupAndDropBranch').prop('disabled', false)
						}

						_this.getBranchDetailsById(optionValue);
						_this.getBranchPincodeList(optionValue);
						$('#pickupAndDropBranch').val(2); 
						_this.showPickupDropRate();

						_this.resetForm('form-step-2')
						_this.resetForm('form-step-3')
						_this.resetForm('form-step-4')
						_this.resetForm('form-step-5')
							/*$('[id^="save"]').click(function() {
								let form = $(this).closest("form");
								form[0].reset();
							});*/
					});
					
					$('#editBranchDetails').click(function() {
						if (Number($('#selectBranch').val()) > 0) {
							_this.enableBranchDetails();
							$('#cancelBranchDetails').removeClass('hide');
							$('#editBranchDetails').addClass('disabled');
							$('#saveBranchDetails').removeClass('disabled');
							$('.item-close-svg').css('display', 'block');
						} else {
							showMessage('error', "Please Select Branch !!");
							_this.disableBranchDetails();
							$('#cancelBranchDetails').addClass('hide');
							$('#saveBranchDetails').addClass('disabled');
						}
					});
					
					$('#cancelBranchDetails').click(function() {
						_this.disableBranchDetails();
						$('#cancelBranchDetails').addClass('hide');
						$('#editBranchDetails').removeClass('disabled');
						$('#saveBranchDetails').addClass('disabled');
						$('.item-close-svg').css('display', 'none');
					});

					$('#editETA').click(function() {
						if(Number($('#selectBranch').val()) == 0)
							showMessage('error', "Please Select Branch !!");
						else if($('#etaDestBranch').val() == undefined || $('#etaDestBranch').val() == 0)
							showMessage('error', "Please Select Destination Branch !!");
						else
							_this.enableEtaDetailsFields();
					});
					
					$('#cancelETA').click(function() {
						_this.disableEtaFieldsAndButtonsAfterSave();
					});

						//For Select Multiple Days 
					_this.createMultiselectOptionForDays();
					
						// For latitude and longitude 
					
					$('.showMapButton').click(function() {
						$('#map-container').css('display', 'block');
						let latitude	= $('#latitude').val();
						let longitude	= $('#longitude').val();
						
						if(Number(latitude) <= 0 || Number(longitude) <= 0) {
							let jObject = new Object();
							
							if (/^\d{6}$/.test($('#branchPinCode').val())) {
								jObject["pincode"] = $('#branchPinCode').val();
								getJSON(jObject, WEB_SERVICE_URL + '/branchActivationWS/getLatLongViaPinCode.do?', _this.setLatitudeLongtude, EXECUTE_WITHOUT_ERROR);
							} else
								showMessage('info', 'Please select Source Branch Pincode first !');
						} else
							_this.initMap1(latitude, longitude);
					});
					
					$('#saveAllBtn2').off('click').on('click', function(event) {
						event.preventDefault();
						_this.saveAll()
					});
					
					$('#saveAllBtn').off('click').on('click', function(event) {
						 event.preventDefault();
						 _this.saveAll()
					});
				});
			}, initMap1 :function (latitude, longitude) {
				let branchLocationData = new Object();
				branchLocationData.latitude = latitude;
				branchLocationData.longitude = longitude;
					// Store data in localStorage
					localStorage.setItem('branchLocationData', JSON.stringify(branchLocationData));
				//var newWindow = window.open('Mappls.do?pageId=340&eventId=14&modulename=mapplsMapSearch', '_blank', 'width=400,height=400');	
				
				var newWindow = window.open(
				  'Mappls.do?pageId=340&eventId=14&modulename=mapplsMapSearch', 
				  '_blank', 
				  `width=${screen.availWidth},height=${screen.availHeight}`
				);
		
				
				/* map = new mappls.Map('map', {
	
				});
				map.addListener('load', function() {
					map.setCenter({lat: parseFloat(latitude),lng: parseFloat(longitude)});
				});
				 map.addListener('click', function(e) {
					var lngLat = e.lngLat;
					console.log('lngLat :: ', lngLat);
					$('#latitude').val(lngLat.lat);
					$('#longitude').val(lngLat.lng);
				  });*/
				
			}, setLatitudeLongtude : function (response) {
				var pincodes = response.pincodeDetails;
				console.log('pinscc ', pincodes);
				if(pincodes != undefined && pincodes != null && pincodes.length > 0 )
				_this.initMap1(pincodes[0].latitude, pincodes[0].longitude);
				else{
					showMessage('info', 'Please select proper Latitude & Longitude Values Or Proper Pincode !');
				}
					
				  
			}, disableEtaFieldsAndButtons: function() {
				$('#editETA').addClass('disabled');
				$('#etaSave').addClass('disabled');
				$('#etaDistance').prop('disabled', true);
				$('#etaHours').prop('disabled', true);
			}, enableEtaDetailsFields : function() {
				$('#etaDistance').prop('disabled', false);
				$('#etaHours').prop('disabled', false);
				$('#etaSave').removeClass('disabled');
				$('#cancelETA').removeClass('hide');
				$('#editETA').addClass('hide');
			}, disableEtaFieldsAndButtonsAfterSave : function() {
				$('#cancelETA').addClass('hide');
				$('#etaDistance').prop('disabled', true);
				$('#etaHours').prop('disabled', true);
				$('#etaSave').addClass('disabled');
				$('#editETA').removeClass('hide');
				$('#editETA').removeClass('disabled');
			}, getBranchDetailsById: function(branchId) {
				branchDetailsFound	= false;
				isActiveTCEBranch	= false;
				
				let jObject = new Object();
				jObject.sourceBranchId = branchId;
				getJSON(jObject, WEB_SERVICE_URL + '/branchActivationWS/getBranchDetails.do?', _this.setBranchDetails, EXECUTE_WITH_NEW_ERROR);
			}, disableBranchDetails : function() {
				$('#form-step-1').find('input').prop('disabled', true);
				$('#latitudeLongitude').prop('disabled', true)
				$('.btn-container').find('button').hide()
				$('.input-container').css('background-color', '#e9ecef');
			}, enableBranchDetails : function() {
				$('#form-step-1').find('input').prop('disabled', false);
				$('#latitudeLongitude').prop('disabled', false)
				$('.btn-container').find('button').show()
				$('.input-container').css('background-color', 'white');
			}, bindEventOnNextPrevTab : function() {
				$('#branchDetailsStep, #routeWiseRateStep, #pickupDropRateStep, #pincodeStep,' + 
				'#etaStep, #secondPrev, #thirdPrev, #fourthPrev, #fifthPrev, #firstNext, #secondNext, #thirdNext, #fourthNext').click(function() {
					_this.switchTabs(this);
				});
			}, switchTabs : function(obj) {
				if($('#selectBranch').val() <= 0) {
					$('#selectBranch').focus();
					showMessage('error', 'Please select branch first !');
					return;
				}
						
				switch(obj.id) {
				  case 'branchDetailsStep':
					_this.showStep(1);
					break;
				  case 'routeWiseRateStep':
					_this.showStep(2);
					break;
				  case 'pickupDropRateStep':
					_this.showStep(3);
					break;
				  case 'pincodeStep':
					_this.showStep(4);
					break;
				  case 'etaStep':
					_this.showStep(5);
					break;
				  case 'secondPrev':
					_this.prevStep(2);
					break;
				  case 'thirdPrev':
					_this.prevStep(3);
					break;
				  case 'fourthPrev':
					_this.prevStep(4);
					break;
				  case 'fifthPrev':
					_this.prevStep(5);
					break;
				  case 'firstNext':
					_this.nextStep(1);
					break;
				  case 'secondNext':
					_this.nextStep(2);
					break;
				  case 'thirdNext':
					_this.nextStep(3);
					break;
				  case 'fourthNext':
					_this.nextStep(4);
					break;
				  default:
					break;
				}
			}, setRouteDestinationBranchesSelection: function(data) {
				let activeBranchList = data.activeBranchList;

				Selectizewrapper.setAutocomplete({
					jsonResultList: activeBranchList,
					valueField: 'branchId',
					labelField: 'branchName',
					searchField: 'branchName',
					elementId: 'etaDestBranch',
					maxItems: 1,
					onChange: _this.getDistanceBySourceDestination
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList: activeBranchList,
					valueField: 'branchId',
					labelField: 'branchName',
					searchField: 'branchName',
					elementId: 'destinationBranch',
					maxItems: 1
				});

				$('#destinationBranch').prop('disabled', false);
			}, saveAll: function() {
				let allRowsData = [];
				let valid = true;
				
				if ($('#destinationBranch').val() == undefined || $('#destinationBranch').val() == 0) {
					showMessage('error', "Please Select Destination Branch !!");
					return;
				}
				
				$('#routeRatesTableTr tr').each(function() {
					let rateInput			= $(this).find('input[type="text"]');
					let rateActualInput		= $(this).find('input[type="hidden"]');
					let switchCheckbox		= $(this).find('input[type="checkbox"]');
					let slabMasterId		= rateInput.attr('id').split('_')[1];

					let rate = rateInput.val();
					
					if (rate == "") {
						showMessage('error', 'Please, Enter rate for all rows!');
						valid = false;
						return false;
					}
					
					let rateValue = Number(rate);
					
					if (rateValue > maxRate) {
						showAlertMessage('error', 'Rate cannot exceed ' + maxRate + ' Rs !');
						valid = false;
						return false; 
					}

					let jsonObject = {
						branchId: $('#selectBranch').val(),
						destinationBranchId: $('#destinationBranch').val(),
						slabMasterId: slabMasterId,
						rate: rate,
						isReverseRate: switchCheckbox.prop('checked')
					};

					allRowsData.push(jsonObject);
					rateActualInput.val(rate);	// Update actual rate
				});

				if (valid && allRowsData.length > 0) {
					// Call your save function with all rows data
					_this.saveAllRouteWiseSlabRates(allRowsData);
				}
			}, saveAllRouteWiseSlabRates: function(allRowsData) {
				let jsonObject = {
					allRowsData: JSON.stringify(allRowsData)
				};
				// Implement your AJAX request here to save all data
				getJSON(jsonObject, WEB_SERVICE_URL + '/tceRateMasterWS/insertAndUpdateAllRateDetails.do?', _this.setResponseAfterSavingAll, EXECUTE_WITH_NEW_ERROR);

			}, setResponseAfterSavingAll: function(response) {

			},setActiveBranch: function(response) {
				Selectizewrapper.setAutocomplete({
					jsonResultList: response.activeBranchList,
					valueField: 'branchId',
					labelField: 'branchName',
					searchField: 'branchName',
					elementId: 'selectBranch',
					create: false,
					maxItems: 1
				});
				
				$('#selectBranch').prop('disabled', false);

				if (branchId != undefined && branchId != null && branchId > 0) {
					$('#selectBranch').prop('disabled', true);
					$('#selectBranch').val(branchId);
					let $select		= $("#selectBranch").selectize();
					let selectize	= $select[0].selectize;
					var option			= selectize.options[ branchId ];
					$('#controlinput_selectBranch').val(option.branchName)
					$('#controlinput_selectBranch').attr("style", "width:100%");
					selectize.disable();
				}
			}, setBranchDetails: function(response) {
				_this.resetBranchDetails();
				sourceBranchObj			= response.branchDetails;

				if(sourceBranchObj != undefined) {
					branchDetailsFound	= true;
					isActiveTCEBranch	= response.isActiveTCEBranch;
					$('#contactPersonName').val(sourceBranchObj.branchContactDetailContactPersonName);
					$('#BAddress').val(sourceBranchObj.branchAddress);
					$('#branchPinCode').val(sourceBranchObj.branchAddressPincode);
					$('#mobileNumber').val(sourceBranchObj.branchContactDetailMobileNumber);
					if (response.isActiveTCEBranch) {
						$('#activateBranch').addClass('hide');
						$('#deActivateBranch').removeClass('hide');
					} else {
						$('#activateBranch').removeClass('hide');
						$('#deActivateBranch').addClass('hide');
					}


					if(sourceBranchObj.latitude != undefined && sourceBranchObj.latitude !== 'NaN')
						$('#latitude').val(sourceBranchObj.latitude);
						
					if(sourceBranchObj.longitude != undefined && sourceBranchObj.longitude !== 'NaN')
						$('#longitude').val(sourceBranchObj.longitude);
						
					if (sourceBranchObj.workingHours != undefined) {
						let timeArray = sourceBranchObj.workingHours.split(" - ");
						$('#startTime').val(timeArray[0]);
						$('#endTime').val(timeArray[1]);
					}
					
					if (sourceBranchObj.workingDays != undefined)
						$('#workingDays').val(sourceBranchObj.workingDays.split(',')).trigger('change');

					$('.mult-select-tag').html('')
					new MultiSelectTag('workingDays');
					$('.item-close-svg').css('display', 'none');
				}

				_this.disableBranchDetails();
				_this.settoggleReadOnly('#form-step-1');
			}, resetBranchDetails : function() {
				$('#workingDays').val('');
				$('#startTime').val('');
				$('#endTime').val('');
				$('#contactPersonName').val('');
				$('#BAddress').val('');
				$('#branchPinCode').val('');
				$('#mobileNumber').val('');
				$('#latitude').val('');
				$('#longitude').val('');
				$('#editBranchDetails').removeClass('disabled');
				$('#cancelBranchDetails').addClass('hide');
				$('#saveBranchDetails').addClass('disabled');
			}, settoggleReadOnly: function(formselector) {
				const inputFields = document.querySelectorAll('' + formselector + ' input');

				inputFields.forEach(inputField => {
					inputField.readOnly = inputField.value.trim() !== '';
				});

				const editButton = document.getElementById('editBranchDetails');

				if (editButton != undefined && editButton != null) {
					editButton.addEventListener('click', function() {
						inputFields.forEach(inputField => {
							inputField.readOnly = false;
						});
					});
				}
			}, nextStep: function(currentStep) {
				const currentForm = $(`#form-step-${currentStep}`);
				const nextForm = $(`#form-step-${currentStep + 1}`);

				currentForm.removeClass("current-step");
				nextForm.addClass("current-step");

				_this.showStep(currentStep + 1);
			}, showStep: function(step) {
				const forms = $(".form-step");
				const tabs = $(".tab");

				forms.removeClass("current-step");
				tabs.removeClass("active");

				$(`#form-step-${step}`).addClass("current-step");
				tabs.eq(step - 1).addClass("active");
			}, prevStep: function(currentStep) {
				$(`#form-step-${currentStep}`).removeClass("current-step");
				$(`#form-step-${currentStep - 1}`).addClass("current-step");
				_this.showStep(currentStep - 1);
			}, getSlabsOfBranch: function() {
				jsonObject.accountGroupId = 0;

				getJSON(jsonObject, WEB_SERVICE_URL + '/slabMasterWS/getSlabsForGroup.do?', _this.setSlabs, EXECUTE_WITHOUT_ERROR);
			}, setSlabs: function(response) {
				slabs = response.SlabMaster;
				$('#tableHeader').removeClass('hide');
				let tbody = $('#routeRatesTableTr');

				tbody.empty();
				
				let index	= 0;
				
				slabs.forEach((slab) => {
					let tr = $('<tr>');
				
					let td1 = $('<td>').text(index + 1); 
					let td2 = $('<td>').text(slab.range);
				
					//let rateInput = $('<input id="rate_' + slab.slabMasterId + '" type="text" class="form-control routeRates" value="0"	max: 20 onkeypress="return validateFloatKeyPress(event, this);" maxlength="7" data-tooltip="Rate">');
				
					let rateInput = $('<input>', {
						id: "rate_" + slab.slabMasterId,
						type: "text",
						class: "form-control routeRates",
						value: "0",
						max: maxRate, 
						onkeypress: "return validateFloatKeyPress(event, this);",
						maxlength: 7,
						"data-tooltip": "Rate"
					});
					let rateActualInput = $('<input type="hidden" value="0">');
				
					let div				= $("<div>", {class: "form-check form-switch"});
					let switchCheckbox	= $("<input>", {class: "form-check-input"});
				
					switchCheckbox.attr("type", "checkbox");
					switchCheckbox.attr("id", "flexSwitchCheckDefault_" + slab.slabMasterId);
					switchCheckbox.attr("data-tooltip", "Reverse Rate");
					switchCheckbox.prop("checked", false);

					let td3 = $('<td>').append(rateInput, rateActualInput);
					
					div.append(switchCheckbox);
					
					let td4 = $('<td>').append(div);
				
					var editButton = $('<a class="btn btn-info" href="#"><i class="fas fa-edit"></i> Edit</a>');
					
					editButton.click(function(e) {
						e.preventDefault();
						rateInput.prop('disabled', false);
					});

					let td5 = $('<td>').append(editButton);
				
					var saveButton = $('<a class="btn btn-success" href="#"><i class="fas fa-check"></i> Save</a>');
			
					$(saveButton).click(function(e) {
						e.preventDefault();
						
						
						if(!_this.validateBranchForRouteWiseRates())
							return;
						
						
						let rateValue = Number(rateInput.val());
						
						if (rateValue > maxRate) {
							showAlertMessage('error', 'Rate cannot exceed ' + maxRate + ' Rs !');
							return;
						}
											
						let jsonObject = {
							sourceBranchId			: $('#selectBranch').val(),
							destinationBranchId		: $('#destinationBranch').val(),
							slabMasterId			: slab.slabMasterId,
							rate					: rateInput.val(),
							isReverseRate			: switchCheckbox.prop('checked'),
						};
						
						
					/*	if(rateInput.val() == "" || rateInput.val() == 0) {
							showAlertMessage('error', 'Please, Enter rate !');
							return;
						}*/

						if (!_this.isRateChanged(rateInput.val(), rateActualInput.val()) || Number(rateInput.val()) === 0 || rateInput.val() === "") {
							
							if (rateInput.val() === "") {
								rateInput.val("0");
							}
							_this.saveRouteWiseSlabRateWithObj(jsonObject);
							rateActualInput.val(rateInput.val());
							rateInput.prop('disabled', true);
						}
					});
				
					let td6 = $('<td>').append(saveButton);
				
					tr.append(td1, td2, td3, td4, td5, td6);
				
					tbody.append(tr);
					index = index+ 1;
				});
				
				$('.form-check-input').css('width', '5em').css('height','3em');
				
				_this.setBlankIfZero();
				_this.setZeroIfBlank();
				
				$('#editAllRates').off('click').on('click', function(e) {
					e.preventDefault();
					$('.routeRates').prop('disabled', false);
				});

			}, isRateChanged: function(rate, rateActual) {
				rate = rate === "" ? "0" : rate;
				rateActual = rateActual === "" ? "0" : rateActual;
				return Number(rateActual) == Number(rate);
			}, validatePickupBranch : function() {
				if (!validateInputTextFeild(1, 'selectBranch', 'selectBranch', 'error', 'Select Branch !'))
					return false;
					
				/*if (!validateInputTextFeild(1, 'pickupAndDropBranch', 'pickupAndDropBranch', 'error', 'Select Pickup or Drop	!'))
					return false;*/
				
				return true;
			}, saveAndNext: function() {
				_this.savePickupDropRate();
			}, savePickupDropRate: function() {
				if(!_this.validatePickupBranch())
					return;

				showLayer();

				let jsonObject = {};
				let dataArray = [];
				let isValid = _this.validateAndGetRouteRates(dataArray);

				if (!isValid) { hideLayer(); return; }

				if (dataArray.length == 0) {
					hideLayer();
					showMessage('error', 'Please enter rate !');
					return;
				}

				jsonObject = {};

				
				jsonObject.dataArray = JSON.stringify(dataArray);		

				getJSON(jsonObject, WEB_SERVICE_URL + '/tceRateMasterWS/insertPickupAndDropRateDetails.do?', _this.setResponse, EXECUTE_WITH_NEW_ERROR);
			}, validateAndGetRouteRates : function(dataArray) {
				let isValid	= true;
				
				$("#pickupAndDropDataTable tbody tr").each(function() {
					let rateMasterId	= $(this).find("td:eq(0) input[type='text']").val();
					let minWeight		= Number($(this).find("td:eq(1) input[type='text']").val());
					let maxWeight		= Number($(this).find("td:eq(2) input[type='text']").val());
					let minRange		= Number($(this).find("td:eq(3) input[type='text']").val());
					let maxRange		= Number($(this).find("td:eq(4) input[type='text']").val());
					let rate			= Number($(this).find("td:eq(5) input[type='text']").val());
					let etaHours		= Number($(this).find("td:eq(6) input[type='text']").val());


					 let isFixedRate = $(this).find('input:checkbox').is(':checked');

					if (minWeight > maxWeight || minWeight == maxWeight) {
						isValid = false;
						showMessage('error', 'Minimum weight cannot be same or more than Maximum weight !');
						return false;
					}

					if (minRange > maxRange || minRange == maxRange) {
						isValid = false;
						showMessage('error', 'Minimum KM cannot be same or more than Maximum KM !');
						return false;
					}
					
					if(rate < 0) {
						isValid = false;
						showMessage('error', 'Please enter rate !');
						return false;
					}

					if (!isFixedRate && rate > maxDropRate) {
						isValid = false;
						showMessage('error', 'Rate cannot exceed ₹ ' + maxDropRate + ' unless fixed rate is checked!');
						return false;
					}
					
					if(etaHours <= 0) {
						isValid = false;
						showMessage('error', 'Please enter Eta Hour !');
						return false;
					}
					
					// Check for conflicting distance range
					for (let i = 0; i < dataArray.length; i++) {
						let processedRange = dataArray[i];
				
						if (((minWeight >= processedRange.minWeight && minWeight <= processedRange.maxWeight) ||
							(maxWeight >= processedRange.minWeight && maxWeight <= processedRange.maxWeight)) &&
							((minRange >= processedRange.minKm && minRange <= processedRange.maxKm) ||
							(maxRange >= processedRange.minKm && maxRange <= processedRange.maxKm))) {
							isValid = false;
							showMessage('error', 'Conflicting weight and distance ranges detected!');
							return false; // Exit the loop
						}
					}
				
					if(!isValid)
						return false; // Exit the loop

					let jsonObject	= {};

					jsonObject.sourceBranchId		= $('#selectBranch').val();
					//jsonObject.rateTypeId				= $('#pickupAndDropBranch').val();
					jsonObject.rateTypeId			= 2; //drop
					jsonObject.rateMasterId			= rateMasterId;
					jsonObject.minWeight			= minWeight;
					jsonObject.maxWeight			= maxWeight;
					jsonObject.minKm				= minRange;
					jsonObject.maxKm				= maxRange;
					jsonObject.rate					= rate;
					jsonObject.etaHours				= etaHours;
					jsonObject.isFixedRate			= $(this).find('input:checkbox').is(':checked');


					if ((minWeight >= 0 && maxWeight > 0 || minRange > 0 && maxRange > 0) && rate >= 0)
						dataArray.push(jsonObject);
				});
					
				return isValid;
			}, saveRouteWiseSlabRateWithObj: function(jsonObject) {
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/tceRateMasterWS/insertAndUpdateRateDetails.do?', _this.setResponse, EXECUTE_WITH_NEW_ERROR);
			}, validateBranchForRouteWiseRates : function() {
				let destBranch = $('#destinationBranch').val();

				if(destBranch == '') {
					showMessage('error', 'Please, Select Destination First !');
					return false;
				}
				
				if($('#selectBranch').val() == destBranch) {
					showMessage('error', "Please, Select Different Branch from above selected Branch !");
					return false;
				}
				
				return true;
			}, viewRouteWiseRates: function() {
				if(!_this.validateBranchForRouteWiseRates())
					return;
					
				showLayer();
				
				let jsonObject = {};

				jsonObject.sourceBranchId		= $('#selectBranch').val();
				jsonObject.destinationBranchId	= $('#destinationBranch').val();

				getJSON(jsonObject, WEB_SERVICE_URL + '/tceRateMasterWS/viewAllRouteRates.do?', _this.setRouteWiseRates, EXECUTE_WITH_NEW_ERROR);
			}, setRouteWiseRates: function(response) {
				let rateList = response.rateList;
				
				if(rateList != undefined) {
					slabs.forEach((slab) => {
						let slabMasterId	= slab.slabMasterId;
						
						$('#rate_' + slabMasterId).val(0);
						$('#flexSwitchCheckDefault_' + slabMasterId).prop('checked', false);
						
						rateList.forEach((routeRate) => {
							if(slabMasterId == routeRate.slabMasterId)
								$('#rate_' + slabMasterId).val(routeRate.rate);
						});
					});
				} else {
					slabs.forEach((slab) => {
						$('#rate_' + slab.slabMasterId).val(0);
						$('#flexSwitchCheckDefault_' + slab.slabMasterId).prop('checked', false);
					});
				}
			}, setResponse: function(response) {
				hideLayer();
				
				_this.disableEtaFieldsAndButtonsAfterSave();
				
				if(modal1 != null && $('#routeRatesDetail tr').length == 1)
					modal1.hide();
				
				$("#fixChargeEle").prop("checked", false);
			}, validatePincode: function(destinationPincode) {
				let jsonObject = new Object();
				
				let branchDetailPin = $('#branchPinCode').val();
				
				if(destinationPincode == undefined || destinationPincode <= 0) {
					showMessage("error", "Please Enter pincode!"); 
					return;
				}
				
				if(sourceBranchPin > 0)
					jsonObject["fromPincode"] = sourceBranchPin;
				
				if(branchDetailPin > 0)
					jsonObject["fromPincode"] = branchDetailPin;
				else {
					showMessage("error", "Please Enter pincode In Branch Details!");
					return;
				}

				jsonObject["fromPincode"] = 380004;//sourceBranchObj.branchAddressPincode
				jsonObject["toPincode"] = destinationPincode;

				if (/^\d{6}$/.test($('#pincode0').val())) {
					getJSON(jObject, WEB_SERVICE_URL + '/branchActivationWS/getFromAndToPincodeDistance.do?', _this.setDistance, EXECUTE_WITHOUT_ERROR);
				}
			}, setDistance : function(response) {
				$('#distance').val(response.distance);
			}, saveBranchDetails: function() {
				let jsonObject = {};

				jsonObject.branchId								= $('#selectBranch').val();
				jsonObject.branchContactDetailContactPersonName = $('#contactPersonName').val();
				jsonObject.branchAddress						= $('#BAddress').val();
				jsonObject.branchAddressPincode					= $('#branchPinCode').val();
				jsonObject.branchContactDetailMobileNumber		= $('#mobileNumber').val();
				jsonObject.latitude								= $('#latitude').val();
				jsonObject.longitude							= $('#longitude').val();
				jsonObject.workingHours							= $('#startTime').val() + " - " + $('#endTime').val();
				
				if ($('#workingDays').val().join(",").indexOf("-1") !== -1) {
					jsonObject.workingDays							= "1,2,3,4,5,6,7";
				} else{
					jsonObject.workingDays							= $('#workingDays').val().join(",");
				}
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/updateBranchDetailsByBranchId.do?', _this.setResponseAfterUpdateDetails, EXECUTE_WITH_NEW_ERROR);
			}, setResponseAfterUpdateDetails : function(response) {
				_this.setResponse(response);
				_this.disableBranchDetails();
				$('#cancelBranchDetails').addClass('hide');
				$('#editBranchDetails').removeClass('disabled');
				$('#saveBranchDetails').addClass('disabled');
				_this.getBranchDetailsById($('#selectBranch').val());
			}, validateOnsaveBranchDetails: function() {
				if (!validateInputTextFeild(1, 'selectBranch', 'selectBranch', 'error', 'Select Branch !'))
					return false;
					
				if (!validateInputTextFeild(1, 'contactPersonName', 'contactPersonName', 'error', 'Enter Contact Person Name !'))
					return false;
					
				if (!validateInputTextFeild(1, 'branchAddress', 'branchAddress', 'error', 'Enter Address !'))
					return false;
					
				if (!validateInputTextFeild(1, 'branchPinCode', 'branchPinCode', 'error', 'Enter Pincode !')
				|| !validateInputTextFeild(11, 'branchPinCode', 'branchPinCode', 'error', 'Enter Valid Pincode !'))
					return false;
					
				if (!validateInputTextFeild(1, 'mobileNumber', 'mobileNumber', 'error', 'Enter Mobile Number !'))
					return false;
					
				if (!validateInputTextFeild(1, 'latitude', 'latitude', 'error', 'Enter Latitude !')
				|| !validateInputTextFeild(1, 'longitude', 'longitude', 'error', 'Enter Longitude !'))
					return false;
					
				if (!validateInputTextFeild(1, 'startTime', 'startTime', 'error', 'Enter Start Time !')
				|| !validateInputTextFeild(1, 'endTime', 'endTime', 'error', 'Enter End Time !'))
					return false;
					
				if (!validateInputTextFeild(1, 'workingDays', 'workingDays', 'error', 'Select Working Days !'))
					return false;

				return true;
			}, isValidLongitude : function (latitude) {
				 return latitude >= -90 && latitude <= 90;
			}, isValidLongitude : function (longitude) {
				 return longitude >= -180 && longitude <= 180;
			}, getDistanceBySourceDestination : function() {
				$('#etaDistance').val('');
				$('#etaHours').val(''); 
				
				if (!validateInputTextFeild(1, 'selectBranch', 'selectBranch', 'error', 'Select Branch !'))
					return;
					
				if($('#selectBranch').val() == $('#etaDestBranch').val()) {
					showMessage('error', "This branch cannot be same as Above selected Branch !");
					return;
				}
					
				let jsonObject = {};

				jsonObject.fromBrachId	= $('#selectBranch').val();
				jsonObject.toBranchId	= $('#etaDestBranch').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchDistanceMapMasterWS/getDistanceBySourceDestination.do?', _this.setBranchDistanceMapDetail, EXECUTE_WITH_NEW_ERROR);
			}, setBranchDistanceMapDetail : function(response) {
				if(response.distance != undefined) {
					$('#etaDistance').val(response.distance);
					$('#etaHours').val(response.hours);
					//blockbooking.checkIfBlockDetailsExists(undefined);
				} else
					_this.enableEtaDetailsFields();
				
				$('#editETA').removeClass('disabled');
			}, getBranchDistanceDetails : function() {
				if (!validateInputTextFeild(1, 'selectBranch', 'selectBranch', 'error', 'Select Branch !'))
					return;
					
				let jsonObject = {};

				jsonObject.sourceBranchId = $('#selectBranch').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchDistanceMapMasterWS/getDistanceDetailsBySourceId.do?', _this.setBranchDistanceMapDetails, EXECUTE_WITHOUT_ERROR);
			}, setBranchDistanceMapDetails : function(response) {
				$('#destBranch').val('');
				$('#etaDistance').val('');
				$('#etaHours').val('');
				
				if (response.message != undefined) {
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					return;
				}
				
				let banchDistanceList = response.braArrayList;

				let formGroup = $("#distanceTable");
				formGroup.empty();
				let table = $('<table class="table table-hover table-sm mt-2" id="branchDistanceDetails">');

				let jsonArray = [];

				jsonArray.push('<th class="header-cell">Sr. No.</th>');
				jsonArray.push('<th class="header-cell">Destination Branch</th>');
				jsonArray.push('<th class="header-cell">Hours</th>');
				jsonArray.push('<th class="header-cell">Distance</th>');
				jsonArray.push('<th class="header-cell">Edit</th>');
				jsonArray.push('<th class="header-cell">Save</th>');

				table.append('<tr>' + jsonArray.join(' ') + '</tr>');
				formGroup.append(table);

				let i = 1;

				banchDistanceList.forEach(obj => {
					jsonArray = [];
	
					let tr = $('<tr>');
					let td1 = $('<td class="bordered-cell">');
					let td2 = $('<td class="bordered-cell">');
					let td3 = $('<td class="bordered-cell">');
					let td4 = $('<td class="bordered-cell">');
					let td5 = $('<td class="bordered-cell">');
					let td6 = $('<td class="bordered-cell">');
	
					td1.append(i);
					td2.append(obj.destBranchName);
	
					let hoursInput					= $('<input type="text" class="form-control" value="' + obj.hours + '"disabled>');
					let distanceInput				= $('<input type="text" class="form-control" value="' + obj.distance + '"disabled>');
					let hoursOriginalInput			= $('<input type="hidden" value="' + obj.hours + '">');
					let distanceOriginalInput		= $('<input type="hidden" value="' + obj.distance + '">');
	
					td4.append(distanceInput);
					td4.append(distanceOriginalInput);

					td3.append(hoursInput);
					td3.append(hoursOriginalInput);
	
					let editbuttons = $("<button>");
					editbuttons.attr("class", "btn btn-outline-info");
					editbuttons.text("Edit");
	
					$(editbuttons).click(function() {
						hoursInput.prop('disabled', false);
						distanceInput.prop('disabled', false);
					});
	
					td5.append(editbuttons);
	
					let saveButton = $("<button>");
					saveButton.attr("class", "btn btn-outline-success");
					saveButton.text("Save");
	
					$(saveButton).click(function() {
						hoursInput.prop('disabled', true);
						distanceInput.prop('disabled', true);
						
						let jsonObject = {
							fromBrachId		: $('#selectBranch').val(),
							toBranchId		: obj.toBranchId,
							distance		: distanceInput.val(),
							hours			: hoursInput.val()
						};
	
						_this.isValueChanged(hoursOriginalInput.val(), distanceOriginalInput.val(), hoursInput.val(), distanceInput.val())
									
						if (!_this.isValueChanged(hoursOriginalInput.val(), distanceOriginalInput.val(), hoursInput.val(), distanceInput.val())) {
							_this.saveBranchDistanceDetailswithObj(jsonObject);
							hoursOriginalInput.val(hoursInput.val());
							distanceOriginalInput.val(distanceInput.val());
						} else {
							showMessage('error', 'Data Already Saved!');
						}
					});

					td6.append(saveButton);
	
					tr.append(td1);
					tr.append(td2);
					tr.append(td3);
					tr.append(td4);
					tr.append(td5);
					tr.append(td6);

					table.append(tr);
					i++;
				});

				formGroup.append(table);
			}, isValueChanged: function(originalHours, originalDistance, newHours, newDistance) {
				return Number(originalHours) == Number(newHours) && Number(originalDistance) == Number(newDistance);
			}, getCityListFromTCE: function() {
				let jsonObject = new Object();
				jsonObject.sourceBranchId = $('#selectBranch').val();
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/getCityListFromTCE.do?', _this.setCityList, EXECUTE_WITH_NEW_ERROR);
			}, setCityList : function(response) {
				hideLayer();
				
				if (response.message != undefined)
					return;
						
				Selectizewrapper.setAutocomplete({
					jsonResultList: response.cityList,
					valueField: 'cityId',
					labelField: 'name',
					searchField: 'name',
					elementId: 'etaCity',
					create: false,
					maxItems: 1
				});

				$('#staticBackdrop').modal('show');
			}, activateBranchInTCE: function() {
				if (!validateInputTextFeild(1, 'selectBranch', 'selectBranch', 'error', 'Select Branch !'))
					return false;
				
				let jsonObject = new Object();

				jsonObject["branchId"]	= $('#selectBranch').val();
				jsonObject["cityId"]	= selectedCity;
				jsonObject["stateId"]	= sourceBranchObj.stateId;
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/activateBranchInTCE.do?', _this.setResponseAfterActiveBranch, EXECUTE_WITH_NEW_ERROR);
			}, setResponseAfterActiveBranch : function(response) {
				hideLayer();
				$('#staticBackdrop').modal('hide');
				_this.setResponse(response);
				
				setTimeout(function() {
					location.reload();
				}, 100);
			}, saveBranchDistanceDetails() {
				let jsonObject = {};

				jsonObject.fromBrachId		= $('#selectBranch').val();
				jsonObject.toBranchId		= $('#etaDestBranch').val();
				jsonObject.distance			= $('#etaDistance').val();
				jsonObject.hours			= $('#etaHours').val();
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchDistanceMapMasterWS/saveDistanceDetails.do?', _this.setResponse, EXECUTE_WITH_NEW_ERROR);
			}, saveBranchDistanceDetailswithObj: function(jsonObject) {
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchDistanceMapMasterWS/saveDistanceDetails.do?', _this.setResponse, EXECUTE_WITH_NEW_ERROR);
			}, showPickupDropRate: function() {
				if(!_this.validatePickupBranch())
					return;
					
				let jsonObject = {};

				jsonObject.sourceBranchId	= $('#selectBranch').val();
				//jsonObject.rateTypeId			= $('#pickupAndDropBranch').val();
				jsonObject.rateTypeId		= 2;
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/tceRateMasterWS/viewAllPickupAndDropRates.do?', _this.viewAllPickupAndDropRates, EXECUTE_WITHOUT_ERROR);
			}, viewAllPickupAndDropRates : function(response) {
				hideLayer();
				let rateList = response.rateList;

				$('#pickupAndDropDataTable tbody').html('')
				
				if (rateList == undefined) {
					_this.addNewRow();
					return;
				}
				
				$("#pickupAndDropTr").find("tr:gt(0)").remove();

				let jsonArray = [];

				for (const element of rateList) {
					let obj = element;
					jsonArray = [];

					jsonArray.push('<td class="hide"><input type="text" id="rateMasterId" value="' + obj.rateMasterId + '" class="form-control"/></td>');
					jsonArray.push('<td><input type="text" id="minWeight" data-tooltip="Min Weight" value="' + obj.minWeight + '" class="minweightinput form-control" onkeypress="return validateFloatKeyPress(event, this);if(event.altKey==1){return false}" readonly/></td>');
					jsonArray.push('<td><input type="text" id="maxWeight" data-tooltip="Max Weight" value="' + obj.maxWeight + '" class="form-control" onkeypress="return validateFloatKeyPress(event, this);if(event.altKey==1){return false}" readonly/></td>');
					jsonArray.push('<td><input type="text" id="minKm" data-tooltip="Min KM" value="' + obj.minKm + '" class="form-control" onkeypress="return noNumbers(event);if(event.altKey==1){return false}" readonly/></td>');
					jsonArray.push('<td><input type="text" id="maxKm" data-tooltip="Max KM" value="' + obj.maxKm + '" class="form-control" onkeypress="return noNumbers(event);if(event.altKey==1){return false}" readonly/></td>');
					jsonArray.push('<td><input type="text" id="rate" data-tooltip="Rate" value="' + obj.rate + '" class="form-control" onkeypress="return validateFloatKeyPress(event, this);if(event.altKey==1){return false}"/></td>');
					jsonArray.push('<td><input type="text" id="etaHours1" data-tooltip="Hours" value="' + obj.etaHours + '" class="form-control" onkeypress="return noNumbers(event);if(event.altKey==1){return false}"/></td>');

					if (obj.isFixedRate)
						jsonArray.push('<td><input type="checkbox" id="isFixed" checked/></td>');
					else
						jsonArray.push('<td><input type="checkbox" id="isFixed" class=""/></td>');

					if(obj.rateMasterId == 0)
						jsonArray.push('<td><button type = "button" class = "removeCurrentRow btn btn-warning" data-tooltip="Remove">Remove</button></td>');
					else
						jsonArray.push('<td></td>');
					
					jsonArray.push('<td><button type = "button" id = "rate_' + obj.rateMasterId + '" class = "deleteRecords btn btn-danger">Delete</button></td>');

					$('#pickupAndDropDataTable tbody').append('<tr id="editInvoiceTr">' + jsonArray.join(' ') + '</tr>');
				}
				
				$('.deleteCurrentRow').removeClass('hide');

				$('.deleteRecords').click(function() {
					_this.deleteRecords((this.id).split("_")[1]);
					removeCurrentPickupAndDropRow	= $(this).closest('tr');
					//$(this).closest('tr').remove();
				});

				//_this.eventForCloneRow();
				_this.eventForRemoveRow();
			}, deleteRecords: function(rateMasterId) {
				showLayer();

				let jsonObject = {};

				jsonObject.rateMasterId = rateMasterId;

				getJSON(jsonObject, WEB_SERVICE_URL + '/tceRateMasterWS/deletePickupAndDropRates.do?', _this.setResponseAfterDeleteDropRate, EXECUTE_WITH_NEW_ERROR);
			}, addNewRow: function() {
				
				let jsonArray = [];

				jsonArray.push('<td class="hide"><input type="text" id="rateMasterId" value="0" class="form-control rateMasterId"/></td>');
				jsonArray.push('<td><input type="text" id="minWeight" data-tooltip="Min Weight" value="0" class="minweightinput form-control" onkeypress="return validateFloatKeyPress(event, this);if(event.altKey==1){return false;}" maxlength="7"/></td>');
				jsonArray.push('<td><input type="text" id="maxWeight" data-tooltip="Max Weight" value="0" class="form-control maxweightinput" onkeypress="return validateFloatKeyPress(event, this);if(event.altKey==1){return false;}" maxlength="7"/></td>');
				jsonArray.push('<td><input type="text" id="minKm" data-tooltip="Min KM" value="0" class="form-control minKm" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}" maxlength="7"/></td>');
				jsonArray.push('<td><input type="text" id="maxKm" data-tooltip="Max KM" value="0" class="form-control maxKm" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}" maxlength="7"/></td>');
				jsonArray.push('<td><input type="text" id="rate" data-tooltip="Rate" value="0" class="form-control rate" onkeypress="return validateFloatKeyPress(event, this);if(event.altKey==1){return false;}" maxlength="6"/></td>');
				jsonArray.push('<td><input type="text" id="etaHours1" data-tooltip="Hours" value="0" class="form-control etaHours" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}" maxlength="3"/></td>');
				jsonArray.push('<td><input type="checkbox" id="isFixed"/></td>');
				jsonArray.push('<td><button type = "button" class = "removeCurrentRow btn btn-warning" data-tooltip="Remove">Remove</button></td>');
				jsonArray.push('<td></td>');

				$('#pickupAndDropDataTable tbody').append('<tr>' + jsonArray.join(' ') + '</tr>');
				
				_this.setBlankIfZero();
				_this.setZeroIfBlank();
				
				_this.eventForRemoveRow();
			}, cloneCurrentRow: function(obj) {
				let $curRow = $(obj).closest('tr'),
					$newRow = $curRow.clone(true);
				$curRow.after($newRow);
			}, removeCurrentRow: function(obj) {
				let count = $('#pickupAndDropDataTable tbody tr').length;

				if (count < 2) {
					showMessage('warning', 'You cannot remove last row !');
					return;
				}

				$(obj).closest('tr').remove();
			}, eventForCloneRow: function() {
				$('.cloneCurrentRow').click(function() {
					_this.cloneCurrentRow(this);
				});
			}, eventForRemoveRow: function() {
				$('.removeCurrentRow').click(function() {
					_this.removeCurrentRow(this);
				});
			}, setBlankIfZero : function() {
				$('.minweightinput, .maxweightinput, .minKm, .maxKm, .rate, .etaHours, .routeRates').focus(function() {
					if(this.value == '0') this.value = '';
				});
			}, setZeroIfBlank : function() {
				$('.minweightinput, .maxweightinput, .minKm, .maxKm, .rate, .etaHours, .routeRates').blur(function() {
					clearIfNotNumeric(this,'0');
				});
			}, setResponseAfterDeleteDropRate : function(response) {
				if(!isError(response) && removeCurrentPickupAndDropRow != null) {
					removeCurrentPickupAndDropRow.remove();
					removeCurrentPickupAndDropRow	= null;
				}
					
				if($("#pickupAndDropDataTable tbody tr").length == 0)
					_this.addNewRow();
			}, setResponseAfterDeleteServiceablePincode : function(response) {
				hideLayer();
				
				if(!isError(response) && removeCurrentPincodeRow != null) {
					removeCurrentPincodeRow.remove();
					removeCurrentPincodeRow	= null;
				}
					
				if($("#pincodeTable tbody tr").length == 0)
					_this.addNewRowForPincode();
			}, getBranchPincodeList: function(branchId) {
				let jsonObject = new Object();
				jsonObject["configBranchId"] = branchId;
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchPincodeConfigurationWS/getBranchPincodeConfigByBranch.do?', _this.setBranchPincodeDetails, EXECUTE_WITH_NEW_ERROR);
			}, setBranchPincodeDetails : function(response) {
				hideLayer();

				let branchPincodeConfigList = response.branchPincodeConfigList;

				if (branchPincodeConfigList == undefined || branchPincodeConfigList.length == 0) {
					$('#pincodeTr').html('')
					
					if($("#pincodeTable tbody tr").length == 0)
						_this.addNewRowForPincode();
						
					return;
				}
				
				$("#pincodeTr").find("tr:gt(0)").remove();

				let jsonArray = [];
				$('#pincodeTr').html('')
				
				branchPincodeList = response.branchPincodeList;

				let datalistHtml = '<datalist id="pincodeList">';
				
				branchPincodeList.forEach((pinObj) => {
					datalistHtml += '<option value="' + pinObj.pincode + '">' + pinObj.pincode + '</option>';
				});
				
				datalistHtml += '</datalist>';
				$('body').append(datalistHtml);

				for (const element of branchPincodeConfigList) {
					let obj = element;

					jsonArray = [];
					
					if (obj.pincode != undefined && obj.pincode > 0 && obj.distance > 0  && obj.hours > 0) {

						let inputHtml = '<input list="pincodeList" class="form-control" value="' + obj.pincode + '" data-tooltip="Pincode">';

						jsonArray.push('<td>' + inputHtml + '</td>');
						jsonArray.push('<td><input type="text" id="hours" value="' + obj.hours + '" class="form-control" data-tooltip="Hours" maxlength="3" onkeypress="return noNumbers(event);if(event.altKey==1){return false}"/></td>');
						jsonArray.push('<td><input type="text" id="distance" value="' + obj.distance + '" class="form-control" data-tooltip="Distance" maxlength = "4" onkeypress="return noNumbers(event);if(event.altKey==1){return false}"/></td>');
						jsonArray.push('<td></td>');
						jsonArray.push('<td><button type = "button" id = "' + obj.branchPincodeConfigurationId + '" class = "deletePincodeData btn btn-danger">Delete</button></td>');

						$('#pincodeTr').append('<tr id="pincodeRowTr">' + jsonArray.join(' ') + '</tr>');
					}
				}

				$('.deletePincodeData').click(function() {
					_this.deletePincodeData(this.id);
					removeCurrentPincodeRow	= $(this).closest('tr');
					//$(this).closest('tr').remove();
				});
			}, addNewRowForPincode: function() {
				let jsonArray = [];

				let datalistHtml = '<datalist id="pincodeList">';
	
				if(branchPincodeList != undefined && branchPincodeList != null){
					branchPincodeList.forEach((pinObj) => {
						datalistHtml += '<option value="' + pinObj.pincode + '">' + pinObj.pincode + '</option>';
					});
		
					datalistHtml += '</datalist>';
				}
	
				// Append the datalist to the body if not already present
				if ($('#pincodeList').length === 0)
					$('body').append(datalistHtml);

				// Create an input field with the datalist for pincodes
				let inputHtml = '<input list="pincodeList" class="form-control pincode" data-tooltip="Pincode" placeholder="Pincode" maxlength="6" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}"/>';
			
				jsonArray.push('<td>' + inputHtml + '</td>');
				jsonArray.push('<td><input type="text" id="hours" value="" class="form-control hours" data-tooltip="Hours" placeholder="Hours" maxlength="3" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}"/></td>');
				jsonArray.push('<td><input type="text" id="distance" value="" class="form-control distance" data-tooltip="Distance" placeholder="Distance" maxlength="4" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}"/></td>');
				jsonArray.push('<td><button type = "button" class = "removeCurrentRowForPincode btn btn-warning" data-tooltip="Remove">Remove</button></td>');
				jsonArray.push('<td></td>');

				$('#pincodeTr').on('blur', '.pincode', function() {
					_this.validatePincode($(this).val());
				});

				$('#pincodeTr').append('<tr>' + jsonArray.join(' ') + '</tr>');
				_this.eventForRemoveRowForPincode();
			}, eventForRemoveRowForPincode: function() {
				$('.removeCurrentRowForPincode').click(function() {
					_this.removeCurrentRowForPincode(this);
				});
			}, removeCurrentRowForPincode : function(obj) {
				let count = $('#pincodeTr tr').length;
				
				if(count < 2) {
					showMessage('warning', 'You cannot remove last row !');
					return;
				}
				
				$(obj).closest('tr').remove();
			}, addPincodeData: function() {
				if (!validateInputTextFeild(1, 'selectBranch', 'selectBranch', 'error', 'Select Branch !'))
					return false;

				let jsonObject = {};
				let dataArray = [];
				let isValid = true;

				$("#pincodeTr tr").each(function() {
					jsonObject = {};

					let row = $(this);
					let pincode = row.find("td:eq(0) input, td:eq(0) select").val();
					let hours = row.find("td:eq(1) input").val();
					let distance = row.find("td:eq(2) input").val();

					if (pincode == '') {
						showMessage('error', 'Enter Pincode');
						isValid	= false;
						return false;
					}/* else if (pincode.length != 6) {
						showMessage('error', 'Enter 6 digit Pincode');
						isValid	= false;
						return false;
					}*/

					if (hours == 0) {
						showMessage('error', 'Enter Hours');
						isValid	= false;
						return false;
					}

					if (distance == 0) {
						showMessage('error', 'Enter Distance');
						isValid	= false;
						return false;
					}

					jsonObject["pincode"]			= pincode;
					jsonObject["configBranchId"]	= $('#selectBranch').val();
					jsonObject["distance"]			= distance;
					jsonObject["hours"]				= hours;

					if (pincode > 0 && hours > 0 && distance > 0)
						dataArray.push(jsonObject);
				});
				
				if (!isValid) {return; }
				
				showLayer();

				jsonObject = {};

				jsonObject.dataArray		= JSON.stringify(dataArray);
				jsonObject.configBranchId	= $('#selectBranch').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchPincodeConfigurationWS/addBranchPincodeConfigDataByAssignBranchId.do?', _this.setResponsePincodeSave, EXECUTE_WITH_NEW_ERROR);
			}, setResponsePincodeSave: function(response) {
				hideLayer();
				
				_this.getBranchPincodeList($('#selectBranch').val());
				
			}, deletePincodeData: function(branchPincodeConfigId) {
				let jsonObject = new Object();

				jsonObject["branchPincodeConfigurationId"]	= branchPincodeConfigId;
				jsonObject["configBranchId"]				= $('#selectBranch').val();
				let pincode = ''; // Initialize pincode variable

				// Find the row that contains the delete button with the matching branchPincodeConfigId
				$('#pincodeTable tbody tr').each(function() {
					if ($(this).find('button').attr('id') === branchPincodeConfigId.toString()) {
						pincode = $(this).find('td:eq(0) input').val(); // Extract the pincode value
						return false; // Break the loop once the matching row is found
					}
				});

				jsonObject["pinCode"] = pincode;

				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchPincodeConfigurationWS/deletePincodeConfigDataByPincodeConfigId.do?', _this.setResponseAfterDeleteServiceablePincode, EXECUTE_WITH_NEW_ERROR);
			}, toggleFormStepSign: function(step, isValid) {

				const tabs = document.querySelectorAll(".tab");
				const signSpan = tabs[step - 1].querySelector(".sign");

				if (isValid) {
					signSpan.textContent = "✅"; // Tick sign
				} else {
					signSpan.textContent = "❌"; // Cross sign
				}
			}, checkInitialValidity: function() {
				const forms = document.querySelectorAll(".form-step");

				forms.forEach((form, index) => {
					const isValid = form.checkValidity();
					_this.toggleFormStepSign(index + 1, isValid);
				});
			}, validateForm: function() {
				const currentForm = document.getElementById(`form-step-${currentStep}`);
				const inputs = currentForm.querySelectorAll("input, textarea");
				inputs.forEach((input) => {
					if (input.value.trim) {
						input.value = input.value.trim();
					}
				});

				return currentForm.checkValidity();
			}, setValidTime: function() {
				$('#startTime').on('input', function() {
					let startTimeStr	= $(this).val();
					let startTimeParts	= startTimeStr.split(':');
					let startHours		= parseInt(startTimeParts[0]);
					let startMinutes	= parseInt(startTimeParts[1]);
					
					if (startTimeStr.toLowerCase().includes('pm') && startHours !== 12)
						startHours += 12;
					
					let startTime = new Date();
					startTime.setHours(startHours);
					startTime.setMinutes(startMinutes);

					let endTimeStr		= $('#endTime').val();
					let endTimeParts	= endTimeStr.split(':');
					let endHours		= parseInt(endTimeParts[0]);
					let endMinutes		= parseInt(endTimeParts[1]);

					if (endTimeStr.toLowerCase().includes('pm') && endHours !== 12)
						endHours += 12;

					let endTime = new Date();
					endTime.setHours(endHours);
					endTime.setMinutes(endMinutes);

					if (endTime < startTime)
						$('#endTime').val(startTimeStr);
				});

				$('#endTime').on('input', function() {
					let endTimeStr		= $(this).val();
					let endTimeParts	= endTimeStr.split(':');
					let endHours		= parseInt(endTimeParts[0]);
					let endMinutes		= parseInt(endTimeParts[1]);
					
					if (endTimeStr.toLowerCase().includes('pm') && endHours !== 12)
						endHours += 12;
					
					let endTime = new Date();
					endTime.setHours(endHours);
					endTime.setMinutes(endMinutes);

					let startTimeStr		= $('#startTime').val();
					let startTimeParts		= startTimeStr.split(':');
					let startHours			= parseInt(startTimeParts[0]);
					let startMinutes		= parseInt(startTimeParts[1]);
					
					if (startTimeStr.toLowerCase().includes('pm') && startHours !== 12)
						startHours += 12;
					
					let startTime = new Date();
					startTime.setHours(startHours);
					startTime.setMinutes(startMinutes);

					if (endTime < startTime)
						$('#endTime').val(startTimeStr);
				});
			}, resetForm: function(formId) {
				$('#' + formId + ' input[type="text"], #' + formId + ' input[type="checkbox"], #' + formId + ' select').each(function() {
					if ($(this).is('input[type="text"]'))
						$(this).val(''); // Reset input value
					else if ($(this).is('select'))
						$(this).val(''); // Reset select value
					else if ($(this).is('input[type="checkbox"]'))
						$(this).prop('checked', false); // Uncheck checkbox
				});
			}, createMultiselectOptionForDays : function() {
				new MultiSelectTag('workingDays');
				$('.btn-container').find('button').hide()
				$('.input-container').css('background-color', '#e9ecef');
				$('.mult-select-tag input').attr('data-tooltip', 'Search Days');
				$('.mult-select-tag button').attr('data-tooltip', 'Select Days');
			}, setupEventHandlers : function(){
				// Show the confirmation message and buttons when the user enters a remark
				$('#remark').on('input', function() {
					if ($(this).val().trim() !== "") {
						$('#confirmationMessage').show();
						$('#cancelButton').show();
						$('#confirmDeactivateBtn').show();
					} else {
						$('#confirmationMessage').hide();
						$('#cancelButton').hide();
						$('#confirmDeactivateBtn').hide();
					}
				});
	
				// Attach event listener to the dynamically added button
				$('#deActivateBranch').on('click', function(event) {
					event.preventDefault();
					_this.checkBranchDeactivationStatus(branchId);
	
				});
				   /* $('#remark').val('');
					$('#confirmationMessage').hide();
					$('#cancelButton').hide();
					$('#confirmDeactivateBtn').hide();
					$('#deactivateBranchModal').modal('show');
				});*/
	
				// Handle confirm deactivation button click
				$('#confirmDeactivateBtn').on('click', function() {
					remark = $('#remark').val();
	
					$('#deactivateBranchModal').modal('hide');
					_this.saveDeactivationInformation();
				});
			}, checkBranchDeactivationStatus: function(branchId) {
				let jsonObject = new Object();
				showLayer();
	
				jsonObject.branchId = $("#selectBranch").val();
	
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/checkBranchDeactivationStatus.do?', _this.setResponseForActivation, EXECUTE_WITHOUT_ERROR);
			}, setResponseForActivation : function(response) {
				if (response && response.msg === "Branch is Already Deactivated!") {
					showAlertMessage('info', 'Branch is Already Deactivated');
				} else if(response && response.msg === "Branch is Active") {
					$('#remark').val('');
					$('#confirmationMessage').hide();
					$('#cancelButton').hide();
					$('#confirmDeactivateBtn').hide();
					$('#deactivateBranchModal').modal('show');
				} else if(response && response.msg === "Branch Not Found")
				   showAlertMessage('error', 'Branch Not Found For Deactivation/Branch Is Not Activated !');
				
				hideLayer();
			}, saveDeactivationInformation : function() {
				showLayer();
				let jsonObject = _this.getDataToSave();
				 
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/deactivateBranchdetails.do?', _this.setResponseForBranchDeactivation, EXECUTE_WITHOUT_ERROR);
			}, getDataToSave : function() {
				let jsonObject = new Object();
				jsonObject.branchId		= $("#selectBranch").val();;
				jsonObject.remark		= remark;
	
				return jsonObject;
			}, setResponseForBranchDeactivation : function(response) {
				hideLayer();
				
				let message	= response.message;
				
				if(message.type != MESSAGE_TYPE_ERROR) {
					showMessage('success', message.description); // Adjust accordingly if `description` is the right field to display
	
					setTimeout(function() {
						location.reload();
					}, 2000);
				} else {
					// If it's an error, show the error message
					showMessage('error', message.description); // Adjust accordingly if `description` is the right field to display
				}
			}
	});
});
