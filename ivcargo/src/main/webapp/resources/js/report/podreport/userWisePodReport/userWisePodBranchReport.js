/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	let _this = '', jsonObject, pboData, btModal, sourceBranch = '';
	return Marionette.LayoutView.extend({
		
		initialize: function(jsonObjectData) {
			_this 			= this;
			btModal			= jsonObjectData.btModal;
			pboData			= localStorage.getItem("userWisePodBranchReportDetailsJsonObject");

			if(pboData != undefined && pboData != null) {//for data in new tab
				jsonObject	= JSON.parse(pboData);

				sourceBranch	= jsonObject.sourceBranchName;
			} else
				jsonObject 	= jsonObjectData.elementValue;

			if(jsonObject == undefined || jsonObject == null) {
				showMessage('error', 'Records not found, Search again !');
				
				setTimeout(function() {
					window.close();
				}, 2000);
			}
		}, render: function() {
			showLayer();

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/userWisePodReportWS/getPodBranchWiseLRDeatils.do?',	_this.setUserWiseBranchPodReportDeatilsData, EXECUTE_WITHOUT_ERROR);

		}, setUserWiseBranchPodReportDeatilsData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				if(btModal != undefined) btModal.close()
				return;
			}

			hideAllMessages();
			
			localStorage.removeItem('PendingBranchOperationsJsonObject');
			
			
			let bookingChargesNameHM	= response.chargesNameHM;
			let wayBillChargeHm	= response.lrWiseChargesHm;
				
			if(bookingChargesNameHM != undefined) {
				for(const element of response.CorporateAccount) {
					let obj			= element;
					let chargesMap	= wayBillChargeHm[obj.wayBillId]
					
					for(let chargeId in bookingChargesNameHM) {
						let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
						
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
					}
				}
			}
			
			if(pboData != undefined && pboData != null) {
				$("#mainContent").load("/ivcargo/html/report/podreport/userWisePodReport/userWisePodBranchReport.html",function() {
					$('#headerDetails').text(heading + " (Branch: " + sourceBranch + ")");
					slickGridWrapper2.setGrid(response);
				});
			} else
				slickGridWrapper2.setGrid(response);
		}
	});
});