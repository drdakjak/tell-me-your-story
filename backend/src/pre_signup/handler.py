import json

def handler(event, context):
    # Auto confirm the user
    print(event) # TODO: Remove this line
    event['response']['autoConfirmUser'] = True

    # Set the email as verified if it's in the request
    if 'email' in event['request']['userAttributes']:
        event['response']['autoVerifyEmail'] = True

    # Set the phone number as verified if it's in the request
    if 'phone_number' in event['request']['userAttributes']:
        event['response']['autoVerifyPhone'] = True

    # Return to Amazon Cognito
    return event