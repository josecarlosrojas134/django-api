from django.urls import path

from .views import (
    MovieDetailView,
    MovieListView,
    ScreeningDetailView,
    ScreeningListView,
    ScreeningSeatsView,
)

urlpatterns = [
    path("movies/", MovieListView.as_view(), name="movie-list"),
    path("movies/<int:pk>/", MovieDetailView.as_view(), name="movie-detail"),
    path("screenings/", ScreeningListView.as_view(), name="screening-list"),
    path("screenings/<int:pk>/", ScreeningDetailView.as_view(), name="screening-detail"),
    path("screenings/<int:pk>/seats/", ScreeningSeatsView.as_view(), name="screening-seats"),
]
