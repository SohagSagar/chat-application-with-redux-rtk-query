import { useSelector } from "react-redux"


export const useAuth = () =>{
    const {accessToken,user} =useSelector(state=>state.auth);
    const isLoggedIn =  accessToken && user ? true : false
     return isLoggedIn;
}