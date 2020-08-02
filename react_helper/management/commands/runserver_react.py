import os
from distutils.dir_util import copy_tree
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.management import call_command
from react_helper.server_check import check_server_live
from react_helper import REACT_LIVE_URL

# Simple check to first check if React is live
class Command(BaseCommand):
    help = 'Custom command to run the server with react if that server is live'

    def handle(self, *args, **kwargs):
        self.stdout.write("REACT RUNSERVER HANDLE TRIGERED")

        if settings.DEBUG:
            # Url path to the live React files
            bundle_url = '{}/static/js/bundle.js'.format(REACT_LIVE_URL)
            check_server_live(bundle_url)

        # Call runserver: https://docs.djangoproject.com/en/2.2/ref/django-admin/#running-management-commands-from-your-code
        call_command('runserver')
