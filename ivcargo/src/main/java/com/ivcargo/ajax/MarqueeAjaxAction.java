package com.ivcargo.ajax;

import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.MarqueeDao;
import com.platform.dto.MarqueeMaster;
import com.platform.dto.TransportCommonMaster;

public class MarqueeAjaxAction implements Action{

	private static final String TRACE_ID = "MarqueeAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");
			final var 	cacheManip	=	new CacheManip(request);
			final var 	executive 	=	cacheManip.getExecutive(request);
			final var 	filter 		= 	Short.parseShort(request.getParameter("filter"));
			final var 	strBfr 		= 	new StringBuilder();

			switch (filter) {
			case AjaxActionConstant.AJAX_ADD_ACTION -> {
				if (executive != null){

					final var		marquee		= new MarqueeMaster();
					String  	branchIds	= null;

					try {
						final var isForAllGroups = Boolean.parseBoolean(request.getParameter("isForAllGroups"));
						if(isForAllGroups){
							marquee.setAccountGroupId(0);
							marquee.setBranchIds("0");
						} else{
							marquee.setAccountGroupId(executive.getAccountGroupId());
							final var selectiveBranches = Boolean.parseBoolean(request.getParameter("selectiveBranches"));

							var		regionId	= 0L;
							var		subRegionId	= 0L;
							var		srcBranchId	= 0L;

							if(selectiveBranches)
								branchIds	=	StringUtils.trim(request.getParameter("branchIds"));
							else{
								regionId	= Long.parseLong(request.getParameter("region"));
								subRegionId = Long.parseLong(request.getParameter("subRegion"));
								srcBranchId = JSPUtility.GetLong(request, "branch", 0);

								if(regionId == 0)
									branchIds = cacheManip.getOwnGroupBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, regionId);
								else if(subRegionId == 0 && srcBranchId == 0)
									branchIds = cacheManip.getOwnGroupBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
								else if(subRegionId > 0 && srcBranchId == 0)
									branchIds = cacheManip.getOwnGroupBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
								else if(subRegionId > 0 && srcBranchId > 0)
									branchIds = Long.toString(srcBranchId);
							}

							marquee.setBranchIds(branchIds);
						}

						final var  	marqueeStr	=	StringUtils.trim(request.getParameter("marquee"));
						final var 	creationDate= 	new Timestamp(new Date().getTime());
						marquee.setCreationDate(creationDate);
						marquee.setExecutiveId(executive.getExecutiveId());
						marquee.setMarquee(marqueeStr);

						strBfr.append(MarqueeDao.getInstance().insertMarquee(marquee));

						if("success".equals(strBfr.toString().split(";")[0]))
							cacheManip.refreshMarqueeMaster(request);
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				} else
					strBfr.append("You are logged out, Please login again !");
			}
			case AjaxActionConstant.AJAX_DELETE_ACTION -> {
				if (executive != null)
					try {
						final var marqueeId 		= Long.parseLong(request.getParameter("marqueeId"));
						final var		marquee	=   new MarqueeMaster();
						marquee.setMarqueeMasterId(marqueeId);
						strBfr.append(MarqueeDao.getInstance().deleteMarquee(marquee));

						if("success".equals(strBfr.toString()))
							cacheManip.refreshMarqueeMaster(request);
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
			}
			case AjaxActionConstant.AJAX_FIND_ACTION -> {
				if (executive != null)
					try {
						final var	marquee	=   MarqueeDao.getInstance().getMarquees(0,(short)0);
						if(marquee != null)
							strBfr.append(marquee[0].getMarqueeMasterId()+"`"+marquee[0].getMarquee());
						else
							strBfr.append("error");
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
			}
			case AjaxActionConstant.AJAX_UPDATE_ACTION -> {
				if (executive != null)
					try {
						cacheManip.refreshMarqueeMaster(request);
						strBfr.append("success");
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
			}
			case AjaxActionConstant.AJAX_UPDATE_MESSAGE_ACTION -> {
				if(executive != null)
					try {
						final var 	marqueeId 		= JSPUtility.GetLong(request, "marqueeId",0);
						final var  marqueeStr 		= StringUtils.trim(JSPUtility.GetString(request, "marquee", ""));
						final var	marquee		=   new MarqueeMaster();
						marquee.setMarqueeMasterId(marqueeId);
						marquee.setMarquee(marqueeStr);

						marquee.setAccountGroupId(executive.getAccountGroupId());
						MarqueeDao.getInstance().updateMarqueeMessage(marquee);

						cacheManip.refreshMarqueeMaster(request);
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
			}
			}
			final var out = response.getWriter();
			out.println(strBfr.toString());
			out.flush();
			out.close();
			request.setAttribute("nextPageToken", "success");
		}catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}

