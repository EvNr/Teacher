<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Get POST input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'No input provided']);
    exit;
}

$dataDir = __DIR__ . '/../data';
$type = $input['type'] ?? 'GLOBAL'; // GLOBAL or PRIVATE
$action = $input['action'] ?? 'SEND'; // SEND or DELETE

// File Paths
$globalFile = $dataDir . '/chat_global.json';
$privateFile = $dataDir . '/chat_private.json';

// Ensure files exist
if (!file_exists($dataDir)) mkdir($dataDir, 0777, true);
if (!file_exists($globalFile)) file_put_contents($globalFile, '[]');
if (!file_exists($privateFile)) file_put_contents($privateFile, '{}');

if ($type === 'GLOBAL') {
    $current = json_decode(file_get_contents($globalFile), true) ?? [];

    if ($action === 'DELETE') {
        $id = $input['id'];
        $current = array_filter($current, function($msg) use ($id) {
            return $msg['id'] != $id;
        });
        $current = array_values($current); // Re-index
    } else {
        // Add Message
        $msg = $input['payload'];
        $msg['id'] = time() . rand(100,999); // Server-side ID generation
        $current[] = $msg;

        // Limit to last 100 messages
        if (count($current) > 100) {
            $current = array_slice($current, -100);
        }
    }

    file_put_contents($globalFile, json_encode($current));
    echo json_encode(['status' => 'success', 'data' => $current]);
}
else if ($type === 'PRIVATE') {
    $current = json_decode(file_get_contents($privateFile), true) ?? [];
    $chatId = $input['chatId']; // e.g. "Ahmed_Sabreen"

    if ($action === 'INIT') {
        if (!isset($current[$chatId])) {
            $current[$chatId] = [
                'participants' => $input['participants'],
                'messages' => []
            ];
        }
    } else {
        // Send Message
        if (!isset($current[$chatId])) {
            $current[$chatId] = [
                'participants' => $input['participants'], // Should be sent with first msg if not init
                'messages' => []
            ];
        }
        $msg = $input['payload'];
        $msg['id'] = time() . rand(100,999);
        $current[$chatId]['messages'][] = $msg;
    }

    file_put_contents($privateFile, json_encode($current));
    echo json_encode(['status' => 'success']);
}
?>
