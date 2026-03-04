define(function(require) {
	return {
		elementCollection : function(jsonObject) {
			let	urlArray	= new Array();
			
			if(jsonObject.updateCollectionPerson)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/collectionPerson.json'));
			
			if(jsonObject.updateRemark)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/invoiceremark.json'));
			
			if(jsonObject.updateAdditionalCharge)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/additionalAmount.json'));
			
			if(jsonObject.updateBillDate)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/billDate.json'));
			
			if(jsonObject.editPartyNameForPrint)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/editPartyNameForPrint.json'));
			
			if(jsonObject.editBillingPartyName)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/editBillingPartyName.json'));
			
			if(jsonObject.updateBillSubmissionDate)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/billSubmissionDate.json'));
			
			if(jsonObject.updateHSNCode)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/hsnCode.json'));

			if(jsonObject.updateSACCode)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/sacCode.json'));
			
			if(jsonObject.updateVCode)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/vCode.json'));
			
			if(jsonObject.updatePONumber)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/poNumber.json'));
			
			if(jsonObject.updateBillPODate)
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/poDate.json'));
			
			if(jsonObject.updateAdditionalDiscount) {
				urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/additionalDiscount.json'));

				if(jsonObject.showAdditionalDiscountOptionWithPercentage)
					urlArray.push(require('text!/ivcargo/resources/js/model/editCreditorInvoice/additionalDiscountPercentage.json'));
			}
			
			return urlArray;
		}
	}
});