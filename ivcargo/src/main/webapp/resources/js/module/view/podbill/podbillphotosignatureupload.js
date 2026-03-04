define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/podbill/loadpodbillmodelurls.js'//ModelUrls
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/podbill/podbillsfilepath.js'
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	], function (loadModelUrls,FilePath,ElementTemplate,Language,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	let _this = '',
	ElementModelArray,
	SignatureModelArray,
	LangKeySet,
	btModal,
	jsonObject,
	noOfFileToUpload,
	maxSizeOfFileToUpload,
	noOfFileToUploadForSignature,
	uploadPdfInPod = false;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 					= this;
			jsonObject 				= jsonObjectData.elementValue;
			btModal					= jsonObjectData.btModal;
			noOfFileToUpload		= jsonObjectData.noOfFileToUpload;
			maxSizeOfFileToUpload	= jsonObjectData.maxSizeOfFileToUpload;
			noOfFileToUploadForSignature	= jsonObjectData.noOfFileToUploadForSignature;
		},
		render: function(){
			if(jsonObject.billId > 0) {
				_this.setElements();
			}
		},setElements : function() {
			ElementModelArray = loadModelUrls.photoCollection();
			
			let podPhotoFileArr	= new Array();
			
			for(let i = 1; i <= noOfFileToUpload; i++) {
				let podFileEle = JSON.parse(ElementModelArray);
				podFileEle.elementId 			= 'photo_' + i;
				podFileEle.elementName 			= 'photo_' + i;
				podFileEle.elementType 			= 'file';
				podFileEle.tooltipName 			= 'Select Photo File';
				
				podPhotoFileArr.push(podFileEle);
			}
			
			SignatureModelArray = loadModelUrls.signatureCollection();
			
			for(let i = 1; i <= noOfFileToUploadForSignature; i++) {
				let podFileEle = JSON.parse(SignatureModelArray);
				podFileEle.elementId 			= 'signature_' + i;
				podFileEle.elementName 			= 'signature_' + i;
				podFileEle.elementType 			= 'file';
				podFileEle.tooltipName 			= 'Select Signature File';
				
				podPhotoFileArr.push(podFileEle);
			}
			
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(podPhotoFileArr, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			setTimeout(_this.loadElements,200);

			hideLayer();
		},loadElements : function() {
			//load language is used to get the value of labels 
			let langObj = FilePath.loadLanguage();
			loadLanguageWithParams(langObj);
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
			
			for(let i = 1; i <= noOfFileToUploadForSignature; i++) {
				$("#photoModal").append('<div id="displaySign_' + i + '" class="img-wrap" style="display: none;color:green"></div>');
				$("#displaySign_" + i).append('<span class="cross close_' + i +'">&times;</span>');
				let img = $('<img id="sign_' + i + '">');
				img.attr('src', '');
				img.attr('style', '');
				img.attr('height', '150');
				img.attr('width', '150');
				img.appendTo('#displaySign_' + i);
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
			
			if(!validateFileTypeAndSizeForMultiPhoto(noOfFileToUpload, maxSizeOfFileToUpload, uploadPdfInPod))
				return;
			
			_this.removeSelectedFile();
			
			$(".ok").on('click', function() {
				let jsonObjectNew 	= new Object();
				let totalFile		= 0;
				let totalSignature	= 0;
				let $inputs = $('#photoModal :input');
				//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
				$inputs.each(function (index) {
					let elmId = $(this).attr("id");
					let documentType = elmId.split('_')[0];
					if(documentType == 'photo'){
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
					} else if(documentType == 'signature'){
						if($(this).val() != "") {
							let fileName	= $(this).attr('name');

							if (this.files && this.files[0]) {

								let FR	= new FileReader();

								FR.addEventListener("load", function(e) {
									jsonObjectNew[fileName] = e.target.result;
								}); 

								FR.readAsDataURL(this.files[0]);
							}
							
							totalSignature++;
						}
					}
					
				});

				if(jsonObject.billId > 0) {
					jsonObjectNew["billId"] = jsonObject.billId;
					jsonObjectNew["billNumber"] = jsonObject.billNumber;
				}
				
				if(totalFile == 0) {
					showMessage('error', selectFileToUploadErrMsg);
					return false;
				}

				let btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Upload POD?",
					modalWidth 	: 	30,
					title		:	'Upload POD',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	false
				}).open();

				btModalConfirm.on('ok', function() {
					console.log(jsonObjectNew);
					getJSON(jsonObjectNew, WEB_SERVICE_URL+'/podBillWS/uploadPodOfBillFromUI.do', _this.onUpload, EXECUTE_WITH_ERROR); //submit JSON
					showLayer();
				});
			});
		}, onUpload : function(response) {
			if(response.message.typeName != undefined) {
				hideLayer();
				setTimeout(function(){redirectToAfterUpdate(response)}, 1500);
				setTimeout(() => { window.close() },1500); 
			}
			
			hideLayer();
		}, removeSelectedFile : function() {
			for(let i = 1; i <= noOfFileToUpload; i++) {
				$("#displayImg_" + i + " .close_" + i).on('click', function() {
					let spanClass 	= $(this).attr('class');
					
					$('#displayImg_' + spanClass.split('_')[1]).attr('style', 'display: none');
					$('#img_' + spanClass.split('_')[1]).attr('src', '');
					$.trim($('#photo_' +  + spanClass.split('_')[1]).val(''));
				});
			}
			
			for(let i = 1; i <= noOfFileToUpload; i++) {
				$("#displaySign_" + i + " .close_" + i).on('click', function() {
					let spanClass 	= $(this).attr('class');
					
					$('#displaySign_' + spanClass.split('_')[1]).attr('style', 'display: none');
					$('#sign_' + spanClass.split('_')[1]).attr('src', '');
					$.trim($('#signature_' +  + spanClass.split('_')[1]).val(''));
				});
			}
		}
	});
});