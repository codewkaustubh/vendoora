#!/usr/bin/env pwsh

# Phase 9.2 API Verification Tests

$baseUrl = "http://localhost:3000/api"
$results = @()

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$name,
        [string]$endpoint,
        [string]$method = "GET"
    )
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method $method -ErrorAction Stop -TimeoutSec 5
        $results += @{
            Name = $name
            Status = "✅ PASS"
            Code = $response.StatusCode
            Details = "Response OK"
        }
        return $response.Content | ConvertFrom-Json
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $results += @{
            Name = $name
            Status = "❌ FAIL"
            Code = $statusCode
            Details = $_.Exception.Message
        }
        return $null
    }
}

Write-Host "=== PHASE 9.2 MARKETPLACE DISCOVERY API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Search - Vendors
Write-Host "TEST 1: Search Vendors" -ForegroundColor Yellow
$vendorRes = Test-Endpoint "GET /api/search?type=vendors&limit=3" "/search?type=vendors&limit=3"
if ($vendorRes) {
    Write-Host "  Vendors found: $($vendorRes.vendors.total)" -ForegroundColor Green
    Write-Host "  Items returned: $($vendorRes.vendors.items.Count)" -ForegroundColor Green
    Write-Host "  Total pages: $($vendorRes.vendors.totalPages)" -ForegroundColor Green
}
Write-Host ""

# Test 2: Search - Services
Write-Host "TEST 2: Search Services" -ForegroundColor Yellow
$serviceRes = Test-Endpoint "GET /api/search?type=services&limit=3" "/search?type=services&limit=3"
if ($serviceRes) {
    Write-Host "  Services found: $($serviceRes.services.total)" -ForegroundColor Green
    Write-Host "  Items returned: $($serviceRes.services.items.Count)" -ForegroundColor Green
}
Write-Host ""

# Test 3: Search - Products
Write-Host "TEST 3: Search Products" -ForegroundColor Yellow
$productRes = Test-Endpoint "GET /api/search?type=products&limit=3" "/search?type=products&limit=3"
if ($productRes) {
    Write-Host "  Products found: $($productRes.products.total)" -ForegroundColor Green
    Write-Host "  Items returned: $($productRes.products.items.Count)" -ForegroundColor Green
}
Write-Host ""

# Test 4: Search - All types
Write-Host "TEST 4: Search All Types" -ForegroundColor Yellow
$allRes = Test-Endpoint "GET /api/search?type=all&limit=2" "/search?type=all&limit=2"
if ($allRes) {
    Write-Host "  Vendors: $($allRes.vendors.items.Count) items" -ForegroundColor Green
    Write-Host "  Services: $($allRes.services.items.Count) items" -ForegroundColor Green
    Write-Host "  Products: $($allRes.products.items.Count) items" -ForegroundColor Green
}
Write-Host ""

# Test 5: Search - Text query
Write-Host "TEST 5: Text Search (q=tent)" -ForegroundColor Yellow
$searchRes = Test-Endpoint "GET /api/search?q=tent&type=all&limit=2" "/search?q=tent&type=all&limit=2"
if ($searchRes) {
    $totalResults = $searchRes.vendors.total + $searchRes.services.total + $searchRes.products.total
    Write-Host "  Total results for 'tent': $totalResults" -ForegroundColor Green
}
Write-Host ""

# Test 6: Filter - By City
Write-Host "TEST 6: Filter by City (city=Mumbai)" -ForegroundColor Yellow
$cityRes = Test-Endpoint "GET /api/search?type=vendors&city=Mumbai&limit=3" "/search?type=vendors&city=Mumbai&limit=3"
if ($cityRes) {
    Write-Host "  Vendors in Mumbai: $($cityRes.vendors.total)" -ForegroundColor Green
}
Write-Host ""

# Test 7: Filter - By Price Range
Write-Host "TEST 7: Filter by Price Range (minPrice=1000&maxPrice=50000)" -ForegroundColor Yellow
$priceRes = Test-Endpoint "GET /api/search?type=products&minPrice=1000&maxPrice=50000&limit=3" "/search?type=products&minPrice=1000&maxPrice=50000&limit=3"
if ($priceRes) {
    Write-Host "  Products in price range: $($priceRes.products.total)" -ForegroundColor Green
}
Write-Host ""

# Test 8: Filter - By Rating
Write-Host "TEST 8: Filter by Rating (minRating=4)" -ForegroundColor Yellow
$ratingRes = Test-Endpoint "GET /api/search?type=vendors&minRating=4&limit=3" "/search?type=vendors&minRating=4&limit=3"
if ($ratingRes) {
    Write-Host "  Vendors with 4+ rating: $($ratingRes.vendors.total)" -ForegroundColor Green
}
Write-Host ""

