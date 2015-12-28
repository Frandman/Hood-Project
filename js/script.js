
'use strict'

/* Variable initialization */

var map;
var infowindow;
var markers=[];
var locationsData;

/* Map Loader Function */

function initMap() {
  		map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 40.425884, lng: -3.68783},
   		zoom: 12
  	});
  	infowindow = new google.maps.InfoWindow;
  	ko.applyBindings(new ViewModel());
}

/* Location Constructor */

function Loc (data) {
	var self = this;
	self.title = ko.observable(data.name);
	self.latlng = ko.observable(data.latlng);
	self.city = ko.observable("Madrid");
	self.country = ko.observable("Spain");
	self.type = ko.observable(types[data.type]);
	self.description = ko.observable();
	self.urlinfo = ko.observable();
	self.img_small = ko.observable();
	self.img_large = ko.observable();
	self.map = map;
	self.contentString = ko.observable();
	wikiInfoRequest(self);
	var request = {};
	request.query = data.name;
	loadLocImg(self, request);
}

/* types */

var types ={'1':'Museum','2':'Building','3':'Square'};

/* Hardcoded Data */

locationsData =[

	{'type': '1',
	 'name': 'Torres de Colon',
	 'latlng':{lat: 40.4255386, lng: -3.6931735}
	},

	{'type': '2',
	 'name': 'Museo del Prado',
	 'latlng':{lat: 40.4137818, lng: -3.6943211}
	},

	{'type': '3',
	 'name': 'Estación de Atocha',
	 'latlng':{lat: 40.4372767, lng: -3.7237375}
	},

	{'type': '3',
	 'name': 'Museo del romanticismo',
	 'latlng':{lat: 40.4259033, lng: -3.70096}
	},

	{'type': '3',
	 'name': 'Plaza de Castilla',
	 'latlng':{lat: 40.4657783, lng: -3.6908562}
	},
];

/* Octopus */

var ViewModel = function () {

	var self = this;
	self.query = ko.observable("");
	self.locations = ko.observableArray();
	for (var i =0; i < locationsData.length; i++){
		self.locations.push(new Loc(locationsData[i]));
	}

	self.types = ko.observableArray();

	for (var i = 1; i <= Object.keys(types).length; i++){
		self.types.push(types[i]);
	}

	self.currentLoc = ko.observable(self.locations()[0]);

	self.updateInfoWindow = function(loc){
		self.currentLoc(loc);
		if (infowindow){
			infowindow.close();
		}
		infowindow.setContent(loc.contentString());
		infowindow.open(map, loc.marker);
		toggleAnimation(loc.marker);

	}

	self.search = ko.computed(function() {
    	return ko.utils.arrayFilter(self.locations(), function(location) {
    		return location.title().toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
        });
    });

    self.search.subscribe(function() {
        setVisibilty(self.search());
    });
};

/* Load wikipedia Info */

 function wikiInfoRequest(loc){
	var _url = "https://es.wikipedia.org/w/api.php?action=opensearch&search="+loc.title()+"&format=json&callback=wikiCallback";
	$.ajax({
  		url: _url,
  		dataType: "jsonp"
		}).done(function(res){
				loc.description(res[2][0]);
				loc.urlinfo(res[3][0]);
		}).fail(function() {
    			loc.description("wikipedia");
  });
}

/* Load images from Google Maps API and generates markers */

function loadLocImg(loc,request){
	var service = new google.maps.places.PlacesService(map);
	service.textSearch(request, function(res){
		if (res){
			console.log(res[0]);
			var url_small = res[0].photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
			var url_large = res[0].photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400});
			loc.img_small(url_small);
			loc.img_large(url_large);
			loc.contentString('<div class="container infowindow">'+
									'<div class="row iw-title">'+
							       		'<h1>'+loc.title()+'</h1>'+
							       	'</div>'+
							       	'<div class="row">'+
							        	'<img class="img-responsive" src="'+url_small+'">'+
							        '</div>'+
							        '<div class="row iw-description">'+
							        	'<p>'+loc.description()+'</p>'+
							        '</div>'+
							   '</div>');
		}

		else {
			loc.img_small('img/error.png');
			loc.contentString('<h1>Error retrieving location info</h1>');
		};

		loc.infowindow = new google.maps.InfoWindow({
	    		content: loc.contentString()
	    });

    	loc.marker = new google.maps.Marker({
    		position: loc.latlng(),
    		map: map,
    		title: loc.title(),
    		animation: google.maps.Animation.DROP
  		});

		loc.marker.addListener("click", function(){
			loc.infowindow.open(map, this);
			toggleAnimation(this);
		})
		markers.push(loc.marker);
	});
}

/* Handle markers visibility depending on search */

var setVisibilty = function(filteredLocations) {
    for (var i = 0; i < markers.length; i++) {
        for (var j = 0; j < filteredLocations.length; j++) {
            var filteredMark = filteredLocations[j];
            if (filteredMark.title() === markers[i].title) {
                markers[i].setVisible(true);
                break;

            } else {
                markers[i].setVisible(false);
            }
        }
    }
}

function toggleAnimation(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.DROP);
  }
}



