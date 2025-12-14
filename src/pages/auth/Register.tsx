import AuthForm from "../../components/auth/AuthForm.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

const Register = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center ">
      {!user ? (
        <AuthForm mode="register" />
      ) : (
        <h1 className="mt-4">You are logged in as {user.email}</h1>
      )}
    </div>
  );
};

export default Register;
