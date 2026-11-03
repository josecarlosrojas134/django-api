from rest_framework import serializers

from .models import Movie, Screening


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ("id", "title", "description", "duration_minutes")


class ScreeningSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    room = serializers.CharField(source="room.name", read_only=True)
    total_seats = serializers.SerializerMethodField()
    seats_available = serializers.SerializerMethodField()

    class Meta:
        model = Screening
        fields = ("id", "movie", "room", "starts_at", "price", "total_seats", "seats_available")

    def get_total_seats(self, obj: Screening) -> int:
        return obj.room.capacity

    def get_seats_available(self, obj: Screening) -> int:
        occupied = getattr(obj, "occupied", None)
        if occupied is None:
            occupied = obj.booked_seats.filter(active=True).count()
        return obj.room.capacity - occupied
