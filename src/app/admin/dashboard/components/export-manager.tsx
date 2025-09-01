/**
 * Export Manager Component
 *
 * Comprehensive data export functionality with CSV, PDF, and Excel formats,
 * scheduled exports, and custom report generation.
 */

'use client';

import React, { useMemo,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Table,
  Target,
  Trash2,
  User,
  Users,
  XCircle,
  Zap} from 'lucide-react';

import { Badge } from '@/modules/shared/ui/components/ui/badge';
import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card } from '@/modules/shared/ui/components/ui/card';
import { Checkbox } from '@/modules/shared/ui/components/ui/checkbox';
import { Dialog } from '@/modules/shared/ui/components/ui/dialog';
import { Input } from '@/modules/shared/ui/components/ui/input';
import { Select } from '@/modules/shared/ui/components/ui/select';
import { Tabs } from '@/modules/shared/ui/components/ui/tabs';
import { Textarea } from '@/modules/shared/ui/components/ui/textarea';

interface ExportJob {
  id: string;
  name: string;
  type: 'leads' | 'analytics' | 'onboarding' | 'system_health' | 'custom';
  format: 'csv' | 'pdf' | 'excel' | 'json';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    day?: number;
  };
  filters: Record<string, any>;
  dateRange: {
    start: string;
    end: string;
  };
  email_recipients: string[];
  created_at: string;
  last_run?: string;
  next_run?: string;
  file_size?: number;
  record_count?: number;
  download_url?: string;
  error_message?: string;
}

const mockExportJobs: ExportJob[] = [
  {
    id: '1',
    name: 'Daily Leads Report',
    type: 'leads',
    format: 'csv',
    status: 'completed',
    schedule: { frequency: 'daily', time: '09:00' },
    filters: { status: 'all', source: 'all' },
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    email_recipients: ['admin@example.com'],
    created_at: '2024-01-15T09:00:00Z',
    last_run: '2024-01-16T09:00:00Z',
    next_run: '2024-01-17T09:00:00Z',
    file_size: 2547823,
    record_count: 1243,
    download_url: '/exports/daily-leads-2024-01-16.csv',
  },
  {
    id: '2',
    name: 'Monthly Analytics Summary',
    type: 'analytics',
    format: 'pdf',
    status: 'running',
    schedule: { frequency: 'monthly', day: 1, time: '06:00' },
    filters: {},
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    email_recipients: ['ceo@example.com', 'analytics@example.com'],
    created_at: '2024-01-01T06:00:00Z',
    last_run: '2024-01-01T06:00:00Z',
    next_run: '2024-02-01T06:00:00Z',
  },
  {
    id: '3',
    name: 'Onboarding Funnel Analysis',
    type: 'onboarding',
    format: 'excel',
    status: 'failed',
    schedule: { frequency: 'weekly', time: '10:00' },
    filters: { completion_status: 'all' },
    dateRange: { start: '2024-01-08', end: '2024-01-14' },
    email_recipients: ['product@example.com'],
    created_at: '2024-01-15T10:00:00Z',
    last_run: '2024-01-15T10:00:00Z',
    error_message: 'Database connection timeout',
  },
];

const exportTypes = {
  leads: { label: 'Leads Data', icon: Users, description: 'Lead information and contact details' },
  analytics: { label: 'Analytics', icon: BarChart3, description: 'User behavior and conversion data' },
  onboarding: { label: 'Onboarding', icon: Target, description: 'Onboarding flow and completion data' },
  system_health: { label: 'System Health', icon: Activity, description: 'Performance metrics and system status' },
  custom: { label: 'Custom Report', icon: FileText, description: 'Custom query and data selection' },
};

const formatTypes = {
  csv: { label: 'CSV', icon: Table, description: 'Comma-separated values' },
  pdf: { label: 'PDF', icon: FileText, description: 'Formatted report document' },
  excel: { label: 'Excel', icon: Table, description: 'Microsoft Excel spreadsheet' },
  json: { label: 'JSON', icon: Settings, description: 'JavaScript Object Notation' },
};

