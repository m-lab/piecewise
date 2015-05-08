import httplib2

from apiclient.discovery import build
from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client import tools

PROJECT_NUMBER = '422648324111'
FLOW = flow_from_clientsecrets('client_secrets.json', scope='https://www.googleapis.com/auth/bigquery')

storage = Storage('bigquery_credentials.dat')
credentials = storage.get()

if credentials is None or credentials.invalid:
    # Run oauth2 flow with default arguments.
    credentials = tools.run_flow(FLOW, storage, tools.argparser.parse_args())

http = httplib2.Http()
http = credentials.authorize(http)

bigquery_service = build('bigquery', 'v2', http = http)
