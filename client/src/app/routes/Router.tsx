import * as React from "react";
import {  Route, createBrowserRouter,createRoutesFromElements,RouterProvider} from "react-router-dom";
//import ProtectedRoute from "./ProtectedRoute";
import Errorpage from "../../pages/ErrorPage";
import Default from "../../pages/Default";
import Login from "@/pages/Login";
import Homepage from "@/pages/Homepage";
import MultiFileUploader from "@/pages/MultiFileUploader";
import FolderMatchUploader from "@/components/filecompare/folder_match_uploader";
import TTSPage from "@/pages/TTSPage";
import FakeBank from "@/pages/FakeBank";
import DataProcessor from "@/pages/DataProcessor";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<Errorpage />}>
      {/* Public Route */}
   
      {/* Dev Test Pages */}
      
      {/* Protected Routes */}
      <Route element={<Default />}>
        <Route index element={<Homepage />} />
        <Route path="upload" element={<MultiFileUploader />} />
        <Route path="folder-compare" element={<FolderMatchUploader />} />
        <Route path="tts" element={<TTSPage />} />
        <Route path="bank" element={<FakeBank />} />
        <Route path="data" element={<DataProcessor />} />
      </Route>
    </Route>
  )
);

  const AppRouter: React.FC = () => {
    return (
      <RouterProvider router={router} />
    )
  }
  export default AppRouter;