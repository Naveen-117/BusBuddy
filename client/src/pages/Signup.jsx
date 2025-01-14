import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import bcryptjs from "bcryptjs";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [id, setid] = useState("");
  const [phone, setphone] = useState("");
  const hashedPassword = bcryptjs.hashSync(password, 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/register", {
        name,
        email,
        password: hashedPassword,
        id,
        phone,
      })
      .then((result) => {
        console.log("Success");
        alert("User Created!");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-lg p-6">
        <h4 className="text-xl font-bold mb-4">Sign Up</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              className="w-full bg-gray-700 text-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-yellow-500"
              placeholder="Your Full Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              className="w-full bg-gray-700 text-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-yellow-500"
              placeholder="Your ID"
              onChange={(e) => setid(e.target.value)}
            />
          </div>
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
              type="number"
              className="w-full bg-gray-700 text-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-yellow-500"
              placeholder="Phone"
              onChange={(e) => setphone(e.target.value)}
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
            type="submit"
            className="w-full bg-yellow-500 text-gray-800 p-3 rounded hover:bg-yellow-400 transition"
          >
            Submit
          </button>
          <div className="flex gap-2 mt-5">
            <p>Already have an account?</p>
            <Link to={"/"}>
              <span className="text-blue-700 hover:underline">Log in</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
