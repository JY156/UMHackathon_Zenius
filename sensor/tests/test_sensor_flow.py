# QA test cases

from app.processors.normalizer import normalize_event

def test_leave_trigger_detected():
    event = normalize_event("slack", "U123", "I'm sick today, emergency leave")
    assert "sick" in event.keywords_detected
    assert event.requires_clarification == False

def test_conflict_flagged():
    # Simulate external state showing recent task completion
    ext_state = {"recent_task_activity": True}
    event = normalize_event("slack", "U456", "I'm taking urgent leave", ext_state)
    assert event.conflict_flag == True
    assert event.requires_clarification == True

def test_feedback_decline():
    event = normalize_event("slack", "U789", "I'm too busy to take this task")
    assert event.feedback_type == "reassignment_declined"