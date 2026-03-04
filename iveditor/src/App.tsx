import React, { useContext, useEffect, useState } from "react"
import { createStore, Store } from "./store";
import { observer } from "mobx-react";
import Document from "./Document";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import DataSearch from "./DataSearch";

const App = observer(() => {
  let store = useState(() => createStore())[0]

  useEffect(() => {
    if (
      !window.location.protocol.startsWith("https") &&
      window.location.hostname !== "localhost"
    ) {
      alert("Please log in to https website instead of http to be able to use all features")
    }
  }, [])

  return <StoreContext.Provider value={store}>
    <Toolbar/>
    <div className="flex w-screen overflow-auto">
      <div className="p-4 flex-1">
        <Document/>
      </div>
      <Sidebar/>
    </div>
    <DataSearch/>
  </StoreContext.Provider>
})
export default App

export const StoreContext =
  React.createContext<Store>(undefined as unknown as Store)

export const useStore =
  () => useContext(StoreContext)