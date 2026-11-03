from django.contrib import admin

from .models import Movie, Room, Screening


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "duration_minutes", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title",)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name", "rows", "seats_per_row", "capacity")

    @admin.display(description="Aforo")
    def capacity(self, obj: Room) -> int:
        return obj.capacity


@admin.register(Screening)
class ScreeningAdmin(admin.ModelAdmin):
    list_display = ("movie", "room", "starts_at", "price")
    list_filter = ("room", "movie")
    date_hierarchy = "starts_at"
    autocomplete_fields = ("movie",)
