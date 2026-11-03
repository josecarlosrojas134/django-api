from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Movie, Screening
from .serializers import MovieSerializer, ScreeningSerializer


def screenings_with_occupancy():
    return (
        Screening.objects.select_related("movie", "room")
        .annotate(occupied=Count("booked_seats", filter=Q(booked_seats__active=True)))
        .order_by("starts_at")
    )


class MovieListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MovieSerializer
    queryset = Movie.objects.filter(is_active=True)


class ScreeningListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ScreeningSerializer

    def get_queryset(self):
        queryset = screenings_with_occupancy().filter(starts_at__gte=timezone.now())
        movie_id = self.request.query_params.get("movie")
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset


class ScreeningDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ScreeningSerializer

    def get_queryset(self):
        return screenings_with_occupancy()


class ScreeningSeatsView(APIView):
    """Mapa de butacas: tamaño de la sala y butacas ocupadas."""

    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        screening = get_object_or_404(Screening.objects.select_related("room"), pk=pk)
        occupied = screening.booked_seats.filter(active=True).values("row", "number")
        return Response(
            {
                "screening": screening.id,
                "rows": screening.room.rows,
                "seats_per_row": screening.room.seats_per_row,
                "occupied": list(occupied),
            }
        )
