from flask_restful import Resource
from flask_apispec import use_kwargs
from marshmallow import fields
from .models import DataSource, DataSourceStatus, DataSourceType
from .schema import DataSourceSchema
from extensions import db
from arrplat.resources.organization.services import org_exists
from arrplat.resources.organization.models import OrgStaff
from arrplat.common.utils import json_response
from flask_jwt_extended import get_current_user
from arrplat.common.auth_jwt_utils import user_required
from .services import allow_access_data_source


class QueryResource(Resource):
    @user_required
    @use_kwargs({
        'table_names': fields.List(fields.String()),
    })
    def post(self, data_source_id, **kwargs):
        """查询数据表
           ---
           tags:
             - 数据源
           parameters:
           responses:
             200:
               examples:
                 response: {"data": null, "message": "添加成功"}
         """
        user = get_current_user()
        res = allow_access_data_source(data_source_id, user.id)
        if res.__class__.__name__ != "DataSource":
            return res

        table_names = kwargs.get("table_names", [])

        try:
            data = res.query_with_table(table_names)
            return json_response(data=data, status=200)
        except Exception as e:
            return json_response(message=str(e), status=409)


class DataTableResource(Resource):
    @user_required
    def get(self, data_source_id):
        """获取数据源内所有的数据表
           ---
           tags:
             - 数据源
           parameters:
           responses:
             200:
               examples:
                 response: {"data": null, "message": "添加成功"}
         """
        user = get_current_user()
        res = allow_access_data_source(data_source_id, user.id)
        if res.__class__.__name__ != "DataSource":
            return res

        try:
            tables = res.get_tables()
            return json_response(data=tables, status=200)
        except Exception as e:
            return json_response(message=str(e), status=409)


class DataSourceTestResource(Resource):
    @user_required
    @use_kwargs({
        'type': fields.String(required=True),
        'host': fields.String(required=True),
        'port': fields.String(required=True),
        'username': fields.String(),
        'password': fields.String()
    })
    def post(self, **kwargs):
        """测试数据源链接
           ---
           tags:
             - 数据源
           parameters:
           responses:
             200:
               examples:
                 response: {"data": null, "message": "添加成功"}
         """
        try:
            ds = DataSource(
                type=DataSourceType(kwargs.get("type")),
                username=kwargs.get("username"),
                password=kwargs.get("password"),
                host=kwargs.get("host"),
                port=kwargs.get("port")
            )

            ds.test()
            return json_response(message="链接成功", status=200)
        except Exception as e:
            return json_response(message="链接失败" + str(e), status=409)


class OrgDataSourceList(Resource):
    data_source_list_schema = DataSourceSchema(many=True)

    @use_kwargs({
        'plugins': fields.String(),
        'filename': fields.String()
    })
    def get(self, org_id):
        """数据源
          ---
          parameters:
            - name: org_id
              in: url
              type: string
              required: true
              description: 组织ID
          responses:
            200:
              examples:
                response: {"data": null, "message": "查询成功"}
        """

        data_list = db.session.query(DataSource).filter(DataSource.org_id == org_id).all()
        data = self.data_source_list_schema.dump(data_list).data

        return json_response(data=data, message="ok")


class DataSourceModifyResource(Resource):
    @user_required
    def delete(self, data_source_id):
        """删除数据源
           ---
           tags:
             - 数据源
           parameters:
           responses:
             200:
               description: A list of colors (may be filtered by palette)
               examples:
                 response: {"data": null, "message": "添加成功"}
         """
        user = get_current_user()

        if not data_source_id:
            return json_response(message="参数错误", status=400)

        data_source = db.session.query(DataSource).filter(DataSource.id == data_source_id).first()

        org = org_exists(data_source.org_id)

        if not org:
            return json_response(message=f"组织ID错误", status=403)

        staff = db.session.query(OrgStaff).filter(OrgStaff.user_id == user.id and OrgStaff.org_id == org.id).first()

        if not staff:
            return json_response(message=f"用户无权限", status=403)

        db.session.delete(data_source)
        db.session.commit()

        return json_response(message="删除成功", data={})

    @user_required
    @use_kwargs({
        'type': fields.String(required=True),
        'org_id': fields.String(required=True),
        'name': fields.String(required=True),
        'host': fields.String(required=True),
        'port': fields.String(required=True),
        'username': fields.String(),
        'password': fields.String(),
        'default_db': fields.String()
    })
    def put(self, data_source_id, **kwargs):
        """修改数据源
           ---
           tags:
             - 数据源
           parameters:
           responses:
             200:
               description: A list of colors (may be filtered by palette)
               examples:
                 response: {"data": null, "message": "添加成功"}
         """
        user = get_current_user()

        if not kwargs or not data_source_id:
            return json_response(message="参数错误", status=400)

        data_source = db.session.query(DataSource).filter(DataSource.id == data_source_id).first()

        org = org_exists(data_source.org_id)

        if not org:
            return json_response(message=f"组织ID错误", status=403)

        staff = db.session.query(OrgStaff).filter(OrgStaff.user_id == user.id and OrgStaff.org_id == org.id).first()

        if not staff:
            return json_response(message=f"用户无权限", status=403)

        data_source.name = kwargs.get("name")
        data_source.org_id = kwargs.get("org_id")

        if kwargs.get("username"):
            data_source.username = kwargs.get("username")
        if kwargs.get("password"):
            data_source.password = kwargs.get("password")

        data_source.host = kwargs.get("host")
        data_source.port = kwargs.get("port")
        data_source.default_db = kwargs.get("default_db")

        db.session.add(data_source)
        db.session.commit()

        return json_response(message="修改成功", data={
            "id": data_source.id
        })


class DataSourceResource(Resource):
    @user_required
    @use_kwargs({
        'type': fields.String(required=True),
        'org_id': fields.String(required=True),
        'name': fields.String(required=True),
        'host': fields.String(required=True),
        'port': fields.String(required=True),
        'username': fields.String(),
        'password': fields.String(),
        'default_db': fields.String()
    })
    def post(self, **kwargs):
        """创建数据源
          ---
          tags:
            - 数据源
          parameters:
          responses:
            200:
              description: A list of colors (may be filtered by palette)
              examples:
                response: {"data": null, "message": "添加成功"}
        """
        user = get_current_user()

        if not kwargs:
            return json_response(message="参数错误", status=400)

        org = org_exists(kwargs.get("org_id"))

        if not org:
            return json_response(message=f"组织ID错误", status=403)

        staff = db.session.query(OrgStaff).filter(OrgStaff.user_id == user.id and OrgStaff.org_id == org.id).first()

        if not staff:
            return json_response(message=f"用户无权限", status=403)

        data = DataSource(
            name=kwargs.get("name"),
            org_id=kwargs.get("org_id"),
            username=kwargs.get("username"),
            password=kwargs.get("password"),
            status=DataSourceStatus.connected,
            host=kwargs.get("host"),
            type=DataSourceType(kwargs.get("type", "mysql")),
            port=kwargs.get("port"),
            default_db=kwargs.get("default_db"),
            create_user_id=user.id
        )
        db.session.add(data)
        db.session.commit()
        return json_response(message="添加成功", data={
            "id": data.id
        })

    @use_kwargs({
        'plugins': fields.String(),
        'filename': fields.String()
    })
    def get(self, org_id):
        """数据源
          ---
          parameters:
            - name: org_id
              in: url
              type: string
              required: true
              description: 组织ID
          responses:
            200:
              examples:
                response: {"data": null, "message": "查询成功"}
        """
        pass