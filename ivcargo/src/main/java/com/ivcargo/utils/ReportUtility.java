package com.ivcargo.utils;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.Utility;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.Executive;

public class ReportUtility {
	private static final String TRACE_ID = "ReportUtility";

	public ReportUtility() {}

	public String getExecutiveByBranch(final String branchId, final String displaySuperAdmin) throws Exception {
		try {
			final var execu = ExecutiveDao.getInstance().findByBranchId(Utility.getLong(branchId));

			return getFilteredData(execu, displaySuperAdmin);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getActiveExecutiveByBranch(final String branchId, final String displaySuperAdmin) throws Exception {
		try {
			final var execu = ExecutiveDao.getInstance().getActiveExecutiveByBranchId(Utility.getLong(branchId));

			return getFilteredData(execu, displaySuperAdmin);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getFilteredData(final Executive[] execu, final String displaySuperAdmin) {
		final var	str		= new StringBuilder();

		try {
			if(execu != null) {
				final List<Executive>	exList		= Arrays.asList(execu);
				exList.sort(Comparator.comparing(Executive::getName));

				for (final Executive e : exList)
					if(!Utility.getBoolean(displaySuperAdmin) && Boolean.TRUE.equals(e.getIsSuperUser()))
						continue;
					else
						str.append(",").append(e.getName()).append("=").append(e.getExecutiveId());
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return str.toString();
	}
}