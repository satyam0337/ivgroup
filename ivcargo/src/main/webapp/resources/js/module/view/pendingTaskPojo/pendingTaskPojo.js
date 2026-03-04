define([ 'marionette'
		 ,'selectizewrapper'
		  ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
		,'messageUtility'
		,'jquerylingua'
		,'language'
		,'nodvalidation'
		 ,'focusnavigation'
		],
		function(Marionette, Selectizewrapper, Selection) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	_this = '', modal1 = null, accountGroupSelection = false, validateAllFields = false, myNod;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/pendingTaskPojoWS/getListForPojo.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/pendingTaskPojo/pendingTaskPojo.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				// all Data in response
				accountGroupSelection	= response.accountGroupList != undefined && (response.accountGroupList).length > 0
				
				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.accountGroupSelection		= accountGroupSelection;
				response.sourceAreaSelection		= true;
				response.AllOptionsForRegion		= false;
				response.AllOptionsForSubRegion		= false;
				response.AllOptionsForBranch		= false;
				response.isRegionOnGroupSelection	= true;
	
				Selection.setSelectionToGetData(response);
				
				validateAllFields	= response.validateAllFields;
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				_this.setPojoList(response.pojoList);
				
				$('#processTask').click(function() {
					if($('#pojoNameEle').val() > 0) {
						if(validateAllFields) {
							myNod.performCheck();
						
							if(myNod.areAll('valid'))
								_this.processTask();
						} else
							_this.processTask();
					}
				});
				
				hideLayer();
			});
		}, setPojoList : function(pojoListHM) {
			let pojoList = [];
			
			for(let key in pojoListHM) {
				let obj	= {};
				
				obj.pojoId		= key;
				obj.pojoName	= pojoListHM[key];
				
				pojoList.push(obj);
			}
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	pojoList,
				valueField		:	'pojoId',
				labelField		:	'pojoName',
				searchField		:	'pojoName',
				elementId		:	'pojoNameEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _this.showFields
			});
		}, showFields : function() {
			showLayer();
						
			let jsonObject 			= new Object();
						
			jsonObject.pojoId		= $('#pojoNameEle').val();
						
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingTaskPojoWS/showFields.do', _this.showHideDetails, EXECUTE_WITHOUT_ERROR);
		}, showHideDetails : function(response) {
			hideLayer();
			
			if(response.emailAddress) {
				$("*[data-attribute=emailAddress]").removeClass("hide");
				
				myNod.add({
					selector		: '#emailAddressEle',
					validate		: ['presence'],
					errorMessage	: ["Email is required"]
				});
				
				myNod.add({
					selector		: '#emailAddressEle',
					validate		: ['multipleEmail'],
					errorMessage	: ["Invalid Email Address!"]
				});
			} else {
				$('#emailAddressEle').val('');
				$("*[data-attribute=emailAddress]").addClass("hide");
				myNod.remove('#emailAddressEle');
			}
			
			if(accountGroupSelection) {
				if(response.accountGroup) {
					$("*[data-attribute=accountGroup]").removeClass("hide");
					addAutocompleteElementInNode1(myNod, 'accountGroupEle', 'Select, Proper Group !')
				} else {
					$("*[data-attribute=accountGroup]").addClass("hide");
					myNod.remove('#accountGroupEle');
				}
			}
			
			if(response.date)
				$("*[data-attribute=date]").removeClass("hide");
			else
				$("*[data-attribute=date]").addClass("hide");
			
			if(response.regionSelection) {
				$('#regionSelection').removeClass('hide');
				addAutocompleteElementInNode(myNod, 'regionEle', 'Select, Proper Region !')
				addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select, Proper Sub-Region !')
				addAutocompleteElementInNode(myNod, 'branchEle', 'Select, Proper Branch !')
			} else {
				$('#regionSelection').addClass('hide');
				myNod.remove('#regionEle');
				myNod.remove('#subRegionEle');
				myNod.remove('#branchEle');
			}
		}, processTask : function() {
			showLayer();
			
			let jsonObject 			= Selection.getElementData();
			
			jsonObject.pojoId			= $('#pojoNameEle').val();
			jsonObject.EmailAddress		= $('#emailAddressEle').val();
			jsonObject.accountGroupId	= $('#accountGroupEle').val();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["txnFromDateTimeStr"] 	= $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["txnToDateTimeStr"] 	= $("#dateEle").attr('data-enddate'); 
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingTaskPojoWS/processPendingData.do', _this.setSuccess, EXECUTE_WITHOUT_ERROR);
		}, setSuccess : function () {
			hideLayer();
		}
	});
});