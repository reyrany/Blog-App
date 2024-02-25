import { useContext, useEffect } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "../../components/authForm/authForm";
import { AuthContext } from "../../context/Authentication";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const redirect = useNavigate();
  const { isAuth } = useContext(AuthContext);
  useEffect(() => {
    if (searchParams.get("mode") !== ("login" || "signup")) {
      redirect("/auth?mode=signup");
    }
    if (isAuth) {
      redirect("/");
    }
  }, [searchParams, redirect, isAuth]);

  return (
    <div className="h-[100vh] w-full flex flex-col items-center justify-center bg-bak bg-cover">
      <AuthForm />
    </div>
  );
};
export default Auth;

export async function action({ request }) {
  const params = new URL(request.url).searchParams;
  const mode = params.get("mode") || "login";

  const data = await request.formData();
  const authData = {
    username: data.get("username"),
    email: data.get("email"),
    password: data.get("password"),
  };

  const response = await fetch(import.meta.env.VITE_AUTH + mode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authData),
  });
  const resData = await response.json();
  if (
    response.status === 400 ||
    response.status === 401 ||
    response.status === 404
  ) {
    return resData;
  }
  if (!response.ok) {
    return { message: "Could not authenticate user." };
  }
  if ("authToken" in resData) {
    localStorage.setItem("authToken", resData.authToken);
  } else {
    return redirect("/auth?mode=login");
  }
  return resData;
}
