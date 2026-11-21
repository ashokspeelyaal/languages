import os, sys, importlib.util
_here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_here, '..', '..', 'engine'))
from fetch_commons import slug
_spec = importlib.util.spec_from_file_location('imgmap_ep01', os.path.join(_here, 'imgmap_ep01.py')); _m = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_m)
IMG = dict(_m.IMG)
_NEW = {
 "locust1": "Swarm of locusts.jpg", "locust2": "Locust (Swarming Grasshopper) during its Outbreak in South Asia.jpg", "locust3": "Swarm of Locusts.JPG",
 "locust4": "Desert locust - Wüstenheuschrecke - Criquet pèlerin - Schistocerca gregaria.jpg", "locust5": "Desert Locust, photographed at Bristol Zoo Project in 2024.jpg",
 "locust6": "Garden locust (Acanthacris ruficornis).jpg",
 "rice": "Paddy field in Tamil Nadu India.jpg", "rice2": "Rice Paddy Fields in Tamil Nadu.jpg", "cropfield_in": "Field of Tamil Nadu-1.jpg", "rice3": "Paddy fields in Tamil Nadu.jpg",
 "kaveri": "Kaveri Srirangam.jpg", "kaveri2": "Cauvery river.jpg", "kaveri3": "River Cauvery (3864282245).jpg",
 "wheat1": "Wheat field - geograph.org.uk - 6778299.jpg", "wheat2": "Khndzoresk, Wheat field, Armenia.jpg", "corn": "Maize field in Bavaria in Summer 2013.JPG", "corn2": "Maize field in Canterbury.jpg",
 "valletta": "Malta - Valletta - Republic Street 02.jpg", "valletta2": "Valletta, Republic Street.jpg", "valletta3": "Saint Christopher Street in Valletta (32711).jpg",
 "harbour": "Valletta Grand Harbour from Upper Barrakka Gardens.jpg", "harbour2": "Grand harbour 2019-04-11-6.jpg", "marsax": "Marsaxlokk Harbour - 54008537888.jpg",
 "market": "Street market in Marsaxlokk 12.jpg", "market2": "Is-Suq ta' Marsaxlokk.jpg", "market3": "Bargain at the market known as Il-Monti.jpg",
 "dolo1": "Sella group panorama.jpg", "dolo2": "Brenta Dolomites, view from Ritorto lodge 02.jpg", "dolo3": "Passo Pordoi-bops 01.jpg", "dolo4": "Alpe Di Siusi open meadow area.jpg", "dolo5": "Plätzwiese – meadow and huts looking south.jpg",
 "cabin": "Log Cabin in Duartmore Forest, Sutherland - geograph.org.uk - 5462360.jpg", "cabin2": "Log cabin in Warren Forest, North Yorkshire - geograph.org.uk - 1541734.jpg",
 "lake": "Lake Tahoe at morning - 7-2023.jpg", "sierra": "Golden Hour at Emerald Bay.jpg",
 "fire": "Lick Fire on the Umatilla National Forest burning at night.jpg", "wildfire": "Wildfire in Yellowstone National Park produces Pyrocumulus clouds1.jpg", "fire2": "WildfireKolmården2017.jpg",
 "plane": "C-130 cargo plane in Toronto.jpg", "plane2": "A Cathay Pacific Cargo Aircraft.jpg",
 "giga": "Giganotosaurus carolinii DSC 2950 white background.jpg", "giga2": "Giganotosaurus carolinii A74005320250206.jpg",
 "therizino": "Therizinosaurus arms.jpg", "therizino2": "Therizinosaurus OC Harfa Praha A.jpg", "quetzal": "Quetzalcoatlus 1.JPG", "quetzal2": "Quetzalcoatlus from below.jpg",
 "seeds": "Seedbank.jpg", "seeds2": "Svalbard Global Seed Vault - panoramio.jpg", "seeds3": "Millennium Seed Bank Project, Wakehurst Place, UK - Diliff.jpg",
 "un": "United Nations General Assembly Hall (3).jpg", "tower": "Shark Valley Observation Tower Panorama.jpg", "tower2": "Antietam observation tower MD2.jpg",
}
for k, t in _NEW.items(): IMG[k] = slug('File:' + t)
IMG["forest_us"] = IMG["forest"]; IMG["mnight"] = IMG["valletta3"]; IMG["micro"] = IMG["tips"]; IMG["ctrl2"] = IMG["ctrl2"]

IMG["cabin2"] = IMG["cabin"]; IMG["corn2"] = IMG["wheat2"]
