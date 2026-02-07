<?php
header('Content-Type: application/json');

// Get POST body
$input = json_decode(file_get_contents('php://input'), true);
$file = 'chat_data.json';

// Read current data
$data = [];
if (file_exists($file)) {
    $data = json_decode(file_get_contents($file), true);
}
if (!$data) {
    $data = ["global" => [], "private" => [], "motd" => []];
}

// Handle Write
if ($input) {
    if (isset($input['type']) && $input['type'] === 'GLOBAL') {
        // Append global message
        $data['global'][] = $input['payload'];

        // Limit to last 50 messages
        if (count($data['global']) > 50) {
            $data['global'] = array_slice($data['global'], -50);
        }
    }

    // Save back
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

echo json_encode(["success" => true]);
?>