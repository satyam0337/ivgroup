var bulkImageValidationFail = true;
var wayBillIdsList = null;
var maxSizeOfFileToUpload	= 350;
var flagForUploadPdf = false;

define(
		[
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/module/view/podwaybills/podphotoupload.js',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		],//PopulateAutocomplete
		 function(slickGridWrapper2, PODPhotoUpload, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, myNodOP, myNodBranch, myNodLR, myNodParty, gridObject,  _this, noOfFileToUpload,
							uploadPOD = false, receivePOD = false, showRemarkOptionWhileUploadingPOD = false,
							BRANCH_SELECTION = 1, PARTY_SELECTION = 2, WAYBILL_NUMBER_SELECTION = 3,uploadPdfInPod = false,corporateAccountList = [];
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/podWayBillsWS/getPodWayBillsElement.do?', _this.renderPodWayBillsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPodWayBillsElements : function(response) {
					showLayer();
					
					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/module/podwaybills/podWaybillsDetails.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject 		= Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						$("*[data-attribute='partyName']").addClass("hide");
						$("*[data-attribute='wayBillNumberSearch']").addClass("hide");
						
						if(response.allowBulkPodImageUpload != undefined && response.allowBulkPodImageUpload)
							$('#podbulkImageUpload').show();
						
						
						uploadPOD				= response.uploadPOD;
						receivePOD				= response.receivePOD;
						noOfFileToUpload		= response.noOfFileToUpload;
						maxSizeOfFileToUpload	= response.maxSizeOfFileToUpload;
						showRemarkOptionWhileUploadingPOD	= response.showRemarkOptionWhileUploadingPOD;
						uploadPdfInPod			= response.uploadPdfInPod;
						
						if(uploadPdfInPod)
							flagForUploadPdf = true;

						response.sourceAreaSelection	= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						
						response.elementConfiguration	= elementConfiguration;
						response.isPhysicalBranchesShow	= true;
						
						Selection.setSelectionToGetData(response);
						
						let partyNameAutoComplete = new Object();
						partyNameAutoComplete.primary_key = 'corporateAccountId';
						partyNameAutoComplete.url = WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do';
						partyNameAutoComplete.callBack = _this.onFind;
						partyNameAutoComplete.field = 'corporateAccountDisplayName';
						$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
						
						let autoSelectionName 			= new Object();
						autoSelectionName.primary_key 	= 'selectionId';
						autoSelectionName.field 		= 'selectionName';
						autoSelectionName.callBack 		= _this.changeToGetData;
						$("#operationSelectionEle").autocompleteCustom(autoSelectionName);
						
						let autoSelectionNameInstance 	= $("#operationSelectionEle").getInstance();
	
						$(autoSelectionNameInstance).each(function() {
							this.option.source 			= response.selectionArr;
						});
							
						myNodOP = nod();
						myNodOP.configure({
							parentClass:'validation-message'
						});
							
						myNodLR = nod();
						myNodLR.configure({
							parentClass:'validation-message'
						});
							
						myNodParty = nod();
						myNodParty.configure({
							parentClass:'validation-message'
						});
							
						myNodBranch = Selection.setNodElementForValidation(response);
							
						addAutocompleteElementInNode(myNodOP, 'operationSelectionEle', 'Select Operation !');
						addElementToCheckEmptyInNode(myNodLR, 'wayBillNumberEle', 'Enter LR No. !');
						addAutocompleteElementInNode(myNodParty, 'partyNameEle', 'Select Party !');
							
						if(!uploadPOD && !receivePOD) {
							showMessage('info', 'Permission not given to upload or receive LR');
							hideLayer();
							return;
						}
						
						if(receivePOD)
							$("*[data-selector=header]").html('Receive POD LR');
						
						hideLayer();
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind();
						});
					});
				}, changeToGetData : function() {
					let selectionId			= $("#" + $(this).attr("id") + "_primary_key").val();

					if(parseInt(selectionId) == BRANCH_SELECTION) {//for Branch
						$("*[data-attribute='branchSelection']").removeClass("hide");
						$("*[data-attribute='partyName']").addClass("hide");
						$("*[data-attribute='wayBillNumberSearch']").addClass("hide");
						$('#wayBillNumberEle').val('');
						myNod	= myNodBranch;
					} else if(selectionId == PARTY_SELECTION) { //for Party
						$('#wayBillNumberEle').val('');
						$("*[data-attribute='partyName']").removeClass("hide");
						$("*[data-attribute='branchSelection']").addClass("hide");
						$("*[data-attribute='wayBillNumberSearch']").addClass("hide");
						$('#wayBillNumberEle').val('');
						myNod	= myNodParty;
					} else if(selectionId == WAYBILL_NUMBER_SELECTION) { //for LR
						$("*[data-attribute='wayBillNumberSearch']").removeClass("hide");
						$("*[data-attribute='branchSelection']").addClass("hide");
						$("*[data-attribute='partyName']").addClass("hide");
						myNod	= myNodLR;
					} else
						myNod	= myNodOP;
					
					$('#bottom-border-boxshadow').addClass('hide');
				}, onFind : function() {
					showLayer();
					let jsonObject 			= new Object();
					
					let operationSelection	= Number($('#operationSelectionEle_primary_key').val());
					
					if(operationSelection == BRANCH_SELECTION) {
						jsonObject.regionId 			= $('#regionEle_primary_key').val();
						jsonObject.subRegionId			= $('#subRegionEle_primary_key').val();
						jsonObject.sourceBranchId		= $('#branchEle_primary_key').val();
					} else if(operationSelection == PARTY_SELECTION)
						jsonObject.corporateAccountId	= $('#partyNameEle_primary_key').val();
					else
						jsonObject.wayBillNumber		= $('#wayBillNumberEle').val().trim();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/podWayBillsWS/getAllPodWayBills.do', _this.setPODWayBillDetailsData, EXECUTE_WITH_ERROR);
				}, setPODWayBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						return;
					}
					
					$('#wayBillNumberEle').val("");
					$('#wayBillNumberEle').focus();
					
					if(response.CorporateAccount != undefined) {
						hideAllMessages();
						$('#bottom-border-boxshadow').removeClass('hide');
						corporateAccountList = response.CorporateAccount;

						let language = {};
						
						if(receivePOD)
							language.partialheader	= 'Receive';
						else
							language.partialheader	= 'Upload';
						
						response.Language	= language;
						
						if(uploadPOD)
							response.tableProperties.callBackFunctionForPartial = _this.getWindowToUploadPOD;
						else if(receivePOD)
							response.tableProperties.callBackFunctionForPartial = _this.receivePODLR;
						
						gridObject = slickGridWrapper2.setGrid(response);
					}
					
					hideLayer();
				}, getWindowToUploadPOD : function(grid, dataView, row) {
					let wayBillNumber	= "";
					let wayBillId		= 0;
					let jsonObject 		= new Object();
					
					if(dataView.getItem(row).wayBillId != undefined && dataView.getItem(row).wayBillId > 0) {
						wayBillId					= dataView.getItem(row).wayBillId;
						jsonObject["wayBillId"] 	= wayBillId;
						wayBillNumber				= dataView.getItem(row).wayBillNumber;
					}
					
					let matchedWaybill = corporateAccountList.find(item => item.wayBillId == wayBillId);

					if (matchedWaybill && matchedWaybill.doNotAllowUploadPod) {
						showMessage('info', '<i class="fa fa-info-circle"></i> ' + matchedWaybill.doNotAllowUploadPodMessage);
						hideLayer();
						return;
					}

					let object 						= new Object();
					object.elementValue	 			= jsonObject;
					object.gridObj 					= gridObject;
					object.noOfFileToUpload 		= noOfFileToUpload;
					object.maxSizeOfFileToUpload 	= maxSizeOfFileToUpload;
					object.showRemarkOptionWhileUploadingPOD 			= showRemarkOptionWhileUploadingPOD;
					object.uploadPdfInPod 		= uploadPdfInPod;
					
					let btModal = new Backbone.BootstrapModal({
						content		: new PODPhotoUpload(object),
						modalWidth 	: 50,
						title		:'POD Photo Upload for LR No. <b>' + wayBillNumber + '</b>',
						okText		: 'Upload',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					
					new PODPhotoUpload(object);
					btModal.open();
				}, receivePODLR : function(grid, dataView, row) {
					receivePod(grid, dataView, row);
				}, getStatusOfPod : function(wayBillId) {
					let jsonObject 			= new Object();
					jsonObject.waybillId	= wayBillId;
					getJSON(jsonObject, WEB_SERVICE_URL + '/podWayBillsWS/checkStatusOfPOD.do', _this.setPODStatusMessage, EXECUTE_WITH_ERROR);
					showLayer();
				}, setPODStatusMessage : function(response) {
					if(response.message != undefined) {
						hideLayer();
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						return;
					}
					
					hideLayer();
				}	
			});
});

