define([
    PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
    'JsonUtility',
    'messageUtility',
    'nodvalidation',
    PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
    'focusnavigation', //import in require.config
], function (UrlParameter) {
    'use strict';
    
    let jsonObject = new Object(),  _this = '', transferReceiveLedgerId;

    return Marionette.LayoutView.extend({
        initialize: function () {
            transferReceiveLedgerId = UrlParameter.getModuleNameFromParam(MASTERID);
            _this = this;
        }, render: function () {
            jsonObject.transferReceiveLedgerId	= transferReceiveLedgerId;

            getJSON(jsonObject, WEB_SERVICE_URL + '/transferReceiveLsPrintWS/getLsReceivePrintData.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);
            return _this;
        }, getResponseForPrint: function(responseOut) {
			
            hideLayer();

            let loadelement = new Array();
            let baseHtml = new $.Deferred();

            loadelement.push(baseHtml);

            $("#mainContent").load("/ivcargo/template/tceLsReceivePrint/transferReceiveLsPrint.html", function () {
                baseHtml.resolve();
            });

            $.when.apply($, loadelement).done(function() {
                //initialiseFocus();
                
                const transferReceiveLedgerList = responseOut.transferLedgerList;
                const lsSrcBranch = responseOut.lsSrcBranch;
                const lsDestBranch = responseOut.lsDestBranch;
                const printHeaderModel = responseOut.printHeaderModel;

                $("*[data-account='name']").html(printHeaderModel.accountGroupName);
                $("*[data-account='address']").html(printHeaderModel.branchAddress);
                $("*[data-account='phoneNo']").html(printHeaderModel.branchContactDetailMobileNumber);
                $("*[data-ls='from']").html(lsSrcBranch.branchName);
                $("*[data-ls='to']").html(lsDestBranch.branchName);
                $("*[data-ls='vehicleNo']").html(transferReceiveLedgerList[0].vehicleNumber);
                $("*[data-ls='tlDate']").html(transferReceiveLedgerList[0].transferLedgerCreationDate);
                $("*[data-ls='trlDate']").html(transferReceiveLedgerList[0].transferReceiveCreationDate);
                $("*[data-ls='trlNo']").html(transferReceiveLedgerList[0].transferReceiveLedgerNumber);
                $("*[data-ls='truckArrivalTime']").html(transferReceiveLedgerList[0].truckArrivalTime);
                $("*[data-ls='UnloadingTime']").html(transferReceiveLedgerList[0].unloadingTime);
                $("*[data-ls='remark']").html(transferReceiveLedgerList[0].remark);
                $("*[data-ls='unloadedBy']").html(lsDestBranch.branchContactDetailContactPersonName);
                $("*[data-ls='executiveName']").html(transferReceiveLedgerList[0].receiveByOperatorExecutiveName);
                $("*[data-ls='executiveMobile']").html(transferReceiveLedgerList[0].receiveByOperatorExecutiveMobile);

                let columnArray = new Array();
                let actualWeight= 0;
                let damageQuantity = 0;
                let excessArticle = 0;
                let receiveQuantity = 0;
                let receiveWeight = 0;
                let shortArticle = 0;

                for (let i = 0; i < transferReceiveLedgerList.length; i++) {
                    let obj = transferReceiveLedgerList[i];
                    let serialNumber = i + 1; 
                    
                    actualWeight		+= obj.actualWeight;
                    damageQuantity 		+= obj.damageQuantity;
                    excessArticle 		+= obj.excessArticle;
                    receiveQuantity		+= obj.receiveQuantity;
                    receiveWeight		+= obj.receiveWeight;
                    shortArticle		+= obj.shortArticle;

				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + serialNumber + "</td>");
				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.wayBillNumber || '--') + "</td>");
				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.sender || '--') + "</td>");
				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.receiver || '--') + "</td>");
/*				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.receiverNo || '--') + "</td>");
*/				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.actualWeight ? obj.actualWeight.toFixed(2) : '0.00') + "</td>");
				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.damageQuantity || 0) + "</td>");
				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.excessArticle || 0) + "</td>");
				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.receiveQuantity || 0) + "</td>");
                    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.receiveWeight ? obj.receiveWeight.toFixed(2) : '0.00') + "</td>");
				    columnArray.push("<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black;'>" + (obj.shortArticle || 0) + "</td>");

                    $('#transferledgerreceivebody').append('<tr>' + columnArray.join(' ') + '</tr>');
                    columnArray = [];
                }
                
				let totalRow = "<tr>" +
				    "<td colspan='4' style='text-align: right; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>Total</td>" +
				    "<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + actualWeight.toFixed(2)+ "</td>" +
				    "<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + damageQuantity.toFixed(2) + "</td>" +
				    "<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + excessArticle.toFixed(2) + "</td>" +
				    "<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + receiveQuantity.toFixed(2) + "</td>" +
				    "<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + receiveWeight.toFixed(2) + "</td>" +
				    "<td style='text-align: center; vertical-align: middle; color: black; border: 1px solid black; font-weight: bold;'>" + shortArticle.toFixed(2) + "</td>" +
				
				    "</tr>";    
				
				$('#transferledgerreceivebody').append(totalRow);
				
				setTimeout(function() {
					window.print();
				}, 200);
            });
            
        }
    });
});
