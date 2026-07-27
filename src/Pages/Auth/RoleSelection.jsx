import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { BookOpen, Users, GraduationCap, Loader2 } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import BASE_URL from '../../config';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { token, login, needsRoleSelection, user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated or already has a role, redirect appropriately
    if (!token) {
      navigate('/login');
    } else if (user && user.role) {
      if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'school_admin') navigate('/school');
      else if (user.role === 'platform_admin') navigate('/admin-dashboard');
      else navigate('/student');
    }
  }, [token, user, navigate]);

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Learn, take quizzes, and track your progress in science.',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Create classes, assign coursework, and monitor student performance.',
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-500'
    },
    {
      id: 'school_admin',
      title: 'School Administrator',
      description: 'Manage school structure, teachers, students, and subscriptions.',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500'
    }
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(
        `${BASE_URL}/users/select-role/`,
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token.access}`
          }
        }
      );

      if (response.status === 200) {
        const newTokens = response.data;
        const newRole = login(newTokens); // Update context with new tokens and role

        // Redirect based on selected role
        if (newRole === 'teacher') {
          navigate('/teacher');
        } else if (newRole === 'school_admin') {
          navigate('/school');
        } else {
          // Both student and fallback redirect to student dashboard
          navigate('/onboarding');
        }
      }
    } catch (err) {
      console.error('Failed to select role:', err);
      setError(err.response?.data?.error || 'An error occurred while setting your role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to VLearn!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            How are you planning to use the platform?
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                  isSelected 
                    ? `${role.borderColor} shadow-lg bg-white ring-2 ring-offset-2 ring-${role.borderColor.split('-')[1]}-500` 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg ${role.bgColor}`}>
                  <Icon className={`h-8 w-8 ${role.color}`} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{role.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{role.description}</p>
                
                {isSelected && (
                  <div className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center ${role.bgColor}`}>
                    <div className={`h-3 w-3 rounded-full ${role.color.replace('text', 'bg')}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isSubmitting}
            className={`px-8 py-3 rounded-full text-white font-medium text-lg flex items-center shadow-lg transition-all
              ${!selectedRole || isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1'
              }`}
          >
            {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
