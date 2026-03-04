/**
 * Anant 29-May-2025 9:31:30 pm 2025
 */
define([
	'marionette',
	'/ivcargo/resources/js/generic/urlparameter.js',
	'selectizewrapper',
	'JsonUtility',
	'messageUtility',
	'focusnavigation',
	'nodvalidation'
], function (Marionette, UrlParameter, Selectizewrapper) {
	'use strict';
	let _this = this, devideSection = 3, jsonObject, redirectFilter = 0, addModel = null;

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
		}, render: function () {
			jsonObject	= {};
			jsonObject.redirectFilter	= redirectFilter;
			jsonObject.bypassSession	= redirectFilter == 1;
			getJSON(jsonObject, WEB_SERVICE_URL + '/ivcargoTrainingMaterialsWS/initialiseTrainingMaterials.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setGroup: function (response) {
			let loadelement = [];
			let baseHtml = $.Deferred();
			loadelement.push(baseHtml);
						
			$("#mainContent").load("/ivcargo/html/master/ivcargoTrainingMaterials.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function () {
				initialiseFocus();
				
				_this.setModuleIdList(response);
					
				addModel 	= new bootstrap.Modal(document.getElementById('staticBackdropAdd'));
				
				$("#storeMaterials").click(function() {
					addModel.show();
				});
				
				$("#viewMaterials").click(function() {
					_this.viewVideos();
				});
				
				$(".addButton").click(function() {
					_this.insertVideos();
				});
				
				$(".cancelAddButton").click(function() {
					_this.resetDetails();
				});
			});

			hideLayer();
		}, setModuleIdList : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.allModuleList,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'moduleIdEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, viewVideos : function() {
			$('#tutorial').empty();
			
			let jsonObject = {};
			jsonObject.redirectFilter = redirectFilter;
			jsonObject.bypassSession = redirectFilter == 1;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/ivcargoTrainingMaterialsWS/getTrainingMaterials.do?', function(response) {
				if (response.ivcargoTrainingMaterials != undefined)
					_this.setTutorialVideos(response.ivcargoTrainingMaterials);
				else
					showAlertMessage('error', 'No videos found');
			}, EXECUTE_WITHOUT_ERROR);
		}, setTutorialVideos : function(tutorial) {
			let i = 0;
			let j = 0;
						
			for(const obj of tutorial) {
				let link	= getIdOfYoutube(obj.link);
								
				if(i % devideSection === 0) {
					$( "<div/>", {
					  "class": "row marginBottom20px wrapper-flexbox content" + "_tutorial_" + i
					}).appendTo( "#tutorial");
					
					j = i;
				}
				
				let text	= '<div class="col-sm"><div class="card">';
				text		+= '<div class="card-header text-dark text-center">'+ obj.title + '</div>';
				text		+= '<div class="view overlay fakeimg embed-responsive"><section class="videowrapper ytvideo"><a href="javascript:void(0);" class="close-button"></a><div class="gradient-overlay"></div>';
				text		+= '<iframe class="embed-responsive-item" width="400" src="https://www.youtube.com/embed/' + link + '?enablejsapi=1&amp;?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></section></div>';			
				text		+= '<div class="card-body w3-container"><h6>Published On ' + obj.publishedOn + '</h6>' + obj.content + '</div></div></div>';
				
				$('.content' + '_tutorial_' + j).append(text);
							
				i++;
			}
		}, insertVideos : function() {
			if($('#moduleIdEle').val() == '' || $('#moduleIdEle').val() == 0) {
				showAlertMessage('error', 'Please Select Module');
				$('#moduleIdEle').focus();
				return;
			}
			
			if($('#title').val() == '') {
				showAlertMessage('error', 'Please Enter Title');
				$('#title').focus();
				return;
			}
			
			if($('#link').val() == '') {
				showAlertMessage('error', 'Please Enter Link');
				$('#link').focus();
				return;
			}
			
			let jsonObject = {};
			let jsonObjectArr = [];
			
			jsonObject.title	= $('#title').val();
			jsonObject.link		= $('#link').val();
			jsonObject.content	= $('#content').val();
			jsonObject.moduleId	= $('#moduleIdEle').val();
			jsonObject.isVisible= $('#isVisible').prop('checked');
			
			jsonObjectArr.push(jsonObject);
			
			jsonObject = {};
			jsonObject.insertArray  	= JSON.stringify(jsonObjectArr);
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/ivcargoTrainingMaterialsWS/insertTrainingMaterials.do?', _this.setSuccess, EXECUTE_WITHOUT_ERROR);
		}, setSuccess : function (response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
				return;
			
			if(addModel != null) addModel.hide();
			
			_this.resetDetails();
			
			refreshCache(IVCARGO_TRAINING_MATERIALS_MASTER, 0);
		}, resetDetails : function() {
			$('#title').val('');
			$('#link').val('');
			$('#content').val('');
			
			if($('#moduleIdEle')[0] != undefined)
				$('#moduleIdEle')[0].selectize.clear();
		
			$('#isVisible').prop('checked', true);
		}
	});
});
