package com.ivcargo.actions.webservice;

import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import com.framework.Action;
import com.iv.convertor.JsonConvertor;
import com.iv.httpclient.HttpUrlConnectionUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.Message;
import com.iv.utils.message.MessageList;
import com.iv.utils.message.MessageUtility;
import com.iv.utils.request.ClientAddress;
import com.iv.utils.utility.Utility;
import com.iv.utils.webService.WSUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.b2c.ClientInfo;
import com.platform.dto.Executive;
import com.platform.utils.TokenGenerator;

/**
 * Initialize the module
 */
public class SessionValidationForWSAction implements Action {
	public static final String TRACE_ID = SessionValidationForWSAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> error = null;
		PrintWriter out = null;
		var isReadFile = false;
		var bypassSession = false;
		var accountGroupId = 0L;
		String fileName = null;
		String tokenValue = null;
		String tokenKey = null;

		try {
			final var webserviceURL = request.getParameter("webserviceURL");

			if (!ServletFileUpload.isMultipartContent(request) || Constant.TRUE.equals(request.getParameter("isReadExcelFile"))) {

				// 🔹 Step 2: Legacy flow (existing logic, untouched)
				final var strIn = new StringBuilder();
				final var parameterNames = request.getParameterNames();

				if (parameterNames != null)
					while (parameterNames.hasMoreElements()) {
						final var paramName = parameterNames.nextElement();
						strIn.append(paramName).append("=");
						final var paramValues = request.getParameterValues(paramName);

						for (final String paramValue : paramValues) {
							strIn.append(URLEncoder.encode(paramValue, Constant.UTF8_ENCODING)).append("&");

							if ("readFile".equals(paramName) && Constant.TRUE.equals(paramValue))
								isReadFile = true;

							if ("bypassSession".equals(paramName) && Constant.TRUE.equals(paramValue))
								bypassSession = true;

							if (Constant.ACCOUNT_GROUP_ID.equals(paramName) && !"".equals(paramValue))
								accountGroupId = Long.parseLong(paramValue);

							if (TokenGenerator.TOKEN_VALUE.equals(paramName))
								tokenValue = paramValue;

							if (TokenGenerator.TOKEN_KEY.equals(paramName))
								tokenKey = paramValue;
						}
					}

				if (!bypassSession) {
					error = ActionStaticUtil.getSystemErrorColl(request);

					if (ActionStaticUtil.isSystemError(request, error))
						return;
				}

				final var executive = (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

				if (isReadFile) {
					final var uploadFileAction = new UploadFileAction();
					uploadFileAction.execute(request, response);
					fileName = (String) request.getAttribute(Constant.FILE_NAME);
				}

				if (bypassSession)
					strIn.append("&accountGroupId=").append(accountGroupId);
				else {
					if (webserviceURL != null) {
						var parameterValues = strIn.toString();

						if (Utility.decodeUrl(parameterValues).contains(webserviceURL))
							parameterValues = Utility.decodeUrl(parameterValues)
							.replace("pageId=314&eventId=3&webserviceURL=" + webserviceURL, "");

						ClientInfo.getClientInfoForWS(request, executive, webserviceURL + parameterValues);
					}

					strIn.append("&accountGroupId=").append(executive.getAccountGroupId());
					strIn.append("&serverIdentifier=").append(executive.getServerIdentifier());
					strIn.append("&branchId=").append(executive.getBranchId());
					strIn.append("&executiveId=").append(executive.getExecutiveId());
					strIn.append("&executiveType=").append(executive.getExecutiveType());
					strIn.append("&CountryId=").append(executive.getCountryId());
					strIn.append("&fileName=").append(fileName);
					strIn.append("&").append(Constant.IV_CARGO_URL).append("=").append(ClientAddress.getWebsiteURL(request));
					strIn.append("&").append(Constant.IS_ACTIVE_TCE_GROUP).append("=").append(request.getSession().getServletContext().getAttribute(Constant.IS_ACTIVE_TCE_GROUP + "_" + executive.getAccountGroupId()));
					strIn.append("&").append(Constant.IS_ACTIVE_TCE_BRANCH).append("=").append(request.getSession().getServletContext().getAttribute(Constant.IS_ACTIVE_TCE_BRANCH + "_" + executive.getBranchId()));
				}

				strIn.append("&").append(Constant.IP_ADDRESS).append("=").append(ClientAddress.getClientIPAddress(request));

				out = response.getWriter();

				if (tokenValue != null) {
					if (tokenValue.equals(request.getSession().getAttribute(tokenKey))) {
						request.getSession().setAttribute(tokenKey, null);
						sendRequest(request, strIn, out, webserviceURL);
					} else {
						final var strOut = new StringBuilder();
						strOut.append(JsonConvertor.toJsonStringFromMap(MessageUtility.setErrorMessage(MessageList.REQUEST_ALREADY_SUBMITTED)));
						out.println(strOut);
						out.flush();
					}
				} else
					sendRequest(request, strIn, out, webserviceURL);
			} else {
				String feedbackDataJson = null;
				final List<FileItem> uploadedFiles = new ArrayList<>();

				final var factory = new DiskFileItemFactory();
				final var upload = new ServletFileUpload(factory);
				final var items = upload.parseRequest(request);

				for (final FileItem item : items)
					if (item.isFormField()) {
						if ("feedbackData".equals(item.getFieldName()))
							feedbackDataJson = item.getString("UTF-8");
					} else if ("files".equals(item.getFieldName()))
						uploadedFiles.add(item);

				// 🔹 Step 1: Forward multipart data to Spring Web Service
				try (var httpClient = HttpClients.createDefault()) {
					final var post = new HttpPost(webserviceURL);
					final var builder = MultipartEntityBuilder.create();

					builder.addTextBody("feedbackData", feedbackDataJson == null ? "" : feedbackDataJson, ContentType.TEXT_PLAIN);

					for (final FileItem fileItem : uploadedFiles) {
						final var fileNameOnly = Paths.get(fileItem.getName()).getFileName().toString();
						// Try to determine actual MIME type using servlet context
						var contentType = fileItem.getContentType();

						// Fallback: if contentType is null or empty, detect from file extension
						if (contentType == null || contentType.isBlank())
							contentType = Files.probeContentType(Paths.get(fileNameOnly));

						// Fallback to binary if still unknown
						if (contentType == null || contentType.isBlank())
							contentType = ContentType.DEFAULT_BINARY.getMimeType();

						builder.addBinaryBody(
								"files",
								fileItem.getInputStream(),
								ContentType.create(contentType),
								fileNameOnly
								);
						// builder.addBinaryBody("files", fileItem.getInputStream(), ContentType.DEFAULT_BINARY, fileNameOnly);
					}

					post.setEntity(builder.build());

					final var wsResponse = httpClient.execute(post);

					final var wsResponseString = EntityUtils.toString(wsResponse.getEntity());
					wsResponse.close();

					// callFeedbackService(serviceUrl, feedbackDataJson, null);

					response.setContentType("application/json");
					response.getWriter().write(wsResponseString);
					response.getWriter().flush();
				}
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if (out != null)
				out.close();
		}
	}

	private void sendRequest(final HttpServletRequest request, final StringBuilder strIn, final PrintWriter out, final String webserviceURL) throws Exception {
		try {
			final var	wsObject = HttpUrlConnectionUtility.callApiService(webserviceURL, strIn.toString());

			final var	strOut 	= new StringBuilder();

			if (wsObject.containsKey(Message.MESSAGE))
				strOut.append(JsonConvertor.toJsonStringFromMap(wsObject));
			else {
				final var wsObject1	= (String) wsObject.get(WSUtility.WEB_SERVICE_RESULT);

				final var jsonObject = JsonConvertor.getJSONObject(wsObject1);

				if(jsonObject.has(TokenGenerator.TOKEN_KEY))
					request.getSession().setAttribute(jsonObject.optString(TokenGenerator.TOKEN_KEY, ""), jsonObject.optString(TokenGenerator.TOKEN_VALUE, ""));

				strOut.append(wsObject1);
			}

			out.println(strOut);
			out.flush();
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}