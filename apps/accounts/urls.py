from django.urls import path

from .views import EmailTokenObtainPairView, MeView, ThrottledTokenRefreshView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("auth/token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", ThrottledTokenRefreshView.as_view(), name="token_refresh"),
]
