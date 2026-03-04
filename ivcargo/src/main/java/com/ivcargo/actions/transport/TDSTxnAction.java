package com.ivcargo.actions.transport;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;

import com.framework.JSPUtility;
import com.iv.utils.exception.ExceptionProcess;
import com.platform.dto.LHPV;
import com.platform.dto.LorryHire;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;

public class TDSTxnAction {
	public static final String	TRACE_ID	= "TDSTxnAction";

	// Get TDSTxnDetails For LHPV
	public static TDSTxnDetails getTDSTxnDetailsDTOForLHPV(HttpServletRequest request, LHPV lhpv) throws Exception {
		try {
			final var tdsTxnDetails = new TDSTxnDetails();

			tdsTxnDetails.setOwnerName(JSPUtility.GetString(request, "ownerName", null));
			tdsTxnDetails.setContactPerson(JSPUtility.GetString(request, "contactPerson",null));
			tdsTxnDetails.setTdsAmount(JSPUtility.GetDouble(request, "tdsAmount",0.00));
			tdsTxnDetails.setTdsOnAmount(lhpv.getTotalAmount());
			tdsTxnDetails.setIdentifier(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_LHPV);
			tdsTxnDetails.setMarkForDelete(false);
			tdsTxnDetails.setBranchId(lhpv.getBranchId());
			tdsTxnDetails.setCreationDate(lhpv.getCreationDateTimeStamp());
			tdsTxnDetails.setPaymentMode((short) 0);
			tdsTxnDetails.setAccountGroupId(lhpv.getAccountGroupId());
			tdsTxnDetails.setDeclarationGiven(JSPUtility.GetShort(request, "declaration", (short) 0));
			tdsTxnDetails.setPanNumber(JSPUtility.GetString(request, "panNo", null));
			tdsTxnDetails.setTdsRate(JSPUtility.GetDouble(request, "TDSRate", 0.0));
			tdsTxnDetails.setCategory(JSPUtility.GetShort(request, "category", (short) 0));
			tdsTxnDetails.setPanNumber(StringUtils.upperCase(tdsTxnDetails.getPanNumber()));

			return tdsTxnDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// Get TDSTxnDetails For Lorry Hire
	public static TDSTxnDetails getTDSTxnDetailsDTOForLorryHire(HttpServletRequest request, LorryHire lorryHire) throws Exception {
		try {
			final var	tdsTxnDetails	= new TDSTxnDetails();

			tdsTxnDetails.setOwnerName(JSPUtility.GetString(request, "ownerName", null));
			tdsTxnDetails.setPanNumber(StringUtils.upperCase(JSPUtility.GetString(request, "panNo", null)));
			tdsTxnDetails.setDeclarationGiven(JSPUtility.GetShort(request, "declaration", (short) 0));
			tdsTxnDetails.setTdsRate(JSPUtility.GetDouble(request, "TDSRate", 0));
			tdsTxnDetails.setTdsAmount(JSPUtility.GetDouble(request, "lessTDS", 0));
			tdsTxnDetails.setCategory(JSPUtility.GetShort(request, "category", (short) 0));
			tdsTxnDetails.setTdsOnAmount(lorryHire.getTotalLorryHireAmount());
			tdsTxnDetails.setContactPerson(lorryHire.getLorrySupplierContactPerson());
			tdsTxnDetails.setIdentifier(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_LORRYHIRE);
			tdsTxnDetails.setId(lorryHire.getLorryHireId());
			tdsTxnDetails.setMarkForDelete(false);
			tdsTxnDetails.setBranchId(lorryHire.getBranchId());
			tdsTxnDetails.setCreationDate(lorryHire.getLorryHireDateTime());
			tdsTxnDetails.setPaymentMode((short)0);
			tdsTxnDetails.setAccountGroupId(lorryHire.getAccountGroupId());

			return tdsTxnDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}