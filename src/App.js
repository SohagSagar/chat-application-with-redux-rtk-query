import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { useAuthCheck } from "./hooks/useAuthCheck";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
    const isAuthChecked = useAuthCheck();




    return !isAuthChecked ? (<div>Cheaking authentication...</div>) : (
        <Router>
            <Routes>
                {/* public routes */}
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* private routes */}
                <Route path="/inbox" element={<PrivateRoute><Conversation /></PrivateRoute>} />
                <Route path="/inbox/:id" element={<PrivateRoute><Inbox /></PrivateRoute>} />


            </Routes >
        </Router >
    )


}

export default App;
