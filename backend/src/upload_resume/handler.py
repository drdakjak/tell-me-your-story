import json

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    # Log the event argument for debugging and for use in local development.
    print(json.dumps(event))

    return {}