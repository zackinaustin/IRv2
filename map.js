$(document).ready(function () {
	 var c = {};
	function position(DOM,of) {
		DOM.position({
			of: of,
			my: "bottom",
			at: "top",
			collision: "flipfit"
		});
	};

	var reader = new ol.format.GeoJSON()
	var features;
	var layer = new ol.layer.Tile({
		source: new ol.source.OSM({
			projection: proj
		})
	});
	var proj = new ol.proj.Projection({
		code: 'EPSG:3857',
		units: 'degrees',
	});
	var view = new ol.View({
		center: ol.proj.transform(
			[11.40224568, 43.1530269], 'EPSG:4326', 'EPSG:3857'),
		zoom: 12
	});
	var vector_layer = new ol.layer.Vector({
		name: 'my_vectorlayer',
		source: new ol.source.GeoJSON({
			projection: proj,
		}),
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			}),
			stroke: new ol.style.Stroke({
				color: '#ffcc33',
				width: 1
			}),
			image: new ol.style.Circle({
				radius: 3,
				fill: new ol.style.Fill({
					color: '#ffcc33'
				})
			})
		})
	});
	var map = new ol.Map({
		layers: [layer, vector_layer],
		target: 'map',
		controls: ol.control.defaults({
			attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
				collapsible: false
			})
		}),
		view: view
	});
	console.log("1");
	//interactive button
	$('#search').popover({
		html: true,
		content: $("#search-popover-content")
	});
	$('#result').click(function () {
		$("#popover").toggle();
		position($("#popover"),$("#result"));
	});
	$('#inmap').click(function () {
		$("#popover-inmap").toggle();
		position($("#popover-inmap"),$('#inmap'));
	});
	$('#doSearch').on("click", function () {
		search();
		$("#search").trigger("click");
		$("#popover").toggle(function(){
			position($("#popover"),$("#result"));
		});


	});
	vector_layer.getSource().on("addfeature",function(e){

		var feature=e.feature;
		var properties =feature.getProperties();


					var row = $('<tr></tr>');
					row.attr("value", properties['OBJECTID']);
					var ID = properties['OBJECTID'];
					$('<td></td>').html(ID).appendTo(row);
					var ARTIFACTID = properties['ARTIFACTID'];
					$('<td></td>').html(ARTIFACTID).appendTo(row);
					var add = $('<a class="add">add</a>');
					add.attr("value", properties['OBJECTID']);

					$('<td></td>').html(add).appendTo(row);

					row.appendTo('#tbody-inmap');

		});

	function search() {
		var OBJECTID = $("#ID").val();
		var TRENCHID = $("#Trench").val();
		$.ajax({
			type: "post",
			url: "php/search.php",
			data: 'OBJECTID=' + OBJECTID + '&TRENCHID=' + TRENCHID,
			dataType: "json",
			beforeSend: function (jqXHR, settings) {
				var url = settings.url + "?" + settings.data;
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success: function (json) {
				//clear table
				$("#tbody tr").remove();
				features = json['features'];
				for (var x = 0; x < features.length; x++) {
					var properties = features[x].properties;
					var row = $('<tr></tr>');
					row.attr("value", properties['OBJECTID']);
					var ID = properties['OBJECTID'];
					$('<td></td>').html(ID).appendTo(row);
					var ARTIFACTID = properties['ARTIFACTID'];
					$('<td></td>').html(ARTIFACTID).appendTo(row);
					var add = $('<a class="add">add</a>');
					add.attr("value", properties['OBJECTID']);
					add.click(function () {
						console.log(searchFeaturebyID($(this).attr("value")));
						console.log($(this).attr("value"));
						var feature = searchFeaturebyID($(this).attr("value"));
						var coor = feature.geometry.coordinates;
						coor = ol.proj.transform([parseFloat(coor[0]), parseFloat(coor[1])], 'EPSG:4326', 'EPSG:3857');
						feature.geometry.coordinates = coor;
						var addfeature = reader.readFeature(feature);
						vector_layer.getSource().addFeature(addfeature);
					})
					$('<td></td>').html(add).appendTo(row);

					row.appendTo('#tbody');

					// updateListing(data[x]);
				}
				console.log("creat draggable");
				$("#t tr").draggable({
				helper: "clone",
				start: function(event, ui) {
				c.tr = this;
				c.helper = ui.helper;
				}

		});
				$("#map").droppable({
					 drop: function(event, ui) {
			            var id = ui.draggable.attr("value");
			            var feature = searchFeaturebyID(id);
						var coor = feature.geometry.coordinates;
						coor = ol.proj.transform([parseFloat(coor[0]), parseFloat(coor[1])], 'EPSG:4326', 'EPSG:3857');
						feature.geometry.coordinates = coor;
						var addfeature = reader.readFeature(feature);
						vector_layer.getSource().addFeature(addfeature);
			                    }

				});

			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
		});
	}


	function searchFeaturebyID(id) {
		for (var x = 0; x < features.length; x++) {
			if (features[x].properties['OBJECTID'] === id) {
				return features[x];
				break;
			}
		}
	}
	$( window ).scroll(function() {
 position()});
});