export const ExportManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exports' | 'scheduled' | 'create'>('exports');
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState<string | null>(null);

  // Create export form state
  const [newExport, setNewExport] = useState({
    name: '',
    type: 'leads' as keyof typeof exportTypes,
    format: 'csv' as keyof typeof formatTypes,
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    schedule: {
      frequency: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
      time: '09:00',
      day: 1,
    },
    filters: {},
    email_recipients: [''],
    includeCharts: false,
    customQuery: '',
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleCreateExport = async () => {
    try {
      // Simulate API call
      console.log('Creating export:', newExport);
      setShowCreateDialog(false);
      // Reset form
      setNewExport({
        name: '',
        type: 'leads',
        format: 'csv',
        dateRange: {
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
        schedule: {
          frequency: 'once',
          time: '09:00',
          day: 1,
        },
        filters: {},
        email_recipients: [''],
        includeCharts: false,
        customQuery: '',
      });
    } catch (error) {
      console.error('Failed to create export:', error);
    }
  };

  const handleToggleJob = (jobId: string, action: 'pause' | 'resume' | 'delete') => {
    console.log(`${action} job:`, jobId);
  };

  const handleSelectJob = (jobId: string, selected: boolean) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

  const handleBulkAction = (action: 'pause' | 'resume' | 'delete') => {
    console.log(`Bulk ${action}:`, Array.from(selectedJobs));
    setSelectedJobs(new Set());
  };

  const updateEmailRecipients = (index: number, email: string) => {
    const newRecipients = [...newExport.email_recipients];
    newRecipients[index] = email;
    setNewExport(prev => ({ ...prev, email_recipients: newRecipients }));
  };

  const addEmailRecipient = () => {
    setNewExport(prev => ({
      ...prev,
      email_recipients: [...prev.email_recipients, ''],
    }));
  };

  const removeEmailRecipient = (index: number) => {
    setNewExport(prev => ({
      ...prev,
      email_recipients: prev.email_recipients.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export Manager</h2>
          <p className="text-gray-600 mt-1">
            Generate and schedule data exports for reports and analysis
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedJobs.size > 0 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('pause')}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause ({selectedJobs.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          <Button
            onClick={() => setShowCreateDialog(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Create Export
          </Button>
        </div>
      </div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(exportTypes).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <Card
              key={type}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setNewExport(prev => ({ ...prev, type: type as any }));
                setShowCreateDialog(true);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{config.label}</div>
                  <div className="text-sm text-gray-500">{config.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'exports', label: 'Recent Exports', count: mockExportJobs.length },
            { id: 'scheduled', label: 'Scheduled Jobs', count: mockExportJobs.filter(j => j.schedule?.frequency !== 'once').length },
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
              <Badge variant="secondary" className="text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {(activeTab === 'exports' || activeTab === 'scheduled') && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <Checkbox
                          checked={selectedJobs.size === mockExportJobs.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedJobs(new Set(mockExportJobs.map(j => j.id)));
                            } else {
                              setSelectedJobs(new Set());
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Export Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Run
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockExportJobs
                      .filter(job =>
                        activeTab === 'exports' ||
                        (activeTab === 'scheduled' && job.schedule?.frequency !== 'once')
                      )
                      .map((job) => {
                        const TypeIcon = exportTypes[job.type].icon;
                        const FormatIcon = formatTypes[job.format].icon;

                        return (
                          <motion.tr
                            key={job.id}
                            className="hover:bg-gray-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <td className="px-6 py-4">
                              <Checkbox
                                checked={selectedJobs.has(job.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectJob(job.id, checked as boolean)
                                }
                              />
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex -space-x-1">
                                  <div className="p-1 bg-blue-100 rounded">
                                    <TypeIcon className="w-3 h-3 text-blue-600" />
                                  </div>
                                  <div className="p-1 bg-gray-100 rounded">
                                    <FormatIcon className="w-3 h-3 text-gray-600" />
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{job.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {exportTypes[job.type].label} • {formatTypes[job.format].label.toUpperCase()}
                                  </div>
                                  {job.record_count && (
                                    <div className="text-xs text-gray-400">
                                      {job.record_count.toLocaleString()} records • {formatFileSize(job.file_size || 0)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(job.status)}
                                <div>
                                  <Badge
                                    variant={
                                      job.status === 'completed' ? 'default' :
                                      job.status === 'failed' ? 'destructive' :
                                      job.status === 'running' ? 'secondary' : 'outline'
                                    }
                                  >
                                    {job.status}
                                  </Badge>
                                  {job.error_message && (
                                    <div className="text-xs text-red-600 mt-1">
                                      {job.error_message}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {job.schedule?.frequency === 'once' ? (
                                <span className="text-sm text-gray-500">One-time</span>
                              ) : (
                                <div className="text-sm">
                                  <div className="font-medium capitalize text-gray-900">
                                    {job.schedule?.frequency}
                                  </div>
                                  {job.schedule?.time && (
                                    <div className="text-gray-500">at {job.schedule.time}</div>
                                  )}
                                  {job.next_run && (
                                    <div className="text-xs text-gray-400">
                                      Next: {formatDate(job.next_run)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {job.last_run ? (
                                <div className="text-sm text-gray-500">
                                  {formatDate(job.last_run)}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Never</span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowDetailsDialog(job.id)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>

                                {job.download_url && job.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(job.download_url, '_blank')}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                )}

                                {job.schedule?.frequency !== 'once' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleJob(job.id, job.status === 'scheduled' ? 'pause' : 'resume')}
                                  >
                                    {job.status === 'scheduled' ? (
                                      <Pause className="w-3 h-3" />
                                    ) : (
                                      <Play className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleJob(job.id, 'delete')}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Export Dialog */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <div className="max-w-2xl mx-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Create New Export</h3>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Name
                  </label>
                  <Input
                    value={newExport.name}
                    onChange={(e) => setNewExport(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter export name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Type
                  </label>
                  <Select
                    value={newExport.type}
                    onValueChange={(value) => setNewExport(prev => ({ ...prev, type: value as any }))}
                  >
                    {Object.entries(exportTypes).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Format and Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <Select
                    value={newExport.format}
                    onValueChange={(value) => setNewExport(prev => ({ ...prev, format: value as any }))}
                  >
                    {Object.entries(formatTypes).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={newExport.dateRange.start}
                    onChange={(e) => setNewExport(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newExport.dateRange.end}
                    onChange={(e) => setNewExport(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={newExport.schedule.frequency}
                    onValueChange={(value) => setNewExport(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, frequency: value as any }
                    }))}
                  >
                    <option value="once">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>

                  {newExport.schedule.frequency !== 'once' && (
                    <>
                      <Input
                        type="time"
                        value={newExport.schedule.time}
                        onChange={(e) => setNewExport(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, time: e.target.value }
                        }))}
                      />

                      {newExport.schedule.frequency === 'monthly' && (
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={newExport.schedule.day}
                          onChange={(e) => setNewExport(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, day: parseInt(e.target.value) }
                          }))}
                          placeholder="Day of month"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Email Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Recipients
                </label>
                <div className="space-y-2">
                  {newExport.email_recipients.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmailRecipients(index, e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1"
                      />
                      {newExport.email_recipients.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeEmailRecipient(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addEmailRecipient}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Add Recipient
                  </Button>
                </div>
              </div>

              {/* Additional Options */}
              {newExport.format === 'pdf' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={newExport.includeCharts}
                    onCheckedChange={(checked) =>
                      setNewExport(prev => ({ ...prev, includeCharts: checked as boolean }))
                    }
                  />
                  <label className="text-sm text-gray-700">Include charts and visualizations</label>
                </div>
              )}

              {newExport.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Query
                  </label>
                  <Textarea
                    value={newExport.customQuery}
                    onChange={(e) => setNewExport(prev => ({ ...prev, customQuery: e.target.value }))}
                    placeholder="Enter SQL query or describe custom data requirements"
                    rows={4}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateExport}
                  disabled={!newExport.name || !newExport.email_recipients[0]}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Create Export
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ExportManager;