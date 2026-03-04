package com.ivcargo.actions.webservice;

import java.io.PrintWriter;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.framework.Action;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.model.BranchComboboxModel;
import com.platform.dao.model.CityComboboxModel;
import com.platform.dto.Branch;
import com.platform.dto.BranchBookingDestinationMap;
import com.platform.dto.City;
import com.platform.dto.Executive;

/**
 * Initialize the module
 */
public class GetDestinationCitiesAction implements Action {
	public static final String TRACE_ID = GetDestinationCitiesAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String, Object> 					error;
		CacheManip									cache;
		Executive 									executive;
		CityComboboxModel							cityComboboxModel					= null;
		JSONArray									jsonArray;
		JSONObject									jsonObject						= null;
		PrintWriter									out								= null;
		Map<Long, BranchBookingDestinationMap> 		branchBookingDestinationMapHM 	= null;
		ValueObject									city;
		List<Long>									branchCollection;
		HashMap<Long,String>	cityList;
		int 					filter				= 0;
		long					cityId				= 0;
		HashMap<Long, Branch> 	branches;
		BranchComboboxModel		branchComboboxModel	= null;
		String 					query				=null;
		long 					executiveCityId		;
		Collection<Long> 		cityIdList			= null;
		long					destinationBranch	= 0;

		try {

			// check if request consist of any error in request object
			error = ActionStaticUtil.getSystemErrorColl(request);

			// check for session if valid then only proceed and if there is any
			// system error
			if (ActionStaticUtil.isSystemError(request, error))
				return;

			cache 		= new CacheManip(request);
			executive 	= cache.getExecutive(request);

			if(request.getParameter("filter")!=null)
				filter =Integer.parseInt(request.getParameter("filter"));

			if(request.getParameter("cityId")!=null)
				cityId = Long.parseLong(request.getParameter("cityId"));

			if(request.getParameter("q_word[]")!=null)
				query = request.getParameter("q_word[]").toUpperCase();

			if(request.getParameter("destinationBranch")!=null)
				destinationBranch = Long.parseLong(request.getParameter("destinationBranch"));

			jsonArray  = new JSONArray();
			executiveCityId = executive.getCityId();

			switch(filter){
			case 1 :
				cityList			= new LinkedHashMap<Long, String>();
				city				= cache.getCityData(request);
				branchCollection 	= cache.getGroupBranchCollection(request, executive.getBranchId());
				branches 			= cache.getAllGroupBranches(request, executive.getAccountGroupId());

				cityIdList = branches.values().parallelStream()
						.filter(b -> b.getStatus() == Branch.BRANCH_ACTIVE)
						.filter(b -> !b.isMarkForDelete())
						.filter(b -> b.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || b.getBranchType() == Branch.BRANCH_TYPE_DELIVERY)
						.filter(b -> b.getCityId() != executiveCityId)
						.filter(b -> b.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED
						|| b.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED
						&& branchCollection != null && branchCollection.contains(b.getBranchId()))
						.map(Branch::getCityId)
						.sorted()
						.distinct()
						.collect(Collectors.toList());

				for(final long c:cityIdList)
					if(query!=null){
						if(((City) city.get("" + c)).getName().toUpperCase().contains(query) || ((City) city.get("" + c)).getName().toUpperCase().startsWith(query) || ((City) city.get("" + c)).getName().toUpperCase().endsWith(query))
							cityList.put(c, ((City) city.get("" + c)).getName());
					} else
						cityList.put(c, ((City) city.get("" + c)).getName());

				jsonObject = new JSONObject();
				out = response.getWriter();

				for(final Map.Entry<Long,String> entry : cityList.entrySet()){
					cityComboboxModel = new CityComboboxModel();
					cityComboboxModel.setCityId(entry.getKey());
					cityComboboxModel.setCityName(entry.getValue());
					jsonArray.put(new JSONObject(cityComboboxModel));
				}

				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_RESULT, jsonArray);
				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_COUNT, jsonArray.length());
				break;
			case 2:
				branches 	= cache.getAllGroupBranches(request, executive.getAccountGroupId());
				jsonObject = new JSONObject();
				jsonArray  = new JSONArray();

