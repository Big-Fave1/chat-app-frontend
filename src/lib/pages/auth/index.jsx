import { useState } from "react";
import logo from "@/assets/logo.png"
import peace from "@/assets/peace.png"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import {toast} from "sonner";
import {apiClient} from "@/lib/api-client.js";
import { LOGIN_ROUTES, SIGNUP_ROUTES } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/index.js"


function Auth() {
    const navigate = useNavigate()
    const {setUserInfo}= useAppStore()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const validateLogin = () => {
  
  if (!email.length) {
    toast.error("Email is required");
    return false;
  }
  if (!password.length) {
    toast.error("Password is required.");
    return false;
  }
  return true;
};

const validateSignup = () => {
   if (!phoneNumber.length) {
    toast.error("Phone Number is required");
    return false;
  }
  if (!email.length) {
    toast.error("Email is required");
    return false;
  }
  if (!password.length) {
    toast.error("Password is required.");
    return false;
  }
  if (password !== confirmPassword) {
    toast.error("Password and confirm password should be a match");
    return false;
  }
  return true;
};

const handleLogin = async () => {
  if (validateLogin()) {
    try {
      const response = await apiClient.post(LOGIN_ROUTES, { email, password }, { withCredentials: true });
      if (response.data.user.id) {
        setUserInfo({ ...response.data.user, _id: response.data.user.id });
        setEmail("");
        setPassword("");
        if (response.data.user.profileSetup) navigate("/chat");
        else navigate("/profile");
      }
      console.log({ response });
      alert("Done");
    } catch (error) {
      toast.error(error.response?.data || "Login failed");
    }
  }
};

const handleSignup = async () => {
  if (validateSignup()) {
    try {
      const response = await apiClient.post(SIGNUP_ROUTES, { email, password }, { withCredentials: true });
      console.log({ response });
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      alert("Done");
      if (response.status === 201) {
        setUserInfo({ ...response.data.user, _id: response.data.user.id });
        navigate("/profile");
      }
    } catch (error) {
      toast.error(error.response?.data || "Signup failed");
    }
  }
};



  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] w-[80vw] bg-white border-2 border-gray-300 shadow-2xl flex items-center justify-center text-black text-opacity-90 md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <img src={logo} alt="background login" className="h-20 mb-4" />
            <div className="flex items-center justify-center flex-col">
                <div className="flex items-center justify-center">
                    <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
                    <img src={peace} alt="peace emoji" className="h-[50px] ms-4" />
                </div>
                <p className="font-medium text-center text-sm md:text-base lg:text-lg  mt-2">Fill in the details to get started with the best chat app!</p>
            </div>
            <div className="flex items-center justify-center w-full">

               <Tabs defaultValue="login" className="w-3/4">
  <TabsList className="bg-transparent rounded-none w-full flex justify-center mb-4">

    <TabsTrigger value="login" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300">Login</TabsTrigger>

    <TabsTrigger value="signup" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300">Signup</TabsTrigger>
  </TabsList>
  <div className="flex gap-8 w-full">
    <TabsContent className="flex flex-col gap-5 items-center w-full" value="login">

      <input  placeholder="Email" type="email" className="w-full rounded-full p-2 border-2 " value={email} onChange={e=>setEmail(e.target.value)}/>

      <input  placeholder="Password" type="password" className="w-full rounded-full p-2 border-2" value={password} onChange={e=>setPassword(e.target.value)}/>

      <Button className="rounded-full p-6 self-center" onClick={handleLogin}>Login</Button>
    </TabsContent>
    <TabsContent className="flex flex-col gap-5 items-center w-full" value="signup">

      <Input  placeholder="Phone Number" type="phone" className="w-full rounded-full p-2 border-2" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)}/>

      <Input  placeholder="Email" type="email" className="w-full rounded-full p-2 border-2" value={email} onChange={e=>setEmail(e.target.value)}/>

      <Input  placeholder="Password" type="password" className="w-full rounded-full p-2 border-2" value={password} onChange={e=>setPassword(e.target.value)}/>

      <Input  placeholder="Confirm Password" type="password" className="w-full rounded-full p-2 border-2" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/>

      <Button className="rounded-full p-6 self-center" onClick={handleSignup}>Signup</Button>
    </TabsContent>
  </div>
</Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
