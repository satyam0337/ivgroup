package com.ivcargo.ajax.masteractions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.ajax.AjaxActionConstant;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.Executive;
import com.platform.dto.constant.TransCargoAccountGroupConstant;

public class CollectionPersonMasterAjaxAction implements Action{

	private static final String TRACE_ID = "CollectionPersonMasterAjaxAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	=	null;
		StringBuilder 			strBfr 		= 	null;
		Short					filter		= 	0;
		CollectionPersonMaster  person		= null;
		CacheManip				cache		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");
			executive 	=	(Executive) request.getSession().getAttribute("executive");
			filter 		= 	Short.parseShort(request.getParameter("filter"));
			strBfr 		= 	new StringBuilder();
			person		= 	new CollectionPersonMaster();
			cache		=   new CacheManip(request);

			final var groupLevelaccountGroupList = new ArrayList<Integer>();
			groupLevelaccountGroupList.add(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT);
			groupLevelaccountGroupList.add(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA);
			groupLevelaccountGroupList.add(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAHARAJA);

			switch (filter) {

			case AjaxActionConstant.AJAX_ADD_ACTION: //Add Collection Person
				if (executive != null)
					try {
						person.setName(JSPUtility.GetString(request, "name"));
						person.setAddress(JSPUtility.GetString(request, "address"));
						person.setAccountGroupId(executive.getAccountGroupId());
						person.setPhoneNumber(JSPUtility.GetString(request, "phoneNo"));
						person.setMobileNumber(JSPUtility.GetString(request, "mobNo"));
						person.setMarkForDelete(false);
						person.setTypeId((short)1);
						person.setBranchId(JSPUtility.GetLong(request, "branchId",0));
						//strResponse = CrossingAgentMasterDao.getInstance().insert(person);
						strBfr.append(CollectionPersonMasterDao.getInstance().insert(person));

					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				break;
			case AjaxActionConstant.AJAX_DELETE_ACTION: //Delete Collection Person
				if (executive != null)
					try {
						strBfr.append(CollectionPersonMasterDao.getInstance().delete(JSPUtility.GetInt(request, "selectedCollectionPersonId")));
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				break;
			case AjaxActionConstant.AJAX_FIND_ACTION: //Find Collection Person
				if (executive != null){
					try {
						var collectionPersonId = 0L;
						if (request.getParameter("collectionPersonId")!=null){
							collectionPersonId = Long.parseLong(request.getParameter("collectionPersonId"));
							person = CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(collectionPersonId);
						} else
							strBfr.append("Party Not selected !");
						if (person != null){
							strBfr.append(person.getCollectionPersonMasterId()+";");
							strBfr.append(person.getName()+";");
							if(person.getAddress() != null)
								strBfr.append(person.getAddress()+";");
							else
								strBfr.append(""+";");
							strBfr.append(person.getPhoneNumber()+";");
							strBfr.append(person.getMobileNumber()+";");
							strBfr.append(person.getAccountGroupId()+";");
							strBfr.append(person.isMarkForDelete()+";");
							strBfr.append(person.getBranchId()+";");
							strBfr.append(cache.getGenericBranchDetailCache(request, person.getBranchId()).getName()+";");

						}
					}catch(final Exception e){
						e.printStackTrace();
					}
					//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," Output : " +strBfr.toString());
					break;
				}
				strBfr.append("You are logged out, Please login again !");
				break;
			case AjaxActionConstant.AJAX_UPDATE_ACTION: //Update Collection Person
				if (executive != null)
					try {
						person.setCollectionPersonMasterId(JSPUtility.GetLong(request, "selectedCollectionPersonId"));
						person.setName(JSPUtility.GetString(request, "name"));
						person.setAddress(JSPUtility.GetString(request, "address"));
						person.setAccountGroupId(executive.getAccountGroupId());
						person.setPhoneNumber(JSPUtility.GetString(request, "phoneNo"));
						person.setMobileNumber(JSPUtility.GetString(request, "mobNo"));
						person.setMarkForDelete(false);
						person.setTypeId((short)1);

						//strResponse = CrossingAgentMasterDao.getInstance().update(agent);
						strBfr.append(CollectionPersonMasterDao.getInstance().update(person));
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"Error in filter : "+filter+" EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				break;

			case AjaxActionConstant.AJAX_IS_EXIST_ACTION : // To check the duplicate entry for Collection Person.
				if (executive != null)
					try {
						if (request.getParameter("name") != null) {
							final var	personName	= request.getParameter("name");
							final var	branchId 	= JSPUtility.GetLong(request, "branchId", 0);

							final var	isBranchLevel = !groupLevelaccountGroupList.contains((int) executive.getAccountGroupId());

							strBfr.append(CollectionPersonMasterDao.getInstance().isCollectionPersonExits(personName, executive.getAccountGroupId(), isBranchLevel, branchId));
						} else
							strBfr.append("Person Name is missing !");
					} catch(final Exception e) {
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," EXCEPTION : " +e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				break;

			}

			final var out = response.getWriter();
			out.println(strBfr.toString());
			out.flush();
			out.close();
			request.setAttribute("nextPageToken", "success");
		}catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
