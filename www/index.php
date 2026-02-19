<?php
function fetchQuery($cursor) 
{
	$result = [];
	foreach ($cursor as $fetch) {
		$result = $fetch;
	}
	return $result;
}
$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
$command = new MongoDB\Driver\Command(["listDatabases" => 1]);
$data = fetchQuery($manager->executeCommand("admin", $command));
?>
<h1>Welcome to</h1>
<h2>PHP - Mongo - Electron</h2>
<pre>
<?php
foreach ($data->databases as $database) {
    echo "Database Name: <strong>" . $database->name . "</strong>, Size: <strong>" . number_format($database->sizeOnDisk/1024, 2) . " MB</strong>\n";
}
?>
</pre>