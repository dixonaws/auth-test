from chalice import Chalice
from chalice import CORSConfig

app = Chalice(app_name='myApi')

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['X-Special-Header', 'param1', 'param0'],
    max_age=600,
    expose_headers=['X-Special-Header'],
    allow_credentials=True
)

@app.route('/', methods=['GET'], cors=cors_config)
def index():
    return {'message': 'echo from Lambda function \'myApi\' called through API Gateway.'}


# The view function above will return {"hello": "world"}
# whenever you make an HTTP GET request to '/'.
#
# Here are a few more examples:
#
# @app.route('/hello/{name}')
# def hello_name(name):
#    # '/hello/james' -> {"hello": "james"}
#    return {'hello': name}
#
# @app.route('/users', methods=['POST'])
# def create_user():
#     # This is the JSON body the user sent in their POST request.
#     user_as_json = app.current_request.json_body
#     # We'll echo the json body back to the user in a 'user' key.
#     return {'user': user_as_json}
#
# See the README documentation for more examples.
#
