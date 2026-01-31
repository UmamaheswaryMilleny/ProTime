import { Routes, Route } from "react-router-dom";
import { ClientRouter } from "./ClientRouter";

import { AdminRouter } from "./AdminRouter";


export const AppRouter = () => {
  return (
    <Routes>
      {/* Client Routes */}
      {/* "*" means:Match everything under this path */}
      <Route path="/*" element={<ClientRouter />} />


      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRouter />} />


    </Routes>
  );
};
