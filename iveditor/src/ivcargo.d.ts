export const getAccountGroups: () => Promise<{ code: string, name: string, id: number }[]>
export const writeFile: (path: string, content: string | Blob | File) => Promise<void>
export const gitPushFiles: (paths: string[]) => Promise<void>
export const showLoadingOverlay: () => void
export const hideLoadingOverlay: () => void
export const showToast: (type: "success" | "error", message: string) => void
export const QRCode:
  new (element: HTMLElement, options: { height?: number, width?: number }) => {
    makeCode: (text: string) => void
  }