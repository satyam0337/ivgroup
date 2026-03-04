/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([],
	function() {
	let _this, lsNumber, dispatchId,unloadingCrossingBranchId, isLhpvCreation;

	return Marionette.LayoutView.extend({
		initialize : function(jsonInObj) {
			//_this object is added because this object is not found in onRender function
			lsNumber 		= jsonInObj.lsNumber;
			dispatchId		= jsonInObj.dispatchId;
			unloadingCrossingBranchId		= jsonInObj.unloadingCrossingBranchId;
			isLhpvCreation					= jsonInObj.isLhpvCreation;
			
			_this = this;
		}, render: function() {
			_this.setPrint();
		}, setPrint : function() {
			_this.openPrint(dispatchId, lsPropertyConfig.doNotOpenPrintPopupAfterDispatch);
			
			let msgDiv		= $("<div />");
			msgDiv.attr("id", "msgDiv");
			
			msgDiv.html("Previous LS Number " + lsNumber + ' <button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint"><span data-selector="reprintBtnLabel">Reprint</span></button>')

			if(lsPropertyConfig.showLoadingHamaliPrintButton)
				msgDiv.append(' &nbsp; <button type="button" name="hamaliDetailsBtn" id="hamaliDetailsBtn" class="btn btn-success" data-tooltip="Hamali Details"><span data-selector="">Hamali Details</span></button>')
			
			if(lsPropertyConfig.showMinifiedLsButton)
				msgDiv.append(' &nbsp; <button type="button" name="minifiedLsBtn" id="minifiedLsBtn" class="btn btn-success" data-tooltip="Mini LS Print"><span data-selector="minifiedLsBtnLabel">LR Details</span></button>')
			
			$('#LsRePrint').append(msgDiv);
			
			$("#reprintBtn").click(function() {
				_this.openPrint(dispatchId, false);
			});
			
			$("#hamaliDetailsBtn").click(function() {
				_this.openHamaliPrint(dispatchId);
			});
			
			$("#minifiedLsBtn").click(function() {
				_this.openMinifiedLsPrint(dispatchId);
			});
		}, openPrint : function(dispatchId, doNotOpenPrintPopupAfterDispatch) {
			if(isLhpvCreation == true || isLhpvCreation == 'true') {
				if(lsPropertyConfig.isNewModuleLhpvLockingAfterLsCreation)
					window.location.href = 'LHPV.do?pageId=340&eventId=1&modulename=lhpvAction&isLhpvAfterLS=true&dispatchLedgerId=' + dispatchId + '&lsNumber=' + lsNumber;
				else
					window.location.href = 'CreateLHPV.do?pageId=228&eventId=1&dispatchLedgerId=' + dispatchId + '&lsNumber=' + lsNumber + '&isLhpvLockingAfterLsCreation=true&unloadingCrossingBranchId='+unloadingCrossingBranchId+'';
			} else if(!doNotOpenPrintPopupAfterDispatch) {
				if ($("#oldJSPForPrint").val() == 'true')
					window.open('LSView.do?pageId=11&eventId=9&dispatchLedgerId='+dispatchId+'&isSearchModule=true&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				else if($("#oldDispatchPrint").val() == 'true')
					window.open('LSView.do?pageId=11&eventId=3&dispatchLedgerId='+dispatchId+'&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				else if(lsPropertyConfig.branchWiseOldLSPrint)
					window.open('OutboundManifest.do?pageId=11&eventId=10&dispatchLedgerId=' + dispatchId + '&Type=Dispatched&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');	
				else
					window.open('InterBranch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid=' + dispatchId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');	
			}
		}, openMinifiedLsPrint : function(dispatchId) {
			window.open('InterBranch.do?pageId=340&eventId=10&modulename=minifiedLoadingSheetPrint&masterid=' + dispatchId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, openHamaliPrint : function(dispatchId) {
			window.open('HamaliDetails.do?pageId=340&eventId=10&modulename=loadingHamaliDetailsPrint&masterid=' + dispatchId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});	
});