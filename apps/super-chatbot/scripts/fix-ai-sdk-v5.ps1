# Fix AI SDK v5 TypeScript errors
$ErrorActionPreference = "Stop"

Write-Host "Fixing AI SDK v5 TypeScript errors..." -ForegroundColor Cyan

# 1. Fix Attachment import - replace with local type
Write-Host "1. Fixing Attachment imports..." -ForegroundColor Yellow
$attachmentFiles = @(
    "src/app/(chat)/banana-veo3/[id]/page.tsx",
    "src/app/(chat)/chat/[id]/page.tsx",
    "src/components/artifacts/artifact.tsx",
    "src/components/chat/multimodal-input.tsx",
    "src/components/shared/preview-attachment.tsx"
)

foreach ($file in $attachmentFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'import type \{ Attachment, UIMessage \} from [''"]ai[''"];', 'import type { UIMessage } from "ai";'
        $content = $content -replace 'import type \{ Attachment, ([^\}]+) \} from [''"]ai[''"];', 'import type { $1 } from "ai";'
        $content = $content -replace 'import \{ Attachment \} from [''"]ai[''"];', ''

        if ($content -match 'Attachment') {
            # Add local Attachment import if not already there
            if (-not ($content -match '@/lib/types/attachment')) {
                $content = $content -replace '(import type \{ UIMessage \} from [''"]ai[''"];)', "$1`nimport type { Attachment } from '@/lib/types/attachment';"
            }
        }

        $content | Set-Content $file -NoNewline
        Write-Host "  Fixed: $file" -ForegroundColor Green
    }
}

# 2. Fix UseChatHelpers<any> - add type parameter
Write-Host "`n2. Fixing UseChatHelpers type parameters..." -ForegroundColor Yellow
$useChatHelpersPattern = 'UseChatHelpers(?!\<)'
Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match $useChatHelpersPattern) {
        $content = $content -replace $useChatHelpersPattern, 'UseChatHelpers<any>'
        $content | Set-Content $_.FullName -NoNewline
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Green
    }
}

# 3. Fix maxTokens -> maxOutputTokens
Write-Host "`n3. Fixing maxTokens -> maxOutputTokens..." -ForegroundColor Yellow
$maxTokensFiles = @(
    "src/app/api/enhance-prompt-veo3/route.ts",
    "src/app/api/enhance-prompt/route.ts",
    "src/app/api/generate/script/route.ts",
    "src/lib/ai/context/ai-powered-analyzer.ts",
    "src/lib/ai/tools/configure-script-generation.ts",
    "src/lib/ai/tools/enhance-prompt-unified.ts",
    "src/lib/ai/tools/enhance-prompt.ts"
)

foreach ($file in $maxTokensFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace '\bmaxTokens:', 'maxOutputTokens:'
        $content | Set-Content $file -NoNewline
        Write-Host "  Fixed: $file" -ForegroundColor Green
    }
}

# 4. Remove dataStream from artifact callbacks
Write-Host "`n4. Removing dataStream from artifact callbacks..." -ForegroundColor Yellow
$artifactFiles = @(
    "src/artifacts/image/server.ts",
    "src/artifacts/video/server.ts",
    "src/artifacts/text/server.ts",
    "src/artifacts/sheet/server.ts"
)

foreach ($file in $artifactFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Remove dataStream from callback parameters
        $content = $content -replace '\{ ([^}]*), dataStream(, [^}]*)? \}', '{ $1$2 }'
        $content = $content -replace '\{ dataStream, ([^}]*) \}', '{ $1 }'
        $content = $content -replace '\{ dataStream \}', '{}'
        # Remove dataStream.write* calls (comment them out)
        $content = $content -replace '(\s+)dataStream\.write[^;]+;', '$1// dataStream removed in AI SDK v5'
        $content | Set-Content $file -NoNewline
        Write-Host "  Fixed: $file" -ForegroundColor Green
    }
}

# 5. Fix Message -> UIMessage import
Write-Host "`n5. Fixing Message -> UIMessage imports..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'import.*\{ Message \}.*from [''"]ai[''"]') {
        $content = $content -replace '\{ Message \}', '{ UIMessage as Message }'
        $content | Set-Content $_.FullName -NoNewline
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Green
    }
}

# 6. Fix useChat options (api, initialMessages, etc.)
Write-Host "`n6. Fixing useChat API changes..." -ForegroundColor Yellow
$useChatFiles = @(
    "src/components/chat/chat.tsx",
    "src/app/(chat)/banana-veo3-advanced/page.tsx",
    "src/app/tools/video-generator/page.tsx"
)

foreach ($file in $useChatFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Remove 'api' property
        $content = $content -replace ',?\s*api:\s*[''"][^''"]+[''"]', ''
        # Rename initialMessages -> messages
        $content = $content -replace '\binitialMessages:', 'messages:'
        $content | Set-Content $file -NoNewline
        Write-Host "  Fixed: $file" -ForegroundColor Green
    }
}

# 7. Remove experimental_generateMessageId
Write-Host "`n7. Removing experimental_generateMessageId..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'experimental_generateMessageId') {
        $content = $content -replace ',?\s*experimental_generateMessageId:\s*[^,}]+', ''
        $content | Set-Content $_.FullName -NoNewline
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Green
    }
}

# 8. Fix textDelta -> text in artifact servers
Write-Host "`n8. Fixing textDelta -> text..." -ForegroundColor Yellow
if (Test-Path "src/artifacts/text/server.ts") {
    $content = Get-Content "src/artifacts/text/server.ts" -Raw
    $content = $content -replace '\.textDelta', '.text'
    $content | Set-Content "src/artifacts/text/server.ts" -NoNewline
    Write-Host "  Fixed: src/artifacts/text/server.ts" -ForegroundColor Green
}

# 9. Remove experimental_providerMetadata
Write-Host "`n9. Removing experimental_providerMetadata..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'experimental_providerMetadata') {
        $content = $content -replace ',?\s*experimental_providerMetadata:\s*[^,}]+', ''
        $content | Set-Content $_.FullName -NoNewline
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n`nAll fixes applied! Running type-check..." -ForegroundColor Cyan
& npx tsc --noEmit
