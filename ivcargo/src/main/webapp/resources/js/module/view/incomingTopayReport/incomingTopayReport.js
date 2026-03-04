define([
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/module/view/incomingTopayReport/incomingTopayReportLRDetails.js',
	'JsonUtility',
	 'messageUtility',
	 'bootstrapSwitch',
	 'moment',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],function(Selection, IncomingTopayReportLRDetails){
	'use strict';
	var jsonObject = new Object(), myNod,  _this;
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/incomingTopayReportWS/getIncominTopayReportElement.do?', _this.setIncomingTopayReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setIncomingTopayReportsElements : function(response){
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/incomingtopayreport/incomingTopayReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				$("*[data-selector=header]").html(response.reportName);
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				
				response.isCalenderSelection	= true;
				response.sourceAreaSelection	= true;
				response.isPhysicalBranchesShow	= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();

			var jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/incomingTopayReportWS/getIncomingTopayReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response){
			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#topayOustandingReportDetails').empty();
			$('#topayOustandingReportDiv').empty();
			
			var incomingTopayReportModelHM	= response.incomingTopayReportModelHM;
			
			if(incomingTopayReportModelHM != undefined ){
				$('#middle-border-boxshadow').removeClass('hide');
				
				var columnArray					= new Array();
				var count						= 1;
				var undeliveredTopayAmt			= 0.0;
				var deliveredTopayAmt			= 0.0;
				var topayAmt					= 0.0;
				var totalUndeliveredTopayAmt	= 0.0;
				var totalDeliveredTopayAmt		= 0.0;
				var totalTopayAmt				= 0.0;
				
				for (const obj of incomingTopayReportModelHM) {
					undeliveredTopayAmt		+= obj.undeliveredTopayAmount;
					deliveredTopayAmt		+= obj.deliveredTopayAmount;
					topayAmt				+= (obj.undeliveredTopayAmount + obj.deliveredTopayAmount);
					
					if(undeliveredTopayAmt > 0)
						totalUndeliveredTopayAmt	= undeliveredTopayAmt;
					
					if(deliveredTopayAmt > 0)
						totalDeliveredTopayAmt	= deliveredTopayAmt;
					
					if(topayAmt > 0)
						totalTopayAmt			= topayAmt;
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (count) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='destinationBranchId_" + obj.destinationBranchId + "' name='' value='"+ obj.destinationBranchName +"'>" + (obj.destinationBranchName) + "</td>");

					if(obj.undeliveredTopayAmount > 0)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='unDeliveredTopayAmt_" + obj.destinationBranchId + "'><b style='font-size: 14px'>" + toFixedWhenDecimal(obj.undeliveredTopayAmount) + "</b></a></td>");
					else
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px'>"+obj.undeliveredTopayAmount+"</b></td>");
					
					if(obj.deliveredTopayAmount > 0)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='deliveredTopayAmt_" + obj.destinationBranchId + "'><b style='font-size: 14px'>" + toFixedWhenDecimal(obj.deliveredTopayAmount) + "</b></a></td>");
					else
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px'>"+obj.deliveredTopayAmount+"</b></td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='topayAmt_" + obj.destinationBranchId + "' name='' value='"+ (obj.undeliveredTopayAmount + obj.deliveredTopayAmount) +"'>" + toFixedWhenDecimal(obj.undeliveredTopayAmount + obj.deliveredTopayAmount) + "</td>");
					
					$('#topayOustandingReportDetailsTable tbody').append('<tr id="topayOustandingReportDetails_'+ obj.destinationBranchId +'">' + columnArray.join(' ') + '</tr>');
					count++;
					
					$("#unDeliveredTopayAmt_" + obj.destinationBranchId).bind("click", function() {
						var elementId			= $(this).attr('id');
					    _this.showUnDeliveredLrDetails(elementId.split('_')[1]);
					});
					
					$("#deliveredTopayAmt_" + obj.destinationBranchId).bind("click", function() {
						var elementId			= $(this).attr('id');
					    _this.showDeliveredLrDetails(elementId.split('_')[1]);
					});
					
					columnArray	= [];
				}

				$('#topayOustandingReportDetailsTable tbody').append("<th class='table-bordered' height ='30px' colspan='2' style='background-color: #FFE5CC; padding-left: 185px;  text-center: middle'; vertical-align: middle; text-transform: uppercase'  name=''>Total</th>");
				$('#topayOustandingReportDetailsTable tbody').append("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: center; vertical-align: middle;'><b style='font-size: 14px'value='"+ totalUndeliveredTopayAmt +"' >"+ toFixedWhenDecimal(totalUndeliveredTopayAmt) +"</b></td>");
				$('#topayOustandingReportDetailsTable tbody').append("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: center; vertical-align: middle;'><b style='font-size: 14px' value='"+ totalDeliveredTopayAmt +"'>"+ toFixedWhenDecimal(totalDeliveredTopayAmt) +"</b></td>");
				$('#topayOustandingReportDetailsTable tbody').append("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: center; vertical-align: middle; text-transform: uppercase'  name='' value='"+ totalTopayAmt +"'>" + toFixedWhenDecimal(totalTopayAmt) + "</td>");
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			let printHeaderModel	= response.PrintHeaderModel;
			
			var data = new Object();
			data.accountGroupNameForPrint	= printHeaderModel.accountGroupName;
			data.branchAddress				= printHeaderModel.branchAddress;
			data.branchPhoneNumber			= printHeaderModel.branchPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			printTable(data, 'reportData', 'topayOustandingReportDetailsTable', 'Topay Outstanding Report', 'topayOustandingReportDiv');
			
			hideLayer();

		}, showUnDeliveredLrDetails : function(destinationBranchId) {
			var jsonObject 		= new Object();
			jsonObject["destinationBranchId"] 				= destinationBranchId;
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] 	= $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] 	= $("#dateEle").attr('data-enddate'); 
			
			var object 			= new Object();
			object.elementValue = jsonObject;
			object.url			= WEB_SERVICE_URL + '/incomingTopayReportWS/getUndeliveredTopayWayBillDetails.do?'
			
			var btModal = new Backbone.BootstrapModal({
				content		: new IncomingTopayReportLRDetails(object),
				modalWidth 	: 80,
				showFooter	: true,
				cancelText	: false,
				okText		: 'Close',
				title		: 'UnDelivered Topay WayBill Details'
			});
			
			object.btModal = btModal;
			new IncomingTopayReportLRDetails(object);
			btModal.open();
		},showDeliveredLrDetails : function(destinationBranchId){
			var jsonObject 		= new Object();
			jsonObject["destinationBranchId"] 	= destinationBranchId;
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] 	= $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] 	= $("#dateEle").attr('data-enddate'); 
			
			var object 			= new Object();
			object.elementValue = jsonObject;
			object.url			= WEB_SERVICE_URL + '/incomingTopayReportWS/getDeliveredTopayWayBillDetails.do?';
			
			var btModal = new Backbone.BootstrapModal({
				content		: new IncomingTopayReportLRDetails(object),
				modalWidth 	: 80,
				showFooter	: true,
				cancelText	: false,
				okText		: 'Close',
				title		: 'Delivered Topay WayBill Details'
			});
			
			object.btModal = btModal;
			new IncomingTopayReportLRDetails(object);
			btModal.open();
		}
	});
});