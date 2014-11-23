<?php
/* session_save_path("/tmp");  */
require("phpsqlajax_dbinfo.php");

if(isset($_POST['OBJECTID'])){
	$OBJECTID=$_POST['OBJECTID'];
}
if(isset($_POST['TRENCHID'])){
	$TRENCHID=$_POST['TRENCHID'];
}
$link = mysqli_connect($hostname, $dbuser, $password, $dbname);
 $dataquery = "select * from mytable where OBJECTID=". $OBJECTID ." or TRENCHID=". $TRENCHID;

$result = mysqli_query($link, $dataquery);
if (!$result) {
	die('Invalid query: '.mysqli_error());
}
// Start XML file, echo parent node
$data=array('type'=>'FeatureCollection');
$features=array();
while ($row = mysqli_fetch_array($result)) {
	// ADD TO XML DOCUMENT NODE
		$geometry=array(
			'type'=>'Point',
			'coordinates'=>array($row[ 'EWGEOREF' ],$row[ 'NSGEOREF' ])
		);
		$properties= array(
		'OBJECTID'=>$row[ 'OBJECTID' ],
		'ARTIFACTID'=>$row[ 'ARTIFACTID' ],
		'CATALOGID'=>$row[ 'CATALOGID' ],
		'EWCOORDINA'=>$row[ 'EWCOORDINA' ],
		'NSCOORDINA'=>$row[ 'NSCOORDINA' ],
		'ELEVATION1'=>$row[ 'ELEVATION1' ],
		'NAME'=>$row[ 'NAME' ],
		'FABRIC'=>$row[ 'FABRIC' ],
		'AREA'=>$row[ 'region_name' ],
		'TRENCH'=>$row[ 'TRENCH' ],
		'CHRONOLOGY'=>$row[ 'CHRONOLOGY' ],
		'FRAGMENTID'=>$row[ 'FRAGMENTID' ],
		'TRENCHID'=>$row[ 'TRENCHID' ],
		'POGGIOCIVI'=>$row[ 'POGGIOCIVI' ],
		'POGGIOCI_1'=>$row[ 'POGGIOCI_1' ]);

		$feature=array('type'=> 'Feature',
		'geometry'=>$geometry,
		'properties'=>$properties);
		array_push($features,$feature);

}
$data['features']=$features;

$json = json_encode($data);

echo $json;
?>

