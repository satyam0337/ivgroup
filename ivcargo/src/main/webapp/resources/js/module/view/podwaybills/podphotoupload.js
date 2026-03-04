define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/podwaybills/loadpodwaybillmodelurls.js'//ModelUrls
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'elementmodel'
	,'elementTemplateJs'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (loadModelUrls, ElementTemplate, ElementModel, Elementtemplateutils) {
	'use strict';// this basically give strictness to this specific js
	let 
	_this = '',
	ElementModelArray,
	jsonObject,
	noOfFileToUpload,
	maxSizeOfFileToUpload,
	showRemarkOptionWhileUploadingPOD,
	uploadPdfInPod = false;
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
			showRemarkOptionWhileUploadingPOD			= jsonObjectData.showRemarkOptionWhileUploadingPOD;
			uploadPdfInPod			= jsonObjectData.uploadPdfInPod;
		}, render : function() {
			if(jsonObject.wayBillId > 0)
				_this.setElements();
		}, setElements : function() {
			ElementModelArray = loadModelUrls.elementCollection();
			
			let podPhotoFileArr	= new Array();
			
			for(let i = 1; i <= noOfFileToUpload; i++) {
				let podFileEle = JSON.parse(ElementModelArray);
				podFileEle.elementId 			= 'photo_' + i;
				podFileEle.elementName 			= 'photo_' + i;
				podFileEle.elementType 			= 'file';
				podFileEle.tooltipName 			= 'Select File';
				
				podPhotoFileArr.push(podFileEle);
			}
			
			ElementModelArray = loadModelUrls.remarkCollection();
			
			if(showRemarkOptionWhileUploadingPOD)
				podPhotoFileArr.push(JSON.parse(ElementModelArray));
			
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(podPhotoFileArr, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			setTimeout(_this.loadElements,200);

			hideLayer();
		},loadElements : function() {
			//load language is used to get the value of labels 
			initialiseFocus('.modal-body');
			
			for(let i = 1; i <= noOfFileToUpload; i++) {
				$("#photoModal").append('<div id="displayImg_' + i + '" class="img-wrap" style="display: none;"></div>');
				$("#displayImg_" + i).append('<span class="cross close_' + i +'">&times;</span>');
				let img = $('<img id="img_' + i + '">');
				img.attr('src', '');
				img.attr('style', '');
				img.attr('height', '150');
				img.attr('width', '150');
				img.appendTo('#displayImg_' + i);
			}
			
			$('.img-wrap .cross').css({"position" 			: "relative", 
										"top" 				: "2px", 
										"right" 			: "2px", 
										"z-index" 			: "100", 
										"padding" 			: "5px 2px 2px", 
										"color" 			: "#000", 
										"font-weight" 		: "bold",  
										"font-size" 		: "22px", 
										"border-radius" 	: "50%", 
										"background-color"	: "#FFF", 
										"cursor" 			: "pointer",
										"opacity" 			: "2",
										"line-height" 		: "10px"});
			
			$(".cross").hover(function(e) { 
			    $(this).css("background-color", e.type === "mouseenter" ? "red" : "transparent");
			    $(this).css("opacity", "1");
			})
			
			//genericfunctions.js
			if(!validateFileTypeAndSizeForMultiPhoto(noOfFileToUpload, maxSizeOfFileToUpload, uploadPdfInPod))
				return;
			
			_this.removeSelectedFile();
			
			$(".ok").on('click', function() {
				let jsonObjectNew 	= new Object();
				let totalFile		= 0;

				let $inputs = $('#photoModal :input');
				//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
				$inputs.each(function (index) {
					if($(this).val() != "") {
						let fileName	= $(this).attr('name');
			
						if (this.files && this.files[0]) {
							let FR	= new FileReader();

							FR.addEventListener("load", function(e) {
								jsonObjectNew[fileName] = e.target.result;
							}); 

							FR.readAsDataURL(this.files[0]);
						}
						
						totalFile++;
					}
				});

				if(jsonObject.wayBillId > 0)
					jsonObjectNew["waybillId"] = jsonObject.wayBillId;
				
				let remark = $.trim($("#remark").val());

				if(showRemarkOptionWhileUploadingPOD && remark == "") {
					showMessage('error', "Please Add Remark");
					return false;
				}
				
				jsonObjectNew["remark"] = $("#remark").val();
				
				if(totalFile == 0) {
					showMessage('error', selectFileToUploadErrMsg);
					return false;
				}
				console.log("jsonObjectNew---",jsonObjectNew);
				let btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Upload POD?",
					modalWidth 	: 	30,
					title		:	'Upload POD',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					console.log(jsonObjectNew);
					getJSON(jsonObjectNew, WEB_SERVICE_URL+'/podWayBillsWS/uploadPodWayBills.do', _this.onUpload, EXECUTE_WITH_ERROR); //submit JSON
					showLayer();
				});
			});
		}, onUpload : function(response) {
			if(response.message != undefined) {
				hideLayer();
				return;
			}
		}, removeSelectedFile : function() {
			for(let i = 1; i <= noOfFileToUpload; i++) {
				$("#displayImg_" + i + " .close_" + i).on('click', function() {
					let spanClass 	= $(this).attr('class');
					
					$('#displayImg_' + spanClass.split('_')[1]).attr('style', 'display: none');
					$('#img_' + spanClass.split('_')[1]).attr('src', '');
					$.trim($('#photo_' +  + spanClass.split('_')[1]).val(''));
				});
			}
		}
	});
});