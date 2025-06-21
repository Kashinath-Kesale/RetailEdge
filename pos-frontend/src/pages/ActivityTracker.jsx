import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { 
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ActivityTracker = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/activity');
      
      if (response.data.success) {
        // Filter to only show CRUD operations
        const filteredActivities = (response.data.activities || []).filter(activity => {
          const action = activity.action;
          return (
            // CRUD Operations
            action === 'CREATE_PRODUCT' ||
            action === 'UPDATE_PRODUCT' ||
            action === 'DELETE_PRODUCT' ||
            action === 'CREATE_SALE' ||
            action === 'CREATE_USER' ||
            action === 'UPDATE_USER' ||
            // User Activities
            action === 'PASSWORD_CHANGE'
          );
        });
        
        setActivities(filteredActivities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE_PRODUCT':
      case 'CREATE_SALE':
      case 'CREATE_USER':
        return 'text-green-600 bg-green-100';
      case 'UPDATE_PRODUCT':
      case 'UPDATE_USER':
      case 'PASSWORD_CHANGE':
        return 'text-blue-600 bg-blue-100';
      case 'DELETE_PRODUCT':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE_PRODUCT':
      case 'CREATE_SALE':
      case 'CREATE_USER':
        return '➕';
      case 'UPDATE_PRODUCT':
      case 'UPDATE_USER':
      case 'PASSWORD_CHANGE':
        return '✏️';
      case 'DELETE_PRODUCT':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const formatAction = (action) => {
    const actionMap = {
      'CREATE_PRODUCT': 'Created Product',
      'UPDATE_PRODUCT': 'Updated Product',
      'DELETE_PRODUCT': 'Deleted Product',
      'CREATE_SALE': 'Created Sale',
      'CREATE_USER': 'Created User',
      'UPDATE_USER': 'Updated Profile',
      'PASSWORD_CHANGE': 'Changed Password'
    };
    return actionMap[action] || action.replace(/_/g, ' ');
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl xs:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiActivity className="text-[var(--retailedge-primary)]" />
              Activity Tracker
            </h2>
            <p className="text-xs xs:text-sm text-gray-600 mt-1">
              Monitor CRUD operations and user activities
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current user role: <span className="font-medium">{userRole}</span>
            </p>
          </div>
          <button
            onClick={fetchActivities}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Activity Logs</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activities found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {moment(activity.createdAt).format("MMM D, YYYY h:mm A")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-gray-500">({activity.user?.role || 'Unknown'})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getActionIcon(activity.action)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                            {formatAction(activity.action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {activity.details || 'No details'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'SUCCESS' 
                            ? 'text-green-600 bg-green-100' 
                            : activity.status === 'FAILED'
                            ? 'text-red-600 bg-red-100'
                            : 'text-gray-600 bg-gray-100'
                        }`}>
                          {activity.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker; 