from django.contrib import admin

from .models import Genre, Movie, Room, Screening


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "rating", "age_rating", "is_premiere", "duration_minutes", "is_active")
    list_filter = ("is_active", "is_premiere", "genres")
    search_fields = ("title", "director")
    filter_horizontal = ("genres",)
    fieldsets = (
        (None, {"fields": ("title", "description", "duration_minutes", "is_active")}),
        ("Ficha", {"fields": ("tagline", "director", "cast", "genres")}),
        (
            "Cartel",
            {"fields": ("poster_url", "rating", "age_rating", "is_premiere", "trailer_url")},
        ),
    )


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name", "format", "rows", "seats_per_row", "accessible_seats", "capacity")
    list_filter = ("format",)

    @admin.display(description="Aforo")
    def capacity(self, obj: Room) -> int:
        return obj.capacity


@admin.register(Screening)
class ScreeningAdmin(admin.ModelAdmin):
    list_display = ("movie", "room", "starts_at", "price")
    list_filter = ("room", "movie")
    date_hierarchy = "starts_at"
    autocomplete_fields = ("movie",)
