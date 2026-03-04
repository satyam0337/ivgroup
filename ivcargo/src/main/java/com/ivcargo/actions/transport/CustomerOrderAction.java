package com.ivcargo.actions.transport;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.CustomerOrderBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.CustomerOrder;
import com.iv.dto.constant.CustomerOrderStatusConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDao;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

public class CustomerOrderAction implements Action{
	public static final String TRACE_ID = "CustomerOrderAction";

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 								= null;
		CustomerOrderBLL 						bll 								= null;
		ValueObject 							inValObj 							= null;
		ValueObject 							outValObj 							= null;
		String 									strResponse 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var filter 			= JSPUtility.GetInt(request, "filter",0);

			final var	cache 				= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			final var	branchcache			= cache.getGenericBranchesDetail(request);

			if( executive != null) {
				final var	customerOrderConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CUSTOMER_ORDER);
				final var	groupConfig					= cache.getGroupConfiguration(request, executive.getAccountGroupId());

				request.setAttribute("customerOrderConfig", customerOrderConfig);

				switch (filter) {
				case 1 -> {
					bll = new CustomerOrderBLL();
					inValObj = new ValueObject();
					outValObj = new ValueObject();

					inValObj.put(Executive.EXECUTIVE, executive);
					inValObj.put("customerOrder", setOrder(request, executive));
					inValObj.put("customerOrderConfig", customerOrderConfig);
					inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
					inValObj.put("branchcache", branchcache);

					outValObj = bll.addOrder(inValObj);

					if (outValObj != null && outValObj.get("response") != null)
						strResponse = (String) outValObj.get("response");
					else
						strResponse = CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

					if(strResponse == null) strResponse = CargoErrorList.SYSTEM_ERROR_DESCRIPTION;
					request.setAttribute("message",strResponse);
					response.sendRedirect("Masters.do?pageId=233&eventId=1&message="+strResponse);
				}
				case 2 -> {
					new InitializeCustomerOrder().execute(request, response);
					bll = new CustomerOrderBLL();
					inValObj = new ValueObject();
					outValObj = new ValueObject();
					final var isSearchByDate = request.getParameter("searchByDate") != null;

					ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

					if(isSearchByDate) {
						inValObj.put("fromDate", DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate")));
						inValObj.put("toDate", DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate")));
						inValObj.put("branch",  JSPUtility.GetLong(request, "branch", executive.getBranchId()));
						inValObj.put("region",  JSPUtility.GetLong(request, "region", executive.getRegionId()));
						inValObj.put("subRegion",  JSPUtility.GetLong(request, "subRegion", executive.getSubRegionId()));
					} else {
						inValObj.put("customerId", JSPUtility.GetLong(request, "customerId"));
						inValObj.put("customerTypeId", JSPUtility.GetShort(request, "customerTypeId"));
						inValObj.put("customerName", JSPUtility.GetString(request, "customerName"));
					}

					inValObj.put("isSearchByDate", isSearchByDate);
					inValObj.put("executive", executive);

					outValObj = bll.searchOrderForUpdate(inValObj);

					if (outValObj != null) {
						final var	pendingCustomerOrders = (Map<Long, CustomerOrder>) outValObj.get("pendingCustomerOrders");

						if(pendingCustomerOrders != null) {
							for (final Map.Entry<Long, CustomerOrder> entry : pendingCustomerOrders.entrySet()) {
								final var	customerOrder = entry.getValue();

								if(customerOrder != null) {
									var	branch	= cache.getGenericBranchDetailCache(request, customerOrder.getSourceBranchId());
									customerOrder.setSourceBranchName(branch.getName());
									customerOrder.setSourceSubRegionId(branch.getSubRegionId());
									customerOrder.setSourceSubRegionName(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

									branch	= cache.getGenericBranchDetailCache(request, customerOrder.getDestinationBranchId());
									customerOrder.setDestinationBranchName(branch.getName());
									customerOrder.setDestinationSubRegionId(branch.getSubRegionId());
									customerOrder.setDestinationSubRegionName(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
									customerOrder.setOrderByBranchName(cache.getGenericBranchDetailCache(request,customerOrder.getOrderByBranchId()).getName());
									customerOrder.setServiceDateStr(DateTimeUtility.getDateFromTimeStamp(customerOrder.getServiceDate()));
									customerOrder.setCreationDateStr(DateTimeUtility.getDateFromTimeStamp(customerOrder.getCreationDateTime()));
								}
							}

							request.setAttribute("custOrders", pendingCustomerOrders);
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

					request.setAttribute("nextPageToken","success");
				}
				case 3 -> {
					bll = new CustomerOrderBLL();
					inValObj = new ValueObject();
					inValObj.put("executive", executive);

					final var customerOrderId 	 	= JSPUtility.GetLong(request, "customerOrderId");
					final var wayBillId 			= JSPUtility.GetLong(request, "wayBillId", 0);
					final var sourceBranchId		= JSPUtility.GetLong(request, "sourceBranchId", 0);
					final var destinationBranchId 	= JSPUtility.GetLong(request, "destinationBranchId", 0);
					final var statusId 	 		 	= JSPUtility.GetShort(request, "statusId");
					final var wayBillNumber	 		= JSPUtility.GetString(request, "wayBillNumber");
					final var remark	 			= JSPUtility.GetString(request, "remark");

					final var	sourceSubregionId       = cache.getGenericBranchDetailCache(request, sourceBranchId).getSubRegionId();
					final var	destinationSubregionId  = cache.getGenericBranchDetailCache(request, destinationBranchId).getSubRegionId();
					var	wayBillIdFound = wayBillId;

					if(wayBillId == 0 && wayBillNumber.length() > 0){ //for first time way bill entry
						//Check if WayBill Exists
						wayBillIdFound = WayBillDao.getInstance().getWayBillIdBySourceAndDestination(wayBillNumber,executive.getAccountGroupId(),sourceSubregionId,destinationSubregionId);

						if(wayBillIdFound <= 0) {
							strResponse = "WayBill Number "+wayBillNumber+" does not exist or it is not booked as per the order details. Please try again.";
							request.setAttribute("message",strResponse);
							response.sendRedirect("Masters.do?pageId=233&eventId=5&customerOrderId="+customerOrderId+"&message="+strResponse);
							return;
						}

						inValObj.put("wayBillNumber", wayBillNumber);
					} else if(wayBillId > 0)
						inValObj.put("wayBillNumber", wayBillNumber);
					else if(wayBillId  == 0 && wayBillNumber.length() <= 0)
						inValObj.put("wayBillNumber", null);

					inValObj.put("wayBillId", wayBillIdFound);
					inValObj.put("remark", remark);
					inValObj.put("statusId", statusId);
					inValObj.put("customerOrderId", customerOrderId);

					outValObj = bll.updateOrder(inValObj);

					if (outValObj != null && outValObj.get("response") != null)
						strResponse = (String) outValObj.get("response");
					else
						strResponse = CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

					if(strResponse == null) strResponse = CargoErrorList.SYSTEM_ERROR_DESCRIPTION;

					request.setAttribute("message",strResponse);
					response.sendRedirect("Masters.do?pageId=233&eventId=5&updatedOrderId="+customerOrderId+"&message="+strResponse);
				}
				default -> {
					break;
				}
				}
			} else {
				error.put("errorCode", CargoErrorList.SESSION_INVALID);
				error.put("errorDescription", CargoErrorList.SESSION_INVALID_DESCRIPTION);
				request.setAttribute("error", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}

	private CustomerOrder setOrder(final HttpServletRequest request, final Executive executive ) throws Exception {
		final var order = new CustomerOrder();

		try {
			order.setAccountGroupId(executive.getAccountGroupId());
			var custName = JSPUtility.GetString(request, "customerName");

			if(StringUtils.contains(custName, "("))
				custName = StringUtils.substring(custName, 0, StringUtils.indexOf(custName, "(")-1);

			order.setCustomerName(StringUtils.upperCase(custName));
			order.setCustomerId(JSPUtility.GetLong(request, "customerId"));
			order.setCustomerTypeId(JSPUtility.GetShort(request, "customerTypeId"));
			order.setContactNumber(JSPUtility.GetString(request, "contactNumber"));
			order.setAddress(StringUtils.upperCase(JSPUtility.GetString(request, "address", "NA")));
			order.setMarketingPersonId(JSPUtility.GetLong(request, "marketingPersonId", 0));
			order.setMarketingPersonName(StringUtils.upperCase(JSPUtility.GetString(request, "marketingPersonName", "")));
			order.setMarketingPersonNumber(JSPUtility.GetString(request, "marketingPersonNumber",""));
			order.setContactPerson(StringUtils.upperCase(JSPUtility.GetString(request, "contactPerson", "NA")));

			if(request.getParameter("orderDate") != null)
				order.setServiceDate(DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "orderDate")));
			else
				order.setServiceDate(DateTimeUtility.getCurrentTimeStamp());

			order.setCreationDateTime(DateTimeUtility.getCurrentTimeStamp());
			order.setSourceBranchId(JSPUtility.GetLong(request, "sourceBranchId", 0));
			order.setDestinationBranchId(JSPUtility.GetLong(request, "destinationBranchId", 0));
			order.setTotalWeight(JSPUtility.GetDouble(request, "totalWeight", 0) * 1000);
			order.setStatusId(CustomerOrderStatusConstant.STATUS_ID_PENDING);
			order.setRemark(JSPUtility.GetString(request, "remark"));

			final var orderByBranchId = JSPUtility.GetLong(request, "orderByBranchId", 0);
			order.setOrderByBranchId(orderByBranchId > 0 ? orderByBranchId : executive.getBranchId());
			order.setOrderByExecutiveId(request.getParameter("orderByExecutive") != null ? JSPUtility.GetLong(request, "orderByExecutive") : executive.getExecutiveId());

			final var orderByExecutiveName = JSPUtility.GetString(request, "orderByExecutiveName");
			order.setOrderByExecutiveName(orderByExecutiveName != null && orderByExecutiveName.length() > 0 ? orderByExecutiveName : executive.getName());
			order.setExecutiveId(executive.getExecutiveId());
			order.setExecutiveName(executive.getName());
			order.setExecutiveBranchId(executive.getBranchId());
			order.setCustomerOrderNumber(0);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return order;
	}
}