from rest_framework import serializers

from apps.catalog.models import Screening

from . import services
from .models import Reservation


class SeatInputSerializer(serializers.Serializer):
    row = serializers.IntegerField(min_value=1)
    number = serializers.IntegerField(min_value=1)


class ReservationCreateSerializer(serializers.Serializer):
    screening = serializers.PrimaryKeyRelatedField(queryset=Screening.objects.all())
    seats = SeatInputSerializer(many=True, allow_empty=False)

    def validate_seats(self, value):
        pairs = [(seat["row"], seat["number"]) for seat in value]
        if len(set(pairs)) != len(pairs):
            raise serializers.ValidationError("No se puede repetir la misma butaca.")
        return value

    def create(self, validated_data):
        return services.create_reservation(user=self.context["request"].user, **validated_data)


class ReservationSerializer(serializers.ModelSerializer):
    movie = serializers.CharField(source="screening.movie.title", read_only=True)
    room = serializers.CharField(source="screening.room.name", read_only=True)
    starts_at = serializers.DateTimeField(source="screening.starts_at", read_only=True)
    seats = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = (
            "id",
            "code",
            "status",
            "movie",
            "room",
            "starts_at",
            "seats",
            "total",
            "created_at",
        )

    def get_seats(self, obj: Reservation) -> list[dict]:
        return [
            {"row": seat.row, "number": seat.number}
            for seat in sorted(obj.seats.all(), key=lambda seat: (seat.row, seat.number))
        ]
