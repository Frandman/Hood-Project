var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.425884, lng: -3.68783},
    zoom: 14
  });
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

var types ={'1':'Museum','2':'Building','3':'Square','4':'Restaurant'};
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
];

/* Octopus */

var ViewModel = function () {
	self = this;
	var request = {};
	self.locations = ko.observableArray();

	for (var i =0; i < locationsData.length; i++){
		self.locations.push(new Loc(locationsData[i]));
	}

	self.types = ko.observableArray();

	for (var i = 1; i <= Object.keys(types).length; i++){
		self.types.push(types[i]);
	}

	self.currentLoc = ko.observable(self.locations()[0]);

	updateInfoWindow = function(loc){
		self.currentLoc(this);
		request.query = this.title();
		service(this, request);
	}

};


wikiInfoRequest = function (Loc){
	_url = "https://es.wikipedia.org/w/api.php?action=opensearch&search="+Loc.title()+"&format=json&callback=wikiCallback";
	$.ajax({
  		url: _url,
  		dataType: "jsonp"
		}).done(function(res){
			Loc.description(res[2][0]);
			Loc.urlinfo= res[3][0];
	});
}

function service(Loc,request){
	var service = new google.maps.places.PlacesService(map);
	service.textSearch(request, function(res){
		Loc.img_url = res[0].photos[0].getUrl({'maxWidth': 400, 'maxHeight': 1000});
	});
}

ko.applyBindings(new ViewModel());
