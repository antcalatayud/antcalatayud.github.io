var layer, legend, QualityLayer, HospitalLayer, ResultGraphicLayer;

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
				"esri/renderers/HeatmapRenderer",
				"esri/layers/GraphicsLayer",

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
				HeatmapRenderer,
				GraphicsLayer,

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
                var s = new esri.dijit.Search({
                    map: map
                }, "search");
                s.startup();
                ////
                //////Fields
                ////

                var fieldName = "Lung_M";

                var fields = {
                    "Lung_M": "Lung Cancer Deaths (per 100,000 people per Sq. Mi.)",
                    "Colon_M": "Colon Cancer Deaths (per 100,000 people per Sq. Mi.)",
                    "Infant_M": "Infant Mortality Rate (Deaths per 1,000)",
					"EQI_22July": "Overall Environmental Quality Index (22 July 2013)",
                    "air_EQI": "Overall Air Environmental Quality Index",
                    "water_EQI": "Overall Water Environmental Quality Index",
					"land_EQI": "Overall Land Environmental Quality Index",
					"built_EQI": "Overall Buildings Environmental Quality Index",
					"sociod_EQI": "Overall Socio-demographic Environmental Quality Index"
                };
				
                var outFields = ["Lung_M", "Colon_M", "Infant_M","EQI_22July","air_EQI","water_EQI","land_EQI","built_EQI","sociod_EQI"];
				var outFieldsQ = ["County_NAM","Lung_M", "Colon_M", "Infant_M","EQI_22July","air_EQI","water_EQI","land_EQI","built_EQI","sociod_EQI"];

                ////
                //////LAYERS
                ////			
                layer = new FeatureLayer("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/arcgis/rest/services/All_Data_Health/FeatureServer/0", {
                    "id": "Disseases",
                    "mode": FeatureLayer.MODE_SNAPSHOT,
                    "outFields": outFieldsQ,
                    "opacity": 0.8,
					"visible": false
                });
                map.addLayer(layer);

                QualityLayer = new FeatureLayer ("http://gispub.epa.gov/arcgis/rest/services/ORD/EnvironmentalQualityIndex/MapServer/0", {
					"id": "Environmental Quality Index",
                	"mode": FeatureLayer.MODE_ONDEMAND, 
                	"outFields":["*"],
                	"opacity":0.8,					
					"visible": false
                }); 
                map.addLayers([ QualityLayer]);
				
				 HospitalLayer = new FeatureLayer ("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/arcgis/rest/services/Hospitals_Health/FeatureServer/0", {
					"id": "Hospitals and Health centres",
                	"mode": FeatureLayer.MODE_ONDEMAND, 
                	"outFields":["*"],
                	"opacity":0.8,					
					"visible": false
                }); 
				
				var heatmapRenderer = new HeatmapRenderer();
				HospitalLayer.setRenderer(heatmapRenderer);
				
                map.addLayers([ HospitalLayer]);
				
				ResultGraphicLayer = new GraphicsLayer();			
				 
				var template = new esri.InfoTemplate();
				template.setTitle(getTitleContent);
                template.setContent(getTextContent);
				
				ResultGraphicLayer.setInfoTemplate(template);
				map.addLayer(ResultGraphicLayer);
				function getTitleContent(graphic) {		
					var t = "${County_NAM}";
						
					var title = esriLang.substitute(graphic.attributes,t);
						
					return title;
				}
				function getTextContent(graphic) {					
					 var t = "<b>Lung Cancer Deaths (per 100,000 people per Sq. Mi.): </b>${Lung_M:NumberFormat}<br><hr>"
						+ "<b>Colon Cancer Deaths (per 100,000 people per Sq. Mi.) per Sq. Mi.: </b>${Colon_M:NumberFormat}<br><hr>"
						+ "<b>Infant Mortality Rate ( Deaths per 1,000): </b>${Infant_M:NumberFormat}<br><hr>"						
						+ "<b>Overall Environmental Quality Index (22 July 2013): </b>${EQI_22July:NumberFormat}<br><hr>"
						+ "<b>Overall Air Environmental Quality Index (22 July 2013): </b>${air_EQI:NumberFormat}<br><hr>"
						+ "<b>Overall Water Environmental Quality Index (22 July 2013): </b>${water_EQI:NumberFormat}<br><hr>"
						+ "<b>Overall Land Environmental Quality Index (22 July 2013): </b>${land_EQI:NumberFormat}<br><hr>"
						+ "<b>Overall Buildings Environmental Quality Index (22 July 2013): </b>${built_EQI:NumberFormat}<br><hr>"
						+ "<b>Overall Socio-demographic Environmental Quality Index (22 July 2013): </b>${sociod_EQI:NumberFormat}";
						
						var content = esriLang.substitute(graphic.attributes,t);
						
						 return content;				
				
				}
				
				
				var queryTask = new QueryTask("http://services5.arcgis.com/0EYL4OTKhMA0OgEx/arcgis/rest/services/All_Data_Health/FeatureServer/0");
				
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
				
				//map.on("onUpdateStart", showLoading);
				//map.on("onUpdateEnd", hideLoading);
				dojo.connect(map, "onUpdateStart", showLoading);
				dojo.connect(map, "onUpdateEnd", hideLoading); 
				dojo.addClass(map.infoWindow.domNode, "myTheme");
				
				function showLoading() {
					displayWait("Map loading please wait..");
					console.log("Loading");
					
				}
				function displayWait(txtContent) {
					if (!txtContent) {
						txtContent = "Please wait...";
					}
					txtContent = "<img src=\"../../img/ajax-loader.gif\" alt=\"\" /> <font size=1>" + txtContent + "</font>";
					var thisdialog = new dijit.Dialog({ title: "", content: txtContent, id: "dialogWait"});
					dojo.body().appendChild(thisdialog.domNode);
					//thisdialog.closeButtonNode.style.display='none';
					thisdialog.titleBar.style.display = 'none';
					thisdialog.startup();
					thisdialog.show();
				}
				
				function displayQueryWait(txtContent) {
					if (!txtContent) {
						txtContent = "Please wait...";
					}
					txtContent = "<img src=\"../../img/ajax-loader.gif\" alt=\"\" /> <font size=1>" + txtContent + "</font>";
					var thisdialog = new dijit.Dialog({ title: "", content: txtContent, id: "dialogQueryWait"});
					dojo.body().appendChild(thisdialog.domNode);;
					thisdialog.titleBar.style.display = 'none';
					thisdialog.startup();
					thisdialog.show();
				}
				

				function hideLoading() {
				console.log("Finish Loading");
					var thisdialog = dijit.byId("dialogWait");
					thisdialog.hide();
					thisdialog.destroy();
				}
				
				function hideQueryWait() {
				console.log("Finish Loading");
					var thisdialog = dijit.byId("dialogQueryWait");
					thisdialog.hide();
					thisdialog.destroy();
				}
				
				
				on(dom.byId("execute"), "click", execute);
				
				on(dom.byId("clearGraphics"), "click", clearGraphicsFun);
				function clearGraphicsFun(){
					ResultGraphicLayer.clear();				
				}
				function execute () {
				displayQueryWait("Building Query..");
				ResultGraphicLayer.clear();
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
						queryTextString = "(Lung_M BETWEEN '" + lungValueMin + "' AND '" + lungValueMax + "')"; 
					} 					
					if (document.getElementById('ColonCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "(Colon_M BETWEEN '" + colonValueMin  + "' AND '" + colonValueMax + "')";
						}
						else{
							queryTextString = queryTextString + " AND (Colon_M BETWEEN '" + colonValueMin + "' AND '" + colonValueMax + "')";
						}
					}					
					if (document.getElementById('InfantCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "(Infant_M BETWEEN '" + infantValueMin + "' AND '" + infantValueMax + "')";
						}
						else{
							queryTextString = queryTextString + "AND (Infant_M BETWEEN '" + infantValueMin + "' AND '" + infantValueMax + "')";
						}
					}
					
					if (document.getElementById('AirCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "(air_EQI BETWEEN '" + airValueMin + "' AND '" + airValueMax + "')";
						}
						else{
							queryTextString = queryTextString + "AND (air_EQI BETWEEN '" + airValueMin + "' AND '" + airValueMax + "')";
						}
					}
					
					if (document.getElementById('WaterCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "(water_EQI BETWEEN '" + waterValueMin + "' AND '" + waterValueMax + "')";
						}
						else{
							queryTextString = queryTextString + "AND (water_EQI BETWEEN '" + waterValueMin + "' AND '" + waterValueMax + "')";
						}
					}
					
					if (document.getElementById('LandCheckBox').checked) {						
						if (queryTextString == "")
						{
							queryTextString = "(land_EQI BETWEEN '" + landValueMin + "' AND '" + landValueMax + "')";
						}
						else{
							queryTextString = queryTextString + "AND (land_EQI BETWEEN '" + landValueMin + "' AND '" + landValueMax + "')";
						}
					}
				
				if (queryTextString == "")
					{
						alert("Please select one variable");
						hideQueryWait();
						return;
					}
					else{
						query.where = queryTextString;
					}				 
				  
				  queryTask.execute(query, showResults);
				}
				
				layer.on("click", function(evt){
					var t = "<b>${County_NAM}</b><hr><b>Lung Cancer Deaths (per 100,000 people per Sq. Mi.): </b>${Lung_M:NumberFormat}<br>"
						+ "<b>Colon Cancer Deaths (per 100,000 people per Sq. Mi.) per Sq. Mi.: </b>${Colon_M:NumberFormat}<br>"
						+ "<b>Infant Mortality Rate ( Deaths per 1,000): </b>${Infant_M:NumberFormat}<br>"						
						+ "<b>Overall Environmental Quality Index (22 July 2013): </b>${EQI_22July:NumberFormat}<br>"
						+ "<b>Overall Air Environmental Quality Index (22 July 2013): </b>${air_EQI:NumberFormat}<br>"
						+ "<b>Overall Water Environmental Quality Index (22 July 2013): </b>${water_EQI:NumberFormat}<br>"
						+ "<b>Overall Land Environmental Quality Index (22 July 2013): </b>${land_EQI:NumberFormat}<br>"
						+ "<b>Overall Buildings Environmental Quality Index (22 July 2013): </b>${built_EQI:NumberFormat}<br>"
						+ "<b>Overall Socio-demographic Environmental Quality Index (22 July 2013): </b>${sociod_EQI:NumberFormat}";
  
						var content = esriLang.substitute(evt.graphic.attributes,t);
						
						dom.byId("InformationAreaText").innerHTML = content;
				});	
				
				function showResults (results) {			
				  var resultItems = [];
				  var resultCount = results.features.length;
				  hideQueryWait();
				  displayQueryWait("Drawing the " + resultCount + " councils that have been founded");
				  if (resultCount == 0)				  
				  {
					hideQueryWait();
					alert("No results, please try again");
					
					return;				  
				  }
				  for (var i = 0; i < resultCount; i++) {
					var highlightGraphic = new Graphic(results.features[i].geometry,highlightSymbol,results.features[i].attributes);
					ResultGraphicLayer.add(highlightGraphic);
					//map.graphics.add(highlightGraphic);
				  }
				  hideQueryWait();
				}

                layer.on("load", function() {
                    createRenderer(fieldName);
                });
				
				on(dom.byId("DiseasesLayersOnOff"), "change", updateLayerVisibility);
				on(dom.byId("EnvironmentLayersOnOff"), "change", updateLayerVisibility);
				on(dom.byId("HospitalsLayersOnOff"), "change", updateLayerVisibility)
				function updateLayerVisibility()
				{
					if (document.getElementById('DiseasesLayersOnOff').checked) {
						layer.show()
					}
					else{
						layer.hide();
						
					}
					if (document.getElementById('EnvironmentLayersOnOff').checked) {
						QualityLayer.show()
					}
					else{
						QualityLayer.hide();
						
					}
					if (document.getElementById('HospitalsLayersOnOff').checked) {
						HospitalLayer.show()
					}
					else{
						HospitalLayer.hide();						
					}
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
					
					
					$('.tooltip').tooltip();
					


                    var legBu = document.getElementById('legendButton');					
                    legBu.onclick = showLegend;
					var CloselegBu = document.getElementById('closeLegend');					
                    CloselegBu.onclick = showLegend;
					
                    function showLegend() {					
                        if (document.getElementById("feedback").style.display == "block")
                            document.getElementById("feedback").style.display = "none";
                        else
                            document.getElementById("feedback").style.display = "block";
                        return;
                    }
					
					var infBu = document.getElementById('informationButton');
                    infBu.onclick = showInf;
					var CloseinfBu = document.getElementById('closeInf');
                    CloseinfBu.onclick = showInf;
                    function showInf() {					
                        if (document.getElementById("InformationArea").style.display == "block")
                            document.getElementById("InformationArea").style.display = "none";
                        else
                            document.getElementById("InformationArea").style.display = "block";
                        return;
                    }
					
                    var querBu = document.getElementById('QueryButton');
                    querBu.onclick = showQue;
					var closequerBu = document.getElementById('closeQuery');
                    closequerBu.onclick = showQue;
                    function showQue() {					
                        if (document.getElementById("queryArea").style.display == "block")
                            document.getElementById("queryArea").style.display = "none";
                        else
                            document.getElementById("queryArea").style.display = "block";
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
							   min: -3.3,
							  max: 2.9,
							  step: 0.1,
							   values: [-1.5,2.5],
							  slide: function( event, ui ) {
								$( "#amountAir" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );} //,
							  //change: queryLayer
						});	
						$( "#WaterSlider" ).slider({
							  orientation: "vertical",
							   range: true,
							  max: 1.5,
							  min: -1.7,
							   step: 0.1,
							   values: [-1,1.4],
							  slide: function( event, ui ) {
								$( "#amountWater" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );} //,
							  //change: queryLayer
						});	
						$( "#LandSlider" ).slider({
							  orientation: "vertical",
							   range: true,
							  max: 2.2, 
							  min: -5,
							  step: 0.1,
							  values: [-2,1.4],
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