				for(final Map.Entry<Long, Branch> entry : branches.entrySet()) {
					final Branch			branch		= entry.getValue();

					if(branch.getCityId() == cityId && branch.getBranchType() != Branch.BRANCH_TYPE_BOOKING
							&& branch.getName().toUpperCase().contains(query) || branch.getName().toUpperCase().startsWith(query) || branch.getName().toUpperCase().endsWith(query)){
						branchComboboxModel = new BranchComboboxModel();
						branchComboboxModel.setBranchId(entry.getKey());
						branchComboboxModel.setBranchName(branch.getName());
						jsonArray.put(new JSONObject(branchComboboxModel));
					}
				}

				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_RESULT, jsonArray);
				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_COUNT, jsonArray.length());
				break;
			case 3:
				cityList			= new LinkedHashMap<Long, String>();
				city				= cache.getCityData(request);
				branchCollection 	= cache.getGroupBranchCollection(request, executive.getBranchId());
				branches 			= cache.getAllGroupBranches(request, executive.getAccountGroupId());

				cityIdList = branches.values().parallelStream()
						.filter(b -> b.getStatus() == Branch.BRANCH_ACTIVE)
						.filter(b -> !b.isMarkForDelete())
						.filter(b -> b.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH
						|| b.getBranchType() == Branch.BRANCH_TYPE_DELIVERY)
						.filter(b -> b.getCityId() != executiveCityId)
						.filter(b -> b.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED
						|| b.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED
						&& branchCollection != null && branchCollection.contains(b.getBranchId()))
						.map(Branch::getCityId)
						.sorted()
						.distinct()
						.collect(Collectors.toList());

				for(final long c:cityIdList)
					if(query!=null){
						if(((City) city.get("" + c)).getName().toUpperCase().contains(query) || ((City) city.get("" + c)).getName().toUpperCase().startsWith(query) || ((City) city.get("" + c)).getName().toUpperCase().endsWith(query))
							cityList.put(c, ((City) city.get("" + c)).getName());
					} else
						cityList.put(c, ((City) city.get("" + c)).getName());

				jsonObject = new JSONObject();
				out = response.getWriter();

				for(final Map.Entry<Long, String> entry : cityList.entrySet()) {
					cityComboboxModel = new CityComboboxModel();
					cityComboboxModel.setCityId(entry.getKey());
					cityComboboxModel.setCityName(entry.getValue());
					jsonArray.put(new JSONObject(cityComboboxModel));
				}

				cityComboboxModel = new CityComboboxModel();
				cityComboboxModel.setCityId(executive.getCityId());
				cityComboboxModel.setCityName(executive.getCityName());

				jsonArray.put(new JSONObject(cityComboboxModel));
				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_RESULT, jsonArray);
				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_COUNT, jsonArray.length());
				break;
			case 4:
				branches = cache.getAllGroupBranches(request, executive.getAccountGroupId());
				jsonObject = new JSONObject();
				jsonArray  = new JSONArray();

				for(final Map.Entry<Long, Branch> entry : branches.entrySet()) {
					final Branch			branch		= entry.getValue();

					if(branch.getCityId() == cityId && (branch.getName().toUpperCase().contains(query)
							|| branch.getName().toUpperCase().startsWith(query) || branch.getName().toUpperCase().endsWith(query))){
						branchComboboxModel = new BranchComboboxModel();
						branchComboboxModel.setBranchId(entry.getKey());
						branchComboboxModel.setBranchName(branch.getName());
						jsonArray.put(new JSONObject(branchComboboxModel));
					}
				}

				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_RESULT, jsonArray);
				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_COUNT, jsonArray.length());
				break;
			case 5:
				boolean flag =false;

				branchBookingDestinationMapHM = cache.getBookingBranchDestinationMap(request, executive.getBranchId());

				if(branchBookingDestinationMapHM != null){
					flag = branchBookingDestinationMapHM.get(destinationBranch)!=null;

					jsonArray.put(new JSONObject(flag));
				}
				jsonObject = new JSONObject();
				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_RESULT, flag);
				break;
			default:
				break;
			}

			if(out != null) {
				out.println(jsonObject);
				out.flush();
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			if(out != null) out.close();
			error = null;
		}
	}
}