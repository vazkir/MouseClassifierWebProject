import os
import uuid
from django import template
from django.conf import settings

register = template.Library()

# From: https://stackoverflow.com/questions/27911070/django-wont-refresh-staticfiles
# Making sure that always the latest js and or css files are loaded.
@register.simple_tag(name='cache_bust')
def cache_bust():

    if settings.DEBUG:
        version = uuid.uuid1()
    else:
        version = os.environ.get('PROJECT_VERSION')
        if version is None:
            version = '1'

    return '__v__={version}'.format(version=version)
