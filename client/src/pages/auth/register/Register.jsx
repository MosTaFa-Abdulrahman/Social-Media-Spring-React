import "./register.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { makeRequest } from "../../../requestMethod";

function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !inputs.username.trim() ||
      !inputs.fullName.trim() ||
      !inputs.email.trim() ||
      !inputs.password.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      await makeRequest.post("/auth/register", inputs);
      toast.success("Registerd Success 😊");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Darsh Elbasha.</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero cum,
            alias totam numquam ipsa exercitationem dignissimos, error nam,
            consequatur.
          </p>
          <span>Do you have an account?</span>
          <Link to="/auth/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>

          <form>
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Name"
              name="fullName"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            <button disabled={isLoading} onClick={handleRegister}>
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
