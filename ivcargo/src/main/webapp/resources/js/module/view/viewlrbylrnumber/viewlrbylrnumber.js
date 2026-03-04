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
		,'/ivcargo/resources/js/generic/urlparameter.js'
        //marionette JS framework
		, PROJECT_IVUIRESOURCES+'/resources/js/module/view/viewlrbylrnumber/statusdetails.js'
		, PROJECT_IVUIRESOURCES+'/resources/js/module/view/viewlrbylrnumber/viewpodphoto.js'
		, PROJECT_IVUIRESOURCES+'/resources/js/module/view/viewlrbylrnumber/lrstatusdetails.js'
		,'errorshow'
		,'messageUtility'
		,'JsonUtility'
  		,'nodvalidation'
		, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
        //constant for project name and domain urls
        //this is called to get the elements
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ], function(Marionette, UrlParameter, StatusDetails, PodDetail, LRStatusDetails) {
	'use strict';// this basically give strictness to this specific js 
	let myNod, _this = '', showEstimatedDeliveryDate, showLRStatusDetails, wayBillId;
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element 
			_this = this;
			wayBillId 		= UrlParameter.getModuleNameFromParam('wayBillId');
			this.$el.html(this.template);
		}, render : function() {
			let jsonObject = new Object();
			
			if(wayBillId != null && wayBillId != 0) {
				jsonObject.waybillId	= wayBillId;
				jsonObject.isCRMPage = true;
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/searchWayBillDetails/getWayBillDetails.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			} else {
				_this.renderElements({});
			}
			
			return _this;
		}, renderElements : function(response) {
			require(['text!/ivcargo/template/lrsearch/lrsearch.html'], function(searchHtml) {
				$("#mainContent").html(_.template(searchHtml));
				
				if(wayBillId != null && wayBillId != 0) {
					_this.setData(response);
					$('#top-border-boxshadow').remove();
				} else {
					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					
					$('#lrNumberEle').keydown(function(e) {
						if (e.which == 13)
							_this.onSearch();
					});
					
					$( "#lrNumberEle" ).keyup(function(event) {
						if ( event.which == 8 || event.which == 46)
							$('#bottom-border-boxshadow').addClass('hide');
					});
				}
				
				$('#lrViewDetails').click(function() {
					_this.onLrStatusDetails();
				});
				
				$('#dispatchDetails').click(function() {
					_this.onDispatchDetails();
				});
								
				$('#podDetails').click(function() {
					_this.onViewPodDetails();
				});
				
				hideLayer();
			});
		}, onSearch: function() {
			if(!_this.validateElements())
				return false;
					
			showLayer();
			let jsonObject = new Object();
			jsonObject.WAYBILLNUMBER = $("#lrNumberEle").val().trim();
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT+'/searchWayBillDetails/getWayBillDetails.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideAllMessages();

			hideLayer();
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
						
			showEstimatedDeliveryDate	= response.showEstimatedDeliveryDate;
			showLRStatusDetails			= response.showLRStatusDetails;
						
			_this.setConsignorData(response.LRSEARCH);
			_this.setConsigneeData(response.LRSEARCH);
			_this.setLrData(response.LRSEARCH, response.podStatus, response.displayPODUploadLink);
			_this.setConsignmentDetails(response.LRSEARCH);
						
			if(response.LRSEARCH.accountGroupId == 580) {
				$('.weight').addClass('hide');
				$('.decValue').addClass('hide');
				$('.deliveredTo').addClass('hide');
				$('.deliveredToNo').addClass('hide');
				$('.crNo').addClass('hide');
				$('.consigneeNo').addClass('hide');
				$('.consignorNo').addClass('hide');
			}
		}, validateElements : function() {
			//this will check all the elements which have been added in configuration
			if(!myNod.areAll('valid'))
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			
			myNod.performCheck();
			//this will give true if all elements validation is true
			return myNod.areAll('valid');
		}, setConsignorData : function(consignorObj) {
			$("*[data-consignor='name']").html(_this.checkCondition(consignorObj.consignorName));
			$("*[data-consignor='mobileNumber']").html(_this.checkCondition(consignorObj.consignorMobileNumber));
		}, setConsigneeData : function(consigneeobj) {
			$("*[data-consignee='name']").html(_this.checkCondition(consigneeobj.consigneeName));
			$("*[data-consignee='mobileNumber']").html(_this.checkCondition(consigneeobj.consigneeMobileNumber));
		}, setLrData:function(lrObj, podStatus, displayPODUploadLink) {
			$("*[data-lr='sourcebranch']").html(_this.checkCondition(lrObj.bookingWayBillTxnSourceBranch));
			$("*[data-lr='destinationBranch']").html(_this.checkCondition(lrObj.bookingWayBillTxnDestinationBranch));
			$("*[data-lr='currentStatus']").html(_this.checkCondition(lrObj.wayBillStatusString));
			$("*[data-lr='type']").html(_this.checkCondition(lrObj.bookingWayBillTxnWayBillType));
			
			if(lrObj.invoiceNumberStr != "--")
				$("*[data-lr='invoicenumber']").html(_this.checkCondition(lrObj.invoiceNumberStr));
			else
				$("*[data-lr='invoicenumber']").html(_this.checkCondition(lrObj.consignmentSummaryInvoiceNo));
			
			$("*[data-lr='actualWeight']").html(_this.checkCondition(lrObj.consignmentSummaryActualWeight));
			$("*[data-lr='chargedWeight']").html(_this.checkCondition(lrObj.consignmentSummaryChargeWeight));
			$("*[data-lr='declaredValue']").html(_this.checkCondition(lrObj.consignmentSummaryDeclaredValue));
			$("*[data-lr='totalQuantity']").html(_this.checkCondition(lrObj.consignmentSummaryQuantity));
			$("*[data-lr='bookingDate']").html(_this.checkCondition(lrObj.wayBillInfoBookingDateTimeString));
			$("*[data-lr='number']").html(_this.checkCondition(lrObj.bookingWayBillTxnWayBillNumber));
			$("*[data-lr='deliveredToName']").html(_this.checkCondition(lrObj.deliveryContactDetailsDeliveredToName));
			$("*[data-lr='deliveredToNumber']").html(_this.checkCondition(lrObj.deliveryContactDetailsDeliveredToNumber));
			$("*[data-lr='deliveredDateTime']").html(_this.checkCondition(lrObj.deliveryContactDetailsDeliveryDateTimeString));
			$("*[data-lr='crNumber']").html(_this.checkCondition(lrObj.deliveryContactDetailsWayBillDeliveryNumber));
			$("*[data-lr='estimatedDeliveryDate']").html(_this.checkCondition(lrObj.estimatedDeliveryDateString));
					
			$("#wayBillId").val(lrObj.bookingWayBillTxnWayBillId);
			$("#accountGroupId").val(lrObj.accountGroupId);
					
			if(jQuery.type( lrObj.lastReceivedDateTime ) === "undefined" || jQuery.type( lrObj.lastReceivedDateTime ) === "null" || !$.trim(lrObj.lastReceivedDateTime) ){
				$("#ReceivedAtDetails").addClass("hide");
			} else {
				$("#ReceivedAtDetails").removeClass("hide");
				$("*[data-lr='receivedDetails']").html(lrObj.godownName + "<span class='text-primary'> on </span>" + lrObj.lastReceivedDateTime)
			}
					
			if(!lrObj.showDispatchDetails)
				$("*[data-lr='dispatchDetails']").addClass("hide");
			else
				$("*[data-lr='dispatchDetails']").removeClass("hide");
					
			if(showEstimatedDeliveryDate)
				$("#estimateDlyDate").removeClass("hide");
					
			if(showLRStatusDetails)
				$("*[data-lr='lrViewDetails']").removeClass("hide");
					
			if(displayPODUploadLink) {
				$("*[data-lr='podDetails']").removeClass("hide");
				$("*[data-lr='podStatus']").html(podStatus);
			} else {
				$("*[data-lr='podDetails']").addClass("hide");
				$("*[data-lr='podStatus']").html(podStatus);
			}
	}, setConsignmentDetails: function (consignmentDetailsObj) {
		    let consignmentArr = consignmentDetailsObj.consignmentDetails;

		    // target tbody of consignment details table
		    let tbody = $("#consignmentDetailsTable tbody");

		    // clear old rows
		    tbody.empty();

		    let totalQty = 0;

		    consignmentArr.forEach(function (item) {
		        let row = $("<tr/>");

		        $("<td/>").text(item.quantity).appendTo(row);
		        $("<td/>").text(item.packingTypeName).appendTo(row);
		        $("<td/>").text(item.saidToContain).appendTo(row);

		        tbody.append(row);

		        totalQty += parseInt(item.quantity) || 0;
		    });

		    // update total quantity
		    $("span[data-lr='totalQuantity']").text(totalQty);
		}, checkCondition:function(elemVal) {
			if(jQuery.type( elemVal ) === "undefined" || jQuery.type( elemVal ) === "null" || !$.trim(elemVal))
				return "&nbsp;--"
			
			return elemVal;
		}, onLrStatusDetails : function() {
			let object = {};
					
			object.isCustomerAccess = true;
					
			let btModal = new Backbone.BootstrapModal({
				content: new LRStatusDetails(object),
				title:'LR Status Details',
				modalWidth : 70,
				cancelText:'',
				showFooter : true
			}).open();
		}, onDispatchDetails : function() {
			let btModal = new Backbone.BootstrapModal({
				content: new StatusDetails(),
				title:'Details',
				modalWidth : 40,
				cancelText:'',
				showFooter : true

			}).open();
		}, onViewPodDetails : function() {
			let btModal = new Backbone.BootstrapModal({
				content: new PodDetail(),
				title:'POD Details',
				modalWidth : 60,
				cancelText:'',
				showFooter : true
			}).open();
		}
	});
});