define(
		[
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/module/view/uploadPdfDetails/pdfUpload.js',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 'autocomplete',
		 'autocompleteWrapper',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		],//PopulateAutocomplete
		 function(slickGridWrapper2, PDFUpload, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, myNodOP, myNodLR, myNodParty, myNodVehicle, gridObject,  _this, WAYBILL_NUMBER_SELECTION = 1, PARTY_SELECTION = 2
			, maxSizeOfFileToUpload	= 1024, allowToUploadDocumentForParty = false, moduleId, VEHICLE_SELECTION = 3, RELEASE_UPDATE_SELECTION = 4,
			noOfFileToUpload = 5;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/uploadPdfDetailsWS/getUploadPdfDetailsElement.do?', _this.renderPodWayBillsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPodWayBillsElements : function(response) {
					showLayer();
					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/module/uploadPdfDetails/uploadPdfDetails.html", function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject 		= Object.keys(response);
						$('#top-border-boxshadow').removeClass('hide');
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						$("*[data-attribute='wayBillNumberSearch']").addClass("hide");
						
						allowToUploadDocumentForParty	= response.allowToUploadDocumentForParty;
						
						let selectionArr	= response.selectionArr;
						
						let autoSelectionName 			= new Object();
						autoSelectionName.primary_key 	= 'selectionId';
						autoSelectionName.field 		= 'selectionName';
						autoSelectionName.callBack 		= _this.changeToGetData;
						$("#operationSelectionEle").autocompleteCustom(autoSelectionName);
						
						let autoSelectionNameInstance 	= $("#operationSelectionEle").getInstance();
		
						$(autoSelectionNameInstance).each(function() {
							this.option.source 			= selectionArr;
						});
							
						if(selectionArr.length == 1 && selectionArr[0].selectionId == RELEASE_UPDATE_SELECTION) {
							moduleId	= IVCARGO_RELEASE_UPDATE;
							_this.readConfiguration();
							
							$('#operationSelection').addClass('hide');
						}
						
						let elementConfiguration	= {};
						
						if(allowToUploadDocumentForParty) {
							response.partySelectionWithoutSelectize	= true;
							elementConfiguration.partyNameElement = $('#partyNameEle');
						}
						
						if(response.allowToUploadDocumentForVehicle) {
							response.vehicleSelection	= true;
							elementConfiguration.vehicleElement = $('#vehicleEle');
						}
						
						elementConfiguration.singleDateElement = $('#dateEle');
						
						response.isCalenderForSingleDate = $('#dateEle').exists();
						response.elementConfiguration = elementConfiguration;

						Selection.setSelectionToGetData(response);
							
						myNod = nod();
						myNod.configure({
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
						
						myNodVehicle = nod();
						myNodParty.configure({
							parentClass:'validation-message'
						});
							
						addAutocompleteElementInNode(myNod, 'operationSelectionEle', 'Select Operation !');
						addElementToCheckEmptyInNode(myNodLR, 'operationSelectionEle', 'Select Operation !');
						addElementToCheckEmptyInNode(myNodLR, 'wayBillNumberEle', 'Enter LR No. !');
						
						addElementToCheckEmptyInNode(myNodParty, 'operationSelectionEle', 'Select Operation !');
						addElementToCheckEmptyInNode(myNodParty, 'partyNameEle', 'Enter Party Name !');
						
						addElementToCheckEmptyInNode(myNodVehicle, 'operationSelectionEle', 'Select Operation !');
						addElementToCheckEmptyInNode(myNodVehicle, 'myNodVehicle', 'Enter Vehicle Number !');
							
						hideLayer();
						
						$("#findBtn").click(function() {
							if(myNod != undefined) {
								myNod.performCheck();
								
								if(myNod.areAll('valid'))
									_this.onFind();
							} else
								_this.onFind();
						});
					});
				}, changeToGetData : function() {
					$("#partySearch").addClass("hide");
					$("#wayBillNumberSearch").addClass("hide");
					$("#vehicleSearch").addClass("hide");
					$('#findButtonDiv').removeClass('hide');
					
					let selectionId			= $("#operationSelectionEle_primary_key").val();
					
					if(selectionId == WAYBILL_NUMBER_SELECTION) { //for LR
						$("#wayBillNumberSearch").removeClass("hide");
						myNod	= myNodLR;
						moduleId	= BOOKING;
					} else if(selectionId == PARTY_SELECTION) { //for Party
						$("#partySearch").removeClass("hide");
						myNod	= myNodParty;
						moduleId	= PARTY_MASTER;
					} else if(selectionId == VEHICLE_SELECTION) { //for Party
						$("#vehicleSearch").removeClass("hide");
						myNod	= myNodVehicle;
						moduleId	= VEHICLE_NUMBER_MASTER;
					} else
						myNod	= myNodOP;
						
					if(selectionId == RELEASE_UPDATE_SELECTION) { //for Release Update)
						moduleId	= IVCARGO_RELEASE_UPDATE;
						$('#findButtonDiv').addClass('hide');
					}
					
					$('#uploadButtonDiv').addClass('hide');
					$('#uploadDetails').addClass('hide');
					$('#uploadDetailsFiles').empty();
					_this.readConfiguration();
					
					$('#middle-border-boxshadow').addClass('hide');
				}, readConfiguration : function() {
					let jsonObject 			= new Object();
					jsonObject.moduleId		= moduleId;
					getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getConfigurationByModule.do', _this.setConfigurationData, EXECUTE_WITH_ERROR);
				}, setConfigurationData : function(response) {
					maxSizeOfFileToUpload			= response.maxSizeOfFileToUpload;
					noOfFileToUpload				= response.noOfFileToUpload;
					
					if(moduleId == IVCARGO_RELEASE_UPDATE) {
						_this.createFieldsToUploadFiles();
						
						if(!validateFileTypeAndSizeForUploadPdf(noOfFileToUpload, maxSizeOfFileToUpload))
							return;
						
						$('#uploadBtn').off('click');
						
						_this.uploadFiles();
					}
				}, createFieldsToUploadFiles : function() {
					for(let i = 1; i <= noOfFileToUpload; i++) {
						let pdfFileEle = new Object();
						pdfFileEle.id 				= 'document_' + i;
						pdfFileEle.name 			= 'document_' + i;
						pdfFileEle.type 			= 'file';
						pdfFileEle.class 			= 'form-control custom-file-input';
						pdfFileEle.style 			= 'width:500px;';
						pdfFileEle.tooltip	 		= 'Select File';
						
						let div	= $('<div class="form-group custom-file"></div>');
							
						createInput(div, pdfFileEle);
						
						$('#uploadDetailsFiles').append(div);
					}
					
					$('#uploadDetails').removeClass('hide');
					$('#uploadButtonDiv').removeClass('hide');
				}, onFind : function() {
					showLayer();
					let jsonObject 			= new Object();
					
					jsonObject.wayBillNumber		= $('#wayBillNumberEle').val().trim();
					jsonObject.moduleId				= moduleId;
					
					let selectionId			= $("#operationSelectionEle_primary_key").val();
					
					if(selectionId == WAYBILL_NUMBER_SELECTION)
						getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getAllUploadedPdfDetailsForWaybill.do', _this.setWayBillDetailsData, EXECUTE_WITH_ERROR);
					else if(selectionId == PARTY_SELECTION)	{
						jsonObject.id		= $('#partyNameEle_primary_key').val();
						getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getPartyDocumentsByCorporateId.do', _this.setWayBillDetailsData, EXECUTE_WITH_ERROR);
					} else if(selectionId == VEHICLE_SELECTION) {
						jsonObject.id		= $('#vehicleEle_primary_key').val();
						getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getDownloadPdfDataDetails.do', _this.setWayBillDetailsData, EXECUTE_WITH_ERROR);
					}
				}, setWayBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#middle-border-boxshadow').addClass('hide');
						return;
					}
					
					let selectionId			= $("#operationSelectionEle_primary_key").val();
					
					if(selectionId == WAYBILL_NUMBER_SELECTION) {
						$('#wayBillNumberEle').val("");
						$('#wayBillNumberEle').focus();
					} else if(selectionId == PARTY_SELECTION) {
						$('#partyNameEle').val("");
						$('#partyNameEle_primary_key').val(0);
						$('#partyNameEle').focus();
					} else if(selectionId == VEHICLE_SELECTION) {
						$('#vehicleEle').val("");
						$('#vehicleEle_primary_key').val(0);
						$('#vehicleEle').focus();
					}
					
					if(response.CorporateAccount != undefined) {
						let language = {};
						hideAllMessages();
						$('#middle-border-boxshadow').removeClass('hide');
						language.partialheader	= 'Upload';
						response.Language		= language;
						response.tableProperties.callBackFunctionForPartial = _this.getWindowToUploadPDF;
						gridObject = slickGridWrapper2.setGrid(response);
					}
					
					hideLayer();
				}, getWindowToUploadPDF : function(grid, dataView, row) {
					let jsonObject 		= new Object();
					let uploadedPdfCount	= 0;
					
					if(dataView.getItem(row).wayBillId != undefined && dataView.getItem(row).wayBillId > 0) {
						jsonObject["wayBillId"] 	= dataView.getItem(row).wayBillId;
						uploadedPdfCount			= dataView.getItem(row).uploadedPdfCount;
					}
					
					if(Number(uploadedPdfCount) <= 0) {
						alert("Documents Already Uploaded !");
						hideLayer();
						return false;
					}
					
					jsonObject.moduleId				 = moduleId;

					let object 						= new Object();
					object.elementValue	 			= jsonObject;
					object.gridObj 					= gridObject;
					object.noOfFileToUpload 		= uploadedPdfCount;
					object.maxSizeOfFileToUpload 	= maxSizeOfFileToUpload;
					object.moduleId				 	= moduleId;

					let btModal = new Backbone.BootstrapModal({
						content		: new PDFUpload(object),
						modalWidth 	: 50,
						title		:'Upload Document',
						okText		: 'Upload',
						showFooter	: true,
						modalBodyId	: 'documentModel'
					}).open();
					
					object.btModal = btModal;
					
					new PDFUpload(object);
					btModal.open();
				}, uploadFiles : function() {
					$("#uploadBtn").on('click', function() {
						let jsonObjectNew 	= new Object();
						let totalFile		= 0;

						let $inputs = $('#uploadDetailsFiles :input');
						//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
						$inputs.each(function (index) {
							if($(this).val() != "") {
								let fileName	= $(this).attr('name');
								let nameArr		= fileName.split('_');
								let pdfFileName	= "pdfFileName_" + nameArr[1];
	
								if (this.files && this.files[0]) {
									let FR	= new FileReader();
									jsonObjectNew[pdfFileName] = this.files[0]['name']
													
									FR.addEventListener("load", function(e) {
										jsonObjectNew[fileName] = e.target.result;
									}); 
	
									FR.readAsDataURL(this.files[0]);
								}
												
								totalFile++;
							}
						});

						jsonObjectNew["noOfFileToUpload"]	= noOfFileToUpload;
						jsonObjectNew["moduleId"]			= moduleId;
						
						if($('#dateEle').exists())
							jsonObjectNew["fromDate"]			= $('#dateEle').val();
										
						if(totalFile == 0) {
							showAlertMessage('error', selectFileToUploadErrMsg);
							return false;
						}
						
						if(confirm('Are you sure you want to Upload Document?')) {
							showLayer();
							getJSON(jsonObjectNew, WEB_SERVICE_URL+'/uploadPdfDetailsWS/uploadPdfWayBills.do', _this.onUpload, EXECUTE_WITH_ERROR); //submit JSON
						}
					});
				}, onUpload : function(response) {
					hideLayer();
					
					for(let i = 1; i <= noOfFileToUpload; i++) {
						$('#document_' + i).val('');
					}
				}
			});
});