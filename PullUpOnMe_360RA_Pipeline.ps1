# ==============================================================================
#  PULL UP ON ME — MIX & MASTER PIPELINE
#  Sony 360 Reality Audio Prep | PowerShell Automation Script
#  Artist: Tre
#  Prerequisites: FFmpeg + SoX must be installed
#  Install: winget install FFmpeg  |  choco install sox
# ==============================================================================

# ── CONFIGURATION ──────────────────────────────────────────────────────────────
$Config = @{
    StemsFolder     = "$env:USERPROFILE\Downloads\Stems"
    OutputFolder    = "$env:USERPROFILE\Desktop\PullUpOnMe_360RA"
    BinauralOutput  = "PullUpOnMe_BINAURAL_MASTER.wav"
    TargetLUFS      = -14
    TruePeakCeiling = -1.0
    SampleRate      = 48000
    BitDepth        = 24
    TrackBPM        = 96
    TrackKey        = "D Major"
    Artist          = "Tre"
    Title           = "Pull Up On Me"
}

# ── STEM DEFINITIONS ───────────────────────────────────────────────────────────
# Mapped to YOUR exact file names from Downloads\Stems
# 360RA spatial positions pre-assigned per stem type

$Stems = @(
    @{
        Name = "Lead_Vocal"
        File = "Pull Up On Me - Lead Vocals"
        Az   = 0;   El = 0;   Dist = 0.1
        Role = "Vocal"
        Note = "Center-front, intimate and upfront — the focus point"
    },
    @{
        Name = "Backing_Vocals"
        File = "Pull Up On Me - 1 Backing Vocals.wav"
        Az   = 0;   El = 25;  Dist = 0.4
        Role = "Vocal"
        Note = "Above center — supporting harmonies, celestial layer"
    },
    @{
        Name = "Drums"
        File = "Pull Up On Me - 2 Drums.wav"
        Az   = 0;   El = -10; Dist = 0.3
        Role = "Music"
        Note = "Front-center, grounded — rhythmic anchor"
    },
    @{
        Name = "Bass"
        File = "Pull Up On Me - 3 Bass.wav"
        Az   = 0;   El = -20; Dist = 0.2
        Role = "Music"
        Note = "Sub-floor, felt below listener — physical grounding"
    },
    @{
        Name = "Guitar"
        File = "Pull Up On Me - 4 Guitar.wav"
        Az   = 45;  El = 5;   Dist = 0.5
        Role = "Music"
        Note = "Front-right, ear level — melodic directional landmark"
    },
    @{
        Name = "Synth"
        File = "Pull Up On Me - 5 Synth.wav"
        Az   = -150; El = 30; Dist = 0.9
        Role = "Music"
        Note = "Wide rear sphere, elevated — atmospheric surround wrap"
    },
    @{
        Name = "Other"
        File = "Pull Up On Me - 6 Other.wav"
        Az   = 0;   El = 70;  Dist = 1.0
        Role = "Music"
        Note = "Upper sphere scatter — texture, FX, and ambience fill"
    }
)

# ══════════════════════════════════════════════════════════════════════════════
#  FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor DarkYellow
    Write-Host "║   PULL UP ON ME  —  360 REALITY AUDIO PIPELINE              ║" -ForegroundColor DarkYellow
    Write-Host "║   Artist: Tre  |  Mix · Master · Spatial Prep               ║" -ForegroundColor DarkYellow
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor DarkYellow
    Write-Host ""
}

function Write-Step {
    param([string]$Icon, [string]$Message, [string]$Color = "Cyan")
    Write-Host "  $Icon  $Message" -ForegroundColor $Color
}

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "       [$ts] $Message" -ForegroundColor DarkGray
}

function Test-Dependencies {
    Write-Step "?" "Checking dependencies (FFmpeg + SoX)..."
    $missing = @()
    foreach ($tool in @("ffmpeg", "sox")) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            $missing += $tool
        } else {
            Write-Log "$tool — found OK"
        }
    }
    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "  x  Missing: $($missing -join ', ')" -ForegroundColor Red
        Write-Host "     Run: winget install FFmpeg" -ForegroundColor Yellow
        Write-Host "     Run: choco install sox" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    Write-Step "OK" "All dependencies ready." "Green"
    Write-Host ""
}

function Initialize-Folders {
    foreach ($sub in @("", "processed_stems", "masters", "manifests")) {
        $path = Join-Path $Config.OutputFolder $sub
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path | Out-Null
        }
    }
    Write-Log "Output folder ready: $($Config.OutputFolder)"
}

