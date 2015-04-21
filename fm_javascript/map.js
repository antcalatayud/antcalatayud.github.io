

dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Measurement");
dojo.require("esri.dijit.Scalebar");

dojo.require("esri.layers.FeatureLayer");

dojo.require("esri.map");
dojo.require("esri.tasks.locator");
dojo.require("esri.arcgis.utils");
dojo.require("esri.symbols.SimpleFillSymbol");
dojo.require("esri.symbols.SimpleLineSymbol");

dojo.require("esri.graphic");

dojo.require("dijit.TooltipDialog");
dojo.require("esri.Color");

dojo.require("esri.request");
dojo.require("esri.urlUtils");

dojo.require("esri.geometry.Point");
dojo.require("dojo._base.array");
dojo.require("esri.SpatialReference");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("esri.renderers.ClassBreaksRenderer");
dojo.require("esri.layers.GraphicsLayer");



var map;
var currentBasemap;
var geocoder;
var webmapResponse;
var BikeStationsLayer;



var basemaps = {"currentVersion":10.01,"folders":["Canvas","Demographics","Elevation","Reference","Specialty"],"services":[
	{"name":"NatGeo_World_Map","type":"MapServer", 'image':'bm-natgeo.jpg', 'title':'National Geographic'},
	{"name":"Ocean_Basemap","type":"MapServer", 'image':'bm-ocean.jpg', 'title':'Oceans'},
	{"name":"World_Imagery","type":"MapServer", 'image':'bm-imagery.jpg', 'title':'Imagery'},
	{"name":"World_Street_Map","type":"MapServer", 'image':'bm-street.jpg', 'title':'Street Map'},
	{"name":"World_Terrain_Base","type":"MapServer", 'image':'bm-terrain.png', 'title':'Terrain'},
	{"name":"World_Topo_Map","type":"MapServer", 'image':'bm-topo.jpg', 'title':'Topography'}]};

function init(){
	var urlObject = esri.urlToObject(document.location.href);
	urlObject.query = urlObject.query || {};
	var webmap = null;
	var embed = false;

	if (urlObject.query.embed && urlObject.query.embed === 'true') res.embedSetup();

	//check for webmap id
	if(urlObject.query.webmap) {
		//if (urlObject.query.embed && urlObject.query.embed === 'true') res.embedSetup();

		webmap = urlObject.query.webmap;
		var mapDeferred = esri.arcgis.utils.createMap(webmap, "map", {
			mapOptions : {
				slider : true,
				nav : false,
				wrapAround180 : true
			},
			ignorePopups : false,
			geometryServiceURL : "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
		});

		mapDeferred.addCallback(function(response){
			webmapResponse = response;

			//current basemap code
			currentBasemap = webmapResponse.itemInfo.itemData.baseMap.baseMapLayers[0].layerObject;

			map = response.map;
			if(map.loaded) {
				onMapLoaded();
			} else {
				dojo.connect(map, 'onLoad', onMapLoaded);
			}
		});

		mapDeferred.addErrback(function(error) {
			console.log("CreateMap failed: ", dojo.toJson(error));
			//alert("Unable to load Webmap - " + dojo.toJson(error));
		});

	} else {
		
		map = new esri.Map("map",{			
			wrapAround180 : true
		});

		dojo.connect(map, 'onLoad', onMapLoaded);

		//Add the topographic layer to the map. View the ArcGIS Online site for services http://arcgisonline/home/search.html?t=content&f=typekeywords:service
		var basemap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer", {
				id: 'basemap'
			});
		currentBasemap = basemap;
		map.addLayer(currentBasemap);
		
		
		var ContinentContent = "<b>Number of Services</b>: ${Join_Count}"
		var ContinentTemplate = new esri.InfoTemplate("${CONTINENT}",ContinentContent);
		var CountryContent = "<b>Number of Services</b>: ${Join_Count}"
		var CountryTemplate = new esri.InfoTemplate("${CNTRY_NAME}",CountryContent);		
		var BikesTemplate = new esri.InfoTemplate("${location_c}");
		BikesTemplate.setContent(getTextContent);

		//Add some basic layers
		 var Continents = new esri.layers.FeatureLayer("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/arcgis/rest/services/Continents/FeatureServer/0", {
			 mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
			 outFields: ["*"],
			 infoTemplate: ContinentTemplate
		});
		var Countries = new esri.layers.FeatureLayer("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/arcgis/rest/services/Countries/FeatureServer/0", {
			 mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
			 outFields: ["*"],
			 infoTemplate: CountryTemplate
		});
		var BikeServices = new esri.layers.FeatureLayer("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/arcgis/rest/services/Bikes/FeatureServer/0", {
			 mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
			 outFields: ["*"],
			 infoTemplate: BikesTemplate
		});
		
		
		map.addLayers([Continents,Countries,BikeServices]);
		
	}		
}
function getTextContent(graphic) {
	var attr = graphic.attributes;
	JsonRef =  attr.href;
	
	var title = attr.location_c;
	map.infoWindow.setTitle(title);
	
	var content =  "<b>Service name</b>: "+ attr.name +
                    "<br><b>Company</b>: "+ attr.company +
					"<br><b>Get bike stations (<a href='#' onclick=' getStations()' >show</a>)</b><br>"
	
	
	return content;
	
}


