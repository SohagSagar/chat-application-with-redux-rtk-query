import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../../assets/images/lws-logo-dark.svg";
import { userLoggedOut } from "../../features/auth/authSlice";

export default function Navigation() {
    const dispatch=useDispatch();
    const navigate=useNavigate()
    const handleLogout =()=>{
        navigate('/')
        localStorage.clear()
        dispatch(userLoggedOut())
    }
    return (
        <nav className="border-general sticky top-0 z-40 border-b bg-violet-700 transition-colors">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/">
                        <img
                            className="h-10"
                            src={logoImage}
                            alt="Learn with Sumit"
                        />
                    </Link>
                    <ul onClick={handleLogout}>
                        <li className="text-white cursor-pointer">
                            Logout
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
