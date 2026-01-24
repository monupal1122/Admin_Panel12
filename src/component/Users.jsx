import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaSearch, 
  FaUser, 
  FaEye, 
  FaTimes,
  FaEnvelope,
  FaCalendar,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaUserCircle
} from "react-icons/fa";


const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
console.log("Profiles state:", profiles);
console.log("Selected Profile state:", selectedProfile);
  useEffect(() => {
    fetchUsers();
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/auth/alluser`);
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await axios.get(`${API}/profile/all`);
       console.log("Fetched profiles:", res.data);
      setProfiles(res.data);
      console.log("Fetched profiles:", res.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
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

  const viewUserProfile = async (user) => {
    setLoading(true);
    setSelectedUser(user);
    
    // Find the profile for this user
    const userProfile = profiles.find(profile => profile.userId === user._id || profile.userId?._id === user._id);
    setSelectedProfile(userProfile);
    
    setIsModalOpen(true);
    setLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSelectedProfile(null);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Users Management
            </h1>
            <p className="text-gray-600 mt-2">View and manage all registered users</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-sm font-semibold text-gray-700">
              Total Users: <span className="text-purple-600">{users.length}</span>
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-8 border border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Avatar
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                        <FaUser className="text-white text-lg" />
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.username || "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-600 flex items-center">
                        <FaCalendar className="mr-2 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewUserProfile(user)}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                        title="View Profile"
                      >
                        <FaUserCircle className="text-lg" />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-12 text-gray-500"
                    >
                      <FaUser className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-lg font-semibold">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-3xl z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <FaUserCircle className="mr-3 text-3xl" />
                    User Profile
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  {/* Profile Image & Basic Info */}
                  <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200">
                    {selectedProfile?.profileImage ? (
                      <img
                        src={selectedProfile.profileImage}
                        alt={selectedUser?.username}
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-xl mb-4"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-purple-200 shadow-xl mb-4">
                        <FaUser className="text-white text-5xl" />
                      </div>
                    )}
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedUser?.username}
                    </h3>
                    <p className="text-gray-600 flex items-center justify-center">
                      <FaEnvelope className="mr-2" />
                      {selectedUser?.email}
                    </p>
                  </div>

                  {/* Profile Details */}
                  {selectedProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center mb-2">
                          <FaPhone className="text-purple-600 mr-3" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Phone</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">
                          {selectedProfile.phoneNumber || "Not provided"}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center mb-2">
                          <FaCalendar className="text-green-800 mr-3" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Date of Birth</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">
                          {selectedProfile.dateOfBirth 
                            ? new Date(selectedProfile.dateOfBirth).toLocaleDateString() 
                            : "Not provided"}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 shadow-sm md:col-span-2">
                        <div className="flex items-center mb-2">
                          <FaMapMarkerAlt className="text-green-800 mr-3" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Address</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">
                          {selectedProfile.address || "Not provided"}
                        </p>
                      </div>

                      {selectedProfile.bio && (
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 shadow-sm md:col-span-2">
                          <div className="flex items-center mb-2">
                            <FaIdCard className="text-green-800 mr-3" />
                            <span className="text-xs font-semibold text-gray-500 uppercase">Bio</span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {selectedProfile.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaUserCircle className="mx-auto text-6xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-semibold">No profile information available</p>
                      <p className="text-gray-400 text-sm mt-2">This user hasn't completed their profile yet.</p>
                    </div>
                  )}

                  {/* Account Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Account Created</p>
                        <p className="text-gray-900 font-semibold">
                          {new Date(selectedUser?.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Last Updated</p>
                        <p className="text-gray-900 font-semibold">
                          {new Date(selectedUser?.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}