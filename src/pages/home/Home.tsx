import { useAuth } from "../../context/AuthContext.tsx";

const Home = () => {
  const { user } = useAuth();
  return (
    <div className={"w-full"}>
      <div>Hello, {user?.name}</div>
    </div>
  );
};

export default Home;
