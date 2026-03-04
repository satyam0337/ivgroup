define(
	[
		'/ivcargo/resources/js/generic/urlparameter.js',
		'selectizewrapper',
		'JsonUtility',
		'messageUtility',
		'bootstrapSwitch',
		PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(UrlParameter,Selectizewrapper) {
		'use strict';
		var _this = '', complaintObj = '', responseObj = '', accountGroupId, executiveId, configuration={};
		return Marionette.LayoutView.extend({
			initialize: function() {
				accountGroupId	= localStorage.getItem("accountGroupId");
				executiveId		= localStorage.getItem("executiveIdCheck");
				_this = this;
			},
			render: function() {
				showLayer();
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/CustomerFeedbackForm/CustomerFeedbackView.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					complaintObj = JSON.parse(sessionStorage.getItem("selectedComplaint"));
					
					if (typeof complaintObj === 'string') {
						complaintObj = JSON.parse(complaintObj);
					}
					
					responseObj	 = complaintObj.responses;
					configuration = complaintObj.configuration;
					
					document.getElementById("accountGroupCode").textContent = complaintObj.obj.accountGroupCode == null ? '--' : complaintObj.obj.accountGroupCode;
					document.getElementById("executiveName").textContent = complaintObj.obj.executiveName == null ? '--' : complaintObj.obj.executiveName;
					document.getElementById("branchName").textContent = complaintObj.obj.branchName == null ? '--' : complaintObj.obj.branchName;
					document.getElementById("categoryType").textContent = complaintObj.obj.categoryType == '' ? '--' : complaintObj.obj.categoryType;
					document.getElementById("moduleName").textContent = complaintObj.obj.moduleName == '' ? '--' : complaintObj.obj.moduleName;

					if (complaintObj.obj.isUser) {
						$("#followUpDateTime").hide();
						$("#assigneeDiv").hide();
					}
					
					if(complaintObj.obj.statusId === 3) {
					   $("#closeComplaintBtn").hide();
					   $("#replyBtn").hide();
					}

					Selectizewrapper.setAutocomplete({
						jsonResultList	  :	   complaintObj.assigneeList,
						valueField		  :	   'executiveName',
						labelField		  :	   'executiveName',
						searchField		  :	   'executiveName',
						elementId		  :	   'assignee',
						create			  :		false,
						maxItems		  :		1,
					});
					
					_this.getDataById();
					_this.renderResponses(responseObj);

					$("#replyBtn").click(function() {
						$("#replyForm").slideDown();
						resetElements();
						
						if ($(this).text() === "Reply") {
							$(this).text("Close");
						} else {
							$("#replyForm").slideToggle();
							$(this).text("Reply");
						}
					});

					$("#reply").on("keypress", function (e) {
						if (e.which === 39) { 
						   e.preventDefault();
						}
					});
					
					$("#closeComplaintBtn").click(function(){
						closeComplaint(complaintObj.obj.feedbackEntryId);	
					});
					
					$('#submitReply').on('click', function() {
						if (checkElements())
						   _this.saveFeedbackDetails(configuration);
					});
				});
			}, renderResponses: function(responseObj) {
				let orderedCommentsHtml = "";
			
				responseObj.forEach(resp => {
					console.log('com res :: ',resp )
					  if (resp.comment && resp.comment.trim() !== "") {
						const isClient = resp.responseBy == 1;
						const label = isClient ? "Client" : "IV Support";
						const avatarLetter = isClient ? "C" : "IV";
						const bgColorClass = isClient ? "bg-primary" : "bg-success";
						const timestamp = resp.creationDateTimeStr || "";
						const formattedComment = resp.comment.replace(/\n/g, "<br>");
						const commentWithFollowUp = isClient ? formattedComment : (resp.followUpTime != null && resp.followUpDate.trim() !== "" ? `${formattedComment} in ${resp.followUpTime} hrs.` : formattedComment);
						const messageBgClass = isClient ? "list-group-item bg-info bg-opacity-10" : "list-group-item bg-success bg-opacity-10"; 

						orderedCommentsHtml += `
							  <div class="d-flex mb-2 ${isClient ? "" : "justify-content-center"} align-items-start">
								<div class="d-flex flex-column align-items-center me-3" style="width:100px; flex:0 0 14%;">
								  <div class="rounded-circle ${bgColorClass} text-white d-flex align-items-center justify-content-center" 
									   style="width:40px;height:40px;">
									${avatarLetter}
								  </div>
								  <div class="mt-1"><small class="fw-bold">${label}</small></div>
								  <div class="mt-1 text-center">
									<small class="text-muted d-block text-truncate" style="max-width:250px;">${resp.commentByStr || ""}</small>
								  </div>
								</div>
								<div class="p-3 border rounded ${messageBgClass}" style="max-width:75%;">
								  <p class="mb-1 comment-text">${commentWithFollowUp}</p>
								  <small class="text-muted">${timestamp}</small>
								  <div class="mt-2">
								   <button class="btn btn-sm btn-outline-primary view-docs-btn" 
									  data-responseid="${resp.feedbackResponseId || resp.id}"
									  data-isclient="${isClient}">
									  View Documents
									</button>
								  </div>
								</div>
							  </div>
							`;
						  }
					});

				document.getElementById("orderedComments").innerHTML = orderedCommentsHtml || "<p class='text-muted'>No Thoughts yet</p>";
				$(document).on('click', '.view-docs-btn', function () {
					const responseId = $(this).data('responseid');
					const responseByClient = $(this).data('isclient'); 
					viewDocuments(responseId, complaintObj.obj.accountGroupId, responseByClient);
				});
			}, saveFeedbackDetails: function(config) {
				let jsonObject = {
					comment				: $('#reply').val(),
					followUpTime		: $('#time').val(),
					followUpDate		: $('#derivedDate').val(),
					assignee			: $('#assignee').val(),
					complaintNumber		: complaintObj.obj.complaintNumber,
					feedbackEntryId		: complaintObj.obj.feedbackEntryId,
					isUser				: complaintObj.obj.isUser,
					accountGroupId		: accountGroupId,
					executiveId			: executiveId
				};

				const fileInput = document.getElementById("fileInput");
				const files		= fileInput.files;

                if (files.length > 0) {
                    if (files.length > config.maxNoOfFileToUpload) {
                        alert("You can upload a maximum of "+ config.maxNoOfFileToUpload +" files.");
                        return;
                    }

                    for (let file of files) {
                        if (file.size > config.maxSizeOfFileToUpload * 1024 * 1024) {
                            alert(`File ${file.name} exceeds `+ config.maxSizeOfFileToUpload +` MB size limit.`);
                            return;
                        }
                       
                        const ext = file.name.split(".").pop().toLowerCase();
                        if (!config.fileTypeExtensions.includes(ext)) {// ["jpg", "jpeg", "pdf", "png", "mp3", "mp4"]
                            alert(`File ${file.name} has an invalid format.`);
                            return;
                        }
                    }
                }

				if (files.length > 0) {
					if (files.length > config.maxNoOfFileToUpload) {
						alert("You can upload a maximum of ",config.maxNoOfFileToUpload," files.");
						return;
					}

					for (let file of files) {
						if (file.size > config.maxSizeOfFileToUpload * 1024 * 1024) {
							alert(`File ${file.name} exceeds `,config.maxSizeOfFileToUpload,` MB size limit.`);
							return;
						}
					   
						const ext = file.name.split(".").pop().toLowerCase();
						if (!config.fileTypeExtensions.includes(ext)) {// ["jpg", "jpeg", "pdf", "png", "mp3", "mp4"]
							alert(`File ${file.name} has an invalid format.`);
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
					url: IVNEXT_URL + '/customerFeedbackFormWS/saveReplyCustomerFeedbackDeatils',
					type: 'POST',
					data: formData,
					processData: false,
					contentType: false,
					success: function(response) {
						hideLayer();
						_this.afterSave(response);
					}, error: function(xhr, status, error) {
						hideLayer();
						alert("Operation Failed.",status);
					}
				});
			}, afterSave: function(response) {
				hideLayer();
				if (response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
					return;

				$("#replyForm").slideToggle();
				$("#replyBtn").text("Reply");

				_this.getDataById();
			  },getDataById: function(){
				  let jsonObject = new Object();
				jsonObject.feedbackEntryId = complaintObj.obj.feedbackEntryId;

				getJSON(jsonObject, IVNEXT_URL + '/customerFeedbackFormWS/getCustomerFeedbackListById', _this.setDataInTable,EXECUTE_WITH_NEW_ERROR);
				//getJSON(jsonObject, WEB_SERVICE_URL+'/report/zonalWiseReportWS/getZonalWiseReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);

				}, setDataInTable: function(response) {
				responseObj = response.customerFeedbackDetails || [];
				_this.renderResponses(responseObj);
			}
		});
	});

function checkElements() {
	if ($('#reply').val().trim().length === 0) {
		showMessage('error', 'Please Select Description !')
		$('#reply').css('border-color', 'red');
		$('#reply').focus();
		return false;
	}
	return true;
}

function followUpdateDateFromTime() {
	let jsonObject = new Object();
	jsonObject.hours = $('#time').val();

	getJSON(jsonObject, IVNEXT_URL + '/customerFeedbackFormWS/getFeedbackFollowUpDateByTime', setSuccess, EXECUTE_WITH_NEW_ERROR);
}

function setSuccess(data) {
	hideLayer();
	$('#derivedDate').val(data.followUpDate)
}

function resetElements(){
	$('#reply').val('');
	$('#time').val('');
	$('#derivedDate').val('');
	$('#fileInput').val('');
}

function closeComplaint(feedbackEntryId){
	showLayer();
	let jsonObject = new Object();
		jsonObject.feedbackEntryId = feedbackEntryId;
		jsonObject.statusId = 3;
	getJSON(jsonObject, IVNEXT_URL	+ '/customerFeedbackFormWS/updateStatus', updatedData, EXECUTE_WITH_NEW_ERROR);
}
function updatedData() {
	$("#replyForm").slideUp();
	$("#replyBtn").hide();
	$("#closeComplaintBtn").hide();
}

let documentsList = [];
let currentIndex = 0;
let zoomed = false;

function viewDocuments(responseId, searchByAccountGroupId, responseByClient){
	let jsonObject = new Object();
	jsonObject.feedbackResponseId = responseId;
	jsonObject.accountGroupId = searchByAccountGroupId;
	jsonObject.responseByClient = responseByClient;

	$.ajax({ 
		url: IVNEXT_URL + '/customerFeedbackFormWS/getDocumentsByResponseId',
		type: 'POST',
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		data: jsonObject,
		dataType: 'json',
		success: function (docs) {
			if (docs.length === 0) {
			   showMessage('error','No documents available.');
				return;
			}
			documentsList = docs;
			currentIndex = 0;
			showDocument(currentIndex);
			$("#docsModal").modal("show");
		}
	});
}

function showDocument(index) {
	const doc = documentsList[index];
	const ext = doc.fileType.split('/').pop().toLowerCase();
	const base64Data = doc.fileContent;
	const contentType = doc.fileType;

		if (["png", "jpg", "jpeg"].includes(ext)) {
			$("#docPreview").replaceWith(`<img id="docPreview" style="max-width:100%; max-height:600px;" src="data:${contentType};base64,${base64Data}" />`);
			$("#docPreview").show();
		} else if (ext === "pdf") {
			$("#docPreview").replaceWith(`<iframe id="docPreview" style="width:100%; height:600px;" frameborder="0" src="data:${contentType};base64,${base64Data}"></iframe>`);
		} else if (ext === "mp4") {
			$("#docPreview").replaceWith(`
				<video id="docPreview" style="width:100%; max-height:600px;" controls>
					<source src="data:${contentType};base64,${base64Data}" type="${contentType}">
					Your browser does not support the video tag.
				</video>
			`);
		}else if (ext === "mpeg") {
			$("#docPreview").replaceWith(`
				<audio id="docPreview" style="width:100%;" controls>
					<source src="data:audio/mpeg;base64,${base64Data}" type="audio/mpeg">
					Your browser does not support the audio tag.
				</audio>
			`);
			$("#docPreview").show();
		} else {
			$("#docPreview").hide();
		}

	$("#docFileName").text(index+1);

	$("#prevDocBtn").prop("disabled", index === 0);
	$("#nextDocBtn").prop("disabled", index === documentsList.length - 1);

}
$(document).off("click", "#prevDocBtn").on("click", "#prevDocBtn", function () {
	if (currentIndex > 0) {
		currentIndex--;
		showDocument(currentIndex);
	}
});

$(document).off("click", "#nextDocBtn").on("click", "#nextDocBtn", function () {
	if (currentIndex < documentsList.length - 1) {
		currentIndex++;
		showDocument(currentIndex);
	}
});