function getStations(feature){
	map.infoWindow.hide();
	//dom.byId("url").value = "http://developers.arcgis.com/javascript/samples/layers_point_clustering/data/1000-photos.json"
	
	var xmlhttp = new XMLHttpRequest();
	var url = JsonRef;

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var myArr = JSON.parse(xmlhttp.responseText);
			getStationsBikes(myArr);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
	
	
}
function getStationsBikes(arr) {
	BikeStationsLayer = new esri.layers.GraphicsLayer();
	//BikeStationsLayer.clear();
	var wgs = new esri.SpatialReference({
			"wkid": 4326
		});
	var CityPt = new esri.geometry.Point(arr.network.location.longitude,arr.network.location.latitude,wgs)
	map.centerAndZoom(CityPt, 12);
	map.graphics.clear();
	var out = "";
    var i;
	
	// var symbol = new esri.symbol.SimpleMarkerSymbol();
	// symbol.style = esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE;
	// symbol.setSize(8); symbol.setColor(new dojo.Color([255,255,0,0.5]));
// //var renderer = new esri.renderer.SimpleRenderer(symbol);
	// var renderer = new esri.renderer.ClassBreaksRenderer(symbol, "PERCENTAGE");
// renderer.addBreak(0,4, new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0,0.5]))); 
 // renderer.addBreak(4,10,new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 255, 0,0.5]))); 
// renderer.addBreak(10,100,new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0,255,0,0.5])));

// var infoTemplate = new esri.InfoTemplate("Station details","Station Name: ${Name} <br/> Bikes available: ${FreeBikes} <br/>Empty slots:${EmptySlots}");
	
	
    for(i = 0; i < arr.network.stations.length; i++) {
		StatName = arr.network.stations[i].name
		StatLat = arr.network.stations[i].latitude;
		StatLong = arr.network.stations[i].longitude;
		StatEmpty = arr.network.stations[i].empty_slots;
		StatFree = arr.network.stations[i].free_bikes;
		StatTotal = StatEmpty + StatFree;
		StatPercFree = (StatFree*100)/StatTotal;
		
		var pt = new esri.geometry.Point(StatLong,StatLat,wgs);
		var sms = new esri.symbol.SimpleMarkerSymbol();
		var path = "M 313.00000,294.00000 C 324.00000,290.00000 330.00000,279.00000 330.00000,259.00000 L 330.00000,230.00000 L 263.00000,231.00000 C 225.00000,232.00000 203.00000,234.00000 213.00000,237.00000 C 245.00000,245.00000 230.00000,260.00000 190.00000,260.00000 C 168.00000,260.00000 150.00000,256.00000 150.00000,250.00000 C 150.00000,244.00000 157.00000,240.00000 165.00000,240.00000 C 183.00000,240.00000 185.00000,214.00000 168.00000,203.00000 C 161.00000,199.00000 134.00000,195.00000 108.00000,195.00000 C 29.000000,195.00000 -14.000000,133.00000 16.000000,62.000000 C 31.000000,24.000000 86.000000,-4.0000000 125.00000,6.0000000 C 139.00000,9.0000000 161.00000,25.000000 174.00000,41.000000 C 203.00000,75.000000 235.00000,81.000000 227.00000,50.000000 C 224.00000,39.000000 225.00000,30.000000 230.00000,30.000000 C 234.00000,30.000000 240.00000,40.000000 244.00000,53.000000 C 247.00000,65.000000 273.00000,100.00000 301.00000,130.00000 C 329.00000,160.00000 344.00000,174.00000 336.00000,160.00000 C 318.00000,132.00000 315.00000,78.000000 331.00000,48.000000 C 348.00000,16.000000 405.00000,-3.0000000 445.00000,10.000000 C 501.00000,28.000000 528.00000,98.000000 500.00000,151.00000 C 484.00000,179.00000 432.00000,203.00000 398.00000,196.00000 C 374.00000,191.00000 368.00000,194.00000 359.00000,218.00000 C 353.00000,233.00000 348.00000,256.00000 347.00000,270.00000 C 345.00000,289.00000 339.00000,295.00000 320.00000,297.00000 C 305.00000,298.00000 302.00000,297.00000 313.00000,294.00000 z M 308.00000,168.00000 C 254.00000,102.00000 241.00000,105.00000 216.00000,188.00000 C 209.00000,209.00000 211.00000,210.00000 276.00000,210.00000 L 343.00000,210.00000 L 308.00000,168.00000 z M 213.00000,138.00000 C 227.00000,97.000000 227.00000,90.000000 214.00000,90.000000 C 206.00000,90.000000 200.00000,97.000000 200.00000,105.00000 C 200.00000,114.00000 193.00000,134.00000 185.00000,151.00000 C 176.00000,167.00000 172.00000,185.00000 176.00000,191.00000 C 185.00000,206.00000 195.00000,192.00000 213.00000,138.00000 z M 133.00000,173.00000 C 137.00000,170.00000 129.00000,152.00000 115.00000,134.00000 C 84.000000,93.000000 84.000000,90.000000 118.00000,89.000000 C 133.00000,89.000000 153.00000,85.000000 163.00000,82.000000 C 180.00000,75.000000 179.00000,73.000000 160.00000,52.000000 C 131.00000,21.000000 95.000000,14.000000 65.000000,34.000000 C 13.000000,68.000000 10.000000,123.00000 57.000000,160.00000 C 82.000000,180.00000 120.00000,186.00000 133.00000,173.00000 z M 465.00000,155.00000 C 516.00000,105.00000 485.00000,26.000000 415.00000,26.000000 C 369.00000,26.000000 340.00000,57.000000 340.00000,106.00000 C 340.00000,152.00000 356.00000,157.00000 386.00000,120.00000 C 419.00000,81.000000 430.00000,88.000000 400.00000,128.00000 C 388.00000,145.00000 381.00000,163.00000 384.00000,169.00000 C 396.00000,188.00000 440.00000,181.00000 465.00000,155.00000 z M 180.00000,113.00000 C 180.00000,100.00000 139.00000,95.000000 127.00000,106.00000 C 124.00000,110.00000 128.00000,124.00000 137.00000,137.00000 C 153.00000,161.00000 154.00000,161.00000 167.00000,144.00000 C 174.00000,134.00000 180.00000,120.00000 180.00000,113.00000 z "
		sms.setPath(path);
		
		if (StatPercFree == 0) {
			sms.setColor(new esri.Color([255, 0, 0, 0.5]));		
			sms.setSize(30);
		}
		else if (StatPercFree > 0 && StatPercFree <= 25) {
			sms.setColor(new esri.Color([255, 137, 0, 0.5]));
			sms.setSize(35);
		}
		else if (StatPercFree > 25 && StatPercFree <= 50) {
			sms.setColor(new esri.Color([255, 137, 0, 0.5]));
			sms.setSize(40);
		} else if (StatPercFree > 50 && StatPercFree <= 75) {
			sms.setColor(new esri.Color([0, 255, 0, 0.5]));
			sms.setSize(45);
		}
		else {
			sms.setColor(new esri.Color([0, 0, 255, 0.5]));	
			sms.setSize(50);
		}
		
		var attr = {"NAME":StatName,"EMPTY":StatEmpty,"FREE":StatFree,"PERCENTAGE":StatPercFree};
		var infoTemplate = new esri.InfoTemplate("Station details","Station Name: ${NAME} <br/> Bikes available: ${FREE} <br/>Empty slots:${EMPTY}");
		var graphic = new esri.Graphic(pt,sms,attr,infoTemplate);
		//var graphic = new esri.Graphic(pt);
		map.graphics.add(graphic);
		
		//BikeStationsLayer.add(graphic);
		
		
    }
		//BikeStationsLayer.setRenderer(renderer);
		//map.addLayer(BikeStationsLayer);
		//applyrendered(BikeStationsLayer);	

}

