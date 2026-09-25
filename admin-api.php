<?php
// TF ENERGY Admin API — Hostinger compatible
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

// Simple token auth (change this in production!)
define("ADM_TOKEN", "TFAdmin2024Token");
$auth = $_SERVER["HTTP_AUTHORIZATION"] ?? $_GET["token"] ?? "";
if (!str_contains($auth, ADM_TOKEN)) {
    http_response_code(401);
    echo json_encode(["ok"=>false,"msg"=>"Unauthorized"]);
    exit;
}

$action = $_GET["action"] ?? "";
$dataFile = __DIR__ . "/admin-data.json";

function readData($file) {
    if (!file_exists($file)) return ["requests"=>[],"projects"=>[],"sales"=>[]];
    return json_decode(file_get_contents($file), true) ?? ["requests"=>[],"projects"=>[],"sales"=>[]];
}
function writeData($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE), LOCK_EX);
}

$method = $_SERVER["REQUEST_METHOD"];
$body   = json_decode(file_get_contents("php://input"), true) ?? [];

if ($method === "GET" && $action === "get") {
    echo json_encode(["ok"=>true,"data"=>readData($dataFile)]);
} elseif ($method === "POST" && $action === "save") {
    writeData($dataFile, $body);
    echo json_encode(["ok"=>true]);
} elseif ($method === "GET" && $action === "submissions") {
    $raw = @file_get_contents("submissions.json") ?? "[]";
    echo json_encode(["ok"=>true,"data"=>$raw]);
} else {
    http_response_code(400);
    echo json_encode(["ok"=>false,"msg"=>"Unknown action"]);
}
?>
