from rest_framework import serializers

from .models import Movie, Screening


class MovieSerializer(serializers.ModelSerializer):
    cast = serializers.SerializerMethodField()
    genres = serializers.SerializerMethodField()
    rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=1,
        coerce_to_string=False,
        allow_null=True,
        read_only=True,
    )

    class Meta:
        model = Movie
        fields = (
            "id",
            "title",
            "description",
            "duration_minutes",
            "tagline",
            "director",
            "cast",
            "poster_url",
            "rating",
            "age_rating",
            "is_premiere",
            "trailer_url",
            "genres",
        )

    def get_cast(self, obj: Movie) -> list[str]:
        return obj.cast_list

    def get_genres(self, obj: Movie) -> list[str]:
        return obj.genre_names


class ScreeningSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    room = serializers.CharField(source="room.name", read_only=True)
    room_format = serializers.CharField(source="room.format", read_only=True)
    room_features = serializers.SerializerMethodField()
    total_seats = serializers.SerializerMethodField()
    seats_available = serializers.SerializerMethodField()

    class Meta:
        model = Screening
        fields = (
            "id",
            "movie",
            "room",
            "room_format",
            "room_features",
            "starts_at",
            "price",
            "total_seats",
            "seats_available",
        )

    def get_total_seats(self, obj: Screening) -> int:
        return obj.room.capacity

    def get_room_features(self, obj: Screening) -> list[str]:
        return obj.room.feature_list

    def get_seats_available(self, obj: Screening) -> int:
        occupied = getattr(obj, "occupied", None)
        if occupied is None:
            occupied = obj.booked_seats.filter(active=True).count()
        return obj.room.capacity - occupied