function applyrendered(Graphics_Attr){
	// //var attr = Graphics_Attr.graphics.attributes.percentage;
	// var symbol = new esri.symbol.SimpleMarkerSymbol();
	// symbol.style = esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE;
	// symbol.setSize(8); symbol.setColor(new dojo.Color([255,255,0,0.5]));
	// //var renderer = new esri.renderer.SimpleRenderer(symbol);
	// var renderer = new esri.renderer.ClassBreaksRenderer(symbol, "PERCENTAGE");
	// renderer.addBreak(0,4, new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0,0.5]))); 
	// renderer.addBreak(4,10,new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 255, 0,0.5]))); 
	// renderer.addBreak(10,100,new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0,255,0,0.5])));
	
	// BikeStationsLayer.setRenderer(renderer);
	// //map.graphics.setRenderer(renderer);
}

function queryGeolocation(){
	window.alert("ji");
	
	
}

function onMapLoaded() {
	console.log('map loaded enter');

	//initialize map elements
	var scalebar = new esri.dijit.Scalebar({
		map:map,
		attachTo:"bottom-left",
		scalebarUnit: 'metric'
	});
	//$(".esriScalebarLabel").each(function(){
	//	this.style.width = 'auto';
	//}

	// //add measurement tool
	// var measurement = new esri.dijit.Measurement({
			// map: map
	// }, dojo.byId('measurementDiv'));
	// measurement.startup();

	//create legend - only show legend for operational & graphic layers

	var legend = null;
	var layerInfos = [];
	if(webmapResponse && webmapResponse.itemInfo && webmapResponse.itemInfo.itemData && webmapResponse.itemInfo.itemData.operationalLayers.length > 0) {
		dojo.forEach(webmapResponse.itemInfo.itemData.operationalLayers, function(layer) {
			layerInfos.push({"title":layer.title,"layer":layer.layerObject});
		});
	}

	if (layerInfos.length > 0 && false){
		var legend = new esri.dijit.Legend({
			map : map,
			layerInfos : layerInfos,
			respectCurrentMapScale : true
		}, "fm_legendDiv");
		legend.startup();
	}
	else{
		var legend = new esri.dijit.Legend({
			map : map,
			//layerInfos : layerInfos,
			respectCurrentMapScale : true
		}, "fm_legendDiv");
		legend.startup();
	}

	//populate information for map
	if(webmapResponse && webmapResponse.itemInfo && webmapResponse.itemInfo.item){
		res.populateMapInfo(webmapResponse.itemInfo.item);
	}
	//keep map coords updated
	dojo.connect(map, 'onMouseMove', res.showCoords);
	res.showCoords(map.extent.getCenter());
	//keep map info updated
	dojo.connect(map, 'onExtentChange', onMapExtentChange);
	onMapExtentChange();

	//call appropriate popup based on device type
	if(res.mobile) switchToMobile();
	else switchToDesktop();

	console.log('map loaded exit');
}

