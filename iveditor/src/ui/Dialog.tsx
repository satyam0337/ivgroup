const Dialog = ({ children, onClose, id }: { children?: React.ReactNode, onClose?: () => void, id?: string }) => {
  return <div id={id}>
    <div className="fixed top-[15%] left-[50%] translate-x-[-50%] bg-white rounded-md p-4 z-[2]">
      {children}
    </div>
    <div onClick={onClose} className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-md z-[1]"></div>
  </div>
}
export default Dialog;