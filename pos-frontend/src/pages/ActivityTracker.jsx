import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasFetchedRef = useRef(false);

  // Check if user has permission to view activities
  const hasPermission = userRole === 'admin';

  const fetchActivities = useCallback(async () => {
    if (loading) return; // Prevent duplicate requests
    
    console.log('🔍 ActivityTracker - Starting to fetch activities');
    console.log('🔍 ActivityTracker - User role:', userRole);
    console.log('🔍 ActivityTracker - Has permission:', hasPermission);
    
    if (!hasPermission) {
      console.log('🔍 ActivityTracker - User does not have permission to view activities');
      toast.error('Access denied. Only administrators can view activity logs.');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 ActivityTracker - Making API request to /api/activity');
      const response = await axiosInstance.get('/api/activity');
      console.log('🔍 ActivityTracker - API response:', response.data);
      
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
            action === 'DELETE_SALE' ||
            action === 'CREATE_PAYMENT' ||
            action === 'DELETE_PAYMENT' ||
            action === 'CREATE_USER' ||
            action === 'UPDATE_USER' ||
            action === 'DELETE_USER' ||
            // User Activities
            action === 'LOGIN' ||
            action === 'LOGOUT' ||
            action === 'PASSWORD_CHANGE'
          );
        });
        
        console.log('🔍 ActivityTracker - Filtered activities:', filteredActivities);
        setActivities(filteredActivities);
      } else {
        console.log('🔍 ActivityTracker - API response not successful:', response.data);
      }
    } catch (error) {
      console.error('🔍 ActivityTracker - Error fetching activities:', error);
      console.error('🔍 ActivityTracker - Error response:', error.response?.data);
      console.error('🔍 ActivityTracker - Error status:', error.response?.status);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [loading, hasPermission, userRole]); // Include all dependencies

  const handleRefresh = useCallback(() => {
    hasFetchedRef.current = false;
    fetchActivities();
  }, [fetchActivities]); // Only depend on fetchActivities

  useEffect(() => {
    // Only fetch activities if user has permission and hasn't fetched yet
    if (hasPermission && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchActivities();
    }
  }, [fetchActivities, hasPermission]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE_PRODUCT':
      case 'CREATE_SALE':
      case 'CREATE_USER':
      case 'CREATE_PAYMENT':
        return 'text-green-600 bg-green-100';
      case 'UPDATE_PRODUCT':
      case 'UPDATE_USER':
      case 'PASSWORD_CHANGE':
        return 'text-blue-600 bg-blue-100';
      case 'DELETE_PRODUCT':
      case 'DELETE_SALE':
      case 'DELETE_PAYMENT':
      case 'DELETE_USER':
        return 'text-red-600 bg-red-100';
      case 'LOGIN':
      case 'LOGOUT':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE_PRODUCT':
      case 'CREATE_SALE':
      case 'CREATE_USER':
      case 'CREATE_PAYMENT':
        return '➕';
      case 'UPDATE_PRODUCT':
      case 'UPDATE_USER':
      case 'PASSWORD_CHANGE':
        return '✏️';
      case 'DELETE_PRODUCT':
      case 'DELETE_SALE':
      case 'DELETE_PAYMENT':
      case 'DELETE_USER':
        return '🗑️';
      case 'LOGIN':
        return '🔑';
      case 'LOGOUT':
        return '🚪';
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
      'DELETE_SALE': 'Deleted Sale',
      'CREATE_PAYMENT': 'Created Payment',
      'DELETE_PAYMENT': 'Deleted Payment',
      'CREATE_USER': 'Created User',
      'UPDATE_USER': 'Updated Profile',
      'DELETE_USER': 'Deleted User',
      'LOGIN': 'Logged In',
      'LOGOUT': 'Logged Out',
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
          {hasPermission && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          )}
        </div>

        {/* Permission Check */}
        {!hasPermission ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h3>
              <p className="text-gray-600 mb-4">
                You don't have permission to view activity logs.
              </p>
              <p className="text-sm text-gray-500">
                Only administrators can access the activity tracker.
              </p>
            </div>
          </div>
        ) : (
          /* Activities Table */
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
        )}
      </div>
    </div>
  );
};

export default ActivityTracker; 