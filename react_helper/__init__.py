import os
from django.conf import settings

# Variables to help the template determine if it should try loading assets from the REACT live server
_REACT_DEFAULT_PORT = 3000
_REACT_DEFAULT_HOST = 'localhost'
_port = _REACT_DEFAULT_PORT
_host = _REACT_DEFAULT_HOST

# Allow the user to specify the port create-react-app is running on
if hasattr(settings, 'REACT_PORT') and type(settings.REACT_PORT) is int:
    _port = settings.REACT_PORT

# Allow the user to specify the host create-react-app is running on
if hasattr(settings, 'REACT_HOST'):
    _host = settings.REACT_HOST

# The URL the create-react-app liveserver is accessible at
REACT_LIVE_URL = 'http://{}:{}'.format(_host, _port)

if hasattr(settings, 'REACT_APPNAME'):
    REACT_APPNAME = settings.REACT_APPNAME
else:
    REACT_APPNAME = 'react'

# The path to the REACT project directory, relative to the Django project's base directory
REACT_ROOT  = os.path.join(settings.BASE_DIR, REACT_APPNAME)

# Used for copying build files
REACT_DJANGO_STATIC_DIR = os.path.join(settings.BASE_DIR, 'static') + '/react'

# TODO: If I want to publish it as a Library
# 1) Figure out which js files for the liveserver are used for each react version
# Only the live version since I am just copying everything from the build folder already
# -> Make a switch statement or something where the user needs to specify it's react versions
# so that we can make a file name descicion for the liveserver in the react_tags
# -> And add posibility for the user to specify js files itself if it doesn't work
# -> Or figure out a check where we can just see these files and grab those, which is backwards compatible
# 2) Make sure the update_react_static_build() works better by;
# -> Determine if the static build files need renewing
# -> (Maybe) first remove all the files, since (I think) that collectstatic also does that
# -> Validat code by checking similar ones, because this can be very error prone due to locations and permission
# -> Make sure to have good try catch blocks which output the occurred errors
# 3) Review all code:
# -> Review comments and explain almost everyfunction and thing I do
# -> Try to implement try catches where possible, so that errors outputted and no major crashes
# 3) Test the app out in Python 2, not sure if neccesarry though
# 4) Test it out on at least 2 major differen create-react-app versions
# 5) Figure out what unit tests are and do those
# 6) Create a README
