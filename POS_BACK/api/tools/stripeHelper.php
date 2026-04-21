
<?php
require_once __DIR__ . "/stripe_config.php";
function stripeRequest($endpoint, $method = 'POST', $data = []) {
    $apiKey = 'sk_test_YOUR_SECRET_KEY';
    $ch = curl_init("https://api.stripe.com/v1/" . $endpoint);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_USERPWD, $apiKey . ":"); // Basic Auth: "key:"
    
    if ($method === 'POST' && !empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        "code" => $httpCode,
        "data" => json_decode($response, true)
    ];
}

function createBareStripeProduct($name, $description, $priceInCents) {
    // 1. Create the Product
    $productResult = stripeRequest('products', 'POST', [
        'name' => $name,
        'description' => $description
    ]);

    if ($productResult['code'] !== 200) return false;
    $productId = $productResult['data']['id'];

    // 2. Create the Price for that Product
    $priceResult = stripeRequest('prices', 'POST', [
        'unit_amount' => $priceInCents,
        'currency' => 'cad',
        'product' => $productId
    ]);

    if ($priceResult['code'] !== 200) return false;

    return [
        'stripe_product_id' => $productId,
        'stripe_price_id' => $priceResult['data']['id']
    ];
}

function archiveStripeProduct($stripeProductId) {
    // Note: We use the specific ID in the URL path for updates
    $result = stripeRequest("products/$stripeProductId", 'POST', [
        'active' => 'false'
    ]);

    return ($result['code'] === 200);
}

function createCheckoutSession($bakeName, $localPrice) {
    $amountInCents = round($localPrice * 100);

    $params = [
        'mode' => 'payment',
        'success_url' => 'https://justinebakes.com/success',
        'cancel_url' => 'https://justinebakes.com/cart',
        'automatic_tax[enabled]' => 'true',
        'billing_address_collection' => 'required',
        
        'line_items[0][price_data][currency]' => 'cad',
        'line_items[0][price_data][unit_amount]' => $amountInCents,
        'line_items[0][price_data][tax_behavior]' => 'exclusive',
        
        // --- THE MAGIC PART ---
        // Instead of 'product' => 'prod_123', we use 'product_data'
        'line_items[0][price_data][product_data][name]' => $bakeName,
        'line_items[0][price_data][product_data][description]' => "Fresh from Justine Bakes",
        // ----------------------
        
        'line_items[0][quantity]' => 1,
    ];

    $result = stripeRequest('checkout/sessions', 'POST', $params);

    return ($result['code'] === 200) ? $result['data']['url'] : false;
}

?>