function receivePod(grid, dataView, row) {
	let jsonObject 		= new Object();
	let podStatus;

	if(dataView.getItem(row).wayBillId != undefined && dataView.getItem(row).wayBillId > 0) {
		jsonObject.wayBillId  		= dataView.getItem(row).wayBillId;
		podStatus = dataView.getItem(row).podStatus;
	}

	if(podStatus > 1) {
		showMessage('info', '<i class="fa fa-info-circle"></i> POD Already received for This LR !');
		return;
	}

	getJSON(jsonObject, WEB_SERVICE_URL + '/podWayBillsWS/receivePodWayBills.do', setPODReceivedMessage, EXECUTE_WITH_ERROR);
	dataView.getItem(row).podStatus = 2;
}

function setPODReceivedMessage (response) {
	if(response.message != undefined)
		hideLayer();
}

function startUploadingImages() {
	showLayer();
	$('#failTable').empty();
	$('#uploadingButton').hide();
	$('#copyFailedIds').hide();
	
	$('#copyButtonSpan').text("Copy");
	$('#copyButtonSpan').removeClass("glyphicon-ok");
	$('#copyButtonSpan').addClass("glyphicon-copy");
	
	$('#successIds').text("");
	$('#notFound').text("");
	$('#duplicateIds').text("");
	$('#sizeNotSupported').text("");
	$('#failTable').empty();
	$('#tableCaption').text("");
	$('#copyFailedIds').hide();
	
	if (bulkImageValidationFail) {
		if (!validateDocumentBeforeUpload('bulkFileInput'));
		$('#uploadingButton').show();
		hideLayer();
		return false;
	}
	
	let jsonObject2 = new Object();

	$.ajax({
		type: "POST",
		dataType: 'json',
		url: WEB_SERVICE_URL + "/podWayBillsWS/validateSessionBeforeRestHit.do",
		data: jsonObject2,
		success: function(response) {
			if (response != undefined && response.validatedSession) {
				let imageName = new Map();

				if (wayBillIdsList != null && document.getElementById('bulkFileInput').files.length == wayBillIdsList.length) {
					let doc = document.getElementById('bulkFileInput').files;
					let jsonObject = new FormData();
					
					for (const element of doc) {
						jsonObject.append("files", element);
						imageName.set(element.name.split(".")[0],element.name);
					}
					
					jsonObject.append("accountGroupId", response.accountGroupId);
					jsonObject.append("executiveId", response.executiveId);
					
					$.ajax({
						type: "POST",
						enctype: 'multipart/form-data',
						url: "/ivwebservices/podWayBillsWS/uploadBulkFilesForLr.do?",
						data: jsonObject,
						contentType: false,
						processData: false,
						success: function(data) {
							if (data.message != undefined) {
								let errorMessage = data.message;
								showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);;
							}
					
							let duplicateList = data.duplicateFoundList;
							let successList = data.successList;
							
							let finalFailedImageNameArray = new Array();
							let finalDuplicateImageName = new Array();

							imageName.forEach((value) => {
							    if (value.includes('~')) {
							        let parts = value.split('~');
							        let identifier = parts[1];

							        if (identifier && duplicateList && duplicateList.includes(identifier)) {
							            finalDuplicateImageName.push(value);
							        } else if (identifier && successList && successList.includes(identifier)) {
							            
							        } else {
							            finalFailedImageNameArray.push(value);
							        }
							    } else if(value.includes('.')) {
									let parts = value.split('.');
							        let identifier = parts[0];
							         if (identifier && duplicateList && duplicateList.includes(identifier)) {
							            finalDuplicateImageName.push(value);
							        } else if (identifier && successList && successList.includes(identifier)) {
							            
							        } else {
							            finalFailedImageNameArray.push(value);
							        }
							    }else
							    	finalFailedImageNameArray.push(value);
							});
							
							if (finalDuplicateImageName.length > 0) 
								$('#duplicateIds').text("Already Uploaded : " + finalDuplicateImageName.toString());
						
							if (finalFailedImageNameArray.length > 0) {
								$('#failedIdsForCopy').val(finalFailedImageNameArray.toString());
								$('#tableCaption').text(' Failed :');
								$('#copyFailedIds').show();
								let tr = $('<tr>');
								let i = 0;
					
								for (i; i < finalFailedImageNameArray.length; i++) {
									let td = $('<td style="color:red;">');
									tr.append(td.append(finalFailedImageNameArray[i]));
					
									if (i > 0 && (i + 1) % 5 == 0) {
										$('#failTable').append(tr);
										tr = $('<tr>');
									}
								}
					
								if (i % 5 != 0) {
									if(i > 4) {
										while(i % 5 != 0) {
											let td = $('<td style="color:red;">');
											tr.append(td.append("-"));
											i++;
										}
									}
									
									$('#failTable').append(tr);
								}
							}
							hideLayer();
						},
						error: function(e) {
							console.log(e);
							hideLayer();
							showMessage('error', 'Some Error Occurred!');
						}
					})
				}
				$('#uploadingButton').show();
			}
		},
		error: function(e) {
			console.log(e);
			hideLayer();
			showMessage('error', 'Some Error Occurred!');
		}
	})
}

