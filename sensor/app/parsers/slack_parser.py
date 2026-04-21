# Handles Slack events/webhooks
def parse_slack_message(raw_data: dict):
    event = raw_data.get("event", {})
    return {
        "text": event.get("text"),
        "user_id": event.get("user"),
        "timestamp": event.get("ts"), # Slack uses 'ts' for timestamp
        "source": "slack"
    }