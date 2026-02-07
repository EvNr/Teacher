<?php
header('Content-Type: application/json');
// Simple read
$file = 'chat_data.json';
if (file_exists($file)) {
    echo file_get_contents($file);
} else {
    // Default structure
    echo json_encode([
        "global" => [],
        "private" => (object)[],
        "motd" => (object)[],
        "alerts" => []
    ]);
}
?>