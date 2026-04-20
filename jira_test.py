import os
import json
import requests
from dotenv import load_dotenv
from atlassian import Jira

load_dotenv(override=True)

jira_url = os.getenv('JIRA_URL')
jira_email = os.getenv('JIRA_EMAIL')
jira_token = os.getenv('JIRA_API_TOKEN')

print(f"JIRA_URL loaded: {bool(jira_url)}")
print(f"JIRA_EMAIL loaded: {bool(jira_email)}")
print(f"JIRA_API_TOKEN loaded: {bool(jira_token)}")

jira = Jira(
    url=jira_url,
    username=jira_email,
    password=jira_token,
    cloud=True
)


def trigger_reassignment(key, new_assignee_id):
    # This is the 'Action' in your Action Layer
    jira.assign_issue(key, new_assignee_id)
    print(f"Orchestration Complete: Task {key} has been reassigned to {new_assignee_id}")


def send_discord_resilience_report(task_key, user_name, reason):
    webhook_url = os.getenv('TEAM_WEBHOOK_URL')

    if not webhook_url:
        print('Skipping Discord: No Webhook URL found.')
        return

    payload = {
        "embeds": [{
            "title": "🛡️ Zenius Resilience Action",
            "color": 3066993,
            "fields": [
                {"name": "Task Key", "value": task_key, "inline": True},
                {"name": "New Assignee", "value": user_name, "inline": True},
                {"name": "Reason for Orchestration", "value": reason}
            ],
            "footer": {"text": "System Status: Jira Synchronized ✅"}
        }]
    }

    response = requests.post(
        webhook_url,
        data=json.dumps(payload),
        headers={'Content-Type': 'application/json'},
        timeout=10,
    )

    if response.status_code == 204:
        print('Agentic Communication successfully sent to Discord.')
    else:
        print(f"Discord Error: {response.status_code}, {response.text}")

try:
    # Testing the "Action Layer" bridge
    issue_key = 'MDP-6'
    print(f"Fetching issue: {issue_key}")
    issue = jira.issue(issue_key)
    print(f"Connection Successful! Ticket Title: {issue['fields']['summary']}")

    # Get the reporter's AccountId (which is likely you)
    my_id = issue['fields']['reporter']['accountId']
    print(f"My AccountId is: {my_id}")

    # To test it, call the function
    trigger_reassignment(issue_key, my_id)

    reporter_name = issue['fields']['reporter'].get('displayName', my_id)
    send_discord_resilience_report(
        issue_key,
        reporter_name,
        'Reasoning Engine flagged high workload and triggered fallback reassignment.'
    )
except Exception as error:
    print(f"Jira test failed: {type(error).__name__}: {error}")