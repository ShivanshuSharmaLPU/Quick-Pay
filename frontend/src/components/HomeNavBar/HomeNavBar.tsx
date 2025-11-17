import React from "react";
import { useAppSelector, useAppDispatch } from "../../store/hook.tsx";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

interface HomeNavbarProps {
  isExpanded: boolean;
}

const HomeNavbar: React.FC<HomeNavbarProps> = ({ isExpanded }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div
      className={`flex justify-between items-center p-5 shadow-md bg-blue-800 ${
        isExpanded ? "pl-72" : "pl-20"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-semibold text-white">
          Welcome, {user?.firstName ? user.firstName : "Guest"}!
        </h1>
        <p className="text-sm text-gray-200">{new Date().toDateString()}</p>
      </div>
      <div className="flex items-center gap-6">
        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
          Dark Mode
        </button>
        <button
          onClick={() => {
            dispatch(logout());
            navigate("/Signin");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomeNavbar;
