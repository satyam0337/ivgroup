package com.ivcargo.actions;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ShortCreditCollectionSheetBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.STBSPrintConfigurationConstant;
import com.iv.dao.impl.master.BankAccountDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.BankAccount;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.ShortCreditCollectionSheetLedgerDto;
import com.platform.dto.model.ShortCreditCollectionSheetPrintBillModel;
import com.platform.dto.model.WayBillDeatailsModel;

public class ShortCreditCollectionSheetPrintAction implements Action{

	public static final String TRACE_ID = ShortCreditCollectionSheetPrintAction.class.getName();

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 					error 							= null;
		ShortCreditCollectionSheetPrintBillModel[]	shortCreditBillModelArr			= null;
		List<ShortCreditCollectionSheetPrintBillModel>	shortCreditBillModelList	= null;
		ShortCreditCollectionSheetLedgerDto			shortCreditLedArr 				= null;
		HashMap<Long, WayBillDeatailsModel>			wayBillBookingDetailHm 			= null;
		HashMap<Long, ConsignmentSummary> 			consignmentSummaryHm  			= null;
		HashMap<Long, ArrayList<ConsignmentDetails>>consignmentDetailsHm 			= null;
		List<BankAccount>	bankAccountList					= null;
		var										billBranchId					= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);



			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 		= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			if(executive != null) {
				final var	cache        = new CacheManip(request);
				final var	valuinObject = new ValueObject();

				final var	stbsPrintConfig				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_PRINT);
				final var	stbsConfig					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
				final var	prinWithoutHeader			= (boolean) stbsPrintConfig.getOrDefault(STBSPrintConfigurationConstant.PRINT_WITHOUT_HEADER, false);
				final var	newMappingForSTBSPrint		= (boolean) stbsPrintConfig.getOrDefault(STBSPrintConfigurationConstant.NEW_MAPPING_FOR_STBS_PRINT, false);
				final var	partyWiseSTBSPrint			= (boolean) stbsPrintConfig.getOrDefault(STBSPrintConfigurationConstant.PARTY_WISE_STBS_PRINT, false);

				final var	billId 	= JSPUtility.GetLong(request, "billId" ,0);
				final var	partyId = JSPUtility.GetLong(request, "partyId" ,0);

				if(billId > 0) {
					valuinObject.put("billId", billId);
					valuinObject.put("executive", executive);
					valuinObject.put("branchesColl", cache.getGenericBranchesDetail(request));
					valuinObject.put("stbsPrintConfig", stbsPrintConfig);
					valuinObject.put("stbsConfig", stbsConfig);
					final var	valueOutObject = ShortCreditCollectionSheetBLL.getInstance().getSheetCreditDataForPrint(valuinObject);

					if(valueOutObject != null) {
						shortCreditBillModelArr = (ShortCreditCollectionSheetPrintBillModel[]) valueOutObject.get("shortCreditBillModelArr");
						shortCreditBillModelList = (List<ShortCreditCollectionSheetPrintBillModel>) valueOutObject.get("shortCreditBillModelList");
						shortCreditLedArr 		= (ShortCreditCollectionSheetLedgerDto) valueOutObject.get("shortCreditLedArr");
						wayBillBookingDetailHm  = (HashMap<Long, WayBillDeatailsModel>) valueOutObject.get("wayBillBookingDetailHm");
						consignmentSummaryHm    = (HashMap<Long, ConsignmentSummary>) valueOutObject.get("consSmry");
						consignmentDetailsHm    = (HashMap<Long, ArrayList<ConsignmentDetails>>) valueOutObject.get("consignmentDetailsHm");
						billBranchId			= shortCreditLedArr.getBillBranchId();
						request.setAttribute("stbsSumMod", valueOutObject.get("stbsSumMod"));
						request.setAttribute("deliveryChargesMap", valueOutObject.get("deliveryChargesMap"));
						request.setAttribute("regionWiseBankDetails", valueOutObject.get("regionWiseBankDetails"));
					}

					final var	branch    	 = cache.getBranchById(request, executive.getAccountGroupId(), billBranchId);
					final var	bankAccount		= new BankAccount();
					bankAccount.setAccountGroupId(executive.getAccountGroupId());
					bankAccountList			= BankAccountDaoImpl.getInstance().getAllBankDetailsForPrint(bankAccount);

					request.setAttribute("shortCreditBillModelArr", shortCreditBillModelArr);
					request.setAttribute("shortCreditBillModelList", shortCreditBillModelList);
					request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));
					request.setAttribute("prinWithoutHeader", prinWithoutHeader);
					request.setAttribute("branch", branch);
					request.setAttribute("wayBillBookingDetailHm", wayBillBookingDetailHm);
					request.setAttribute("consignmentSummaryHm", consignmentSummaryHm);
					request.setAttribute("consignmentDetailsHm", consignmentDetailsHm);
					request.setAttribute("allBankDetails", bankAccountList);


					final var paymentQrBasePath = "/images/QR/" + executive.getAccountGroupId() + "/" + billBranchId;
					final String[] possibleExtensions = {".jpeg", ".jpg", ".png"};
					String paymentQrPath = null;
					final var servletContext = request.getServletContext();

					for (final String extension : possibleExtensions) {
						final var currentPath = paymentQrBasePath + extension;
						final var realPath = servletContext.getRealPath(currentPath);

						if (realPath != null) {
							final var file = new File(realPath);
							if (file.exists()) {
								paymentQrPath = currentPath;
								break;
							}
						}
					}

					if (paymentQrPath != null)
						request.setAttribute("paymentQrPath", paymentQrPath);

				}



				ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", billBranchId);
				ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
				ActionStaticUtil.setReportViewModel(request);

				if(newMappingForSTBSPrint) {
					if(partyId > 0 && partyWiseSTBSPrint)
						request.setAttribute("nextPageToken", "success_partyWise_"+executive.getAccountGroupId());
					else
						request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
				} else
					request.setAttribute("nextPageToken", "success");

			} else
				request.setAttribute("nextPageToken", "needlogin");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}


}