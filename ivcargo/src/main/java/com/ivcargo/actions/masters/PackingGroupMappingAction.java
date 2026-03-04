package com.ivcargo.actions.masters;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.iv.utils.exception.ExceptionProcess;
import com.platform.dao.PackingGroupMappingDao;
import com.platform.dto.Executive;
import com.platform.dto.PackingGroupMapping;

public class PackingGroupMappingAction implements Action {
	public static final String TRACE_ID = "PackingGroupMappingAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		try {
			final var	executive 		= (Executive) request.getSession().getAttribute("executive");

			if(executive != null)   {
				final var removelist = request.getParameter("removelist");
				final var packingGroupTypeId  = request.getParameter("packingGroupTypeId");
				final var selectionlist   = request.getParameterValues("rightside");
				final var removelistArr = removelist.split(";");
				var i = 0;
				var j = 0;
				final var packingGroupMapping = new PackingGroupMapping[selectionlist.length + removelistArr.length];

				for(i = 0; i < selectionlist.length; i++)
					if(!StringUtils.contains(selectionlist[i], "N_")) {
						packingGroupMapping[i] = new PackingGroupMapping();
						packingGroupMapping[i].setPackingTypeMasterId(Long.parseLong(selectionlist[i]));
						packingGroupMapping[i].setPackingGroupTypeId(Long.parseLong(packingGroupTypeId));
						packingGroupMapping[i].setAccountGroupId(executive.getAccountGroupId());
						packingGroupMapping[i].setCreatedBy(executive.getExecutiveId());
						packingGroupMapping[i].setModifiedBy(executive.getExecutiveId());
						packingGroupMapping[i].setMFD(false);
					}

				if(removelistArr.length > 0 && !"".equals(removelistArr[0]))
					for(;i < selectionlist.length + removelistArr.length; i++, j++) {
						final var packingTypeStr	= removelistArr[j].replace("N_", "").replace("D_", "");

						if(StringUtils.isNotEmpty(packingTypeStr)) {
							packingGroupMapping[i] = new PackingGroupMapping();
							packingGroupMapping[i].setPackingTypeMasterId(Long.parseLong(packingTypeStr));
							packingGroupMapping[i].setPackingGroupTypeId(Long.parseLong(packingGroupTypeId));
							packingGroupMapping[i].setAccountGroupId(executive.getAccountGroupId());
							packingGroupMapping[i].setModifiedBy(executive.getExecutiveId());
							packingGroupMapping[i].setMFD(true);
						}
					}

				final var	message = PackingGroupMappingDao.getInstance().update(packingGroupMapping);

				response.sendRedirect("Master.do?pageId=308&eventId=1&message="+message);
			} else
				request.setAttribute("nextPageToken", "needlogin");
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
