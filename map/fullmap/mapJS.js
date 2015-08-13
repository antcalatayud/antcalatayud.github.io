var layer, legend;

        require([
				"dojo/dom",
				"dojo/on",
				
				"esri/map",
                "esri/dijit/Scalebar",
                "application/bootstrapmap",
                "esri/dijit/LocateButton",
                "esri/dijit/HomeButton",
                "esri/dijit/Search",
                "esri/layers/FeatureLayer",
                "esri/dijit/Legend",
                "esri/renderers/smartMapping",
				"esri/tasks/query", "esri/tasks/QueryTask",
				"esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol",
				 "esri/graphic", "esri/lang","esri/Color",

                "dojo/_base/array",
                
                "dojo/dom-construct",
                "dojo/data/ItemFileReadStore",
                "dijit/form/FilteringSelect",
                "dojo/parser",

                "dijit/layout/BorderContainer",
                "dijit/layout/ContentPane",

                "dojo/domReady!"
            ],
            function(dom,
				on,
				Map,
                Scalebar,
                BootstrapMap,
                LocateButton,
                HomeButton,
                Search,
                FeatureLayer,
                Legend, 
				smartMapping,Query, QueryTask,
				SimpleFillSymbol,SimpleLineSymbol,
				 Graphic, esriLang,
				Color,

                array,
                domConstruct,
                ItemFileReadStore,
                FilteringSelect,
                parser) {

                parser.parse();

                ////
                //////MAP
                ////
                var map = BootstrapMap.create("mapDiv", {
                    basemap: "gray",
                    center: [-102.45, 37.77],
                    zoom: 4,
                    scrollWheelZoom: true
                });
                ////
                //////SCALE BAR
                ////
                var scalebar = new Scalebar({
                    map: map,
                    scalebarUnit: "dual"
                });
                ////
                //////GEOLOCATION
                ////
                var geoLocate = new LocateButton({
                    map: map
                }, "LocateButton");
                geoLocate.startup();
                ////
                //////HOME BUTTON
                ////
                var home = new HomeButton({
                    map: map
                }, "HomeButton");
                home.startup();
                ////
                //////SEARCH
                ////
                // var s = new Search({
                    // map: map
                // }, "search");
                // s.startup();
                ////
                //////Fields
                ////

                var fieldName = "Lung_Measu";

                var fields = {
                    "Lung_Measu": "Lung Cancer Deaths (per 100,000 people per Sq. Mi.)",
                    "Colon_Meas": "Colon Cancer Deaths (per 100,000 people per Sq. Mi.)",
                    "Infant_Mea": "Infant Mortality Rate (Deaths per 1,000)"
                };
                var outFields = ["Lung_Measu", "Colon_Meas", "Infant_Mea"];
				 var outFieldsQ = ["County_NAM","Lung_Measu", "Colon_Meas", "Infant_Mea"];

                ////
                //////LAYERS
                ////			
                layer = new FeatureLayer("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/ArcGIS/rest/services/All_Disseases/FeatureServer/0", {
                    "id": "Disseases",
                    "mode": FeatureLayer.MODE_SNAPSHOT,
                    "outFields": outFields,
                    "opacity": 0.8
                });
                map.addLayer(layer);

                //var QualityLayer = new FeatureLayer ("http://gispub.epa.gov/arcgis/rest/services/ORD/EnvironmentalQualityIndex/MapServer/1", {
                //	"mode": FeatureLayer.MODE_ONDEMAND, 
                //	"outFields":["*"],
                //	"opacity":0.8
                //}); 
                //map.addLayers([ QualityLayer]);
				
				var queryTask = new QueryTask("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/ArcGIS/rest/services/All_Disseases/FeatureServer/0");
				
				var query = new Query();
				query.returnGeometry = true;
				query.outFields = outFieldsQ;
				
				var highlightSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID, 
					new SimpleLineSymbol(
						SimpleLineSymbol.STYLE_SOLID, 
					new Color([255,0,0]), 3
					), 
				new Color([125,125,125,0.35])
				);
				
				
				on(dom.byId("execute"), "click", execute);
				
				on(dom.byId("clearGraphics"), "click", clearGraphicsFun);
				function clearGraphicsFun(){
					map.graphics.clear();				
				}
				function execute () {
					map.graphics.clear();
				var queryTextString = ""
				var lungValueMax =  $("#LungSlider").slider("values")[1];
				var lungValueMin = $("#LungSlider").slider("values")[0];
				var colonValueMax =  $("#ColonSlider").slider("values")[1];
				var colonValueMin = $("#ColonSlider").slider("values")[0];
				
				var infantValueMax =  $("#InfantSlider").slider("values")[1];
				var infantValueMin = $("#InfantSlider").slider("values")[0];
				
				var airValueMax =  $("#AirSlider").slider("values")[1];
				var airValueMin = $("#AirSlider").slider("values")[0];
				
				var waterValueMax =  $("#WaterSlider").slider("values")[1];
				var waterValueMin = $("#WaterSlider").slider("values")[0];
				
				var landValueMax =  $("#LandSlider").slider("values")[1];
				var landValueMin = $("#LandSlider").slider("values")[0];
				
					//Build Query
					if (document.getElementById('LungCheckBox').checked) {						
						queryTextString = "(Lung_Measu BETWEEN '" + lungValueMin + "' AND '" + lungValueMax + "')"; 
					} 					
					if (document.getElementById('ColonCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "(Colon_Meas BETWEEN '" + colonValueMin  + "' AND '" + colonValueMax + "')";
						}
						else{
							queryTextString = queryTextString + " AND (Colon_Meas BETWEEN '" + colonValueMin + "' AND '" + colonValueMax + "')";
						}
					}					
					if (document.getElementById('InfantCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "(Infant_Mea BETWEEN '" + infantValueMin + "' AND '" + infantValueMax + "')";
						}
						else{
							queryTextString = queryTextString + "AND (Infant_Mea BETWEEN '" + infantValueMin + "' AND '" + infantValueMax + "')";
						}
					}
					
					if (document.getElementById('AirCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "Air_Mea >= '" + AirValue + "'";
						}
						else{
							queryTextString = queryTextString + "AND Air_Mea >= '" + AirValue + "'";
						}
					}
				
				
				
				
				
				
				if (queryTextString == "")
					{
						alert("Please select one variable");
						return;
					}
					else{
						query.where = queryTextString;
					}
				 
				  
				  queryTask.execute(query, showResults);
				}
				
				layer.on("click", function(evt){
					var t = "<b>${County_NAM}</b><hr><b>Lung Cancer Deaths (per 100,000 people per Sq. Mi.): </b>${Lung_Measu:NumberFormat}<br>"
						+ "<b>Colon Cancer Deaths (per 100,000 people per Sq. Mi.) per Sq. Mi.: </b>${Colon_Meas:NumberFormat}<br>"
						+ "<b>Infant Mortality Rate ( Deaths per 1,000): </b>${Infant_Mea:NumberFormat}";
  
						var content = esriLang.substitute(evt.graphic.attributes,t);
						
						dom.byId("InformationArea").innerHTML = content;
				});
				function showResults (results) {
				  var resultItems = [];
				  var resultCount = results.features.length;
				  if (resultCount == 0)				  
				  {
					alert("No results, please try again");
					return;				  
				  }
				  for (var i = 0; i < resultCount; i++) {
					var highlightGraphic = new Graphic(results.features[i].geometry,highlightSymbol);
					map.graphics.add(highlightGraphic);
				  }
				}

                layer.on("load", function() {
                    createRenderer(fieldName);
                });
				
				on(dom.byId("DiseasesLayersOnOff"), "change", updateLayerVisibility);
				
				function updateLayerVisibility()
				{
					
					layer.visible = false;
				};

                function createRenderer(field) {
                    //smart mapping functionality begins
                    smartMapping.createClassedColorRenderer({
                        layer: layer,
                        field: field,
                        basemap: map.getBasemap(),
                        classificationMethod: "quantile"
                    }).then(function(response) {
                        layer.setRenderer(response.renderer);
                        layer.redraw();
                        createLegend(map, layer, field);
                    });
                }

                //this function gets called when fields are selected to render
                function updateAttribute(ch) {
                    map.infoWindow.hide();

                    createRenderer(ch);
                    layer.redraw();
                    createLegend(map, layer, ch);
                }

                //Create a legend
                function createLegend(map, layer, field) {
                    //If applicable, destroy previous legend
                    if (legend) {
                        legend.destroy();
                        domConstruct.destroy(dom.byId("legendDiv"));
                    }

                    // create a new div for the legend
                    var legendDiv = domConstruct.create("div", {
                        id: "legendDiv"
                    }, dom.byId("legendWrapper"));

                    legend = new Legend({
                        map: map,
                        layerInfos: [{
                            layer: layer,
                            title: "Attributte: " + field
                        }]
                    }, legendDiv);
                    legend.startup();
                }

                // create a store and a filtering select for the county layer's fields
                var fieldNames, fieldStore, fieldSelect;
                fieldNames = {
                    "identifier": "value",
                    "label": "name",
                    "items": []
                };
                array.forEach(outFields, function(f) {
                    if (array.indexOf(f.split("_"), "NAME") == -1) { // exclude attrs that contain "NAME"
                        fieldNames.items.push({
                            "name": fields[f],
                            "value": f
                        });
                    }
                });

                fieldStore = new ItemFileReadStore({
                    data: fieldNames
                });

                fieldSelect = new FilteringSelect({
                        displayedValue: fieldNames.items[0].name,
                        value: fieldNames.items[0].value,
                        name: "fieldsFS",
                        required: false,
                        store: fieldStore,
                        searchAttr: "name",
                        style: {
                            "width": "290px",
                            "fontSize": "12pt",
                            "color": "#444"
                        }
                    },
                    domConstruct.create("div", null, dom.byId("fieldWrapper")));
					fieldSelect.on("change", updateAttribute);
					
				on(map, "load", function (){
					console.log("Map load event");
					// Hook up jQuery
					$(document).ready(jQueryReady);
				});


                function jQueryReady() {
					console.log("Im here");
					
                    $("#basemapList li").click(function(e) {
                        switch (e.target.text) {
                            case "Streets":
                                map.setBasemap("streets");
                                break;
                            case "Imagery":
                                map.setBasemap("hybrid");
                                break;
                            case "National Geographic":
                                map.setBasemap("national-geographic");
                                break;
                            case "Topographic":
                                map.setBasemap("topo");
                                break;
                            case "Gray":
                                map.setBasemap("gray");
                                break;
                            case "Open Street Map":
                                map.setBasemap("osm");
                                break;
                        }
                    });

                    var legBu = document.getElementById('legendButton');
                    legBu.onclick = showLegend;
                    function showLegend() {					
                        if (document.getElementById("feedback").style.display == "block")
                            document.getElementById("feedback").style.display = "none";
                        else
                            document.getElementById("feedback").style.display = "block";
                        return;
                    }
					
                    var infbu = document.getelementbyid('informationbutton');
                    infbu.onclick = showinf;
                    function showinf() {
                        if (document.getelementbyid("informationarea").style.display == "block")
                            document.getelementbyid("informationarea").style.display = "none";
                        else
                            document.getelementbyid("informationarea").style.display = "block";
                        return;
                    }
					

                    var querbu = document.getelementbyid('querybutton');
                    querbu.onclick = showquery;
                    function showquery() {
                        if (document.getelementbyid("queryarea").style.display == "block")
                            document.getelementbyid("queryarea").style.display = "none";
                        else
                            document.getelementbyid("queryarea").style.display = "block";
                        return;
                    }
					
					
					createSlider();
					
					function createSlider(){
						console.log("sLIDER");
						 // setup lungCa slide
						 $( "#LungSlider" ).slider({
							  orientation: "vertical",
							  range: true,
							  max: 46,
							  values: [5,30],
							  slide: function( event, ui ) {
								$( "#amountLung" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );}
						});
						$( "#ColonSlider" ).slider({
							  orientation: "vertical",
							  range: true,
							  max: 46,
							  values: [5,30],
							  slide: function( event, ui ) {
								$( "#amountColon" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );} 
							  
						});
						$( "#InfantSlider" ).slider({
							  orientation: "vertical",
							  range: true,
							  max: 24,
							  values: [5,20],
							  slide: function( event, ui ) {
								$( "#amountInfant" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );} 
						});	
						$( "#AirSlider" ).slider({
							  orientation: "vertical",
							   range: true,
							  max: 2.79,
							  step: 0.1,
							   values: [0.5,2.5],
							  slide: function( event, ui ) {
								$( "#amountAir" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );} //,
							  //change: queryLayer
						});	
						$( "#WaterSlider" ).slider({
							  orientation: "vertical",
							   range: true,
							  max: 1.48,
							   step: 0.1,
							   values: [0.2,1.4],
							  slide: function( event, ui ) {
								$( "#amountWater" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );} //,
							  //change: queryLayer
						});	
						$( "#LandSlider" ).slider({
							  orientation: "vertical",
							   range: true,
							  max: 2.09, 
							  step: 0.1,
							  values: [0.2,1.4],
							  slide: function( event, ui ) {
								$( "#amountLand" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );} //,
							  //change: queryLayer
						});							
					}
					
					$( "#amountLung" ).val( $( "#LungSlider" ).slider( "values", 0 ) + " - " + $( "#LungSlider" ).slider( "values", 1 ) );
					$( "#amountColon" ).val( $( "#ColonSlider" ).slider( "values", 0 ) + " - " + $( "#ColonSlider" ).slider( "values", 1 ) );
					$( "#amountInfant" ).val( $( "#InfantSlider" ).slider( "values", 0 ) + " - " + $( "#InfantSlider" ).slider( "values", 1 ) );
					$( "#amountAir" ).val( $( "#AirSlider" ).slider( "values", 0 ) + " - " + $( "#AirSlider" ).slider( "values", 1 ) );
					$( "#amountWater" ).val( $( "#WaterSlider" ).slider( "values", 0 ) + " - " + $( "#WaterSlider" ).slider( "values", 1 ) );
					$( "#amountLand" ).val( $( "#LandSlider" ).slider( "values", 0 ) + " - " + $( "#LandSlider" ).slider( "values", 1 ) );
					
				};
	});