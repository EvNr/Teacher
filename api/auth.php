<?php
header('Content-Type: application/json');

$file = 'auth_data.json';
$data = ['users' => []];
if (file_exists($file)) {
    $data = json_decode(file_get_contents($file), true);
    if (!$data) $data = ['users' => []];
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['error' => 'No input']);
    exit;
}

$action = $input['action'] ?? '';
$username = $input['username'] ?? '';

// Basic Sanitization
$username = trim($username);

if (!$username) {
    echo json_encode(['error' => 'Username required']);
    exit;
}

if ($action === 'CHECK') {
    if (isset($data['users'][$username])) {
        echo json_encode([
            'status' => 'EXISTING_USER',
            'question' => $data['users'][$username]['question']
        ]);
    } else {
        echo json_encode(['status' => 'NEW_USER']);
    }
}
elseif ($action === 'REGISTER') {
    if (isset($data['users'][$username])) {
        echo json_encode(['success' => false, 'message' => 'User already exists']);
    } else {
        $data['users'][$username] = [
            'question' => $input['question'],
            'answer' => $input['answer'], // Stored normalized
            'registeredAt' => date('c'),
            'xp' => 0
        ];
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]);
    }
}
elseif ($action === 'LOGIN') {
    if (!isset($data['users'][$username])) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    } else {
        $stored = $data['users'][$username]['answer'];
        $inputAnswer = $input['answer']; // Already normalized by client

        if ($stored === $inputAnswer) {
            // Update last login or XP if needed
            echo json_encode(['success' => true, 'user_data' => $data['users'][$username]]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect answer']);
        }
    }
}
else {
    echo json_encode(['error' => 'Invalid action']);
}
?>