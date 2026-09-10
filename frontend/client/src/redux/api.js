import {
  createApi,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

import { API_BASE_URL } from "../config/api";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),

  tagTypes: [
    "Booking",
    "Queue",
    "Procurement",
    "Payment",
    "Centre",
    "AdminDashboard",
  ],

  endpoints: (builder) => ({

    // --------------------
    // CENTRES
    // --------------------

    getCentres: builder.query({
      query: (date) =>
        date ? `/centres?date=${date}` : "/centres",

      providesTags: ["Centre"],
    }),

    getAdminCentres: builder.query({
      query: () => "/centres/admin",
      providesTags: ["Centre"],
    }),

    createCentre: builder.mutation({
      query: (data) => ({
        url: "/centres/admin",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Centre"],
    }),

    updateCentre: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/centres/admin/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: ["Centre"],
    }),

    // --------------------
    // BOOKINGS
    // --------------------

    getMyBookings: builder.query({
      query: () => "/bookings/my",
      providesTags: ["Booking"],
    }),

    createBooking: builder.mutation({
      query: (data) => ({
        url: "/bookings",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        "Booking",
        "Queue",
        "Centre",
      ],
    }),

    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/booking/${id}/status`,
        method: "PUT",
        body: { status },
      }),

      invalidatesTags: [
        "Queue",
        "Booking",
      ],
    }),

    // --------------------
    // QUEUE
    // --------------------

    getQueue: builder.query({
      query: (centreId) =>
        `/bookings/queue/${centreId}`,

      providesTags: (result, error, centreId) => [
        { type: "Queue", id: centreId },
      ],
    }),

    getAdminQueue: builder.query({
      query: ({ centreId, date } = {}) => {
        const params = new URLSearchParams();

        if (centreId) {
          params.append("centreId", centreId);
        }

        if (date) {
          params.append("date", date);
        }

        const queryString = params.toString();

        return `/admin/queue${
          queryString ? `?${queryString}` : ""
        }`;
      },

      providesTags: ["Queue"],
    }),

    // --------------------
    // PROCUREMENT
    // --------------------

    getMyProcurement: builder.query({
      query: () => "/procurement/my",
      providesTags: ["Procurement"],
    }),

    getAdminProcurement: builder.query({
      query: () => "/procurement/admin",
      providesTags: ["Procurement"],
    }),

    updateProcurement: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/procurement/admin/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: ["Procurement"],
    }),

    // --------------------
    // PAYMENTS
    // --------------------

    getMyPayments: builder.query({
      query: () => "/procurement/payments",
      providesTags: ["Payment"],
    }),

    getAdminPayments: builder.query({
      query: () => "/payments/admin",
      providesTags: ["Payment"],
    }),

    getPaymentInvoice: builder.query({
      query: (id) =>
        `/payments/invoice/${id}`,
    }),

    updatePayment: builder.mutation({
      query: ({ id, status }) => ({
        url: `/payments/admin/${id}`,
        method: "PUT",
        body: { status },
      }),

      invalidatesTags: ["Payment"],
    }),

    // --------------------
    // ADMIN DASHBOARD
    // --------------------

    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
  }),
});

export const {
  useGetCentresQuery,
  useGetAdminQueueQuery,
  useGetMyBookingsQuery,
  useUpdateBookingStatusMutation,
  useGetPaymentInvoiceQuery,
  useCreateBookingMutation,
  useGetQueueQuery,
  useGetAdminProcurementQuery,
  useUpdateProcurementMutation,
  useGetMyProcurementQuery,
  useGetAdminPaymentsQuery,
  useUpdatePaymentMutation,
  useGetMyPaymentsQuery,
  useGetAdminDashboardQuery,
  useGetAdminCentresQuery,
  useCreateCentreMutation,
  useUpdateCentreMutation,
} = api;