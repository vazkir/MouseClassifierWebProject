import os
from django.conf import settings
from django.contrib.staticfiles.management.commands.runserver import Command as RunserverCommand
from react_helper.server_check import check_server_live
from react_helper import REACT_LIVE_URL

# Hooks in before the runserver command, and needs the environmentcheck because;
# elsse all the code will be triggered twice
# Source: https://stackoverflow.com/questions/28489863/why-is-run-called-twice-in-the-django-dev-server
class Command(RunserverCommand):
    def run(self, *args, **options):
        if os.environ.get('RUN_MAIN') != 'true' and settings.DEBUG:
            # Url path to the live React files
            bundle_url = '{}/static/js/bundle.js'.format(REACT_LIVE_URL)
            check_server_live(bundle_url)

        # The regular runserver continues
        super(Command, self).run(*args, **options)
