package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.GenerateCashReceiptBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.crprint.CRPrintPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomGroupMapperDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.DiscountDetailsDAO;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.WayBillTaxTxnDao;
import com.platform.dao.shortexcess.ShortReceiveDao;
import com.platform.dao.tdstxn.TDSTxnDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.ConstantsValue;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DiscountDetails;
import com.platform.dto.GodownUnloadDetails;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.ReceivedSummary;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.WayBillDeliveryCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.report.CustomGroupConfigurationDTO;
import com.platform.dto.constant.CustomerDetailsConstant;
import com.platform.dto.constant.DeliveryChargeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.TaxPaidByConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.shortexcess.ShortReceive;
import com.platform.dto.shortexcess.ShortReceiveArticles;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;
import com.platform.jsonconstant.JsonConstant;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class GenerateCRPrintActionForMultipleLR implements Action {
	public static final String TRACE_ID = "GenerateCRPrintActionForMultipleLR";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			                error 			                = null;
		GodownUnloadDetails[]				                gdUnldDtlsArr 	                = null;
		ValueObject							                dcdValObject	                = null;
		String								                wayBillIds		                = null;
		DeliveryContactDetails[]			                dcdArray		                = null;
		WayBill[]				 			                wayBillArray	                = null;
		HashMap<Long , CustomerDetails> 	                consignorHM		                = null;
		HashMap<Long , CustomerDetails> 	                consigneeHM		                = null;
		HashMap<Long, ConsignmentSummary>                   consignmentSummaryHM            = null;
		HashMap<Long, ArrayList<ConsignmentDetails>>        consignmentDetailsHM            = null;
		HashMap<Long,WayBillDeliveryCharges>				chrageMasterIdWiseHM 			= null;
		HashMap<Long,HashMap<Long,WayBillDeliveryCharges>>	wbIdWiseDlyChgsHM 				= null;
		HashMap<String,WayBillBookingCharges>				wbIdWiseBookChgsHM 				= null;
		HashMap<String, WayBillDeliveryCharges>				dlyChgsHM 						= null;
		WayBillDeliveryCharges								wayBillDeliveryCharges			= null;
		ArrayList<ConsignmentDetails>						consignmentDetails				= null;
		HashMap<Long,Double>								chargeIdWiseAmount	 			= null;
		ValueObject											print							= null;
		Branch												branch							= null;
		ChargeTypeModel[]									finalBookingCharges				= null;
		ChargeTypeModel[]									finalDeliveryCharges            = null;
		ValueObject											valueObject						= null;
		ReceivedSummary										receivedSummary					= null;
		ReportView											reportView						= null;
		ReportViewModel										reportViewModel					= null;
		ValueObject											jsonValueCollection				= null;
		TDSTxnDetails										tdsTxnDetails					= null;
		var												daysDiff						= 0L;
		Entry<Long, CustomerDetails> 						entry							= null;
		Entry<Long, ConsignmentSummary> 					entryConSum						= null;
		var												crId 		  					= 0L;
		var      										totalBookingTotal 				= 0.00;
		var      										totalGrandTotal   				= 0.00;
		Branch 												srcBranch 						= null;
		Branch 												destBranch 						= null;
		WayBillTaxTxn[]      								wayBillTaxTxn      				= null;
		var      										totalDeliveryTotal 				= 0.00;
		var      										totalDeliveryChargeSum			= 0.00;
		var      										totalDeliveryTimeTax			= 0.00;
		Branch												deliveryBranch					= null;
		ShortReceive										shortReceive					= null;
		ArrayList<ShortReceiveArticles>						shortReceiveArticlesArr			= null;
		ValueObject											configuration					= null;
		CustomGroupMapper									customGroupMapper				= null;
		HashMap<?, ?>										execFldPermissions				= null;
		var												showAutoCharge					= false;
		ValueObject											crPrintConfiguration			= null;
		final String												autoChargeNameString			= null;
		GenerateCashReceiptBLL								generateCashReceiptBLL			= null;
		ArrayList<DiscountDetails>							discountDetailsAL				= null;
		DiscountDetails								   		discountDetails					= null;
		var												sourceBranchCompanyNameInCRPrint = false;
		var      										toPayBookingTotal 				= 0.00;
		var      										totalDiscount					= 0.00;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			crId 	 = JSPUtility.GetLong(request, "crId", 0);

			final var  cache     = new CacheManip(request);
			final var 	executive = cache.getExecutive(request);
			execFldPermissions		= cache.getExecutiveFieldPermission(request);
			configuration				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.CUSTOM_GROUP_CONFIG);
			crPrintConfiguration        = cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());

			final var crprintConfigHM			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CR_PRINT);

			final var	isShowAutoCharge		= (boolean) crprintConfigHM.getOrDefault(CRPrintPropertiesConstant.SHOW_AUTO_CHARGE, false);
			final var	branchWiseCrprint			= crPrintConfiguration.getString(CRPrintPropertiesConstant.BRANCH_CODE_LIST_FOR_NEW_CR_WS_PRINT_FLOW, null);

			final var	branchIdsForCrPrint			= Utility.GetLongArrayListFromString(branchWiseCrprint, ",");
			final var branchIdFoundForCrPrint		= branchIdsForCrPrint.contains(executive.getBranchId()); //Print For CR

			if(execFldPermissions.get(FeildPermissionsConstant.SHOW_AUTO_CHARGE_IN_CR_PRINT) != null && isShowAutoCharge)
				showAutoCharge = true;

			finalBookingCharges	= cache.getActiveBookingCharges(request, executive.getBranchId());
			finalDeliveryCharges= cache.getActiveDeliveryCharges(request, executive.getBranchId());
			request.setAttribute("BookingCharges", finalBookingCharges);
			request.setAttribute("DeliveryCharges", finalDeliveryCharges);
			request.setAttribute("crId", crId);

			dcdValObject   			= DeliveryContactDetailsDao.getInstance().getDeliveryDetailsByCRd(crId);

			if(dcdValObject == null) {
				ActionStaticUtil.catchActionException(request, error, "CR Details not found for print !");
				return;
			}

			dcdArray				= (DeliveryContactDetails[])dcdValObject.get("deliveryContactDetailsArray");
			wayBillIds				= dcdValObject.getString("wayBillIds",null);
			wayBillArray			= WayBillDao.getInstance().getWayBillsByIds(wayBillIds);
			deliveryBranch			= cache.getBranchById(request, executive.getAccountGroupId(), wayBillArray[0].getDeliveryBranchId());
			wayBillTaxTxn			= WayBillTaxTxnDao.getInstance().getWayBillTaxTxn(0, wayBillArray[0].getWayBillId());
			consignorHM				= CustomerDetailsDao.getInstance().getCusotmerDetailsByWayBillIdsAndType(wayBillIds, CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID);
			consigneeHM				= CustomerDetailsDao.getInstance().getCusotmerDetailsByWayBillIdsAndType(wayBillIds, CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID);
			consignmentSummaryHM 	= ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillIds);
			consignmentDetailsHM 	= ConsignmentDetailsDao.getInstance().getConsignmentDetailsByWayBillIds(wayBillIds);

			for(final Long key : consignmentDetailsHM.keySet())
				consignmentDetails = consignmentDetailsHM.get(key);

			shortReceive	  = new ShortReceive();
			shortReceive.setAccountGroupId(executive.getAccountGroupId());
			shortReceive.setWayBillId(wayBillArray[0].getWayBillId());
			shortReceive.setStatus(ConstantsValue.STATUS_UNSETTLED);

			shortReceiveArticlesArr		= ShortReceiveDao.getInstance().getShortReceiveArticleDetailsByWayBillId(shortReceive);
			receivedSummary	  			= ReceivedSummaryDao.getInstance().getReceivedSummary(wayBillArray[0].getWayBillId());
			wbIdWiseDlyChgsHM 			= WayBillDeliveryChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIds);
			dlyChgsHM 					= WayBillDeliveryChargesDao.getInstance().getWayBillChargesMap(wayBillIds);
			wbIdWiseBookChgsHM			= WayBillBookingChargesDao.getInstance().getWayBillChargesMap(wayBillIds);
			destBranch 					= cache.getGenericBranchDetailCache(request,wayBillArray[0].getDestinationBranchId());

			discountDetails 	= new DiscountDetails();
			discountDetailsAL 	= new ArrayList<>();

			discountDetailsAL =  DiscountDetailsDAO.getInstance().getDiscountByWaybillId(wayBillArray[0].getWayBillId());

			if(discountDetailsAL != null && !discountDetailsAL.isEmpty())
				discountDetails.setAmount(discountDetailsAL.get(0).getAmount());

			LocationsMapping locationMap = null;

			if(destBranch != null){
				destBranch.setSubRegionName(cache.getGenericSubRegionById(request, destBranch.getSubRegionId()).getName());
				locationMap = cache.getLocationMapping(request, executive.getAccountGroupId(), destBranch.getBranchId());

				if(destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
					destBranch.setHandlingBranchName(cache.getGenericBranchDetailCache(request, locationMap.getLocationId()).getName());
			}

			srcBranch = cache.getGenericBranchDetailCache(request, wayBillArray[0].getSourceBranchId());

			if(srcBranch != null)
				srcBranch.setSubRegionName(cache.getGenericSubRegionById(request, srcBranch.getSubRegionId()).getName());

			if(wayBillArray[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
				generateCashReceiptBLL	= new GenerateCashReceiptBLL();

				gdUnldDtlsArr = generateCashReceiptBLL.getGoDownDetails(dcdArray[0].getWayBillId());

				if(gdUnldDtlsArr != null){
					request.setAttribute("lastGoDownUnload", gdUnldDtlsArr[0]);

					if(gdUnldDtlsArr != null)
						daysDiff	= Utility.getDayDiffBetweenTwoDates(wayBillArray[0].getBookingDateTime(), gdUnldDtlsArr[0].getCreationDateTime());
				}
			}

			for (final WayBill element : wayBillArray) {
				element.setSourceSubRegionId(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getSubRegionId());
				element.setPhoneNumber(cache.getGenericBranchDetailCache(request, element.getBranchId()).getPhoneNumber());
				element.setBranchAddress(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getAddress());
				element.setDestinationSubRegionId(cache.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getSubRegionId());
				element.setSourceSubRegion(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
				element.setDestinationSubRegion(cache.getGenericSubRegionById(request,element.getDestinationSubRegionId()).getName());
				element.setSourceBranch(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
				element.setSourceBranchCode(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getBranchCode());
				element.setDestinationBranch(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
				element.setDestinationBranchCode(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getBranchCode());
				element.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));
				element.setDeliveryTimeTBB(element.isDeliveryTimeTBB());

				totalBookingTotal 	+= element.getBookingTotal();
				totalDeliveryTotal 	+= element.getDeliveryTotal();
				totalGrandTotal	  	+= element.getGrandTotal();
				totalDeliveryChargeSum += element.getDeliveryChargesSum();
				totalDeliveryTimeTax   += element.getDeliveryTimeServiceTax();

				if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					toPayBookingTotal 	+= element.getBookingTotal();

				totalDiscount   += element.getDeliveryDiscount();
			}

			chargeIdWiseAmount = new HashMap<>();

			if(wbIdWiseDlyChgsHM != null && wbIdWiseDlyChgsHM.size() > 0)
				for(final Long key : wbIdWiseDlyChgsHM.keySet()){
					chrageMasterIdWiseHM = wbIdWiseDlyChgsHM.get(key);

					for(final Long key1 : chrageMasterIdWiseHM.keySet()){
						wayBillDeliveryCharges = chrageMasterIdWiseHM.get(key1);
						if(chargeIdWiseAmount.get(wayBillDeliveryCharges.getWayBillChargeMasterId()) == null)
							chargeIdWiseAmount.put(wayBillDeliveryCharges.getWayBillChargeMasterId(), wayBillDeliveryCharges.getChargeAmount());
						else
							chargeIdWiseAmount.put(wayBillDeliveryCharges.getWayBillChargeMasterId(), wayBillDeliveryCharges.getChargeAmount() + chargeIdWiseAmount.get(wayBillDeliveryCharges.getWayBillChargeMasterId()));
					}
				}

			for (final DeliveryContactDetails element : dcdArray) {
				element.setPaymentTypeName(PaymentTypeConstant.getPaymentType(element.getPaymentType()));
				element.setDeliveryDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getDeliveryDateTime()));
			}

			request.setAttribute("totalGrandTotal", totalGrandTotal);
			request.setAttribute("totalBookingTotal", totalBookingTotal);
			request.setAttribute("totalDeliveryTotal", totalDeliveryTotal);
			request.setAttribute("wayBillArray", wayBillArray);
			request.setAttribute("dcdArray", dcdArray);
			request.setAttribute("crId", dcdArray[0].getCrId());
			request.setAttribute("crNumber", dcdArray[0].getWayBillDeliveryNumber());
			request.setAttribute("consignorHM", consignorHM);
			request.setAttribute("consigneeHM", consigneeHM);
			request.setAttribute("consignmentSummaryHM", consignmentSummaryHM);
			request.setAttribute("wbIdWiseDlyChgsHM", wbIdWiseDlyChgsHM);
			request.setAttribute("chargeIdWiseAmount", chargeIdWiseAmount);
			request.setAttribute("executive", executive);
			request.setAttribute("isRePrint", JSPUtility.GetBoolean(request, "isRePrint",true));
			request.setAttribute("receivedSummary",receivedSummary);
			request.setAttribute("deliveryBranch",deliveryBranch);
			request.setAttribute("showAutoCharge",showAutoCharge);
			request.setAttribute("autoChargeNameString", "AUTO CHARGE");
			request.setAttribute("toPayBookingTotal",toPayBookingTotal);

			branch = cache.getGenericBranchDetailCache(request, executive.getBranchId());
			request.setAttribute("LoggedInBranchDetails", branch);

			print		= new ValueObject();

			print.put("isRePrint", JSPUtility.GetBoolean(request, "isRePrint",true));
			print.put("totalGrandTotal", totalGrandTotal);
			print.put("totalBookingTotal", totalBookingTotal);
			print.put("totalDeliveryTotal", totalDeliveryTotal);
			print.put("totalDeliveryChargeSum", totalDeliveryChargeSum);
			print.put("totalDeliveryTimeTax", totalDeliveryTimeTax);
			print.put("wayBillArray", Converter.arrayDtotoArrayListWithHashMapConversion(wayBillArray));
			print.put("dcdArray", Converter.arrayDtotoArrayListWithHashMapConversion(dcdArray));
			print.put("consignorHM", Converter.hashMapWithDtoToHashMapConversion(consignorHM));
			print.put("consigneeHM", Converter.hashMapWithDtoToHashMapConversion(consigneeHM));
			print.put("consignmentSummaryHM", Converter.hashMapWithDtoToHashMapConversion(consignmentSummaryHM));
			print.put("toPayBookingTotal", toPayBookingTotal);
			print.put("totalDiscount", totalDiscount);
			print.put("branchIdFoundForCrPrint", branchIdFoundForCrPrint);

			if(wbIdWiseDlyChgsHM != null && wbIdWiseDlyChgsHM.size() > 0)
				print.put("wbIdWiseDlyChgsHM", Converter.hashMapWithDtoToHashMapConversion(wbIdWiseDlyChgsHM));

			print.put("chargeIdWiseAmount", new JSONObject(chargeIdWiseAmount));
			print.put("executive", Converter.DtoToHashMap(executive));
			print.put("LoggedInBranchDetails",Converter.DtoToHashMap(branch));
			print.put("BookingCharges", Converter.arrayDtotoArrayListWithHashMapConversion(finalBookingCharges));
			print.put("DeliveryCharges", Converter.arrayDtotoArrayListWithHashMapConversion(finalDeliveryCharges));
			print.put("dlyChgsHM", Converter.hashMapWithDtoToHashMapConversion(dlyChgsHM));
			print.put("wbIdWiseBookChgsHM", Converter.hashMapWithDtoToHashMapConversion(wbIdWiseBookChgsHM));
			print.put("consignmentDetailsHM",Converter.dtoArrayListtoArrayListWithHashMapConversion(consignmentDetails));
			print.put("shortReceiveArticlesArr",Converter.dtoArrayListtoArrayListWithHashMapConversion(shortReceiveArticlesArr));

			if(receivedSummary != null)
				print.put("receivedSummary",Converter.DtoToHashMap(receivedSummary));

			print.put("showAutoCharge",showAutoCharge);
			print.put("autoChargeNameString",autoChargeNameString);

			if(gdUnldDtlsArr != null)
				print.put("lastGoDownUnload", Converter.DtoToHashMap(gdUnldDtlsArr[0]));

			if(deliveryBranch != null)
				print.put("deliveryBranch", Converter.DtoToHashMap(deliveryBranch));

			sourceBranchCompanyNameInCRPrint = configuration.getBoolean(CustomGroupConfigurationDTO.SOURCE_BRANCH_COMPANY_NAME_IN_CR_PRINT);
			if (configuration.getBoolean(LHPVCompanyDetails.CUSTOM_GROUP_ADDESS_ALLOWED)) {

				customGroupMapper	= new CustomGroupMapper();
				if(sourceBranchCompanyNameInCRPrint) {
					customGroupMapper.setBranchId(srcBranch.getBranchId());
					customGroupMapper.setIdentifier((short) 1);
				} else {
					customGroupMapper.setBranchId(deliveryBranch.getBranchId());
					customGroupMapper.setIdentifier((short) 2);
				}
				customGroupMapper	= CustomGroupMapperDao.getInstance().getCustomGroupByIdentifierAndBranch(customGroupMapper);

				if (customGroupMapper == null || customGroupMapper.getAccountGroupPrintConstant() == 0)
					print.put("CustomGroup", "--");
				else
					print.put("CustomGroup", customGroupMapper.getCompanyName());
			}

			reportView			= new ReportView();
			reportViewModel		= new ReportViewModel();
			request.setAttribute("customAddressBranchId", deliveryBranch != null ? deliveryBranch.getBranchId(): 0);
			request.setAttribute("customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_DELIVERY);
			reportViewModel		= reportView.populateReportViewModel(request, reportViewModel);

			request.setAttribute("reportViewModel", reportViewModel);
			print.put("reportViewModel", Converter.DtoToHashMap(reportViewModel));
			print.put("currentTime", DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.HH_MM_AA));
			print.put("currentDateTime", DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.DD_MM_YYYY_HH_MM_AA));

			JsonConstant.getInstance().setOutputConstant(print);

			valueObject		= new ValueObject();
			valueObject.put("printJson", print);

			final var object = JsonUtility.convertionToJsonObjectForResponse(valueObject);

			request.setAttribute("printJsonObject", object);

			if(dcdArray != null && dcdArray[0].getDeliveryContactDetailsId() > 0)
				tdsTxnDetails	= TDSTxnDetailsDAO.getInstance().getTDSTxnDetails(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_DELIVERY_CONTACT_DETAILS, dcdArray[0].getDeliveryContactDetailsId());

			jsonValueCollection		= new ValueObject();
			jsonValueCollection.put("wayBillTaxTxn", Converter.arrayDtotoArrayListWithHashMapConversion(wayBillTaxTxn));
			entry	=	consigneeHM.entrySet().iterator().next();
			jsonValueCollection.put("consignee", Converter.DtoToHashMap(entry.getValue()));
			entry	=	consignorHM.entrySet().iterator().next();
			jsonValueCollection.put("consignor", Converter.DtoToHashMap(entry.getValue()));
			jsonValueCollection.put("deliveryContactDetails", Converter.DtoToHashMap(dcdArray[0]));
			jsonValueCollection.put("srcBranch", Converter.DtoToHashMap(srcBranch));

			if(deliveryBranch != null)
				jsonValueCollection.put("branch", Converter.DtoToHashMap(deliveryBranch));

			entryConSum	=	consignmentSummaryHM.entrySet().iterator().next();
			jsonValueCollection.put("consignmentSummary", Converter.DtoToHashMap(entryConSum.getValue()));
			jsonValueCollection.put("wayBill", Converter.DtoToHashMap(wayBillArray[0]));

			if(gdUnldDtlsArr != null)
				jsonValueCollection.put("lastGoDownUnload", Converter.DtoToHashMap(gdUnldDtlsArr[0]));

			jsonValueCollection.put("destBranch", Converter.DtoToHashMap(destBranch));
			jsonValueCollection.put("noOfPackages", "" + wayBillArray[0].getNoOfPkgs());
			jsonValueCollection.put("wayBillChargesCol", Converter.hashMapWithDataTypeToHashMapConversion(chargeIdWiseAmount));
			jsonValueCollection.put("BookingDateTime", wayBillArray[0].getActualBookingDateTime());
			jsonValueCollection.put("DaysDiff", daysDiff);
			jsonValueCollection.put("TransportCommonMaster", Converter.DtoToHashMap(new TransportCommonMaster()));
			jsonValueCollection.put("ChargeTypeMaster", Converter.DtoToHashMap(new ChargeTypeMaster()));
			jsonValueCollection.put("WayBillTaxObject", Converter.DtoToHashMap(new WayBillTaxTxn()));

			jsonValueCollection.put("discountDetails", discountDetails);
			jsonValueCollection.put("WayBillTypeConstant", WayBillTypeConstant.getWayBillTypeConstant());
			jsonValueCollection.put("TaxPaidByConstant", TaxPaidByConstant.getTaxPaidByConstant());
			jsonValueCollection.put("PaymentTypeConstant", PaymentTypeConstant.getPaymentTypeConstants());
			jsonValueCollection.put("DeliveryChargeConstant", DeliveryChargeConstant.getDeliveryChargeConstant());

			if(tdsTxnDetails != null)
				jsonValueCollection.put("tdsTxnDetails", Converter.DtoToHashMap(tdsTxnDetails));

			final var	outJsonObject	= getCashReceiptPrint(jsonValueCollection);
			request.setAttribute("CRPrintData", outJsonObject);

			request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 			= null;
			gdUnldDtlsArr 	= null;
			dcdValObject	= null;
			dcdArray		= null;
			wayBillIds		= null;
			wayBillArray	= null;
			consignorHM		= null;
			consigneeHM		= null;
			consignmentSummaryHM = null;
		}
	}

	private JSONObject	getCashReceiptPrint(final ValueObject valueInObject) throws Exception {
		ValueObject		outValueObject	= null;
		try {
			outValueObject	= new ValueObject();
			outValueObject.put("CRPrint", valueInObject);
			return JsonUtility.convertionToJsonObjectForResponse(outValueObject);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			outValueObject	= null;
		}
	}
}