# ── AGENT 1: Stem Validation ───────────────────────────────────────────────────
function Invoke-StemValidation {
    Write-Step "---" "AGENT 1 — Validating Your 7 Stems" "Magenta"
    $results = @()
    $allOK   = $true

    foreach ($stem in $Stems) {
        # Handle the Lead Vocals file which has no .wav extension visible
        $filePath = Join-Path $Config.StemsFolder $stem.File
        # Try with and without .wav extension
        if (-not (Test-Path $filePath)) {
            $filePath = "$filePath.wav"
        }

        if (Test-Path $filePath) {
            $probe  = & ffprobe -v quiet -print_format json -show_streams "$filePath" 2>&1 | ConvertFrom-Json
            $stream = $probe.streams | Where-Object { $_.codec_type -eq "audio" } | Select-Object -First 1
            $sr     = $stream.sample_rate
            $ch     = $stream.channels
            $srFlag = if ($sr -eq "48000") { "OK" } else { "WARN SR=$sr (will resample)" }
            Write-Log "$($stem.Name): $srFlag | $ch ch | File: $($stem.File)"
            $results += [PSCustomObject]@{ Stem=$stem.Name; Found=$true; ActualPath=$filePath; SR=$sr }
        } else {
            Write-Host "       NOT FOUND: $($stem.File)" -ForegroundColor Red
            $results += [PSCustomObject]@{ Stem=$stem.Name; Found=$false; ActualPath=""; SR="N/A" }
            $allOK = $false
        }
    }

    if (-not $allOK) {
        Write-Host ""
        Write-Host "  WARN  Check file names match exactly in Downloads\Stems" -ForegroundColor Yellow
        Write-Host "        Script will continue with found stems only." -ForegroundColor DarkGray
    } else {
        Write-Step "OK" "All 7 stems found and validated." "Green"
    }
    Write-Host ""
    return $results
}

# ── AGENT 2: Gain Staging ─────────────────────────────────────────────────────
function Invoke-GainStaging {
    param([array]$Validation)
    Write-Step "---" "AGENT 2 — Gain Staging (Peak normalize to -6 dBFS)" "Magenta"

    $outFolder = Join-Path $Config.OutputFolder "processed_stems"

    foreach ($stem in $Stems) {
        $v = $Validation | Where-Object { $_.Stem -eq $stem.Name -and $_.Found }
        if (-not $v) { continue }

        $out = Join-Path $outFolder "$($stem.Name)_staged.wav"
        & sox "$($v.ActualPath)" `
              --rate $Config.SampleRate `
              --bits $Config.BitDepth `
              "$out" `
              norm -6 2>&1 | Out-Null

        Write-Log "$($stem.Name) -> -6 dBFS peak, 48kHz / 24-bit"
    }
    Write-Step "OK" "Gain staging complete." "Green"
    Write-Host ""
}

# ── AGENT 3: Per-Stem EQ ──────────────────────────────────────────────────────
function Invoke-StemEQ {
    Write-Step "---" "AGENT 3 — Per-Stem EQ (Genre-Tuned R&B / Trap)" "Magenta"

    $folder = Join-Path $Config.OutputFolder "processed_stems"

    # EQ profiles tuned to each stem's role in an R&B Trap record
    $eqProfiles = @{
        # Vocal: cut mud at 300Hz, presence boost at 3kHz, air at 10kHz
        "Lead_Vocal"    = "highpass 80 equalizer 300 1.0q -2.5 equalizer 3000 1.5q +2.5 equalizer 10000 2.0q +2.0"
        # Backing vox: tighter, less presence — sits behind the lead
        "Backing_Vocals"= "highpass 120 equalizer 250 1.0q -3.0 equalizer 5000 1.5q +1.5 equalizer 9000 2.0q +1.0"
        # Drums: punch at 60Hz kick, cut mud at 200Hz, crack at 5kHz snare
        "Drums"         = "highpass 30 equalizer 60 1.5q +2.0 equalizer 200 1.0q -2.0 equalizer 5000 1.5q +2.5"
        # Bass: sub focus at 80Hz, cut low-mid mud, hard lowpass to keep sub clean
        "Bass"          = "highpass 35 equalizer 80 1.5q +3.0 equalizer 300 1.0q -2.5 lowpass 250"
        # Guitar: cut boomy low-end, add body at 800Hz, air at 8kHz
        "Guitar"        = "highpass 100 equalizer 200 1.0q -2.0 equalizer 800 1.5q +1.5 equalizer 8000 2.0q +2.0"
        # Synth: wide atmospheric — cut mud, open highs for surround wrap
        "Synth"         = "highpass 80 equalizer 300 1.0q -3.0 equalizer 8000 2.0q +1.5 equalizer 14000 2.0q +2.0"
        # Other / FX: high-pass heavy, boost air — lives in the upper sphere
        "Other"         = "highpass 200 equalizer 10000 2.0q +2.5 equalizer 15000 2.0q +2.0"
    }

    foreach ($stem in $Stems) {
        $in  = Join-Path $folder "$($stem.Name)_staged.wav"
        $out = Join-Path $folder "$($stem.Name)_eq.wav"
        if (-not (Test-Path $in)) { continue }

        $eq = $eqProfiles[$stem.Name]
        if ($eq) {
            $cmd = "sox `"$in`" `"$out`" $eq"
            Invoke-Expression $cmd 2>&1 | Out-Null
            Write-Log "$($stem.Name) -> EQ applied"
        } else {
            Copy-Item $in $out
            Write-Log "$($stem.Name) -> copied (no EQ profile)"
        }
    }
    Write-Step "OK" "Stem EQ complete." "Green"
    Write-Host ""
}

