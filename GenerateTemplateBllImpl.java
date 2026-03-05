package com.iv.bll.impl.lrtemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.iv.bll.GenerateTemplateBll;
import com.iv.cache.CacheData;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.FolderLocationPropertiesConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.MessageUtility;
import com.iv.utils.utility.Utility;

@Service
public class GenerateTemplateBllImpl implements GenerateTemplateBll {
	private static final String TRACE_ID	 = GenerateTemplateBllImpl.class.getName();

	private @Autowired  CacheData					cacheData;

	@Override
	public Map<Object, Object> writeFile(final Map<Object, Object> allRequestParams) throws Exception {
		try {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, allRequestParams);
			// temp	// -- /tomcat/cargo_tomcat/temp/0-ivcargo/
			// tomcat	// -- /tomcat/cargo_tomcat/webapps/ivcargo
			// /ivcargo/template/lrprint/lrprint_813.html Devansh code

			final var folderConfigurationObj		= cacheData.getConfigurationData(ModuleIdentifierConstant.FOLDER_LOCATION, 0);
			final var ivcargoPathToMatch			= (String) folderConfigurationObj.getOrDefault(Constant.IVCARGO_PATH_TO_MATCH, "");

			final var originalfilePath		= (String) allRequestParams.get("filePath");
			// final var content				= (String) allRequestParams.get("content");
			var   filePath					= "";

			if (originalfilePath.startsWith(ivcargoPathToMatch))
				filePath = originalfilePath.substring(ivcargoPathToMatch.length());

			//final var tomcatFolderPath	= (String) folderConfigurationObj.get(Constant.TOMCAT_FOLDER_PATH);
			//final var websiteTempPath 	= (String) folderConfigurationObj.get(FolderLocationPropertiesConstant.WEBSITE_REAL_PATH);  // e.g., /tomcat/cargo_tomcat/webapps/ivcargo
			// when running locally: comment uper part uncomment below part 
			final var websiteTempPath	= "/home/babua/BaBua/Space2/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/ivcargo/";
			final var tomcatFolderPath	= "/home/babua/BaBua/Space2/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/ivcargo/";

			final var fullTempPath		= websiteTempPath + filePath;
			final var fullTomcatPath	= tomcatFolderPath + filePath;

			final var multipartFile = (MultipartFile) allRequestParams.get("file");
			Files.copy(multipartFile.getInputStream(), Path.of(fullTempPath), StandardCopyOption.REPLACE_EXISTING);
			Files.copy(multipartFile.getInputStream(), Path.of(fullTomcatPath), StandardCopyOption.REPLACE_EXISTING);

			return new HashMap<>();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@Override
	public Map<Object, Object> publishTemplate(final Map<Object, Object> allRequestParams) throws Exception {
		try {
			final var lrTemplateConfig 				= cacheData.getConfigurationData(ModuleIdentifierConstant.GIT_REPOSITOTY, 0);
			final var folderConfigurationObj		= cacheData.getConfigurationData(ModuleIdentifierConstant.FOLDER_LOCATION, 0);
			final var executiveData					= cacheData.getExecutiveById(Utility.getLong(allRequestParams, Constant.EXECUTIVE_ID));
			//final var gitRepositoryDirectory		= (String) lrTemplateConfig.getOrDefault(Constant.GIT_REPOSITORY_DIRECTORY, "");
			// when running locally: comment uper part uncomment below part 
			final var gitRepositoryDirectory 		= System.getProperty("user.home") + "/BaBua/Space2/ivworkspace";
			final var gitRemoteUrlWithCreds			= (String) lrTemplateConfig.getOrDefault(Constant.GIT_REMOTE_URL_WITH_CREDENTIALS, "");
			final var gitBranch						= (String) lrTemplateConfig.getOrDefault(Constant.GIT_BRANCH, "");
			final var workSpacePath					= (String) folderConfigurationObj.getOrDefault(Constant.WORKSPACE_PATH, "");
			final var ivcargoPathToMatch			= (String) folderConfigurationObj.getOrDefault(Constant.IVCARGO_PATH_TO_MATCH, "");

			//final var websiteTempPath 				= (String) folderConfigurationObj.get(FolderLocationPropertiesConstant.WEBSITE_REAL_PATH);  // e.g., /tomcat/cargo_tomcat/webapps/ivcargo
			// when running locally: comment uper part uncomment below part 
			final var websiteTempPath	= "/home/babua/BaBua/Space2/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/ivcargo/";

			final var sourceFilePath 				= (String) allRequestParams.get("filePath");
			final List<String> addedFiles 			= new ArrayList<>();
			final var sourcePathArray				= sourceFilePath.split(",");

			final var currentBranch = executeShellCommand("cd " + gitRepositoryDirectory + " && git branch --show-current").trim();

			if (!currentBranch.equalsIgnoreCase(gitBranch))
				throw new Exception("On branch " + currentBranch + " instead of " + gitBranch);

			executeShellCommand("cd " + gitRepositoryDirectory + " && git pull " + gitRemoteUrlWithCreds + " " + gitBranch);
			var	path = "";

			for (String originalfilePath : sourcePathArray)
				if (originalfilePath != null && !originalfilePath.trim().isEmpty()) {
					originalfilePath = originalfilePath.trim();

					if (originalfilePath.startsWith(ivcargoPathToMatch))
						path = originalfilePath.substring(ivcargoPathToMatch.length());
					else
						path = originalfilePath;

					final var source = Paths.get(websiteTempPath + path.trim());

					if (!Files.exists(source))
						return MessageUtility.setErrorMessage("File not found: " + source);

					final var destination = Paths.get(gitRepositoryDirectory, workSpacePath + path.trim());

					Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
					addedFiles.add(workSpacePath + path.trim());
				}

			if (addedFiles.isEmpty())
				return MessageUtility.setErrorMessage("No files to process.");

			final var filesToAdd = String.join(" ", addedFiles);

			executeShellCommand("cd " + gitRepositoryDirectory + " && git add " + filesToAdd);
			executeShellCommand("cd " + gitRepositoryDirectory + " && git pull " + gitRemoteUrlWithCreds + " " + gitBranch);

			final var commitMessage = "iveditor-autocommit: by " + (executiveData != null ? executiveData.getExecutiveName() : "system") + " add " + String.join(", ", addedFiles);

			final var pushCommand = String.join(" && ",
					"cd " + gitRepositoryDirectory,
					"git commit -m \"" + commitMessage + "\"",
					"git push " + gitRemoteUrlWithCreds + " " + gitBranch
					);

			executeShellCommand(pushCommand);

			return new HashMap<>();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// Shell execution helper
	private String executeShellCommand(final String command) throws Exception {
		final var pb = new ProcessBuilder("sh", "-c", command);
		pb.redirectErrorStream(true);
		final var process = pb.start();
		final var stdout = new StringBuilder("");

		try (var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
			String line;

			while ((line = reader.readLine()) != null)
				stdout.append(line).append("\n");
		}

		final var exitCode = process.waitFor();

		if (exitCode != 0)
			throw new Exception("Got non-zero exit code for " + command);

		return stdout.toString();
	}
}
