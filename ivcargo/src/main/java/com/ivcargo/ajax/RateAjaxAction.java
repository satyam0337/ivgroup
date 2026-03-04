package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.RateMasterDao;
import com.platform.dto.Executive;
import com.platform.dto.RateMaster;

public class RateAjaxAction implements Action {

	private static final String TRACE_ID = "RateAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 		= null;
		Executive				executive 	= null;
		StringBuffer			strBfr 		= null;
		PrintWriter				out			= null;
		TreeMap<Long,Double>	rateId_mast = null;
		RateMaster[]			rateMaster	= null;
		PrintWriter 			output 		= null;
		short 					filter 		= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			response.setContentType("text/plain");
			executive	= (Executive) request.getSession().getAttribute("executive");
			strBfr		= new StringBuffer();
			filter		= Short.parseShort(request.getParameter("filter"));

			switch (filter) {
			case 1 -> {
				if(executive != null) {

					var	srcBranchId			= 0L;
					var	destBranchId		= 0L;
					var	minWght				= 0.00;
					var	maxWght				= 0.00;
					var	vehicleTypeId		= 0L;
					short	categoryTypeId		= 0;
					var	packingTypeId		= 0L;
					var	corporateAccountId	= 0L;

					try {

						srcBranchId			= Long.parseLong(request.getParameter("srcBranchId"));
						destBranchId		= Long.parseLong(request.getParameter("destBranchId"));
						minWght				= Double.parseDouble(request.getParameter("minWght"));
						maxWght				= Double.parseDouble(request.getParameter("maxWght"));
						vehicleTypeId		= Long.parseLong(request.getParameter("vehicleTypeId"));
						categoryTypeId		= Short.parseShort(request.getParameter("categoryTypeId"));
						packingTypeId		= Long.parseLong(request.getParameter("packingTypeId"));
						corporateAccountId	= Long.parseLong(request.getParameter("corporateAccountId"));
						rateId_mast			= new TreeMap<>();

						//Specific Packing Type Rates (Only Route level charges)
						rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,destBranchId,executive.getAccountGroupId(),categoryTypeId,minWght,maxWght,vehicleTypeId,packingTypeId,corporateAccountId);
						if(rateMaster != null && rateMaster.length > 0)
							for (final RateMaster element : rateMaster)
								if(rateId_mast.get(element.getChargeTypeMasterId()) == null)
									rateId_mast.put(element.getChargeTypeMasterId(), element.getRate());

						//Generic Packing Type Rates (Only Route level charges)
						rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,destBranchId,executive.getAccountGroupId(),categoryTypeId,minWght,maxWght,vehicleTypeId,0,corporateAccountId);
						if(rateMaster != null && rateMaster.length > 0)
							for (final RateMaster element : rateMaster)
								if(rateId_mast.get(element.getChargeTypeMasterId()) == null)
									rateId_mast.put(element.getChargeTypeMasterId(), element.getRate());

						//if Party rates not defined then apply general rates
						if(categoryTypeId == RateMaster.CATEGORY_TYPE_PARTY_ID) {

							//Specific Packing Type Rates (Only Route level charges)
							rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,packingTypeId,0);
							if(rateMaster != null && rateMaster.length > 0)
								for (final RateMaster element : rateMaster)
									if(rateId_mast.get(element.getChargeTypeMasterId()) == null)
										rateId_mast.put(element.getChargeTypeMasterId(), element.getRate());

							//Generic Packing Type Rates (Only Route level charges)
							rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,0,0);
							if(rateMaster != null && rateMaster.length > 0)
								for (final RateMaster element : rateMaster)
									if(rateId_mast.get(element.getChargeTypeMasterId()) == null)
										rateId_mast.put(element.getChargeTypeMasterId(), element.getRate());
						}

						final var count =	rateId_mast.size();
						var iteratcount = 0;
						for(final Long key : rateId_mast.keySet()){
							iteratcount ++;
							if(iteratcount == count)
								strBfr.append(key.toString()+"="+rateId_mast.get(key));
							else
								strBfr.append(key.toString()+"="+rateId_mast.get(key)+",");
						}

