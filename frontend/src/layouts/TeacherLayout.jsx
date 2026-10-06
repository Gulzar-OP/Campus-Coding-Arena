import {
  Outlet,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";

const TeacherLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fc]">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;