<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'No input']);
    exit;
}

$dataDir = __DIR__ . '/../data';
$type = $input['type'] ?? 'MOTD'; // MOTD or ALERT

if ($type === 'MOTD') {
    $file = $dataDir . '/motd.json';
    file_put_contents($file, json_encode($input['payload']));
}
else if ($type === 'ALERT') {
    $file = $dataDir . '/alerts.json';
    $current = json_decode(file_get_contents($file), true) ?? [];
    $alert = $input['payload'];
    $alert['id'] = time();
    $current[] = $alert;

    // Keep last 10 alerts
    if (count($current) > 10) $current = array_slice($current, -10);

    file_put_contents($file, json_encode($current));
}

echo json_encode(['status' => 'success']);
?>
