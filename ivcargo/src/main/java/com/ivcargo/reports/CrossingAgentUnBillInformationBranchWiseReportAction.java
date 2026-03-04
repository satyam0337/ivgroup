package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.crossingagent.CrossingAgentMaster;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CrossingAgentUnBillInformationBranchWiseDAO;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.report.CrossingAgentUnBilledInformationReportConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CrossingAgentUnBillInformationBranchWiseReport;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CrossingAgentUnBillInformationBranchWiseReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		SortedMap<String, SortedMap<String,SortedMap<String,CrossingAgentUnBillInformationBranchWiseReport>>> subRegionWiseData = null;
		SortedMap<String,SortedMap<String,CrossingAgentUnBillInformationBranchWiseReport>>					branchWiseData	   	= null;
		SortedMap<String,CrossingAgentUnBillInformationBranchWiseReport>									modelHM		  		= null;
		CrossingAgentUnBillInformationBranchWiseReport 														model				= null;
		HashMap<Long, ArrayList<CrossingAgentUnBillInformationBranchWiseReport>>							resultHM	 		= null;
		ArrayList<CrossingAgentUnBillInformationBranchWiseReport>											resultList	 		= null;
		SortedMap<String,CrossingAgentUnBillInformationBranchWiseReport>									agentWiseColl  		= null;
		CrossingAgentUnBillInformationBranchWiseReport														agentModel			= null;
		HashMap<String,Object>	 		error 				= null;
		Executive        				executive         	= null;
		SimpleDateFormat 				sdf               	= null;
		Timestamp        				fromDate          	= null;
		Timestamp        				toDate            	= null;
		ValueObject 					objectIn 			= null;
		ValueObject 					objectOut 			= null;
		CacheManip						cache				= null;
		String							branchIds			= null;
		Branch							branch				= null;
		SubRegion						subregion			= null;
		DispatchLedger					dispatchLedger		= null;
		WayBill							waybill				= null;
		Long[]							dispatchIdArray		= null;
		Long[]							wayBillIdArray		= null;
		String							dispatchBillIds		= null;
		String							crossingAgentIds	= null;
		String							waybillIds			= null;
		LinkedHashMap<Long, DispatchLedger>	 lsColl			= null;
		Map<Long, CrossingAgentMaster>	 crossAgtColl	= null;
		HashMap<Long, WayBill>				waybillHM		= null;
		Long[]							crossingAgentIdArray= null;
		var							crossingAgentId	= 0L;
		var							totalPaid			= 0.00;
		var							totalTopay			= 0.00;
		var							totalCrossingHire	= 0.00;
		var							lsCount				= 0L;
		var     						monthDuration    										= 0;
		String 							fromDateStr       										= null;
		List<CrossingAgentUnBillInformationBranchWiseReport>			resultListLrWise 		= null;
		Map<Long, WayBill> 												lrColl 					= null;
		Map<String, Map<String, Map<Long, Map<Long,CrossingAgentUnBillInformationBranchWiseReport>>>> subRegionWiseHm		= null;
		Map<Long, List<CrossingAgentUnBillInformationBranchWiseReport>>	crossingAgentWiseHm 								= null;
		ValueObject														reportConfig										= null;
		var															showCrossingAgentUnBilledInformationLrWise			= false;
		var															lrCount					= 0L;
		Map<Long, List<CrossingAgentUnBillInformationBranchWiseReport>>	lsWiseHm 				= null;
		List<CrossingAgentUnBillInformationBranchWiseReport>			lrWiseList 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCrossingAgentUnBillInformationBranchWiseReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			objectIn	= new ValueObject();
			cache       = new CacheManip(request);
			executive	= cache.getExecutive(request);
			final long partyId = JSPUtility.GetInt(request, "partyId",0);

			monthDuration   = JSPUtility.GetInt(request, "timeDuration", 0);


			if(monthDuration > 0) {
				fromDateStr	= DateTimeUtility.getPreviousDateByMonth(DateTimeUtility.getCurrentTimeStamp(), monthDuration);
				fromDate	= DateTimeUtility.getTimeStamp(fromDateStr);
				toDate		= DateTimeUtility.getCurrentTimeStamp();
			} else {
				fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.FROM_DATE) + " 00:00:00").getTime());
				toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.TO_DATE) + " 23:59:59").getTime());
			}
			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			reportConfig	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CROSSING_AGENT_UNBILL_INFORMATION_BRANCH_WISE_REPORT, executive.getAccountGroupId());
			showCrossingAgentUnBilledInformationLrWise		= reportConfig.getBoolean(CrossingAgentUnBilledInformationReportConfigurationDTO.SHOW_CROSSING_AGENT_UNBILLED_INFORMATION_LR_WISE, false);

			branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);


			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchIds", branchIds);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			request.setAttribute("monthDuration", monthDuration);
			request.setAttribute("fromDate", fromDate);
			request.setAttribute("toDate", toDate);

			if(showCrossingAgentUnBilledInformationLrWise) {
				resultListLrWise = CrossingAgentUnBillInformationBranchWiseDAO.getInstance().getCrossingAgentUnBillInformationBranchWiseAndLrWise(objectIn, partyId);

				if(resultListLrWise != null && !resultListLrWise.isEmpty()) {
					lsWiseHm			= resultListLrWise.stream().collect(Collectors.groupingBy(CrossingAgentUnBillInformationBranchWiseReport::getDispatchLedgerId));
					dispatchBillIds 	= resultListLrWise.stream().map(e -> e.getDispatchLedgerId() + "").collect(Collectors.joining(","));
					crossingAgentIds	= resultListLrWise.stream().map(e -> e.getCrossingAgentId() + "").collect(Collectors.joining(","));
					waybillIds			= resultListLrWise.stream().map(e -> e.getWayBillId() + "").collect(Collectors.joining(","));

					if(!waybillIds.isEmpty())
						lrColl	 			= WayBillDao.getInstance().getLRDetails(waybillIds);

					crossAgtColl		= CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetails(crossingAgentIds);
					lsColl	 			= DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchBillIds);
					agentWiseColl		= new TreeMap<>();

					for(final Entry<Long, List<CrossingAgentUnBillInformationBranchWiseReport>> entry : lsWiseHm.entrySet()) {
						lrWiseList 	= entry.getValue();

						for (final CrossingAgentUnBillInformationBranchWiseReport listModel : lrWiseList) {
							final var wayBill	= lrColl.get(listModel.getWayBillId());
							dispatchLedger			= lsColl.get(listModel.getDispatchLedgerId());
							branch					= cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId());
							subregion  				= cache.getGenericSubRegionById(request, branch.getSubRegionId());

							listModel.setActualWeight(wayBill.getActualWeight());
							listModel.setPackageQuantity(wayBill.getWayBillConsignmentQuantity());
							if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								listModel.setPaidAmount(wayBill.getBookingTotal());
							else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								listModel.setTopayAmount(totalTopay);

							listModel.setNetAmount(listModel.getTopayAmount() - listModel.getCrossingHire());
							listModel.setWayBillNumber(wayBill.getWayBillNumber());
							listModel.setLsNumber(dispatchLedger.getLsNumber());
							listModel.setSourceBranchId(dispatchLedger.getSourceBranchId());
							listModel.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
							listModel.setSourceBranch(branch.getName());
							listModel.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()).getName());
							listModel.setSrcSubRegionId(branch.getSubRegionId());
							listModel.setSrcSubRegionName(subregion.getName());
							listModel.setCreationDateTime(wayBill.getBookingDateTime());
							listModel.setAgentName(crossAgtColl.get(listModel.getCrossingAgentId()).getName());
							listModel.setVehicleNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(),dispatchLedger.getVehicleNumberMasterId()).getVehicleNumber());

						}
					}

					crossingAgentWiseHm = lsWiseHm.values().stream().flatMap(Collection::stream)
							.collect(Collectors.groupingBy(CrossingAgentUnBillInformationBranchWiseReport::getCrossingAgentId,Collectors.toList()));

					for(final Entry<Long, List<CrossingAgentUnBillInformationBranchWiseReport>> entry1 : crossingAgentWiseHm.entrySet()) {
						final var crossingAgentList = entry1.getValue();
						agentModel = new CrossingAgentUnBillInformationBranchWiseReport();

						lrCount = 0;
						for (final CrossingAgentUnBillInformationBranchWiseReport element : crossingAgentList) {
							lrCount++;
							agentModel.setCrossingAgentId(element.getCrossingAgentId());
							agentModel.setAgentName(element.getAgentName());
							agentModel.setActualWeight(agentModel.getActualWeight() + element.getActualWeight());
							agentModel.setPackageQuantity(agentModel.getPackageQuantity() + element.getPackageQuantity());
							agentModel.setCrossingHire(agentModel.getCrossingHire() + element.getCrossingHire());
							agentModel.setTopayAmount(agentModel.getTopayAmount() + element.getTopayAmount());
							agentModel.setPaidAmount(agentModel.getPaidAmount() + element.getPaidAmount());
							agentModel.setNetAmount(agentModel.getNetAmount() + element.getNetAmount());
							agentModel.setLrCount(lrCount);
						}

						agentWiseColl.put(agentModel.getAgentName()+"_"+agentModel.getCrossingAgentId(), agentModel);
					}

					subRegionWiseHm = lsWiseHm.values().stream().flatMap(Collection::stream).collect(Collectors.groupingBy(CrossingAgentUnBillInformationBranchWiseReport::getSrcSubRegionIdWithName,
							Collectors.groupingBy(CrossingAgentUnBillInformationBranchWiseReport::getSrcBranchIdWithName,
									Collectors.groupingBy(CrossingAgentUnBillInformationBranchWiseReport::getDispatchLedgerId,
											Collectors.toMap(CrossingAgentUnBillInformationBranchWiseReport::getWayBillId, Function.identity(), (e1, e2) -> e2)))));

					request.setAttribute("subRegionWiseData",subRegionWiseHm);
					request.setAttribute("agentWiseColl",agentWiseColl);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				objectOut = CrossingAgentUnBillInformationBranchWiseDAO.getInstance().getCrossingAgentUnBillInformationBranchWise(objectIn);

				if(objectOut != null) {
					resultHM	 		 = (HashMap<Long, ArrayList<CrossingAgentUnBillInformationBranchWiseReport>>)objectOut.get("resultHM");
					dispatchIdArray		 = (Long[])objectOut.get("DispatchIdArray");
					crossingAgentIdArray = (Long[])objectOut.get("CrossingAgentIdArray");
					wayBillIdArray		 = (Long[])objectOut.get("WayBillIdArray");

					if(resultHM != null && resultHM.size() > 0) {

						cache			   	= new CacheManip(request);
						dispatchBillIds		= Utility.GetLongArrayToString(dispatchIdArray);
						crossingAgentIds	= Utility.GetLongArrayToString(crossingAgentIdArray);
						waybillIds			= Utility.GetLongArrayToString(wayBillIdArray);

						crossAgtColl		= CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetails(crossingAgentIds);
						waybillHM			= WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
						lsColl	 			= DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchBillIds);
						subRegionWiseData 	= new TreeMap<>();
						agentWiseColl		= new TreeMap<>();

						for (final long key : resultHM.keySet()) {

							resultList		= resultHM.get(key);
							dispatchLedger	= lsColl.get(key);
							branch			= cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId());

							if(branch == null) continue;

							subregion  		= cache.getGenericSubRegionById(request, branch.getSubRegionId());
							totalCrossingHire   = 0.00;
							totalPaid			= 0.00;
							totalTopay			= 0.00;
							lsCount				= 0;
							model				= new CrossingAgentUnBillInformationBranchWiseReport();

							for (final CrossingAgentUnBillInformationBranchWiseReport element : resultList) {
								waybill = waybillHM.get(element.getWayBillId());
								if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
									totalPaid += waybill.getBookingTotal();
								else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									totalTopay += waybill.getBookingTotal();
								totalCrossingHire += element.getCrossingHire();
								crossingAgentId	  = element.getCrossingAgentId();
							}

							model.setActualWeight(dispatchLedger.getTotalActualWeight());
							model.setPackageQuantity(dispatchLedger.getTotalNoOfPackages());
							model.setCrossingHire(totalCrossingHire);
							model.setTopayAmount(totalTopay);
							model.setPaidAmount(totalPaid);
							model.setNetAmount(totalTopay - totalCrossingHire);
							model.setDispatchLedgerId(dispatchLedger.getDispatchLedgerId());
							model.setCrossingAgentId(crossingAgentId);
							model.setLsNumber(dispatchLedger.getLsNumber());
							model.setSourceBranchId(dispatchLedger.getSourceBranchId());
							model.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
							model.setSourceBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId()).getName());
							model.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()).getName());
							model.setCreationDateTime(dispatchLedger.getTripDateTime());
							model.setAgentName(crossAgtColl.get(crossingAgentId).getName());
							model.setVehicleNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(),dispatchLedger.getVehicleNumberMasterId()).getVehicleNumber());

							branchWiseData  = subRegionWiseData.get(subregion.getName() + "_" + subregion.getSubRegionId());

							if(branchWiseData == null) {
								branchWiseData	= new TreeMap<>();
								modelHM			= new TreeMap<>();

								modelHM.put(model.getLsNumber()+"_"+model.getDispatchLedgerId(),model);
								branchWiseData.put(branch.getName()+"_"+branch.getBranchId(), modelHM);
								subRegionWiseData.put(subregion.getName()+"_"+subregion.getSubRegionId(), branchWiseData);

							} else {
								modelHM = branchWiseData.get(branch.getName()+"_"+branch.getBranchId());
								if(modelHM == null){
									modelHM			= new TreeMap<>();

									modelHM.put(model.getLsNumber()+"_"+model.getDispatchLedgerId(),model);
									branchWiseData.put(branch.getName()+"_"+branch.getBranchId(), modelHM);
								} else
									modelHM.put(model.getLsNumber()+"_"+model.getDispatchLedgerId(),model);
							}

							agentModel = agentWiseColl.get(model.getAgentName()+"_"+model.getCrossingAgentId());

							lsCount++;
							if(agentModel == null){
								agentModel = new CrossingAgentUnBillInformationBranchWiseReport();
								agentModel.setCrossingAgentId(model.getCrossingAgentId());
								agentModel.setAgentName(model.getAgentName());
								agentModel.setActualWeight(model.getActualWeight());
								agentModel.setPackageQuantity(model.getPackageQuantity());
								agentModel.setCrossingHire(model.getCrossingHire());
								agentModel.setTopayAmount(model.getTopayAmount());
								agentModel.setPaidAmount(model.getPaidAmount());
								agentModel.setNetAmount(model.getNetAmount());
								agentModel.setLsCount(lsCount);

								agentWiseColl.put(agentModel.getAgentName()+"_"+agentModel.getCrossingAgentId(), agentModel);

							}else{
								agentModel.setActualWeight(agentModel.getActualWeight() + model.getActualWeight());
								agentModel.setPackageQuantity(agentModel.getPackageQuantity() + model.getPackageQuantity());
								agentModel.setCrossingHire(agentModel.getCrossingHire() + model.getCrossingHire());
								agentModel.setTopayAmount(agentModel.getTopayAmount() + model.getTopayAmount());
								agentModel.setPaidAmount(agentModel.getPaidAmount() + model.getPaidAmount());
								agentModel.setNetAmount(agentModel.getNetAmount() + model.getNetAmount());
								agentModel.setLsCount(agentModel.getLsCount() + lsCount);
							}
						}

						request.setAttribute("subRegionWiseData",subRegionWiseData);
						request.setAttribute("agentWiseColl",agentWiseColl);
					} else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}