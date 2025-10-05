import json
import sys
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.api.v1.keywords import EXPORT_HEADERS, build_export_row


def test_export_headers_include_expected_columns():
    assert EXPORT_HEADERS == [
        "keyword",
        "category",
        "status",
        "latest_flag",
        "latest_run_completed_at",
        "https_issues",
    ]


def test_build_export_row_handles_missing_values():
    keyword = SimpleNamespace(query="테스트", category=None, status="pending")
    row = build_export_row(keyword, None)
    assert row == ["테스트", "", "pending", "", "", ""]


def test_build_export_row_serializes_run_details():
    keyword = SimpleNamespace(query="sample", category="커머스", status="active")
    run = SimpleNamespace(
        flag="green",
        completed_at=datetime(2024, 1, 1, 12, 0, 0),
        https_issues={"count": 1, "warning": True},
    )
    row = build_export_row(keyword, run)
    assert row[0] == "sample"
    assert row[1] == "커머스"
    assert row[2] == "active"
    assert row[3] == "green"
    assert row[4] == "2024-01-01T12:00:00"
    assert row[5] == json.dumps(run.https_issues, ensure_ascii=False)
