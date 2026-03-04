/**
 *
 */
package com.ivcargo.actions.webservice;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.framework.Action;
import com.iv.bll.impl.photoandsignatureservice.FolderLocationBllImpl;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant 20-03-2019
 *
 */
public class UploadFileAction implements Action {

	private static final String TRACE_ID	= UploadFileAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 							= null;
		Executive						executive						= null;
		Map<Object, Object>				folderConfigurationObj			= null;
		String							folderLocation					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			executive = (Executive) request.getSession().getAttribute("executive");
			if(ServletFileUpload.isMultipartContent(request))
				try {
					folderConfigurationObj 		= new FolderLocationBllImpl().getFolderLocationProeprties();
					folderLocation				= (String)folderConfigurationObj.getOrDefault(Constant.FILE_PATH_DIRECTORY + "_" + executive.getServerIdentifier(), "");
					
					final List<FileItem> multiparts = new ServletFileUpload(new DiskFileItemFactory()).parseRequest(request);

					for(final FileItem item : multiparts)
						if(!item.isFormField()) {
							String name 	= new File(item.getName()).getName();
							final File uploadPath = new File(folderLocation + File.separator + "");

							if (!uploadPath.exists())
								uploadPath.mkdir();
							final String currDate 	= new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss_SSS").format(new Date());
							name = currDate +"_"+name;
							request.setAttribute("fileName", name);

							final File savedFile = new File(uploadPath.getAbsolutePath() + File.separator + name);

							final FileOutputStream fos = new FileOutputStream(savedFile);

							final InputStream is = item.getInputStream();
							int x = 0;
							final byte[] b = new byte[1024];

							while ((x = is.read(b)) != -1)
								fos.write(b, 0, x);

							fos.flush();

							fos.close();
							is.close();
						}
				} catch (final Exception e) {
					e.printStackTrace();
					LogWriter.writeLog(TRACE_ID,CargoErrorList.SYSTEM_ERROR , new Exception());
					error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
					error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
		} catch (final Exception e) {
			// TODO: handle exception
		}
	}

}
