import React, { useEffect, useState } from 'react';
import apiClient from '../../config/apiClient';
import { Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import Swal from 'sweetalert2';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const fetchUsers = (url = '/user-details/') => {
    setLoading(true);
    apiClient
      .get(url)
      .then((res) => {
        const data = res.data.results || res.data;
        setUsers(data);
        setNextUrl(res.data.next || null);
        setPrevUrl(res.data.previous || null);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiClient.patch(`/users/${userId}/role/`, { role: newRole });
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'Role updated successfully'
      });
      fetchUsers(); // Re-fetch to get updated data
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to update role', 'error');
    }
    setActiveDropdown(null);
  };

  const filteredUsers = users.filter((u) => 
    (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'teacher': return 'bg-green-100 text-green-800 border-green-200';
      case 'school_admin': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'platform_admin': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500">Manage all registered users on the platform</p>
          </div>
          <div className="relative mt-4 md:mt-0 w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-3xl outline-none focus:border-custom-blue"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xs sm:shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-5 px-6 py-4 bg-gray-100 text-sm font-medium text-gray-600 border-b">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-gray-500 text-sm">Loading users...</div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <React.Fragment key={user.id}>
                {/* Desktop Row View */}
                <div
                  className="hidden md:grid md:grid-cols-5 items-center px-6 py-4 text-sm text-gray-700 border-b hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-custom-blue text-white flex items-center justify-center font-bold shrink-0 text-sm">
                      {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-800 block truncate">
                        {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                      </span>
                      <span className="text-xs text-gray-500 block truncate">@{user.username}</span>
                    </div>
                  </div>
                  
                  <span className="text-gray-600 truncate pr-4 text-xs sm:text-sm">{user.email}</span>
                  
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      {user.role ? user.role.replace('_', ' ') : 'student'}
                    </span>
                  </div>

                  <div>
                    <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{user.is_active ? 'Active' : 'Disabled'}</span>
                    </span>
                  </div>

                  <div className="relative text-right">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                      className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition min-w-[44px] min-h-[44px] inline-flex items-center justify-center cursor-pointer"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {activeDropdown === user.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveDropdown(null)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden text-left py-1">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                            Change Role
                          </div>
                          {['student', 'teacher', 'school_admin', 'platform_admin'].map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(user.id, role)}
                              disabled={user.role === role}
                              className={`block w-full text-left px-4 py-2.5 text-xs sm:text-sm min-h-[44px] cursor-pointer ${user.role === role ? 'bg-gray-50 text-custom-blue font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-custom-orange'}`}
                            >
                              {role.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Card Stack View */}
                <div className="block md:hidden p-4 border-b border-gray-200 bg-white hover:bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-full bg-custom-blue text-white flex items-center justify-center font-bold shrink-0 text-sm">
                        {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block text-sm truncate">
                          {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                        </span>
                        <span className="text-xs text-gray-500 block truncate">@{user.username}</span>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {activeDropdown === user.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden text-left py-1">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                              Change Role
                            </div>
                            {['student', 'teacher', 'school_admin', 'platform_admin'].map((role) => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(user.id, role)}
                                disabled={user.role === role}
                                className={`block w-full text-left px-4 py-2.5 text-xs min-h-[44px] cursor-pointer ${user.role === role ? 'bg-gray-50 text-custom-blue font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-custom-orange'}`}
                              >
                                {role.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 truncate bg-gray-50 px-3 py-1.5 rounded-lg">
                    {user.email}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      {user.role ? user.role.replace('_', ' ') : 'student'}
                    </span>
                    <span className={`inline-flex items-center space-x-1.5 font-semibold ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{user.is_active ? 'Active' : 'Disabled'}</span>
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-gray-500 text-sm">
              No users found matching your criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs sm:text-sm text-gray-500">
            Showing {filteredUsers.length} users
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchUsers(prevUrl)}
              disabled={!prevUrl || loading}
              className={`p-2.5 rounded-xl flex items-center justify-center border min-w-[44px] min-h-[44px] ${!prevUrl ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => fetchUsers(nextUrl)}
              disabled={!nextUrl || loading}
              className={`p-2.5 rounded-xl flex items-center justify-center border min-w-[44px] min-h-[44px] ${!nextUrl ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
