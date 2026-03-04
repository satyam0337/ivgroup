package com.ivcargo.filter;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import com.iv.utils.utility.EncryptDecryptUtility;

public class DecryptedRequestWrapper extends HttpServletRequestWrapper {

	private final Map<String, String[]> modifiedParams = new HashMap<>();

	public DecryptedRequestWrapper(HttpServletRequest request) {
		super(request);

		request.getParameterMap().forEach((key, values) -> {
			if (values != null && values.length == 1)
				modifiedParams.put(key, new String[]{EncryptDecryptUtility.decrypt(values[0])});
			else
				modifiedParams.put(key, values);
		});
	}

	@Override
	public String getParameter(String name) {
		final var values = modifiedParams.get(name);
		return values != null ? values[0] : super.getParameter(name);
	}

	@Override
	public Map<String, String[]> getParameterMap() {
		return modifiedParams;
	}

	@Override
	public String[] getParameterValues(String name) {
		return modifiedParams.get(name);
	}
}
