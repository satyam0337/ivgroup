define([
		'selectizewrapper',
		'JsonUtility',
		'messageUtility',
		'autocomplete',
		'autocompleteWrapper',
		PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		'nodvalidation',
		'focusnavigation'
	], function(SelectizeWrapper) {
		'use strict';
		var jsonObject = new Object(), _this = '';
		return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/tdsMasterWS/getTDSMasterElements.do?', _this.renderTDSMasterTabs, EXECUTE_WITH_ERROR);
					return _this;
				}, renderTDSMasterTabs : function(response) {
					var loadelement = new Array();
					var baseHtml	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/master/tdsMaster/tdsMaster.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject = Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
							else
								$("*[data-attribute="+ element+ "]").remove();
						}
						
						_this.renderTDSMasterElements(response);
					});
				}, renderTDSMasterElements : function(data) {
					initialiseFocus();
					
					_this.showStep(1);
					_this.setTDSTypeSelection(data);
					_this.bindEventOnNextPrevTab();
					
					$('#validFromEle').on('blur',function() {
						if ($('#validFromEle').val() == '' || $('#validFromEle').val() == undefined) {
							showAlertMessage('error', "Enter Valid From Date!");
							$('#validFromEle').focus();
							return false;
						}	
					});

					$("#saveTDSDetails").click(function() {
						if(_this.validateField())
							_this.onSubmit();
					});	
					
					$('#searchDetails').click(function() {
						_this.searchTDSDetails();
					});

					$('#add').on('click',function() {
						$("#editTab").empty();
						_this.renderTDSMasterAddTabElements();
					});

					$('#viewAllStep').on('click',function() {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/tdsMasterWS/viewAllTDSDetails.do?',_this.renderTDSMasterViewAllTabElements, EXECUTE_WITH_ERROR);
					});
					
					hideLayer();
				}, setTDSTypeSelection : function(data) {
					SelectizeWrapper.setAutocomplete({
						jsonResultList	:	data.tdsTypeList,
						valueField		:	'tdsTypeId',
						labelField		:	'tdsTypeName',
						searchField		:	'tdsTypeName',
						elementId		:	'tdsTypeEle',
						create			:	false,
						maxItems		:	1
					});
												
					SelectizeWrapper.setAutocomplete({
						jsonResultList	:	data.tdsTypeList,
						valueField		:	'tdsTypeId',
						labelField		:	'tdsTypeName',
						searchField		:	'tdsTypeName',
						elementId		:	'tdsTypeSearch',
						create			:	false,
						maxItems		:	1
					});
				}, renderTDSMasterAddTabElements : function() {
					hideLayer();
				}, validateValidTill : function(validFrom, validTill) {
					if (validFrom == null || validTill == null) {
						validFrom = $('#validFromEle').val();
						validTill = $('#validTillEle').val();
					}

					if (validFrom == '' || validFrom == undefined) {
						showAlertMessage('error', "Enter Valid From Date!");
						$('#validFromEle').focus();
						return false;
					}

					if (validTill == '' || validTill == undefined) {
						showAlertMessage('error', 'Enter Valid Till Date!');
						$('#validTillEle').focus();
						return false;
					}

					var validFromDate = new Date(validFrom);
					var validTillDate = new Date(validTill);

					if (validTillDate < validFromDate) {
						showAlertMessage('error', "Valid Till Cannot Be Smaller than Valid From!");
						$('#validTillEle').focus();
						return false;
					}

					return true;
				}, searchTDSDetails : function() {
					if ($('#tdsTypeSearch').val() === '' || $('#tdsTypeSearch').val() == 0) {
						showAlertMessage('error', "Select TDS Type!");
						$('#tdsTypeSearch').focus();
						return false;
					}
					
					var jsonObj = new Object();
					jsonObj.tdsTypeId = $('#tdsTypeSearch').val();
					
					showLayer();
					getJSON(jsonObj, WEB_SERVICE_URL + '/tdsMasterWS/getTDSDetailsByTDSType.do?',_this.renderTDSMasterEditTabElements, EXECUTE_WITH_ERROR);				
				},	renderTDSMasterEditTabElements: function(response) {
					hideLayer();
					
					let tdsList = response.tdsList;
					
					if (tdsList != undefined && tdsList.length > 0) {
						$('#tableHeader').removeClass('hide');
						$('#tdsRatesTable tbody').html('');
						$("#tdsRatesTableTr").find("tr:gt(0)").remove();
						let i = 1;

						let jsonArray = [];

						for (const element of tdsList) {
							let obj = element;
							jsonArray = [];

							jsonArray.push('<td class="hide"><input type="text" id="tdsForGroupId" value="' + obj.tdsForGroupId + '" class="form-control" readonly/></td>');
							jsonArray.push('<td class="bordered-cell">'+ i +'</td>');
							jsonArray.push('<td><input type="text" id="tdspercent" data-tooltip="TDS Percent" value="' + parseFloat(obj.tdsRate).toFixed(2) + '" class="form-control bordered-cell" onkeypress="return validateFloatKeyPress(event, this);" maxlength="6" readonly/></td>');
							jsonArray.push('<td><input type="text" id="specifiedPercent" data-tooltip="Specified Percent" value="' + parseFloat(obj.specifiedPercent).toFixed(2) + '" class="form-control bordered-cell" onkeypress="return validateFloatKeyPress(event, this);" maxlength="6" readonly/></td>');
							jsonArray.push('<td><input type="date" id="validFrom" data-tooltip="Valid From" value="' + toDateString(parseDate(obj.validFromStr), 2) + '" class="form-control bordered-cell" readonly/></td>');
							jsonArray.push('<td><input type="date" id="validTill" data-tooltip="Valid Till" value="' + toDateString(parseDate(obj.validTillStr), 2) + '" class="form-control bordered-cell" readonly/></td>');
							jsonArray.push('<td><button type="button" class="editRecords btn btn-primary bordered-cell" data-id="' + obj.tdsForGroupId + '">Edit</button><button type="button" class="cancelRecords btn btn-danger bordered-cell" data-id="' + obj.tdsForGroupId + '" style="display:none;">Cancel</button></td>');
							jsonArray.push('<td><button type="button" class="saveRecords btn btn-primary bordered-cell" data-id="' + obj.tdsForGroupId + '" style="display:none;">Save</button></td>');

							$('#tdsRatesTable tbody').append('<tr id="tdsRatesTr_' + obj.tdsForGroupId + '">' + jsonArray.join(' ') + '</tr>');
							i++;
						}

						$(".editRecords").on("click", function() {
							let rowId = $(this).data('id');
							let row = $("#tdsRatesTr_" + rowId);

							row.find("input").prop("readonly", false);

							row.find(".editRecords").hide();
							row.find(".cancelRecords").show();
							row.find(".saveRecords").show();
						});
						
						$(".cancelRecords").on("click", function() {
							let rowId = $(this).data('id');
							let row = $("#tdsRatesTr_" + rowId);

							_this.resetEditDetails(row);
						});

						$(".saveRecords").on("click", function() {
							let rowId = $(this).data('id'); 
							let row = $("#tdsRatesTr_" + rowId);
							
							if (row.find("#tdsForGroupId") === '' || row.find("#tdsForGroupId") == 0) {
								showAlertMessage('error',' TDS For Group Id Not Found !');
								return false;
							}
							
							if (row.find("#tdspercent").val() == '' || parseFloat(row.find("#tdspercent").val()) < 0 ) {
								showAlertMessage('error','Enter TDS Percent!');
								row.find("#tdspercent").focus();
								return false;
							}
							
							if (row.find("#specifiedPercent").val() === '' || parseFloat(row.find("#specifiedPercent").val()) < 0 ) {
								showAlertMessage('error','Enter Specified Percent!');
								$('#specifiedPercentEle').focus();
								return false;
							}
							
							if (row.find("#validFrom").val() === '' || row.find("#validFrom").val() === undefined) {
								showAlertMessage('error','Enter Valid From Date!');
								row.find("#validFrom").focus();
								return false;
							}	
							
							if (row.find("#validTill").val() === '' || row.find("#validTill").val() === undefined) {
								showAlertMessage('error','Enter Valid Till Date!');
								row.find("#validTill").focus();
								return false;
							}
							
							if (!_this.validateValidTill(row.find("#validFrom").val(), row.find("#validTill").val()))
							   return;

							let updatedValues = {
								tdsTypeId : $('#tdsTypeSearch').val(),
								tdsForGroupId: row.find("#tdsForGroupId").val(),
								tdsPercent: row.find("#tdspercent").val(),
								specifiedPercent: row.find("#specifiedPercent").val(),
								validFrom: dateWithDateFormatForCalender(row.find("#validFrom").val(), '-'),
								validTill: dateWithDateFormatForCalender(row.find("#validTill").val(), '-')
							};

							_this.updateTDSData(updatedValues);
							
							setTimeout(function() {
								_this.resetEditDetails(row);
							}, 200);
						});
					}
				}, resetEditDetails : function(row) {
					row.find("input").prop("readonly", true);

					row.find(".editRecords").show();
					row.find(".cancelRecords").hide();
					row.find(".saveRecords").hide();
				}, updateTDSData: function(updatedValues) {
					showLayer();
					getJSON(updatedValues, WEB_SERVICE_URL + '/tdsMasterWS/updateTDSDetails.do?',_this.afterSave, EXECUTE_WITH_ERROR);
				}, onEdit : function(){
					_this.enabledElement();
					$("#editBtn").addClass("hide");
					$("#updateBtn").removeClass("hide");
					$("#deactivateBtn").removeClass("hide");
					$("#activateBtn").removeClass("hide");
					
					if(corporateAccountMarkForDelete) {
						$('#deactivateBtn').attr('disabled','disabled');
						$('#activateBtn').removeAttr('disabled');
					} else {
						$('#activateBtn').attr('disabled','disabled');
						$('#deactivateBtn').removeAttr('disabled');
					}
				}, desabledElement : function() {
					var $inputs = $('#editTab :input');
					var $botton = $('#editTab :button');

					$inputs.each(function() {
						$(this).attr('readOnly', true);
						$(this).attr('autocomplete', 'off');
						$("#partyNameSelectorEle").removeAttr('readOnly');
						$("#gstNoSelectorEle").removeAttr('readOnly');
						$("#mobileNoSelectorEle").removeAttr('readOnly');
					});

					$botton.each(function() {
						$(this).attr("disabled","disabled");
						$("#editBtn").removeAttr('disabled');
					});
					
					hideLayer();
				}, enabledElement : function() {
					var $inputs = $('#editTab :input');
					var $botton = $('#editTab :button');

					$inputs.each(function() {
						$(this).attr('readOnly', false);
						$("#countryEle").attr('readOnly', true);
						$(this).attr('autocomplete', 'on');
					});

					$botton.each(function() {
						$(this).removeAttr("disabled");
						$("#editBtn").removeAttr('disabled');
						$("#updateBtn").removeAttr('disabled');
					});
				}, resetElement	 : function() {
					$('#tdsTypeEle').val(''); 
					$('#tdsRateEle').val(''); // Reset tdsRateEle field
					$('#specifiedPercentEle').val(''); // Reset specifiedPercentEle field
					$('#validFromEle').val(''); // Reset validFromEle field
					$('#validTillEle').val(''); // Reset validTillEle field

					hideLayer();
				}, renderTDSMasterViewAllTabElements : function(response) {
					hideLayer();
					
					var tdsList = response.tdsDetailsList;
					
					if(tdsList != undefined && tdsList.length > 0) {
						const tbody = document.getElementById('viewAllTDSTableTr');
												
						tbody.innerHTML = '';

						tdsList.forEach(item => {
							const row = document.createElement('tr');

							row.innerHTML = `
								<td>${item.tdsTypeStr}</td>
								<td>${item.tdsRate} %</td>
								<td>${item.specifiedPercent} %</td>
								<td>${item.validFromStr}</td>
								<td>${item.validTillStr}</td>
							`;

							tbody.appendChild(row);
						});
					}
				}, onSubmit	 : function() {
					showLayer();
					jsonObject = new Object();

					jsonObject.tdsTypeId		= $('#tdsTypeEle').val();
					jsonObject.tdsPercent		= $('#tdsRateEle').val();
					jsonObject.specifiedPercent	= $('#specifiedPercentEle').val();
					jsonObject.validFrom		= dateWithDateFormatForCalender($('#validFromEle').val(), '-');
					jsonObject.validTill		= dateWithDateFormatForCalender($('#validTillEle').val(), '-');
					
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/tdsMasterWS/addNewTDS.do?',_this.afterSave, EXECUTE_WITH_ERROR);
				}, afterSave  : function(response) {
					hideLayer();
					
					if (response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
						return;
					
					_this.resetElement();
				}, afterUpdate : function(response) {
					hideLayer();
					
					if(response.message != undefined && response.message.type == 2) {
						showAlertMessage("error", response.message.description);
						return false;
					}
					
					$("#viewAll").trigger("click");
					_this.resetElement();
				}, validateField : function() {
					if ($('#tdsTypeEle').val() === '' || $('#tdsTypeEle').val() == 0) {
						showAlertMessage('error', 'Select TDS Type!');
						$('#tdsTypeEle').focus();
						return false;
					}
					
					if ($('#tdsRateEle').val() == '' || parseFloat($('#tdsRateEle').val()) < 0 ) {
						showAlertMessage('error', 'Enter TDS Percent!');
						$('#tdsRateEle').focus();
						return false;
					}
					
					if ($('#specifiedPercentEle').val() === '' || parseFloat($('#specifiedPercentEle').val()) < 0 ) {
						showAlertMessage('error', 'Enter Specified Percent!');
						$('#specifiedPercentEle').focus();
						return false;
					}
					
					if ($('#validFromEle').val() == '' || $('#validFromEle').val() == undefined) {
						showAlertMessage('error', 'Enter Valid From Date!');
						$('#validFromEle').focus();
						return false;
					}	
					
					if ($('#validTillEle').val() === '' || $("#validTillEle").val() === undefined) {
						showAlertMessage('error', 'Enter Valid Till Date!');
						$('#validTillEle').focus();
						return false;
					}
					
					if(!_this.validateValidTill())
						return false;
					
					return true;
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
				}, bindEventOnNextPrevTab : function() {
					$('#addStep, #editStep, #viewAllStep').click(function() {
						_this.switchTabs(this);
					});
				}, switchTabs : function(obj) {
					switch(obj.id) {
					  case 'addStep':
						_this.showStep(1);
						break;
					  case 'editStep':
						_this.showStep(2);
						break;
					  case 'viewAllStep':
						_this.showStep(3);
						break;
					  default:
						break;
					}
				}
			});
		});