function onMapExtentChange() {
	var scale = Math.round(esri.geometry.getScale(map));
	if (scale <= 9244649 && scale >= 1155581){
		map.graphics.clear();
		
		var elem = document.createElement("img");
		elem.src = 'images/BikeLegend.PNG';
		elem.id = "HeatMapPic";
		
		if ($('#HeatMapPic').length > 0) {
			// exists.
			//Do nothing
		}
		else{
			document.getElementById("fm_legendDiv").appendChild(elem);			
		}
		
		//document.getElementById("fm_legendDiv").innerHTML = "HeatMap";	
	}
	else if (scale < 1155581) {
		var elem = document.createElement("img");
		elem.src = 'images/BikeLegend.PNG';
		elem.id = "BikesPic";
		
		if ($('#BikesPic').length > 0) {
			// exists.
			//Do nothing
		}
		else{
			document.getElementById("fm_legendDiv").appendChild(elem);			
		}	
	}
	else{
		map.graphics.clear();
	}
	if (scale > 999 && scale <= 999999) {
		scale = Math.round(scale / 1000) + " <b>K</b>";
	} else if (scale > 999999) {
		scale = Math.round(scale / 1000000) + " <b>M</b>";
	} else if (scale > 0 && scale <= 999) {
		scale = Math.round(scale) + " <b>Ft</b>";
	}

	res.updateScaleInfo( scale, map.getLevel() );
	
	
}

function getBasemaps(){
	//add request to get basemaps
	showBasemaps(basemaps.services);
}

function getBasemapUrl(service){
	return 'http://server.arcgisonline.com/ArcGIS/rest/services/' + service.name + '/' + service.type;
}

function showBasemaps(basemaps){
	var code = '';
	for(i = 0; i < basemaps.length; i++){
		var basemap = basemaps[i];
		if (basemap.type === 'MapServer'){
			//code += "<p class='fm_container' >";
			code += "<a href='#' data-name='" + basemap.name + "' class='fm_basemap_option' >"
					+ "<img src='images/" + basemap.image + "' class='fm_basemap_image' />"
					+ "<label>" + basemap.title + "</label>";
					+ "</a>";
			//code += "</p>";
		}
	}
	$("#basemapList").html(code);
}