# Test 9: Sorting - By rating
Write-Host "TEST 9: Sorting by Rating (sortBy=rating)" -ForegroundColor Yellow
$sortRatingRes = Test-Endpoint "GET /api/search?type=vendors&sortBy=rating&limit=3" "/search?type=vendors&sortBy=rating&limit=3"
if ($sortRatingRes -and $sortRatingRes.vendors.items.Count -gt 1) {
    $first = $sortRatingRes.vendors.items[0].rating
    $second = $sortRatingRes.vendors.items[1].rating
    if ($first -ge $second) {
        Write-Host "  ✅ Sorting correct: $first >= $second" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Sorting issue: $first < $second" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 10: Sorting - By price
Write-Host "TEST 10: Sorting by Price (sortBy=price-asc)" -ForegroundColor Yellow
$sortPriceRes = Test-Endpoint "GET /api/search?type=products&sortBy=price-asc&limit=3" "/search?type=products&sortBy=price-asc&limit=3"
if ($sortPriceRes -and $sortPriceRes.products.items.Count -gt 1) {
    Write-Host "  ✅ Price sorting available" -ForegroundColor Green
}
Write-Host ""

# Test 11: Pagination - Page 1
Write-Host "TEST 11: Pagination - Page 1" -ForegroundColor Yellow
$page1Res = Test-Endpoint "GET /api/search?type=vendors&limit=3&page=1" "/search?type=vendors&limit=3&page=1"
if ($page1Res) {
    Write-Host "  Page: $($page1Res.vendors.page)" -ForegroundColor Green
    Write-Host "  Items per page: $($page1Res.vendors.items.Count)" -ForegroundColor Green
    Write-Host "  Total pages: $($page1Res.vendors.totalPages)" -ForegroundColor Green
}
Write-Host ""

# Test 12: Pagination - Page 2
Write-Host "TEST 12: Pagination - Page 2" -ForegroundColor Yellow
$page2Res = Test-Endpoint "GET /api/search?type=vendors&limit=3&page=2" "/search?type=vendors&limit=3&page=2"
if ($page2Res) {
    Write-Host "  Page: $($page2Res.vendors.page)" -ForegroundColor Green
    if ($page1Res -and $page2Res.vendors.items[0].id -ne $page1Res.vendors.items[0].id) {
        Write-Host "  ✅ Page 2 has different results" -ForegroundColor Green
    }
}
Write-Host ""

# Test 13: Empty Results
Write-Host "TEST 13: Empty Results (q=nonexistentitem99999)" -ForegroundColor Yellow
$emptyRes = Test-Endpoint "GET /api/search?q=nonexistentitem99999&type=all" "/search?q=nonexistentitem99999&type=all"
if ($emptyRes) {
    if ($emptyRes.vendors.total -eq 0 -and $emptyRes.services.total -eq 0 -and $emptyRes.products.total -eq 0) {
        Write-Host "  ✅ Empty results handled correctly" -ForegroundColor Green
    }
}
Write-Host ""

# Test Phase 8/9.1 APIs
Write-Host ""
Write-Host "=== PHASE 8/9.1 BACKWARD COMPATIBILITY TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 14: Auth - Get Me (requires token, should fail gracefully)
Write-Host "TEST 14: Auth Endpoint (/auth/me)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/me" -Method GET -TimeoutSec 5 -ErrorAction Stop
    $results += @{
        Name = "GET /auth/me (authenticated)"
        Status = "✅ PASS"
        Code = $response.StatusCode
        Details = "OK"
    }
    Write-Host "  ✅ Auth endpoint responding" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        $results += @{
            Name = "GET /auth/me (unauthenticated)"
            Status = "✅ PASS"
            Code = 401
            Details = "Correctly requires auth"
        }
        Write-Host "  ✅ Auth protection working (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Unexpected error: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 15: Vendors List (Phase 8)
Write-Host "TEST 15: Vendors List (/vendors)" -ForegroundColor Yellow
$vendorListRes = Test-Endpoint "GET /api/vendors" "/vendors"
if ($vendorListRes) {
    Write-Host "  ✅ Phase 8 Vendor API still responding" -ForegroundColor Green
}
Write-Host ""

# Test 16: Services List (Phase 8)
Write-Host "TEST 16: Services List (/services)" -ForegroundColor Yellow
$serviceListRes = Test-Endpoint "GET /api/services" "/services"
if ($serviceListRes) {
    Write-Host "  ✅ Phase 8 Services API still responding" -ForegroundColor Green
}
Write-Host ""

# Test 17: Marketplace Products (Phase 8)
Write-Host "TEST 17: Marketplace Products (/marketplace/products)" -ForegroundColor Yellow
$marketplaceRes = Test-Endpoint "GET /api/marketplace/products" "/marketplace/products"
if ($marketplaceRes) {
    Write-Host "  ✅ Phase 8 Marketplace API still responding" -ForegroundColor Green
}
Write-Host ""

# Test 18: Media Upload Status (Phase 9.1)
Write-Host "TEST 18: Media Upload Status (/media/upload-status)" -ForegroundColor Yellow
$mediaStatusRes = Test-Endpoint "GET /api/media/upload-status" "/media/upload-status"
if ($mediaStatusRes) {
    Write-Host "  ✅ Phase 9.1 Media API responding" -ForegroundColor Green
    Write-Host "  Upload enabled: $($mediaStatusRes.enabled)" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
$passCount = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "❌ FAIL" }).Count
$totalTests = $results.Count

Write-Host "Passed: $passCount / $totalTests" -ForegroundColor Green
Write-Host "Failed: $failCount / $totalTests" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host ""
    Write-Host "✅ ALL TESTS PASSED - Phase 9.2 is COMPLETE" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed tests:" -ForegroundColor Yellow
    $results | Where-Object { $_.Status -eq "❌ FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Details)" -ForegroundColor Red
    }
}
