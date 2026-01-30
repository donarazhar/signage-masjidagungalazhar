$baseUrl = "http://127.0.0.1:8000/api"
$loginUrl = "$baseUrl/login"
$uploadUrl = "$baseUrl/contents"
$email = "masjid_1@demo.com"
$password = "password"

# 1. Login
$loginBody = @{
    email = $email
    password = $password
}
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ErrorAction Stop
    echo "Login Response Type: $($loginResponse.GetType().Name)"
    echo "Login Response:"
    $loginResponse | ConvertTo-Json -Depth 5
    
    $token = $loginResponse.token
    if (-not $token) {
        echo "Token not found in response"
        exit
    }
    echo "Login successful. Token length: $($token.Length)"
} catch {
    echo "Login failed"
    echo $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        echo $reader.ReadToEnd()
    }
    exit
}

# 2. Upload
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
    Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers @{Authorization="Bearer $token"} -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    echo "Upload success"
} catch {
    echo "Upload failed"
    echo $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        echo $reader.ReadToEnd()
    }
}