function setBasemap(name){
	for(i = 0; i < basemaps.services.length; i++){
		if (basemaps.services[i].name === name){
			if (currentBasemap) map.removeLayer(currentBasemap);

			currentBasemap = new esri.layers.ArcGISTiledMapServiceLayer( getBasemapUrl(basemaps.services[i]),{
				id: 'basemap'
			});
			map.addLayer(currentBasemap);
			return true;
		}
	}
}

function addLegend(results){
	console.log('adding legend');

	var layerInfo = dojo.map(results, function(layer,index){
		return {layer:layer.layer,title:layer.layer.name};
	});
	if(layerInfo.length > 0){
		var legendDijit = new esri.dijit.Legend({
		map:map,
		layerInfos:layerInfo
		},'fm_legendDiv');
	legendDijit.startup();
	}
}

dojo.ready(init);

//** helpers ** DO NOT OVERWRITE
function switchToMobile(){
	//dojo.require("esri.dijit.Popup");
//dojo.require("esri.dijit.PopupMobile");
	console.log('switch to mobile popup');
	require(['esri/dijit/PopupMobile'], function(){
		if (esri && dojo && map && map.loaded){
			console.log('changing popup type to mobile');
			var popupDijit = new esri.dijit.PopupMobile(null, dojo.create("div"));
			map.setInfoWindow(popupDijit);
		}
	});
}

function switchToDesktop(){
	console.log('switch to desktop popup');
	require(['esri/dijit/Popup'], function(){
		if (esri && dojo && map && map.loaded){
			console.log('changing popup type to desktop');
			var popupDijit = new esri.dijit.Popup(null, dojo.create("div"));
			map.setInfoWindow(popupDijit);
		}
	});
}

function showZoomControl(){
	if (!( hasTouch() ) && map ) map.showZoomSlider();
}
function hideZoomControl(){
	if ( hasTouch() && map ) map.hideZoomSlider();
}

function locateAddress(evt, addr) {
    if (evt) {
        if (evt.keyCode != dojo.keys.ENTER) {
            return;
        }
    }

	$(".fm_search").hide();
	$(".fm_location_input").val('');

	String.prototype.trim = function () {
        return this.replace(/^\s*/, "").replace(/\s*$/, "");
    };
    //var address = dojo.byId("address").value.trim();
    var address = addr.trim();

    if (!geocoder) {
        geocoder = new esri.tasks.Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
        geocoder.outSpatialReference = map.spatialReference;
    }

    if (address && address !== "") {

        geocoder.addressToLocations({
            "SingleLine": address
        }, ['*'], function (geocodeResults) {
            if (geocodeResults.length > 0) {
                var attr = geocodeResults[0].attributes;
                if (map.getLevel() < 8) {
                    map.centerAndZoom(geocodeResults[0].location, 7);
                } else
                    map.centerAt(geocodeResults[0].location);
                setTimeout(function () {
                    var fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 3), new dojo.Color(0, 0, 0, 0));
                    animateGraphicSymbol(new esri.Graphic(map.extent.expand(0.8), fillSymbol));
                }, 500);
            } else {
                alert("Address not found");
            }
        }, function (err) {
            debug(dojo.toJson(err));
        });
    }
}

function animateGraphicSymbol(g) {
    var opacity = 1.0;
    var color = g.symbol.color;
    var type = g.geometry.type;
    var symbol = g.symbol;
    //console.log(type);
    if (type == "extent") {
        symbol.outline.color.a = opacity;
        symbol.color.a = 0.0;
    } else {
        symbol.color.a = opacity;
    }
    map.graphics.add(g);
    //console.log(g.symbol.color);

    var interval = setInterval(function () {
        if (type != "extent") {
            symbol.setColor(new dojo.Color([color.r, color.g, color.b, opacity]));
        }
        if (symbol.outline) {
            var ocolor = symbol.outline.color;
            symbol.outline.setColor(new dojo.Color([ocolor.r, ocolor.g, ocolor.b, opacity]));
        }
        g.setSymbol(symbol);
        if (opacity < 0.01) {
            clearInterval(interval);
            map.graphics.remove(g);
        }
        opacity -= 0.01;
    }, 20);
}
//** end helpers **

/* window events */
window.onorientationchange = function(){
	if (map) {
		map.resize();
	} else console.log('map not found');
}

window.onresize = function(){
	if (map) {
		map.resize();
	} else console.log('map not found');
}