import sys
from pathlib import Path

BACKEND_PATH = Path(__file__).resolve().parents[2]
if str(BACKEND_PATH) not in sys.path:
    sys.path.insert(0, str(BACKEND_PATH))
