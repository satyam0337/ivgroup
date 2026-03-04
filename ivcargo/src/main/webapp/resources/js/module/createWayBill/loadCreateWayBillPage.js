/**
 * @Author	Anant Chaudhary	04-01-2015
 * Seperated from Create.js file
 */

//load elements as par configuration file
function loadCreateWayBillPage(configuration) {
	if(configuration.documentTypeSelection == 'true') {
		$("#documenttypepanel").load( "/ivcargo/jsp/createWayBill/includes/DocumentType.html", function() {
			loadDocumentType.resolve();
		});
	} else
		$( "#documenttypepanel" ).remove();
	
	if(configuration.paidPartialPaymentOnBooking == 'true') {
		$("#partialPaymentModal").load( "/ivcargo/jsp/createWayBill/includes/PartialPaymentModal.html", function() {
			partialPaymentModal.resolve();
		});
	} else
		$( "#partialPaymentModal" ).remove();

	if(configuration.showViewAllConsignmentGoodsLink == 'true') {
		$("#viewAllConsignmentGoodsModal").load( "/ivcargo/jsp/createWayBill/includes/ViewAllConsignmentGoodsModal.html", function() {
			viewAllConsignmentGoodsModal.resolve();
		});
	} else
		$( "#viewAllConsignmentGoodsModal" ).remove();
	
	if(configuration.calculateDestBranchToDoorDlyDistance == 'true') {
		$("#branchAddressPanel").load( "/ivcargo/jsp/createWayBill/includes/BranchAddress.html", function() {
			viewAllConsignmentGoodsModal.resolve();
		});
	}
	
	if(jsondata.SHOW_BILL_SELECTION) {
		$("#billSelectionoverlaypanel").load( "/ivcargo/jsp/createWayBill/includes/BillSelection.html?v=1", function() {
			loadBillSelectionAtBooking.resolve();
		});
	} else
		$( "#billSelectionoverlaypanel" ).remove();
	
	if (configuration.wayBillTypeOption == 'true') {
		$("#waybilltypepanel" ).load( "/ivcargo/jsp/createWayBill/includes/WBTypePanel.html", function() {
			setWaybillType();
			loadWayBillTypeOption.resolve();
		});
	} else
		$("#waybilltypepanel" ).remove();
	
	if (configuration.showTransportationMode == 'true') {
		$("#transportationModePanel").load( "/ivcargo/jsp/createWayBill/includes/TransportationMode.html", function() {
			loadTransportationMode.resolve();
		});
	} else
		$( "#transportationModePanel" ).remove();
	
	if (configuration.BookingType == 'true') {
		if(configuration.allowFullLoadBookingOnly == 'true') {
			if(jsondata.ALLOW_FULL_LOAD_BOOKING_ONLY) {
				$("#waybillbookingtypepanel" ).load( "/ivcargo/jsp/createWayBill/includes/WayBillBookingType.html", function() {
					loadBookingType.resolve();
				});
			} else
				$("#waybillbookingtypepanel" ).remove();
		} else {
			$("#waybillbookingtypepanel" ).load( "/ivcargo/jsp/createWayBill/includes/WayBillBookingType.html", function() {
				loadBookingType.resolve();
			});
		}
	} else
		$("#waybillbookingtypepanel" ).remove();
	
	if (configuration.PreBookingChargeAmount == 'true') {
		$("#preBookingChargesPanel" ).load( "/ivcargo/jsp/createWayBill/includes/PreBookingCharges.html", function() {
			loadPreBookingCharges.resolve();
		});
	} else
		$("#preBookingChargesPanel" ).remove();

	if (configuration.BranchCode == 'true' && !isAutoSequenceCounter) {
		$("#branchCodepanel" ).load( "/ivcargo/jsp/createWayBill/includes/BranchCode.html", function() {
			loadBranchCode.resolve();
		});
	} else
		$("#branchCodepanel" ).remove();
	
	if (jsondata.AUTO_LR_NUMBER_IN_MANUAL) {
		$("#sequenceTypepanel" ).load( "/ivcargo/jsp/createWayBill/includes/SequenceTypeSelection.html", function() {
			sequenceTypeSelection.resolve();
		});
	} else
		$("#sequenceTypepanel" ).remove();

	if (jsondata.AUTO_LR_SEQUENCE_COUNTER_CHECK_BOX_IN_MANUAL) {
		$("#LRSequenceCounterCheckpanel" ).load( "/ivcargo/jsp/createWayBill/includes/LRSequenceCounterCheckBox.html", function() {
			LRSequenceCounterCheckBox.resolve();
		});
	} else
		$("#LRSequenceCounterCheckpanel" ).remove();
	
	if(configuration.TokenWiseAutoLrSequence == 'true' && !isAutoSequenceCounter && !isManualWayBill){
		$("#TokenWiseLRNumberpanel" ).load( "/ivcargo/jsp/createWayBill/includes/TokenWiseLRNumber.html", function() {
			loadLRNumberManual.resolve();
		});
	} else if(configuration.seperateSequenceRequiredForTbbParty == 'true' && !isManualWayBill){
		$("#PartyWiseLRNumberpanel" ).load( "/ivcargo/jsp/createWayBill/includes/PartyWiseLRNumber.html", function() {
			loadLRNumberManual.resolve();
		});
	} else if (configuration.LRNumberManual == 'true' && !isAutoSequenceCounter) {
		$("#lrnumbermanualpanel" ).load( "/ivcargo/jsp/createWayBill/includes/LRNumberManual.html", function() {
			loadLRNumberManual.resolve();
		});
	} else
		$("#lrnumbermanualpanel" ).remove();
	
	if(!isManualWayBill && (configuration.showExtraSingleEwaybillField == 'true' || configuration.showExtraSingleEwaybillField == true)
		|| (isManualWayBill && (configuration.showExtraSingleEwaybillFieldOnManualScreen == 'true' || configuration.showExtraSingleEwaybillFieldOnManualScreen == true))) {
		if(configuration.showExtraSingleEwaybillFieldBranchWise == 'true') {
			var	branchIds 	= configuration.branchIdsToShowExtraSingleEwaybillField.split(',');
			
			if(isValueExistInArray(branchIds, executive.branchId)) {
				$("#SingleEwayBillNumber" ).load( "/ivcargo/jsp/createWayBill/includes/SingleEwayBillNumber.html", function() {
					loadSingleEwayBillNumber.resolve();
				});
			}
		} else {
			$("#SingleEwayBillNumber" ).load( "/ivcargo/jsp/createWayBill/includes/SingleEwayBillNumber.html", function() {
				loadSingleEwayBillNumber.resolve();
			});
		}
	}
	
	if(configuration.OTLrNumber == 'true' || configuration.OTLrNumber == true ){
		$("#otlrnumberpanel" ).load( "/ivcargo/jsp/createWayBill/includes/OTLRNumber.html", function() {
			loadOTLRNumber.resolve();
		});
	} else
		$("#otlrnumberpanel" ).remove();

	//LR  Date For Manual
	if (configuration.LRDate == 'true') {
		$("#LrDate" ).load( "/ivcargo/jsp/createWayBill/includes/LRDateManual.html", function() {
			loadLRDate.resolve();
		});
	} else
		$("#LrDate" ).remove();
	
	var regionIdsArr 	= (configuration.regionIdsForSourceBranchWork).split(",");
	
	if((!isManualWayBill && configuration.sourceBranchAuto == 'true' 
			&& configuration.regionWiseSourceBranchWork == 'true' && isValueExistInArray(regionIdsArr, executive.regionId)) 
			|| (isManualWayBill && configuration.sourceBranch == 'true')) {
				
		if(configuration.sourceBranchPanelAfterLrNumber == 'true' && isManualWayBill) {
			$("#sourcebranchpanelAfterLrNumber").load( "/ivcargo/jsp/createWayBill/includes/sourceBranch.html", function() {
				loadSourceBranch.resolve();
			});
			$( "#sourcebranchpanel" ).remove();
		} else{
			$("#sourcebranchpanel").load( "/ivcargo/jsp/createWayBill/includes/sourceBranch.html", function() {
				loadSourceBranch.resolve();
			});
			$( "#sourcebranchpanelAfterLrNumber" ).remove();
		}
	} else {
		$( "#sourcebranchpanel" ).remove();
		$( "#sourcebranchpanelAfterLrNumber" ).remove();
	}
	
	if (configuration.showSubRegionwiseDestinationBranchField == 'true') {
		$("#subRegionDestinationpanel").load( "/ivcargo/jsp/createWayBill/includes/SubRegion.html", function() {
			loadSubregionDestination.resolve();
		});
	} else
		$( "#subRegionDestinationpanel" ).remove();


	if(configuration.showSelectedDestinationBranchSubRegionName == 'true') {
		$("#destinationBranchSubregionPanel").load( "/ivcargo/jsp/createWayBill/includes/DestinationBranchSubregion.html", function() {
			loadSubregionDestination.resolve();
			$("#waybilltypepanel" ).removeClass('width-20per').addClass('width-10per')
			$("#waybillbookingtypepanel" ).removeClass('width-20per').addClass('width-10per')	
			$("#LrDate" ).removeClass('width-20per').addClass('width-10per')
			$("#lrnumbermanualpanel" ).removeClass('width-20per').addClass('width-10per')	
		});
	} else
		$("#destinationBranchSubregionPanel").remove();

	if(configuration.ShowCityAndDestinationBranch == 'true') {
		if(isManualWayBill) {
			if (configuration.DeliveryDestination == 'true') {
				$("#destinationbranchpanel").load( "/ivcargo/jsp/createWayBill/includes/DestinationBranch.html", function() {
					loadDestination.resolve();
				});
			} else
				$( "#destinationbranchpanel" ).remove();
		} else {
			$("#destinationbranchpanel").load( "/ivcargo/jsp/createWayBill/includes/DestinationBranchByCity.html", function() {
				loadDestination.resolve();
				$( "#sourcebranchpanel" ).remove();
			});
		}
	} else if(configuration.showSubRegionwiseDestinationBranchField == 'true' && configuration.DeliveryDestinationDropdown == 'true'){
		$("#destinationbranchpanel").load( "/ivcargo/jsp/createWayBill/includes/DestinationBranchBySubregionDropdown.html", function() {
			loadDestination.resolve();
		});
	} else if (configuration.DeliveryDestination == 'true') {
		if(configuration.destinationBranchPanelAfterLrNumber == 'true' && isManualWayBill) {
			$("#destinationbranchpanelAfterLrNumber").load( "/ivcargo/jsp/createWayBill/includes/DestinationBranch.html", function() {
				loadDestination.resolve();
			});
			
			$( "#destinationbranchpanel" ).remove();
		} else {
			$("#destinationbranchpanel").load( "/ivcargo/jsp/createWayBill/includes/DestinationBranch.html", function() {
				loadDestination.resolve();
			});
			
			$( "#destinationbranchpanelAfterLrNumber" ).remove();
		}
	} else {
		$( "#destinationbranchpanel" ).remove();
		$( "#destinationbranchpanelAfterLrNumber" ).remove();
	}
	
	if(showRegionWiseMovementType ) {
		$("#movementTypePanel").load( "/ivcargo/jsp/createWayBill/includes/MovementType.html", function() {
		movementTypeWithConstantValue(jsondata.MovementType)

			loadMovementTypeFeild.resolve();
		});
		
	} else
		$( "#movementTypePanel " ).remove();
	
	if(configuration.showTransporterName == 'true') {
		$("#transporternamepanel").load( "/ivcargo/jsp/createWayBill/includes/TransporterName.html", function() {
			loadDestination.resolve();
		});
	} else
		$( "#transporternamepanel " ).remove();
	
	if (configuration.PickupType == 'true') {
		$("#pickuptypepanel").load("/ivcargo/jsp/createWayBill/includes/PickupTypeCombobox.html", function() {
			loadPickUp.resolve();
		});
	} else
		$("#pickuptypepanel").remove();

	if (configuration.FrightuptoDestination == 'true') {
		$("#freightuptobranchpanel").load( "/ivcargo/jsp/createWayBill/includes/FreightUptoBranch.html", function() {
			loadFrightUpTo.resolve();
		});
	} else
		$( "#freightuptobranchpanel" ).remove();
	
	if (configuration.VehicleNumber == 'true') {
		$("#vehiclenumberpanel").load( "/ivcargo/jsp/createWayBill/includes/VehicleNumber.html", function() {
			loadVehicleNumber.resolve();
		});
		
		$("#vehicleNumberAfterBookingTypepanel" ).remove();
	} else if(configuration.vehicleNumberAfterBookingType == 'true') {
		$("#vehicleNumberAfterBookingTypepanel" ).load( "/ivcargo/jsp/createWayBill/includes/VehicleNumber.html", function() {
			loadVehicleNumber.resolve();
		});
		
		$( "#vehiclenumberpanel" ).remove();
	} else {
		$( "#vehiclenumberpanel" ).remove();
		$("#vehicleNumberAfterBookingTypepanel" ).remove();
	}

	if (configuration.VehicleType == 'true') {
		$("#vehicletypepanel").load( "/ivcargo/jsp/createWayBill/includes/VehicleType.html", function() {
			loadVehicleType.resolve();
		});
		
		$("#vehicletypeAfterBookingTypepanel" ).remove();
	} else if(configuration.vehicleTypeAfterBookingType == 'true') {
		$("#vehicletypeAfterBookingTypepanel" ).load( "/ivcargo/jsp/createWayBill/includes/VehicleType.html", function() {
			loadVehicleType.resolve();
		});
		
		$( "#vehicletypepanel" ).remove();
	} else {
		$( "#vehicletypepanel" ).remove();
		$("#vehicletypeAfterBookingTypepanel" ).remove();
	}

	if (configuration.FutureDate == 'true') {
		$("#futuredatepanel").load( "/ivcargo/jsp/createWayBill/includes/FutureDate.html", function() {
			loadFutureDate.resolve();
		});
	} else
		$( "#futuredatepanel" ).remove();

	if (configuration.ShowBillSelectionText == 'true') {
		$("#billSelectionTextPanel").load( "/ivcargo/jsp/createWayBill/includes/ShowBillSelection.html", function() {
			billSelectionText.resolve();
		});
	} else
		$( "#billSelectionTextPanel" ).remove();
	
	if (configuration.Consignor == 'true') {
		if(configuration.partyPanelType == '1') {
			$("#consignorpanel").load( "/ivcargo/jsp/createWayBill/includes/Consignor.html", function() {
				loadConsignor.resolve();
			});
		} else if(configuration.partyPanelType == '2') {
			$("#consignorpanel").load( "/ivcargo/jsp/createWayBill/includes/ConsignorContact.html", function() {
				loadConsignor.resolve();
			});
		} else if(configuration.partyPanelType == '3') {
			$("#consignorpanel").load( "/ivcargo/jsp/createWayBill/includes/ConsignorGstn.html", function() {
				loadConsignor.resolve();
			});
		} else {
			$("#consignorpanel").load( "/ivcargo/jsp/createWayBill/includes/Consignor.html", function() {
				loadConsignor.resolve();
			});
		}
	} else
		$( "#consignorpanel" ).remove();

	if (configuration.Consignee == 'true') {
		if(configuration.partyPanelType == '1'){
			$("#consigneepanel").load( "/ivcargo/jsp/createWayBill/includes/Consignee.html", function() {
				loadConsignee.resolve();
			});
		} else if(configuration.partyPanelType == '2'){
			$("#consigneepanel").load( "/ivcargo/jsp/createWayBill/includes/ConsigneeContact.html", function() {
				loadConsignee.resolve();
			});
		} else if(configuration.partyPanelType == '3'){
			$("#consigneepanel").load( "/ivcargo/jsp/createWayBill/includes/ConsigneeGstn.html", function() {
				loadConsignee.resolve();
			});
		} else {
			$("#consigneepanel").load( "/ivcargo/jsp/createWayBill/includes/Consignee.html", function() {
				loadConsignee.resolve();
			});
		}
	} else
		$( "#consigneepanel" ).remove();

	if (configuration.AddArticle == 'true') {
		if(configuration.VolumetricWiseAddArticle == 'true') {
			$("#addarticlepanel").load( "/ivcargo/jsp/createWayBill/includes/VolumetricWiseAddArticle.html", function() {
				loadAddArticle.resolve();
				
				if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true')
					createOptionForVolumetricFeild();
			});
		} else if(configuration.AddArticleForLMT == 'true') {
			$("#addarticlepanel").load( "/ivcargo/jsp/createWayBill/includes/LMTAddArticle.html", function() {
				loadAddArticle.resolve();
			});
		} else {
			$("#addarticlepanel").load( "/ivcargo/jsp/createWayBill/includes/AddArticle.html", function() {
				loadAddArticle.resolve();
			});
		}
	} else
		$( "#addarticlepanel" ).remove();

	if (configuration.WaightAndAmount == 'true') {
		if(configuration.WaightAndAmountForLMT == 'true') {
			$("#weightandamountpanel").load( "/ivcargo/jsp/createWayBill/includes/LMTWeightandAmount.html", function() {
				loadWeightAndAmount.resolve();
			});
		} else if(configuration.showActualAndChargedWeightInMerticTon == 'true') {
			$("#weightandamountpanel").load( "/ivcargo/jsp/createWayBill/includes/HTCActualAndChargedWeightInTon.html", function() {
				loadWeightAndAmount.resolve();
			});
		} else {
			$("#weightandamountpanel").load( "/ivcargo/jsp/createWayBill/includes/WeightandAmount.html", function() {
				loadWeightAndAmount.resolve();
			});
		}
	} else
		$( "#weightandamountpanel" ).remove();

	if (configuration.STPaidBy == 'true') {
		$("#stpaidbypanel").load( "/ivcargo/jsp/createWayBill/includes/GSTPaidByCombobox.html", function() {
			loadSTPaidBy.resolve();
		});
	}

	if (configuration.InvoiceNo == 'true') {
		$("#invoicenopanel").load( "/ivcargo/jsp/createWayBill/includes/InvoiceNo.html", function() {
			loadInvoiceNo.resolve();
		});
	}
	
	if (configuration.showInvoiceDate == 'true') {
		$("#invoiceDatePanel").load( "/ivcargo/jsp/createWayBill/includes/InvoiceDate.html", function() {
			loadInvoiceDate.resolve();
		});
	}
	
	if (configuration.cargoType == 'true') {
		$("#cargoTypePanel").load( "/ivcargo/jsp/createWayBill/includes/CargoType.html", function() {
			loadCargoType.resolve();
		});
	}

	if (configuration.DeclaredValue == 'true' || configuration.DeclaredValueBeforeFormType == 'true') {
		$("#declaredvaluepanel").load( "/ivcargo/jsp/createWayBill/includes/DeclaredValue.html", function() {
			loadDeclaredValue.resolve();
		});
	}

	if (configuration.DeliveryAt == 'true' && configuration.deliveryAtAfterBookingType == 'false') {
		$("#deliverytopanel").load( "/ivcargo/jsp/createWayBill/includes/DeliveryToCombobox.html", function() {
			loadDeliveryTo.resolve();
		});
		
		$("#deliveryAtPanel" ).remove();
	} else if(configuration.deliveryAtAfterBookingType == 'true') {
		$("#deliveryAtPanel" ).load( "/ivcargo/jsp/createWayBill/includes/DeliveryAt.html", function() {
			loadDeliveryTo.resolve();
		});
		
		$("#deliverytopanel" ).remove();
	} else {
		$("#deliveryAtPanel" ).remove();
		$("#deliverytopanel" ).remove();
	}
	
	if (configuration.showInsurance  == 'true') {
		$("#insurancepanel").load( "/ivcargo/jsp/createWayBill/includes/Insurance.html", function() {
			loadInsurance.resolve();
		});
	}
	
	if (configuration.allowedCashOnDelivery  == 'true') {
		$("#codpanel").load( "/ivcargo/jsp/createWayBill/includes/cod.html", function() {
			loadCod.resolve();
		});
	}

	if (configuration.multipleRemarkField == 'true') {
		$("#multipleRemark").load( "/ivcargo/jsp/createWayBill/includes/MultipleRemarkField.html", function() {
			loadRemark.resolve();
		});
	}
	
	if (configuration.Remark == 'true') {
		$("#remarkpanel").load( "/ivcargo/jsp/createWayBill/includes/Remark.html", function() {
			loadRemark.resolve();
		});
	}
	
	if(configuration.taxCalculationBasedOnGSTSelection == 'true'){
		$("#gstPerSelectionPanel").load("/ivcargo/jsp/createWayBill/includes/GSTPerSelection.html", function(){
			loadGstPercentSelection.resolve();
		});
	}
	
	if (configuration.purchaseOrderNumber == 'true') {
		$("#purchaseOrderNumberpanel").load( "/ivcargo/jsp/createWayBill/includes/purchaseOrder.html", function() {
			loadRemark.resolve();
		});
	}

	if (configuration.purchaseOrderDate == 'true') {
		$("#purchaseOrderDatepanel").load( "/ivcargo/jsp/createWayBill/includes/purchaseOrderDate.html", function() {
			loadRemark.resolve();
		});
	}
	
	if (configuration.additionalRemark == 'true') {
		$("#additionalremarkpanel").load( "/ivcargo/jsp/createWayBill/includes/AdditionalRemark.html", function() {
			loadAdditionalRemark.resolve();
		});
	}

	if (configuration.rfqNumber == 'true') {
		$("#rfqNumberpanel").load("/ivcargo/jsp/createWayBill/includes/rfqNumber.html", function() {
			loadRemark.resolve();
		});
	}

	if (configuration.shipmentNumber == 'true') {
		$("#shipmentNumberpanel").load("/ivcargo/jsp/createWayBill/includes/shipmentNumber.html", function() {
			loadRemark.resolve();
		});
	}

	if (configuration.billOfEntriesNumber == 'true') {
		$("#billOfEntriesNumberpanel").load("/ivcargo/jsp/createWayBill/includes/billOfEntriesNumber.html", function() {
			loadRemark.resolve();
		});
	}

	if (configuration.PaymentType == 'true') {
		$("#paymenttypepanel").load( "/ivcargo/jsp/createWayBill/includes/PaymentTypeCombobox.html", function() {
			loadPaymentType.resolve();
		});
	} else
		$( "#paymenttypepanel" ).remove();
	
	if (configuration.showToPayAdvanceField == 'true') {
		$("#topayAdvancePanel").load("/ivcargo/jsp/createWayBill/includes/ToPayAdvance.html", function() {
			loadTopayAdvance.resolve();
			$("#topayAdvancePanel").hide();
		});
	} else
		$("#topayAdvancePanel").remove();
	
	if(configuration.ServiceType == 'true'){
		$("#serviceTypePanel").load( "/ivcargo/jsp/createWayBill/includes/ServiceTypeCombobox.html", function() {
			loadServiceType.resolve();
		});
	} else
		$( "#serviceTypePanel" ).remove();
	
	if (configuration.paidPartialPaymentOnBooking == 'true') {
		$("#partialpaymentpanel").load( "/ivcargo/jsp/createWayBill/includes/PartialPaymentComboBox.html", function() {
			loadPartialPaymentType.resolve();
		});
	} else
		$( "#partialpaymentpanel" ).remove();

	if (configuration.TotalQuantity == 'false')
		changeDisplayProperty('totalquantity', 'none');

	if (configuration.CollectionPerson == 'true') {
		$("#searchcollectionpersonpanel").load( "/ivcargo/jsp/createWayBill/includes/SearchCollectionPerson.html", function() {
			loadSearchCollectionPerson.resolve();
		});
	} else
		$( "#searchcollectionpersonpanel" ).remove();

	if (configuration.showRecoveryBranchForShortCredit == 'true') {
		$("#recoverybranchpanel").load( "/ivcargo/jsp/createWayBill/includes/RecoveryBranch.html", function() {
			loadRecoveryBranch.resolve();
		});
	} else
		$( "#recoverybranchpanel" ).remove();
		
	if (configuration.PaymentTypeCheque == 'true') {
		$("#chequedetailspanel").load( "/ivcargo/jsp/createWayBill/includes/ChequeDetails.html", function() {
			loadChequeDetails.resolve();
		});
	} else
		$( "#chequedetailspanel" ).remove();

	//to load Credit card feild details - Ravi Prajapati
	if (configuration.PaymentTypeCreditCard == 'true' || configuration.PaymentTypeDebitCard == 'true') {
		$("#creditcarddetailspanel").load( "/ivcargo/jsp/createWayBill/includes/CreditCardDetails.html", function() {
			loadCreditCardDetails.resolve();
		});
	} else
		$( "#creditcarddetailspanel" ).remove();
	
	/*//to load Debit Card Feild Details - Ravi Prajapati
	if (configuration.PaymentTypeDebitCard == 'true') {
		$("#debitcarddetailspanel").load( "/ivcargo/jsp/createWayBill/includes/DebitCardDetails.html", function() {
			loadDebitCardDetails.resolve();
		});
	} else {
		$( "#debitcarddetailspanel" ).remove();
	}*/
	
	//to load Paytm Feild Details - Ravi Prajapati
	if (configuration.PaymentTypePaytm == 'true') {
		$("#paytmdetailspanel").load( "/ivcargo/jsp/createWayBill/includes/paytmDetails.html", function() {
			loadPaytmDetails.resolve();
		});
	} else
		$( "#paytmdetailspanel" ).remove();

	if (configuration.SaveButton == 'true') {
		$("#savebuttonpanel").load( "/ivcargo/jsp/createWayBill/includes/SaveButton.html", function() {
			loadSaveButton.resolve();
		});
	} else
		$( "#savebuttonpanel" ).remove();
	
	if (jsondata.showEstimatedTimeArrival) {
		$("#ETApanel").load( "/ivcargo/jsp/createWayBill/includes/EstimatedTimeArival.html", function() {
			loadETAButton.resolve();
		});
	} else
		$( "#ETApanel" ).remove();

	if (configuration.isReservedLrBookingAllow == 'true' && jsondata.ALLOW_RESERVED_LR_BOOKING) {
		$("#reserveLrCheckPanel").load( "/ivcargo/jsp/createWayBill/includes/ReserveCheckBox.html", function() {
			loadReserveCheckBox.resolve();
		});
	} else
		$( "#reserveLrCheckPanel" ).remove();

	if (configuration.WayBillCharges == 'true') {
		$("#waybillchargespanel").load( "/ivcargo/jsp/createWayBill/includes/WayBillCharges.html", function() {
			loadWayBillCharges.resolve();
		});
	} else
		$( "#waybillchargespanel" ).remove();

	if(configuration.NewPartyAutoSave == 'true'){
		$("#addnewpartyoverlaypanel").load( "/ivcargo/jsp/createWayBill/includes/AddNewPartyOverlay.html", function() {
			loadAddNewPartyOverlay.resolve();
		});
	} else
		$( "#addnewpartyoverlaypanel" ).remove();

	if (configuration.SaidToContainOverlay == 'true') {
		$("#saidtocontainoverlaypanel").load( "/ivcargo/jsp/createWayBill/includes/SaidToContainOverlay.html", function() {
			loadSaidToContainOverlay.resolve();
		});
	} else
		$( "#saidtocontainoverlaypanel" ).remove();

	if (configuration.CommodityType == 'true') {
		$("#commoditytypepanel").load( "/ivcargo/jsp/createWayBill/includes/CommodityType.html", function() {
			loadCommodityType.resolve();
		});
	}

	if (configuration.WayBillType == 'true') {
		$("#DisplayWayBillType").load( "/ivcargo/jsp/createWayBill/includes/WayBillType.html", function() {
			loadWayBillType.resolve();
		});
		
		$("#DisplayWayBillTypeForManual").load( "/ivcargo/jsp/createWayBill/includes/wayBillTypeForManual.html", function() {
			loadWayBillType.resolve();
		});
	} else {
		$( "#DisplayWayBillType" ).remove();
		$( "#DisplayWayBillTypeForManual" ).remove();
	}

	if(configuration.showPrivateMarkAsTripId == 'true'){
		$("#privatemarkpanel").load( "/ivcargo/jsp/createWayBill/includes/PrivateMarkAsTripId.html", function() {
			loadPrivateMark.resolve();
		});
	} else if (configuration.PrivateMark == 'true') {
		$("#privatemarkpanel").load( "/ivcargo/jsp/createWayBill/includes/PrivateMark.html", function() {
			loadPrivateMark.resolve();
		});
	}
	
	if(configuration.PrivateMarkBeforeFormType == 'true'){
		$("#privatemarkpanel").load( "/ivcargo/jsp/createWayBill/includes/PrivateMark.html", function() {
			loadPrivateMark.resolve();
		});
	}
	
	if (configuration.isRiskAllocationAllow == 'true') {
		$("#riskallocationpanel").load( "/ivcargo/jsp/createWayBill/includes/RiskAllocation.html", function() {
			loadRiskAllocation.resolve();
		});
	}

	if (configuration.FormsWithMultipleSelection == 'true') {
		$("#formTypePanel").load( "/ivcargo/jsp/createWayBill/includes/FormTypes.html", function() {
			loadFormTypes.resolve();
		});
	} else
		$( "#formTypePanel" ).remove();
	
	if (configuration.FormsWithSingleSlection == 'true') {
		$("#singleFormTypePanel").load( "/ivcargo/jsp/createWayBill/includes/SingleFormTypes.html", function() {
			loadSingleFormTypes.resolve();
		});
	} else
		$( "#singleFormTypePanel" ).remove();

	if (configuration.showCCAttechedCheckBox == 'true') {
		$("#ccAttechedFormPanel").load( "/ivcargo/jsp/createWayBill/includes/CCAttechedFormTypes.html", function() {
			loadccAttached.resolve();
		});
	} else
		$( "#ccAttechedFormPanel" ).remove();

	if (configuration.Form403402 == 'true') {
		$("#form403402panel").load( "/ivcargo/jsp/createWayBill/includes/Form_403_402Combobox.html", function() {
			loadForm403402.resolve();
		});
	}

	if (configuration.CTForm == 'true') {
		$("#CTFormpanel").load( "/ivcargo/jsp/createWayBill/includes/CTFormCombobox.html", function() {
			loadFormCTForm.resolve();
		});
	} else
		$( "#CTFormpanel" ).remove();
	
	if (configuration.ShowEwaybillExemptedOption == 'true') {
		$("#eWayBillExemptedPanel").load( "/ivcargo/jsp/createWayBill/includes/EwayBillExempted.html", function() {
			loadEwayBillExempted.resolve();
		});
	} else
		$( "#eWayBillExemptedPanel" ).remove();
	
	if (configuration.RoadPermitNumber == 'true') {
		$("#roadPermitNumberpanel").load( "/ivcargo/jsp/createWayBill/includes/RoadPermitNumber.html", function() {
			loadRoadPermitNumber.resolve();
		});
	} else
		$( "#roadPermitNumberpanel" ).remove();
	
	if (configuration.ExciseInvoice == 'true') {
		$("#exciseInvociepanel").load( "/ivcargo/jsp/createWayBill/includes/ExcieseInvoice.html", function() {
			loadExciseInvocie.resolve();
		});
	} else
		$( "#exciseInvociepanel" ).remove();
	
	if (configuration.ConsignmentInsured == 'true') {
		$("#consignmentInsuredpanel").load( "/ivcargo/jsp/createWayBill/includes/ConsignmentInsured.html", function() {
			loadConsignmentInsured.resolve();
		});
	} else
		$( "#consignmentInsuredpanel" ).remove();
	
	if (allowReverseEntryLRBooking) {
		$("#manualEntryTypePanel").load( "/ivcargo/jsp/createWayBill/includes/ManualEntryType.html", function() {
			loadManualEntryType.resolve();
		});
	} else
		$( "#manualEntryTypePanel").remove();
	
	if (configuration.PanNumber == 'true' || tdsConfiguration.IsPANNumberRequired) {
		$("#PanNumberpanel").load( "/ivcargo/jsp/createWayBill/includes/PanNumber.html", function() {
			loadPanNumber.resolve();
		});
	} 
	
	if (configuration.TanNumber == 'true' || tdsConfiguration.IsTANNumberRequired) {
		$("#TanNumberpanel").load( "/ivcargo/jsp/createWayBill/includes/TanNumber.html", function() {
			loadTanNumber.resolve();
		});
	} 
	
	if (podConfiguration.isPodRequired && podConfiguration.showPODRequiredFeildAtBooking) {
		$("#podRequiredPanel").load( "/ivcargo/jsp/createWayBill/includes/PODRequired.html", function() {
			loadPODRequired.resolve();
		});
	} else
		$( "#podRequiredPanel" ).remove();
	
	if(configuration.showTaxType == 'true'){
		$("#taxTypePanel").load( "/ivcargo/jsp/createWayBill/includes/TaxType.html", function() {
			loadDestination.resolve();
		});
	} else
		$( "#taxTypePanel" ).remove();
	
	if (GeneralConfiguration.BankPaymentOperationRequired == 'true') {
		$("#bankPaymentOperationPanel").load( "/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
			loadBankPaymentOptions.resolve();
		});
	} else
		$( "#bankPaymentOperationPanel").remove();
	
	if (configuration.showPaymentRequiredFeild == 'true') {
		$("#paymentRequiredPanel").load( "/ivcargo/jsp/createWayBill/includes/paymentRequired.html", function() {
			loadPaymentRequiredFeild.resolve();
		});
	} else
		$( "#paymentRequiredPanel" ).remove();
	
	if (configuration.PercentageRiskCover == 'true' || configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true') {
		$("#percentageriskcoverpanel").load( "/ivcargo/jsp/createWayBill/includes/PercentageRiskCover.html", function() {
			loadPercentageRiskCover.resolve();
		});
	}
	
	if (configuration.showSmsRequiredFeild == 'true') {
		$("#smsRequiredPanel").load( "/ivcargo/jsp/createWayBill/includes/smsRequired.html", function() {
			loadSmsRequiredFeild.resolve();
		});
	} else
		$( "#smsRequiredPanel" ).remove();
	
	if (configuration.isShowSingleEwayBillNumberField == 'false') {
		$("#addMutipleEwayBillNumberPanel").load( "/ivcargo/jsp/createWayBill/includes/EwayBillDetailsJSPannel.html", function() {
			addMutipleEwayBillNumber.resolve();
		});
	} else
		$( "#addMutipleEwayBillNumberPanel" ).remove();
	
	if (configuration.validateNextLRNumberOnLogin == 'true') {
		$("#validateNextLRNumberPanel").load( "/ivcargo/jsp/createWayBill/includes/AddNextNumberOfLR.html", function() {
			loadAddNextNumberOfLR.resolve();
		});
	} else
		$( "#validateNextLRNumberPanel" ).remove();
	
	if (configuration.showExcludeCommissionOption == 'true') {
		$("#excludeCommissionPanel").load( "/ivcargo/jsp/createWayBill/includes/excludeCommission.html", function() {
			loadExcludeCommissionOption.resolve();
		});
	} else
		$( "#excludeCommissionPanel" ).remove();
	
	if ((configuration.chequeBounceRequired == 'true' || configuration.chequeBounceRequired == true) 
		&& (configuration.isAllowBookingLockingWhenChequeBounce == 'true')) {
		$("#chequeBouncePanel").load( "/ivcargo/jsp/createWayBill/includes/chequeBounceDetails.html", function() {
			loadChequeBounce.resolve();
		});
	} else
		$( "#chequeBouncePanel" ).remove();
	
	if (isAllowToEnterIDProof) {
		$("#idProofOperationPanel").load( "/ivcargo/html/module/idproofdetails/idproofdetails.html", function() {
			idProofOperation.resolve();
		});
	} else
		$( "#idProofOperationPanel").remove();
	
	if (configuration.billingBranch == 'true') {
		$("#billingbranchpanel").load( "/ivcargo/jsp/createWayBill/includes/BillingBranch.html", function() {
			loadBillingBranch.resolve();
		});
	} else
		$( "#billingbranchpanel" ).remove();
	
	if(jsondata.allowRechargeRequestAtBookingPage) {
		$("#recharge").load( "/ivcargo/html/module/recharge/rechargerequest.html", function() {
			recharge.resolve();
		});
	} else
		$( "#recharge" ).remove();
		
	if(configuration.showFocApprovedBy == 'true' || configuration.showFocApprovedBy == true) {
		$("#DirectorDetails").load( "/ivcargo/jsp/createWayBill/includes/DirectorDropDown.html", function() {
			loadDirectorList.resolve();
		});
	} else
		$( "#DirectorDetails" ).remove();
		
	if (configuration.showCategoryType == 'true' || configuration.showCategoryType == true) {
		$("#categoryFeildpanel").load( "/ivcargo/jsp/createWayBill/includes/CategoryFeild.html", function() {
			loadCategoryFeild.resolve();
		});
	} else
		$( "#categoryFeildpanel" ).remove();
		
	if (configuration.showGstType == 'true' || configuration.showGstType == true) {
		$("#gstTypeFeildPanel").load( "/ivcargo/jsp/createWayBill/includes/GSTTypeFeild.html", function() {
			loadGSTTypeFeild.resolve();
		});
	}
	
	if (configuration.showBookedBy == 'true' || configuration.showBookedBy == 'true') {
		$("#bookedBypanel").load( "/ivcargo/jsp/createWayBill/includes/BookedBy.html", function() {
			loadBookedBy.resolve();
		});
	}
	
	if (configuration.showBranchServiceType == 'true' || configuration.showBranchServiceType == 'true') {
		$("#showBranchServiceTypepanel").load( "/ivcargo/jsp/createWayBill/includes/BranchServiceTypeFeild.html", function() {
			loadServiceTypeFeild.resolve();
			createBranchServiceTypeOption(jsondata.branchServiceTypeList);
		});
		
		$("#branchServiceTypePanel" ).remove();
	} else if(configuration.showBranchServiceTypeAfterBookingType == 'true' || configuration.showBranchServiceTypeAfterBookingType == true) {
		$("#branchServiceTypePanel" ).load( "/ivcargo/jsp/createWayBill/includes/BranchServiceType.html", function() {
			loadServiceTypeFeild.resolve();
			createBranchServiceTypeOption(jsondata.branchServiceTypeList);
		});
		
		$("#showBranchServiceTypepanel" ).remove();
	} else {
		$("#branchServiceTypePanel" ).remove();
		$("#showBranchServiceTypepanel" ).remove();
	}
	
	if (configuration.showTransportationCategory == 'true') {
		$("#transportationCategoryPanel").load( "/ivcargo/jsp/createWayBill/includes/TransportationCategory.html", function() {
			loadTransportationCategory.resolve();
			createTransportationCategoryOption(jsondata.transportationCategoryList);
		});
	} else
		$( "#transportationCategoryPanel" ).remove();
		
	if (jsondata.allowToAddMultipleInvoiceDetail) {
		$("#invoiceDetailsPanel").load( "/ivcargo/jsp/createWayBill/includes/MultipleInvoiceDetails.html", function() {
			loadMultipleInvoiceDetails.resolve();
		});
	}
	
	if(configuration.showInvoiceCreationCheckBox == 'true') {
		$("#createInvoicePanel").load( "/ivcargo/jsp/createWayBill/includes/createInvoice.html", function() {
			loadSmsRequiredFeild.resolve();
		});
	} else
		$( "#createInvoicePanel" ).remove();
		
	if (jsondata.allowBranchWiseInsuranceService) {
		$("#subCommodityTypePanel").load( "/ivcargo/jsp/createWayBill/includes/SubCommodityType.html", function() {
			loadSubCommodityType.resolve();
		});
	}

	if (configuration.showInvoiceQtyField == 'true') {
		$("#invoiceQtyFeildPanel").load( "/ivcargo/jsp/createWayBill/includes/InvoiceQuantityField.html", function() {
			loadInvoiceQtyFeild.resolve();
		});
	} else
		$( "#invoiceQtyFeildPanel" ).remove();	
		
	if (configuration.showShortCreditOutstandingAmount == "true") {
		$("#shortCreditPopupPanel").load("/ivcargo/jsp/createWayBill/includes/shortCreditOutstandingAmountPopup.html", function() {
			shortCreditPopup.resolve();
		});
	} else
		$("#shortCreditPopupPanel").remove();
	
	if (configuration.showApprovalType == 'true') {
		$("#approvalTypeFeildpanel").load( "/ivcargo/jsp/createWayBill/includes/ApprovalTypeFeild.html", function() {
			loadApprovalTypeFeild.resolve();
			createApprovalTypeOption();
		});
	} else
		$( "#approvalTypeFeildpanel" ).remove();
		
	if (configuration.showSealNumber == 'true') {
		$("#sealNumberPanel").load("/ivcargo/jsp/createWayBill/includes/SealNumber.html", function() {
			loadSealNumberFeild.resolve();
		});
	} else
		$("#sealNumberPanel").remove();

	if (configuration.showVehiclePoNumber == 'true') {
		$("#vehiclePONumberPanel").load("/ivcargo/jsp/createWayBill/includes/VehiclePONumber.html", function() {
			loadVehiclePoNumberFeild.resolve();
		});
	} else
		$("#vehiclePONumberPanel").remove();
		
	if(configuration.showForwardType == 'true') {
		$("#forwardTypeFeildpanel").load( "/ivcargo/jsp/createWayBill/includes/ForwardTypeFeild.html", function() {
			loadForwardTypeFeild.resolve();
			createForwardTypeOption();
		});
	} else
		$("#forwardTypeFeildpanel" ).remove();
				
	if(configuration.showHsnCodeSelection == 'true') {
		$("#hsnCodeFeildpanel").load( "/ivcargo/jsp/createWayBill/includes/HsnCodeFeild.html", function() {
			loadHsnCodeFeild.resolve();
			createOptionForHsnCode();
		});
	} else
		$("#hsnCodeFeildpanel" ).remove();
			
	if(configuration.showInsurancePolicyNumber == 'true') {
		$("#insuarancePolicyNoPanel").load( "/ivcargo/jsp/createWayBill/includes/InsurancePolicyNumber.html", function() {
			loadInsurancePolicyNoFeild.resolve();
		});
	} else
		$("#insuarancePolicyNoPanel" ).remove();
					
	if(configuration.showDataLoggerNumber == 'true') {
		$("#dataLoggerNoPanel").load( "/ivcargo/jsp/createWayBill/includes/DataLoggerNumber.html", function() {
			loadDataLoggerNoFeild.resolve();
		});
	} else
		$("#dataLoggerNoPanel" ).remove();
		
	if(configuration.showTemperatureSelection == 'true') {
		$("#temperatureFeildPanel").load( "/ivcargo/jsp/createWayBill/includes/TemperatureFeild.html", function() {
			loadTemperatureFeild.resolve();
			createOptionForTemperature();
		});
	} else
		$("#temperatureFeildPanel" ).remove();
				
	if(configuration.showDeclarationSelection == 'true') {
		$("#declarationFeildPanel").load( "/ivcargo/jsp/createWayBill/includes/Declaration.html", function() {
			loadDeclarationFeild.resolve();
			createOptionForDeclaration();
		});
	} else
		$("#declarationFeildPanel" ).remove();
						
	if(configuration.showConnectivityFeild == 'true') {
		$("#connectivityFeildPanel").load( "/ivcargo/jsp/createWayBill/includes/ConnectivityFeild.html", function() {
			loadConnectivityFeild.resolve();
			createOptionForConnectivityFeild();
		});
	} else
		$("#connectivityFeildPanel" ).remove();
		
	if (configuration.showBookingPrintDate == 'true') {
		$("#printDatePanel").load( "/ivcargo/jsp/createWayBill/includes/BookingPrintDate.html", function() {
			loadBookingPrintDate.resolve();
		});
	}
	
	if(configuration.showDivisionSelection == 'true' && jsondata.divisionList) {
		$("#divisionPanel").load("/ivcargo/jsp/createWayBill/includes/WayBillDivision.html", function() {
			loadDivisionSelection.resolve();
			createOptionForDivisionField(jsondata.divisionList);
		});
	} else
		$("#divisionPanel").remove();
		
	if(configuration.sendBookingTimeOTP == 'true') {
		$("#bookingTimeOtpPanel").load( "/ivcargo/jsp/createWayBill/includes/BookingTimeOTP.html", function() {
			loadBookingTimeOtpFeild.resolve();
		});
	} else
		$("#bookingTimeOtpPanel" ).remove();
}