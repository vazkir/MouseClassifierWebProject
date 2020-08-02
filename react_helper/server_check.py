# From: https://github.com/MasterKale/django-cra-helper/blob/bugfix/update-cra-manifest-parsing/cra_helper/server_check.py
import logging
from urllib import request, error as url_error
from django.conf import settings

def check_server_live(bundle_url: str) -> bool:
    # Makes sure logger.info is also printed to the console
    logging.getLogger().setLevel(logging.INFO)

    # Ignore the server check if we're in production
    if settings.DEBUG:
        try:
            resp = request.urlopen(bundle_url)
            if resp.status == 200:
                logging.info('React liveserver is running')
                # stdout.write("CRA liveserver is running")
                return True
            else:
                logging.warning('React liveserver is up but not serving files')
                # stdout.write("CRA liveserver is up but not serving files")
                return False
        except url_error.URLError as err:
            logging.warning('React liveserver is not running')
            # stdout.write("CRA liveserver is not running")
            return False
    else:
        return False
