define([
		'selectizewrapper',
		'JsonUtility',
		'messageUtility',
		'nodvalidation',
		'focusnavigation',
		PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap5-modal.js'],//PopulateAutocomplete
		function(Selectizewrapper) {
		'use strict';
		let _this = '', jsonObject = new Object(), myNod, photoMasterIds, modal1, noOfFileToUpload, maxSizeOfFileToUpload, deleteAll = false;
		return Marionette.LayoutView.extend({
			initialize : function() {
				_this = this;
			}, render : function() {
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/photoMasterWS/getPhotoMasterElementConfiguration.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
				return _this;
			}, renderElements : function(response) {
				showLayer();

				let loadelement = new Array();
				let baseHtml 	= new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/master/photoMaster/photoMaster.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					hideLayer();
					
					noOfFileToUpload		= response.noOfFileToUpload;
					maxSizeOfFileToUpload	= response.maxSizeOfFileToUpload;
						
					_this.setBranches(response.branchList);

					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
						
					myNod.add({
						selector		: '#branchEle',
						validate		: 'presence',
						errorMessage	: 'Select Branch !'
					});
						
					$("#branch-level").click(function(){
						$("#branch-select").removeClass("hide");
						$("#upload-control").removeClass("hide");
					});
						
					$("#group-level").click(function(){
						$("#branch-select").addClass("hide");
						$("#upload-control").removeClass("hide");
					});
					
					$("#upload").click(function(event) {
						_this.uploadImages(event);
					});
						
					$("#delete-photos").click(function(){
						$("#foraddphoto").addClass("hide");
						$("#fordeletephoto").removeClass("hide");
						
						if($("input[id='branch-delete']:checked").val() == 2)
							_this.displayBranches();
					});
						
					$("#deleteBranches").click(function() {
						_this.deleteBranches();
					});
					
					$('.updateButton').click(function() {
						modal1.hide();
						
						if($("input[name='option']:checked").val() == 'delete') {
							showLayer();
							deleteAll	= true;
							let jsonObject = new Object();
							jsonObject.photoMasterIds 	= photoMasterIds;
							getJSON(jsonObject, WEB_SERVICE_URL+'/photoMasterWS/deletePhotosForBranches.do', _this.onDelete, EXECUTE_WITHOUT_ERROR);
						} else if($("input[name='option']:checked").val() == 'add') {
							let jsonObjectNew	= _this.getDetailsToUploadPhoto();
							
							setTimeout(function() {
								if(jsonObjectNew != null) {
									showLayer();
									getJSON(jsonObjectNew, WEB_SERVICE_URL+'/photoMasterWS/uploadPhotos.do', _this.onUpload, EXECUTE_WITH_ERROR);
								}
							}, 1500);
						}
					});
					
					$('.cancelButton').click(function() {
						$(".modal-body").empty();
						$('.updateButton').removeClass('hide');
					});

					$("#add-photos").click(function() {
						$("#fordeletephoto").addClass("hide");
						$("#foraddphoto").removeClass("hide");
						$("#middle-border-boxshadow").addClass("hide");
					});

					$("#group-delete").click(function() {
						$("#branch-to-delete").addClass("hide");
						$("#branches-div").addClass("hide");
						_this.showTable();
					});

					$("#branch-delete").click(function() {
						$("#branch-to-delete").removeClass("hide");
						$("#middle-border-boxshadow").addClass("hide");
						$("#branches-div").removeClass("hide");
						_this.displayBranches();
					});

					$("#ok").click(function() {
						_this.showTable();
						$("#activebranches").empty();
					});
				});
			}, setBranches : function(allDataList) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	allDataList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	(allDataList).length
				});
			}, uploadImages : function(event) {
				//to check if the remarks are provided or not
				let textField = $("#remark").val();
				
				//to check at least on file is to be uploaded
				let fileInput = document.getElementById("uploadimage");
				let files = fileInput.files;
				//to check if atleast one radio is selected
				let radios = document.getElementsByName("level");
				let isChecked = false;
				  // Iterate through the radio buttons
				for (const element of radios) {
					if (element.checked) {
						isChecked = true;
						break;
					}
				}
					  
				if (!isChecked ) { //if no radio is selected
					showMessage('error', "Please select an option");
					event.preventDefault(); // Prevent form submission
				} else if(files.length === 0) {
					showMessage('error', "Please select a file");
					event.preventDefault();												
				} else if(textField == "") {
					showMessage('error', ramarkErrMsg);
					event.preventDefault();
				} else {
					files = $('#uploadimage').prop('files');
					
					if(files.length > noOfFileToUpload) {
						showMessage('error', "Images Cannot be Greater than " + noOfFileToUpload + " !");
					} else {
						modal1 = new bootstrap.Modal(document.getElementById('staticBackdrop'));
						modal1.show();
						
						$(".modal-body").html("Are you sure you want to Upload Image?");
						$('.modal-title').html("Upload Photos");
					}
				}
			}, getDetailsToUploadPhoto : function() {
				let jsonObjectNew = new Object();
				jsonObjectNew.description = $("#remark").val();
				
				let count 		= 0;
				
				if(!validateFileTypeAndSizeForMultipartPhotos(maxSizeOfFileToUpload, 'uploadimage'))
					return null;

				let files = $('#uploadimage').prop('files');
							
				$.each(files, function(index, file) {
					let reader = new FileReader();
								  	
					reader.onload = function(event) {
						jsonObjectNew['file_' + count]		= file.name;
						jsonObjectNew['values_' + count]	= event.target.result;
						count++;
					};
								 	
					reader.readAsDataURL(file);
				});
				
				let branches = [];
				let radioButtons = document.getElementsByName("level");
						
				for (const element of radioButtons) {
					if (element.checked && element.value == 2) {
						$("#branchEle_wrapper .item").each(function() {
							branches.push($(this).attr("data-value"));
						});
					}
				}
									
				jsonObjectNew.branchs 	= branches.join(",");
				
				return jsonObjectNew;
			}, onUpload : function(response) {
				hideLayer();
				
				if(response.message != undefined) {
					let successMessage = response.message;
					showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
				}
				
				$("#remark").val('');
				$("#uploadimage").val('');
			}, displayBranches : function() {
				let	jsonNew = new Object();
				getJSON(jsonNew, WEB_SERVICE_URL+'/photoMasterWS/getBranchesForPhoto.do', _this.onDisplay, EXECUTE_WITHOUT_ERROR);
			}, onDisplay : function(response) {
				_this.showActiveBranches(response);
			}, deleteBranches : function() {
				modal1 = new bootstrap.Modal(document.getElementById('staticBackdrop'));
				modal1.show();
						
				$(".modal-body").html("Are you sure you want to Delete All Photos?");
				$('.modal-title').html("Delete All Photos");
			}, onDelete : function(response) {
				hideLayer();
				
				if(response.message != null) {
					let successMessage = response.message;
					showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
				
					if(deleteAll && (successMessage.type == MESSAGE_TYPE_SUCCESS || successMessage.type == MESSAGE_TYPE_INFO)) {//success
						setTimeout(function() {
							location.reload();
						}, 500);
					}
				}
				
				if($('#currentBookingChargesTable tr').length == 1) {
					$("#middle-border-boxshadow").addClass("hide");
					$("#activebranches").empty();
				}
			}, showActiveBranches : function(response) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchElement',
					create			: 	false,
					maxItems		: 	1
				});
			}, showTable : function() {
				let sourceBranchId	= 0;
				let radioButtons = document.getElementsByName("delete");
					
				for (const element of radioButtons) {
					if (element.checked && element.value == 2)
						sourceBranchId = $('#branchElement').val();
				}
					
				let newJSON = new Object();
				newJSON.sourceBranchId = sourceBranchId;
				getJSON(newJSON, WEB_SERVICE_URL+'/photoMasterWS/showImageForBranches.do', _this.onImagesToDelete, EXECUTE_WITHOUT_ERROR);
			}, onImagesToDelete : function(response) {
				if(response.message != null) {
					let successMessage = response.message;
					showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
					return;				
				}
				
				$("#middle-border-boxshadow").removeClass("hide");
				$("#branches-div").removeClass("hide");
				$("#activebranches").empty();
				
				let imagedata 	= response.photosList;
				photoMasterIds	= response.photoMasterIds;
				let tablebody 	= $("#activebranches");
					
				for(let i = 0; i < imagedata.length; i++) {
					let checkCell	= $("<td>").text(i + 1);
					let branchCell 	= $("<td>").text("Image" + (i + 1));
					//view button
					let actionsCell = $("<td>");
					let viewButton = $("<button>").text("View").addClass("btn btn-primary me-2").click(function() {
						$("#images-container").empty();
						_this.viewImage(imagedata, i);
					});
					
					viewButton.css("margin-right", "10px");
			
					let deleteButton = $("<button>").text("Delete").addClass("btn btn-danger").click(function() {
						_this.deleteImages(imagedata, i);
					});
			
					actionsCell.append(viewButton, deleteButton);
					//creating new row
					let row = $("<tr id = 'tr_" + imagedata[i].photoMasterId + "'>");
					row.append(checkCell, branchCell, actionsCell);
					//inserting the row in the table body
					tablebody.append(row);
				}
			}, viewImage : function(imagedata, index) {
				let imageElement = $("<img width = '100%'>").attr("src", imagedata[index].imageData);
				
				modal1 = new bootstrap.Modal(document.getElementById('staticBackdrop'));
				modal1.show();
				
				$(".modal-body").append(imageElement);
				$('.modal-title').html("View Photos");
				$('.updateButton').addClass('hide');
			}, deleteImages : function(imagedata, index) {
				let jsonObj = new Object();
				jsonObj.photoMasterId = imagedata[index].photoMasterId;
				getJSON(jsonObj, WEB_SERVICE_URL+'/photoMasterWS/deleteImagesForBranch.do', _this.onDelete, EXECUTE_WITHOUT_ERROR);
				$('#tr_' + imagedata[index].photoMasterId).remove();
			}
		}); 
	});