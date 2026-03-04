package com.ivcargo.actions.intercepter;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.Message;
import com.iv.utils.request.UserAgentHelper;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

@WebFilter(filterName = "RateLimitFilter")
public class RateLimitFilter implements Filter {

	private final Map<String, Map<String, Boolean>> methodExecutionMap = new ConcurrentHashMap<>();

	@Override
	public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
		final var httpRequest = (HttpServletRequest) request;
		final var httpResponse = (HttpServletResponse) response;
		final var session = httpRequest.getSession();

		final var executive = (Executive) session.getAttribute("executive");

		if (executive == null) {
			chain.doFilter(request, response);
			return;
		}

		final var	cacheManip =  new CacheManip(httpRequest);
		final var	userAgentHelper	= new UserAgentHelper(httpRequest);

		final var fullURL	= userAgentHelper.getFullURL();

		final var methodKey	= decodeUrl(fullURL);

		var needRateLimit = false;

		try {
			final var methodDetails	= cacheManip.getConfiguration(httpRequest, executive.getAccountGroupId(), ModuleIdentifierConstant.RATE_LIMIT);

			needRateLimit = StringUtils.contains(methodKey, "webserviceURL") && StringUtils.contains(methodKey, "ivwebservices") && methodDetails.containsValue(methodKey.split("ivwebservices")[1])
					|| !StringUtils.contains(methodKey, "webserviceURL") && methodDetails.containsValue(methodKey.split("/ivcargo/")[1]);
		} catch (final Exception e) {
			e.printStackTrace();
			ExceptionProcess.execute(e, RateLimitFilter.class.getName());
		}

		if(needRateLimit) {
			methodExecutionMap.putIfAbsent(Long.toString(executive.getExecutiveId()), new ConcurrentHashMap<>());
			final var userMethodExecutionMap = methodExecutionMap.get(Long.toString(executive.getExecutiveId()));

			synchronized (userMethodExecutionMap) {
				if (Boolean.TRUE.equals(userMethodExecutionMap.getOrDefault(methodKey, false))) {
					sendRateLimitExceededResponse(httpResponse, methodKey);
					return;
				}

				userMethodExecutionMap.put(methodKey, true);
			}

			try {
				chain.doFilter(request, response);
			} finally {
				userMethodExecutionMap.put(methodKey, false);
			}
		} else
			chain.doFilter(request, response);
	}

	private void sendRateLimitExceededResponse(final HttpServletResponse response, final String methodKey) throws IOException {
		response.setContentType("application/json");
		response.setStatus(200);

		if(StringUtils.contains(methodKey, "webserviceURL") || StringUtils.contains(methodKey, "ivwebservices")) {
			final var	message	= new JSONObject();
			final var	messageFinal	= new JSONObject();
			message.put("typeName", "error");
			message.put("description", "Request For Same Report Is Already Processing, Please Try After Completing Ongoing Request!");
			message.put("typeSymble", Message.MESSAGE_TYPE_ERROR_SYMBLE);
			messageFinal.put("message", message);
			response.getWriter().write(messageFinal.toString());
		} else
			response.sendRedirect("Failure.do?pageId=0&eventId=1&filter=23");

	}

	public static String decodeUrl(final String encodedUrl) {
		try {
			// Decode the entire URL
			var decodedUrl = URLDecoder.decode(encodedUrl, "UTF-8");

			// Use regex to find and decode JSON parts separately
			final var jsonPattern = Pattern.compile("json=\\{.*?\\}");
			final var matcher = jsonPattern.matcher(decodedUrl);

			if (matcher.find()) {
				final var jsonPart = matcher.group();
				final var decodedJsonPart = URLDecoder.decode(jsonPart, "UTF-8");
				decodedUrl = decodedUrl.replace(jsonPart, decodedJsonPart);
			}

			return decodedUrl;
		} catch (final UnsupportedEncodingException e) {
			e.printStackTrace();
			return encodedUrl;
		}
	}

	@Override
	public void init(final FilterConfig filterConfig) throws ServletException {
		// Initialization code if needed
	}

	@Override
	public void destroy() {
		// Cleanup code if needed
	}
}
