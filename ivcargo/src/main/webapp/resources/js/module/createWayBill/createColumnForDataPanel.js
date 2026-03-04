/**
 * @Author	Anant Chaudhary	04-01-2015
 */

/*
 * create panels for formas private marks etc. according to configuration for line adjustment.
 * 5 panel for each line
 */

function createColumnForDataPanel(configuration) {
	var totalcol				= 1;

	var rowid1	= document.getElementById('datapanels1');
	var rowid2	= document.getElementById('datapanels2');
	var rowid3	= document.getElementById('datapanels3');
	var rowid4	= document.getElementById('datapanels4');
	var rowid5	= document.getElementById('datapanels5');
	
	if (configuration.PrivateMarkBeforeFormType == 'true')
		createColumn(rowid4, 'privatemarkpanel','20%','','','');
	
	if(jsondata.allowBranchWiseInsuranceService) {
		if (configuration.InvoiceNo == 'true' || configuration.invoiceNumberBeforeFormType == 'true')
			createColumn(rowid4, 'invoicenopanel','10%','','','');
		
		if (configuration.showInvoiceDate == 'true')
			createColumn(rowid4, 'invoiceDatePanel','20%','','','');
		
		if (configuration.DeclaredValue == 'true' || configuration.DeclaredValueBeforeFormType == 'true')
			createColumn(rowid4, 'declaredvaluepanel','20%','','','');
		
		createColumn(rowid4, 'subCommodityTypePanel','20%','','','');
		
		if (jsondata.allowToAddMultipleInvoiceDetail)
			createColumn(rowid4, 'invoiceDetailsPanel','65%','','','');	
		
		if (configuration.FormsWithSingleSlection == 'true')
			createColumn(rowid5,'singleFormTypePanel','65%','','','3');
				
		if (configuration.showCCAttechedCheckBox == 'true')
			createColumn(rowid5,'ccAttechedFormPanel','65%','','','3');
				
		if (configuration.ShowEwaybillExemptedOption == 'true')
			createColumn(rowid5,'eWayBillExemptedPanel','70%','','','3');
	} else {
		if (configuration.invoiceNumberBeforeFormType == 'true' && configuration.InvoiceNo == 'true' && !jsondata.allowToAddMultipleInvoiceDetail)
			createColumn(rowid4, 'invoicenopanel','10%','','','');
			
		if (configuration.DeclaredValueBeforeFormType == 'true' && !jsondata.allowToAddMultipleInvoiceDetail)
			createColumn(rowid4, 'declaredvaluepanel','20%','','','');
		
		if (jsondata.allowToAddMultipleInvoiceDetail)
			createColumn(rowid4,'invoiceDetailsPanel','65%','','','2');	

		if (configuration.FormsWithSingleSlection == 'true')
			createColumn(rowid4,'singleFormTypePanel','65%','','','3');
		
		if (configuration.showCCAttechedCheckBox == 'true')
			createColumn(rowid4,'ccAttechedFormPanel','65%','','','3');
		
		if (configuration.ShowEwaybillExemptedOption == 'true')
			createColumn(rowid4,'eWayBillExemptedPanel','70%','','','3');
	}
		
	if (configuration.purchaseOrderNumber == 'true')
		createColumn(rowid5,'purchaseOrderNumberpanel','25%','','','');
	
	if (configuration.purchaseOrderDate == 'true')
		createColumn(rowid5,'purchaseOrderDatepanel','25%','','','');
		
	if (configuration.RoadPermitNumber == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'roadPermitNumberpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'roadPermitNumberpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'roadPermitNumberpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'roadPermitNumberpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.ExciseInvoice == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'exciseInvociepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'exciseInvociepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'exciseInvociepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'exciseInvociepanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.ConsignmentInsured == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'consignmentInsuredpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'consignmentInsuredpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'consignmentInsuredpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'consignmentInsuredpanel','20%','','','');
			totalcol++;
		}
	}

	if(configuration.showConnectivityFeild == 'true')
		createColumn(rowid5,'connectivityFeildPanel','20%','','','');
		
	if(configuration.showInsurancePolicyNumber == 'true')
		createColumn(rowid5,'insuarancePolicyNoPanel','20%','','','');
		
	if(configuration.showDataLoggerNumber == 'true')
		createColumn(rowid5,'dataLoggerNoPanel','20%','','','');
	
	if(configuration.showTemperatureSelection == 'true')
		createColumn(rowid5,'temperatureFeildPanel','20%','','','');
		
	if(configuration.showDeclarationSelection == 'true')
		createColumn(rowid5,'declarationFeildPanel','20%','','','');
		
	if (configuration.STPaidBy == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'stpaidbypanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'stpaidbypanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'stpaidbypanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'stpaidbypanel','20%','','','');
			totalcol++;
		}
	}
	
	if ((configuration.showBranchServiceType == 'true' || configuration.showBranchServiceType == true)
	&& (configuration.showBranchServiceTypeAfterBookingType == 'false' || configuration.showBranchServiceTypeAfterBookingType == false)) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'showBranchServiceTypepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'showBranchServiceTypepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'showBranchServiceTypepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'showBranchServiceTypepanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.showGstType == 'true' || configuration.showGstType == true) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'gstTypeFeildPanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'gstTypeFeildPanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'gstTypeFeildPanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'gstTypeFeildPanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.InvoiceNo == 'true' && configuration.invoiceNumberBeforeFormType == 'false' && !jsondata.allowBranchWiseInsuranceService) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'invoicenopanel','25%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'invoicenopanel','25%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'invoicenopanel','25%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'invoicenopanel','25%','','','');
			totalcol++;
		}
	}
	
	if (configuration.showInvoiceDate == 'true' && !jsondata.allowBranchWiseInsuranceService) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'invoiceDatePanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'invoiceDatePanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'invoiceDatePanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'invoiceDatePanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.cargoType == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'cargoTypePanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'cargoTypePanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'cargoTypePanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'cargoTypePanel','20%','','','');
			totalcol++;
		}
	}

	if (configuration.DeclaredValue == 'true' && configuration.DeclaredValueBeforeFormType == 'false' && !jsondata.allowBranchWiseInsuranceService) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'declaredvaluepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'declaredvaluepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'declaredvaluepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'declaredvaluepanel','20%','','','');
			totalcol++;
		}
	}

	if (configuration.PercentageRiskCover == 'true' || configuration.showCheckboxAndInputToCalInsuranceOnDeclareValue == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'percentageriskcoverpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'percentageriskcoverpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'percentageriskcoverpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'percentageriskcoverpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.DeliveryAt == 'true' && (configuration.deliveryAtAfterBookingType == 'false' || configuration.deliveryAtAfterBookingType == false)) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'deliverytopanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'deliverytopanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'deliverytopanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'deliverytopanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.showInsurance == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'insurancepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'insurancepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'insurancepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'insurancepanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.allowedCashOnDelivery  == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'codpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'codpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'codpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'codpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.multipleRemarkField == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'multipleRemark','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'multipleRemark','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'multipleRemark','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'multipleRemark','20%','','','');
			totalcol++;
		}
	}
	
	
	if (configuration.showPrivateMarkBeforeRemark == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'privatemarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'privatemarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'privatemarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'privatemarkpanel','20%','','','');
			totalcol++;
		}
	}
	if (configuration.Remark == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'remarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'remarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'remarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'remarkpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.taxCalculationBasedOnGSTSelection == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'gstPerSelectionPanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'gstPerSelectionPanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'gstPerSelectionPanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'gstPerSelectionPanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.additionalRemark == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'additionalremarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'additionalremarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'additionalremarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'additionalremarkpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.showBookedBy == 'true' || configuration.showBookedBy == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'bookedBypanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'bookedBypanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'bookedBypanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'bookedBypanel','20%','','','');
			totalcol++;
		}
	}

	if ((configuration.PrivateMark == 'true' || configuration.showPrivateMarkAsTripId == 'true') &&  configuration.showPrivateMarkBeforeRemark =='false'){
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'privatemarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'privatemarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'privatemarkpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'privatemarkpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.rfqNumber == 'true' && configuration.showRFQNumberAfterPONumberField == 'false') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1, 'rfqNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2, 'rfqNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3, 'rfqNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5, 'rfqNumberpanel', '20%', '', '', '');
			totalcol++;
		}
	}
	
	if (configuration.shipmentNumber == 'true' ) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1, 'shipmentNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2, 'shipmentNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3, 'shipmentNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5, 'shipmentNumberpanel', '20%', '', '', '');
			totalcol++;
		}
	}
	if (configuration.billOfEntriesNumber == 'true' ) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1, 'billOfEntriesNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2, 'billOfEntriesNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3, 'billOfEntriesNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5, 'billOfEntriesNumberpanel', '20%', '', '', '');
			totalcol++;
		}
	}
	
	if (configuration.isRiskAllocationAllow == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'riskallocationpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'riskallocationpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'riskallocationpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'riskallocationpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.PanNumber == 'true' || tdsConfiguration.IsPANNumberRequired) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1, 'PanNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2, 'PanNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3, 'PanNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'PanNumberpanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.TanNumber == 'true' || tdsConfiguration.IsTANNumberRequired) {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1, 'TanNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2, 'TanNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3, 'TanNumberpanel', '20%', '', '', '');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'TanNumberpanel','20%','','','');
			totalcol++;
		}
	}

	if (configuration.Form403402 == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'form403402panel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'form403402panel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'form403402panel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'form403402panel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.CTForm == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'CTFormpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'CTFormpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'CTFormpanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'CTFormpanel','20%','','','');
			totalcol++;
		}
	}

	if (configuration.CommodityType == 'true') {
		if (totalcol >= 1 && totalcol <= 5) {
			createColumn(rowid1,'commoditytypepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 6 && totalcol <= 10) {
			createColumn(rowid2,'commoditytypepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 11 && totalcol <= 15) {
			createColumn(rowid3,'commoditytypepanel','20%','','','');
			totalcol++;
		} else if (totalcol >= 16 && totalcol <= 20) {
			createColumn(rowid5,'commoditytypepanel','20%','','','');
			totalcol++;
		}
	}
	
	if (configuration.showRFQNumberAfterPONumberField == 'true')
		createColumn(rowid5, 'rfqNumberpanel', '20%', '', '', '');

	if (configuration.showVehiclePoNumber == 'true')
		createColumn(rowid5, 'vehiclePONumberPanel', '20%', '', '', '');

	if (configuration.showSealNumber == 'true')
		createColumn(rowid5, 'sealNumberPanel', '20%', '', '', '');

	var nerastfive = Math.ceil((totalcol-1) / 5) * 5;

	for (var i = totalcol; i <= nerastfive; i++) {
		if (i >= 1 && i <= 5)
			createColumn(rowid1,'empty','20%','','','');
		else if (i >= 6 && i <= 10)
			createColumn(rowid2,'empty','20%','','','');
		else if (i >= 11 && i <= 15)
			createColumn(rowid3,'empty','20%','','','');
		else if (i >= 16 && i <= 20)
			createColumn(rowid5,'empty','20%','','','');
	}
	
	return true;
}