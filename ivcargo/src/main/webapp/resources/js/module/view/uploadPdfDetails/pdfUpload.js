define([
	'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'elementmodel'
	,'elementTemplateJs'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (ElementTemplate, ElementModel, Elementtemplateutils) {
	'use strict';// this basically give strictness to this specific js
	let 
	_this = '',
	jsonObject,
	noOfFileToUpload,
	maxSizeOfFileToUpload, fileTypes;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 					= this;
			jsonObject 				= jsonObjectData.elementValue;
			noOfFileToUpload		= jsonObjectData.noOfFileToUpload;
			maxSizeOfFileToUpload	= jsonObjectData.maxSizeOfFileToUpload;
			fileTypes				= jsonObjectData.fileTypes;
		}, render : function() {
			if(jsonObject.wayBillId > 0)
				_this.setElements();
		}, setElements : function() {
			
			let pdfFileArr	= new Array();
			
			for(let i = 1; i <= noOfFileToUpload; i++) {
				let pdfFileEle = new Object();
				pdfFileEle.elementId 			= 'document_' + i;
				pdfFileEle.elementName 			= 'document_' + i;
				pdfFileEle.elementType 			= 'file';
				pdfFileEle.tooltipName 			= 'Select File';
				
				pdfFileArr.push(pdfFileEle);
			}
			
			Elementtemplateutils.appendElementInTemplate(pdfFileArr, ElementModel, ElementTemplate, _this);
			setTimeout(_this.loadElements,200);

			hideLayer();
		}, loadElements : function() {
			initialiseFocus('.modal-body');
			
			for(let i = 1; i <= noOfFileToUpload; i++) {
				$("#documentModel").append('<div id="displayPdf_' + i + '" class="pdf-container" style="display: none;"></div>');
				$("#displayPdf_" + i).append('<span class="cross close_' + i +'">&times;</span>');
				
				let iframe = $('<iFrame id="pdf_' + i + '">');
				iframe.attr('src', ''); 
				iframe.attr('style', ''); 
				iframe.attr('height', '140');
				iframe.attr('width', '180');
				iframe.appendTo('#displayPdf_' + i);
			}
			
			$('.pdf-container').css({
				"width" : "100px",
				"height" : "200px",
				"background-size": "cover"
			});
										
			$(".cross").hover(function(e) { 
			    $(this).css("background-color", e.type === "mouseenter" ? "red" : "transparent");
			    $(this).css("opacity", "1");
			    $(this).css("height", "30px");
			})
			
			//genericfunctions.js
			if(fileTypes != null && fileTypes.length > 0) {
				if(!validateDifferentFileTypeAndSize(noOfFileToUpload, maxSizeOfFileToUpload, fileTypes))
					return;
			} else if(!validateFileTypeAndSizeForUploadPdf(noOfFileToUpload, maxSizeOfFileToUpload))
				return;
			
			_this.removeSelectedFile();
			
			$(".ok").on('click', function() {
				let jsonObjectNew 	= new Object();
				let totalFile		= 0;

				let $inputs = $('#documentModel :input');
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

				jsonObjectNew["id"] 				= jsonObject.wayBillId;
				jsonObjectNew["noOfFileToUpload"]	= noOfFileToUpload;
				jsonObjectNew["moduleId"]			= jsonObject.moduleId;
				
				if(totalFile == 0) {
					showMessage('error', selectFileToUploadErrMsg);
					return false;
				}

				let btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Upload Document?",
					modalWidth 	: 	30,
					title		:	'Upload Document',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					getJSON(jsonObjectNew, WEB_SERVICE_URL+'/uploadPdfDetailsWS/uploadPdfWayBills.do', _this.onUpload, EXECUTE_WITH_ERROR); //submit JSON
					showLayer();
				});
			});
		}, onUpload : function(response) {
			$('#bottom-border-boxshadow').addClass('hide');
			hideLayer();
		}, removeSelectedFile : function() {
			for(let i = 1; i <= noOfFileToUpload; i++) {
				$("#displayPdf_" + i + " .close_" + i).on('click', function() {
					let spanClass 	= $(this).attr('class');
					
					$('#displayPdf_' + spanClass.split('_')[1]).attr('style', 'display: none');
					$('#pdf_' + spanClass.split('_')[1]).attr('src', '');
					$.trim($('#document_' +  + spanClass.split('_')[1]).val(''));
				});
			}
		}
	});
});