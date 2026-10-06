import {
  Outlet,
} from "react-router-dom";

import StudentSidebar from "../components/StudentSidebar";

const StudentLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fc]">
      <StudentSidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;