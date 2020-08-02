from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # BACKEND
    path('', include('backend.urls')),
]
# # This makes sure that when the /static is visited it goes to the right direcory
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
