import json
import os
import shutil
from pprint import pprint
from urllib.parse import urlparse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.urls import reverse_lazy, reverse
from django.views import generic
from urllib.parse import urlparse
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_POST, require_http_methods
from django.http import Http404, JsonResponse, HttpResponse
from django.conf import settings


def mainReactApp(request):
    # Info to pass down to request which passes it to React
    context = {
        'component': 'reactComponent',
        'props': {
            'ref': 'reactVS',
            'returnUrl': request.build_absolute_uri(), # The url from which the reques
        },
    }

    return render(request, 'backend/main_app.html', context)
