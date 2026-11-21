"""Episode data lives in script.txt (single source). This file only loads it (see engine/dsl.py)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'engine'))
from dsl import load
load(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'script.txt'))
