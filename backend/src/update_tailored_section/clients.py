import os

from dotenv import load_dotenv
import boto3

load_dotenv()


def get_user_table():
    db = boto3.resource("dynamodb")
    user_table = db.Table(os.getenv("USERTABLE_TABLE_NAME"))
    return user_table
