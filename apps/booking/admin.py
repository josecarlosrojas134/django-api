from django.contrib import admin

from .models import Reservation, ReservationSeat


class ReservationSeatInline(admin.TabularInline):
    model = ReservationSeat
    extra = 0
    readonly_fields = ("row", "number", "active")


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("code", "user", "screening", "status", "total", "created_at")
    list_filter = ("status", "screening__movie")
    search_fields = ("code", "user__email")
    readonly_fields = ("code", "created_at")
    inlines = (ReservationSeatInline,)
