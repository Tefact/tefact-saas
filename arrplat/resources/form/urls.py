from flask import Blueprint
from flask_restful import Api

from .views import FormResource

blueprint = Blueprint('/form', __name__, static_folder='static')
api = Api(blueprint)

api.add_resource(FormResource, '')
