from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import Reservation
from .serializers import ReservationCreateSerializer, ReservationSerializer


class ReservationListCreateView(generics.ListCreateAPIView):
    """Lista las reservas del usuario y crea nuevas."""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Reservation.objects.filter(user=self.request.user)
            .select_related("screening__movie", "screening__room")
            .prefetch_related("seats")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReservationCreateSerializer
        return ReservationSerializer

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = ReservationCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        reservation = serializer.save()
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


class ReservationDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservationSerializer

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).prefetch_related("seats")


class ReservationCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, pk: int) -> Response:
        reservation = get_object_or_404(Reservation.objects.filter(user=request.user), pk=pk)
        cancelled = services.cancel_reservation(reservation=reservation)
        return Response(ReservationSerializer(cancelled).data)