						output = response.getWriter();
						output.println(strBfr);
						output.flush();
					} catch(final Exception e) {
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," EXCEPTION in filter "+filter+": " +e);
						strBfr.append("Error : While getting Rates !");
					} finally {
						//chargeTypeIds = null;
					}
				} else
					strBfr.append("Error : You are logged out, Please login again !");
			}
			case 2 -> {
				strBfr = new StringBuffer();
				if(executive != null) {

					var	srcBranchId			= 0L;
					var	destBranchId		= 0L;
					var	minWght				= 0.00;
					var	maxWght				= 0.00;
					var	vehicleTypeId		= 0L;
					short	categoryTypeId		= 0;
					var	packingTypeId		= 0L;
					var	corporateAccountId	= 0L;

					try {

						srcBranchId			= Long.parseLong(request.getParameter("srcBranchId"));
						destBranchId		= Long.parseLong(request.getParameter("destBranchId"));
						minWght				= Double.parseDouble(request.getParameter("minWght"));
						maxWght				= Double.parseDouble(request.getParameter("maxWght"));
						vehicleTypeId		= Long.parseLong(request.getParameter("vehicleTypeId"));
						categoryTypeId		= Short.parseShort(request.getParameter("categoryTypeId"));
						packingTypeId		= Long.parseLong(request.getParameter("packingTypeId"));
						corporateAccountId	= Long.parseLong(request.getParameter("corporateAccountId"));
						rateId_mast			= new TreeMap<>();

						//Route level charges
						rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,destBranchId,executive.getAccountGroupId(),categoryTypeId,minWght,maxWght,vehicleTypeId,packingTypeId,corporateAccountId);
						if(rateMaster != null && rateMaster.length > 0)
							for (final RateMaster element : rateMaster)
								if(rateId_mast.get(element.getChargeTypeMasterId())== null)
									rateId_mast.put(element.getChargeTypeMasterId(), element.getRate());

						//Branch level charges
						rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,0,executive.getAccountGroupId(),categoryTypeId,minWght,maxWght,vehicleTypeId,0,corporateAccountId);
						if(rateMaster != null && rateMaster.length > 0)
							for (final RateMaster element : rateMaster)
								if(rateId_mast.get(element.getChargeTypeMasterId())== null)
									rateId_mast.put(element.getChargeTypeMasterId(), element.getRate());

						//if Party rates not defined then apply general rates
						if(categoryTypeId == RateMaster.CATEGORY_TYPE_PARTY_ID) {

							//Route level charges
							rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,packingTypeId,0);
							if(rateMaster != null && rateMaster.length > 0)
								for (final RateMaster element : rateMaster)
									if(rateId_mast.get(element.getChargeTypeMasterId())== null)
										rateId_mast.put(element.getChargeTypeMasterId(), element.getRate());

							//Branch level charges
							rateMaster = RateMasterDao.getInstance().getRates(srcBranchId,0,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,0,0);
							if(rateMaster != null && rateMaster.length > 0)
								for (final RateMaster aRateMaster : rateMaster)
									if(rateId_mast.get(aRateMaster.getChargeTypeMasterId())== null)
										rateId_mast.put(aRateMaster.getChargeTypeMasterId(), aRateMaster.getRate());
						}

						final var count =	rateId_mast.size();
						if(count > 0){
							var iteratcount = 0;
							for(final Long key : rateId_mast.keySet()){
								iteratcount ++;
								if(iteratcount == count)
									strBfr.append(key.toString()+"="+rateId_mast.get(key));
								else
									strBfr.append(key.toString()+"="+rateId_mast.get(key)+",");

							}
						}

						if(strBfr.length() > 0) {
							output = response.getWriter();
							output.println(strBfr);
							output.flush();
						}
					} catch(final Exception e) {
						e.printStackTrace();
						strBfr.append("Error : While getting Rates !");
					} finally {
						//chargeTypeIds = null;
					}
				} else
					strBfr.append("Error : You are logged out, Please login again !");
			}
			}

			out = response.getWriter();
			out.println(strBfr.toString());
			out.flush();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			output.close();
			out.close();
			executive 	= null;
			strBfr 		= null;
			out			= null;
			rateId_mast = null;
			rateMaster	= null;
		}
	}
}
