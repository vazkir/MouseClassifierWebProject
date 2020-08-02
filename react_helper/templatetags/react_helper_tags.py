from os import listdir
from os.path import isfile, join
from django.conf import settings
from django import template
from react_helper.server_check import check_server_live
from react_helper import REACT_DJANGO_STATIC_DIR, REACT_LIVE_URL

register = template.Library()

# Source 1: https://dev.to/sroy8091/custom-template-tags-in-django
# Source 2: https://docs.djangoproject.com/en/2.2/howto/custom-template-tags/
# Source 3: https://stackoverflow.com/questions/46691544/django-listing-files-from-a-static-folder
@register.inclusion_tag('react_helper/react-js.html')
def get_react_static_js():
    # Url path to the live React files
    bundle_url = '{}/static/js/bundle.js'.format(REACT_LIVE_URL)
    server_is_live = check_server_live(bundle_url)

    # Can load the js files directly from the react project if npm is running so we can grab the live url paths
    if server_is_live:
        # ...while more recent versions of CRA use code-splitting and serve additional files
        # From: https://github.com/MasterKale/django-cra-helper/blob/bugfix/update-cra-manifest-parsing/cra_helper/asset_manifest.py
        file_paths =  [
            # These two files will alternate being loaded into the page
            '{}/static/js/bundle.js'.format(REACT_LIVE_URL),
            '{}/static/js/0.chunk.js'.format(REACT_LIVE_URL),
            '{}/static/js/1.chunk.js'.format(REACT_LIVE_URL),
            # This bundle seems to contain some vendor files
            '{}/static/js/main.chunk.js'.format(REACT_LIVE_URL)
        ]
    # Grab React's build js file paths relative from our STATIC_ROOT
    else:
        react_path = REACT_DJANGO_STATIC_DIR + '/js'
        file_paths = []
        for f in listdir(react_path):
            if isfile(join(react_path, f)):
                filePath = 'react/js/' + f
                file_paths.append(filePath)

    # 'is_live' is needed to determine if  {% load static %} is neccesary,
    # so we're be able to reference the /static/react files
    return {'js_files': file_paths, 'is_live': server_is_live}


@register.inclusion_tag('react_helper/react-css.html')
def get_react_static_css():
    react_path = REACT_DJANGO_STATIC_DIR + '/css'
    allfiles = []

    for f in listdir(react_path):
        if isfile(join(react_path, f)):
            filePath = 'react/css/' + f
            allfiles.append(filePath)

    return {'css_files': allfiles}
