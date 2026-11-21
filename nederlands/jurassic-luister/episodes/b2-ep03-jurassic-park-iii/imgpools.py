# chapter number -> photo keys the auto-inserter may use; unknown keys (failed downloads) are dropped.
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from imgmap import IMG
_P = {
 1: ["badlands", "dig", "dig2", "quarry", "cleaning", "jackets", "wall", "vertebrae", "fossilab", "lab"],
 2: ["plane1", "plane2", "cockpit", "heli_cab", "napali", "kauai_aerial", "gps", "satphone1"],
 3: ["plane1", "plane2", "cockpit", "fog", "fog2", "clouds", "kauai_aerial", "kauai1", "gps", "gps2"],
 4: ["spino1", "spino2", "spino3", "jungle2", "jungle3", "fog", "plane2", "satphone1", "ferns"],
 5: ["jungle2", "ferns", "ferns2", "forest", "canopy", "trex", "trex2", "spino3", "river", "para1", "para2"],
 6: ["ruin", "ruin2", "lab", "stairs", "bunker", "camera", "raptor", "raptor2", "claw", "claw3", "tracks"],
 7: ["eggs1", "eggs2", "eggs3", "egg", "egg2", "raptor", "raptor2", "claw3", "printer"],
 8: ["river", "aviary1", "aviary2", "aviary3", "ptera1", "ptera2", "ptera3", "ptera4", "para1", "para2", "jungle2"],
 9: ["satphone1", "satphone2", "satphone3", "gps", "gps2", "code", "servers", "clouds", "river"],
 10: ["raptor", "raptor2", "claw", "claw3", "eggs1", "egg2", "fog", "heli_sky", "heli_land", "jungle2"],
 11: ["chinook", "marine_heli", "heli_sky", "sunset_heli", "kauai4", "napali2", "palms", "beach1", "helipad", "ptera2", "ptera4"],
}
POOLS = {c: [k for k in v if k in IMG] for c, v in _P.items()}
