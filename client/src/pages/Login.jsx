import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios
        .post("http://localhost:3001/login", { email, password })
        .then((result) => {
            console.log(result);
            if (result.data.status === "success") {
                localStorage.setItem('userId', result.data.userId);
                // Store complete user data including avatar
                localStorage.setItem('userData', JSON.stringify({
                    ...result.data.user,
                    avatar: result.data.user.avatar || "/api/placeholder/200/200"
                }));
                navigate("/home");
                window.location.reload();
            } else {
                alert(result.data.message || "Invalid Password !!!");
            }
        })
        .catch((err) => {
            console.log(err);
            alert("Invalid Email");
        });
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-800 to-teal-900 text-gray-300 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        <div className="w-full bg-teal-800 shadow-lg rounded-lg overflow-hidden">
          <div className="flex justify-between items-center bg-gray-700 py-3 px-5">
            <h6 className="text-lg font-semibold">Log In</h6>
          </div>
          <div className="p-6">
            <h4 className="text-xl font-bold mb-4">Log In</h4>
            <div className="mb-4">
              <input
                type="email"
                className="w-full bg-gray-700 text-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-yellow-500"
                placeholder="Your Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                className="w-full bg-gray-700 text-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-yellow-500"
                placeholder="Your Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-yellow-500 text-gray-800 p-3 rounded hover:bg-yellow-400 transition"
            >
              Login
            </button>
            <div className="flex gap-2 mt-5">
              <p>Do not have an account?</p>
              <Link to={"/signup"}>
                <span className="text-blue-700 hover:underline">Sign up</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