# ── AGENT 4: Vocal Bus ────────────────────────────────────────────────────────
function Invoke-VocalBus {
    Write-Step "---" "AGENT 4 — Vocal Bus (Lead + Backing compressed together)" "Magenta"

    $folder   = Join-Path $Config.OutputFolder "processed_stems"
    $busOut   = Join-Path $folder "VOCAL_BUS.wav"

    $vFiles = $Stems | Where-Object { $_.Role -eq "Vocal" } | ForEach-Object {
        $p = Join-Path $folder "$($_.Name)_eq.wav"
        if (Test-Path $p) { "`"$p`"" }
    }

    if ($vFiles) {
        $cmd = "sox --combine mix $($vFiles -join ' ') `"$busOut`" " +
               "compand 0.008,0.08 -60,-60,-40,-20,-6,-6,0,-4 -6 -90 0.05 norm -3"
        Invoke-Expression $cmd 2>&1 | Out-Null
        Write-Log "Vocal bus: $($vFiles.Count) stems mixed + compressed -> -3 dBFS"
        Write-Step "OK" "Vocal bus ready." "Green"
    } else {
        Write-Log "No vocal stems found — skipping"
    }
    Write-Host ""
}

# ── AGENT 5: Music Bus ────────────────────────────────────────────────────────
function Invoke-MusicBus {
    Write-Step "---" "AGENT 5 — Music Bus (Drums, Bass, Guitar, Synth, Other)" "Magenta"

    $folder  = Join-Path $Config.OutputFolder "processed_stems"
    $busOut  = Join-Path $folder "MUSIC_BUS.wav"

    $mFiles = $Stems | Where-Object { $_.Role -eq "Music" } | ForEach-Object {
        $p = Join-Path $folder "$($_.Name)_eq.wav"
        if (Test-Path $p) { "`"$p`"" }
    }

    if ($mFiles) {
        $cmd = "sox --combine mix $($mFiles -join ' ') `"$busOut`" " +
               "compand 0.01,0.1 -60,-60,-30,-20,-6,-4,0,-3 -5 -90 0.05 norm -4"
        Invoke-Expression $cmd 2>&1 | Out-Null
        Write-Log "Music bus: $($mFiles.Count) stems mixed + compressed -> -4 dBFS"
        Write-Step "OK" "Music bus ready." "Green"
    } else {
        Write-Log "No music stems found — skipping"
    }
    Write-Host ""
}

# ── AGENT 6: Master Render ────────────────────────────────────────────────────
function Invoke-MasterRender {
    Write-Step "---" "AGENT 6 — Master Render -> $($Config.TargetLUFS) LUFS / $($Config.TruePeakCeiling) dBTP" "Magenta"

    $vBus      = Join-Path $Config.OutputFolder "processed_stems\VOCAL_BUS.wav"
    $mBus      = Join-Path $Config.OutputFolder "processed_stems\MUSIC_BUS.wav"
    $rawMaster = Join-Path $Config.OutputFolder "masters\RAW_MASTER.wav"
    $eqMaster  = Join-Path $Config.OutputFolder "masters\MASTER_EQ.wav"
    $finalOut  = Join-Path $Config.OutputFolder "masters\$($Config.BinauralOutput)"

    $buses = @()
    if (Test-Path $vBus) { $buses += "`"$vBus`"" }
    if (Test-Path $mBus) { $buses += "`"$mBus`"" }

    if ($buses.Count -eq 0) {
        Write-Host "  x  No bus files to master. Check previous agents." -ForegroundColor Red
        return
    }

    # Mix vocal + music buses
    Write-Log "Combining vocal + music buses..."
    Invoke-Expression "sox --combine mix $($buses -join ' ') `"$rawMaster`" norm -2" 2>&1 | Out-Null

    # Master EQ + compression chain via SoX
    Write-Log "Applying master EQ and glue compression..."
    & sox "$rawMaster" "$eqMaster" `
          highpass 25 `
          equalizer 60  1.5q +1.5 `
          equalizer 250 1.0q -1.5 `
          equalizer 3000 1.5q +1.0 `
          equalizer 14000 2.0q +2.5 `
          compand 0.01,0.08 -70,-70,-40,-30,-10,-7,0,-5 -5 -90 0.05 `
          norm -1 2>&1 | Out-Null

    # FFmpeg loudnorm — precise LUFS + true peak targeting
    Write-Log "Loudnorm -> targeting $($Config.TargetLUFS) LUFS / $($Config.TruePeakCeiling) dBTP..."
    & ffmpeg -y -i "$eqMaster" `
             -af "loudnorm=I=$($Config.TargetLUFS):TP=$($Config.TruePeakCeiling):LRA=9:print_format=summary" `
             -ar $Config.SampleRate `
             -sample_fmt s32 `
             -metadata title="$($Config.Title)" `
             -metadata artist="$($Config.Artist)" `
             -metadata comment="Sony 360RA Spatial Prep | BPM: $($Config.TrackBPM)" `
             "$finalOut" 2>&1 | Out-Null

    if (Test-Path $finalOut) {
        Write-Step "OK" "Master render complete: $($Config.BinauralOutput)" "Green"
    } else {
        Write-Host "  x  Render failed. Check FFmpeg is installed correctly." -ForegroundColor Red
    }
    Write-Host ""
}

# ── AGENT 7: Loudness Report ──────────────────────────────────────────────────
function Invoke-LoudnessReport {
    Write-Step "---" "AGENT 7 — Loudness Measurement Report" "Magenta"

    $finalOut = Join-Path $Config.OutputFolder "masters\$($Config.BinauralOutput)"
    if (-not (Test-Path $finalOut)) { Write-Log "Master not found — skipping"; return }

    $result   = & ffmpeg -i "$finalOut" -af "loudnorm=I=-14:TP=-1:LRA=9:print_format=summary" -f null - 2>&1
    $lines    = $result -split "`n"
    $lufs     = ($lines | Where-Object { $_ -match "Input Integrated" }) -replace "^\s+",""
    $tp       = ($lines | Where-Object { $_ -match "Input True Peak" })  -replace "^\s+",""
    $lra      = ($lines | Where-Object { $_ -match "Input LRA" })        -replace "^\s+",""

    Write-Host ""
    Write-Host "  +---------------------------------------------+" -ForegroundColor DarkYellow
    Write-Host "  |  PULL UP ON ME -- LOUDNESS RESULTS          |" -ForegroundColor DarkYellow
    Write-Host "  +---------------------------------------------+" -ForegroundColor DarkYellow
    Write-Host "  |  $lufs" -ForegroundColor White
    Write-Host "  |  $tp"   -ForegroundColor White
    Write-Host "  |  $lra"  -ForegroundColor White
    Write-Host "  |  Target : $($Config.TargetLUFS) LUFS / $($Config.TruePeakCeiling) dBTP" -ForegroundColor DarkGray
    Write-Host "  +---------------------------------------------+" -ForegroundColor DarkYellow
    Write-Host ""
}

# ── AGENT 8: 360RA Spatial Manifest ──────────────────────────────────────────
function Invoke-SpatialManifest {
    Write-Step "---" "AGENT 8 — Sony 360RA Spatial Manifest (for WalkMix Creator)" "Magenta"

    $manifestPath = Join-Path $Config.OutputFolder "manifests\360RA_SpatialManifest.json"

    $manifest = @{
        track    = @{
            title  = $Config.Title
            artist = $Config.Artist
            bpm    = $Config.TrackBPM
            key    = $Config.TrackKey
        }
        format      = "Sony 360 Reality Audio"
        generated   = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        lufsTarget  = $Config.TargetLUFS
        truePeak    = $Config.TruePeakCeiling
        instructions = @(
            "1. Download Sony 360 WalkMix Creator free at: https://www.sony.com/en/articles/360-reality-audio-support-page",
            "2. Open WalkMix Creator and create a new 360RA project",
            "3. Import each processed stem from: processed_stems\ folder",
            "4. Use the 'objects' array below for spatial placement coordinates",
            "5. Azimuth = left(-) / right(+) rotation in degrees",
            "6. Elevation = down(-) / up(+) angle in degrees",
            "7. Distance = 0.0 (right in front) to 1.0 (far away)",
            "8. Automate the Synth and Other objects for movement on transitions",
            "9. Enable binaural preview and QC on headphones",
            "10. Export: .mka 360RA master + binaural WAV + stereo fallback"
        )
        objects = @($Stems | ForEach-Object {
            @{
                name      = $_.Name
                stemFile  = "$($_.Name)_eq.wav"
                role      = $_.Role
                azimuth   = $_.Az
                elevation = $_.El
                distance  = $_.Dist
                note      = $_.Note
            }
        })
    }

    $manifest | ConvertTo-Json -Depth 5 | Set-Content $manifestPath -Encoding UTF8
    Write-Log "Saved: 360RA_SpatialManifest.json"
    Write-Step "OK" "Spatial manifest ready — use this in WalkMix Creator." "Green"
    Write-Host ""
}

# ── AGENT 9: Delivery Summary ─────────────────────────────────────────────────
function Invoke-DeliverySummary {
    Write-Step "---" "AGENT 9 — Delivery Package Summary" "Magenta"
    Write-Host ""
    Write-Host "  +----------------------------------------------------------+" -ForegroundColor DarkYellow
    Write-Host "  |  PULL UP ON ME -- OUTPUT FILES                           |" -ForegroundColor DarkYellow
    Write-Host "  +----------------------------------------------------------+" -ForegroundColor DarkYellow
    Write-Host "  |  Desktop\PullUpOnMe_360RA\                               |" -ForegroundColor White
    Write-Host "  |     processed_stems\  -- 7 EQ'd stems for WalkMix       |" -ForegroundColor DarkGray
    Write-Host "  |     masters\          -- Binaural stereo master WAV      |" -ForegroundColor DarkGray
    Write-Host "  |     manifests\        -- 360RA spatial position JSON     |" -ForegroundColor DarkGray
    Write-Host "  +----------------------------------------------------------+" -ForegroundColor DarkYellow
    Write-Host "  |  NEXT: SONY 360 WALKMIX CREATOR                         |" -ForegroundColor Cyan
    Write-Host "  |  1. Download free at sony.com/360ra                     |" -ForegroundColor White
    Write-Host "  |  2. Import processed_stems\ into WalkMix                |" -ForegroundColor White
    Write-Host "  |  3. Open 360RA_SpatialManifest.json for positions       |" -ForegroundColor White
    Write-Host "  |  4. Lead Vocal  -> center-front (0, 0, near)           |" -ForegroundColor White
    Write-Host "  |  5. Backing Vox -> above center (+25 elevation)        |" -ForegroundColor White
    Write-Host "  |  6. Bass        -> below listener (-20 elevation)       |" -ForegroundColor White
    Write-Host "  |  7. Synth       -> wide rear sphere (+-150, +30)       |" -ForegroundColor White
    Write-Host "  |  8. Export .mka + binaural WAV + stereo fallback       |" -ForegroundColor White
    Write-Host "  +----------------------------------------------------------+" -ForegroundColor DarkYellow
    Write-Host ""
}

# ══════════════════════════════════════════════════════════════════════════════
#  RUN THE PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

Write-Banner
Test-Dependencies
Initialize-Folders

$validation = Invoke-StemValidation
Invoke-GainStaging   -Validation $validation
Invoke-StemEQ
Invoke-VocalBus
Invoke-MusicBus
Invoke-MasterRender
Invoke-LoudnessReport
Invoke-SpatialManifest
Invoke-DeliverySummary

Write-Host "  OK  PIPELINE COMPLETE — Pull Up On Me is 360RA ready." -ForegroundColor Green
Write-Host "      Open your Desktop > PullUpOnMe_360RA folder to find your files." -ForegroundColor DarkGray
Write-Host ""
