package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.DiscountDetailsReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.DiscountDetailsReportConfigurationDTO;
import com.platform.dto.model.DiscountDetailsReport;
import com.platform.resource.CargoErrorList;

public class DiscountDetailsAction implements Action{
	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive						executive				= null;
		CacheManip 						cManip 					= null;
		String 							branchIds				= null;
		ValueObject 					valueInObj				= null;
		SimpleDateFormat				sdf						= null;
		Timestamp						fromDate				= null;
		Timestamp						toDate					= null;
		var								selectedDiscountType 	= 0;
		var 						showColumnDiscountConfigBy 	= false;
		var 						showColumnRemark 			= false;
		var							showColumnDemurrage			= false;
		short 							searchDateBy				= 4;
		var 						showBillDiscountDetails 	= false;
		var							showSTBSDiscountDetails		= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDiscountDetailsAction().execute(request, response);

			cManip 			= new CacheManip(request);
			executive		= cManip.getExecutive(request);
			sdf				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			valueInObj		= new ValueObject();

			final var	configuration = ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DISCOUNT_DETAILS_REPORT, executive.getAccountGroupId());

			if(request.getParameter("selectedDiscountType") != null)
				selectedDiscountType = Integer.parseInt(request.getParameter("selectedDiscountType"));
			else
				selectedDiscountType = 0;

			if(request.getParameter("dateType") != null)
				searchDateBy = Short.parseShort(request.getParameter("dateType"));

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation1(request, cManip, executive);

			showColumnDiscountConfigBy = configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_COLUMN_DISCOUNT_CONFIG_BY,false);
			showColumnRemark 		   = configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_COLUMN_REMARK,false);
			showColumnDemurrage		   = configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_COLUMN_DEMURRAGE,false);
			showBillDiscountDetails	   = configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_BILL_DISCOUNT_DETAILS,false);
			showSTBSDiscountDetails	   = configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_STBS_DISCOUNT_DETAILS,false);

			valueInObj.put("branchesColl", cManip.getGenericBranchesDetail(request));
			valueInObj.put("fromDate", fromDate);
			valueInObj.put("toDate", toDate);
			valueInObj.put("accountGroupId", executive.getAccountGroupId());
			valueInObj.put("branchIds", branchIds);
			valueInObj.put("selectedDiscountType", selectedDiscountType);
			valueInObj.put("searchDateBy", searchDateBy);
			valueInObj.put("showBillDiscountDetails", showBillDiscountDetails);
			valueInObj.put("showSTBSDiscountDetails", showSTBSDiscountDetails);

			final var	discountDetailsReportBLL 	= new DiscountDetailsReportBLL();
			final var	valueOutObj		 			= discountDetailsReportBLL.getDiscountDetails(valueInObj);
			final var	disDetailsReportHM			= (HashMap<Long, DiscountDetailsReport>) valueOutObj.get("disDetailsReportHM");
			final var	billWiseReportHM			= (HashMap<Long, DiscountDetailsReport>) valueOutObj.get("billWiseReportHM");
			final var	receiveCreditWiseReportHM	= (HashMap<Long, DiscountDetailsReport>) valueOutObj.get("receiveCreditWiseReportHM");

			if(ObjectUtils.isNotEmpty(disDetailsReportHM) || ObjectUtils.isNotEmpty(billWiseReportHM) || ObjectUtils.isNotEmpty(receiveCreditWiseReportHM)) {
				if(ObjectUtils.isNotEmpty(disDetailsReportHM)) {
					request.setAttribute("disDetailsReportHM", disDetailsReportHM);
					request.setAttribute("wayBillDeliveryCharge", valueOutObj.get("wayBillDeliveryCharge"));
				}

				if(ObjectUtils.isNotEmpty(billWiseReportHM))
					request.setAttribute("billWiseReportHM", billWiseReportHM);

				if(ObjectUtils.isNotEmpty(receiveCreditWiseReportHM))
					request.setAttribute("receiveCreditWiseReportHM", receiveCreditWiseReportHM);
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("showColumnDiscountConfigBy", showColumnDiscountConfigBy);
			request.setAttribute("showColumnDemurrage", showColumnDemurrage);
			request.setAttribute("showColumnRemark", showColumnRemark);

			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("nextPageToken", "success");
		}catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}