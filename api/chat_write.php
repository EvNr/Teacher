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
    $data = ["global" => [], "private" => [], "motd" => [], "alerts" => []];
}

// Handle Write
if ($input) {
    $type = $input['type'] ?? '';

    if ($type === 'GLOBAL') {
        // Append global message
        $data['global'][] = $input['payload'];
        // Limit to last 50 messages
        if (count($data['global']) > 50) {
            $data['global'] = array_slice($data['global'], -50);
        }
    }
    elseif ($type === 'MOTD') {
        // Set MOTD
        $data['motd'] = $input['payload'];
    }
    elseif ($type === 'ALERT') {
        // Add Alert
        if (!isset($data['alerts'])) $data['alerts'] = [];
        $data['alerts'][] = $input['payload'];
        // Keep last 10 alerts
        if (count($data['alerts']) > 10) {
            $data['alerts'] = array_slice($data['alerts'], -10);
        }
    }
    elseif ($type === 'OVERWRITE') {
        // Replace full data (used for deletion)
        if (isset($input['payload']['global'])) {
            $data['global'] = $input['payload']['global'];
        }
    }
    elseif ($type === 'PRIVATE') {
        // Handle Private Chat Init
        if (!isset($data['private'])) $data['private'] = [];

        if (isset($input['action']) && $input['action'] === 'INIT') {
            $chatId = $input['chatId'];
            if (!isset($data['private'][$chatId])) {
                $data['private'][$chatId] = [
                    'participants' => $input['participants'],
                    'messages' => []
                ];
            }
        }
        elseif (isset($input['action']) && $input['action'] === 'SEND') {
            $chatId = $input['chatId'];
            if (isset($data['private'][$chatId])) {
                $data['private'][$chatId]['messages'][] = $input['payload'];
            }
        }
    }

    // Save back
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

echo json_encode(["success" => true]);
?>