/**
 * manish kumar singh : 09-06-2016
 */

/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        //the file which has only name they are are already  been loaded
        'marionette'//Marionette
		,'JsonUtility'
		,'messageUtility'
        //marionette JS framework
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/crossinghire/editcrossinghirefilepath.js'//FilePath
		,'jquerylingua'
		,'language'
	    ,'selectizewrapper'
        //constant for project name and domain urls
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,'focusnavigation'//import in require.config
        ], function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language, Selectizewrapper, ElementFocusNavigation){

	'use strict';// this basically give strictness to this specific js 
	var myNod,
	jsonObject	= new Object(),
	jsonInObject	= new Object(),
	wayBillCrossingHire,
	lsAndCrossingDeatils,
	crossingHireData,
	isInvoiceCreated,
	editcrossinghirecolumnshow,
	_this = '',
	crossingAgentArr,
	crossingAgentMasterId,
	dispatchLedgerId = 0,
	showDoorDeliveryColumn = false,
	showHamaliColumn = false,
	configuration,
	editCrossingAgentName	= false;

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			dispatchLedgerId	= UrlParameter.getModuleNameFromParam('masterid');
		}, render: function() {
			jsonObject.dispatchLedgerId = dispatchLedgerId;
			getJSON(jsonObject, WEB_SERVICE_URL+'/WayBillCrossingWs/getWayBillCrossingDetailsForCrossingHire.do', _this.setData, EXECUTE_WITHOUT_ERROR);
			//initialize is the first function called on call new view()
			//return _this;
		}, setData : function(response){
			var jsonObject 	= new Object();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editcrossinghire/editcrossinghire.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				loadLanguageWithParams(FilePath.loadLanguage());
				
				wayBillCrossingHire					= response.wayBillCrossingHire;
				lsAndCrossingDeatils				= response.lsAndCrossingDeatils;
				isInvoiceCreated					= response.isInvoiceCreated;
				editcrossinghirecolumnshow			= response.editcrossinghirecolumnshow;
				crossingAgentArr					= response.crossingAgentArr;
				crossingAgentMasterId				= lsAndCrossingDeatils.crossingAgentMasterId;
				configuration						= response.configuration;
				showDoorDeliveryColumn				= configuration.showDoorDeliveryColumn;
				showHamaliColumn					= configuration.showHamaliColumn;
				editCrossingAgentName				= response.editCrossingAgentName;
				
				$("#updateBtn").bind("click", function() {
					_this.onSaveCrossingHire();
				});
				
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	crossingAgentArr,
					valueField		:	'crossingAgentMasterId',
					labelField		:	'name',
					searchField		:	'name',
					elementId		:	'updateCrossingEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.setCrossingAgent
				});
				
				_this.setLSDetails();
				
				if(editCrossingAgentName){
					for(var i = 0; i<wayBillCrossingHire.length; i++){
						Selectizewrapper.setAutocomplete({
						jsonResultList	: 	crossingAgentArr,
						valueField		:	'crossingAgentMasterId',
						labelField		:	'name',
						searchField		:	'name',
						elementId		:	'wayBillCrossingAgent_' + wayBillCrossingHire[i].wayBillId,
						create			: 	false,
						maxItems		: 	1
					});
					}
				}
				
			});
			
			hideLayer();
		}, setLSDetails : function() {
			if(isInvoiceCreated == true){
				showMessage('info','Crossing Agent Hisab is Already Done !');
				$('#updateBtn').remove();
				hideLayer();
			} else {
				var newDiv;
				var newTable;
				var totalChAmt 				= 0;
				var totalLocTemBhada 		= 0;
				var totalGrandTotal			= 0;
				var	totalArticles			= 0;
				var	totalActualWeight		= 0;
				var	totalOfBookingTotal		= 0;
				var	totalOfDeliveryTotal	= 0;
				
				newDiv = $('<div />');
				newDiv.attr("id", "data");
				newDiv.attr("class", "row col-xs-8 input-sm");
				newTable = $('<table />');
				newTable.attr("class", "table table-bordered");
				hideLayer();
				
				if(editcrossinghirecolumnshow) {
					var upperHeaderColArray		= new Array();
					var headerColumnArray		= new Array();
					var footerColumnArray		= new Array();
					
					upperHeaderColArray.push("<th colspan='3'>Ls Number : "+lsAndCrossingDeatils.lsNumber+"</th>");
					upperHeaderColArray.push("<th colspan='5'>LS Date: "+lsAndCrossingDeatils.lsTripDate+"</th>");
					upperHeaderColArray.push("<th colspan='3'>Crossing Agent Name : "+lsAndCrossingDeatils.crossingAgentName+"</th>");
					upperHeaderColArray.push("<th colspan='6'></th>");
					
					newTable.append('<tr>' + upperHeaderColArray.join('') +'</tr>');
					//newTable.append("<tr><th colspan='3'>Ls Number : "+lsAndCrossingDeatils.lsNumber+"</th><th colspan='5'>LS Date: "+lsAndCrossingDeatils.lsTripDate+"</th><th colspan='3'>Crossing Agent Name : "+lsAndCrossingDeatils.crossingAgentName+"</th><th colspan='6'></th></tr>");
					headerColumnArray.push("<th>LR No.</th>");
					headerColumnArray.push("<th>Date</th>");
					headerColumnArray.push("<th>LR Type</th>");
					headerColumnArray.push("<th>Source</th>");
					headerColumnArray.push("<th>Art.</th>");
					headerColumnArray.push("<th>Weight</th>");
					headerColumnArray.push("<th>Bkg Amt</th>");
					headerColumnArray.push("<th>Dly Amt</th>");
					headerColumnArray.push("<th>Destination</th>");
					headerColumnArray.push("<th>Grand Total</th>");
					headerColumnArray.push("<th>Crossing From</th>");
					headerColumnArray.push("<th>Crossing To</th>");
					headerColumnArray.push("<th>Current CH Amt</th>");
					headerColumnArray.push("<th>New CH Amount</th>");
					headerColumnArray.push("<th style='display: none'>LocalTempoBhada</th>");
					headerColumnArray.push("<th style='display: none'>updt localTempoBhada</th>");
					headerColumnArray.push("<th style='display: none'>Crossing LR No.</th>");
					headerColumnArray.push("<th style='display: none'>updt Crossing LR No.</th>")
					if(showDoorDeliveryColumn)headerColumnArray.push("<th>Door Dly</th>");
					if(showHamaliColumn)headerColumnArray.push("<th>Hamali</th>");
					
					newTable.append('<tr>' + headerColumnArray.join('') +'</tr>');
					//newTable.append("<tr><th>LR No.</th><th>Date</th><th>LR Type</th><th>Source</th><th>Art.</th><th>Weight</th><th>Bkg Amt</th><th>Dly Amt</th><th>Destination</th><th>Grand Total</th><th>Crossing From</th><th>Crossing To</th><th>Current CH Amt</th><th>New CH Amount</th><th style='display: none'>LocalTempoBhada</th><th  style='display: none'>updt localTempoBhada</th><th  style='display: none'>Crossing LR No.</th><th  style='display: none'>updt Crossing LR No.</th><tr>");
					
					headerColumnArray = [];
					for(var i = 0; i<wayBillCrossingHire.length; i++){
						var dataColumnArray		= new Array();
						
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].wayBillNumber+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].creationDateString+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].wayBillType+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].sourceBranch+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].packageQuantity+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].actualWeight+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].bookingTotal+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].deliveryTotal+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].destinationBranch+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].grandTotal+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].crossingSourceBranch+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].crossingDestinationBranch+"</td>");
						dataColumnArray.push("<td >"+wayBillCrossingHire[i].crossingHire+"</td>");
						dataColumnArray.push("<td><span><input class='data form-control' value='"+wayBillCrossingHire[i].crossingHire+"' id='crossAmt_"+wayBillCrossingHire[i].wayBillId+"' type='text' onblur='return clearIfNotNumeric(this,0);'></span></td>");
						dataColumnArray.push("<td style='display:none'>"+wayBillCrossingHire[i].localTempoBhada+"</td>");
						dataColumnArray.push("<td style='display:none'><span><input class='data' value='"+wayBillCrossingHire[i].localTempoBhada+"' id='bhada_"+wayBillCrossingHire[i].wayBillId+"' type='text' onkeypress='return noNumbers(event);'></span></td>");
						dataColumnArray.push("<td style='display:none'>"+wayBillCrossingHire[i].crossingWayBillNo+"</td>");
						dataColumnArray.push("<td style='display:none'><span><input class='data' value='"+wayBillCrossingHire[i].crossingWayBillNo+"' type='text' id='crossWayNo_'"+wayBillCrossingHire[i].wayBillId+"></span></td>");
						
						if(showDoorDeliveryColumn)dataColumnArray.push("<td><span><input class='data form-control' value='"+wayBillCrossingHire[i].doorDelivery +"' id='doorDelivery_"+wayBillCrossingHire[i].wayBillId+"' type='text' onblur='return clearIfNotNumeric(this,0);'></span></td>");
						if(showHamaliColumn)dataColumnArray.push("<td><span><input class='data form-control' value='"+wayBillCrossingHire[i].hamali+"' id='hamali_"+wayBillCrossingHire[i].wayBillId+"' type='text' onblur='return clearIfNotNumeric(this,0);'></span></td>");
						newTable.append("<tr>"+ dataColumnArray.join('') + "</tr>");
						//newTable.append("<tr><td>"+wayBillCrossingHire[i].wayBillNumber+"</td><td>"+wayBillCrossingHire[i].creationDateString+"</td><td>"+wayBillCrossingHire[i].wayBillType+"</td><td>"+wayBillCrossingHire[i].sourceBranch+"</td><td>"+wayBillCrossingHire[i].packageQuantity+"</td><td>"+wayBillCrossingHire[i].actualWeight+"</td><td>"+wayBillCrossingHire[i].bookingTotal+"</td><td>"+wayBillCrossingHire[i].deliveryTotal+"</td><td>"+wayBillCrossingHire[i].destinationBranch+"</td><td>"+wayBillCrossingHire[i].grandTotal+"</td><td>"+wayBillCrossingHire[i].crossingSourceBranch+"</td><td>"+wayBillCrossingHire[i].crossingDestinationBranch+"</td><td >"+wayBillCrossingHire[i].crossingHire+"</td><td><span><input class='data form-control' value='"+wayBillCrossingHire[i].crossingHire+"' id='crossAmt_"+wayBillCrossingHire[i].wayBillId+"' type='text' onblur='return clearIfNotNumeric(this,0);'></span></td><td style='display:none'>"+wayBillCrossingHire[i].localTempoBhada+"</td><td style='display:none'><span><input class='data' value='"+wayBillCrossingHire[i].localTempoBhada+"' id='bhada_"+wayBillCrossingHire[i].wayBillId+"' type='text' onkeypress='return noNumbers(event);'></span></td><td style='display:none'>"+wayBillCrossingHire[i].crossingWayBillNo+"</td><td style='display:none'><span><input class='data' value='"+wayBillCrossingHire[i].crossingWayBillNo+"' type='text' id='crossWayNo_'"+wayBillCrossingHire[i].wayBillId+"></span></td><tr>");
						
						$('#DataDiv').append(newTable);
						totalChAmt 		 		+= wayBillCrossingHire[i].crossingHire;
						totalLocTemBhada 		+= wayBillCrossingHire[i].localTempoBhada;
						totalGrandTotal			+= wayBillCrossingHire[i].grandTotal;
						totalArticles	 		+= wayBillCrossingHire[i].packageQuantity;
						totalActualWeight		+= wayBillCrossingHire[i].actualWeight;
						totalOfBookingTotal		+= wayBillCrossingHire[i].bookingTotal;
						totalOfDeliveryTotal	+= wayBillCrossingHire[i].deliveryTotal;
						
					}
					footerColumnArray.push("<th colspan='2'>Total's LR: "+wayBillCrossingHire.length+"</th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th>"+totalArticles+"</th>");
					footerColumnArray.push("<th>"+totalActualWeight+"</th>");
					footerColumnArray.push("<th>"+totalOfBookingTotal+"</th>");
					footerColumnArray.push("<th>"+totalOfDeliveryTotal+"</th>");
					footerColumnArray.push("<th></th><th>"+totalGrandTotal+"</th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th>"+totalChAmt+"</th>");
					footerColumnArray.push("<th></th><th style='display:none'></th>");
					footerColumnArray.push("<th style='display:none'>"+totalLocTemBhada+"</th>");
					footerColumnArray.push("<th style='display:none'></th><th style='display:none'></th>");
					if(showDoorDeliveryColumn)footerColumnArray.push("<th></th>");
					if(showHamaliColumn)footerColumnArray.push("<th></th>");
					
					newTable.append('<tr>'+ footerColumnArray.join('') +'</tr>');
				} else {
				
					var upperHeaderColArray		= new Array();
					var headerColumnArray		= new Array();
					var footerColumnArray		= new Array();
					
					upperHeaderColArray.push("<th colspan='3'>Ls Number : "+lsAndCrossingDeatils.lsNumber+"</th>");
					upperHeaderColArray.push("<th colspan='3'>LS Date: "+lsAndCrossingDeatils.lsTripDate+"</th>");
					if(editCrossingAgentName)
						upperHeaderColArray.push("<th colspan='3'></th>");
					else 
						upperHeaderColArray.push("<th colspan='3'>Crossing Agent Name : "+lsAndCrossingDeatils.crossingAgentName+"</th>");
						
					upperHeaderColArray.push("<th colspan='6'></th>");
					
					newTable.append('<tr>' + upperHeaderColArray.join('') +'</tr>');
					upperHeaderColArray = [];
					
					headerColumnArray.push("<th>LR No.</th>");
					headerColumnArray.push("<th>Date</th>");
					headerColumnArray.push("<th>LR Type</th>");
					headerColumnArray.push("<th>Source</th>");
					headerColumnArray.push("<th>Destination</th>");
					headerColumnArray.push("<th>Grand Total</th>");
					headerColumnArray.push("<th>Crossing From</th>");
					headerColumnArray.push("<th>Crossing To</th>");
					headerColumnArray.push("<th>Current CH Amt</th>");
					headerColumnArray.push("<th>New CH Amount</th>");
					headerColumnArray.push("<th style='display: none'>LocalTempoBhada</th>");
					headerColumnArray.push("<th style='display: none'>updt localTempoBhada</th>");
					headerColumnArray.push("<th style='display: none'>Crossing LR No.</th>");
					headerColumnArray.push("<th style='display: none'>updt Crossing LR No.</th>")
					if(editCrossingAgentName) headerColumnArray.push("<th>Crossing Agent Name</th>");
					
					newTable.append('<tr>' + headerColumnArray.join('') +'</tr>');
					headerColumnArray = [];
					
					for(var i = 0; i<wayBillCrossingHire.length; i++){
						var dataColumnArray		= new Array();
						
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].wayBillNumber+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].creationDateString+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].wayBillType+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].sourceBranch+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].destinationBranch+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].grandTotal+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].crossingSourceBranch+"</td>");
						dataColumnArray.push("<td>"+wayBillCrossingHire[i].crossingDestinationBranch+"</td>");
						dataColumnArray.push("<td >"+wayBillCrossingHire[i].crossingHire+"</td>");
						dataColumnArray.push("<td><span><input class='data' value='"+wayBillCrossingHire[i].crossingHire+"' id='crossAmt_"+wayBillCrossingHire[i].wayBillId+"' type='text' onkeypress='return noNumbers(event);'></span></td>");
						dataColumnArray.push("<td style='display:none'>"+wayBillCrossingHire[i].localTempoBhada+"</td>");
						dataColumnArray.push("<td style='display:none'><span><input class='data' value='"+wayBillCrossingHire[i].localTempoBhada+"' id='bhada_"+wayBillCrossingHire[i].wayBillId+"' type='text' onkeypress='return noNumbers(event);'></span></td>");
						dataColumnArray.push("<td style='display:none'>"+wayBillCrossingHire[i].crossingWayBillNo+"</td>");
						dataColumnArray.push("<td style='display:none'><span><input class='data' value='"+wayBillCrossingHire[i].crossingWayBillNo+"' type='text' id='crossWayNo_'"+wayBillCrossingHire[i].wayBillId+"></span></td>");
						if(editCrossingAgentName){
							dataColumnArray.push("<td style='width:20%'><div style='width:100%' id='wayBillCrossingAgentId_"+wayBillCrossingHire[i].wayBillId+"'><input class='form-control' type='text' name='wayBillCrossingAgent_"+wayBillCrossingHire[i].wayBillId+"' id='wayBillCrossingAgent_"+wayBillCrossingHire[i].wayBillId+"' value='"+wayBillCrossingHire[i].crossingAgentId+"'/></div></td>");
						}
						
						newTable.append("<tr>"+ dataColumnArray.join('') + "</tr>");
						
						$('#DataDiv').append(newTable);
						totalChAmt 		 += wayBillCrossingHire[i].crossingHire;
						totalLocTemBhada += wayBillCrossingHire[i].localTempoBhada;
						totalGrandTotal	 += wayBillCrossingHire[i].grandTotal;
						
					}
					
					footerColumnArray.push("<th colspan='2'>Total's LR: "+wayBillCrossingHire.length+"</th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th>"+totalGrandTotal+"</th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th>"+totalChAmt+"</th>");
					footerColumnArray.push("<th></th>");
					footerColumnArray.push("<th style='display:none'>"+totalLocTemBhada+"</th>");
					footerColumnArray.push("<th style='display:none'></th>");
					footerColumnArray.push("<th style='display:none'></th>");
					footerColumnArray.push("<th style='display:none'></th><");
					if(editCrossingAgentName){
						footerColumnArray.push("<th style='display:none'></th><");
					}
					
					newTable.append('<tr>'+ footerColumnArray.join('') +'</tr>');
				}
				
				 
				$('#updateNameDiv').append();
			}
		}, onSaveCrossingHire : function (){
			var array	 = new Array();
			
			for(var i=0; i< wayBillCrossingHire.length; i++){
				crossingHireData =  new Object();  
				//alert($('#bhada_'+wayBillCrossingHire[i].wayBillId).val());
				
				crossingHireData.crossingHire 				=   $('#crossAmt_'+wayBillCrossingHire[i].wayBillId).val();
				crossingHireData.localTempoBhada   			=   $('#bhada_'+wayBillCrossingHire[i].wayBillId).val();
				crossingHireData.crossingWayBillNo  		=   $('#crossWayNo_'+wayBillCrossingHire[i].wayBillId).val();
				
				crossingHireData.previousCrossingHire 		=   wayBillCrossingHire[i].crossingHire;
				crossingHireData.previousLocalTempoBhada    =   wayBillCrossingHire[i].localTempoBhada
				crossingHireData.previousCrossingWayBillNo  =   wayBillCrossingHire[i].crossingWayBillNo
				crossingHireData.previousWayBillCrossingAgentId  =   wayBillCrossingHire[i].crossingAgentId
				
				crossingHireData.wayBillId					=	wayBillCrossingHire[i].wayBillId;
				crossingHireData.doorDelivery 				=   $('#doorDelivery_'+wayBillCrossingHire[i].wayBillId).val();
				crossingHireData.hamali 					=   $('#hamali_'+wayBillCrossingHire[i].wayBillId).val();
				crossingHireData.wayBillCrossingAgentId  	=   $('#wayBillCrossingAgent_'+wayBillCrossingHire[i].wayBillId).val();
				
				array.push(crossingHireData);
			}
			
			var finalJsonObj 				= new Object();
			finalJsonObj.crossingHireDataArray  			= JSON.stringify(array);
			finalJsonObj.dispatchLedgerId 					= dispatchLedgerId;
			finalJsonObj.lsNumber							= lsAndCrossingDeatils.lsNumber
			
			if($('#updateCrossingEle').val() > 0){
				finalJsonObj.crossingAgentMasterId			= $('#updateCrossingEle').val();
			} else {
				finalJsonObj.crossingAgentMasterId			= crossingAgentMasterId;
			}
			
			console.log('finalJsonObj >>> ', finalJsonObj)
			$('#updateBtn').hide();
			
			if(confirm("Do You Want To Update Crossing Hire! ")) {
				showLayer();
				getJSON(finalJsonObj, WEB_SERVICE_URL+'/WayBillCrossingWs/updateWayBillCrossingDetailsForCrossingHire.do', _this.onUpdate, EXECUTE_WITHOUT_ERROR);
			} else {
				hideLayer();
				$('#updateBtn').show();
			}
		}, onUpdate : function (response) {
			hideLayer();
			showMessage("success", iconForSuccessMsg + " Crossing Hire Amount Updated  successfully !");
			
			setTimeout(function(){
				location.reload();
			},1500);
		}, setCrossingAgent : function(id){
			if(editCrossingAgentName){
				var element = document.getElementById('updateNameDiv').innerText;
				for(var i = 0; i<wayBillCrossingHire.length; i++){
					 const parent = document.querySelector('#wayBillCrossingAgentId_'+ wayBillCrossingHire[i].wayBillId);
					 const child1 = parent.querySelector('.item');
					 child1.innerHTML= element;
					 $('#wayBillCrossingAgent_'+ wayBillCrossingHire[i].wayBillId).val(id);
				}
			}
		}
	});
});