var map;

/* Map Loader Function */

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.425884, lng: -3.68783},
    zoom: 14
  });
	this.loadImgInfo();
}

/* Location Model */

function Loc (data) {
	this.title = ko.observable(data.name);
	this.latlng = ko.observable(data.latlng);
	this.city = ko.observable("Madrid");
	this.country = ko.observable("Spain");
	this.type = ko.observable(types[data.type]);
	this.description = ko.observable();
	this.urlinfo = "";
	this.img_url = ko.observable();
	wikiInfoRequest(this);
};

/* types */

var types ={'1':'Museum','2':'Building','3':'Square'};

/* Data */

locationsData =[

	{'type': '1',
	 'name': 'Torres de Colon',
	 'latlng':{lat: -34.397, lng: 150.644}
	},

	{'type': '2',
	 'name': 'Museo del Prado',
	 'latlng':{lat: -34.397, lng: 150.644}
	},

	{'type': '3',
	 'name': 'Puerta del Sol',
	 'latlng':{lat: -3.70, lng: 40.41}
	},

	{'type': '3',
	 'name': 'Faro Moncloa',
	 'latlng':{lat: -3.70, lng: 40.41}
	},

	{'type': '3',
	 'name': 'Parque de el Retiro',
	 'latlng':{lat: -3.70, lng: 40.41}
	},
];

/* Octopus */

var ViewModel = function () {

	self = this;
	self.locations = ko.observableArray();

	for (var i =0; i < locationsData.length; i++){
		self.locations.push(new Loc(locationsData[i]));
	}

	self.types = ko.observableArray();

	for (var i = 1; i <= Object.keys(types).length; i++){
		self.types.push(types[i]);
	}

	self.currentLoc = ko.observable(self.locations()[0]);

	loadImgInfo = function(){
		var loc;
		var request = {};
		loc = self.locations()[0]
		request.query = loc.title();
		service(loc, request);
	}

	updateInfoWindow = function(loc){
		var request = {};
		self.currentLoc(loc);
		request.query = loc.title();
		service(loc, request);
	}
};


wikiInfoRequest = function (loc){
	_url = "https://es.wikipedia.org/w/api.php?action=opensearch&search="+loc.title()+"&format=json&callback=wikiCallback";
	$.ajax({
  		url: _url,
  		dataType: "jsonp"
		}).done(function(res){
			loc.description(res[2][0]);
			loc.urlinfo= res[3][0];
	});
}

function service(loc,request){
	var service = new google.maps.places.PlacesService(map);
	service.textSearch(request, function(res){
		loc.img_url(res[0].photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400}));
	});
}

ko.applyBindings(new ViewModel());
