/**
 * Lead Management Component
 *
 * Comprehensive lead management interface with real-time updates,
 * filtering, search, bulk actions, and detailed lead tracking.
 */

'use client';

import React, { useCallback,useMemo, useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  FileText,
  Filter,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  User,
  UserPlus} from 'lucide-react';

// Import real-time hooks
import { useRealtimeLeads } from '@/lib/supabase/realtime';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { Checkbox } from '@/modules/shared/presentation/components/ui/checkbox';
import { Dialog } from '@/modules/shared/presentation/components/ui/dialog';
import { Input } from '@/modules/shared/presentation/components/ui/input';
import { LoadingSkeleton } from '@/modules/shared/presentation/components/ui/loading-skeleton';
import { Select } from '@/modules/shared/presentation/components/ui/select';
import { Tabs } from '@/modules/shared/presentation/components/ui/tabs';
// Import API hooks
import {
  useBulkUpdateLeadsMutation,
  useDeleteLeadMutation,
  useGetLeadsQuery,
  useLeadManagement,
  useSearchLeadsQuery,
  useUpdateLeadMutation} from '@/store/api';

interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'website' | 'social' | 'referral' | 'paid' | 'organic';
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
  onboarding_status?: 'not_started' | 'in_progress' | 'completed';
  last_activity?: string;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
};

const sourceColors = {
  website: 'bg-purple-100 text-purple-800',
  social: 'bg-pink-100 text-pink-800',
  referral: 'bg-orange-100 text-orange-800',
  paid: 'bg-indigo-100 text-indigo-800',
  organic: 'bg-teal-100 text-teal-800',
};

export const LeadManagement = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showLeadDetail, setShowLeadDetail] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Real-time subscription
  const realtimeLeads = useRealtimeLeads();

  // API hooks
  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsError,
    refetch: refetchLeads
  } = useGetLeadsQuery({
    page: currentPage,
    limit: pageSize,
    sort: sortBy,
    order: sortOrder,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
  });

  const {
    data: searchResults,
    isLoading: searchLoading
  } = useSearchLeadsQuery(searchTerm, {
    skip: !searchTerm || searchTerm.length < 2,
  });

  const [updateLead] = useUpdateLeadMutation();
  const [deleteLead] = useDeleteLeadMutation();
  const [bulkUpdateLeads] = useBulkUpdateLeadsMutation();

  // Data processing
  const leads = useMemo(() => {
    if (searchTerm && searchResults?.leads) {
      return searchResults.leads;
    }
    return leadsData?.leads || [];
  }, [searchTerm, searchResults, leadsData]);

  const totalLeads = useMemo(() => {
    if (searchTerm && searchResults) {
      return searchResults.total;
    }
    return leadsData?.total || 0;
  }, [searchTerm, searchResults, leadsData]);

  // Handlers
  const handleSelectLead = useCallback((leadId: string, selected: boolean) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  }, [leads]);

  const handleUpdateLeadStatus = useCallback(async (leadId: string, status: string) => {
    try {
      await updateLead({ id: leadId, status }).unwrap();
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  }, [updateLead]);

  const handleBulkStatusUpdate = useCallback(async (status: string) => {
    try {
      await bulkUpdateLeads({
        ids: Array.from(selectedLeads),
        updates: { status }
      }).unwrap();
      setSelectedLeads(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to bulk update leads:', error);
    }
  }, [bulkUpdateLeads, selectedLeads]);

  const handleDeleteLead = useCallback(async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(leadId).unwrap();
      } catch (error) {
        console.error('Failed to delete lead:', error);
      }
    }
  }, [deleteLead]);

  const handleExportLeads = useCallback(() => {
    const leadsToExport = selectedLeads.size > 0
      ? leads.filter(lead => selectedLeads.has(lead.id))
      : leads;

    const csv = [
      // Header
      'Name,Email,Phone,Company,Status,Source,Created At,Onboarding Status',
      // Data rows
      ...leadsToExport.map(lead => [
        lead.name || '',
        lead.email,
        lead.phone || '',
        lead.company || '',
        lead.status,
        lead.source,
        new Date(lead.created_at).toLocaleString(),
        lead.onboarding_status || 'not_started'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [leads, selectedLeads]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (leadsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <Card className="p-6">
          <LoadingSkeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600 mt-1">
            {totalLeads} total leads • {selectedLeads.size} selected
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedLeads.size > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(true)}
            >
              Bulk Actions ({selectedLeads.size})
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleExportLeads}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            onClick={() => refetchLeads()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search leads by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-3">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </Select>

            <Select
              value={sourceFilter}
              onValueChange={setSourceFilter}
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="social">Social Media</option>
              <option value="referral">Referral</option>
              <option value="paid">Paid Ads</option>
              <option value="organic">Organic</option>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Real-time Status */}
      {realtimeLeads.latestEvent && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              New lead received: {realtimeLeads.latestEvent.email}
            </span>
            <Badge variant="secondary" className="text-xs">
              {formatDate(realtimeLeads.latestEvent.created_at)}
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Leads Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Checkbox
                    checked={selectedLeads.size === leads.length && leads.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Onboarding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {leads.map((lead) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {lead.phone && (
                          <div className="flex items-center space-x-1 mb-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.company && (
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <span>{lead.company}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Select
                        value={lead.status}
                        onValueChange={(value) => handleUpdateLeadStatus(lead.id, value)}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </Select>
                    </td>

                    <td className="px-6 py-4">
                      <Badge className={sourceColors[lead.source] || 'bg-gray-100 text-gray-800'}>
                        {lead.source}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          lead.onboarding_status === 'completed' ? 'default' :
                          lead.onboarding_status === 'in_progress' ? 'secondary' : 'outline'
                        }
                      >
                        {lead.onboarding_status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {lead.onboarding_status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                        {lead.onboarding_status === 'not_started' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {lead.onboarding_status || 'not_started'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(lead.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowLeadDetail(lead.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLead(lead.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} leads
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(totalLeads / pageSize)}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage * pageSize >= totalLeads}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions Dialog */}
      {showBulkActions && (
        <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bulk Actions ({selectedLeads.size} leads selected)
            </h3>

            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleBulkStatusUpdate('contacted')}
              >
                Mark as Contacted
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleBulkStatusUpdate('qualified')}
              >
                Mark as Qualified
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleBulkStatusUpdate('lost')}
              >
                Mark as Lost
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleExportLeads}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default LeadManagement;