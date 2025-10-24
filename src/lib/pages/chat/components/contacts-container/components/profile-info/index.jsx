import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store/index.js";
import {IoPowerSharp} from "react-icons/io5"
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { LOGOUT_ROUTES } from "@/utils/constants";

const ProfileInfo = () => {
    const { userInfo, setUserInfo } = useAppStore();
    const navigate = useNavigate();


    const logOut = async () => {
      try {
        const response = await apiClient.post(LOGOUT_ROUTES,{},{withCredentials:true})
        if(response.status===200){
          setUserInfo(undefined);
          navigate("/auth");
        }
      }catch(error){
        console.log({error})
      }
    }

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33] text-white">
     <div className="flex gap-3 items-center justify-center">

     <div className="w-12 h-12 relative">

    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
  <AvatarImage
    src={userInfo.image}
    alt="Profile"
    className="object-cover w-full h-full bg-black"
  />
  <AvatarFallback className={`uppercase text-lg border-[1px] flex items-center justify-center ${getColor(userInfo.color)}`}>
    {userInfo.firstName ? userInfo.firstName[0] : userInfo.email[0]}
  </AvatarFallback>
</Avatar>
        </div>

        <div>
          {
            userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : ""
          }
        </div>
     </div>
     <div className="flex gap-5">
      <Tooltip>
        <TooltipTrigger>
          <FiEdit2 className ="text-purple-500 text-xl font-medium "
          onClick={()=>navigate("/profile")}/>
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
          <p>Edit Profile</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <IoPowerSharp className ="text-red-500 text-xl font-medium "
          onClick={logOut}/>
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
          <p>Logout</p>
        </TooltipContent>
      </Tooltip>

     </div>
    </div>
  )
}

export default ProfileInfo
