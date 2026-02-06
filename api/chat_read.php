<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dataDir = __DIR__ . '/../data';
$globalFile = $dataDir . '/chat_global.json';
$privateFile = $dataDir . '/chat_private.json';
$motdFile = $dataDir . '/motd.json';
$alertsFile = $dataDir . '/alerts.json';

// Ensure files exist
if (!file_exists($dataDir)) mkdir($dataDir, 0777, true);
if (!file_exists($globalFile)) file_put_contents($globalFile, '[]');
if (!file_exists($privateFile)) file_put_contents($privateFile, '{}');
if (!file_exists($motdFile)) file_put_contents($motdFile, '{"active":false}');
if (!file_exists($alertsFile)) file_put_contents($alertsFile, '[]');

// Read Data
$global = json_decode(file_get_contents($globalFile), true) ?? [];
$private = json_decode(file_get_contents($privateFile), true) ?? [];
$motd = json_decode(file_get_contents($motdFile), true) ?? ["active" => false];
$alerts = json_decode(file_get_contents($alertsFile), true) ?? [];

echo json_encode([
    'global' => $global,
    'private' => $private,
    'motd' => $motd,
    'alerts' => $alerts
]);
?>
