import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaUser, FaEye, FaTimesCircle } from "react-icons/fa";

const API = "https://grocery-backend-3pow.onrender.com/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when searchTerm changes
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/auth/alluser`);
      setUsers(res.data);
      console.log(res.data);
      
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filterUsers = () => {
    const filtered = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Users</h1>
            <p className="text-gray-600 mt-1">Manage all registered users</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Avatar
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-green-600" />
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username || "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Drawer */}
        {isDrawerOpen && selectedUser && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-end z-50">
            <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                <button
                  onClick={closeDrawer}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <FaUser className="text-green-600 text-2xl" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.username}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1">
                    <strong>Updated:</strong>{" "}
                    {new Date(selectedUser.updatedAt).toLocaleDateString()}
                  </p>

                  {selectedUser.otp && (
                    <p className="mt-1">
                      <strong>OTP:</strong> {selectedUser.otp}
                    </p>
                  )}

                  {selectedUser.otpExpires && (
                    <p className="mt-1">
                      <strong>OTP Expires:</strong>{" "}
                      {new Date(selectedUser.otpExpires).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
