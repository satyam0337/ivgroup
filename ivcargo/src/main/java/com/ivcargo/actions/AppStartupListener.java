package com.ivcargo.actions;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.RegionBll;
import com.businesslogic.SubRegionBll;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.master.configuration.Configuration;
import com.iv.utils.dataObject.ValueObject;
import com.platform.dao.AccountGroupDao;
import com.platform.dao.BranchDao;
import com.platform.dao.CityDao;
import com.platform.dao.PackingTypeMasterDao;
import com.platform.dto.City;
import com.platform.dto.PackingTypeMaster;

public class AppStartupListener extends HttpServlet {

	private static final long serialVersionUID = 1L;

	@Override
	public void init() throws ServletException {
		try {
			System.out.println("Initializing application startup listener...");
			final var context = getServletContext();
			context.setAttribute("branches", BranchDao.getInstance().getAllBranches());
			context.setAttribute("subRegions", SubRegionBll.getInstance().getAllSubRegions());
			context.setAttribute("regions", RegionBll.getInstance().getAllRegions());
			context.setAttribute("accountGroupHM", AccountGroupDao.getInstance().getAllAccountGroup());

			final var packingTypeMasterResult = PackingTypeMasterDao.getInstance().findAll();
			final var packingTypeMaster       = new ValueObject();

			for (final PackingTypeMaster ptm : packingTypeMasterResult)
				if(StringUtils.isNotEmpty(ptm.getName()))
					packingTypeMaster.put(Long.toString(ptm.getPackingTypeMasterId()), ptm);

			context.setAttribute("packingTypeMaster", packingTypeMaster);

			//City Result
			final var cityResult = CityDao.getInstance().findAll();
			final var city       = new ValueObject();

			for (final City element : cityResult)
				city.put(Long.toString(element.getCityId()), element);

			context.setAttribute("city", city);
			context.setAttribute(Configuration.CONFIGURATION, ReadAllConfigurationsBllImpl.getInstance().getConfigurationFromDB());

			System.out.println("Application startup listener initialized successfully.");
		} catch (final Exception e) {
			e.printStackTrace();
			throw new ServletException("❌ Failed to cache branches at startup", e);
		}
	}

}
