
import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  logout
} from "../redux/authSlice";

import {
  toggleLanguage
} from "../redux/languageSlice";

import {
  translations
} from "../i18n/translations";

import {
  Languages,
  LogOut
} from "lucide-react";

export default function Navbar() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user =
    useSelector(
      (state) => state.auth.user
    );

  const language =
    useSelector(
      (state) =>
        state.language.current
    );

  const t =
    translations[language];


  const handleLogout = () => {

    dispatch(logout());

    navigate("/login");

  };


  return (
    <header className="bg-white border-b">

      {/* Government strip */}

      <div className="bg-slate-100">

        <div className="max-w-7xl mx-auto px-4 py-2 text-xs text-slate-600 flex justify-between">

          <span>
            Government of India
          </span>

          <span>
            भारत सरकार
          </span>

        </div>

      </div>


      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >

          <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
            AF
          </div>

          <div>

            <h1 className="font-bold text-lg">
              AGRI-FLOW
            </h1>

            <p className="text-xs text-slate-500">
              Smart Procurement
            </p>

          </div>

        </Link>


        {/* Navigation */}

        <div className="hidden md:flex items-center gap-5 text-sm">

          {/* Home */}

          <Link to="/">
            {t.home}
          </Link>


          {/* Farmer Navigation */}

          {user && user.role === "farmer" && (
            <>

              <Link to="/dashboard">
                {t.dashboard}
              </Link>

              <Link to="/book-slot">
                {t.bookSlot}
              </Link>

              <Link to="/queue">
                {t.queue}
              </Link>

              <Link to="/procurement">
                {t.procurement}
              </Link>

              <Link to="/payments">
                {t.payment}
              </Link>
              
               


            </>
          )}


          {/* Admin Navigation */}

          {user && user.role === "admin" && (
            <>

              <Link to="/admin/dashboard">
                Admin Dashboard
              </Link>

              <Link to="/admin/centres">
              Centre Management
              </Link>

              <Link to="/admin/queue">
                Admin Queue
              </Link>

              <Link to="/admin/procurement">
                Procurement
              </Link>

              <Link to="/admin/payments">
                  Payments
              </Link>
              

            </>
          )}

        </div>


        {/* Right side */}

        <div className="flex items-center gap-2">

          {/* Language */}

          <button
            onClick={() =>
              dispatch(
                toggleLanguage()
              )
            }
            className="border rounded px-3 py-2 text-sm flex items-center gap-2"
          >

            <Languages size={16} />

            {language === "hi"
              ? "English"
              : "हिन्दी"}

          </button>


          {/* Login / Logout */}

          {user ? (

            <button
              onClick={handleLogout}
              className="bg-slate-800 text-white rounded px-3 py-2 text-sm flex items-center gap-2"
            >

              <LogOut size={15} />

              {t.logout}

            </button>

          ) : (

            <Link
              to="/login"
              className="bg-green-700 text-white rounded px-4 py-2 text-sm"
            >
              {t.login}
            </Link>

          )}

        </div>

      </nav>

    </header>
  );
}

