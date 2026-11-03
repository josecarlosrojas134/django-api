from django.urls import path

from .views import ReservationCancelView, ReservationDetailView, ReservationListCreateView

urlpatterns = [
    path("reservations/", ReservationListCreateView.as_view(), name="reservation-list"),
    path("reservations/<int:pk>/", ReservationDetailView.as_view(), name="reservation-detail"),
    path(
        "reservations/<int:pk>/cancel/",
        ReservationCancelView.as_view(),
        name="reservation-cancel",
    ),
]
