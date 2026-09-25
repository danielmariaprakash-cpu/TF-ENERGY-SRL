<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }
if ($_SERVER["REQUEST_METHOD"] !== "POST") { http_response_code(405); echo json_encode(["ok"=>false,"msg"=>"Method not allowed"]); exit; }

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) $data = $_POST;

$name    = htmlspecialchars(trim($data["name"]    ?? $data["nome"]    ?? ""));
$email   = filter_var(trim($data["email"]   ?? ""), FILTER_SANITIZE_EMAIL);
$message = htmlspecialchars(trim($data["message"] ?? $data["messaggio"] ?? ""));
$product = htmlspecialchars(trim($data["product"]  ?? $data["prodotto"]  ?? "Preventivo"));

if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(["ok"=>false,"msg"=>"Campi obbligatori mancanti"]);
    exit;
}

// Configure email
$to      = "info@tfenergy.it";
$subject = "Nuova richiesta: $product – TF ENERGY";
$body    = "Nome: $name\nEmail: $email\nProdotto: $product\n\nMessaggio:\n$message";
$headers = "From: noreply@tfenergy.it\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8";

$sent = mail($to, $subject, $body, $headers);

// Log submission
$log = ["id"=>uniqid(), "name"=>$name, "email"=>$email, "product"=>$product, "message"=>$message, "ip"=>$_SERVER["REMOTE_ADDR"]??"", "date"=>date("c")];
@file_put_contents("submissions.json", json_encode($log).",\n", FILE_APPEND|LOCK_EX);

echo json_encode(["ok"=>$sent, "msg"=>$sent?"Messaggio inviato con successo":"Errore invio, riprova"]);
?>
