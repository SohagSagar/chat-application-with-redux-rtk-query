import { useEffect } from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "../features/auth/authSlice";

export const useAuthCheck = () => {
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const dispatch = useDispatch();


    useEffect(() => {
        const localAuth = localStorage.getItem('auth');
        if (localAuth) {
            const auth = JSON.parse(localAuth);
            dispatch(userLoggedIn({
                accessToken: auth?.accessToken,
                user: auth?.user
            }))

        }
        setIsAuthChecked(true)
    }, [])


    return isAuthChecked;
}