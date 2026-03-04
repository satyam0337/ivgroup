define([ 'marionette'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,'/ivcargo/resources/js/module/view/photoservice/displayphotowithslider.js'
		,'JsonUtility'
		,'messageUtility'
		,PROJECT_IVUIRESOURCES + '/resources/js/module/redirectAfterUpdate.js'
		],
		function(Marionette, UrlParameter, PhotoWithSlider) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	isIDProofPhotoDetails	= false,
	bypassSession	= false, podPhotoNotFound = false, redirectTo = 0,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			isIDProofPhotoDetails	= UrlParameter.getModuleNameFromParam('isIDProofPhotoDetails');
			bypassSession			= UrlParameter.getModuleNameFromParam('bypassSession');
			redirectTo				= UrlParameter.getModuleNameFromParam('redirectFilter');
			jsonObject.masterid				= UrlParameter.getModuleNameFromParam('masterid');
			jsonObject.moduleId				= UrlParameter.getModuleNameFromParam('moduleId');
			jsonObject.bypassSession		= bypassSession;
			jsonObject.photoSignature		= UrlParameter.getModuleNameFromParam('photoSignature');
			jsonObject.getSignaturePhoto	= UrlParameter.getModuleNameFromParam('getSignaturePhoto');
			jsonObject.NoencodeImage		= UrlParameter.getModuleNameFromParam('NoencodeImage');
		}, render: function() {
			if(isIDProofPhotoDetails)
				getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/getIDProofPhotoDetail.do?', _this.renderPODPhotoService, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/getModuleWisePhotoDetail.do?', _this.renderPODPhotoService, EXECUTE_WITH_ERROR);
			
			return _this;
		}, renderPODPhotoService : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function(){ window.close(); }, 10000);
				return;
			}
			
			let loadelement		= new Array();
			let baseHtml		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/jsp/services/photoservice.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				
				let photoModel				= response.photoModel;
				let photoModelList			= response.photoModelList;
				let allowToDeletePhoto		= response.allowToDeletePhoto;
				podPhotoNotFound			= response.podPhotoNotFound;
				
				if(photoModelList != undefined) {
					if(photoModelList.length > 1) {
						$('#savePhotoMessage').html('Click to view or save Photo !');
						PhotoWithSlider.displayPhotoWithSlider(response);
					} else if(photoModelList[0] != undefined) {
						if(photoModelList[0].photoTransactionPhoto != undefined)
							_this.setImage(photoModelList[0].photoTransactionPhoto);
						else {
							$('#deleteBtn').remove();
							$('#downloadBtn').remove();
							$('.alert-dismissible').remove();
						}
						
						PhotoWithSlider.setIdProofDetails(photoModelList);
					} else
						podPhotoNotFound	= true;
				} else if(photoModel != undefined && photoModel.photoTransactionPhoto != undefined)
					_this.setImage(photoModel.photoTransactionPhoto);
				
				if(!allowToDeletePhoto || bypassSession)
					$('#deleteBtn').remove();
				
				$('#deleteBtn').on('click', function() {
					_this.deletePhoto();
				});
				
				if(podPhotoNotFound != undefined && podPhotoNotFound) {
					$('#downloadBtn').remove();
					$('#printBtn').remove();
					$('#savePhotoMessage').html('POD Photo Not Uploaded Proeprly, To Upload Again Delete Photo !');
				}
				
				$('#downloadBtn').on('click', function() {
					downloadAllImageAsZip('Photo_', photoModelList);
					
					showMessage('info', 'Photos downloaded successfuly, check your download folder !');
					setTimeout(function(){ window.close(); }, 3000);
				});
				
				if(response.showPODPrintButton) {
					$('#printBtn').removeClass('hide');
					 
					$('#printBtn').on('click', function () {
						if (response.photoModelList != undefined)
							_this.setPODPrintData(response);
					});
				}
			});
			
			hideLayer();
		}, setImage : function(photoTransactionPhoto) {
			$('#savePhotoMessage').html('Click on Photo to Download !');
			$('#photoService').removeClass('hide');
								
			let img = $('<img id="img">');
			img.attr('class', 'dl');
			img.attr('id', 'downloadableImage');
			img.attr('src', photoTransactionPhoto);
			img.attr('height', '400');
			img.attr('width', '400');
			img.appendTo('#photoService');
			
			saveImageOnClick();
		}, deletePhoto : function() {
			if(confirm("Are you sure, you want to delete !")) {
				showLayer();
				
				jsonObject.podPhotoNotFound = podPhotoNotFound;
				jsonObject.redirectTo		= redirectTo;
				
				if(isIDProofPhotoDetails)
					getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/deleteIDProofPhotoDetail.do?', _this.responseAfterDelete, EXECUTE_WITH_ERROR);
				else
					getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/deleteModuleWisePhotoDetail.do?', _this.responseAfterDelete, EXECUTE_WITH_ERROR);
			}
		}, responseAfterDelete : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				setTimeout(function() { 
					redirectToAfterUpdate(response);
				}, 2000);
			}
		}, setPODPrintData : function(response) {
			hideLayer();
			
			let path	= '/ivcargo/html/module/podPrint/podprint_' + response.accountGroupId + '.html';
			
			if(!urlExists(path)) path  = '/ivcargo/html/module/podPrint/podprint_default.html'; 
			
			$("#mainContent").load(path, function() {
				_this.triggerPrint(response);
			});
		}, triggerPrint: function(response) {
			try {
				const list = response.photoModelList;
		  
				if (!list?.length) {
					document.body.innerHTML = '<p>No photo(s) available to print.</p>';
					return;
				}

				list.forEach(p => {
					if (p.photoTransactionPhoto) {
						const div = document.createElement('div');
						div.className = 'photo-wrapper';
						div.innerHTML = `<img src="${p.photoTransactionPhoto}">`;
						document.getElementById('photoContainer')?.appendChild(div);
					}
				});

				setTimeout(() => window.print(), 800);
				setTimeout(function(){ window.close(); }, 2000);
			} catch (e) {
				document.body.innerHTML = '<p>Error loading photos.</p>';
				console.error(e);
			}
		}
	});
});
