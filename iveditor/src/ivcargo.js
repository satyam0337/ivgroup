/* eslint-disable */

import { nanoid } from "nanoid"

export const getAccountGroups = async () => {
  let response = await new Promise(resolve => getJSON(
    {},
    WEB_SERVICE_URL + '/configurationWS/getConfigurationElement.do',
    resolve,
    EXECUTE_WITHOUT_ERROR
  ))
  
  return response.accountGroupList.map(g => 
    ({ code: g.accountGroupCode, name: g.accountGroupName, id: g.accountGroupId })
  )
}

let getSetCompanyLogos = () => window.setCompanyLogos
export const setCompanyLogos = accountGroupId => {
  getSetCompanyLogos()(accountGroupId)
}

export const writeFile = async (path, contentOrBlobOrFile) => {
  let data = new FormData()
  let extension = path.split(".").pop();
  data.set("filePath", path)
  data.set(
    "file",
    typeof contentOrBlobOrFile === "string" || (contentOrBlobOrFile instanceof Blob)
      ? new File(
        [contentOrBlobOrFile],
        nanoid() + "." + extension,
        {
          type:
            extension === "html" ? "text/html" :
            extension === "jpg" ? "image/jpeg" :
            extension === "png" ? "image/png" :
            extension === "gif" ? "image/gif" :
            undefined,
          lastModified: new Date().valueOf()
        }
      )
      : contentOrBlobOrFile
  )

  await fetch("/ivwebservices/generateTemplateWS/writeFile.do", {
    method: "POST",
    credentials: "include",
    body: data
  })
  .then(r => {
    if (!r.ok) {
      hideLoadingOverlay()
      showToast("error", `Something went wrong (got status ${r.status} from writeFile)`)
      throw r
    }
  })
}

export const gitPushFiles = async (paths) => {
  await new Promise(resolve => getJSON(
    { filePath: paths.join(",") },
    WEB_SERVICE_URL + '/generateTemplateWS/pushTemplate.do',
    resolve,
    EXECUTE_WITHOUT_ERROR
  ))
}

export const showLoadingOverlay = () => {
  window.showLayer()
}

export const hideLoadingOverlay = () => {
  window.hideLayer()
}

export const showToast = (type, message) => {
  window.showMessage(type, message)
}

export const QRCode = window.QRCode