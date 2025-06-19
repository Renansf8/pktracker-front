import { BrowserRouter, Route, Routes } from "react-router";
import { SignIn } from "../pages/signin";
import { SignUp } from "../pages/signup";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
};
