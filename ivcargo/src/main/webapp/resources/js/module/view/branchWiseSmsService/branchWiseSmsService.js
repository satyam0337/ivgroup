
define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(Selection) {
	'use strict';
	let jsonObject = new Object(), 
	myNod, _this = '', branchesArr;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchWiseSMSServiceWS/getBranchWiseSMSServiceElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			let executive	= response.executive;
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/branchwisesmsservice/branchwisesmsservice.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				let elementConfiguration	= new Object();
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');

				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.AllOptionsForRegion  		= false;
				response.AllOptionsForSubRegion 	= false;
				
				Selection.setSelectionToGetData(response);
				
				response.region		= true;
				response.subRegion	= true;
				response.branch		= false;

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});

		}, onSubmit : function() {
			showLayer();
			jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL + '/branchWiseSMSServiceWS/getBranchWiseSMSServiceDetails.do?', _this.setBranchData, EXECUTE_WITH_NEW_ERROR);
		}, setBranchData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				$('#branchDetails').addClass('hide');
				$('#mobileNumberEle').addClass('hide');
				$('#branchDetails').empty();
				return;
			}
			
			branchesArr 		= response.branchesArr;
			hideLayer();
			_this.setSmsDetails(branchesArr);
		
		}, setSmsDetails : function(branchesArr) {
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#branchDetails').removeClass('hide');
			$('#mobileNumberEle').removeClass('hide');
			$('#branchDetails').empty();
			
			let columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> SR No. </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> SMS </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Branch Name </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Branch Address </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Contact Person </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Contact </b></td>");

			$('#branchDetails').append('<tr class="danger">' + columnArray.join(' ') + '</tr>');

			columnArray	= [];
			
			for (let i = 0; i < branchesArr.length; i++) {
				let obj	= branchesArr[i];

				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><button class='btn btn-danger' type='button' id='branch_" + obj.branchId + "'><b>Get SMS<b></button></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchAddress + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchContactDetailContactPersonName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchContactDetailMobileNumber + "</td>");

				$('#branchDetails').append('<tr>' + columnArray.join(' ') + '</tr>');

				columnArray	= [];
				
				$("#branch_" + obj.branchId).bind("click", function() {
					let elementId		= $(this).attr('id');
					let branchId		= elementId.split('_')[1];
					_this.sendSMSDetails(branchId);
				});
			}
		}, sendSMSDetails : function(branchId) {
			jsonObject = new Object();
			
			if($('#mobileNumberEle').val() < 10) {
				showMessage('error', iconForErrMsg + ' Please, Enter Valid Mobile Number !');
				return false;
			}
			
			let btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure, Do you want to send SMS on "+ $('#mobileNumberEle').val(),
				modalWidth 	: 	30,
				title		:	'Send SMS',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			jsonObject["branchId"] 					= branchId;
			jsonObject["MobileNumber"] 				= $('#mobileNumberEle').val();
			
			btModalConfirm.on('ok', function() {
				getJSON(jsonObject, WEB_SERVICE_URL+'/branchWiseSMSServiceWS/sendBranchWiseSMSServiceDetails.do?', _this.refreshBranchData, EXECUTE_WITH_NEW_ERROR);
				showLayer();
			});
		}, refreshBranchData : function(response) {
			if(response.message != undefined) {
				$('#branchDetails').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#mobileNumberEle').addClass('hide');
				
				if (typeof btModalConfirm !== 'undefined' && btModalConfirm != null)
					btModalConfirm.close();
				
				hideLayer();
				setTimeout(function(){ location.reload()}, 1000);
				return;
			}
		}
	});
});