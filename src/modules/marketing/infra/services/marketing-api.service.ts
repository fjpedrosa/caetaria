import { baseApi } from '../../../../store/api/base-api'
import type { Lead, LeadSource, LeadStatus } from '../../domain/entities/lead'

// DTOs for API requests/responses
interface CreateLeadRequest {
  email: string
  phoneNumber?: string
  companyName?: string
  firstName?: string
  lastName?: string
  source: LeadSource
  interestedFeatures?: string[]
  notes?: string
}

interface UpdateLeadRequest {
  id: string
  status?: LeadStatus
  notes?: string
  interestedFeatures?: string[]
}

interface LeadResponse {
  id: string
  email: string
  phoneNumber?: string
  companyName?: string
  firstName?: string
  lastName?: string
  source: LeadSource
  status: LeadStatus
  createdAt: string
  updatedAt: string
  notes?: string
  interestedFeatures?: string[]
}

interface AnalyticsRequest {
  startDate?: string
  endDate?: string
  source?: LeadSource
}

interface AnalyticsResponse {
  totalLeads: number
  leadsBySource: Record<LeadSource, number>
  leadsByStatus: Record<LeadStatus, number>
  conversionRate: number
  topFeatures: Array<{ feature: string; count: number }>
}

// Marketing API service using RTK Query
export const marketingApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lead management endpoints
    createLead: builder.mutation<LeadResponse, CreateLeadRequest>({
      query: (lead) => ({
        url: '/leads',
        method: 'POST',
        body: lead,
      }),
      invalidatesTags: ['Lead', 'Analytics'],
    }),

    getLeads: builder.query<LeadResponse[], {
      page?: number
      limit?: number
      status?: LeadStatus
      source?: LeadSource
    }>({
      query: ({ page = 1, limit = 50, status, source } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })

        if (status) params.append('status', status)
        if (source) params.append('source', source)

        return `/leads?${params.toString()}`
      },
      providesTags: ['Lead'],
    }),

    getLeadById: builder.query<LeadResponse, string>({
      query: (id) => `/leads/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Lead', id }],
    }),

    updateLead: builder.mutation<LeadResponse, UpdateLeadRequest>({
      query: ({ id, ...updates }) => ({
        url: `/leads/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Lead', id },
        'Analytics',
      ],
    }),

    deleteLead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Lead', id },
        'Analytics',
      ],
    }),

    // Analytics endpoints
    getLeadAnalytics: builder.query<AnalyticsResponse, AnalyticsRequest>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()

        if (params.startDate) searchParams.append('startDate', params.startDate)
        if (params.endDate) searchParams.append('endDate', params.endDate)
        if (params.source) searchParams.append('source', params.source)

        return `/analytics/leads?${searchParams.toString()}`
      },
      providesTags: ['Analytics'],
    }),

    // Contact form submission
    submitContactForm: builder.mutation<{ success: boolean; leadId: string }, {
      name: string
      email: string
      phoneNumber?: string
      companyName?: string
      message: string
      interestedFeatures?: string[]
    }>({
      query: (formData) => ({
        url: '/contact',
        method: 'POST',
        body: {
          ...formData,
          source: 'contact-form' as LeadSource,
        },
      }),
      invalidatesTags: ['Lead', 'Analytics'],
    }),

    // Demo request
    requestDemo: builder.mutation<{ success: boolean; leadId: string }, {
      name: string
      email: string
      phoneNumber?: string
      companyName: string
      preferredTime?: string
      interestedFeatures?: string[]
    }>({
      query: (demoRequest) => ({
        url: '/demo-request',
        method: 'POST',
        body: {
          ...demoRequest,
          source: 'demo-request' as LeadSource,
        },
      }),
      invalidatesTags: ['Lead', 'Analytics'],
    }),

    // Newsletter signup
    subscribeNewsletter: builder.mutation<{ success: boolean; leadId: string }, {
      email: string
      firstName?: string
      interestedFeatures?: string[]
    }>({
      query: (subscription) => ({
        url: '/newsletter/subscribe',
        method: 'POST',
        body: {
          ...subscription,
          source: 'newsletter-signup' as LeadSource,
        },
      }),
      invalidatesTags: ['Lead', 'Analytics'],
    }),
  }),
  overrideExisting: false,
})

// Export hooks for components
export const {
  useCreateLeadMutation,
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadAnalyticsQuery,
  useSubmitContactFormMutation,
  useRequestDemoMutation,
  useSubscribeNewsletterMutation,
} = marketingApiService