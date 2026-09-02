import {
  createApi,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",

    prepareHeaders: (
      headers,
      { getState }
    ) => {
      const token =
        getState().auth.token;

      if (token) {
        headers.set(
          "authorization",
          `Bearer ${token}`
        );
      }

      return headers;
    }
  }),

  tagTypes: [
    "Booking",
    "Queue",
    "Procurement",
    "Payment"
  ],

  endpoints: (builder) => ({
    getCentres: builder.query({
      query: () => "/centres"
    }),

    getMyBookings: builder.query({
      query: () => "/bookings/my",
      providesTags: ["Booking"],
        pollingInterval:5000
    }),

    createBooking: builder.mutation({
      query: (data) => ({
        url: "/bookings",
        method: "POST",
        body: data
      }),

      invalidatesTags: [
        "Booking",
        "Queue"
      ]
    }),

    getQueue: builder.query({
      query: (centreId) =>
        `/bookings/queue/${centreId}`,

      providesTags: ["Queue"]
    }),

    getMyProcurement: builder.query({
      query: () => "/procurement/my",
      providesTags: ["Procurement"],
      pollingInterval:5000
    }),

       getMyPayments: builder.query({
      query: () =>
        "/procurement/payments",

      providesTags: ["Payment"]
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
      queryString
        ? `?${queryString}`
        : ""
    }`;
  },

  providesTags: ["Queue"]


}),
updateBookingStatus: builder.mutation({
  query: ({ id, status }) => ({
    url: `/admin/booking/${id}/status`,
    method: "PUT",
    body: { status }
  }),

  invalidatesTags: [
    "Queue",
    "Booking"
  ]
}),

getAdminPayments: builder.query({
  query: () => "/payments/admin",
  providesTags: ["Payment"]
}),

updatePayment: builder.mutation({
  query: ({ id, status }) => ({
    url: `/payments/admin/${id}`,
    method: "PUT",
    body: { status }
  }),

  invalidatesTags: ["Payment"]
}),


getAdminProcurement: builder.query({
  query: () => "/procurement/admin",
  providesTags: ["Procurement"]
}),

updateProcurement: builder.mutation({
  query: ({ id, ...data }) => ({
    url: `/procurement/admin/${id}`,
    method: "PUT",
    body: data
  }),

  invalidatesTags: ["Procurement"]
}),

    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",

      providesTags:["adminDashboard"]
    })
  })
});

export const {
  useGetCentresQuery,
  useGetAdminQueueQuery,
  useGetMyBookingsQuery,
  useUpdateBookingStatusMutation,
  useCreateBookingMutation,
  useGetQueueQuery,
  useGetAdminProcurementQuery,
useUpdateProcurementMutation,
  useGetMyProcurementQuery,
  useGetAdminPaymentsQuery,
useUpdatePaymentMutation,
  useGetMyPaymentsQuery,
  useGetAdminDashboardQuery
} = api;