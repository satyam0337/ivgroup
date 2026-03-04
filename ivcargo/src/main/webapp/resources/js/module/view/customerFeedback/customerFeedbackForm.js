/*
 * Author : Neha Mete.
 * Date	  : 24 July 2025
*/

define([	'marionette',
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'selectizewrapper',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	'nodvalidation',
	'validation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
], function(Marionette, Selection, Selectizewrapper) {
			'use strict';
			var jsonObject = new Object(), accountGroupId,executiveId,branchId, _this = '', addModel = null, isUser = true,showStatusColumn=false, maxSizeOfFileToUpload=0, maxNoOfFileToUpload=0,fileTypeExtensions=null,configuration={};
			let feedbackListGlobal = [];let feedbackResponsesGlobal = {};let pageSize = 0; let currentPage = 1;let assigneeList = {};
			var complimentsData = [];		
			return Marionette.LayoutView.extend({
			initialize : function() {
				_this = this;
				accountGroupId	= localStorage.getItem("accountGroupId");
				executiveId		= localStorage.getItem("executiveIdCheck");
				branchId		= localStorage.getItem("branchId");

			}, render : function() {
				showLayer();
				jsonObject.accountGroupId	= accountGroupId;
				jsonObject.executiveId		= executiveId;

				getJSON(jsonObject, IVNEXT_URL	+ '/customerFeedbackFormWS/getCustomerFeedbackFormElements', _this.getCustomerFeedbackElements, EXECUTE_WITH_NEW_ERROR);			
				return _this;
			}, getCustomerFeedbackElements : function(response) {
				showLayer();
				
				$('#complaint_details').hide();
				$('#complimentPanel').hide();

				let loadelement = new Array();
				let baseHtml	= new $.Deferred();

				loadelement.push(baseHtml);
					
				$("#mainContent").load("/ivcargo/html/CustomerFeedbackForm/CustomerFeedbackCreate.html",
					function() {
						baseHtml.resolve();
				});
				
				configuration	= response.configuration;
				
				pageSize	= configuration.pageSize;
				maxSizeOfFileToUpload = configuration.maxSizeOfFileToUpload;
				maxNoOfFileToUpload	= configuration.maxNoOfFileToUpload;
				fileTypeExtensions	= configuration.fileTypeExtensions;

				$.when.apply($, loadelement).done(function() {
					isUser			= response.isUser;
					assigneeList	= response.assigneeList;
					
					$("#operationType").on("change", function() {
						_this.handleOperationType(response);
					});

					$("#viewCompliments").on("click", function() {
						document.getElementById('complimentPanel').style.display = 'none';
						document.getElementById('complaint_details').style.display = 'none';
						complimentsTimeline.style.display = 'block';
						
						let jsonObject = new Object();
						jsonObject.operationTypeId = $('#operationType').val();
						
						jsonObject.isUser  = isUser;
						
						if(isUser)		
							jsonObject.accountGroupId	= accountGroupId;		
						else {		
							const accountGroupVal = $('#accountGroupEle').val();		
								
							if (accountGroupVal && accountGroupVal.trim() !== "")		
								jsonObject.accountGroupId = accountGroupVal;		
						}

						getJSON(jsonObject, IVNEXT_URL	+ '/customerFeedbackFormWS/getCustomerComplimentListByAccountGroupId', _this.renderCompliments, EXECUTE_WITH_NEW_ERROR);
					});

					document.getElementById("backButton").addEventListener("click", () => {
						if(isUser){		
							document.getElementById("complimentsTimeline").style.display = "none";
							document.getElementById('complimentPanel').style.display = 'block';
						}
					});

					addModel	= new bootstrap.Modal(document.getElementById('raiseConcernModal'));

					createOption('categoryTypeEle', 0, "-- Select Category --");
						
					Object.entries(response.categoryTypeList).forEach(([key, value]) => {
						createOption('categoryTypeEle', key, value);
					});
					
					$('#categoryTypeEle').on('change', function() {
						const selectedVal = Number($(this).val());

						if ($('#module')[0] && $('#module')[0].selectize) {
							$('#module')[0].selectize.destroy();
						}

						if (selectedVal === 1) {
							Selectizewrapper.setAutocomplete({
								jsonResultList: response.moduleList,
								valueField: 'moduleId',
								labelField: 'moduleName',
								searchField: 'moduleName',
								elementId: 'module',
								create: false,
								maxItems: 1
							});
						} else if (selectedVal === 2) {
							Selectizewrapper.setAutocomplete({
								jsonResultList: response.reportList,
								valueField: 'reportId',
								labelField: 'reportName',
								searchField: 'reportName',
								elementId: 'module',
								create: false,
								maxItems: 1
							});
						} else {
							if ($('#module').length && $('#module')[0].selectize) {
							  const moduleSelect = $('#module')[0].selectize;
							  moduleSelect.clear();
							  moduleSelect.clearOptions();
							}
						}
					});
					
					$("#description").on("keypress", function (e) {
						if (e.which === 39) { 
						   e.preventDefault();	 
						}
					});
	
					_this.setDataInTable(response);	
					
					$('#submitCompliment').on('click', function () {
						if (_this.checkComplimentElement())
							_this.saveCompliment();
					});
					
					$('#newFeedback').on('click', function () {
						  addModel.show();
						  _this.resetDetails();
					});
						
					$('.addButton').click(function() {
						if (_this.checkComplaintElements())
							_this.saveFeedbackDetails();
					});
					
					$('#find, .status').on('click', function () {
						showLayer();
						let jsonObject			= Selection.getElementData();
						
						if(isUser)
							jsonObject.accountGroupId	= accountGroupId;
						else {
							const accountGroupVal = $('#accountGroupEle').val();
						
							if (accountGroupVal && accountGroupVal.trim() !== "")
								jsonObject.accountGroupId = accountGroupVal;
						}
						
						jsonObject.isUser			= isUser;
						if($(this).val() > 0)
							jsonObject.statusId		= $(this).val();
						
						getJSON(jsonObject, IVNEXT_URL	+ '/customerFeedbackFormWS/getCustomerFeedbackDetails', _this.setDataInTable, EXECUTE_WITH_NEW_ERROR);
					});
				});
			}, handleOperationType: function (response) {
				let value = $("#operationType").val();

				if (value === "1") {
					$('#complaint_details').show();
					$('#complimentPanel').hide();
					$('#complimentThankYouView').hide();
					$('#complimentsTimeline').hide();
					
					if (response.isUser) {
						$('#accountGroupBtn').hide();
						$('#findBtn').hide();
						$('#newFeedbackBtn').show();
					} else {
						$('#newFeedbackBtn').hide();
						$('#accountGroupBtn').show();
						$('#findBtn').show();
						response.accountGroupSelection = true;
						Selection.setSelectionToGetData(response);
					}
					
					$('#viewComplimentsBtn').hide();
				} else if (value === "2") {
					 if (response.isUser) {
						$('#complimentPanel').show();
						$('#accountGroupBtn').hide();		
					 } else 		
						$('#accountGroupBtn').show();
					$('#complaint_details').hide();
					$('#findBtn').hide();
					$('#newFeedbackBtn').hide();
					$('#viewComplimentsBtn').show();
					$('#complimentThankYouView').hide();
					$('#complimentsTimeline').hide();
					
					response.accountGroupSelection = true;
					Selection.setSelectionToGetData(response);
				} else {
					$('#complaint_details').hide();
					$('#complimentPanel').hide();
					$('#accountGroupBtn').hide();
					$('#findBtn').hide();
					$('#newFeedbackBtn').hide();
					$('#complimentThankYouView').hide();
					$('#complimentsTimeline').hide();
				}
			}, saveCompliment : function () {
				let jsonObject = new Object();
				jsonObject.operationTypeId = $('#operationType').val();
				jsonObject.complimentText = $('#complimentText').val();
				jsonObject.accountGroupId = accountGroupId;
				jsonObject.executiveId	  = executiveId;

				getJSON(jsonObject, IVNEXT_URL	+ '/customerFeedbackFormWS/saveCompliment', _this.setCompliment, EXECUTE_WITH_NEW_ERROR);
			}, setCompliment : function () {
					$('#complimentFormView').hide();
					$('#complimentThankYouView').show();

					$('#backToForm').off('click').on('click', function() {
						$('#complimentText').val('');
						$('#complimentThankYouView').hide();
						$('#complimentFormView').show();
					});
			}, checkComplimentElement : function() {
				if($('#complimentText').val() == '') {
					showAlertMessage('error', 'Please Enter Compliment !')
					$('#complimentText').css('border-color', 'red');
					$('#complimentText').focus();
					return false;
				}
				
				return true;
			}, checkComplaintElements : function() {
				if(Number($('#categoryTypeEle').val()) <= 0) {
					showAlertMessage('error', 'Please Select Cateory Type !')
					$('#categoryTypeEle').css('border-color', 'red');
					$('#categoryTypeEle').focus();
					return false;
				}
				
				if(Number($('#module').val()) <= 0) {
					showAlertMessage('error', 'Please Select Module Name !')
					$('#module').css('border-color', 'red');
					$('#module').focus();
					return false;
				}
				
				if(Number($('#description').val()) <= 0) {
					showAlertMessage('error', 'Please Enter Comment !')
					$('#description').css('border-color', 'red');
					$('#description').focus();
					return false;
				}
				
				return true;
			}, renderCompliments: function (data, page = 1) {
				complimentsData = data.customerFeedbackDetails || [];
				
				if(complimentsData.length == 0)
					return;
		
				const container = document.getElementById("timelineContainer");
				container.innerHTML = "";
		
				var start = (page - 1) * pageSize;
				var end = start + pageSize;
				var complimentsToShow = complimentsData.slice(start, end);
		
				complimentsToShow.forEach(item => {
					(item.responses || []).forEach(response => {
						const timelineItem = `
							<div class="timeline-item">
								<div class="card shadow-sm">
									<div class="card-body">
										<div class="d-flex align-items-center mb-3">
											<div class="truck-icon me-3">
												<i class="bi bi-truck"></i>
											</div>
											<div>
												<h5 class="mb-0">${response.commentByStr || ''}</h5>
												<small class="text-muted">${item.accountGroupCode || ''}</small>
											</div>
										</div>
										<p class="card-text">${response.comment || ''}</p>
										<div class="d-flex justify-content-between">
											<small class="text-muted">${response.responseDatetime || item.creationDatetime}</small>
										</div>
									</div>
								</div>
							</div>
						`;
						container.insertAdjacentHTML("beforeend", timelineItem);
					});
				});
		
				_this.renderPagination();
			}, renderPagination: function () {
				var totalPages = Math.ceil(complimentsData.length / pageSize);
				var pagination = $("#complimentsPagination");
				pagination.empty();
		
				if (totalPages <= 1) return;
		
				let html = '';
				
				for (let i = 1; i <= totalPages; i++) {
					html += `<button class="btn btn-sm page-btn ${i === currentPage ? 'btn-primary' : 'btn-light'} mx-1" data-page="${i}">${i}</button>`;
				}
			
				$('#complimentsPagination').html(html);
			
				let _this = this;
				
				$('#complimentsPagination .page-btn').on('click', function() {
					let page = $(this).data('page');
					currentPage = page;
					_this.goToPage(currentPage);
					_this.renderPagination();
				});
			
			}, goToPage: function (page) {
				var totalPages = Math.ceil(complimentsData.length / pageSize);
				if (page < 1 || page > totalPages) return;
				currentPage = page;
				this.renderCompliments({ customerFeedbackDetails: complimentsData }, page);
			}, saveFeedbackDetails: function () {
				let jsonObject = {
					categoryTypeId: $('#categoryTypeEle').val(),
					moduleId: $('#module').val(),
					comment: $('#description').val(),
					emailId : $('#emailIdEle').val(),
					accountGroupId: accountGroupId,
					executiveId: executiveId,
					branchId: branchId,
					isUser: isUser,
					operationTypeId : $('#operationType').val()
				};

				const fileInput = document.getElementById("fileInput");
				const files		= fileInput.files;

				if (files.length > 0) {
					if (files.length > maxNoOfFileToUpload) {
						showAlertMessage("error", "You can upload a maximum of " + maxNoOfFileToUpload + " files.");
						return;	
					}

					for (let file of files) {
						if (file.size > maxSizeOfFileToUpload * 1024 * 1024) {
							showAlertMessage("error", `File ${file.name} exceeds `+ maxSizeOfFileToUpload +` MB size limit.`);
							return;
						}

						const ext = file.name.split(".").pop().toLowerCase();

						if (!fileTypeExtensions.includes(ext)) { //["jpg", "jpeg", "pdf", "png", "mp3", "mp4"];
							showAlertMessage("error", `File ${file.name} has an invalid format.`);
							return;
						}
					}
				}

				const formData = new FormData();
				formData.append("feedbackData", JSON.stringify(jsonObject));

				if (files.length > 0) {
					for (let file of files) {
						formData.append("files", file);
					}
				}
				showLayer();

			 $.ajax({
				 url: IVNEXT_URL + '/customerFeedbackFormWS/insertCustomerFeedbackDeatils', 
				 type: 'POST', 
				 data: formData, 
				 processData: false, 
				 contentType: false,
				 timeout: 300000, 
				 success: function (response) { 
					hideLayer(); 
					_this.afterSave(response);	
				 }, error: function (xhr, status, error) { 
						 hideLayer(); 
						 showAlertMessage("error", "Operation Failed"); 
						 console.error("Error:", error);
					 } 
				});
			}, afterSave : function(response) {
				hideLayer();
				
				if(response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
					return;
				
				showAlertMessage('success', response.message.description);

				addModel.hide();
				
				let jsonObject			= new Object();
				
				if(isUser)
					jsonObject.accountGroupId	= accountGroupId;
				else
					jsonObject.accountGroupId	= $('#accountGroupEle').val();						
						
				jsonObject.statusId			= 1;
				jsonObject.isUser			= isUser;
					
				getJSON(jsonObject, IVNEXT_URL	+ '/customerFeedbackFormWS/getCustomerFeedbackDetails', _this.setDataInTable, EXECUTE_WITH_NEW_ERROR);
			}, setDataInTable: function(response) {
				feedbackListGlobal			= response.customerFeedbackDetails || [];
				feedbackResponsesGlobal		= response.feedbackResponses || {};
				showStatusColumn			= response.showStatusColumn;
				
				currentPage = 1; 

				_this.renderTable(currentPage);
				_this.renderPaginationControls();
			
				hideLayer();
			}, resetDetails : function() {
				$('#categoryTypeEle').val(0);
				$('#module').val('');
				$('#description').val('');
				$('#emailIdEle').val('');
				$('#fileInput').val('');
				
				if ($('#module').length && $('#module')[0].selectize) 
    				$('#module')[0].selectize.clear();
			
			}, renderTable: function(page) {
				$('#reportTable tbody').empty();
			
				if (!feedbackListGlobal || feedbackListGlobal.length === 0) {
					$('#reportTable tbody').append(
						"<tr><td colspan='9' class='text-center text-muted'>No records found</td></tr>"
					);
					
					$('#paginationControls').empty();
					return;
				}
			
				let start = (page - 1) * pageSize;
				let end = start + pageSize;
				let paginatedData = feedbackListGlobal.slice(start, end);

				let srCount = start;
				
				for (const obj of paginatedData) {
					srCount++;
					let columnArray = [];
			
					obj.isUser = isUser;
					columnArray.push("<td class='fs-6'>" + srCount + "</td>");
					columnArray.push("<td class='fs-6'>" + obj.creationDateTimeStr + "</td>");
					columnArray.push("<td class='fs-6'>" + obj.complaintNumber + "</td>");
					columnArray.push("<td class='hideColumn fs-6' >" + (obj.accountGroupCode || '-') + "</td>");

					let comment = '-';
				
					if (feedbackResponsesGlobal[obj.feedbackEntryId] && feedbackResponsesGlobal[obj.feedbackEntryId].length > 0) {
						comment = feedbackResponsesGlobal[obj.feedbackEntryId][0].comment || '-';
					}
					
					columnArray.push(`<td> <span class="d-inline-block text-truncate form-control-plaintext text-center px-3 py-1 fs-6"
							  style="max-width: 650px;" data-bs-toggle="tooltip" data-bs-placement="top" title="${comment}"> ${comment} </span></td>`);

					const assignee  = feedbackResponsesGlobal[obj.feedbackEntryId].map(r => r.assignee).filter(Boolean)[0] || null;

					columnArray.push("<td class='fs-6 hideStatus'>" + (obj.status || '-') + "</td>");
					columnArray.push("<td class='hideColumn fs-6' >" + (assignee || '-') + "</td>");
				    
					let buttons = "<button class='btn btn-md btn-info text-white' id='feedbackEntryId_" + obj.feedbackEntryId + "'>View</button>";

					if (obj.status === "Close" && obj.canReopen) 
						buttons += " <button class='btn btn-md btn-warning' onclick='updateStatus(" + obj.feedbackEntryId +")'>Reopen</button>";

					columnArray.push("<td>" + buttons + "</td>");

					$('#reportTable tbody').append("<tr>" + columnArray.join(' ') + "</tr>");
					
					$("#feedbackEntryId_" + obj.feedbackEntryId).bind("click", function() {
						let elementId		= $(this).attr('id');
						let feedbackEntryId	= elementId.split('_')[1];
						_this.viewFeedback(obj, feedbackEntryId);
					});
					
					if(isUser){
						$('.hideColumn').addClass('hide')
					}

					if(showStatusColumn)
						$('.hideStatus').removeClass('hide');
					else
						$('.hideStatus').addClass('hide');
				}
			},renderPaginationControls: function() {
				$('#paginationControls').empty();
			
				let totalPages = Math.ceil(feedbackListGlobal.length / pageSize);
				if (totalPages <= 1) return;
			
				let html = '';
				
				for (let i = 1; i <= totalPages; i++) {
					html += `<button class="btn btn-sm page-btn ${i === currentPage ? 'btn-primary' : 'btn-light'} mx-1" data-page="${i}">${i}</button>`;
				}
			
				$('#paginationControls').html(html);
			
				let _this = this;
				$('#paginationControls .page-btn').on('click', function() {
					let page = $(this).data('page');
					currentPage = page;
					_this.renderTable(currentPage);
					_this.renderPaginationControls();
				});
			}, viewFeedback : function(obj, feedbackEntryId) {
				const data = JSON.stringify({ obj, responses: feedbackResponsesGlobal[feedbackEntryId], assigneeList, configuration: configuration});
			
				const url = "modules.do?pageId=340&eventId=1&modulename=viewAllCustomerFeedback";
				sessionStorage.setItem("selectedComplaint", JSON.stringify(data));

				window.open(url, '_blank');
			}
		});											
});

function updateStatus(feedbackEntryId) { //Reopen Fucntionality
	let jsonObject = new Object();
	jsonObject.feedbackEntryId = feedbackEntryId;
	jsonObject.statusId = 2; //status : WIP 
	getJSON(jsonObject, IVNEXT_URL + '/customerFeedbackFormWS/updateStatus', updatedData, EXECUTE_WITH_NEW_ERROR);
}

function updatedData(){
	hideLayer();
	let jsonObject			= new Object();
	jsonObject.accountGroupId = 
	jsonObject.statusId = 1;
	getJSON(jsonObject, IVNEXT_URL + '/customerFeedbackFormWS/getCustomerFeedbackDetails', afterUpdate, EXECUTE_WITH_NEW_ERROR);
}