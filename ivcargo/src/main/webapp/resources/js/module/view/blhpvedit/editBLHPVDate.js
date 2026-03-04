/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
		'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/blhpvedit/editblhpvfilepath.js'//FilePath
		,'jquerylingua'
		,'language'
		, 'moment'
		,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
        //constant for project name and domain urls
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,'focusnavigation'//import in require.config
        ], function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language, moment, datepickerWrapper, Selection, ElementFocusNavigation){

	'use strict';// this basically give strictness to this specific js 
	var myNod, blhpvId = 0, lhpvId = 0, jsonObject	= new Object(), BlhpvConfiguration, lhpv, blhpv, _this = '';

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			blhpvId				= UrlParameter.getModuleNameFromParam('blhpvId');
			lhpvId				= UrlParameter.getModuleNameFromParam('lhpvId');
		}, render: function() {
			jsonObject.blhpvId 			= blhpvId;
			jsonObject.lhpvId 			= lhpvId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvWS/getBLHPVForChangeDateByBlhpvId.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(response) {
			var jsonObject 	= new Object();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/template/blhpvedit/blhpvedittemplate.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				loadLanguageWithParams(FilePath.loadLanguage());
				
				BlhpvConfiguration			= response.BlhpvConfiguration;
				lhpv						= response.lhpv;
				blhpv						= response.blhpv;
				var PaymentTypeConstant		= response.PaymentTypeConstant;
				var blhpvDetailsmessage		= response.blhpvDetailsmessage;
				var previousDate 			= response.previousDate;
				var currentDate				= response.currentDate;
				
				var options	= new Object();
				
				options.minDate			= previousDate;
				options.startDate		= currentDate;
				
				var elementConfiguration					= new Object();
				response.isCalenderForSingleDate			= true;
				response.options							= options;
				elementConfiguration.singleDateElement		= $('#blhpvDate');
				response.elementConfiguration				= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				$("#blhpvDate").attr('data-startdate', currentDate);
				$("#blhpvDate").attr('data-date', currentDate);
				
				$("#updateDateBtn").bind("click", function() {
					_this.updateBLHPVDate();
				});
				
				$('#blhpvDetails').append('<tr id="blhpvDetailsRow"></tr>');
				$('<td>' + blhpv.bLHPVNumber + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + blhpv.creationDateTimeString + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + lhpv.lhpvNumber + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + lhpv.creationDateTimeString + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + blhpv.paymentModeString + '</td>').appendTo('#blhpvDetailsRow');
				
				if(blhpvDetailsmessage != undefined) {
					$('#blhpvDetailsmessage').html(blhpvDetailsmessage);
					$('#updateDateBtn').remove();
					$('#blhpvDateDiv').remove();
					$('#messegeToEditBlhpvDate').removeClass('hide');
				} else {
					$('#blhpvDetailsmessage').html('BLHPV Date Can not be less than LHPV Date or Equal to Previous BLHPV Date');
					$('#messegeToEditBlhpvDate').removeClass('hide');
					$('#blhpvDetailsmessage').switchClass('alert-success', 'alert-warning');
				}
				
				$('#top-border-boxshadow').remove();
				$('#bottom-border-boxshadow').remove();
				$('#left-border-boxshadow').remove();
			});
			
			hideLayer();
		}, updateBLHPVDate : function() {
			$('#updateDateBtn').hide();
			
			if($('#blhpvDate').attr('data-date') != undefined) {
				var blhpvDate	= $('#blhpvDate').attr('data-date');
			} else {
				var blhpvDate	= $('#blhpvDate').attr('data-startdate');
			}
			
			var lhpvDate 		= parseDate(lhpv.creationDateTimeString);
			var blhpvDate 		= parseDate(blhpvDate);
			var oldBlhpvDate 	= parseDate(blhpv.creationDateTimeString);
			
			var isLessTime = blhpvDate.getTime() < lhpvDate.getTime();
			var isSameTime = blhpvDate.getTime() == oldBlhpvDate.getTime();
			
			if(isLessTime) {
				showMessage('error', iconForErrMsg + ' BLHPV Date Cannot be less than LHPV Date !');
				$('#updateDateBtn').show();
				return;
			} else if(isSameTime) {
				showMessage('error', iconForErrMsg + ' Please, Select Different Date !');
				$('#updateDateBtn').show();
				return;
			}
			
			showLayer();
			
			var jsonObject				= new Object();
			
			jsonObject.blhpvId 			= blhpvId;
			jsonObject.lhpvId 			= lhpvId;
			jsonObject.blhpvDate 		= toDateString(blhpvDate, 1); //dd-mm-YYYY
			
			if(confirm("Do You Want To Change BLHPV Date ! ")) {
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvWS/updateBLHPVDate.do', _this.afterSaveBlhpv, EXECUTE_WITH_ERROR);
				$('#updateDateBtn').hide();
			} else {
				$('#updateDateBtn').show();
				hideLayer();
			}
		}, afterSaveBlhpv : function (response){
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'warning') {
					$('#updateDateBtn').show();
					return;
				}
			}
			
			setTimeout(() => {
				redirectToAfterUpdate(response);
			}, 1500);
			
			hideLayer();
		}
	});
});