function validateDocumentBeforeUpload(id) {
	showLayer();
	
	$('#successIds').text("");
	$('#notFound').text("");
	$('#duplicateIds').text("");
	$('#sizeNotSupported').text("");
	$('#failTable').empty();
	$('#tableCaption').text("");
	$('#copyFailedIds').hide();
	
	$('#copyButtonSpan').text("Copy");
	$('#copyButtonSpan').removeClass("glyphicon-ok");
	$('#copyButtonSpan').addClass("glyphicon-copy");
	
	let validateFailForFormat 		= false;
	let validateFailForSize 		= false;
	let validateFailForFormatNames 	= "";
	let validateFailForSizeNames 	= "";
	
	if(document.getElementById(id) != null && document.getElementById(id).files.length > 0) {
		let doc = document.getElementById(id).files;
		let totalfilesSizeInKB = 0;
		wayBillIdsList = new Array();
		
		for (const element of doc) {
			let files 			= element;
			let sFileName 		= files.name;
			let fileSizeInKB 	= files.size / 1024;  //size in kb 
			let nameSplitArray	= sFileName.split('.');
		
			let sFileExtension	= nameSplitArray[nameSplitArray.length - 1].toLowerCase();
			
			if (!(sFileExtension === 'jpg' || sFileExtension === 'jpeg' || sFileExtension === 'png' ||  (flagForUploadPdf && sFileExtension === 'pdf'))) {
				validateFailForFormat = true;
				validateFailForFormatNames += files.name + ",";
			}
			
			if (fileSizeInKB > maxSizeOfFileToUpload) {//checking max size for photo
				validateFailForSize = true;
				validateFailForSizeNames += files.name + ",";
			}
		
			totalfilesSizeInKB += fileSizeInKB;
		
			if(!validateFailForFormat && !validateFailForSize)
				wayBillIdsList.push(nameSplitArray[0]);
		}
	
		if(validateFailForFormat || validateFailForSize) {
			if(validateFailForFormat) {
				$('#sizeNotSupported').text("Following file format is not supported: "+validateFailForFormatNames)
				showMessage('info', 'file format is not supported ');
			}
			
			if(validateFailForSize) {
				$('#notFound').text(" Following file crossing Max supported size "+validateFailForSizeNames)
				showMessage('info', 'file crossing Max supported size ');
			}
			
			hideLayer();
			bulkImageValidationFail = true;
			wayBillIdsList = null;
			return false;
		}
	
		if(totalfilesSizeInKB >= 60000) {
			showMessage('info', 'Total files size crossing 60 MB ');
			hideLayer();
			bulkImageValidationFail = true;
			wayBillIdsList = null;
			return false;	
		}
	
		hideLayer();
		bulkImageValidationFail = false;
		return true;
	} else {
		showMessage('info', 'Select Image to process first ');
		hideLayer();
	}
}

async function copyToClipboard(){
	let ids  = $('#failedIdsForCopy').val();
	
	if (ids != '') {
		try {
			await navigator.clipboard.writeText(ids);
			$('#copyButtonSpan').text("Copied !!")
			$('#copyButtonSpan').removeClass("glyphicon-copy")
			$('#copyButtonSpan').addClass("glyphicon-ok")
		} catch (e) {
			$('#copyButtonSpan').text("Copy")
			$('#copyButtonSpan').addClass("glyphicon-copy")
			$('#copyButtonSpan').removeClass("glyphicon-ok")
			console.log(e);
		}
	} else {
		$('#copyButtonSpan').text("Copy")
		$('#copyButtonSpan').addClass("glyphicon-copy")
		$('#copyButtonSpan').removeClass("glyphicon-ok")
	}
}

function showBulkImageModal(){
	$("#addBulkPhotoModal").modal('show');
}
