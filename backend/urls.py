from django.contrib import admin
from django.urls import path, include                 # add this
from . import views


urlpatterns = [
    # Main App
    path('', views.mainReactApp, name='main_react_app'),
]
