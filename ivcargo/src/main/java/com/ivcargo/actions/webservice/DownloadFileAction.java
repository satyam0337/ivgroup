/**
 *
 */
package com.ivcargo.actions.webservice;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;

import javax.activation.MimetypesFileTypeMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.readexcel.ReadExcel;
import com.iv.utils.constant.Constant;
import com.iv.utils.file.FileUtility;

/**
 * @author Anant 16-04-2019
 *
 */
public class DownloadFileAction implements Action {

	public static final String TRACE_ID = DownloadFileAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		String					fileName				= null;
		String 					filePath				= null;
		File					fileToDownload			= null;

		try {
			fileName		= request.getParameter(Constant.FILE_NAME);
			filePath		= request.getParameter(Constant.FILE_PATH);

			if(fileName == null)
				fileName	= (String) request.getAttribute(Constant.FILE_NAME);

			if(filePath == null)
				filePath	= ReadExcel.UPLOAD_DIRECTORY + File.separator+ fileName;

			fileToDownload	= new File(filePath);

			if(fileName == null)
				fileName	= fileToDownload.getName();

			final InputStream in = new FileInputStream(fileToDownload);

			// Gets MIME type of the file
			String mimeType = new MimetypesFileTypeMap().getContentType(fileName);

			if (mimeType == null)
				mimeType = "application/octet-stream";

			response.setContentType(mimeType);
			response.setContentLength((int) fileToDownload.length());

			// Forces download
			final String headerKey = "Content-Disposition";
			final String headerValue = String.format("attachment; filename=\"%s\"", fileName);
			response.setHeader(headerKey, headerValue);

			// obtains response's output stream
			final OutputStream outStream = response.getOutputStream();

			final byte[] buffer = new byte[4096];
			int bytesRead = -1;

			while ((bytesRead = in.read(buffer)) != -1)
				outStream.write(buffer, 0, bytesRead);

			outStream.flush();
			in.close();
			outStream.close();

			FileUtility.deleteFile(filePath);
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}
}
