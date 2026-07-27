import { useState, useContext } from 'react';
import { Link } from "react-router";
import { X, Menu } from 'lucide-react';
import UserContext from '../Context/UserContext';


function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <div className="antialiased rounded-full flex justify-center z-20">
      <div className={`fixed top-10 w-5/6 mx-auto text-black bg-custom-blue shadow-2xl ${open ? '' : 'rounded-full'
        } z-50 backdrop-blur`}>

        <div className="flex flex-col max-w-screen-xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8 z-50">
          <div className="flex flex-row items-center justify-between py-4">
            <a className="text-3xl font-bold text-white rounded-3xl focus:outline-none focus:shadow-outline">
              VizLearn<span className='text-2xl  text-custom-orange'>.</span>
            </a>
            <button
              className="rounded-3xl md:hidden focus:outline-none focus:shadow-outline"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className='w-8 h-8 text-custom-yellow' /> : <Menu className='w-8 h-8 text-custom-yellow' />}
            </button>
          </div>
          <nav className={`flex-col flex-grow ${open ? 'flex' : 'hidden'} pb-4 md:pb-0 md:flex md:justify-end md:flex-row`}>
            {/* <a
              className="px-3 py-2 mx-2 text-sm bg-transparent text-white rounded-3xl hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
              href="#"
            >
              About us
            </a> */}
            <Link to={
                !user ? "/login" : 
                user.role === "teacher" ? "/teacher" : 
                user.role === "school_admin" ? "/school" : 
                user.role === "platform_admin" ? "/admin-dashboard" : 
                "/student"
              }
              className="px-3 py-2 mx-2 text-sm bg-transparent text-white rounded-3xl hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
            >
              Dashboard
            </Link>
            {/* <Link
              to="/contact"
              className="px-3 py-2 mx-2 text-sm bg-transparent text-white rounded-3xl hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
            >
             Contact us
            </Link> */}
            {user ? (
              <Link
                to="/student/user"
                className="px-4 py-2 mx-2 text-sm md:my-0 my-2 w-fit bg-custom-orange text-white rounded-3xl hover:text-black focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
              >
                Profile
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 mx-2 text-sm md:my-0 my-2 w-fit bg-custom-orange text-white rounded-3xl hover:text-black focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 mx-2 text-sm md:my-0 my-2 w-fit bg-custom-orange text-white rounded-3xl hover:text-black focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                >
                  Sign Up
                </Link>
              </>


            )}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
