$baseUrl = "http://127.0.0.1:8000/api"
$loginUrl = "$baseUrl/login"
$uploadUrl = "$baseUrl/contents"
$email = "masjid_1@demo.com"
$password = "password"

# 1. Login
$loginBody = @{
    email    = $email
    password = $password
}
try {
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ErrorAction Stop
    
    if ($response -is [string]) {
        $loginResponse = $response | ConvertFrom-Json
    }
    else {
        $loginResponse = $response
    }
    
    $token = $loginResponse.token
    if (-not $token) {
        echo "Token not found in response"
        echo $loginResponse
        exit
    }
    echo "Login successful. Token length: $($token.Length)"
}
catch {
    echo "Login failed"
    echo $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        echo $reader.ReadToEnd()
    }
    exit
}

# 2. Upload
# Create a small dummy image to rule out size limits
$filePath = "test_image.png"
Set-Content -Path $filePath -Value "Exclude" -Encoding Byte # Just dummy content
# Actually, let's use the real logo if possible, but small dummy is safer for logic check
$filePath = "d:\9. 0 to ~ ITTD\2. All Source Code\signage-display\frontend\public\logo-alazhar.png"

if (-not (Test-Path $filePath)) {
    echo "File not found: $filePath"
    exit
}

$boundary = [System.Guid]::NewGuid().ToString() 
$LF = "`r`n"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileContent = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)

$bodyLines = ( 
    "--$boundary",
    "Content-Disposition: form-data; name=`"title`"",
    "",
    "Test Upload PowerShell",
    "--$boundary",
    "Content-Disposition: form-data; name=`"content_type`"",
    "",
    "image",
    "--$boundary",
    "Content-Disposition: form-data; name=`"duration`"",
    "",
    "10",
    "--$boundary",
    "Content-Disposition: form-data; name=`"priority`"",
    "",
    "0", 
    "--$boundary",
    "Content-Disposition: form-data; name=`"is_enabled`"",
    "",
    "1",
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"logo-alazhar.png`"",
    "Content-Type: image/png",
    "",
    "$fileContent",
    "--$boundary--$LF" 
) -join $LF

try {
    Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers @{Authorization = "Bearer $token" } -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    echo "Upload success"
}
catch {
    echo "Upload failed"
    echo "Status Code: $($_.Exception.Response.StatusCode)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        echo "Response Body:"
        echo $reader.ReadToEnd()
    }
}
