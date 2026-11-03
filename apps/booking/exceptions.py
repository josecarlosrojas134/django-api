from rest_framework import status
from rest_framework.exceptions import APIException


class InvalidSeats(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Las butacas indicadas no son válidas."
    default_code = "invalid_seats"


class SeatUnavailable(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Alguna de las butacas ya está reservada."
    default_code = "seat_unavailable"


class ScreeningAlreadyStarted(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "La función ya ha comenzado."
    default_code = "screening_started"


class ReservationAlreadyCancelled(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "La reserva ya estaba cancelada."
    default_code = "already_cancelled"
