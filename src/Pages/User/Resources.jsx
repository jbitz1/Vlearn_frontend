import React, { useEffect, useState } from 'react';
import { FileText, ExternalLink, Clock, Star } from 'lucide-react';
import axios from 'axios';
import BASE_URL from '../../config';
import BackButton from '../../Components/Common/BackButton';

const courses = [
  {
    id: 1,
    title: "Advanced Mathematics",
    description: "Covers calculus, linear algebra, and differential equations",
    progress: 65,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
    duration: "8 weeks",
    rating: 4.8
  },
  {
    id: 2,
    title: "Physics Fundamentals",
    description: "Learn mechanics, thermodynamics, and wave motion",
    progress: 30,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800",
    duration: "6 weeks",
    rating: 4.5
  },
  {
    id: 3,
    title: "Chemistry Lab",
    description: "Hands-on experiments and chemical reactions",
    progress: 85,
    image: "https://images.unsplash.com/photo-1532634993-15f421e42ec0?auto=format&fit=crop&q=80&w=800",
    duration: "10 weeks",
    rating: 4.9
  }
];

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch resources from backend
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/files/`);
        setResources(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handlePreview = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-4">
        <BackButton to="/student" label="Back to Dashboard" />
      </div>
      {/* Resources Section */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Concept Maps and Diagrams</h2>
          {/* <div className="w-full sm:w-auto flex justify-end">
            <input
              type="search"
              placeholder="Search resources..."
              className="px-4 py-2 border border-gray-300 rounded-3xl w-full sm:w-64"
            />
          </div> */}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No resources available</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {resources.map((resource) => (
                <li key={resource.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                      <div className="bg-blue-100 p-3 rounded-3xl">
                        <FileText className="h-6 w-6 text-custom-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-custom-orange truncate">{resource.name}</h3>
                        <p className='text-sm  leading-normal text-black max-w-4xl'>{resource.description}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-custom-blue">
                          {/* <span>{resource.category || 'Uncategorized'}</span> */}
                          {/* <span>•</span> */}
                          <span>{resource.file_type?.toUpperCase() || 'PDF'}</span>
                          {resource.size && (
                            <>
                              <span>•</span>
                              <span>{(resource.size / (1024 * 1024)).toFixed(1)} MB</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                      {resource.downloads && (
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {resource.downloads.toLocaleString()} downloads
                        </span>
                      )}
                      <button
                        onClick={() => handlePreview(resource.file_url)}
                        className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-3xl text-white bg-custom-blue hover:bg-custom-orange transition-colors whitespace-nowrap"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View PDF
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Courses Section */}
      {/* <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Link
            to="/dashboard/home"
            className="bg-custom-blue text-white px-4 py-2 rounded-3xl hover:bg-custom-orange transition-colors whitespace-nowrap text-center"
          >
            Browse All Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center text-yellow-500 text-sm">
                    <Star className="h-4 w-4 mr-1" fill="currentColor" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-custom-blue h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <button className="w-full bg-custom-blue text-white px-4 py-2 rounded-3xl hover:bg-custom-orange transition-colors">
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
}

export default Resources;