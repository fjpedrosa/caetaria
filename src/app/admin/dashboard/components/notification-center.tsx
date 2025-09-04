/**
 * Notification Center Component
 *
 * Centralized notification management with real-time updates,
 * filtering, and delivery status tracking.
 */

'use client';

import React, { useMemo,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Download,
  Eye,
  EyeOff,
  Filter,
  Info,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Settings,
  Trash2,
  User,
  X} from 'lucide-react';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { Input } from '@/modules/shared/presentation/components/ui/input';
import { Select } from '@/modules/shared/presentation/components/ui/select';
import { Tabs } from '@/modules/shared/presentation/components/ui/tabs';

interface Notification {
  id: string | number;
  type: 'lead' | 'analytics' | 'system' | 'onboarding' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  delivery_status?: 'sent' | 'delivered' | 'failed' | 'pending';
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

interface Props {
  notifications: Notification[];
  onMarkAsRead: (id: string | number) => void;
  onClearAll: () => void;
}

const notificationIcons = {
  lead: User,
  analytics: MessageSquare,
  system: Settings,
  onboarding: CheckCircle,
  error: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-yellow-100 text-yellow-800',
  urgent: 'bg-red-100 text-red-800',
};

const typeColors = {
  lead: 'bg-purple-100 text-purple-800',
  analytics: 'bg-blue-100 text-blue-800',
  system: 'bg-orange-100 text-orange-800',
  onboarding: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-gray-100 text-gray-800',
  success: 'bg-emerald-100 text-emerald-800',
};

export const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string | number>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system'>('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Search filter
      if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && notification.type !== typeFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
        return false;
      }

      // Read status filter
      if (readFilter === 'read' && !notification.read) return false;
      if (readFilter === 'unread' && notification.read) return false;

      // Tab filter
      if (activeTab === 'unread' && notification.read) return false;
      if (activeTab === 'system' && notification.type !== 'system') return false;

      return true;
    });
  }, [notifications, searchTerm, typeFilter, priorityFilter, readFilter, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const urgent = notifications.filter(n => n.priority === 'urgent').length;
    const systemErrors = notifications.filter(n => n.type === 'error').length;

    return { total, unread, urgent, systemErrors };
  }, [notifications]);

  const handleSelectNotification = (id: string | number, selected: boolean) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      if (!notifications.find(n => n.id === id)?.read) {
        onMarkAsRead(id);
      }
    });
    setSelectedNotifications(new Set());
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
          <p className="text-gray-600 mt-1">
            {stats.total} total notifications • {stats.unread} unread
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedNotifications.size > 0 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkMarkAsRead}
              >
                Mark as Read ({selectedNotifications.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedNotifications(new Set())}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>

          <Button size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EyeOff className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.systemErrors}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <option value="all">All Types</option>
              <option value="lead">Leads</option>
              <option value="analytics">Analytics</option>
              <option value="system">System</option>
              <option value="onboarding">Onboarding</option>
              <option value="error">Errors</option>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>

            <Select value={readFilter} onValueChange={setReadFilter}>
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'All Notifications', count: stats.total },
            { id: 'unread', label: 'Unread', count: stats.unread },
            { id: 'system', label: 'System Alerts', count: stats.systemErrors },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || readFilter !== 'all'
                  ? 'No notifications match your current filters.'
                  : 'You\'re all caught up! New notifications will appear here.'}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <Card
                    className={`p-4 transition-all duration-200 hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                    } ${selectedNotifications.has(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                        className="mt-1 rounded border-gray-300"
                      />

                      <div className={`p-2 rounded-lg ${typeColors[notification.type]} flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Badge className={priorityColors[notification.priority]}>
                              {notification.priority}
                            </Badge>
                            {notification.delivery_status && (
                              <Badge
                                variant={
                                  notification.delivery_status === 'delivered' ? 'default' :
                                  notification.delivery_status === 'failed' ? 'destructive' : 'secondary'
                                }
                              >
                                {notification.delivery_status}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            {notification.category && (
                              <>
                                <span>•</span>
                                <span>{notification.category}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {notification.actions?.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant={action.variant || 'outline'}
                                onClick={action.action}
                              >
                                {action.label}
                              </Button>
                            ))}

                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions Bar */}
      {selectedNotifications.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="p-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedNotifications.size} notifications selected
              </span>
              <Button size="sm" onClick={handleBulkMarkAsRead}>
                Mark as Read
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedNotifications(new Set())}>
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationCenter;