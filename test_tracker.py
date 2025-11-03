#!/usr/bin/env python3
"""
Test Tracker using dbbasic-tsv
Tracks which components have been tested and when, to avoid re-testing unchanged files
"""

import hashlib
from pathlib import Path
from datetime import datetime
from dbbasic.tsv import TSV

# Initialize database
DB_PATH = Path("test-results")
DB_PATH.mkdir(exist_ok=True)

# Initialize TSV table
db = TSV("test-tracker", ["component", "file_hash", "last_tested", "passed", "issues_count"], data_dir=DB_PATH)

def get_file_hash(file_path):
    """Calculate SHA256 hash of a file"""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def needs_testing(component_name):
    """Check if a component needs testing (file changed or never tested)"""
    file_path = Path(f"docs/{component_name}.html")

    if not file_path.exists():
        return False, "file not found"

    current_hash = get_file_hash(file_path)

    # Query database for this component
    result = db.query_one(component=component_name)

    if not result:
        return True, "never tested"

    stored_hash = result["file_hash"]

    if current_hash != stored_hash:
        return True, f"file changed (was {stored_hash[:8]}..., now {current_hash[:8]}...)"

    return False, f"unchanged since {result['last_tested']}"

def record_test_result(component_name, passed, issues_count):
    """Record test result in database"""
    file_path = Path(f"docs/{component_name}.html")
    file_hash = get_file_hash(file_path)
    timestamp = datetime.now().isoformat()

    # Delete old record if exists
    existing = db.query_one(component=component_name)
    if existing:
        db.delete(component=component_name)

    # Insert new record
    db.insert({
        "component": component_name,
        "file_hash": file_hash,
        "last_tested": timestamp,
        "passed": "true" if passed else "false",
        "issues_count": str(issues_count)
    })

def get_test_status(component_name):
    """Get last test status for a component"""
    return db.query_one(component=component_name)

def list_all_status():
    """List test status for all components"""
    try:
        return list(db.all())
    except:
        return []

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 test_tracker.py <component-name>")
        print("       python3 test_tracker.py --list")
        sys.exit(1)

    if sys.argv[1] == "--list":
        print("\n📊 Test Status for All Components:\n")
        statuses = list_all_status()
        if not statuses:
            print("No components tested yet.")
        else:
            for status in statuses:
                passed = "✅" if status["passed"] == "true" else "❌"
                print(f"{passed} {status['component']:25s} | Issues: {status['issues_count']:2s} | Tested: {status['last_tested']}")
    else:
        component = sys.argv[1]
        needs_test, reason = needs_testing(component)

        if needs_test:
            print(f"🔄 {component} needs testing: {reason}")
        else:
            print(f"✓ {component} does not need testing: {reason}")
            status = get_test_status(component)
            if status:
                print(f"   Last result: {'PASSED' if status['passed'] == 'true' else 'FAILED'} with {status['issues_count']} issues")
